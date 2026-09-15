// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// ReturnsFines.tsx -- Cashier Returns and Fine Settlement
// Converted directly from SidebarReturn&FinesPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const ReturnsFines: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
(function() {
    const scannerInput = document.getElementById('scannerInput');
    const simulateScanBtn = document.getElementById('simulateScanBtn');
    const completeReturnBtn = document.getElementById('completeReturnBtn');
    const printSlipBtn = document.getElementById('printSlipBtn');
    const clearCounterBtn = document.getElementById('clearCounterBtn');
    const totalDueText = document.getElementById('totalDueText');
    const conditionFeeLabel = document.getElementById('conditionFeeLabel');
    const conditionRadios = document.querySelectorAll('input[name="bookCondition"]');
    const toast = document.getElementById('toastNotification');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');

    let baseOverdue = 90.00;
    let conditionSurcharge = 0.00;

    function showToast(title, message) {
      toastTitle.textContent = title;
      toastMessage.textContent = message;
      toast.classList.remove('translate-y-32', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
      setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-32', 'opacity-0');
      }, 3500);
    }

    conditionRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'good' || val === 'wear') {
          conditionSurcharge = 0.00;
          conditionFeeLabel.textContent = '₱0.00 (' + (val === 'good' ? 'Normal' : 'Minor Wear') + ')';
          conditionFeeLabel.className = 'font-bold text-status-available';
        } else if (val === 'damage') {
          conditionSurcharge = 150.00;
          conditionFeeLabel.textContent = '+₱150.00 (Binding Fee)';
          conditionFeeLabel.className = 'font-bold text-status-danger';
        } else if (val === 'lost') {
          conditionSurcharge = 1450.00;
          conditionFeeLabel.textContent = '+₱1,450.00 (Lost Volume Fee)';
          conditionFeeLabel.className = 'font-bold text-status-danger';
        }

        const total = baseOverdue + conditionSurcharge;
        totalDueText.textContent = '₱' + total.toFixed(2);
      });
    });

    simulateScanBtn.addEventListener('click', () => {
      showToast('Barcode Accepted', 'Loaded loan record for: ' + scannerInput.value);
    });

    completeReturnBtn.addEventListener('click', () => {
      showToast('Return Finalized', 'Receipt #REC-2026-9045 dispatched to Sofia Morales.');
      completeReturnBtn.disabled = true;
      completeReturnBtn.classList.add('opacity-50', 'cursor-not-allowed');
      completeReturnBtn.innerHTML = '<span class="material-symbols-outlined text-xl">check</span> Processed & Stacks Tagged';
    });

    printSlipBtn.addEventListener('click', () => {
      showToast('Thermal Print Queue', 'Sent clearance slip to Desk 01 thermal printer.');
    });

    clearCounterBtn.addEventListener('click', () => {
      scannerInput.value = '';
      scannerInput.focus();
      showToast('Counter Cleared', 'Ready for next patron book intake.');
    });
  })();

    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full pb-space-3xl gap-space-xl">
{/* Operational Header */}
<section className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-md p-space-lg">
<div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-space-lg">
<div className="flex flex-col gap-space-xs max-w-2xl">
<div className="inline-flex items-center gap-2">
<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-soft-blue text-primary font-caption text-caption font-bold tracking-wide uppercase">
<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            Circulation Terminal Module 04
          </span>
<span className="text-text-secondary font-caption text-caption">• Audit ID #CT-88902</span>
</div>
<h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">
          Circulation Desk Book Returns &amp; Check-In
        </h1>
<p className="font-body text-body text-text-secondary">
          Scan book barcode, audit physical condition, and compute automated overdue penalties and receipts.
        </p>
