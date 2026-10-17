// [Layer: Shared/Components]
// ProtectedRoute.tsx -- Universal client-side Route Protection & RBAC Middleware component.
// Enforces valid token existence, unexpired JWT signature, and strict role authorization.
// Traps unauthorized or unauthenticated direct URL visits and redirects to designated login portals.
// DO NOT put page-specific UI or direct database logic here.

import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { getAuthToken, clearAuthSession, isTokenValid } from '../../Endpoints/apiClient';
import { getStoredUser, AuthUser } from '../../Endpoints/authApi';

export interface ProtectedRouteProps {
  allowedRoles: ('Admin' | 'Cashier' | 'Customer')[];
  redirectPath?: string;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  redirectPath,
  children,
}) => {
  const location = useLocation();
  const token = getAuthToken();
  const user: AuthUser | null = getStoredUser();

  // 1. Validate Token Exists and Is Not Expired
  if (!token || !isTokenValid(token)) {
    if (token) {
      clearAuthSession();
    }
    const fallbackPath = redirectPath || (
      allowedRoles.includes('Admin')
        ? '/admin/login'
        : allowedRoles.includes('Cashier')
          ? '/cashier/login'
          : '/login'
    );
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // 2. Validate User Object Exists and Matches Required Role
  const hasAllowedRole = Boolean(
    user?.role && allowedRoles.some((r) => r.toLowerCase() === user.role.toLowerCase())
  );

  if (!user || !user.role || !hasAllowedRole) {
    if (!user) {
      clearAuthSession();
    }
    // Unauthorized access attempt for this role
    const fallbackPath = redirectPath || (
      allowedRoles.includes('Admin')
        ? '/admin/login'
        : allowedRoles.includes('Cashier')
          ? '/cashier/login'
          : '/login'
    );
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // 3. User is Authenticated and Authorized
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
