// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// Notifications.tsx -- Admin Notification Center and Alerts
// Converted directly from SidebarNotificationPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const Notifications: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
(function syncAdminShell() {
      const breadcrumb = document.querySelector('header nav');
      if (breadcrumb) {
        breadcrumb.innerHTML = `
          <span class="hover:text-text-primary cursor-pointer transition-colors">Admin Console</span>
          <span class="material-symbols-outlined text-[14px]">chevron_right</span>
          <span class="hover:text-text-primary cursor-pointer transition-colors">Communication</span>
          <span class="material-symbols-outlined text-[14px]">chevron_right</span>
          <span class="text-primary font-semibold">Notifications</span>
        `;
      }
      const activeLink = document.querySelector('aside a[data-path="notifications"]');
      if (activeLink) {
        document.querySelectorAll('aside nav a').forEach(el => {
          el.className = "flex items-center gap-space-sm px-space-md py-1.5 rounded-lg text-text-secondary hover:bg-surface-container hover:text-on-surface transition-colors";
        });
        activeLink.className = "flex items-center gap-space-sm px-space-md py-1.5 rounded-lg bg-soft-blue text-primary font-bold shadow-sm";
      }
    })();


function switchTab(btn, panelId) {
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.className = "tab-btn px-space-md py-2.5 rounded-full bg-surface-container-lowest text-text-secondary hover:text-text-primary font-small text-small font-semibold shadow-sm transition-all flex items-center gap-2";
      });
      btn.className = "tab-btn px-space-md py-2.5 rounded-full bg-primary text-on-primary font-small text-small font-semibold shadow-sm transition-all flex items-center gap-2";

      document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
      const activePanel = document.getElementById(panelId);
      if (activePanel) {
        activePanel.classList.remove('hidden');
      }
    }

    function resolveAllAlerts() {
      const feed = document.querySelector('#tab-system-alerts .flex-col.gap-space-md');
      if (feed) {
        feed.innerHTML = `
          <div class="p-space-xl rounded-xl bg-surface-container-low text-center flex flex-col items-center justify-center gap-space-sm">
            <div class="w-12 h-12 rounded-full bg-status-available/20 text-status-available flex items-center justify-center">
              <span class="material-symbols-outlined text-[28px]">task_alt</span>
            </div>
            <p class="font-headline-4 text-headline-4 text-text-primary">All System Alerts Resolved</p>
            <p class="font-small text-small text-text-secondary max-w-md">No pending hardware failures or inventory deficit triggers are currently queued for administrator intervention.</p>
          </div>
        `;
      }
    }
try { w.switchTab = switchTab; } catch (_) {}
    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
{/* Shell Context Update Script (Sync Breadcrumbs & Nav Active State) */}

{/* Top Action Header Banner */}
<div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md pb-space-lg">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-space-sm">
<span className="px-space-sm py-0.5 rounded-full bg-primary/10 text-primary font-caption text-caption font-semibold tracking-wide uppercase">Institutional Dispatch Hub</span>
<span className="flex items-center gap-1 text-text-secondary font-caption text-caption">
<span className="w-2 h-2 rounded-full bg-action-green animate-pulse"></span>
          Gateways Active (Email, SMS, Webhook)
        </span>
