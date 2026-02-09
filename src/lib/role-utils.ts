// Utility functions for role management (non-server, sync functions)

export type UserRole = 'user' | 'store admin' | 'owner';

export interface CurrentUser {
    id: string;
    email: string;
    role: UserRole;
    is_banned: boolean;
}

/**
 * Check if user can perform action on target role
 * Owner > Admin > User (role hierarchy)
 */
export function canManageRole(actorRole: UserRole, targetRole: UserRole): boolean {
    const hierarchy: Record<UserRole, number> = {
        'user': 1,
        'store admin': 2,
        'owner': 3,
    };

    return hierarchy[actorRole] > hierarchy[targetRole];
}

/**
 * Get role hierarchy level
 */
export function getRoleLevel(role: UserRole): number {
    const levels: Record<UserRole, number> = {
        'user': 1,
        'store admin': 2,
        'owner': 3,
    };
    return levels[role] || 0;
}

/**
 * Check if role is admin level or higher
 */
export function isAdminRole(role: UserRole): boolean {
    return role === 'store admin' || role === 'owner';
}

/**
 * Check if role is owner level
 */
export function isOwnerRole(role: UserRole): boolean {
    return role === 'owner';
}
