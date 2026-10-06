// [Layer: LayoutBars]
// AdminSidebar.tsx -- Fixed left navigation sidebar for the Admin panel.
// Supports dual-mode: Open (w-64) with full labels/sections and Collapsed (w-20) icon-only mode
// matching the full vertical menu length with tooltips and fluid responsiveness.
// Brand header & footer are pinned (non-scrollable); middle modules list is scrollable with visible scrollbar indicator.
// Provides generous internal breathing room and robust logo presentation without alt-text spill.
// DO NOT put business logic or API calls here.

import { FC } from 'react';
import { NavLink } from 'react-router-dom';

export interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

interface AdminNavItem {
  to: string;
  icon: string;
  label: string;
  sectionHeader?: string;
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { to: '/admin/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/admin/users', icon: 'group', label: 'Users', sectionHeader: 'Management' },
  { to: '/admin/books', icon: 'book_2', label: 'Books' },
  { to: '/admin/categories', icon: 'category', label: 'Categories' },
  { to: '/admin/inventory', icon: 'inventory_2', label: 'Inventory' },
  { to: '/admin/reservations', icon: 'assignment', label: 'Reservations', sectionHeader: 'Circulation' },
  { to: '/admin/borrowings', icon: 'auto_stories', label: 'Borrowings' },
  { to: '/admin/returns', icon: 'assignment_return', label: 'Returns' },
  { to: '/admin/analytics', icon: 'monitoring', label: 'Analytics', sectionHeader: 'Intelligence' },
  { to: '/admin/reports', icon: 'description', label: 'Reports' },
  { to: '/admin/notifications', icon: 'notifications', label: 'Notifications', sectionHeader: 'System & Security' },
  { to: '/admin/roles', icon: 'admin_panel_settings', label: 'Roles & Permissions' },
  { to: '/admin/audit-logs', icon: 'fact_check', label: 'Audit Logs' },
  { to: '/admin/settings', icon: 'tune', label: 'Settings' },
  { to: '/admin/profile', icon: 'manage_accounts', label: 'Admin Profile' },
];

