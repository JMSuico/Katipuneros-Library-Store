// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// Settings.tsx -- Admin Library System Configuration and Parameters
// Converted directly from SidebarSettingsPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const Settings: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
(function() {
    // Tab Switching Logic
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const breadcrumbLabel = document.getElementById('breadcrumb-current-tab');

    const tabTitles = {
      'circulation': 'Circulation & Loan Durations',
      'reservations': 'Reservations & Locker Staging',
      'fines': 'Fine Calculation & Waiver Tariff',
      'appearance': 'Appearance & Theme',
      'notifications': 'Notification Dispatch Gateways',
      'security': 'Security & Access Governance',
      'hardware': 'Hardware & RFID Sync'
    };

    function switchTab(targetTab) {
      tabButtons.forEach(b => {
        if (b.getAttribute('data-tab') === targetTab) {
          b.classList.remove('bg-transparent', 'text-text-secondary', 'font-medium');
          b.classList.add('bg-primary', 'text-on-primary', 'font-semibold');
          b.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          b.classList.remove('bg-primary', 'text-on-primary', 'font-semibold');
          b.classList.add('bg-transparent', 'text-text-secondary', 'font-medium');
        }
      });

      tabPanels.forEach(p => p.classList.add('hidden'));
      const activePanel = document.getElementById('tab-panel-' + targetTab);
      if (activePanel) {
        activePanel.classList.remove('hidden');
      }

      if (breadcrumbLabel && tabTitles[targetTab]) {
        breadcrumbLabel.textContent = tabTitles[targetTab];
      }
    }

    tabButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        const targetTab = this.getAttribute('data-tab');
        switchTab(targetTab);
      });
    });

    // Horizontal Scroll Buttons ('‹' and '›')
    const scrollContainer = document.getElementById('settings-tabs-scroll');
    const prevBtn = document.getElementById('tab-prev-btn');
    const nextBtn = document.getElementById('tab-next-btn');

    if (prevBtn && scrollContainer) {
      prevBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: -260, behavior: 'smooth' });
      });
    }

    if (nextBtn && scrollContainer) {
      nextBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: 260, behavior: 'smooth' });
      });
    }

    // Draggable tab carousel implementation
    let isDown = false;
    let startX;
    let scrollLeftPos;

    if (scrollContainer) {
      scrollContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        scrollContainer.classList.add('cursor-grabbing');
        startX = e.pageX - scrollContainer.offsetLeft;
        scrollLeftPos = scrollContainer.scrollLeft;
      });
      scrollContainer.addEventListener('mouseleave', () => {
        isDown = false;
        scrollContainer.classList.remove('cursor-grabbing');
      });
      scrollContainer.addEventListener('mouseup', () => {
        isDown = false;
        scrollContainer.classList.remove('cursor-grabbing');
      });
      scrollContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - scrollContainer.offsetLeft;
        const walk = (x - startX) * 1.5;
        scrollContainer.scrollLeft = scrollLeftPos - walk;
      });
    }

    // Fine Sandbox Calculation Engine
    const slider = document.getElementById('overdue-slider');
    const sliderVal = document.getElementById('slider-val');
    const grossDisplay = document.getElementById('calc-gross');
    const billableDisplay = document.getElementById('calc-billable');
    const totalDisplay = document.getElementById('calc-total');
    const rateInput = document.getElementById('rate-input');
    const capInput = document.getElementById('cap-input');

    function updateCalculator() {
      if (!slider) return;
      const days = parseInt(slider.value, 10);
      if (sliderVal) sliderVal.textContent = days + (days === 1 ? ' day' : ' days');
      if (grossDisplay) grossDisplay.textContent = days + (days === 1 ? ' day' : ' days');
      
      const billable = Math.max(0, days - 1);
      if (billableDisplay) billableDisplay.textContent = billable + (billable === 1 ? ' day' : ' days');
      
      const dailyRate = rateInput ? parseFloat(rateInput.value) || 15.00 : 15.00;
      const maxCap = capInput ? parseFloat(capInput.value) || 500.00 : 500.00;
      const rawTotal = billable * dailyRate;
      const finalTotal = Math.min(rawTotal, maxCap);
      
      if (totalDisplay) totalDisplay.textContent = '₱' + finalTotal.toFixed(2);
    }

    if (slider) {
      slider.addEventListener('input', updateCalculator);
      if (rateInput) rateInput.addEventListener('input', updateCalculator);
      if (capInput) capInput.addEventListener('input', updateCalculator);
      updateCalculator();
    }

    // Save All Configurations button toast simulation
    const saveBtn = document.getElementById('save-settings-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        const originalContent = saveBtn.innerHTML;
        saveBtn.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-spin">progress_activity</span><span class="whitespace-nowrap">Saving Governance...</span>';
        saveBtn.disabled = true;
        setTimeout(function() {
          saveBtn.innerHTML = '<span class="material-symbols-outlined text-[20px]">check_circle</span><span class="whitespace-nowrap">Configuration Saved!</span>';
          setTimeout(function() {
            saveBtn.innerHTML = originalContent;
            saveBtn.disabled = false;
          }, 2000);
        }, 500);
      });
    }

    const discardBtn = document.getElementById('discard-btn');
    if (discardBtn) {
      discardBtn.addEventListener('click', function() {
        if (confirm('Revert all temporary changes to active system defaults?')) {
          location.reload();
        }
      });
    }
  })();

    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
{/* Header Section */}
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg">
<div className="flex flex-col">
<div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption mb-1">
<span className="hover:text-primary transition-colors cursor-pointer">Admin Console</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="text-primary font-semibold">Settings</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="text-text-primary font-medium" id="breadcrumb-current-tab">Circulation &amp; Loan Durations</span>
</div>
<h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight font-bold">
        System Governance &amp; Policy Console
      </h1>
<p className="font-body text-small text-text-secondary mt-0.5">
        Centrally configure institutional loan caps, RFID telemetry, security policies, SMS/email relays, and appearance parameters.
      </p>
</div>
<div className="flex items-center gap-space-sm self-start lg:self-auto">
<button className="h-11 px-space-md rounded-full bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-text-primary font-body text-small font-medium transition-colors flex items-center gap-space-xs" id="discard-btn" type="button">
<span className="material-symbols-outlined text-[18px]">replay</span>
<span className="">Reset Defaults</span>
</button>
<button className="h-11 px-space-lg rounded-full bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-bold shadow-sm transition-all transform active:scale-95 flex items-center gap-space-xs" id="save-settings-btn" type="button">
<span className="material-symbols-outlined text-[20px]">save</span>
<span className="whitespace-nowrap" id="save-btn-text">Save Configurations</span>
</button>
</div>
</div>
{/* Top Horizontal Navigation Tabs with prominent '‹' and '›' arrow buttons */}
<div className="relative flex items-center mb-space-lg bg-surface-container-lowest p-2 rounded-2xl shadow-sm border border-surface-container">
<button aria-label="Scroll tabs left" className="w-10 h-10 rounded-xl bg-surface-container-low hover:bg-soft-blue text-primary border border-surface-container flex items-center justify-center font-bold text-xl transition-all shrink-0 select-none mr-2 active:scale-95" id="tab-prev-btn" title="Scroll tabs left" type="button">
      ‹
    </button>
