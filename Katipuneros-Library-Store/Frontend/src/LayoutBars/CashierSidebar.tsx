// [Layer: LayoutBars]
// CashierSidebar.tsx -- Fixed left navigation sidebar for the Cashier panel.
// Supports dual-mode: Open (w-72) and Collapsed (w-20) icon-only mode matching full menu length.
// Pinned header and footer; middle modules navigation list is scrollable with visible scrollbar indicator.
// Includes mobile slide-over drawer with backdrop.
// DO NOT put business logic or API calls here.

import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { logoutUser } from '../Endpoints/authApi';
import { getCashierDashboardKpis } from '../Endpoints/Cashier/cashierApi';

interface NavItemConfig {
  path: string;
  icon: string;
  label: string;
}

const navItems: NavItemConfig[] = [
  { path: '/cashier/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { path: '/cashier/pending-reservations', icon: 'assignment', label: 'Pending Reservations' },
  { path: '/cashier/checkout', icon: 'menu_book', label: 'Checkout / Borrow' },
  { path: '/cashier/returns', icon: 'keyboard_return', label: 'Returns' },
  { path: '/cashier/customers', icon: 'group', label: 'Customers' },
  { path: '/cashier/book-availability', icon: 'book_2', label: 'Book Availability' },
  { path: '/cashier/schedules', icon: 'calendar_today', label: 'Schedules' },
  { path: '/cashier/overdue-fines', icon: 'warning', label: 'Overdue & Fines' },
  { path: '/cashier/transactions', icon: 'receipt_long', label: 'Transactions' },
  { path: '/cashier/notifications', icon: 'notifications', label: 'Notifications' },
];

export interface CashierSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

// Note: the single open/close toggle lives in CashierTopBar (onToggle kept in props for API compatibility).
const CashierSidebar: React.FC<CashierSidebarProps> = ({
  isOpen = true,
  onClose,
}) => {
  const [badgeCounts, setBadgeCounts] = useState<{ pending: number; overdue: number }>({
    pending: 0,
    overdue: 0,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchBadges = async () => {
      try {
        const kpis = await getCashierDashboardKpis();
        if (isMounted && kpis) {
          setBadgeCounts({
            pending: kpis.pendingHoldsCount ?? 0,
            overdue: kpis.overdueLoansCount ?? 0,
          });
        }
      } catch {
        // Fallback to 0 if unauthorized or network error
      }
    };

    fetchBadges();
    const interval = setInterval(fetchBadges, 30000);
    window.addEventListener('cashier-refresh-kpis', fetchBadges);
    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('cashier-refresh-kpis', fetchBadges);
    };
  }, []);

  const getBadge = (path: string): { text: string; badgeColor: string } | null => {
    if (path === '/cashier/pending-reservations' && badgeCounts.pending > 0) {
      return { text: String(badgeCounts.pending), badgeColor: 'bg-status-pending text-on-primary' };
    }
    if (path === '/cashier/overdue-fines' && badgeCounts.overdue > 0) {
      return { text: String(badgeCounts.overdue), badgeColor: 'bg-status-danger text-on-primary' };
    }
    return null;
  };

  const handleLinkClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose?.();
    }
  };

  return (
    <>
      <style>{`
        .cashier-sidebar-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(155, 229, 100, 0.4) rgba(14, 46, 74, 0.4);
        }
        .cashier-sidebar-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .cashier-sidebar-scrollbar::-webkit-scrollbar-track {
          background: rgba(14, 46, 74, 0.4);
        }
        .cashier-sidebar-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(155, 229, 100, 0.4);
          border-radius: 9999px;
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
        className={`fixed left-0 top-0 h-full bg-[#123B5D] text-white shadow-xl z-50 flex flex-col justify-between overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? 'w-72 translate-x-0'
            : 'w-72 -translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        {/* Pinned Non-Scrollable Header - h-16 aligned with CashierTopBar & module page header */}
        <div
          className={`h-16 flex-shrink-0 flex items-center border-b border-white/10 bg-[#0E2E4A]/80 backdrop-blur-md z-20 ${
            isOpen ? 'px-4 gap-3' : 'justify-center px-2'
          }`}
        >
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
              className="material-symbols-outlined text-[12px] text-action-green absolute -bottom-1 -right-1 bg-[#123B5D] rounded-full p-0.5 border border-white/20 shadow-sm"
              title="Active Cashier Session"
            >
              login
            </span>
          </div>
          {isOpen && (
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="font-headline-4 text-[14px] font-bold text-white leading-tight truncate">Katipuneros</span>
              <span className="font-caption text-[10.5px] text-[#D9EEF5]/80 leading-tight truncate">Cashier Terminal • Desk 01</span>
              <span className="font-caption text-[10px] text-white/60 uppercase tracking-wider leading-tight truncate">Library Store</span>
            </div>
          )}
        </div>

        {/* Scrollable Middle Modules Navigation (only this region scrolls) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden cashier-sidebar-scrollbar py-3">
          {/* Terminal Bay Status Chip */}
          <div className={`mb-2 ${isOpen ? 'px-3' : 'flex justify-center px-2'}`}>
            {isOpen ? (
              <div className="bg-white/10 text-white px-3 py-1.5 rounded-lg flex items-center justify-between border border-white/10">
                <span className="font-caption text-[11px] font-bold tracking-wide uppercase text-white truncate">
                  Terminal Bay 01
                </span>
                <span className="w-2 h-2 rounded-full bg-action-green animate-pulse flex-shrink-0"></span>
              </div>
            ) : (
              <div
                className="w-10 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10"
                title="Terminal Bay 01: Active"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-action-green animate-pulse"></span>
              </div>
            )}
          </div>
          <nav className={`flex flex-col gap-1 ${isOpen ? 'px-3' : 'px-2 items-center'}`}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleLinkClick}
                title={!isOpen ? item.label : undefined}
                className={({ isActive }) =>
                  `group relative flex items-center rounded-xl transition-all duration-200 cursor-pointer ${
                    isOpen ? 'justify-between gap-3.5 px-3.5 py-2.5' : 'justify-center w-10 h-10 my-0.5'
                  } ${
                    isActive
                      ? 'bg-action-green text-text-primary font-bold shadow-sm'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`flex items-center ${isOpen ? 'gap-3.5 min-w-0' : 'justify-center'}`}>
                      <span
                        className={`material-symbols-outlined text-[20px] flex-shrink-0 ${
                          isActive ? 'text-text-primary' : 'text-[#D9EEF5] group-hover:text-white'
                        }`}
                      >
                        {item.icon}
                      </span>
                      {isOpen && (
                        <span className={`font-small text-small truncate ${isActive ? 'font-bold' : ''}`}>
                          {item.label}
                        </span>
                      )}
                    </div>
                    {(() => {
                      const badge = getBadge(item.path);
                      if (!badge) return null;
                      return isOpen ? (
                        <span className={`${badge.badgeColor} font-caption text-caption px-2 py-0.5 rounded-full font-bold flex-shrink-0`}>
                          {badge.text}
                        </span>
                      ) : (
                        <span className={`absolute top-1 right-2 w-2 h-2 rounded-full ${badge.badgeColor.split(' ')[0]}`} />
                      );
                    })()}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Pinned Non-Scrollable Footer */}
        <div className={`flex-shrink-0 pt-3 pb-3 border-t border-white/10 bg-[#0E2E4A]/80 backdrop-blur-md z-20 ${isOpen ? 'px-3' : 'px-2'}`}>
          <nav className="flex flex-col gap-1">
            <NavLink
              to="/cashier/profile"
              onClick={handleLinkClick}
              title={!isOpen ? 'Profile' : undefined}
              className={({ isActive }) =>
                `group flex items-center rounded-xl transition-all duration-200 cursor-pointer ${
                  isOpen ? 'gap-3.5 px-3.5 py-2.5' : 'justify-center w-10 h-10 mx-auto'
                } ${
                  isActive
                    ? 'bg-action-green text-text-primary font-bold shadow-sm'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px] text-[#D9EEF5] group-hover:text-white flex-shrink-0">
                account_circle
              </span>
              {isOpen && <span className="font-small text-small truncate">Profile</span>}
            </NavLink>
            <NavLink
              to="/"
              onClick={handleLinkClick}
              title={!isOpen ? 'Exit to Public' : undefined}
              className={`group flex items-center rounded-xl text-[#D9EEF5] hover:bg-white/10 hover:text-white transition-all duration-200 cursor-pointer ${
                isOpen ? 'gap-3.5 px-3.5 py-2.5' : 'justify-center w-10 h-10 mx-auto'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] flex-shrink-0">public</span>
              {isOpen && <span className="font-small text-small font-medium truncate">Exit to Public</span>}
            </NavLink>
            <button
              type="button"
              onClick={() => {
                logoutUser();
                window.location.href = '/login';
              }}
              title={!isOpen ? 'Logout' : undefined}
              className={`w-full group flex items-center rounded-xl text-error-container hover:bg-error-container hover:text-on-error-container transition-all duration-200 cursor-pointer text-left ${
                isOpen ? 'gap-3.5 px-3.5 py-2.5' : 'justify-center w-10 h-10 mx-auto'
              }`}
            >
              <span className="material-symbols-outlined text-[20px] group-hover:text-on-error-container text-error-container flex-shrink-0">
                logout
              </span>
              {isOpen && <span className="font-small text-small font-medium truncate">LOGOUT</span>}
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default CashierSidebar;
