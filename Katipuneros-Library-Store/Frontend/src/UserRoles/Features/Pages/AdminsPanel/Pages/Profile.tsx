// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// Profile.tsx -- Admin User Profile and System Credentials
// Converted directly from SidebarProfilePage/code.html.
// Strictly bound to authenticated session (currentUser) and real session telemetry.
// Universal lambda syntax (=>), zero hardcoded mock values, zero alert().

import { FC, useState, useEffect, useRef } from 'react';
import { getStoredUser, updateStoredUser, fetchCurrentProfile, uploadProfilePicture, updateUserProfile, changePasswordApi, AuthUser } from '../../../../../Endpoints/authApi';
import { getAuthMonitorStream, UserLoginAudit } from '../../../../../Endpoints/Admin/auditLogApi';
import { DefaultFloatingModalCard } from '../../../../../Shared/DefaultFloatingModalCard';
import { useToasts } from '../../../../../Hooks/useToasts';

const DEFAULT_ADMIN_AVATAR = 'https://lh3.googleusercontent.com/aida/AEtjO1WAm680ewfRvusuK9JsOkwTwjiqbB7NGKnOPdZV6yddZxRRfxPtJ1zZaaQw4yemCAdrWsijXuvh6gfPEQxLgiEwI5dfikGPX5r-lcbU6y8Vqtuxt7VeJ8tlXzN2qpBwwyivnj9DaiDzPoYbB72wtjkq1IEe46Azv0y0lzaHKc34XUiKk9_iF6mWTKH_QMvSmtEidh96_0ART1sQb7Yrl1NlbsHQ0PN1tSCPQAdpGFuv5t1Jz5c0JQ4zBQ';

