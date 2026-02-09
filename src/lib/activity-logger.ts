'use server';

import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';

export type LogCategory =
    | 'auth'
    | 'user'
    | 'product'
    | 'cart'
    | 'checkout'
    | 'order'
    | 'page'
    | 'session'
    | 'admin'
    | 'system'
    | 'error';

export type LogSeverity = 'info' | 'warning' | 'critical';

interface LogActivityParams {
    action: string;
    category: LogCategory;
    targetType?: string;
    targetId?: string;
    targetName?: string;
    details?: Record<string, unknown>;
    changes?: {
        before: Record<string, unknown>;
        after: Record<string, unknown>;
    };
    severity?: LogSeverity;
}

/**
 * Hash IP address for privacy (keep first 3 octets, hash last)
 */
function hashIpAddress(ip: string): string {
    if (!ip) return 'unknown';
    const parts = ip.split('.');
    if (parts.length === 4) {
        // IPv4: mask last octet
        return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
    // IPv6: just truncate
    return ip.substring(0, 20) + '...';
}

/**
 * Extract browser and OS from user agent
 */
function parseUserAgent(ua: string): string {
    if (!ua) return 'unknown';

    // Simple extraction - just browser and OS
    let browser = 'Unknown';
    let os = 'Unknown';

    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';

    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

    return `${browser} on ${os}`;
}

/**
 * Log an activity event to the activity_logs table
 */
export async function logActivity({
    action,
    category,
    targetType,
    targetId,
    targetName,
    details = {},
    changes,
    severity = 'info',
}: LogActivityParams): Promise<void> {
    try {
        const supabase = await createClient();
        const headersList = await headers();

        // Get current user if logged in
        const { data: { user } } = await supabase.auth.getUser();

        // Get customer details if user exists
        let userEmail: string | null = null;
        let userRole: string | null = null;

        if (user) {
            const { data: customer } = await supabase
                .from('customers')
                .select('email, role')
                .eq('id', user.id)
                .single();

            if (customer) {
                userEmail = customer.email;
                userRole = customer.role;
            }
        }

        // Get request metadata
        const ip = headersList.get('x-forwarded-for') ||
            headersList.get('x-real-ip') ||
            'unknown';
        const userAgent = headersList.get('user-agent') || 'unknown';

        // Insert log entry
        const { error } = await supabase.from('activity_logs').insert({
            user_id: user?.id || null,
            user_email: userEmail,
            user_role: userRole,
            ip_address: hashIpAddress(ip),
            user_agent: parseUserAgent(userAgent),
            action,
            action_category: category,
            severity,
            target_type: targetType || null,
            target_id: targetId || null,
            target_name: targetName || null,
            details,
            changes: changes || null,
        });

        if (error) {
            console.error('[logActivity] Failed to log:', error);
        }
    } catch (error) {
        // Don't throw - logging should never break the app
        console.error('[logActivity] Error:', error);
    }
}

// Auth event loggers
export async function logLogin(email: string, method: 'google' | 'email') {
    return logActivity({
        action: 'auth.login',
        category: 'auth',
        details: { email, method }
    });
}

export async function logLogout(sessionDuration?: number) {
    return logActivity({
        action: 'auth.logout',
        category: 'auth',
        details: { sessionDuration }
    });
}

export async function logFailedLogin(email: string, reason: string) {
    return logActivity({
        action: 'auth.failed',
        category: 'auth',
        severity: 'warning',
        details: { email, reason }
    });
}

export async function logRegister(email: string, method: 'google' | 'email') {
    return logActivity({
        action: 'auth.register',
        category: 'auth',
        details: { email, method }
    });
}

// Product event loggers
export async function logProductCreate(id: string, title: string, price: number) {
    return logActivity({
        action: 'product.create',
        category: 'product',
        targetType: 'product',
        targetId: id,
        targetName: title,
        details: { price },
    });
}

export async function logProductUpdate(id: string, title: string, before: Record<string, unknown>, after: Record<string, unknown>) {
    return logActivity({
        action: 'product.update',
        category: 'product',
        targetType: 'product',
        targetId: id,
        targetName: title,
        changes: { before, after },
    });
}

export async function logProductDelete(id: string, title: string) {
    return logActivity({
        action: 'product.delete',
        category: 'product',
        targetType: 'product',
        targetId: id,
        targetName: title,
    });
}

export async function logProductHide(id: string, title: string, hidden: boolean, reason?: string) {
    return logActivity({
        action: hidden ? 'product.hide' : 'product.unhide',
        category: 'product',
        targetType: 'product',
        targetId: id,
        targetName: title,
        details: { reason },
    });
}

export async function logProductBlock(id: string, title: string, blocked: boolean, reason?: string) {
    return logActivity({
        action: blocked ? 'product.block' : 'product.unblock',
        category: 'product',
        targetType: 'product',
        targetId: id,
        targetName: title,
        details: { reason },
    });
}

export async function logStockAdjust(id: string, title: string, oldQty: number, newQty: number, reason?: string) {
    return logActivity({
        action: 'product.stock_adjust',
        category: 'product',
        targetType: 'product',
        targetId: id,
        targetName: title,
        changes: { before: { stock: oldQty }, after: { stock: newQty } },
        details: { reason },
    });
}

// Order event loggers
export async function logOrderCreate(orderId: string, total: number, itemCount: number) {
    return logActivity({
        action: 'order.create',
        category: 'order',
        targetType: 'order',
        targetId: orderId,
        targetName: `Order #${orderId.slice(0, 8)}`,
        details: { total, itemCount },
    });
}

export async function logOrderStatusChange(orderId: string, oldStatus: string, newStatus: string) {
    return logActivity({
        action: 'order.status_change',
        category: 'order',
        targetType: 'order',
        targetId: orderId,
        targetName: `Order #${orderId.slice(0, 8)}`,
        changes: { before: { status: oldStatus }, after: { status: newStatus } },
    });
}

export async function logOrderCancel(orderId: string, reason?: string) {
    return logActivity({
        action: 'order.cancel',
        category: 'order',
        targetType: 'order',
        targetId: orderId,
        targetName: `Order #${orderId.slice(0, 8)}`,
        details: { reason },
    });
}

// User management event loggers
export async function logRoleChange(userId: string, email: string, oldRole: string, newRole: string) {
    return logActivity({
        action: 'user.role_change',
        category: 'user',
        targetType: 'user',
        targetId: userId,
        targetName: email,
        severity: 'warning',
        changes: { before: { role: oldRole }, after: { role: newRole } },
    });
}

export async function logUserBan(userId: string, email: string, banned: boolean, reason?: string) {
    return logActivity({
        action: banned ? 'user.ban' : 'user.unban',
        category: 'user',
        targetType: 'user',
        targetId: userId,
        targetName: email,
        severity: 'warning',
        details: { reason },
    });
}

// Admin event loggers
export async function logSettingsChange(settingName: string, oldValue: unknown, newValue: unknown) {
    return logActivity({
        action: 'admin.settings_change',
        category: 'admin',
        targetType: 'setting',
        targetName: settingName,
        changes: { before: { value: oldValue }, after: { value: newValue } },
    });
}

export async function logDataExport(type: string, format: string, recordCount: number) {
    return logActivity({
        action: 'admin.export_data',
        category: 'admin',
        details: { type, format, recordCount },
    });
}

export async function logLogsDelete(startDate: string, endDate: string, count: number) {
    return logActivity({
        action: 'admin.delete_logs',
        category: 'admin',
        severity: 'warning',
        details: { startDate, endDate, deletedCount: count },
    });
}

