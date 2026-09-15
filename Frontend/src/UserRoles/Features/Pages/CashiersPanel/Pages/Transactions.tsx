// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// Transactions.tsx -- Cashier Transaction History and Audit Ledger
// Converted directly from SidebarTransactionPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const Transactions: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
(function () {
      function highlightTransactionsNav() {
        const nav = document.querySelector('nav');
        if (!nav) return;
        const activeClasses = (nav.getAttribute('data-active-classes') || 'bg-primary-container text-on-primary-container font-semibold rounded-xl shadow-sm').split(' ');
        
        nav.querySelectorAll('a').forEach(a => {
          if (a.getAttribute('data-path') === 'transactions') {
            a.classList.add(...activeClasses);
            a.classList.remove('text-text-secondary', 'hover:bg-surface-container-high', 'hover:text-text-primary');
            const icon = a.querySelector('.material-symbols-outlined');
            if (icon) icon.classList.add('text-on-primary-container');
          } else {
            a.classList.remove(...activeClasses);
            a.classList.add('text-text-secondary');
          }
        });
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', highlightTransactionsNav);
      } else {
        highlightTransactionsNav();
      }
    })();

    function selectTransaction(txId, patron, role, idNum, title, type, badgeBg, badgeText, badgeLabel, feeBreakdown, totalFee, method, refCode, timestamp) {
      const panel = document.getElementById('audit-detail-drawer');
      if (!panel) return;

      document.getElementById('drawer-tx-id').innerText = txId;
      document.getElementById('drawer-patron-name').innerText = patron;
      document.getElementById('drawer-patron-meta').innerText = `${idNum} • ${role}`;
      document.getElementById('drawer-book-title').innerText = title;
      document.getElementById('drawer-fee-breakdown').innerText = feeBreakdown;
      document.getElementById('drawer-total-amount').innerText = totalFee;
      document.getElementById('drawer-payment-method').innerText = method;
      document.getElementById('drawer-payment-ref').innerText = refCode;
      document.getElementById('drawer-timestamp').innerText = timestamp;
      
      const badge = document.getElementById('drawer-status-badge');
      badge.className = `px-2.5 py-1 rounded-full font-caption text-caption font-semibold inline-flex items-center gap-1.5 ${badgeBg} ${badgeText}`;
      badge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-current"></span> ${badgeLabel}`;

      // subtle pulse effect on selection
      panel.classList.add('ring-2', 'ring-primary/20');
      setTimeout(() => panel.classList.remove('ring-2', 'ring-primary/20'), 400);
    }

    function filterTransactions(pillElement, category) {
      const pills = document.querySelectorAll('.filter-pill');
      pills.forEach(p => {
        p.classList.remove('bg-primary', 'text-on-primary', 'shadow-sm');
        p.classList.add('bg-chip-unselected-bg', 'text-text-secondary');
      });
      pillElement.classList.remove('bg-chip-unselected-bg', 'text-text-secondary');
      pillElement.classList.add('bg-primary', 'text-on-primary', 'shadow-sm');

      const rows = document.querySelectorAll('.tx-row');
      rows.forEach(row => {
        const rowType = row.getAttribute('data-tx-type');
        if (category === 'all' || rowType === category) {
          row.style.display = 'table-row';
        } else {
          row.style.display = 'none';
        }
      });
    }

    function printAuditRegister() {
      const toast = document.getElementById('register-toast');
      if (toast) {
        toast.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-2');
        toast.classList.add('opacity-100', 'translate-y-0');
        setTimeout(() => {
          toast.classList.add('opacity-0', 'pointer-events-none', 'translate-y-2');
          toast.classList.remove('opacity-100', 'translate-y-0');
        }, 3200);
      }
    }

    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
{/* Interactive script to highlight Transactions in Shell sidebar and power ledger drawers/filters */}

