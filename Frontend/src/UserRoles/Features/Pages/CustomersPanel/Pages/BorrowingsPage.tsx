// [Layer: UserRoles/Features/Pages/CustomersPanel/Pages]
// BorrowingsPage.tsx -- Customer Borrowing History and Renewals
// Converted directly from NavBorrowingsPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const BorrowingsPage: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
// Filter tab interactions for Borrowing History
  document.querySelectorAll('.tab-filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-filter-btn').forEach(b => {
        b.classList.remove('bg-primary-container', 'text-on-primary-container', 'font-semibold', 'shadow-sm');
        b.classList.add('text-text-secondary', 'font-medium');
      });
      this.classList.remove('text-text-secondary', 'font-medium');
      this.classList.add('bg-primary-container', 'text-on-primary-container', 'font-semibold', 'shadow-sm');
    });
  });

  // Client-side quick filter in past loans table
  const searchInput = document.getElementById('ledgerSearchInput');
  const table = document.getElementById('borrowingsTable');
  if (searchInput && table) {
    searchInput.addEventListener('input', function(e) {
      const term = e.target.value.toLowerCase();
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
      });
    });
  }

  // Renewal Action Feedback Micro-interaction
  function handleRenew(button: HTMLButtonElement, bookTitle: string) {
    const originalContent = button.innerHTML;
    button.disabled = true;
    button.innerHTML = `
      <span class="material-symbols-outlined animate-spin text-lg">progress_activity</span>
      <span>Requesting...</span>
    `;

    setTimeout(() => {
      button.classList.remove('bg-action-green', 'hover:bg-action-green-hover', 'bg-soft-blue', 'text-primary');
      button.classList.add('bg-status-available', 'text-on-primary');
      button.innerHTML = `
        <span class="material-symbols-outlined text-lg">check_circle</span>
        <span>Renewed (+7 Days)</span>
      `;

      // Dispatch non-intrusive toast or notification
      const alertBadge = document.createElement('div');
      alertBadge.className = "fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-text-primary text-surface shadow-2xl flex items-center gap-3 animate-bounce";
      alertBadge.innerHTML = `
        <span class="material-symbols-outlined text-action-green">verified</span>
        <div class="font-caption text-caption">
          <p class="font-semibold text-small">Loan Extension Confirmed</p>
          <p class="text-surface-variant">New return deadline granted for "${bookTitle}".</p>
        </div>
      `;
      document.body.appendChild(alertBadge);

      setTimeout(() => {
        alertBadge.remove();
      }, 4000);
    }, 900);
  }

  w.handleRenew = handleRenew;

    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
{/* Subtle Ambient Glow Orbs */}
<div className="relative w-full overflow-hidden pb-space-3xl">
<div className="absolute -top-12 -left-20 w-96 h-96 rounded-full bg-secondary-container/40 blur-3xl pointer-events-none"></div>
<div className="absolute top-48 right-0 w-[30rem] h-[30rem] rounded-full bg-soft-blue/50 blur-3xl pointer-events-none"></div>
{/* Section 1: Borrowings Header & High-Level Patron Stat Pods */}
<section className="relative z-10 w-full pt-space-md">
<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg mb-space-xl">
<div className="max-w-3xl space-y-space-xs">
<div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-glass-surface backdrop-blur-md shadow-sm">
<span className="w-2 h-2 rounded-full bg-action-green animate-pulse"></span>
<span className="font-caption text-caption text-secondary uppercase tracking-widest font-semibold">Circulation Desk Ledger</span>
<span className="text-text-secondary">•</span>
<span className="font-caption text-caption text-text-secondary">Patron ID #KP-88192-A</span>
</div>
<h1 className="font-headline-1 text-headline-1 text-text-primary tracking-tight">My Active Loans &amp; Circulation History</h1>
<p className="font-body-large text-body-large text-text-secondary leading-relaxed">
            Monitor physical books currently defaultChecked out, due dates, loan extensions, and past circulation records.
          </p>
