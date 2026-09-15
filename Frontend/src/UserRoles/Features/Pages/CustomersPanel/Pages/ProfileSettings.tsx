// [Layer: UserRoles/Features/Pages/CustomersPanel/Pages]
// ProfileSettings.tsx -- Customer Profile and Library Card Settings
// Converted directly from NavProfile&Settings/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const ProfileSettings: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
(function() {
      // Highlight active shell nav link for Profile
      const navLinks = document.querySelectorAll('header nav a');
      navLinks.forEach(link => {
        if (link.getAttribute('data-path') === 'profile' || link.getAttribute('data-path') === 'settings') {
          link.className = 'px-space-md py-space-xs bg-primary text-on-primary font-body-medium text-body-medium rounded-full shadow-sm transition-colors';
        }
      });

      // Quick toast notification helper
      function showToast(message: string) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-6 right-6 z-50 px-space-md py-space-sm bg-text-primary text-surface-container-lowest rounded-full shadow-xl flex items-center gap-2 font-body-medium text-body-medium transition-all transform duration-200';
        toast.innerHTML = '<span class="material-symbols-outlined text-action-green text-[20px]">check_circle</span><span>' + message + '</span>';
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => toast.remove(), 200);
        }, 2800);
      }

      // Tab switcher behavior
      const tabBtns = document.querySelectorAll('#patron-tabs .tab-btn');
      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          tabBtns.forEach(b => {
            b.className = 'tab-btn px-space-md py-space-xs rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest/60 font-body-medium text-body-medium flex items-center gap-space-xs shrink-0 transition-all';
          });
          btn.className = 'tab-btn px-space-md py-space-xs rounded-full bg-primary text-on-primary font-body-medium text-body-medium shadow-sm flex items-center gap-space-xs shrink-0 transition-all';
          
          const tabId = btn.getAttribute('data-tab');
          if (tabId === 'tab-personal') {
            document.getElementById('section-personal')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else if (tabId === 'tab-reminders') {
            document.getElementById('section-reminders')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else if (tabId === 'tab-preferences') {
            document.getElementById('section-preferences')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else if (tabId === 'tab-security') {
            document.getElementById('section-security')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });

      // Copy Card Number to Clipboard
      const copyBtn = document.getElementById('btn-copy-cardno');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          navigator.clipboard.writeText('KP-LIB-2024-08912-JD').then(() => {
            showToast('Library Card # copied to clipboard');
          }).catch(() => {
            showToast('Card # KP-LIB-2024-08912-JD');
          });
        });
      }

      // Save Profile & Preferences
      const saveBtn = document.getElementById('btn-save-profile');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          saveBtn.classList.add('scale-95');
          setTimeout(() => saveBtn.classList.remove('scale-95'), 150);
          showToast('Patron profile & dispatch rules updated');
        });
      }

      // Export Reading History
      const exportBtn = document.getElementById('btn-export-history');
      if (exportBtn) {
        exportBtn.addEventListener('click', () => {
          showToast('Preparing BibTeX & CSV reading log bundle...');
        });
      }
    })();

    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
{/* Top Academic Context Ribbon & Breadcrumbs */}
<section className="w-full px-margin pt-space-xl pb-space-lg">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
<div className="flex flex-col max-w-3xl">
<div className="flex items-center gap-space-xs text-secondary font-caption text-caption uppercase tracking-wider mb-space-xs">
<span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
<span className="">Patron Account &amp; Preferences</span>
<span className="text-outline-variant">•</span>
<span className="text-text-secondary font-medium">AY 2026–2027 Circulation Profile</span>
</div>
<h1 className="font-headline-1 text-headline-1 text-text-primary tracking-tight">
          Patron Profile &amp; Library Preferences
        </h1>
<p className="font-body text-body text-text-secondary mt-space-xs">
          Manage personal academic credentials, active library privileges, reminder notification gateways, reading preferences, and security credentials.
        </p>
