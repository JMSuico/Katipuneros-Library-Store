// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// CustomerLookup.tsx -- Cashier Customer Lookup and Verification
// Converted directly from SidebarCustomerLookupPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const CustomerLookup: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
function openPatronModal() {
    const modal = document.getElementById('patronModal');
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  function closePatronModal() {
    const modal = document.getElementById('patronModal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  function switchPatronTab(tabId) {
    // Hide all tab contents
    document.getElementById('tabContent-loans').classList.add('hidden');
    document.getElementById('tabContent-holds').classList.add('hidden');
    document.getElementById('tabContent-ledger').classList.add('hidden');

    // Reset button styles
    const btnLoans = document.getElementById('tabBtn-loans');
    const btnHolds = document.getElementById('tabBtn-holds');
    const btnLedger = document.getElementById('tabBtn-ledger');

    [btnLoans, btnHolds, btnLedger].forEach(btn => {
      btn.className = 'px-4 py-2 font-small text-small font-medium rounded-xl bg-surface-container text-text-secondary hover:text-text-primary transition-colors';
    });

    // Activate selected
    if (tabId === 'active-loans') {
      document.getElementById('tabContent-loans').classList.remove('hidden');
      btnLoans.className = 'px-4 py-2 font-small text-small font-bold rounded-xl bg-primary text-on-primary transition-colors';
    } else if (tabId === 'holds-history') {
      document.getElementById('tabContent-holds').classList.remove('hidden');
      btnHolds.className = 'px-4 py-2 font-small text-small font-bold rounded-xl bg-primary text-on-primary transition-colors';
    } else if (tabId === 'clearance-ledger') {
      document.getElementById('tabContent-ledger').classList.remove('hidden');
      btnLedger.className = 'px-4 py-2 font-small text-small font-bold rounded-xl bg-primary text-on-primary transition-colors';
    }
  }

  function triggerNoticeToast() {
    const toast = document.getElementById('noticeToast');
    if (toast) {
      toast.classList.remove('translate-y-20', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
      setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
      }, 3500);
    }
  }

  function triggerClearanceModal() {
    alert('Clearance Verification Verified: Sofia Angela Morales (#KP-77401) is confirmed in good standing with zero unreturned items and ₱0.00 outstanding fees. Certificate ready for print spool.');
  }

  // Keyboard shortcut listener for Cashier fast-lookup
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePatronModal();
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const input = document.getElementById('patronSearchInput');
      if (input) input.focus();
    }
  });
try { w.openPatronModal = openPatronModal; } catch (_) {}
    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full pb-space-3xl gap-space-lg">
{/* Role Restriction Banner (Cashier Scoped Read-Only Mode) */}
<div className="w-full bg-surface-container-lowest/80 backdrop-blur-md rounded-xl p-space-md shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-soft-blue text-primary flex items-center justify-center flex-shrink-0">
<span className="material-symbols-outlined text-2xl">verified_user</span>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-2">
<span className="font-body-large text-body-large font-bold text-text-primary">Cashier Desk Patron Directory</span>
<span className="inline-flex items-center gap-1 bg-surface-container-high text-on-surface-variant font-caption text-caption px-space-xs py-0.5 rounded">
<span className="material-symbols-outlined text-xs">lock</span> READ-ONLY MODE
          </span>
</div>
<p className="font-small text-small text-text-secondary">Circulation eligibility validation, clearance auditing, and hold verification. Personal records modification is reserved for Registrar/Chief Librarian.</p>
</div>
</div>
<div className="flex items-center gap-space-sm w-full md:w-auto justify-end">
<button className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container text-primary font-small text-small font-medium hover:bg-surface-container-high transition-colors" type="button">
<span className="material-symbols-outlined text-lg">sync</span> Refresh Ledger
      </button>
<button className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-soft-blue text-primary font-small text-small font-medium hover:bg-secondary-container transition-colors" type="button">
<span className="material-symbols-outlined text-lg">print</span> Daily Census
      </button>
</div>
</div>
{/* Metric Summary Bento Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
{/* Total Registered Patrons */}
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between relative overflow-hidden group">
<div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-soft-blue/40 pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
<div className="flex items-center justify-between">
<span className="font-caption text-caption font-bold uppercase tracking-wider text-text-secondary">Registered Patrons</span>
<span className="material-symbols-outlined text-primary text-xl">contacts</span>
</div>
<div className="mt-space-md flex items-baseline justify-between">
<span className="font-headline-2 text-headline-2 font-bold text-text-primary">3,420</span>
<span className="inline-flex items-center text-status-available font-caption text-caption font-semibold">
<span className="material-symbols-outlined text-sm">trending_up</span> +38 this term
        </span>