</div>
{/* Real-time Status Pill Group */}
<div className="flex items-center gap-space-xs p-1.5 rounded-2xl bg-glass-surface backdrop-blur-md shadow-sm shrink-0">
<button className="flex items-center gap-space-xs px-space-md py-space-xs rounded-xl bg-primary-container text-on-primary-container font-small text-small font-medium shadow-sm transition-all" type="button">
<span className="material-symbols-outlined text-lg">sync_saved_locally</span>
<span className="">Live Sync</span>
</button>
<button className="flex items-center gap-space-xs px-space-md py-space-xs rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-container-high transition-all font-small text-small" onClick={() => window.print()} type="button">
<span className="material-symbols-outlined text-lg">download</span>
<span className="">Ledger Export</span>
</button>
</div>
</div>
{/* 4 Patron Key Indicator Tiles (Bento Stat Strip) */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
{/* Tile 1 */}
<div className="relative overflow-hidden rounded-2xl bg-glass-surface backdrop-blur-xl p-space-lg shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
<div className="flex items-start justify-between">
<span className="font-caption text-caption uppercase text-text-secondary tracking-wider font-semibold">Books in Possession</span>
<div className="w-10 h-10 rounded-xl bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined">auto_stories</span>
</div>
</div>
<div className="mt-space-md flex items-baseline gap-space-sm">
<span className="font-display-hero text-headline-1 text-text-primary">02</span>
<span className="font-caption text-caption text-text-secondary">/ 4 max allowance</span>
</div>
<div className="mt-space-sm w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
<div className="bg-primary h-full rounded-full" style={{ width: '50%' }}></div>
</div>
</div>
{/* Tile 2 */}
<div className="relative overflow-hidden rounded-2xl bg-glass-surface backdrop-blur-xl p-space-lg shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
<div className="flex items-start justify-between">
<span className="font-caption text-caption uppercase text-status-pending tracking-wider font-semibold">Due in 3 Days</span>
<div className="w-10 h-10 rounded-xl bg-status-pending/15 flex items-center justify-center text-status-pending">
<span className="material-symbols-outlined">alarm</span>
</div>
</div>
<div className="mt-space-md flex items-baseline gap-space-sm">
<span className="font-display-hero text-headline-1 text-status-pending">01</span>
<span className="font-caption text-caption text-text-secondary">Action needed soon</span>
</div>
<div className="mt-space-sm flex items-center gap-space-xs text-status-pending font-caption text-caption">
<span className="material-symbols-outlined text-sm">schedule</span>
<span className="">Oct 26, 2026 before 08:00 PM</span>
</div>
</div>
{/* Tile 3 */}
<div className="relative overflow-hidden rounded-2xl bg-glass-surface backdrop-blur-xl p-space-lg shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
<div className="flex items-start justify-between">
<span className="font-caption text-caption uppercase text-text-secondary tracking-wider font-semibold">Overdue Loans</span>
<div className="w-10 h-10 rounded-xl bg-status-available/20 flex items-center justify-center text-status-available">
<span className="material-symbols-outlined">verified</span>
</div>
</div>
<div className="mt-space-md flex items-baseline gap-space-sm">
<span className="font-display-hero text-headline-1 text-text-primary">00</span>
<span className="font-caption text-caption text-status-available font-medium">Clean Record</span>
</div>
<p className="mt-space-sm font-caption text-caption text-text-secondary">No overdue items or holds blocked</p>
</div>
{/* Tile 4 */}
<div className="relative overflow-hidden rounded-2xl bg-primary text-on-primary p-space-lg shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
<div className="flex items-start justify-between">
<span className="font-caption text-caption uppercase text-primary-fixed tracking-wider font-semibold">Patron Standing</span>
<div className="w-10 h-10 rounded-xl bg-primary-container text-action-green flex items-center justify-center">
<span className="material-symbols-outlined">workspace_premium</span>
</div>
</div>
<div className="mt-space-md">
<span className="font-headline-3 text-headline-3 text-on-primary">Zero Fines</span>
<div className="font-caption text-caption text-primary-fixed mt-1 flex items-center gap-space-xs">
<span className="w-2 h-2 rounded-full bg-action-green"></span>
<span className="">Account in Exemplary Standing</span>
</div>
</div>
<div className="mt-space-sm flex items-center justify-between font-caption text-caption pt-space-xs border-t border-white/10">
<span className="">Grace Tier: Gold Patron</span>
<span className="font-medium text-action-green">₱0.00 Balance</span>
</div>
</div>
</div>
</section>
{/* Section 2: Active Loans Section (High-priority Interactive Cards) */}
<section className="relative z-10 mt-space-2xl">
<div className="flex items-center justify-between mb-space-lg">
<div className="flex items-center gap-space-sm">
<h2 className="font-headline-2 text-headline-3 text-text-primary">Physical Books Currently Checked Out</h2>
<span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-caption text-caption font-semibold">2 Volumes</span>
</div>
<div className="hidden sm:flex items-center gap-space-xs text-text-secondary font-caption text-caption">
<span className="material-symbols-outlined text-base text-action-green">info</span>
<span className="">Renewals extend the initial return date by 7 calendar days</span>
</div>
</div>
<div className="grid grid-cols-1 xl:grid-cols-2 gap-space-lg items-start">
{/* Loan Card 1: Urgent Attention (Due in 3 Days) */}
<div className="rounded-3xl bg-glass-surface backdrop-blur-2xl p-space-xl shadow-md transition-all hover:shadow-xl relative overflow-hidden">
{/* Ambient Amber Accent Bar on top */}
<div className="absolute top-0 left-0 right-0 h-1.5 bg-status-pending"></div>
<div className="flex flex-col sm:flex-row gap-space-lg">
{/* Cover image placeholder */}
<div className="w-32 h-44 sm:w-36 sm:h-52 rounded-2xl overflow-hidden shadow-md shrink-0 bg-surface-container-high relative">
<img className="w-full h-full object-cover" data-alt="A clean, minimalist book cover for Clean Code by Robert C. Martin with bold academic typography on a soft teal and modern tech slate backdrop." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqqxO3hADBgD5dwV_J5p4atHOmBRDnVqqjykLqCAuX5zmVUSiCWaXoN3by8CmCU98LlEdWtv5AaWedrJIyu3RCvvGc9TFuj88oignhzaHtxe0FNvT0e_d_5BFn53BIlFR_W6dQ_fR4Jc7zfxQXiP8dT-BoIG-Xas5bLRklRzhA8SMvFTspypgqGrXCMlvMMXSYbdQp2s5CM2XftvB52Hh9pN9VbC22i_XWZVtBKd-Fj-CUBYljBpo_" />
<span className="absolute top-2 left-2 px-2 py-1 rounded bg-text-primary/80 backdrop-blur-sm text-surface font-caption text-[10px] tracking-wider font-mono uppercase">Shelf 3B</span>
</div>
{/* Content Area */}
<div className="flex-1 flex flex-col justify-between min-w-0">
<div>
<div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-xs">
<span className="inline-flex items-center gap-1 font-caption text-caption font-mono text-text-secondary bg-surface-container px-2 py-0.5 rounded-md">
<span className="material-symbols-outlined text-xs text-primary">barcode_scanner</span>
                    #LN-2026-0812
                  </span>
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-pending/20 text-text-primary font-caption text-caption font-semibold">
<span className="w-2 h-2 rounded-full bg-status-pending animate-ping"></span>
                    Due in 3 Days
                  </span>
</div>
<h3 className="font-headline-3 text-headline-3 text-text-primary tracking-tight leading-snug">
                  Clean Code: A Handbook of Agile Software Craftsmanship
                </h3>
<p className="font-small text-small text-text-secondary mt-0.5">by Robert C. Martin (Uncle Bob) • Pearson Education</p>
{/* Metadata Chips */}
<div className="mt-space-md grid grid-cols-2 gap-x-space-md gap-y-space-xs py-space-sm bg-surface-container-lowest/60 rounded-xl px-space-md">
<div>
<span className="block font-caption text-caption text-text-secondary">Checked Out</span>
<span className="font-small text-small text-text-primary font-medium">Oct 12, 2026</span>
</div>
<div>
<span className="block font-caption text-caption text-text-secondary">Return Due Date</span>
<span className="font-small text-small text-status-pending font-semibold">Oct 26, 2026 (08:00 PM)</span>
</div>
<div>
<span className="block font-caption text-caption text-text-secondary">Physical Asset Barcode</span>
<span className="font-small text-small font-mono text-text-primary">KP-BC-4491</span>
</div>
<div>
<span className="block font-caption text-caption text-text-secondary">Physical Stacks Location</span>
<span className="font-small text-small text-text-primary">Bay 14 • Shelf 3B</span>
</div>
</div>
</div>
{/* Days Elapsed Progress Bar (11 of 14 Days) */}
<div className="mt-space-md">
<div className="flex items-center justify-between text-caption font-caption mb-1">
<span className="text-text-secondary">Loan Duration: <strong className="text-text-primary">11 of 14 Days Elapsed</strong></span>
<span className="text-status-pending font-semibold">78.5% Elapsed</span>
</div>
<div className="w-full bg-surface-variant h-2.5 rounded-full overflow-hidden p-0.5">
<div className="bg-status-pending h-full rounded-full transition-all duration-500" style={{ width: '78.5%' }}></div>
</div>
</div>
{/* Interactive Actions Button Bar */}
<div className="mt-space-lg pt-space-md flex flex-wrap items-center gap-space-sm">
<button className="min-h-[44px] px-space-lg py-2.5 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-semibold shadow-sm transition-all flex items-center gap-space-xs active:scale-95" id="renewBtn1" onClick={(e) => { (window as any).handleRenew?.(e.currentTarget, 'Clean Code'); }} type="button">
<span className="material-symbols-outlined text-xl">update</span>
<span className="">Request 7-Day Renewal</span>
</button>
<button className="min-h-[44px] px-space-md py-2.5 rounded-xl bg-soft-blue hover:bg-secondary-fixed text-primary font-small text-small font-medium transition-all flex items-center gap-space-xs" type="button">
<span className="material-symbols-outlined text-lg">report_problem</span>
<span className="">Report Issue</span>
</button>
<a className="min-h-[44px] px-space-md py-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-container-high font-small text-small font-medium transition-all flex items-center gap-space-xs" href="#lifecycle-timeline">
<span className="material-symbols-outlined text-lg">timeline</span>
<span className="">Timeline</span>
</a>
</div>
</div>
</div>
</div>
{/* Loan Card 2: Normal (10 Days Remaining) */}
<div className="rounded-3xl bg-glass-surface backdrop-blur-2xl p-space-xl shadow-md transition-all hover:shadow-xl relative overflow-hidden">
{/* Calm Teal Accent Bar */}
<div className="absolute top-0 left-0 right-0 h-1.5 bg-primary"></div>
<div className="flex flex-col sm:flex-row gap-space-lg">
{/* Cover image placeholder */}
<div className="w-32 h-44 sm:w-36 sm:h-52 rounded-2xl overflow-hidden shadow-md shrink-0 bg-surface-container-high relative">
<img className="w-full h-full object-cover" data-alt="Cover artwork of Atomic Habits by James Clear with clean architectural minimalist circles and calm academic blue tones on ivory background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBamIBqhGEo5xO8Q2DFDuCABEDUMA8IUcKdfwufhcdnSFMCujFwYUVOY1l0uH__KFF2d4GmvxCDjOIJ_P2TmZECsXtnYJ36lu25okj96s5RliG0Zh1hnzmu8P5xHa2z1Zsu_Ah0afeWEZ7QYRXYO3pxmH2ps9ts8npGyYufx2NimwG_1yQGR9hGYXjn2y6st9xmgBq582T8HK54cQcQ6SdtTUHl8ScCLCZPi79TlJStTTSiTCHh_vdb" />
<span className="absolute top-2 left-2 px-2 py-1 rounded bg-text-primary/80 backdrop-blur-sm text-surface font-caption text-[10px] tracking-wider font-mono uppercase">Shelf 12A</span>
</div>
{/* Content Area */}
<div className="flex-1 flex flex-col justify-between min-w-0">
<div>
<div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-xs">
<span className="inline-flex items-center gap-1 font-caption text-caption font-mono text-text-secondary bg-surface-container px-2 py-0.5 rounded-md">
<span className="material-symbols-outlined text-xs text-primary">barcode_scanner</span>
                    #LN-2026-0845
                  </span>
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-soft-blue text-primary font-caption text-caption font-semibold">
<span className="w-2 h-2 rounded-full bg-primary"></span>
                    10 Days Remaining
                  </span>
</div>
<h3 className="font-headline-3 text-headline-3 text-text-primary tracking-tight leading-snug">
                  Atomic Habits: An Easy &amp; Proven Way to Build Good Habits
                </h3>
<p className="font-small text-small text-text-secondary mt-0.5">by James Clear • Avery Publishing Group</p>
{/* Metadata Chips */}
<div className="mt-space-md grid grid-cols-2 gap-x-space-md gap-y-space-xs py-space-sm bg-surface-container-lowest/60 rounded-xl px-space-md">
<div>
<span className="block font-caption text-caption text-text-secondary">Checked Out</span>
<span className="font-small text-small text-text-primary font-medium">Oct 19, 2026</span>
</div>
<div>
<span className="block font-caption text-caption text-text-secondary">Return Due Date</span>
<span className="font-small text-small text-text-primary font-semibold">Nov 02, 2026</span>
</div>
<div>
<span className="block font-caption text-caption text-text-secondary">Physical Asset Barcode</span>
<span className="font-small text-small font-mono text-text-primary">KP-BC-3982</span>
</div>
<div>
<span className="block font-caption text-caption text-text-secondary">Physical Stacks Location</span>
<span className="font-small text-small text-text-primary">Bay 03 • Shelf 12A</span>
</div>
</div>
</div>
{/* Days Elapsed Progress Bar (4 of 14 Days) */}
<div className="mt-space-md">
<div className="flex items-center justify-between text-caption font-caption mb-1">
<span className="text-text-secondary">Loan Duration: <strong className="text-text-primary">4 of 14 Days Elapsed</strong></span>
<span className="text-primary font-semibold">28.5% Elapsed</span>
</div>
<div className="w-full bg-surface-variant h-2.5 rounded-full overflow-hidden p-0.5">
<div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: '28.5%' }}></div>
</div>
</div>
{/* Interactive Actions Button Bar */}
<div className="mt-space-lg pt-space-md flex flex-wrap items-center gap-space-sm">
<button className="min-h-[44px] px-space-lg py-2.5 rounded-xl bg-soft-blue hover:bg-secondary-fixed text-primary font-small text-small font-semibold shadow-sm transition-all flex items-center gap-space-xs active:scale-95" onClick={(e) => { (window as any).handleRenew?.(e.currentTarget, 'Atomic Habits'); }} type="button">
<span className="material-symbols-outlined text-lg">history</span>
<span className="">Renew Loan</span>
</button>
<button className="min-h-[44px] px-space-md py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-variant text-text-primary font-small text-small font-medium transition-all flex items-center gap-space-xs" type="button">
<span className="material-symbols-outlined text-lg">info</span>
<span className="">View Details</span>
</button>
<div className="ml-auto hidden sm:flex items-center gap-1 font-caption text-caption text-text-secondary">
<span className="material-symbols-outlined text-sm text-status-available">check_circle</span>
<span className="">Renewals left: 2 of 2</span>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
{/* Section 3: Visual Borrowing Lifecycle Timeline (For Loan Card 1: Clean Code) */}
<section className="relative z-10 mt-space-2xl" id="lifecycle-timeline">
<div className="rounded-3xl bg-glass-surface backdrop-blur-2xl p-space-xl shadow-md">
<div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-xl">
<div>
<div className="flex items-center gap-space-xs">
<span className="font-caption text-caption uppercase tracking-wider font-semibold text-primary">Live Circulation Trajectory</span>
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
<span className="font-caption text-caption text-text-secondary font-mono">Loan #LN-2026-0812</span>
</div>
<h3 className="font-headline-3 text-headline-3 text-text-primary mt-0.5">Borrowing Lifecycle Milestone Tracker</h3>
<p className="font-small text-small text-text-secondary">Real-time ledger state tracking physical custody from hold reservation to return counter audit.</p>
</div>
<div className="flex items-center gap-2">
<span className="px-3 py-1 rounded-full bg-soft-blue text-primary font-caption text-caption font-semibold">Stage 4 of 6 Active</span>
</div>
</div>
{/* Horizontal Milestone Track */}
<div className="relative w-full overflow-x-auto pb-4">
<div className="min-w-[760px] relative px-4">
{/* Continuous background track line */}
<div className="absolute top-6 left-12 right-12 h-1 bg-surface-variant z-0"></div>
{/* Highlighted progress track line up to active stage */}
<div className="absolute top-6 left-12 h-1 bg-primary z-0 transition-all" style={{ width: '58%' }}></div>
{/* 6 Nodes */}
<div className="relative z-10 grid grid-cols-6 gap-2">
{/* Milestone 1 */}
<div className="flex flex-col items-center text-center">
<div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md ring-4 ring-background">
<span className="material-symbols-outlined text-lg font-bold">check</span>
</div>
<span className="font-small text-small font-semibold text-text-primary mt-space-sm">1. Reserved</span>
<span className="font-caption text-caption text-text-secondary">Oct 10, 2026</span>
<span className="mt-1 px-2 py-0.5 rounded text-[11px] font-caption bg-status-available/20 text-status-available font-medium">Online Queue</span>
</div>
{/* Milestone 2 */}
<div className="flex flex-col items-center text-center">
<div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md ring-4 ring-background">
<span className="material-symbols-outlined text-lg font-bold">check</span>
</div>
<span className="font-small text-small font-semibold text-text-primary mt-space-sm">2. Cashier Approved</span>
<span className="font-caption text-caption text-text-secondary">Oct 11, 2026</span>
<span className="mt-1 px-2 py-0.5 rounded text-[11px] font-caption bg-status-available/20 text-status-available font-medium">Cleared for Pick</span>
</div>
{/* Milestone 3 */}
<div className="flex flex-col items-center text-center">
<div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md ring-4 ring-background">
<span className="material-symbols-outlined text-lg font-bold">check</span>
</div>
<span className="font-small text-small font-semibold text-text-primary mt-space-sm">3. Counter Checkout</span>
<span className="font-caption text-caption text-text-secondary">Oct 12, 2026</span>
<span className="mt-1 px-2 py-0.5 rounded text-[11px] font-caption bg-status-available/20 text-status-available font-medium">Barcode Scanned</span>
</div>
{/* Milestone 4 (CURRENT STATE) */}
<div className="flex flex-col items-center text-center">
<div className="w-12 h-12 rounded-full bg-action-green text-text-primary flex items-center justify-center shadow-lg ring-4 ring-background animate-pulse">
<span className="material-symbols-outlined text-xl">menu_book</span>
</div>
<span className="font-small text-small font-bold text-text-primary mt-space-sm">4. Active Loan</span>
<span className="font-caption text-caption text-status-pending font-semibold">Day 11 of 14</span>
<span className="mt-1 px-2 py-0.5 rounded text-[11px] font-caption bg-action-green text-text-primary font-bold">In Hand</span>
</div>
{/* Milestone 5 (UPCOMING) */}
<div className="flex flex-col items-center text-center">
<div className="w-12 h-12 rounded-full bg-surface-container-high text-status-pending flex items-center justify-center ring-4 ring-background">
<span className="material-symbols-outlined text-lg">event_upcoming</span>
</div>
<span className="font-small text-small font-medium text-text-secondary mt-space-sm">5. Due Date</span>
<span className="font-caption text-caption text-status-pending font-medium">Oct 26, 2026</span>
<span className="mt-1 px-2 py-0.5 rounded text-[11px] font-caption bg-status-pending/20 text-text-primary font-medium">In 3 Days</span>
</div>
{/* Milestone 6 (PENDING RETURN) */}
<div className="flex flex-col items-center text-center">
<div className="w-12 h-12 rounded-full bg-surface-container-high text-text-secondary flex items-center justify-center ring-4 ring-background">
<span className="material-symbols-outlined text-lg">assignment_turned_in</span>
</div>
<span className="font-small text-small font-medium text-text-secondary mt-space-sm">6. Return &amp; Audit</span>
<span className="font-caption text-caption text-text-secondary">Expected Return</span>
<span className="mt-1 px-2 py-0.5 rounded text-[11px] font-caption bg-surface-variant text-text-secondary font-medium">Pending</span>
</div>
</div>
</div>
</div>
{/* Embedded Lifecycle Note Banner */}
<div className="mt-space-lg p-space-md rounded-2xl bg-surface-container-lowest/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-primary text-xl">qr_code_2</span>
<div>
<p className="font-small text-small font-medium text-text-primary">Returning in person?</p>
<p className="font-caption text-caption text-text-secondary">Show your patron barcode at Circulation Desk Level 1 or drop directly into Smart Drop Box 24/7.</p>
</div>
</div>
<button className="shrink-0 px-space-md py-1.5 rounded-xl bg-soft-blue hover:bg-secondary-fixed text-primary font-small text-small font-medium transition-all" type="button">
            Show Return Pass (Passbook)
          </button>
