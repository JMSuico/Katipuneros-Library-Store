// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// OverdueFines.tsx -- Cashier Overdue Loans and Penalties Ledger
// Converted directly from SidebarOverdueandFinesPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const OverdueFines: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
// Tab switching interaction
    const tabs = document.querySelectorAll('#ledger-tabs button');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.className = 'px-4 py-2 rounded-xl bg-chip-unselected-bg hover:bg-surface-container text-text-secondary font-caption text-caption font-medium transition-colors flex items-center gap-1.5';
        });
        tab.className = 'px-4 py-2 rounded-xl bg-primary text-on-primary font-caption text-caption font-semibold shadow-sm transition-colors flex items-center gap-1.5';
      });
    });

    // Interactive target selector function for row selection
    (window as any).selectPatronForSettlement = function(name, id, title, callNum, due, elapsed, grace, billable, amount) {
      document.getElementById('drawer-patron-name').innerText = name;
      document.getElementById('drawer-patron-id').innerText = id;
      document.getElementById('drawer-book-title').innerText = title;
      document.getElementById('drawer-book-call').innerText = callNum;
      
      const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('');
      document.getElementById('drawer-avatar').innerText = initials;

      document.getElementById('calc-days-elapsed').innerText = elapsed + ' calendar days';
      document.getElementById('calc-grace').innerText = '-' + grace + ' day (Free Non-Billable)';
      document.getElementById('calc-billable-span').innerText = billable + ' billable days';
      document.getElementById('calc-total-amount').innerText = '₱' + amount.toFixed(2);
      document.getElementById('collect-btn-label').innerText = 'Collect & Print Receipt: ₱' + amount.toFixed(2);

      // Flash target box
      const targetCard = document.getElementById('calc-total-amount');
      targetCard.classList.add('scale-110');
      setTimeout(() => targetCard.classList.remove('scale-110'), 200);
    };

    // Cash drawer interaction feedback
    const drawerBtn = document.getElementById('open-drawer-btn');
    if (drawerBtn) {
      drawerBtn.addEventListener('click', () => {
        const originalHtml = drawerBtn.innerHTML;
        drawerBtn.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-spin">sync</span><span>Kicking Drawer...</span>';
        setTimeout(() => {
          drawerBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">check_circle</span><span>Drawer Open</span>';
          setTimeout(() => {
            drawerBtn.innerHTML = originalHtml;
          }, 2000);
        }, 600);
      });
    }

    // Collect payment interactive trigger
    const collectBtn = document.getElementById('collect-fine-btn');
    if (collectBtn) {
      collectBtn.addEventListener('click', () => {
        const originalText = collectBtn.innerHTML;
        collectBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">check_circle</span><span>Receipt #OR-8924 Printed</span>';
        collectBtn.classList.remove('bg-action-green', 'hover:bg-action-green-hover');
        collectBtn.classList.add('bg-status-available', 'text-on-primary');
        setTimeout(() => {
          collectBtn.innerHTML = originalText;
          collectBtn.classList.remove('bg-status-available', 'text-on-primary');
          collectBtn.classList.add('bg-action-green', 'hover:bg-action-green-hover');
        }, 2500);
      });
    }

    // Dispatch Notice trigger
    const noticeBtn = document.getElementById('dispatch-notice-btn');
    if (noticeBtn) {
      noticeBtn.addEventListener('click', () => {
        noticeBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">done_all</span><span>Notice Dispatched</span>';
        setTimeout(() => {
          noticeBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">send</span><span>Dispatch Immediate Notice</span>';
        }, 2000);
      });
    }

    // Filter table by live search
    const searchInput = document.getElementById('overdue-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#ledger-table-body tr');
        rows.forEach(row => {
          const text = row.innerText.toLowerCase();
          row.style.display = text.includes(query) ? '' : 'none';
        });
      });
    }

    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full pb-space-3xl">
{/* Top Operation Breadcrumb & Controls Banner */}
<div className="pt-space-md pb-space-lg">
<div className="flex flex-wrap items-center justify-between gap-space-md">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-2 font-caption text-caption uppercase tracking-wider text-text-secondary">
<span className="">DESK 01 OPERATIONS</span>
<span className="">/</span>
<span className="text-primary font-semibold">Circulation Recovery &amp; Fines Desk</span>
</div>
<h1 className="font-headline-2 text-headline-2 font-bold text-text-primary tracking-tight">
          Overdue Balances &amp; Fines Ledger
        </h1>
