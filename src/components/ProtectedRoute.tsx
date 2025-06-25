import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getUserRole, isAuthenticated, isTokenExpiringSoon, tryRefreshToken } from '../utils/auth';
import { type UserRole, hasRole } from '../utils/roleHelpers';
import { type Permission } from '../utils/permissions';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  allowedPermissions?: Permission[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const location = useLocation();
  
  // Not authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = getUserRole();
  if (!role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (allowedRoles && !allowedRoles.some(r => hasRole(role, r))) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Permission check (optional, requires user object)
  // You may want to extend getUserRole or add a getUser utility to get permissions if needed

  useEffect(() => {
    const checkAndRefresh = async () => {
      if (isTokenExpiringSoon()) {
        await tryRefreshToken();
      }
    };
    checkAndRefresh();
  }, []);

  return <>{children}</>;
};

export default ProtectedRoute; 