// Note: the single open/close toggle lives in AdminTopBar (onToggle kept in props for API compatibility).
const AdminSidebar: FC<AdminSidebarProps> = ({ isOpen = true, onClose }) => {
  const handleLinkClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose?.();
    }
  };

  return (
    <>
      {/* Scoped scrollbar indicator style */}
      <style>{`
        .admin-sidebar-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(155, 229, 100, 0.45) rgba(17, 62, 79, 0.4);
        }
        .admin-sidebar-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .admin-sidebar-scrollbar::-webkit-scrollbar-track {
          background: rgba(17, 62, 79, 0.4);
        }
        .admin-sidebar-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(155, 229, 100, 0.45);
          border-radius: 9999px;
        }
        .admin-sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(155, 229, 100, 0.85);
        }
      `}</style>

      {/* Mobile Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-[#164E63] text-white shadow-xl z-50 flex flex-col justify-between overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? 'w-64 translate-x-0'
            : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        {/* Pinned Non-Scrollable Header - Aligned with Modules Page Header */}
        <div
          className={`h-16 flex-shrink-0 border-b border-white/10 bg-[#113E4F]/90 backdrop-blur-md flex items-center transition-all duration-300 z-20 ${
            isOpen ? 'px-4 justify-between gap-3' : 'justify-center lg:px-2'
          }`}
        >
          <div className={`flex items-center gap-3 min-w-0 ${!isOpen && 'justify-center'}`}>
            <div className="relative w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 overflow-visible">
              <span className="material-symbols-outlined text-[20px] text-white">
                local_library
              </span>
              <img
                alt=""
                aria-hidden="true"
                className="h-8 w-auto object-contain brightness-0 invert absolute inset-0 m-auto"
                src="https://lh3.googleusercontent.com/aida/AEtjO1ULKR2-At3mMWWJpVDPDjA9IJakzSkbSa5XSRuHMRp9FP_z4wgxPquvURNmIn7pBo3qDybcHoJ0p3aqPmqigbmTF6L8uMiO50Pn_nfngEvaB2NjtIdS-AF002Kn2J_crIGUvNLPtaqOw0hjLWWotFcCcF92I98d8Wdb2_hqAxLH6KeWVXAQwnwge43KAC_-90WpmcqP7BNWnSvNgOgU-gywUu5UvIZ3bWseH7DSvWX4pWq1MmSHAz_pUe4"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span
                className="material-symbols-outlined text-[12px] text-[#9BE564] absolute -bottom-1 -right-1 bg-[#164E63] rounded-full p-0.5 border border-white/20 shadow-sm"
                title="Active Administrator Session"
              >
                login
              </span>
            </div>
            {isOpen && (
              <div className="flex flex-col min-w-0">
                <span className="font-headline-4 text-[13px] font-bold text-white tracking-tight leading-tight truncate">
                  KATIPUNEROS
                </span>
                <span className="font-caption text-[11px] text-white/70 uppercase tracking-wider">
                  Library Store
                </span>
              </div>
            )}
          </div>
          {isOpen && (
            <span className="font-caption text-[10px] bg-[#9BE564] text-[#18323D] px-2 py-0.5 rounded font-bold uppercase tracking-wider shadow-sm flex-shrink-0 ml-auto">
              ADMIN
            </span>
          )}
        </div>

        {/* Scrollable Middle Modules Navigation List with Custom Scrollbar Indication */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden admin-sidebar-scrollbar py-space-sm">
          <nav className={`flex flex-col gap-1 ${isOpen ? 'px-3' : 'px-2 items-center'}`}>
            {ADMIN_NAV_ITEMS.map((item, idx) => {
              const showSection = isOpen && item.sectionHeader && (
                <div
                  key={`sec-${item.sectionHeader}-${idx}`}
                  className="px-3 pt-3.5 pb-1 text-white/50 font-caption text-[11px] font-bold uppercase tracking-wider select-none truncate"
                >
                  {item.sectionHeader}
                </div>
              );

              const showMiniDivider = !isOpen && item.sectionHeader && (
                <div
                  key={`div-${item.sectionHeader}-${idx}`}
                  className="w-8 border-t border-white/10 my-1.5"
                  title={item.sectionHeader}
                />
              );

              return (
                <div key={item.to} className="w-full">
                  {showSection}
                  {showMiniDivider}
                  <NavLink
                    to={item.to}
                    onClick={handleLinkClick}
                    title={!isOpen ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center transition-all duration-200 rounded-lg ${
                        isOpen
                          ? 'gap-3.5 px-3.5 py-2.5 w-full shadow-sm'
                          : 'justify-center w-10 h-10 mx-auto my-0.5'
                      } ${
                        isActive
                          ? 'bg-[#9BE564] text-[#18323D] font-bold shadow-md'
                          : 'text-white/85 hover:bg-[#9BE564] hover:text-[#18323D]'
                      }`
                    }
                  >
                    <span className="material-symbols-outlined text-[20px] flex-shrink-0">
                      {item.icon}
                    </span>
                    {isOpen && (
                      <span className="font-small text-small truncate font-medium">
                        {item.label}
                      </span>
                    )}
                  </NavLink>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Pinned Non-Scrollable Footer - Exit to Public */}
        <div
          className={`flex-shrink-0 p-space-sm border-t border-white/10 bg-[#113E4F]/90 backdrop-blur-md z-20 ${
            !isOpen && 'flex justify-center'
          }`}
        >
          <NavLink
            to="/"
            onClick={handleLinkClick}
            title={!isOpen ? 'Exit to Public' : undefined}
            className={`flex items-center rounded-lg text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors ${
              isOpen
                ? 'gap-3 px-3.5 py-space-sm w-full'
                : 'justify-center w-10 h-10'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] flex-shrink-0">logout</span>
            {isOpen && (
              <span className="font-small text-small font-semibold truncate">Exit to Public</span>
            )}
          </NavLink>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
