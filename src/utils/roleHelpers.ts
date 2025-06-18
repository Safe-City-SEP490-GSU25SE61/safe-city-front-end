export const ROLES = {
  ADMIN: 'admin',
  OFFICER: 'officer'
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Check if user has specific role
export const hasRole = (userRole: string, requiredRole: UserRole): boolean => {
  return userRole === requiredRole;
};

// Check if user is admin
export const isAdmin = (user: { role: string }): boolean => {
  return user.role === ROLES.ADMIN;
};

// Check if user is officer
export const isOfficer = (user: { role: string }): boolean => {
  return user.role === ROLES.OFFICER;
};

// Get role-specific dashboard URL
export const getDashboardUrl = (role: UserRole): string => {
  switch (role) {
    case ROLES.ADMIN:
      return '/admin/dashboard';
    case ROLES.OFFICER:
      return '/officer/dashboard';
    default:
      return '/';
  }
}; 