<p className="font-small text-small text-text-secondary max-w-2xl">
          Standard academic loan cycle: <span className="font-semibold text-text-primary">₱15.00/day</span> after 24-hr courtesy grace. Automated patron account freeze triggers on day 14 past due.
        </p>
</div>
<div className="flex flex-wrap items-center gap-space-sm">
<div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-lowest shadow-sm">
<span className="material-symbols-outlined text-primary text-[18px]">gavel</span>
<div className="flex flex-col">
<span className="font-caption text-[10px] text-text-secondary uppercase leading-none">Standard Rate</span>
<span className="font-small text-small font-bold text-text-primary">₱15.00 / day</span>
</div>
</div>
<div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-lowest shadow-sm">
<span className="material-symbols-outlined text-status-available text-[18px]">verified_user</span>
<div className="flex flex-col">
<span className="font-caption text-[10px] text-text-secondary uppercase leading-none">Courtesy Window</span>
<span className="font-small text-small font-bold text-text-primary">1-Day Free Grace</span>
</div>
</div>
<button className="h-11 px-space-md rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95" id="open-drawer-btn">
<span className="material-symbols-outlined text-[20px]">point_of_sale</span>
<span className="">Open Cash Drawer</span>
</button>
</div>
</div>
</div>
{/* KPI Ledger Metrics Bento Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-xl">
{/* KPI 1 */}
<div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-shadow">
<div className="flex items-start justify-between mb-space-sm">
<div className="w-10 h-10 rounded-xl bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[22px]">auto_stories</span>
</div>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-pending/20 text-text-primary font-caption text-caption font-semibold">
<span className="w-1.5 h-1.5 rounded-full bg-status-pending"></span>
          +3 Today
        </span>
</div>
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary font-medium">Active Overdue Loans</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-headline-3 text-headline-3 font-bold text-text-primary">18</span>
<span className="font-small text-small text-text-secondary">volumes delinquent</span>
</div>
<p className="font-caption text-caption text-text-secondary mt-2">Circulating across 14 university patrons</p>
</div>
<div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-primary/5 pointer-events-none"></div>
</div>
{/* KPI 2 */}
<div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-shadow">
<div className="flex items-start justify-between mb-space-sm">
<div className="w-10 h-10 rounded-xl bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
</div>
<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container font-caption text-caption font-medium text-text-secondary">
          Ledger Accrued
        </span>
</div>
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary font-medium">Pending Receivables</span>
<div className="flex items-baseline gap-1 mt-1">
<span className="font-headline-3 text-headline-3 font-bold text-text-primary">₱1,245.00</span>
</div>
<div className="flex items-center gap-1.5 mt-2 font-caption text-caption text-text-secondary">
<span className="font-semibold text-text-primary">83 days net</span>
<span className="">•</span>
<span className="">Chargeable Units</span>
</div>
</div>
<div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-status-pending/10 pointer-events-none"></div>
</div>
{/* KPI 3 */}
<div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-shadow">
<div className="flex items-start justify-between mb-space-sm">
<div className="w-10 h-10 rounded-xl bg-action-green/20 flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[22px]">payments</span>
</div>
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-available/20 text-text-primary font-caption text-caption font-semibold">
          64% Target
        </span>
</div>
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary font-medium">Collected Today (Desk 01)</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-headline-3 text-headline-3 font-bold text-text-primary">₱320.00</span>
<span className="font-caption text-caption text-text-secondary">/ ₱500 Goal</span>
</div>
<div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-2.5">
<div className="bg-primary h-full rounded-full" style={{ width: '64%' }}></div>
</div>
<p className="font-caption text-caption text-text-secondary mt-2">6 official desk receipts closed</p>
</div>
</div>
{/* KPI 4 */}
<div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-shadow">
<div className="flex items-start justify-between mb-space-sm">
<div className="w-10 h-10 rounded-xl bg-error-container flex items-center justify-center text-error">
<span className="material-symbols-outlined text-[22px]">lock_person</span>
</div>
<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-status-danger text-on-error font-caption text-caption font-bold">
          Urgent
        </span>
