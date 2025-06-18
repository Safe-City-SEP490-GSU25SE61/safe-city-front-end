export const PERMISSIONS = {
  // Admin permissions
  MANAGE_USERS: 'manage_users',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_REPORTS: 'view_reports',
  MANAGE_ROLES: 'manage_roles',
  // Officer permissions
  VIEW_TASKS: 'view_tasks',
  UPDATE_PROFILE: 'update_profile',
  SUBMIT_REPORTS: 'submit_reports'
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

import { ROLES, type UserRole } from './roleHelpers';

// Check if user has specific permission
export const hasPermission = (
  user: { role: string },
  permission: Permission
): boolean => {
  // Admin has all permissions
  if (user.role === ROLES.ADMIN) {
    return true;
  }
  // Check officer permissions
  if (user.role === ROLES.OFFICER) {
    const officerPermissions = [
      PERMISSIONS.VIEW_TASKS,
      PERMISSIONS.UPDATE_PROFILE,
      PERMISSIONS.SUBMIT_REPORTS
    ];
    return officerPermissions.includes(permission as any);
  }
  return false;
};

// Get all permissions for a role
export const getRolePermissions = (role: UserRole): Permission[] => {
  switch (role) {
    case ROLES.ADMIN:
      return Object.values(PERMISSIONS);
    case ROLES.OFFICER:
      return [
        PERMISSIONS.VIEW_TASKS,
        PERMISSIONS.UPDATE_PROFILE,
        PERMISSIONS.SUBMIT_REPORTS
      ];
    default:
      return [];
  }
}; 