<div className="flex items-center gap-2 overflow-x-auto pb-0 no-scrollbar scroll-smooth cursor-grab select-none w-full" id="settings-tabs-scroll">
<button className="tab-btn px-space-md py-2.5 rounded-xl bg-primary text-on-primary font-body text-small font-semibold flex items-center gap-2 whitespace-nowrap shadow-sm shrink-0 transition-all" data-tab="circulation">
<span className="material-symbols-outlined text-[18px]">schedule</span>Circulation &amp; Loan Durations
      </button>
<button className="tab-btn px-space-md py-2.5 rounded-xl bg-transparent hover:bg-surface-container-low text-text-secondary hover:text-text-primary font-body text-small font-medium whitespace-nowrap transition-all flex items-center gap-2 shrink-0" data-tab="reservations">
<span className="material-symbols-outlined text-[18px]">lock_clock</span>Reservations &amp; Locker Staging
      </button>
<button className="tab-btn px-space-md py-2.5 rounded-xl bg-transparent hover:bg-surface-container-low text-text-secondary hover:text-text-primary font-body text-small font-medium whitespace-nowrap transition-all flex items-center gap-2 shrink-0" data-tab="fines">
<span className="material-symbols-outlined text-[18px]">calculate</span>Fine Calculation &amp; Waiver Tariff
      </button>
<button className="tab-btn px-space-md py-2.5 rounded-xl bg-transparent hover:bg-surface-container-low text-text-secondary hover:text-text-primary font-body text-small font-medium whitespace-nowrap transition-all flex items-center gap-2 shrink-0" data-tab="appearance">
<span className="material-symbols-outlined text-[18px]">palette</span>Appearance &amp; Theme
      </button>
<button className="tab-btn px-space-md py-2.5 rounded-xl bg-transparent hover:bg-surface-container-low text-text-secondary hover:text-text-primary font-body text-small font-medium whitespace-nowrap transition-all flex items-center gap-2 shrink-0" data-tab="notifications">
<span className="material-symbols-outlined text-[18px]">cell_tower</span>Notification Dispatch Gateways
      </button>
<button className="tab-btn px-space-md py-2.5 rounded-xl bg-transparent hover:bg-surface-container-low text-text-secondary hover:text-text-primary font-body text-small font-medium whitespace-nowrap transition-all flex items-center gap-2 shrink-0" data-tab="security">
<span className="material-symbols-outlined text-[18px]">shield</span>Security &amp; Access Governance
      </button>
<button className="tab-btn px-space-md py-2.5 rounded-xl bg-transparent hover:bg-surface-container-low text-text-secondary hover:text-text-primary font-body text-small font-medium whitespace-nowrap transition-all flex items-center gap-2 shrink-0" data-tab="hardware">
<span className="material-symbols-outlined text-[18px]">nfc</span>Hardware &amp; RFID Sync
      </button>
</div>
<button aria-label="Scroll tabs right" className="w-10 h-10 rounded-xl bg-surface-container-low hover:bg-soft-blue text-primary border border-surface-container flex items-center justify-center font-bold text-xl transition-all shrink-0 select-none ml-2 active:scale-95" id="tab-next-btn" title="Scroll tabs right" type="button">
      ›
    </button>