</div>
</div>
</section>
{/* Section 4: Comprehensive Borrowing History Log (Past Returns) */}
<section className="relative z-10 mt-space-2xl">
<div className="rounded-3xl bg-glass-surface backdrop-blur-2xl p-space-xl shadow-md">
{/* Table Toolbar & Filters */}
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg">
<div>
<h3 className="font-headline-3 text-headline-3 text-text-primary">Past Circulation Ledger &amp; Return Records</h3>
<p className="font-small text-small text-text-secondary">Official institutional log of physical collection borrowings, clearances, and audit receipts.</p>
</div>
{/* Tab Chips */}
<div className="flex flex-wrap items-center gap-space-xs p-1 rounded-full bg-surface-container-high/60 backdrop-blur-md">
<button className="tab-filter-btn px-space-md py-1.5 rounded-full bg-primary-container text-on-primary-container font-caption text-caption font-semibold shadow-sm transition-all" data-filter="all" type="button">All Past Loans</button>
<button className="tab-filter-btn px-space-md py-1.5 rounded-full text-text-secondary hover:text-text-primary font-caption text-caption font-medium transition-all" data-filter="ontime" type="button">Returned on Time</button>
<button className="tab-filter-btn px-space-md py-1.5 rounded-full text-text-secondary hover:text-text-primary font-caption text-caption font-medium transition-all" data-filter="renewals" type="button">Renewals</button>
<button className="tab-filter-btn px-space-md py-1.5 rounded-full text-text-secondary hover:text-text-primary font-caption text-caption font-medium transition-all" data-filter="fines" type="button">Fines &amp; Clearances</button>
</div>
</div>
{/* Fast Search & Record Metric */}
<div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm mb-space-md">
<div className="relative w-full sm:max-w-xs">
<span className="material-symbols-outlined absolute left-3 top-2.5 text-text-secondary text-lg">search</span>
<input className="w-full bg-surface-container-lowest/80 pl-9 pr-3 py-2 rounded-xl text-small font-small text-text-primary placeholder:text-text-secondary focus:outline-none focus:bg-surface-container-lowest transition-all" id="ledgerSearchInput" placeholder="Filter by book, barcode, or receipt..." type="text" />
</div>
<div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-space-md text-caption font-caption text-text-secondary">
<span className="">Showing 4 audited circulation events</span>
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
<span className="text-text-primary font-semibold">Total Fines Paid: ₱0.00</span>
</div>
</div>
{/* Ledger Table Container */}
<div className="overflow-x-auto rounded-2xl bg-surface-container-lowest/70 shadow-sm">
<table className="w-full text-left border-collapse" id="borrowingsTable">
<thead>
<tr className="bg-surface-container-high/40 text-text-secondary font-caption text-caption uppercase tracking-wider">
<th className="py-space-md px-space-lg">Book Title &amp; Barcode</th>
<th className="py-space-md px-space-md">Borrow Date</th>
<th className="py-space-md px-space-md">Return Date</th>
<th className="py-space-md px-space-md">Duration</th>
<th className="py-space-md px-space-md">Fine Status</th>
<th className="py-space-md px-space-md">Audit / Receipt</th>
<th className="py-space-md px-space-lg text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-variant/40 font-small text-small text-text-primary">
{/* Row 1 */}
<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="py-space-md px-space-lg">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-11 rounded bg-surface-container-high overflow-hidden shrink-0">
<img className="w-full h-full object-cover" data-alt="Cover of Design Patterns Elements of Reusable Object Oriented Software on blue spine" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDw7NWtgGo_l0ugBSiPHNaN5UGdncAQZwBM0mvOlS8LhGlFJiD3AlOWovNpcQW5KZvX6kyQh3QW1kwKNofgbg39AbnWJWwIZBABEWLB9kPLhF8oNPx-X_v47j6Wdhxu6p9jGmq0n7g8pkQBs8w45mCeQLjqiKdcSO-0Upt_Uv3RBDIiu-yybrTeth-N4D1BUVcRF73K4S1FYK3ZxOcQqxa8F_tAHEJxk07Y7Zw9fgSwOAcz-RB5y8g8" />
</div>
<div>
<div className="font-medium text-text-primary">Design Patterns: Elements of Reusable Object-Oriented Software</div>
<div className="font-caption text-caption text-text-secondary font-mono">KP-BC-1102 • Stacks Bay 11</div>
</div>
</div>
</td>
<td className="py-space-md px-space-md text-text-secondary">Sep 15, 2026</td>
<td className="py-space-md px-space-md">
<span className="font-medium text-text-primary">Sep 28, 2026</span>
<span className="block font-caption text-caption text-status-available">On-time desk drop</span>
</td>
<td className="py-space-md px-space-md text-text-secondary">13 Days</td>
<td className="py-space-md px-space-md">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-status-available/15 text-status-available font-caption text-caption font-semibold">
                    ₱0.00 Cleared
                  </span>
