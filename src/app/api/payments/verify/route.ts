import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId // Our internal order ID
        } = await req.json();

        // 1. Verify Signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            // Log failure
            await supabase.from('payment_logs').insert({
                order_id: orderId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature, // Optional: verify security implications of storing invalid sig
                status: 'failed_verification',
                error_description: 'Signature verification failed'
            });

            return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
        }

        // 2. Update Database (Success)
        // Update payment_logs
        const { data: log, error: logError } = await supabase
            .from('payment_logs')
            .update({
                razorpay_payment_id,
                razorpay_signature,
                status: 'captured', // Assuming auto-capture
                webhook_received: false // Will be set to true by webhook later
            })
            .eq('razorpay_order_id', razorpay_order_id)
            .select()
            .single();

        // Use insert if update failed (e.g. if logs created via webhook first or concurrency)
        // But typically 'create-order' makes the log first.
        if (!log && logError) {
            // Fallback insert
            await supabase.from('payment_logs').insert({
                order_id: orderId,
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                status: 'captured',
                payment_method: 'razorpay'
            });
        }

        // Update orders table
        await supabase
            .from('orders')
            .update({
                status: 'processing', // or 'paid'
                payment_log_id: log?.id // Link if possible
            })
            .eq('id', orderId);

        return NextResponse.json({
            success: true,
            message: 'Payment verified successfully'
        });

    } catch (error: any) {
        console.error('Verify Payment Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
