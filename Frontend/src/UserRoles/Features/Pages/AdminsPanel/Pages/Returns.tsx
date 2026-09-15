// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// Returns.tsx -- Admin Returns and Settlement Reconciliation
// Converted directly from SidebarReturnsPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC } from 'react';

const Returns: FC = () => {
  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-xl">
<div className="flex flex-col">
<div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption mb-1">
<span className="">Admin Console</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="">Operations</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="text-primary font-semibold">Returns</span>
</div>
<h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">
        Circulation Returns, Inspections &amp; Delinquency Settlements
      </h1>
<p className="font-small text-small text-text-secondary mt-1">
        Manage volume check-ins, automated overdue tallying, faculty clearances, and book condition appraisals.
      </p>
</div>
<div className="flex flex-wrap items-center gap-space-sm">
<button className="flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-lowest text-text-primary hover:bg-surface-container transition-colors shadow-sm font-small text-small font-semibold" type="button">
<span className="material-symbols-outlined text-[18px] text-text-secondary">file_download</span>
        Export Daily Returns Journal
      </button>
<button className="flex items-center gap-space-xs px-space-lg py-2.5 rounded-lg bg-action-green text-text-primary hover:bg-action-green-hover transition-colors shadow-sm font-small text-small font-bold" type="button">
<span className="material-symbols-outlined text-[20px]">fact_check</span>
        Process Bulk Returns
      </button>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-xl">
<div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
<div className="flex items-center justify-between mb-space-sm">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Volumes Checked In</span>
<div className="w-10 h-10 rounded-full bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[22px]">assignment_turned_in</span>
</div>
</div>
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-1 text-headline-2 text-text-primary font-bold">58</span>
<span className="font-caption text-caption text-status-available font-semibold flex items-center">
<span className="material-symbols-outlined text-[14px]">trending_up</span> +14% vs avg
        </span>
</div>
<div className="mt-space-sm flex items-center justify-between font-caption text-caption text-text-secondary">
<span className="">Target: 70/day capacity</span>
<span className="text-primary font-medium">82.8% capacity</span>
</div>
<div className="w-full bg-surface-container rounded-full h-1.5 mt-1.5 overflow-hidden">
<div className="bg-primary h-1.5 rounded-full" style={{ width: '82.8%' }}></div>
</div>
</div>
<div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
<div className="flex items-center justify-between mb-space-sm">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">On-Time Return Rate</span>
<div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-status-available">
<span className="material-symbols-outlined text-[22px]">verified</span>
</div>
</div>
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-1 text-headline-2 text-text-primary font-bold">94.2%</span>
<span className="font-caption text-caption text-status-available font-semibold flex items-center">
<span className="material-symbols-outlined text-[14px]">arrow_drop_up</span> +2.1%
        </span>
</div>
<div className="mt-space-sm flex items-center justify-between font-caption text-caption text-text-secondary">
<span className="">53 On-time / 5 Late</span>
<span className="text-status-available font-medium">Within SLA</span>
</div>
<div className="w-full bg-surface-container rounded-full h-1.5 mt-1.5 overflow-hidden">
<div className="bg-status-available h-1.5 rounded-full" style={{ width: '94.2%' }}></div>
</div>
</div>
<div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
<div className="flex items-center justify-between mb-space-sm">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Delinquency Fines Tally</span>
<div className="w-10 h-10 rounded-full bg-secondary-container/40 flex items-center justify-center text-primary-container">
<span className="material-symbols-outlined text-[22px]">payments</span>
</div>
</div>
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-1 text-headline-2 text-text-primary font-bold">₱1,420.00</span>
<span className="font-caption text-caption text-text-secondary">collected</span>
</div>
<div className="mt-space-sm flex items-center justify-between font-caption text-caption text-text-secondary">
<span className="">₱255.00 pending ledger</span>
<span className="text-status-pending font-medium">3 unsettled</span>
</div>
<div className="w-full bg-surface-container rounded-full h-1.5 mt-1.5 overflow-hidden">
<div className="bg-status-pending h-1.5 rounded-full" style={{ width: '84.8%' }}></div>
</div>
</div>
<div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
<div className="flex items-center justify-between mb-space-sm">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Flagged for Bindery / Wear</span>
<div className="w-10 h-10 rounded-full bg-error-container/60 flex items-center justify-center text-status-danger">
<span className="material-symbols-outlined text-[22px]">healing</span>
</div>
</div>
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-1 text-headline-2 text-text-primary font-bold">4</span>
<span className="font-caption text-caption text-status-danger font-semibold">Requires routing</span>
</div>
<div className="mt-space-sm flex items-center justify-between font-caption text-caption text-text-secondary">
<span className="">2 spine damage, 2 water warp</span>
<span className="text-error font-medium">Critical QA</span>
</div>
<div className="w-full bg-surface-container rounded-full h-1.5 mt-1.5 overflow-hidden">
<div className="bg-status-danger h-1.5 rounded-full" style={{ width: '65%' }}></div>
</div>
</div>
</div>
<div className="grid grid-cols-1 2xl:grid-cols-4 gap-space-lg">
<div className="2xl:col-span-3 flex flex-col gap-space-md">
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
<div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
<button className="px-space-md py-1.5 rounded-full bg-primary text-on-primary font-small text-small font-semibold whitespace-nowrap shadow-sm" type="button">
            All Returns (58)
          </button>
<button className="px-space-md py-1.5 rounded-full bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-surface-container font-small text-small font-medium whitespace-nowrap transition-colors" type="button">
            On-Time (53)
          </button>
<button className="px-space-md py-1.5 rounded-full bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-surface-container font-small text-small font-medium whitespace-nowrap transition-colors" type="button">
            Late / Fined (5)
          </button>
<button className="px-space-md py-1.5 rounded-full bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-surface-container font-small text-small font-medium whitespace-nowrap transition-colors" type="button">
            Damaged / Flagged (4)
          </button>
<button className="px-space-md py-1.5 rounded-full bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-surface-container font-small text-small font-medium whitespace-nowrap transition-colors" type="button">
            Courtesy Waived (2)
          </button>
</div>
<div className="relative w-full md:w-80">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">search</span>
<input className="w-full pl-9 pr-space-md py-2 bg-surface-container-low rounded-lg font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none focus:bg-surface-bright focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Search Return ID, patron, barcode..." type="text" />
</div>
</div>
<div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
<div className="px-space-lg py-space-md flex items-center justify-between bg-surface-container-low/50">
<div className="flex items-center gap-space-sm">
<span className="font-headline-4 text-headline-4 text-text-primary">Master Returns Journal</span>
<span className="px-2 py-0.5 rounded text-[11px] font-bold bg-soft-blue text-primary tracking-wide">TODAY'S BATCH</span>
</div>
<div className="flex items-center gap-space-xs text-caption font-caption text-text-secondary">
<span className="">Displaying 4 priority audit records</span>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left font-small text-small">
<thead>
<tr className="bg-surface-container-low/30 text-text-secondary font-caption text-caption uppercase tracking-wider">
<th className="py-3 px-space-md font-semibold">Return ID</th>
<th className="py-3 px-space-md font-semibold">Patron Details</th>
<th className="py-3 px-space-md font-semibold">Item &amp; Barcode</th>
<th className="py-3 px-space-md font-semibold">Timeline &amp; Overdue</th>
<th className="py-3 px-space-md font-semibold">Assessed Fine</th>
<th className="py-3 px-space-md font-semibold">Condition</th>
<th className="py-3 px-space-md font-semibold">Clearance Status</th>
<th className="py-3 px-space-md font-semibold">Station / Desk</th>
<th className="py-3 px-space-md font-semibold text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container">
<tr className="hover:bg-surface-container-low/40 transition-colors">
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="font-caption text-caption font-bold text-primary px-2 py-1 rounded bg-soft-blue">#RET-4819</span>
<div className="text-[11px] text-text-secondary mt-1">Oct 26, 09:12 AM</div>
</td>
<td className="py-space-md px-space-md">
<div className="font-medium text-text-primary">Sofia Morales</div>
<div className="font-caption text-caption text-text-secondary">#KP-77401 • Undergrad</div>
</td>
<td className="py-space-md px-space-md max-w-[200px]">
<div className="font-semibold text-text-primary truncate" title="Clean Code">Clean Code</div>
<div className="font-caption text-caption text-text-secondary font-mono">#KP-BC-4491-03</div>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="text-[12px] text-text-secondary">Due: Oct 26, 2026</div>
<div className="font-caption text-caption text-status-available font-semibold flex items-center gap-0.5">
<span className="material-symbols-outlined text-[14px]">check_circle</span> 0 Days (On-Time)
                  </div>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="font-bold text-text-primary">₱0.00</div>
<span className="text-[11px] text-status-available font-medium">Clear of fees</span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption font-caption font-semibold bg-soft-blue text-primary">
                    Good Condition
                  </span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-caption font-bold bg-action-green/20 text-on-surface">
<span className="w-1.5 h-1.5 rounded-full bg-action-green-hover"></span>
                    Cleared
                  </span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap text-text-secondary text-caption font-caption">
<div className="font-medium text-text-primary">Cashier Bay 01</div>
<div className="">Terminal ID: T-04</div>
</td>
<td className="py-space-md px-space-md text-right whitespace-nowrap">
<button className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-caption text-caption font-bold transition-colors" type="button">
                    View Receipt
                  </button>
</td>
</tr>
<tr className="hover:bg-surface-container-low/40 transition-colors bg-surface-container-low/20">
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="font-caption text-caption font-bold text-primary px-2 py-1 rounded bg-soft-blue">#RET-4818</span>
<div className="text-[11px] text-text-secondary mt-1">Oct 26, 09:40 AM</div>
</td>
<td className="py-space-md px-space-md">
<div className="font-medium text-text-primary">Marcus Aurelio Cruz</div>
<div className="font-caption text-caption text-text-secondary">#KP-65922 • Graduate</div>
</td>
<td className="py-space-md px-space-md max-w-[200px]">
<div className="font-semibold text-text-primary truncate" title="Principles of Modern Thermodynamics">Principles of Modern Thermodynamics</div>
<div className="font-caption text-caption text-text-secondary font-mono">#KP-BC-1142-08</div>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="text-[12px] text-text-secondary">Due: Oct 16, 2026</div>
<div className="font-caption text-caption text-error font-semibold flex items-center gap-0.5">
<span className="material-symbols-outlined text-[14px]">warning</span> 10 Days Overdue
                  </div>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="font-bold text-text-primary">₱150.00</div>
<span className="text-[11px] text-text-secondary">₱15/day standardized</span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption font-caption font-semibold bg-surface-container text-text-secondary">
                    Fair (Usable)
                  </span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-caption font-bold bg-soft-blue text-primary">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Settled (Cash)
                  </span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap text-text-secondary text-caption font-caption">
<div className="font-medium text-text-primary">Cashier Bay 01</div>
<div className="">Terminal ID: T-04</div>
</td>
<td className="py-space-md px-space-md text-right whitespace-nowrap">
<button className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-caption text-caption font-bold transition-colors" type="button">
                    Print Audit
                  </button>
</td>
</tr>
<tr className="hover:bg-surface-container-low/40 transition-colors">
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="font-caption text-caption font-bold text-primary px-2 py-1 rounded bg-soft-blue">#RET-4815</span>
<div className="text-[11px] text-text-secondary mt-1">Oct 25, 16:30 PM</div>
</td>
<td className="py-space-md px-space-md">
<div className="font-medium text-text-primary flex items-center gap-1">
                    Dr. Leandro Santos
                    <span className="material-symbols-outlined text-[14px] text-primary" title="Tenured Faculty">school</span>
</div>
<div className="font-caption text-caption text-text-secondary">#KP-10294 • Faculty Member</div>
</td>
<td className="py-space-md px-space-md max-w-[200px]">
<div className="font-semibold text-text-primary truncate" title="Introduction to Algorithms (CLRS)">Introduction to Algorithms (CLRS)</div>
<div className="font-caption text-caption text-text-secondary font-mono">#KP-BC-3091-01</div>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="text-[12px] text-text-secondary">Due: Oct 20, 2026</div>
<div className="font-caption text-caption text-status-pending font-semibold flex items-center gap-0.5">
<span className="material-symbols-outlined text-[14px]">schedule</span> 5 Days Grace
                  </div>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="font-bold text-text-primary">₱0.00</div>
<span className="text-[11px] text-primary font-semibold">Faculty Waiver</span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption font-caption font-semibold bg-surface-container text-text-secondary">
                    Minor Wear
                  </span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-caption font-bold bg-secondary-container text-on-secondary-container">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    Exempt Cleared
                  </span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap text-text-secondary text-caption font-caption">
<div className="font-medium text-text-primary">Desk Bay 02</div>
<div className="">Terminal ID: T-02</div>
</td>
<td className="py-space-md px-space-md text-right whitespace-nowrap">
<button className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-caption text-caption font-bold transition-colors" type="button">
                    View Dossier
                  </button>
</td>
</tr>
<tr className="hover:bg-surface-container-low/40 transition-colors bg-error-container/10">
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="font-caption text-caption font-bold text-status-danger px-2 py-1 rounded bg-error-container">#RET-4810</span>
<div className="text-[11px] text-text-secondary mt-1">Oct 25, 14:15 PM</div>
</td>
<td className="py-space-md px-space-md">
<div className="font-medium text-text-primary">Clara Mae Ilustre</div>
<div className="font-caption text-caption text-text-secondary">#KP-2021-04288 • Scholar</div>
</td>
<td className="py-space-md px-space-md max-w-[200px]">
<div className="font-semibold text-text-primary truncate" title="Philippine Flora &amp; Forest">Philippine Flora &amp; Forest</div>
<div className="font-caption text-caption text-text-secondary font-mono">#KP-BC-3194-02</div>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="text-[12px] text-text-secondary">Due: Oct 18, 2026</div>
<div className="font-caption text-caption text-error font-semibold flex items-center gap-0.5">
<span className="material-symbols-outlined text-[14px]">error</span> 7 Days Late
                  </div>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<div className="font-bold text-error">₱105.00</div>
<span className="text-[11px] text-error font-semibold">+ Damage fee TBD</span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption font-caption font-semibold bg-error-container text-on-error-container">
                    Binding Issue
                  </span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-caption font-bold bg-status-pending/20 text-on-surface">
<span className="w-1.5 h-1.5 rounded-full bg-status-pending"></span>
                    Pending Settlement
                  </span>
</td>
<td className="py-space-md px-space-md whitespace-nowrap text-text-secondary text-caption font-caption">
<div className="font-medium text-text-primary">Cashier Bay 01</div>
<div className="">Terminal ID: T-04</div>
</td>
<td className="py-space-md px-space-md text-right whitespace-nowrap">
<button className="px-3 py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-caption text-caption font-bold transition-colors shadow-sm" type="button">
                    Inspect Damage
                  </button>
</td>
</tr>
</tbody>
</table>
</div>
<div className="p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm bg-surface-container-low/30 font-caption text-caption text-text-secondary">
<div className="">Showing 4 of 58 returns logged during Circulation Window A</div>
<div className="flex items-center gap-1">
<button className="p-1 rounded hover:bg-surface-container transition-colors disabled={true}:opacity-40" disabled={true} type="button">
<span className="material-symbols-outlined text-[18px]">chevron_left</span>
</button>
<span className="px-2 py-1 rounded bg-primary text-on-primary font-bold">1</span>
<button className="px-2 py-1 rounded hover:bg-surface-container transition-colors" type="button">2</button>
<button className="px-2 py-1 rounded hover:bg-surface-container transition-colors" type="button">3</button>
<button className="p-1 rounded hover:bg-surface-container transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
</div>
</div>
</div>
</div>
<div className="flex flex-col gap-space-md">
<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
<div className="flex items-start justify-between">
<div>
<span className="font-caption text-caption text-primary uppercase font-bold tracking-wider">Protocol Inspection</span>
<h2 className="font-headline-4 text-headline-4 text-text-primary mt-0.5">Damaged Book Assessment</h2>
</div>
<div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center text-status-danger">
<span className="material-symbols-outlined text-[18px]">rule</span>
</div>
</div>
<p className="font-small text-small text-text-secondary">
          Physical audit queue for volumes flagged with structural damage during intake.
        </p>
<div className="bg-surface-container-low rounded-lg p-space-md flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<span className="font-caption text-caption font-bold text-text-primary">Current Active Case</span>
<span className="font-caption text-caption text-error font-bold px-2 py-0.5 rounded bg-error-container">Severe Fault</span>
</div>
<div className="flex gap-space-sm items-center mt-1">
<img className="w-16 h-20 rounded-lg object-cover bg-surface-container flex-shrink-0 shadow-sm" data-alt="Close-up photograph of a vintage academic reference book with detached leather binding and warped pages laid out flat under clean library inspection lamp lighting with soft blue stationery in background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBW8X7tnnXBG6BVYdU4U_WfL3pCZj9bikd8sQ87X6GUIOBQCfePDd2UwUNNFX3bVr9XnzX_HdsBTsaL_rJXlFO1nMFwWyonya6L49bi3aVUDHZpIhXBG9PXYVKOp9glHbaVxOXSX_I50bU2goWVJBfAsNMb57pEC79t3KzqREqEqVMDBrhJuKs6lAV0CTBQNzxWlo5eF4mZOU8rorWcKyUMkEnULCTqs3Y113LBxhjmYwqgN0eVH6OJ" />
<div className="flex flex-col min-w-0">
<span className="font-small text-small font-bold text-text-primary truncate">Philippine Flora &amp; Forest</span>
<span className="font-caption text-caption text-text-secondary font-mono">Barcode: #KP-BC-3194-02</span>
<span className="font-caption text-caption text-text-secondary mt-1">Reported by: Bay 01 Specialist</span>
</div>
</div>
<div className="grid grid-cols-2 gap-2 mt-2 pt-2 bg-surface-container-lowest/60 rounded-lg p-2 font-caption text-caption">
<div>
<span className="text-text-secondary block">Damage Type</span>
<span className="font-semibold text-text-primary">Spine Separation</span>
</div>
<div>
<span className="text-text-secondary block">Assessed Penalty</span>
<span className="font-bold text-error">₱280.00 Rebind</span>
</div>
<div>
<span className="text-text-secondary block">Patron Responsible</span>
<span className="font-medium text-text-primary truncate block">C. M. Ilustre</span>
</div>
<div>
<span className="text-text-secondary block">Est. Repair Time</span>
<span className="font-semibold text-primary">3-5 Workdays</span>
</div>
</div>
</div>
<div className="flex flex-col gap-space-xs">
<span className="font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider">Bindery &amp; Conservation Routing</span>
<div className="grid grid-cols-1 gap-2">
<button className="w-full flex items-center justify-between px-space-md py-2.5 rounded-lg bg-surface-container-low hover:bg-soft-blue text-text-primary font-small text-small font-medium transition-colors text-left group" type="button">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-[18px] text-primary">build</span>
<span className="">Route to Campus Bindery Unit</span>
</div>
<span className="material-symbols-outlined text-[16px] text-text-secondary group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
</button>
<button className="w-full flex items-center justify-between px-space-md py-2.5 rounded-lg bg-surface-container-low hover:bg-soft-blue text-text-primary font-small text-small font-medium transition-colors text-left group" type="button">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-[18px] text-status-pending">inventory</span>
<span className="">Order Publisher Replacement</span>
</div>
<span className="material-symbols-outlined text-[16px] text-text-secondary group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
</button>
<button className="w-full flex items-center justify-between px-space-md py-2.5 rounded-lg bg-surface-container-low hover:bg-soft-blue text-text-primary font-small text-small font-medium transition-colors text-left group" type="button">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-[18px] text-text-secondary">archive</span>
<span className="">Deaccession &amp; Salvage Archive</span>
</div>
<span className="material-symbols-outlined text-[16px] text-text-secondary group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
</button>
</div>
</div>
<div className="pt-space-sm flex gap-space-xs">
<button className="flex-1 py-2 rounded-lg bg-action-green text-text-primary hover:bg-action-green-hover font-small text-small font-bold transition-colors" type="button">
            Authorize Routing
          </button>
<button className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-secondary font-small text-small font-medium transition-colors" type="button">
            Hold
          </button>
</div>
</div>
<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-sm">
<div className="flex items-center gap-space-sm mb-1">
<span className="material-symbols-outlined text-primary text-[20px]">help_center</span>
<h3 className="font-headline-4 text-small font-bold text-text-primary">Returns Policy Fast Guide</h3>
</div>
<div className="space-y-2 font-caption text-caption text-text-secondary">
<div className="p-2 rounded bg-surface-container-low">
<span className="font-bold text-text-primary block">Undergraduate Loan:</span>
            ₱15.00 / day penalty past 14-day regular period.
          </div>
<div className="p-2 rounded bg-surface-container-low">
<span className="font-bold text-text-primary block">Graduate Students:</span>
            ₱10.00 / day penalty past 30-day extended loan.
          </div>
<div className="p-2 rounded bg-surface-container-low">
<span className="font-bold text-text-primary block">Faculty Clearance:</span>
            Automatic waiver with Dean's semester sign-off.
          </div>
</div>
</div>
</div>
</div>
</div>
    </div>
  );
};

export default Returns;
