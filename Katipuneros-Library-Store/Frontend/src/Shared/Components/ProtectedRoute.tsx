// [Layer: Shared/Components]
// ProtectedRoute.tsx -- Universal client-side Route Protection & RBAC Middleware component.
// Enforces valid token existence, unexpired JWT signature, and strict role authorization.
// Traps unauthorized or unauthenticated direct URL visits and redirects to designated login portals.
// DO NOT put page-specific UI or direct database logic here.

import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { getAuthToken, clearAuthSession } from '../../Endpoints/apiClient';
import { getStoredUser, AuthUser } from '../../Endpoints/authApi';

export interface ProtectedRouteProps {
  allowedRoles: ('Admin' | 'Cashier' | 'Customer')[];
  redirectPath?: string;
  children?: React.ReactNode;
}

const isTokenValid = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload) as { exp?: number };
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false; // Token is expired
    }
    return true;
  } catch {
    // Malformed token
    return false;
  }
};

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
  if (!user || !user.role || !allowedRoles.includes(user.role)) {
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
