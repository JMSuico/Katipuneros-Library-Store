// [Layer: LayoutBars]
// AdminLayout.tsx -- Layout wrapper for the Admin panel.
// Renders AdminSidebar (dual mode w-64 / w-20) + AdminTopBar + Outlet.
// Dynamic content offset: pl-0 on mobile, lg:pl-64 when open, lg:pl-20 when collapsed.
// Governs generous horizontal distance (px-6 sm:px-8 lg:px-12) between the sidebar and all 15 Admin modules.
// DO NOT put business logic here.

import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';
import { getAuthToken } from '../Endpoints/apiClient';
import { getStoredUser, logout } from '../Endpoints/authApi';
import { getSystemSettings } from '../Endpoints/Admin/settingsApi';
import { useInactivityLogoff } from '../Hooks/useInactivityLogoff';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const [timeoutMinutes, setTimeoutMinutes] = useState<number>(60);

  const token = getAuthToken();
  const user = getStoredUser();

  useEffect(() => {
    let isMounted = true;
    getSystemSettings()
      .then((settings) => {
        if (isMounted && settings?.security?.superAdminTimeoutMinutes) {
          setTimeoutMinutes(settings.security.superAdminTimeoutMinutes);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTimeout = useCallback(() => {
    logout();
    navigate('/admin/login', { replace: true });
  }, [navigate]);

  useInactivityLogoff(timeoutMinutes, handleTimeout, !!token);

  if (!token || user?.role !== 'Admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="bg-surface-container-low font-body text-body text-on-surface antialiased min-h-screen">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen((prev) => !prev)}
      />
      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'pl-0 lg:pl-64' : 'pl-0 lg:pl-20'
        }`}
      >
        <AdminTopBar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="relative pt-20 pb-16 w-full min-h-screen bg-surface-container-low px-6 sm:px-8 lg:px-12 transition-all duration-300">
          <div className="w-full max-w-[1720px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
