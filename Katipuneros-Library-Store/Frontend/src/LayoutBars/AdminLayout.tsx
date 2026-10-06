// [Layer: LayoutBars]
// AdminLayout.tsx -- Layout wrapper for the Admin panel.
// Renders AdminSidebar (dual mode w-64 / w-20) + AdminTopBar + Outlet.
// Dynamic content offset: pl-0 on mobile, lg:pl-64 when open, lg:pl-20 when collapsed.
// Governs generous horizontal distance (px-6 sm:px-8 lg:px-12) between the sidebar and all 15 Admin modules.
// DO NOT put business logic here.

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
