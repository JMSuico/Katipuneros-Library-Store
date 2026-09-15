// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// CheckoutBorrow.tsx -- Cashier Checkout and Borrowing Desk
// Converted directly from SideBarCheckoutBorrowPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const CheckoutBorrow: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
(function() {
      // Counter Mode Toggle Switcher
      const btnHold = document.getElementById('btn-mode-hold');
      const btnWalkin = document.getElementById('btn-mode-walkin');

      if (btnHold && btnWalkin) {
        btnHold.addEventListener('click', function() {
          btnHold.className = "px-space-md py-2 rounded-full font-small text-small font-bold transition-all duration-200 bg-primary text-on-primary shadow-sm flex items-center gap-1.5";
          btnWalkin.className = "px-space-md py-2 rounded-full font-small text-small font-bold transition-all duration-200 text-text-secondary hover:text-text-primary flex items-center gap-1.5";
        });

        btnWalkin.addEventListener('click', function() {
          btnWalkin.className = "px-space-md py-2 rounded-full font-small text-small font-bold transition-all duration-200 bg-primary text-on-primary shadow-sm flex items-center gap-1.5";
          btnHold.className = "px-space-md py-2 rounded-full font-small text-small font-bold transition-all duration-200 text-text-secondary hover:text-text-primary flex items-center gap-1.5";
        });
      }

      // Dynamic Loan Duration Calculation
      const durationInputs = document.querySelectorAll('input[name="loan_duration"]');
      const dueDateDisplay = document.getElementById('due-date-display');
      
      const dueMap = {
        '7': 'Due Date: Monday, Nov 02, 2026 (7 Days)',
        '14': 'Due Date: Monday, Nov 09, 2026 (14 Days)',
        '21': 'Due Date: Monday, Nov 16, 2026 (21 Days)',
        'custom': 'Due Date: Custom Academic Term (Authorized)'
      };

      durationInputs.forEach(input => {
        input.addEventListener('change', function() {
          if (dueDateDisplay && dueMap[this.value]) {
            dueDateDisplay.textContent = dueMap[this.value];
          }

          // Visual chip card toggling
          document.querySelectorAll('.loan-option').forEach(card => {
            card.classList.remove('bg-soft-blue', 'text-primary');
            card.classList.add('bg-surface-container-low');
          });
          const parentCard = this.closest('.loan-option');
          if (parentCard) {
            parentCard.classList.remove('bg-surface-container-low');
            parentCard.classList.add('bg-soft-blue');
          }
        });
      });

      // Checkout Confirmation Mock Toast Trigger
      const btnComplete = document.getElementById('btn-complete-checkout');
      if (btnComplete) {
        btnComplete.addEventListener('click', function() {
          const originalContent = btnComplete.innerHTML;
          btnComplete.disabled = true;
          btnComplete.innerHTML = '<span class="material-symbols-outlined animate-spin text-2xl">autorenew</span><span>Processing RFID & Printing Pass...</span>';
          
          setTimeout(() => {
            btnComplete.innerHTML = '<span class="material-symbols-outlined text-2xl">done_all</span><span>Checkout Released! Slip Printed</span>';
            btnComplete.classList.remove('bg-action-green', 'hover:bg-action-green-hover');
            btnComplete.classList.add('bg-status-available', 'text-on-primary');

            setTimeout(() => {
              btnComplete.disabled = false;
              btnComplete.innerHTML = originalContent;
              btnComplete.classList.remove('bg-status-available', 'text-on-primary');
              btnComplete.classList.add('bg-action-green', 'hover:bg-action-green-hover');
            }, 3000);
          }, 1200);
        });
      }
    })();

    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full pb-space-3xl">
{/* Top Bar: Desk Context & High-Frequency Mode Bar */}
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md py-space-md mb-space-md">
<div className="flex flex-col gap-space-xs">
<div className="flex items-center gap-space-xs text-text-secondary">
<span className="font-caption text-caption uppercase tracking-wider text-primary font-bold">Circulation Desk 01</span>
<span className="text-text-secondary">•</span>
<span className="font-caption text-caption uppercase tracking-wider">Physical Asset Custody Transfer</span>
</div>
<h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">Circulation Desk Checkout &amp; Borrowing</h1>
<p className="font-body text-body text-text-secondary max-w-3xl">
        Scan patron identification card or reservation QR code to release physical volumes into patron custody with RFID security disarm.
      </p>
