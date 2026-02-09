import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireOwner } from '@/lib/permissions';
import { logProductBlock } from '@/lib/activity-logger';
import { z } from 'zod';

interface RouteParams {
    params: Promise<{ id: string }>;
}

const BlockSchema = z.object({
    blocked: z.boolean(),
    reason: z.string().optional(),
});

/**
 * PATCH /api/products/[id]/block - Toggle product purchase ability (Owner only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        await requireOwner();
        const { id } = await params;

        const supabase = await createClient();
        const body = await request.json();

        const { blocked, reason } = BlockSchema.parse(body);

        // Get current product
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('id, title, is_blocked')
            .eq('id', id)
            .single();

        if (fetchError || !product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Update block status
        const { error: updateError } = await supabase
            .from('products')
            .update({
                is_blocked: blocked,
                visibility_note: blocked ? reason || 'Blocked from purchase' : null,
            })
            .eq('id', id);

        if (updateError) {
            console.error('[PATCH /api/products/[id]/block] Update error:', updateError);
            return NextResponse.json({ error: 'Failed to update block status' }, { status: 500 });
        }

        // Log the action
        await logProductBlock(id, product.title, blocked, reason);

        return NextResponse.json({
            success: true,
            message: blocked
                ? `${product.title} is now blocked from purchase`
                : `${product.title} can now be purchased`,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
        }
        if (error instanceof Error && error.message.includes('required')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('[PATCH /api/products/[id]/block] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
