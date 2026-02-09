import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin, requireOwner, getCurrentUser } from '@/lib/permissions';

/**
 * GET /api/users - List users (Admin: non-anonymous, Owner: all)
 */
export async function GET(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();

        if (!currentUser || (currentUser.role !== 'store admin' && currentUser.role !== 'owner')) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const search = searchParams.get('search');
        const role = searchParams.get('role');

        let query = supabase
            .from('customers')
            .select('id, email, full_name, role, phone, is_banned, is_anonymous, created_at', { count: 'exact' })
            .order('created_at', { ascending: false });

        // Admins cannot see anonymous users (only owners can)
        if (currentUser.role !== 'owner') {
            query = query.eq('is_anonymous', false);
        }

        // Search filter
        if (search) {
            query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
        }

        // Role filter
        if (role) {
            query = query.eq('role', role);
        }

        // Pagination
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data: users, count, error } = await query;

        if (error) {
            console.error('[GET /api/users] Supabase error:', error);
            return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
        }

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / limit),
            },
        });
    } catch (error) {
        console.error('[GET /api/users] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
