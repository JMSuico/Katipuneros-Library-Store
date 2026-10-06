// [Layer: LayoutBars]
// CashierLayout.tsx -- Layout wrapper for the Cashier panel.
// Renders CashierSidebar (dual mode w-72 / w-20) + CashierTopBar + Outlet.
// Dynamic content offset: pl-0 on mobile, lg:pl-72 when open, lg:pl-20 when collapsed.
// Governs generous horizontal distance (px-6 sm:px-8 lg:px-12) between the sidebar and all 10 Cashier modules.
// DO NOT put business logic here.

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import CashierSidebar from './CashierSidebar';
import CashierTopBar from './CashierTopBar';

const CashierLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    </div>
  );
};

export default CashierLayout;