</div>
<h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">Institutional Communications &amp; Dispatch Center</h1>
<p className="font-body text-body text-text-secondary">Orchestrate university-wide bulletins, patron recall sequences, and real-time administrative system triggers.</p>
</div>
{/* Quick Action Bar */}
<div className="flex flex-wrap items-center gap-space-sm">
<button className="h-11 px-space-md rounded-full bg-action-green text-text-primary hover:bg-action-green-hover font-small text-small font-bold flex items-center gap-space-xs shadow-sm transition-all duration-200" onClick={() => { document.getElementById('broadcast-modal')?.classList.toggle('hidden'); }} type="button">
<span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: '\'FILL\' 1' }}>campaign</span>
<span className="">Broadcast System Announcement</span>
</button>
<button className="h-11 px-space-md rounded-full bg-surface-container-lowest text-text-primary hover:bg-surface-container font-small text-small font-semibold flex items-center gap-space-xs shadow-sm transition-colors" type="button">
<span className="material-symbols-outlined text-[18px] text-secondary">tune</span>
<span className="">Configure Dispatch Templates</span>
</button>
<button className="h-11 px-space-md rounded-full bg-surface-container hover:bg-surface-variant text-text-secondary hover:text-text-primary font-small text-small font-medium flex items-center gap-space-xs transition-colors" onClick={(e) => { (window as any).resolveAllAlerts?.(); }} type="button">
<span className="material-symbols-outlined text-[18px]">done_all</span>
<span className="">Mark All Resolved</span>
</button>
</div>
</div>
{/* Communication Hub Metrics (Bento Mosaic) */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-xl">
{/* Metric 1: Automated Queue */}
<div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between group">
<div className="flex items-start justify-between">
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Today's Dispatch Queue</span>
<div className="flex items-baseline gap-space-xs mt-1">
<span className="font-headline-1 text-headline-1 text-text-primary leading-none">342</span>
<span className="font-caption text-caption text-text-secondary">dispatched</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[22px]">send_time_extension</span>
</div>
</div>
<div className="mt-space-md pt-space-xs flex items-center justify-between">
<div className="flex items-center gap-1 font-caption text-caption text-text-secondary">
<span className="w-2 h-2 rounded-full bg-primary"></span> 210 Email
          <span className="mx-1">•</span>
<span className="w-2 h-2 rounded-full bg-action-green"></span> 98 SMS
          <span className="mx-1">•</span>
<span className="w-2 h-2 rounded-full bg-status-pending"></span> 34 Push
        </div>
<span className="font-caption text-caption text-primary font-semibold hover:underline cursor-pointer">Logs →</span>
</div>
</div>
{/* Metric 2: Delivery Success Rate with inline SVG Spark Donut */}
<div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex items-center justify-between">
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Delivery Reliability</span>
<div className="flex items-baseline gap-space-xs mt-1">
<span className="font-headline-1 text-headline-1 text-text-primary leading-none">99.4%</span>
</div>
<div className="mt-2 flex items-center gap-1 font-caption text-caption text-status-available">
<span className="material-symbols-outlined text-[16px]">verified</span>
<span className="">SMTP &amp; Twilio nominal</span>
</div>
</div>
<div className="relative w-16 h-16 flex items-center justify-center">
<svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
<path className="text-surface-container" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
<path className="text-action-green" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-dasharray="99.4, 100" strokeLinecap="round" strokeWidth="3.5"></path>
</svg>
<span className="absolute font-caption text-[11px] font-bold text-text-primary">0.6% fl</span>
</div>
</div>
{/* Metric 3: Urgent Alerts */}
<div className="relative overflow-hidden rounded-xl bg-error-container/40 p-space-md shadow-sm flex flex-col justify-between">
<div className="flex items-start justify-between">
<div className="flex flex-col">
<span className="font-caption text-caption text-on-error-container uppercase tracking-wider font-bold">Urgent System Triggers</span>
<div className="flex items-baseline gap-space-xs mt-1">
<span className="font-headline-1 text-headline-1 text-on-error-container leading-none">3</span>
<span className="font-caption text-caption text-error font-medium">pending attention</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-error text-on-error flex items-center justify-center animate-bounce">
<span className="material-symbols-outlined text-[20px]">warning</span>
</div>
</div>
<div className="mt-space-md pt-space-xs flex items-center justify-between text-on-error-container font-caption text-caption">
<span className="truncate">Hardware, Stacks, Delinquency</span>
<span className="font-semibold text-error underline cursor-pointer">Triage</span>
</div>
</div>
{/* Metric 4: Live Announcements */}
<div className="relative overflow-hidden rounded-xl bg-primary text-on-primary p-space-md shadow-sm flex flex-col justify-between">
<div className="flex items-start justify-between">
<div className="flex flex-col">
<span className="font-caption text-caption text-primary-fixed uppercase tracking-wider font-semibold">Active Campus Bulletins</span>
<div className="flex items-baseline gap-space-xs mt-1">
<span className="font-headline-1 text-headline-1 text-on-primary leading-none">2</span>
<span className="font-caption text-caption text-primary-fixed-dim">broadcasting</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">podcasts</span>
</div>
</div>
<div className="mt-space-md pt-space-xs flex items-center justify-between text-primary-fixed-dim font-caption text-caption">
<span className="">Portal: 1,420 views today</span>
<span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-bold">100% synced</span>
</div>
</div>
</div>
{/* Interactive Segmented Navigation Tabs */}
<div className="flex items-center gap-space-xs mb-space-lg overflow-x-auto pb-1"><button className="tab-btn px-space-md py-2.5 rounded-full bg-primary text-on-primary font-small text-small font-semibold shadow-sm transition-all flex items-center gap-2" onClick={(e) => { (window as any).switchTab?.(e.currentTarget, 'tab-system-alerts'); }}><span className="material-symbols-outlined text-[18px]">notification_important</span><span className="">System Alerts</span><span className="px-2 py-0.5 rounded-full bg-status-danger text-on-error font-caption text-[11px] font-bold">3</span></button><button className="tab-btn px-space-md py-2.5 rounded-full bg-surface-container-lowest text-text-secondary hover:text-text-primary font-small text-small font-semibold shadow-sm transition-all flex items-center gap-2" onClick={(e) => { (window as any).switchTab?.(e.currentTarget, 'tab-announcements'); }}><span className="material-symbols-outlined text-[18px]">campaign</span><span className="">Campus Announcements</span><span className="px-2 py-0.5 rounded-full bg-soft-blue text-primary font-caption text-[11px] font-bold">2 Live</span></button><button className="tab-btn px-space-md py-2.5 rounded-full bg-surface-container-lowest text-text-secondary hover:text-text-primary font-small text-small font-semibold shadow-sm transition-all flex items-center gap-2" onClick={(e) => { (window as any).switchTab?.(e.currentTarget, 'tab-dispatch-queue'); }}><span className="material-symbols-outlined text-[18px]">outbox</span><span className="">Automated Dispatch Queue</span><span className="px-2 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-[11px] font-bold">342 Dispatched</span></button><button className="tab-btn px-space-md py-2.5 rounded-full bg-surface-container-lowest text-text-secondary hover:text-text-primary font-small text-small font-semibold shadow-sm transition-all flex items-center gap-2" onClick={(e) => { (window as any).switchTab?.(e.currentTarget, 'tab-templates'); }}><span className="material-symbols-outlined text-[18px]">code_blocks</span><span className="">Patron SMS/Email Templates</span><span className="px-2 py-0.5 rounded-full bg-soft-blue text-primary font-caption text-[11px] font-bold">8 Active</span></button></div>
{/* TAB PANELS */}
{/* 1. System Alerts Tab (Active) */}
<div className="tab-panel flex flex-col gap-space-lg" id="tab-system-alerts">
{/* Real-time Alert Notification Feed */}
<div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
<div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-md gap-2">
<div className="flex items-center gap-space-sm">
<div className="w-3 h-3 rounded-full bg-error animate-ping"></div>
<h2 className="font-headline-3 text-headline-3 text-text-primary">Real-Time Administrative System Alert Feed</h2>
</div>
<span className="font-caption text-caption text-text-secondary">Auto-syncing with Katipuneros Core API every 15s</span>
</div>
<div className="flex flex-col gap-space-md mt-space-sm">
{/* Alert 1: Low Availability Trigger */}
<div className="flex flex-col lg:flex-row lg:items-center justify-between p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all gap-space-md">
<div className="flex items-start gap-space-md min-w-0">
<div className="w-12 h-12 rounded-xl bg-error/10 text-error flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[24px]">inventory_2</span>
</div>
<div className="flex flex-col min-w-0">
<div className="flex flex-wrap items-center gap-space-xs">
<span className="px-2 py-0.5 rounded font-caption text-[11px] font-bold bg-status-danger text-on-error uppercase">Critical Reserve Deficit</span>
<span className="font-caption text-caption text-text-secondary">Triggered 12m ago</span>
<span className="font-caption text-caption text-text-secondary">• Category: Computer Science &amp; Engineering</span>
</div>
<p className="font-body-large text-body-large font-bold text-text-primary mt-1">Computer Science - Clean Code (Robert C. Martin)</p>
<p className="font-small text-small text-text-secondary mt-0.5">
                Current queue has <strong className="text-text-primary">14 active reservations</strong> with only <strong className="text-error">2 available copies</strong> currently present on stacks shelf (Shelf B-402).
              </p>
</div>
</div>
<div className="flex items-center gap-space-sm shrink-0 pl-16 lg:pl-0">
<button className="h-10 px-space-md rounded-full bg-primary text-on-primary hover:bg-primary-container font-small text-small font-semibold flex items-center gap-1.5 shadow-sm transition-all" type="button">
<span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
<span className="">Trigger Acquisition Order</span>
</button>
<button className="h-10 w-10 rounded-full bg-surface-container-lowest hover:bg-surface text-text-secondary flex items-center justify-center" title="View Reservation Stacks" type="button">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
</div>
</div>
{/* Alert 2: Overdue Delinquency Spike */}
<div className="flex flex-col lg:flex-row lg:items-center justify-between p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all gap-space-md">
<div className="flex items-start gap-space-md min-w-0">
<div className="w-12 h-12 rounded-xl bg-status-pending/20 text-text-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[24px]">gavel</span>
</div>
<div className="flex flex-col min-w-0">
<div className="flex flex-wrap items-center gap-space-xs">
<span className="px-2 py-0.5 rounded font-caption text-[11px] font-bold bg-status-pending text-on-surface uppercase">Circulation Sanction Warning</span>
<span className="font-caption text-caption text-text-secondary">Triggered 46m ago</span>
<span className="font-caption text-caption text-text-secondary">• Automated Daily Batch Delinquency Monitor</span>
</div>
<p className="font-body-large text-body-large font-bold text-text-primary mt-1">Overdue Delinquency Spike Detected</p>
<p className="font-small text-small text-text-secondary mt-0.5">
<strong className="text-text-primary">18 patrons</strong> have passed the strict 14-day hold freeze mark. Automatic system penalties require Dean of Admissions notification clearance.
              </p>
</div>
</div>
<div className="flex items-center gap-space-sm shrink-0 pl-16 lg:pl-0">
<button className="h-10 px-space-md rounded-full bg-primary text-on-primary hover:bg-primary-container font-small text-small font-semibold flex items-center gap-1.5 shadow-sm transition-all" type="button">
<span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
<span className="">Send Formal Registrar Notice</span>
</button>
<button className="h-10 w-10 rounded-full bg-surface-container-lowest hover:bg-surface text-text-secondary flex items-center justify-center" title="View Delinquent Patrons" type="button">
<span className="material-symbols-outlined text-[18px]">list_alt</span>
</button>
</div>
</div>
{/* Alert 3: RFID Gate Hardware Offline */}
<div className="flex flex-col lg:flex-row lg:items-center justify-between p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all gap-space-md">
<div className="flex items-start gap-space-md min-w-0">
<div className="w-12 h-12 rounded-xl bg-error/10 text-error flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-[24px]">wifi_off</span>
</div>
<div className="flex flex-col min-w-0">
<div className="flex flex-wrap items-center gap-space-xs">
<span className="px-2 py-0.5 rounded font-caption text-[11px] font-bold bg-error text-on-error uppercase">Facility Hardware Failure</span>
<span className="font-caption text-caption text-text-secondary">Triggered 1h 05m ago</span>
<span className="font-caption text-caption text-text-secondary">• IP: 192.168.4.118 (North Turnstile)</span>
</div>
<p className="font-body-large text-body-large font-bold text-text-primary mt-1">RFID Gate Reader 02 Offline Ping Failure</p>
<p className="font-small text-small text-text-secondary mt-0.5">
                Turnstile scanner #2 stopped responding to heartbeat polling. Patron egress self-checkout validation currently bypassed to prevent foyer congestion.
              </p>
</div>
</div>
<div className="flex items-center gap-space-sm shrink-0 pl-16 lg:pl-0">
<button className="h-10 px-space-md rounded-full bg-primary text-on-primary hover:bg-primary-container font-small text-small font-semibold flex items-center gap-1.5 shadow-sm transition-all" type="button">
<span className="material-symbols-outlined text-[18px]">build</span>
<span className="">Ping Hardware Team</span>
</button>
<button className="h-10 w-10 rounded-full bg-surface-container-lowest hover:bg-surface text-text-secondary flex items-center justify-center" title="Re-poll hardware socket" type="button">
<span className="material-symbols-outlined text-[18px]">sync</span>
</button>
</div>
</div>
</div>
</div>
</div>
{/* 2. Campus Announcements Tab (Hidden by default, switched via JS) */}
<div className="tab-panel hidden flex flex-col gap-space-lg" id="tab-announcements"><div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-space-md"><div className="flex flex-col gap-1"><div className="flex items-center gap-space-sm"><span className="px-2.5 py-0.5 rounded-full bg-soft-blue text-primary font-caption text-caption font-bold">Campus Broadcast Network</span><span className="font-caption text-caption text-text-secondary">Active Sync: Web Portal, Digital Stacks Totems, Katipuneros Mobile App</span></div><h2 className="font-headline-3 text-headline-3 text-text-primary">Campus Announcements &amp; Bulletins</h2></div><button className="h-11 px-space-md rounded-full bg-action-green text-text-primary hover:bg-action-green-hover font-small text-small font-bold flex items-center gap-space-xs shadow-sm transition-all" onClick={() => { document.getElementById('broadcast-modal')?.classList.toggle('hidden'); }} type="button"><span className="material-symbols-outlined text-[20px]">add_circle</span><span className="">+ Create New Announcement</span></button></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md"><div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between border border-soft-blue"><div className="flex flex-col gap-space-sm"><div className="flex items-center justify-between"><div className="flex flex-wrap items-center gap-space-xs"><span className="px-2.5 py-0.5 rounded-full bg-action-green/30 text-text-primary font-caption text-[11px] font-bold uppercase tracking-wider flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-action-green animate-pulse"></span>Live • Published</span><span className="px-2.5 py-0.5 rounded-full bg-soft-blue text-primary font-caption text-[11px] font-semibold">Audience: All Patrons</span></div><button className="text-text-secondary hover:text-text-primary"><span className="material-symbols-outlined">more_vert</span></button></div><h3 className="font-headline-4 text-headline-4 text-text-primary mt-1">Midterm Extended Stacks Hours &amp; 24/7 Study Hall Access</h3><p className="font-small text-small text-text-secondary leading-relaxed">In support of the second semester midterm examinations, the General Reference and Reserved Stacks will operate until 23:00 daily through Friday, with Ground Floor Study Hall unlocked 24 hours for verified Katipunan ID cardholders.</p><div className="p-space-sm rounded-lg bg-soft-blue/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2"><div className="flex items-center gap-space-sm"><span className="material-symbols-outlined text-primary text-[20px]">devices</span><div className="flex flex-col"><span className="font-caption text-caption font-semibold text-text-primary">Channels: Portal Banner • Campus Kiosks • Mobile Push</span><span className="font-caption text-caption text-text-secondary">1,420 Active portal views • 920 App notifications read</span></div></div><span className="px-2 py-0.5 rounded-full bg-surface-container-lowest text-primary font-caption text-[11px] font-bold shrink-0">98.4% Open Rate</span></div></div><div className="mt-space-lg pt-space-sm flex flex-wrap items-center justify-between gap-2 border-t border-surface-container-low"><div className="flex items-center gap-2 font-caption text-caption text-text-secondary"><span className="material-symbols-outlined text-[16px]">schedule</span><span className="">Active: Oct 21 – Oct 28, 2024 at 23:59</span></div><div className="flex items-center gap-2"><button className="px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface text-text-primary font-caption text-caption font-semibold transition-colors flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">analytics</span><span className="">Analytics</span></button><button className="px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface text-text-primary font-caption text-caption font-semibold transition-colors">Edit</button><button className="px-3 py-1.5 rounded-full bg-error-container text-on-error-container hover:bg-error hover:text-on-error font-caption text-caption font-semibold transition-colors">Unpublish</button></div></div></div><div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between"><div className="flex flex-col gap-space-sm"><div className="flex items-center justify-between"><div className="flex flex-wrap items-center gap-space-xs"><span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-caption text-[11px] font-bold uppercase tracking-wider flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary"></span>Scheduled</span><span className="px-2.5 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-[11px] font-semibold">Audience: Faculty &amp; Undergraduates</span></div><button className="text-text-secondary hover:text-text-primary"><span className="material-symbols-outlined">more_vert</span></button></div><h3 className="font-headline-4 text-headline-4 text-text-primary mt-1">Katipunan Rare Filipiniana Manuscript Exhibition &amp; Preservation Tour</h3><p className="font-small text-small text-text-secondary leading-relaxed">Special collections showcase displaying 19th-century revolutionary manuscripts and annotated journals. Restricted white-glove viewing slots available with pre-booking via research consultation kiosk.</p><div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2"><div className="flex items-center gap-space-sm"><span className="material-symbols-outlined text-secondary text-[20px]">door_sliding</span><div className="flex flex-col"><span className="font-caption text-caption font-semibold text-text-primary">Channels: Portal Banner • Campus Kiosks</span><span className="font-caption text-caption text-text-secondary">Auto-dispatches to 3 touchpoints on trigger date</span></div></div><span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-caption text-[11px] font-bold shrink-0">In 38 Hours</span></div></div><div className="mt-space-lg pt-space-sm flex flex-wrap items-center justify-between gap-2 border-t border-surface-container-low"><div className="flex items-center gap-2 font-caption text-caption text-text-secondary"><span className="material-symbols-outlined text-[16px]">event</span><span className="">Broadcast Window: Nov 01 – Nov 15, 2024</span></div><div className="flex items-center gap-2"><button className="px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface text-text-primary font-caption text-caption font-semibold transition-colors flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">analytics</span><span className="">Preview</span></button><button className="px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface text-text-primary font-caption text-caption font-semibold transition-colors">Edit</button><button className="px-3 py-1.5 rounded-full bg-error-container text-on-error-container hover:bg-error hover:text-on-error font-caption text-caption font-semibold transition-colors">Cancel</button></div></div></div><div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between border border-dashed border-outline-variant"><div className="flex flex-col gap-space-sm"><div className="flex items-center justify-between"><div className="flex items-center gap-space-xs"><span className="px-2.5 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-[11px] font-bold uppercase tracking-wider">Draft</span><span className="px-2.5 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-[11px] font-semibold">Audience: Faculty Only</span></div><button className="text-text-secondary hover:text-text-primary"><span className="material-symbols-outlined">more_vert</span></button></div><h3 className="font-headline-4 text-headline-4 text-text-primary mt-1">Quarterly Journal Subscription Renewals &amp; Purchase Requisition</h3><p className="font-small text-small text-text-secondary leading-relaxed">Departmental heads are requested to review IEEE, JSTOR, and Springer Nature core faculty title requests before FY25 budgetary clearance.</p><div className="p-space-sm rounded-lg bg-surface-container-low flex items-center gap-space-sm mt-2"><span className="material-symbols-outlined text-text-secondary text-[20px]">edit_note</span><div className="flex flex-col"><span className="font-caption text-caption font-semibold text-text-primary">Draft Mode • Untargeted Channels</span><span className="font-caption text-caption text-text-secondary">Last edited by Dean's Office 4 hours ago</span></div></div></div><div className="mt-space-lg pt-space-sm flex items-center justify-between border-t border-surface-container-low"><div className="flex items-center gap-2 font-caption text-caption text-text-secondary"><span className="material-symbols-outlined text-[16px]">schedule</span><span className="">Target Publish: Dec 01, 2024</span></div><div className="flex items-center gap-2"><button className="px-3 py-1.5 rounded-full bg-primary text-on-primary font-caption text-caption font-semibold hover:bg-primary-container transition-colors">Publish Draft</button><button className="px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface text-text-primary font-caption text-caption font-semibold transition-colors">Edit</button></div></div></div></div></div>
{/* 3. Automated Dispatch Queue Tab (Hidden by default) */}
<div className="tab-panel hidden flex flex-col gap-space-lg" id="tab-dispatch-queue"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md"><div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between"><div className="flex items-start justify-between"><div><span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Next Batch Run</span><div className="font-headline-3 text-headline-3 text-text-primary font-bold mt-1">in 02m 45s</div></div><div className="w-10 h-10 rounded-lg bg-soft-blue text-primary flex items-center justify-center"><span className="material-symbols-outlined text-[22px]">timer</span></div></div><div className="mt-3 pt-2 border-t border-surface-container-low flex items-center justify-between text-caption font-caption text-text-secondary"><span className="">Batch Window: 180s</span><span className="text-status-available font-semibold">Daemon Running</span></div></div><div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between"><div className="flex items-start justify-between"><div><span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Retry Failure Rate</span><div className="font-headline-3 text-headline-3 text-text-primary font-bold mt-1">0.2%</div></div><div className="w-10 h-10 rounded-lg bg-action-green/30 text-text-primary flex items-center justify-center"><span className="material-symbols-outlined text-[22px]">check_circle</span></div></div><div className="mt-3 pt-2 border-t border-surface-container-low flex items-center justify-between text-caption font-caption text-text-secondary"><span className="">1 bounced / 480 SMS</span><span className="text-primary font-semibold">Healthy</span></div></div><div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between"><div className="flex items-start justify-between"><div><span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Queue Depth</span><div className="font-headline-3 text-headline-3 text-text-primary font-bold mt-1">14 Pending</div></div><div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center"><span className="material-symbols-outlined text-[22px]">layers</span></div></div><div className="mt-3 pt-2 border-t border-surface-container-low flex items-center justify-between text-caption font-caption text-text-secondary"><span className="">9 Email • 5 SMS</span><span className="text-text-primary font-semibold">Processing</span></div></div><div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between"><div className="flex items-start justify-between"><div><span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Gateway Rate Limits</span><div className="font-small text-small font-bold text-text-primary mt-1">Twilio: 30/min<br />SendGrid: 120/min</div></div><div className="w-10 h-10 rounded-lg bg-soft-blue text-primary flex items-center justify-center"><span className="material-symbols-outlined text-[22px]">speed</span></div></div><div className="mt-3 pt-2 border-t border-surface-container-low flex items-center justify-between text-caption font-caption text-text-secondary"><span className="">SES: 40/sec quota</span><span className="text-status-available font-semibold">Nominal</span></div></div></div><div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-space-md"><div><h2 className="font-headline-3 text-headline-3 text-text-primary">Live Dispatch Transaction Stream</h2><p className="font-caption text-caption text-text-secondary">Outbound patron messaging queue and instant carrier delivery feedback</p></div><div className="flex items-center gap-2"><span className="px-3 py-1 rounded-full bg-soft-blue text-primary font-caption text-caption font-bold">Latency: 48ms</span><button className="px-3 py-1 rounded-full bg-surface-container hover:bg-surface-variant font-caption text-caption text-text-primary font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">sync</span><span className="">Refresh Stream</span></button></div></div><div className="overflow-x-auto"><table className="w-full text-left font-small text-small"><thead><tr className="bg-surface-container-low text-text-secondary font-caption text-caption uppercase tracking-wider"><th className="p-space-md rounded-l-lg">Dispatch ID</th><th className="p-space-md">Recipient Patron</th><th className="p-space-md">Trigger Event</th><th className="p-space-md">Channel</th><th className="p-space-md">Delivery Status</th><th className="p-space-md">Timestamp</th><th className="p-space-md rounded-r-lg text-right">Action</th></tr></thead><tbody className="divide-y divide-transparent"><tr className="hover:bg-surface-container-low transition-colors"><td className="p-space-md font-mono text-caption text-text-secondary font-bold">#DSP-90825</td><td className="p-space-md"><div className="flex flex-col"><span className="font-semibold text-text-primary">Camilla Santos (ID: 2021-0492)</span><span className="text-caption text-text-secondary font-caption">c.santos@katipunan.edu.ph</span></div></td><td className="p-space-md text-text-primary font-medium">Hold Ready: Smart Locker Bay A-04</td><td className="p-space-md"><span className="px-2 py-0.5 rounded-full bg-soft-blue text-primary font-caption text-[11px] font-bold">Email + SMS</span></td><td className="p-space-md"><span className="px-2.5 py-0.5 rounded-full bg-status-available/20 text-text-primary font-caption text-[11px] font-bold flex items-center gap-1 w-max"><span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>Delivered (200 OK)</span></td><td className="p-space-md font-caption text-caption text-text-secondary">Just now</td><td className="p-space-md text-right"><button className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-variant text-text-secondary hover:text-text-primary font-caption text-[11px] font-semibold">Inspect Payload</button></td></tr><tr className="hover:bg-surface-container-low transition-colors"><td className="p-space-md font-mono text-caption text-text-secondary font-bold">#DSP-90824</td><td className="p-space-md"><div className="flex flex-col"><span className="font-semibold text-text-primary">Lorenzo Tan (ID: 2022-1108)</span><span className="text-caption text-text-secondary font-caption">+63 918 432 9901</span></div></td><td className="p-space-md text-text-primary font-medium">48h Return Reminder</td><td className="p-space-md"><span className="px-2 py-0.5 rounded-full bg-soft-blue text-primary font-caption text-[11px] font-bold">SMS</span></td><td className="p-space-md"><span className="px-2.5 py-0.5 rounded-full bg-soft-blue text-primary font-caption text-[11px] font-bold flex items-center gap-1 w-max"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>In Flight</span></td><td className="p-space-md font-caption text-caption text-text-secondary">42s ago</td><td className="p-space-md text-right"><button className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-variant text-text-secondary hover:text-text-primary font-caption text-[11px] font-semibold">Inspect Payload</button></td></tr><tr className="hover:bg-surface-container-low transition-colors"><td className="p-space-md font-mono text-caption text-text-secondary font-bold">#DSP-90823</td><td className="p-space-md"><div className="flex flex-col"><span className="font-semibold text-text-primary">Maricor Reyes (ID: 2020-0012)</span><span className="text-caption text-text-secondary font-caption">m.reyes@katipunan.edu.ph</span></div></td><td className="p-space-md text-text-primary font-medium">Overdue Tier 1 Notice</td><td className="p-space-md"><span className="px-2 py-0.5 rounded-full bg-action-green/30 text-text-primary font-caption text-[11px] font-bold">SMS + Push</span></td><td className="p-space-md"><span className="px-2.5 py-0.5 rounded-full bg-status-pending/20 text-text-primary font-caption text-[11px] font-bold flex items-center gap-1 w-max"><span className="w-1.5 h-1.5 rounded-full bg-status-pending"></span>Retrying (Carrier Handshake)</span></td><td className="p-space-md font-caption text-caption text-text-secondary">2 mins ago</td><td className="p-space-md text-right"><button className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-variant text-text-secondary hover:text-text-primary font-caption text-[11px] font-semibold">Inspect Payload</button></td></tr><tr className="hover:bg-surface-container-low transition-colors"><td className="p-space-md font-mono text-caption text-text-secondary font-bold">#DSP-90822</td><td className="p-space-md"><div className="flex flex-col"><span className="font-semibold text-text-primary">Beatriz De Leon (ID: 2023-8819)</span><span className="text-caption text-text-secondary font-caption">b.deleon@katipunan.edu.ph</span></div></td><td className="p-space-md text-text-primary font-medium">Reservation Expiry Warning</td><td className="p-space-md"><span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-caption text-[11px] font-bold">Push</span></td><td className="p-space-md"><span className="px-2.5 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-[11px] font-bold flex items-center gap-1 w-max"><span className="w-1.5 h-1.5 rounded-full bg-text-secondary"></span>Queued</span></td><td className="p-space-md font-caption text-caption text-text-secondary">5 mins ago</td><td className="p-space-md text-right"><button className="px-2.5 py-1 rounded-full bg-surface-container hover:bg-surface-variant text-text-secondary hover:text-text-primary font-caption text-[11px] font-semibold">Inspect Payload</button></td></tr></tbody></table></div></div></div>
{/* 4. Patron SMS/Email Templates Tab (Hidden by default) */}
<div className="tab-panel hidden flex flex-col gap-space-lg" id="tab-templates"><div className="flex flex-col lg:flex-row gap-space-lg"><div className="w-full lg:w-2/3 flex flex-col gap-space-md"><div className="flex items-center justify-between"><h3 className="font-headline-3 text-headline-3 text-text-primary">Institutional Dispatch Templates</h3><span className="font-caption text-caption text-text-secondary">8 Production Templates Active</span></div><div className="grid grid-cols-1 md:grid-cols-2 gap-space-md"><div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between border-2 border-primary"><div className="flex flex-col gap-2"><div className="flex items-center justify-between"><span className="font-caption text-caption uppercase tracking-wider font-bold text-primary">Hold &amp; Fulfillment</span><span className="px-2 py-0.5 rounded-full bg-soft-blue text-primary font-caption text-[10px] font-bold">SMS &amp; Email</span></div><h4 className="font-headline-4 text-headline-4 text-text-primary">Hold Ready for Pickup</h4><p className="font-caption text-caption text-text-secondary">Triggered automatically upon RFID reservation arrival and bay assignment.</p><div className="flex flex-wrap gap-1 mt-1"><span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[10px] text-text-primary">&#123;&#123;patron_name&#125;&#125;</span><span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[10px] text-text-primary">&#123;&#123;book_title&#125;&#125;</span><span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[10px] text-text-primary">&#123;&#123;locker_bay&#125;&#125;</span><span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[10px] text-text-primary">&#123;&#123;expiry_time&#125;&#125;</span></div></div><div className="mt-space-md pt-2 flex items-center justify-between border-t border-surface-container-low"><span className="font-caption text-caption text-text-secondary">Dispatched: 142 today</span><button className="px-3 py-1 rounded-full bg-primary text-on-primary font-caption text-caption font-semibold hover:bg-primary-container">Active Preview</button></div></div><div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between"><div className="flex flex-col gap-2"><div className="flex items-center justify-between"><span className="font-caption text-caption uppercase tracking-wider font-bold text-status-pending">Courtesy Notice</span><span className="px-2 py-0.5 rounded-full bg-soft-blue text-primary font-caption text-[10px] font-bold">Email &amp; Push</span></div><h4 className="font-headline-4 text-headline-4 text-text-primary">Upcoming Due Date (48h Warning)</h4><p className="font-caption text-caption text-text-secondary">Automated morning cron notification dispatched 48h before borrow timestamp.</p><div className="flex flex-wrap gap-1 mt-1"><span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[10px] text-text-primary">&#123;&#123;patron_name&#125;&#125;</span><span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[10px] text-text-primary">&#123;&#123;book_title&#125;&#125;</span><span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[10px] text-text-primary">&#123;&#123;due_date&#125;&#125;</span><span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[10px] text-text-primary">&#123;&#123;renewal_link&#125;&#125;</span></div></div><div className="mt-space-md pt-2 flex items-center justify-between border-t border-surface-container-low"><span className="font-caption text-caption text-text-secondary">Dispatched: 180 today</span><button className="px-3 py-1 rounded-full bg-surface-container hover:bg-surface text-text-primary font-caption text-caption font-semibold">Configure</button></div></div><div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between"><div className="flex flex-col gap-2"><div className="flex items-center justify-between"><span className="font-caption text-caption uppercase tracking-wider font-bold text-error">Sanctions</span><span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-caption text-[10px] font-bold">SMS &amp; Email</span></div><h4 className="font-headline-4 text-headline-4 text-text-primary">Circulation Overdue &amp; Grace Expiry</h4><p className="font-caption text-caption text-text-secondary">Fired on Day 3 and Day 14 of past-due retention cycle with daily fine computations.</p><div className="flex flex-wrap gap-1 mt-1"><span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[10px] text-text-primary">&#123;&#123;patron_name&#125;&#125;</span><span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[10px] text-text-primary">&#123;&#123;book_title&#125;&#125;</span><span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[10px] text-text-primary">&#123;&#123;days_overdue&#125;&#125;</span><span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[10px] text-text-primary">&#123;&#123;fine_rate&#125;&#125;</span></div></div><div className="mt-space-md pt-2 flex items-center justify-between border-t border-surface-container-low"><span className="font-caption text-caption text-text-secondary">Dispatched: 18 today</span><button className="px-3 py-1 rounded-full bg-surface-container hover:bg-surface text-text-primary font-caption text-caption font-semibold">Configure</button></div></div><div className="rounded-xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between"><div className="flex flex-col gap-2"><div className="flex items-center justify-between"><span className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">Circulation Workflow</span><span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-caption text-[10px] font-bold">Email</span></div><h4 className="font-headline-4 text-headline-4 text-text-primary">Reservation Cancelled / Auto-Reshelved</h4><p className="font-caption text-caption text-text-secondary">Sent when 72-hour hold window expires without physical kiosk checkout.</p><div className="flex flex-wrap gap-1 mt-1"><span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[10px] text-text-primary">&#123;&#123;patron_name&#125;&#125;</span><span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[10px] text-text-primary">&#123;&#123;book_title&#125;&#125;</span><span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[10px] text-text-primary">&#123;&#123;reorder_url&#125;&#125;</span></div></div><div className="mt-space-md pt-2 flex items-center justify-between border-t border-surface-container-low"><span className="font-caption text-caption text-text-secondary">Dispatched: 4 today</span><button className="px-3 py-1 rounded-full bg-surface-container hover:bg-surface text-text-primary font-caption text-caption font-semibold">Configure</button></div></div></div></div><div className="w-full lg:w-1/3 flex flex-col gap-space-md"><div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md"><div className="flex items-center justify-between border-b border-surface-container-low pb-space-sm"><div className="flex items-center gap-space-xs"><span className="material-symbols-outlined text-primary text-[20px]">wysiwyg</span><h4 className="font-headline-4 text-small font-bold text-text-primary">Live Template Preview</h4></div><div className="flex items-center gap-1 bg-surface-container-low p-0.5 rounded-full"><button className="px-2 py-0.5 rounded-full bg-surface-container-lowest text-text-primary font-caption text-[11px] font-bold shadow-sm">SMS</button><button className="px-2 py-0.5 rounded-full text-text-secondary hover:text-text-primary font-caption text-[11px]">Email</button></div></div><div className="flex items-center justify-between text-caption font-caption"><span className="text-text-secondary font-semibold">Active Relay Gateway:</span><div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-action-green"></span><span className="font-semibold text-text-primary">Twilio High-Throughput (Shortcode)</span></div></div><div className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-2"><span className="font-caption text-[11px] uppercase tracking-wider font-bold text-text-secondary">Dispatched SMS Preview</span><p className="font-body text-small text-text-primary leading-relaxed bg-surface-container-lowest p-space-md rounded-lg shadow-sm border border-soft-blue">"Katipuneros Library: Camilla Santos, your requested book 'Clean Code' is ready at Smart Locker Bay A-04. Please scan PIN 8829 before Oct 25, 18:00 to retrieve."</p><div className="flex items-center justify-between font-caption text-[11px] text-text-secondary mt-1"><span className="">Character Count: <strong className="text-text-primary">142 / 160 GSM</strong> (1 Segment)</span><span className="text-status-available font-bold">Valid GSM-7</span></div></div><div className="flex flex-col gap-1.5"><label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">Dynamic Data Binding</label><div className="p-2.5 rounded-lg bg-surface-container-low font-mono text-[11px] text-text-secondary space-y-1"><div className=""><span className="text-primary font-bold">patron_name:</span> "Camilla Santos"</div><div className=""><span className="text-primary font-bold">book_title:</span> "Clean Code"</div><div className=""><span className="text-primary font-bold">locker_bay:</span> "Smart Locker Bay A-04"</div><div className=""><span className="text-primary font-bold">expiry_time:</span> "Oct 25, 18:00"</div></div></div><div className="flex items-center justify-between pt-2 border-t border-surface-container-low"><button className="px-3 py-1.5 rounded-full bg-surface-container text-text-primary hover:bg-surface font-caption text-caption font-semibold flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">science</span><span className="">Send Test SMS</span></button><button className="px-space-md py-1.5 rounded-full bg-primary text-on-primary hover:bg-primary-container font-caption text-caption font-bold shadow-sm">Save Template</button></div></div></div></div></div>
{/* Announcement Composer / Dispatch Drawer Modal */}
<div className="hidden fixed inset-0 z-50 flex items-center justify-center p-space-md backdrop-blur-md bg-text-primary/30" id="broadcast-modal">
<div className="w-full max-w-2xl rounded-2xl bg-surface-container-lowest shadow-2xl p-space-xl flex flex-col gap-space-md relative">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-full bg-action-green/30 flex items-center justify-center text-text-primary">
<span className="material-symbols-outlined text-[24px]">campaign</span>
</div>
<div>
<h3 className="font-headline-3 text-headline-3 text-text-primary">Compose System Announcement</h3>
<p className="font-caption text-caption text-text-secondary">Publish high-priority banners to Katipuneros web portal and mobile app</p>
</div>
</div>
<button className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary" onClick={() => { document.getElementById('broadcast-modal')?.classList.add('hidden'); }}>
<span className="material-symbols-outlined text-[18px]">close</span>
</button>
</div>
<div className="flex flex-col gap-space-sm mt-2">
<label className="font-caption text-caption uppercase tracking-wider font-semibold text-text-primary">Target Audience Channels</label>
<div className="flex flex-wrap gap-space-xs">
<button className="px-space-md py-1.5 rounded-full bg-primary text-on-primary font-caption text-caption font-semibold" type="button">Student &amp; Faculty Portal</button>
<button className="px-space-md py-1.5 rounded-full bg-surface-container-low text-text-primary font-caption text-caption font-semibold hover:bg-surface-container" type="button">Mobile App Push</button>
<button className="px-space-md py-1.5 rounded-full bg-surface-container-low text-text-primary font-caption text-caption font-semibold hover:bg-surface-container" type="button">Circulation Kiosk Screens</button>
<button className="px-space-md py-1.5 rounded-full bg-surface-container-low text-text-primary font-caption text-caption font-semibold hover:bg-surface-container" type="button">Staff Only Intranet</button>
</div>
</div>
<div className="flex flex-col gap-1">
<label className="font-caption text-caption uppercase tracking-wider font-semibold text-text-primary">Headline Title</label>
<input className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl font-body text-body text-text-primary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary" placeholder="e.g., Extended Stacks Hours During Examination Week..." type="text" />
</div>
<div className="flex flex-col gap-1">
<label className="font-caption text-caption uppercase tracking-wider font-semibold text-text-primary">Detailed Message Body</label>
<textarea className="w-full bg-surface-container-low p-space-md rounded-xl font-body text-body text-text-primary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary" placeholder="Detail opening hours, access protocols, affected stack zones, and assistance contact details..." rows={4}></textarea>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
<div>
<label className="font-caption text-caption uppercase tracking-wider font-semibold text-text-primary">Display Duration</label>
<select className="w-full mt-1 bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary">
<option>Until tomorrow at midnight</option>
<option>7 Days (End of Academic Week)</option>
<option>Until manually dismissed</option>
</select>
</div>
<div>
<label className="font-caption text-caption uppercase tracking-wider font-semibold text-text-primary">Priority Level</label>
<select className="w-full mt-1 bg-surface-container-low px-space-md py-2.5 rounded-xl font-small text-small text-text-primary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary">
<option>Standard Campus Bulletin</option>
<option>Urgent / Operating Hours Modification</option>
<option>Emergency Stacks Closure</option>
</select>
</div>
</div>
<div className="flex items-center justify-end gap-space-sm mt-space-md pt-space-sm">
<button className="px-space-md py-2.5 rounded-full bg-surface-container hover:bg-surface-variant font-small text-small font-semibold text-text-secondary transition-colors" onClick={() => { document.getElementById('broadcast-modal')?.classList.add('hidden'); }} type="button">
          Dismiss
        </button>
<button className="px-space-lg py-2.5 rounded-full bg-action-green text-text-primary hover:bg-action-green-hover font-small text-small font-bold flex items-center gap-1.5 shadow-sm transition-all" onClick={() => { document.getElementById('broadcast-modal')?.classList.add('hidden'); }} type="button">
<span className="material-symbols-outlined text-[20px]">send</span>
<span className="">Broadcast Announcement</span>
</button>
</div>
</div>
</div>
{/* Interactive JavaScript for Tab Switching and Quick Toast Resolution */}

</div>
    </div>
  );
};

export default Notifications;