{/* Notification Toast for Terminal Actions */}
<div className="fixed bottom-6 right-6 z-50 transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-none flex items-center gap-3 px-space-lg py-3.5 rounded-xl bg-text-primary text-on-primary shadow-xl" id="register-toast">
<span className="material-symbols-outlined text-action-green text-[22px]">receipt_long</span>
<div>
<p className="font-small text-small font-semibold">Shift Register Generated</p>
<p className="font-caption text-caption text-surface-container-highest">Spooling 48 entries to Thermal Terminal Bay 01...</p>
</div>
<span className="px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-caption text-[11px] font-bold uppercase ml-2">ESC-POS</span>
</div>
{/* Breadcrumb & Top Bar Header Area */}
<div className="flex flex-col gap-4 mb-space-lg">
{/* Breadcrumb and live security hash */}
<div className="flex flex-wrap items-center justify-between gap-3">
<div className="flex items-center gap-2 font-caption text-caption text-text-secondary">
<span className="font-semibold text-primary uppercase tracking-wider">Desk 01 Operations</span>
<span className="">/</span>
<span className="text-text-primary font-medium">Historical Audit &amp; Cashier Ledger</span>
</div>
<div className="flex items-center gap-3">
<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container font-caption text-caption text-text-secondary">
<span className="material-symbols-outlined text-[16px] text-status-available">verified_user</span>
<span className="">Ledger Seal: <strong className="font-mono text-text-primary">#TX-AUD-9942</strong></span>
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
<span className="text-status-available font-semibold">Head Desk Validated</span>
</div>
</div>
</div>
{/* Title and Actions Row */}
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
<div>
<h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">Cashier Transactions Audit Ledger</h1>
<p className="font-body text-body text-text-secondary mt-0.5">Chronological immutable ledger of circulation checkouts, returns, penalty collections, and fee waivers processed at Terminal Bay 01.</p>
</div>
{/* Action Buttons */}
<div className="flex flex-wrap items-center gap-2.5">
{/* Date Range Filter Selector */}
<button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-small text-small transition-colors shadow-sm">
<span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
<span className="font-medium">Today: Monday, Oct 26, 2026</span>
<span className="material-symbols-outlined text-[16px] text-text-secondary">expand_more</span>
</button>
{/* Export CSV Button */}
<button className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-text-primary font-small text-small transition-colors shadow-sm" onClick={(e) => { (window as any).printAuditRegister?.(); }}>
<span className="material-symbols-outlined text-[18px] text-text-secondary">download</span>
<span className="">Export Audit CSV</span>
</button>
{/* Print Shift Register CTA */}
<button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-semibold transition-colors shadow-sm" onClick={(e) => { (window as any).printAuditRegister?.(); }}>
<span className="material-symbols-outlined text-[18px]">print</span>
<span className="">Print Shift Receipt Register</span>
</button>
</div>
</div>
</div>
{/* Metric Summary Bento Grid (4 Cards) */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-lg">
{/* Card 1: Total Shift Volume */}
<div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between">
<div className="flex items-start justify-between">
<div>
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">Total Shift Volume</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-headline-3 text-headline-3 font-bold text-text-primary">48</span>
<span className="font-caption text-caption font-semibold text-status-available">Transactions</span>
</div>
</div>
<div className="w-10 h-10 rounded-xl bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[22px]">swap_horizontal_circle</span>
</div>
</div>
{/* Segment breakdown bars */}
<div className="mt-4 pt-3 bg-surface-container-low rounded-xl p-2.5 flex items-center justify-between text-text-secondary font-caption text-caption">
<div className="flex flex-col">
<span className="text-text-primary font-bold">22</span>
<span className="">Loans</span>
</div>
<span className="w-px h-6 bg-surface-container-high"></span>
<div className="flex flex-col">
<span className="text-text-primary font-bold">19</span>
<span className="">Returns</span>
</div>
<span className="w-px h-6 bg-surface-container-high"></span>
<div className="flex flex-col">
<span className="text-text-primary font-bold">7</span>
<span className="">Settlements</span>
</div>
</div>
</div>
{/* Card 2: Gross Collections */}
<div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between">
<div className="flex items-start justify-between">
<div>
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">Gross Collections</span>
<div className="flex items-baseline gap-1 mt-1">
<span className="font-headline-3 text-headline-3 font-bold text-text-primary tracking-tight">₱1,730.00</span>
</div>
</div>
<div className="w-10 h-10 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
<span className="material-symbols-outlined text-[22px]">payments</span>
</div>
</div>
{/* Collections Breakdown Sparkline / Metric representation */}
<div className="mt-4 pt-3 bg-surface-container-low rounded-xl p-2.5 flex items-center justify-between font-caption text-caption">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
<span className="text-text-secondary">Cash: <strong className="text-text-primary font-mono font-medium">₱1,150.00</strong></span>
</div>
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-action-green"></span>
<span className="text-text-secondary">QR: <strong className="text-text-primary font-mono font-medium">₱580.00</strong></span>
</div>
</div>
</div>
{/* Card 3: Fees Waived / Courtesy */}
<div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between">
<div className="flex items-start justify-between">
<div>
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">Fees Waived / Courtesy</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-headline-3 text-headline-3 font-bold text-text-primary">₱60.00</span>
<span className="font-caption text-caption text-status-pending font-medium">2 Waivers</span>
</div>
</div>
<div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-status-pending">
<span className="material-symbols-outlined text-[22px]">handshake</span>
</div>
</div>
<div className="mt-4 pt-3 bg-surface-container-low rounded-xl p-2.5 flex items-center justify-between text-text-secondary font-caption text-caption">
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px] text-text-secondary">admin_panel_settings</span>
<span className="truncate max-w-[170px]">Collegiate Academic Waivers</span>
</div>
<span className="px-2 py-0.5 rounded-full bg-surface-container text-text-primary font-semibold">Auth OK</span>
</div>
</div>
{/* Card 4: Audit Integrity */}
<div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between">
<div className="flex items-start justify-between">
<div>
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">Audit Integrity</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-headline-3 text-headline-3 font-bold text-status-available">100%</span>
<span className="font-caption text-caption text-text-secondary font-medium">In-Sync</span>
</div>
</div>
<div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-status-available">
<span className="material-symbols-outlined text-[22px]">lock</span>
</div>
</div>
{/* Sync micro status bar */}
<div className="mt-4 pt-3 bg-surface-container-low rounded-xl p-2.5 flex items-center justify-between font-caption text-caption">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-status-available animate-pulse"></span>
<span className="text-text-primary font-mono text-[11px]">SHA256: 9942..e0a</span>
</div>
<span className="text-status-available font-semibold">Bay 01 Sealed</span>
</div>
</div>
</div>
{/* Search, Filter Pills & Ledger Controls */}
<div className="flex flex-col gap-3 mb-space-md bg-surface-container-lowest p-space-md rounded-2xl shadow-sm">
{/* Search and Selector controls */}
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
<div className="relative flex-1">
<span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">search</span>
<input className="w-full h-11 pl-11 pr-4 rounded-xl bg-surface-container-low font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary shadow-none transition-all" placeholder="Search by Transaction ID (#TX-..), Student ID (#KP-..), title, or patron name..." type="text" />
</div>
<div className="flex items-center gap-2.5">
<div className="relative">
<select className="appearance-none h-11 pl-3.5 pr-9 rounded-xl bg-surface-container-low font-small text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
<option>All Payment Methods</option>
<option>Cash Drawer</option>
<option>Campus Pay Direct</option>
<option>GCash QR Gateway</option>
<option>Maya QR Gateway</option>
</select>
<span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary text-[18px] pointer-events-none">arrow_drop_down</span>
</div>
<button className="h-11 px-3.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-text-secondary hover:text-text-primary flex items-center gap-1.5 font-small text-small transition-colors">
<span className="material-symbols-outlined text-[18px]">tune</span>
<span className="">More Filters</span>
</button>
</div>
</div>
{/* Filter Pills Row */}
<div className="flex flex-wrap items-center gap-2 pt-1">
<button className="filter-pill px-3.5 py-1.5 rounded-full font-caption text-caption font-semibold bg-primary text-on-primary shadow-sm transition-all" onClick={(e) => { (window as any).filterTransactions?.(e.currentTarget, 'all'); }}>
        All (48)
      </button>
