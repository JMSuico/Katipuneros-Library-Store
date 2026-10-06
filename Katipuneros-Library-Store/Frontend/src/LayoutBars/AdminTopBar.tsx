// [Layer: LayoutBars]
// AdminTopBar.tsx -- Fixed top bar for the Admin panel.
// Renders breadcrumbs, global debounced standby search, notification alerts, dynamic avatar and Administrator profile menu.
// Handles sidebar toggle interaction.
// DO NOT put business logic or API calls here.

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser, fetchCurrentProfile, logoutUser, AuthUser } from '../Endpoints/authApi';
import { useDebounce } from '../Hooks/useDebounce';
import { SearchBar } from '../Shared/SearchBar';

const DEFAULT_ADMIN_AVATAR = 'https://lh3.googleusercontent.com/aida/AEtjO1WAm680ewfRvusuK9JsOkwTwjiqbB7NGKnOPdZV6yddZxRRfxPtJ1zZaaQw4yemCAdrWsijXuvh6gfPEQxLgiEwI5dfikGPX5r-lcbU6y8Vqtuxt7VeJ8tlXzN2qpBwwyivnj9DaiDzPoYbB72wtjkq1IEe46Azv0y0lzaHKc34XUiKk9_iF6mWTKH_QMvSmtEidh96_0ART1sQb7Yrl1NlbsHQ0PN1tSCPQAdpGFuv5t1Jz5c0JQ4zBQ';

export interface AdminTopBarProps {
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const AdminTopBar: React.FC<AdminTopBarProps> = ({
  sidebarOpen = true,
  onToggleSidebar,
}) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getStoredUser());
  const [avatarError, setAvatarError] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Standby header search input with debouncing
  const [headerSearch, setHeaderSearch] = useState('');
  const debouncedHeaderSearch = useDebounce(headerSearch, 400);

  useEffect(() => {
    if (debouncedHeaderSearch.trim()) {
      // Standby dispatch or search event
      console.log('[AdminTopBar] Standby global search query:', debouncedHeaderSearch);
    }
  }, [debouncedHeaderSearch]);

  useEffect(() => {
    fetchCurrentProfile().then((u) => {
      if (u) setCurrentUser(u);
    });

    const handleAuthChange = (e?: Event) => {
      const customEvent = e as CustomEvent<AuthUser>;
      if (customEvent?.detail) {
        setCurrentUser(customEvent.detail);
      } else {
        setCurrentUser(getStoredUser());
      }
      setAvatarError(false);
    };

    window.addEventListener('katipuneros-auth-changed', handleAuthChange);
    window.addEventListener('profile-updated', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('katipuneros-auth-changed', handleAuthChange);
      window.removeEventListener('profile-updated', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Reset error flag if user profilePictureUrl changes
  useEffect(() => {
    setAvatarError(false);
  }, [currentUser?.profilePictureUrl]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logoutUser();
    navigate('/admin/login');
  };

  const displayName = currentUser?.fullName || currentUser?.username || 'JM Suico';

  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'JM';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const userInitials = getInitials(displayName);

  const renderAvatar = (sizeClass: string, textClass: string) => {
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
        className={`${sizeClass} rounded-full bg-gradient-to-br from-primary to-action-green text-on-primary flex items-center justify-center font-bold ${textClass} border border-action-green/40 shadow-sm select-none shrink-0`}
        aria-label={displayName}
      >
        {userInitials}
      </div>
    );
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-lg transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'left-0 lg:left-64' : 'left-0 lg:left-20'
      }`}
    >
      <div className="flex items-center gap-space-md">
        <button
          onClick={onToggleSidebar}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
          title={sidebarOpen ? 'Collapse Navigation' : 'Expand Navigation'}
          type="button"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <span className="material-symbols-outlined text-[20px]">
            {sidebarOpen ? 'menu_open' : 'menu'}
          </span>
        </button>
        <nav className="hidden sm:flex items-center gap-space-xs text-caption font-caption text-text-secondary">
          <span className="hover:text-text-primary cursor-pointer transition-colors">Admin</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-semibold">Console</span>
        </nav>
      </div>

      <div className="flex items-center gap-space-lg">
        <div className="hidden md:block w-72 lg:w-96">
          <SearchBar
            value={headerSearch}
            onChange={(val) => setHeaderSearch(val)}
            placeholder="Search users, books, reservations..."
            shortcutKey="⌘K"
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
            {renderAvatar('w-8 h-8', 'text-caption')}
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
                {renderAvatar('w-10 h-10', 'text-body-medium')}
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