</div>
{/* TAB 1: CIRCULATION & LOAN DURATIONS */}
<div className="tab-panel flex flex-col gap-space-lg" id="tab-panel-circulation">
<div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
<div className="xl:col-span-8 flex flex-col gap-space-lg">
<section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container/60">
<div className="flex items-start justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-xl bg-soft-blue text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">auto_stories</span>
</div>
<div>
<h2 className="font-headline-4 text-headline-4 text-text-primary">Circulation Policy &amp; Loan Rules</h2>
<p className="font-caption text-caption text-text-secondary">Default borrowing windows, concurrency caps, renewal limits, and hold queue thresholds per patron classification.</p>
</div>
</div>
<span className="font-caption text-caption px-space-sm py-1 rounded-full bg-soft-blue text-primary font-semibold uppercase tracking-wider">
              Active Policy v4.2
            </span>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-space-md pt-space-xs">
{/* Tier 1: Undergraduate */}
<div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between border border-surface-container hover:border-primary/40 transition-colors">
<div>
<div className="flex items-center justify-between mb-2">
<span className="font-body text-small font-bold text-text-primary">Undergraduate</span>
<span className="font-caption text-[11px] font-bold text-primary bg-primary-fixed px-2 py-0.5 rounded-full">TIER 1</span>
</div>
<div className="mb-4">
<div className="flex items-baseline gap-1">
<input className="w-16 font-headline-2 text-headline-3 font-bold text-primary bg-surface-container-lowest px-2 py-0.5 rounded-lg text-left focus:ring-2 focus:ring-primary/20 focus:outline-none border border-surface-container" type="number" value="14" />
<span className="font-body text-small text-text-secondary">Days Duration</span>
</div>
</div>
<div className="space-y-2.5 font-caption text-caption text-text-secondary">
<div className="flex items-center justify-between">
<span className="">Max Concurrency:</span>
<div className="flex items-center gap-1">
<input className="w-12 font-bold text-text-primary bg-surface-container-lowest px-2 py-0.5 rounded text-right focus:outline-none border border-surface-container" type="number" value="4" />
<span className="">books</span>
</div>
</div>
<div className="flex items-center justify-between">
<span className="">Renewal Limit:</span>
<span className="font-bold text-text-primary">1 Time (7d)</span>
</div>
<div className="flex items-center justify-between">
<span className="">Hold Queue Limit:</span>
<span className="font-bold text-text-primary">2 Volumes</span>
</div>
</div>
</div>
<div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary">Overdue Tariff</span>
<span className="font-caption text-caption font-semibold text-status-danger">Standard Daily</span>
</div>
</div>
{/* Tier 2: Graduate / Scholar */}
<div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between border border-surface-container hover:border-primary/40 transition-colors">
<div>
<div className="flex items-center justify-between mb-2">
<span className="font-body text-small font-bold text-text-primary">Graduate / Scholar</span>
<span className="font-caption text-[11px] font-bold text-secondary bg-secondary-fixed px-2 py-0.5 rounded-full">TIER 2</span>
</div>
<div className="mb-4">
<div className="flex items-baseline gap-1">
<input className="w-16 font-headline-2 text-headline-3 font-bold text-primary bg-surface-container-lowest px-2 py-0.5 rounded-lg text-left focus:ring-2 focus:ring-primary/20 focus:outline-none border border-surface-container" type="number" value="28" />
<span className="font-body text-small text-text-secondary">Days Duration</span>
</div>
</div>
<div className="space-y-2.5 font-caption text-caption text-text-secondary">
<div className="flex items-center justify-between">
<span className="">Max Concurrency:</span>
<div className="flex items-center gap-1">
<input className="w-12 font-bold text-text-primary bg-surface-container-lowest px-2 py-0.5 rounded text-right focus:outline-none border border-surface-container" type="number" value="8" />
<span className="">books</span>
</div>
</div>
<div className="flex items-center justify-between">
<span className="">Renewal Limit:</span>
<span className="font-bold text-text-primary">2 Times (14d)</span>
</div>
<div className="flex items-center justify-between">
<span className="">Hold Queue Limit:</span>
<span className="font-bold text-text-primary">5 Volumes</span>
</div>
</div>
</div>
<div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary">Thesis Priority</span>
<span className="font-caption text-caption font-semibold text-status-available">High Request</span>
</div>
</div>
{/* Tier 3: Faculty & Fellow */}
<div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between border border-surface-container hover:border-primary/40 transition-colors">
<div>
<div className="flex items-center justify-between mb-2">
<span className="font-body text-small font-bold text-text-primary">Faculty &amp; Fellow</span>
<span className="font-caption text-[11px] font-bold text-on-tertiary bg-tertiary px-2 py-0.5 rounded-full">TIER 3</span>
</div>
<div className="mb-4">
<div className="flex items-baseline gap-1">
<input className="w-16 font-headline-2 text-headline-3 font-bold text-primary bg-surface-container-lowest px-2 py-0.5 rounded-lg text-left focus:ring-2 focus:ring-primary/20 focus:outline-none border border-surface-container" type="number" value="60" />
<span className="font-body text-small text-text-secondary">Days Duration</span>
</div>
</div>
<div className="space-y-2.5 font-caption text-caption text-text-secondary">
<div className="flex items-center justify-between">
<span className="">Max Concurrency:</span>
<div className="flex items-center gap-1">
<input className="w-12 font-bold text-text-primary bg-surface-container-lowest px-2 py-0.5 rounded text-right focus:outline-none border border-surface-container" type="number" value="15" />
<span className="">books</span>
</div>
</div>
<div className="flex items-center justify-between">
<span className="">Renewal Limit:</span>
<span className="font-bold text-text-primary">Auto Semester</span>
</div>
<div className="flex items-center justify-between">
<span className="">Hold Queue Limit:</span>
<span className="font-bold text-text-primary">10 Volumes</span>
</div>
</div>
</div>
<div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between">
<span className="font-caption text-caption text-text-secondary">Overdue Tariff</span>
<span className="font-caption text-caption font-semibold text-status-pending">Waived 1st Cycle</span>
</div>
</div>
</div>
{/* Courtesy Grace Period Buffer */}
<div className="p-space-md rounded-xl bg-soft-blue/50 border border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mt-space-xs">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-primary text-[24px]">hourglass_top</span>
<div>
<p className="font-body text-small font-bold text-text-primary">Courtesy Grace Period Buffer</p>
<p className="font-caption text-caption text-text-secondary">Non-penalized time window after official loan expiration before daily fine accrual begins.</p>
</div>
</div>
<div className="flex items-center gap-2 self-end sm:self-auto">
<select className="bg-surface-container-lowest text-primary font-bold text-small rounded-xl px-3 py-1.5 shadow-sm border border-primary/20 focus:outline-none cursor-pointer">
<option value="12">12 Hours Window</option>
<option selected={true} value="24">24 Hours (1 Day Buffer)</option>
<option value="48">48 Hours (2 Days Buffer)</option>
</select>
</div>
</div>
</section>
</div>
{/* Side quick stats */}
<div className="xl:col-span-4 flex flex-col gap-space-lg">
<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container/60">
<h3 className="font-headline-4 text-headline-4 text-text-primary">Active Policy Scope</h3>
<div className="space-y-3 font-caption text-caption text-text-secondary">
<div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg">
<span className="">Active Borrowers Covered:</span>
<span className="font-bold text-text-primary">14,892 Patrons</span>
</div>
<div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg">
<span className="">Circulating Title Catalog:</span>
<span className="font-bold text-text-primary">82,410 Volumes</span>
</div>
<div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg">
<span className="">Inter-Library Loan Protocol:</span>
<span className="font-bold text-status-available">Katipunan Consortium</span>
</div>
</div>
<div className="p-3 bg-surface-container-low rounded-xl text-caption text-text-secondary text-[11px] leading-relaxed">
<span className="font-bold text-primary">Consortium Policy Note:</span> Changes propagate immediately to all catalog endpoints, self-checkout kiosks, and smart return bookdrops across campus.
          </div>
</div>
</div>
</div>
</div>
{/* TAB 2: RESERVATIONS & LOCKER STAGING */}
<div className="tab-panel hidden flex flex-col gap-space-lg" id="tab-panel-reservations">
<div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
<div className="xl:col-span-8 flex flex-col gap-space-lg">
<section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container/60">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-xl bg-soft-blue text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">lock_clock</span>
</div>
<div>
<h2 className="font-headline-4 text-headline-4 text-text-primary">Smart RFID Locker Staging &amp; Hold Policies</h2>
<p className="font-caption text-caption text-text-secondary">Pickup allocation windows, auto-reshelving thresholds, waitlist priority rules, and notification cadence.</p>
</div>
</div>
<span className="font-caption text-caption font-bold text-text-primary bg-action-green px-3 py-1 rounded-full">Bay Cluster 4 Online</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-2">
{/* Locker Pickup Hold Window */}
<div className="p-space-md bg-surface-container-low rounded-xl flex flex-col justify-between border border-surface-container">
<div>
<div className="flex items-center justify-between mb-2">
<span className="font-body text-small font-bold text-text-primary">Smart RFID Locker Pickup Window</span>
<span className="material-symbols-outlined text-primary text-[20px]">timer</span>
</div>
<p className="font-caption text-caption text-text-secondary mb-4">
                  Duration an automated locker door remains reserved for an active patron pick-up before expiration.
                </p>
</div>
<div className="flex items-center justify-between pt-2 border-t border-surface-container">
<span className="font-caption text-caption text-text-secondary">Window Duration:</span>
<select className="bg-surface-container-lowest font-bold text-small text-text-primary px-3 py-1 rounded-lg shadow-sm border border-surface-container">
<option value="24">24 Hours</option>
<option selected={true} value="48">48 Hours (Standard)</option>
<option value="72">72 Hours (Weekend)</option>
</select>
</div>
</div>
{/* Auto-reshelving threshold */}
<div className="p-space-md bg-surface-container-low rounded-xl flex flex-col justify-between border border-surface-container">
<div>
<div className="flex items-center justify-between mb-2">
<span className="font-body text-small font-bold text-text-primary">Auto-Reshelving Threshold</span>
<span className="material-symbols-outlined text-status-pending text-[20px]">shelves</span>
</div>
<p className="font-caption text-caption text-text-secondary mb-4">
                  Automated re-indexing task dispatched to shelving staff when locker window expires uncollected.
                </p>