<button className="filter-pill px-3.5 py-1.5 rounded-full font-caption text-caption font-medium bg-chip-unselected-bg hover:bg-surface-container text-text-secondary hover:text-text-primary transition-all" onClick={(e) => { (window as any).filterTransactions?.(e.currentTarget, 'checkout'); }}>
        Checkouts (22)
      </button>
<button className="filter-pill px-3.5 py-1.5 rounded-full font-caption text-caption font-medium bg-chip-unselected-bg hover:bg-surface-container text-text-secondary hover:text-text-primary transition-all" onClick={(e) => { (window as any).filterTransactions?.(e.currentTarget, 'return'); }}>
        Returns (19)
      </button>
<button className="filter-pill px-3.5 py-1.5 rounded-full font-caption text-caption font-medium bg-chip-unselected-bg hover:bg-surface-container text-text-secondary hover:text-text-primary transition-all" onClick={(e) => { (window as any).filterTransactions?.(e.currentTarget, 'fine'); }}>
        Fine Settlements (5)
      </button>
<button className="filter-pill px-3.5 py-1.5 rounded-full font-caption text-caption font-medium bg-chip-unselected-bg hover:bg-surface-container text-text-secondary hover:text-text-primary transition-all" onClick={(e) => { (window as any).filterTransactions?.(e.currentTarget, 'waiver'); }}>
        Fee Waivers (2)
      </button>
