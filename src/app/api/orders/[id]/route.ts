import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Helper: Check if user is admin or owner
async function checkAdminRole(supabase: Awaited<ReturnType<typeof createClient>>) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { authorized: false, status: 401, error: 'Unauthorized', user: null };
    }

    const { data: customer } = await supabase
        .from('customers')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!customer || !['store admin', 'owner'].includes(customer.role)) {
        return { authorized: false, status: 403, error: 'Forbidden - Admin access required', user };
    }

    return { authorized: true, user, customer };
}

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET: Fetch single order by ID
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
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

        // Fetch order
        const { data: order, error } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Regular users can only see their own orders
        if (!isAdmin && order.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({ data: order });
    } catch (error) {
        console.error('[GET /api/orders/[id]] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Schema for order update
const UpdateOrderSchema = z.object({
    status: z.enum(['Pending', 'Shipped', 'Delivered', 'Cancelled']).optional(),
    tracking_number: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
});

// PATCH: Update order by ID (admin/owner only)
export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // 1. Check Admin Role
        const authCheck = await checkAdminRole(supabase);
        if (!authCheck.authorized) {
            return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
        }

        // 2. Parse & Validate Body
        const body = await request.json();
        const validatedData = UpdateOrderSchema.parse(body);

        // 3. Get current order (for stock restoration if cancelling)
        const { data: currentOrder } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (!currentOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // 4. Update Order
        const { data, error } = await supabase
            .from('orders')
            .update(validatedData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[PATCH /api/orders/[id]] DB Error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        // 5. If order is cancelled AND was not already cancelled, restore stock
        if (validatedData.status === 'Cancelled' && currentOrder.status !== 'Cancelled') {
            const items = currentOrder.items as Array<{ productId: string; quantity: number }>;

            for (const item of items) {
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
        console.error('[PATCH /api/orders/[id]] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE: Cancel/remove order (admin/owner only)
export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        // 1. Check Admin Role
        const authCheck = await checkAdminRole(supabase);
        if (!authCheck.authorized) {
            return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
        }

        // 2. Get order for stock restoration
        const { data: order } = await supabase
            .from('orders')
            .select('*')
            .eq('id', id)
            .single();

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // 3. Restore stock if order wasn't already cancelled
        if (order.status !== 'Cancelled') {
            const items = order.items as Array<{ productId: string; quantity: number }>;

            for (const item of items) {
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

        // 4. Delete order
        const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('[DELETE /api/orders/[id]] DB Error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ message: 'Order deleted successfully' });

    } catch (error) {
        console.error('[DELETE /api/orders/[id]] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
