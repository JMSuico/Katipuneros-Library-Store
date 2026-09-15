// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// Analytics.tsx -- Admin System Analytics and Deep Metrics
// Converted directly from SiderbarAnalyticsPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const Analytics: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
// Micro-interaction for toggling series visibility in the primary chart
  document.querySelectorAll('.series-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const icon = pill.querySelector('.material-symbols-outlined');
      const isChecked = icon.textContent === 'check_circle';
      if (isChecked) {
        icon.textContent = 'radio_button_unchecked';
        icon.classList.remove('text-action-green');
        icon.classList.add('text-text-secondary');
        pill.classList.add('opacity-40');
      } else {
        icon.textContent = 'check_circle';
        icon.classList.remove('text-text-secondary');
        icon.classList.add('text-action-green');
        pill.classList.remove('opacity-40');
      }
    });
  });

    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
{/* Top Context Header & Analytical Scope Controls */}
<div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg pb-space-lg">
<div className="flex flex-col space-y-1">
<div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption uppercase tracking-wider mb-1">
<span className="">Admin Console</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="">Insights</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="text-primary font-semibold">Analytics</span>
</div>
<h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight font-bold">
        Institutional Circulation &amp; Patron Analytics
      </h1>
<p className="font-body text-body text-text-secondary max-w-3xl">
        Longitudinal borrowing trends, reservation velocity, resource saturation, and patron engagement telemetry.
      </p>
</div>
{/* Export Action */}
<div className="flex items-center gap-space-sm self-start xl:self-auto">
<button className="group relative inline-flex items-center gap-space-sm bg-surface-container-lowest text-text-primary px-space-md py-2.5 rounded-xl shadow-sm hover:shadow-md hover:bg-surface-bright transition-all" type="button">
<span className="material-symbols-outlined text-primary text-[20px]">picture_as_pdf</span>
<span className="font-small text-small font-semibold">Export Dossier (PDF/CSV)</span>
<span className="material-symbols-outlined text-text-secondary text-[16px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
</button>
</div>
</div>
{/* Insight-to-Action Callout Banner */}
<div className="relative overflow-hidden rounded-2xl bg-soft-blue/70 backdrop-blur-md p-space-md shadow-sm mb-space-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md min-w-0">
<div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-[24px]">auto_awesome</span>
</div>
<div className="flex flex-col min-w-0">
<div className="flex items-center gap-space-sm">
<span className="font-caption text-caption uppercase font-bold text-primary tracking-wider">Circulation Anomaly Detected</span>
<span className="inline-block w-2 h-2 rounded-full bg-status-danger animate-pulse"></span>
</div>
<p className="font-body-medium text-body-medium text-text-primary truncate">
          Pending hold volume increased by <span className="font-bold text-primary">22%</span> this week for Computer Science literature. <span className="text-status-danger font-semibold">3 key titles</span> currently report 0 shelf availability.
        </p>