</div>
<div className="flex items-center justify-between pt-2 border-t border-surface-container">
<span className="font-caption text-caption text-text-secondary">Instant Re-shelve Notice:</span>
<label className="relative inline-flex items-center cursor-pointer">
<input defaultChecked className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-defaultChecked:after:translate-x-full peer-defaultChecked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-defaultChecked:bg-action-green"></div>
</label>
</div>
</div>
{/* Waitlist Priority Algorithm */}
<div className="p-space-md bg-surface-container-low rounded-xl flex flex-col justify-between border border-surface-container">
<div>
<div className="flex items-center justify-between mb-2">
<span className="font-body text-small font-bold text-text-primary">Waitlist Priority Algorithm</span>
<span className="material-symbols-outlined text-action-green text-[20px]">star</span>
</div>
<p className="font-caption text-caption text-text-secondary mb-4">
                  Fast-track queue priority weighting for graduating candidates with verified thesis milestones.
                </p>
</div>
<div className="flex items-center justify-between pt-2 border-t border-surface-container">
<span className="font-caption text-caption text-text-secondary">Thesis Scholar Priority:</span>
<label className="relative inline-flex items-center cursor-pointer">
<input defaultChecked className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-defaultChecked:after:translate-x-full peer-defaultChecked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-defaultChecked:bg-action-green"></div>
</label>
</div>
</div>
{/* Pickup Notification Cadence */}
<div className="p-space-md bg-surface-container-low rounded-xl flex flex-col justify-between border border-surface-container">
<div>
<div className="flex items-center justify-between mb-2">
<span className="font-body text-small font-bold text-text-primary">Pickup Notification Cadence</span>
<span className="material-symbols-outlined text-primary text-[20px]">schedule_send</span>
</div>
<p className="font-caption text-caption text-text-secondary mb-4">
                  Automated alert sent upon locker deposit, followed by countdown alerts at 24h and 6h prior to release.
                </p>
</div>
<div className="flex items-center justify-between pt-2 border-t border-surface-container">
<span className="font-caption text-caption text-text-secondary">Dispatch Sequence:</span>
<span className="font-caption text-caption font-bold text-primary bg-primary-fixed px-2.5 py-1 rounded-full">3 Alerts (Deposit / 24h / 6h)</span>
</div>
</div>
</div>
</section>
</div>
<div className="xl:col-span-4 flex flex-col gap-space-lg">
<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container/60">
<div className="flex items-center justify-between">
<h3 className="font-headline-4 text-headline-4 text-text-primary">Cluster Staging Allocation</h3>
<span className="font-caption text-caption font-semibold text-primary">Katipunan Hub</span>
</div>
<div className="w-full h-44 bg-cover bg-center rounded-xl relative overflow-hidden shadow-inner" style={{ backgroundImage: 'url(\'https://lh3.googleusercontent.com/aida-public/AB6AXuCiQQ6Kd4l36CjgduQJZMqvMqYbpybaT_54lt-Et0ZDlm3Oi1ecnHSDQzsJuXbm0eG56I9jrfayV9j6-58GpJ8f93LXby2L2yj1ifnpxs19mzIja8NCfYCu0dHOyx7I_iammhnQyluX0j99rMo1VLGcUYMkiFgdZvzExVZuf2SZpA2fTYmKTehwDVvAtypBQ04OCTjRmCKF5J93PBmAXhu1pd8Y7t5iP3FKmUu2xAmnvQxbUHyfzKBx\')' }}>
<div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-end p-space-sm">
<div className="bg-surface-container-lowest/95 backdrop-blur-md px-space-sm py-1.5 rounded-lg flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[16px]">location_on</span>
<span className="font-caption text-caption font-bold text-text-primary">Cluster B: 48 / 64 Bays Occupied</span>
</div>
</div>
</div>
<p className="font-caption text-caption text-text-secondary">Smart lock solonoids update state in real-time over MQTT bus. Physical pin code &amp; student QR cards both unlocked.</p>
</div>
</div>
</div>
</div>
{/* TAB 3: FINE CALCULATION & WAIVER TARIFF */}
<div className="tab-panel hidden flex flex-col gap-space-lg" id="tab-panel-fines">
<div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
<div className="xl:col-span-8 flex flex-col gap-space-lg">
<section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container/60">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">payments</span>
</div>
<div>
<h2 className="font-headline-4 text-headline-4 text-text-primary">Fine Tariff &amp; Algorithmic Calculator</h2>
<p className="font-caption text-caption text-text-secondary">Configure overdue rates, maximum fine ceiling, binding repair costs, replacement cost rules, and live sandbox.</p>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
<div className="flex flex-col gap-space-sm">
<div className="p-space-sm bg-surface-container-low rounded-xl flex items-center justify-between border border-surface-container">
<div className="flex flex-col">
<span className="font-body text-small font-medium text-text-primary">Daily Overdue Tariff</span>
<span className="font-caption text-caption text-text-secondary">Assessed per calendar day post-grace</span>
</div>
<div className="flex items-center gap-1 bg-surface-container-lowest px-3 py-1.5 rounded-lg shadow-sm border border-surface-container">
<span className="font-caption text-caption font-bold text-text-secondary">₱</span>
<input className="w-16 font-body text-small font-bold text-text-primary bg-transparent focus:outline-none text-right" id="rate-input" step="1.0" type="number" value="15.00" />
</div>
</div>
<div className="p-space-sm bg-surface-container-low rounded-xl flex items-center justify-between border border-surface-container">
<div className="flex flex-col">
<span className="font-body text-small font-medium text-text-primary">Maximum Penalty Cap</span>
<span className="font-caption text-caption text-text-secondary">Protective ceiling per volume</span>
</div>
<div className="flex items-center gap-1 bg-surface-container-lowest px-3 py-1.5 rounded-lg shadow-sm border border-surface-container">
<span className="font-caption text-caption font-bold text-text-secondary">₱</span>
<input className="w-16 font-body text-small font-bold text-text-primary bg-transparent focus:outline-none text-right" id="cap-input" type="number" value="500.00" />
</div>
</div>
<div className="p-space-sm bg-surface-container-low rounded-xl flex items-center justify-between border border-surface-container">
<div className="flex flex-col">
<span className="font-body text-small font-medium text-text-primary">Binding Repair Tariff</span>
<span className="font-caption text-caption text-text-secondary">Damaged spine/cover triage cost</span>
</div>
<div className="flex items-center gap-1 bg-surface-container-lowest px-3 py-1.5 rounded-lg shadow-sm border border-surface-container">
<span className="font-caption text-caption font-bold text-text-secondary">₱</span>
<input className="w-16 font-body text-small font-bold text-text-primary bg-transparent focus:outline-none text-right" type="number" value="280.00" />
</div>
</div>
<div className="p-space-sm bg-surface-container-low rounded-xl flex items-center justify-between border border-surface-container">
<div className="flex flex-col">
<span className="font-body text-small font-medium text-text-primary">Lost Book Replacement Cost</span>
<span className="font-caption text-caption text-text-secondary">Market Value + Administrative Acquisition</span>
</div>
<span className="font-caption text-caption font-bold text-primary bg-primary-fixed px-2.5 py-1 rounded-full">
                  Cost + ₱150.00
                </span>
