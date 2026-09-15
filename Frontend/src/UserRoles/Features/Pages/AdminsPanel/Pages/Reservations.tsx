// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// Reservations.tsx -- Admin Reservation Ledger and Hold Queue
// Converted directly from SidebarReservationPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const Reservations: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
(function syncAdminShell() {
      // Synchronize App Shell Header Breadcrumb and Navigation dynamically
      const navBreadcrumbs = document.querySelector('header nav');
      if (navBreadcrumbs) {
        navBreadcrumbs.innerHTML = `
          <span class="hover:text-text-primary cursor-pointer transition-colors">Admin Console</span>
          <span class="material-symbols-outlined text-[14px]">chevron_right</span>
          <span class="hover:text-text-primary cursor-pointer transition-colors">Operations</span>
          <span class="material-symbols-outlined text-[14px]">chevron_right</span>
          <span class="text-primary font-semibold">Reservations</span>
        `;
      }
      // Target active sidebar state
      const aside = document.querySelector('aside');
      if (aside) {
        const activeLink = aside.querySelector('a[data-path="reservations"]');
        if (activeLink) {
          aside.querySelectorAll('nav a').forEach(el => {
            el.classList.remove('bg-soft-blue', 'text-primary', 'font-bold', 'shadow-sm');
          });
          activeLink.classList.add('bg-soft-blue', 'text-primary', 'font-bold', 'shadow-sm');
        }
      }
    })();

    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full gap-space-lg">
{/* Interactive Header Synchronization & State Controller Script */}

{/* Module Sub-Header & Executive Actions */}
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
<div className="flex flex-col">
<div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption mb-1">
<span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
<span className="">CIRCULATION CONTROLLER 04 // BAY LOGISTICS ACTIVE</span>
</div>
<h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">
        Institutional Hold &amp; Reservation Queue Management
      </h1>
<p className="font-small text-small text-text-secondary mt-0.5">
        Real-time shelf allocations, staging locker synchronization, and automated high-demand quota enforcement.
      </p>