</div>
{/* Mode Selector & Live Peripheral Indicator */}
<div className="flex flex-col sm:flex-row items-start sm:items-center gap-space-md">
{/* Mode Toggle Glass Chip Group */}
<div className="bg-surface-container p-1 rounded-full flex items-center shadow-inner">
<button className="px-space-md py-2 rounded-full font-small text-small font-bold transition-all duration-200 bg-primary text-on-primary shadow-sm flex items-center gap-1.5" id="btn-mode-hold" type="button">
<span className="material-symbols-outlined text-base">book_online</span>
<span className="">Reservation Hold Release</span>
</button>
<button className="px-space-md py-2 rounded-full font-small text-small font-bold transition-all duration-200 text-text-secondary hover:text-text-primary flex items-center gap-1.5" id="btn-mode-walkin" type="button">
<span className="material-symbols-outlined text-base">directions_walk</span>
<span className="">Direct Walk-In Checkout</span>
</button>
</div>
{/* Scanner Status Pill */}
<div className="flex items-center gap-2 bg-surface-container-lowest px-space-md py-2.5 rounded-full shadow-sm">
<span className="relative flex h-3 w-3">
<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-action-green opacity-75"></span>
<span className="relative inline-flex rounded-full h-3 w-3 bg-action-green"></span>
</span>
<div className="flex flex-col leading-none">
<span className="font-caption text-caption font-bold text-text-primary">⚡ Barcode Scanner Connected</span>
<span className="font-caption text-caption text-text-secondary text-[10px]">HID POS Channel 04 • High Baud</span>
</div>
</div>
</div>
</div>
{/* Primary Workflow Split Grid: Operations Workspace (Left) & Verification Terminal (Right) */}
<div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
{/* LEFT PANEL: Step 1, 2, and 3 Workflow (xl:col-span-8) */}
<div className="xl:col-span-8 flex flex-col gap-space-xl">
{/* STEP 1: Patron Identification & Eligibility Card */}
<section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md relative overflow-hidden">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="w-8 h-8 rounded-full bg-soft-blue text-primary font-headline-4 text-headline-4 flex items-center justify-center font-bold">1</span>
<div className="flex flex-col">
<h2 className="font-headline-4 text-headline-4 text-text-primary">Patron Identification &amp; Eligibility</h2>
<span className="font-caption text-caption text-text-secondary">Scan Patron Card barcode, smart badge RFID, or enter university ID</span>
</div>
</div>
<span className="inline-flex items-center gap-1 bg-action-green/20 text-primary px-space-sm py-1 rounded-full font-caption text-caption font-bold">
<span className="material-symbols-outlined text-sm text-primary">verified</span>
            Identity Confirmed
          </span>
</div>
{/* Scan Input Box with live feedback */}
<div className="relative flex items-center">
<span className="material-symbols-outlined absolute left-4 text-primary text-xl">badge</span>
<input className="w-full pl-12 pr-28 py-3 bg-surface-container-low focus:bg-surface-container-lowest text-text-primary font-body-medium text-body-medium rounded-xl outline-none shadow-inner transition-colors" placeholder="Scan Patron Card Barcode or Enter Patron ID / Email (e.g. KP-88192)..." type="text" value="KP-88192-A" />
<div className="absolute right-3 flex items-center gap-1">
<kbd className="hidden sm:inline-block bg-surface-container px-2 py-1 rounded font-caption text-caption text-text-secondary">F2 SCAN</kbd>
<button className="p-1.5 rounded-lg bg-soft-blue text-primary hover:bg-secondary-container transition-colors" type="button">
<span className="material-symbols-outlined text-lg">qr_code_scanner</span>
</button>
</div>
</div>
{/* Selected Patron Read-Only Master Record */}
<div className="bg-surface-container-low rounded-xl p-space-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md">
<div className="relative">
<img className="w-16 h-16 rounded-full object-cover shadow-sm" data-alt="High-contrast portrait of a male graduate university student named Jhon Doe in a crisp cream knit sweater smiling politely against academic library bookshelves with soft teal ambient depth." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD71EzsaeChIQq-_ckQR8m3yU1yOzhgtlBuBJ3qqX3ZsZ2odAQbpdPsABJPnFJaMKUqubJoJMO8oxgwDPJ2qYwChLtwqTSE13aXY-N4jskAHuS9bk0uKhK5AzTVcsjTpODv6R7Ycbd6vyhN7H502KXJemUjW4WrTRejvGjlchSHxTogu8iiCm20cwAvBUtQTJAdnq9oatYpd0LCZBiD1LzwlLFr3WNjMkqrBTF92Eei5Ill4TDyi3d9" />
<span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-action-green ring-2 ring-surface-container-lowest"></span>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-2">
<span className="font-body-large text-body-large font-bold text-text-primary">Jhon Doe</span>
<span className="bg-surface-container-highest text-text-primary font-caption text-caption font-semibold px-2 py-0.5 rounded-full">KP-88192-A</span>
<span className="bg-status-available text-on-primary font-caption text-caption px-2 py-0.5 rounded-full font-bold">Active • Good Standing</span>
</div>
<div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-text-secondary font-small text-small">
<span className="">Program: <strong className="text-text-primary font-medium">Graduate Scholar (M.S. InfoSys)</strong></span>
<span className="">•</span>
<span className="">Standing: <strong className="text-status-available font-semibold">Tier 1 Full Access</strong></span>
</div>
<p className="font-caption text-caption text-text-secondary mt-1 italic">
                Notes: Verified physical student ID, eligible for maximum 21-day extended loan privilege.
              </p>