</td>
<td className="py-space-md px-space-md font-mono text-caption text-text-secondary">
                  RCPT-2026-9921
                </td>
<td className="py-space-md px-space-lg text-right">
<button className="p-1.5 rounded-lg hover:bg-surface-container text-primary transition-colors" title="Download Receipt" type="button">
<span className="material-symbols-outlined text-lg">receipt_long</span>
</button>
</td>
</tr>
{/* Row 2 */}
<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="py-space-md px-space-lg">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-11 rounded bg-surface-container-high overflow-hidden shrink-0">
<img className="w-full h-full object-cover" data-alt="Cover of Refactoring Improving the Design of Existing Code Martin Fowler textbook" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD93kUtpyt1SbVQ0roYdtt2V8WxezYLSc_o6t8lMWFv6u1vebobggipndcpiKTwVMAn07DvNx8_Jo594yc5gGdz4VR5I0RwhnRkWmK6eXtXVx8Zl0wcQ62oDG95jYZ165xU12LmAZ_uam7WrdNce7LZAxNIkVDhL3Cq47SZeS3ABBrNKISdPvP0-laAS7-yi28njQURb4D72z5809-qHYb6rzqitPoW_8ONNbCANSToUp1PnCGrZGJ2" />
</div>
<div>
<div className="font-medium text-text-primary">Refactoring: Improving the Design of Existing Code (2nd Ed)</div>
<div className="font-caption text-caption text-text-secondary font-mono">KP-BC-2849 • Stacks Bay 14</div>
</div>
</div>
</td>
<td className="py-space-md px-space-md text-text-secondary">Aug 20, 2026</td>
<td className="py-space-md px-space-md">
<span className="font-medium text-text-primary">Sep 08, 2026</span>
<span className="block font-caption text-caption text-primary">Renewed +7d</span>
</td>
<td className="py-space-md px-space-md text-text-secondary">19 Days</td>
<td className="py-space-md px-space-md">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-status-available/15 text-status-available font-caption text-caption font-semibold">
                    ₱0.00 Cleared
                  </span>
