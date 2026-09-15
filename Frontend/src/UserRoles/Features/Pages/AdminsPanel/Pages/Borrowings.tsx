// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// Borrowings.tsx -- Admin Borrowing Circulation Ledger
// Converted directly from SidebarBorrowingsPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const Borrowings: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
(function() {
    // Interactive Tab Filtering
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        tabs.forEach(t => {
          t.classList.remove('bg-primary', 'text-on-primary', 'font-bold', 'shadow-sm');
          t.classList.add('bg-surface-container', 'text-text-secondary', 'font-semibold');
        });
        this.classList.remove('bg-surface-container', 'text-text-secondary', 'font-semibold');
        this.classList.add('bg-primary', 'text-on-primary', 'font-bold', 'shadow-sm');
      });
    });

    // Quick Action Extension Modal Triggering
    const modal = document.getElementById('renewalModal');
    const closeBtn = document.getElementById('btnCloseRenewalModal');
    const cancelBtn = document.getElementById('btnCancelRenewalModal');
    const confirmBtn = document.getElementById('btnConfirmRenewal');
    const actionButtons = document.querySelectorAll('.btn-action');

    actionButtons.forEach(btn => {
      btn.addEventListener('click', function(e) {
        if (this.innerText.includes('Extend') || this.innerText.includes('Renew')) {
          modal.classList.remove('hidden');
        }
      });
    });

    function closeModal() {
      modal.classList.add('hidden');
    }

    if(closeBtn) closeBtn.addEventListener('click', closeModal);
    if(cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if(confirmBtn) {
      confirmBtn.addEventListener('click', function() {
        alert('Extension granted successfully. Circulation records updated.');
        closeModal();
      });
    }

    // Interactive Search filtering dummy feedback
    const searchInput = document.getElementById('circulationSearch');
    if (searchInput) {
      searchInput.addEventListener('keyup', function(e) {
        const val = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('tbody tr');
        rows.forEach(row => {
          const text = row.innerText.toLowerCase();
          row.style.display = text.includes(val) ? '' : 'none';
        });
      });
    }
  })();

    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full gap-space-lg">
{/* Top Command & Action Bar */}
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-2">
<span className="font-caption text-caption text-secondary font-semibold uppercase tracking-wider">Circulation Desk</span>
<span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
<span className="font-caption text-caption text-text-secondary">Terminal Node #04 • Main Reserve Collection</span>
</div>
<h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">Active Circulation Loans &amp; Lending Lifecycle</h1>
</div>
<div className="flex flex-wrap items-center gap-space-sm">
<button className="flex items-center gap-space-xs px-space-md h-11 bg-surface-container-lowest text-text-primary rounded-xl font-small text-small font-medium shadow-sm hover:bg-surface-container transition-all" type="button">
<span className="material-symbols-outlined text-[18px] text-secondary">file_download</span>
<span className="">Export Loan Ledger</span>
</button>
<button className="flex items-center gap-space-xs px-space-md h-11 bg-surface-container text-text-primary rounded-xl font-small text-small font-medium hover:bg-surface-variant transition-all" id="btnOpenPolicy" type="button">
<span className="material-symbols-outlined text-[18px] text-primary">policy</span>
<span className="">Lending Rules</span>
</button>
<button className="flex items-center gap-space-xs px-space-md h-11 bg-action-green text-text-primary rounded-xl font-small text-small font-bold hover:bg-action-green-hover transition-all shadow-sm" id="btnOpenOverride" type="button">
<span className="material-symbols-outlined text-[20px]">add_circle</span>
<span className="">New Circulation Loan Override</span>
</button>
</div>
</div>
{/* KPI Bento Matrix */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
{/* KPI 1 */}
<div className="relative overflow-hidden bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-start justify-between">
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Total Active Borrowings</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-headline-1 text-headline-2 text-text-primary tracking-tight font-bold">1,384</span>
<span className="font-caption text-caption text-secondary font-medium">Loans</span>
</div>
</div>
<div className="w-10 h-10 rounded-xl bg-soft-blue text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">book_online</span>
</div>
</div>
<div className="flex items-center gap-2 mt-4 pt-3 bg-surface-container-low/50 -mx-space-md -mb-space-md px-space-md py-2">
<span className="font-caption text-caption text-status-available flex items-center font-bold">
<span className="material-symbols-outlined text-[16px]">trending_up</span> +3.4%
        </span>
<span className="font-caption text-caption text-text-secondary">vs. last calendar week</span>
</div>
</div>
{/* KPI 2 */}
<div className="relative overflow-hidden bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-start justify-between">
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Due Today / 48h Window</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-headline-1 text-headline-2 text-status-pending tracking-tight font-bold">42</span>
<span className="font-caption text-caption text-secondary font-medium">Volumes</span>
</div>
</div>
<div className="w-10 h-10 rounded-xl bg-surface-container text-status-pending flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">alarm</span>
</div>
</div>
<div className="flex items-center justify-between mt-4 pt-3 bg-surface-container-low/50 -mx-space-md -mb-space-md px-space-md py-2">
<span className="font-caption text-caption text-text-secondary">26 undergrad • 16 graduate</span>
<span className="font-caption text-caption text-primary font-semibold hover:underline cursor-pointer">Notify All</span>
</div>
</div>
{/* KPI 3 */}
<div className="relative overflow-hidden bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-start justify-between">
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Approaching Expiry</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-headline-1 text-headline-2 text-secondary tracking-tight font-bold">118</span>
<span className="font-caption text-caption text-secondary font-medium">Volumes</span>
</div>
</div>
<div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">hourglass_top</span>
</div>
</div>
<div className="flex items-center gap-2 mt-4 pt-3 bg-surface-container-low/50 -mx-space-md -mb-space-md px-space-md py-2">
<span className="w-2 h-2 rounded-full bg-secondary"></span>
<span className="font-caption text-caption text-text-secondary">Window: Next 3 to 7 working days</span>
</div>
</div>
{/* KPI 4 */}
<div className="relative overflow-hidden bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex items-start justify-between">
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Overdue Delinquencies</span>
<div className="flex items-baseline gap-2 mt-1">
<span className="font-headline-1 text-headline-2 text-status-danger tracking-tight font-bold">18</span>
<span className="font-caption text-caption text-secondary font-medium">Loans</span>
</div>
</div>
<div className="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">warning</span>
</div>
</div>
<div className="flex items-center justify-between mt-4 pt-3 bg-surface-container-low/50 -mx-space-md -mb-space-md px-space-md py-2">
<span className="font-caption text-caption text-status-danger font-semibold">₱2,450 cumulative fines</span>
<span className="font-caption text-caption text-primary font-semibold hover:underline cursor-pointer">Escalate</span>
</div>
</div>
</div>
{/* Operational Control Filter Strip */}
<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-sm bg-surface-container-lowest p-space-sm rounded-xl shadow-sm">
<div className="relative flex-1 max-w-xl">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">search</span>
<input className="w-full bg-surface-container-low pl-10 pr-space-md py-2 rounded-lg font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30 transition-all" id="circulationSearch" placeholder="Search loan ID (#LN-xxxx), patron barcode (#KP-BC-xxxx), or student name..." type="text" />
</div>
<div className="flex items-center gap-space-xs overflow-x-auto pb-1 md:pb-0">
<button className="filter-tab px-space-md py-1.5 rounded-full font-caption text-caption font-bold bg-primary text-on-primary shadow-sm whitespace-nowrap transition-colors" data-filter="all" type="button">All Loans (1,384)</button>
<button className="filter-tab px-space-md py-1.5 rounded-full font-caption text-caption font-semibold bg-surface-container text-text-secondary hover:text-text-primary whitespace-nowrap transition-colors" data-filter="due-soon" type="button">Due Soon (42)</button>
<button className="filter-tab px-space-md py-1.5 rounded-full font-caption text-caption font-semibold bg-surface-container text-text-secondary hover:text-text-primary whitespace-nowrap transition-colors" data-filter="overdue" type="button">Overdue (18)</button>
<button className="filter-tab px-space-md py-1.5 rounded-full font-caption text-caption font-semibold bg-surface-container text-text-secondary hover:text-text-primary whitespace-nowrap transition-colors" data-filter="faculty" type="button">Faculty Holds</button>
<button className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-container hover:text-text-primary transition-colors" title="Filter columns" type="button">
<span className="material-symbols-outlined text-[18px]">tune</span>
</button>
</div>
</div>
{/* Main Roster Table Section */}
<div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
<div className="px-space-md py-space-sm flex items-center justify-between bg-surface-container/40">
<div className="flex items-center gap-space-sm">
<span className="font-small text-small font-bold text-text-primary">Live Circulation Register</span>
<span className="font-caption text-caption px-2 py-0.5 rounded-full bg-soft-blue text-primary font-semibold">Active Term 1 2026-2027</span>
</div>
<div className="flex items-center gap-space-sm text-text-secondary">
<span className="font-caption text-caption">Showing 4 of 1,384</span>
<div className="flex items-center gap-1">
<button className="w-7 h-7 rounded flex items-center justify-center bg-surface-container hover:bg-surface-variant transition-colors" title="Previous page">
<span className="material-symbols-outlined text-[16px]">chevron_left</span>
</button>
<button className="w-7 h-7 rounded flex items-center justify-center bg-surface-container hover:bg-surface-variant transition-colors" title="Next page">
<span className="material-symbols-outlined text-[16px]">chevron_right</span>
</button>
</div>
</div>
</div>
{/* Data Table Container */}
<div className="overflow-x-auto">
<table className="w-full text-left font-small text-small text-text-primary">
<thead className="bg-surface-container text-text-secondary font-caption text-caption uppercase tracking-wider">
<tr>
<th className="py-3 px-space-md font-semibold" scope="col">Loan ID</th>
<th className="py-3 px-space-md font-semibold" scope="col">Patron Details</th>
<th className="py-3 px-space-md font-semibold" scope="col">Book Title &amp; Catalog Barcode</th>
<th className="py-3 px-space-md font-semibold" scope="col">Checkout</th>
<th className="py-3 px-space-md font-semibold" scope="col">Due Date</th>
<th className="py-3 px-space-md font-semibold" scope="col">Days Remaining</th>
<th className="py-3 px-space-md font-semibold" scope="col">Renewals</th>
<th className="py-3 px-space-md font-semibold" scope="col">Status</th>
<th className="py-3 px-space-md font-semibold text-right" scope="col">Actions</th>
</tr>
</thead>
<tbody className="divide-y-0">
{/* Row 1: Sofia Morales */}
<tr className="hover:bg-surface-container-low transition-colors bg-surface-container-lowest">
<td className="py-3.5 px-space-md">
<span className="font-mono text-caption font-bold text-primary bg-primary/10 px-2 py-1 rounded">#LN-9021</span>
</td>
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-sm">
<img className="w-8 h-8 rounded-full object-cover shadow-sm" data-alt="A clean, modern academic profile portrait of a female university student in a bright library environment with soft depth of field and blue background accents" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsRQShgf43TDNe36EPL91ukGZ9ACc3ka2l9WjoI_SpwPBb2y3swgWvMNCUxvrAG9XWse1aJPu7LrwgmpScTdI3xvEn245UW82kt9_rhmnqXLPxj-p75Z03Y9mKmRglQoyCxM9iPF6gTmCSVfunuamvRAmv1qNbUKVVa_HB-aZXXc2lORXQ_smBKso9tbQZUgl8DwTykoskxlo7dpm-6dVjNnKQNnHYh6vfrppF2tI5A_XD7GaKYehR" />
<div className="flex flex-col">
<span className="font-small text-small font-semibold text-text-primary leading-snug">Sofia Morales</span>
<span className="font-caption text-caption text-text-secondary">#ST-2023-0842 • Undergrad</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-md max-w-xs">
<div className="flex flex-col">
<span className="font-small text-small font-medium text-text-primary truncate" title="Clean Code: A Handbook of Agile Software Craftsmanship">Clean Code</span>
<span className="font-caption text-caption text-text-secondary flex items-center gap-1 font-mono">
<span className="material-symbols-outlined text-[14px]">barcode_scanner</span> #KP-BC-4491-03
                </span>
</div>
</td>
<td className="py-3.5 px-space-md whitespace-nowrap text-text-secondary">Oct 12, 2026</td>
<td className="py-3.5 px-space-md whitespace-nowrap font-medium text-text-primary">Oct 26, 2026</td>
<td className="py-3.5 px-space-md whitespace-nowrap">
<span className="font-caption text-caption px-2 py-0.5 rounded-full bg-status-pending/20 text-text-primary font-bold">Due Today</span>
</td>
<td className="py-3.5 px-space-md whitespace-nowrap">
<span className="font-caption text-caption px-2 py-0.5 rounded bg-surface-container text-text-secondary">1 of 1 max</span>
</td>
<td className="py-3.5 px-space-md whitespace-nowrap">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-caption text-caption font-bold bg-status-pending/20 text-status-pending">
<span className="w-1.5 h-1.5 rounded-full bg-status-pending"></span>
                Due Soon
              </span>
</td>
<td className="py-3.5 px-space-md text-right whitespace-nowrap">
<div className="flex items-center justify-end gap-1.5">
<button className="btn-action px-2.5 py-1 rounded-lg bg-soft-blue text-primary font-caption text-caption font-bold hover:bg-secondary-container transition-colors" title="Extend Loan" type="button">Extend Loan</button>
<button className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-container text-text-secondary hover:bg-surface-variant hover:text-text-primary transition-colors" title="Issue Automated Reminder" type="button">
<span className="material-symbols-outlined text-[18px]">forward_to_inbox</span>
</button>
</div>
</td>
</tr>
{/* Row 2: Dr. Aris Thorne */}
<tr className="hover:bg-surface-container-low transition-colors bg-surface-container/20">
<td className="py-3.5 px-space-md">
<span className="font-mono text-caption font-bold text-primary bg-primary/10 px-2 py-1 rounded">#LN-8942</span>
</td>
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-sm">
<img className="w-8 h-8 rounded-full object-cover shadow-sm" data-alt="A distinguished middle-aged male university professor with spectacles in a calm sunlit academic library department office" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1rJItGqvg6IaZtH2nYpT_ejXQ1B-FKoQ2jQDHTtYSPU3qeOtjcyd3jJaFcT36aAP253uq5r4cGxegikf0sKROiLdM_ueyia-9hisYhDTQoEBkT-9kjVf2VvzLObwpRrvqYljOmvLEFxEUWds6Z7wdy5MoKyPqCyfsZOcNTWrRi9aucKpTVYr2G9fGuHKLDRssf4xqR9GF7KkrF5B_ktxKGuum8QhHp8s-7JSHDJT9H0XFhjMtGK-W" />
<div className="flex flex-col">
<span className="font-small text-small font-semibold text-text-primary leading-snug">Dr. Aris Thorne</span>
<span className="font-caption text-caption text-secondary font-medium">#FAC-0199 • Faculty (History)</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-md max-w-xs">
<div className="flex flex-col">
<span className="font-small text-small font-medium text-text-primary truncate" title="Philippine Cartography 1320-1899 Rare Atlas Folio Edition">Philippine Cartography</span>
<span className="font-caption text-caption text-text-secondary flex items-center gap-1 font-mono">
<span className="material-symbols-outlined text-[14px]">barcode_scanner</span> #KP-BC-8921-01
                </span>
</div>
</td>
<td className="py-3.5 px-space-md whitespace-nowrap text-text-secondary">Oct 01, 2026</td>
<td className="py-3.5 px-space-md whitespace-nowrap font-medium text-text-primary">Nov 15, 2026</td>
<td className="py-3.5 px-space-md whitespace-nowrap text-text-secondary">20 Days left</td>
<td className="py-3.5 px-space-md whitespace-nowrap">
<span className="font-caption text-caption px-2 py-0.5 rounded bg-surface-container text-text-secondary">0 used</span>
</td>
<td className="py-3.5 px-space-md whitespace-nowrap">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-caption text-caption font-bold bg-status-available/20 text-status-available">
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
                Active Loan
              </span>
</td>
<td className="py-3.5 px-space-md text-right whitespace-nowrap">
<div className="flex items-center justify-end gap-1.5">
<button className="btn-action px-2.5 py-1 rounded-lg bg-surface-container text-text-primary font-caption text-caption font-semibold hover:bg-surface-variant transition-colors" type="button">Inspect</button>
<button className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-container text-text-secondary hover:bg-surface-variant hover:text-text-primary transition-colors" title="Print Loan Receipt" type="button">
<span className="material-symbols-outlined text-[18px]">receipt_long</span>
</button>
</div>
</td>
</tr>
{/* Row 3: Marcus Aurelio Cruz (Delinquent) */}
<tr className="hover:bg-error-container/20 transition-colors bg-error-container/10">
<td className="py-3.5 px-space-md">
<span className="font-mono text-caption font-bold text-error bg-error-container px-2 py-1 rounded">#LN-8812</span>
</td>
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-sm">
<img className="w-8 h-8 rounded-full object-cover shadow-sm" data-alt="A portrait of a male collegiate engineering student in casual academic clothing against blurred university laboratory bookshelves" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcT507O2XIfpqT_FLmTeNicLahaUcyuY-72N29og5RJbR46DTqFJ5xFfRdJcO7EK3-6mFQMbqU-LxJLJuSduV_P8kxG38hw3X7-PgHX16HyX0EZnzBwgmcRFlxobblEwU0ddGP9hn5s5szQWEsdKw1zIioQTBeoi58T5H0hRNRnwSCZVTjn8GjwpciA6bHmz9IL1X0hGJaBhFMcpaqlyawVsgM5G0NWkALbMYNFz5DGwZiAsnkXo1-" />
<div className="flex flex-col">
<span className="font-small text-small font-semibold text-text-primary leading-snug">Marcus Aurelio Cruz</span>
<span className="font-caption text-caption text-text-secondary">#ST-2022-9912 • Undergrad</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-md max-w-xs">
<div className="flex flex-col">
<span className="font-small text-small font-medium text-text-primary truncate" title="Principles of Modern Thermodynamics 4th Ed">Principles of Modern Thermodynamics</span>
<span className="font-caption text-caption text-text-secondary flex items-center gap-1 font-mono">
<span className="material-symbols-outlined text-[14px]">barcode_scanner</span> #KP-BC-1142-08
                </span>
</div>
</td>
<td className="py-3.5 px-space-md whitespace-nowrap text-text-secondary">Oct 02, 2026</td>
<td className="py-3.5 px-space-md whitespace-nowrap font-medium text-error">Oct 16, 2026</td>
<td className="py-3.5 px-space-md whitespace-nowrap">
<span className="font-caption text-caption px-2 py-0.5 rounded-full bg-error text-on-error font-bold tracking-tight">10d Overdue</span>
</td>
<td className="py-3.5 px-space-md whitespace-nowrap">
<span className="font-caption text-caption px-2 py-0.5 rounded bg-surface-container text-text-secondary">0 used</span>
</td>
<td className="py-3.5 px-space-md whitespace-nowrap">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-caption text-caption font-bold bg-status-danger/20 text-status-danger">
<span className="w-1.5 h-1.5 rounded-full bg-status-danger"></span>
                Overdue (₱150 Fine)
              </span>
</td>
<td className="py-3.5 px-space-md text-right whitespace-nowrap">
<div className="flex items-center justify-end gap-1.5">
<button className="btn-action px-2.5 py-1 rounded-lg bg-status-danger text-surface-container-lowest font-caption text-caption font-bold hover:opacity-90 transition-opacity" type="button">View Delinquency</button>
<button className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-container text-text-secondary hover:bg-surface-variant hover:text-text-primary transition-colors" title="Lock Student Account" type="button">
<span className="material-symbols-outlined text-[18px]">lock_person</span>
</button>
</div>
</td>
</tr>
{/* Row 4: Camille Beatrice De Leon */}
<tr className="hover:bg-surface-container-low transition-colors bg-surface-container-lowest">
<td className="py-3.5 px-space-md">
<span className="font-mono text-caption font-bold text-primary bg-primary/10 px-2 py-1 rounded">#LN-9104</span>
</td>
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-sm">
<img className="w-8 h-8 rounded-full object-cover shadow-sm" data-alt="Portrait of an Asian female university student in contemporary smart-casual style inside a high ceiling library hall with gentle natural lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQlv4e8lXOB7lYXb3g1ixHvAkvMrfArIVtyzKnLvK6ZXTo-EDVYQziZ9v1_AzkPOJyJ4E9jZd_o06YkDoyNth0dUb3veJ1VsUqmovlJWiJ_x56vtPji8x4_Oa_Tf56argdFLYk7N0XYinvCUJTz5OaOtvQ9qqKmk2f3E4wi1KCdMXw8nXi_44jX3rWaEMTs3sRU-TDuljX-tssy3c6qfJ1x9U11XiiZ7JTd2tXppXthRoFl2dFZgJU" />
<div className="flex flex-col">
<span className="font-small text-small font-semibold text-text-primary leading-snug">Camille Beatrice De Leon</span>
<span className="font-caption text-caption text-text-secondary">#ST-2024-3401 • Undergrad</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-md max-w-xs">
<div className="flex flex-col">
<span className="font-small text-small font-medium text-text-primary truncate" title="Intermediate Accounting Vol. 2 Valix Edition">Intermediate Accounting Vol. 2</span>
<span className="font-caption text-caption text-text-secondary flex items-center gap-1 font-mono">
<span className="material-symbols-outlined text-[14px]">barcode_scanner</span> #KP-BC-7729-02
                </span>
</div>
</td>
<td className="py-3.5 px-space-md whitespace-nowrap text-text-secondary">Oct 18, 2026</td>
<td className="py-3.5 px-space-md whitespace-nowrap font-medium text-text-primary">Nov 01, 2026</td>
<td className="py-3.5 px-space-md whitespace-nowrap text-text-secondary">6 Days left</td>
<td className="py-3.5 px-space-md whitespace-nowrap">
<span className="font-caption text-caption px-2 py-0.5 rounded bg-surface-container text-text-secondary">0 of 1 max</span>
</td>
<td className="py-3.5 px-space-md whitespace-nowrap">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-caption text-caption font-bold bg-status-available/20 text-status-available">
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
                Active Loan
              </span>
</td>
<td className="py-3.5 px-space-md text-right whitespace-nowrap">
<div className="flex items-center justify-end gap-1.5">
<button className="btn-action px-2.5 py-1 rounded-lg bg-soft-blue text-primary font-caption text-caption font-bold hover:bg-secondary-container transition-colors" type="button">Renew</button>
<button className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface-container text-text-secondary hover:bg-surface-variant hover:text-text-primary transition-colors" title="View Transaction History" type="button">
<span className="material-symbols-outlined text-[18px]">history</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
{/* Table Footer with Summary Stats */}
<div className="p-space-md bg-surface-container-low/60 flex flex-col sm:flex-row items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-md text-text-secondary font-caption text-caption">
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-available"></span> Normal: 1,324</span>
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-pending"></span> Approaching: 42</span>
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-danger"></span> Delinquent: 18</span>
</div>
<div className="flex items-center gap-space-sm font-caption text-caption text-text-secondary">
<span className="">Batch Actions:</span>
<button className="px-3 py-1 bg-surface-container rounded-lg font-medium hover:bg-surface-variant text-text-primary transition-colors" type="button">Send Group SMS Reminders</button>
<button className="px-3 py-1 bg-surface-container rounded-lg font-medium hover:bg-surface-variant text-text-primary transition-colors" type="button">Export CSV</button>
</div>
</div>
</div>
{/* Bottom Split Grid: Policy Rules & Quick Circulation Desk Override */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
{/* Policy Presets Widget */}
<div className="lg:col-span-1 bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div className="flex flex-col gap-space-xs">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider text-secondary font-bold">Standard Institutional Rules</span>
<span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
</div>
<h2 className="font-headline-4 text-headline-4 text-text-primary font-bold">Loan Policy Presets</h2>
<p className="font-small text-small text-text-secondary mt-1">Automatic limits enforced at checkout based on institutional role matrix.</p>
<div className="flex flex-col gap-2 mt-4">
{/* Preset 1 */}
<div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between">
<div className="flex flex-col">
<span className="font-small text-small font-bold text-text-primary">Undergraduate Patron</span>
<span className="font-caption text-caption text-text-secondary">Max 3 concurrent titles</span>
</div>
<div className="flex flex-col items-end">
<span className="font-small text-small font-bold text-primary">14 Days</span>
<span className="font-caption text-caption text-secondary">+1 Renewal allowed</span>
</div>
</div>
{/* Preset 2 */}
<div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between">
<div className="flex flex-col">
<span className="font-small text-small font-bold text-text-primary">Graduate &amp; Thesis Scholar</span>
<span className="font-caption text-caption text-text-secondary">Max 6 concurrent titles</span>
</div>
<div className="flex flex-col items-end">
<span className="font-small text-small font-bold text-primary">28 Days</span>
<span className="font-caption text-caption text-secondary">+2 Renewals allowed</span>
</div>
</div>
{/* Preset 3 */}
<div className="p-3 bg-surface-container-low rounded-xl flex items-center justify-between">
<div className="flex flex-col">
<span className="font-small text-small font-bold text-text-primary">Faculty &amp; Research Fellow</span>
<span className="font-caption text-caption text-text-secondary">Max 15 concurrent titles</span>
</div>
<div className="flex flex-col items-end">
<span className="font-small text-small font-bold text-primary">60 Days</span>
<span className="font-caption text-caption text-status-available font-semibold">Automatic Semester Extension</span>
</div>
</div>
</div>
</div>
<div className="pt-4 mt-4 flex items-center justify-between bg-surface-container-lowest">
<span className="font-caption text-caption text-text-secondary">Daily overdue penalty: ₱15.00/day</span>
<button className="font-caption text-caption text-primary font-bold hover:underline" type="button">Edit Policies →</button>
</div>
</div>
{/* Quick Manual Override Circulation Drawer / Action Panel */}
<div className="lg:col-span-2 bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-action-green"></span>
<span className="font-caption text-caption uppercase tracking-wider text-secondary font-bold">Fast-Lane Terminal</span>
</div>
<span className="font-caption text-caption font-mono text-text-secondary">SESSION ID: #CIRC-AUTH-8809</span>
</div>
<h2 className="font-headline-4 text-headline-4 text-text-primary font-bold mt-1">Manual Loan Override &amp; On-the-Fly Extension</h2>
<p className="font-small text-small text-text-secondary mt-1">Directly grant exceptional lending durations, waive overdue locks, or bypass renewal caps for certified patrons.</p>
<form className="grid grid-cols-1 md:grid-cols-2 gap-space-md mt-space-md">
<div className="flex flex-col gap-1.5">
<label className="font-caption text-caption text-text-primary font-semibold">Patron Student/Faculty ID</label>
<div className="relative">
<input className="w-full bg-surface-container-low px-space-md py-2 rounded-xl font-small text-small text-text-primary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20" placeholder="e.g. ST-2023-0842" type="text" />
<button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary" title="Scan ID Card" type="button">
<span className="material-symbols-outlined text-[18px]">badge</span>
</button>
</div>
</div>
<div className="flex flex-col gap-1.5">
<label className="font-caption text-caption text-text-primary font-semibold">Catalog RFID / Volume Barcode</label>
<div className="relative">
<input className="w-full bg-surface-container-low px-space-md py-2 rounded-xl font-small text-small text-text-primary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20" placeholder="e.g. KP-BC-4491-03" type="text" />
<button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary" title="Trigger Laser Scanner" type="button">
<span className="material-symbols-outlined text-[18px]">document_scanner</span>
</button>
</div>
</div>
<div className="flex flex-col gap-1.5">
<label className="font-caption text-caption text-text-primary font-semibold">Authorized Extension Interval</label>
<select className="w-full bg-surface-container-low px-space-md py-2 rounded-xl font-small text-small text-text-primary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20">
<option>Standard +7 Days Academic Grace</option>
<option>Extended +14 Days Exam Period</option>
<option>Semester Long Special Grant (+45 Days)</option>
<option>Faculty Capstone Override (+90 Days)</option>
</select>
</div>
<div className="flex flex-col gap-1.5">
<label className="font-caption text-caption text-text-primary font-semibold">Administrative Justification</label>
<input className="w-full bg-surface-container-low px-space-md py-2 rounded-xl font-small text-small text-text-primary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20" placeholder="e.g. Dean approved thesis field study" type="text" />
</div>
</form>
</div>
<div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm pt-space-md mt-space-md bg-surface-container-lowest">
<div className="flex items-center gap-2 text-text-secondary font-caption text-caption">
<span className="material-symbols-outlined text-[16px] text-status-pending">info</span>
<span className="">Logged permanently into institutional audit register.</span>
</div>
<div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
<button className="px-space-md py-2 rounded-xl font-small text-small font-medium text-text-secondary hover:bg-surface-container transition-colors" type="reset">Clear</button>
<button className="px-space-md py-2 rounded-xl font-small text-small font-bold bg-action-green text-text-primary hover:bg-action-green-hover transition-colors shadow-sm" type="button">Authorize &amp; Print Circulation Slip</button>
</div>
</div>
</div>
</div>
{/* Interactive Modal Container for Single Loan Extension */}
<div className="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-sm" id="renewalModal">
<div className="bg-surface-container-lowest max-w-lg w-full rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
<div className="p-space-md bg-soft-blue flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[22px]">update</span>
<h3 className="font-headline-4 text-headline-4 text-text-primary font-bold">Circulation Extension Approval</h3>
</div>
<button className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-container-lowest/50 transition-colors" id="btnCloseRenewalModal" type="button">
<span className="material-symbols-outlined text-[20px]">close</span>
</button>
</div>
<div className="p-space-md flex flex-col gap-space-md">
<div className="flex items-start gap-space-md p-3 bg-surface-container-low rounded-xl">
<span className="material-symbols-outlined text-primary text-[24px]">book_2</span>
<div className="flex flex-col">
<span className="font-small text-small font-bold text-text-primary" id="modalBookTitle">Clean Code: A Handbook of Agile Software Craftsmanship</span>
<span className="font-caption text-caption text-text-secondary" id="modalLoanDetails">Loan #LN-9021 • Sofia Morales (#ST-2023-0842)</span>
</div>
</div>
<div className="grid grid-cols-2 gap-space-sm text-center">
<div className="p-space-sm bg-surface-container rounded-lg">
<span className="font-caption text-caption text-text-secondary block">Current Due Date</span>
<span className="font-small text-small font-bold text-error">Oct 26, 2026 (Today)</span>
</div>
<div className="p-space-sm bg-surface-container rounded-lg">
<span className="font-caption text-caption text-text-secondary block">New Proposed Due</span>
<span className="font-small text-small font-bold text-status-available">Nov 09, 2026 (+14d)</span>
</div>
</div>
<div className="flex flex-col gap-1">
<label className="font-caption text-caption text-text-primary font-semibold">Special Approval Note (Optional)</label>
<textarea className="w-full bg-surface-container-low p-2 rounded-xl font-small text-small text-text-primary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20" placeholder="State reason for manual extension..." rows={2}></textarea>
</div>
</div>
<div className="p-space-md bg-surface-container-low flex items-center justify-end gap-space-sm">
<button className="px-space-md py-2 rounded-lg font-small text-small text-text-secondary hover:bg-surface-variant transition-colors" id="btnCancelRenewalModal" type="button">Cancel</button>
<button className="px-space-md py-2 rounded-lg font-small text-small font-bold bg-action-green text-text-primary hover:bg-action-green-hover transition-colors shadow-sm" id="btnConfirmRenewal" type="button">Confirm 14-Day Extension</button>
</div>
</div>
</div>
</div>

    </div>
  );
};

export default Borrowings;
