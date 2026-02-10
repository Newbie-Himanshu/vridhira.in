import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const CreateRazorpayOrderSchema = z.object({
    orderId: z.string().uuid()
});

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { orderId } = CreateRazorpayOrderSchema.parse(body);

        // 1. Fetch Existing Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('user_id', user.id)
            .single();

        if (orderError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.status !== 'Pending' && order.status !== 'pending') { // Check case sensitivity
            return NextResponse.json({ error: 'Order is not in pending state' }, { status: 400 });
        }

        // 2. Create Razorpay Order
        const payment_capture = 1;
        const currency = 'INR';
        const options = {
            amount: Math.round(order.total_amount * 100), // Amount in paise
            currency,
            receipt: order.id,
            payment_capture,
            notes: {
                order_id: order.id,
                user_id: user.id
            }
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // 3. Log the payment attempt
        // Check if log already exists for this order? Maybe user retried.
        // We'll insert a new log entry for this attempt or update if managing single log per order.
        // Typically one order can have multiple payment attempts (failed, then success).
        // For simplicity, we create a new log or update invalid ones. 
        // Let's Insert.

        await supabase.from('payment_logs').insert({
            order_id: order.id,
            razorpay_order_id: razorpayOrder.id,
            amount: order.total_amount,
            currency: 'INR',
            status: 'created',
            payment_method: 'razorpay',
            notes: options.notes
        });

        return NextResponse.json({
            success: true,
            data: {
                id: order.id,
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                key: process.env.RAZORPAY_KEY_ID,
                name: 'Vridhira',
                description: 'Payment for Order #' + order.id.slice(0, 8)
            }
        });

    } catch (error: any) {
        console.error('Create Razorpay Order Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