</div>
</div>
<button className="flex-shrink-0 bg-action-green hover:bg-action-green-hover text-text-primary px-space-lg py-2.5 rounded-full font-small text-small font-bold shadow-sm transition-transform active:scale-95 flex items-center gap-space-xs" type="button">
<span className="">Review Stacks Allocation</span>
<span className="material-symbols-outlined text-[18px]">shelves</span>
</button>
</div>
{/* Filter & Granularity Floating Toolbar */}
<div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm mb-space-lg flex flex-wrap items-center justify-between gap-space-md">
{/* Granularity Radio Pill Switchers */}
<div className="flex items-center gap-space-md bg-surface-container-low px-space-md py-1.5 rounded-xl">
<span className="font-caption text-caption uppercase text-text-secondary font-bold tracking-wider mr-1">Granularity</span>
<label className="flex items-center gap-1.5 cursor-pointer select-none">
<input defaultChecked className="sr-only peer" name="granularity" type="radio" value="daily" />
<div className="w-3.5 h-3.5 rounded-full bg-surface-container-lowest peer-defaultChecked:bg-primary flex items-center justify-center transition-all">
<div className="w-1.5 h-1.5 rounded-full bg-surface-container-lowest opacity-0 peer-defaultChecked:opacity-100"></div>
</div>
<span className="font-small text-small text-text-secondary peer-defaultChecked:text-primary peer-defaultChecked:font-bold">Daily</span>
</label>
<label className="flex items-center gap-1.5 cursor-pointer select-none">
<input className="sr-only peer" name="granularity" type="radio" value="weekly" />
<div className="w-3.5 h-3.5 rounded-full bg-surface-container-lowest peer-defaultChecked:bg-primary flex items-center justify-center transition-all">
<div className="w-1.5 h-1.5 rounded-full bg-surface-container-lowest opacity-0 peer-defaultChecked:opacity-100"></div>
</div>
<span className="font-small text-small text-text-secondary peer-defaultChecked:text-primary peer-defaultChecked:font-bold">Weekly</span>
</label>
<label className="flex items-center gap-1.5 cursor-pointer select-none">
<input className="sr-only peer" name="granularity" type="radio" value="monthly" />
<div className="w-3.5 h-3.5 rounded-full bg-surface-container-lowest peer-defaultChecked:bg-primary flex items-center justify-center transition-all">
<div className="w-1.5 h-1.5 rounded-full bg-surface-container-lowest opacity-0 peer-defaultChecked:opacity-100"></div>
</div>
<span className="font-small text-small text-text-secondary peer-defaultChecked:text-primary peer-defaultChecked:font-bold">Monthly</span>
</label>
<label className="flex items-center gap-1.5 cursor-pointer select-none">
<input className="sr-only peer" name="granularity" type="radio" value="yearly" />
<div className="w-3.5 h-3.5 rounded-full bg-surface-container-lowest peer-defaultChecked:bg-primary flex items-center justify-center transition-all">
<div className="w-1.5 h-1.5 rounded-full bg-surface-container-lowest opacity-0 peer-defaultChecked:opacity-100"></div>
</div>
<span className="font-small text-small text-text-secondary peer-defaultChecked:text-primary peer-defaultChecked:font-bold">Yearly</span>
</label>
</div>
{/* Date Presets & Picker */}
<div className="flex items-center gap-space-sm flex-wrap">
{/* Preset Chips */}
<div className="flex items-center bg-surface-container-low p-1 rounded-xl">
<button className="px-3 py-1 text-caption font-caption rounded-lg text-text-secondary hover:text-text-primary transition-colors" type="button">7D</button>
<button className="px-3 py-1 text-caption font-caption rounded-lg bg-surface-container-lowest font-bold text-primary shadow-sm" type="button">30D</button>
<button className="px-3 py-1 text-caption font-caption rounded-lg text-text-secondary hover:text-text-primary transition-colors" type="button">90D</button>
<button className="px-3 py-1 text-caption font-caption rounded-lg text-text-secondary hover:text-text-primary transition-colors" type="button">1Y</button>
<button className="px-3 py-1 text-caption font-caption rounded-lg text-text-secondary hover:text-text-primary transition-colors" type="button">All</button>
</div>
{/* Date Range Selector Pill */}
<div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-1.5 rounded-xl text-text-primary cursor-pointer hover:bg-surface-variant transition-colors">
<span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
<span className="font-small text-small font-semibold">Oct 01 – Oct 31, 2026</span>
<span className="material-symbols-outlined text-[16px] text-text-secondary">expand_more</span>
</div>
</div>
</div>
{/* Primary Interactive Analytics Chart Card */}
<div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm mb-space-lg relative">
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg">
<div>
<span className="font-caption text-caption text-text-secondary uppercase tracking-widest font-semibold">Core Velocity Metric</span>
<h2 className="font-headline-3 text-headline-3 text-text-primary font-bold">
          Borrowing, Reservation, &amp; Return Circulation Velocity
        </h2>
