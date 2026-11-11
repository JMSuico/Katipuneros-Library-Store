// [Layer: LayoutBars]
// CustomerHeader.tsx -- Customer panel top navigation header.
// Fixed header with glassmorphism, pill-shaped nav, search, notifications, avatar dropdown with PROFILE and LOGOUT,
// and a fully responsive mobile hamburger drawer (<xl screens).
// DO NOT put business logic or direct API calls here.

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { getStoredUser, fetchCurrentProfile, logoutUser, AuthUser } from '../Endpoints/authApi';
import { useNotification } from '../Hooks/useNotification';
import { NotificationDropdownCard } from '../Shared/Components/NotificationDropdownCard';
import { KatipunanLogo } from '../Shared/Components/KatipunanLogo';
import { listenCirculationNotifications } from '../Shared/Utils/notificationBus';

// Lucide-spec vector icons for zero-dependency responsive navigation
const Menu: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const X: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="18" x2="6" y1="6" y2="18" />
    <line x1="6" x2="18" y1="18" y2="6" />
  </svg>
);

const getInitials = (name?: string): string => {
  if (!name || !name.trim()) return 'US';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return parts[0].slice(0, 2).toUpperCase();
};

interface NavItem {
  label: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/customer/home' },
  { label: 'Catalog', path: '/customer/catalog' },
  { label: 'Reservations', path: '/customer/reservations' },
  { label: 'Borrowings', path: '/customer/borrowings' },
  { label: 'Favorites', path: '/customer/favorites' },
  { label: 'Settings', path: '/customer/profile' },
];

interface MobileDrawerItem {
  label: string;
  path: string;
  icon: string;
}

const CUSTOMER_DRAWER_ITEMS: MobileDrawerItem[] = [
  { label: 'Dashboard', path: '/customer', icon: 'dashboard' },
  { label: 'Catalog', path: '/customer/catalog', icon: 'menu_book' },
  { label: 'My Borrowings', path: '/customer/borrowings', icon: 'auto_stories' },
  { label: 'Reservations & Holds', path: '/customer/reservations', icon: 'bookmark' },
  { label: 'Favorites', path: '/customer/favorites', icon: 'favorite' },
  { label: 'Profile Settings', path: '/customer/profile', icon: 'manage_accounts' },
];

const CustomerHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getStoredUser());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    refresh,
  } = useNotification('Customer');

  // Close mobile drawer when route changes (state adjustment during render without cascading effects)
  const [prevLocationPath, setPrevLocationPath] = useState<string>(location.pathname);
  if (location.pathname !== prevLocationPath) {
    setPrevLocationPath(location.pathname);
    setIsMobileDrawerOpen(false);
  }

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

  useEffect(() => {
    const unsubscribe = listenCirculationNotifications((event) => {
      if (!event.recipientRoles || event.recipientRoles.includes('Customer')) {
        refresh();
      }
    });
    return () => unsubscribe();
  }, [refresh]);

  useEffect(() => {
    const syncUser = () => {
      const stored = getStoredUser();
      if (stored) setCurrentUser(stored);
      fetchCurrentProfile().then((u) => {
        if (u) setCurrentUser(u);
      });
    };

    syncUser();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsMobileDrawerOpen(false);
        setIsDropdownOpen(false);
        setIsNotifOpen(false);
      }
    };

    const handleAuthEvent = () => syncUser();

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('profile-updated', handleAuthEvent);
    window.addEventListener('katipuneros-auth-changed', handleAuthEvent);
    window.addEventListener('storage', handleAuthEvent);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('profile-updated', handleAuthEvent);
      window.removeEventListener('katipuneros-auth-changed', handleAuthEvent);
      window.removeEventListener('storage', handleAuthEvent);
    };
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/customer/catalog?q=${encodeURIComponent(q)}`);
    } else {
      navigate('/customer/catalog');
    }
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    setIsMobileDrawerOpen(false);
    logoutUser();
    navigate('/login');
  };

  const [avatarError, setAvatarError] = useState(false);
  const displayName = currentUser?.fullName || 'User Scholar';
  const initials = getInitials(displayName);

  useEffect(() => {
    setAvatarError(false);
  }, [currentUser?.profilePictureUrl]);

  const isPathActive = (itemPath: string) => {
    if (itemPath === '/customer') {
      return location.pathname === '/customer' || location.pathname === '/customer/home';
    }
    return location.pathname.startsWith(itemPath);
  };

  const renderAvatar = (sizeClass = 'w-9 h-9', textClass = 'text-xs') => {
    if (currentUser?.profilePictureUrl && !avatarError) {
      return (
        <img
          alt={displayName}
          className={`${sizeClass} rounded-full object-cover border border-action-green/30 shadow-sm`}
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
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-chip-unselected-bg backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-20 w-full px-gutter flex items-center justify-between gap-space-md">
          {/* Logo + Brand */}
          <KatipunanLogo variant="customer" />

          {/* Desktop Pill Navigation (xl:flex) */}
          <nav className="hidden xl:flex items-center gap-space-xs px-space-xs py-space-xs bg-glass-surface rounded-full shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={
                    isActive
                      ? 'px-space-md py-space-xs transition-colors bg-primary-container text-on-primary-container font-medium rounded-full shadow-sm'
                      : 'px-space-md py-space-xs text-on-surface-variant hover:text-on-surface font-small text-small transition-colors rounded-full'
                  }
                  {...(isActive ? { 'aria-current': 'page' as const } : {})}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-xs lg:max-w-sm">
            <form
              onSubmit={handleSearchSubmit}
              className="w-full flex items-center bg-surface-container-lowest/80 rounded-full px-space-md py-space-xs shadow-[0_1px_8px_rgba(0,0,0,0.02)] focus-within:ring-2 focus-within:ring-primary"
            >
              <button
                type="submit"
                className="material-symbols-outlined text-text-secondary mr-space-xs text-xl shrink-0 cursor-pointer hover:text-primary transition-colors bg-transparent border-0 p-0"
                title="Search Catalog"
                aria-label="Submit Search"
              >
                search
              </button>
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none"
                placeholder="Search books, authors, ISBN... (Ctrl+K)"
                type="text"
              />
              <span
                onClick={() => searchInputRef.current?.focus()}
                className="hidden lg:inline-block font-caption text-caption bg-surface-container-high text-text-secondary px-space-xs py-0.5 rounded ml-space-xs shrink-0 cursor-pointer"
              >
                ⌘K
              </span>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-space-sm shrink-0">
            {/* Holds & Borrowed Summary */}
            <div className="hidden sm:flex items-center gap-space-xs bg-soft-blue/60 text-text-primary font-caption text-caption px-space-md py-space-xs rounded-full shadow-[0_1px_8px_rgba(0,0,0,0.02)]">
              <span className="material-symbols-outlined text-primary text-base">bookmark</span>
              <span>Active Holds</span>
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen((prev) => !prev)}
                className="relative p-space-xs rounded-full hover:bg-surface-container-high hover:text-on-surface text-on-surface-variant transition-colors flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20"
                type="button"
                aria-label="View notifications"
                aria-expanded={isNotifOpen}
              >
                <span className="material-symbols-outlined text-text-primary">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 bg-primary text-on-primary font-caption text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <NotificationDropdownCard
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={markAsRead}
                onMarkAllAsRead={markAllAsRead}
                onClearAll={clearAll}
                panelLabel="Patron Notifications"
                viewAllRoute="/customer/reservations"
              />
            </div>

            {/* Profile & Avatar Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-space-xs pl-space-xs cursor-pointer rounded-full hover:bg-surface-container-high hover:text-on-surface p-space-xs transition-colors border border-transparent focus:border-primary/30"
                type="button"
                aria-expanded={isDropdownOpen}
                aria-label="User profile dropdown"
              >
                {renderAvatar('w-9 h-9', 'text-xs')}
                <span className="hidden lg:inline-block font-small text-small text-text-primary font-medium truncate max-w-[120px]">
                  {displayName}
                </span>
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
                  {/* User Summary Header */}
                  <div className="px-4 py-3 border-b border-surface-container-high flex items-center gap-3">
                    {renderAvatar('w-10 h-10', 'text-sm')}
                    <div className="flex flex-col min-w-0">
                      <span className="font-small text-small font-bold text-text-primary truncate">
                        {displayName}
                      </span>
                      <span className="font-caption text-[11px] text-text-secondary truncate">
                        {currentUser?.email || 'user@katipuneros.edu.ph'}
                      </span>
                      <span className="font-caption text-[10px] text-primary font-mono mt-0.5">
                        {currentUser?.libraryCardNumber || 'KP-LIB-VERIFIED'}
                      </span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-1 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate('/customer/profile');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-small font-body-medium text-text-primary hover:bg-secondary-container/60 hover:text-primary transition-colors cursor-pointer text-left"
                    >
                      <span className="material-symbols-outlined text-primary text-[20px]">person</span>
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

            {/* Mobile Navigation Drawer Hamburger Toggle (Visible on <xl screens) */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
              className="xl:hidden flex items-center justify-center w-10 h-10 rounded-full text-text-primary hover:text-primary hover:bg-surface-container-high active:bg-surface-container transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              aria-label={isMobileDrawerOpen ? "Close customer navigation menu" : "Open customer navigation menu"}
              aria-expanded={isMobileDrawerOpen}
            >
              {isMobileDrawerOpen ? (
                <X className="w-6 h-6 text-[#8B0000]" />
              ) : (
                <Menu className="w-6 h-6 text-text-primary" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer Backdrop & Sheet (<xl screens) */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 xl:hidden ${
          isMobileDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileDrawerOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-sm bg-white/95 backdrop-blur-2xl border-l border-stone-200/80 shadow-2xl flex flex-col justify-between p-6 transition-transform duration-300 ease-out xl:hidden ${
          isMobileDrawerOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
        }`}
        aria-label="Customer mobile navigation drawer"
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer Top Section */}
        <div className="space-y-4">
          {/* Header with Logo + Close Button */}
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <KatipunanLogo variant="customer" />
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-stone-700" />
            </button>
          </div>

          {/* Patron Profile Summary Card */}
          <div className="flex items-center gap-3 p-3 bg-surface-container-low rounded-2xl border border-outline-variant/30">
            {renderAvatar('w-11 h-11', 'text-sm')}
            <div className="flex flex-col min-w-0">
              <span className="font-small text-small font-bold text-text-primary truncate">
                {displayName}
              </span>
              <span className="font-caption text-[11px] text-text-secondary truncate">
                {currentUser?.email || 'user@katipuneros.edu.ph'}
              </span>
              <span className="font-caption text-[10px] text-primary font-mono mt-0.5 font-semibold">
                {currentUser?.libraryCardNumber || 'KP-LIB-VERIFIED'}
              </span>
            </div>
          </div>

          {/* Mobile Quick Search Form (useful on mobile <md where topbar search is hidden) */}
          <form
            onSubmit={(e) => {
              handleSearchSubmit(e);
              setIsMobileDrawerOpen(false);
            }}
            className="flex items-center bg-surface-container-lowest rounded-full px-3.5 py-2 border border-outline-variant/30 shadow-sm focus-within:ring-2 focus-within:ring-primary"
          >
            <button
              type="submit"
              className="material-symbols-outlined text-text-secondary mr-2 text-xl cursor-pointer hover:text-primary transition-colors bg-transparent border-0 p-0"
              aria-label="Submit Search"
            >
              search
            </button>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none"
              placeholder="Search catalog... (title, author)"
              type="text"
            />
          </form>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-1 overflow-y-auto max-h-[45vh]" aria-label="Customer drawer links">
            {CUSTOMER_DRAWER_ITEMS.map((item) => {
              const isActive = isPathActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-2.5 rounded-2xl font-body-medium text-sm transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100 active:bg-stone-200'
                  }`}
                  {...(isActive ? { 'aria-current': 'page' as const } : {})}
                >
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-primary' : 'text-[#8B0000]'}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {isActive ? (
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  ) : (
                    <span className="material-symbols-outlined text-[16px] text-stone-400">chevron_right</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Drawer Bottom Section: Profile Settings & Logout */}
        <div className="pt-4 border-t border-stone-200/80 space-y-2">
          <Link
            to="/customer/profile"
            onClick={() => setIsMobileDrawerOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-body-medium text-text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-primary text-[20px]">manage_accounts</span>
            <span className="font-semibold">Manage Profile Settings</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-status-danger bg-status-danger/10 hover:bg-status-danger/20 transition-colors cursor-pointer border border-status-danger/20"
          >
            <span className="material-symbols-outlined text-status-danger text-[20px]">logout</span>
            <span>Logout from Portal</span>
          </button>

          <div className="flex items-center justify-between text-[10px] text-stone-500 px-1 pt-1">
            <span>Katipuneros Patron Portal</span>
            <span className="font-mono text-[#B8860B] font-semibold">v2.0-STABLE</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default CustomerHeader;