</div>
</div>
{/* Quick Metrics: Allowance & Fines */}
<div className="flex items-center gap-space-md self-stretch md:self-auto justify-between md:justify-end bg-surface-container-lowest/80 p-space-sm rounded-xl">
<div className="flex flex-col text-right">
<span className="font-caption text-caption text-text-secondary">Current Active Loans</span>
<span className="font-body-medium text-body-medium font-bold text-text-primary">2 of 4 allowance used</span>
<div className="w-32 bg-surface-container-highest h-1.5 rounded-full mt-1 overflow-hidden">
<div className="bg-primary h-full rounded-full" style={{ width: '50%' }}></div>
</div>
<span className="font-caption text-[11px] text-text-secondary mt-0.5 truncate max-w-[130px]" title="Clean Code, Atomic Habits">Clean Code, Atomic Habits</span>
</div>
<div className="h-10 w-px bg-surface-container-highest"></div>
<div className="flex flex-col text-right">
<span className="font-caption text-caption text-text-secondary">Outstanding Fines</span>
<span className="font-body-large text-body-large font-bold text-status-available">₱0.00</span>
<span className="font-caption text-[11px] text-text-secondary">Clear / Eligible</span>
</div>
</div>
</div>
</section>
{/* STEP 2: Book Asset Barcode Scanning & Staging Area */}
<section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="w-8 h-8 rounded-full bg-soft-blue text-primary font-headline-4 text-headline-4 flex items-center justify-center font-bold">2</span>
<div className="flex flex-col">
<h2 className="font-headline-4 text-headline-4 text-text-primary">Book Asset Barcode Scanning &amp; Staging</h2>
<span className="font-caption text-caption text-text-secondary">Scan book barcode on flyleaf sticker or match against holding shelf</span>
</div>
</div>
<span className="font-caption text-caption font-semibold bg-soft-blue text-primary px-space-sm py-1 rounded-full">
            1 Asset Staged
          </span>