</div>
{/* Multi-Series Legend Pills with Toggles */}
<div className="flex flex-wrap items-center gap-space-sm" id="series-toggles">
<button className="series-pill flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-low hover:bg-surface-container transition-all" data-series="borrowings" type="button">
<span className="w-2.5 h-2.5 rounded-full bg-[#164E63]"></span>
<span className="font-caption text-caption font-semibold text-text-primary">Borrowings</span>
<span className="material-symbols-outlined text-[14px] text-action-green">check_circle</span>
</button>
<button className="series-pill flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-low hover:bg-surface-container transition-all" data-series="reservations" type="button">
<span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
<span className="font-caption text-caption font-semibold text-text-primary">Reservations</span>
<span className="material-symbols-outlined text-[14px] text-action-green">check_circle</span>
</button>
<button className="series-pill flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-low hover:bg-surface-container transition-all" data-series="returns" type="button">
<span className="w-2.5 h-2.5 rounded-full bg-action-green"></span>
<span className="font-caption text-caption font-semibold text-text-primary">Returns</span>
<span className="material-symbols-outlined text-[14px] text-action-green">check_circle</span>
</button>
<button className="series-pill flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-low hover:bg-surface-container transition-all" data-series="delinquencies" type="button">
<span className="w-2.5 h-2.5 rounded-full bg-status-danger"></span>
<span className="font-caption text-caption font-semibold text-text-primary">Overdue</span>
<span className="material-symbols-outlined text-[14px] text-action-green">check_circle</span>
</button>
</div>
</div>
{/* SVG Chart Visual Canvas */}
<div className="w-full relative h-72 sm:h-80 md:h-96">
<svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 360">
<defs>
{/* Deep Blue Area Gradient */}
<linearGradient id="borrowGradient" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stop-color="#164E63" stop-opacity="0.28"></stop>
<stop offset="85%" stop-color="#164E63" stop-opacity="0.0"></stop>
</linearGradient>
{/* Primary Blue Area Gradient */}
<linearGradient id="resGradient" x1="0" x2="0" y1="0" y2="1">
<stop offset="0%" stop-color="#287EA7" stop-opacity="0.18"></stop>
<stop offset="100%" stop-color="#287EA7" stop-opacity="0.0"></stop>
</linearGradient>
</defs>
{/* Horizontal Guides */}
<line stroke="#dde4e5" stroke-dasharray="4,4" strokeWidth="1" x1="0" x2="1000" y1="40" y2="40"></line>
<line stroke="#dde4e5" stroke-dasharray="4,4" strokeWidth="1" x1="0" x2="1000" y1="120" y2="120"></line>
<line stroke="#dde4e5" stroke-dasharray="4,4" strokeWidth="1" x1="0" x2="1000" y1="200" y2="200"></line>
<line stroke="#dde4e5" stroke-dasharray="4,4" strokeWidth="1" x1="0" x2="1000" y1="280" y2="280"></line>
<line stroke="#dde4e5" strokeWidth="1.5" x1="0" x2="1000" y1="340" y2="340"></line>
{/* Series 1: Total Borrowings (Filled area + Line) */}
<path d="M 0 250 C 100 230, 160 170, 250 160 C 340 150, 420 210, 520 180 C 620 150, 680 90, 780 80 C 880 70, 930 110, 1000 95 L 1000 340 L 0 340 Z" fill="url(#borrowGradient)"></path>
<path d="M 0 250 C 100 230, 160 170, 250 160 C 340 150, 420 210, 520 180 C 620 150, 680 90, 780 80 C 880 70, 930 110, 1000 95" fill="none" stroke="#164E63" strokeLinecap="round" strokeWidth="3"></path>
{/* Series 2: Reservations Submitted */}
<path d="M 0 280 C 120 270, 200 210, 300 220 C 400 230, 500 170, 600 160 C 700 150, 780 130, 850 120 C 920 110, 960 140, 1000 130" fill="none" stroke="#287EA7" strokeLinecap="round" strokeWidth="2.5"></path>
{/* Series 3: Returns Processed */}
<path d="M 0 290 C 110 285, 220 250, 320 240 C 430 230, 530 200, 630 210 C 730 220, 790 150, 880 140 C 940 135, 980 160, 1000 150" fill="none" stroke="#9BE564" strokeLinecap="round" strokeWidth="2.5"></path>
{/* Series 4: Overdue Delinquencies */}
<path d="M 0 320 C 150 325, 300 315, 450 310 C 600 305, 750 320, 850 315 C 930 310, 970 322, 1000 318" fill="none" stroke="#B96F72" stroke-dasharray="3,3" strokeWidth="2"></path>
{/* Active Inspection Pointer Line on Oct 24 (x = 780) */}
<line stroke="#00658a" stroke-dasharray="2,2" strokeWidth="1.5" x1="780" x2="780" y1="30" y2="340"></line>
{/* Intersecting Nodes */}
<circle cx="780" cy="80" fill="#164E63" r="5" stroke="#ffffff" strokeWidth="2"></circle>
<circle cx="780" cy="130" fill="#287EA7" r="4" stroke="#ffffff" strokeWidth="1.5"></circle>
<circle cx="780" cy="148" fill="#9BE564" r="4" stroke="#ffffff" strokeWidth="1.5"></circle>
<circle cx="780" cy="315" fill="#B96F72" r="3" stroke="#ffffff" strokeWidth="1"></circle>
</svg>
{/* Detailed Hover Tooltip Mockup */}
<div className="absolute left-[70%] sm:left-[74%] top-4 -translate-x-1/2 z-20 bg-surface-container-lowest/95 backdrop-blur-md shadow-xl rounded-xl p-space-sm pointer-events-none min-w-[200px] transition-all">
<div className="flex items-center justify-between pb-1 mb-1 bg-surface-container-low/60 px-2 py-1 rounded-lg">
<span className="font-caption text-caption font-bold text-text-primary">Oct 24, 2026</span>
<span className="font-caption text-[11px] text-text-secondary uppercase">Friday Peak</span>
</div>
<div className="space-y-1 px-1">
<div className="flex items-center justify-between font-caption text-caption">
<span className="flex items-center gap-1.5 text-text-secondary">
<span className="w-2 h-2 rounded-full bg-[#164E63]"></span> Total Borrowings
            </span>