</div>
<div className="mt-2 text-text-secondary font-caption text-caption">Undergraduate, Graduate &amp; University Faculty</div>
</div>
{/* Good Standing */}
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between relative overflow-hidden">
<div className="flex items-center justify-between">
<span className="font-caption text-caption font-bold uppercase tracking-wider text-text-secondary">In Good Standing</span>
<span className="material-symbols-outlined text-status-available text-xl">verified</span>
</div>
<div className="mt-space-md flex items-baseline justify-between">
<span className="font-headline-2 text-headline-2 font-bold text-text-primary">3,280</span>
<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-action-green/30 text-text-primary font-caption text-caption font-bold">95.9%</span>
</div>
<div className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
<div className="bg-action-green h-full rounded-full" style={{ width: '95.9%' }}></div>
</div>
</div>
{/* Active Borrowers */}
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between relative overflow-hidden">
<div className="flex items-center justify-between">
<span className="font-caption text-caption font-bold uppercase tracking-wider text-text-secondary">Active Borrowers</span>
<span className="material-symbols-outlined text-secondary text-xl">auto_stories</span>
</div>
<div className="mt-space-md flex items-baseline justify-between">
<span className="font-headline-2 text-headline-2 font-bold text-text-primary">142</span>
<span className="font-caption text-caption text-text-secondary font-medium">318 Volumes Checked Out</span>
</div>
<div className="mt-2 flex items-center gap-1 font-caption text-caption text-primary">
<span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
<span className="">Avg. 2.2 books / patron</span>
</div>
</div>
{/* Overdue Restrictions */}
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col justify-between relative overflow-hidden">
<div className="flex items-center justify-between">
<span className="font-caption text-caption font-bold uppercase tracking-wider text-status-danger">Restrictions &amp; Holds</span>
<span className="material-symbols-outlined text-status-danger text-xl">block</span>
</div>
<div className="mt-space-md flex items-baseline justify-between">
<span className="font-headline-2 text-headline-2 font-bold text-status-danger">14</span>
<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-caption text-caption font-bold">Action Required</span>
</div>
<div className="mt-2 text-text-secondary font-caption text-caption">₱1,840.00 uncollected overdue charges</div>
</div>
</div>
{/* Advanced Patron Search & Filter Bar */}
<div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-sm">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-sm">
{/* Search Input */}
<div className="lg:col-span-6 relative flex items-center">
<span className="material-symbols-outlined absolute left-3.5 text-text-secondary text-xl">search</span>
<input className="w-full pl-11 pr-24 py-3 bg-surface-container rounded-xl text-on-surface placeholder:text-text-secondary font-small text-small focus:bg-surface-bright focus:outline-none transition-colors" id="patronSearchInput" placeholder="Scan Student/Faculty RFID, Barcode, #KP-ID, or Name..." type="text" />
<div className="absolute right-3 flex items-center gap-1">
<kbd className="px-2 py-1 bg-surface-container-lowest rounded text-caption text-text-secondary font-mono shadow-sm">RFID Ready</kbd>
</div>
</div>
{/* Department Selector */}
<div className="lg:col-span-3">
<div className="relative">
<select className="w-full appearance-none pl-3.5 pr-10 py-3 bg-surface-container rounded-xl text-on-surface font-small text-small focus:bg-surface-bright focus:outline-none transition-colors cursor-pointer">
<option value="all">All Departments / Colleges</option>
<option value="ccs">College of Computer Studies</option>
<option value="cba">Business &amp; Accountancy</option>
<option value="coe">Engineering &amp; Architecture</option>
<option value="cla">Liberal Arts &amp; Sciences</option>
<option value="grad">Graduate School</option>
<option value="faculty">University Faculty &amp; Staff</option>
</select>
<span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-text-secondary">expand_more</span>
</div>
</div>
{/* Quick Action: Clear Filters */}
<div className="lg:col-span-3 flex items-center justify-end gap-2">
<button className="w-full flex items-center justify-center gap-1.5 px-space-md py-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-small text-small font-medium transition-colors" type="button">
<span className="material-symbols-outlined text-lg">filter_alt_off</span> Reset
        </button>
<button className="w-full flex items-center justify-center gap-1.5 px-space-md py-3 rounded-xl bg-primary text-on-primary font-small text-small font-semibold hover:bg-primary-container transition-colors shadow-sm" type="button">
<span className="material-symbols-outlined text-lg">barcode_scanner</span> Scan Pass
        </button>