</td>
<td className="py-space-md px-space-md font-mono text-caption text-text-secondary">
                  RCPT-2026-8104
                </td>
<td className="py-space-md px-space-lg text-right">
<button className="p-1.5 rounded-lg hover:bg-surface-container text-primary transition-colors" title="Download Receipt" type="button">
<span className="material-symbols-outlined text-lg">receipt_long</span>
</button>
</td>
</tr>
{/* Row 3 */}
<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="py-space-md px-space-lg">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-11 rounded bg-surface-container-high overflow-hidden shrink-0">
<img className="w-full h-full object-cover" data-alt="Cover of Introduction to Algorithms by Cormen Leiserson Rivest Stein CLRS textbook" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-Oo7ymjslAEenbNUt1ZCnecQ9AbzLtwXvoHeOEG-IPdsfaliydDHpLbCzq2c4-l3oBXSxiWMUzik6NzsJnU4KhMRzAu-xP49j62nMIuHb2kz24LA9Lt_sygs71WMlL8c95VPEHsXUBie2oy0qZH1p-fR0_OdudxKjR9naaTy7PLeP1l7geq0s1j_MgYGKFyATC7etZdVfnTzegmFhNtElAl_S27weHcgpk9BtpFWhayI-lCj2cCXs" />
</div>
<div>
<div className="font-medium text-text-primary">Introduction to Algorithms (CLRS, 4th Edition)</div>
<div className="font-caption text-caption text-text-secondary font-mono">KP-BC-0914 • Stacks Bay 02</div>
</div>
</div>
</td>
<td className="py-space-md px-space-md text-text-secondary">Jul 01, 2026</td>
<td className="py-space-md px-space-md">
<span className="font-medium text-text-primary">Jul 14, 2026</span>
<span className="block font-caption text-caption text-status-available">Smart Box Return</span>
</td>
<td className="py-space-md px-space-md text-text-secondary">13 Days</td>
<td className="py-space-md px-space-md">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-status-available/15 text-status-available font-caption text-caption font-semibold">
                    ₱0.00 Cleared
                  </span>