</div>
<div className="flex items-center flex-wrap gap-space-sm">
<button className="flex items-center gap-space-xs bg-surface-container-lowest text-primary hover:bg-surface-container px-space-md py-2.5 rounded-lg shadow-sm font-small text-small font-semibold transition-all" type="button">
<span className="material-symbols-outlined text-[18px]">download</span>
<span className="">Export Roster</span>
</button>
<button className="flex items-center gap-space-xs bg-surface-container-lowest text-primary hover:bg-surface-container px-space-md py-2.5 rounded-lg shadow-sm font-small text-small font-semibold transition-all" type="button">
<span className="material-symbols-outlined text-[18px]">tune</span>
<span className="">Locker Matrix</span>
</button>
<button className="flex items-center gap-space-xs bg-action-green hover:bg-action-green-hover text-text-primary px-space-lg py-2.5 rounded-lg shadow-sm font-small text-small font-bold transition-all transform hover:-translate-y-0.5" type="button">
<span className="material-symbols-outlined text-[18px]">task_alt</span>
<span className="">Batch Hold Clearance</span>
</button>
</div>
</div>
{/* Operational Hold KPIs Bento */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
{/* Active Hold Queue */}
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none"></div>
<div className="flex items-start justify-between">
<div>
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Active Hold Queue</span>
<div className="flex items-baseline gap-space-xs mt-1">
<span className="font-headline-1 text-headline-1 text-text-primary font-bold">248</span>
<span className="font-caption text-caption text-text-secondary font-medium">Volumes</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[22px]">book_online</span>
</div>
</div>
<div className="mt-space-md flex items-center justify-between font-caption text-caption text-text-secondary">
<span className="flex items-center gap-1 text-status-available font-semibold">
<span className="material-symbols-outlined text-[16px]">trending_up</span> +14.2% today
        </span>
<span className="">Across 8 Colleges</span>
</div>
</div>
{/* Pending Supervisor Review */}
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="absolute -right-4 -bottom-4 w-24 h-24 bg-status-pending/10 rounded-full blur-xl pointer-events-none"></div>
<div className="flex items-start justify-between">
<div>
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Pending Review</span>
<div className="flex items-baseline gap-space-xs mt-1">
<span className="font-headline-1 text-headline-1 text-text-primary font-bold">28</span>
<span className="font-caption text-caption text-status-pending font-bold">High Demand</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-status-pending/15 flex items-center justify-center text-status-pending">
<span className="material-symbols-outlined text-[22px]">hourglass_top</span>
</div>
</div>
<div className="mt-space-md flex items-center justify-between font-caption text-caption">
<span className="text-error font-medium flex items-center gap-0.5">
<span className="material-symbols-outlined text-[14px]">warning</span> 7 exceed ratio 3:1
        </span>
<span className="text-text-secondary">Avg wait: 2.1d</span>
</div>
</div>
{/* Staged Ready for Pickup */}
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="absolute -right-4 -bottom-4 w-24 h-24 bg-action-green/10 rounded-full blur-xl pointer-events-none"></div>
<div className="flex items-start justify-between">
<div>
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Staged Ready for Pickup</span>
<div className="flex items-baseline gap-space-xs mt-1">
<span className="font-headline-1 text-headline-1 text-text-primary font-bold">142</span>
<span className="font-caption text-caption text-text-secondary font-medium">Locker Units</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-action-green/20 flex items-center justify-center text-text-primary">
<span className="material-symbols-outlined text-[22px]">lock_open</span>
</div>
</div>
<div className="mt-space-md flex items-center justify-between font-caption text-caption text-text-secondary">
<div className="w-2/3 bg-surface-container rounded-full h-1.5 overflow-hidden">
<div className="bg-action-green h-full rounded-full" style={{ width: '82%' }}></div>
</div>
<span className="font-semibold text-text-primary">82% Locker Cap</span>
</div>
</div>
{/* Fulfillment Velocity */}
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-container/10 rounded-full blur-xl pointer-events-none"></div>
<div className="flex items-start justify-between">
<div>
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Fulfillment Velocity</span>
<div className="flex items-baseline gap-space-xs mt-1">
<span className="font-headline-1 text-headline-1 text-text-primary font-bold">4.2</span>
<span className="font-caption text-caption text-text-secondary font-medium">hrs avg stage</span>
</div>
</div>
<div className="w-10 h-10 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[22px]">speed</span>
</div>
</div>
<div className="mt-space-md flex items-center justify-between font-caption text-caption text-text-secondary">
<span className="text-status-available font-semibold flex items-center gap-0.5">
<span className="material-symbols-outlined text-[14px]">arrow_downward</span> 38m faster
        </span>
<span className="">Target: &lt;6.0 hrs</span>
</div>
</div>
</div>
{/* Operational Search, Facets & Tab Filters */}
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
{/* Top Filter Bar */}
<div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
{/* Search Input */}
<div className="relative flex-1 max-w-xl">
<span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">search</span>
<input className="w-full bg-surface-container-low pl-11 pr-space-md py-2.5 rounded-full font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/25 transition-all" placeholder="Filter by Hold ID (#HLD-...), patron name, student number, or title..." type="text" />
</div>
{/* Quick Location Toggles */}
<div className="flex items-center gap-space-xs overflow-x-auto pb-1 lg:pb-0">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider mr-1 hidden sm:inline">Route:</span>
<button className="px-space-md py-1.5 rounded-full font-caption text-caption font-semibold bg-primary text-on-primary whitespace-nowrap shadow-sm">
          All Locations
        </button>
<button className="px-space-md py-1.5 rounded-full font-caption text-caption font-semibold bg-chip-unselected-bg text-text-secondary hover:bg-surface-container whitespace-nowrap transition-colors">
          Main Circulation Desk
        </button>
<button className="px-space-md py-1.5 rounded-full font-caption text-caption font-semibold bg-chip-unselected-bg text-text-secondary hover:bg-surface-container whitespace-nowrap transition-colors">
          Smart Lockers (Bay A-D)
        </button>
<button className="px-space-md py-1.5 rounded-full font-caption text-caption font-semibold bg-chip-unselected-bg text-text-secondary hover:bg-surface-container whitespace-nowrap transition-colors">
          Graduate Annex
        </button>
</div>
</div>
{/* Status Tabs */}
<div className="flex items-center gap-space-xs overflow-x-auto border-b-0 pb-1">
<button className="flex items-center gap-space-xs px-space-md py-2 rounded-lg bg-soft-blue text-primary font-small text-small font-bold transition-all shadow-sm">
<span className="">All</span>
<span className="bg-primary text-on-primary text-[11px] font-caption px-1.5 py-0.5 rounded-full font-bold">248</span>
</button>
<button className="flex items-center gap-space-xs px-space-md py-2 rounded-lg text-text-secondary hover:bg-surface-container font-small text-small font-semibold transition-all">
<span className="">Pending Review</span>
<span className="bg-status-pending text-on-surface text-[11px] font-caption px-1.5 py-0.5 rounded-full font-bold">28</span>
<span className="w-2 h-2 rounded-full bg-status-danger animate-pulse"></span>
</button>
<button className="flex items-center gap-space-xs px-space-md py-2 rounded-lg text-text-secondary hover:bg-surface-container font-small text-small font-semibold transition-all">
<span className="">Approved &amp; Staged</span>
<span className="bg-surface-container-high text-text-secondary text-[11px] font-caption px-1.5 py-0.5 rounded-full font-bold">142</span>
</button>
<button className="flex items-center gap-space-xs px-space-md py-2 rounded-lg text-text-secondary hover:bg-surface-container font-small text-small font-semibold transition-all">
<span className="">Completed / Picked Up</span>
<span className="bg-surface-container-high text-text-secondary text-[11px] font-caption px-1.5 py-0.5 rounded-full font-bold">1,840</span>
</button>
<button className="flex items-center gap-space-xs px-space-md py-2 rounded-lg text-text-secondary hover:bg-surface-container font-small text-small font-semibold transition-all">
<span className="">Expired / Cancelled</span>
<span className="bg-surface-container-high text-text-secondary text-[11px] font-caption px-1.5 py-0.5 rounded-full font-bold">42</span>
</button>
</div>
</div>
{/* Primary Hold Queue Table Component */}
<div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
{/* Table Header Info Bar */}
<div className="px-space-lg py-space-md bg-surface-container-low flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-primary text-[20px]">inventory_2</span>
<span className="font-small text-small font-bold text-text-primary">Staging Queue Manifest</span>
<span className="font-caption text-caption text-text-secondary bg-surface-container px-2 py-0.5 rounded">Showing 4 of 248 records</span>
</div>
<div className="flex items-center gap-space-xs">
<span className="font-caption text-caption text-text-secondary">Auto-refresh every 60s</span>
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
</div>
</div>
{/* Responsive Table */}
<div className="overflow-x-auto w-full">
<table className="w-full text-left font-body text-small">
<thead className="bg-surface-container text-text-secondary font-caption text-caption uppercase tracking-wider">
<tr>
<th className="py-3 px-space-md font-bold">Hold ID</th>
<th className="py-3 px-space-md font-bold">Patron Details</th>
<th className="py-3 px-space-md font-bold">Reserved Title &amp; Call No.</th>
<th className="py-3 px-space-md font-bold">Request / Expiry</th>
<th className="py-3 px-space-md font-bold">Pickup Location</th>
<th className="py-3 px-space-md font-bold">Status</th>
<th className="py-3 px-space-md font-bold text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-transparent font-small text-small">
{/* Row 1: HLD-904 */}
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="py-3.5 px-space-md align-middle">
<div className="flex flex-col">
<span className="font-bold text-primary font-caption text-body">#HLD-904</span>
<span className="font-caption text-[11px] text-text-secondary">PRIORITY 1</span>
</div>
</td>
<td className="py-3.5 px-space-md align-middle">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-caption font-caption">
                  JC
                </div>
<div className="flex flex-col">
<span className="font-semibold text-text-primary group-hover:text-primary transition-colors">Juan dela Cruz</span>
<span className="font-caption text-caption text-text-secondary">2022-04819 • Eng. Dept, Junior</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-md align-middle">
<div className="flex flex-col max-w-xs">
<span className="font-semibold text-text-primary truncate">Design Patterns: Elements of Reusable OO Software</span>
<span className="font-caption text-caption text-text-secondary flex items-center gap-1">
<span className="material-symbols-outlined text-[13px]">tag</span> QA76.64 .D47 1994
                </span>
</div>
</td>
<td className="py-3.5 px-space-md align-middle">
<div className="flex flex-col font-caption text-caption">
<span className="font-semibold text-text-primary">Today, 17:00</span>
<span className="text-status-pending">Review pending (2h)</span>
</div>
</td>
<td className="py-3.5 px-space-md align-middle">
<div className="inline-flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-full text-text-primary font-caption text-caption font-medium">
<span className="material-symbols-outlined text-[15px] text-primary">storefront</span>
<span className="">Bay 01 Counter</span>
</div>
</td>
<td className="py-3.5 px-space-md align-middle">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-pending/20 text-text-primary font-caption text-caption font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-status-pending"></span>
<span className="">Pending Review</span>
</span>
</td>
<td className="py-3.5 px-space-md align-middle text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="bg-action-green hover:bg-action-green-hover text-text-primary font-bold px-3 py-1.5 rounded font-caption text-caption shadow-sm transition-all" type="button">
                  Approve
                </button>
<button className="bg-surface-container hover:bg-error-container hover:text-on-error-container text-text-secondary px-2.5 py-1.5 rounded font-caption text-caption font-semibold transition-all" type="button">
                  Reject
                </button>
</div>
</td>
</tr>
{/* Row 2: HLD-905 */}
<tr className="bg-surface-container-low/40 hover:bg-surface-container-low transition-colors group">
<td className="py-3.5 px-space-md align-middle">
<div className="flex flex-col">
<span className="font-bold text-primary font-caption text-body">#HLD-905</span>
<span className="font-caption text-[11px] text-status-pending font-semibold">HIGH DEMAND</span>
</div>
</td>
<td className="py-3.5 px-space-md align-middle">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-full bg-soft-blue text-primary flex items-center justify-center font-bold text-caption font-caption">
                  MO
                </div>
<div className="flex flex-col">
<span className="font-semibold text-text-primary group-hover:text-primary transition-colors">Maria Clara Ocampo</span>
<span className="font-caption text-caption text-text-secondary">2021-10924 • Psychology, Senior</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-md align-middle">
<div className="flex flex-col max-w-xs">
<span className="font-semibold text-text-primary truncate">Thinking, Fast and Slow</span>
<span className="font-caption text-caption text-text-secondary flex items-center gap-1">
<span className="material-symbols-outlined text-[13px]">tag</span> BF441 .K238 2011
                </span>
</div>
</td>
<td className="py-3.5 px-space-md align-middle">
<div className="flex flex-col font-caption text-caption">
<span className="font-semibold text-text-primary">Tomorrow, 10:00</span>
<span className="text-text-secondary">Requested 40m ago</span>
</div>
</td>
<td className="py-3.5 px-space-md align-middle">
<div className="inline-flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-full text-text-primary font-caption text-caption font-medium">
<span className="material-symbols-outlined text-[15px] text-primary">smart_toy</span>
<span className="">Locker #A-04</span>
</div>
</td>
<td className="py-3.5 px-space-md align-middle">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-pending/20 text-text-primary font-caption text-caption font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-status-pending"></span>
<span className="">Pending Review</span>
</span>
</td>
<td className="py-3.5 px-space-md align-middle text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="bg-action-green hover:bg-action-green-hover text-text-primary font-bold px-3 py-1.5 rounded font-caption text-caption shadow-sm transition-all" type="button">
                  Approve
                </button>
<button className="bg-surface-container hover:bg-error-container hover:text-on-error-container text-text-secondary px-2.5 py-1.5 rounded font-caption text-caption font-semibold transition-all" type="button">
                  Reject
                </button>
</div>
</td>
</tr>
{/* Row 3: HLD-908 */}
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="py-3.5 px-space-md align-middle">
<div className="flex flex-col">
<span className="font-bold text-primary font-caption text-body">#HLD-908</span>
<span className="font-caption text-[11px] text-status-available font-semibold">FACULTY OVERRIDE</span>
</div>
</td>
<td className="py-3.5 px-space-md align-middle">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-caption font-caption">
                  RL
                </div>
<div className="flex flex-col">
<span className="font-semibold text-text-primary group-hover:text-primary transition-colors">Dr. Rafael Luna</span>
<span className="font-caption text-caption text-text-secondary">FAC-8812 • Faculty - Philosophy</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-md align-middle">
<div className="flex flex-col max-w-xs">
<span className="font-semibold text-text-primary truncate">The Republic (Oxford Classical)</span>
<span className="font-caption text-caption text-text-secondary flex items-center gap-1">
<span className="material-symbols-outlined text-[13px]">tag</span> JC71 .P35 2003
                </span>
</div>
</td>
<td className="py-3.5 px-space-md align-middle">
<div className="flex flex-col font-caption text-caption">
<span className="font-semibold text-status-available">Staged (24h left)</span>
<span className="text-text-secondary">Expires: Jun 21, 14:00</span>
</div>
</td>
<td className="py-3.5 px-space-md align-middle">
<div className="inline-flex items-center gap-1 bg-soft-blue text-primary px-2.5 py-1 rounded-full font-caption text-caption font-semibold">
<span className="material-symbols-outlined text-[15px]">lock</span>
<span className="">Locker #C-01</span>
</div>
</td>
<td className="py-3.5 px-space-md align-middle">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-available/20 text-text-primary font-caption text-caption font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
<span className="">Staged Ready</span>
</span>
</td>
<td className="py-3.5 px-space-md align-middle text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="bg-primary text-on-primary hover:bg-primary-container font-semibold px-3 py-1.5 rounded font-caption text-caption transition-all flex items-center gap-1" type="button">
<span className="material-symbols-outlined text-[14px]">send</span>
<span className="">Notify Patron</span>
</button>
<button className="bg-surface-container hover:bg-surface-container-high text-text-primary px-2 py-1.5 rounded font-caption text-caption font-medium transition-all" title="View Print Slip" type="button">
<span className="material-symbols-outlined text-[16px] align-middle">receipt_long</span>
</button>
</div>
</td>
</tr>
{/* Row 4: HLD-892 */}
<tr className="bg-surface-container-low/40 hover:bg-surface-container-low transition-colors group">
<td className="py-3.5 px-space-md align-middle">
<div className="flex flex-col">
<span className="font-bold text-primary font-caption text-body">#HLD-892</span>
<span className="font-caption text-[11px] text-text-secondary">STANDARD</span>
</div>
</td>
<td className="py-3.5 px-space-md align-middle">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-caption font-caption">
                  SM
                </div>
<div className="flex flex-col">
<span className="font-semibold text-text-primary group-hover:text-primary transition-colors">Sofia Morales</span>
<span className="font-caption text-caption text-text-secondary">2023-01982 • CS Undergrad</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-md align-middle">
<div className="flex flex-col max-w-xs">
<span className="font-semibold text-text-primary truncate">Clean Code: A Handbook of Agile Software Craftsmanship</span>
<span className="font-caption text-caption text-text-secondary flex items-center gap-1">
<span className="material-symbols-outlined text-[13px]">tag</span> QA76.76.C64 M37
                </span>
</div>
</td>
<td className="py-3.5 px-space-md align-middle">
<div className="flex flex-col font-caption text-caption">
<span className="font-semibold text-text-primary">Staged (11h left)</span>
<span className="text-error font-medium">Pickup window closing</span>
</div>
</td>
<td className="py-3.5 px-space-md align-middle">
<div className="inline-flex items-center gap-1 bg-soft-blue text-primary px-2.5 py-1 rounded-full font-caption text-caption font-semibold">
<span className="material-symbols-outlined text-[15px]">lock</span>
<span className="">Bay 01 Locker #A-02</span>
</div>
</td>
<td className="py-3.5 px-space-md align-middle">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-available/20 text-text-primary font-caption text-caption font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
<span className="">Staged Ready</span>
</span>
</td>
<td className="py-3.5 px-space-md align-middle text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="bg-surface-container-high hover:bg-secondary hover:text-on-secondary text-text-primary font-semibold px-3 py-1.5 rounded font-caption text-caption transition-all" type="button">
                  Release
                </button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
{/* Table Pagination Footer */}
<div className="px-space-lg py-3 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm font-caption text-caption text-text-secondary">
<div className="flex items-center gap-2">
<span className="">Rows per page:</span>
<select className="bg-surface-container-lowest text-text-primary rounded px-2 py-1 focus:outline-none">
<option>10</option>
<option>25</option>
<option>50</option>
</select>
<span className="">1 - 4 of 248 items</span>
</div>
<div className="flex items-center gap-1">
<button className="w-8 h-8 rounded bg-surface-container-lowest hover:bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors disabled={true}:opacity-40" disabled={true}>
<span className="material-symbols-outlined text-[18px]">chevron_left</span>
</button>
<button className="w-8 h-8 rounded bg-primary text-on-primary font-bold flex items-center justify-center">1</button>
<button className="w-8 h-8 rounded bg-surface-container-lowest hover:bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">2</button>
<button className="w-8 h-8 rounded bg-surface-container-lowest hover:bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">3</button>
<span className="px-1 text-text-secondary">...</span>
<button className="w-8 h-8 rounded bg-surface-container-lowest hover:bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">25</button>
<button className="w-8 h-8 rounded bg-surface-container-lowest hover:bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
<span className="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
</div>
</div>
</div>
{/* Operational Configuration & Staging Topology Split Layout */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg mt-space-xs">
{/* Reservation Policy & Shelf Allocation Config Card */}
<div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
<div className="flex flex-col gap-space-sm">
<div className="flex items-center justify-between pb-space-xs">
<div className="flex items-center gap-space-sm">
<div className="w-9 h-9 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[20px]">policy</span>
</div>
<div>
<h3 className="font-headline-4 text-headline-4 text-text-primary font-bold">
                Reservation Policy &amp; Shelf Allocation Parameters
              </h3>
<p className="font-caption text-caption text-text-secondary">
                Autonomous system thresholds for queue retention, hold caps, and automatic locker release.
              </p>
</div>
</div>
<span className="font-caption text-caption bg-action-green/20 text-text-primary font-bold px-2 py-1 rounded-full flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Live Policy Engine
          </span>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md mt-space-sm">
{/* Concurrent Holds Rules */}
<div className="bg-surface-container-low p-space-md rounded-xl flex flex-col justify-between">
<div className="flex flex-col">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">Concurrent Hold Limits</span>
<span className="material-symbols-outlined text-primary text-[18px]">group_work</span>
</div>
<p className="font-small text-small text-text-primary font-semibold mt-2">Active Patron Ceiling</p>
<div className="space-y-2 mt-space-xs">
<div className="flex items-center justify-between text-caption font-caption bg-surface-container-lowest px-space-sm py-2 rounded-lg">
<span className="text-text-secondary">Undergraduate Students</span>
<span className="font-bold text-text-primary px-2 py-0.5 rounded bg-surface-container">2 Holds max</span>
</div>
<div className="flex items-center justify-between text-caption font-caption bg-surface-container-lowest px-space-sm py-2 rounded-lg">
<span className="text-text-secondary">Faculty &amp; Researchers</span>
<span className="font-bold text-primary px-2 py-0.5 rounded bg-soft-blue">5 Holds max</span>
</div>
</div>
</div>
<div className="mt-space-sm pt-2 text-[11px] font-caption text-text-secondary">
              Overages automatically queue into secondary triage for Dean approval.
            </div>
</div>
{/* Pickup Window Config */}
<div className="bg-surface-container-low p-space-md rounded-xl flex flex-col justify-between">
<div className="flex flex-col">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">Pickup Window &amp; Reshelve</span>
<span className="material-symbols-outlined text-status-pending text-[18px]">schedule</span>
</div>
<p className="font-small text-small text-text-primary font-semibold mt-2">Retention Countdown</p>
<div className="space-y-2 mt-space-xs">
<div className="flex items-center justify-between text-caption font-caption bg-surface-container-lowest px-space-sm py-2 rounded-lg">
<span className="text-text-secondary">Default Stage Window</span>
<span className="font-bold text-text-primary px-2 py-0.5 rounded bg-surface-container">48 Hours</span>
</div>
<div className="flex items-center justify-between text-caption font-caption bg-surface-container-lowest px-space-sm py-2 rounded-lg">
<span className="text-text-secondary">Post-Expiry Action</span>
<span className="font-bold text-status-danger px-2 py-0.5 rounded bg-error-container">Auto-Reshelve</span>
</div>
</div>
</div>
<div className="mt-space-sm pt-2 text-[11px] font-caption text-text-secondary">
              Automated SMS and email dispatched at T-24h and T-4h before forfeiture.
            </div>
</div>
</div>
</div>
<div className="flex items-center justify-between mt-space-md pt-space-sm">
<div className="flex items-center gap-space-xs text-caption font-caption text-text-secondary">
<span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
<span className="">Last modified by Chief Librarian on Jun 18, 2024</span>
</div>
<button className="px-space-md py-2 bg-surface-container hover:bg-surface-container-high text-primary rounded-lg font-caption text-caption font-bold transition-colors" type="button">
          Adjust Hold Quotas
        </button>
</div>
</div>
{/* Real-time Locker Bay Staging Visualizer */}
<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
<div className="flex flex-col">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px]">grid_view</span>
<h4 className="font-headline-4 text-headline-4 text-text-primary font-bold">Locker Bay Telemetry</h4>
</div>
<span className="font-caption text-caption text-status-available font-bold flex items-center gap-1">
<span className="w-2 h-2 rounded-full bg-status-available"></span> ONLINE
          </span>
</div>
<p className="font-caption text-caption text-text-secondary mt-1">
          Automated Smart Locker cluster status at Ground Floor Circulation.
        </p>
{/* Inline Locker Matrix Visualizer */}
<div className="grid grid-cols-4 gap-2 mt-space-md">
<div className="bg-status-available/25 p-2 rounded-lg text-center flex flex-col items-center">
<span className="font-caption text-[11px] text-text-primary font-bold">A-01</span>
<span className="material-symbols-outlined text-[16px] text-status-available">lock</span>
<span className="text-[9px] font-caption text-text-secondary mt-0.5">READY</span>
</div>
<div className="bg-action-green/30 p-2 rounded-lg text-center flex flex-col items-center">
<span className="font-caption text-[11px] text-text-primary font-bold">A-02</span>
<span className="material-symbols-outlined text-[16px] text-text-primary">lock_clock</span>
<span className="text-[9px] font-caption text-text-primary font-bold">11h</span>
</div>
<div className="bg-surface-container p-2 rounded-lg text-center flex flex-col items-center opacity-60">
<span className="font-caption text-[11px] text-text-secondary font-bold">A-03</span>
<span className="material-symbols-outlined text-[16px] text-text-secondary">lock_open_right</span>
<span className="text-[9px] font-caption text-text-secondary mt-0.5">EMPTY</span>
</div>
<div className="bg-status-pending/25 p-2 rounded-lg text-center flex flex-col items-center">
<span className="font-caption text-[11px] text-text-primary font-bold">A-04</span>
<span className="material-symbols-outlined text-[16px] text-status-pending">pending</span>
<span className="text-[9px] font-caption text-text-secondary mt-0.5">ASSIGN</span>
</div>
<div className="bg-status-available/25 p-2 rounded-lg text-center flex flex-col items-center">
<span className="font-caption text-[11px] text-text-primary font-bold">B-01</span>
<span className="material-symbols-outlined text-[16px] text-status-available">lock</span>
<span className="text-[9px] font-caption text-text-secondary mt-0.5">READY</span>
</div>
<div className="bg-status-available/25 p-2 rounded-lg text-center flex flex-col items-center">
<span className="font-caption text-[11px] text-text-primary font-bold">B-02</span>
<span className="material-symbols-outlined text-[16px] text-status-available">lock</span>
<span className="text-[9px] font-caption text-text-secondary mt-0.5">READY</span>
</div>
<div className="bg-surface-container p-2 rounded-lg text-center flex flex-col items-center opacity-60">
<span className="font-caption text-[11px] text-text-secondary font-bold">B-03</span>
<span className="material-symbols-outlined text-[16px] text-text-secondary">lock_open_right</span>
<span className="text-[9px] font-caption text-text-secondary mt-0.5">EMPTY</span>
</div>
<div className="bg-status-available/25 p-2 rounded-lg text-center flex flex-col items-center">
<span className="font-caption text-[11px] text-text-primary font-bold">B-04</span>
<span className="material-symbols-outlined text-[16px] text-status-available">lock</span>
<span className="text-[9px] font-caption text-text-secondary mt-0.5">READY</span>
</div>
<div className="bg-action-green/30 p-2 rounded-lg text-center flex flex-col items-center">
<span className="font-caption text-[11px] text-text-primary font-bold">C-01</span>
<span className="material-symbols-outlined text-[16px] text-text-primary">lock_clock</span>
<span className="text-[9px] font-caption text-text-primary font-bold">24h</span>
</div>
<div className="bg-surface-container p-2 rounded-lg text-center flex flex-col items-center opacity-60">
<span className="font-caption text-[11px] text-text-secondary font-bold">C-02</span>
<span className="material-symbols-outlined text-[16px] text-text-secondary">lock_open_right</span>
<span className="text-[9px] font-caption text-text-secondary mt-0.5">EMPTY</span>
</div>
<div className="bg-surface-container p-2 rounded-lg text-center flex flex-col items-center opacity-60">
<span className="font-caption text-[11px] text-text-secondary font-bold">C-03</span>
<span className="material-symbols-outlined text-[16px] text-text-secondary">lock_open_right</span>
<span className="text-[9px] font-caption text-text-secondary mt-0.5">EMPTY</span>
</div>
<div className="bg-error-container p-2 rounded-lg text-center flex flex-col items-center">
<span className="font-caption text-[11px] text-error font-bold">C-04</span>
<span className="material-symbols-outlined text-[16px] text-error">error</span>
<span className="text-[9px] font-caption text-error font-bold">OVERDUE</span>
</div>
</div>
</div>
<div className="mt-space-md pt-space-xs flex items-center justify-between text-caption font-caption text-text-secondary">
<span className="flex items-center gap-1">
<span className="w-2 h-2 rounded bg-surface-container"></span> 4 Slots Vacant
        </span>
<button className="text-primary font-semibold hover:underline flex items-center gap-0.5">
<span className="">Run diagnostics</span>
<span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</button>
</div>
</div>
</div>
</div>
    </div>
  );
};

export default Reservations;