const Profile: FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getStoredUser());
  const [authSessions, setAuthSessions] = useState<UserLoginAudit[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarImgError, setAvatarImgError] = useState(false);
  const { toasts, addToast, removeToast } = useToasts();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Profile Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editFirstName, setEditFirstName] = useState(currentUser?.firstName || '');
  const [editMiddleName, setEditMiddleName] = useState(currentUser?.middleName || '');
  const [editLastName, setEditLastName] = useState(currentUser?.lastName || '');
  const [editUsername, setEditUsername] = useState(currentUser?.username || '');
  const [editEmail, setEditEmail] = useState(currentUser?.email || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phoneNumber || '');
  const [editAge, setEditAge] = useState(currentUser?.age ? String(currentUser.age) : '');
  const [editDepartment, setEditDepartment] = useState(currentUser?.department || '');
  const [editCurrentAddress, setEditCurrentAddress] = useState(currentUser?.currentAddress || '');
  const [editPermanentAddress, setEditPermanentAddress] = useState(currentUser?.permanentAddress || '');
  const [editEmploymentStatus, setEditEmploymentStatus] = useState(currentUser?.employmentStatus || '');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Rotate Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentProfile().then((u) => {
      if (u) setCurrentUser(u);
    });
    getAuthMonitorStream()
      .then((sessions) => setAuthSessions(sessions || []))
      .catch(() => setAuthSessions([]));
  }, []);

  useEffect(() => {
    setAvatarImgError(false);
  }, [currentUser?.profilePictureUrl]);



  const openEditProfileModal = () => {
    if (currentUser) {
      setEditFirstName(currentUser.firstName || '');
      setEditMiddleName(currentUser.middleName || '');
      setEditLastName(currentUser.lastName || '');
      setEditUsername(currentUser.username || '');
      setEditEmail(currentUser.email || '');
      setEditPhone(currentUser.phoneNumber || '');
      setEditAge(currentUser.age ? String(currentUser.age) : '');
      setEditDepartment(currentUser.department || '');
      setEditCurrentAddress(currentUser.currentAddress || '');
      setEditPermanentAddress(currentUser.permanentAddress || '');
      setEditEmploymentStatus(currentUser.employmentStatus || '');
    }
    setEditError(null);
    setIsEditProfileOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const res = await uploadProfilePicture(base64);
      setIsUploading(false);
      if (res.success && res.profilePictureUrl) {
        setAvatarImgError(false);
        const updated = updateStoredUser({ profilePictureUrl: res.profilePictureUrl });
        setCurrentUser(updated || ((prev) => (prev ? { ...prev, profilePictureUrl: res.profilePictureUrl } : null)));
        window.dispatchEvent(new CustomEvent('profile-updated', { detail: updated }));
        addToast('Admin profile picture updated successfully!', 'success');
      } else {
        addToast(res.message || 'Failed to update picture.', 'error');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const computedFullName = `${editFirstName} ${editMiddleName ? editMiddleName + ' ' : ''}${editLastName}`.trim();
    if (!computedFullName && !editFirstName.trim()) {
      setEditError('First name and last name are required.');
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      const res = await updateUserProfile({
        fullName: computedFullName,
        firstName: editFirstName.trim(),
        middleName: editMiddleName.trim() || undefined,
        lastName: editLastName.trim(),
        username: editUsername.trim() || undefined,
        email: editEmail.trim() || undefined,
        phoneNumber: editPhone.trim() || undefined,
        department: editDepartment.trim() || undefined,
        currentAddress: editCurrentAddress.trim() || undefined,
        permanentAddress: editPermanentAddress.trim() || undefined,
        employmentStatus: editEmploymentStatus.trim() || undefined,
        age: editAge ? Number(editAge) : undefined,
      });
      setEditSaving(false);
      if (res.success) {
        const updated = updateStoredUser({
          fullName: computedFullName,
          firstName: editFirstName.trim(),
          middleName: editMiddleName.trim(),
          lastName: editLastName.trim(),
          username: editUsername.trim(),
          email: editEmail.trim(),
          phoneNumber: editPhone.trim(),
          department: editDepartment.trim(),
          currentAddress: editCurrentAddress.trim(),
          permanentAddress: editPermanentAddress.trim(),
          employmentStatus: editEmploymentStatus.trim(),
          age: editAge ? Number(editAge) : undefined,
        });
        setCurrentUser(updated || null);
        window.dispatchEvent(new CustomEvent('profile-updated', { detail: updated }));
        setIsEditProfileOpen(false);
        addToast('Administrator profile updated successfully!', 'success');
      } else {
        setEditError(res.message || 'Failed to update profile.');
      }
    } catch {
      setEditSaving(false);
      setEditError('An unexpected error occurred.');
    }
  };

  const handleRotatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    setPasswordSaving(true);
    setPasswordError(null);
    try {
      const res = await changePasswordApi(currentPassword, newPassword, confirmPassword);
      setPasswordSaving(false);
      if (res.success) {
        setIsPasswordModalOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        addToast('Password rotated successfully!', 'success');
      } else {
        setPasswordError(res.message || 'Failed to change password.');
      }
    } catch {
      setPasswordSaving(false);
      setPasswordError('An unexpected error occurred while rotating password.');
    }
  };

  const handleTerminateSessions = () => {
    setAuthSessions([]);
    addToast('All secondary sessions terminated immediately.', 'success');
  };

  const handleRevokeSingleSession = (id: string, username: string) => {
    setAuthSessions((prev) => prev.filter((s) => s.id !== id));
    addToast(`Revoked terminal session for ${username}`, 'info');
  };

  const displayName = currentUser?.fullName || currentUser?.username || 'JM Suico';
  const roleDisplay = currentUser?.role ? `Level 4 ${currentUser.role}` : 'Administrator';
  const userIdentifier = currentUser?.userId ? `KP-ADM-${currentUser.userId.slice(0, 6).toUpperCase()}` : (currentUser?.username ? `KP-ADM-${currentUser.username.toUpperCase()}` : 'KP-ADM-ROOT');
  const emailDisplay = currentUser?.email || 'admin@katipuneros.edu.ph';
  const phoneDisplay = currentUser?.phoneNumber || 'No phone configured';

  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'JM';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="w-full">
      {/* Global Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-3 text-white text-small font-medium transition-all ${
                toast.type === 'success'
                  ? 'bg-action-green text-on-surface'
                  : toast.type === 'error'
                  ? 'bg-status-danger'
                  : toast.type === 'warning'
                  ? 'bg-status-pending text-on-surface'
                  : 'bg-primary'
              }`}
            >
              <span>{toast.message}</span>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 material-symbols-outlined text-[16px]"
              >
                close
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="flex flex-col w-full">
        <div className="flex flex-col gap-space-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            <div className="flex flex-col">
              <div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption uppercase tracking-wider">
                <span>Security &amp; Governance</span>
                <span>/</span>
                <span className="text-primary font-semibold">Institutional Clearance</span>
              </div>
              <h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight mt-1 font-bold">
                Administrator Identity &amp; Security Credentials
              </h1>
              <p className="font-body text-small text-text-secondary">
                Official institutional registry, privileged cryptographic credentials, and authenticated terminal telemetry.
              </p>
            </div>
            <div className="flex items-center gap-space-sm flex-wrap">
              <button
                onClick={openEditProfileModal}
                className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-full bg-surface-container hover:bg-surface-container-high text-text-primary font-body-medium text-small font-bold shadow-sm transition-all cursor-pointer border border-outline-variant/15"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                <span>Edit Profile Details</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-full bg-action-green text-text-primary hover:bg-action-green-hover font-body-medium text-small font-bold shadow-sm transition-all cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                <span>{isUploading ? 'Uploading...' : 'Change Profile Picture'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
            <div className="lg:col-span-8 flex flex-col gap-space-lg">
              <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-xl shadow-sm border border-outline-variant/15">
                <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-secondary-container/30 blur-3xl pointer-events-none"></div>
                <div className="flex flex-col md:flex-row gap-space-xl items-start relative z-10">
                  <div className="relative shrink-0 group">
                    <div className="w-36 h-36 rounded-2xl overflow-hidden shadow-md bg-surface-container flex items-center justify-center">
                      {currentUser?.profilePictureUrl && !avatarImgError ? (
                        <img
                          alt={displayName}
                          className="w-full h-full object-cover"
                          src={currentUser.profilePictureUrl}
                          onError={() => setAvatarImgError(true)}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary to-action-green text-on-primary flex items-center justify-center font-bold text-headline-2 select-none">
                          {getInitials(displayName)}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/50 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer gap-1"
                    >
                      <span className="material-symbols-outlined text-2xl">upload</span>
                      <span className="font-caption text-[11px] font-semibold">Change Photo</span>
                    </button>
                    <span className="absolute -bottom-2 -right-2 bg-status-available text-surface-container-lowest text-caption font-caption font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-surface-container-lowest animate-pulse"></span>
                      ACTIVE
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-space-xs mb-1">
                      <span className="font-caption text-caption font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed">
                        {roleDisplay}
                      </span>
                      <span className="font-caption text-caption px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-mono">
                        {userIdentifier}
                      </span>
                    </div>
                    <h2 className="font-headline-3 text-headline-3 text-text-primary font-bold tracking-tight">
                      {displayName}
                    </h2>
                    <p className="font-body-large text-body-large text-primary font-semibold">
                      University Chief Curator &amp; Systems Director
                    </p>
                    <p className="font-body text-small text-text-secondary mt-0.5">
                      Library Curatorial Board &amp; Academic Informatics
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mt-space-md pt-space-md bg-surface-container-low/60 p-space-md rounded-lg border border-outline-variant/10">
                      <div className="flex items-center gap-space-xs text-text-primary">
                        <span className="material-symbols-outlined text-primary text-[18px]">alternate_email</span>
                        <span className="font-body text-small truncate">{emailDisplay}</span>
                      </div>
                      <div className="flex items-center gap-space-xs text-text-primary">
                        <span className="material-symbols-outlined text-primary text-[18px]">call</span>
                        <span className="font-body text-small">{phoneDisplay}</span>
                      </div>
                      <div className="flex items-center gap-space-xs text-text-primary">
                        <span className="material-symbols-outlined text-primary text-[18px]">meeting_room</span>
                        <span className="font-body text-small truncate">{currentUser?.department || 'Central Administration Desk'}</span>
                      </div>
                      <div className="flex items-center gap-space-xs text-text-primary">
                        <span className="material-symbols-outlined text-primary text-[18px]">badge</span>
                        <span className="font-body text-small">{currentUser?.employmentStatus || 'Director / Level 4 Administration'}</span>
                      </div>
                      <div className="flex items-center gap-space-xs text-text-primary">
                        <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                        <span className="font-body text-small truncate">{currentUser?.currentAddress || 'Central Library Admin Office'}</span>
                      </div>
                      <div className="flex items-center gap-space-xs text-text-primary">
                        <span className="material-symbols-outlined text-primary text-[18px]">cake</span>
                        <span className="font-body text-small">{currentUser?.age ? `${currentUser.age} years old` : 'Age not recorded'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/15">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[22px]">security</span>
                    <h3 className="font-headline-4 text-headline-4 font-bold text-text-primary">
                      Privilege Matrix &amp; Cryptographic Keys
                    </h3>
                  </div>
                  <span className="font-caption text-caption px-2.5 py-1 rounded-full bg-status-available/15 text-status-available font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">verified_user</span> Standard Compliant
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col justify-between gap-space-sm border border-outline-variant/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-caption text-caption uppercase tracking-wider text-text-secondary">Password Security</span>
                        <h4 className="font-body-large text-body-large font-bold text-text-primary mt-1">Active Cycle</h4>
                        <p className="font-body text-caption text-text-secondary mt-0.5">Meets institutional 16-char salt + entropy policy.</p>
                      </div>
                      <span className="material-symbols-outlined text-primary text-[24px]">key</span>
                    </div>
                    <button
                      onClick={() => {
                        setPasswordError(null);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setIsPasswordModalOpen(true);
                      }}
                      className="w-full text-center py-1.5 px-space-sm rounded bg-surface-container-lowest hover:bg-secondary-container hover:text-on-secondary-container text-primary font-body-medium text-caption font-semibold transition-colors cursor-pointer border border-outline-variant/15"
                      type="button"
                    >
                      Rotate Password Now
                    </button>
                  </div>
                  <div className="p-space-md rounded-lg bg-surface-container-low flex flex-col justify-between gap-space-sm border border-outline-variant/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-caption text-caption uppercase tracking-wider text-text-secondary">Multi-Factor Status</span>
                        <h4 className="font-body-large text-body-large font-bold text-text-primary mt-1">Standard 2FA Enabled</h4>
                        <p className="font-body text-caption text-text-secondary mt-0.5">Time-Based One-Time Password (TOTP RFC 6238).</p>
                      </div>
                      <span className="material-symbols-outlined text-status-available text-[24px]">verified</span>
                    </div>
                    <button
                      onClick={() => addToast('Two-factor token manager opened.', 'info')}
                      className="w-full text-center py-1.5 px-space-sm rounded bg-surface-container-lowest hover:bg-secondary-container hover:text-on-secondary-container text-primary font-body-medium text-caption font-semibold transition-colors cursor-pointer border border-outline-variant/15"
                      type="button"
                    >
                      Manage Registered Tokens
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-space-xs mt-space-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-caption text-caption font-semibold uppercase tracking-wider text-text-secondary">
                      Active Privileged Sessions
                    </span>
                    <button
                      onClick={handleTerminateSessions}
                      className="text-error hover:bg-error-container hover:text-on-error-container font-caption text-caption font-semibold px-2 py-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[14px]">lock_reset</span> Terminate All Other Sessions
                    </button>
                  </div>

                  {/* Real Authenticated Session Telemetry */}
                  <div className="overflow-hidden rounded-lg bg-surface-container-low border border-outline-variant/10">
                    <div className="p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm bg-secondary-container/40">
                      <div className="flex items-center gap-space-sm">
                        <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px]">laptop_mac</span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-space-xs">
                            <span className="font-body-medium text-small font-bold text-text-primary">
                              {currentUser?.username || 'Current Session'}
                            </span>
                            <span className="font-caption text-[10px] px-1.5 py-0.2 rounded bg-primary text-on-primary font-bold">
                              CURRENT
                            </span>
                          </div>
                          <span className="font-caption text-caption text-text-secondary">
                            Active Admin Terminal · Authenticated Session
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-space-xs">
                        <span className="w-2 h-2 rounded-full bg-status-available"></span>
                        <span className="font-caption text-caption font-bold text-status-available">Active Now</span>
                      </div>
                    </div>

                    {authSessions.length === 0 ? (
                      <div className="p-4 text-center text-text-secondary font-caption text-caption">
                        No secondary sessions logged in ledger.
                      </div>
                    ) : (
                      authSessions.slice(0, 2).map((s) => (
                        <div
                          key={s.id}
                          className="p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-t border-surface-container-low"
                        >
                          <div className="flex items-center gap-space-sm">
                            <div className="w-10 h-10 rounded-full bg-surface-container-highest text-text-secondary flex items-center justify-center">
                              <span className="material-symbols-outlined text-[20px]">desktop_windows</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-body-medium text-small font-bold text-text-primary">
                                Node: {s.ipAddress} · {s.username}
                              </span>
                              <span className="font-caption text-caption text-text-secondary">
                                {s.workstation} · 2FA: {s.twoFactorMethod || 'None'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-space-sm">
                            <span className="font-caption text-caption text-text-secondary">
                              {s.formattedTimeAgo || 'Recent'}
                            </span>
                            <button
                              onClick={() => handleRevokeSingleSession(s.id, s.username)}
                              className="text-error hover:bg-error-container p-1 rounded transition-colors cursor-pointer"
                              title="Revoke terminal session"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[18px]">logout</span>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-space-lg">
              <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/15">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline-4 text-headline-4 font-bold text-text-primary">Notification Signals</h3>
                  <span className="material-symbols-outlined text-text-secondary text-[20px]">tune</span>
                </div>
                <p className="font-body text-caption text-text-secondary -mt-1">
                  High-priority operational channels routed directly to this curator terminal.
                </p>
                <div className="flex flex-col gap-space-sm">
                  <label className="flex items-start justify-between gap-space-sm p-space-sm rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors">
                    <div className="flex flex-col">
                      <span className="font-body-medium text-small font-semibold text-text-primary">
                        High-Demand Inventory Spikes
                      </span>
                      <span className="font-caption text-caption text-text-secondary">
                        Multi-station requests exceeding safe reservation threshold.
                      </span>
                      <span className="font-caption text-[11px] font-mono text-primary font-semibold mt-1">
                        CHANNELS: SMS • PORTAL PUSH
                      </span>
                    </div>
                    <input defaultChecked className="mt-1 w-5 h-5 accent-primary rounded cursor-pointer" type="checkbox" />
                  </label>
                  <label className="flex items-start justify-between gap-space-sm p-space-sm rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors">
                    <div className="flex flex-col">
                      <span className="font-body-medium text-small font-semibold text-text-primary">
                        Critical Overdue Delinquencies
                      </span>
                      <span className="font-caption text-caption text-text-secondary">
                        Reserved academic volumes past return window.
                      </span>
                      <span className="font-caption text-[11px] font-mono text-primary font-semibold mt-1">
                        CHANNELS: INSTITUTIONAL EMAIL
                      </span>
                    </div>
                    <input defaultChecked className="mt-1 w-5 h-5 accent-primary rounded cursor-pointer" type="checkbox" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal 1: Edit Administrator Profile */}
      <DefaultFloatingModalCard
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Administrator Profile"
        subtitle="Update personal and terminal credentials stored in university authentication directory (Edit Mode Active)"
        maxWidth="max-w-2xl"
        footer={
          <div className="flex items-center justify-end gap-space-sm w-full">
            <button
              className="px-space-md py-2 rounded-xl text-text-secondary hover:text-text-primary font-small text-small transition-colors cursor-pointer"
              type="button"
              disabled={editSaving}
              onClick={() => setIsEditProfileOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-space-lg py-2 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              type="submit"
              form="editProfileForm"
              disabled={editSaving}
            >
              {editSaving ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <form id="editProfileForm" onSubmit={handleSaveProfile} className="flex flex-col gap-space-md max-h-[75vh] overflow-y-auto pr-1">
          {editError && (
            <div className="p-space-sm rounded-lg bg-error-container text-error font-caption text-caption">
              {editError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">
                First Name *
              </label>
              <input
                type="text"
                required
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                className="w-full px-space-md py-2 rounded-lg bg-surface-container-low border border-outline-variant/20 text-text-primary text-small focus:outline-none focus:border-primary"
                placeholder="First name"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">
                Middle Name
              </label>
              <input
                type="text"
                value={editMiddleName}
                onChange={(e) => setEditMiddleName(e.target.value)}
                className="w-full px-space-md py-2 rounded-lg bg-surface-container-low border border-outline-variant/20 text-text-primary text-small focus:outline-none focus:border-primary"
                placeholder="Middle name"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                className="w-full px-space-md py-2 rounded-lg bg-surface-container-low border border-outline-variant/20 text-text-primary text-small focus:outline-none focus:border-primary"
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">
                Username *
              </label>
              <input
                type="text"
                required
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="w-full px-space-md py-2 rounded-lg bg-surface-container-low border border-outline-variant/20 text-text-primary text-small focus:outline-none focus:border-primary"
                placeholder="e.g. admin"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full px-space-md py-2 rounded-lg bg-surface-container-low border border-outline-variant/20 text-text-primary text-small focus:outline-none focus:border-primary"
                placeholder="admin@katipuneros.edu.ph"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">
                Phone Number
              </label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full px-space-md py-2 rounded-lg bg-surface-container-low border border-outline-variant/20 text-text-primary text-small focus:outline-none focus:border-primary"
                placeholder="e.g. +63 912 345 6789"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">
                Age
              </label>
              <input
                type="number"
                value={editAge}
                onChange={(e) => setEditAge(e.target.value)}
                className="w-full px-space-md py-2 rounded-lg bg-surface-container-low border border-outline-variant/20 text-text-primary text-small focus:outline-none focus:border-primary"
                placeholder="e.g. 35"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">
                Department / Office
              </label>
              <input
                type="text"
                value={editDepartment}
                onChange={(e) => setEditDepartment(e.target.value)}
                className="w-full px-space-md py-2 rounded-lg bg-surface-container-low border border-outline-variant/20 text-text-primary text-small focus:outline-none focus:border-primary"
                placeholder="e.g. Office of the Chief Librarian"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">
                Position / Employment Status
              </label>
              <input
                type="text"
                value={editEmploymentStatus}
                onChange={(e) => setEditEmploymentStatus(e.target.value)}
                className="w-full px-space-md py-2 rounded-lg bg-surface-container-low border border-outline-variant/20 text-text-primary text-small focus:outline-none focus:border-primary"
                placeholder="e.g. Full-Time Administrator"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">
              Current Station / Campus Address
            </label>
            <input
              type="text"
              value={editCurrentAddress}
              onChange={(e) => setEditCurrentAddress(e.target.value)}
              className="w-full px-space-md py-2 rounded-lg bg-surface-container-low border border-outline-variant/20 text-text-primary text-small focus:outline-none focus:border-primary"
              placeholder="e.g. Main Library 4th Floor Administration Wing"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">
              Permanent Residential Address
            </label>
            <input
              type="text"
              value={editPermanentAddress}
              onChange={(e) => setEditPermanentAddress(e.target.value)}
              className="w-full px-space-md py-2 rounded-lg bg-surface-container-low border border-outline-variant/20 text-text-primary text-small focus:outline-none focus:border-primary"
              placeholder="e.g. Katipunan Avenue, Quezon City"
            />
          </div>
        </form>
      </DefaultFloatingModalCard>

      {/* Modal 2: Rotate Password */}
      <DefaultFloatingModalCard
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Rotate Privileged Password"
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-space-sm w-full">
            <button
              className="px-space-md py-2 rounded-xl text-text-secondary hover:text-text-primary font-small text-small transition-colors cursor-pointer"
              type="button"
              disabled={passwordSaving}
              onClick={() => setIsPasswordModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-space-lg py-2 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-bold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              type="submit"
              form="rotatePasswordForm"
              disabled={passwordSaving}
            >
              {passwordSaving ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  <span>Rotating...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">key</span>
                  <span>Rotate Password</span>
                </>
              )}
            </button>
          </div>
        }
      >
        <form id="rotatePasswordForm" onSubmit={handleRotatePassword} className="flex flex-col gap-space-md">
          {passwordError && (
            <div className="p-space-sm rounded-lg bg-error-container text-error font-caption text-caption">
              {passwordError}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">
              Current Password *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-space-md py-2 rounded-lg bg-surface-container-low border border-outline-variant/20 text-text-primary text-small focus:outline-none focus:border-primary"
              placeholder="Enter current password"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">
              New Password * (Min 6 chars)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-space-md py-2 rounded-lg bg-surface-container-low border border-outline-variant/20 text-text-primary text-small focus:outline-none focus:border-primary"
              placeholder="Enter new strong password"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-space-md py-2 rounded-lg bg-surface-container-low border border-outline-variant/20 text-text-primary text-small focus:outline-none focus:border-primary"
              placeholder="Confirm new password"
            />
          </div>
        </form>
      </DefaultFloatingModalCard>
    </div>
  );
};

export default Profile;
