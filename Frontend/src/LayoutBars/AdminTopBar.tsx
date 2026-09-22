// [Layer: LayoutBars]
// AdminTopBar.tsx -- Fixed top bar for the Admin panel.
// Renders breadcrumbs, global search, notification alerts, dynamic avatar and Administrator profile menu.
// DO NOT put business logic or API calls here.

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser, fetchCurrentProfile, logoutUser, AuthUser } from '../Endpoints/authApi';

const DEFAULT_ADMIN_AVATAR = 'https://lh3.googleusercontent.com/aida/AEtjO1WAm680ewfRvusuK9JsOkwTwjiqbB7NGKnOPdZV6yddZxRRfxPtJ1zZaaQw4yemCAdrWsijXuvh6gfPEQxLgiEwI5dfikGPX5r-lcbU6y8Vqtuxt7VeJ8tlXzN2qpBwwyivnj9DaiDzPoYbB72wtjkq1IEe46Azv0y0lzaHKc34XUiKk9_iF6mWTKH_QMvSmtEidh96_0ART1sQb7Yrl1NlbsHQ0PN1tSCPQAdpGFuv5t1Jz5c0JQ4zBQ';

const AdminTopBar: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getStoredUser());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCurrentProfile().then((u) => {
      if (u) setCurrentUser(u);
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logoutUser();
    navigate('/admin/login');
  };

  const avatarSrc = currentUser?.profilePictureUrl || DEFAULT_ADMIN_AVATAR;
  const displayName = currentUser?.fullName || 'Chief Administrator';

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-lg">
      <div className="flex items-center gap-space-md">
        <button
          className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
          title="Toggle Sidebar"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">menu_open</span>
        </button>
        <nav className="hidden sm:flex items-center gap-space-xs text-caption font-caption text-text-secondary">
          <span className="hover:text-text-primary cursor-pointer transition-colors">Admin</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-semibold">Console</span>
        </nav>
      </div>

      <div className="flex items-center gap-space-lg">
        <div className="relative hidden md:block w-72 lg:w-96">
          <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">
            search
          </span>
          <input
            className="w-full bg-surface-container-low pl-10 pr-space-md py-2 rounded-full font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Search users, books, reservations..."
            type="text"
          />
        </div>
        <button
          className="relative p-2 text-text-secondary hover:bg-surface-container hover:text-on-surface rounded-full transition-colors cursor-pointer"
          type="button"
          aria-label="View notifications"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-on-primary font-caption text-[10px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* Admin Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-space-sm pl-space-sm bg-surface-container-low hover:bg-surface-container py-1 px-space-sm rounded-full transition-colors cursor-pointer border border-transparent focus:border-primary/40"
            type="button"
            aria-expanded={isDropdownOpen}
            aria-label="Admin account menu"
          >
            <img
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover border border-action-green/40 shadow-sm"
              src={avatarSrc}
            />
            <div className="hidden lg:flex flex-col pr-space-xs text-left">
              <span className="font-small text-small font-semibold text-text-primary leading-tight truncate max-w-[130px]">
                {displayName}
              </span>
              <span className="font-caption text-caption text-text-secondary leading-none">Super Admin</span>
            </div>
            <span
              className={`material-symbols-outlined text-text-secondary text-base transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180 text-primary' : ''
              }`}
            >
              arrow_drop_down
            </span>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl py-2 z-50 animate-scale-up">
              <div className="px-4 py-3 border-b border-surface-container-high flex items-center gap-3">
                <img
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover border border-action-green/40 shadow-sm"
                  src={avatarSrc}
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-small text-small font-bold text-text-primary truncate">
                    {displayName}
                  </span>
                  <span className="font-caption text-[11px] text-text-secondary truncate">
                    {currentUser?.email || 'admin@katipuneros.edu.ph'}
                  </span>
                  <span className="font-caption text-[10px] text-primary font-mono font-bold">
                    HQ ROOT • LEVEL 4
                  </span>
                </div>
              </div>

              <div className="p-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/admin/profile');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-small font-body-medium text-text-primary hover:bg-secondary-container/60 hover:text-primary transition-colors cursor-pointer text-left"
                >
                  <span className="material-symbols-outlined text-primary text-[20px]">account_circle</span>
                  <span className="font-semibold">PROFILE</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-small font-body-medium text-status-danger hover:bg-status-danger/10 transition-colors cursor-pointer text-left"
                >
                  <span className="material-symbols-outlined text-status-danger text-[20px]">logout</span>
                  <span className="font-semibold">LOGOUT</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminTopBar;