<button className="filter-pill px-3.5 py-1.5 rounded-full font-caption text-caption font-medium bg-chip-unselected-bg hover:bg-surface-container text-text-secondary hover:text-text-primary transition-all" onClick={(e) => { (window as any).filterTransactions?.(e.currentTarget, 'damage'); }}>
        Lost/Damaged Fees (0)
      </button>
</div>
</div>
{/* Main Ledger Layout: Two Column Split (Table + Selected Record Detail Drawer) */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
{/* Ledger Table Container (8 Columns on desktop) */}
<div className="lg:col-span-8 flex flex-col bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden">
<div className="px-space-md py-3.5 bg-surface-container-low flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-[18px] text-primary">receipt_long</span>
<span className="font-small text-small font-semibold text-text-primary">Ledger Stream • Bay 01</span>
<span className="px-2 py-0.5 rounded-full bg-surface-container-high text-text-secondary font-caption text-[11px]">Real-Time Feed</span>
</div>
<span className="font-caption text-caption text-text-secondary">Showing 5 of 48 operations</span>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left font-small text-small">
<thead>
<tr className="bg-surface-container text-text-secondary font-caption text-caption uppercase tracking-wider select-none">
<th className="py-3 px-4 font-semibold">Transaction ID</th>
<th className="py-3 px-4 font-semibold">Time / Shift</th>
<th className="py-3 px-4 font-semibold">Type</th>
<th className="py-3 px-4 font-semibold">Patron Details</th>
<th className="py-3 px-4 font-semibold">Book / Volume</th>
<th className="py-3 px-4 font-semibold text-right">Amount</th>
<th className="py-3 px-4 font-semibold">Payment / Status</th>
<th className="py-3 px-4 font-semibold text-center">Receipt</th>
</tr>
</thead>
<tbody className="divide-y-0">
{/* Row 1: Maria Santos (Checkout / Loan) */}
<tr className="tx-row hover:bg-surface-container-low cursor-pointer transition-colors group" data-tx-type="checkout" onClick={(e) => { (window as any).selectTransaction?.('#TX-20261026-088', 'Maria Santos', 'Faculty Member', '#KP-77210', 'Introduction to Algorithms (4th Ed.)', 'Checkout / Loan', 'bg-soft-blue', 'text-primary', 'Completed', 'Faculty Borrowing Quota: 10 items (No Daily Accrual)', '₱0.00', 'Institutional Quota', 'AUTH-FAC-2026', '09:38 AM • Morning Shift'); }}>
<td className="py-3.5 px-4">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-text-secondary text-[16px] group-hover:text-primary transition-colors">description</span>
<span className="font-mono font-semibold text-text-primary">#TX-088</span>
</div>
</td>
<td className="py-3.5 px-4 whitespace-nowrap">
<p className="font-medium text-text-primary">09:38 AM</p>
<p className="font-caption text-caption text-text-secondary">Morning Shift</p>
</td>
<td className="py-3.5 px-4 whitespace-nowrap">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-soft-blue text-primary font-caption text-caption font-semibold">
<span className="material-symbols-outlined text-[13px]">menu_book</span> Loan
                </span>
</td>
<td className="py-3.5 px-4">
<p className="font-semibold text-text-primary">Maria Santos</p>
<p className="font-caption text-caption text-text-secondary font-mono">#KP-77210 • Faculty</p>
</td>
<td className="py-3.5 px-4 max-w-[200px]">
<p className="font-medium text-text-primary truncate">Introduction to Algorithms</p>
<p className="font-caption text-caption text-text-secondary">4th Ed. • Barcode: 10928374</p>
</td>
<td className="py-3.5 px-4 text-right whitespace-nowrap">
<p className="font-mono font-semibold text-text-primary">₱0.00</p>
<p className="font-caption text-caption text-text-secondary">Standard</p>
</td>
<td className="py-3.5 px-4 whitespace-nowrap">
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container text-text-primary font-caption text-caption font-medium">
                  Faculty Quota
                </span>
</td>
<td className="py-3.5 px-4 text-center whitespace-nowrap">
<button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-caption text-caption font-semibold transition-colors" onClick={(e) => { e.stopPropagation(); (window as any).printAuditRegister?.(); }}>
<span className="material-symbols-outlined text-[14px]">receipt</span> #REC-9041
                </button>
</td>
</tr>
{/* Row 2: Javier Santos (Fine Settlement - Active Row in mockup) */}
<tr className="tx-row bg-secondary-container/20 hover:bg-secondary-container/30 cursor-pointer transition-colors group" data-tx-type="fine" onClick={(e) => { (window as any).selectTransaction?.('#TX-20261026-087', 'Javier Santos', 'Undergraduate Student', '#KP-66120', 'Artificial Intelligence: A Modern Approach (4th Ed.)', 'Fine Settlement', 'bg-soft-blue', 'text-primary', 'Settled &amp; Cleared', 'Overdue: 3 Chargeable Days @ ₱15.00/day', '₱45.00', 'GCash QR Gateway', '#GC-9921-X481', '09:25 AM • Morning Shift'); }}>
<td className="py-3.5 px-4">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[16px]">task_alt</span>
<span className="font-mono font-bold text-primary">#TX-087</span>
</div>
</td>
<td className="py-3.5 px-4 whitespace-nowrap">
<p className="font-medium text-text-primary">09:25 AM</p>
<p className="font-caption text-caption text-text-secondary">Morning Shift</p>
</td>
<td className="py-3.5 px-4 whitespace-nowrap">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-status-pending font-caption text-caption font-semibold">
<span className="material-symbols-outlined text-[13px]">payments</span> Fine Paid
                </span>
</td>
<td className="py-3.5 px-4">
<p className="font-semibold text-text-primary">Javier Santos</p>
<p className="font-caption text-caption text-text-secondary font-mono">#KP-66120 • Student</p>
</td>
<td className="py-3.5 px-4 max-w-[200px]">
<p className="font-medium text-text-primary truncate">Artificial Intelligence (4th Ed.)</p>
<p className="font-caption text-caption text-status-danger">3d Overdue • Barcode: 88291044</p>
</td>
<td className="py-3.5 px-4 text-right whitespace-nowrap">
<p className="font-mono font-bold text-text-primary">₱45.00</p>
<p className="font-caption text-caption text-status-available font-medium">Full Settle</p>
</td>
<td className="py-3.5 px-4 whitespace-nowrap">
<div className="flex items-center gap-1 text-text-primary font-caption text-caption">
<span className="material-symbols-outlined text-[14px] text-primary">qr_code_scanner</span>
<span className="font-mono">GCash QR</span>
</div>
</td>
<td className="py-3.5 px-4 text-center whitespace-nowrap">
<button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-action-green text-text-primary font-caption text-caption font-bold transition-colors shadow-sm" onClick={(e) => { e.stopPropagation(); (window as any).printAuditRegister?.(); }}>
<span className="material-symbols-outlined text-[14px]">receipt</span> #REC-9040
                </button>
</td>
</tr>
{/* Row 3: Sofia Morales (Return & Check-in) */}
<tr className="tx-row hover:bg-surface-container-low cursor-pointer transition-colors group" data-tx-type="return" onClick={(e) => { (window as any).selectTransaction?.('#TX-20261026-086', 'Sofia Morales', 'Undergraduate Student', '#KP-77401', 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Return &amp; Check-in', 'bg-secondary-container', 'text-on-secondary-container', 'Shelved &amp; Inspected', 'On-Time Circulation Return. Book condition: Pristine.', '₱0.00', 'No Fee Required', 'SYSTEM-RETURN-AUTO', '09:12 AM • Morning Shift'); }}>
<td className="py-3.5 px-4">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-text-secondary text-[16px] group-hover:text-primary transition-colors">description</span>
<span className="font-mono font-semibold text-text-primary">#TX-086</span>
</div>
</td>
<td className="py-3.5 px-4 whitespace-nowrap">
<p className="font-medium text-text-primary">09:12 AM</p>
<p className="font-caption text-caption text-text-secondary">Morning Shift</p>
</td>
<td className="py-3.5 px-4 whitespace-nowrap">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-text-primary font-caption text-caption font-semibold">
<span className="material-symbols-outlined text-[13px]">undo</span> Return
                </span>
</td>
<td className="py-3.5 px-4">
<p className="font-semibold text-text-primary">Sofia Morales</p>
<p className="font-caption text-caption text-text-secondary font-mono">#KP-77401 • Student</p>
</td>
<td className="py-3.5 px-4 max-w-[200px]">
<p className="font-medium text-text-primary truncate">Clean Code: A Handbook</p>
<p className="font-caption text-caption text-status-available">On-Time Return</p>
</td>
<td className="py-3.5 px-4 text-right whitespace-nowrap">
<p className="font-mono font-semibold text-text-primary">₱0.00</p>
<p className="font-caption text-caption text-text-secondary">No Penalty</p>
</td>
<td className="py-3.5 px-4 whitespace-nowrap">
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-caption">
                  Regular Shelving
                </span>
</td>
<td className="py-3.5 px-4 text-center whitespace-nowrap">
<button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-secondary font-caption text-caption font-medium transition-colors" onClick={() => { try { ; } catch (err) { console.error(err); } }}>
<span className="material-symbols-outlined text-[14px]">visibility</span> Log
                </button>
</td>
</tr>
{/* Row 4: Beatriz Reyes (Fine Settlement - Cash) */}
<tr className="tx-row hover:bg-surface-container-low cursor-pointer transition-colors group" data-tx-type="fine" onClick={(e) => { (window as any).selectTransaction?.('#TX-20261026-085', 'Beatriz Reyes', 'Undergraduate Student', '#KP-91404', 'Structure and Interpretation of Computer Programs', 'Fine Settlement', 'bg-soft-blue', 'text-primary', 'Settled &amp; Cleared', 'Overdue: 9 Chargeable Days @ ₱15.00/day = ₱135.00', '₱135.00', 'Cash Drawer Bay 01', 'CASH-DRAWER-REC-9039', '08:50 AM • Morning Shift'); }}>
<td className="py-3.5 px-4">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-text-secondary text-[16px] group-hover:text-primary transition-colors">description</span>
<span className="font-mono font-semibold text-text-primary">#TX-085</span>
</div>
</td>
<td className="py-3.5 px-4 whitespace-nowrap">
<p className="font-medium text-text-primary">08:50 AM</p>
<p className="font-caption text-caption text-text-secondary">Morning Shift</p>
</td>
<td className="py-3.5 px-4 whitespace-nowrap">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-status-pending font-caption text-caption font-semibold">
<span className="material-symbols-outlined text-[13px]">payments</span> Fine Paid
                </span>
</td>
<td className="py-3.5 px-4">
<p className="font-semibold text-text-primary">Beatriz Reyes</p>
<p className="font-caption text-caption text-text-secondary font-mono">#KP-91404 • Student</p>
</td>
<td className="py-3.5 px-4 max-w-[200px]">
<p className="font-medium text-text-primary truncate">Structure &amp; Interpretation</p>
<p className="font-caption text-caption text-status-danger">9d Overdue • Accrued: ₱135</p>
</td>
<td className="py-3.5 px-4 text-right whitespace-nowrap">
<p className="font-mono font-bold text-text-primary">₱135.00</p>
<p className="font-caption text-caption text-status-available font-medium">Cash Paid</p>
</td>
<td className="py-3.5 px-4 whitespace-nowrap">
<div className="flex items-center gap-1 text-text-primary font-caption text-caption">
<span className="material-symbols-outlined text-[14px] text-text-secondary">point_of_sale</span>
<span className="font-mono">Cash Drawer</span>
</div>
</td>
<td className="py-3.5 px-4 text-center whitespace-nowrap">
<button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-caption text-caption font-semibold transition-colors" onClick={(e) => { e.stopPropagation(); (window as any).printAuditRegister?.(); }}>
<span className="material-symbols-outlined text-[14px]">receipt</span> #REC-9039
                </button>
</td>
</tr>
{/* Row 5: Althea Gomez (Fee Waiver) */}
<tr className="tx-row hover:bg-surface-container-low cursor-pointer transition-colors group" data-tx-type="waiver" onClick={(e) => { (window as any).selectTransaction?.('#TX-20261026-084', 'Althea Gomez', 'Undergraduate Student', '#KP-55319', 'Philippine Cartography (1320-1898) - Special Collection', 'Fee Waiver', 'bg-surface-container-high', 'text-status-pending', 'Waiver Approved', 'Collegiate Council Courtesy Waiver. 1 Overdue day waived (₱15.00)', '₱15.00 Waived', 'Admin Override PIN #4092', 'AUTH-WAIVER-COUNCIL', '08:35 AM • Morning Shift'); }}>
<td className="py-3.5 px-4">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-text-secondary text-[16px] group-hover:text-primary transition-colors">description</span>
<span className="font-mono font-semibold text-text-primary">#TX-084</span>
</div>
</td>
<td className="py-3.5 px-4 whitespace-nowrap">
<p className="font-medium text-text-primary">08:35 AM</p>
<p className="font-caption text-caption text-text-secondary">Morning Shift</p>
</td>
<td className="py-3.5 px-4 whitespace-nowrap">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-status-pending font-caption text-caption font-semibold">
<span className="material-symbols-outlined text-[13px]">verified</span> Fee Waiver
                </span>
</td>
<td className="py-3.5 px-4">
<p className="font-semibold text-text-primary">Althea Gomez</p>
<p className="font-caption text-caption text-text-secondary font-mono">#KP-55319 • Student</p>
</td>
<td className="py-3.5 px-4 max-w-[200px]">
<p className="font-medium text-text-primary truncate">Philippine Cartography</p>
<p className="font-caption text-caption text-text-secondary">Special Archival • 1320-1898</p>
</td>
<td className="py-3.5 px-4 text-right whitespace-nowrap">
<p className="font-mono font-medium text-status-pending line-through">₱15.00</p>
<p className="font-caption text-caption text-status-pending font-semibold">₱0.00 Due</p>
</td>
<td className="py-3.5 px-4 whitespace-nowrap">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-caption">
<span className="material-symbols-outlined text-[12px]">key</span> PIN Override
                </span>
</td>
<td className="py-3.5 px-4 text-center whitespace-nowrap">
<button className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-secondary font-caption text-caption font-medium transition-colors" onClick={() => { try { ; } catch (err) { console.error(err); } }}>
<span className="material-symbols-outlined text-[14px]">fact_check</span> Audit Memo
                </button>
</td>
</tr>
</tbody>
</table>
</div>
{/* Table Footer / Pagination controls */}
<div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-3 font-caption text-caption text-text-secondary">
<div className="flex items-center gap-2">
<span className="">Terminal Bay 01 • Active Cashier: <strong>Elena Vance</strong></span>
<span className="">•</span>
<span className="">Hardware Printer: Ready</span>
</div>
<div className="flex items-center gap-1">
<button className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-text-secondary hover:bg-surface-container disabled={true}:opacity-40" disabled={true}>
<span className="material-symbols-outlined text-[18px]">chevron_left</span>
</button>
<span className="px-3 py-1 font-semibold text-text-primary">Page 1 of 5</span>
<button className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-text-secondary hover:bg-surface-container">
<span className="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
</div>
</div>
</div>
{/* Side Panel / Drawer: Selected Transaction Detail (#TX-20261026-087) (4 Columns on desktop) */}
<div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-4 sticky top-20 transition-all" id="audit-detail-drawer">
{/* Drawer Header */}
<div className="flex items-start justify-between pb-3 border-b-0">
<div>
<div className="flex items-center gap-2">
<span className="font-caption text-caption font-semibold text-primary uppercase tracking-wider">Audit Inspection</span>
<span className="px-2.5 py-1 rounded-full font-caption text-caption font-semibold inline-flex items-center gap-1 bg-soft-blue text-primary" id="drawer-status-badge">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Settled &amp; Cleared
            </span>
</div>
<h2 className="font-headline-3 text-headline-3 font-bold font-mono text-text-primary mt-1" id="drawer-tx-id">#TX-20261026-087</h2>
<p className="font-caption text-caption text-text-secondary" id="drawer-timestamp">09:25 AM • Morning Shift (Bay 01)</p>
</div>
<div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-text-secondary">
<span className="material-symbols-outlined text-[20px]">verified</span>
</div>
</div>
{/* Patron Card Profile Snapshot */}
<div className="bg-surface-container-low rounded-xl p-space-md flex items-center gap-3">
<div className="w-11 h-11 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold font-small text-small">
          JS
        </div>
<div className="flex-1 min-w-0">
<div className="flex items-center justify-between">
<h3 className="font-small text-small font-bold text-text-primary truncate" id="drawer-patron-name">Javier Santos</h3>
<span className="px-2 py-0.5 rounded-full bg-surface-container-lowest text-text-secondary font-caption text-[11px] font-semibold">Active</span>
</div>
<p className="font-caption text-caption text-text-secondary font-mono" id="drawer-patron-meta">#KP-66120 • Undergraduate Student</p>
</div>
</div>
{/* Book Item Breakdown */}
<div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-2">
<div className="flex items-center gap-2 text-text-secondary font-caption text-caption">
<span className="material-symbols-outlined text-[16px] text-primary">book</span>
<span className="uppercase tracking-wider font-semibold">Circulation Item</span>
</div>
<p className="font-small text-small font-semibold text-text-primary leading-snug" id="drawer-book-title">Artificial Intelligence: A Modern Approach (4th Ed.)</p>
<div className="flex items-center justify-between font-caption text-caption text-text-secondary pt-1">
<span className="">Barcode: <strong className="text-text-primary font-mono font-medium">88291044</strong></span>
<span className="">Accession: #AI-0941</span>
</div>
</div>
{/* Overdue / Fee Accrual Breakdown Section */}
<div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-2.5">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider font-semibold text-text-secondary">Fee Breakdown &amp; Tariff</span>
<span className="px-2 py-0.5 rounded bg-surface-container font-caption text-[11px] font-mono text-text-primary font-semibold">TAR-2026-B</span>
</div>
<div className="flex items-center justify-between font-small text-small text-text-secondary pt-1">
<span id="drawer-fee-breakdown" className="">Overdue 3 Chargeable Days @ ₱15.00/day</span>
<span className="font-mono text-text-primary font-medium">₱45.00</span>
</div>
<div className="flex items-center justify-between font-caption text-caption text-text-secondary">
<span className="">Processing &amp; Late Stamp Surcharge</span>
<span className="font-mono text-status-available font-semibold">₱0.00 (Waived)</span>
</div>
<div className="pt-2 flex items-center justify-between font-body-large text-body-large font-bold text-text-primary">
<span className="">Total Settled</span>
<span className="font-mono text-primary" id="drawer-total-amount">₱45.00</span>
</div>
</div>
{/* Payment & Operational Context */}
<div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-2 font-caption text-caption">
<div className="flex items-center justify-between text-text-secondary">
<span className="">Payment Channel</span>
<span className="font-medium text-text-primary font-mono" id="drawer-payment-method">GCash QR Gateway</span>
</div>
<div className="flex items-center justify-between text-text-secondary">
<span className="">External Reference</span>
<span className="font-medium text-text-primary font-mono" id="drawer-payment-ref">#GC-9921-X481</span>
</div>
<div className="flex items-center justify-between text-text-secondary">
<span className="">Station Operator</span>
<span className="font-medium text-text-primary">Elena Vance • Terminal Bay 01</span>
</div>
<div className="flex items-center justify-between text-text-secondary">
<span className="">Fiscal Audit Seal</span>
<span className="font-medium text-status-available font-mono">SHA-256 Validated</span>
</div>
</div>
{/* Action CTAs */}
<div className="flex flex-col gap-2 pt-2">
<button className="w-full h-11 px-4 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-bold transition-all shadow-sm flex items-center justify-center gap-2" onClick={(e) => { (window as any).printAuditRegister?.(); }}>
<span className="material-symbols-outlined text-[18px]">print</span>
<span className="">Re-Print Receipt Slip</span>
</button>
<button className="w-full h-11 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-small text-small font-semibold transition-colors flex items-center justify-center gap-2">
<span className="material-symbols-outlined text-[18px]">account_box</span>
<span className="">View Patron Circulation Record</span>
</button>
</div>
{/* Disclaimer info note */}
<div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-low text-text-secondary font-caption text-caption">
<span className="material-symbols-outlined text-[16px] text-text-secondary">info</span>
<span className="">Receipt slip logs are archived for 365 fiscal days in compliance with university audit policy.</span>
</div>
</div>
</div>
</div>
    </div>
  );
};

export default Transactions;
