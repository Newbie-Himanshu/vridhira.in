import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/permissions';
import { canManageRole } from '@/lib/role-utils';
import { logUserBan } from '@/lib/activity-logger';
import { z } from 'zod';

interface RouteParams {
    params: Promise<{ id: string }>;
}

const BanSchema = z.object({
    banned: z.boolean(),
    reason: z.string().optional(),
});

/**
 * PATCH /api/users/[id]/ban - Ban or unban a user
 * - Admins can only ban regular users
 * - Owners can ban anyone except other owners
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        if (currentUser.role !== 'store admin' && currentUser.role !== 'owner') {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { id } = await params;
        const supabase = await createClient();
        const body = await request.json();

        const { banned, reason } = BanSchema.parse(body);

        // Get target user
        const { data: targetUser, error: fetchError } = await supabase
            .from('customers')
            .select('id, email, role, is_banned')
            .eq('id', id)
            .single();

        if (fetchError || !targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Cannot ban yourself
        if (targetUser.id === currentUser.id) {
            return NextResponse.json({ error: 'Cannot ban yourself' }, { status: 400 });
        }

        // Cannot ban owner
        if (targetUser.role === 'owner') {
            return NextResponse.json({ error: 'Cannot ban owner' }, { status: 400 });
        }

        // Admins can only ban regular users
        if (currentUser.role === 'store admin' && targetUser.role !== 'user') {
            return NextResponse.json(
                { error: 'Admins can only ban regular users' },
                { status: 403 }
            );
        }

        // Update ban status
        const { error: updateError } = await supabase
            .from('customers')
            .update({
                is_banned: banned,
                banned_reason: banned ? reason || null : null,
            })
            .eq('id', id);

        if (updateError) {
            console.error('[PATCH /api/users/[id]/ban] Update error:', updateError);
            return NextResponse.json({ error: 'Failed to update ban status' }, { status: 500 });
        }

        // Log the action
        await logUserBan(id, targetUser.email, banned, reason);

        return NextResponse.json({
            success: true,
            message: banned
                ? `${targetUser.email} has been banned`
                : `${targetUser.email} has been unbanned`,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
        }
        console.error('[PATCH /api/users/[id]/ban] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