</div>
</div>
{/* Status Filter Chips */}
<div className="flex items-center gap-2 pt-2 overflow-x-auto">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider whitespace-nowrap mr-1">Eligibility Status:</span>
<button className="px-4 py-1.5 rounded-full font-caption text-caption font-semibold bg-primary text-on-primary shadow-sm whitespace-nowrap" type="button">
        All Patrons (3,420)
      </button>
<button className="px-4 py-1.5 rounded-full font-caption text-caption font-medium bg-chip-unselected-bg hover:bg-surface-container text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap" type="button">
        Eligible / In Good Standing (3,280)
      </button>
<button className="px-4 py-1.5 rounded-full font-caption text-caption font-medium bg-chip-unselected-bg hover:bg-surface-container text-status-danger hover:text-text-primary transition-colors whitespace-nowrap" type="button">
        Restricted / Hold (14)
      </button>
<button className="px-4 py-1.5 rounded-full font-caption text-caption font-medium bg-chip-unselected-bg hover:bg-surface-container text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap" type="button">
        Faculty Exemptions (86)
      </button>
<button className="px-4 py-1.5 rounded-full font-caption text-caption font-medium bg-chip-unselected-bg hover:bg-surface-container text-status-pending hover:text-text-primary transition-colors whitespace-nowrap" type="button">
        Pending Clearance (22)
      </button>
</div>
</div>
{/* Patron Directory Main Table Card */}
<div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col">
<div className="p-space-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm bg-surface-container-low">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-primary">manage_search</span>
<h2 className="font-headline-4 text-headline-4 text-text-primary font-bold">Patron Roster &amp; Standing</h2>
<span className="bg-surface-container-high px-2 py-0.5 rounded text-caption text-text-secondary font-mono">Showing 6 of 3,420</span>
</div>
<div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption">
<span className="inline-block w-2 h-2 rounded-full bg-action-green mr-1"></span>
<span className="">Directory database connected • Read-Only Terminal</span>
</div>
</div>
{/* Table Container */}
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead>
<tr className="bg-surface-container text-text-secondary font-caption text-caption uppercase tracking-wider">
<th className="py-3 px-space-md font-semibold">Patron Name &amp; Contact</th>
<th className="py-3 px-space-md font-semibold">Patron ID / Program</th>
<th className="py-3 px-space-md font-semibold text-center">Active Loans</th>
<th className="py-3 px-space-md font-semibold text-center">Holds</th>
<th className="py-3 px-space-md font-semibold">Overdue Fines</th>
<th className="py-3 px-space-md font-semibold">Standing</th>
<th className="py-3 px-space-md font-semibold text-right">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container-high/40 text-on-surface">
{/* Row 1: Sofia Morales (Highlighted Default) */}
<tr className="hover:bg-soft-blue/30 transition-colors bg-soft-blue/20">
<td className="py-space-md px-space-md">
<div className="flex items-center gap-space-sm">
<img className="w-11 h-11 rounded-full object-cover shadow-sm ring-2 ring-primary/20" data-alt="Close-up professional university student ID portrait of Sofia Morales, young Filipina woman with glasses, neutral smiling expression, crisp academic light blue background, library store uniform." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFVQvmxS7HU-hkyn9XoGZQpwl-nV0Qvd1jwfuXe-2oxPZ2zXXvSxnR2GbygVUDVrkOpRBdxmX1dQJyaHBoWEUfRtruNOEQRQvvDSM1miv_4p5jephs_Kq2RbPCTZzBu5crhhfT8AFiavxoge752iP4Q0fz4JXTl7rBAoUi1Vc-7a7snbPxrDhBBkMLeZTDblHYTBL5KeDvVkpgrggoLxYqjPUHn4xfthaCpmZlnqpgtnPCv1BluMA4" />
<div className="flex flex-col">
<div className="flex items-center gap-1.5">
<span className="font-body-medium text-body-medium font-bold text-text-primary">Sofia Morales</span>
<span className="material-symbols-outlined text-primary text-base" title="Verified Campus Account">verified</span>
</div>
<span className="font-small text-small text-text-secondary">sofia.morales@univ.edu.ph</span>
</div>
</div>
</td>
<td className="py-space-md px-space-md">
<div className="flex flex-col">
<span className="font-small text-small font-mono font-semibold text-text-primary">#KP-77401</span>
<span className="font-caption text-caption text-text-secondary">BS Computer Science (Yr 3)</span>
</div>
</td>
<td className="py-space-md px-space-md text-center">
<div className="inline-flex items-center px-2.5 py-1 rounded-full bg-soft-blue font-small text-small font-bold text-primary">
                2 / 4
              </div>