</div>
<div className="flex items-center gap-space-sm shrink-0">
<button className="h-11 px-space-md rounded-full bg-surface-container-lowest/80 text-text-primary hover:bg-surface-container-lowest shadow-sm flex items-center gap-space-xs font-body-medium text-body-medium transition-all" id="btn-export-history" type="button">
<span className="material-symbols-outlined text-[20px] text-secondary">download</span>
<span className="">Export Reading History</span>
<span className="font-caption text-caption px-space-xs py-0.5 rounded bg-surface-container-high text-on-surface-variant ml-1">CSV / BibTeX</span>
</button>
<button className="h-11 px-space-lg rounded-full bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium flex items-center gap-space-xs shadow-md transition-all" id="btn-save-profile" type="button">
<span className="material-symbols-outlined text-[20px]">check_circle</span>
<span className="font-semibold">Save Profile &amp; Preferences</span>
</button>
</div>
</div>
</section>
{/* Patron Overview Hero Card (Bento Glassmorphic Layout) */}
<section className="w-full px-margin pb-space-xl">
<div className="w-full bg-surface-container-lowest/70 backdrop-blur-xl p-space-lg rounded-xl shadow-sm flex flex-col xl:flex-row gap-space-lg items-stretch">
{/* Left: Patron Identity Tile */}
<div className="flex items-center gap-space-md p-space-md bg-surface-container-low/70 rounded-lg xl:w-5/12">
<div className="relative shrink-0">
<div className="w-20 h-20 rounded-xl bg-cover bg-center overflow-hidden shadow-inner" data-alt="Close up photographic portrait of Jhon Doe, a Filipino male computer science student in his early twenties wearing neat dark casual attire inside a bright modernist academic library setting with soft morning window light and warm ambient highlights." style={{ backgroundImage: 'url(\'https://lh3.googleusercontent.com/aida-public/AB6AXuAzh7geDRwLaTPjz9-U4P9tyK71KOb6VdUZGTkX-HQ83tmlrMzRXuEyZhkJPbm1Ick4vy57Ido1x5I11a0BP40FVPLZmKuXt_rRjFWiQAcafoCJijMp9RUA2dBLr4pm31KPKyvZk5haRpHfrApiLiW5KB-i3P2XqqSmNYFOB5BJM3i6EeJTZzTx6-TqypFr_1mEKca6t5rRwBwaDVBrnkm1r8kaVYV_m6b25EcEJsFHzWliMTbxAfWz\')' }}>
</div>
<button aria-label="Change patron avatar" className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md hover:bg-primary-container transition-transform active:scale-95" type="button">
<span className="material-symbols-outlined text-[15px]">photo_camera</span>
</button>
</div>
<div className="flex flex-col min-w-0 flex-1">
<div className="flex items-center gap-space-xs">
<h2 className="font-headline-3 text-headline-3 text-text-primary truncate">Jhon Doe</h2>
<span className="material-symbols-outlined text-primary text-[20px]" title="Authenticated Patron Identity">check_circle</span>
</div>
<p className="font-small text-small text-text-secondary truncate mt-0.5">
            Patron ID: <strong className="text-text-primary font-semibold font-mono">#2024-08912</strong>
</p>
<p className="font-caption text-caption text-text-secondary truncate mt-0.5">
            BS Computer Science • College of Science
          </p>
<div className="mt-space-xs flex items-center gap-space-xs">
<span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-soft-blue text-secondary font-caption text-caption font-semibold tracking-wide">
<span className="w-1.5 h-1.5 rounded-full bg-status-available animate-pulse"></span>
              Active Patron • Good Standing
            </span>
