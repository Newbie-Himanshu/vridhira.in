import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireOwner } from '@/lib/permissions';
import { logRoleChange } from '@/lib/activity-logger';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/**
 * PATCH /api/users/[id]/promote - Promote user to store admin (Owner only)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const owner = await requireOwner();
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

        // Cannot promote owner or already admin
        if (targetUser.role === 'owner') {
            return NextResponse.json({ error: 'Cannot modify owner role' }, { status: 400 });
        }

        if (targetUser.role === 'store admin') {
            return NextResponse.json({ error: 'User is already an admin' }, { status: 400 });
        }

        // Promote to store admin
        const { error: updateError } = await supabase
            .from('customers')
            .update({
                role: 'store admin',
                promoted_by: owner.id,
                promoted_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (updateError) {
            console.error('[PATCH /api/users/[id]/promote] Update error:', updateError);
            return NextResponse.json({ error: 'Failed to promote user' }, { status: 500 });
        }

        // Log the action
        await logRoleChange(id, targetUser.email, targetUser.role, 'store admin');

        return NextResponse.json({
            success: true,
            message: `${targetUser.email} has been promoted to Store Admin`,
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes('required')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('[PATCH /api/users/[id]/promote] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
