import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireOwner } from '@/lib/permissions';
import { z } from 'zod';

// Validation schema for query params
const LogsQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(50),
    category: z.string().optional(),
    action: z.string().optional(),
    severity: z.enum(['info', 'warning', 'critical']).optional(),
    userId: z.string().uuid().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    search: z.string().optional(),
});

/**
 * GET /api/logs - Fetch activity logs (Owner only)
 */
export async function GET(request: NextRequest) {
    try {
        // Require owner access
        await requireOwner();

        const supabase = await createClient();
        const { searchParams } = new URL(request.url);

        // Parse and validate query parameters
        const params = LogsQuerySchema.parse({
            page: searchParams.get('page'),
            limit: searchParams.get('limit'),
            category: searchParams.get('category'),
            action: searchParams.get('action'),
            severity: searchParams.get('severity'),
            userId: searchParams.get('userId'),
            startDate: searchParams.get('startDate'),
            endDate: searchParams.get('endDate'),
            search: searchParams.get('search'),
        });

        // Build query
        let query = supabase
            .from('activity_logs')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        // Apply filters
        if (params.category) {
            query = query.eq('action_category', params.category);
        }
        if (params.action) {
            query = query.eq('action', params.action);
        }
        if (params.severity) {
            query = query.eq('severity', params.severity);
        }
        if (params.userId) {
            query = query.eq('user_id', params.userId);
        }
        if (params.startDate) {
            query = query.gte('created_at', params.startDate);
        }
        if (params.endDate) {
            query = query.lte('created_at', params.endDate);
        }
        if (params.search) {
            query = query.or(`action.ilike.%${params.search}%,target_name.ilike.%${params.search}%,user_email.ilike.%${params.search}%`);
        }

        // Pagination
        const offset = (params.page - 1) * params.limit;
        query = query.range(offset, offset + params.limit - 1);

        const { data: logs, count, error } = await query;

        if (error) {
            console.error('[GET /api/logs] Supabase error:', error);
            return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
        }

        return NextResponse.json({
            logs,
            pagination: {
                page: params.page,
                limit: params.limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / params.limit),
            },
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes('required')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('[GET /api/logs] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/logs - Delete logs by date range (Owner only)
 */
export async function DELETE(request: NextRequest) {
    try {
        await requireOwner();

        const supabase = await createClient();
        const body = await request.json();

        const { startDate, endDate, confirmText } = body;

        if (!startDate || !endDate) {
            return NextResponse.json(
                { error: 'Start date and end date are required' },
                { status: 400 }
            );
        }

        // First count how many will be deleted
        const { count } = await supabase
            .from('activity_logs')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startDate)
            .lte('created_at', endDate);

        // Verify confirmation text
        const expectedConfirm = `delete ${count} logs`;
        if (confirmText?.toLowerCase() !== expectedConfirm) {
            return NextResponse.json(
                {
                    error: 'Invalid confirmation',
                    expected: expectedConfirm,
                    count
                },
                { status: 400 }
            );
        }

        // Delete the logs
        const { error } = await supabase
            .from('activity_logs')
            .delete()
            .gte('created_at', startDate)
            .lte('created_at', endDate);

        if (error) {
            console.error('[DELETE /api/logs] Supabase error:', error);
            return NextResponse.json({ error: 'Failed to delete logs' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            deleted: count,
            message: `Successfully deleted ${count} logs`,
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes('required')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('[DELETE /api/logs] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