</div>
{/* Book Barcode Search / Scan Bar */}
<div className="relative flex items-center">
<span className="material-symbols-outlined absolute left-4 text-primary text-xl">barcode_scanner</span>
<input className="w-full pl-12 pr-32 py-3 bg-surface-container-low focus:bg-surface-container-lowest text-text-primary font-body-medium text-body-medium rounded-xl outline-none shadow-inner transition-colors" placeholder="Scan Physical Book Barcode (e.g., KP-BC-4491) or Select from Approved Holds..." type="text" value="KP-BC-4491-02" />
<div className="absolute right-3 flex items-center gap-1.5">
<button className="bg-primary hover:bg-primary-container text-on-primary px-space-sm py-1.5 rounded-lg font-small text-small font-bold transition-colors flex items-center gap-1" type="button">
<span className="material-symbols-outlined text-base">add</span>
<span className="">Stage Copy</span>
</button>
</div>
</div>
{/* Staged Book Item Detailed Record Card */}
<div className="bg-surface-container-low rounded-xl p-space-md flex flex-col md:flex-row gap-space-md relative overflow-hidden">
{/* Book Cover Preview */}
<div className="w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden shadow-md bg-surface-container-highest">
<img className="w-full h-full object-cover" data-alt="Cover of the book Clean Architecture by Robert C. Martin showing blueprint diagrams in slate blue and pristine minimalist white book typography on academic library desk." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSRZW5gLzneSPWcWQIokJE8OigX9ZmakAsRugPvqywNOjEMM6WXf5vohC6DkGvVGjQ_h1eNLgSgnQWgd6DvQCXWcqKO1FvjrxdaiGy_gKwwxP-hw50RFVccHPG-bUlOH6W3Ezaa0NMFsO6dQObpICOtIuMaq-2OECCbCElfkTHjsHZvecGR9eqlz7-4KHvfqzgHo_arWFopkBuma3vGnHLh4TGpVLxZECEOp8PF_fGe4K32SB9xiRX" />
</div>
{/* Asset Metadata & Physical Verification */}
<div className="flex-1 flex flex-col justify-between">
<div>
<div className="flex flex-wrap items-center justify-between gap-2">
<div className="flex items-center gap-2">
<span className="font-headline-4 text-headline-4 text-text-primary font-bold">Clean Architecture</span>
<span className="bg-soft-blue text-primary font-caption text-caption font-bold px-2 py-0.5 rounded">Hardcover Vol. 1</span>
</div>
<button className="text-status-danger hover:bg-error-container p-1 rounded-lg transition-colors" title="Remove staged asset" type="button">
<span className="material-symbols-outlined text-lg">delete</span>
</button>
</div>
<p className="font-small text-small text-text-secondary mt-0.5">
                A Craftsman's Guide to Software Structure and Design • <span className="text-text-primary font-medium">Robert C. Martin</span>
</p>
{/* Asset Detail Chips */}
<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-text-secondary font-caption text-caption">
<div className="bg-surface-container-lowest p-2 rounded-lg">
<span className="block text-text-secondary text-[11px]">Call Number</span>
<span className="font-bold text-text-primary">Dewey 005.1 M382a</span>
</div>
<div className="bg-surface-container-lowest p-2 rounded-lg">
<span className="block text-text-secondary text-[11px]">Asset Barcode</span>
<span className="font-bold text-text-primary font-mono">KP-BC-4491-02</span>
</div>
<div className="bg-surface-container-lowest p-2 rounded-lg">
<span className="block text-text-secondary text-[11px]">RFID Security Tag</span>
<span className="font-bold text-action-green-hover font-mono flex items-center gap-1">
<span className="material-symbols-outlined text-xs">rss_feed</span> TAG-88219-OK
                  </span>
</div>
<div className="bg-surface-container-lowest p-2 rounded-lg">
<span className="block text-text-secondary text-[11px]">Stacks Location</span>
<span className="font-bold text-text-primary">Bay 14 • Shelf 3B</span>
</div>
</div>
</div>
{/* Holding Status & Physical Condition Clearance */}
<div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-surface-container">
<div className="flex items-center gap-2 font-caption text-caption">
<span className="inline-flex items-center gap-1 text-primary bg-secondary-container px-2 py-0.5 rounded font-bold">
<span className="material-symbols-outlined text-xs">bookmark_added</span> Hold #KP-RES-2026-00892
                </span>
