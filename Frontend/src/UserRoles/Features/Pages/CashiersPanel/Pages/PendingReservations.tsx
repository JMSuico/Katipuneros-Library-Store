// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// PendingReservations.tsx -- Cashier Pending Reservations Queue
// Converted directly from SidebarPendingReservationPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const PendingReservations: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
(function() {
    // Reservation Dataset for Dynamic Inspection
    const reservations = {
      'KP-RES-2026-00914': {
        ref: '#KP-RES-2026-00914',
        name: 'Marcus Aurelius',
        id: 'KP-88192-A',
        dept: 'Graduate Research Scholar • CompSci',
        loans: '2 of 4 Active',
        fines: '₱0.00 (Clear)',
        bookTitle: 'Structure and Interpretation of Computer Programs',
        bookAuthor: 'Harold Abelson & Gerald Jay Sussman',
        isbn: '978-0262510875',
        barcode: 'KP-BC-4491-A',
        locker: 'Bay 01 Locker #B-04'
      },
      'KP-RES-2026-00915': {
        ref: '#KP-RES-2026-00915',
        name: 'Dr. Elena Rostova',
        id: 'KP-10492-F',
        dept: 'Faculty • Department of Computer Science',
        loans: '1 of Unlimited Active',
        fines: '₱0.00 (Clear)',
        bookTitle: 'Introduction to Algorithms (CLRS 3rd Ed)',
        bookAuthor: 'Cormen, Leiserson, Rivest, Stein',
        isbn: '978-0262033848',
        barcode: 'KP-BC-1022-C',
        locker: 'Bay 01 Locker #B-08'
      },
      'KP-RES-2026-00916': {
        ref: '#KP-RES-2026-00916',
        name: 'Mateo Santos',
        id: 'KP-45219-U',
        dept: 'Senior • Electrical Engineering',
        loans: '1 of 4 Active',
        fines: '₱0.00 (Clear)',
        bookTitle: 'Clean Code: A Handbook of Agile Craftsmanship',
        bookAuthor: 'Robert C. Martin',
        isbn: '978-0132350884',
        barcode: 'KP-BC-8941-K',
        locker: 'Bay 01 Locker #C-02'
      },
      'KP-RES-2026-00918': {
        ref: '#KP-RES-2026-00918',
        name: 'Beatrice Ramos',
        id: 'KP-99231-G',
        dept: 'Graduate • History Department',
        loans: '3 of 4 Active',
        fines: '₱0.00 (Clear)',
        bookTitle: 'The Design of Everyday Things',
        bookAuthor: 'Don Norman',
        isbn: '978-0465050659',
        barcode: 'KP-BC-3382-M',
        locker: 'Bay 01 Locker #A-12'
      },
      'KP-RES-2026-00921': {
        ref: '#KP-RES-2026-00921',
        name: 'Gabriel Tan',
        id: 'KP-31008-H',
        dept: 'Honors Scholar • Interdisciplinary',
        loans: '0 of 6 Active',
        fines: '₱0.00 (Clear)',
        bookTitle: 'Artificial Intelligence: A Modern Approach (4th Ed)',
        bookAuthor: 'Stuart Russell & Peter Norvig',
        isbn: '978-0134610993',
        barcode: 'KP-BC-6619-P',
        locker: 'Bay 01 Locker #D-01'
      }
    };

    let activeRefId = 'KP-RES-2026-00914';

    // UI Toast Trigger Helper
    function showToast(message) {
      const toast = document.getElementById('toast-notification');
      const text = document.getElementById('toast-message');
      text.textContent = message;
      toast.classList.remove('translate-y-20', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
      setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
      }, 3200);
    }

    // Inspect Reservation Function
    function inspectReservation(id) {
      activeRefId = id;
      const data = reservations[id];
      if (!data) return;

      document.getElementById('preview-target-ref').textContent = data.ref;
      document.getElementById('preview-patron-name').textContent = data.name;
      document.getElementById('preview-patron-id').textContent = 'ID: ' + data.id + ' • ' + data.dept;
      document.getElementById('preview-book-title').textContent = data.bookTitle;
      document.getElementById('preview-book-author').textContent = data.bookAuthor;

      // Update active highlight style in table
      document.querySelectorAll('.table-row-item').forEach(row => {
        if (row.getAttribute('data-id') === id) {
          row.classList.add('bg-soft-blue/20');
        } else {
          row.classList.remove('bg-soft-blue/20');
        }
      });
    }

    // Row Click Listener
    document.querySelectorAll('.table-row-item').forEach(row => {
      row.addEventListener('click', (e) => {
        // Prevent selection if clicking checkbox or action button directly
        if (e.target.closest('input[type="checkbox"]') || e.target.closest('button')) {
          return;
        }
        const id = row.getAttribute('data-id');
        inspectReservation(id);
      });
    });

    // Checkbox Selection Logic
    const selectAll = document.getElementById('select-all-checkbox');
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    const selectedCounter = document.getElementById('selected-counter');

    function updateSelectedCounter() {
      let count = 0;
      rowCheckboxes.forEach(cb => {
        if (cb.checked) count++;
      });
      selectedCounter.textContent = count;
      document.getElementById('btn-batch-approve').disabled = count === 0;
    }

    selectAll.addEventListener('change', (e) => {
      rowCheckboxes.forEach(cb => cb.checked = e.target.checked);
      updateSelectedCounter();
    });

    rowCheckboxes.forEach(cb => {
      cb.addEventListener('change', () => {
        updateSelectedCounter();
        const allChecked = Array.from<any>(rowCheckboxes).every(c => c.checked);
        selectAll.checked = allChecked;
      });
    });

    // Filtering Tabs Logic
    const filterTabs = document.querySelectorAll('.queue-filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => {
          t.classList.remove('bg-primary', 'text-on-primary', 'font-semibold');
          t.classList.add('bg-surface-container', 'text-text-secondary', 'font-medium');
        });
        tab.classList.add('bg-primary', 'text-on-primary', 'font-semibold');
        tab.classList.remove('bg-surface-container', 'text-text-secondary');

        const filter = tab.getAttribute('data-filter');
        document.querySelectorAll('.table-row-item').forEach(row => {
          const category = row.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
    });

    // Live Search Filter
    const searchInput = document.getElementById('reservation-search');
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      document.querySelectorAll('.table-row-item').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
      });
    });

    // Single Row Quick Action Buttons
    document.querySelectorAll('.btn-quick-approve').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const row = btn.closest('.table-row-item');
        const ref = row.getAttribute('data-id');
        showToast('Hold ' + ref + ' approved. Automated locker PIN dispatched.');
        row.remove();
        updateSelectedCounter();
      });
    });

    // Rejection Modal Wiring
    const modal = document.getElementById('rejection-modal');
    const rejectRefCode = document.getElementById('reject-ref-code');

    function openRejectionModal(ref) {
      rejectRefCode.textContent = ref;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeRejectionModal() {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    document.querySelectorAll('.btn-quick-reject').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const row = btn.closest('.table-row-item');
        openRejectionModal(row.getAttribute('data-id'));
      });
    });

    document.getElementById('btn-modal-reject-damage').addEventListener('click', () => {
      openRejectionModal(activeRefId);
    });

    document.getElementById('btn-modal-reject-limit').addEventListener('click', () => {
      openRejectionModal(activeRefId);
    });

    document.getElementById('btn-close-modal').addEventListener('click', closeRejectionModal);
    document.getElementById('btn-cancel-modal').addEventListener('click', closeRejectionModal);

    document.getElementById('btn-confirm-rejection').addEventListener('click', () => {
      const targetRef = rejectRefCode.textContent;
      document.querySelectorAll('.table-row-item').forEach(row => {
        if (row.getAttribute('data-id') === targetRef) {
          row.remove();
        }
      });
      closeRejectionModal();
      showToast('Reservation ' + targetRef + ' declined. Notice sent to patron.');
      updateSelectedCounter();
    });

    // Modal / Panel Confirm Approval
    document.getElementById('btn-modal-confirm-approve').addEventListener('click', () => {
      document.querySelectorAll('.table-row-item').forEach(row => {
        if (row.getAttribute('data-id') === activeRefId) {
          row.remove();
        }
      });
      showToast('Hold ' + activeRefId + ' verified. Staging PIN dispatched to Patron.');
      updateSelectedCounter();
    });

    // Batch Approve
    document.getElementById('btn-batch-approve').addEventListener('click', () => {
      const checkedRows = Array.from<any>(document.querySelectorAll('.row-checkbox:checked'));
      const count = checkedRows.length;
      if (count === 0) return;
      checkedRows.forEach(cb => {
        cb.closest('.table-row-item').remove();
      });
      showToast('Batch approved ' + count + ' reservations. All staging lockers initialized.');
      updateSelectedCounter();
    });

    // Export CSV and Refresh buttons
    document.getElementById('btn-export-csv').addEventListener('click', () => {
      showToast('Exporting intake queue sheet as CSV...');
    });

    document.getElementById('btn-refresh-queue').addEventListener('click', () => {
      showToast('Queue refreshed. Synchronized with Staging RFID Lockers.');
    });

    // Quick View Eye Icon Button
    document.querySelectorAll('.btn-view-preview').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const row = btn.closest('.table-row-item');
        inspectReservation(row.getAttribute('data-id'));
      });
    });

  })();

    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full pb-16 space-y-6">
{/* Operational Header & Live Status Metrics */}
<div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pt-2">
<div className="space-y-1">
<div className="flex items-center gap-2">
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-caption font-bold bg-soft-blue text-primary tracking-wide uppercase">
          Desk 01 • Staging Queue
        </span>
