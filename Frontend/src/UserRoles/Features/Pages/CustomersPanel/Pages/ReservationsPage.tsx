// [Layer: UserRoles/Features/Pages/CustomersPanel/Pages]
// ReservationsPage.tsx -- Customer Active Holds and Locker Pickups
// Converted directly from NavReservationPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const ReservationsPage: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
function openCancelModal() {
      const modal = document.getElementById('cancelModal');
      if (modal) {
        modal.classList.remove('hidden');
      }
    }

    function closeCancelModal() {
      const modal = document.getElementById('cancelModal');
      if (modal) {
        modal.classList.add('hidden');
      }
    }

    function showToast(msg: string) {
      const toast = document.getElementById('toastNotification');
      const text = document.getElementById('toastMessage');
      if (toast && text) {
        text.innerText = msg;
        toast.classList.remove('hidden');
        setTimeout(() => {
          toast.classList.add('hidden');
        }, 4000);
      }
    }

    function handleConfirmCancel() {
      closeCancelModal();
      showToast('Hold #KP-RES-2026-00914 cancelled and ledger updated.');
    }

    // Interactive Status Tabs Styling
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => {
          b.classList.remove('bg-primary-container', 'text-on-primary-container');
          b.classList.add('bg-chip-unselected-bg', 'text-on-surface-variant');
        });
        btn.classList.remove('bg-chip-unselected-bg', 'text-on-surface-variant');
        btn.classList.add('bg-primary-container', 'text-on-primary-container');
      });
    });

    try {
      w.openCancelModal = openCancelModal;
      w.closeCancelModal = closeCancelModal;
      w.showToast = showToast;
      w.handleConfirmCancel = handleConfirmCancel;
    } catch (_) {}
    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
{/* Subtle Ambient Glow Orbs */}
<div className="relative w-full overflow-hidden pb-space-3xl">
<div className="absolute -top-24 right-1/4 w-96 h-96 rounded-full bg-secondary-container/40 blur-3xl pointer-events-none -z-10"></div>
<div className="absolute top-72 -left-20 w-80 h-80 rounded-full bg-soft-blue/50 blur-3xl pointer-events-none -z-10"></div>
{/* Section: Header & Stat Strip */}
<div className="flex flex-col gap-space-lg pt-space-lg">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
<div className="flex flex-col gap-space-xs max-w-3xl">
<div className="flex items-center gap-space-xs">
<span className="font-caption text-caption uppercase tracking-wider text-tertiary bg-white/70 px-space-sm py-0.5 rounded-full shadow-sm">Academic Patron Ledger</span>
<span className="text-outline-variant">•</span>
<span className="font-caption text-caption text-text-secondary">AY 2026-2027 Circulation</span>
</div>
<h1 className="font-headline-1 text-headline-1 text-text-primary tracking-tight">My Book Reservations</h1>
<p className="font-body-medium text-body-medium text-text-secondary">
            Track your pending requests, approved holds ready for front-desk pickup, and active reservation ledger.
          </p>