</div>
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary font-medium">Critical Holds (&gt;14D)</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-headline-3 text-headline-3 font-bold text-error">3</span>
<span className="font-small text-small text-text-secondary">cards frozen</span>
</div>
<p className="font-caption text-caption text-text-secondary mt-2">Borrowing revoked • Office referral</p>
</div>
</div>
</div>
{/* Main Ledger Workbench & Quick Actions Filter */}
<div className="flex flex-col gap-space-md mb-space-xl">
{/* Filter Bar */}
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md p-space-sm rounded-2xl bg-surface-container-lowest shadow-sm">
{/* Tabs */}
<div className="flex flex-wrap items-center gap-1.5" id="ledger-tabs">
<button className="px-4 py-2 rounded-xl bg-primary text-on-primary font-caption text-caption font-semibold shadow-sm transition-colors flex items-center gap-1.5" data-filter="all">
<span className="">All Overdue</span>
<span className="px-1.5 py-0.5 rounded-full bg-surface-container-lowest/30 text-on-primary text-[10px]">18</span>
</button>
<button className="px-4 py-2 rounded-xl bg-chip-unselected-bg hover:bg-surface-container text-text-secondary font-caption text-caption font-medium transition-colors flex items-center gap-1.5" data-filter="1-3">
<span className="">Due 1–3 Days Past</span>
<span className="px-1.5 py-0.5 rounded-full bg-surface-container-high text-text-primary text-[10px]">9</span>
</button>
<button className="px-4 py-2 rounded-xl bg-chip-unselected-bg hover:bg-surface-container text-text-secondary font-caption text-caption font-medium transition-colors flex items-center gap-1.5" data-filter="4-7">
<span className="">4–7 Days</span>
<span className="px-1.5 py-0.5 rounded-full bg-surface-container-high text-text-primary text-[10px]">5</span>
</button>
<button className="px-4 py-2 rounded-xl bg-chip-unselected-bg hover:bg-surface-container text-text-secondary font-caption text-caption font-medium transition-colors flex items-center gap-1.5" data-filter="critical">
<span className="">8+ Days Critical</span>
<span className="px-1.5 py-0.5 rounded-full bg-status-danger/20 text-status-danger text-[10px] font-bold">4</span>
</button>
<button className="px-4 py-2 rounded-xl bg-chip-unselected-bg hover:bg-surface-container text-text-secondary font-caption text-caption font-medium transition-colors flex items-center gap-1.5" data-filter="repeat">
<span className="">Repeated Delinquents</span>
<span className="px-1.5 py-0.5 rounded-full bg-status-pending/20 text-text-primary text-[10px] font-bold">2</span>
</button>
</div>
{/* Quick Search Bar */}
<div className="relative w-full lg:w-80">
<span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">search</span>
<input className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-container-low font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all" id="overdue-search-input" placeholder="Search Patron ID, Book title, Barcode..." type="text"/>
</div>
</div>
{/* Overdue Records Master Data Table */}
<div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider">
<th className="py-3.5 px-space-md">Patron / ID</th>
<th className="py-3.5 px-space-md">Borrowed Volume</th>
<th className="py-3.5 px-space-md">Due Date / Elapsed</th>
<th className="py-3.5 px-space-md">Grace &amp; Net Days</th>
<th className="py-3.5 px-space-md">Fine Accrued</th>
<th className="py-3.5 px-space-md">Standing</th>
<th className="py-3.5 px-space-md text-right">Quick Desk Action</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container font-small text-small" id="ledger-table-body">
{/* Row 1: Selected Gabriel Silang */}
<tr className="hover:bg-soft-blue/40 bg-soft-blue/20 transition-colors group cursor-pointer" onClick={(e) => { (window as any).selectPatronForSettlement?.('Gabriel Silang', '#2023-01892 • BA Hist', 'Noli Me Tangere (Centennial Annotated)', 'FIL 899.21 R53n 2021', 'Oct 20, 2026', 6, 1, 5, 75.00); }}>
<td className="py-4 px-space-md">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-[13px] shadow-sm">
                    GS
                  </div>
