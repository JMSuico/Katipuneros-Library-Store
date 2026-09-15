// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// AdminDashboard.tsx -- Admin System Executive Dashboard
// Converted directly from SidebarAdminDashboardPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC } from 'react';

const AdminDashboard: FC = () => {
  return (
    <div className="w-full">
      <div className="flex flex-col w-full gap-space-lg">
{/* Top Bar: Overview Title & Quick Actions */}
<div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md">
<div className="flex flex-col">
<div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption uppercase tracking-wider mb-1">
<span className="">Admin Console</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="text-primary font-semibold">System Overview</span>
<span className="inline-flex items-center gap-1 ml-space-xs px-2 py-0.5 rounded-full bg-soft-blue text-primary text-[11px] font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-action-green animate-pulse"></span>
          Live Stream
        </span>
</div>
<h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight font-bold">Administrator Operations &amp; System Dashboard</h1>
<p className="font-body text-body text-text-secondary mt-0.5">Real-time institutional monitoring, inventory circulation velocity, hold queues, and critical alerts.</p>
</div>
{/* Quick Actions Banner */}
<div className="flex flex-wrap items-center gap-space-xs bg-surface-container-lowest p-1.5 rounded-xl shadow-sm">
<button className="h-11 px-space-md bg-secondary text-on-secondary rounded-lg font-small text-small font-semibold flex items-center gap-space-xs hover:bg-primary transition-colors shadow-sm" type="button">
<span className="material-symbols-outlined text-[18px]">person_add</span>
<span className="">+ Add User</span>
</button>
<button className="h-11 px-space-md bg-action-green text-text-primary rounded-lg font-small text-small font-bold flex items-center gap-space-xs hover:bg-action-green-hover transition-colors shadow-sm" type="button">
<span className="material-symbols-outlined text-[18px]">menu_book</span>
<span className="">+ Add Book</span>
</button>
<button className="h-11 px-space-md bg-surface-container-low text-text-primary rounded-lg font-small text-small font-medium flex items-center gap-space-xs hover:bg-surface-container transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">analytics</span>
<span className="">View Analytics</span>
</button>
<button className="h-11 px-space-md bg-surface-container-low text-text-primary rounded-lg font-small text-small font-medium flex items-center gap-space-xs hover:bg-surface-container transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">receipt_long</span>
<span className="">Generate Audit Report</span>
</button>
</div>
</div>
{/* KPI Cards Grid (8 Core Metrics) */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
{/* Card 1: Total Users */}
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">Total Users</span>
<div className="w-9 h-9 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[20px]">groups</span>
</div>
</div>
<div className="mt-space-md">
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-3 text-headline-3 font-bold text-text-primary">3,420</span>
<span className="font-caption text-caption text-status-available font-bold flex items-center">
<span className="material-symbols-outlined text-[14px]">arrow_upward</span>12.4%
          </span>
</div>
<p className="font-small text-small text-text-secondary mt-1">142 active borrowers today</p>
</div>
</div>
{/* Card 2: Total Titles */}
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">Total Book Titles</span>
<div className="w-9 h-9 rounded-lg bg-secondary-container flex items-center justify-center text-secondary">
<span className="material-symbols-outlined text-[20px]">collections_bookmark</span>
</div>
</div>
<div className="mt-space-md">
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-3 text-headline-3 font-bold text-text-primary">1,248</span>
<span className="font-caption text-caption text-text-secondary">titles</span>
</div>
<p className="font-small text-small text-text-secondary mt-1">4,850 physical copies total</p>
</div>
</div>
{/* Card 3: Available Shelf */}
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">Available Books</span>
<div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-status-available">
<span className="material-symbols-outlined text-[20px]">check_circle</span>
</div>
</div>
<div className="mt-space-md">
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-3 text-headline-3 font-bold text-text-primary">3,112</span>
<span className="font-caption text-caption px-1.5 py-0.5 rounded bg-soft-blue text-primary font-bold">64.2%</span>
</div>
<p className="font-small text-small text-text-secondary mt-1">Active catalog shelf rate</p>
</div>
</div>
{/* Card 4: Borrowed Books */}
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">Borrowed Books</span>
<div className="w-9 h-9 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[20px]">local_library</span>
</div>
</div>
<div className="mt-space-md">
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-3 text-headline-3 font-bold text-text-primary">1,384</span>
<span className="font-caption text-caption text-primary font-semibold">28.5%</span>
</div>
<p className="font-small text-small text-text-secondary mt-1">Active loans across departments</p>
</div>
</div>
{/* Card 5: Reserved Books */}
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">Reserved Books</span>
<div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
<span className="material-symbols-outlined text-[20px]">bookmark_added</span>
</div>
</div>
<div className="mt-space-md">
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-3 text-headline-3 font-bold text-text-primary">248</span>
<span className="font-caption text-caption text-text-secondary">on shelf hold</span>
</div>
<p className="font-small text-small text-text-secondary mt-1">Awaiting cashier / circulation release</p>
</div>
</div>
{/* Card 6: Pending Reservations (Alert) */}
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">Pending Holds</span>
<div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-status-pending">
<span className="material-symbols-outlined text-[20px]">hourglass_top</span>
</div>
</div>
<div className="mt-space-md">
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-3 text-headline-3 font-bold text-text-primary">28</span>
<span className="font-caption text-caption px-2 py-0.5 rounded-full bg-status-pending/20 text-text-primary font-bold">+6 today</span>
</div>
<p className="font-small text-small text-text-secondary mt-1">Requires supervisor queue review</p>
</div>
</div>
{/* Card 7: Overdue Books (Danger Alert) */}
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">Overdue Books</span>
<div className="w-9 h-9 rounded-lg bg-error-container flex items-center justify-center text-error">
<span className="material-symbols-outlined text-[20px]">warning</span>
</div>
</div>
<div className="mt-space-md">
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-3 text-headline-3 font-bold text-error">18</span>
<span className="font-caption text-caption px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-semibold">₱1,245.00</span>
</div>
<p className="font-small text-small text-text-secondary mt-1">Pending unpaid balance &amp; fines</p>
</div>
</div>
{/* Card 8: Store Visits */}
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">Store Footprint</span>
<div className="w-9 h-9 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[20px]">storefront</span>
</div>
</div>
<div className="mt-space-md">
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-3 text-headline-3 font-bold text-text-primary">14,890</span>
<span className="font-caption text-caption text-status-available font-bold flex items-center">
<span className="material-symbols-outlined text-[14px]">trending_up</span>+8.2%
          </span>
</div>
<p className="font-small text-small text-text-secondary mt-1">Monthly aggregate patron visits</p>
</div>
</div>
</div>
{/* Interactive Charts & Analytical Split */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
{/* Chart: Activity Velocity Trend (8 Cols) */}
<div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
<div>
<h2 className="font-headline-4 text-headline-4 font-bold text-text-primary">Circulation &amp; Reservation Dynamics</h2>
<p className="font-caption text-caption text-text-secondary">Comparing student borrowings, pending reservations, and counter returns</p>
</div>
{/* Time Filter Controls */}
<div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
<button className="px-3 py-1 text-caption font-caption font-semibold rounded bg-surface-container-lowest text-primary shadow-sm" type="button">Weekly</button>
<button className="px-3 py-1 text-caption font-caption font-medium text-text-secondary hover:text-text-primary transition-colors" type="button">Monthly</button>
<button className="px-3 py-1 text-caption font-caption font-medium text-text-secondary hover:text-text-primary transition-colors" type="button">Term Q3</button>
</div>
</div>
{/* Legend Pills */}
<div className="flex flex-wrap items-center gap-space-md mb-space-md">
<div className="flex items-center gap-space-xs">
<span className="w-3 h-3 rounded-full bg-primary"></span>
<span className="font-caption text-caption text-text-secondary">Borrowings (642 loans)</span>
</div>
<div className="flex items-center gap-space-xs">
<span className="w-3 h-3 rounded-full bg-secondary-fixed-dim"></span>
<span className="font-caption text-caption text-text-secondary">Reservations (248 holds)</span>
</div>
<div className="flex items-center gap-space-xs">
<span className="w-3 h-3 rounded-full bg-action-green"></span>
<span className="font-caption text-caption text-text-secondary">Returns (512 processed)</span>
</div>
</div>
{/* Vector Curved Area / Multi-line Chart */}
<div className="relative w-full h-64 bg-surface-container-low/40 rounded-xl p-4 flex flex-col justify-end overflow-hidden">
<svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 200">
<defs>
<linearGradient id="primaryGradient" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stop-color="#00658a" stop-opacity="0.32"></stop>
<stop offset="100%" stop-color="#00658a" stop-opacity="0.0"></stop>
</linearGradient>
<linearGradient id="secondaryGradient" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stop-color="#9ccee6" stop-opacity="0.45"></stop>
<stop offset="100%" stop-color="#9ccee6" stop-opacity="0.0"></stop>
</linearGradient>
</defs>
{/* Horizontal Grid Guides */}
<line stroke="#e2e9ea" stroke-dasharray="4 4" strokeWidth="1" x1="0" x2="700" y1="40" y2="40"></line>
<line stroke="#e2e9ea" stroke-dasharray="4 4" strokeWidth="1" x1="0" x2="700" y1="90" y2="90"></line>
<line stroke="#e2e9ea" stroke-dasharray="4 4" strokeWidth="1" x1="0" x2="700" y1="140" y2="140"></line>
{/* Area 1: Returns (Action Green Subtle) */}
<path d="M 0 160 Q 110 130, 230 145 T 460 110 T 700 80 L 700 200 L 0 200 Z" fill="#9BE564" fill-opacity="0.15"></path>
<path d="M 0 160 Q 110 130, 230 145 T 460 110 T 700 80" fill="none" stroke="#7FA58D" strokeWidth="2"></path>
{/* Area 2: Reservations */}
<path d="M 0 140 Q 120 110, 240 125 T 480 85 T 700 55 L 700 200 L 0 200 Z" fill="url(#secondaryGradient)"></path>
<path d="M 0 140 Q 120 110, 240 125 T 480 85 T 700 55" fill="none" stroke="#26809d" strokeWidth="2"></path>
{/* Area 3: Borrowings Primary Blue */}
<path d="M 0 120 Q 120 60, 240 85 T 480 40 T 700 20 L 700 200 L 0 200 Z" fill="url(#primaryGradient)"></path>
<path d="M 0 120 Q 120 60, 240 85 T 480 40 T 700 20" fill="none" stroke="#00658a" strokeWidth="3"></path>
{/* Data Points on Borrowing Curve */}
<circle cx="240" cy="85" fill="#00658a" r="4"></circle>
<circle cx="480" cy="40" fill="#00658a" r="4"></circle>
<circle cx="700" cy="20" fill="#00658a" r="4"></circle>
</svg>
{/* X-axis Labels */}
<div className="flex justify-between font-caption text-caption text-text-secondary pt-2">
<span className="">Mon, Oct 14</span>
<span className="">Tue, Oct 15</span>
<span className="">Wed, Oct 16</span>
<span className="">Thu, Oct 17</span>
<span className="">Fri, Oct 18</span>
<span className="">Sat, Oct 19</span>
<span className="">Sun, Oct 20</span>
</div>
</div>
</div>
{/* Chart: Catalog Shelf Breakdown (4 Cols) */}
<div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-space-xs">
<h2 className="font-headline-4 text-headline-4 font-bold text-text-primary">Catalog Allocation</h2>
<span className="material-symbols-outlined text-text-secondary text-[20px]">pie_chart</span>
</div>
<p className="font-caption text-caption text-text-secondary mb-space-md">Physical holdings distribution status</p>
</div>
{/* Donut Display Simulation with Central Metric */}
<div className="flex items-center justify-center my-space-xs">
<div className="relative w-44 h-44 flex items-center justify-center">
<svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
{/* Background Ring */}
<path className="text-surface-container" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
{/* Available 64% */}
<path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#7FA58D" stroke-dasharray="64, 100" strokeWidth="3.5"></path>
{/* Borrowed 28% */}
<path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#00658a" stroke-dasharray="28, 100" stroke-dashoffset="-64" strokeWidth="3.5"></path>
{/* Reserved 5% */}
<path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#D9A85C" stroke-dasharray="5, 100" stroke-dashoffset="-92" strokeWidth="3.5"></path>
</svg>
<div className="absolute flex flex-col items-center justify-center text-center">
<span className="font-headline-3 text-headline-3 font-bold text-text-primary leading-none">4,850</span>
<span className="font-caption text-caption text-text-secondary mt-1">Total Volumes</span>
</div>
</div>
</div>
{/* Segment Bars / Breakdown details */}
<div className="flex flex-col gap-2 mt-space-sm">
<div className="flex items-center justify-between font-small text-small">
<div className="flex items-center gap-space-xs">
<span className="w-2.5 h-2.5 rounded-full bg-status-available"></span>
<span className="text-text-secondary">On Shelf (Available)</span>
</div>
<span className="font-semibold text-text-primary">64% (3,112)</span>
</div>
<div className="flex items-center justify-between font-small text-small">
<div className="flex items-center gap-space-xs">
<span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
<span className="text-text-secondary">Active Borrowings</span>
</div>
<span className="font-semibold text-text-primary">28% (1,384)</span>
</div>
<div className="flex items-center justify-between font-small text-small">
<div className="flex items-center gap-space-xs">
<span className="w-2.5 h-2.5 rounded-full bg-status-pending"></span>
<span className="text-text-secondary">Reserved / Holds</span>
</div>
<span className="font-semibold text-text-primary">5% (248)</span>
</div>
<div className="flex items-center justify-between font-small text-small">
<div className="flex items-center gap-space-xs">
<span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>
<span className="text-text-secondary">Bindery / Processing</span>
</div>
<span className="font-semibold text-text-primary">3% (106)</span>
</div>
</div>
</div>
</div>
{/* Operational Queues & Priority Action Feed (2 Columns) */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
{/* Left Column: Urgent Pending Holds Queue (7 Cols) */}
<div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col">
<div className="flex items-center justify-between mb-space-md">
<div className="flex items-center gap-space-xs">
<div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[18px]">rule</span>
</div>
<div>
<h3 className="font-headline-4 text-headline-4 font-bold text-text-primary">Urgent Pending Holds Queue</h3>
<span className="font-caption text-caption text-text-secondary">28 hold requests requiring administrative release</span>
</div>
</div>
<a className="font-caption text-caption text-primary font-bold hover:underline flex items-center" href="#">
          View All <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
</a>
</div>
{/* Operational Holds Table */}
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead>
<tr className="bg-surface-container-low font-caption text-caption text-text-secondary uppercase">
<th className="py-2.5 px-3 rounded-l-lg">Hold ID</th>
<th className="py-2.5 px-3">Patron Name</th>
<th className="py-2.5 px-3">Book Title</th>
<th className="py-2.5 px-3">Deadline</th>
<th className="py-2.5 px-3 text-right rounded-r-lg">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container-high/40 font-small text-small">
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-3 px-3 font-semibold text-primary">#HLD-904</td>
<td className="py-3 px-3">
<div className="flex flex-col">
<span className="font-semibold text-text-primary">Juan dela Cruz</span>
<span className="font-caption text-caption text-text-secondary">Eng. Dept · Junior</span>
</div>
</td>
<td className="py-3 px-3 text-text-primary">Design Patterns: Elements of Reusable OO Software</td>
<td className="py-3 px-3">
<span className="px-2 py-0.5 rounded text-caption font-caption font-semibold bg-soft-blue text-primary">Today, 5:00 PM</span>
</td>
<td className="py-3 px-3 text-right">
<div className="inline-flex items-center gap-1">
<button className="h-8 px-2.5 bg-action-green text-text-primary rounded-lg font-caption text-caption font-bold hover:bg-action-green-hover transition-colors" type="button">Approve</button>
<button className="h-8 px-2 bg-surface-container text-text-secondary rounded-lg font-caption text-caption hover:text-text-primary transition-colors" type="button">Review</button>
</div>
</td>
</tr>
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-3 px-3 font-semibold text-primary">#HLD-905</td>
<td className="py-3 px-3">
<div className="flex flex-col">
<span className="font-semibold text-text-primary">Maria Clara Ocampo</span>
<span className="font-caption text-caption text-text-secondary">Psychology · Senior</span>
</div>
</td>
<td className="py-3 px-3 text-text-primary">Thinking, Fast and Slow (Annotated)</td>
<td className="py-3 px-3">
<span className="px-2 py-0.5 rounded text-caption font-caption font-semibold bg-soft-blue text-primary">Tomorrow, 10:00 AM</span>
</td>
<td className="py-3 px-3 text-right">
<div className="inline-flex items-center gap-1">
<button className="h-8 px-2.5 bg-action-green text-text-primary rounded-lg font-caption text-caption font-bold hover:bg-action-green-hover transition-colors" type="button">Approve</button>
<button className="h-8 px-2 bg-surface-container text-text-secondary rounded-lg font-caption text-caption hover:text-text-primary transition-colors" type="button">Review</button>
</div>
</td>
</tr>
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-3 px-3 font-semibold text-primary">#HLD-908</td>
<td className="py-3 px-3">
<div className="flex flex-col">
<span className="font-semibold text-text-primary">Rafael Luna</span>
<span className="font-caption text-caption text-text-secondary">Faculty · Philosophy</span>
</div>
</td>
<td className="py-3 px-3 text-text-primary">The Republic (Plato, Oxford Classical)</td>
<td className="py-3 px-3">
<span className="px-2 py-0.5 rounded text-caption font-caption font-semibold bg-surface-container text-text-secondary">Oct 22, 12:00 PM</span>
</td>
<td className="py-3 px-3 text-right">
<div className="inline-flex items-center gap-1">
<button className="h-8 px-2.5 bg-action-green text-text-primary rounded-lg font-caption text-caption font-bold hover:bg-action-green-hover transition-colors" type="button">Approve</button>
<button className="h-8 px-2 bg-surface-container text-text-secondary rounded-lg font-caption text-caption hover:text-text-primary transition-colors" type="button">Review</button>
</div>
</td>
</tr>
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-3 px-3 font-semibold text-primary">#HLD-911</td>
<td className="py-3 px-3">
<div className="flex flex-col">
<span className="font-semibold text-text-primary">Patricia Gomez</span>
<span className="font-caption text-caption text-text-secondary">Nursing · 2nd Year</span>
</div>
</td>
<td className="py-3 px-3 text-text-primary">Guyton and Hall Textbook of Medical Physiology</td>
<td className="py-3 px-3">
<span className="px-2 py-0.5 rounded text-caption font-caption font-semibold bg-surface-container text-text-secondary">Oct 23, 2:00 PM</span>
</td>
<td className="py-3 px-3 text-right">
<div className="inline-flex items-center gap-1">
<button className="h-8 px-2.5 bg-action-green text-text-primary rounded-lg font-caption text-caption font-bold hover:bg-action-green-hover transition-colors" type="button">Approve</button>
<button className="h-8 px-2 bg-surface-container text-text-secondary rounded-lg font-caption text-caption hover:text-text-primary transition-colors" type="button">Review</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
</div>
{/* Right Column: Overdue Books Needing Attention (5 Cols) */}
<div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-space-md">
<div className="flex items-center gap-space-xs">
<div className="w-8 h-8 rounded-lg bg-error-container flex items-center justify-center text-error">
<span className="material-symbols-outlined text-[18px]">assignment_late</span>
</div>
<div>
<h3 className="font-headline-4 text-headline-4 font-bold text-text-primary">Overdue Fines Alert</h3>
<span className="font-caption text-caption text-text-secondary">18 active delinquency flags</span>
</div>
</div>
<span className="px-2 py-0.5 rounded bg-error-container text-error font-caption text-caption font-bold">Action Needed</span>
</div>
{/* Overdue Item List */}
<div className="flex flex-col gap-space-sm">
{/* Overdue Row 1 */}
<div className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between">
<div className="flex items-start gap-space-sm">
<div className="w-8 h-8 rounded-full bg-error-container text-error flex items-center justify-center mt-0.5">
<span className="material-symbols-outlined text-[16px]">priority_high</span>
</div>
<div className="flex flex-col">
<span className="font-small text-small font-semibold text-text-primary">Carlos Mendoza</span>
<span className="font-caption text-caption text-text-secondary truncate max-w-[190px]">Introduction to Algorithms (MIT Press)</span>
<div className="flex items-center gap-space-xs mt-1">
<span className="px-1.5 py-0.2 rounded bg-error/15 text-error font-caption text-[11px] font-bold">7 days overdue</span>
<span className="font-caption text-caption text-text-secondary">Accrued fine: ₱105.00</span>
</div>
</div>
</div>
<button className="h-8 px-2.5 rounded-lg bg-surface-container-highest hover:bg-primary hover:text-on-primary text-text-primary font-caption text-caption font-semibold transition-colors flex items-center gap-1" type="button">
<span className="material-symbols-outlined text-[14px]">send</span>
<span className="">Notice</span>
</button>
</div>
{/* Overdue Row 2 */}
<div className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between">
<div className="flex items-start gap-space-sm">
<div className="w-8 h-8 rounded-full bg-error-container text-error flex items-center justify-center mt-0.5">
<span className="material-symbols-outlined text-[16px]">priority_high</span>
</div>
<div className="flex flex-col">
<span className="font-small text-small font-semibold text-text-primary">Samantha Lee</span>
<span className="font-caption text-caption text-text-secondary truncate max-w-[190px]">Modern Operating Systems, 4th Ed.</span>
<div className="flex items-center gap-space-xs mt-1">
<span className="px-1.5 py-0.2 rounded bg-error/15 text-error font-caption text-[11px] font-bold">12 days overdue</span>
<span className="font-caption text-caption text-text-secondary">Accrued fine: ₱180.00</span>
</div>
</div>
</div>
<button className="h-8 px-2.5 rounded-lg bg-surface-container-highest hover:bg-primary hover:text-on-primary text-text-primary font-caption text-caption font-semibold transition-colors flex items-center gap-1" type="button">
<span className="material-symbols-outlined text-[14px]">send</span>
<span className="">Notice</span>
</button>
</div>
{/* Overdue Row 3 */}
<div className="p-space-sm rounded-lg bg-surface-container-low flex items-center justify-between">
<div className="flex items-start gap-space-sm">
<div className="w-8 h-8 rounded-full bg-error-container text-error flex items-center justify-center mt-0.5">
<span className="material-symbols-outlined text-[16px]">priority_high</span>
</div>
<div className="flex flex-col">
<span className="font-small text-small font-semibold text-text-primary">Elijah Santos</span>
<span className="font-caption text-caption text-text-secondary truncate max-w-[190px]">Microeconomic Theory (Mas-Colell)</span>
<div className="flex items-center gap-space-xs mt-1">
<span className="px-1.5 py-0.2 rounded bg-error/15 text-error font-caption text-[11px] font-bold">4 days overdue</span>
<span className="font-caption text-caption text-text-secondary">Accrued fine: ₱60.00</span>
</div>
</div>
</div>
<button className="h-8 px-2.5 rounded-lg bg-surface-container-highest hover:bg-primary hover:text-on-primary text-text-primary font-caption text-caption font-semibold transition-colors flex items-center gap-1" type="button">
<span className="material-symbols-outlined text-[14px]">send</span>
<span className="">Notice</span>
</button>
</div>
</div>
</div>
<div className="mt-space-md pt-space-xs">
<button className="w-full h-9 bg-error-container text-on-error-container rounded-lg font-caption text-caption font-bold hover:bg-error hover:text-on-error transition-colors flex items-center justify-center gap-space-xs" type="button">
<span className="material-symbols-outlined text-[16px]">outgoing_mail</span>
<span className="">Send Batch Overdue Reminders (18 Recipient Emails)</span>
</button>
</div>
</div>
</div>
{/* Recent System Activity Stream (Audit log snippet) & Visual Showcase */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md">
{/* Audit Activity Feed (8 Cols) */}
<div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
<div className="flex items-center justify-between mb-space-md">
<div className="flex items-center gap-space-xs">
<div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[18px]">history</span>
</div>
<div>
<h3 className="font-headline-4 text-headline-4 font-bold text-text-primary">Recent Institutional Activity Stream</h3>
<span className="font-caption text-caption text-text-secondary">Real-time system transaction logs &amp; security checkpoints</span>
</div>
</div>
<button className="h-8 px-space-sm bg-surface-container-low rounded-lg text-text-secondary font-caption text-caption hover:text-text-primary transition-colors flex items-center gap-1" type="button">
<span className="material-symbols-outlined text-[16px]">filter_list</span>
<span className="">Filter Logs</span>
</button>
</div>
{/* Feed entries */}
<div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-high">
{/* Entry 1 */}
<div className="relative flex items-start gap-space-md">
<span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-action-green flex items-center justify-center">
<span className="w-1.5 h-1.5 rounded-full bg-text-primary"></span>
</span>
<div className="flex-1 bg-surface-container-low p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
<div>
<span className="font-small text-small font-semibold text-text-primary">New book added to circulation:</span>
<span className="font-small text-small text-primary font-medium"> 'Clean Architecture (2nd Ed.)'</span>
<p className="font-caption text-caption text-text-secondary mt-0.5">Cataloger #ADM-04 assigned barcode #BC-99210 to Physical Shelf Bay 4B</p>
</div>
<span className="font-caption text-caption text-text-secondary shrink-0 font-medium">12m ago</span>
</div>
</div>
{/* Entry 2 */}
<div className="relative flex items-start gap-space-md">
<span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-status-available flex items-center justify-center">
<span className="w-1.5 h-1.5 rounded-full bg-surface-container-lowest"></span>
</span>
<div className="flex-1 bg-surface-container-low p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
<div>
<span className="font-small text-small font-semibold text-text-primary">Circulation fine collected:</span>
<span className="font-small text-small text-status-available font-bold"> ₱90.00 cash settlement</span>
<p className="font-caption text-caption text-text-secondary mt-0.5">Handled by Cashier Elena Vance on Counter Terminal Bay 01</p>
</div>
<span className="font-caption text-caption text-text-secondary shrink-0 font-medium">24m ago</span>
</div>
</div>
{/* Entry 3 */}
<div className="relative flex items-start gap-space-md">
<span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-secondary-fixed-dim flex items-center justify-center">
<span className="w-1.5 h-1.5 rounded-full bg-text-primary"></span>
</span>
<div className="flex-1 bg-surface-container-low p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
<div>
<span className="font-small text-small font-semibold text-text-primary">New patron verified:</span>
<span className="font-small text-small text-secondary font-semibold"> Gabriel Silang (#KP-77210)</span>
<p className="font-caption text-caption text-text-secondary mt-0.5">Institutional credentials defaultChecked and borrowing clearance issued by Registrar Desk</p>
</div>
<span className="font-caption text-caption text-text-secondary shrink-0 font-medium">45m ago</span>
</div>
</div>
{/* Entry 4 */}
<div className="relative flex items-start gap-space-md">
<span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
<span className="w-1.5 h-1.5 rounded-full bg-surface-container-lowest"></span>
</span>
<div className="flex-1 bg-surface-container-low p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
<div>
<span className="font-small text-small font-semibold text-text-primary">Priority reservation approved:</span>
<span className="font-small text-small text-primary font-medium"> 'Structure &amp; Interpretation of Computer Programs'</span>
<p className="font-caption text-caption text-text-secondary mt-0.5">Book moved to Ready for Pickup shelf rack A1. SMS notification sent.</p>
</div>
<span className="font-caption text-caption text-text-secondary shrink-0 font-medium">1h ago</span>
</div>
</div>
</div>
</div>
{/* Right Side: Library Store Showcase / Staff Feature (4 Cols) */}
<div className="lg:col-span-4 flex flex-col gap-space-md">
{/* Store Floor Status Card */}
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between relative overflow-hidden">
<div className="flex items-center justify-between mb-space-sm">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">Floor Occupancy</span>
<span className="px-2 py-0.5 rounded-full bg-action-green/30 text-text-primary font-caption text-caption font-bold">Optimal 42%</span>
</div>
<div className="relative h-28 rounded-lg overflow-hidden mb-space-sm">
<img className="w-full h-full object-cover" data-alt="Bright modern university library interior with wooden study pods, rows of neatly cataloged bookshelves under soft ambient architectural lighting, students reading comfortably, tranquil blue and neutral tones." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkNM0qOedZmc-hri65KuVMFVKfrGqcKBF-_vjCPeMibLBMltzedMm8vo3pIbwmXaX969kqXZKDTTRI7MAQPSIgEDTlTIdrKOtqXE5f8Pyxr8vX2fwRR6cBNL8U1KAaIkzurzRmg6e8ImM2XgNDK1OrjCt0TuYBPbqGyLBpzBw-r3hDquwsWHFRElp9uHGhD9zmpUPBym1RwHhwoa68i8ekDRJGUcF6iKQ0u3-TFO9kC0opISMRq9eT" />
<div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-2.5">
<div className="text-on-primary">
<span className="font-small text-small font-bold block">Main Reading Commons</span>
<span className="font-caption text-caption text-secondary-fixed">88 / 210 study stations currently occupied</span>
</div>
</div>
</div>
<div className="flex items-center justify-between font-caption text-caption text-text-secondary">
<span className="">RFID Gate Turnstiles: Active</span>
<span className="text-status-available font-semibold flex items-center gap-0.5">
<span className="w-2 h-2 rounded-full bg-status-available"></span> Normal Flow
          </span>
</div>
</div>
{/* Quick Maintenance Note / Admin Shift Panel */}
<div className="bg-gradient-to-br from-soft-blue to-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between">
<div className="flex items-start justify-between">
<div>
<span className="font-caption text-caption uppercase tracking-wider text-primary font-bold">Supervisor On Duty</span>
<h4 className="font-headline-4 text-headline-4 font-bold text-text-primary mt-1">Shift 02 · Desk Alpha</h4>
</div>
<div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
<span className="material-symbols-outlined text-[22px]">badge</span>
</div>
</div>
<p className="font-small text-small text-text-secondary mt-2">
          Scheduled catalog barcode sync is set for 10:30 PM tonight. Please resolve the 18 overdue notices prior to the maintenance window.
        </p>
<div className="mt-space-md flex items-center justify-between pt-space-xs">
<span className="font-caption text-caption text-text-secondary">Next sync in: <strong>4h 12m</strong></span>
<button className="h-8 px-space-sm bg-primary text-on-primary font-caption text-caption font-semibold rounded-lg hover:bg-primary-container transition-colors" type="button">
            Run Manual Sync
          </button>
</div>
</div>
</div>
</div>
</div>
    </div>
  );
};

export default AdminDashboard;