</td>
<td className="py-space-md px-space-md font-mono text-caption text-text-secondary">
                  RCPT-2026-6219
                </td>
<td className="py-space-md px-space-lg text-right">
<button className="p-1.5 rounded-lg hover:bg-surface-container text-primary transition-colors" title="Download Receipt" type="button">
<span className="material-symbols-outlined text-lg">receipt_long</span>
</button>
</td>
</tr>
{/* Row 4 */}
<tr className="hover:bg-surface-container-low/50 transition-colors">
<td className="py-space-md px-space-lg">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-11 rounded bg-surface-container-high overflow-hidden shrink-0">
<img className="w-full h-full object-cover" data-alt="Cover of The Pragmatic Programmer 20th Anniversary Edition by David Thomas and Andrew Hunt" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDB1CpHmrpYIGUtpBR8iRXDRzdbaaD51cAbg6cqCX7v1bd_oqqUQ8W3x-1gpWdcGZvTqeJKKf5SBtDmYYdT-qPErjT969R1-6qi3eHsrQlzLfKhdwzuibJRTbhH04GdM53G3dXTF2vAK4EWKUt_Mtoi4jJbZmjh-f4C22icX1Dkpqmez44xdSFtgvcBSIu_jQ_dCDvap9e2FcgkjcgR-JSjoewU8ghW_8Pey8TY2X_sG-I_JjfVPbFe" />
</div>
<div>
<div className="font-medium text-text-primary">The Pragmatic Programmer: Your Journey To Mastery</div>
<div className="font-caption text-caption text-text-secondary font-mono">KP-BC-3301 • Stacks Bay 09</div>
</div>
</div>
</td>
<td className="py-space-md px-space-md text-text-secondary">Jun 10, 2026</td>
<td className="py-space-md px-space-md">
<span className="font-medium text-text-primary">Jun 24, 2026</span>
<span className="block font-caption text-caption text-status-available">On-time desk drop</span>
</td>
<td className="py-space-md px-space-md text-text-secondary">14 Days</td>
<td className="py-space-md px-space-md">
<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-status-available/15 text-status-available font-caption text-caption font-semibold">
                    ₱0.00 Cleared
                  </span>
