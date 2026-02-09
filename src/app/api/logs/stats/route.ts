import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireOwner } from '@/lib/permissions';
import { logActivity } from '@/lib/activity-logger';

/**
 * GET /api/logs/stats - Get log statistics (Owner only)
 */
export async function GET() {
    try {
        await requireOwner();

        const supabase = await createClient();

        // Get total count
        const { count: totalCount } = await supabase
            .from('activity_logs')
            .select('*', { count: 'exact', head: true });

        // Get counts by category
        const { data: categoryStats } = await supabase
            .from('activity_logs')
            .select('action_category')
            .order('action_category');

        // Get counts by severity
        const { data: severityStats } = await supabase
            .from('activity_logs')
            .select('severity')
            .order('severity');

        // Get today's count
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: todayCount } = await supabase
            .from('activity_logs')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString());

        // Get this week's count
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const { count: weekCount } = await supabase
            .from('activity_logs')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', weekAgo.toISOString());

        // Count by category
        const byCategoryMap: Record<string, number> = {};
        categoryStats?.forEach(item => {
            byCategoryMap[item.action_category] = (byCategoryMap[item.action_category] || 0) + 1;
        });

        // Count by severity
        const bySeverityMap: Record<string, number> = {};
        severityStats?.forEach(item => {
            bySeverityMap[item.severity] = (bySeverityMap[item.severity] || 0) + 1;
        });

        // Estimate storage size (rough: ~500 bytes per log)
        const estimatedSizeBytes = (totalCount || 0) * 500;
        const estimatedSizeMB = (estimatedSizeBytes / (1024 * 1024)).toFixed(2);

        return NextResponse.json({
            total: totalCount || 0,
            today: todayCount || 0,
            thisWeek: weekCount || 0,
            byCategory: byCategoryMap,
            bySeverity: bySeverityMap,
            storage: {
                entries: totalCount || 0,
                estimatedMB: parseFloat(estimatedSizeMB),
            },
        });
    } catch (error) {
        if (error instanceof Error && error.message.includes('required')) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error('[GET /api/logs/stats] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
