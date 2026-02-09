import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/permissions';
import { logStockAdjust } from '@/lib/activity-logger';
import { z } from 'zod';

interface RouteParams {
    params: Promise<{ id: string }>;
}

const StockSchema = z.object({
    adjustment: z.number().int(), // Can be positive or negative
    reason: z.string().optional(),
});

/**
 * PATCH /api/products/[id]/stock - Adjust product stock (Admin/Owner)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        await requireAdmin();
        const { id } = await params;

        const supabase = await createClient();
        const body = await request.json();

        const { adjustment, reason } = StockSchema.parse(body);

        // Get current product
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('id, title, stock')
            .eq('id', id)
            .single();

        if (fetchError || !product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const oldStock = product.stock || 0;
        const newStock = Math.max(0, oldStock + adjustment); // Never go below 0

        // Update stock
        const { error: updateError } = await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', id);

        if (updateError) {
            console.error('[PATCH /api/products/[id]/stock] Update error:', updateError);
            return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
        }

        // Log the action
        await logStockAdjust(id, product.title, oldStock, newStock, reason);

        return NextResponse.json({
            success: true,
            oldStock,
            newStock,
            adjustment,
            message: `Stock updated: ${oldStock} → ${newStock}`,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
        }
        if (error instanceof Error && error.message.includes('required')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('[PATCH /api/products/[id]/stock] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