<span className="text-text-secondary">Reserved on Oct 24 • Ready for Release</span>
</div>
<div className="flex items-center gap-1.5 font-caption text-caption text-status-available font-semibold">
<span className="material-symbols-outlined text-sm">verified_user</span>
<span className="">Good Condition (Previous loan inspection cleared)</span>
</div>
</div>
</div>
</div>
</section>
{/* STEP 3: Loan Policy & Dynamic Due Date Engine */}
<section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="w-8 h-8 rounded-full bg-soft-blue text-primary font-headline-4 text-headline-4 flex items-center justify-center font-bold">3</span>
<div className="flex flex-col">
<h2 className="font-headline-4 text-headline-4 text-text-primary">Loan Policy &amp; Dynamic Due Date Calculation</h2>
<span className="font-caption text-caption text-text-secondary">Patron category entitles scholar extensions with calendar override</span>
</div>
</div>
<div className="flex items-center gap-2 bg-surface-container px-space-sm py-1 rounded-lg text-text-secondary font-caption text-caption">
<span className="material-symbols-outlined text-sm">event</span>
<span className="">Borrow Start: <strong className="text-text-primary font-bold">Today, Oct 26, 2026</strong></span>
</div>
</div>
{/* Loan Duration Radio Selector Grid */}
<div className="grid grid-cols-1 sm:grid-cols-4 gap-space-sm">
{/* 7 Days */}
<label className="loan-option cursor-pointer p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between gap-2">
<div className="flex items-center justify-between">
<span className="font-body-medium text-body-medium font-bold text-text-primary">7 Days</span>
<input className="accent-primary w-4 h-4" name="loan_duration" type="radio" value="7" />
</div>
<span className="font-caption text-caption text-text-secondary">Short Loan • Reserve copy</span>
</label>
{/* 14 Days Standard (Default Selected) */}
<label className="loan-option cursor-pointer p-space-md rounded-xl bg-soft-blue shadow-sm transition-all flex flex-col justify-between gap-2">
<div className="flex items-center justify-between">
<span className="font-body-medium text-body-medium font-bold text-primary">14 Days</span>
<input defaultChecked className="accent-primary w-4 h-4" name="loan_duration" type="radio" value="14" />
</div>
<span className="font-caption text-caption text-primary font-semibold">Standard Academic (Recommended)</span>
</label>
{/* 21 Days Scholar */}
<label className="loan-option cursor-pointer p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between gap-2">
<div className="flex items-center justify-between">
<span className="font-body-medium text-body-medium font-bold text-text-primary">21 Days</span>
<input className="accent-primary w-4 h-4" name="loan_duration" type="radio" value="21" />
</div>
<span className="font-caption text-caption text-text-secondary">Scholar Special (Thesis &amp; Grad)</span>
</label>
{/* Custom Authorized */}
<label className="loan-option cursor-pointer p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between gap-2">
<div className="flex items-center justify-between">
<span className="font-body-medium text-body-medium font-bold text-text-primary">Custom</span>
<input className="accent-primary w-4 h-4" name="loan_duration" type="radio" value="custom" />
</div>
<span className="font-caption text-caption text-text-secondary">Supervisor Pass Override</span>
</label>
</div>
{/* Dynamic Calculated Due Date Display Callout Banner */}
<div className="bg-gradient-to-r from-soft-blue via-surface-container to-surface-container-high rounded-xl p-space-md flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md">
<div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center flex-shrink-0 shadow-sm">
<span className="material-symbols-outlined text-2xl">event_upcoming</span>
</div>
<div className="flex flex-col">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">Calculated Return Milestone</span>
<span className="font-headline-3 text-headline-3 text-text-primary font-bold" id="due-date-display">
                Due Date: Monday, Nov 09, 2026
              </span>
<span className="font-caption text-caption text-text-secondary">Standard 14 Days Cycle (No academic blackout dates detected)</span>
</div>
</div>
<div className="flex flex-col items-start md:items-end gap-1 bg-surface-container-lowest/80 px-space-md py-2.5 rounded-xl">
<div className="flex items-center gap-1.5 text-status-available font-caption text-caption font-bold">
<span className="material-symbols-outlined text-sm">alarm_on</span>
<span className="">24-Hour Courtesy Window until Nov 10, 8:00 PM PHT</span>
</div>
<span className="font-caption text-caption text-text-secondary">
              Overdue Tariff: <strong className="text-status-danger font-semibold">₱15.00/day</strong> after grace period
            </span>
</div>
</div>
</section>
</div>
{/* RIGHT PANEL: Final Transaction Verification, Print Control & Desk Hardware Staging (xl:col-span-4) */}
<div className="xl:col-span-4 flex flex-col gap-space-lg xl:sticky xl:top-20">
{/* Transaction Summary Checkout Terminal Card */}
<section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-md flex flex-col gap-space-md relative overflow-hidden">
{/* Top Status Indicator Bar */}
<div className="flex items-center justify-between pb-space-sm border-b border-surface-container">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary">shopping_bag</span>
<h3 className="font-headline-4 text-headline-4 text-text-primary">Checkout Summary</h3>
</div>
<span className="bg-soft-blue text-primary font-caption text-caption font-bold px-2 py-0.5 rounded-full">
            Ready to Issue
          </span>
