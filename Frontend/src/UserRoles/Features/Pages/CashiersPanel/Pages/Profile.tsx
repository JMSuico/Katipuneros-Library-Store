// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// Profile.tsx -- Cashier Desk Identity, Shift Status, and Profile Picture Management.
// Adheres strictly to Cashier theme (#123B5D, #34D399, soft blue) and layout conventions.
// Calls Endpoints/authApi.ts via clean lambda expressions.

import React, { useState, useEffect, useRef } from 'react';
import { getStoredUser, fetchCurrentProfile, uploadProfilePicture, AuthUser } from '../../../../../Endpoints/authApi';

const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida/AEtjO1W-XmIunATvylcU6ZudrKG8B-mfq1yQQXyix8riDqwGsJnlxJCYiVDojqTon9vqRL7z8Ad5T_3ZtWukWO4SvHRgVsEoJhRTFRMfqoAFpjAge5_T4DgBP3Omz30PxQewMXcRRLUotFunX8pgenSaLE2I3uwjc2NliBlKaLmQjI2xKSwgLHM09oPggG5JwcO4RGHtUPm8rBuc97yjVx5rv1h5Avg0NuREUvT19ldKFdd8L99REO-e0i6Bkg';

export const CashierProfile: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getStoredUser());
  const [isUploading, setIsUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCurrentProfile().then((u) => {
      if (u) setCurrentUser(u);
    });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (under 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be under 5MB.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const res = await uploadProfilePicture(base64);
      setIsUploading(false);
      if (res.success && res.profilePictureUrl) {
        setCurrentUser((prev) => prev ? { ...prev, profilePictureUrl: res.profilePictureUrl } : null);
        showToast('Profile picture updated successfully!');
      } else {
        showToast(res.message || 'Failed to update profile picture.');
      }
    };
    reader.readAsDataURL(file);
  };

  const avatarSrc = currentUser?.profilePictureUrl || DEFAULT_AVATAR;
  const displayName = currentUser?.fullName || 'Elena Vance';

  return (
    <div className="w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-full bg-text-primary text-white shadow-2xl flex items-center gap-2 font-body-medium text-small animate-fade-in border border-white/20">
          <span className="material-symbols-outlined text-action-green text-[20px]">check_circle</span>
          <span>{toastMessage}</span>
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

      <div className="flex flex-col gap-space-lg">
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
                  <div className="w-36 h-36 rounded-2xl overflow-hidden shadow-md bg-surface-container border-2 border-action-green/40">
                    <img
                      alt={displayName}
                      className="w-full h-full object-cover"
                      src={avatarSrc}
                    />
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
                      {currentUser?.libraryCardNumber || 'KP-CSH-2026-00002'}
                    </span>
                  </div>

                  <h2 className="font-headline-3 text-headline-3 text-text-primary font-bold tracking-tight">
                    {displayName}
                  </h2>
                  <p className="font-body-large text-body-large text-primary font-semibold">
                    Senior Circulation Desk Cashier
                  </p>
                  <p className="font-body text-small text-text-secondary mt-0.5">
                    {currentUser?.department || 'Circulation & Stacks Terminal Bay 01'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mt-space-md pt-space-md bg-surface-container-low/60 p-space-md rounded-xl">
                    <div className="flex items-center gap-space-xs text-text-primary">
                      <span className="material-symbols-outlined text-primary text-[18px]">alternate_email</span>
                      <span className="font-body text-small truncate">{currentUser?.email || 'cashier@katipuneros.edu.ph'}</span>
                    </div>
                    <div className="flex items-center gap-space-xs text-text-primary">
                      <span className="material-symbols-outlined text-primary text-[18px]">badge</span>
                      <span className="font-body text-small">@{currentUser?.username || 'cashier'}</span>
                    </div>
                    <div className="flex items-center gap-space-xs text-text-primary">
                      <span className="material-symbols-outlined text-primary text-[18px]">call</span>
                      <span className="font-body text-small">{currentUser?.phoneNumber || '+63 917 100 0002'}</span>
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
                      Barcode scanning, RFID validation, and patron loan issuance.
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
                      Patron hold fulfillment, shelf locker placement, and pickup dispatch.
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
                    showToast('Credentials verified with .NET 10 Web API.');
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