</div>
<div className="flex items-center gap-space-sm shrink-0">
<button className="flex items-center gap-space-xs px-space-md py-space-sm bg-surface-container-lowest text-text-primary hover:bg-surface-container rounded-full shadow-sm transition-all font-small text-small" type="button">
<span className="material-symbols-outlined text-lg text-primary">sync</span>
<span className="">Refresh Ledger</span>
</button>
<a className="flex items-center gap-space-xs px-space-lg py-space-sm bg-action-green text-text-primary hover:bg-action-green-hover rounded-full shadow-sm transition-transform active:scale-95 font-body-medium text-body-medium" data-path="customer-catalog" href="#">
<span className="material-symbols-outlined text-lg">add</span>
<span className="">Reserve New Title</span>
</a>
</div>
</div>
{/* Quick Metrics Ribbon */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
<div className="bg-surface-container-lowest/80 backdrop-blur-md p-space-md rounded-xl shadow-sm flex items-center justify-between">
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary uppercase">Active Holds</span>
<span className="font-headline-2 text-headline-2 text-text-primary">02</span>
</div>
<div className="w-12 h-12 rounded-full bg-soft-blue/70 flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-2xl">menu_book</span>
</div>
</div>
<div className="bg-surface-container-lowest/80 backdrop-blur-md p-space-md rounded-xl shadow-sm flex items-center justify-between">
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary uppercase">Ready for Pickup</span>
<div className="flex items-center gap-space-xs">
<span className="font-headline-2 text-headline-2 text-text-primary">01</span>
<span className="w-2.5 h-2.5 rounded-full bg-action-green animate-ping"></span>
</div>
</div>
<div className="w-12 h-12 rounded-full bg-action-green/20 flex items-center justify-center text-text-primary">
<span className="material-symbols-outlined text-2xl">counter_1</span>
</div>
</div>
<div className="bg-surface-container-lowest/80 backdrop-blur-md p-space-md rounded-xl shadow-sm flex items-center justify-between">
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary uppercase">Completed History</span>
<span className="font-headline-2 text-headline-2 text-text-primary">14</span>
</div>
<div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-text-secondary">
<span className="material-symbols-outlined text-2xl">verified</span>
</div>
</div>
<div className="bg-surface-container-lowest/80 backdrop-blur-md p-space-md rounded-xl shadow-sm flex items-center justify-between">
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary uppercase">Cancelled / Expired</span>
<span className="font-headline-2 text-headline-2 text-text-secondary">01</span>
</div>
<div className="w-12 h-12 rounded-full bg-error-container/40 flex items-center justify-center text-status-danger">
<span className="material-symbols-outlined text-2xl">cancel</span>
</div>
</div>
</div>
</div>
{/* Section: Filter Chips & Search Bar */}
<div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md mt-space-xl">
{/* Status Tabs */}
<div className="flex items-center gap-space-xs overflow-x-auto pb-space-xs md:pb-0 scrollbar-none" id="statusTabs">
<button className="tab-btn px-space-md py-space-xs rounded-full font-small text-small text-on-primary-container bg-primary-container shadow-sm shrink-0 transition-colors" type="button">
          All Reservations
        </button>
<button className="tab-btn px-space-md py-space-xs rounded-full font-small text-small text-on-surface-variant bg-chip-unselected-bg hover:bg-surface-container-highest shadow-sm shrink-0 transition-colors" type="button">
          Pending Approval <span className="ml-1 font-caption bg-status-pending/20 text-text-primary px-1.5 py-0.2 rounded-full">1</span>
</button>
<button className="tab-btn px-space-md py-space-xs rounded-full font-small text-small text-on-surface-variant bg-chip-unselected-bg hover:bg-surface-container-highest shadow-sm shrink-0 transition-colors" type="button">
          Ready for Pickup <span className="ml-1 font-caption bg-action-green/30 text-text-primary px-1.5 py-0.2 rounded-full">1</span>
</button>
<button className="tab-btn px-space-md py-space-xs rounded-full font-small text-small text-on-surface-variant bg-chip-unselected-bg hover:bg-surface-container-highest shadow-sm shrink-0 transition-colors" type="button">
          Completed History (14)
        </button>
<button className="tab-btn px-space-md py-space-xs rounded-full font-small text-small text-on-surface-variant bg-chip-unselected-bg hover:bg-surface-container-highest shadow-sm shrink-0 transition-colors" type="button">
          Cancelled (1)
        </button>
</div>
{/* Quick Shelf Filter Search */}
<div className="flex items-center bg-surface-container-lowest/90 px-space-md py-space-xs rounded-full shadow-sm max-w-sm w-full">
<span className="material-symbols-outlined text-text-secondary text-lg mr-space-xs">filter_list</span>
<input className="w-full bg-transparent font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none" placeholder="Filter by Title or Hold ID..." type="text" />
</div>
</div>
{/* Section: Active Queue Cards Grid */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mt-space-lg">
{/* Card 1: Ready for Pickup (Green Attention) */}
<div className="lg:col-span-7 bg-surface-container-lowest/90 backdrop-blur-xl rounded-xl p-space-lg shadow-md hover:shadow-lg transition-all flex flex-col justify-between relative overflow-hidden">
{/* Status Top Accent Tag */}
<div className="flex items-start justify-between gap-space-md pb-space-md">
<div className="flex items-center gap-space-sm">
<span className="flex items-center gap-1.5 px-space-md py-1 rounded-full bg-action-green text-text-primary font-caption text-caption shadow-sm">
<span className="w-2 h-2 rounded-full bg-text-primary"></span>
              Ready for Pickup
            </span>
<span className="font-caption text-caption text-text-secondary tracking-mono">#KP-RES-2026-00892</span>
</div>
<span className="font-caption text-caption bg-secondary-container/50 text-on-secondary-container px-space-sm py-1 rounded-full">Front Desk Bay 01</span>
</div>
<div className="flex flex-col sm:flex-row gap-space-lg my-space-sm">
{/* Book Cover Placeholder */}
<div className="relative w-full sm:w-36 h-52 shrink-0 rounded-lg overflow-hidden shadow-md bg-surface-variant">
<img className="w-full h-full object-cover" data-alt="Classic vintage book cover of The Great Gatsby by F. Scott Fitzgerald featuring art deco typography and deep midnight blue and gold architectural motifs set on an academic walnut desk." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLmMQxa0MhDygUedPnziu6QXqjmkjEqTd_ZuxvmnfJoTenU-RtVrGARYjnnPHawQObi4OG4YKy18hTMi4SRqzxjoMO6ijA4Dh4Rdx_-Xn3oQps0Onyl8DU-ot8bEwm0vGe2ExuoFC19043daG4-kukhGsNViT7L8G7Q9ruE2PsLJJ1bRmfANgvRcaVX8bgXG72wcqtcw0hXwNiClZ7VatrF58SJvsAmt_aTNBoRjtvMAMHG7o0EBSF" />
<div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-text-primary/90 to-transparent">
<span className="font-caption text-caption text-surface-container-lowest block truncate">Stacks: Shelf C-12</span>
</div>
</div>
{/* Reservation Details Content */}
<div className="flex flex-col justify-between flex-1 min-w-0">
<div>
<div className="flex items-center gap-space-xs text-primary font-small text-small mb-1">
<span className="material-symbols-outlined text-base">local_library</span>
<span className="">American Literature • Hardcover Special</span>
</div>
<h2 className="font-headline-3 text-headline-3 text-text-primary truncate">The Great Gatsby</h2>
<p className="font-small text-small text-text-secondary">by F. Scott Fitzgerald • Charles Scribner's Sons</p>
{/* Dynamic Highlight Bar: Expiration Countdown */}
<div className="mt-space-md p-space-sm rounded-lg bg-secondary-fixed/50 flex flex-col gap-1">
<div className="flex items-center justify-between text-on-secondary-fixed font-caption text-caption">
<span className="flex items-center gap-1 font-medium">
<span className="material-symbols-outlined text-base">alarm</span>
                    Pickup Deadline
                  </span>
<span className="font-medium text-text-primary">Today by 8:00 PM PHT</span>
</div>
{/* Progress Line for Hold Time */}
<div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mt-1">
<div className="h-full bg-action-green rounded-full w-3/4"></div>
</div>
<span className="font-caption text-caption text-text-secondary text-right">Hold expires in 5 hours, 42 minutes</span>
</div>
</div>
{/* Loan Metadata Badges */}
<div className="grid grid-cols-2 gap-space-xs mt-space-md pt-space-xs">
<div className="bg-surface-container-low p-space-xs rounded-lg">
<span className="font-caption text-caption text-text-secondary block">Checkout Loan</span>
<span className="font-small text-small text-text-primary font-medium">14 Days Window</span>
</div>
<div className="bg-surface-container-low p-space-xs rounded-lg">
<span className="font-caption text-caption text-text-secondary block">Assigned Locker</span>
<span className="font-small text-small text-text-primary font-medium">Drawer #B-04</span>
</div>
</div>
</div>
</div>
{/* Rapid Front Desk Scanner Strip & Actions */}
<div className="mt-space-md pt-space-md flex flex-col md:flex-row items-center justify-between gap-space-md bg-surface-container-low/60 -mx-space-lg -mb-space-lg p-space-lg rounded-b-xl">
<div className="flex items-center gap-space-md w-full md:w-auto">
{/* Inline SVG Rapid Barcode */}
<div className="p-2 bg-surface-container-lowest rounded-lg shadow-sm flex items-center justify-center shrink-0">
<svg className="w-32 h-10 text-text-primary" fill="currentColor" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
<rect height="40" width="3" x="0" y="0"></rect>
<rect height="40" width="2" x="5" y="0"></rect>
<rect height="40" width="5" x="9" y="0"></rect>
<rect height="40" width="2" x="16" y="0"></rect>
<rect height="40" width="4" x="20" y="0"></rect>
<rect height="40" width="2" x="26" y="0"></rect>
<rect height="40" width="6" x="30" y="0"></rect>
<rect height="40" width="2" x="38" y="0"></rect>
<rect height="40" width="3" x="42" y="0"></rect>
<rect height="40" width="5" x="47" y="0"></rect>
<rect height="40" width="2" x="54" y="0"></rect>
<rect height="40" width="4" x="58" y="0"></rect>
<rect height="40" width="3" x="64" y="0"></rect>
<rect height="40" width="6" x="69" y="0"></rect>
<rect height="40" width="2" x="77" y="0"></rect>
<rect height="40" width="4" x="81" y="0"></rect>
<rect height="40" width="2" x="87" y="0"></rect>
<rect height="40" width="5" x="91" y="0"></rect>
<rect height="40" width="3" x="98" y="0"></rect>
<rect height="40" width="4" x="103" y="0"></rect>
<rect height="40" width="2" x="109" y="0"></rect>
<rect height="40" width="4" x="113" y="0"></rect>
</svg>
</div>
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary">Express Verification Code</span>
<span className="font-small text-small text-text-primary font-medium">SCAN-BAY1-892</span>
</div>
</div>
<div className="flex items-center gap-space-xs w-full md:w-auto justify-end">
<button className="px-space-md py-space-xs bg-surface-container-lowest text-text-primary hover:bg-surface-container rounded-full shadow-sm font-small text-small transition-colors flex items-center gap-1" onClick={() => alert('Digital pickup slip #KP-RES-2026-00892 downloaded to your academic credentials.')} type="button">
<span className="material-symbols-outlined text-base">download</span>
<span className="">Patron Slip</span>
</button>
<button className="px-space-lg py-space-xs bg-action-green text-text-primary hover:bg-action-green-hover rounded-full shadow-sm font-small text-small font-medium transition-transform active:scale-95 flex items-center gap-1" onClick={() => { document.getElementById('pickupModal')?.classList.remove('hidden'); }} type="button">
<span className="material-symbols-outlined text-base">directions_walk</span>
<span className="">Pickup Guide</span>
</button>
</div>
</div>
</div>
{/* Card 2: Pending Approval (Amber Attention) */}
<div className="lg:col-span-5 bg-surface-container-lowest/90 backdrop-blur-xl rounded-xl p-space-lg shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
<div>
{/* Header Tag */}
<div className="flex items-start justify-between gap-space-sm pb-space-md">
<span className="flex items-center gap-1.5 px-space-md py-1 rounded-full bg-status-pending/20 text-text-primary font-caption text-caption">
<span className="material-symbols-outlined text-sm text-status-pending">hourglass_top</span>
              Pending Cashier Approval
            </span>
<span className="font-caption text-caption text-text-secondary tracking-mono">#KP-RES-2026-00914</span>
</div>
{/* Book Synopsis Mini Card */}
<div className="flex gap-space-md mt-space-xs">
<div className="w-24 h-32 shrink-0 rounded-lg overflow-hidden shadow-sm bg-surface-variant">
<img className="w-full h-full object-cover" data-alt="Cover of Structure and Interpretation of Computer Programs with the classic purple wizard illustration, academic textbooks stacked in an engineering computer lab." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8b1LMU5XEsrqA9RqowXXmv8TRPcQ6BnYxd76xEH-PTnosi-DPLzvohFUc9eVTe73rXnRukkE_SJjYbVLMcnvtBM_2gwwyUjpy-yaMNKc4vhf9xlSDnhCqq7hW8-95OLkJBzF_V00-UYfS25GAj9O1jg2MYpt2zh0T97QRdclTyVs-2ef9qZiGLvXvyXjbeCVfl--eAcAvXmdkA-jBN5VFi7I-toeSKbUFcpIqEDX_SOg7ptC796em" />
</div>
<div className="flex flex-col min-w-0">
<span className="font-caption text-caption text-tertiary">MIT Press • Computer Science</span>
<h3 className="font-headline-4 text-headline-4 text-text-primary truncate">SICP (2nd Edition)</h3>
<p className="font-small text-small text-text-secondary line-clamp-1">Harold Abelson &amp; Gerald Jay Sussman</p>
<div className="mt-space-sm flex flex-wrap gap-space-xs">
<span className="font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container text-text-secondary">Reserve Queue: #2</span>
<span className="font-caption text-caption px-2 py-0.5 rounded-full bg-secondary-fixed/40 text-on-secondary-fixed">Special Reserve</span>
</div>
</div>
</div>
{/* Timeline Request Details */}
<div className="mt-space-lg bg-surface-container-low p-space-md rounded-xl flex flex-col gap-space-sm">
<div className="flex justify-between items-center text-small font-small">
<span className="text-text-secondary">Requested Date</span>
<span className="text-text-primary font-medium">Oct 24, 2026 (09:15 AM)</span>
</div>
<div className="flex justify-between items-center text-small font-small">
<span className="text-text-secondary">Requested Duration</span>
<span className="text-text-primary font-medium">21 Days Loan</span>
</div>
<div className="flex justify-between items-center text-small font-small">
<span className="text-text-secondary">Estimated Pick-up Availability</span>
<span className="text-text-primary font-medium">Oct 26, 2026</span>
</div>
<div className="flex justify-between items-center text-small font-small">
<span className="text-text-secondary">Expected Return Date</span>
<span className="text-text-primary font-medium">Nov 14, 2026</span>
</div>
</div>
</div>
{/* Pending Actions */}
<div className="mt-space-lg pt-space-md flex items-center justify-between gap-space-sm">
<button className="px-space-md py-space-xs text-status-danger hover:bg-error-container/40 rounded-full font-small text-small transition-colors flex items-center gap-1" onClick={(e) => { (window as any).openCancelModal?.(); }} type="button">
<span className="material-symbols-outlined text-base">close</span>
<span className="">Cancel Reservation</span>
</button>
<button className="px-space-md py-space-xs bg-surface-container text-text-primary hover:bg-surface-container-high rounded-full font-small text-small transition-colors flex items-center gap-1" onClick={() => alert('Inspection view: Waiting for circulation staff verification at Central Reserve.')} type="button">
<span className="material-symbols-outlined text-base">info</span>
<span className="">Inspect Request</span>
</button>
</div>
</div>
</div>
{/* Section: Reservation History & Past Logs */}
<div className="mt-space-2xl flex flex-col gap-space-md">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
<div>
<h2 className="font-headline-3 text-headline-3 text-text-primary">Completed &amp; Historical Reservations</h2>
<p className="font-small text-small text-text-secondary">Verified record of all fulfilled circulation checkouts and released holds.</p>
</div>
{/* Table quick stats */}
<div className="flex items-center gap-space-xs text-caption font-caption text-text-secondary bg-white/60 px-space-md py-1 rounded-full shadow-sm">
<span className="">Showing 4 of 15 records</span>
<span className="">•</span>
<a className="text-primary hover:underline" href="#">Download CSV</a>
</div>
</div>
{/* High-Density Academic Table */}
<div className="w-full bg-surface-container-lowest/90 backdrop-blur-xl rounded-xl shadow-sm overflow-hidden">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low text-text-secondary font-caption text-caption uppercase tracking-wider">
<th className="py-space-md px-space-lg">Hold Reference</th>
<th className="py-space-md px-space-md">Book / Catalog Title</th>
<th className="py-space-md px-space-md">Reserved / Completed</th>
<th className="py-space-md px-space-md">Fulfillment Desk</th>
<th className="py-space-md px-space-md">Status</th>
<th className="py-space-md px-space-lg text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y-0 text-small font-small">
{/* Row 1 */}
<tr className="hover:bg-surface-container-low/40 transition-colors">
<td className="py-space-md px-space-lg font-medium text-text-primary">
                  #KP-RES-2026-00781
                  <span className="block font-caption text-caption text-text-secondary">Standard 14D</span>
</td>
<td className="py-space-md px-space-md">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-10 rounded bg-surface-container overflow-hidden shrink-0">
<img className="w-full h-full object-cover" data-alt="Clean minimal book cover of Clean Code by Robert Martin in an academic study room." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAb6Ovmm65SUDzavm7rx0f1w-fpCeb0khZWnPO1Xu1mjb-KpxNaPqb-59WAvGSvlyTleLmY_qIqNHyJ_oF0LRo7g31sv_VpQf8K5nePw1ehJMIrgSOGI7m2CLKN954t3F5fqW-LUif09cZcXHv2kKpE2lOv3tdTzprbB3xLtdfEZc7ADQ5XvciBgn9I_zM1iQezPRYR8YqUDHMmXBvbB1tecXQ3ugPmvpG8kmksRd77YxzrOoEkMooY" />
</div>
<div className="flex flex-col min-w-0">
<span className="text-text-primary font-medium truncate">Clean Code: Handbook of Agile Craft</span>
<span className="font-caption text-caption text-text-secondary">Robert C. Martin</span>
</div>
</div>
</td>
<td className="py-space-md px-space-md text-text-secondary">
<span className="">Sep 12 → Sep 13, 2026</span>
<span className="block font-caption text-caption text-status-available">Picked up on time</span>
</td>
<td className="py-space-md px-space-md text-text-primary">
<span className="">Bay 02 - Desk Officer Ramos</span>
</td>
<td className="py-space-md px-space-md">
<span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-status-available/20 text-text-primary font-caption text-caption">
<span className="material-symbols-outlined text-xs text-status-available">check_circle</span>
                    Fulfilled
                  </span>
</td>
<td className="py-space-md px-space-lg text-right">
<button className="text-primary hover:text-text-primary transition-colors font-caption text-caption underline" type="button">View Receipt</button>
</td>
</tr>
{/* Row 2 */}
<tr className="hover:bg-surface-container-low/40 transition-colors">
<td className="py-space-md px-space-lg font-medium text-text-primary">
                  #KP-RES-2026-00629
                  <span className="block font-caption text-caption text-text-secondary">Archive Reference</span>
</td>
<td className="py-space-md px-space-md">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-10 rounded bg-surface-container overflow-hidden shrink-0">
<img className="w-full h-full object-cover" data-alt="Cover of Design Patterns Elements of Reusable Object Oriented Software by Gang of Four book." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD3A22A-y3Snw6zR-6UQjcDIY7FKtB0dIlE5-645kg2qz3m6DzCkwisl6NTyXnAKd8Wb_AwOq2QpOGU9P20kbllsfo4Zpd8E4xceIoC1nrpGTtHsHpqUAq6r4V6bw56hLg42DhDusjDAChOdfYTlPhEdER3Ch5p1YacnurZ_2dcBUVCdHf0AwX-9L-qG9wMrhDXKEi27_2vJrXWlddUZ_YG4EkTML-uduBXVIx1UcyqBGgS5JjBSjNB" />
</div>
<div className="flex flex-col min-w-0">
<span className="text-text-primary font-medium truncate">Design Patterns: Elements of Reusable Software</span>
<span className="font-caption text-caption text-text-secondary">Erich Gamma et al.</span>
</div>
</div>
</td>
<td className="py-space-md px-space-md text-text-secondary">
<span className="">Aug 28 → Aug 29, 2026</span>
<span className="block font-caption text-caption text-status-available">Picked up on time</span>
</td>
<td className="py-space-md px-space-md text-text-primary">
<span className="">Bay 01 - Desk Officer Santos</span>
</td>
<td className="py-space-md px-space-md">
<span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-status-available/20 text-text-primary font-caption text-caption">
<span className="material-symbols-outlined text-xs text-status-available">check_circle</span>
                    Fulfilled
                  </span>
</td>
<td className="py-space-md px-space-lg text-right">
<button className="text-primary hover:text-text-primary transition-colors font-caption text-caption underline" type="button">View Receipt</button>
</td>
</tr>
{/* Row 3 */}
<tr className="hover:bg-surface-container-low/40 transition-colors">
<td className="py-space-md px-space-lg font-medium text-text-primary">
                  #KP-RES-2026-00511
                  <span className="block font-caption text-caption text-text-secondary">Self-Cancelled</span>
</td>
<td className="py-space-md px-space-md">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-10 rounded bg-surface-container overflow-hidden shrink-0">
<img className="w-full h-full object-cover" data-alt="Cover of Sapiens A Brief History of Humankind by Yuval Noah Harari on an academic desk." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxIKra1CMKevR3WHMm1R1llhsqxpkLn5jvgLKzbpp1DV9eDL3R1TgKuqdW88hLfAV9HO4UtwR-0YYVtI92Fz0h4E8g-pGBtcDX7PYjVsd4F-jH1DzACA30WmGL0zE0ryPILqPcjehxfPGqY5rs0_as5N8VcnKufsXozA_Fw7Vc8acydriiv2tsz1Mw-Cf35txb3d6c4WFF_lT-ZO-qFaPKbRAmPJRaeU1xBBnCjCcfYLpa4Qu5QMYt" />
</div>
<div className="flex flex-col min-w-0">
<span className="text-text-primary font-medium truncate">Sapiens: A Brief History of Humankind</span>
<span className="font-caption text-caption text-text-secondary">Yuval Noah Harari</span>
</div>
</div>
</td>
<td className="py-space-md px-space-md text-text-secondary">
<span className="">Aug 04, 2026</span>
<span className="block font-caption text-caption text-status-danger">Released before pickup</span>
</td>
<td className="py-space-md px-space-md text-text-primary">
<span className="">Online Portal Auto-Release</span>
</td>
<td className="py-space-md px-space-md">
<span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-error-container/40 text-status-danger font-caption text-caption">
<span className="material-symbols-outlined text-xs text-status-danger">cancel</span>
                    Cancelled
                  </span>
</td>
<td className="py-space-md px-space-lg text-right">
<button className="text-text-secondary hover:text-text-primary transition-colors font-caption text-caption underline" type="button">Audit Log</button>
</td>
</tr>
{/* Row 4 */}
<tr className="hover:bg-surface-container-low/40 transition-colors">
<td className="py-space-md px-space-lg font-medium text-text-primary">
                  #KP-RES-2026-00489
                  <span className="block font-caption text-caption text-text-secondary">Standard 14D</span>
</td>
<td className="py-space-md px-space-md">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-10 rounded bg-surface-container overflow-hidden shrink-0">
<img className="w-full h-full object-cover" data-alt="Book cover of Thinking, Fast and Slow by Daniel Kahneman on a light minimalist workspace." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqxJIUKiie51jYd_-RGKXwZbD1uMs70rfI0HbtyJDRw5s3UTReZzFCNhNv9J3XVsSljhT15Ks5zlCwJDoWdRZeynwc5YgDP4-0lB2VimfDuiTPMnqbR_DAmJ-zSA-n5tCHB5tFUUOiLYklbnfQLmvr7PADpONVJDzfU7PfoFheSiDBJngLeKiEJ7PBPVxIFj5jycDAQnSQulN__qRHFat2zzAmEHPmTocASCRes3GppqOhsW5lgnPK" />
</div>
<div className="flex flex-col min-w-0">
<span className="text-text-primary font-medium truncate">Thinking, Fast and Slow</span>
<span className="font-caption text-caption text-text-secondary">Daniel Kahneman</span>
</div>
</div>
</td>
<td className="py-space-md px-space-md text-text-secondary">
<span className="">Jul 18 → Jul 19, 2026</span>
<span className="block font-caption text-caption text-status-available">Picked up on time</span>
</td>
<td className="py-space-md px-space-md text-text-primary">
<span className="">Bay 03 - Desk Officer Cortez</span>
</td>
<td className="py-space-md px-space-md">
<span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-status-available/20 text-text-primary font-caption text-caption">
<span className="material-symbols-outlined text-xs text-status-available">check_circle</span>
                    Fulfilled
                  </span>
</td>
<td className="py-space-md px-space-lg text-right">
<button className="text-primary hover:text-text-primary transition-colors font-caption text-caption underline" type="button">View Receipt</button>
</td>
</tr>
</tbody>
</table>
</div>
</div>
</div>
</div>
{/* MODAL: Cancel Reservation Confirmation (Interactive Overlay) */}
<div className="hidden fixed inset-0 z-50 flex items-center justify-center p-space-md bg-text-primary/40 backdrop-blur-sm" id="cancelModal">
<div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-xl shadow-2xl flex flex-col gap-space-md relative animate-in fade-in zoom-in-95 duration-200">
{/* Close icon button */}
<button className="absolute top-space-md right-space-md p-space-xs rounded-full hover:bg-surface-container text-text-secondary transition-colors" onClick={(e) => { (window as any).closeCancelModal?.(); }} type="button">
<span className="material-symbols-outlined text-xl">close</span>
</button>
{/* Modal Header */}
<div className="flex items-center gap-space-md">
<div className="w-12 h-12 rounded-full bg-error-container/50 flex items-center justify-center text-status-danger shrink-0">
<span className="material-symbols-outlined text-2xl">event_busy</span>
</div>
<div>
<h3 className="font-headline-3 text-headline-3 text-text-primary">Cancel Reservation?</h3>
<span className="font-caption text-caption text-status-danger uppercase font-semibold">Irreversible Action</span>
</div>
</div>
{/* Description */}
<p className="font-body-medium text-body-medium text-text-secondary">
        Are you sure you want to release your hold for <strong className="text-text-primary">Structure and Interpretation of Computer Programs (SICP)</strong>? Your current queue spot (#2) will be forfeited and assigned to the next patron.
      </p>
{/* Reason Selector */}
<div className="flex flex-col gap-space-xs">
<label className="font-small text-small text-text-primary font-medium">Please select a reason for release:</label>
<div className="grid grid-cols-1 gap-2">
<label className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
<input defaultChecked className="text-primary focus:ring-0" name="cancelReason" type="radio" value="mind" />
<span className="font-small text-small text-text-primary">Changed my mind / No longer required={true}</span>
</label>
<label className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
<input className="text-primary focus:ring-0" name="cancelReason" type="radio" value="visit" />
<span className="font-small text-small text-text-primary">Cannot visit the library circulation desk</span>
</label>
<label className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
<input className="text-primary focus:ring-0" name="cancelReason" type="radio" value="edition" />
<span className="font-small text-small text-text-primary">Found another physical edition or digital copy</span>
</label>
<label className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
<input className="text-primary focus:ring-0" name="cancelReason" type="radio" value="conflict" />
<span className="font-small text-small text-text-primary">Academic schedule or examination conflict</span>
</label>
</div>
</div>
{/* Modal Action Buttons */}
<div className="flex items-center justify-end gap-space-sm pt-space-sm mt-space-xs">
<button className="px-space-lg py-space-sm rounded-full bg-surface-container text-text-primary hover:bg-surface-container-high transition-colors font-body-medium text-body-medium" onClick={(e) => { (window as any).closeCancelModal?.(); }} type="button">
          Keep Hold
        </button>
<button className="px-space-lg py-space-sm rounded-full bg-status-danger text-on-primary hover:opacity-90 transition-all font-body-medium text-body-medium shadow-sm flex items-center gap-1.5" onClick={(e) => { (window as any).handleConfirmCancel?.(); }} type="button">
<span className="material-symbols-outlined text-base">delete_forever</span>
<span className="">Confirm Cancellation</span>
</button>
</div>
</div>
</div>
{/* MODAL: Pickup Instructions & Desk Directions */}
<div className="hidden fixed inset-0 z-50 flex items-center justify-center p-space-md bg-text-primary/40 backdrop-blur-sm" id="pickupModal">
<div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-xl shadow-2xl flex flex-col gap-space-md relative">
<button className="absolute top-space-md right-space-md p-space-xs rounded-full hover:bg-surface-container text-text-secondary transition-colors" onClick={() => { document.getElementById('pickupModal')?.classList.add('hidden'); }} type="button">
<span className="material-symbols-outlined text-xl">close</span>
</button>
<div className="flex items-center gap-space-md">
<div className="w-12 h-12 rounded-full bg-action-green/30 flex items-center justify-center text-text-primary shrink-0">
<span className="material-symbols-outlined text-2xl">store</span>
</div>
<div>
<h3 className="font-headline-3 text-headline-3 text-text-primary">Pickup Directions</h3>
<span className="font-caption text-caption text-primary uppercase font-semibold">Katipuneros Central Stacks</span>
</div>
</div>
<div className="flex flex-col gap-space-sm font-small text-small text-text-secondary">
<div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1">
<span className="font-medium text-text-primary">1. Proceed to Circulation Bay 01</span>
<span className="">Located immediately to the left of the main rotunda entrance. Present your Patron ID or scan your app barcode.</span>
</div>
<div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1">
<span className="font-medium text-text-primary">2. Automated Locker Drawer #B-04</span>
<span className="">The desk clerk will authenticate and grant immediate release. Please inspect binding conditions before departing.</span>
</div>
<div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1">
<span className="font-medium text-text-primary">3. Return Window: 14 Days</span>
<span className="">Your return countdown commences once physical handover is logged. No penalties apply if returned within the timeframe.</span>
</div>
</div>
<div className="flex justify-end pt-space-xs">
<button className="px-space-xl py-space-sm rounded-full bg-primary-container text-on-primary-container hover:opacity-90 font-small text-small font-medium shadow-sm transition-colors" onClick={() => { document.getElementById('pickupModal')?.classList.add('hidden'); }} type="button">
          Understood
        </button>
</div>
</div>
</div>
{/* Toast Notification Feedback Component */}
<div className="hidden fixed bottom-8 right-8 z-50 bg-text-primary text-surface-container-lowest px-space-lg py-space-md rounded-xl shadow-xl flex items-center gap-space-md transition-all" id="toastNotification">
<span className="material-symbols-outlined text-action-green text-2xl">check_circle</span>
<div className="flex flex-col">
<span className="font-small text-small font-semibold">Reservation Updated</span>
<span className="font-caption text-caption text-surface-variant" id="toastMessage">Reservation hold successfully cancelled.</span>
</div>
</div>
{/* Inline Micro-Interactions Script */}

</div>
    </div>
  );
};

export default ReservationsPage;
