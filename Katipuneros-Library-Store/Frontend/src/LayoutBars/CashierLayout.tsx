// [Layer: LayoutBars]
// CashierLayout.tsx -- Layout wrapper for the Cashier panel.
// Renders CashierSidebar (dual mode w-72 / w-20) + CashierTopBar + Outlet.
// Dynamic content offset: pl-0 on mobile, lg:pl-72 when open, lg:pl-20 when collapsed.
// Governs generous horizontal distance (px-6 sm:px-8 lg:px-12) between the sidebar and all 10 Cashier modules.
// DO NOT put business logic here.

import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import CashierSidebar from './CashierSidebar';
import CashierTopBar from './CashierTopBar';
import { getAuthToken } from '../Endpoints/apiClient';
import { getStoredUser, logout } from '../Endpoints/authApi';
import { getPublicSystemSettings } from '../Endpoints/Admin/settingsApi';
import { useInactivityLogoff } from '../Hooks/useInactivityLogoff';
import { useToasts } from '../Hooks/useToasts';

const CashierLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToasts();
  const [timeoutMinutes, setTimeoutMinutes] = useState<number>(15);

  const token = getAuthToken();
  const user = getStoredUser();

  useEffect(() => {
    let isMounted = true;
    getPublicSystemSettings()
      .then((settings) => {
        if (isMounted && settings?.security?.posAutoLogoffMinutes) {
          setTimeoutMinutes(settings.security.posAutoLogoffMinutes);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTimeout = useCallback(() => {
    addToast('Cashier terminal auto-logged off due to inactivity.', 'warning');
    logout();
    setTimeout(() => {
      navigate('/cashier/login', { replace: true });
    }, 400);
  }, [addToast, navigate]);

  useInactivityLogoff(timeoutMinutes, handleTimeout, !!token);

  if (!token || (user?.role !== 'Cashier' && user?.role !== 'Admin')) {
    return <Navigate to="/cashier/login" replace />;
  }

  return (
    <div className="bg-surface-container-low font-body text-body text-on-surface antialiased min-h-screen">
      <CashierSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onToggle={() => setSidebarOpen((prev) => !prev)}
      />
      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'pl-0 lg:pl-72' : 'pl-0 lg:pl-20'
        }`}
      >
        <CashierTopBar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="relative pt-20 pb-16 w-full min-h-screen bg-surface-container-low px-6 sm:px-8 lg:px-12 transition-all duration-300">
          <div className="w-full max-w-[1720px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {toasts.length > 0 && (
        <aside
          role="region"
          aria-label="Cashier notification toasts"
          className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md pointer-events-auto"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              onClick={() => removeToast(toast.id)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm cursor-pointer transition-all duration-200 bg-amber-500/15 border-amber-500/30 text-amber-300 backdrop-blur-md"
            >
              <span className="material-symbols-outlined text-[18px]">warning</span>
              <span>{toast.message}</span>
            </div>
          ))}
        </aside>
      )}
    </div>
  );
};

export default CashierLayout;
