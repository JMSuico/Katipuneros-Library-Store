// [Layer: LayoutBars]
// CustomerHeader.tsx -- Customer panel top navigation header.
// Fixed header with glassmorphism, pill-shaped nav, search, notifications, and avatar dropdown with PROFILE and LOGOUT.
// DO NOT put business logic or direct API calls here.

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { getStoredUser, fetchCurrentProfile, logoutUser, AuthUser } from '../Endpoints/authApi';
import { useNotification } from '../Hooks/useNotification';
import { NotificationDropdownCard } from '../Shared/Components/NotificationDropdownCard';

const LOGO_URL = 'https://lh3.googleusercontent.com/aida/AEtjO1ULKR2-At3mMWWJpVDPDjA9IJakzSkbSa5XSRuHMRp9FP_z4wgxPquvURNmIn7pBo3qDybcHoJ0p3aqPmqigbmTF6L8uMiO50Pn_nfngEvaB2NjtIdS-AF002Kn2J_crIGUvNLPtaqOw0hjLWWotFcCcF92I98d8Wdb2_hqAxLH6KeWVXAQwnwge43KAC_-90WpmcqP7BNWnSvNgOgU-gywUu5UvIZ3bWseH7DSvWX4pWq1MmSHAz_pUe4';

const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida/AEtjO1W-XmIunATvylcU6ZudrKG8B-mfq1yQQXyix8riDqwGsJnlxJCYiVDojqTon9vqRL7z8Ad5T_3ZtWukWO4SvHRgVsEoJhRTFRMfqoAFpjAge5_T4DgBP3Omz30PxQewMXcRRLUotFunX8pgenSaLE2I3uwjc2NliBlKaLmQjI2xKSwgLHM09oPggG5JwcO4RGHtUPm8rBuc97yjVx5rv1h5Avg0NuREUvT19ldKFdd8L99REO-e0i6Bkg';

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

const CustomerHeader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getStoredUser());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  } = useNotification('Customer');

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
    logoutUser();
    navigate('/login');
  };

  const avatarSrc = currentUser?.profilePictureUrl || DEFAULT_AVATAR;
  const displayName = currentUser?.fullName || 'User Scholar';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-chip-unselected-bg backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="h-20 w-full px-gutter flex items-center justify-between gap-space-md">
        {/* Logo + Brand */}
        <div className="flex items-center gap-space-sm shrink-0">
          <img alt="Katipuneros logo" className="h-8 w-auto object-contain" src={LOGO_URL} />
          <div className="flex flex-col">
            <span className="font-headline-4 text-headline-4 text-text-primary leading-tight">Katipuneros</span>
            <span className="font-caption text-caption text-text-secondary">Academic &amp; Digital Stacks</span>
          </div>
        </div>

        {/* Pill Navigation */}
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
              <img
                alt={displayName}
                className="w-9 h-9 rounded-full object-cover border border-action-green/30 shadow-sm"
                src={avatarSrc}
              />
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
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
