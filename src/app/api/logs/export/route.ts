import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireOwner } from '@/lib/permissions';
import { logDataExport } from '@/lib/activity-logger';
import { z } from 'zod';

const ExportSchema = z.object({
    format: z.enum(['json', 'csv']).default('json'),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    category: z.string().optional(),
});

/**
 * POST /api/logs/export - Export logs to file (Owner only)
 */
export async function POST(request: NextRequest) {
    try {
        await requireOwner();

        const supabase = await createClient();
        const body = await request.json();

        const params = ExportSchema.parse(body);

        // Build query
        let query = supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false });

        if (params.startDate) {
            query = query.gte('created_at', params.startDate);
        }
        if (params.endDate) {
            query = query.lte('created_at', params.endDate);
        }
        if (params.category) {
            query = query.eq('action_category', params.category);
        }

        // Limit to 10000 for performance
        query = query.limit(10000);

        const { data: logs, error } = await query;

        if (error) {
            console.error('[POST /api/logs/export] Supabase error:', error);
            return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
        }

        if (!logs || logs.length === 0) {
            return NextResponse.json({ error: 'No logs found for the specified criteria' }, { status: 404 });
        }

        // Log this export action
        await logDataExport('activity_logs', params.format, logs.length);

        if (params.format === 'csv') {
            // Convert to CSV
            const headers = [
                'id', 'created_at', 'action', 'action_category', 'severity',
                'user_id', 'user_email', 'user_role', 'ip_address', 'user_agent',
                'target_type', 'target_id', 'target_name', 'details', 'changes'
            ];

            const csvRows = [headers.join(',')];

            for (const log of logs) {
                const row = headers.map(header => {
                    const value = log[header as keyof typeof log];
                    if (value === null || value === undefined) return '';
                    if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return String(value);
                });
                csvRows.push(row.join(','));
            }

            const csv = csvRows.join('\n');

            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="activity_logs_${new Date().toISOString().split('T')[0]}.csv"`,
                },
            });
        }

        // JSON format (default)
        const jsonExport = {
            exportedAt: new Date().toISOString(),
            totalRecords: logs.length,
            filters: {
                startDate: params.startDate,
                endDate: params.endDate,
                category: params.category,
            },
            logs,
        };

        return new NextResponse(JSON.stringify(jsonExport, null, 2), {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="activity_logs_${new Date().toISOString().split('T')[0]}.json"`,
            },
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid parameters', details: error.errors }, { status: 400 });
        }
        if (error instanceof Error && error.message.includes('required')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('[POST /api/logs/export] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