<span className="font-bold text-text-primary font-small">54</span>
</div>
<div className="flex items-center justify-between font-caption text-caption">
<span className="flex items-center gap-1.5 text-text-secondary">
<span className="w-2 h-2 rounded-full bg-primary-container"></span> Reservations
            </span>
<span className="font-bold text-text-primary font-small">42</span>
</div>
<div className="flex items-center justify-between font-caption text-caption">
<span className="flex items-center gap-1.5 text-text-secondary">
<span className="w-2 h-2 rounded-full bg-action-green"></span> Returns Processed
            </span>
<span className="font-bold text-text-primary font-small">38</span>
</div>
<div className="flex items-center justify-between font-caption text-caption pt-1">
<span className="flex items-center gap-1.5 text-status-danger">
<span className="w-2 h-2 rounded-full bg-status-danger"></span> Delinquencies
            </span>
<span className="font-bold text-status-danger font-small">3</span>
</div>
</div>
</div>
{/* X-Axis Timeline Labels */}
<div className="absolute -bottom-6 inset-x-0 flex justify-between text-text-secondary font-caption text-[11px] px-2">
<span className="">Oct 01</span>
<span className="">Oct 06</span>
<span className="">Oct 12</span>
<span className="">Oct 18</span>
<span className="font-bold text-primary">Oct 24</span>
<span className="">Oct 31</span>
</div>
</div>
</div>
{/* Secondary Analytics Bento Grid (3 Columns) */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg mb-space-lg">
{/* Column 1: Book Availability & Physical Assets Status */}
<div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-space-md">
<div className="flex flex-col">
<span className="font-caption text-caption uppercase text-text-secondary tracking-widest font-semibold">Inventory Density</span>
<h3 className="font-headline-4 text-headline-4 text-text-primary font-bold">Physical Stacks Status</h3>
</div>
<div className="p-2 rounded-xl bg-surface-container-low text-primary">
<span className="material-symbols-outlined text-[22px]">inventory_2</span>
</div>
</div>
{/* Donut Visualization Graphic */}
<div className="flex items-center justify-center my-space-md relative">
<svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
{/* Background circle */}
<circle cx="50" cy="50" fill="none" r="38" stroke="#e8eff0" strokeWidth="12"></circle>
{/* Available (64.2%) = 239.5 circumference (2*pi*38 = 238.76). Arc ~153.28 */}
<circle cx="50" cy="50" fill="none" r="38" stroke="#7FA58D" stroke-dasharray="153.3 238.8" stroke-dashoffset="0" strokeWidth="12"></circle>
{/* Active Loans (28.5%) = ~68.04 */}
<circle cx="50" cy="50" fill="none" r="38" stroke="#287EA7" stroke-dasharray="68 238.8" stroke-dashoffset="-153.3" strokeWidth="12"></circle>
{/* Staged Holds (5.1%) = ~12.17 */}
<circle cx="50" cy="50" fill="none" r="38" stroke="#D9A85C" stroke-dasharray="12.2 238.8" stroke-dashoffset="-221.3" strokeWidth="12"></circle>
{/* Maintenance/Repair (2.2%) = ~5.25 */}
<circle cx="50" cy="50" fill="none" r="38" stroke="#B96F72" stroke-dasharray="5.3 238.8" stroke-dashoffset="-233.5" strokeWidth="12"></circle>
</svg>
<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
<span className="font-headline-3 text-headline-3 font-bold text-text-primary leading-none">4,850</span>
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider mt-1">Total Volumes</span>
</div>
</div>
{/* Metric Details Breakdown */}
<div className="grid grid-cols-2 gap-space-sm pt-space-sm">
<div className="flex items-center gap-space-xs p-2 rounded-xl bg-surface-container-low">
<span className="w-2.5 h-2.5 rounded-full bg-status-available flex-shrink-0"></span>
<div className="flex flex-col min-w-0">
<span className="font-caption text-caption text-text-secondary truncate">Available</span>
<span className="font-small text-small font-bold text-text-primary">64.2% <span className="font-normal text-text-secondary text-[11px]">(3,114)</span></span>
</div>
</div>
<div className="flex items-center gap-space-xs p-2 rounded-xl bg-surface-container-low">
<span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0"></span>
<div className="flex flex-col min-w-0">
<span className="font-caption text-caption text-text-secondary truncate">Active Loans</span>
<span className="font-small text-small font-bold text-text-primary">28.5% <span className="font-normal text-text-secondary text-[11px]">(1,382)</span></span>
</div>
</div>
<div className="flex items-center gap-space-xs p-2 rounded-xl bg-surface-container-low">
<span className="w-2.5 h-2.5 rounded-full bg-status-pending flex-shrink-0"></span>
<div className="flex flex-col min-w-0">
<span className="font-caption text-caption text-text-secondary truncate">Staged Holds</span>
<span className="font-small text-small font-bold text-text-primary">5.1% <span className="font-normal text-text-secondary text-[11px]">(247)</span></span>
</div>
</div>
<div className="flex items-center gap-space-xs p-2 rounded-xl bg-surface-container-low">
<span className="w-2.5 h-2.5 rounded-full bg-status-danger flex-shrink-0"></span>
<div className="flex flex-col min-w-0">
<span className="font-caption text-caption text-text-secondary truncate">Maintenance</span>
<span className="font-small text-small font-bold text-text-primary">2.2% <span className="font-normal text-text-secondary text-[11px]">(107)</span></span>
</div>
</div>
</div>
</div>
<div className="mt-space-md pt-space-sm flex items-center justify-between text-text-secondary font-caption text-caption">
<span className="flex items-center gap-1">
<span className="material-symbols-outlined text-[16px] text-primary">sync</span> Real-time RFID sync active
        </span>
<a className="text-primary font-semibold hover:underline" href="#">Auditing Logs</a>
</div>
</div>
{/* Column 2: User Engagement & Patron Footprint */}
<div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-space-md">
<div className="flex flex-col">
<span className="font-caption text-caption uppercase text-text-secondary tracking-widest font-semibold">Community Flow</span>
<h3 className="font-headline-4 text-headline-4 text-text-primary font-bold">Patron Footprint</h3>
</div>
<div className="p-2 rounded-xl bg-surface-container-low text-primary">
<span className="material-symbols-outlined text-[22px]">badge</span>
</div>
</div>
{/* Telemetry Summary Cards */}
<div className="grid grid-cols-2 gap-space-sm mb-space-md">
<div className="p-space-md rounded-xl bg-surface-container-low flex flex-col">
<span className="font-caption text-caption text-text-secondary font-medium">Digital Logins</span>
<span className="font-headline-4 text-headline-4 font-bold text-text-primary mt-1">3,120</span>
<span className="font-caption text-[11px] text-action-green-hover font-semibold flex items-center gap-0.5 mt-1">
<span className="material-symbols-outlined text-[14px]">trending_up</span> +14.8% vs last mo
            </span>
</div>
<div className="p-space-md rounded-xl bg-surface-container-low flex flex-col">
<span className="font-caption text-caption text-text-secondary font-medium">Recorded Visits</span>
<span className="font-headline-4 text-headline-4 font-bold text-text-primary mt-1">14,890</span>
<span className="font-caption text-[11px] text-primary font-semibold flex items-center gap-0.5 mt-1">
<span className="material-symbols-outlined text-[14px]">door_front</span> Turnstile counter
            </span>
</div>
</div>
{/* Hourly Desk Activity Bar Histogram */}
<div className="space-y-space-xs">
<div className="flex items-center justify-between font-caption text-caption mb-1">
<span className="text-text-secondary font-medium">Hourly Desk Footfall &amp; Inquiries</span>
<span className="font-bold text-primary">Peak: 10:00 AM – 2:00 PM</span>
</div>
<div className="h-32 flex items-end justify-between gap-1.5 pt-4 px-1">
{/* 8am */}
<div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
<div className="w-full bg-soft-blue hover:bg-primary-container rounded-t-md transition-all" style={{ height: '25%' }}></div>
<span className="font-caption text-[10px] text-text-secondary">8A</span>
</div>
{/* 10am Peak */}
<div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
<div className="w-full bg-primary hover:bg-action-green rounded-t-md transition-all shadow-sm" style={{ height: '85%' }}></div>
<span className="font-caption text-[10px] font-bold text-primary">10A</span>
</div>
{/* 12pm Peak */}
<div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
<div className="w-full bg-primary hover:bg-action-green rounded-t-md transition-all shadow-sm" style={{ height: '98%' }}></div>
<span className="font-caption text-[10px] font-bold text-primary">12P</span>
</div>
{/* 2pm Peak */}
<div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
<div className="w-full bg-primary hover:bg-action-green rounded-t-md transition-all shadow-sm" style={{ height: '78%' }}></div>
<span className="font-caption text-[10px] font-bold text-primary">2P</span>
</div>
{/* 4pm */}
<div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
<div className="w-full bg-soft-blue hover:bg-primary-container rounded-t-md transition-all" style={{ height: '52%' }}></div>
<span className="font-caption text-[10px] text-text-secondary">4P</span>
</div>
{/* 6pm */}
<div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
<div className="w-full bg-soft-blue hover:bg-primary-container rounded-t-md transition-all" style={{ height: '38%' }}></div>
<span className="font-caption text-[10px] text-text-secondary">6P</span>
</div>
{/* 8pm */}
<div className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
<div className="w-full bg-soft-blue hover:bg-primary-container rounded-t-md transition-all" style={{ height: '18%' }}></div>
<span className="font-caption text-[10px] text-text-secondary">8P</span>
</div>
</div>
</div>
</div>
<div className="mt-space-md pt-space-sm flex items-center justify-between text-text-secondary font-caption text-caption">
<span className="flex items-center gap-1">
<span className="w-2 h-2 rounded-full bg-action-green"></span> Wi-Fi Gateway: 842 Concurrences
        </span>
<a className="text-primary font-semibold hover:underline" href="#">Patron Segments</a>
</div>
</div>
{/* Column 3: Top Borrowed & Reserved Books */}
<div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-space-md">
<div className="flex flex-col">
<span className="font-caption text-caption uppercase text-text-secondary tracking-widest font-semibold">Circulation Demand</span>
<h3 className="font-headline-4 text-headline-4 text-text-primary font-bold">Top Titles in Circulation</h3>
</div>
<div className="p-2 rounded-xl bg-surface-container-low text-primary">
<span className="material-symbols-outlined text-[22px]">auto_stories</span>
</div>
</div>
{/* Ranked List */}
<div className="space-y-space-sm">
{/* Item 1 */}
<div className="flex items-center gap-space-sm p-2 rounded-xl hover:bg-surface-container-low transition-colors group">
<span className="font-headline-4 text-headline-4 font-bold text-primary w-6 text-center">1</span>
<img className="w-10 h-14 object-cover rounded shadow-sm flex-shrink-0" data-alt="Cover of the book Clean Code by Robert C. Martin with iconic minimalist typographic styling on crisp navy background in modern academic lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDpGz6-OFRQ3ZhRlEEBZfYcRsHCJxsC14alVN3nrX3LK5EYSgoRsIdX1iHiPGqM69mJnTA3dz0uIPAAiBkaNyQCn9J1D1IOwB76bT84rtdlybqc3AQKAzeU9bTiPqdImCWpj4hZOL4Xet-E3rnoBupxe0TblAdB0cAqK3AQvNNE-YnErZ90S1z6h5VyHWiAe-H4qSwIxkMQpcwAVICYjrObFNOYKkMMc_sUkoHXaW-1KlSdi4NuB3PN" />
<div className="flex flex-col min-w-0 flex-grow">
<span className="font-small text-small font-bold text-text-primary truncate group-hover:text-primary transition-colors">Clean Code</span>
<span className="font-caption text-caption text-text-secondary truncate">Robert C. Martin</span>
<div className="w-full bg-surface-container-high h-1 rounded-full mt-1.5 overflow-hidden">
<div className="bg-primary h-full rounded-full" style={{ width: '100%' }}></div>
</div>
</div>
<div className="flex flex-col items-end flex-shrink-0 pl-1">
<span className="font-small text-small font-bold text-text-primary">142</span>
<span className="font-caption text-[11px] text-text-secondary uppercase">checkouts</span>
</div>
</div>
{/* Item 2 */}
<div className="flex items-center gap-space-sm p-2 rounded-xl hover:bg-surface-container-low transition-colors group">
<span className="font-headline-4 text-headline-4 font-bold text-secondary w-6 text-center">2</span>
<img className="w-10 h-14 object-cover rounded shadow-sm flex-shrink-0" data-alt="Cover of Introduction to Algorithms textbook by Cormen Leiserson Rivest Stein featuring bold academic geometric layout and authoritative academic tones" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUuTzS_EQ8ZtBqpyNH_SqmFb5a0MdbHKAhe-df-CTcwbKBCJ0ZHX-t-SElccX0xliQEW97Kno0anvrgxfbLRPIALaFNCsEsguE_QidPr4ME9BW___LpoESyO3ALSGTNmBycLh9IpWk9nCZIJHgiLHJXVpbkJJRbWsfvuQKNsugLa-f9JdJv89NpkooXJbDN2-7EMuXsDR4Jv3HAe69HT_s2xXxJBX7ze6CSgP2S2bulBMtpy5MPmZO" />
<div className="flex flex-col min-w-0 flex-grow">
<span className="font-small text-small font-bold text-text-primary truncate group-hover:text-primary transition-colors">Introduction to Algorithms</span>
<span className="font-caption text-caption text-text-secondary truncate">CLRS</span>
<div className="w-full bg-surface-container-high h-1 rounded-full mt-1.5 overflow-hidden">
<div className="bg-primary-container h-full rounded-full" style={{ width: '90.1%' }}></div>
</div>
</div>
<div className="flex flex-col items-end flex-shrink-0 pl-1">
<span className="font-small text-small font-bold text-text-primary">128</span>
<span className="font-caption text-[11px] text-text-secondary uppercase">checkouts</span>
</div>
</div>
{/* Item 3 */}
<div className="flex items-center gap-space-sm p-2 rounded-xl hover:bg-surface-container-low transition-colors group">
<span className="font-headline-4 text-headline-4 font-bold text-text-secondary w-6 text-center">3</span>
<img className="w-10 h-14 object-cover rounded shadow-sm flex-shrink-0" data-alt="Vintage hardcover book cover for Noli Me Tangere Centennial Annotated Edition with Filipino historic script accents on deep sepia and ocean blue background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDM0V6mzoAPo9BUIToEKHOKrRSPnT0G3DLSNrlRZmE2sGqQPpNRybUbyBETOV_OJgZuh5DUQyEb-qIuHsReYirAGbQRyY3SoF4vOlzbH5bsWsILV90ZgsrP9I5h-dRUwBh_77i-ZYKzGq1oH6CHs-lSIWUKhBvSh2MDzBAknE62oOJjic5QaJlEvl_kb1yiPVyOvCgLimzzKg13lJAkWWzL_vwzL4LhywEc8C8EM9vRlKyevLYOfBHs" />
<div className="flex flex-col min-w-0 flex-grow">
<span className="font-small text-small font-bold text-text-primary truncate group-hover:text-primary transition-colors">Noli Me Tangere</span>
<span className="font-caption text-caption text-text-secondary truncate">Centennial Annotated</span>
<div className="w-full bg-surface-container-high h-1 rounded-full mt-1.5 overflow-hidden">
<div className="bg-action-green h-full rounded-full" style={{ width: '80.2%' }}></div>
</div>
</div>
<div className="flex flex-col items-end flex-shrink-0 pl-1">
<span className="font-small text-small font-bold text-text-primary">114</span>
<span className="font-caption text-[11px] text-text-secondary uppercase">checkouts</span>
</div>
</div>
{/* Item 4 */}
<div className="flex items-center gap-space-sm p-2 rounded-xl hover:bg-surface-container-low transition-colors group">
<span className="font-headline-4 text-headline-4 font-bold text-text-secondary w-6 text-center">4</span>
<img className="w-10 h-14 object-cover rounded shadow-sm flex-shrink-0" data-alt="Cover of Structure and Interpretation of Computer Programs with iconic purple wizard illustration and clean academic typography" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfPLQotGis_h_R0rCriFfKCiw8Pk7Q8QDUv4b-lMtU34mkNh_aQfgj8lZbnaIZ-1rQRiZIugYKNwXzpf_p0CzYCSP24-x27Ox54CiwaXKKjdhRwAwzP6PTRRoKyegrcNDITezh8j9GBXmQsY2uYiC4MkelmG3-8ENoid808dSFvLNZWGtt0cHoqrNT4ZtXI54-LWMA9YFruhn03y_kEIqoxfBSPR3oNX4vMRc_--ofMjKvGY7vy_HR" />
<div className="flex flex-col min-w-0 flex-grow">
<span className="font-small text-small font-bold text-text-primary truncate group-hover:text-primary transition-colors">SICP</span>
<span className="font-caption text-caption text-text-secondary truncate">Abelson &amp; Sussman</span>
<div className="w-full bg-surface-container-high h-1 rounded-full mt-1.5 overflow-hidden">
<div className="bg-status-pending h-full rounded-full" style={{ width: '69%' }}></div>
</div>
</div>
<div className="flex flex-col items-end flex-shrink-0 pl-1">
<span className="font-small text-small font-bold text-text-primary">98</span>
<span className="font-caption text-[11px] text-text-secondary uppercase">checkouts</span>
</div>
</div>
</div>
</div>
<div className="mt-space-md pt-space-sm flex items-center justify-between text-text-secondary font-caption text-caption">
<span className="">Showing 4 of 42 ranked</span>
<a className="text-primary font-semibold hover:underline" href="#">Full Velocity Report</a>
</div>
</div>
</div>
{/* Real-time Transaction Ledger Strip */}
<div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm text-text-secondary font-small text-small">
<span className="material-symbols-outlined text-action-green text-[20px]">sensors</span>
<span className="text-text-primary font-semibold">Live Operational Feed:</span>
<span className="">Desk #2 processed Return (ID #LN-8942) 3 mins ago</span>
</div>
<div className="flex items-center gap-space-md">
<span className="font-caption text-caption text-text-secondary">Next automated database sync in 04:22</span>
<button className="text-primary hover:text-text-primary font-small text-small font-semibold flex items-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-[16px]">refresh</span> Refresh Telemetry
      </button>
</div>
</div>
</div>

    </div>
  );
};

export default Analytics;
