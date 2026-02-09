import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { CreateOrderSchema } from '@/lib/validators';
import { z } from 'zod';

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
        // We do NOT trust the prices sent by the client. We fetch fresh prices from DB.

        // Extract Product IDs
        const productIds = validatedData.items.map(item => item.productId);

        // Fetch Products
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('id, title, price, sale_price, stock, image_url')
            .in('id', productIds);

        if (productsError || !products) {
            console.error('[POST /api/orders] Error fetching products:', productsError);
            return NextResponse.json({ error: 'Failed to verify product prices' }, { status: 500 });
        }

        // Create a Map for O(1) lookup
        const productMap = new Map(products.map(p => [p.id, p]));

        // Recalculate Total & Build Verified Items List
        let calculatedTotal = 0;
        const verifiedItems = [];

        for (const item of validatedData.items) {
            const product = productMap.get(item.productId);

            if (!product) {
                return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
            }

            // Check Stock (Simple check, concurrency is handled by DB constraints or future improvements)
            if (product.stock < item.quantity) {
                return NextResponse.json({
                    error: `Insufficient stock for ${product.title}. Available: ${product.stock}, Requested: ${item.quantity}`
                }, { status: 400 });
            }

            // Determine price (Sale price takes precedence)
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
        }

        // Calculate Platform Fee (e.g., 10% or from settings)
        // For now, hardcoded 10% as per schema default logic or previous settings
        // Better to fetch from platform_settings, but let's keep it simple and robust for now.
        const platformFeePercentage = 0.10; // 10%
        const platformFee = calculatedTotal * platformFeePercentage;

        // 4. Create Order in Supabase
        const { data: order, error: insertError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                items: verifiedItems as any, // Cast to any for JSONB compatibility
                total_amount: calculatedTotal,
                status: 'pending',
                payment_status: 'pending', // Will be updated by webhook if Razorpay
                payment_method: validatedData.paymentMethod,
                shipping_address: validatedData.shippingAddress as any,
                platform_fee: platformFee
            })
            .select()
            .single();

        if (insertError) {
            console.error('[POST /api/orders] DB Insert Error:', insertError);
            return NextResponse.json({ error: insertError.message }, { status: 500 });
        }

        // 5. Clear Cart (Optional but recommended)
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

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data: orders });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
