// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// Inventory.tsx -- Admin Physical Stacks Inventory and RFID
// Converted directly from SidebarInventoryPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC } from 'react';

const Inventory: FC = () => {
  return (
    <div className="w-full">
      <div className="flex flex-col w-full gap-space-lg">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-space-xs font-caption text-caption text-text-secondary">
<span className="">Admin Console</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="">Management</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="text-primary font-semibold">Inventory</span>
</div>
<h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">Physical Copy Inventory &amp; Asset Registry</h1>
<p className="font-small text-small text-text-secondary">Real-time catalog ledger for physical copies, RFID batch sync, circulation telemetry, and preservation logs.</p>
</div>
<div className="flex flex-wrap items-center gap-space-sm">
<button className="flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-lowest text-text-primary shadow-sm hover:bg-surface-container transition-all font-small text-small font-semibold">
<span className="material-symbols-outlined text-[18px] text-primary">nfc</span>
<span className="">RFID Sync Batch</span>
</button>
<button className="flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-lowest text-text-primary shadow-sm hover:bg-surface-container transition-all font-small text-small font-semibold">
<span className="material-symbols-outlined text-[18px] text-text-secondary">print</span>
<span className="">Print Shelf Tags</span>
</button>
<button className="flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-action-green text-text-primary shadow-sm hover:bg-action-green-hover transition-all font-small text-small font-bold">
<span className="material-symbols-outlined text-[20px]">add_box</span>
<span className="">Ingest Physical Barcodes</span>
</button>
</div>
</div>
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-space-sm">
<div className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Total Registered</span>
<div className="flex items-baseline gap-space-xs mt-1">
<span className="font-headline-3 text-headline-3 text-text-primary">4,892</span>
<span className="font-caption text-caption text-text-secondary font-medium">Units</span>
</div>
<div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
<div className="bg-primary h-full rounded-full w-full"></div>
</div>
<span className="font-caption text-[11px] text-text-secondary mt-2 flex items-center gap-1">
<span className="material-symbols-outlined text-[13px] text-status-available">verified</span>
        100% Registry audit
      </span>
</div>
<div className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
<div className="flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">On-Shelf Active</span>
<span className="w-2 h-2 rounded-full bg-status-available"></span>
</div>
<div className="flex items-baseline gap-space-xs mt-1">
<span className="font-headline-3 text-headline-3 text-text-primary">3,112</span>
<span className="font-caption text-caption text-status-available font-bold">63.6%</span>
</div>
<div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
<div className="bg-status-available h-full rounded-full" style={{ width: '63.6%' }}></div>
</div>
<span className="font-caption text-[11px] text-text-secondary mt-2">Ready for checkout</span>
</div>
<div className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
<div className="flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Circulating Loan</span>
<span className="w-2 h-2 rounded-full bg-primary-container"></span>
</div>
<div className="flex items-baseline gap-space-xs mt-1">
<span className="font-headline-3 text-headline-3 text-text-primary">1,402</span>
<span className="font-caption text-caption text-primary font-bold">28.7%</span>
</div>
<div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
<div className="bg-primary-container h-full rounded-full" style={{ width: '28.7%' }}></div>
</div>
<span className="font-caption text-[11px] text-text-secondary mt-2">Avg. tenure: 11 days</span>
</div>
<div className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
<div className="flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Staged for Holds</span>
<span className="w-2 h-2 rounded-full bg-status-pending"></span>
</div>
<div className="flex items-baseline gap-space-xs mt-1">
<span className="font-headline-3 text-headline-3 text-text-primary">248</span>
<span className="font-caption text-caption text-status-pending font-bold">5.1%</span>
</div>
<div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
<div className="bg-status-pending h-full rounded-full" style={{ width: '5.1%' }}></div>
</div>
<span className="font-caption text-[11px] text-text-secondary mt-2">Held at pickup bays</span>
</div>
<div className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
<div className="flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">In Maintenance</span>
<span className="w-2 h-2 rounded-full bg-secondary"></span>
</div>
<div className="flex items-baseline gap-space-xs mt-1">
<span className="font-headline-3 text-headline-3 text-text-primary">85</span>
<span className="font-caption text-caption text-secondary font-bold">1.7%</span>
</div>
<div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
<div className="bg-secondary h-full rounded-full" style={{ width: '1.7%' }}></div>
</div>
<span className="font-caption text-[11px] text-text-secondary mt-2">Bindery &amp; sanitation</span>
</div>
<div className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm">
<div className="flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Lost / Discrepancy</span>
<span className="w-2 h-2 rounded-full bg-status-danger"></span>
</div>
<div className="flex items-baseline gap-space-xs mt-1">
<span className="font-headline-3 text-headline-3 text-status-danger">45</span>
<span className="font-caption text-caption text-status-danger font-bold">0.9%</span>
</div>
<div className="w-full bg-surface-container h-1.5 rounded-full mt-3 overflow-hidden">
<div className="bg-status-danger h-full rounded-full" style={{ width: '0.9%' }}></div>
</div>
<span className="font-caption text-[11px] text-status-danger mt-2 flex items-center gap-1 font-semibold">
<span className="material-symbols-outlined text-[13px]">warning</span>
        Audit required={true}
      </span>
</div>
</div>
<div className="flex flex-col lg:flex-row gap-space-md items-stretch lg:items-center justify-between bg-surface-container-lowest p-space-md rounded-xl shadow-sm">
<div className="flex flex-wrap items-center gap-space-xs">
<button className="px-space-md py-1.5 rounded-full bg-primary text-on-primary font-small text-small font-semibold shadow-sm transition-all">All Copies (4,892)</button>
<button className="px-space-md py-1.5 rounded-full bg-chip-unselected-bg text-text-secondary hover:text-text-primary font-small text-small transition-all">Available (3,112)</button>
<button className="px-space-md py-1.5 rounded-full bg-chip-unselected-bg text-text-secondary hover:text-text-primary font-small text-small transition-all">On Loan (1,402)</button>
<button className="px-space-md py-1.5 rounded-full bg-chip-unselected-bg text-text-secondary hover:text-text-primary font-small text-small transition-all">Staged Hold (248)</button>
<button className="px-space-md py-1.5 rounded-full bg-chip-unselected-bg text-text-secondary hover:text-text-primary font-small text-small transition-all">Bindery/Repair (85)</button>
<button className="px-space-md py-1.5 rounded-full bg-chip-unselected-bg text-text-secondary hover:text-text-primary font-small text-small transition-all">Lost/Audit (45)</button>
</div>
<div className="flex flex-wrap items-center gap-space-sm">
<div className="relative min-w-[220px]">
<span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">domain</span>
<select className="w-full appearance-none bg-surface-container-low pl-10 pr-8 py-2 rounded-lg font-small text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
<option>All Wings &amp; Stacks Floors</option>
<option>Stacks North (Bay 1-10)</option>
<option>Stacks South (Bay 11-20)</option>
<option>Vault / Special Collections</option>
</select>
<span className="material-symbols-outlined absolute right-space-sm top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-[16px]">expand_more</span>
</div>
<div className="relative flex-1 sm:w-64">
<span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">barcode_scanner</span>
<input className="w-full bg-surface-container-low pl-10 pr-space-md py-2 rounded-lg font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Scan or type barcode..." type="text" />
</div>
</div>
</div>
<div className="w-full bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
<th className="py-3 px-space-md">Barcode &amp; RFID</th>
<th className="py-3 px-space-md">Title &amp; Edition</th>
<th className="py-3 px-space-md">Dewey Call No</th>
<th className="py-3 px-space-md">Stacks Coordinate</th>
<th className="py-3 px-space-md">Condition</th>
<th className="py-3 px-space-md">Current Custody / Status</th>
<th className="py-3 px-space-md">Acquired</th>
<th className="py-3 px-space-md text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y-0 text-text-primary font-small text-small">
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-3.5 px-space-md align-top">
<div className="flex flex-col">
<span className="font-semibold text-text-primary tracking-tight">#KP-BC-4491-01</span>
<span className="font-caption text-[11px] text-text-secondary uppercase font-mono">E200-983A-11</span>
</div>
</td>
<td className="py-3.5 px-space-md align-top max-w-[260px]">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-11 bg-surface-container rounded flex-shrink-0 flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[18px]">menu_book</span>
</div>
<div className="flex flex-col min-w-0">
<span className="font-semibold truncate">Clean Code: Handbook of Agile</span>
<span className="font-caption text-caption text-text-secondary truncate">1st Ed. Robert C. Martin</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-md align-top font-mono text-[13px] text-text-secondary font-medium">005.133 MAR</td>
<td className="py-3.5 px-space-md align-top">
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-primary text-[16px]">pin_drop</span>
<span className="font-medium">Bay 14, Shelf 3B</span>
</div>
<span className="font-caption text-caption text-text-secondary">Stacks South</span>
</td>
<td className="py-3.5 px-space-md align-top">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-text-primary font-caption text-caption font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
                Mint / Good
              </span>
</td>
<td className="py-3.5 px-space-md align-top">
<div className="flex flex-col">
<span className="inline-flex items-center gap-1 text-status-available font-semibold">
<span className="material-symbols-outlined text-[16px]">check_circle</span>
                  Available (On Shelf)
                </span>
<span className="font-caption text-[11px] text-text-secondary">Public shelf inventory</span>
</div>
</td>
<td className="py-3.5 px-space-md align-top text-text-secondary font-caption text-caption">Jan 2023</td>
<td className="py-3.5 px-space-md align-top text-right">
<div className="flex items-center justify-end gap-space-xs">
<button className="p-1.5 rounded hover:bg-surface-container text-text-secondary hover:text-text-primary transition-colors" title="Inspect Item">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1.5 rounded hover:bg-surface-container text-text-secondary hover:text-text-primary transition-colors" title="Re-tag Barcode">
<span className="material-symbols-outlined text-[18px]">label</span>
</button>
</div>
</td>
</tr>
<tr className="bg-surface-container-low/40 hover:bg-surface-container-low transition-colors">
<td className="py-3.5 px-space-md align-top">
<div className="flex flex-col">
<span className="font-semibold text-text-primary tracking-tight">#KP-BC-4491-02</span>
<span className="font-caption text-[11px] text-text-secondary uppercase font-mono">E200-983A-12</span>
</div>
</td>
<td className="py-3.5 px-space-md align-top max-w-[260px]">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-11 bg-surface-container rounded flex-shrink-0 flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[18px]">menu_book</span>
</div>
<div className="flex flex-col min-w-0">
<span className="font-semibold truncate">Clean Code: Handbook of Agile</span>
<span className="font-caption text-caption text-text-secondary truncate">1st Ed. Robert C. Martin</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-md align-top font-mono text-[13px] text-text-secondary font-medium">005.133 MAR</td>
<td className="py-3.5 px-space-md align-top">
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-status-pending text-[16px]">lock</span>
<span className="font-medium">Locker Bay 01 C-02</span>
</div>
<span className="font-caption text-caption text-text-secondary">Central Staging</span>
</td>
<td className="py-3.5 px-space-md align-top">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-text-primary font-caption text-caption font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
                Good
              </span>
</td>
<td className="py-3.5 px-space-md align-top">
<div className="flex flex-col">
<span className="inline-flex items-center gap-1 text-status-pending font-semibold">
<span className="material-symbols-outlined text-[16px]">event_seat</span>
                  Staged Hold
                </span>
<span className="font-caption text-[11px] text-text-secondary">Patron #KP-RES-00918</span>
</div>
</td>
<td className="py-3.5 px-space-md align-top text-text-secondary font-caption text-caption">Jan 2023</td>
<td className="py-3.5 px-space-md align-top text-right">
<div className="flex items-center justify-end gap-space-xs">
<button className="p-1.5 rounded hover:bg-surface-container text-text-secondary hover:text-text-primary transition-colors" title="Inspect Hold Status">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
</div>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-3.5 px-space-md align-top">
<div className="flex flex-col">
<span className="font-semibold text-text-primary tracking-tight">#KP-BC-4491-03</span>
<span className="font-caption text-[11px] text-text-secondary uppercase font-mono">E200-983A-13</span>
</div>
</td>
<td className="py-3.5 px-space-md align-top max-w-[260px]">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-11 bg-surface-container rounded flex-shrink-0 flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[18px]">menu_book</span>
</div>
<div className="flex flex-col min-w-0">
<span className="font-semibold truncate">Clean Code: Handbook of Agile</span>
<span className="font-caption text-caption text-text-secondary truncate">1st Ed. Robert C. Martin</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-md align-top font-mono text-[13px] text-text-secondary font-medium">005.133 MAR</td>
<td className="py-3.5 px-space-md align-top">
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-secondary text-[16px]">trip_origin</span>
<span className="font-medium">Off-Campus Loan</span>
</div>
<span className="font-caption text-caption text-text-secondary">External Lending</span>
</td>
<td className="py-3.5 px-space-md align-top">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-text-primary font-caption text-caption font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
                Good
              </span>
</td>
<td className="py-3.5 px-space-md align-top">
<div className="flex flex-col">
<span className="inline-flex items-center gap-1 text-primary font-semibold">
<span className="material-symbols-outlined text-[16px]">assignment_ind</span>
                  On Loan
                </span>
<span className="font-caption text-[11px] text-text-secondary">Patron Jhon Doe • Due Nov 09</span>
</div>
</td>
<td className="py-3.5 px-space-md align-top text-text-secondary font-caption text-caption">Jan 2023</td>
<td className="py-3.5 px-space-md align-top text-right">
<button className="px-space-sm py-1 rounded bg-surface-container hover:bg-soft-blue text-primary font-caption text-caption font-semibold transition-colors">Recall</button>
</td>
</tr>
<tr className="bg-surface-container-low/40 hover:bg-surface-container-low transition-colors">
<td className="py-3.5 px-space-md align-top">
<div className="flex flex-col">
<span className="font-semibold text-text-primary tracking-tight">#KP-BC-4491-05</span>
<span className="font-caption text-[11px] text-text-secondary uppercase font-mono">E200-983A-15</span>
</div>
</td>
<td className="py-3.5 px-space-md align-top max-w-[260px]">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-11 bg-surface-container rounded flex-shrink-0 flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[18px]">menu_book</span>
</div>
<div className="flex flex-col min-w-0">
<span className="font-semibold truncate">Clean Code: Handbook of Agile</span>
<span className="font-caption text-caption text-text-secondary truncate">1st Ed. Robert C. Martin</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-md align-top font-mono text-[13px] text-text-secondary font-medium">005.133 MAR</td>
<td className="py-3.5 px-space-md align-top">
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-secondary text-[16px]">build</span>
<span className="font-medium">Bindery Lab Rm 102</span>
</div>
<span className="font-caption text-caption text-text-secondary">Preservation Wing</span>
</td>
<td className="py-3.5 px-space-md align-top">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-error-container text-error font-caption text-caption font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                Spine Damaged
              </span>
</td>
<td className="py-3.5 px-space-md align-top">
<div className="flex flex-col">
<span className="inline-flex items-center gap-1 text-secondary font-semibold">
<span className="material-symbols-outlined text-[16px]">handyman</span>
                  In Maintenance
                </span>
<span className="font-caption text-[11px] text-text-secondary">Thermal Re-binding</span>
</div>
</td>
<td className="py-3.5 px-space-md align-top text-text-secondary font-caption text-caption">Jan 2023</td>
<td className="py-3.5 px-space-md align-top text-right">
<button className="px-space-sm py-1 rounded bg-secondary-container hover:bg-secondary-fixed text-on-secondary-container font-caption text-caption font-semibold transition-colors">Update Status</button>
</td>
</tr>
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-3.5 px-space-md align-top">
<div className="flex flex-col">
<span className="font-semibold text-text-primary tracking-tight">#KP-BC-1049-04</span>
<span className="font-caption text-[11px] text-text-secondary uppercase font-mono">E200-771B-04</span>
</div>
</td>
<td className="py-3.5 px-space-md align-top max-w-[260px]">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-11 bg-surface-container rounded flex-shrink-0 flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[18px]">menu_book</span>
</div>
<div className="flex flex-col min-w-0">
<span className="font-semibold truncate">SICP (2nd Ed. MIT Press)</span>
<span className="font-caption text-caption text-text-secondary truncate">Structure &amp; Interpretation</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-md align-top font-mono text-[13px] text-text-secondary font-medium">005.1 ABE</td>
<td className="py-3.5 px-space-md align-top">
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-primary text-[16px]">lock_clock</span>
<span className="font-medium">Special Reserve Bay 02</span>
</div>
<span className="font-caption text-caption text-text-secondary">Vault Wing</span>
</td>
<td className="py-3.5 px-space-md align-top">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-text-primary font-caption text-caption font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-status-pending"></span>
                Fair
              </span>
</td>
<td className="py-3.5 px-space-md align-top">
<div className="flex flex-col">
<span className="inline-flex items-center gap-1 text-primary font-semibold">
<span className="material-symbols-outlined text-[16px]">school</span>
                  On Loan (Faculty)
                </span>
<span className="font-caption text-[11px] text-text-secondary">Faculty Aris Thorne</span>
</div>
</td>
<td className="py-3.5 px-space-md align-top text-text-secondary font-caption text-caption">Feb 2022</td>
<td className="py-3.5 px-space-md align-top text-right">
<div className="flex items-center justify-end gap-space-xs">
<button className="p-1.5 rounded hover:bg-surface-container text-text-secondary hover:text-text-primary transition-colors" title="Inspect Copy">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
<div className="flex flex-col sm:flex-row items-center justify-between px-space-md py-3 bg-surface-container-lowest gap-space-sm">
<span className="font-caption text-caption text-text-secondary">Showing <strong className="text-text-primary">1-5</strong> of <strong className="text-text-primary">4,892</strong> registered physical assets</span>
<div className="flex items-center gap-space-xs">
<button className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-low text-text-secondary hover:text-text-primary transition-colors">
<span className="material-symbols-outlined text-[16px]">chevron_left</span>
</button>
<button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-on-primary font-caption text-caption font-bold">1</button>
<button className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-low text-text-secondary hover:text-text-primary font-caption text-caption font-semibold transition-colors">2</button>
<button className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-low text-text-secondary hover:text-text-primary font-caption text-caption font-semibold transition-colors">3</button>
<span className="px-1 text-text-secondary font-caption text-caption">...</span>
<button className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-low text-text-secondary hover:text-text-primary font-caption text-caption font-semibold transition-colors">979</button>
<button className="w-8 h-8 flex items-center justify-center rounded bg-surface-container-low text-text-secondary hover:text-text-primary transition-colors">
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</button>
</div>
</div>
</div>
<div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
<div className="lg:col-span-2 flex flex-col p-space-md bg-surface-container-lowest rounded-xl shadow-sm gap-space-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px]">history_edu</span>
<span className="font-headline-4 text-small font-bold text-text-primary">Live Audit &amp; Maintenance Telemetry</span>
</div>
<span className="font-caption text-[11px] text-text-secondary">Refreshed 2m ago</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm mt-1">
<div className="p-space-sm rounded-lg bg-surface-container-low flex items-start gap-space-sm">
<div className="w-7 h-7 rounded-full bg-status-danger/20 text-status-danger flex items-center justify-center flex-shrink-0 mt-0.5">
<span className="material-symbols-outlined text-[16px]">fmd_bad</span>
</div>
<div className="flex flex-col min-w-0">
<div className="flex items-center justify-between gap-1">
<span className="font-small text-small font-semibold text-text-primary truncate">Discrepancy in Stacks North Bay 04</span>
<span className="font-caption text-[10px] text-text-secondary flex-shrink-0">12m ago</span>
</div>
<p className="font-caption text-caption text-text-secondary line-clamp-2">RFID scanner reported 3 books missing from shelf schedule 004.81. Auto-flagged for visual sweep.</p>
</div>
</div>
<div className="p-space-sm rounded-lg bg-surface-container-low flex items-start gap-space-sm">
<div className="w-7 h-7 rounded-full bg-status-pending/20 text-status-pending flex items-center justify-center flex-shrink-0 mt-0.5">
<span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
</div>
<div className="flex flex-col min-w-0">
<div className="flex items-center justify-between gap-1">
<span className="font-small text-small font-semibold text-text-primary truncate">Re-bind Batch Scheduled</span>
<span className="font-caption text-[10px] text-text-secondary flex-shrink-0">1h ago</span>
</div>
<p className="font-caption text-caption text-text-secondary line-clamp-2">14 engineering reference texts transferred from Bindery Lab to Preservation Suite for spine adhesive curation.</p>
</div>
</div>
</div>
</div>
<div className="flex flex-col p-space-md bg-surface-container-lowest rounded-xl shadow-sm justify-between gap-space-sm">
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between">
<span className="font-headline-4 text-small font-bold text-text-primary">Stock Wear &amp; Reorder Triggers</span>
<span className="material-symbols-outlined text-text-secondary text-[18px]">rule</span>
</div>
<p className="font-caption text-caption text-text-secondary">Copies reaching cycle thresholds requiring replacement budget allocation.</p>
</div>
<div className="flex flex-col gap-2">
<div className="flex items-center justify-between">
<span className="font-small text-small font-medium text-text-primary">Replacement Budget Burn</span>
<span className="font-caption text-caption font-bold text-primary">78% (₱42,900 / ₱55,000)</span>
</div>
<div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
<div className="bg-primary-container h-full rounded-full" style={{ width: '78%' }}></div>
</div>
</div>
<div className="flex items-center justify-between pt-2">
<span className="font-caption text-caption text-text-secondary">12 copies marked critical wear</span>
<button className="px-space-md py-1.5 rounded-lg bg-soft-blue text-primary hover:bg-secondary-container transition-colors font-caption text-caption font-bold">
          View Replacements
        </button>
</div>
</div>
</div>
</div>
    </div>
  );
};

export default Inventory;
