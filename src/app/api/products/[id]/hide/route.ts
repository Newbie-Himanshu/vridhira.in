import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireOwner } from '@/lib/permissions';
import { logProductHide } from '@/lib/activity-logger';
import { z } from 'zod';

interface RouteParams {
    params: Promise<{ id: string }>;
}

const HideSchema = z.object({
    hidden: z.boolean(),
    reason: z.string().optional(),
});

/**
 * PATCH /api/products/[id]/hide - Toggle product visibility (Owner only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const owner = await requireOwner();
        const { id } = await params;

        const supabase = await createClient();
        const body = await request.json();

        const { hidden, reason } = HideSchema.parse(body);

        // Get current product
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('id, title, is_hidden')
            .eq('id', id)
            .single();

        if (fetchError || !product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Update visibility
        const { error: updateError } = await supabase
            .from('products')
            .update({
                is_hidden: hidden,
                visibility_note: hidden ? reason || null : null,
                hidden_by: hidden ? owner.id : null,
                hidden_at: hidden ? new Date().toISOString() : null,
            })
            .eq('id', id);

        if (updateError) {
            console.error('[PATCH /api/products/[id]/hide] Update error:', updateError);
            return NextResponse.json({ error: 'Failed to update visibility' }, { status: 500 });
        }

        // Log the action
        await logProductHide(id, product.title, hidden, reason);

        return NextResponse.json({
            success: true,
            message: hidden
                ? `${product.title} is now hidden from the shop`
                : `${product.title} is now visible in the shop`,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
        }
        if (error instanceof Error && error.message.includes('required')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('[PATCH /api/products/[id]/hide] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