</td>
<td className="py-space-md px-space-md text-center">
<span className="font-small text-small font-medium text-text-primary">1 Active Hold</span>
</td>
<td className="py-space-md px-space-md">
<span className="font-small text-small font-bold text-status-available">₱0.00 (Clear)</span>
</td>
<td className="py-space-md px-space-md">
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-status-available/20 text-status-available font-caption text-caption font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span> Eligible
              </span>
</td>
<td className="py-space-md px-space-md text-right">
<button className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-small text-small font-semibold transition-all shadow-sm" onClick={(e) => { (window as any).openPatronModal?.(); }} type="button">
<span className="material-symbols-outlined text-base">visibility</span> Inspect Profile
              </button>
</td>
</tr>
{/* Row 2: Marcus Aurelio Cruz (Restricted) */}
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-space-md px-space-md">
<div className="flex items-center gap-space-sm">
<img className="w-11 h-11 rounded-full object-cover" data-alt="Young Southeast Asian male college student casual headshot, soft warm ambient library shelving background, natural lighting, wearing dark navy polo shirt." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBB2ow-YvW8-zlTsAMfW3RWiQLPo464SOkDba6AGhGCTHZNO2-F7GJ8RX6vQlamnrxYazJM6sLmpbpjFIEZt9gWe7jBgo88h4eXSxqYUkBJlKHIjwqS6BjpUNp7S6KY7D8CL0th7NgQb-uyaL19ZKDaiso6KZH37v07IiZaFJEOBkdZdaZQ2PN-psiSZ5uqIH3vbTRN3RxNZcXX9pxNzDI06Owla1_lOPLgrK9Xq6JcFBtg1eFHRxdy" />
<div className="flex flex-col">
<div className="flex items-center gap-1.5">
<span className="font-body-medium text-body-medium font-bold text-text-primary">Marcus Aurelio Cruz</span>
</div>
<span className="font-small text-small text-text-secondary">marcus.cruz@univ.edu.ph</span>
</div>
</div>
</td>
<td className="py-space-md px-space-md">
<div className="flex flex-col">
<span className="font-small text-small font-mono font-semibold text-text-primary">#KP-65922</span>
<span className="font-caption text-caption text-text-secondary">BS Civil Engineering (Yr 4)</span>
</div>
</td>
<td className="py-space-md px-space-md text-center">
<div className="inline-flex items-center px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-small text-small font-bold">
                3 / 4 (Overdue)
              </div>
</td>
<td className="py-space-md px-space-md text-center">
<span className="font-small text-small text-text-secondary font-medium">0 Holds</span>
</td>
<td className="py-space-md px-space-md">
<span className="font-small text-small font-bold text-status-danger">₱340.00 Overdue</span>
</td>
<td className="py-space-md px-space-md">
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-error-container text-on-error-container font-caption text-caption font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-status-danger"></span> Restricted (Hold)
              </span>
</td>
<td className="py-space-md px-space-md text-right">
<button className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-small text-small font-semibold transition-all" onClick={(e) => { (window as any).openPatronModal?.(); }} type="button">
<span className="material-symbols-outlined text-base">visibility</span> Inspect Profile
              </button>
</td>
</tr>
{/* Row 3: Dr. Aris Velasquez (Faculty) */}
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-space-md px-space-md">
<div className="flex items-center gap-space-sm">
<div className="w-11 h-11 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-body">
                  AV
                </div>
<div className="flex flex-col">
<div className="flex items-center gap-1.5">
<span className="font-body-medium text-body-medium font-bold text-text-primary">Dr. Aris Velasquez</span>
<span className="px-1.5 py-0.2 bg-soft-blue text-primary font-caption text-caption rounded font-semibold">Faculty</span>
</div>
<span className="font-small text-small text-text-secondary">aris.velasquez@univ.edu.ph</span>
</div>
</div>
</td>
<td className="py-space-md px-space-md">
<div className="flex flex-col">
<span className="font-small text-small font-mono font-semibold text-text-primary">#FAC-00192</span>
<span className="font-caption text-caption text-text-secondary">Dept of Social Sciences</span>
</div>
</td>
<td className="py-space-md px-space-md text-center">
<div className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container font-small text-small font-bold text-text-primary">
                5 / 10
              </div>
</td>
<td className="py-space-md px-space-md text-center">
<span className="font-small text-small font-medium text-text-primary">2 Active Holds</span>
</td>
<td className="py-space-md px-space-md">
<span className="font-small text-small font-bold text-status-available">₱0.00 (Exempt)</span>
</td>
<td className="py-space-md px-space-md">
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-soft-blue text-primary font-caption text-caption font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Faculty Exempt
              </span>
