// [Layer: LayoutBars]
// CashierTopBar.tsx -- Fixed top bar for the Cashier panel.
// Renders station indicator, global search input, shift indicator, alerts, and cashier avatar dropdown with PROFILE and LOGOUT.
// DO NOT put business logic or API calls here.

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser, fetchCurrentProfile, logoutUser, AuthUser } from '../Endpoints/authApi';

const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida/AEtjO1W-XmIunATvylcU6ZudrKG8B-mfq1yQQXyix8riDqwGsJnlxJCYiVDojqTon9vqRL7z8Ad5T_3ZtWukWO4SvHRgVsEoJhRTFRMfqoAFpjAge5_T4DgBP3Omz30PxQewMXcRRLUotFunX8pgenSaLE2I3uwjc2NliBlKaLmQjI2xKSwgLHM09oPggG5JwcO4RGHtUPm8rBuc97yjVx5rv1h5Avg0NuREUvT19ldKFdd8L99REO-e0i6Bkg';

const CashierTopBar: React.FC = () => {
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
    navigate('/login');
  };

  const avatarSrc = currentUser?.profilePictureUrl || DEFAULT_AVATAR;
  const displayName = currentUser?.fullName || 'Elena Vance';

  return (
    <header className="fixed top-0 left-72 right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-lg gap-space-md">
      <div className="flex items-center gap-space-md flex-1">
        <button
          aria-label="Toggle Navigation Menu"
          className="p-space-xs rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
          type="button"
        >
          <span className="material-symbols-outlined">menu</span>
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
              className="w-full pl-9 pr-4 py-2 bg-surface-container-highest/60 focus:bg-surface-container-lowest text-on-surface placeholder:text-text-secondary font-small text-small rounded-full outline-none transition-colors"
              placeholder="Scan barcode, ISBN, Customer ID, or Hold Code (Press ⌘K)..."
              type="text"
            />
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
          <span>Head Desk</span>
        </div>
        <button
          aria-label="View alerts"
          className="relative p-space-xs rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-status-danger"></span>
        </button>

        {/* Cashier Profile Pill with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-space-sm pl-space-xs p-1.5 rounded-full hover:bg-surface-container transition-colors cursor-pointer border border-transparent focus:border-action-green/40"
            type="button"
            aria-expanded={isDropdownOpen}
            aria-label="Cashier profile menu"
          >
            <img
              alt={displayName}
              className="w-9 h-9 rounded-full object-cover border border-action-green/40 shadow-sm"
              src={avatarSrc}
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-small text-small font-bold text-on-surface leading-tight truncate max-w-[120px]">
                {displayName}
              </span>
              <span className="font-caption text-caption text-text-secondary leading-none">
                Cashier Desk #1
              </span>
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
            <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl py-2 z-50 animate-scale-up">
              {/* Summary Header */}
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
                    {currentUser?.email || 'cashier@katipuneros.edu.ph'}
                  </span>
                  <span className="font-caption text-[10px] text-action-green font-mono font-bold">
                    CASHIER DESK • ACTIVE
                  </span>
                </div>
              </div>

              {/* Actions */}
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