<div>
<div className="font-body-medium text-body-medium font-bold text-text-primary leading-tight">Gabriel Silang</div>
<div className="font-caption text-caption text-text-secondary">#2023-01892 • BA Hist</div>
</div>
</div>
</td>
<td className="py-4 px-space-md">
<div className="flex flex-col">
<span className="font-semibold text-text-primary leading-tight">Noli Me Tangere</span>
<span className="font-caption text-caption text-text-secondary">FIL 899.21 R53n 2021</span>
</div>
</td>
<td className="py-4 px-space-md">
<div className="flex flex-col">
<span className="font-semibold text-text-primary">Oct 20, 2026</span>
<span className="font-caption text-caption text-status-pending font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">schedule</span>
                    6 days past due
                  </span>
</div>
</td>
<td className="py-4 px-space-md">
<div className="flex flex-col font-caption text-caption">
<span className="text-status-available font-medium">1d Courtesy Grace</span>
<span className="font-bold text-text-primary">5 Chargeable Days</span>
</div>
</td>
<td className="py-4 px-space-md">
<div className="flex flex-col">
<span className="font-bold text-text-primary text-[15px]">₱75.00</span>
<span className="font-caption text-caption text-text-secondary">₱15.00/day net</span>
</div>
</td>
<td className="py-4 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-pending/20 text-text-primary font-caption text-caption font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-status-pending"></span>
                  Caution
                </span>
</td>
<td className="py-4 px-space-md text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="w-8 h-8 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-text-primary flex items-center justify-center transition-colors" title="Send Desk Notice">
<span className="material-symbols-outlined text-[18px]">outgoing_mail</span>
</button>
<button className="h-8 px-2.5 rounded-lg bg-action-green hover:bg-action-green-hover text-text-primary font-caption text-caption font-bold flex items-center gap-1 transition-colors" title="Settle Immediate Fine">
<span className="material-symbols-outlined text-[16px]">receipt</span>
<span className="">Settle</span>
</button>
</div>
</td>
</tr>
{/* Row 2: Sofia Del Rosario */}
<tr className="hover:bg-surface-container transition-colors cursor-pointer" onClick={(e) => { (window as any).selectPatronForSettlement?.('Sofia Del Rosario', '#2022-09411 • BS Chem', 'Principles of Modern Thermodynamics', 'QC 311.5 P75 2019', 'Oct 11, 2026', 15, 1, 14, 210.00); }}>
<td className="py-4 px-space-md">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full bg-error text-on-error flex items-center justify-center font-bold text-[13px] shadow-sm">
                    SR
                  </div>
<div>
<div className="font-body-medium text-body-medium font-bold text-text-primary leading-tight">Sofia Del Rosario</div>
<div className="font-caption text-caption text-text-secondary">#2022-09411 • BS Chem</div>
</div>
</div>
</td>
<td className="py-4 px-space-md">
<div className="flex flex-col">
<span className="font-semibold text-text-primary leading-tight">Principles of Modern Thermodynamics</span>
<span className="font-caption text-caption text-text-secondary">QC 311.5 P75 2019</span>
</div>
</td>
<td className="py-4 px-space-md">
<div className="flex flex-col">
<span className="font-semibold text-text-primary">Oct 11, 2026</span>
<span className="font-caption text-caption text-status-danger font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">error</span>
                    15 days past (Max)
                  </span>
</div>
</td>
<td className="py-4 px-space-md">
<div className="flex flex-col font-caption text-caption">
<span className="text-status-available font-medium">1d Courtesy Grace</span>
<span className="font-bold text-error">14 Chargeable Days</span>
</div>
</td>
<td className="py-4 px-space-md">
<div className="flex flex-col">
<span className="font-bold text-error text-[15px]">₱210.00</span>
<span className="font-caption text-caption text-error font-medium">Max Threshold Freeze</span>
</div>
</td>
<td className="py-4 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-danger text-on-error font-caption text-caption font-bold shadow-sm">
<span className="material-symbols-outlined text-[12px]">lock</span>
                  Blocked
                </span>
</td>
<td className="py-4 px-space-md text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="w-8 h-8 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-text-primary flex items-center justify-center transition-colors" title="Send Suspension Notice">
<span className="material-symbols-outlined text-[18px]">outgoing_mail</span>
</button>
<button className="h-8 px-2.5 rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-text-primary font-caption text-caption font-bold flex items-center gap-1 transition-colors" title="Record Settlement">
<span className="material-symbols-outlined text-[16px]">receipt</span>
<span className="">Settle</span>
</button>
</div>
</td>
</tr>
{/* Row 3: Marco Antonio Bautista */}
<tr className="hover:bg-surface-container transition-colors cursor-pointer" onClick={(e) => { (window as any).selectPatronForSettlement?.('Marco Antonio Bautista', '#2024-00318 • JD Law', 'Consti Law Philippines V.1', 'KPM 2095 B38 2024', 'Oct 24, 2026', 2, 1, 1, 15.00); }}>
<td className="py-4 px-space-md">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full bg-surface-container text-primary font-bold text-[13px] flex items-center justify-center">
                    MB
                  </div>
