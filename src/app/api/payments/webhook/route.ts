import { NextRequest, NextResponse } from 'next/server';
import { validateWebhookSignature } from '@/lib/razorpay';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const signature = req.headers.get('x-razorpay-signature');
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // 1. Security Check
        if (!signature || !secret || !validateWebhookSignature(rawBody, signature, secret)) {
            console.error('Razorpay Webhook: Invalid Signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const body = JSON.parse(rawBody);
        const event = body.event;
        const payload = body.payload;
        const supabase = await createClient();

        console.log(`Razorpay Webhook Received: ${event}`);

        // 2. Handle Events
        if (event === 'payment.captured') {
            const payment = payload.payment.entity;
            const razorpayOrderId = payment.order_id;
            const razorpayPaymentId = payment.id;

            // Notes contain our metadata
            const orderId = payment.notes?.order_id;

            // Update Payment Logs
            // We upsert because verification API might have run first OR webhook might run first
            const { data: log, error } = await supabase
                .from('payment_logs')
                .upsert({
                    razorpay_order_id: razorpayOrderId, // Unique constraint usually
                    order_id: orderId,
                    razorpay_payment_id: razorpayPaymentId,
                    amount: payment.amount / 100,
                    currency: payment.currency,
                    status: 'captured',
                    payment_method: payment.method,
                    email: payment.email,
                    contact: payment.contact,
                    webhook_received: true,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'razorpay_order_id' }) // Ensure this column is unique or primary key
                .select()
                .single();

            if (log) {
                // Update Order Status
                await supabase
                    .from('orders')
                    .update({
                        status: 'processing', // Confirmed paid
                        payment_log_id: log.id
                    })
                    .eq('id', orderId);
            }
        }
        else if (event === 'payment.failed') {
            const payment = payload.payment.entity;
            const razorpayOrderId = payment.order_id;
            const orderId = payment.notes?.order_id;

            await supabase
                .from('payment_logs')
                .update({
                    status: 'failed',
                    error_code: payment.error_code,
                    error_description: payment.error_description,
                    webhook_received: true
                })
                .eq('razorpay_order_id', razorpayOrderId);

            // Optionally fail the order or leave it pending
            await supabase
                .from('orders')
                .update({ status: 'payment_failed' })
                .eq('id', orderId);
        }

        return NextResponse.json({ status: 'ok' });

    } catch (error: any) {
        console.error('Razorpay Webhook Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