</div>
{/* Quick Metrics Ribbon */}
<div className="grid grid-cols-3 gap-space-sm bg-surface-container-low p-space-sm rounded-xl">
<div className="flex flex-col px-space-md py-space-xs bg-surface-container-lowest rounded-lg shadow-sm">
<div className="flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary">Processed Today</span>
<span className="material-symbols-outlined text-action-green text-lg">check_circle</span>
</div>
<span className="font-headline-3 text-headline-3 text-text-primary font-bold">14</span>
<span className="font-caption text-caption text-status-available">93.3% On Time</span>
</div>
<div className="flex flex-col px-space-md py-space-xs bg-surface-container-lowest rounded-lg shadow-sm">
<div className="flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary">Pending Staging</span>
<span className="material-symbols-outlined text-status-pending text-lg">hourglass_top</span>
</div>
<span className="font-headline-3 text-headline-3 text-text-primary font-bold">3</span>
<span className="font-caption text-caption text-status-pending">Drop-box queue</span>
</div>
<div className="flex flex-col px-space-md py-space-xs bg-surface-container-lowest rounded-lg shadow-sm">
<div className="flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary">Fines Collected</span>
<span className="material-symbols-outlined text-primary text-lg">payments</span>
</div>
<span className="font-headline-3 text-headline-3 text-primary font-bold">₱320.00</span>
<span className="font-caption text-caption text-text-secondary">Drawer synced</span>
</div>
</div>
</div>
</section>
{/* Barcode Intake Scanner Bar */}
<section className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md">
<div className="flex-1 relative flex items-center">
<div className="absolute left-4 flex items-center gap-1.5 text-primary">
<span className="material-symbols-outlined text-2xl animate-pulse">barcode_scanner</span>
</div>
<input className="w-full pl-14 pr-28 py-3.5 bg-surface-container-low focus:bg-surface-container-lowest text-text-primary font-body-medium text-body-medium rounded-xl outline-none transition-colors" id="scannerInput" placeholder="Scan Book Barcode, Patron ID, or Smart Drop-Box Batch ID..." type="text" value="KP-BC-2849" />
<div className="absolute right-3 flex items-center gap-2">
<kbd className="hidden sm:inline-block px-2 py-0.5 text-caption font-caption text-text-secondary bg-surface-container-high rounded">ENTER</kbd>
<button className="px-3 py-1.5 bg-primary text-on-primary font-caption text-caption font-bold rounded-lg hover:bg-primary-container transition-colors" id="simulateScanBtn" type="button">
          Scan
        </button>
</div>
</div>
{/* Drop-Box Toggle */}
<div className="flex items-center justify-between sm:justify-end gap-space-md px-space-sm py-space-xs bg-surface-container-low rounded-xl">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-xl">move_to_inbox</span>
<div className="flex flex-col">
<span className="font-small text-small font-bold text-text-primary leading-tight">Smart Drop-Box Batch</span>
<span className="font-caption text-caption text-text-secondary">Auto-clear late fines under 24 hrs</span>
</div>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input className="sr-only peer" id="batchToggle" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-defaultChecked:after:translate-x-full peer-defaultChecked:after:border-surface-container-lowest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-defaultChecked:bg-action-green"></div>
</label>
</div>
</section>
{/* Main Grid: Active Loan Audit + Dynamic Calculation Engine */}
<div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
{/* Left Column: Active Loan Return Audit & Physical Condition */}
<div className="xl:col-span-7 flex flex-col gap-space-lg">
{/* Patron & Asset Card */}
<div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg flex flex-col gap-space-md">
<div className="flex items-center justify-between pb-space-sm">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-primary text-2xl">verified_user</span>
<span className="font-headline-4 text-headline-4 text-text-primary">Active Loan Record</span>
</div>
<span className="px-3 py-1 bg-error-container text-on-error-container font-caption text-caption font-bold rounded-full inline-flex items-center gap-1">
<span className="w-2 h-2 rounded-full bg-status-danger"></span>
            Overdue by 7 Days
          </span>
