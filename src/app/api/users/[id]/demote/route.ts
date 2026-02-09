import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireOwner } from '@/lib/permissions';
import { logRoleChange } from '@/lib/activity-logger';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * PATCH /api/users/[id]/demote - Demote store admin to user (Owner only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        await requireOwner();
        const { id } = await params;

        const supabase = await createClient();

        // Get target user
        const { data: targetUser, error: fetchError } = await supabase
            .from('customers')
            .select('id, email, role')
            .eq('id', id)
            .single();

        if (fetchError || !targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Cannot demote owner
        if (targetUser.role === 'owner') {
            return NextResponse.json({ error: 'Cannot demote owner' }, { status: 400 });
        }

        // Already a regular user
        if (targetUser.role === 'user') {
            return NextResponse.json({ error: 'User is not an admin' }, { status: 400 });
        }

        // Demote to user
        const { error: updateError } = await supabase
            .from('customers')
            .update({
                role: 'user',
                promoted_by: null,
                promoted_at: null,
            })
            .eq('id', id);

        if (updateError) {
            console.error('[PATCH /api/users/[id]/demote] Update error:', updateError);
            return NextResponse.json({ error: 'Failed to demote user' }, { status: 500 });
        }

        // Log the action
        await logRoleChange(id, targetUser.email, targetUser.role, 'user');

        return NextResponse.json({
            success: true,
            message: `${targetUser.email} has been demoted to regular user`,
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes('required')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('[PATCH /api/users/[id]/demote] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
