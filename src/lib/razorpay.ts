import Razorpay from 'razorpay';

// Singleton logic to prevent multiple instances in dev
const globalForRazorpay = global as unknown as { razorpay: Razorpay };

export const razorpay =
    globalForRazorpay.razorpay ||
    new Razorpay({
        // These are guaranteed to exist by your .env.local check, but good to fallback or error
        key_id: process.env.RAZORPAY_KEY_ID || '',
        key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });

if (process.env.NODE_ENV !== 'production') globalForRazorpay.razorpay = razorpay;

/**
 * Validates the Razorpay Webhook Signature
 * @param body - Raw body of the request (string)
 * @param signature - X-Razorpay-Signature header
 * @param secret - Webhook secret from .env
 */
export const validateWebhookSignature = (
    body: string,
    signature: string,
    secret: string
): boolean => {
    return Razorpay.validateWebhookSignature(body, signature, secret);
};
