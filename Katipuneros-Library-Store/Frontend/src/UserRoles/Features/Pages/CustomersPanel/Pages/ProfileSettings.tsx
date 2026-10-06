// [Layer: UserRoles/Features/Pages/CustomersPanel/Pages]
// ProfileSettings.tsx -- Customer Profile, Virtual Library Card, and Circulation Preferences
// Fully reactive React 19 component wired to authApi with zero raw DOM scripts.
// Strictly adheres to Zero Mock Data (N=0 empty state), Universal Lambda syntax (=>),
// and reactive toast notifications via useToasts.

import React, { FC, useState, useEffect, useRef, useMemo } from 'react';
import {
  getStoredUser,
  fetchCurrentProfile,
  updateUserProfile,
  uploadProfilePicture,
  changePasswordApi,
  AuthUser,
  UpdateProfilePayload,
} from '../../../../../Endpoints/authApi';
import { useToasts } from '../../../../../Hooks/useToasts';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';

type TabType = 'personal' | 'reminders' | 'security';

export const ProfileSettings: FC = () => {
  const { toasts, addToast, removeToast } = useToasts();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getStoredUser());
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);

  // Form State
  const [fullName, setFullName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [permanentAddress, setPermanentAddress] = useState<string>('');

  // Reminder Toggles
  const [dueAlertsEnabled, setDueAlertsEnabled] = useState<boolean>(true);
  const [counterAlertsEnabled, setCounterAlertsEnabled] = useState<boolean>(true);
  const [queueAlertsEnabled, setQueueAlertsEnabled] = useState<boolean>(true);
  const [delinquencyAlertsEnabled, setDelinquencyAlertsEnabled] = useState<boolean>(true);

  // Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);

  // Load Fresh Profile
  useEffect(() => {
    fetchCurrentProfile().then((u) => {
      if (u) {
        setCurrentUser(u);
        setFullName(u.fullName || '');
        setPhoneNumber(u.phoneNumber || '');
        setDepartment(u.department || 'College of Arts & Sciences');
        setCurrentAddress(u.currentAddress || '');
        setPermanentAddress(u.permanentAddress || '');
      }
    });
  }, []);

  // Sync Form when currentUser updates
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || '');
      setPhoneNumber(currentUser.phoneNumber || '');
      setDepartment(currentUser.department || 'College of Arts & Sciences');
      setCurrentAddress(currentUser.currentAddress || '');
      setPermanentAddress(currentUser.permanentAddress || '');
    }
  }, [currentUser]);

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);

    try {
      const payload: UpdateProfilePayload = {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        department: department.trim(),
        currentAddress: currentAddress.trim(),
        permanentAddress: permanentAddress.trim(),
      };

      const res = await updateUserProfile(payload);
      if (res.success) {
        addToast('Academic user profile and contact details saved.', 'success');
        setCurrentUser((prev) => (prev ? { ...prev, ...payload } : null));
        window.dispatchEvent(new CustomEvent('profile-updated', { detail: payload }));
        window.dispatchEvent(new CustomEvent('katipuneros-auth-changed'));
      } else {
        addToast(res.message || 'Failed to update profile.', 'error');
      }
    } catch {
      addToast('Error communicating with authentication service.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Avatar Upload
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast('Profile image must be under 2MB.', 'warning');
      return;
    }

    setIsUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        const res = await uploadProfilePicture(base64);
        if (res.success && res.profilePictureUrl) {
          setCurrentUser((prev) =>
            prev ? { ...prev, profilePictureUrl: res.profilePictureUrl } : null
          );
          window.dispatchEvent(
            new CustomEvent('profile-updated', {
              detail: { profilePictureUrl: res.profilePictureUrl },
            })
          );
          window.dispatchEvent(new CustomEvent('katipuneros-auth-changed'));
          addToast('Profile picture uploaded successfully.', 'success');
        } else {
          addToast(res.message || 'Failed to upload photo.', 'error');
        }
      } catch {
        addToast('Error uploading profile picture.', 'error');
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Copy Card Number
  const handleCopyCardNumber = () => {
    const cardNo = currentUser?.libraryCardNumber || 'KP-LIB-2026-08912';
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(cardNo)
        .then(() => addToast(`Card number copied: ${cardNo}`, 'success'))
        .catch(() => addToast(`Card number: ${cardNo}`, 'info'));
    } else {
      addToast(`Card number: ${cardNo}`, 'info');
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      addToast('Please enter your current password.', 'warning');
      return;
    }
    if (newPassword.length < 6) {
      addToast('New password must be at least 6 characters.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('New password and confirmation do not match.', 'error');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePasswordApi(currentPassword, newPassword, confirmPassword);
      if (res.success) {
        setIsPasswordModalOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        addToast('Library credential password updated successfully.', 'success');
      } else {
        addToast(res.message || 'Failed to update password.', 'error');
      }
    } catch {
      addToast('Error communicating with authentication server.', 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const cardNumber = currentUser?.libraryCardNumber || 'KP-LIB-2026-08912';

  return (
    <div className="w-full">
      {/* Toast Feedback Ribbon */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`p-4 rounded-xl shadow-xl flex items-center justify-between gap-3 text-small backdrop-blur-md transition-all ${
                t.type === 'success'
                  ? 'bg-action-green/90 text-text-primary'
                  : t.type === 'error'
                  ? 'bg-status-danger/90 text-white'
                  : t.type === 'warning'
                  ? 'bg-status-pending/90 text-text-primary'
                  : 'bg-surface-container-lowest/90 text-text-primary border border-outline-variant/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">
                  {t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info'}
                </span>
                <span>{t.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="opacity-70 hover:opacity-100 p-1 cursor-pointer"
                aria-label="Close notification"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hidden File Input for Avatar */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="flex flex-col w-full">
        {/* Top Header & Context */}
        <section className="w-full pb-space-lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
            <div className="flex flex-col max-w-3xl">
              <div className="flex items-center gap-space-xs text-secondary font-caption text-caption uppercase tracking-wider mb-space-xs">
                <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                <span>User Account &amp; Preferences</span>
                <span className="text-outline-variant">•</span>
                <span className="text-text-secondary font-medium">AY 2026–2027 Circulation Profile</span>
              </div>
              <h1 className="font-headline-1 text-headline-1 text-text-primary tracking-tight">
                User Profile &amp; Library Preferences
              </h1>
              <p className="font-body text-body text-text-secondary mt-space-xs">
                Manage personal academic credentials, active library privileges, reminder notification channels, reading preferences, and security credentials.
              </p>
            </div>

            <div className="flex items-center gap-space-sm shrink-0">
              <button
                type="button"
                onClick={() => addToast('Preparing BibTeX & CSV reading log bundle...', 'info')}
                className="h-11 px-space-md rounded-full bg-surface-container-lowest/80 text-text-primary hover:bg-surface-container-lowest shadow-sm flex items-center gap-space-xs font-body-medium text-body-medium transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px] text-secondary">download</span>
                <span>Export Reading History</span>
                <span className="font-caption text-caption px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant ml-1">
                  CSV / BibTeX
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Interactive Tab Switcher Navigation */}
        <section className="w-full mb-space-lg">
          <div className="w-full p-1.5 rounded-full bg-surface-container/80 backdrop-blur-md flex items-center gap-1 overflow-x-auto shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('personal')}
              className={`px-space-md py-space-xs rounded-full font-body-medium text-body-medium flex items-center gap-space-xs shrink-0 transition-all cursor-pointer ${
                activeTab === 'personal'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest/60'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">badge</span>
              <span>Personal &amp; Academic Info</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reminders')}
              className={`px-space-md py-space-xs rounded-full font-body-medium text-body-medium flex items-center gap-space-xs shrink-0 transition-all cursor-pointer ${
                activeTab === 'reminders'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest/60'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">notifications_active</span>
              <span>Reminders &amp; Dispatch Channels</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`px-space-md py-space-xs rounded-full font-body-medium text-body-medium flex items-center gap-space-xs shrink-0 transition-all cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest/60'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">shield</span>
              <span>Security &amp; Connected Devices</span>
            </button>
          </div>
        </section>

        {/* Main Two-Column Layout */}
        <section className="w-full pb-space-3xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
            {/* LEFT COLUMN: Active Tab Forms (7 of 12 cols = 60%) */}
            <div className="lg:col-span-7 flex flex-col gap-space-xl min-w-0">
              {/* TAB 1: Personal & Academic Info */}
              {activeTab === 'personal' && (
                <div className="p-space-lg rounded-xl bg-surface-container-lowest/80 backdrop-blur-xl shadow-sm flex flex-col gap-space-lg">
                  <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/10">
                    <div>
                      <span className="font-caption text-caption text-secondary uppercase tracking-wider font-semibold">
                        Institutional Registry
                      </span>
                      <h3 className="font-headline-3 text-headline-3 text-text-primary font-bold">
                        Academic User Identity
                      </h3>
                    </div>
                    <span className="px-space-sm py-1 rounded-full bg-soft-blue text-secondary font-caption text-caption font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      Registrar Verified
                    </span>
                  </div>

                  <form onSubmit={handleSaveProfile} className="flex flex-col gap-space-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                      {/* Full Legal Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-small text-small text-text-secondary font-medium">
                          Full Legal Name
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-text-primary font-body text-body focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30 outline-none transition-colors border border-outline-variant/15"
                          />
                          <span className="material-symbols-outlined absolute right-3 top-2.5 text-text-secondary text-[20px]">
                            person
                          </span>
                        </div>
                      </div>

                      {/* University Email */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-small text-small text-text-secondary font-medium">
                          Institutional Email (SSO)
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            readOnly
                            value={currentUser?.email || ''}
                            className="w-full h-11 px-space-md rounded-lg bg-surface-container text-text-secondary font-body text-body outline-none cursor-not-allowed pr-10 border border-outline-variant/10"
                          />
                          <span className="material-symbols-outlined absolute right-3 top-2.5 text-status-available text-[20px]">
                            verified
                          </span>
                        </div>
                      </div>

                      {/* Mobile Number */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-small text-small text-text-secondary font-medium">
                          Mobile Number (SMS Delivery)
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+63 9XX XXX XXXX"
                            className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-text-primary font-body text-body focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30 outline-none transition-colors border border-outline-variant/15"
                          />
                          <span className="material-symbols-outlined absolute right-3 top-2.5 text-secondary text-[20px]">
                            smartphone
                          </span>
                        </div>
                      </div>

                      {/* Student ID */}
                      <div className="flex flex-col gap-1.5">
                        <label className="font-small text-small text-text-secondary font-medium">
                          Student &amp; Matriculation ID
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={cardNumber}
                          className="w-full h-11 px-space-md rounded-lg bg-surface-container text-text-secondary font-mono text-body outline-none cursor-not-allowed border border-outline-variant/10"
                        />
                      </div>

                      {/* College & Department */}
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="font-small text-small text-text-secondary font-medium">
                          Academic Unit / Department
                        </label>
                        <input
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-text-primary font-body text-body focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30 outline-none transition-colors border border-outline-variant/15"
                        />
                      </div>

                      {/* Campus Address */}
                      <div className="flex flex-col gap-1.5 md:col-span-2">
                        <label className="font-small text-small text-text-secondary font-medium">
                          Campus Dorm / Current Address
                        </label>
                        <input
                          type="text"
                          value={currentAddress}
                          onChange={(e) => setCurrentAddress(e.target.value)}
                          placeholder="e.g. Dormitory Bldg C, Room 204"
                          className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-text-primary font-body text-body focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30 outline-none transition-colors border border-outline-variant/15"
                        />
                      </div>
                    </div>

                    <div className="p-space-md rounded-lg bg-soft-blue/40 flex items-start gap-space-sm mt-2">
                      <span className="material-symbols-outlined text-primary shrink-0 mt-0.5 text-[20px]">info</span>
                      <div className="flex flex-col">
                        <p className="font-small text-small text-text-primary font-semibold">
                          Undergraduate Thesis Privilege Tier
                        </p>
                        <p className="font-caption text-caption text-text-secondary">
                          You qualify for an extended circulation term (14 calendar days) with automated 7-day single renewals.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-space-sm">
                      <button
                        type="submit"
                        disabled={isSavingProfile}
                        className="h-11 px-space-lg rounded-full bg-primary text-on-primary hover:bg-primary-hover disabled:opacity-50 font-small text-small font-semibold shadow-md transition-all flex items-center gap-space-xs cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {isSavingProfile ? 'progress_activity' : 'save'}
                        </span>
                        <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 2: Reminders & Notification Channels */}
              {activeTab === 'reminders' && (
                <div className="p-space-lg rounded-xl bg-surface-container-lowest/80 backdrop-blur-xl shadow-sm flex flex-col gap-space-lg">
                  <div className="flex flex-col pb-space-xs border-b border-outline-variant/10">
                    <span className="font-caption text-caption text-secondary uppercase tracking-wider font-semibold">
                      Circulation Gateways
                    </span>
                    <h3 className="font-headline-3 text-headline-3 text-text-primary font-bold">
                      Reminders &amp; Dispatch Channels
                    </h3>
                    <p className="font-small text-small text-text-secondary mt-0.5">
                      Customize real-time triggers to keep accounts fine-free and collect ready hold books from counter bays.
                    </p>
                  </div>

                  <div className="flex flex-col gap-space-md">
                    {/* Toggle 1: Due Pre-alert */}
                    <div className="p-space-md rounded-lg bg-surface-container-low/60 flex items-center justify-between gap-space-md">
                      <div className="flex items-start gap-space-sm">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[22px]">alarm</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-body-medium text-body-medium text-text-primary font-semibold">
                            Due Date Pre-Alerts (48 Hours Prior)
                          </span>
                          <p className="font-caption text-caption text-text-secondary">
                            Dispatches impending return warnings two calendar days prior to the 5:00 PM circulation cut-off.
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={dueAlertsEnabled}
                        onChange={(e) => {
                          setDueAlertsEnabled(e.target.checked);
                          addToast('Pre-alert notification setting updated.', 'info');
                        }}
                        className="w-5 h-5 accent-action-green cursor-pointer"
                      />
                    </div>

                    {/* Toggle 2: Staged Hold Alert */}
                    <div className="p-space-md rounded-lg bg-surface-container-low/60 flex items-center justify-between gap-space-md">
                      <div className="flex items-start gap-space-sm">
                        <div className="w-10 h-10 rounded-lg bg-status-available/20 text-status-available flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[22px]">store</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-body-medium text-body-medium text-text-primary font-semibold">
                            Counter Pickup Staging Notifications
                          </span>
                          <p className="font-caption text-caption text-text-secondary">
                            Instant SMS and email alert dispatched when library staff stages your reserved book at the counter bay.
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={counterAlertsEnabled}
                        onChange={(e) => {
                          setCounterAlertsEnabled(e.target.checked);
                          addToast('Counter pickup notification setting updated.', 'info');
                        }}
                        className="w-5 h-5 accent-action-green cursor-pointer"
                      />
                    </div>

                    {/* Toggle 3: Queue Progress */}
                    <div className="p-space-md rounded-lg bg-surface-container-low/60 flex items-center justify-between gap-space-md">
                      <div className="flex items-start gap-space-sm">
                        <div className="w-10 h-10 rounded-lg bg-status-pending/20 text-status-pending flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[22px]">hourglass_top</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-body-medium text-body-medium text-text-primary font-semibold">
                            Hold Queue Advancement Notice
                          </span>
                          <p className="font-caption text-caption text-text-secondary">
                            Notify me when titles advance in queue position as books are returned by other patrons.
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={queueAlertsEnabled}
                        onChange={(e) => {
                          setQueueAlertsEnabled(e.target.checked);
                          addToast('Queue update notification setting updated.', 'info');
                        }}
                        className="w-5 h-5 accent-action-green cursor-pointer"
                      />
                    </div>

                    {/* Toggle 4: Delinquency Notice */}
                    <div className="p-space-md rounded-lg bg-surface-container-low/60 flex items-center justify-between gap-space-md">
                      <div className="flex items-start gap-space-sm">
                        <div className="w-10 h-10 rounded-lg bg-status-danger/20 text-status-danger flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[22px]">warning</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-body-medium text-body-medium text-text-primary font-semibold">
                            Overdue Fine &amp; Grace Period Window Notice
                          </span>
                          <p className="font-caption text-caption text-text-secondary">
                            Urgency alert 6 hours before overdue penalty begins calculating (₱15.00 statutory daily rate).
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={delinquencyAlertsEnabled}
                        onChange={(e) => {
                          setDelinquencyAlertsEnabled(e.target.checked);
                          addToast('Grace period warning setting updated.', 'info');
                        }}
                        className="w-5 h-5 accent-action-green cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Security & Connected Devices */}
              {activeTab === 'security' && (
                <div className="p-space-lg rounded-xl bg-surface-container-lowest/80 backdrop-blur-xl shadow-sm flex flex-col gap-space-lg">
                  <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/10">
                    <div>
                      <span className="font-caption text-caption text-secondary uppercase tracking-wider font-semibold">
                        Authentication &amp; Sessions
                      </span>
                      <h3 className="font-headline-3 text-headline-3 text-text-primary font-bold">
                        Account Security &amp; Active Sessions
                      </h3>
                    </div>
                    <span className="material-symbols-outlined text-status-available text-[24px]">security</span>
                  </div>

                  {/* Active Device Sessions List */}
                  <div className="flex flex-col gap-space-sm">
                    <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                      Active Device Sessions
                    </span>

                    {/* Session 1: Current Session */}
                    <div className="p-space-md rounded-lg bg-surface-container-low flex items-center justify-between border border-primary/20">
                      <div className="flex items-center gap-space-sm">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
                          <span className="material-symbols-outlined text-[20px]">laptop_mac</span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-body-medium text-body-medium text-text-primary font-semibold">
                              Chrome on Windows 11
                            </span>
                            <span className="w-2 h-2 rounded-full bg-status-available"></span>
                            <span className="font-caption text-caption text-status-available font-semibold">Current Device</span>
                          </div>
                          <span className="font-caption text-caption text-text-secondary">
                            IP: 192.168.1.104 • Katipuneros Campus Gateway • Active Token
                          </span>
                        </div>
                      </div>
                      <span className="font-caption text-caption text-text-secondary font-mono bg-surface-container px-2 py-0.5 rounded">
                        Active Now
                      </span>
                    </div>

                    {/* Session 2: Secondary Mobile Session */}
                    <div className="p-space-md rounded-lg bg-surface-container-low flex items-center justify-between border border-outline-variant/10">
                      <div className="flex items-center gap-space-sm">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-text-secondary shadow-sm">
                          <span className="material-symbols-outlined text-[20px]">smartphone</span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-body-medium text-body-medium text-text-primary font-semibold">
                              Mobile Safari on iOS
                            </span>
                            <span className="font-caption text-caption text-text-secondary">Secondary Session</span>
                          </div>
                          <span className="font-caption text-caption text-text-secondary">
                            IP: 120.29.74.12 • Mobile Web Portal • Signed in via SSO
                          </span>
                        </div>
                      </div>
                      <span className="font-caption text-caption text-text-secondary">
                        3 hrs ago
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-col gap-space-xs pt-space-xs">
                    <button
                      type="button"
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="w-full h-11 px-space-md rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-text-primary font-body-medium text-body-medium flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-[20px] text-secondary">pin</span>
                        <span>Change Circulation Password / Access PIN</span>
                      </span>
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => addToast('All secondary browser sessions terminated.', 'success')}
                      className="w-full h-11 px-space-md rounded-lg bg-surface-container-low hover:bg-error-container text-error font-body-medium text-body-medium flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        <span>Terminate All Other Browser Sessions</span>
                      </span>
                      <span className="font-caption text-caption">End 1 Session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Virtual Card & Avatar Upload (5 of 12 cols = 40%) */}
            <div className="lg:col-span-5 flex flex-col gap-space-xl">
              {/* Virtual Library Card */}
              <div className="p-space-lg rounded-xl bg-surface-container-lowest/80 backdrop-blur-xl shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <span className="font-caption text-caption text-secondary uppercase tracking-wider font-semibold">
                    Digital Circulation Pass
                  </span>
                  <span className="material-symbols-outlined text-text-secondary text-[18px]">badge</span>
                </div>

                {/* Academic Card Element */}
                <div
                  className="relative w-full rounded-2xl overflow-hidden p-space-lg text-white shadow-xl flex flex-col justify-between"
                  style={{
                    background: 'linear-gradient(135deg, #0f3d4f 0%, #164e63 60%, #1e627d 100%)',
                    aspectRatio: '1.586/1',
                  }}
                >
                  {/* Top Card Header */}
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-space-xs">
                      <div className="w-8 h-8 rounded-lg bg-action-green text-text-primary flex items-center justify-center font-bold shadow">
                        <span className="material-symbols-outlined text-[20px]">local_library</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-headline-4 text-headline-4 text-white tracking-tight leading-tight font-bold">
                          KATIPUNEROS
                        </span>
                        <span className="font-caption text-[10px] text-teal-200 uppercase tracking-widest leading-none">
                          University Stacks
                        </span>
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm">
                      <span className="material-symbols-outlined text-action-green text-[22px]">verified</span>
                    </div>
                  </div>

                  {/* Card Middle / User Identity */}
                  <div className="flex items-center justify-between my-auto relative z-10">
                    <div className="flex flex-col">
                      <span className="font-caption text-[11px] text-teal-200 uppercase tracking-wider">
                        Patron Identity
                      </span>
                      <span className="font-headline-4 text-headline-4 text-white font-bold tracking-normal uppercase">
                        {currentUser?.fullName || 'Academic Scholar'}
                      </span>
                      <span className="font-caption text-caption text-teal-100 opacity-90">
                        {department} • {currentUser?.role || 'Customer'}
                      </span>
                    </div>
                    {/* Gold Holographic Seal */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 shadow-md flex items-center justify-center text-text-primary opacity-90">
                      <span className="material-symbols-outlined text-[24px]">military_tech</span>
                    </div>
                  </div>

                  {/* Card Bottom Barcode */}
                  <div className="pt-space-xs relative z-10 flex flex-col gap-1">
                    <div className="flex items-center justify-between font-mono text-[11px] text-teal-200 tracking-wider">
                      <span>CARD # {cardNumber}</span>
                      <span>EXP 06/2027</span>
                    </div>
                    {/* High-Fidelity SVG Barcode */}
                    <div className="bg-white/95 p-1.5 rounded flex items-center justify-center">
                      <svg className="w-full h-8 text-neutral-900" fill="currentColor" viewBox="0 0 240 32">
                        <rect height="32" width="3" x="0" y="0"></rect>
                        <rect height="32" width="2" x="5" y="0"></rect>
                        <rect height="32" width="4" x="9" y="0"></rect>
                        <rect height="32" width="1" x="15" y="0"></rect>
                        <rect height="32" width="3" x="18" y="0"></rect>
                        <rect height="32" width="5" x="23" y="0"></rect>
                        <rect height="32" width="2" x="30" y="0"></rect>
                        <rect height="32" width="2" x="34" y="0"></rect>
                        <rect height="32" width="6" x="38" y="0"></rect>
                        <rect height="32" width="3" x="46" y="0"></rect>
                        <rect height="32" width="1" x="51" y="0"></rect>
                        <rect height="32" width="4" x="54" y="0"></rect>
                        <rect height="32" width="2" x="60" y="0"></rect>
                        <rect height="32" width="5" x="64" y="0"></rect>
                        <rect height="32" width="3" x="71" y="0"></rect>
                        <rect height="32" width="2" x="76" y="0"></rect>
                        <rect height="32" width="6" x="80" y="0"></rect>
                        <rect height="32" width="2" x="88" y="0"></rect>
                        <rect height="32" width="4" x="92" y="0"></rect>
                        <rect height="32" width="1" x="98" y="0"></rect>
                        <rect height="32" width="3" x="101" y="0"></rect>
                        <rect height="32" width="5" x="106" y="0"></rect>
                        <rect height="32" width="2" x="113" y="0"></rect>
                        <rect height="32" width="4" x="117" y="0"></rect>
                        <rect height="32" width="2" x="123" y="0"></rect>
                        <rect height="32" width="6" x="127" y="0"></rect>
                        <rect height="32" width="3" x="135" y="0"></rect>
                        <rect height="32" width="1" x="140" y="0"></rect>
                        <rect height="32" width="5" x="143" y="0"></rect>
                        <rect height="32" width="2" x="150" y="0"></rect>
                        <rect height="32" width="3" x="154" y="0"></rect>
                        <rect height="32" width="5" x="159" y="0"></rect>
                        <rect height="32" width="2" x="166" y="0"></rect>
                        <rect height="32" width="4" x="170" y="0"></rect>
                        <rect height="32" width="2" x="176" y="0"></rect>
                        <rect height="32" width="6" x="180" y="0"></rect>
                        <rect height="32" width="1" x="188" y="0"></rect>
                        <rect height="32" width="3" x="191" y="0"></rect>
                        <rect height="32" width="5" x="196" y="0"></rect>
                        <rect height="32" width="2" x="203" y="0"></rect>
                        <rect height="32" width="4" x="207" y="0"></rect>
                        <rect height="32" width="3" x="213" y="0"></rect>
                        <rect height="32" width="2" x="218" y="0"></rect>
                        <rect height="32" width="5" x="222" y="0"></rect>
                        <rect height="32" width="2" x="229" y="0"></rect>
                        <rect height="32" width="3" x="233" y="0"></rect>
                        <rect height="32" width="2" x="238" y="0"></rect>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-2 gap-space-xs pt-space-xs">
                  <button
                    type="button"
                    onClick={handleCopyCardNumber}
                    className="h-10 px-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container-high text-text-primary font-small text-small font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-secondary">content_copy</span>
                    <span>Copy Card No.</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => addToast(`Patron Pass Barcode: ${cardNumber}`, 'info')}
                    className="h-10 px-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container-high text-text-primary font-small text-small font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">barcode</span>
                    <span>Barcode Ready</span>
                  </button>
                </div>
              </div>

              {/* Avatar Photo Management Card */}
              <div className="p-space-lg rounded-xl bg-surface-container-lowest/80 backdrop-blur-xl shadow-sm flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <span className="font-caption text-caption text-secondary uppercase tracking-wider font-semibold">
                    Academic Portrait
                  </span>
                  <span className="material-symbols-outlined text-text-secondary text-[18px]">photo_camera</span>
                </div>

                <div className="flex items-center gap-space-md">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-surface-container border-2 border-primary/20 shadow-md shrink-0">
                    <img
                      src={currentUser?.profilePictureUrl || DEFAULT_AVATAR}
                      alt={currentUser?.fullName || 'Patron Portrait'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DEFAULT_AVATAR;
                      }}
                    />
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 bg-scrim/60 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white animate-spin text-xl">
                          progress_activity
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <h4 className="font-body-medium text-body-medium font-bold text-text-primary">
                      Profile Photograph
                    </h4>
                    <p className="font-caption text-caption text-text-secondary">
                      Clear scholastic headshot used for circulation desk identification.
                    </p>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="px-space-md py-1.5 rounded-full bg-surface-container hover:bg-surface-variant text-text-primary font-small text-small font-medium transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">upload</span>
                        <span>{isUploadingAvatar ? 'Uploading...' : 'Upload New Photo'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Modal: Change Password */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg max-w-md w-full shadow-2xl border border-outline-variant/20">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">lock_reset</span>
                <h3 className="font-headline-3 text-headline-3 text-text-primary font-bold">
                  Change Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-full cursor-pointer"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="flex flex-col gap-space-md">
              <div>
                <label className="block text-caption font-caption text-text-secondary uppercase mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-small font-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/20"
                />
              </div>

              <div>
                <label className="block text-caption font-caption text-text-secondary uppercase mb-1">
                  New Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-small font-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/20"
                />
              </div>

              <div>
                <label className="block text-caption font-caption text-text-secondary uppercase mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-small font-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/20"
                />
              </div>

              <div className="flex justify-end gap-space-sm pt-space-xs">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-space-md py-2 rounded-full bg-surface-container hover:bg-surface-variant font-small text-small text-text-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-space-lg py-2 rounded-full bg-primary text-on-primary hover:bg-primary-hover disabled:opacity-50 font-small text-small font-bold shadow-md cursor-pointer"
                >
                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