</div>
{/* Breakdown List */}
<div className="flex flex-col gap-space-sm text-small font-small">
<div className="flex justify-between py-1 text-text-secondary">
<span className="">Transaction Reference:</span>
<span className="font-mono font-bold text-text-primary">TX-CKO-20261026-081</span>
</div>
<div className="flex justify-between py-1 text-text-secondary">
<span className="">Patron Custodian:</span>
<span className="font-bold text-text-primary">Jhon Doe (KP-88192-A)</span>
</div>
<div className="flex justify-between py-1 text-text-secondary">
<span className="">Total Physical Assets:</span>
<span className="font-bold text-text-primary">1 Hardcover Volume</span>
</div>
<div className="flex justify-between py-1 text-text-secondary">
<span className="">RFID Disarm Directive:</span>
<span className="inline-flex items-center gap-1 text-status-available font-bold">
<span className="material-symbols-outlined text-sm">lock_open</span> Armed → Auto-Disarm on Release
            </span>
</div>
<div className="flex justify-between py-1 text-text-secondary">
<span className="">Return Due Date:</span>
<span className="font-bold text-primary">Nov 09, 2026 (14 Days)</span>
</div>
<div className="flex justify-between py-1 text-text-secondary">
<span className="">Desk Operator:</span>
<span className="text-text-primary font-medium">Elena Vance (Desk 01)</span>
</div>
</div>
{/* Verification Signature & Patron Authorization Block */}
<div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-2">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">Patron Verification</span>
<span className="bg-action-green/20 text-text-primary font-caption text-caption font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
<span className="material-symbols-outlined text-xs text-primary">check_circle</span> PIN Authenticated
            </span>
</div>
<p className="font-caption text-caption text-text-secondary">
            Patron has confirmed custody of Clean Architecture (KP-BC-4491-02) via desk keypad PIN terminal and accepted library code of conduct.
          </p>
</div>
{/* Receipts & Delivery Preferences */}
<div className="flex flex-col gap-2 pt-2">
<label className="flex items-center gap-2 text-text-primary font-small text-small cursor-pointer">
<input defaultChecked className="w-4 h-4 rounded accent-primary text-primary" type="checkbox" />
<span className="">Digital Receipt via Email (<span className="text-text-secondary">j.doe@univ.edu</span>) &amp; SMS</span>
</label>
<label className="flex items-center gap-2 text-text-primary font-small text-small cursor-pointer">
<input defaultChecked className="w-4 h-4 rounded accent-primary text-primary" type="checkbox" />
<span className="">Auto-print Thermal Borrow Slip &amp; Gate Exit Pass</span>
</label>
<label className="flex items-center gap-2 text-text-primary font-small text-small cursor-pointer">
<input className="w-4 h-4 rounded accent-primary text-primary" type="checkbox" />
<span className="">Flag for patron calendar sync (.ics invite)</span>
</label>
</div>
{/* Main Action Buttons */}
<div className="flex flex-col gap-space-sm pt-space-sm">
{/* Primary High-Impact Lime Action Button */}
<button className="w-full min-h-[50px] py-3.5 px-space-md bg-action-green hover:bg-action-green-hover text-text-primary font-headline-4 text-headline-4 font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99]" id="btn-complete-checkout" type="button">
<span className="material-symbols-outlined text-2xl">print</span>
<span className="">Complete Checkout &amp; Print Pass</span>
</button>
{/* Cancel / Staging Clear Button */}
<div className="flex items-center gap-2">
<button className="flex-1 py-2.5 px-space-sm bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-text-primary font-small text-small font-bold rounded-xl transition-colors flex items-center justify-center gap-1" type="button">
<span className="material-symbols-outlined text-base">restart_alt</span>
<span className="">Clear Staging</span>
</button>
<button className="flex-1 py-2.5 px-space-sm bg-soft-blue hover:bg-secondary-container text-primary font-small text-small font-bold rounded-xl transition-colors flex items-center justify-center gap-1" type="button">
<span className="material-symbols-outlined text-base">pause</span>
<span className="">Suspend Cart</span>
</button>
</div>
</div>
{/* Keyboard Shortcut Hint Footer */}
<div className="flex items-center justify-between text-text-secondary font-caption text-caption pt-space-xs">
<span className="">Keyboard shortcut:</span>
<span className="flex items-center gap-1">
<kbd className="bg-surface-container px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">Ctrl + Enter</kbd>
<span className="">to release</span>
</span>
</div>
</section>
{/* RFID Hardware Gate Status Module */}
<div className="bg-surface-container-low rounded-2xl p-space-md flex items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-xl bg-surface-container-lowest flex items-center justify-center shadow-inner text-primary">
<span className="material-symbols-outlined">sensors</span>
</div>
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-bold">Desensitizer Pad 01</span>
<span className="font-small text-small font-bold text-text-primary">Ready to Disarm Book Magnetics</span>
</div>
</div>
<span className="w-2.5 h-2.5 rounded-full bg-action-green"></span>
</div>
</div>
</div>
{/* Recent Desk Checkouts Ledger (Compact 3-row audit log) */}
<section className="mt-space-2xl bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-space-md">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary">history</span>
<h3 className="font-headline-4 text-headline-4 text-text-primary">Recent Desk Checkouts Ledger</h3>
<span className="bg-surface-container text-text-secondary font-caption text-caption px-2.5 py-0.5 rounded-full">
          Shift Bay 01 (Last 3 Records)
        </span>