</div>
</div>
{/* Simulator Widget */}
<div className="bg-primary/5 rounded-xl p-space-md flex flex-col justify-between border border-primary/20">
<div className="flex items-center justify-between mb-space-sm">
<span className="font-caption text-caption uppercase tracking-wider font-bold text-primary flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">biotech</span> Live Fine Calculation Simulator
                </span>
<span className="font-caption text-caption text-text-secondary bg-surface-container-lowest px-2 py-0.5 rounded shadow-sm border border-surface-container">Real-time</span>
</div>
<div className="flex flex-col gap-space-sm">
<label className="font-caption text-caption text-text-primary font-medium">Simulate Overdue Period (Days):</label>
<div className="flex items-center gap-space-sm">
<input className="w-full accent-primary cursor-pointer" id="overdue-slider" max="45" min="0" type="range" value="5" />
<span className="font-body text-small font-bold text-primary w-14 text-right" id="slider-val">5 days</span>
</div>
<div className="bg-surface-container-lowest rounded-xl p-space-sm shadow-sm space-y-2 mt-2 border border-surface-container">
<div className="flex justify-between text-caption font-caption text-text-secondary">
<span className="">Gross overdue period:</span>
<span className="font-semibold text-text-primary" id="calc-gross">5 days</span>
</div>
<div className="flex justify-between text-caption font-caption text-text-secondary">
<span className="">Subtracted Grace Window:</span>
<span className="font-semibold text-status-available">-1 day</span>
</div>
<div className="flex justify-between text-caption font-caption text-text-secondary">
<span className="">Billable Tariff Days:</span>
<span className="font-semibold text-text-primary" id="calc-billable">4 days</span>
</div>
<div className="pt-2 flex justify-between items-center border-t border-surface-container">
<span className="font-body text-small font-bold text-text-primary">Calculated User Fine:</span>
<span className="font-headline-4 text-headline-4 font-bold text-primary" id="calc-total">₱60.00</span>
</div>
</div>
</div>
<p className="font-caption text-[11px] text-text-secondary mt-3">
                *Capped automatically at ₱500.00 when charges reach limit.
              </p>