<div>
<div className="font-body-medium text-body-medium font-bold text-text-primary leading-tight">Marco Antonio Bautista</div>
<div className="font-caption text-caption text-text-secondary">#2024-00318 • JD Law</div>
</div>
</div>
</td>
<td className="py-4 px-space-md">
<div className="flex flex-col">
<span className="font-semibold text-text-primary leading-tight">Consti Law Philippines V.1</span>
<span className="font-caption text-caption text-text-secondary">KPM 2095 B38 2024</span>
</div>
</td>
<td className="py-4 px-space-md">
<div className="flex flex-col">
<span className="font-semibold text-text-primary">Oct 24, 2026</span>
<span className="font-caption text-caption text-text-secondary font-medium">2 days past due</span>
</div>
</td>
<td className="py-4 px-space-md">
<div className="flex flex-col font-caption text-caption">
<span className="text-status-available font-medium">1d Courtesy Grace</span>
<span className="font-semibold text-text-primary">1 Chargeable Day</span>
</div>
</td>
<td className="py-4 px-space-md">
<div className="flex flex-col">
<span className="font-bold text-text-primary text-[15px]">₱15.00</span>
<span className="font-caption text-caption text-text-secondary">Regular 1st tier</span>
</div>
</td>
<td className="py-4 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-soft-blue text-primary font-caption text-caption font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Active
                </span>
</td>
<td className="py-4 px-space-md text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="w-8 h-8 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-text-primary flex items-center justify-center transition-colors" title="Send SMS">
<span className="material-symbols-outlined text-[18px]">sms</span>
</button>
<button className="h-8 px-2.5 rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-text-primary font-caption text-caption font-bold flex items-center gap-1 transition-colors" title="Settle Fine">
<span className="material-symbols-outlined text-[16px]">receipt</span>
<span className="">Settle</span>
</button>
</div>
</td>
</tr>
{/* Row 4: Clara Mae Ilustre */}
<tr className="hover:bg-surface-container transition-colors cursor-pointer" onClick={(e) => { (window as any).selectPatronForSettlement?.('Clara Mae Ilustre', '#2021-04288 • MS Bio', 'Philippine Flora &amp; Forest', 'QK 368 I48 2020', 'Oct 18, 2026', 8, 1, 7, 105.00); }}>
<td className="py-4 px-space-md">
<div className="flex items-center gap-3">
<div className="w-9 h-9 rounded-full bg-status-pending/40 text-text-primary flex items-center justify-center font-bold text-[13px]">
                    CI
                  </div>
<div>
<div className="font-body-medium text-body-medium font-bold text-text-primary leading-tight">Clara Mae Ilustre</div>
<div className="font-caption text-caption text-text-secondary">#2021-04288 • MS Bio</div>
</div>
</div>
</td>
<td className="py-4 px-space-md">
<div className="flex flex-col">
<span className="font-semibold text-text-primary leading-tight">Philippine Flora &amp; Forest</span>
<span className="font-caption text-caption text-text-secondary">QK 368 I48 2020</span>
</div>
</td>
<td className="py-4 px-space-md">
<div className="flex flex-col">
<span className="font-semibold text-text-primary">Oct 18, 2026</span>
<span className="font-caption text-caption text-status-pending font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">warning</span>
                    8 days past due
                  </span>
</div>
</td>
<td className="py-4 px-space-md">
<div className="flex flex-col font-caption text-caption">
<span className="text-status-available font-medium">1d Courtesy Grace</span>
<span className="font-bold text-text-primary">7 Chargeable Days</span>
</div>
</td>
<td className="py-4 px-space-md">
<div className="flex flex-col">
<span className="font-bold text-text-primary text-[15px]">₱105.00</span>
<span className="font-caption text-caption text-status-pending font-medium">Repeat Flagged</span>
</div>
</td>
<td className="py-4 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-pending/30 text-text-primary font-caption text-caption font-bold">
<span className="material-symbols-outlined text-[12px]">flag</span>
                  Repeat (3x)
                </span>