</div>
<a className="text-primary hover:text-primary-container font-small text-small font-bold flex items-center gap-1 transition-colors" href="#">
<span className="">View Full Shift Transactions</span>
<span className="material-symbols-outlined text-base">arrow_forward</span>
</a>
</div>
{/* Responsive Table */}
<div className="overflow-x-auto">
<table className="w-full text-left font-small text-small">
<thead>
<tr className="text-text-secondary font-caption text-caption uppercase border-b border-surface-container">
<th className="py-3 px-space-sm font-semibold">Timestamp / Tx ID</th>
<th className="py-3 px-space-sm font-semibold">Patron Details</th>
<th className="py-3 px-space-sm font-semibold">Physical Book Asset</th>
<th className="py-3 px-space-sm font-semibold">Asset Barcode</th>
<th className="py-3 px-space-sm font-semibold">Due Date</th>
<th className="py-3 px-space-sm font-semibold">Gate Status</th>
<th className="py-3 px-space-sm font-semibold text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container-low">
{/* Row 1 */}
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-3.5 px-space-sm">
<div className="flex flex-col">
<span className="font-bold text-text-primary">09:38 AM</span>
<span className="font-caption text-caption text-text-secondary font-mono">TX-CKO-20261026-080</span>
</div>
</td>
<td className="py-3.5 px-space-sm">
<div className="flex items-center gap-2">
<div className="w-7 h-7 rounded-full bg-soft-blue text-primary font-caption text-caption font-bold flex items-center justify-center">
                  MS
                </div>
<div className="flex flex-col">
<span className="font-bold text-text-primary">Maria Santos</span>
<span className="font-caption text-caption text-text-secondary">KP-77210 (Faculty)</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-sm">
<div className="flex flex-col">
<span className="font-bold text-text-primary">Introduction to Algorithms (4th Ed.)</span>
<span className="font-caption text-caption text-text-secondary">Thomas H. Cormen</span>
</div>
</td>
<td className="py-3.5 px-space-sm">
<span className="font-mono bg-surface-container px-2 py-0.5 rounded text-text-primary text-xs">KP-BC-3190-01</span>
</td>
<td className="py-3.5 px-space-sm">
<div className="flex flex-col">
<span className="font-bold text-text-primary">Nov 16, 2026</span>
<span className="font-caption text-caption text-status-available">21 Days Faculty</span>
</div>
</td>
<td className="py-3.5 px-space-sm">
<span className="inline-flex items-center gap-1 text-status-available bg-status-available/10 px-2 py-0.5 rounded-full font-caption text-caption font-bold">
<span className="material-symbols-outlined text-xs">check_circle</span> Disarmed &amp; Cleared
              </span>