</td>
<td className="py-space-md px-space-md text-right">
<button className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-small text-small font-semibold transition-all" onClick={(e) => { (window as any).openPatronModal?.(); }} type="button">
<span className="material-symbols-outlined text-base">visibility</span> Inspect Profile
              </button>
</td>
</tr>
{/* Row 4: Camille Beatrice De Leon */}
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-space-md px-space-md">
<div className="flex items-center gap-space-sm">
<img className="w-11 h-11 rounded-full object-cover" data-alt="Academic female university student wearing glasses and cream knit sweater, modern college library archive backdrop, focused and pleasant expression." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNYc2anUnfjgpihj_zeX7giS-MtJsRCv5XfR1UI_q1dCl5K2KMsNV3zUQqs5r-ISyhYbuwjlNqYrOZD7ULXB_TN-z9Rws-DOb9BVfhgDsBL2FNz-dIhGN9vrpMk4LvEZY_oSECiepHDO0UeHPB-3ty1QCpXMtX4kJuLpzCryM69kpoMAA--PG1wLvpHVNdXkWUkqZokTwbkwsyoj3H7jibtkm9sdNDZrvuZUrbm5zHNSS0Csc4UvHp" />
<div className="flex flex-col">
<span className="font-body-medium text-body-medium font-bold text-text-primary">Camille Beatrice De Leon</span>
<span className="font-small text-small text-text-secondary">camille.deleon@univ.edu.ph</span>
</div>
</div>
</td>
<td className="py-space-md px-space-md">
<div className="flex flex-col">
<span className="font-small text-small font-mono font-semibold text-text-primary">#KP-81044</span>
<span className="font-caption text-caption text-text-secondary">BS Accountancy (Yr 2)</span>
</div>
</td>
<td className="py-space-md px-space-md text-center">
<div className="inline-flex items-center px-2.5 py-1 rounded-full bg-soft-blue font-small text-small font-bold text-primary">
                1 / 4
              </div>
</td>
<td className="py-space-md px-space-md text-center">
<span className="font-small text-small text-text-secondary font-medium">0 Holds</span>
</td>
<td className="py-space-md px-space-md">
<span className="font-small text-small font-bold text-status-available">₱0.00 (Clear)</span>
</td>
<td className="py-space-md px-space-md">
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-status-available/20 text-status-available font-caption text-caption font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span> Eligible
              </span>
</td>
<td className="py-space-md px-space-md text-right">
<button className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-small text-small font-semibold transition-all" onClick={(e) => { (window as any).openPatronModal?.(); }} type="button">
<span className="material-symbols-outlined text-base">visibility</span> Inspect Profile
              </button>
</td>
</tr>
{/* Row 5: Gian Paolo Mendoza (Fine Pending) */}
<tr className="hover:bg-surface-container-low transition-colors">
<td className="py-space-md px-space-md">
<div className="flex items-center gap-space-sm">
<div className="w-11 h-11 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-body">
                  GM
                </div>
<div className="flex flex-col">
<span className="font-body-medium text-body-medium font-bold text-text-primary">Gian Paolo Mendoza</span>
<span className="font-small text-small text-text-secondary">gian.mendoza@univ.edu.ph</span>
</div>
</div>
</td>
<td className="py-space-md px-space-md">
<div className="flex flex-col">
<span className="font-small text-small font-mono font-semibold text-text-primary">#KP-72019</span>
<span className="font-caption text-caption text-text-secondary">BS Nursing (Yr 3)</span>
</div>
</td>
<td className="py-space-md px-space-md text-center">
<div className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container font-small text-small font-bold text-text-primary">
                0 / 4
              </div>
</td>
<td className="py-space-md px-space-md text-center">
<span className="font-small text-small text-text-secondary font-medium">0 Holds</span>
</td>
<td className="py-space-md px-space-md">
<span className="font-small text-small font-bold text-status-pending">₱50.00 (Unpaid Fee)</span>
</td>
<td className="py-space-md px-space-md">
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-status-pending/20 text-text-primary font-caption text-caption font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-status-pending"></span> Fee Pending
              </span>
</td>
<td className="py-space-md px-space-md text-right">
<button className="inline-flex items-center gap-1 px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-small text-small font-semibold transition-all" onClick={(e) => { (window as any).openPatronModal?.(); }} type="button">
<span className="material-symbols-outlined text-base">visibility</span> Inspect Profile
              </button>
</td>
</tr>
</tbody>
</table>
</div>
{/* Table Pagination & Statistics Footer */}
<div className="p-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm">
<div className="font-caption text-caption text-text-secondary">
        Showing 1 to 5 of 3,420 registered patrons (Page 1 of 684)
      </div>
