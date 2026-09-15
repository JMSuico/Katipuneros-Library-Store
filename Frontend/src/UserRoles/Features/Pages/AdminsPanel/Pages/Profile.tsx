// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// Profile.tsx -- Admin User Profile and System Credentials
// Converted directly from SidebarProfilePage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC } from 'react';

const Profile: FC = () => {
  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
<div className="flex flex-col gap-space-lg">
<div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
<div className="flex flex-col">
<div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption uppercase tracking-wider">
<span className="">Security &amp; Governance</span>
<span className="">/</span>
<span className="text-primary font-semibold">Institutional Clearance</span>
</div>
<h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight mt-1">Administrator Identity &amp; Security Credentials</h1>
<p className="font-body text-small text-text-secondary">Official institutional registry, privileged cryptographic credentials, and authenticated terminal telemetry.</p>
</div>
<div className="flex items-center gap-space-sm flex-wrap">
<button className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-full bg-surface-container-lowest text-primary hover:bg-secondary-container hover:text-on-secondary-container font-body-medium text-small font-semibold shadow-sm transition-all" type="button">
<span className="material-symbols-outlined text-[18px]">badge</span>
<span className="">Download Access Keycard</span>
</button>
<button className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-full bg-action-green text-text-primary hover:bg-action-green-hover font-body-medium text-small font-bold shadow-sm transition-all" type="button">
<span className="material-symbols-outlined text-[18px]">edit_square</span>
<span className="">Edit Profile Information</span>
</button>
</div>
</div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
<div className="lg:col-span-8 flex flex-col gap-space-lg">
<div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-xl shadow-sm">
<div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-secondary-container/30 blur-3xl pointer-events-none"></div>
<div className="flex flex-col md:flex-row gap-space-xl items-start relative z-10">
<div className="relative shrink-0">
<div className="w-36 h-36 rounded-2xl overflow-hidden shadow-md bg-surface-container">
<img alt="University Chief Curator &amp; Systems Director" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1WAm680ewfRvusuK9JsOkwTwjiqbB7NGKnOPdZV6yddZxRRfxPtJ1zZaaQw4yemCAdrWsijXuvh6gfPEQxLgiEwI5dfikGPX5r-lcbU6y8Vqtuxt7VeJ8tlXzN2qpBwwyivnj9DaiDzPoYbB72wtjkq1IEe46Azv0y0lzaHKc34XUiKk9_iF6mWTKH_QMvSmtEidh96_0ART1sQb7Yrl1NlbsHQ0PN1tSCPQAdpGFuv5t1Jz5c0JQ4zBQ" />
</div>
<span className="absolute -bottom-2 -right-2 bg-status-available text-surface-container-lowest text-caption font-caption font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
<span className="w-2 h-2 rounded-full bg-surface-container-lowest animate-pulse"></span>
                ACTIVE
              </span>
</div>
<div className="flex flex-col flex-1 min-w-0">
<div className="flex flex-wrap items-center gap-space-xs mb-1">
<span className="font-caption text-caption font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed">Level 4 Super Administrator</span>
<span className="font-caption text-caption px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-mono">KP-ADM-0001</span>
</div>
<h2 className="font-headline-3 text-headline-3 text-text-primary font-bold tracking-tight">Administrator (Super Admin)</h2>
<p className="font-body-large text-body-large text-primary font-semibold">University Chief Curator &amp; Systems Director</p>
<p className="font-body text-small text-text-secondary mt-0.5">Library Curatorial Board &amp; Academic Informatics</p>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mt-space-md pt-space-md bg-surface-container-low/60 p-space-md rounded-lg">
<div className="flex items-center gap-space-xs text-text-primary">
<span className="material-symbols-outlined text-primary text-[18px]">alternate_email</span>
<span className="font-body text-small truncate">super.admin@upk.edu.ph</span>
</div>
<div className="flex items-center gap-space-xs text-text-primary">
<span className="material-symbols-outlined text-primary text-[18px]">call</span>
<span className="font-body text-small">+63 (2) 8981-8500 ext. 4201</span>
</div>
<div className="flex items-center gap-space-xs text-text-primary">
<span className="material-symbols-outlined text-primary text-[18px]">meeting_room</span>
<span className="font-body text-small truncate">Room 304, Katipuneros Hall</span>
</div>
<div className="flex items-center gap-space-xs text-text-primary">
<span className="material-symbols-outlined text-primary text-[18px]">schedule</span>
<span className="font-body text-small">08:00 - 17:00 PHT (Morning Stacks)</span>
</div>
</div>
</div>
</div>
</div>
<div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[22px]">security</span>
<h3 className="font-headline-4 text-headline-4 text-text-primary">Privilege Matrix &amp; Cryptographic Keys</h3>
</div>
<span className="font-caption text-caption px-2.5 py-1 rounded-full bg-status-available/15 text-status-available font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">verified_user</span> Standard Compliant
            </span>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
<div className="p-space-md rounded-lg bg-surface-container-low flex flex-col justify-between gap-space-sm">
<div className="flex items-start justify-between">
<div>
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary">Password Security</span>
<h4 className="font-body-large text-body-large font-bold text-text-primary mt-1">Rotated 42 days ago</h4>
<p className="font-body text-caption text-text-secondary mt-0.5">Meets UPK 16-char salt + entropy policy.</p>
</div>
<span className="material-symbols-outlined text-primary text-[24px]">key</span>
</div>
<button className="w-full text-center py-1.5 px-space-sm rounded bg-surface-container-lowest hover:bg-secondary-container hover:text-on-secondary-container text-primary font-body-medium text-caption font-semibold transition-colors" type="button">
                Rotate Password Now
              </button>
</div>
<div className="p-space-md rounded-lg bg-surface-container-low flex flex-col justify-between gap-space-sm">
<div className="flex items-start justify-between">
<div>
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary">Multi-Factor Status</span>
<h4 className="font-body-large text-body-large font-bold text-text-primary mt-1">FIDO2 Hardware Key</h4>
<p className="font-body text-caption text-text-secondary mt-0.5">YubiKey 5C NFC + Katipuneros Authenticator App.</p>
</div>
<span className="material-symbols-outlined text-status-available text-[24px]">verified</span>
</div>
<button className="w-full text-center py-1.5 px-space-sm rounded bg-surface-container-lowest hover:bg-secondary-container hover:text-on-secondary-container text-primary font-body-medium text-caption font-semibold transition-colors" type="button">
                Manage Registered Tokens
              </button>
</div>
</div>
<div className="flex flex-col gap-space-xs mt-space-xs">
<div className="flex items-center justify-between">
<span className="font-caption text-caption font-semibold uppercase tracking-wider text-text-secondary">Active Privileged Sessions</span>
<button className="text-error hover:bg-error-container hover:text-on-error-container font-caption text-caption font-semibold px-2 py-1 rounded transition-colors flex items-center gap-1" type="button">
<span className="material-symbols-outlined text-[14px]">lock_reset</span> Terminate All Other Sessions
              </button>
</div>
<div className="overflow-hidden rounded-lg bg-surface-container-low">
<div className="p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm bg-secondary-container/40">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">laptop_mac</span>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-space-xs">
<span className="font-body-medium text-small font-bold text-text-primary">192.168.1.100</span>
<span className="font-caption text-[10px] px-1.5 py-0.2 rounded bg-primary text-on-primary font-bold">CURRENT</span>
</div>
<span className="font-caption text-caption text-text-secondary">Chrome 124 (macOS Sonoma) • Stacks Admin Suite (Room 304)</span>
</div>
</div>
<div className="flex items-center gap-space-xs">
<span className="w-2 h-2 rounded-full bg-status-available"></span>
<span className="font-caption text-caption font-bold text-status-available">Active Now</span>
</div>
</div>
<div className="p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-full bg-surface-container-highest text-text-secondary flex items-center justify-center">
<span className="material-symbols-outlined text-[20px]">desktop_windows</span>
</div>
<div className="flex flex-col">
<span className="font-body-medium text-small font-bold text-text-primary">192.168.10.42</span>
<span className="font-caption text-caption text-text-secondary">Firefox ESR • Katipuneros Circulation Desk Alpha</span>
</div>
</div>
<div className="flex items-center gap-space-sm">
<span className="font-caption text-caption text-text-secondary">Yesterday, 16:30 PHT</span>
<button className="text-error hover:bg-error-container p-1 rounded transition-colors" title="Revoke terminal session" type="button">
<span className="material-symbols-outlined text-[18px]">logout</span>
</button>
</div>
</div>
</div>
</div>
</div>
</div>
<div className="lg:col-span-4 flex flex-col gap-space-lg">
<div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<h3 className="font-headline-4 text-headline-4 text-text-primary">Notification Signals</h3>
<span className="material-symbols-outlined text-text-secondary text-[20px]">tune</span>
</div>
<p className="font-body text-caption text-text-secondary -mt-1">High-priority operational channels routed directly to this curator terminal.</p>
<div className="flex flex-col gap-space-sm">
<label className="flex items-start justify-between gap-space-sm p-space-sm rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors">
<div className="flex flex-col">
<span className="font-body-medium text-small font-semibold text-text-primary">High-Demand Inventory Spikes</span>
<span className="font-caption text-caption text-text-secondary">Multi-station requests exceeding safe reservation threshold.</span>
<span className="font-caption text-[11px] font-mono text-primary font-semibold mt-1">CHANNELS: SMS • PORTAL PUSH</span>
</div>
<input defaultChecked className="mt-1 w-5 h-5 accent-primary rounded cursor-pointer" type="checkbox" />
</label>
<label className="flex items-start justify-between gap-space-sm p-space-sm rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors">
<div className="flex flex-col">
<span className="font-body-medium text-small font-semibold text-text-primary">Critical Overdue Delinquencies</span>
<span className="font-caption text-caption text-text-secondary">Reserved academic volumes 14+ days past return window.</span>
<span className="font-caption text-[11px] font-mono text-primary font-semibold mt-1">CHANNELS: INSTITUTIONAL EMAIL</span>
</div>
<input defaultChecked className="mt-1 w-5 h-5 accent-primary rounded cursor-pointer" type="checkbox" />
</label>
<label className="flex items-start justify-between gap-space-sm p-space-sm rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors">
<div className="flex flex-col">
<span className="font-body-medium text-small font-semibold text-text-primary">RFID Hardware Anomalies</span>
<span className="font-caption text-caption text-text-secondary">Gate sensor de-sync, scanner battery drop, or offline gate.</span>
<span className="font-caption text-[11px] font-mono text-primary font-semibold mt-1">CHANNELS: INSTANT PUSH DISPATCH</span>
</div>
<input defaultChecked className="mt-1 w-5 h-5 accent-primary rounded cursor-pointer" type="checkbox" />
</label>
</div>
</div>
<div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<h3 className="font-headline-4 text-headline-4 text-text-primary">Curator Activity</h3>
<span className="font-caption text-caption text-primary font-semibold cursor-pointer hover:underline">Full Log</span>
</div>
<div className="relative pl-6 flex flex-col gap-space-md before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-highest">
<div className="relative flex flex-col gap-0.5">
<span className="absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-surface-container-lowest"></span>
<span className="font-body-medium text-small font-semibold text-text-primary">Catalog Schema Re-indexed</span>
<span className="font-caption text-caption text-text-secondary">Added 42 new metadata fields for Filipiniana rare editions</span>
<span className="font-caption text-[11px] font-mono text-text-secondary">10 mins ago • Stacks Admin Suite</span>
</div>
<div className="relative flex flex-col gap-0.5">
<span className="absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full bg-status-available ring-4 ring-surface-container-lowest"></span>
<span className="font-body-medium text-small font-semibold text-text-primary">Approved Faculty Reserve Batch</span>
<span className="font-caption text-caption text-text-secondary">18 monographs cleared for UP Diliman History Seminary</span>
<span className="font-caption text-[11px] font-mono text-text-secondary">1 hour ago • Stacks Admin Suite</span>
</div>
<div className="relative flex flex-col gap-0.5">
<span className="absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full bg-secondary ring-4 ring-surface-container-lowest"></span>
<span className="font-body-medium text-small font-semibold text-text-primary">Hardware Gate Calibrated</span>
<span className="font-caption text-caption text-text-secondary">RFID Terminal Beta-2 antenna signal retuned to 865.7 MHz</span>
<span className="font-caption text-[11px] font-mono text-text-secondary">Today, 09:15 PHT • Gate Terminal</span>
</div>
<div className="relative flex flex-col gap-0.5">
<span className="absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full bg-status-pending ring-4 ring-surface-container-lowest"></span>
<span className="font-body-medium text-small font-semibold text-text-primary">Security Audit Sign-off</span>
<span className="font-caption text-caption text-text-secondary">Validated monthly permission delegations for junior clerks</span>
<span className="font-caption text-[11px] font-mono text-text-secondary">Yesterday, 17:40 PHT • Remote VPN</span>
</div>
<div className="relative flex flex-col gap-0.5">
<span className="absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full bg-text-secondary ring-4 ring-surface-container-lowest"></span>
<span className="font-body-medium text-small font-semibold text-text-primary">Keycard Credentials Re-issued</span>
<span className="font-caption text-caption text-text-secondary">Generated new physical NFC badge for Prof. M. Santos</span>
<span className="font-caption text-[11px] font-mono text-text-secondary">2 days ago • Circulation Alpha</span>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
    </div>
  );
};

export default Profile;