</td>
<td className="py-3.5 px-space-sm text-right">
<button className="p-1 rounded-lg text-text-secondary hover:text-primary hover:bg-surface-container transition-colors" title="Reprint Exit Slip" type="button">
<span className="material-symbols-outlined text-lg">receipt</span>
</button>
</td>
</tr>
{/* Row 2 */}
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-3.5 px-space-sm">
<div className="flex flex-col">
<span className="font-bold text-text-primary">09:21 AM</span>
<span className="font-caption text-caption text-text-secondary font-mono">TX-CKO-20261026-079</span>
</div>
</td>
<td className="py-3.5 px-space-sm">
<div className="flex items-center gap-2">
<div className="w-7 h-7 rounded-full bg-soft-blue text-primary font-caption text-caption font-bold flex items-center justify-center">
                  AR
                </div>
<div className="flex flex-col">
<span className="font-bold text-text-primary">Arthur Ramos</span>
<span className="font-caption text-caption text-text-secondary">KP-90214 (Undergraduate)</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-sm">
<div className="flex flex-col">
<span className="font-bold text-text-primary">Design Patterns: Elements of Reusable Object-Oriented Software</span>
<span className="font-caption text-caption text-text-secondary">Erich Gamma et al.</span>
</div>
</td>
<td className="py-3.5 px-space-sm">
<span className="font-mono bg-surface-container px-2 py-0.5 rounded text-text-primary text-xs">KP-BC-1102-04</span>
</td>
<td className="py-3.5 px-space-sm">
<div className="flex flex-col">
<span className="font-bold text-text-primary">Nov 09, 2026</span>
<span className="font-caption text-caption text-text-secondary">14 Days Regular</span>
</div>
</td>
<td className="py-3.5 px-space-sm">
<span className="inline-flex items-center gap-1 text-status-available bg-status-available/10 px-2 py-0.5 rounded-full font-caption text-caption font-bold">
<span className="material-symbols-outlined text-xs">check_circle</span> Disarmed &amp; Cleared
              </span>
</td>
<td className="py-3.5 px-space-sm text-right">
<button className="p-1 rounded-lg text-text-secondary hover:text-primary hover:bg-surface-container transition-colors" title="Reprint Exit Slip" type="button">
<span className="material-symbols-outlined text-lg">receipt</span>
</button>
</td>
</tr>
{/* Row 3 */}
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-3.5 px-space-sm">
<div className="flex flex-col">
<span className="font-bold text-text-primary">09:05 AM</span>
<span className="font-caption text-caption text-text-secondary font-mono">TX-CKO-20261026-078</span>
</div>
</td>
<td className="py-3.5 px-space-sm">
<div className="flex items-center gap-2">
<div className="w-7 h-7 rounded-full bg-soft-blue text-primary font-caption text-caption font-bold flex items-center justify-center">
                  KC
                </div>
<div className="flex flex-col">
<span className="font-bold text-text-primary">Kyla Cruz</span>
<span className="font-caption text-caption text-text-secondary">KP-65821 (Alumni Reader)</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-sm">
<div className="flex flex-col">
<span className="font-bold text-text-primary">Sapiens: A Brief History of Humankind</span>
<span className="font-caption text-caption text-text-secondary">Yuval Noah Harari</span>
</div>
</td>
<td className="py-3.5 px-space-sm">
<span className="font-mono bg-surface-container px-2 py-0.5 rounded text-text-primary text-xs">KP-BC-9082-01</span>
</td>
<td className="py-3.5 px-space-sm">
<div className="flex flex-col">
<span className="font-bold text-text-primary">Nov 02, 2026</span>
<span className="font-caption text-caption text-text-secondary">7 Days Alumni Standard</span>
</div>
</td>
<td className="py-3.5 px-space-sm">
<span className="inline-flex items-center gap-1 text-status-available bg-status-available/10 px-2 py-0.5 rounded-full font-caption text-caption font-bold">
<span className="material-symbols-outlined text-xs">check_circle</span> Disarmed &amp; Cleared
              </span>
</td>
<td className="py-3.5 px-space-sm text-right">
<button className="p-1 rounded-lg text-text-secondary hover:text-primary hover:bg-surface-container transition-colors" title="Reprint Exit Slip" type="button">
<span className="material-symbols-outlined text-lg">receipt</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
</section>
{/* Interactive Client-side Scripting for Desk Behaviors */}

</div>
    </div>
  );
};

export default CheckoutBorrow;
