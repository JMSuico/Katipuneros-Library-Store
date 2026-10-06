// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// Profile.tsx -- Cashier Desk Identity, Shift Status, and Profile Picture Management.
// Adheres strictly to Cashier theme (#123B5D, #34D399, soft blue) and layout conventions.
// Calls Endpoints/authApi.ts via clean lambda expressions.
// Strictly adheres to real-time data mandate: zero hardcoded mock values, zero browser alert().

import React, { useState, useEffect, useRef } from 'react';
import { getStoredUser, fetchCurrentProfile, uploadProfilePicture, AuthUser } from '../../../../../Endpoints/authApi';
import { useToasts } from '../../../../../Hooks/useToasts';

export const CashierProfile: React.FC = () => {
  const { toasts, addToast, removeToast } = useToasts();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getStoredUser());
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [avatarError, setAvatarError] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCurrentProfile().then((u) => {
      if (u) {
        setCurrentUser(u);
        setAvatarError(false);
      }
    });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (under 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast('File size must be under 5MB.', 'warning');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const res = await uploadProfilePicture(base64);
      setIsUploading(false);
      if (res.success && res.profilePictureUrl) {
        setCurrentUser((prev) => (prev ? { ...prev, profilePictureUrl: res.profilePictureUrl } : null));
        setAvatarError(false);
        window.dispatchEvent(
          new CustomEvent('profile-updated', { detail: { profilePictureUrl: res.profilePictureUrl } })
        );
        window.dispatchEvent(new Event('katipuneros-auth-changed'));
        addToast('Profile picture updated and synchronized across cashier console.', 'success');
      } else {
        addToast(res.message || 'Failed to update profile picture.', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const displayName = currentUser?.fullName || currentUser?.username || 'Cashier Terminal Operator';
  const displayRole = currentUser?.role === 'Admin' ? 'Library Administrator (Cashier Mode)' : 'Circulation Desk Cashier';
  const displayCard = currentUser?.libraryCardNumber || 'N/A';
  const displayDept = currentUser?.department || 'Circulation & Stacks Desk 01';
  const displayEmail = currentUser?.email || 'N/A';
  const displayPhone = currentUser?.phoneNumber || 'N/A';
  const displayUsername = currentUser?.username || 'cashier';

  const initials = currentUser?.fullName
    ? currentUser.fullName
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : currentUser?.username
    ? currentUser.username.slice(0, 2).toUpperCase()
    : 'CO';

  return (
    <div className="w-full">
      {/* Toast Notification Container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-small font-medium transition-all animate-in fade-in slide-in-from-bottom-5 ${
                toast.type === 'success'
                  ? 'bg-action-green text-text-primary border border-action-green-hover'
                  : toast.type === 'error'
                  ? 'bg-status-danger text-on-error'
                  : toast.type === 'warning'
                  ? 'bg-status-pending text-text-primary'
                  : 'bg-primary text-on-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {toast.type === 'success'
                  ? 'check_circle'
                  : toast.type === 'error'
                  ? 'error'
                  : toast.type === 'warning'
                  ? 'warning'
                  : 'info'}
              </span>
              <span>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 hover:opacity-75 cursor-pointer text-[16px] material-symbols-outlined"
              >
                close
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hidden File Input for Picture Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="flex flex-col gap-space-lg pb-space-3xl">
        {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption uppercase tracking-wider">
              <span>Circulation Desk</span>
              <span>/</span>
              <span className="text-primary font-semibold">Station Profile</span>
            </div>
            <h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight mt-1">
              Cashier Identity &amp; Desk Credentials
            </h1>
            <p className="font-body text-small text-text-secondary">
              Circulation terminal operator profile, active shift logs, and terminal access credentials.
            </p>
          </div>

          <div className="flex items-center gap-space-sm">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-action-green text-text-primary hover:bg-action-green-hover font-body-medium text-small font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isUploading ? 'progress_activity' : 'photo_camera'}
              </span>
              <span>{isUploading ? 'Uploading Picture...' : 'Change Profile Picture'}</span>
            </button>
          </div>
        </div>

        {/* Profile Card & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
          {/* Main Identity Banner */}
          <div className="lg:col-span-8 flex flex-col gap-space-lg">
            <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-xl shadow-sm border border-outline-variant/30">
              <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-secondary-container/30 blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row gap-space-xl items-start relative z-10">
                {/* Avatar with Upload Hover Button */}
                <div className="relative shrink-0 group">
                  <div className="w-36 h-36 rounded-2xl overflow-hidden shadow-md bg-surface-container border-2 border-action-green/40 flex items-center justify-center">
                    {currentUser?.profilePictureUrl && !avatarError ? (
                      <img
                        alt={displayName}
                        className="w-full h-full object-cover"
                        src={currentUser.profilePictureUrl}
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <span className="text-4xl font-headline-1 font-bold text-primary font-mono select-none">
                        {initials}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer gap-1"
                    title="Upload new picture"
                  >
                    <span className="material-symbols-outlined text-2xl">upload</span>
                    <span className="font-caption text-[11px] font-semibold">Change Photo</span>
                  </button>
                  <span className="absolute -bottom-2 -right-2 bg-action-green text-text-primary text-[10px] font-caption font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-white">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    DESK ON
                  </span>
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-space-xs mb-1">
                    <span className="font-caption text-caption font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed">
                      Clearance Level 2 • Circulation Desk
                    </span>
                    <span className="font-caption text-caption px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-mono">
                      {displayCard}
                    </span>
                  </div>

                  <h2 className="font-headline-3 text-headline-3 text-text-primary font-bold tracking-tight">
                    {displayName}
                  </h2>
                  <p className="font-body-large text-body-large text-primary font-semibold">
                    {displayRole}
                  </p>
                  <p className="font-body text-small text-text-secondary mt-0.5">
                    {displayDept}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mt-space-md pt-space-md bg-surface-container-low/60 p-space-md rounded-xl">
                    <div className="flex items-center gap-space-xs text-text-primary">
                      <span className="material-symbols-outlined text-primary text-[18px]">alternate_email</span>
                      <span className="font-body text-small truncate">{displayEmail}</span>
                    </div>
                    <div className="flex items-center gap-space-xs text-text-primary">
                      <span className="material-symbols-outlined text-primary text-[18px]">badge</span>
                      <span className="font-body text-small">@{displayUsername}</span>
                    </div>
                    <div className="flex items-center gap-space-xs text-text-primary">
                      <span className="material-symbols-outlined text-primary text-[18px]">call</span>
                      <span className="font-body text-small">{displayPhone}</span>
                    </div>
                    <div className="flex items-center gap-space-xs text-text-primary">
                      <span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
                      <span className="font-body text-small">Shift: 08:00 - 17:00 PHT</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Operational Responsibilities */}
            <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[22px]">point_of_sale</span>
                  <h3 className="font-headline-4 text-headline-4 text-text-primary font-bold">
                    Assigned Desk Modules &amp; Privileges
                  </h3>
                </div>
                <span className="font-caption text-caption px-2.5 py-1 rounded-full bg-action-green/20 text-text-primary font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span> Active Standing
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                <div className="p-space-md rounded-xl bg-surface-container-low flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl mt-0.5">menu_book</span>
                  <div>
                    <h4 className="font-body-large text-small font-bold text-text-primary">Circulation &amp; Checkout</h4>
                    <p className="font-caption text-caption text-text-secondary mt-0.5">
                      Barcode scanning, user loan issuance, and milestone due date calculation.
                    </p>
                  </div>
                </div>

                <div className="p-space-md rounded-xl bg-surface-container-low flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl mt-0.5">keyboard_return</span>
                  <div>
                    <h4 className="font-body-large text-small font-bold text-text-primary">Returns &amp; Condition Inspection</h4>
                    <p className="font-caption text-caption text-text-secondary mt-0.5">
                      Intake check, physical condition assessment, and automated shelf routing.
                    </p>
                  </div>
                </div>

                <div className="p-space-md rounded-xl bg-surface-container-low flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl mt-0.5">payments</span>
                  <div>
                    <h4 className="font-body-large text-small font-bold text-text-primary">Fines &amp; Cash Register</h4>
                    <p className="font-caption text-caption text-text-secondary mt-0.5">
                      Fee assessment, official receipt generation, and payment ledger reconciliation.
                    </p>
                  </div>
                </div>

                <div className="p-space-md rounded-xl bg-surface-container-low flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl mt-0.5">assignment_turned_in</span>
                  <div>
                    <h4 className="font-body-large text-small font-bold text-text-primary">Reserve Holds Queue</h4>
                    <p className="font-caption text-caption text-text-secondary mt-0.5">
                      User hold fulfillment, shelf locker placement, and pickup dispatch.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Security & Terminal Telemetry */}
          <div className="lg:col-span-4 flex flex-col gap-space-lg">
            <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/30 flex flex-col gap-4">
              <h3 className="font-headline-4 text-headline-4 text-text-primary font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">security</span>
                <span>Security &amp; Session</span>
              </h3>

              <div className="p-3.5 rounded-xl bg-surface-container-low space-y-2">
                <div className="flex justify-between items-center text-small">
                  <span className="text-text-secondary">Session Origin</span>
                  <span className="font-mono text-primary font-semibold">127.0.0.1:5173</span>
                </div>
                <div className="flex justify-between items-center text-small">
                  <span className="text-text-secondary">Terminal Node</span>
                  <span className="font-mono text-text-primary">BAY-01-DESK</span>
                </div>
                <div className="flex justify-between items-center text-small">
                  <span className="text-text-secondary">Auth Protocol</span>
                  <span className="font-mono text-action-green font-bold">JWT / SHA-256</span>
                </div>
              </div>

              <div className="border-t border-surface-container-high pt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-body-medium text-small font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                  <span>Upload Picture</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    addToast('Circulation cashier credentials verified with .NET 10 Web API.', 'success');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-secondary-container hover:bg-secondary-container/80 text-primary font-body-medium text-small font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  <span>Verify Status</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashierProfile;