<div className="flex items-center gap-1">
<button className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary disabled={true}:opacity-40" disabled={true} type="button">
<span className="material-symbols-outlined text-base">chevron_left</span>
</button>
<button className="w-8 h-8 rounded-lg bg-primary text-on-primary font-caption text-caption font-bold" type="button">1</button>
<button className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high font-caption text-caption font-medium text-text-primary" type="button">2</button>
<button className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high font-caption text-caption font-medium text-text-primary" type="button">3</button>
<span className="px-1 text-text-secondary">...</span>
<button className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high font-caption text-caption font-medium text-text-primary" type="button">684</button>
<button className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary" type="button">
<span className="material-symbols-outlined text-base">chevron_right</span>
</button>
</div>
</div>
</div>
{/* Patron Profile Inspection Modal / Slide-out Simulator */}
<div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 backdrop-blur-sm p-4 hidden" id="patronModal">
<div className="bg-surface-container-lowest w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[921px] animate-in fade-in zoom-in-95 duration-200">
{/* Modal Header */}
<div className="px-space-lg py-space-md bg-surface-container-low flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-full bg-soft-blue text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-lg">badge</span>
</div>
<div>
<h3 className="font-headline-4 text-headline-4 font-bold text-text-primary">Patron Circulation Dossier</h3>
<span className="font-caption text-caption text-text-secondary">Internal Circulation Record • Terminal Cashier Read-Only Audit</span>
</div>
</div>
<div className="flex items-center gap-2">
<span className="inline-flex items-center gap-1 text-caption font-mono bg-action-green/30 text-text-primary px-2.5 py-1 rounded-full font-bold">
<span className="w-2 h-2 rounded-full bg-status-available"></span> Active Clearance Valid
          </span>
<button className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors" onClick={(e) => { (window as any).closePatronModal?.(); }} type="button">
<span className="material-symbols-outlined">close</span>
</button>
</div>
</div>
{/* Modal Body (Scrollable) */}
<div className="overflow-y-auto p-space-lg flex flex-col gap-space-lg">
{/* Overview Identity Card */}
<div className="bg-soft-blue/30 rounded-2xl p-space-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md relative overflow-hidden">
<div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-md z-10">
<img className="w-24 h-24 rounded-2xl object-cover shadow-md ring-4 ring-surface-container-lowest" data-alt="Photorealistic detailed ID photo portrait of Sofia Morales, Filipina college student with tied dark hair and modern glasses, smiling kindly with soft studio library light." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLCT7LWF7W_nTHo7hCMJmOUhjSOGPe_2-08s2jB4ihNSxqdxRK6ofe44I-da32-P96KMYDvRWpVt7vIDaDnvWDHMjPQv4UIoMe0DyDktLrVzKjAGJOgkn3gk5azYcANG-8Y1QGZ9teGgngTBW8dmfpYTU5MvKvL6XnxV7N5PGMYKfSnWjr5078TODap_v9EgLOQqNWf9Hu4eeKUP617fJ85xjPMGSyeCtqx83zFmQhaX8KPJFsU44A" />
<div className="flex flex-col">
<div className="flex items-center gap-2">
<h2 className="font-headline-3 text-headline-3 font-bold text-text-primary">Sofia Angela Morales</h2>
<span className="px-2.5 py-0.5 rounded-full bg-status-available text-on-primary font-caption text-caption font-bold">In Good Standing</span>
</div>
<p className="font-body-medium text-body-medium text-secondary">BS Computer Science • College of Computer Studies (Yr 3)</p>
<div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-4 text-caption text-caption text-text-secondary font-mono">
<span className="">ID: <strong className="text-text-primary">#KP-77401</strong></span>
<span className="">•</span>
<span className="">RFID: <strong className="text-text-primary">E280-1170-B901</strong></span>
<span className="">•</span>
<span className="">Mobile: <strong className="text-text-primary">+63 (917) 489-2041</strong></span>
</div>
</div>
</div>
{/* Standing & Allowance Micro-Stats */}
<div className="grid grid-cols-2 sm:grid-cols-3 gap-space-sm w-full lg:w-auto z-10">
<div className="bg-surface-container-lowest p-space-sm rounded-xl flex flex-col">
<span className="font-caption text-caption text-text-secondary">Borrowing Cap</span>
<span className="font-headline-4 text-headline-4 font-bold text-text-primary">2 / 4</span>
<span className="font-caption text-caption text-status-available">2 slots available</span>
</div>
<div className="bg-surface-container-lowest p-space-sm rounded-xl flex flex-col">
<span className="font-caption text-caption text-text-secondary">Clearance Term</span>
<span className="font-body-large text-body-large font-bold text-text-primary">1st Sem 26-27</span>
<span className="font-caption text-caption text-primary">Valid till Dec 18</span>
</div>
<div className="bg-surface-container-lowest p-space-sm rounded-xl flex flex-col col-span-2 sm:col-span-1">
<span className="font-caption text-caption text-text-secondary">Outstanding</span>
<span className="font-headline-4 text-headline-4 font-bold text-status-available">₱0.00</span>
<span className="font-caption text-caption text-text-secondary">Clean Record</span>
</div>
</div>
</div>
{/* Tabbed Navigation inside Patron View */}
<div className="flex flex-col gap-space-md">
<div className="flex items-center gap-2 border-b-0">
<button className="px-4 py-2 font-small text-small font-bold rounded-xl bg-primary text-on-primary transition-colors" id="tabBtn-loans" onClick={(e) => { (window as any).switchPatronTab?.('active-loans'); }} type="button">
              Active Loans (2)
            </button>