</td>
<td className="py-space-md px-space-md font-mono text-caption text-text-secondary">
                  RCPT-2026-5120
                </td>
<td className="py-space-md px-space-lg text-right">
<button className="p-1.5 rounded-lg hover:bg-surface-container text-primary transition-colors" title="Download Receipt" type="button">
<span className="material-symbols-outlined text-lg">receipt_long</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
{/* Pagination Bar */}
<div className="mt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm pt-space-sm text-caption font-caption text-text-secondary">
<div className="flex items-center gap-space-xs">
<span className="">Archive range: Year 2026 (Semester 1 &amp; 2)</span>
</div>
<div className="flex items-center gap-space-xs">
<button className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-variant text-text-primary disabled={true}:opacity-50" disabled={true} type="button">
<span className="material-symbols-outlined text-sm">chevron_left</span>
</button>
<span className="px-space-sm font-medium text-text-primary">Page 1 of 1</span>
<button className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-variant text-text-primary disabled={true}:opacity-50" disabled={true} type="button">
<span className="material-symbols-outlined text-sm">chevron_right</span>
</button>
</div>
</div>
</div>
</section>
{/* Section 5: Library Circulation Policy & Drop-box Info Box */}
<section className="relative z-10 mt-space-2xl">
<div className="rounded-3xl bg-glass-surface backdrop-blur-2xl p-space-xl shadow-md">
<div className="flex items-start gap-space-md">
<div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-2xl">policy</span>
</div>
<div className="flex-1">
<div className="flex flex-wrap items-center justify-between gap-space-xs">
<h3 className="font-headline-3 text-headline-3 text-text-primary">Katipuneros Circulation &amp; Patron Lending Policy</h3>
<span className="px-3 py-0.5 rounded-full bg-primary/10 text-primary font-caption text-caption font-semibold">Updated Fall 2026</span>
</div>
<p className="font-small text-small text-text-secondary mt-1">
              Guidelines regulating physical collection custody, grace allowances, renewal caps, and after-hours smart drop-off terminals.
            </p>
{/* Policy Bento Pods */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mt-space-lg">
{/* Policy 1 */}
<div className="p-space-md rounded-2xl bg-surface-container-lowest/80 shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center gap-space-xs text-primary mb-1 font-small text-small font-semibold">
<span className="material-symbols-outlined text-lg">event_repeat</span>
<span className="">Renewal Limits</span>
</div>
<p className="font-caption text-caption text-text-secondary leading-relaxed">
                    Active loans may be extended up to <strong>2 consecutive times (7 days each)</strong>, provided no other patron has reserved or queued a hold on the ISBN title.
                  </p>
</div>
<div className="mt-space-sm pt-space-xs border-t border-surface-variant/40 font-caption text-caption text-primary font-medium">
                  Renewable via Web Portal or Mobile App
                </div>
</div>
{/* Policy 2 */}
<div className="p-space-md rounded-2xl bg-surface-container-lowest/80 shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center gap-space-xs text-status-pending mb-1 font-small text-small font-semibold">
<span className="material-symbols-outlined text-lg">hourglass_top</span>
<span className="">Grace Periods &amp; Overdues</span>
</div>
<p className="font-caption text-caption text-text-secondary leading-relaxed">
                    A <strong>24-hour courtesy window</strong> applies after 08:00 PM on due date. Beyond this, a standard institutional maintenance fee of <strong>₱15.00/day</strong> per book is automatically billed.
                  </p>
</div>
<div className="mt-space-sm pt-space-xs border-t border-surface-variant/40 font-caption text-caption text-status-available font-medium">
                  Zero Overdue Tolerance on Reserves
                </div>
</div>
{/* Policy 3 */}
<div className="p-space-md rounded-2xl bg-surface-container-lowest/80 shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center gap-space-xs text-secondary mb-1 font-small text-small font-semibold">
<span className="material-symbols-outlined text-lg">local_post_office</span>
<span className="">24/7 Smart Drop-Box</span>
</div>
<p className="font-caption text-caption text-text-secondary leading-relaxed">
                    Contactless returns can be deposited at the <strong>Atrium South Gate automated bin</strong>. Scanners timestamp items immediately to safeguard patron return status.
                  </p>
</div>
<div className="mt-space-sm pt-space-xs border-t border-surface-variant/40 font-caption text-caption text-secondary font-medium">
                  Instant SMS &amp; Email Clearance
                </div>
</div>
</div>
{/* Bottom Support Contact Bar */}
<div className="mt-space-lg flex flex-wrap items-center justify-between gap-space-sm pt-space-sm font-caption text-caption text-text-secondary">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-base text-primary">support_agent</span>
<span className="">Questions regarding book wear or replacement? Contact Circulation Librarian desk at <strong>circulation@katipuneros.lib.edu</strong></span>
</div>
<a className="text-primary hover:underline font-medium" href="#">Download Full Patron Code Handbook (PDF)</a>
</div>
</div>
</div>
</div>
</section>
</div>
</div>

    </div>
  );
};

export default BorrowingsPage;