<span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption font-caption bg-surface-container text-text-secondary">
<span className="w-1.5 h-1.5 rounded-full bg-status-available animate-pulse"></span>
          RFID Staging Sync Live
        </span>
</div>
<h1 className="font-headline-2 text-headline-2 text-primary tracking-tight">Pending Reservations Queue</h1>
<p className="font-body text-small text-text-secondary max-w-3xl">
        Verify patron standing, confirm physical copy staging in staging lockers, and approve or reject borrower hold requests prior to automated dispatch.
      </p>
</div>
{/* Batch Operations & Global Bar */}
<div className="flex flex-wrap items-center gap-2.5">
<button className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-surface-container-lowest text-text-primary rounded-xl font-small text-small shadow-sm hover:bg-surface-container transition-all" id="btn-refresh-queue">
<span className="material-symbols-outlined text-lg">sync</span>
<span className="">Refresh Queue</span>
</button>
<button className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-surface-container-lowest text-text-primary rounded-xl font-small text-small shadow-sm hover:bg-surface-container transition-all" id="btn-export-csv">
<span className="material-symbols-outlined text-lg">download</span>
<span className="">Export Intake Sheet (CSV)</span>
</button>
<button className="inline-flex items-center gap-2 px-4 py-2.5 bg-action-green hover:bg-action-green-hover text-text-primary rounded-xl font-body-medium text-body-medium font-bold shadow-md hover:shadow-lg transition-all active:scale-95" id="btn-batch-approve">
<span className="material-symbols-outlined text-xl">check_circle</span>
<span className="">Approve Selected (<span id="selected={true}-counter" className="">3</span>)</span>
</button>
</div>
</div>
{/* Operational Metrics & Fast-Action Summary Strip */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
<div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex items-center justify-between">
<div className="space-y-1">
<p className="font-caption text-caption text-text-secondary uppercase font-semibold">Total Pending Verification</p>
<p className="font-headline-3 text-headline-3 text-text-primary font-bold">5 Holds</p>
<span className="text-caption font-caption text-status-pending font-medium">Avg staging time: 4m 12s</span>
</div>
<div className="w-12 h-12 rounded-xl bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-2xl">pending_actions</span>
</div>
</div>
<div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex items-center justify-between">
<div className="space-y-1">
<p className="font-caption text-caption text-text-secondary uppercase font-semibold">Pickup Due Today</p>
<p className="font-headline-3 text-headline-3 text-status-danger font-bold">2 Priority</p>
<span className="text-caption font-caption text-status-danger font-medium">Auto-cancel in 4h 18m</span>
</div>
<div className="w-12 h-12 rounded-xl bg-error-container flex items-center justify-center text-error">
<span className="material-symbols-outlined text-2xl">timer</span>
</div>
</div>
<div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex items-center justify-between">
<div className="space-y-1">
<p className="font-caption text-caption text-text-secondary uppercase font-semibold">Faculty / Scholastic</p>
<p className="font-headline-3 text-headline-3 text-primary-container font-bold">1 Fast-Track</p>
<span className="text-caption font-caption text-secondary font-medium">Departmental Grant Tier A</span>
</div>
<div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
<span className="material-symbols-outlined text-2xl">school</span>
</div>
</div>
<div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex items-center justify-between">
<div className="space-y-1">
<p className="font-caption text-caption text-text-secondary uppercase font-semibold">Assigned Lockers</p>
<p className="font-headline-3 text-headline-3 text-status-available font-bold">18 / 24 Free</p>
<span className="text-caption font-caption text-text-secondary font-medium">Bay 01 Staging Unit</span>
</div>
<div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary">
<span className="material-symbols-outlined text-2xl">lock_clock</span>
</div>
</div>
</div>
{/* Filtering, Pill Tabs & Search Controls */}
<div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
{/* Category Tabs */}
<div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
<button className="queue-filter-tab px-3.5 py-1.5 rounded-full font-small text-small font-semibold bg-primary text-on-primary transition-all whitespace-nowrap" data-filter="all">
        All Pending (5)
      </button>
<button className="queue-filter-tab px-3.5 py-1.5 rounded-full font-small text-small font-medium bg-surface-container hover:bg-surface-container-high text-text-secondary transition-all whitespace-nowrap" data-filter="today">
        Due Today (2)
      </button>
<button className="queue-filter-tab px-3.5 py-1.5 rounded-full font-small text-small font-medium bg-surface-container hover:bg-surface-container-high text-text-secondary transition-all whitespace-nowrap" data-filter="tomorrow">
        Tomorrow (2)
      </button>
<button className="queue-filter-tab px-3.5 py-1.5 rounded-full font-small text-small font-medium bg-surface-container hover:bg-surface-container-high text-text-secondary transition-all whitespace-nowrap" data-filter="scholastic">
        Scholastic Priority (1)
      </button>
<button className="queue-filter-tab px-3.5 py-1.5 rounded-full font-small text-small font-medium bg-surface-container hover:bg-surface-container-high text-text-secondary transition-all whitespace-nowrap" data-filter="waitlist">
        Waitlist (0)
      </button>
</div>
{/* Search bar & Sorting */}
<div className="flex items-center gap-3 w-full lg:w-auto">
<div className="relative flex-1 lg:w-80">
<span className="material-symbols-outlined absolute left-3 top-2.5 text-text-secondary text-base">search</span>
<input className="w-full pl-9 pr-3 py-2 bg-surface-container rounded-xl text-small font-small text-on-surface placeholder:text-text-secondary outline-none focus:bg-surface-bright transition-colors" id="reservation-search" placeholder="Filter by Ref, Patron, or ISBN..." type="text" />
</div>
<div className="relative">
<select className="appearance-none bg-surface-container text-text-primary pl-3 pr-8 py-2 rounded-xl text-small font-small outline-none cursor-pointer focus:bg-surface-bright" id="sort-select">
<option value="pickup">Earliest Requested Pickup</option>
<option value="newest">Newest Request</option>
<option value="standing">Patron Standing</option>
</select>
<span className="material-symbols-outlined absolute right-2 top-2.5 text-text-secondary pointer-events-none text-base">expand_more</span>
</div>
</div>
</div>
{/* Main Split Layout: Operational Data Table & Live Action Staging Drawer */}
<div className="grid grid-cols-1 2xl:grid-cols-12 gap-6 items-start">
{/* Queue Table Column */}
<div className="2xl:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
<div className="px-5 py-3.5 bg-surface-container-low flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="font-body-medium text-body-medium font-bold text-primary">Hold Verification Records</span>
<span className="text-caption font-caption px-2 py-0.5 rounded-full bg-soft-blue text-primary font-semibold">5 requests</span>
</div>
<div className="flex items-center gap-3 text-caption font-caption text-text-secondary">
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-action-green"></span>Verified Standing</span>
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-status-pending"></span>Review Cap</span>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left text-small font-small">
<thead>
<tr className="bg-surface-container text-text-secondary uppercase text-caption font-caption tracking-wider">
<th className="py-3 px-4 w-10" scope="col">
<input defaultChecked className="w-4 h-4 rounded text-primary cursor-pointer accent-primary" id="select-all-checkbox" type="checkbox" />
</th>
<th className="py-3 px-4" scope="col">Reservation Ref</th>
<th className="py-3 px-4" scope="col">Patron Details</th>
<th className="py-3 px-4" scope="col">Requested Volume</th>
<th className="py-3 px-4" scope="col">Stacks &amp; Staging</th>
<th className="py-3 px-4" scope="col">Hold Schedule</th>
<th className="py-3 px-4" scope="col">Standing</th>
<th className="py-3 px-4 text-right" scope="col">Actions</th>
</tr>
</thead>
<tbody className="divide-y-0" id="queue-table-body">
{/* Item 1 (Active Focused) */}
<tr className="table-row-item bg-soft-blue/20 hover:bg-soft-blue/40 transition-colors cursor-pointer" data-category="today" data-id="KP-RES-2026-00914">
<td className="py-4 px-4 align-top">
<input defaultChecked className="row-checkbox w-4 h-4 rounded cursor-pointer accent-primary" type="checkbox" />
</td>
<td className="py-4 px-4 align-top">
<div className="flex flex-col">
<span className="font-bold text-primary font-body-medium">#KP-RES-2026-00914</span>
<span className="font-caption text-caption text-text-secondary">Logged 08:30 AM</span>
<span className="inline-flex items-center gap-1 mt-1 text-caption font-caption px-1.5 py-0.5 rounded bg-status-danger/10 text-status-danger font-bold w-max">
                    Pick up: Today
                  </span>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex items-start gap-3">
<img className="w-9 h-9 rounded-full object-cover flex-shrink-0" data-alt="Portrait photo of Marcus Aurelius, university graduate scholar with glasses and academic attire, gentle soft library background lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDctSie5V9byXEYoY0WKjQ3GYulISR1nO4RMo4ScW8kZSdHvF0rbwHX6bvvnUS76yitPTRBFAIo9YlQF2le4j8KWBUWpZXr1YrBTYxl3vr9V7wW1YR1XC-BuGmlzs5gibnfJU41Ukvl58hyFMpxW3doAdcrh1AG5ajg-isiJ6P8dhiJc_yFrX8VAZnTQuWhKNxLgPbA1zdaKtjQc-dEgMRC6QJqqd_RhfIZbT4tstHb5s97D2JNXSCL" />
<div className="flex flex-col">
<span className="font-bold text-text-primary leading-snug">Marcus Aurelius</span>
<span className="font-caption text-caption text-text-secondary">#KP-88192-A</span>
<span className="text-caption font-caption text-secondary">Graduate Scholar • 2 Active Loans</span>
</div>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex items-start gap-2.5">
<img className="w-9 h-12 rounded object-cover shadow-sm flex-shrink-0" data-alt="Book cover of Structure and Interpretation of Computer Programs with classic wizard artwork, academic textbook style" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYD4d-jOPdWJxsotrZkQleH9C7DveEiLrcAZ9X0eO0WBl90Drn745CjvOcA6vYUoybXK1Hr_hURWJq0vw03b0C9B2A-hH9iux6Rj-fJ5j1v4-ZLESbh5thBBzZXM2cKPngakIVuUJYhPpKrt5oU8ac7-4wntnRxdaWxKXCw8fvwI6pdmDn40rXZ9AZCrFxKGqNSI476x48M90EYSX3lydlijrdkOYKRR53yYlU5Z03uqzRpJFjA4PO" />
<div className="flex flex-col">
<span className="font-bold text-text-primary line-clamp-1">SICP (2nd Edition)</span>
<span className="font-caption text-caption text-text-secondary">Abelson &amp; Sussman</span>
<span className="font-caption text-caption text-secondary font-mono">QA76.6 .A255</span>
</div>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex flex-col gap-1">
<span className="inline-flex items-center gap-1 font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container font-mono text-primary font-bold">
                    Bay 14 Shelf 3B
                  </span>
<span className="font-caption text-caption text-status-available font-semibold">4 Copies Available</span>
<span className="font-caption text-caption text-text-secondary">Locker: B-04</span>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex flex-col">
<span className="font-bold text-text-primary">Oct 26, 2:00 PM</span>
<span className="font-caption text-caption text-text-secondary">Loan Term: 14 Days</span>
<span className="font-caption text-caption text-primary">Due: Nov 09, 2026</span>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex flex-col gap-1">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption font-caption bg-status-available/15 text-status-available font-bold w-max">
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
                    Eligible • 0 Fines
                  </span>
<span className="text-caption font-caption text-text-secondary">Quota: 2/4 used</span>
</div>
</td>
<td className="py-4 px-4 align-top text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="btn-quick-approve p-1.5 rounded-lg bg-action-green text-text-primary hover:bg-action-green-hover transition-colors" title="Quick Approve">
<span className="material-symbols-outlined text-base">check</span>
</button>
<button className="btn-quick-reject p-1.5 rounded-lg bg-surface-container text-status-danger hover:bg-error-container transition-colors" title="Quick Reject">
<span className="material-symbols-outlined text-base">close</span>
</button>
<button className="btn-view-preview p-1.5 rounded-lg bg-surface-container text-primary hover:bg-soft-blue transition-colors" title="View Full Inspection">
<span className="material-symbols-outlined text-base">visibility</span>
</button>
</div>
</td>
</tr>
{/* Item 2 */}
<tr className="table-row-item hover:bg-surface-container-low transition-colors cursor-pointer" data-category="today" data-id="KP-RES-2026-00915">
<td className="py-4 px-4 align-top">
<input defaultChecked className="row-checkbox w-4 h-4 rounded cursor-pointer accent-primary" type="checkbox" />
</td>
<td className="py-4 px-4 align-top">
<div className="flex flex-col">
<span className="font-bold text-primary font-body-medium">#KP-RES-2026-00915</span>
<span className="font-caption text-caption text-text-secondary">Logged 09:05 AM</span>
<span className="inline-flex items-center gap-1 mt-1 text-caption font-caption px-1.5 py-0.5 rounded bg-status-danger/10 text-status-danger font-bold w-max">
                    Pick up: Today
                  </span>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex items-start gap-3">
<img className="w-9 h-9 rounded-full object-cover flex-shrink-0" data-alt="Portrait photo of Dr. Elena Rostova, female university professor in computer science, calm intellectual expression in campus hall" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkkF9vyFSiY3WhIB7I8Jxo_2VxuWxx4QAZ4Sk3NVqVc0SX_ju_uKp8m1kcztkd2fVYIk7qCf5NR80MdgswrwWMilm85lPkmpVGkdcPqrn4TToGfgXxO9tMM7T_FnMIiP2hCeMXjmcLda6KlXbgT2E95LbCKVfqqejqFVbZHvkJajrri8HxcVvuoyxKdUUj5ywQ8b4qA3BnJJpWqyU33kpqqoIdbuRbdSpGuwCac443Xpo64gZeVh9f" />
<div className="flex flex-col">
<span className="font-bold text-text-primary leading-snug">Dr. Elena Rostova</span>
<span className="font-caption text-caption text-text-secondary">#KP-10492-F</span>
<span className="text-caption font-caption text-secondary">Faculty • CompSci • 1 Active</span>
</div>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex items-start gap-2.5">
<img className="w-9 h-12 rounded object-cover shadow-sm flex-shrink-0" data-alt="Book cover of Introduction to Algorithms CLRS, thick blue and white technical tome on university desk" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSMoJHa5BOO2cwv_GGvQvwLifxqW4k038NazDlqbJgwxyx_RSPznsQG-3Yl0GBnOQllRx5IUjtSkvUzbJTs953GJlqp7UiW6KGPW6rWyw_Pm-d6s6c-Ix6McBzm7SiYmx2C3OR8lJX0xeN0Y2MFYaACFEIN0Qv5lYzwMUO8gOKG9t3nm4KxzY2Uhh3KBxK1N5rh8etVhT-mQacRxH4KA-uO5q3jeuRnO27lt-nISZo-EYmTbo__lBf" />
<div className="flex flex-col">
<span className="font-bold text-text-primary line-clamp-1">Introduction to Algorithms (CLRS)</span>
<span className="font-caption text-caption text-text-secondary">Cormen, Leiserson et al.</span>
<span className="font-caption text-caption text-secondary font-mono">QA76.6 .C662</span>
</div>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex flex-col gap-1">
<span className="inline-flex items-center gap-1 font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container font-mono text-primary font-bold">
                    Bay 02 Shelf 1A
                  </span>
<span className="font-caption text-caption text-status-danger font-semibold">1 Copy Left</span>
<span className="font-caption text-caption text-text-secondary">Locker: B-08</span>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex flex-col">
<span className="font-bold text-text-primary">Oct 26, 4:30 PM</span>
<span className="font-caption text-caption text-text-secondary">Loan Term: 21 Days</span>
<span className="font-caption text-caption text-primary">Due: Nov 16, 2026</span>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex flex-col gap-1">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption font-caption bg-status-available/15 text-status-available font-bold w-max">
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
                    Verified Patron
                  </span>
<span className="text-caption font-caption text-text-secondary">Faculty Unlimited</span>
</div>
</td>
<td className="py-4 px-4 align-top text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="btn-quick-approve p-1.5 rounded-lg bg-action-green text-text-primary hover:bg-action-green-hover transition-colors" title="Quick Approve">
<span className="material-symbols-outlined text-base">check</span>
</button>
<button className="btn-quick-reject p-1.5 rounded-lg bg-surface-container text-status-danger hover:bg-error-container transition-colors" title="Quick Reject">
<span className="material-symbols-outlined text-base">close</span>
</button>
<button className="btn-view-preview p-1.5 rounded-lg bg-surface-container text-primary hover:bg-soft-blue transition-colors" title="View Full Inspection">
<span className="material-symbols-outlined text-base">visibility</span>
</button>
</div>
</td>
</tr>
{/* Item 3 */}
<tr className="table-row-item hover:bg-surface-container-low transition-colors cursor-pointer" data-category="tomorrow" data-id="KP-RES-2026-00916">
<td className="py-4 px-4 align-top">
<input defaultChecked className="row-checkbox w-4 h-4 rounded cursor-pointer accent-primary" type="checkbox" />
</td>
<td className="py-4 px-4 align-top">
<div className="flex flex-col">
<span className="font-bold text-primary font-body-medium">#KP-RES-2026-00916</span>
<span className="font-caption text-caption text-text-secondary">Logged 09:12 AM</span>
<span className="inline-flex items-center gap-1 mt-1 text-caption font-caption px-1.5 py-0.5 rounded bg-surface-container text-text-secondary font-medium w-max">
                    Pick up: Tomorrow
                  </span>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex items-start gap-3">
<img className="w-9 h-9 rounded-full object-cover flex-shrink-0" data-alt="Portrait photo of Mateo Santos, Filipino engineering undergraduate student smiling in a modern campus library setting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtlx3UOvi-jicAg2WKEb3xYeDqZD5N97B_fGpo1xfSagWrDpR7Buk_Twb6dojOAOPrpb0dg5EEN0WLWQQrrF2vNElbUGhpCt3VfAeMd7N96yoOJrzcQ40_XnqzTqfngxriCM7FVtL_Rcvjdo4Mna3LQkxE2RmubOfFOLpanc4L6oGIhSny_7uunfFQOQtUrrITQIwk-PJXgB6C1HAZplMlAHB8vb77iT_XcYahPhX97aKuNM6gLJ3w" />
<div className="flex flex-col">
<span className="font-bold text-text-primary leading-snug">Mateo Santos</span>
<span className="font-caption text-caption text-text-secondary">#KP-45219-U</span>
<span className="text-caption font-caption text-secondary">Senior • Electrical Eng.</span>
</div>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex items-start gap-2.5">
<img className="w-9 h-12 rounded object-cover shadow-sm flex-shrink-0" data-alt="Book cover of Clean Code by Robert C. Martin, technical programming book layout with clean typography" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC1xKIYuV5cRlQg2SK88jgEj-IYq5agBO7gahGJvRN-ykR_TRbywK3Vd-PuN4SW4YTI6It9EaH8HKTrHYZqwY58zG511adH44YADySxaCNc00JBIBBvSuTEFHI2bPea0ByPipgdb11yMqwn18QlKn5rT1XcK7nJY9U9Pq8wqThMkgYoxdQk5cnztBNwBrybs_Yf2_ebYpenNV2MXMnYA6bIGJwQHv8z0aCKUNz1PxNIVutjISuxDfk" />
<div className="flex flex-col">
<span className="font-bold text-text-primary line-clamp-1">Clean Code</span>
<span className="font-caption text-caption text-text-secondary">Robert C. Martin</span>
<span className="font-caption text-caption text-secondary font-mono">QA76.76 .C65</span>
</div>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex flex-col gap-1">
<span className="inline-flex items-center gap-1 font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container font-mono text-primary font-bold">
                    Bay 08 Shelf 2C
                  </span>
<span className="font-caption text-caption text-status-available font-semibold">3 Copies Available</span>
<span className="font-caption text-caption text-text-secondary">Locker: C-02</span>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex flex-col">
<span className="font-bold text-text-primary">Oct 27, 10:00 AM</span>
<span className="font-caption text-caption text-text-secondary">Loan Term: 14 Days</span>
<span className="font-caption text-caption text-primary">Due: Nov 10, 2026</span>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex flex-col gap-1">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption font-caption bg-status-available/15 text-status-available font-bold w-max">
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
                    Eligible • 0 Fines
                  </span>
<span className="text-caption font-caption text-text-secondary">Quota: 1/4 used</span>
</div>
</td>
<td className="py-4 px-4 align-top text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="btn-quick-approve p-1.5 rounded-lg bg-action-green text-text-primary hover:bg-action-green-hover transition-colors" title="Quick Approve">
<span className="material-symbols-outlined text-base">check</span>
</button>
<button className="btn-quick-reject p-1.5 rounded-lg bg-surface-container text-status-danger hover:bg-error-container transition-colors" title="Quick Reject">
<span className="material-symbols-outlined text-base">close</span>
</button>
<button className="btn-view-preview p-1.5 rounded-lg bg-surface-container text-primary hover:bg-soft-blue transition-colors" title="View Full Inspection">
<span className="material-symbols-outlined text-base">visibility</span>
</button>
</div>
</td>
</tr>
{/* Item 4 */}
<tr className="table-row-item hover:bg-surface-container-low transition-colors cursor-pointer" data-category="tomorrow" data-id="KP-RES-2026-00918">
<td className="py-4 px-4 align-top">
<input className="row-checkbox w-4 h-4 rounded cursor-pointer accent-primary" type="checkbox" />
</td>
<td className="py-4 px-4 align-top">
<div className="flex flex-col">
<span className="font-bold text-primary font-body-medium">#KP-RES-2026-00918</span>
<span className="font-caption text-caption text-text-secondary">Logged 09:28 AM</span>
<span className="inline-flex items-center gap-1 mt-1 text-caption font-caption px-1.5 py-0.5 rounded bg-surface-container text-text-secondary font-medium w-max">
                    Pick up: Tomorrow
                  </span>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex items-start gap-3">
<img className="w-9 h-9 rounded-full object-cover flex-shrink-0" data-alt="Portrait photo of Beatrice Ramos, young university researcher with thoughtful expression in sunlit academic archives" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5_iCzLSInok5w5KaooOrXOlopINZGHXiaE7_fEl5PQYnM3ipnQlx7YZ99xQouy_CKCIVCZW3mUCFS_iOVHRtONq1TEuTCGMupFidCGCJ_uYHXPCItJsqogReJ-0ZWa5GU8gu_MbOMQhfTKR7sKdVnB0OlvZ_TgLz8BrEuwXUhPQWn2UTiCOEzOe5YZFPa8KYTybNKqFUbb25EY_73sDe264rmYxdejb-naXvpb5DQQCDDTu915FAY" />
<div className="flex flex-col">
<span className="font-bold text-text-primary leading-snug">Beatrice Ramos</span>
<span className="font-caption text-caption text-text-secondary">#KP-99231-G</span>
<span className="text-caption font-caption text-secondary">Graduate • History</span>
</div>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex items-start gap-2.5">
<img className="w-9 h-12 rounded object-cover shadow-sm flex-shrink-0" data-alt="Book cover of The Design of Everyday Things by Don Norman with teapot graphic, academic publication" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-nnTo24XHEmGokpLns-5tIcXm0CK5Fjrqjwj-prMit2TCgGjKKRrtZcd5IrzNIL33JIPxaHn2sZPQ97xd3j0VMgdXFeKQGMjeXtJeR38PnW0Bb0BYJl6-iqIXmQgxou5is9NNVOwFqN_mmP-HrwrBGNwfPk6LEbccutbgyVs3VNu4OgHwtUwDeao2x6opSxPePGgC-W_I6YNrzZmDkGPW0AUM5YBvGmA0VTahKLoHypKkqv1rekCb" />
<div className="flex flex-col">
<span className="font-bold text-text-primary line-clamp-1">Design of Everyday Things</span>
<span className="font-caption text-caption text-text-secondary">Don Norman</span>
<span className="font-caption text-caption text-secondary font-mono">TS171.4 .N67</span>
</div>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex flex-col gap-1">
<span className="inline-flex items-center gap-1 font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container font-mono text-primary font-bold">
                    Bay 04 Shelf 4A
                  </span>
<span className="font-caption text-caption text-status-available font-semibold">2 Copies Available</span>
<span className="font-caption text-caption text-text-secondary">Locker: A-12</span>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex flex-col">
<span className="font-bold text-text-primary">Oct 27, 2:15 PM</span>
<span className="font-caption text-caption text-text-secondary">Loan Term: 14 Days</span>
<span className="font-caption text-caption text-primary">Due: Nov 10, 2026</span>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex flex-col gap-1">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption font-caption bg-status-pending/15 text-status-pending font-bold w-max">
<span className="w-1.5 h-1.5 rounded-full bg-status-pending"></span>
                    Near Quota Cap
                  </span>
<span className="text-caption font-caption text-text-secondary">Quota: 3/4 used</span>
</div>
</td>
<td className="py-4 px-4 align-top text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="btn-quick-approve p-1.5 rounded-lg bg-action-green text-text-primary hover:bg-action-green-hover transition-colors" title="Quick Approve">
<span className="material-symbols-outlined text-base">check</span>
</button>
<button className="btn-quick-reject p-1.5 rounded-lg bg-surface-container text-status-danger hover:bg-error-container transition-colors" title="Quick Reject">
<span className="material-symbols-outlined text-base">close</span>
</button>
<button className="btn-view-preview p-1.5 rounded-lg bg-surface-container text-primary hover:bg-soft-blue transition-colors" title="View Full Inspection">
<span className="material-symbols-outlined text-base">visibility</span>
</button>
</div>
</td>
</tr>
{/* Item 5 */}
<tr className="table-row-item hover:bg-surface-container-low transition-colors cursor-pointer" data-category="scholastic" data-id="KP-RES-2026-00921">
<td className="py-4 px-4 align-top">
<input className="row-checkbox w-4 h-4 rounded cursor-pointer accent-primary" type="checkbox" />
</td>
<td className="py-4 px-4 align-top">
<div className="flex flex-col">
<span className="font-bold text-primary font-body-medium">#KP-RES-2026-00921</span>
<span className="font-caption text-caption text-text-secondary">Logged 09:35 AM</span>
<span className="inline-flex items-center gap-1 mt-1 text-caption font-caption px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold w-max">
                    Scholastic Grant
                  </span>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex items-start gap-3">
<img className="w-9 h-9 rounded-full object-cover flex-shrink-0" data-alt="Portrait photo of Gabriel Tan, university honors scholar reading notes in bright academic library setting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBt8qRUZ46b1qgyX2Gy1Av9kD_q3eySys-jam3utvV30R5v59XGUL7V6yV0tUQtsyGjqAvypOuxtUoD6c_ABJYi9WguynZOywF2T5_EwFOjhinq4PoGDGmckRlUrQVHbBiyqpWjLan19cKYuNjjzS2ad_OQk85McE4R63_DoDbY-bveEIjRlVHhQqhhRklyi_j_qhh55GjiEEwK79n9n-A2_gSTu4IB-8l7hcpdC43CVmb_y_z3kbsD" />
<div className="flex flex-col">
<span className="font-bold text-text-primary leading-snug">Gabriel Tan</span>
<span className="font-caption text-caption text-text-secondary">#KP-31008-H</span>
<span className="text-caption font-caption text-secondary">Honors Scholar • 0 Active</span>
</div>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex items-start gap-2.5">
<img className="w-9 h-12 rounded object-cover shadow-sm flex-shrink-0" data-alt="Book cover of Artificial Intelligence A Modern Approach by Russell and Norvig, comprehensive academic textbook" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCix5Glci2tZQNcmky84gfNZ_LzAu3xFWE7p1TAsj3WiUFasWQVhYbXCDZQQfUqaew4EwhuKO4H25xdyjvVlT65CxMcspQq2N1fSRJBvhaLbA46scgDLCFdCCFTjJ8_ga-fxmiGO3G4vAoRhaRnsOu9sQ3hkCg0skPyuZN03aDLpsI-KgDfdNoZ-ctlX10jzyfRLsBW6OGLPCbv0r24S7Df9bNv8bWqTVv-qaki_xOtdLRwgNpdIS7E" />
<div className="flex flex-col">
<span className="font-bold text-text-primary line-clamp-1">Artificial Intelligence (4th Ed)</span>
<span className="font-caption text-caption text-text-secondary">Russell &amp; Norvig</span>
<span className="font-caption text-caption text-secondary font-mono">Q335 .R87</span>
</div>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex flex-col gap-1">
<span className="inline-flex items-center gap-1 font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container font-mono text-primary font-bold">
                    Bay 11 Shelf 1D
                  </span>
<span className="font-caption text-caption text-status-available font-semibold">5 Copies Available</span>
<span className="font-caption text-caption text-text-secondary">Locker: D-01</span>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex flex-col">
<span className="font-bold text-text-primary">Oct 28, 11:30 AM</span>
<span className="font-caption text-caption text-text-secondary">Loan Term: 21 Days</span>
<span className="font-caption text-caption text-primary">Due: Nov 18, 2026</span>
</div>
</td>
<td className="py-4 px-4 align-top">
<div className="flex flex-col gap-1">
<span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption font-caption bg-status-available/15 text-status-available font-bold w-max">
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
                    Dean's Scholar
                  </span>
<span className="text-caption font-caption text-text-secondary">Quota: 0/6 used</span>
</div>
</td>
<td className="py-4 px-4 align-top text-right">
<div className="flex items-center justify-end gap-1.5">
<button className="btn-quick-approve p-1.5 rounded-lg bg-action-green text-text-primary hover:bg-action-green-hover transition-colors" title="Quick Approve">
<span className="material-symbols-outlined text-base">check</span>
</button>
<button className="btn-quick-reject p-1.5 rounded-lg bg-surface-container text-status-danger hover:bg-error-container transition-colors" title="Quick Reject">
<span className="material-symbols-outlined text-base">close</span>
</button>
<button className="btn-view-preview p-1.5 rounded-lg bg-surface-container text-primary hover:bg-soft-blue transition-colors" title="View Full Inspection">
<span className="material-symbols-outlined text-base">visibility</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
{/* Table Footer / Pagination */}
<div className="px-5 py-3.5 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-3 text-caption font-caption text-text-secondary">
<div className="">Showing <span className="font-bold text-text-primary">5</span> of <span className="font-bold text-text-primary">5</span> queue records • Auto-refreshes every 60s</div>
<div className="flex items-center gap-2">
<span className="px-2 py-1 bg-surface-container-lowest rounded shadow-xs font-mono font-bold text-primary">Bay 01 Terminal Live</span>
</div>
</div>
</div>
{/* Interactive Approval & Inspection Panel (Desktop Split-View / Operational Slideover) */}
<div className="2xl:col-span-4 bg-surface-container-lowest rounded-xl shadow-md p-5 flex flex-col space-y-5 sticky top-20" id="reservation-inspection-panel">
{/* Panel Header */}
<div className="flex items-center justify-between pb-3 border-b-0">
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-lg">verified_user</span>
</div>
<div>
<h2 className="font-headline-4 text-headline-4 text-primary leading-tight">Hold Inspection</h2>
<span className="font-caption text-caption text-text-secondary">Active Target: <strong className="text-text-primary" id="preview-target-ref">#KP-RES-2026-00914</strong></span>
</div>
</div>
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-caption font-bold bg-action-green/20 text-text-primary">
<span className="w-2 h-2 rounded-full bg-action-green"></span>
          Ready to Stage
        </span>
</div>
{/* Patron Profile Section */}
<div className="bg-surface-container-low p-4 rounded-xl space-y-3">
<div className="flex items-center justify-between">
<span className="text-caption font-caption uppercase tracking-wider font-bold text-text-secondary">Patron Verification</span>
<span className="text-caption font-caption px-2 py-0.5 rounded-full bg-status-available text-on-primary font-bold">Good Standing</span>
</div>
<div className="flex items-center gap-3.5">
<img className="w-12 h-12 rounded-full object-cover shadow-sm" data-alt="Close up verification portrait of student Marcus Aurelius, crisp academic photograph in light blue tones" id="preview-patron-avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwHU0TPVWaTIhKwTr3cI6WBTURPTkCtxlk7UpnlLeCIY-jNRZTf2z8PAnFjZJz3qFCmrNtICalFdFI2cjFS2qulvC3gRHih9sKLBy5SqHt-gd79vm6Ywk9ZYOqx4xhDaP4Cy6L8aonUQiLxKr_4J3D6VdQV5YMsmMYQwPXFn_l6guqB0QzSCTNOTzPRt6FFAnFuiPwyRSoDVkjrSU5ibKp_wVB8U8EaYI3AhLSdYtOw7GvJus4L8zF" />
<div>
<h3 className="font-body-large text-body-large font-bold text-text-primary leading-tight" id="preview-patron-name">Marcus Aurelius</h3>
<p className="font-caption text-caption text-text-secondary" id="preview-patron-id">ID: KP-88192-A • Department of Computer Science</p>
<p className="font-caption text-caption text-primary font-medium">Graduate Research Scholar</p>
</div>
</div>
{/* Verification Pills Matrix */}
<div className="grid grid-cols-2 gap-2 pt-1 text-caption font-caption">
<div className="bg-surface-container-lowest p-2 rounded-lg">
<span className="text-text-secondary block">Outstanding Fines</span>
<span className="font-bold text-status-available font-mono">₱0.00 (Clear)</span>
</div>
<div className="bg-surface-container-lowest p-2 rounded-lg">
<span className="text-text-secondary block">Borrow Quota</span>
<span className="font-bold text-text-primary font-mono">2 of 4 Active</span>
</div>
<div className="bg-surface-container-lowest p-2 rounded-lg">
<span className="text-text-secondary block">Historical On-Time</span>
<span className="font-bold text-text-primary font-mono">98.4% Return Rate</span>
</div>
<div className="bg-surface-container-lowest p-2 rounded-lg">
<span className="text-text-secondary block">Library Clearance</span>
<span className="font-bold text-status-available">Valid thru May 2027</span>
</div>
</div>
</div>
{/* Item Staging Verification Section */}
<div className="bg-surface-container-low p-4 rounded-xl space-y-3">
<div className="flex items-center justify-between">
<span className="text-caption font-caption uppercase tracking-wider font-bold text-text-secondary">Physical Copy Assignment</span>
<span className="font-caption text-caption font-mono font-semibold text-primary">RFID Scanned</span>
</div>
<div className="flex gap-3">
<img className="w-12 h-16 rounded object-cover shadow-sm flex-shrink-0" data-alt="Textbook cover of Structure and Interpretation of Computer Programs with MIT Press seal in university library" id="preview-book-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_U4hds0M0vqoHJjia-az17Hnd9UiioKME3hWZGV6CNJn0xO1B296T3BFuLneTKhagg7ya3bfo2MfTHYT0JPmv2JB2LlLuP_N__j-s3W1iursxsyEn_t-BbC6LgYDCRffGZshbKJk1QFJ7u2GjYEQ8G_GE0sEThPdOmgDCmDItQauehq7FuasTOph4S3eHaaDxA6KBiOCZDz5ppSMFJ60CnOQPzMCJOad8b_pNKXZbmS8cnqOKh9Ft" />
<div className="space-y-0.5">
<h4 className="font-body-medium text-body-medium font-bold text-text-primary line-clamp-1" id="preview-book-title">Structure and Interpretation of Computer Programs</h4>
<p className="font-caption text-caption text-text-secondary" id="preview-book-author">Harold Abelson &amp; Gerald Jay Sussman</p>
<p className="font-caption text-caption font-mono text-secondary">ISBN: 978-0262510875</p>
</div>
</div>
{/* Staging Locker & Physical Copy Tag */}
<div className="p-3 bg-surface-container-lowest rounded-lg space-y-2">
<div className="flex items-center justify-between text-caption font-caption">
<span className="text-text-secondary">Matched Barcode ID:</span>
<span className="font-mono font-bold text-primary">KP-BC-4491-A</span>
</div>
<div className="flex items-center justify-between text-caption font-caption">
<span className="text-text-secondary">Staging Locker Assignment:</span>
<span className="font-bold text-text-primary bg-soft-blue text-primary px-2 py-0.5 rounded font-mono">Bay 01 Locker #B-04</span>
</div>
<div className="flex items-center justify-between text-caption font-caption">
<span className="text-text-secondary">Pickup Expiry Window:</span>
<span className="font-bold text-status-danger">48 Hours from Approval</span>
</div>
</div>
</div>
{/* Optional Override Notice */}
<div className="p-3 bg-soft-blue/30 rounded-xl flex items-start gap-2.5">
<span className="material-symbols-outlined text-primary text-lg flex-shrink-0">info</span>
<p className="font-caption text-caption text-text-primary leading-tight">
          Approving this hold will trigger an automated SMS/Email notification to the patron containing their one-time smart locker PIN code.
        </p>
</div>
{/* Primary Confirmation Actions */}
<div className="pt-2 space-y-2.5">
<button className="w-full py-3 px-4 bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98" id="btn-modal-confirm-approve">
<span className="material-symbols-outlined text-xl">mark_email_read</span>
<span className="">Confirm Approval &amp; Dispatch PIN</span>
</button>
<div className="grid grid-cols-2 gap-2">
<button className="py-2.5 px-3 bg-surface-container hover:bg-error-container text-status-danger hover:text-on-error-container font-caption text-caption font-bold rounded-xl transition-colors flex items-center justify-center gap-1" id="btn-modal-reject-damage">
<span className="material-symbols-outlined text-sm">broken_image</span>
<span className="">Reject: Damaged</span>
</button>
<button className="py-2.5 px-3 bg-surface-container hover:bg-error-container text-status-danger hover:bg-error-container font-caption text-caption font-bold rounded-xl transition-colors flex items-center justify-center gap-1" id="btn-modal-reject-limit">
<span className="material-symbols-outlined text-sm">block</span>
<span className="">Reject: Limit Hit</span>
</button>
</div>
</div>
</div>
</div>
{/* Rejection Reason Modal (Hidden by Default) */}
<div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm hidden items-center justify-center p-4" id="rejection-modal">
<div className="bg-surface-container-lowest max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2 text-status-danger">
<span className="material-symbols-outlined text-2xl">cancel</span>
<h3 className="font-headline-4 text-headline-4 font-bold text-text-primary">Decline Reservation Hold</h3>
</div>
<button className="p-1 rounded-lg text-text-secondary hover:bg-surface-container" id="btn-close-modal">
<span className="material-symbols-outlined">close</span>
</button>
</div>
<p className="font-small text-small text-text-secondary">
        Please confirm the operational cause for rejecting reservation reference <strong className="text-text-primary" id="reject-ref-code">#KP-RES-2026-00914</strong>. The patron will receive an immediate resolution message.
      </p>
<div className="space-y-2">
<label className="block font-caption text-caption font-bold text-text-primary uppercase">Official Rejection Reason</label>
<select className="w-full p-2.5 bg-surface-container rounded-xl text-small font-small outline-none focus:bg-surface-bright text-text-primary">
<option>Physical copy damaged during pull / unreadable barcode</option>
<option>Item misplaced in stacks / Inventory reconciliation required={true}</option>
<option>Patron exceeded maximum concurrent loan allowance</option>
<option>Overdue fines pending on account (&gt; ₱150 threshold)</option>
<option>Course reserve shelf lock / restricted instructor copy</option>
</select>
</div>
<div className="space-y-2">
<label className="block font-caption text-caption font-bold text-text-primary uppercase">Staff Resolution Notes</label>
<textarea className="w-full p-2.5 bg-surface-container rounded-xl text-small font-small outline-none focus:bg-surface-bright text-text-primary" placeholder="Optional notes visible to circulation supervisor..." rows={3}></textarea>
</div>
<div className="flex items-center justify-end gap-2 pt-2">
<button className="px-4 py-2 bg-surface-container text-text-primary font-small text-small font-medium rounded-xl hover:bg-surface-container-high transition-colors" id="btn-cancel-modal">
          Cancel
        </button>
<button className="px-4 py-2 bg-error text-on-error font-small text-small font-bold rounded-xl hover:bg-error/90 transition-colors shadow-sm" id="btn-confirm-rejection">
          Confirm Decline
        </button>
</div>
</div>
</div>
{/* Toast Notification Container for Feedback */}
<div className="fixed bottom-6 right-6 z-50 transform translate-y-20 opacity-0 transition-all duration-300 pointer-events-none flex items-center gap-3 px-4 py-3 bg-text-primary text-on-primary rounded-xl shadow-xl" id="toast-notification">
<span className="material-symbols-outlined text-action-green">check_circle</span>
<span className="font-small text-small" id="toast-message">Action completed successfully.</span>
</div>
</div>
{/* Client-side Interactive Logic */}

    </div>
  );
};

export default PendingReservations;