<span className="font-caption text-caption text-text-secondary hidden sm:inline">Tier 1 Concurrency</span>
</div>
</div>
</div>
{/* Right: Real-time Concurrency & Standing Metrics */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-space-sm xl:w-7/12">
{/* Metric 1: Active Loans */}
<div className="p-space-md rounded-lg bg-surface-container-lowest/90 flex flex-col justify-between shadow-sm">
<div className="flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Active Loans</span>
<span className="material-symbols-outlined text-secondary text-[20px]">menu_book</span>
</div>
<div className="my-space-xs">
<div className="flex items-baseline gap-1">
<span className="font-headline-2 text-headline-2 text-text-primary leading-none">02</span>
<span className="font-body text-body text-text-secondary">/ 04</span>
</div>
<div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-space-xs overflow-hidden">
<div className="bg-primary h-full rounded-full" style={{ width: '50%' }}></div>
</div>
</div>
<span className="font-caption text-caption text-text-secondary">Due: Nov 14, 2026</span>
</div>
{/* Metric 2: Active Holds */}
<div className="p-space-md rounded-lg bg-surface-container-lowest/90 flex flex-col justify-between shadow-sm">
<div className="flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Active Holds</span>
<span className="material-symbols-outlined text-status-pending text-[20px]">bookmark</span>
</div>
<div className="my-space-xs">
<div className="flex items-baseline gap-1">
<span className="font-headline-2 text-headline-2 text-text-primary leading-none">03</span>
<span className="font-body text-body text-text-secondary">/ 05</span>
</div>
<div className="w-full bg-surface-container-highest h-1.5 rounded-full mt-space-xs overflow-hidden">
<div className="bg-status-pending h-full rounded-full" style={{ width: '60%' }}></div>
</div>
</div>
<span className="font-caption text-caption text-text-primary font-medium truncate">1 Staged at Locker #B-04</span>
</div>
{/* Metric 3: Outstanding Fines */}
<div className="p-space-md rounded-lg bg-surface-container-lowest/90 flex flex-col justify-between shadow-sm">
<div className="flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Balance / Fines</span>
<span className="material-symbols-outlined text-status-available text-[20px]">account_balance_wallet</span>
</div>
<div className="my-space-xs">
<span className="font-headline-2 text-headline-2 text-status-available leading-none">₱0.00</span>
<p className="font-caption text-caption text-text-secondary mt-1">Zero delinquent fee</p>
</div>
<span className="font-caption text-caption text-status-available font-semibold">Clear Account</span>
</div>
{/* Metric 4: Merit Points */}
<div className="p-space-md rounded-lg bg-surface-container-lowest/90 flex flex-col justify-between shadow-sm">
<div className="flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Merit Score</span>
<span className="material-symbols-outlined text-primary text-[20px]">military_tech</span>
</div>
<div className="my-space-xs">
<span className="font-headline-2 text-headline-2 text-text-primary leading-none">1,240</span>
<p className="font-caption text-caption text-text-secondary mt-1">Top 5% Timely Return</p>
</div>
<span className="font-caption text-caption text-primary font-medium">Priority Hold Tier</span>
</div>
</div>
</div>
</section>
{/* Interactive Tab Switcher Navigation */}
<section className="w-full px-margin mb-space-lg">
<div className="w-full p-1.5 rounded-full bg-surface-container/80 backdrop-blur-md flex items-center gap-1 overflow-x-auto shadow-inner" id="patron-tabs">
<button className="tab-btn px-space-md py-space-xs rounded-full bg-primary text-on-primary font-body-medium text-body-medium shadow-sm flex items-center gap-space-xs shrink-0 transition-all" data-tab="tab-personal" type="button">
<span className="material-symbols-outlined text-[18px]">badge</span>
<span className="">Personal &amp; Academic Info</span>
</button>
<button className="tab-btn px-space-md py-space-xs rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest/60 font-body-medium text-body-medium flex items-center gap-space-xs shrink-0 transition-all" data-tab="tab-reminders" type="button">
<span className="material-symbols-outlined text-[18px]">notifications_active</span>
<span className="">Reminders &amp; Notification Channels</span>
</button>
<button className="tab-btn px-space-md py-space-xs rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest/60 font-body-medium text-body-medium flex items-center gap-space-xs shrink-0 transition-all" data-tab="tab-preferences" type="button">
<span className="material-symbols-outlined text-[18px]">tune</span>
<span className="">Borrowing &amp; Reading Preferences</span>
</button>
<button className="tab-btn px-space-md py-space-xs rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest/60 font-body-medium text-body-medium flex items-center gap-space-xs shrink-0 transition-all" data-tab="tab-security" type="button">
<span className="material-symbols-outlined text-[18px]">shield</span>
<span className="">Security &amp; Connected Devices</span>
</button>
</div>
</section>
{/* Main Multi-Column Settings Body */}
<section className="w-full px-margin pb-space-3xl">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
{/* LEFT COLUMN (Primary Content Panels: 7 of 12 cols = approx 60%) */}
<div className="lg:col-span-7 flex flex-col gap-space-xl min-w-0">
{/* SECTION 1: Academic Patron Identity & Contact Information */}
<div className="p-space-lg rounded-xl bg-surface-container-lowest/80 backdrop-blur-xl shadow-sm flex flex-col gap-space-lg" id="section-personal">
<div className="flex items-center justify-between pb-space-xs">
<div>
<span className="font-caption text-caption text-secondary uppercase tracking-wider font-semibold">Institutional Registry</span>
<h3 className="font-headline-3 text-headline-3 text-text-primary">Academic Patron Identity</h3>
</div>
<span className="px-space-sm py-1 rounded-full bg-soft-blue text-secondary font-caption text-caption font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">lock</span>
              Registrar Verified
            </span>
</div>
{/* Form Fields Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
{/* Full Legal Name */}
<div className="flex flex-col gap-1.5">
<label className="font-small text-small text-text-secondary font-medium" htmlFor="patron-fullname">
                Full Legal Name
              </label>
<div className="relative">
<input className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-text-primary font-body text-body focus:bg-surface-container-lowest outline-none transition-colors" id="patron-fullname" type="text" value="Jhonathan M. Doe" />
<span className="material-symbols-outlined absolute right-3 top-2.5 text-text-secondary text-[20px]">person</span>
</div>
</div>
{/* University Email */}
<div className="flex flex-col gap-1.5">
<label className="font-small text-small text-text-secondary font-medium" htmlFor="patron-email">
                Institutional Email (SSO Identity)
              </label>
<div className="relative">
<input className="w-full h-11 px-space-md rounded-lg bg-surface-container text-text-secondary font-body text-body outline-none cursor-not-allowed pr-10" id="patron-email" readOnly={true} type="email" value="jhon.doe@university.edu.ph" />
<span className="material-symbols-outlined absolute right-3 top-2.5 text-status-available text-[20px]" title="University GSuite Bound">verified</span>
</div>
</div>
{/* Alternate Contact / Mobile Number */}
<div className="flex flex-col gap-1.5">
<div className="flex items-center justify-between">
<label className="font-small text-small text-text-secondary font-medium" htmlFor="patron-phone">
                  Mobile Number (SMS Delivery)
                </label>
<span className="font-caption text-caption text-status-available font-semibold">Verified Active</span>
</div>
<div className="relative">
<input className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-text-primary font-body text-body focus:bg-surface-container-lowest outline-none transition-colors" id="patron-phone" type="tel" value="+63 917 555 0192" />
<span className="material-symbols-outlined absolute right-3 top-2.5 text-secondary text-[20px]">smartphone</span>
</div>
</div>
{/* Student ID */}
<div className="flex flex-col gap-1.5">
<label className="font-small text-small text-text-secondary font-medium" htmlFor="patron-id">
                Student &amp; Matriculation ID
              </label>
<input className="w-full h-11 px-space-md rounded-lg bg-surface-container text-text-secondary font-mono text-body outline-none cursor-not-allowed" id="patron-id" readOnly={true} type="text" value="2024-08912-MN-0" />
</div>
{/* College & Department */}
<div className="flex flex-col gap-1.5">
<label className="font-small text-small text-text-secondary font-medium" htmlFor="patron-dept">
                Academic Unit / Department
              </label>
<input className="w-full h-11 px-space-md rounded-lg bg-surface-container text-text-secondary font-body text-body outline-none cursor-not-allowed" id="patron-dept" readOnly={true} type="text" value="Department of Computer Science" />
</div>
{/* Card Expiration Date */}
<div className="flex flex-col gap-1.5">
<label className="font-small text-small text-text-secondary font-medium" htmlFor="patron-expiry">
                Library Card Valid Through
              </label>
<div className="relative">
<input className="w-full h-11 px-space-md rounded-lg bg-surface-container text-text-secondary font-body text-body outline-none cursor-not-allowed" id="patron-expiry" readOnly={true} type="text" value="June 30, 2027 (Undergrad Cycle)" />
<span className="material-symbols-outlined absolute right-3 top-2.5 text-text-secondary text-[20px]">event_available</span>
</div>
</div>
</div>
{/* Academic Affiliation Note */}
<div className="p-space-md rounded-lg bg-soft-blue/40 flex items-start gap-space-sm">
<span className="material-symbols-outlined text-primary shrink-0 mt-0.5 text-[20px]">info</span>
<div className="flex flex-col">
<p className="font-small text-small text-text-primary font-medium">Undergraduate Thesis Privilege Tier</p>
<p className="font-caption text-caption text-text-secondary">
                You are enrolled in CS Special Project 199. You qualify for an extended loan term (14 calendar days) with automated 7-day single renewals.
              </p>
</div>
<button className="ml-auto text-primary font-small text-small font-semibold hover:underline shrink-0" type="button">
              Upgrade Tier
            </button>
</div>
</div>
{/* SECTION 2: Circulation Reminders & Notification Dispatch Preferences */}
<div className="p-space-lg rounded-xl bg-surface-container-lowest/80 backdrop-blur-xl shadow-sm flex flex-col gap-space-lg" id="section-reminders">
<div className="flex flex-col">
<span className="font-caption text-caption text-secondary uppercase tracking-wider font-semibold">Circulation Gateways</span>
<h3 className="font-headline-3 text-headline-3 text-text-primary">Reminders &amp; Dispatch Channels</h3>
<p className="font-small text-small text-text-secondary mt-0.5">
              Customize real-time triggers to keep accounts fine-free and collect ready hold books from automated locker banks.
            </p>
</div>
{/* Toggles List */}
<div className="flex flex-col gap-space-md">
{/* Toggle 1: Loan Pre-alert */}
<div className="p-space-md rounded-lg bg-surface-container-low/60 flex items-center justify-between gap-space-md">
<div className="flex items-start gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[22px]">alarm</span>
</div>
<div className="flex flex-col">
<span className="font-body-medium text-body-medium text-text-primary font-semibold">Due Date Pre-Alerts (48 Hours Prior)</span>
<p className="font-caption text-caption text-text-secondary">Dispatches impending return warnings two calendar days prior to the 5:00 PM circulation cut-off.</p>
</div>
</div>
<label className="relative inline-flex items-center cursor-pointer shrink-0">
<input defaultChecked className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-defaultChecked:after:translate-x-full peer-defaultChecked:after:border-surface-container-lowest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-defaultChecked:bg-action-green"></div>
</label>
</div>
{/* Toggle 2: Locker Staging Alert */}
<div className="p-space-md rounded-lg bg-surface-container-low/60 flex items-center justify-between gap-space-md">
<div className="flex items-start gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-status-available/20 text-status-available flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[22px]">markunread_mailbox</span>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-1.5">
<span className="font-body-medium text-body-medium text-text-primary font-semibold">Staged Hold &amp; Smart Locker Pickup Alerts</span>
<span className="px-1.5 py-0.5 rounded bg-action-green/30 text-text-primary font-caption text-caption font-semibold uppercase">Instant</span>
</div>
<p className="font-caption text-caption text-text-secondary">Instant PIN code and dynamic barcode sent the moment staff deposits the item into Locker Bank B.</p>
</div>
</div>
<label className="relative inline-flex items-center cursor-pointer shrink-0">
<input defaultChecked className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-defaultChecked:after:translate-x-full peer-defaultChecked:after:border-surface-container-lowest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-defaultChecked:bg-action-green"></div>
</label>
</div>
{/* Toggle 3: Queue Progress */}
<div className="p-space-md rounded-lg bg-surface-container-low/60 flex items-center justify-between gap-space-md">
<div className="flex items-start gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-status-pending/20 text-status-pending flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[22px]">hourglass_top</span>
</div>
<div className="flex flex-col">
<span className="font-body-medium text-body-medium text-text-primary font-semibold">Reservation Queue &amp; Position Updates</span>
<p className="font-caption text-caption text-text-secondary">Notify me when high-demand titles advance in queue position (e.g. from #3 to #1).</p>
</div>
</div>
<label className="relative inline-flex items-center cursor-pointer shrink-0">
<input defaultChecked className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-defaultChecked:after:translate-x-full peer-defaultChecked:after:border-surface-container-lowest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-defaultChecked:bg-action-green"></div>
</label>
</div>
{/* Toggle 4: Delinquency & Grace Period Notice */}
<div className="p-space-md rounded-lg bg-surface-container-low/60 flex items-center justify-between gap-space-md">
<div className="flex items-start gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-status-danger/20 text-status-danger flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[22px]">warning</span>
</div>
<div className="flex flex-col">
<span className="font-body-medium text-body-medium text-text-primary font-semibold">Delinquency &amp; Grace Period Window Notice</span>
<p className="font-caption text-caption text-text-secondary">High-urgency dispatch 6 hours before overdue penalty begins calculating (₱20.00 / day).</p>
</div>
</div>
<label className="relative inline-flex items-center cursor-pointer shrink-0">
<input defaultChecked className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-defaultChecked:after:translate-x-full peer-defaultChecked:after:border-surface-container-lowest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-defaultChecked:bg-action-green"></div>
</label>
</div>
</div>
{/* Channel Dispatch Matrix */}
<div className="p-space-md rounded-lg bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
<span className="font-small text-small text-text-primary font-semibold">Active Dispatch Routing Matrix</span>
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead>
<tr className="text-caption font-caption text-text-secondary">
<th className="pb-2 font-medium">Notification Type</th>
<th className="pb-2 font-medium text-center">SMS Alert</th>
<th className="pb-2 font-medium text-center">University Email</th>
<th className="pb-2 font-medium text-center">Mobile Push</th>
</tr>
</thead>
<tbody className="text-small font-small divide-y divide-surface-container-high/40">
<tr>
<td className="py-2.5 text-text-primary font-medium">Hold Ready for Pickup</td>
<td className="py-2.5 text-center"><input defaultChecked className="rounded text-primary focus:ring-0" type="checkbox" /></td>
<td className="py-2.5 text-center"><input defaultChecked className="rounded text-primary focus:ring-0" type="checkbox" /></td>
<td className="py-2.5 text-center"><input defaultChecked className="rounded text-primary focus:ring-0" type="checkbox" /></td>
</tr>
<tr>
<td className="py-2.5 text-text-primary font-medium">Due Date in 48 Hours</td>
<td className="py-2.5 text-center"><input className="rounded text-primary focus:ring-0" type="checkbox" /></td>
<td className="py-2.5 text-center"><input defaultChecked className="rounded text-primary focus:ring-0" type="checkbox" /></td>
<td className="py-2.5 text-center"><input defaultChecked className="rounded text-primary focus:ring-0" type="checkbox" /></td>
</tr>
<tr>
<td className="py-2.5 text-text-primary font-medium">Overdue / Delinquency Notice</td>
<td className="py-2.5 text-center"><input defaultChecked className="rounded text-primary focus:ring-0" type="checkbox" /></td>
<td className="py-2.5 text-center"><input defaultChecked className="rounded text-primary focus:ring-0" type="checkbox" /></td>
<td className="py-2.5 text-center"><input defaultChecked className="rounded text-primary focus:ring-0" type="checkbox" /></td>
</tr>
<tr>
<td className="py-2.5 text-text-primary font-medium">Monthly Stacks Digest</td>
<td className="py-2.5 text-center"><input className="rounded text-primary focus:ring-0" type="checkbox" /></td>
<td className="py-2.5 text-center"><input defaultChecked className="rounded text-primary focus:ring-0" type="checkbox" /></td>
<td className="py-2.5 text-center"><input className="rounded text-primary focus:ring-0" type="checkbox" /></td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</div>
{/* RIGHT COLUMN (Cards, Physical Credential, Preferences: 5 of 12 cols = approx 40%) */}
<div className="lg:col-span-5 flex flex-col gap-space-xl">
{/* SECTION 3: Visual Virtual Library Card & Barcode Display */}
<div className="p-space-lg rounded-xl bg-surface-container-lowest/80 backdrop-blur-xl shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<span className="font-caption text-caption text-secondary uppercase tracking-wider font-semibold">Physical Kiosk Pass</span>
<span className="material-symbols-outlined text-text-secondary text-[18px]">nfc</span>
</div>
{/* Academic Card Element */}
<div className="relative w-full rounded-xl overflow-hidden p-space-lg text-on-primary shadow-xl flex flex-col justify-between" style={{ background: 'linear-gradient(135deg, #0f3d4f 0%, #164e63 60%, #1e627d 100%)', aspectRatio: '1.586/1' }}>
{/* Top Card Header */}
<div className="flex items-start justify-between relative z-10">
<div className="flex items-center gap-space-xs">
<div className="w-8 h-8 rounded-lg bg-action-green text-text-primary flex items-center justify-center font-bold shadow">
<span className="material-symbols-outlined text-[20px]">local_library</span>
</div>
<div className="flex flex-col">
<span className="font-headline-4 text-headline-4 text-on-primary tracking-tight leading-tight">KATIPUNEROS</span>
<span className="font-caption text-[10px] text-primary-fixed uppercase tracking-widest leading-none">University Stacks</span>
</div>
</div>
<div className="w-9 h-9 rounded-full bg-surface-container-lowest/15 flex items-center justify-center backdrop-blur-sm">
<span className="material-symbols-outlined text-action-green text-[22px]">contactless</span>
</div>
</div>
{/* Card Middle / Patron Name & Chip */}
<div className="flex items-center justify-between my-auto relative z-10">
<div className="flex flex-col">
<span className="font-caption text-[11px] text-primary-fixed uppercase tracking-wider">Patron Name</span>
<span className="font-headline-4 text-headline-4 text-on-primary font-bold tracking-normal">JHONATHAN M. DOE</span>
<span className="font-caption text-caption text-secondary-fixed opacity-90">College of Science • Undergrad</span>
</div>
{/* Gold Holographic Seal */}
<div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 shadow-md flex items-center justify-center text-text-primary opacity-90">
<span className="material-symbols-outlined text-[24px]">verified</span>
</div>
</div>
{/* Card Bottom Barcode & Machine Readable Code */}
<div className="pt-space-xs relative z-10 flex flex-col gap-1">
<div className="flex items-center justify-between font-mono text-[11px] text-primary-fixed tracking-wider">
<span className="">CARD # KP-LIB-2024-08912-JD</span>
<span className="">EXP 06/27</span>
</div>
{/* High-Fidelity SVG Barcode */}
<div className="bg-surface-container-lowest/95 p-1.5 rounded flex items-center justify-center">
<svg className="w-full h-8 text-text-primary" fill="currentColor" viewBox="0 0 240 32">
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
{/* Card Actions */}
<div className="grid grid-cols-2 gap-space-xs pt-space-xs">
<button className="h-10 px-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container-high text-text-primary font-small text-small font-medium flex items-center justify-center gap-1 transition-colors" id="btn-copy-cardno" type="button">
<span className="material-symbols-outlined text-[18px] text-secondary">content_copy</span>
<span className="">Copy Card No.</span>
</button>
<button className="h-10 px-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container-high text-text-primary font-small text-small font-medium flex items-center justify-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-[18px] text-primary">qr_code_2</span>
<span className="">Enlarge QR Pass</span>
</button>
</div>
</div>
{/* SECTION 4: Digital Reading & Catalog Preferences */}
<div className="p-space-lg rounded-xl bg-surface-container-lowest/80 backdrop-blur-xl shadow-sm flex flex-col gap-space-md" id="section-preferences">
<div>
<span className="font-caption text-caption text-secondary uppercase tracking-wider font-semibold">Fulfillment Logistics</span>
<h3 className="font-headline-4 text-headline-4 text-text-primary">Reading &amp; Staging Preferences</h3>
</div>
{/* Default Pickup Locker / Staging Location */}
<div className="flex flex-col gap-1.5">
<label className="font-small text-small text-text-secondary font-medium" htmlFor="default-bay">
              Default Physical Pickup Bay
            </label>
<div className="relative">
<select className="w-full h-11 px-space-md rounded-lg bg-surface-container-low text-text-primary font-body text-body appearance-none pr-10 outline-none focus:bg-surface-container-lowest transition-colors" id="default-bay">
<option selected={true}>Smart Locker Bank B — Science Hall (24/7 Access)</option>
<option>Bay 01 — Main Central Circulation Desk (Library 2F)</option>
<option>Smart Locker Bank A — Engineering Arcade</option>
<option>Bay 04 — Graduate &amp; Reserved Reading Lounge</option>
</select>
<span className="material-symbols-outlined absolute right-3 top-2.5 text-text-secondary text-[20px] pointer-events-none">expand_more</span>
</div>
</div>
{/* Preferred Academic Fields / Chip Matrix */}
<div className="flex flex-col gap-1.5">
<div className="flex items-center justify-between">
<label className="font-small text-small text-text-secondary font-medium">
                Recommendation Tags
              </label>
<span className="font-caption text-caption text-text-secondary">4 active topics</span>
</div>
<div className="flex flex-wrap gap-1.5" id="interest-chips">
<span className="px-space-md py-1 rounded-full bg-primary text-on-primary font-small text-small flex items-center gap-1 cursor-pointer">
<span className="">Computer Science</span>
<span className="material-symbols-outlined text-[16px]">close</span>
</span>
<span className="px-space-md py-1 rounded-full bg-primary text-on-primary font-small text-small flex items-center gap-1 cursor-pointer">
<span className="">Artificial Intelligence</span>
<span className="material-symbols-outlined text-[16px]">close</span>
</span>
<span className="px-space-md py-1 rounded-full bg-primary text-on-primary font-small text-small flex items-center gap-1 cursor-pointer">
<span className="">Philippine History</span>
<span className="material-symbols-outlined text-[16px]">close</span>
</span>
<span className="px-space-md py-1 rounded-full bg-primary text-on-primary font-small text-small flex items-center gap-1 cursor-pointer">
<span className="">Software Architecture</span>
<span className="material-symbols-outlined text-[16px]">close</span>
</span>
<button className="px-space-sm py-1 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-text-primary font-small text-small flex items-center gap-0.5" type="button">
<span className="material-symbols-outlined text-[16px]">add</span>
<span className="">Add Tag</span>
</button>
</div>
</div>
{/* Auto-Renew Switch */}
<div className="p-space-md rounded-lg bg-surface-container-low flex items-center justify-between gap-space-sm">
<div className="flex flex-col pr-space-xs">
<span className="font-body-medium text-body-medium text-text-primary font-semibold">Auto-Renew Eligible Loans</span>
<span className="font-caption text-caption text-text-secondary">Renews for 7 days automatically if no student has staged a pending hold queue.</span>
</div>
<label className="relative inline-flex items-center cursor-pointer shrink-0">
<input defaultChecked className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-defaultChecked:after:translate-x-full peer-defaultChecked:after:border-surface-container-lowest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-defaultChecked:bg-action-green"></div>
</label>
</div>
</div>
{/* SECTION 5: Security, Privacy & Session Management */}
<div className="p-space-lg rounded-xl bg-surface-container-lowest/80 backdrop-blur-xl shadow-sm flex flex-col gap-space-md" id="section-security">
<div className="flex items-center justify-between">
<div>
<span className="font-caption text-caption text-secondary uppercase tracking-wider font-semibold">Authentication &amp; Sessions</span>
<h3 className="font-headline-4 text-headline-4 text-text-primary">Account Security</h3>
</div>
<span className="material-symbols-outlined text-status-available text-[22px]">security</span>
</div>
{/* Active Session Info */}
<div className="p-space-md rounded-lg bg-surface-container-low flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-text-primary shadow-sm">
<span className="material-symbols-outlined text-[20px]">laptop_mac</span>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-1.5">
<span className="font-body-medium text-body-medium text-text-primary font-semibold">MacBook Pro 16"</span>
<span className="w-2 h-2 rounded-full bg-status-available"></span>
<span className="font-caption text-caption text-status-available font-semibold">Current</span>
</div>
<span className="font-caption text-caption text-text-secondary">Manila, PH • IP: 112.198.102.44</span>
</div>
</div>
<span className="font-caption text-caption text-text-secondary font-mono">Chrome 129</span>
</div>
{/* University Single Sign-On Status */}
<div className="p-space-md rounded-lg bg-surface-container-low flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
<span className="material-symbols-outlined text-[20px]">domain</span>
</div>
<div className="flex flex-col">
<span className="font-body-medium text-body-medium text-text-primary font-semibold">Google Workspace SSO</span>
<span className="font-caption text-caption text-text-secondary">Linked: jhon.doe@university.edu.ph</span>
</div>
</div>
<span className="px-space-sm py-1 rounded-full bg-status-available/20 text-status-available font-caption text-caption font-bold">
              Connected
            </span>
</div>
{/* Quick Action Buttons */}
<div className="flex flex-col gap-space-xs pt-space-xs">
<button className="w-full h-11 px-space-md rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-text-primary font-body-medium text-body-medium flex items-center justify-between transition-colors" type="button">
<span className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[20px] text-secondary">pin</span>
<span className="">Change Circulation Desk PIN / Password</span>
</span>
<span className="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
<button className="w-full h-11 px-space-md rounded-lg bg-surface-container-low hover:bg-error-container text-error font-body-medium text-body-medium flex items-center justify-between transition-colors" type="button">
<span className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[20px]">logout</span>
<span className="">Terminate All Other Browser Sessions</span>
</span>
<span className="font-caption text-caption">1 other</span>
</button>
</div>
{/* Delinquency Notice / Policy Warning */}
<div className="p-space-md rounded-lg bg-surface-container-low/50 flex items-start gap-space-xs text-caption font-caption text-text-secondary">
<span className="material-symbols-outlined text-[16px] text-text-secondary mt-0.5">policy</span>
<p className="">
              Patron privileges expire annually at registrar year-end. For account clearance, lost physical cards, or special thesis stack access, visit the Main Circulation Desk at Katipuneros Central Hall.
            </p>
</div>
</div>
</div>
</div>
</section>
{/* Client-Side Micro-Interactions Script */}

</div>
    </div>
  );
};

export default ProfileSettings;