</div>
{/* Patron Overview Row */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md p-space-md bg-surface-container-low rounded-xl">
<div className="flex items-center gap-space-sm sm:col-span-2">
<img className="w-12 h-12 rounded-full object-cover shadow-sm" data-alt="Close up academic student portrait of young Filipina college scholar wearing simple glasses in soft morning library light with book background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzhSEPXTd56OX98AudSh8LI1eg74xU1Pr7DmglyuYOFTl6fHCkrCLSlKAXMPCMdcqRPUhxBbYgzllyUvTThZ42InjsWlErnlzZLGqL1_Xcn0O2HZErRY3Qg0m_yOWOb7aighLnzmE-QEkmnDxcduThQig2edhDWrJ5fOqCnBuY8TBj2G_wOmFFMYTE55-u0scjP1okIq9jULFe9ux8LaWMd5CfGRgnbUFmU-L16q4pVuINnwlmEPJU" />
<div className="flex flex-col min-w-0">
<div className="flex items-center gap-2">
<span className="font-body-large text-body-large font-bold text-text-primary truncate">Sofia Morales</span>
<span className="px-2 py-0.5 rounded bg-soft-blue text-primary font-caption text-caption font-bold">BS CompSci</span>
</div>
<span className="font-caption text-caption text-text-secondary truncate">ID: #KP-77401 • smorales@university.edu</span>
</div>
</div>
<div className="flex flex-col justify-center sm:items-end">
<span className="font-caption text-caption text-text-secondary">Standing Rating</span>
<span className="font-small text-small font-bold text-status-available inline-flex items-center gap-1">
<span className="material-symbols-outlined text-base">shield</span> Good (Tier 1)
            </span>
</div>
</div>
{/* Book Asset Card */}
<div className="flex flex-col sm:flex-row gap-space-md p-space-md bg-surface-container rounded-xl">
<img className="w-24 h-32 object-cover rounded-lg shadow-md self-center sm:self-start" data-alt="Editorial book cover of Design Patterns Elements of Reusable Object Oriented Software in deep academic teal with crisp modern typography" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYr4A6eu5xYsf4GG_InEREMjAcWU7zcJ__DQ08bX8yki-u5CVjOIhTEoyeuUnLPDKTMXJyyAyjf0M1AxMs5rlJKliOC0ZiC89hFA9pge0ce0aHPqJTMoNGLB5NKbzos4DtgZRUnD35M7D1FJe5g4bEf8ip-ZkPK5SPofSv9Q2eLh2ua6n3_DXwezVswtD2Y15T5rP-lMdc4ZtFB69u4l_zaznIVkTpzvMaVoWSUhaIplz0Bvvgn2hr" />
<div className="flex flex-col justify-between flex-1 gap-space-xs">
<div>
<div className="flex items-center justify-between gap-2">
<span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">Reference Stacks • CS Division</span>
<span className="font-caption text-caption text-text-secondary font-mono">KP-BC-2849</span>
</div>
<h2 className="font-headline-4 text-headline-4 text-text-primary leading-snug">
                Design Patterns: Elements of Reusable Object-Oriented Software
              </h2>
<span className="font-caption text-caption text-text-secondary">Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides</span>
</div>
<div className="grid grid-cols-2 gap-space-xs pt-space-xs text-text-secondary font-caption text-caption">
<div className=""><span className="font-bold text-text-primary">Call No:</span> Dewey 005.133 GOF</div>
<div className=""><span className="font-bold text-text-primary">Copy:</span> Accession #04 of 06</div>
<div className=""><span className="font-bold text-text-primary">Checkout Desk:</span> Terminal 02</div>
<div className=""><span className="font-bold text-text-primary">Security RFID:</span> Active (Verified)</div>
</div>
</div>
</div>
{/* Timeline Matrix */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
<div className="p-space-sm bg-surface-container-low rounded-lg flex flex-col">
<span className="font-caption text-caption text-text-secondary">Borrowed Date</span>
<span className="font-small text-small font-bold text-text-primary">Oct 05, 2026</span>
<span className="font-caption text-caption text-text-secondary">10:14 AM (Normal 14d)</span>
</div>
<div className="p-space-sm bg-surface-container-low rounded-lg flex flex-col">
<span className="font-caption text-caption text-text-secondary">Scheduled Due</span>
<span className="font-small text-small font-bold text-text-primary">Oct 19, 2026</span>
<span className="font-caption text-caption text-status-danger">08:00 PM (Lapsed)</span>
</div>
<div className="p-space-sm bg-soft-blue rounded-lg flex flex-col">
<span className="font-caption text-caption text-primary font-bold">Actual Return Scan</span>
<span className="font-small text-small font-bold text-primary">Oct 26, 2026</span>
<span className="font-caption text-caption text-primary">09:45 AM (Current)</span>
</div>
</div>
</div>
{/* Physical Condition Inspection Selector */}
<div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-primary text-2xl">fact_check</span>
<span className="font-headline-4 text-headline-4 text-text-primary">Physical Condition Inspection</span>
</div>
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-bold">Mandatory Desk Audit</span>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm" id="conditionRadioGroup">
{/* Good Condition (Selected) */}
<label className="relative flex items-start gap-space-sm p-space-md rounded-xl bg-soft-blue cursor-pointer transition-all">
<input defaultChecked className="mt-1 text-primary focus:ring-0" name="bookCondition" type="radio" value="good" />
<div className="flex flex-col">
<span className="font-body-medium text-body-medium font-bold text-primary">Good Condition</span>
<span className="font-caption text-caption text-text-secondary">Clean cover, intact pages. Ready for immediate stacks reshelving.</span>
<span className="mt-2 text-caption font-caption font-bold text-status-available">Fee: ₱0.00</span>
</div>
</label>
{/* Minor Wear */}
<label className="relative flex items-start gap-space-sm p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container cursor-pointer transition-all">
<input className="mt-1 text-primary focus:ring-0" name="bookCondition" type="radio" value="wear" />
<div className="flex flex-col">
<span className="font-body-medium text-body-medium font-bold text-text-primary">Minor Wear / Markings</span>
<span className="font-caption text-caption text-text-secondary">Highlighter or minor dog-ears. Route to Curatorial Cleaning.</span>
<span className="mt-2 text-caption font-caption font-bold text-text-secondary">Fee: ₱0.00</span>
</div>
</label>
{/* Severe Damage */}
<label className="relative flex items-start gap-space-sm p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container cursor-pointer transition-all">
<input className="mt-1 text-primary focus:ring-0" name="bookCondition" type="radio" value="damage" />
<div className="flex flex-col">
<span className="font-body-medium text-body-medium font-bold text-text-primary">Severe Damage</span>
<span className="font-caption text-caption text-text-secondary">Broken spine, water damage, or torn pages. Rebinder required={true}.</span>
<span className="mt-2 text-caption font-caption font-bold text-status-danger">+₱150.00 Repair Surcharge</span>
</div>
</label>
{/* Lost Item */}
<label className="relative flex items-start gap-space-sm p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container cursor-pointer transition-all">
<input className="mt-1 text-primary focus:ring-0" name="bookCondition" type="radio" value="lost" />
<div className="flex flex-col">
<span className="font-body-medium text-body-medium font-bold text-text-primary">Declared Lost / Missing</span>
<span className="font-caption text-caption text-text-secondary">Patron unable to produce physical volume.</span>
<span className="mt-2 text-caption font-caption font-bold text-status-danger">Full Replacement Cost (₱1,450.00)</span>
</div>
</label>
</div>
{/* Shelf Reallocation Route */}
<div className="flex items-center justify-between p-space-md bg-surface-container-low rounded-xl">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-secondary text-2xl">shelves</span>
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary">Automated Re-shelving Assignment</span>
<span className="font-small text-small font-bold text-text-primary">Level 2 North Wing • Bay 14, Shelf 3B</span>
</div>
</div>
<span className="px-2.5 py-1 bg-surface-container-highest text-primary font-caption text-caption font-bold rounded-lg">
            Cart #C-08
          </span>
</div>
</div>
</div>
{/* Right Column: Automated Dynamic Fine Engine & Payment Settlement */}
<div className="xl:col-span-5 flex flex-col gap-space-lg">
{/* Computation Engine Breakdown */}
<div className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg flex flex-col gap-space-md">
<div className="flex items-center justify-between pb-space-xs">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-primary text-2xl">calculate</span>
<span className="font-headline-4 text-headline-4 text-text-primary">Overdue Calculation</span>
</div>
<span className="font-caption text-caption text-text-secondary">Policy Rev 2026.4</span>
</div>
{/* Calculation Matrix Rows */}
<div className="flex flex-col gap-space-xs divide-y-0 text-small font-small">
<div className="flex items-center justify-between py-2 bg-surface-container-low px-space-sm rounded-lg">
<span className="text-text-secondary">Total Retention Time</span>
<span className="font-bold text-text-primary">21 Days Elapsed</span>
</div>
<div className="flex items-center justify-between py-2 px-space-sm">
<span className="text-text-secondary">Gross Days Past Due</span>
<span className="font-bold text-status-danger">7 Calendar Days</span>
</div>
<div className="flex items-center justify-between py-2 px-space-sm text-status-available">
<span className="inline-flex items-center gap-1">
<span className="material-symbols-outlined text-sm">redeem</span>
              Courtesy Grace Period
            </span>
<span className="font-bold">- 1 Courtesy Day</span>
</div>
<div className="flex items-center justify-between py-2 bg-surface-container-low px-space-sm rounded-lg">
<span className="font-medium text-text-primary">Chargeable Overdue Days</span>
<span className="font-bold text-text-primary">6 Days</span>
</div>
<div className="flex items-center justify-between py-2 px-space-sm">
<span className="text-text-secondary">Standard Academic Rate</span>
<span className="text-text-primary">₱15.00 / day</span>
</div>
<div className="flex items-center justify-between py-2 px-space-sm">
<span className="text-text-secondary">Base Overdue Subtotal (6 × ₱15.00)</span>
<span className="font-bold text-text-primary">₱90.00</span>
</div>
<div className="flex items-center justify-between py-2 px-space-sm">
<span className="text-text-secondary">Condition Inspection Surcharge</span>
<span className="font-bold text-status-available" id="conditionFeeLabel">₱0.00 (Normal)</span>
</div>
{/* Total Highlight Box */}
<div className="mt-space-sm p-space-md rounded-xl bg-soft-blue flex items-center justify-between">
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary uppercase font-bold tracking-wider">Total Fine Due</span>
<span className="font-caption text-caption text-primary">Student Account Cleared Upon Payment</span>
</div>
<span className="font-headline-2 text-headline-2 text-primary font-bold" id="totalDueText">₱90.00</span>
</div>
</div>
{/* Settlement Options Accordion / Radio Selector */}
<div className="flex flex-col gap-space-sm pt-space-xs">
<span className="font-caption text-caption text-text-secondary font-bold uppercase tracking-wide">Select Settlement Method</span>
<label className="flex items-center justify-between p-space-md bg-surface-container-low hover:bg-surface-container rounded-xl cursor-pointer transition-colors">
<div className="flex items-center gap-space-sm">
<input defaultChecked className="text-primary focus:ring-0" name="settlementType" type="radio" value="counter" />
<div className="flex flex-col">
<span className="font-body-medium text-body-medium font-bold text-text-primary">Pay at Counter Now</span>
<span className="font-caption text-caption text-text-secondary">Cash, GCash QR, Maya, or Campus Tap Card</span>
</div>
</div>
<span className="material-symbols-outlined text-action-green text-xl">point_of_sale</span>
</label>
<label className="flex items-center justify-between p-space-md bg-surface-container-low hover:bg-surface-container rounded-xl cursor-pointer transition-colors">
<div className="flex items-center gap-space-sm">
<input className="text-primary focus:ring-0" name="settlementType" type="radio" value="student_account" />
<div className="flex flex-col">
<span className="font-body-medium text-body-medium font-bold text-text-primary">Charge to Student Account</span>
<span className="font-caption text-caption text-text-secondary">Added to Sofia Morales's term tuition balance</span>
</div>
</div>
<span className="material-symbols-outlined text-secondary text-xl">account_balance</span>
</label>
<label className="flex items-center justify-between p-space-md bg-surface-container-low hover:bg-surface-container rounded-xl cursor-pointer transition-colors">
<div className="flex items-center gap-space-sm">
<input className="text-primary focus:ring-0" name="settlementType" type="radio" value="waiver" />
<div className="flex flex-col">
<span className="font-body-medium text-body-medium font-bold text-text-primary">Administrative Grace Waiver</span>
<span className="font-caption text-caption text-text-secondary">Librarian Override (Requires PIN or Auth Token)</span>
</div>
</div>
<span className="material-symbols-outlined text-status-pending text-xl">policy</span>
</label>
</div>
{/* Action Buttons */}
<div className="flex flex-col gap-space-sm pt-space-md">
<button className="w-full h-12 bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2" id="completeReturnBtn" type="button">
<span className="material-symbols-outlined text-xl">task_alt</span>
            Complete Return &amp; Issue Receipt
          </button>
<div className="grid grid-cols-2 gap-space-sm">
<button className="h-11 bg-surface-container text-primary hover:bg-soft-blue font-small text-small font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5" id="printSlipBtn" type="button">
<span className="material-symbols-outlined text-base">print</span>
              Print Return Slip
            </button>
<button className="h-11 bg-surface-container-low text-text-secondary hover:text-error hover:bg-error-container font-small text-small font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5" id="clearCounterBtn" type="button">
<span className="material-symbols-outlined text-base">restart_alt</span>
              Clear Counter
            </button>
</div>
</div>
</div>
</div>
</div>
{/* Today's Completed Return Ledger Table */}
<section className="bg-surface-container-lowest rounded-xl shadow-md p-space-lg flex flex-col gap-space-md">
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-space-xs">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-primary text-2xl">receipt_long</span>
<div>
<h3 className="font-headline-4 text-headline-4 text-text-primary">Today's Completed Return Ledger</h3>
<p className="font-caption text-caption text-text-secondary">Chronological sequence of all volumes ingested at Desk 01 today</p>
</div>
</div>
<div className="flex items-center gap-space-xs">
<span className="px-3 py-1 bg-surface-container font-caption text-caption text-text-primary rounded-lg font-mono">14 Ingested</span>
<button className="p-2 text-text-secondary hover:text-primary hover:bg-surface-container rounded-lg transition-colors" title="Export Ledger CSV" type="button">
<span className="material-symbols-outlined text-lg">download</span>
</button>
</div>
</div>
{/* Ledger Table Container */}
<div className="overflow-x-auto">
<table className="w-full text-left font-small text-small">
<thead className="bg-surface-container-low text-text-secondary font-caption text-caption uppercase">
<tr>
<th className="py-3 px-space-md rounded-l-lg">Barcode</th>
<th className="py-3 px-space-md">Book Volume</th>
<th className="py-3 px-space-md">Patron</th>
<th className="py-3 px-space-md">Overdue Status</th>
<th className="py-3 px-space-md">Fee Assessed</th>
<th className="py-3 px-space-md">Settlement</th>
<th className="py-3 px-space-md rounded-r-lg text-right">Receipt Code</th>
</tr>
</thead>
<tbody className="divide-y-0 text-text-primary">
{/* Row 1 */}
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-3.5 px-space-md font-mono text-primary font-bold">KP-BC-1104</td>
<td className="py-3.5 px-space-md font-medium">Clean Code: A Handbook of Agile Software Craftsmanship</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col">
<span className="font-medium">Marcus Chen</span>
<span className="font-caption text-caption text-text-secondary">#KP-89021</span>
</div>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1 text-status-available font-bold text-caption font-caption">
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span> On Time
              </span>
</td>
<td className="py-3.5 px-space-md text-text-secondary">₱0.00</td>
<td className="py-3.5 px-space-md">
<span className="px-2 py-0.5 rounded bg-surface-container text-text-secondary font-caption text-caption">No Fee</span>
</td>
<td className="py-3.5 px-space-md text-right font-mono text-text-secondary font-caption text-caption">#REC-2026-9041</td>
</tr>
{/* Row 2 */}
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-3.5 px-space-md font-mono text-primary font-bold">KP-BC-3891</td>
<td className="py-3.5 px-space-md font-medium">Introduction to Algorithms (4th Edition)</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col">
<span className="font-medium">Javier Santos</span>
<span className="font-caption text-caption text-text-secondary">#KP-66120</span>
</div>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1 text-status-danger font-bold text-caption font-caption">
<span className="w-1.5 h-1.5 rounded-full bg-status-danger"></span> 4 Days Overdue
              </span>
</td>
<td className="py-3.5 px-space-md font-bold text-primary">₱45.00</td>
<td className="py-3.5 px-space-md">
<span className="px-2 py-0.5 rounded bg-soft-blue text-primary font-caption text-caption font-bold">GCash QR</span>
</td>
<td className="py-3.5 px-space-md text-right font-mono text-primary font-bold font-caption text-caption">#REC-2026-9042</td>
</tr>
{/* Row 3 */}
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-3.5 px-space-md font-mono text-primary font-bold">KP-BC-4122</td>
<td className="py-3.5 px-space-md font-medium">Structure and Interpretation of Computer Programs</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col">
<span className="font-medium">Beatriz Reyes</span>
<span className="font-caption text-caption text-text-secondary">#KP-91404</span>
</div>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1 text-status-danger font-bold text-caption font-caption">
<span className="w-1.5 h-1.5 rounded-full bg-status-danger"></span> 10 Days Overdue
              </span>
</td>
<td className="py-3.5 px-space-md font-bold text-primary">₱135.00</td>
<td className="py-3.5 px-space-md">
<span className="px-2 py-0.5 rounded bg-surface-container text-text-primary font-caption text-caption">Account Charged</span>
</td>
<td className="py-3.5 px-space-md text-right font-mono text-primary font-bold font-caption text-caption">#REC-2026-9043</td>
</tr>
{/* Row 4 */}
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-3.5 px-space-md font-mono text-primary font-bold">KP-BC-7819</td>
<td className="py-3.5 px-space-md font-medium">Artificial Intelligence: A Modern Approach</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col">
<span className="font-medium">Althea Gomez</span>
<span className="font-caption text-caption text-text-secondary">#KP-55319</span>
</div>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1 text-status-pending font-bold text-caption font-caption">
<span className="w-1.5 h-1.5 rounded-full bg-status-pending"></span> 1 Day Overdue
              </span>
</td>
<td className="py-3.5 px-space-md text-text-secondary line-through">₱15.00</td>
<td className="py-3.5 px-space-md">
<span className="px-2 py-0.5 rounded bg-status-pending/20 text-text-primary font-caption text-caption font-bold">Admin Grace Waived</span>
</td>
<td className="py-3.5 px-space-md text-right font-mono text-text-secondary font-caption text-caption">#REC-2026-9044</td>
</tr>
</tbody>
</table>
</div>
</section>
{/* Notification Toast Container */}
<div className="fixed bottom-6 right-6 max-w-sm bg-text-primary text-surface-container-lowest p-space-md rounded-xl shadow-2xl flex items-center gap-space-sm transform translate-y-32 opacity-0 transition-all duration-300 pointer-events-none z-50" id="toastNotification">
<span className="material-symbols-outlined text-action-green text-2xl">check_circle</span>
<div className="flex flex-col min-w-0">
<span className="font-small text-small font-bold" id="toastTitle">Return Processed</span>
<span className="font-caption text-caption text-surface-container-high" id="toastMessage">Receipt #REC-2026-9045 issued to Sofia Morales.</span>
</div>
</div>
</div>

    </div>
  );
};

export default ReturnsFines;
