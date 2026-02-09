import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { CreateOrderSchema } from '@/lib/validators';
import { z } from 'zod';

// Helper: Check if user is admin or owner
async function checkAdminRole(supabase: Awaited<ReturnType<typeof createClient>>) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { authorized: false, status: 401, error: 'Unauthorized' };
    }

    const { data: customer } = await supabase
        .from('customers')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!customer || !['store admin', 'owner'].includes(customer.role)) {
        return { authorized: false, status: 403, error: 'Forbidden - Admin access required' };
    }

    return { authorized: true, user, customer };
}

// Helper: Get platform fee from settings
async function getPlatformFeePercentage(supabase: Awaited<ReturnType<typeof createClient>>): Promise<number> {
    try {
        const { data: settings } = await supabase
            .from('platform_settings')
            .select('platform_fee_percentage')
            .eq('id', 'global')
            .single();

        return settings?.platform_fee_percentage ?? 0.10; // Default 10%
    } catch (error) {
        console.error('[getPlatformFeePercentage] Error:', error);
        return 0.10; // Fallback to 10%
    }
}

// POST: Create new order (authenticated users)
export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Authenticate User
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse & Validate Input
        const body = await request.json();
        const validatedData = CreateOrderSchema.parse(body);

        // 3. Server-Side Price Verification (CRITICAL SECURITY)
        const productIds = validatedData.items.map(item => item.productId);

        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, title, price, sale_price, stock, image_url')
            .in('id', productIds);

        if (productsError || !products) {
            console.error('[POST /api/orders] Error fetching products:', productsError);
            return NextResponse.json({ error: 'Failed to verify product prices' }, { status: 500 });
        }

        const productMap = new Map(products.map(p => [p.id, p]));

        // Recalculate Total & Build Verified Items List
        let calculatedTotal = 0;
        const verifiedItems = [];
        const stockUpdates: { productId: string; newStock: number }[] = [];

        for (const item of validatedData.items) {
            const product = productMap.get(item.productId);

            if (!product) {
                return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
            }

            // Check Stock
            if (product.stock < item.quantity) {
                return NextResponse.json({
                    error: `Insufficient stock for ${product.title}. Available: ${product.stock}, Requested: ${item.quantity}`
                }, { status: 400 });
            }

            const unitPrice = product.sale_price || product.price;
            const lineTotal = unitPrice * item.quantity;
            calculatedTotal += lineTotal;

            verifiedItems.push({
                productId: product.id,
                title: product.title,
                price: unitPrice,
                quantity: item.quantity,
                total: lineTotal,
                image_url: product.image_url
            });

            // Prepare stock update
            stockUpdates.push({
                productId: product.id,
                newStock: product.stock - item.quantity
            });
        }

        // 4. Get Dynamic Platform Fee from Settings
        const platformFeePercentage = await getPlatformFeePercentage(supabase);
        const platformFee = calculatedTotal * platformFeePercentage;

        // 5. Create Order
        const { data: order, error: insertError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                items: verifiedItems as any,
                total_amount: calculatedTotal,
                status: 'Pending',
                platform_fee: platformFee
            })
            .select()
            .single();

        if (insertError) {
            console.error('[POST /api/orders] DB Insert Error:', insertError);
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        // 6. Auto-Deduct Stock (ROBUST: After order is created)
        for (const update of stockUpdates) {
            const { error: stockError } = await supabase
                .from('products')
                .update({ stock: update.newStock })
                .eq('id', update.productId);

            if (stockError) {
                console.error(`[POST /api/orders] Stock update failed for ${update.productId}:`, stockError);
                // Order already created, log but don't fail
            }
        }

        // 7. Clear Cart
        await supabase.from('carts').delete().eq('user_id', user.id);

        return NextResponse.json({ data: order }, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        console.error('[POST /api/orders] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// GET: Fetch orders (admin sees all, users see their own)
export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if admin
        const { data: customer } = await supabase
            .from('customers')
            .select('role')
            .eq('id', user.id)
            .single();

        const isAdmin = customer && ['store admin', 'owner'].includes(customer.role);

        let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

        // Regular users only see their own orders
        if (!isAdmin) {
            query = query.eq('user_id', user.id);
        }

        const { data: orders, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: orders });
    } catch (error) {
        console.error('[GET /api/orders] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Schema for order status update
const UpdateOrderSchema = z.object({
    id: z.string().uuid(),
    status: z.enum(['Pending', 'Shipped', 'Delivered', 'Cancelled']).optional(),
    tracking_number: z.string().optional(),
    notes: z.string().optional(),
});

// PATCH: Update order status (admin/owner only)
export async function PATCH(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Check Admin Role
        const authCheck = await checkAdminRole(supabase);
        if (!authCheck.authorized) {
            return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
        }

        // 2. Parse & Validate Body
        const body = await request.json();
        const validatedData = UpdateOrderSchema.parse(body);

        const { id, ...updates } = validatedData;

        // 3. Update Order
        const { data, error } = await supabase
            .from('orders')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[PATCH /api/orders] DB Error:', error);
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        // 4. If order is cancelled, restore stock
        if (validatedData.status === 'Cancelled' && data) {
            const items = data.items as Array<{ productId: string; quantity: number }>;

            for (const item of items) {
                // Get current stock
                const { data: product } = await supabase
                    .from('products')
                    .select('stock')
                    .eq('id', item.productId)
                    .single();

                if (product) {
                    await supabase
                        .from('products')
                        .update({ stock: product.stock + item.quantity })
                        .eq('id', item.productId);
                }
            }
        }

        return NextResponse.json({ data });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        console.error('[PATCH /api/orders] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