</td>
<td className="py-4 px-space-md text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="w-8 h-8 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-text-primary flex items-center justify-center transition-colors" title="Dispatch Reminder">
<span className="material-symbols-outlined text-[18px]">outgoing_mail</span>
</button>
<button className="h-8 px-2.5 rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-text-primary font-caption text-caption font-bold flex items-center gap-1 transition-colors" title="Settle Immediate">
<span className="material-symbols-outlined text-[16px]">receipt</span>
<span className="">Settle</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
{/* Table Footer Indicator */}
<div className="flex flex-wrap items-center justify-between px-space-md py-3 bg-surface-container font-caption text-caption text-text-secondary">
<div className="flex items-center gap-2">
<span className="w-2 h-2 rounded-full bg-action-green"></span>
<span className="">Showing 4 urgent cashier-priority records out of 18 total delinquency ledger entries</span>
</div>
<div className="flex items-center gap-4">
<span className="">Sort: Due Date (Oldest First)</span>
<a className="font-semibold text-primary hover:underline" href="#">Export Daily Delinquency Sheet (CSV)</a>
</div>
</div>
</div>
</div>
{/* Bottom Interactive Section: Notice & Settlement Workbench Drawer */}
<div className="rounded-3xl bg-surface-container-lowest p-space-lg shadow-sm">
<div className="flex flex-col lg:flex-row gap-space-xl">
{/* Left Column: Patron Volume Identification & Visual Ledger Calculation */}
<div className="flex-1 flex flex-col justify-between">
<div>
<div className="flex items-center justify-between pb-space-sm mb-space-md">
<div className="flex items-center gap-2.5">
<span className="material-symbols-outlined text-primary text-[24px]">balance</span>
<div>
<h3 className="font-headline-4 text-headline-4 font-bold text-text-primary">Transparent Penalty Calculation</h3>
<p className="font-caption text-caption text-text-secondary">Official institutional accounting breakdown under Katipuneros Library Code § 14.2</p>
</div>
</div>
<span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-caption text-caption font-bold uppercase tracking-wider">
              Selected Target Record
            </span>
</div>
{/* Active Patron Summary Card */}
<div className="p-space-md rounded-2xl bg-surface-container-low flex flex-wrap items-center justify-between gap-space-md mb-space-md">
<div className="flex items-center gap-3.5">
<div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold font-headline-4">
<span className="" id="drawer-avatar">GS</span>
</div>
<div>
<div className="flex items-center gap-2">
<span className="font-body-large text-body-large font-bold text-text-primary" id="drawer-patron-name">Gabriel Silang</span>
<span className="px-2 py-0.5 rounded-full bg-status-pending/20 text-text-primary font-caption text-caption font-semibold">Undergrad</span>
</div>
<p className="font-caption text-caption text-text-secondary" id="drawer-patron-id">#2023-01892 • BA Hist • College of Social Sciences</p>
</div>
</div>
<div className="text-right">
<span className="font-caption text-caption text-text-secondary uppercase">Delinquent Title</span>
<p className="font-body-medium text-body-medium font-bold text-text-primary" id="drawer-book-title">Noli Me Tangere (Centennial Annotated)</p>
<p className="font-caption text-caption text-text-secondary" id="drawer-book-call">FIL 899.21 R53n 2021</p>
</div>
</div>
{/* Line-by-Line Breakdown Calculation */}
<div className="rounded-2xl bg-surface-container p-space-md flex flex-col gap-2.5 font-small text-small">
<div className="flex items-center justify-between text-text-secondary">
<span className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]">calendar_month</span>
<span className="">Total Days Elapsed Since Loan Expiry:</span>
</span>
<span className="font-bold text-text-primary" id="calc-days-elapsed">6 calendar days</span>
</div>
<div className="flex items-center justify-between text-status-available">
<span className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]">verified</span>
<span className="">Academic Courtesy Grace Policy:</span>
</span>
<span className="font-bold" id="calc-grace">-1 day (Free Non-Billable)</span>
</div>
<div className="flex items-center justify-between text-text-secondary">
<span className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]">calculate</span>
<span className="">Chargeable Overdue Span:</span>
</span>
<span className="font-bold text-text-primary" id="calc-billable-span">5 billable days</span>
</div>
<div className="flex items-center justify-between text-text-secondary">
<span className="flex items-center gap-2">
<span className="material-symbols-outlined text-[16px]">price_change</span>
<span className="">Regulated Daily Fine Rate:</span>
</span>
<span className="font-bold text-text-primary">₱15.00 / day</span>
</div>
<div className="pt-2 mt-1 flex items-center justify-between bg-surface-container-lowest p-3 rounded-xl shadow-xs">
<div className="flex flex-col">
<span className="font-caption text-caption uppercase text-text-secondary font-bold">Total Payable Balance</span>
<span className="font-caption text-[11px] text-text-secondary">Official Receipt will be validated on Bay 01</span>
</div>
<div className="text-right">
<span className="font-headline-3 text-headline-3 font-bold text-primary" id="calc-total-amount">₱75.00</span>
</div>
</div>
</div>
</div>
</div>
{/* Right Column: Multi-Channel Dispatch & Rapid Cashier Clearance */}
<div className="w-full lg:w-[420px] flex flex-col justify-between bg-surface-container-low p-space-md rounded-2xl">
<div className="flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<span className="font-body-medium text-body-medium font-bold text-text-primary">Notice Dispatch &amp; Settlement</span>
<span className="flex items-center gap-1 font-caption text-caption text-action-green-hover font-semibold">
<span className="w-2 h-2 rounded-full bg-action-green animate-pulse"></span>
              Printer Ready
            </span>
