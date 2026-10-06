// [Layer: LayoutBars]
// CashierTopBar.tsx -- Fixed top bar for the Cashier panel.
// Renders station indicator, debounced global search input, shift indicator, alerts, and cashier avatar dropdown with PROFILE and LOGOUT.
// Supports responsive sidebar toggling and dynamic left offset.
// DO NOT put business logic or API calls here.

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser, fetchCurrentProfile, logoutUser, AuthUser } from '../Endpoints/authApi';
import { useDebounce } from '../Hooks/useDebounce';

export interface CashierTopBarProps {
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const getInitials = (name?: string): string => {
  if (!name || !name.trim()) return 'CS';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
};

const CashierTopBar: React.FC<CashierTopBarProps> = ({
  sidebarOpen = true,
  onToggleSidebar,
}) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getStoredUser());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [searchVal, setSearchVal] = useState('');
  const debouncedSearch = useDebounce(searchVal, 350);

  useEffect(() => {
    if (debouncedSearch.trim()) {
      console.log('[CashierTopBar] Scan / search query:', debouncedSearch);
    }
  }, [debouncedSearch]);

  const syncUser = () => {
    const stored = getStoredUser();
    if (stored) {
      setCurrentUser(stored);
      setAvatarError(false);
    }
    fetchCurrentProfile().then((u) => {
      if (u) {
        setCurrentUser(u);
        setAvatarError(false);
      }
    });
  };

  useEffect(() => {
    syncUser();

    const handleAuthChange = () => syncUser();
    const handleProfileUpdate = () => syncUser();

    window.addEventListener('katipuneros-auth-changed', handleAuthChange);
    window.addEventListener('profile-updated', handleProfileUpdate);
    window.addEventListener('storage', handleAuthChange);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('katipuneros-auth-changed', handleAuthChange);
      window.removeEventListener('profile-updated', handleProfileUpdate);
      window.removeEventListener('storage', handleAuthChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logoutUser();
    navigate('/login');
  };

  const displayName = currentUser?.fullName || 'Cashier Desk';
  const displayEmail = currentUser?.email || 'cashier@katipuneros.edu.ph';
  const initials = getInitials(displayName);

  const renderAvatar = (sizeClass = 'w-8 h-8', textClass = 'text-xs') => {
    if (currentUser?.profilePictureUrl && !avatarError) {
      return (
        <img
          alt={displayName}
          className={`${sizeClass} rounded-full object-cover border border-action-green/40 shadow-sm`}
          src={currentUser.profilePictureUrl}
          onError={() => setAvatarError(true)}
        />
      );
    }
    return (
      <div
        className={`${sizeClass} rounded-full bg-gradient-to-tr from-primary to-accent text-on-primary font-bold flex items-center justify-center border border-white/20 shadow-sm ${textClass}`}
      >
        {initials}
      </div>
    );
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-lg gap-space-md transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'left-0 lg:left-72' : 'left-0 lg:left-20'
      }`}
    >
      <div className="flex items-center gap-space-md flex-1">
        <button
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          className="p-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined">
            {sidebarOpen ? 'menu_open' : 'menu'}
          </span>
        </button>
        <div className="hidden xl:flex items-center gap-space-xs text-text-secondary font-caption text-caption">
          <span className="font-medium">Station:</span>
          <span className="inline-flex items-center gap-1 bg-soft-blue text-primary font-bold px-space-sm py-0.5 rounded-full">
            Front Desk Bay 01 • Live Sync
          </span>
        </div>
        <div className="flex-1 max-w-xl">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-text-secondary text-lg">search</span>
            <input
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-container-highest/60 focus:bg-surface-container-lowest text-on-surface placeholder:text-text-secondary font-small text-small rounded-full outline-none transition-colors"
              placeholder="Scan barcode, ISBN, Customer ID, or Hold Code (Press ⌘K)..."
              type="text"
            />
            {searchVal && (
              <button
                type="button"
                onClick={() => setSearchVal('')}
                className="absolute right-3 text-text-secondary hover:text-text-primary"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-space-md">
        <div className="hidden 2xl:flex items-center gap-space-xs font-caption text-caption text-text-secondary bg-surface-container px-space-sm py-1 rounded-full">
          <span className="material-symbols-outlined text-base">schedule</span>
          <span>Shift Active • Circulation Terminal</span>
        </div>
        <div className="hidden lg:inline-flex items-center gap-1.5 bg-action-green text-text-primary px-space-sm py-1 rounded-full font-caption text-caption font-bold">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          <span>Online</span>
        </div>
        <button
          onClick={() => navigate('/cashier/notifications')}
          className="relative p-2 text-text-secondary hover:bg-surface-container hover:text-on-surface rounded-full transition-colors cursor-pointer"
          type="button"
          aria-label="View cashier notifications"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
        </button>

        {/* Cashier Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-space-sm pl-space-sm bg-surface-container-low hover:bg-surface-container py-1 px-space-sm rounded-full transition-colors cursor-pointer border border-transparent focus:border-primary/40"
            type="button"
            aria-expanded={isDropdownOpen}
            aria-label="Cashier account menu"
          >
            {renderAvatar('w-8 h-8', 'text-xs')}
            <div className="hidden lg:flex flex-col pr-space-xs text-left">
              <span className="font-small text-small font-semibold text-text-primary leading-tight truncate max-w-[130px]">
                {displayName}
              </span>
              <span className="font-caption text-caption text-text-secondary leading-none">Desk 01 • Staff</span>
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
                {renderAvatar('w-10 h-10', 'text-sm')}
                <div className="flex flex-col min-w-0">
                  <span className="font-small text-small font-bold text-text-primary truncate">
                    {displayName}
                  </span>
                  <span className="font-caption text-[11px] text-text-secondary truncate">
                    {displayEmail}
                  </span>
                  <span className="font-caption text-[10px] text-primary font-mono font-bold">
                    CIRCULATION BAY 01
                  </span>
                </div>
              </div>

              <div className="p-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/cashier/profile');
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

export default CashierTopBar;