<button className="px-4 py-2 font-small text-small font-medium rounded-xl bg-surface-container text-text-secondary hover:text-text-primary transition-colors" id="tabBtn-holds" onClick={(e) => { (window as any).switchPatronTab?.('holds-history'); }} type="button">
              Hold Requests (1)
            </button>
<button className="px-4 py-2 font-small text-small font-medium rounded-xl bg-surface-container text-text-secondary hover:text-text-primary transition-colors" id="tabBtn-ledger" onClick={(e) => { (window as any).switchPatronTab?.('clearance-ledger'); }} type="button">
              Past Circulation &amp; Receipts
            </button>
</div>
{/* TAB 1: Active Loans */}
<div className="flex flex-col gap-space-sm" id="tabContent-loans">
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
{/* Book 1 */}
<div className="bg-surface-container-low rounded-xl p-space-md flex gap-space-sm">
<div className="w-20 h-28 bg-surface-container rounded-lg flex-shrink-0 flex items-center justify-center text-secondary shadow-sm relative overflow-hidden">
<div className="absolute inset-0 bg-primary/10"></div>
<span className="material-symbols-outlined text-3xl">menu_book</span>
</div>
<div className="flex flex-col justify-between flex-1">
<div>
<span className="font-caption text-caption font-mono text-primary bg-soft-blue px-1.5 py-0.5 rounded">BC-8890-02</span>
<h4 className="font-body-medium text-body-medium font-bold text-text-primary mt-1 line-clamp-1">Introduction to Algorithms (4th Ed.)</h4>
<p className="font-caption text-caption text-text-secondary">Cormen, Leiserson, Rivest • MIT Press</p>
</div>
<div className="mt-2 pt-2 bg-surface-container-lowest/70 p-2 rounded-lg flex items-center justify-between">
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary">Due Date</span>
<span className="font-small text-small font-bold text-text-primary">Oct 30, 2026</span>
</div>
<span className="inline-flex items-center gap-1 font-caption text-caption font-bold text-status-available">
<span className="material-symbols-outlined text-sm">schedule</span> 4 Days Left
                    </span>
</div>
</div>
</div>
{/* Book 2 */}
<div className="bg-surface-container-low rounded-xl p-space-md flex gap-space-sm">
<div className="w-20 h-28 bg-surface-container rounded-lg flex-shrink-0 flex items-center justify-center text-secondary shadow-sm relative overflow-hidden">
<div className="absolute inset-0 bg-primary/10"></div>
<span className="material-symbols-outlined text-3xl">menu_book</span>
</div>
<div className="flex flex-col justify-between flex-1">
<div>
<span className="font-caption text-caption font-mono text-primary bg-soft-blue px-1.5 py-0.5 rounded">BC-4311-09</span>
<h4 className="font-body-medium text-body-medium font-bold text-text-primary mt-1 line-clamp-1">Designing Data-Intensive Applications</h4>
<p className="font-caption text-caption text-text-secondary">Martin Kleppmann • O'Reilly</p>
</div>
<div className="mt-2 pt-2 bg-surface-container-lowest/70 p-2 rounded-lg flex items-center justify-between">
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary">Due Date</span>
<span className="font-small text-small font-bold text-text-primary">Nov 04, 2026</span>
</div>
<span className="inline-flex items-center gap-1 font-caption text-caption font-bold text-status-available">
<span className="material-symbols-outlined text-sm">schedule</span> 9 Days Left
                    </span>