</div>
{/* Channel Selector */}
<div className="flex flex-col gap-1.5">
<label className="font-caption text-caption font-semibold text-text-secondary">Delivery Channels</label>
<div className="grid grid-cols-2 gap-2">
<label className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-lowest cursor-pointer shadow-xs hover:bg-surface-bright transition-colors">
<input defaultChecked className="w-4 h-4 rounded text-primary focus:ring-0" type="checkbox"/>
<span className="font-caption text-caption font-semibold text-text-primary">SMS Gateway</span>
</label>
<label className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-lowest cursor-pointer shadow-xs hover:bg-surface-bright transition-colors">
<input defaultChecked className="w-4 h-4 rounded text-primary focus:ring-0" type="checkbox"/>
<span className="font-caption text-caption font-semibold text-text-primary">Student Portal</span>
</label>
</div>
</div>
{/* Notice Template Selector */}
<div className="flex flex-col gap-1.5">
<label className="font-caption text-caption font-semibold text-text-secondary">Template Preset</label>
<select className="w-full h-10 px-3 rounded-xl bg-surface-container-lowest font-small text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary shadow-xs">
<option>1st Tier Reminder (Courteous Recall &amp; Paylink)</option>
<option>2nd Warning: Impending Account Restriction</option>
<option>Final Suspension Demand &amp; Bursar Referral</option>
</select>
</div>
{/* Quick Preview Box */}
<div className="p-3 rounded-xl bg-surface-container font-caption text-caption text-text-secondary leading-relaxed">
<span className="font-bold text-text-primary uppercase text-[10px] block mb-1">Live SMS Preview:</span>
            "KATIPUNEROS LIB: Dear Gabriel, your loan for 'Noli Me Tangere' is 6 days overdue. Accrued fine: ₱75.00. Please return to Bay 01 to avoid registration holds."
          </div>
</div>
{/* Action Command Buttons */}
<div className="flex flex-col gap-2.5 mt-space-md pt-space-md">
<button className="w-full h-11 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-body-medium text-body-medium font-semibold flex items-center justify-center gap-2 transition-all" id="dispatch-notice-btn">
<span className="material-symbols-outlined text-[18px]">send</span>
<span className="">Dispatch Immediate Notice</span>
</button>
<button className="w-full h-12 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-large text-body-large font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98" id="collect-fine-btn">
<span className="material-symbols-outlined text-[20px]">payments</span>
<span className="" id="collect-btn-label">Collect &amp; Print Receipt: ₱75.00</span>
</button>
<div className="flex items-center justify-center gap-2 font-caption text-caption text-text-secondary">
<span className="material-symbols-outlined text-[14px]">lock</span>
<span className="">PCI-DSS compliant desk audit trail generated instantly</span>
</div>
</div>
</div>
</div>
</div>
{/* Client-side Interactive Behaviors */}

</div>
    </div>
  );
};

export default OverdueFines;