</div>
</div>
</section>
</div>
<div className="xl:col-span-4 flex flex-col gap-space-lg">
<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container/60">
<h3 className="font-headline-4 text-headline-4 text-text-primary">Waiver Governance Workflows</h3>
<p className="font-caption text-caption text-text-secondary">Librarians can waive up to ₱100.00 without elevated authorization. Higher amounts trigger Dean's digital signature.</p>
<div className="space-y-3">
<div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between border border-surface-container">
<div>
<span className="font-small text-small text-text-primary font-medium block">Medical / Emergency Waiver</span>
<span className="font-caption text-caption text-text-secondary">Allows clinic note upload</span>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input defaultChecked className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-defaultChecked:after:translate-x-full peer-defaultChecked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-defaultChecked:bg-action-green"></div>
</label>
</div>
<div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between border border-surface-container">
<div>
<span className="font-small text-small text-text-primary font-medium block">Typhoon / Calamity Waiver</span>
<span className="font-caption text-caption text-text-secondary">Institutional campus freeze</span>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input defaultChecked className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-defaultChecked:after:translate-x-full peer-defaultChecked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-defaultChecked:bg-action-green"></div>
</label>
</div>
</div>
</div>
</div>
</div>
</div>
{/* TAB 4: APPEARANCE & THEME */}
<div className="tab-panel hidden flex flex-col gap-space-lg" id="tab-panel-appearance">
<div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
<div className="xl:col-span-8 flex flex-col gap-space-lg">
<section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container/60">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-xl bg-soft-blue text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">palette</span>
</div>
<div>
<h2 className="font-headline-4 text-headline-4 text-text-primary">Appearance &amp; Console Themes</h2>
<p className="font-caption text-caption text-text-secondary">Customize theme modes, primary brand colors, display density, and font size multipliers.</p>
</div>
</div>
{/* Theme Mode Selection */}
<div className="flex flex-col gap-2 mt-2">
<label className="font-caption text-caption font-semibold uppercase tracking-wider text-text-secondary">Theme Mode Selection</label>
<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
<label className="flex items-center justify-between p-3 rounded-xl bg-soft-blue/50 border-2 border-primary cursor-pointer">
<div className="flex items-center gap-2">
<input defaultChecked className="accent-primary w-4 h-4" name="theme_mode" type="radio" />
<span className="font-body text-small font-bold text-text-primary">Light Academic</span>
</div>
<span className="font-caption text-caption text-primary font-bold">Active</span>
</label>
<label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container cursor-pointer transition-colors">
<div className="flex items-center gap-2">
<input className="accent-primary w-4 h-4" name="theme_mode" type="radio" />
<span className="font-body text-small text-text-secondary">OLED High-Contrast</span>
</div>
<span className="font-caption text-caption text-text-secondary">Dark</span>
</label>
<label className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container cursor-pointer transition-colors">
<div className="flex items-center gap-2">
<input className="accent-primary w-4 h-4" name="theme_mode" type="radio" />
<span className="font-body text-small text-text-secondary">System Auto</span>
</div>
<span className="font-caption text-caption text-text-secondary">OS Sync</span>
</label>
</div>
</div>
{/* Primary Brand Accent Colors */}
<div className="flex flex-col gap-2 pt-2">
<label className="font-caption text-caption font-semibold uppercase tracking-wider text-text-secondary">Primary Brand Accent Colors</label>
<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
<button className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low border-2 border-primary transition-all text-left" type="button">
<div className="w-7 h-7 rounded-full bg-[#287EA7] shadow-sm flex items-center justify-center text-white text-[12px]"><span className="material-symbols-outlined text-[16px]">check</span></div>
<div>
<p className="font-body text-small font-bold text-text-primary">Academic Blue</p>
<p className="font-caption text-caption text-text-secondary">#287EA7 (Default)</p>
</div>
</button>
<button className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container transition-all text-left" type="button">
<div className="w-7 h-7 rounded-full bg-[#9BE564] shadow-sm"></div>
<div>
<p className="font-body text-small font-bold text-text-primary">Action Lime</p>
<p className="font-caption text-caption text-text-secondary">#9BE564</p>
</div>
</button>
<button className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container transition-all text-left" type="button">
<div className="w-7 h-7 rounded-full bg-[#164E63] shadow-sm"></div>
<div>
<p className="font-body text-small font-bold text-text-primary">Deep Navy</p>
<p className="font-caption text-caption text-text-secondary">#164E63</p>
</div>
</button>
</div>
</div>
{/* Display Density & Font Size Multiplier */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-2">
<div className="flex flex-col gap-2">
<label className="font-caption text-caption font-semibold uppercase tracking-wider text-text-secondary">Display Density</label>
<div className="grid grid-cols-3 gap-2">
<label className="flex items-center justify-center p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container cursor-pointer transition-colors text-center">
<input className="sr-only peer" name="density" type="radio" />
<span className="font-body text-small text-text-secondary peer-defaultChecked:font-bold peer-defaultChecked:text-primary">Compact</span>
</label>
<label className="flex items-center justify-center p-2.5 rounded-xl bg-soft-blue/60 border-2 border-primary cursor-pointer text-center">
<input defaultChecked className="sr-only peer" name="density" type="radio" />
<span className="font-body text-small font-bold text-primary">Comfortable</span>
</label>
<label className="flex items-center justify-center p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container cursor-pointer transition-colors text-center">
<input className="sr-only peer" name="density" type="radio" />
<span className="font-body text-small text-text-secondary peer-defaultChecked:font-bold peer-defaultChecked:text-primary">Relaxed</span>
</label>
</div>
</div>
<div className="flex flex-col gap-2">
<label className="font-caption text-caption font-semibold uppercase tracking-wider text-text-secondary">Font Size Multiplier</label>
<select className="bg-surface-container-low text-text-primary font-medium text-small rounded-xl p-2.5 border border-surface-container focus:outline-none">
<option value="90">90% - Compact density</option>
<option selected={true} value="100">100% - Inter Standard (Default)</option>
<option value="110">110% - Large text accessibility</option>
<option value="125">125% - High-visibility display</option>
</select>
</div>
</div>
</section>
</div>
<div className="xl:col-span-4 flex flex-col gap-space-lg">
<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container/60">
<h3 className="font-headline-4 text-headline-4 text-text-primary">Live Interface Preview</h3>
<div className="p-4 rounded-xl bg-surface-container-low border border-surface-container flex flex-col gap-2.5">
<div className="flex items-center justify-between">
<span className="w-16 h-3 rounded bg-primary"></span>
<span className="w-5 h-5 rounded-full bg-action-green flex items-center justify-center text-[10px] font-bold text-text-primary">✓</span>
</div>
<div className="w-full h-2 rounded bg-[#164E63]/20"></div>
<div className="w-3/4 h-2 rounded bg-[#164E63]/20"></div>
</div>
<p className="font-caption text-caption text-text-secondary">Applied styling renders consistently across student catalog portals, staff circulation desks, and self-serve stations.</p>
</div>
</div>
</div>
</div>
{/* TAB 5: NOTIFICATION DISPATCH GATEWAYS */}
<div className="tab-panel hidden flex flex-col gap-space-lg" id="tab-panel-notifications">
<div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
<div className="xl:col-span-8 flex flex-col gap-space-lg">
<section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container/60">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-xl bg-soft-blue text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">cell_tower</span>
</div>
<div>
<h2 className="font-headline-4 text-headline-4 text-text-primary">Notification Dispatch Gateways</h2>
<p className="font-caption text-caption text-text-secondary">Manage SMS Telephony (Twilio / PhilSMS), Email SMTP &amp; Amazon SES relay, and Push Webhook (Firebase).</p>
</div>
</div>
<span className="font-caption text-caption font-bold text-status-available bg-surface-container-low px-3 py-1 rounded-full flex items-center gap-1.5 border border-surface-container">
<span className="w-2 h-2 rounded-full bg-action-green"></span> 3 Gateways Active
            </span>
</div>
{/* SMS Telephony (Twilio / PhilSMS) */}
<div className="p-space-md bg-surface-container-low rounded-xl flex flex-col gap-3 border border-surface-container">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[20px]">sms</span>
<span className="font-body text-small font-bold text-text-primary">SMS Telephony (Twilio / PhilSMS API)</span>
</div>
<span className="font-caption text-[11px] font-bold text-text-primary bg-action-green px-2 py-0.5 rounded-full">Connected</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
<div>
<label className="font-caption text-caption text-text-secondary">API Key / Account SID</label>
<input className="w-full bg-surface-container-lowest px-3 py-2 rounded-lg text-small text-text-primary font-mono focus:outline-none mt-1 border border-surface-container" type="password" value="AC3948529384729384729384" />
</div>
<div>
<label className="font-caption text-caption text-text-secondary">Sender Alphanumeric ID</label>
<input className="w-full bg-surface-container-lowest px-3 py-2 rounded-lg text-small text-text-primary font-bold focus:outline-none mt-1 border border-surface-container" type="text" value="KATIPUNAN-LIB" />
</div>
</div>
<div className="flex items-center justify-between text-caption text-text-secondary pt-1 border-t border-surface-container">
<span className="">Daily SMS Throughput: 1,420 / 5,000 sent</span>
<button className="px-3 py-1 bg-surface-container-lowest hover:bg-surface-container text-primary font-semibold text-caption rounded-lg border border-primary/20 transition-colors" onClick={() => alert('SMS Test Ping Sent to registered admin device: Status 200 OK')} type="button">
                Send Test Ping
              </button>
</div>
</div>
{/* Email SMTP / Amazon SES Relay */}
<div className="p-space-md bg-surface-container-low rounded-xl flex flex-col gap-3 border border-surface-container">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[20px]">mail</span>
<span className="font-body text-small font-bold text-text-primary">Email SMTP / Amazon SES Relay</span>
</div>
<div className="flex items-center gap-1.5">
<span className="font-caption text-[11px] font-bold text-status-available bg-surface-container-lowest px-2 py-0.5 rounded border border-surface-container shadow-sm">DKIM Verified</span>
<span className="font-caption text-[11px] font-bold text-status-available bg-surface-container-lowest px-2 py-0.5 rounded border border-surface-container shadow-sm">SPF Pass</span>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
<div>
<label className="font-caption text-caption text-text-secondary">Relay Host (SES SMTP)</label>
<input className="w-full bg-surface-container-lowest px-3 py-2 rounded-lg text-small text-text-primary font-mono focus:outline-none mt-1 border border-surface-container" type="text" value="email-smtp.ap-southeast-1.amazonaws.com" />
</div>
<div>
<label className="font-caption text-caption text-text-secondary">From Dispatch Address</label>
<input className="w-full bg-surface-container-lowest px-3 py-2 rounded-lg text-small text-text-primary focus:outline-none mt-1 border border-surface-container" type="email" value="circulation@library.katipunan.edu.ph" />
</div>
</div>
<div className="flex items-center justify-between text-caption text-text-secondary pt-1 border-t border-surface-container">
<span className="">Port: 587 (STARTTLS Encrypted)</span>
<button className="text-primary hover:underline font-semibold" type="button">Verify SMTP Connection</button>
</div>
</div>
{/* Push Notification Webhook (Firebase) */}
<div className="p-space-md bg-surface-container-low rounded-xl flex items-center justify-between border border-surface-container">
<div className="flex flex-col">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[20px]">notifications_active</span>
<span className="font-body text-small font-bold text-text-primary">Firebase Cloud Messaging (FCM Push Webhook)</span>
</div>
<span className="font-caption text-caption text-text-secondary mt-1">Real-time loan alert push tokens for mobile app patrons</span>
</div>
<button className="px-space-md py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-text-primary text-small font-semibold shadow-sm border border-surface-container transition-colors">Configure Service Account</button>
</div>
</section>
</div>
<div className="xl:col-span-4 flex flex-col gap-space-lg">
<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container/60">
<h3 className="font-headline-4 text-headline-4 text-text-primary">Gateway Health &amp; Telemetry</h3>
<div className="space-y-2.5 font-caption text-caption text-text-secondary">
<div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg border border-surface-container">
<span className="">PhilSMS Telephony API:</span>
<span className="font-bold text-text-primary">99.4% (840ms latency)</span>
</div>
<div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg border border-surface-container">
<span className="">Amazon SES Queue:</span>
<span className="font-bold text-text-primary">0 Delayed / 100% Sent</span>
</div>
<div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg border border-surface-container">
<span className="">FCM Push Handshake:</span>
<span className="font-bold text-status-available">Active Daemon</span>
</div>
</div>
</div>
</div>
</div>
</div>
{/* TAB 6: SECURITY & ACCESS GOVERNANCE */}
<div className="tab-panel hidden flex flex-col gap-space-lg" id="tab-panel-security">
<div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
<div className="xl:col-span-8 flex flex-col gap-space-lg">
<section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container/60">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-xl bg-soft-blue text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">shield</span>
</div>
<div>
<h2 className="font-headline-4 text-headline-4 text-text-primary">Security &amp; Access Governance</h2>
<p className="font-caption text-caption text-text-secondary">POS auto-logoff, Super Admin timeouts, FIDO2 / YubiKey 2FA toggles, and campus CIDR whitelisting.</p>
</div>
</div>
<span className="font-caption text-caption font-bold text-primary bg-primary-fixed px-3 py-1 rounded-full">Strict Compliance</span>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-2">
{/* POS Terminal Idle Timeout */}
<div className="p-space-md bg-surface-container-low rounded-xl flex flex-col justify-between border border-surface-container">
<div>
<div className="flex items-center justify-between mb-2">
<span className="font-body text-small font-bold text-text-primary">POS Terminal Idle Auto-Logoff</span>
<span className="material-symbols-outlined text-primary text-[20px]">timer</span>
</div>
<p className="font-caption text-caption text-text-secondary mb-3">Front desk circulation checkout stations lock automatically after inactivity.</p>
</div>
<div className="flex items-center justify-between pt-2 border-t border-surface-container font-caption text-caption">
<span className="">Timeout Window:</span>
<select className="bg-surface-container-lowest font-bold text-text-primary rounded-lg px-2.5 py-1 border border-surface-container">
<option value="5">5 Minutes</option>
<option selected={true} value="15">15 Minutes (Default)</option>
<option value="30">30 Minutes</option>
</select>
</div>
</div>
{/* Super Admin Timeout */}
<div className="p-space-md bg-surface-container-low rounded-xl flex flex-col justify-between border border-surface-container">
<div>
<div className="flex items-center justify-between mb-2">
<span className="font-body text-small font-bold text-text-primary">Super Admin Console Timeout</span>
<span className="material-symbols-outlined text-primary text-[20px]">admin_panel_settings</span>
</div>
<p className="font-caption text-caption text-text-secondary mb-3">High-privilege console auto-termination window for security integrity.</p>
</div>
<div className="flex items-center justify-between pt-2 border-t border-surface-container font-caption text-caption">
<span className="">Timeout Window:</span>
<select className="bg-surface-container-lowest font-bold text-text-primary rounded-lg px-2.5 py-1 border border-surface-container">
<option value="30">30 Minutes</option>
<option selected={true} value="60">60 Minutes (Mandatory)</option>
<option value="120">120 Minutes</option>
</select>
</div>
</div>
{/* FIDO2 / YubiKey & 2FA */}
<div className="p-space-md bg-surface-container-low rounded-xl flex flex-col justify-between border border-surface-container md:col-span-2">
<div className="flex items-center justify-between mb-2">
<div>
<span className="font-body text-small font-bold text-text-primary block">FIDO2 / YubiKey Hardware &amp; 2FA Enforcement</span>
<span className="font-caption text-caption text-text-secondary">Require biometric passkey, physical hardware security key, or TOTP authenticator for staff logins.</span>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input defaultChecked className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-defaultChecked:after:translate-x-full peer-defaultChecked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-defaultChecked:bg-action-green"></div>
</label>
</div>
</div>
{/* Campus CIDR Subnet Whitelisting Table */}
<div className="p-space-md bg-surface-container-low rounded-xl flex flex-col justify-between border border-surface-container md:col-span-2">
<div className="mb-2">
<div className="flex items-center justify-between mb-1">
<span className="font-body text-small font-bold text-text-primary">Campus IP &amp; CIDR Whitelist Table</span>
<span className="font-caption text-caption text-status-available font-bold">Subnet Protection Active</span>
</div>
<p className="font-caption text-caption text-text-secondary mb-3">Enforce admin portal traffic strictly from approved university subnet ranges.</p>
<div className="overflow-x-auto">
<table className="w-full text-left text-caption font-caption">
<thead>
<tr className="border-b border-surface-container text-text-secondary">
<th className="py-1.5 font-semibold">Subnet / CIDR</th>
<th className="py-1.5 font-semibold">Network Classification</th>
<th className="py-1.5 font-semibold">Access Level</th>
<th className="py-1.5 font-semibold text-right">Action</th>
</tr>
</thead>
<tbody className="divide-y divide-surface-container">
<tr>
<td className="py-2 font-mono font-bold text-text-primary">192.168.100.0/22</td>
<td className="py-2 text-text-secondary">Circulation Kiosk LAN</td>
<td className="py-2"><span className="px-2 py-0.5 rounded bg-primary-fixed text-primary font-bold text-[11px]">POS Desks</span></td>
<td className="py-2 text-right"><button className="text-error hover:underline font-bold">Remove</button></td>
</tr>
<tr>
<td className="py-2 font-mono font-bold text-text-primary">121.54.32.0/24</td>
<td className="py-2 text-text-secondary">Katipunan Staff WiFi VLAN</td>
<td className="py-2"><span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-bold text-[11px]">Staff Mobile</span></td>
<td className="py-2 text-right"><button className="text-error hover:underline font-bold">Remove</button></td>
</tr>
</tbody>
</table>
</div>
<div className="mt-3 flex items-center gap-2">
<input className="px-3 py-1.5 text-caption bg-surface-container-lowest rounded-lg border border-surface-container font-mono focus:outline-none w-48" placeholder="e.g. 10.20.0.0/16" type="text" />
<button className="px-3 py-1.5 rounded-lg bg-soft-blue text-primary font-semibold text-caption hover:bg-surface-container transition-colors" type="button">+ Add Subnet</button>
</div>
</div>
</div>
</div>
</section>
</div>
<div className="xl:col-span-4 flex flex-col gap-space-lg">
<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container/60">
<h3 className="font-headline-4 text-headline-4 text-text-primary">Cryptographic Audit Node</h3>
<div className="p-3 bg-surface-container-low rounded-xl border border-surface-container space-y-2 text-caption">
<div className="flex justify-between items-center">
<span className="text-text-secondary">Node Status:</span>
<span className="font-bold text-status-available flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-action-green"></span> Nominal</span>
</div>
<div className="flex justify-between items-center">
<span className="text-text-secondary">Hash Chain Length:</span>
<span className="font-mono font-bold text-text-primary">849,204 blocks</span>
</div>
<div className="flex justify-between items-center">
<span className="text-text-secondary">HMAC Key Status:</span>
<span className="font-bold text-text-primary">Rotated (3d ago)</span>
</div>
</div>
<p className="font-caption text-caption text-text-secondary">All policy and security alterations are permanently written to an immutable append-only ledger.</p>
</div>
</div>
</div>
</div>
{/* TAB 7: HARDWARE & RFID SYNC */}
<div className="tab-panel hidden flex flex-col gap-space-lg" id="tab-panel-hardware">
<div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg">
<div className="xl:col-span-8 flex flex-col gap-space-lg">
<section className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container/60">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-10 rounded-xl bg-soft-blue text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">nfc</span>
</div>
<div>
<h2 className="font-headline-4 text-headline-4 text-text-primary">Hardware &amp; RFID Sync</h2>
<p className="font-caption text-caption text-text-secondary">RFID turnstile gates, smart shelf continuous polling, thermal receipt printers, and barcode scanners.</p>
</div>
</div>
<span className="font-caption text-caption font-bold text-text-primary bg-action-green px-3 py-1 rounded-full flex items-center gap-1">
<span className="w-2 h-2 rounded-full bg-text-primary"></span> Telemetry Sync 100%
            </span>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-2">
{/* Turnstile RFID Antennas */}
<div className="p-space-md bg-surface-container-low rounded-xl flex flex-col justify-between border border-surface-container">
<div>
<div className="flex items-center justify-between mb-2">
<span className="font-body text-small font-bold text-text-primary">RFID Turnstile Gate Telemetry</span>
<span className="material-symbols-outlined text-primary text-[20px]">sensor_occupied</span>
</div>
<p className="font-caption text-caption text-text-secondary mb-3">Gates A &amp; B perimeter UHF anti-theft sensors and automatic EAS barrier locking.</p>
</div>
<div className="space-y-2 pt-2 border-t border-surface-container font-caption text-caption">
<div className="flex items-center justify-between">
<span className="">Operating Frequency:</span>
<span className="font-mono font-bold text-text-primary">865 - 868 MHz UHF</span>
</div>
<div className="flex items-center justify-between">
<span className="">EAS Alarm Trigger:</span>
<span className="font-bold text-status-danger bg-error-container text-on-error-container px-2 py-0.5 rounded">Enabled (Lock + Audio)</span>
</div>
</div>
</div>
{/* Smart Shelf Continuous Polling Interval */}
<div className="p-space-md bg-surface-container-low rounded-xl flex flex-col justify-between border border-surface-container">
<div>
<div className="flex items-center justify-between mb-2">
<span className="font-body text-small font-bold text-text-primary">Smart Shelf Polling Interval</span>
<span className="material-symbols-outlined text-primary text-[20px]">sync</span>
</div>
<p className="font-caption text-caption text-text-secondary mb-3">Continuous sweep frequency across smart book stacks to detect misshelved items.</p>
</div>
<div className="space-y-2 pt-2 border-t border-surface-container font-caption text-caption">
<div className="flex items-center justify-between">
<span className="">Sweep Interval:</span>
<select className="bg-surface-container-lowest rounded-lg px-2 py-1 font-bold text-text-primary border border-surface-container">
<option value="15">15 Seconds</option>
<option selected={true} value="30">30 Seconds (Recommended)</option>
<option value="60">60 Seconds</option>
</select>
</div>
<div className="flex items-center justify-between">
<span className="">Detected In-Range:</span>
<span className="font-bold text-status-available">12,940 Books Active</span>
</div>
</div>
</div>
{/* Thermal Receipt Printer */}
<div className="p-space-md bg-surface-container-low rounded-xl flex flex-col justify-between border border-surface-container">
<div>
<div className="flex items-center justify-between mb-2">
<span className="font-body text-small font-bold text-text-primary">Thermal Receipt Printer Config</span>
<span className="material-symbols-outlined text-text-primary text-[20px]">print</span>
</div>
<p className="font-caption text-caption text-text-secondary mb-3">Epson TM-T88 circulation slip &amp; return voucher printer setup.</p>
</div>
<div className="space-y-2 pt-2 border-t border-surface-container font-caption text-caption">
<div className="flex items-center justify-between">
<span className="">Baud Rate:</span>
<span className="font-mono font-bold text-text-primary">115,200 bps (USB)</span>
</div>
<div className="flex items-center justify-between">
<span className="">Paper Gauge / Width:</span>
<span className="font-bold text-text-primary">80mm Standard Roll</span>
</div>
</div>
</div>
{/* Barcode Scanner Sensitivity */}
<div className="p-space-md bg-surface-container-low rounded-xl flex flex-col justify-between border border-surface-container">
<div>
<div className="flex items-center justify-between mb-2">
<span className="font-body text-small font-bold text-text-primary">Barcode Scanner Sound &amp; Sensitivity</span>
<span className="material-symbols-outlined text-text-primary text-[20px]">barcode_scanner</span>
</div>
<p className="font-caption text-caption text-text-secondary mb-3">Laser 1D/2D QR optical responsiveness on circulation desk units.</p>
</div>
<div className="space-y-2 pt-2 border-t border-surface-container font-caption text-caption">
<div className="flex items-center justify-between">
<span className="">Optical Sensitivity:</span>
<span className="font-bold text-primary bg-primary-fixed px-2 py-0.5 rounded-full">High Responsive</span>
</div>
<div className="flex items-center justify-between">
<span className="">Audible Beep Volume:</span>
<span className="font-bold text-text-primary">65 dB (Medium)</span>
</div>
</div>
</div>
</div>
</section>
</div>
<div className="xl:col-span-4 flex flex-col gap-space-lg">
<div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-surface-container/60">
<h3 className="font-headline-4 text-headline-4 text-text-primary">Hardware Edge Diagnostics</h3>
<div className="space-y-2.5 font-caption text-caption text-text-secondary">
<div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg border border-surface-container">
<span className="">Turnstile UHF Controller:</span>
<span className="font-bold text-status-available">Ping 2ms (Nominal)</span>
</div>
<div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg border border-surface-container">
<span className="">Smart Shelf MQTT Bus:</span>
<span className="font-bold text-status-available">Connected (0 Loss)</span>
</div>
<div className="flex items-center justify-between p-2.5 bg-surface-container-low rounded-lg border border-surface-container">
<span className="">Thermal Printer Paper:</span>
<span className="font-bold text-status-available">88% Capacity Remaining</span>
</div>
</div>
<button className="w-full py-2 bg-surface-container hover:bg-surface-container-high rounded-xl text-small font-semibold text-text-primary transition-colors flex items-center justify-center gap-1.5 border border-surface-container" onClick={() => alert('Hardware telemetry ping complete: All 4 hardware subsystems operational.')}>
<span className="material-symbols-outlined text-[16px]">restart_alt</span> Run Edge Self-Test
          </button>
</div>
</div>
</div>
</div>
</div>

    </div>
  );
};

export default Settings;
