// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// CashierDashboard.tsx -- Cashier Point of Sale & Circulation Dashboard
// Converted directly from SibarBarDashBoardPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC } from 'react';

const CashierDashboard: FC = () => {
  return (
    <div className="w-full">
      <div className="flex flex-col w-full pb-16 space-y-8">
{/* Operational Shift Header */}
<section className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pt-4">
<div className="flex flex-col space-y-1">
<div className="flex items-center gap-3">
<span className="px-2.5 py-0.5 rounded-full bg-soft-blue text-primary font-caption text-caption uppercase tracking-wider font-bold">Desk Bay 01 Ledger</span>
<div className="flex items-center gap-1.5 text-text-secondary font-caption text-caption">
<span className="w-2 h-2 rounded-full bg-action-green animate-pulse"></span>
<span className="">Synced 2s ago</span>
</div>
</div>
<h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">Cashier Operations Dashboard</h1>
<p className="font-body text-body text-text-secondary max-w-3xl">Real-time terminal ledger for reservation reviews, circulation counter checkouts, and book returns.</p>
</div>
{/* Persistent Quick Action Buttons */}
<div className="flex flex-wrap items-center gap-2.5">
<button className="h-11 px-4 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium flex items-center gap-2 shadow-sm transition-all transform active:scale-95 cursor-pointer" type="button">
<span className="material-symbols-outlined text-xl">shopping_cart_checkout</span>
<span className="">+ Fast Checkout</span>
</button>
<button className="h-11 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-medium text-body-medium flex items-center gap-2 shadow-sm transition-colors cursor-pointer" type="button">
<span className="material-symbols-outlined text-xl">pending_actions</span>
<span className="">Review Reservations</span>
<span className="bg-soft-blue text-primary text-caption font-bold px-2 py-0.5 rounded-full">5</span>
</button>
<button className="h-11 px-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-body-medium text-body-medium flex items-center gap-1.5 transition-colors cursor-pointer" type="button">
<span className="material-symbols-outlined text-lg text-primary">keyboard_return</span>
<span className="">Process Return</span>
</button>
<button className="h-11 px-3.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-text-primary font-body-medium text-body-medium flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer" type="button">
<span className="material-symbols-outlined text-lg text-primary">qr_code_scanner</span>
<span className="">Scan Barcode/QR</span>
</button>
<button className="h-11 px-3.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-text-primary font-body-medium text-body-medium flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer" type="button">
<span className="material-symbols-outlined text-lg text-text-secondary">person_search</span>
<span className="">Find Patron</span>
</button>
</div>
</section>
{/* 8 Structured KPI Operational Metric Cards Grid */}
<section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3.5">
{/* Card 1: Pending Reservations */}
<div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden group">
<div className="flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary font-medium">Pending Holds</span>
<div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-lg">assignment_late</span>
</div>
</div>
<div className="mt-3">
<div className="font-headline-3 text-headline-3 text-text-primary leading-none">05</div>
<p className="font-caption text-caption text-status-pending font-medium mt-1">2 urgent today</p>
</div>
<div className="absolute bottom-0 left-0 right-0 h-1 bg-status-pending opacity-80"></div>
</div>
{/* Card 2: Approved Today */}
<div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
<div className="flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary font-medium">Approved Today</span>
<div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-lg">check_circle</span>
</div>
</div>
<div className="mt-3">
<div className="font-headline-3 text-headline-3 text-text-primary leading-none">14</div>
<p className="font-caption text-caption text-status-available font-medium mt-1">Cleared for pickup</p>
</div>
<div className="absolute bottom-0 left-0 right-0 h-1 bg-status-available opacity-80"></div>
</div>
{/* Card 3: Books to Release */}
<div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
<div className="flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary font-medium">To Release</span>
<div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-lg">local_library</span>
</div>
</div>
<div className="mt-3">
<div className="font-headline-3 text-headline-3 text-text-primary leading-none">09</div>
<p className="font-caption text-caption text-text-secondary mt-1">Staged in Bay 01</p>
</div>
<div className="absolute bottom-0 left-0 right-0 h-1 bg-primary opacity-60"></div>
</div>
{/* Card 4: Active Borrowings */}
<div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
<div className="flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary font-medium">Active Loans</span>
<div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-lg">auto_stories</span>
</div>
</div>
<div className="mt-3">
<div className="font-headline-3 text-headline-3 text-text-primary leading-none">86</div>
<p className="font-caption text-caption text-text-secondary mt-1">In patron custody</p>
</div>
<div className="absolute bottom-0 left-0 right-0 h-1 bg-primary opacity-60"></div>
</div>
{/* Card 5: Due Today */}
<div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
<div className="flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary font-medium">Due Today</span>
<div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-lg">schedule</span>
</div>
</div>
<div className="mt-3">
<div className="font-headline-3 text-headline-3 text-text-primary leading-none">07</div>
<p className="font-caption text-caption text-text-secondary mt-1">Target 8:00 PM</p>
</div>
<div className="absolute bottom-0 left-0 right-0 h-1 bg-primary opacity-60"></div>
</div>
{/* Card 6: Overdue Loans */}
<div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
<div className="flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary font-medium">Overdue</span>
<div className="w-8 h-8 rounded-lg bg-error-container flex items-center justify-center text-error">
<span className="material-symbols-outlined text-lg">error_outline</span>
</div>
</div>
<div className="mt-3">
<div className="font-headline-3 text-headline-3 text-error leading-none">03</div>
<p className="font-caption text-caption text-error font-medium mt-1">Fines calculating</p>
</div>
<div className="absolute bottom-0 left-0 right-0 h-1 bg-status-danger opacity-80"></div>
</div>
{/* Card 7: Returns Today */}
<div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
<div className="flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary font-medium">Returns In</span>
<div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-lg">fact_check</span>
</div>
</div>
<div className="mt-3">
<div className="font-headline-3 text-headline-3 text-text-primary leading-none">11</div>
<p className="font-caption text-caption text-status-available font-medium mt-1">Audit cleared</p>
</div>
<div className="absolute bottom-0 left-0 right-0 h-1 bg-status-available opacity-80"></div>
</div>
{/* Card 8: Fines Collected Today */}
<div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
<div className="flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary font-medium">Fines Daily</span>
<div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-lg">payments</span>
</div>
</div>
<div className="mt-3">
<div className="font-headline-4 text-headline-4 text-text-primary leading-none">₱280.00</div>
<p className="font-caption text-caption text-text-secondary mt-1">3 receipts settled</p>
</div>
<div className="absolute bottom-0 left-0 right-0 h-1 bg-action-green opacity-90"></div>
</div>
</section>
{/* Main Content Split Grid */}
<section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
{/* Left Column: Pending Reservation Intake Queue (65% -> col-span-8) */}
<div className="lg:col-span-8 flex flex-col space-y-6">
{/* Queue Container */}
<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col space-y-5">
{/* Header & Filter Tabs */}
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-xl bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-xl">assignment</span>
</div>
<div>
<h2 className="font-headline-4 text-headline-4 text-text-primary">Pending Reservation Intake Queue</h2>
<p className="font-caption text-caption text-text-secondary">Review, stage stacks physically, and approve book pickups</p>
</div>
</div>
{/* Tab Chips */}
<div className="inline-flex p-1 bg-surface-container-high rounded-full self-start sm:self-auto text-caption font-caption">
<button className="px-3.5 py-1.5 rounded-full bg-surface-container-lowest text-text-primary font-bold shadow-sm cursor-pointer" type="button">All (5)</button>
<button className="px-3.5 py-1.5 rounded-full text-text-secondary hover:text-text-primary transition-colors cursor-pointer" type="button">Today (3)</button>
<button className="px-3.5 py-1.5 rounded-full text-text-secondary hover:text-text-primary transition-colors cursor-pointer" type="button">Tomorrow (2)</button>
<button className="px-3.5 py-1.5 rounded-full text-status-danger hover:text-text-primary transition-colors cursor-pointer flex items-center gap-1" type="button">
<span className="w-1.5 h-1.5 rounded-full bg-status-danger"></span>
              Priority
            </button>
</div>
</div>
{/* Table / Queue View */}
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse min-w-[700px]">
<thead>
<tr className="bg-surface-container-low text-text-secondary font-caption text-caption uppercase tracking-wider rounded-xl">
<th className="py-3 px-4 rounded-l-xl">Reservation &amp; Patron</th>
<th className="py-3 px-4">Book Title &amp; Call No.</th>
<th className="py-3 px-4">Physical Stacks</th>
<th className="py-3 px-4">Requested Pickup</th>
<th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container-high/40 text-small font-small">
{/* Item 1 */}
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-4 px-4">
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary font-bold">#KP-RES-2026-00914</span>
<span className="font-body-medium text-body-medium text-text-primary mt-0.5">Marcus Aurelius</span>
<div className="flex items-center gap-1.5 mt-1">
<span className="bg-soft-blue text-primary font-caption text-caption px-2 py-0.5 rounded-md font-bold">KP-88192</span>
<span className="text-status-available font-caption text-caption flex items-center gap-0.5">
<span className="material-symbols-outlined text-xs">verified</span> Good Standing
                      </span>
</div>
</div>
</td>
<td className="py-4 px-4">
<div className="flex items-center gap-3">
<img className="w-10 h-14 object-cover rounded-lg shadow-sm" data-alt="Close up clean photo of a technical computer science textbook cover in an academic library with blue ambient lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCt6Y-spd5mcfT5-UGJeGaUKv9uO7qV6FuqNPtCbWRlIVM55AauMrU-smav87T1pdW1nf1tMSjc7Sg8LTd9nuiNNovSS_iV6_BwGQOBaRbDi-wQPD4rT9Ov9_SSZ-or1NssHyQ424vSjb5tXPwt-Sj6B29E2SY9MKyMujUEMpjsDOOhcafYgwFpU3NUhLWoekwb7akM2qnsR6yGFHmeM49SDA6uXwUH1XQ1QFD3TqA8VXkhimIRPjxu" />
<div className="flex flex-col max-w-[200px]">
<span className="font-body-medium text-body-medium text-text-primary leading-snug">SICP: Structure &amp; Interpretation</span>
<span className="font-caption text-caption text-text-secondary mt-0.5">Call: 005.133 ABE</span>
<span className="text-caption font-caption text-text-secondary">MIT Press • Hardcover</span>
</div>
</div>
</td>
<td className="py-4 px-4">
<div className="flex flex-col">
<span className="inline-flex items-center gap-1 text-status-available font-bold text-caption font-caption">
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span> Available
                    </span>
<span className="font-caption text-caption text-text-secondary mt-0.5">3 copies • Bay 14 (Shelf 3B)</span>
</div>
</td>
<td className="py-4 px-4">
<div className="flex flex-col">
<span className="font-body-medium text-body-medium text-text-primary">Today, 2:00 PM</span>
<span className="font-caption text-caption text-text-secondary mt-0.5">Duration: 14 Days</span>
<span className="inline-block mt-1 px-2 py-0.5 bg-status-pending/20 text-text-primary rounded text-caption font-caption font-bold w-max">Priority Desk</span>
</div>
</td>
<td className="py-4 px-4 text-right">
<div className="flex items-center justify-end gap-2">
<button className="h-9 px-3 rounded-lg bg-action-green hover:bg-action-green-hover text-text-primary font-caption text-caption font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm" type="button">
<span className="material-symbols-outlined text-base">check</span>
<span className="">Approve</span>
</button>
<button className="h-9 px-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-text-primary font-caption text-caption transition-colors cursor-pointer" type="button">
<span className="">Review / Reject</span>
</button>
</div>
</td>
</tr>
{/* Item 2 */}
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-4 px-4">
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary font-bold">#KP-RES-2026-00918</span>
<span className="font-body-medium text-body-medium text-text-primary mt-0.5">Sofia Morales</span>
<div className="flex items-center gap-1.5 mt-1">
<span className="bg-soft-blue text-primary font-caption text-caption px-2 py-0.5 rounded-md font-bold">KP-77401</span>
<span className="text-text-secondary font-caption text-caption">Active 2 Loans</span>
</div>
</div>
</td>
<td className="py-4 px-4">
<div className="flex items-center gap-3">
<img className="w-10 h-14 object-cover rounded-lg shadow-sm" data-alt="Minimalist clean programming book cover Clean Code sitting on an oak desk in a bright quiet university library" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKzhpKVcbeWlL3m5DXzIAX1cusWbztn00mRITiTe0o6_RRM5h0tI6XR8rxsJ_Nlc-9PXj6_CrZ5i8HtR2PGCzMMfSUPUW1_-VSFdYqAID2TTkekeHjCDbNNAOgOAUcJd7YtwTZ73bRwbfQw1q1okj_8A8YywPJmWSAP1XTfVHy-Sci8KRmUvbOdjcv8tgpeDeQCfgj26Dwe2qArTuS2I3p_mWlrD62plpw6nZ3nSNmfyVWlbps9F_0" />
<div className="flex flex-col max-w-[200px]">
<span className="font-body-medium text-body-medium text-text-primary leading-snug">Clean Code: Agile Craftsmanship</span>
<span className="font-caption text-caption text-text-secondary mt-0.5">Call: 005.1 MAR</span>
<span className="text-caption font-caption text-text-secondary">Pearson • 2008</span>
</div>
</div>
</td>
<td className="py-4 px-4">
<div className="flex flex-col">
<span className="inline-flex items-center gap-1 text-status-available font-bold text-caption font-caption">
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span> Available
                    </span>
<span className="font-caption text-caption text-text-secondary mt-0.5">1 copy • Stacks Bay 02</span>
</div>
</td>
<td className="py-4 px-4">
<div className="flex flex-col">
<span className="font-body-medium text-body-medium text-text-primary">Today, 4:30 PM</span>
<span className="font-caption text-caption text-text-secondary mt-0.5">Duration: 7 Days</span>
</div>
</td>
<td className="py-4 px-4 text-right">
<div className="flex items-center justify-end gap-2">
<button className="h-9 px-3 rounded-lg bg-action-green hover:bg-action-green-hover text-text-primary font-caption text-caption font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm" type="button">
<span className="material-symbols-outlined text-base">check</span>
<span className="">Approve</span>
</button>
<button className="h-9 px-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-text-primary font-caption text-caption transition-colors cursor-pointer" type="button">
<span className="">Review / Reject</span>
</button>
</div>
</td>
</tr>
{/* Item 3 */}
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-4 px-4">
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary font-bold">#KP-RES-2026-00922</span>
<span className="font-body-medium text-body-medium text-text-primary mt-0.5">Dr. Aris Thorne</span>
<div className="flex items-center gap-1.5 mt-1">
<span className="bg-soft-blue text-primary font-caption text-caption px-2 py-0.5 rounded-md font-bold">FACULTY-019</span>
<span className="text-status-available font-caption text-caption font-bold">Faculty Exemption</span>
</div>
</div>
</td>
<td className="py-4 px-4">
<div className="flex items-center gap-3">
<img className="w-10 h-14 object-cover rounded-lg shadow-sm" data-alt="Classic dark clothbound hardback book with gold embossed typography spine resting on a librarian sorting table" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJjwvKuA8wT-xIyJVm0M-cP5N3L__o1beCTdzVIGutrs43_b42zxAnMH07g80gzPENgsT0Wc0faXsdAK9o6jJspi8sAxgl_9-LzOj2VHL5ZjS3l2QYRTUtVvOfYk986hhq-Gy1g8KO13qOzTHRnA84fk3pp1c2f-96S0STwOspeR5Pcrv4MuE75sJOLsBozyoK-6B2hOprUvOn90hmH0yY9UwvdmdkRMJY91iNa6mTn6GFavCkCljC" />
<div className="flex flex-col max-w-[200px]">
<span className="font-body-medium text-body-medium text-text-primary leading-snug">Philippine Cartography 1320-1899</span>
<span className="font-caption text-caption text-text-secondary mt-0.5">Call: 912.599 QUI</span>
<span className="text-caption font-caption text-status-pending">Special Collection Archival</span>
</div>
</div>
</td>
<td className="py-4 px-4">
<div className="flex flex-col">
<span className="inline-flex items-center gap-1 text-primary font-bold text-caption font-caption">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Vault Staged
                    </span>
<span className="font-caption text-caption text-text-secondary mt-0.5">Runner: Bay 02 Locker #4</span>
</div>
</td>
<td className="py-4 px-4">
<div className="flex flex-col">
<span className="font-body-medium text-body-medium text-text-primary">Today, 5:15 PM</span>
<span className="font-caption text-caption text-text-secondary mt-0.5">Duration: 30 Days</span>
</div>
</td>
<td className="py-4 px-4 text-right">
<div className="flex items-center justify-end gap-2">
<button className="h-9 px-3 rounded-lg bg-action-green hover:bg-action-green-hover text-text-primary font-caption text-caption font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm" type="button">
<span className="material-symbols-outlined text-base">check</span>
<span className="">Approve</span>
</button>
<button className="h-9 px-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-text-primary font-caption text-caption transition-colors cursor-pointer" type="button">
<span className="">Review / Reject</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
<div className="flex items-center justify-between pt-2 border-t border-surface-container font-caption text-caption text-text-secondary">
<span className="">Showing 3 of 5 pending intake requests</span>
<button className="text-primary font-bold hover:underline cursor-pointer flex items-center gap-1" type="button">
            View All Pending Intake Queue
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
</div>
{/* Quick Action Inline Barcode Scanner Hardware Widget */}
<div className="bg-gradient-to-r from-primary to-secondary text-on-primary rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
<div className="flex items-center gap-4 z-10">
<div className="w-14 h-14 rounded-2xl bg-on-primary/10 backdrop-blur-md flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-3xl text-action-green">barcode_scanner</span>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-action-green animate-ping"></span>
<h3 className="font-headline-4 text-headline-4 text-on-primary">Hardware Scanner Ready</h3>
</div>
<p className="font-body text-body text-inverse-on-surface/80 mt-1 max-w-lg">Point optical scanner at patron RFID card, reservation QR, or physical book spine barcode to trigger instant loan checkout.</p>
</div>
</div>
<div className="flex items-center gap-3 z-10 w-full md:w-auto justify-end">
<div className="hidden sm:flex flex-col text-right font-caption text-caption text-inverse-on-surface/70">
<span className="">Terminal: HoneyWell Xenon 1900</span>
<span className="text-action-green font-bold">USB Driver Active • Ready</span>
</div>
<button className="px-4 py-2.5 rounded-xl bg-action-green text-text-primary font-body-medium text-body-medium font-bold hover:bg-action-green-hover transition-colors shadow-sm cursor-pointer whitespace-nowrap" type="button">
            Manual Input Key
          </button>
</div>
{/* Decorative background glow */}
<div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-action-green/10 blur-2xl pointer-events-none"></div>
</div>
</div>
{/* Right Column: Returns & Shift Summary (35% -> col-span-4) */}
<div className="lg:col-span-4 flex flex-col space-y-6">
{/* Card: Today's Scheduled Returns & Overdue Queue */}
<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col space-y-5">
<div className="flex items-center justify-between pb-1">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-lg">history_edu</span>
</div>
<div>
<h3 className="font-headline-4 text-headline-4 text-text-primary">Returns &amp; Overdue Queue</h3>
<span className="font-caption text-caption text-text-secondary">Expected Today &amp; Delinquent Items</span>
</div>
</div>
<span className="bg-error-container text-on-error-container text-caption font-bold px-2 py-0.5 rounded-full">3 Overdue</span>
</div>
{/* Queue Items List */}
<div className="flex flex-col space-y-3.5">
{/* Item 1 (Overdue with Fine) */}
<div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col space-y-2.5">
<div className="flex items-start justify-between">
<div>
<span className="font-body-medium text-body-medium text-text-primary font-bold">Design Patterns: Elements of Reusable OO</span>
<p className="font-caption text-caption text-text-secondary mt-0.5">Borrower: Clara Santos (KP-44012)</p>
</div>
<span className="px-2 py-0.5 rounded bg-error/10 text-error font-caption text-caption font-bold whitespace-nowrap">Overdue 2 Days</span>
</div>
<div className="flex items-center justify-between pt-1 border-t border-surface-container">
<div className="flex items-center gap-1 font-caption text-caption text-error font-bold">
<span className="material-symbols-outlined text-sm">monetization_on</span>
<span className="">Calculated Fine: ₱20.00</span>
</div>
<div className="flex items-center gap-1.5">
<button className="px-2.5 py-1 rounded bg-primary text-on-primary font-caption text-caption font-bold hover:bg-primary-container transition-colors cursor-pointer" type="button">
                  Process Return
                </button>
<button className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-surface-container transition-colors cursor-pointer" title="Send SMS Reminder" type="button">
<span className="material-symbols-outlined text-base">notifications_active</span>
</button>
</div>
</div>
</div>
{/* Item 2 (Due Today) */}
<div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col space-y-2.5">
<div className="flex items-start justify-between">
<div>
<span className="font-body-medium text-body-medium text-text-primary font-bold">Introduction to Algorithms (CLRS)</span>
<p className="font-caption text-caption text-text-secondary mt-0.5">Borrower: Jhon Doe (KP-90211)</p>
</div>
<span className="px-2 py-0.5 rounded bg-status-pending/20 text-text-primary font-caption text-caption font-bold whitespace-nowrap">Due 4:00 PM</span>
</div>
<div className="flex items-center justify-between pt-1 border-t border-surface-container">
<span className="font-caption text-caption text-status-available font-bold flex items-center gap-1">
<span className="material-symbols-outlined text-sm">schedule</span> On Schedule (No Fine)
              </span>
<button className="px-2.5 py-1 rounded bg-surface-container-highest hover:bg-surface-container text-text-primary font-caption text-caption font-bold transition-colors cursor-pointer" type="button">
                Process Return
              </button>
</div>
</div>
{/* Item 3 (Overdue with Fine) */}
<div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col space-y-2.5">
<div className="flex items-start justify-between">
<div>
<span className="font-body-medium text-body-medium text-text-primary font-bold">Noli Me Tangere (Centennial Translation)</span>
<p className="font-caption text-caption text-text-secondary mt-0.5">Borrower: Gabriel Silang (KP-30198)</p>
</div>
<span className="px-2 py-0.5 rounded bg-error/10 text-error font-caption text-caption font-bold whitespace-nowrap">Overdue 6 Days</span>
</div>
<div className="flex items-center justify-between pt-1 border-t border-surface-container">
<div className="flex items-center gap-1 font-caption text-caption text-error font-bold">
<span className="material-symbols-outlined text-sm">monetization_on</span>
<span className="">Calculated Fine: ₱60.00</span>
</div>
<div className="flex items-center gap-1.5">
<button className="px-2.5 py-1 rounded bg-primary text-on-primary font-caption text-caption font-bold hover:bg-primary-container transition-colors cursor-pointer" type="button">
                  Collect &amp; Return
                </button>
<button className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-surface-container transition-colors cursor-pointer" title="Send SMS Reminder" type="button">
<span className="material-symbols-outlined text-base">outgoing_mail</span>
</button>
</div>
</div>
</div>
{/* Item 4 (Due Today) */}
<div className="p-3.5 rounded-xl bg-surface-container-low flex flex-col space-y-2.5">
<div className="flex items-start justify-between">
<div>
<span className="font-body-medium text-body-medium text-text-primary font-bold">Modern Operating Systems (Tanenbaum)</span>
<p className="font-caption text-caption text-text-secondary mt-0.5">Borrower: Bea Rodriguez (KP-11942)</p>
</div>
<span className="px-2 py-0.5 rounded bg-status-pending/20 text-text-primary font-caption text-caption font-bold whitespace-nowrap">Due 7:30 PM</span>
</div>
<div className="flex items-center justify-between pt-1 border-t border-surface-container">
<span className="font-caption text-caption text-text-secondary">Expected desk return</span>
<button className="px-2.5 py-1 rounded bg-surface-container-highest hover:bg-surface-container text-text-primary font-caption text-caption font-bold transition-colors cursor-pointer" type="button">
                Process Return
              </button>
</div>
</div>
</div>
</div>
{/* Card: Daily Shift Operational Summary & Register Status */}
<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col space-y-5">
<div className="flex items-center justify-between pb-1">
<div className="flex items-center gap-2.5">
<div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-lg">point_of_sale</span>
</div>
<div>
<h3 className="font-headline-4 text-headline-4 text-text-primary">Shift &amp; Register Status</h3>
<span className="font-caption text-caption text-text-secondary">Front Desk Drawer 01</span>
</div>
</div>
<span className="w-2.5 h-2.5 rounded-full bg-action-green"></span>
</div>
<div className="grid grid-cols-2 gap-3">
<div className="p-3 bg-surface-container-low rounded-xl flex flex-col">
<span className="font-caption text-caption text-text-secondary">Active Cashier</span>
<span className="font-body-medium text-body-medium text-text-primary font-bold mt-0.5">Elena Vance</span>
<span className="font-caption text-caption text-text-secondary mt-0.5">Shift #04 (Morning)</span>
</div>
<div className="p-3 bg-surface-container-low rounded-xl flex flex-col">
<span className="font-caption text-caption text-text-secondary">Total Register Cash</span>
<span className="font-body-medium text-body-medium text-text-primary font-bold mt-0.5">₱1,730.00</span>
<span className="font-caption text-caption text-text-secondary mt-0.5">Float: ₱1,450 + Fines: ₱280</span>
</div>
</div>
{/* System & Runner Status Checklist */}
<div className="flex flex-col space-y-2.5 text-small font-small">
<div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low/60">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-lg text-primary">directions_run</span>
<span className="text-text-primary">Stacks Physical Runners</span>
</div>
<span className="font-caption text-caption text-status-available font-bold bg-status-available/10 px-2 py-0.5 rounded">2 Active (Bay 02, 14)</span>
</div>
<div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low/60">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-lg text-primary">sensors</span>
<span className="text-text-primary">Physical Barcode Readers</span>
</div>
<span className="font-caption text-caption text-status-available font-bold bg-status-available/10 px-2 py-0.5 rounded">Synced &amp; Calibrated</span>
</div>
<div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low/60">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-lg text-primary">print</span>
<span className="text-text-primary">Receipt Thermal Printer</span>
</div>
<span className="font-caption text-caption text-text-secondary">Epson TM-T88VI (Ready)</span>
</div>
</div>
<div className="pt-2 flex items-center justify-between">
<button className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-body-medium text-body-medium font-bold transition-colors cursor-pointer flex items-center justify-center gap-2" type="button">
<span className="material-symbols-outlined text-lg">lock_clock</span>
<span className="">Close Shift / Reconcile Drawer</span>
</button>
</div>
</div>
</div>
</section>
</div>
    </div>
  );
};

export default CashierDashboard;
