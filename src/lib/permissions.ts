'use server';

import { createClient } from '@/lib/supabase/server';
import { type UserRole, type CurrentUser } from '@/lib/role-utils';

// Re-export types only (sync functions should be imported from role-utils directly)
export type { UserRole, CurrentUser } from '@/lib/role-utils';

/**
 * Get current user with role information
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) return null;

        const { data: customer, error: customerError } = await supabase
            .from('customers')
            .select('id, email, role, is_banned')
            .eq('id', user.id)
            .single();

        if (customerError || !customer) return null;

        return {
            id: customer.id,
            email: customer.email,
            role: customer.role as UserRole,
            is_banned: customer.is_banned || false,
        };
    } catch (error) {
        console.error('[getCurrentUser] Error:', error);
        return null;
    }
}

/**
 * Check if current user is owner
 */
export async function isOwner(): Promise<boolean> {
    const user = await getCurrentUser();
    return user?.role === 'owner';
}

/**
 * Check if current user is admin (store admin or owner)
 */
export async function isAdmin(): Promise<boolean> {
    const user = await getCurrentUser();
    return user?.role === 'store admin' || user?.role === 'owner';
}

/**
 * Check if current user is banned
 */
export async function isBanned(): Promise<boolean> {
    const user = await getCurrentUser();
    return user?.is_banned ?? false;
}

/**
 * Require owner role - throws if not owner
 */
export async function requireOwner(): Promise<CurrentUser> {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Authentication required');
    }
    if (user.is_banned) {
        throw new Error('Your account has been banned');
    }
    if (user.role !== 'owner') {
        throw new Error('Owner access required');
    }
    return user;
}

/**
 * Require admin role - throws if not admin or owner
 */
export async function requireAdmin(): Promise<CurrentUser> {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error('Authentication required');
    }
    if (user.is_banned) {
        throw new Error('Your account has been banned');
    }
    if (user.role !== 'store admin' && user.role !== 'owner') {
        throw new Error('Admin access required');
    }
    return user;
}

/**
 * Check if user has permission for specific action
 */
export async function hasPermission(permission: string): Promise<boolean> {
    const user = await getCurrentUser();
    if (!user || user.is_banned) return false;

    const ownerOnly = [
        'product.hide',
        'product.block',
        'product.bulk',
        'user.promote',
        'user.demote',
        'user.ban_admin',
        'logs.view',
        'logs.export',
        'logs.delete',
        'settings.analytics',
        'settings.maintenance',
    ];

    const adminAllowed = [
        'product.create',
        'product.update',
        'product.delete',
        'product.stock',
        'order.view_all',
        'order.update',
        'user.view',
        'user.ban_user',
    ];

    if (user.role === 'owner') return true;
    if (user.role === 'store admin') {
        return adminAllowed.includes(permission);
    }

    return false;
}