</div>
</div>
</div>
</div>
</div>
{/* TAB 2: Holds History (Hidden initially) */}
<div className="hidden flex-col gap-space-sm" id="tabContent-holds">
<div className="bg-surface-container-low rounded-xl p-space-md flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-lg bg-soft-blue text-primary flex items-center justify-center">
<span className="material-symbols-outlined">bookmark</span>
</div>
<div>
<h4 className="font-body-medium text-body-medium font-bold text-text-primary">Computer Networks: A Systems Approach</h4>
<p className="font-caption text-caption text-text-secondary">Hold Reservation #HLD-4419 • Shelf Bay 03 Ready for Pickup</p>
</div>
</div>
<div className="text-right">
<span className="inline-flex items-center px-2.5 py-1 rounded-full bg-action-green/30 text-text-primary font-caption text-caption font-bold">Ready at Front Desk</span>
<p className="font-caption text-caption text-text-secondary mt-1">Expires Oct 28, 5:00 PM</p>
</div>
</div>
</div>
{/* TAB 3: Past Borrowing Ledger (Hidden initially) */}
<div className="hidden flex-col gap-space-sm" id="tabContent-ledger">
<div className="overflow-x-auto bg-surface-container-low rounded-xl">
<table className="w-full text-left font-caption text-caption">
<thead className="bg-surface-container text-text-secondary uppercase">
<tr>
<th className="p-3">Transaction</th>
<th className="p-3">Title</th>
<th className="p-3">Borrow Date</th>
<th className="p-3">Return Date</th>
<th className="p-3">Fine Assessed</th>
<th className="p-3">Status</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container-high/40 text-on-surface">
<tr>
<td className="p-3 font-mono font-bold">TX-99042</td>
<td className="p-3 font-medium">Clean Architecture (Robert Martin)</td>
<td className="p-3">Sep 12, 2026</td>
<td className="p-3">Sep 25, 2026</td>
<td className="p-3 font-bold text-status-available">₱0.00</td>
<td className="p-3"><span className="px-2 py-0.5 rounded bg-surface-container text-text-primary font-semibold">Returned On-Time</span></td>
</tr>
<tr>
<td className="p-3 font-mono font-bold">TX-84110</td>
<td className="p-3 font-medium">Modern Operating Systems (Tanenbaum)</td>
<td className="p-3">Aug 15, 2026</td>
<td className="p-3">Aug 28, 2026</td>
<td className="p-3 font-bold text-status-available">₱0.00</td>
<td className="p-3"><span className="px-2 py-0.5 rounded bg-surface-container text-text-primary font-semibold">Returned On-Time</span></td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
{/* Read-Only Notice Box */}
<div className="p-space-sm rounded-xl bg-surface-container flex items-center justify-between text-caption text-caption text-text-secondary">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-base">info</span>
<span className="">Cashier privileges limited to read-only clearance validation and circulation eligibility checks. Contact Office of the Registrar for biographical corrections.</span>
</div>
<span className="font-mono">IP: 192.168.10.42 • Desk 01</span>
</div>
</div>
{/* Modal Footer Quick Actions */}
<div className="px-space-lg py-space-md bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm">
<div className="flex items-center gap-2 w-full sm:w-auto">
<button className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-space-md py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-small text-small font-semibold transition-colors" onClick={(e) => { (window as any).triggerNoticeToast?.(); }} type="button">
<span className="material-symbols-outlined text-lg">forward_to_inbox</span> Send Courtesy Account Notice
          </button>
</div>
<div className="flex items-center gap-2 w-full sm:w-auto justify-end">
<button className="px-space-md py-2.5 rounded-xl bg-surface-container text-text-secondary hover:text-text-primary font-small text-small font-medium transition-colors" onClick={(e) => { (window as any).closePatronModal?.(); }} type="button">
            Done
          </button>
<button className="inline-flex items-center gap-1.5 px-space-lg py-2.5 rounded-xl bg-action-green text-text-primary hover:bg-action-green-hover font-small text-small font-bold transition-colors shadow-sm" onClick={(e) => { (window as any).triggerClearanceModal?.(); }} type="button">
<span className="material-symbols-outlined text-lg">verified</span> Issue Clearance Certificate
          </button>
</div>
</div>
</div>
</div>
{/* Micro Interaction Toast Feedback Container */}
<div className="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none" id="noticeToast">
<div className="bg-primary text-on-primary px-space-lg py-space-md rounded-xl shadow-xl flex items-center gap-space-sm">
<span className="material-symbols-outlined text-action-green">mark_email_read</span>
<div className="flex flex-col">
<span className="font-small text-small font-bold">Courtesy Notice Transmitted</span>
<span className="font-caption text-caption text-inverse-on-surface">Account status sent to sofia.morales@univ.edu.ph</span>
</div>
</div>
</div>
</div>

    </div>
  );
};

export default CustomerLookup;
