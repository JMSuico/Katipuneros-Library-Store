// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// Reports.tsx -- Admin Reports, Analytics, and Intelligence Export
// Converted directly from SidebarReportsPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const Reports: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
function triggerDossierBuild() {
      const btn = document.getElementById('generate-btn');
      const statusPill = document.getElementById('generation-status');
      const originalContent = btn.innerHTML;

      btn.disabled = true;
      btn.classList.add('opacity-75', 'cursor-not-allowed');
      btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-[20px]">progress_activity</span><span>Compiling Archive Dossier...</span>';
      
      statusPill.classList.remove('hidden');

      setTimeout(() => {
        btn.disabled = false;
        btn.classList.remove('opacity-75', 'cursor-not-allowed');
        btn.innerHTML = '<span class="material-symbols-outlined text-[20px]">check_circle</span><span>Dossier Assembled &amp; Ready</span>';
        statusPill.innerHTML = '<div class="flex items-center gap-space-sm font-small text-small text-status-available font-bold"><span class="material-symbols-outlined text-[20px]">verified</span><span>Dossier compiled successfully. Starting automatic transmission...</span></div><a href="#" class="px-3 py-1 bg-action-green text-text-primary rounded-lg font-bold text-caption shadow-sm hover:bg-action-green-hover">Direct Download (4.2MB)</a>';
      }, 1600);
    }
try { w.triggerDossierBuild = triggerDossierBuild; } catch (_) {}
    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
{/* Subtle Ambient Glow Element */}
<div className="relative w-full">
<div className="absolute -top-10 right-1/4 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
<div className="absolute top-48 left-10 w-72 h-72 bg-action-green/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
</div>
{/* Page Header and Institutional Top Bar */}
<div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md mb-space-xl">
<div className="flex flex-col max-w-3xl">
<div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption mb-1.5 uppercase tracking-widest">
<span className="">Office of the University Registrar</span>
<span className="">/</span>
<span className="text-primary font-semibold">Statutory Archives &amp; Analytics</span>
</div>
<h1 className="font-headline-1 text-headline-2 lg:text-headline-1 text-text-primary tracking-tight font-bold">
        Institutional Dossiers &amp; Statutory Reporting
      </h1>
<p className="font-body-large text-body-medium text-text-secondary mt-1">
        Certified audit trails, circulation metrics, and fiscal accounting dossiers generated in compliance with CHEd Library Standard ISO 2789:2018.
      </p>
</div>
{/* Global Suite Quick Actions */}
<div className="flex flex-wrap items-center gap-space-sm pt-space-xs"><div className="flex items-center p-1 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30"><button id="tab-btn-dossiers" onClick={(e) => { (window as any).switchReportsTab?.('dossiers'); }} className="reports-tab-nav-btn h-10 px-space-md rounded-lg bg-soft-blue text-primary font-body-medium text-small font-bold flex items-center gap-space-xs transition-all"><span className="material-symbols-outlined text-[18px]">description</span><span className="">Official Dossiers &amp; Suites</span></button><button id="tab-btn-audit" onClick={(e) => { (window as any).switchReportsTab?.('audit'); }} className="reports-tab-nav-btn h-10 px-space-md rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container-low font-body-medium text-small font-semibold flex items-center gap-space-xs transition-all"><span className="material-symbols-outlined text-[18px]">verified_user</span><span className="">Audit Integrity Log</span></button><button id="tab-btn-schedule" onClick={(e) => { (window as any).switchReportsTab?.('schedule'); }} className="reports-tab-nav-btn h-10 px-space-md rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container-low font-body-medium text-small font-semibold flex items-center gap-space-xs transition-all"><span className="material-symbols-outlined text-[18px]">schedule_send</span><span className="">Automated Schedule Config</span></button></div><button onClick={() => alert('Custom Report Schema Builder initialized. Select modules to compile custom template.')} className="h-10 px-space-md rounded-xl bg-action-green text-text-primary hover:bg-action-green-hover shadow-sm font-body-medium text-small font-bold flex items-center gap-space-xs transition-all active:scale-95" type="button"><span className="material-symbols-outlined text-[18px]">add_circle</span><span className="">Build Schema</span></button></div>
</div>
{/* Metric Snapshot Bar */}
<div id="tab-panel-dossiers" className="reports-panel flex flex-col w-full"></div>
{/* Primary Working Zone: Report Parameter Form + Editorial Visual Showcase */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mb-space-xl">
{/* Parameter Interactive Console Form (7 cols) */}
<div className="lg:col-span-7 bg-surface-container-lowest p-space-xl rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden">
<div className="absolute top-0 right-0 w-32 h-32 bg-primary-fixed/20 rounded-bl-full pointer-events-none"></div>
<div>
<div className="flex items-center justify-between pb-space-sm mb-space-md">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-primary text-[28px]">tune</span>
<div className="flex flex-col">
<h2 className="font-headline-3 text-headline-4 text-text-primary font-bold">Standard Parameter Generator</h2>
<span className="font-caption text-caption text-text-secondary">Synthesize cross-departmental datasets into certified files</span>
</div>
</div>
<span className="font-caption text-caption uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-surface-container text-text-secondary">Engine v3.2</span>
</div>
<form className="space-y-space-md" onSubmit={(e) => { e.preventDefault(); (window as any).triggerDossierBuild?.(); }}>
{/* Template Selection */}
<div className="flex flex-col gap-1.5">
<label className="font-body-medium text-small font-bold text-text-primary flex items-center justify-between">
<span className="">Report Template Selection</span>
<span className="font-caption text-caption text-primary font-medium hover:underline cursor-pointer">Preview Metadata Schema</span>
</label>
<div className="relative">
<select className="w-full h-12 bg-surface-container-low pl-space-md pr-10 rounded-xl font-body-medium text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all cursor-pointer" id="report-template">
<option selected={true} value="circulation">Circulation &amp; Borrowing Dossier (CHEd Standard A-1)</option>
<option value="inventory">Inventory Valuation &amp; Deprecation Audit (PAS 16 Compliant)</option>
<option value="financial">Financial Collections &amp; Fine Journal (COA Accounting Spec)</option>
<option value="delinquency">Overdue Delinquencies &amp; Disciplinary Dossier</option>
<option value="curriculum">Academic Discipline &amp; Curriculum Demand Ledger</option>
<option value="acquisitions">Consolidated Acquisitions &amp; Book Donation Trail</option>
</select>
<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">expand_more</span>
</div>
</div>
{/* Time Frame Segmented Options */}
<div className="flex flex-col gap-1.5">
<label className="font-body-medium text-small font-bold text-text-primary">Temporal Range &amp; Aggregation Window</label>
<div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-surface-container-low p-1.5 rounded-xl">
<label className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer transition-all hover:bg-surface-container text-text-secondary font-body-medium text-small">
<input className="sr-only" name="timeframe" type="radio" value="daily" />
<span className="">Daily</span>
</label>
<label className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer transition-all hover:bg-surface-container text-text-secondary font-body-medium text-small">
<input className="sr-only" name="timeframe" type="radio" value="weekly" />
<span className="">Weekly</span>
</label>
<label className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer transition-all bg-surface-container-lowest text-primary font-bold shadow-sm font-body-medium text-small">
<input defaultChecked className="sr-only" name="timeframe" type="radio" value="monthly" />
<span className="w-1.5 h-1.5 rounded-full bg-primary inline-block mr-1"></span>
<span className="">Monthly</span>
</label>
<label className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg cursor-pointer transition-all hover:bg-surface-container text-text-secondary font-body-medium text-small">
<input className="sr-only" name="timeframe" type="radio" value="yearly" />
<span className="">Yearly</span>
</label>
<label className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg cursor-pointer transition-all hover:bg-surface-container text-text-secondary font-body-medium text-small">
<input className="sr-only" name="timeframe" type="radio" value="custom" />
<span className="material-symbols-outlined text-[16px]">date_range</span>
<span className="">Custom</span>
</label>
</div>
</div>
{/* Dual Field: Discipline & Output Format */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
{/* Filter by Academic Field */}
<div className="flex flex-col gap-1.5">
<label className="font-body-medium text-small font-bold text-text-primary">Academic Discipline / Department</label>
<div className="relative">
<select className="w-full h-12 bg-surface-container-low pl-space-md pr-10 rounded-xl font-body-medium text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none transition-all cursor-pointer">
<option selected={true}>All University Disciplines (Universal)</option>
<option>College of Engineering &amp; Computing Science</option>
<option>College of Humanities &amp; Social Sciences</option>
<option>School of Medicine &amp; Health Sciences</option>
<option>School of Management &amp; Accountancy</option>
<option>Institute of Natural &amp; Physical Sciences</option>
<option>College of Law &amp; Public Policy</option>
</select>
<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">domain</span>
</div>
</div>
{/* Output Format Radio Group */}
<div className="flex flex-col gap-1.5">
<label className="font-body-medium text-small font-bold text-text-primary">Export Serialization Format</label>
<div className="flex items-center gap-2 h-12">
<label className="flex-1 flex items-center justify-center gap-1.5 h-full px-2 rounded-xl bg-soft-blue/60 text-primary font-bold cursor-pointer transition-all text-caption">
<input defaultChecked className="sr-only" name="export-format" type="radio" value="pdf" />
<span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
<span className="">PDF (Print)</span>
</label>
<label className="flex-1 flex items-center justify-center gap-1.5 h-full px-2 rounded-xl bg-surface-container-low text-text-secondary hover:text-text-primary cursor-pointer transition-all text-caption">
<input className="sr-only" name="export-format" type="radio" value="csv" />
<span className="material-symbols-outlined text-[18px]">table_rows</span>
<span className="">CSV Flat</span>
</label>
<label className="flex-1 flex items-center justify-center gap-1.5 h-full px-2 rounded-xl bg-surface-container-low text-text-secondary hover:text-text-primary cursor-pointer transition-all text-caption">
<input className="sr-only" name="export-format" type="radio" value="xlsx" />
<span className="material-symbols-outlined text-[18px]">view_column</span>
<span className="">XLSX</span>
</label>
</div>
</div>
</div>
{/* Parameter Modifiers & Deep Audit Checkbox */}
<div className="p-space-sm bg-surface-container-low/70 rounded-xl flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<input defaultChecked className="w-5 h-5 rounded text-primary focus:ring-primary cursor-pointer accent-primary" id="delinquency-flag" type="checkbox" />
<label className="font-body-medium text-small text-text-primary cursor-pointer select-none" htmlFor="delinquency-flag">
                Append Delinquency Breakdown &amp; Overdue Penalty Accruals
              </label>
</div>
<span className="material-symbols-outlined text-text-secondary text-[20px]" title="Attaches student ID, catalog ISBN, and days elapsed">info</span>
</div>
{/* Submission Action Bar */}
<div className="flex items-center justify-between pt-space-xs">
<div className="flex items-center gap-2 text-text-secondary font-caption text-caption">
<span className="material-symbols-outlined text-status-available text-[16px]">lock</span>
<span className="">SHA-256 Checksum Signature Embedded</span>
</div>
<button className="h-12 px-space-xl rounded-xl bg-action-green text-text-primary hover:bg-action-green-hover font-headline-4 text-small font-bold flex items-center gap-space-sm shadow-md transition-all active:scale-95" id="generate-btn" type="submit">
<span className="material-symbols-outlined text-[20px]">instant_mix</span>
<span className="">Generate Official Report Dossier</span>
</button>
</div>
</form>
</div>
{/* Generator Status Pill Area */}
<div className="hidden mt-space-md p-space-sm bg-secondary-container/40 rounded-xl flex items-center justify-between text-on-secondary-container animate-pulse" id="generation-status">
<div className="flex items-center gap-space-sm font-small text-small">
<span className="material-symbols-outlined text-[20px]">sync</span>
<span className="">Querying partition databases and applying cryptographic university watermark...</span>
</div>
<span className="font-caption text-caption font-bold">100% Secure</span>
</div>
</div>
{/* Editorial Analytics Infographic & Discipline Balance (5 cols) */}
<div className="lg:col-span-5 flex flex-col gap-space-md">
{/* Discipline Velocity Chart Card */}
<div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col justify-between flex-1">
<div className="flex items-center justify-between mb-space-sm">
<div className="flex flex-col">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">Circulation Demand Velocity</span>
<span className="font-headline-4 text-headline-4 text-text-primary font-bold">Curriculum Disciplinary Share</span>
</div>
<span className="text-caption font-caption px-2.5 py-1 rounded-full bg-soft-blue text-primary font-bold">Q1 2025</span>
</div>
{/* Inline SVG Visualization: Disciplinary Distribution & Velvet Trend Lines */}
<div className="relative w-full py-space-xs">
<div className="flex items-end justify-between gap-3 h-36 px-2">
{/* STEM Column */}
<div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
<span className="font-caption text-caption font-bold text-primary">44%</span>
<div className="w-full bg-primary-container rounded-t-lg transition-all hover:brightness-110" style={{ height: '82%' }}></div>
<span className="font-caption text-caption text-text-secondary truncate w-full text-center">STEM</span>
</div>
{/* Humanities Column */}
<div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
<span className="font-caption text-caption font-bold text-secondary">26%</span>
<div className="w-full bg-secondary-fixed-dim rounded-t-lg transition-all hover:brightness-110" style={{ height: '52%' }}></div>
<span className="font-caption text-caption text-text-secondary truncate w-full text-center">HumSS</span>
</div>
{/* Health Sciences Column */}
<div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
<span className="font-caption text-caption font-bold text-tertiary">18%</span>
<div className="w-full bg-tertiary-container rounded-t-lg transition-all hover:brightness-110" style={{ height: '38%' }}></div>
<span className="font-caption text-caption text-text-secondary truncate w-full text-center">Health</span>
</div>
{/* Business/Law Column */}
<div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
<span className="font-caption text-caption font-bold text-action-green-hover">12%</span>
<div className="w-full bg-action-green rounded-t-lg transition-all hover:brightness-110" style={{ height: '26%' }}></div>
<span className="font-caption text-caption text-text-secondary truncate w-full text-center">Law/Bus</span>
</div>
</div>
</div>
<div className="pt-space-sm flex items-center justify-between text-text-secondary font-caption text-caption">
<span className="">Target Equilibrium Index: 1.15</span>
<span className="text-primary font-semibold flex items-center gap-1 cursor-pointer hover:underline">
<span className="">Read full pedagogical thesis</span>
<span className="material-symbols-outlined text-[14px]">arrow_outward</span>
</span>
</div>
</div>
{/* Regulatory Archival Banner with Photographic Context */}
<div className="relative overflow-hidden rounded-2xl shadow-sm h-48 bg-primary-container flex items-center">
<div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay" data-alt="A sophisticated modern university library archive room with towering dark wood and metal bookshelves filled with cataloged leatherbound books and academic thesis dossiers in soft natural cinematic architectural lighting in blue and amber tones." style={{ backgroundImage: 'url(\'https://lh3.googleusercontent.com/aida-public/AB6AXuBhToauwoPKoOSzh4B_fnckftl6gDeu0Gbry-iSlu7M9xZ_KARVMtqZYTPvAISUqEgni6h5pG1mlI5ocDvWPk-lYMKHd4xwprVi68rCNKfWbsVfLrR9q4uCBHGiy2P3y2qvQcJnbOYmFeftDZeIsiOEuNnrl1cNBy4l8SZ9Ci895Ei79A7TjTz204NrG9Skp5AeqpLaPzAPgAPip9FZAucU_n7BBQrN-Y5ME4WkDkvwLs9zgmgD_Rzh\')' }}></div>
<div className="relative z-10 p-space-lg text-on-primary-container flex flex-col justify-center max-w-sm">
<div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-caption font-caption text-on-primary-container mb-2 w-fit">
<span className="material-symbols-outlined text-[14px]">auto_stories</span>
<span className="">Accreditation Ready</span>
</div>
<h3 className="font-headline-4 text-headline-4 font-bold leading-tight">ISO 2789 Statistical Record Preservation</h3>
<p className="font-caption text-caption opacity-90 mt-1">Every generated dossier includes immutable cryptographic verification markers for legal submissions.</p>
</div>
</div>
</div>
</div>
{/* Section 1: Available Official Report Suites (Categorized Cards Grid) */}
<div className="flex flex-col mb-space-xl">
<div className="flex items-center justify-between mb-space-md">
<div className="flex flex-col">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">Standard Institutional Collections</span>
<h2 className="font-headline-3 text-headline-3 text-text-primary font-bold">Available Official Report Suites</h2>
</div>
<div className="flex items-center gap-2">
<button className="p-2 rounded-lg bg-surface-container-lowest text-text-secondary hover:text-text-primary shadow-sm" type="button">
<span className="material-symbols-outlined text-[20px]">filter_list</span>
</button>
<button className="p-2 rounded-lg bg-surface-container-lowest text-text-secondary hover:text-text-primary shadow-sm" type="button">
<span className="material-symbols-outlined text-[20px]">grid_view</span>
</button>
</div>
</div>
{/* The 5 Dossier Suites */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
{/* Dossier Card 1: Circulation */}
<div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
<div>
<div className="flex items-start justify-between mb-space-sm">
<div className="w-12 h-12 rounded-xl bg-soft-blue flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[26px]">outbox</span>
</div>
<span className="font-caption text-caption px-2.5 py-1 rounded-full bg-surface-container text-text-secondary font-semibold">SUITE-01</span>
</div>
<h3 className="font-headline-4 text-headline-4 text-text-primary font-bold mb-2">Circulation &amp; Borrowing Dossier</h3>
<p className="font-body text-small text-text-secondary mb-space-md">
            Monthly aggregate checkout metrics, patron demographic breakdown, inter-departmental lending velocity, and high-frequency curriculum textbook rotations.
          </p>
<div className="space-y-1.5 pt-space-xs mb-space-md">
<div className="flex items-center justify-between text-caption font-caption text-text-secondary">
<span className="">Primary Schema:</span>
<span className="font-semibold text-text-primary">ISO/DIS 11620</span>
</div>
<div className="flex items-center justify-between text-caption font-caption text-text-secondary">
<span className="">Data Scope:</span>
<span className="font-semibold text-text-primary">Active 3,410 Borrowers</span>
</div>
</div>
</div>
<div className="pt-space-sm flex items-center gap-space-xs">
<button className="flex-1 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary font-caption text-caption font-bold flex items-center justify-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-primary text-[16px]">picture_as_pdf</span>
<span className="">PDF</span>
</button>
<button className="flex-1 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary font-caption text-caption font-bold flex items-center justify-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-secondary text-[16px]">table_view</span>
<span className="">CSV</span>
</button>
<button className="flex-1 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary font-caption text-caption font-bold flex items-center justify-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-status-available text-[16px]">download</span>
<span className="">XLSX</span>
</button>
</div>
</div>
{/* Dossier Card 2: Inventory Valuation */}
<div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
<div>
<div className="flex items-start justify-between mb-space-sm">
<div className="w-12 h-12 rounded-xl bg-secondary-container/50 flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[26px]">inventory_2</span>
</div>
<span className="font-caption text-caption px-2.5 py-1 rounded-full bg-surface-container text-text-secondary font-semibold">SUITE-02</span>
</div>
<h3 className="font-headline-4 text-headline-4 text-text-primary font-bold mb-2">Inventory Valuation &amp; Deprecation Audit</h3>
<p className="font-body text-small text-text-secondary mb-space-md">
            Capital assets valuation across 4,892 copies, bindery repair expenses, archival attrition rates, and missing or lost volume replacement forecasting.
          </p>
<div className="space-y-1.5 pt-space-xs mb-space-md">
<div className="flex items-center justify-between text-caption font-caption text-text-secondary">
<span className="">Standard:</span>
<span className="font-semibold text-text-primary">PAS 16 Depreciation</span>
</div>
<div className="flex items-center justify-between text-caption font-caption text-text-secondary">
<span className="">Assessed Capital:</span>
<span className="font-semibold text-text-primary">₱4.12M Value</span>
</div>
</div>
</div>
<div className="pt-space-sm flex items-center gap-space-xs">
<button className="flex-1 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary font-caption text-caption font-bold flex items-center justify-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-primary text-[16px]">picture_as_pdf</span>
<span className="">PDF</span>
</button>
<button className="flex-1 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary font-caption text-caption font-bold flex items-center justify-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-secondary text-[16px]">table_view</span>
<span className="">CSV</span>
</button>
<button className="flex-1 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary font-caption text-caption font-bold flex items-center justify-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-status-available text-[16px]">download</span>
<span className="">XLSX</span>
</button>
</div>
</div>
{/* Dossier Card 3: Financial Collections */}
<div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
<div>
<div className="flex items-start justify-between mb-space-sm">
<div className="w-12 h-12 rounded-xl bg-action-green/30 flex items-center justify-center text-text-primary group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[26px]">receipt_long</span>
</div>
<span className="font-caption text-caption px-2.5 py-1 rounded-full bg-surface-container text-text-secondary font-semibold">SUITE-03</span>
</div>
<h3 className="font-headline-4 text-headline-4 text-text-primary font-bold mb-2">Financial Collections &amp; Fine Journal</h3>
<p className="font-body text-small text-text-secondary mb-space-md">
            Transparent daily cashier collections, POS terminals reconciliation, administrative grace waivers, and outstanding receivables ledger.
          </p>
<div className="space-y-1.5 pt-space-xs mb-space-md">
<div className="flex items-center justify-between text-caption font-caption text-text-secondary">
<span className="">Auditing Agency:</span>
<span className="font-semibold text-text-primary">COA General Circular</span>
</div>
<div className="flex items-center justify-between text-caption font-caption text-text-secondary">
<span className="">Reconciled Rate:</span>
<span className="font-semibold text-status-available">99.82% Cleared</span>
</div>
</div>
</div>
<div className="pt-space-sm flex items-center gap-space-xs">
<button className="flex-1 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary font-caption text-caption font-bold flex items-center justify-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-primary text-[16px]">picture_as_pdf</span>
<span className="">PDF</span>
</button>
<button className="flex-1 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary font-caption text-caption font-bold flex items-center justify-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-secondary text-[16px]">table_view</span>
<span className="">CSV</span>
</button>
<button className="flex-1 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary font-caption text-caption font-bold flex items-center justify-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-status-available text-[16px]">download</span>
<span className="">XLSX</span>
</button>
</div>
</div>
{/* Dossier Card 4: Delinquencies */}
<div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
<div>
<div className="flex items-start justify-between mb-space-sm">
<div className="w-12 h-12 rounded-xl bg-error-container/50 flex items-center justify-center text-error group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[26px]">warning</span>
</div>
<span className="font-caption text-caption px-2.5 py-1 rounded-full bg-surface-container text-text-secondary font-semibold">SUITE-04</span>
</div>
<h3 className="font-headline-4 text-headline-4 text-text-primary font-bold mb-2">Overdue Delinquencies &amp; Disciplinary Dossier</h3>
<p className="font-body text-small text-text-secondary mb-space-md">
            Long-term delinquent accounts exceeding 14 calendar days, automatic registrar graduation clearance holds, and registered mail dispatch logs.
          </p>
<div className="space-y-1.5 pt-space-xs mb-space-md">
<div className="flex items-center justify-between text-caption font-caption text-text-secondary">
<span className="">Holds Applied:</span>
<span className="font-semibold text-status-danger">28 Graduating Seniors</span>
</div>
<div className="flex items-center justify-between text-caption font-caption text-text-secondary">
<span className="">Threshold:</span>
<span className="font-semibold text-text-primary">&gt; 14 Days Term</span>
</div>
</div>
</div>
<div className="pt-space-sm flex items-center gap-space-xs">
<button className="flex-1 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary font-caption text-caption font-bold flex items-center justify-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-primary text-[16px]">picture_as_pdf</span>
<span className="">PDF</span>
</button>
<button className="flex-1 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary font-caption text-caption font-bold flex items-center justify-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-secondary text-[16px]">table_view</span>
<span className="">CSV</span>
</button>
<button className="flex-1 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary font-caption text-caption font-bold flex items-center justify-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-status-available text-[16px]">download</span>
<span className="">XLSX</span>
</button>
</div>
</div>
{/* Dossier Card 5: Curriculum Demand */}
<div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between group md:col-span-2 lg:col-span-2">
<div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
<div className="max-w-md">
<div className="flex items-start justify-between mb-space-sm">
<div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-[26px]">school</span>
</div>
<span className="font-caption text-caption px-2.5 py-1 rounded-full bg-surface-container text-text-secondary font-semibold">SUITE-05</span>
</div>
<h3 className="font-headline-4 text-headline-4 text-text-primary font-bold mb-2">Academic Discipline &amp; Curriculum Demand Report</h3>
<p className="font-body text-small text-text-secondary mb-space-sm">
              Departmental resource saturation (STEM versus Humanities), real-time reservation waitlist density, and next-term library acquisitions procurement ledger.
            </p>
</div>
{/* Quick Preview Badge Box */}
<div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-2 min-w-[240px]">
<div className="flex items-center justify-between text-caption font-caption">
<span className="text-text-secondary">Highest Demand:</span>
<span className="font-bold text-text-primary">Data Science / ML</span>
</div>
<div className="flex items-center justify-between text-caption font-caption">
<span className="text-text-secondary">Waitlisted Patron Count:</span>
<span className="font-bold text-status-pending">142 Requests</span>
</div>
<div className="flex items-center justify-between text-caption font-caption">
<span className="text-text-secondary">Procurement Capital Req.:</span>
<span className="font-bold text-primary">₱218,500.00</span>
</div>
</div>
</div>
<div className="pt-space-md flex flex-wrap items-center justify-between gap-space-sm">
<div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption">
<span className="material-symbols-outlined text-[16px] text-status-available">verified</span>
<span className="">Accredited for PAASCU Faculty Level IV Evaluation</span>
</div>
<div className="flex items-center gap-space-xs">
<button className="h-9 px-space-md rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary font-caption text-caption font-bold flex items-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-primary text-[16px]">picture_as_pdf</span>
<span className="">Full Dossier PDF</span>
</button>
<button className="h-9 px-space-md rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary font-caption text-caption font-bold flex items-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-secondary text-[16px]">table_view</span>
<span className="">Raw CSV</span>
</button>
</div>
</div>
</div>
</div>
</div>
{/* Section 3: Recent Generated Reports Table */}
<div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg mb-space-xl flex flex-col">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md pb-space-sm">
<div className="flex flex-col">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">Immutable Ledger</span>
<h2 className="font-headline-3 text-headline-4 text-text-primary font-bold">Recent Completed Dossiers</h2>
</div>
<div className="flex items-center gap-space-sm">
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">filter_alt</span>
<input className="h-10 pl-9 pr-space-md rounded-xl bg-surface-container-low text-text-primary font-small text-small placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Filter completed archives..." type="text" />
</div>
<button className="h-10 px-space-md rounded-xl bg-surface-container-low hover:bg-surface-container text-text-primary font-body-medium text-small font-semibold flex items-center gap-1 transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">refresh</span>
<span className="">Refresh</span>
</button>
</div>
</div>
{/* Data Table */}
<div className="w-full overflow-x-auto">
<table className="w-full text-left">
<thead>
<tr className="bg-surface-container-low text-text-secondary font-caption text-caption uppercase tracking-wider">
<th className="py-3 px-space-md rounded-l-xl">Dossier Reference &amp; Title</th>
<th className="py-3 px-space-md">Execution Timestamp</th>
<th className="py-3 px-space-md">Certified Generator</th>
<th className="py-3 px-space-md">Payload Size</th>
<th className="py-3 px-space-md">Verification Status</th>
<th className="py-3 px-space-md text-right rounded-r-xl">Encrypted Download</th>
</tr>
</thead>
<tbody className="divide-y-0 text-text-primary font-body-medium text-small">
{/* Row 1 */}
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
</div>
<div className="flex flex-col">
<span className="font-bold text-text-primary">CIR-2025-M03-Aggregate.pdf</span>
<span className="font-caption text-caption text-text-secondary">Circulation &amp; Borrowing Dossier (March 2025)</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-md text-text-secondary font-caption text-caption">
              Today, 08:30:14 PHT
            </td>
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-1.5">
<img className="w-6 h-6 rounded-full object-cover" data-alt="A portrait photograph of a university administrator wearing formal academic blue attire with spectacles in professional studio lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCU5cITRmjmyaXve1Q1lWvSnLk-iWUyHnchFuABb9JTYMUcYKT_9HVSY5oFEyp6jE70wOH3ukCogvyc6i1BgHB_1OpbW2xDJLe0T4tcmVsCxviHingl_hKflH_cBH3VW25AbYg5iVaQUzoy5nMQ8CpSqQkhqi8UCZEI_JDfiuIqYMI5w4QwvCBBJPKr66gBkci5na2quGIIORpKesXs4vO1J0sEA2gyFho1_0FM6LOqDzqQjzUDid5X" />
<span className="text-text-primary font-medium">M. Santos (Librarian III)</span>
</div>
</td>
<td className="py-3.5 px-space-md text-text-secondary font-caption text-caption">
              4.82 MB
            </td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-soft-blue text-primary font-caption text-caption font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Certified Official
              </span>
</td>
<td className="py-3.5 px-space-md text-right">
<div className="inline-flex items-center gap-1">
<button className="p-1.5 rounded-lg hover:bg-surface-container text-primary transition-colors" title="Download Official PDF" type="button">
<span className="material-symbols-outlined text-[20px]">download</span>
</button>
<button className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary transition-colors" title="View Verification Hash" type="button">
<span className="material-symbols-outlined text-[20px]">fingerprint</span>
</button>
</div>
</td>
</tr>
{/* Row 2 */}
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-lg bg-secondary-container/60 flex items-center justify-center text-secondary">
<span className="material-symbols-outlined text-[18px]">table_chart</span>
</div>
<div className="flex flex-col">
<span className="font-bold text-text-primary">FIN-2025-Q1-Reconciled.xlsx</span>
<span className="font-caption text-caption text-text-secondary">Financial Collections &amp; Fine Journal (Q1 2025)</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-md text-text-secondary font-caption text-caption">
              Yesterday, 17:42:09 PHT
            </td>
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-1.5">
<div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-caption text-[10px] font-bold">SYS</div>
<span className="text-text-primary font-medium">AutoDaemon Dispatch</span>
</div>
</td>
<td className="py-3.5 px-space-md text-text-secondary font-caption text-caption">
              1.14 MB
            </td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-soft-blue text-primary font-caption text-caption font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Certified Official
              </span>
</td>
<td className="py-3.5 px-space-md text-right">
<div className="inline-flex items-center gap-1">
<button className="p-1.5 rounded-lg hover:bg-surface-container text-primary transition-colors" title="Download Official Spreadsheet" type="button">
<span className="material-symbols-outlined text-[20px]">download</span>
</button>
<button className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary transition-colors" title="View Verification Hash" type="button">
<span className="material-symbols-outlined text-[20px]">fingerprint</span>
</button>
</div>
</td>
</tr>
{/* Row 3 */}
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-lg bg-error-container/60 flex items-center justify-center text-error">
<span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
</div>
<div className="flex flex-col">
<span className="font-bold text-text-primary">DELINQ-HOLD-2025-03.pdf</span>
<span className="font-caption text-caption text-text-secondary">Overdue Disciplinary Registry (Registrar Clearance Copy)</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-md text-text-secondary font-caption text-caption">
              24 Mar 2025, 11:15:00 PHT
            </td>
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-1.5">
<img className="w-6 h-6 rounded-full object-cover" data-alt="A professional headshot of a female Filipino university administrator smiling in formal academic attire with an office library background." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxg3yrt23393E7YbucRQEWg4bS8umu03wEHd7UJQ46ZYU7ItyHbY1m4QQT9rcdoOqJHD9lA2rNV2aXaR1kpUxCKbR9ZIB3uuoxF6z8Z_MkrNOERhe5mzgXEEq8HwcRllMb9jlb9ckLrxY4iRVyFFVCy1yk_NxFyjw3RoCO1D6UtqVzVO8n9pa-hJgkjRHYjHYCaz-zMcH76WcLCy7j7VTQ0KLn8bo9riVofsOD7G8My1_XWbzpqkWz" />
<span className="text-text-primary font-medium">E. Dela Cruz (Registrar)</span>
</div>
</td>
<td className="py-3.5 px-space-md text-text-secondary font-caption text-caption">
              680 KB
            </td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container text-error font-caption text-caption font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                Action Enforced
              </span>
</td>
<td className="py-3.5 px-space-md text-right">
<div className="inline-flex items-center gap-1">
<button className="p-1.5 rounded-lg hover:bg-surface-container text-primary transition-colors" title="Download Locked File" type="button">
<span className="material-symbols-outlined text-[20px]">download</span>
</button>
<button className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary transition-colors" title="View Verification Hash" type="button">
<span className="material-symbols-outlined text-[20px]">fingerprint</span>
</button>
</div>
</td>
</tr>
{/* Row 4 */}
<tr className="hover:bg-surface-container-low/60 transition-colors">
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-sm">
<div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-text-secondary">
<span className="material-symbols-outlined text-[18px]">raw_on</span>
</div>
<div className="flex flex-col">
<span className="font-bold text-text-primary">ASSET-VALUATION-4892COPIES.csv</span>
<span className="font-caption text-caption text-text-secondary">Inventory Valuation &amp; PAS 16 Deprecation Ledger</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-md text-text-secondary font-caption text-caption">
              21 Mar 2025, 09:04:12 PHT
            </td>
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-1.5">
<div className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-caption text-[10px] font-bold">AUD</div>
<span className="text-text-primary font-medium">Internal Audit Bureau</span>
</div>
</td>
<td className="py-3.5 px-space-md text-text-secondary font-caption text-caption">
              8.30 MB
            </td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-soft-blue text-primary font-caption text-caption font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Certified Official
              </span>
</td>
<td className="py-3.5 px-space-md text-right">
<div className="inline-flex items-center gap-1">
<button className="p-1.5 rounded-lg hover:bg-surface-container text-primary transition-colors" title="Download Raw CSV" type="button">
<span className="material-symbols-outlined text-[20px]">download</span>
</button>
<button className="p-1.5 rounded-lg hover:bg-surface-container text-text-secondary transition-colors" title="View Verification Hash" type="button">
<span className="material-symbols-outlined text-[20px]">fingerprint</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
{/* Table Pagination & Ledger Summary Footer */}
<div className="pt-space-md mt-space-sm flex flex-col sm:flex-row items-center justify-between gap-space-sm font-caption text-caption text-text-secondary">
<div className="flex items-center gap-2">
<span className="">Displaying 4 of 42 statutory records</span>
<span className="text-outline-variant">•</span>
<span className="">Cryptographic signature: ed25519-katipuneros-root-ca</span>
</div>
<div className="flex items-center gap-1">
<button className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container font-semibold transition-colors disabled={true}:opacity-50" disabled={true} type="button">Previous</button>
<span className="px-3 py-1.5 font-bold text-primary">Page 1 of 11</span>
<button className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container font-semibold transition-colors" type="button">Next</button>
</div>
</div>
</div><div id="tab-panel-audit" className="reports-panel hidden flex-col w-full gap-space-xl"><div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md"><div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-outline-variant/20 flex items-center justify-between"><div className="flex flex-col"><span className="font-caption text-caption uppercase text-text-secondary font-semibold tracking-wider">Cryptographic Chain State</span><span className="font-headline-3 text-headline-4 text-primary mt-1 font-bold">Verified Intact</span><span className="font-caption text-caption text-status-available flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined text-[14px]">verified</span> 0 Seal Tamper Violations</span></div><div className="w-12 h-12 rounded-xl bg-soft-blue flex items-center justify-center text-primary"><span className="material-symbols-outlined text-[26px]">shield</span></div></div><div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-outline-variant/20 flex items-center justify-between"><div className="flex flex-col"><span className="font-caption text-caption uppercase text-text-secondary font-semibold tracking-wider">CHEd / ISO Standard Seal</span><span className="font-headline-3 text-headline-4 text-text-primary mt-1 font-bold">ISO 2789:2018</span><span className="font-caption text-caption text-primary flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined text-[14px]">check_circle</span> Statutory Compliance Level IV</span></div><div className="w-12 h-12 rounded-xl bg-secondary-container/50 flex items-center justify-center text-secondary"><span className="material-symbols-outlined text-[26px]">workspace_premium</span></div></div><div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm border border-outline-variant/20 flex items-center justify-between"><div className="flex flex-col"><span className="font-caption text-caption uppercase text-text-secondary font-semibold tracking-wider">Active Auditor Signatures</span><span className="font-headline-3 text-headline-4 text-text-primary mt-1 font-bold">4 Entities</span><span className="font-caption text-caption text-text-secondary flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined text-[14px]">badge</span> Dual Key Multi-sign Required</span></div><div className="w-12 h-12 rounded-xl bg-action-green/20 flex items-center justify-center text-text-primary"><span className="material-symbols-outlined text-[26px]">key</span></div></div></div><div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md"><div className="flex items-center gap-space-md"><div className="w-12 h-12 rounded-2xl bg-action-green/20 flex items-center justify-center text-text-primary shrink-0"><span className="material-symbols-outlined text-[26px]">fingerprint</span></div><div className="flex flex-col"><h3 className="font-headline-4 text-headline-4 text-text-primary font-bold">Instant SHA-256 Seal &amp; Tamper Verifier</h3><p className="font-caption text-caption text-text-secondary">Upload or paste any exported dossier verification hash string to validate timestamp against immutable ledger records.</p></div></div><div className="flex items-center gap-2 w-full md:w-auto"><input id="checksum-input" placeholder="Enter SHA-256 hash or dossier ID..." className="h-10 px-3 rounded-xl bg-surface-container-low text-text-primary font-small text-small placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 w-full md:w-80" /><button onClick={(e) => { (window as any).verifyEnteredChecksum?.(); }} className="h-10 px-space-md rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-medium text-small font-bold flex items-center gap-1 transition-all whitespace-nowrap shadow-sm"><span className="material-symbols-outlined text-[18px]">rule</span><span className="">Verify Seal</span></button></div></div><div id="checksum-alert-box" className="hidden p-space-md rounded-xl bg-soft-blue text-primary border border-primary/20 flex items-center justify-between"><div className="flex items-center gap-space-sm font-small text-small font-semibold"><span className="material-symbols-outlined text-[20px] text-status-available">check_circle</span><span id="checksum-alert-text" className="">Cryptographic verification matched! Hash signed by M. Santos (Librarian III) with Zero Alterations detected.</span></div><button onClick={() => { document.getElementById('checksum-alert-box')?.classList.add('hidden'); }} className="text-primary hover:text-text-primary font-caption text-caption uppercase font-bold">Dismiss</button></div><div className="bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg flex flex-col"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md pb-space-sm"><div className="flex flex-col"><span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">Cryptographic Ledger</span><h2 className="font-headline-3 text-headline-4 text-text-primary font-bold">Audit Trail &amp; Attestation Records</h2></div><div className="flex items-center gap-2"><span className="px-2.5 py-1 rounded-full bg-soft-blue text-primary text-caption font-bold">All Seals Verified (100%)</span></div></div><div className="w-full overflow-x-auto"><table className="w-full text-left"><thead><tr className="bg-surface-container-low text-text-secondary font-caption text-caption uppercase tracking-wider"><th className="py-3 px-space-md rounded-l-xl">Ledger Event &amp; Target Dossier</th><th className="py-3 px-space-md">SHA-256 Digest Signature</th><th className="py-3 px-space-md">Certified Signer &amp; Role</th><th className="py-3 px-space-md">Timestamp (UTC+8)</th><th className="py-3 px-space-md text-right rounded-r-xl">Attestation Status</th></tr></thead><tbody className="divide-y-0 text-text-primary font-body-medium text-small"><tr className="hover:bg-surface-container-low/60 transition-colors"><td className="py-3.5 px-space-md"><div className="flex items-center gap-space-sm"><span className="material-symbols-outlined text-primary text-[20px]">verified</span><div className="flex flex-col"><span className="font-bold text-text-primary">Export Watermark Applied</span><span className="font-caption text-caption text-text-secondary">CIR-2025-M03-Aggregate.pdf</span></div></div></td><td className="py-3.5 px-space-md font-caption text-caption text-text-secondary font-mono"><span className="px-2 py-1 rounded bg-surface-container-low font-bold text-text-primary text-[11px]">7a9f8b2c4e1...03df29</span></td><td className="py-3.5 px-space-md"><div className="flex items-center gap-1.5"><span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-caption text-[10px] font-bold">MS</span><span className="text-text-primary font-medium">M. Santos (Librarian III)</span></div></td><td className="py-3.5 px-space-md text-text-secondary font-caption text-caption">2025-03-25 08:30:14</td><td className="py-3.5 px-space-md text-right"><span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-soft-blue text-primary font-caption text-caption font-bold"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>Certified Intact</span></td></tr><tr className="hover:bg-surface-container-low/60 transition-colors"><td className="py-3.5 px-space-md"><div className="flex items-center gap-space-sm"><span className="material-symbols-outlined text-secondary text-[20px]">lock</span><div className="flex flex-col"><span className="font-bold text-text-primary">Statutory Balance Snapshot</span><span className="font-caption text-caption text-text-secondary">FIN-2025-Q1-Reconciled.xlsx</span></div></div></td><td className="py-3.5 px-space-md font-caption text-caption text-text-secondary font-mono"><span className="px-2 py-1 rounded bg-surface-container-low font-bold text-text-primary text-[11px]">89bb41c590e...a715fe</span></td><td className="py-3.5 px-space-md"><div className="flex items-center gap-1.5"><span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-caption text-[10px] font-bold">SYS</span><span className="text-text-primary font-medium">AutoDaemon Engine</span></div></td><td className="py-3.5 px-space-md text-text-secondary font-caption text-caption">2025-03-24 17:42:09</td><td className="py-3.5 px-space-md text-right"><span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-soft-blue text-primary font-caption text-caption font-bold"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>Certified Intact</span></td></tr><tr className="hover:bg-surface-container-low/60 transition-colors"><td className="py-3.5 px-space-md"><div className="flex items-center gap-space-sm"><span className="material-symbols-outlined text-status-danger text-[20px]">gavel</span><div className="flex flex-col"><span className="font-bold text-text-primary">Clearance Block Hold Seal</span><span className="font-caption text-caption text-text-secondary">DELINQ-HOLD-2025-03.pdf</span></div></div></td><td className="py-3.5 px-space-md font-caption text-caption text-text-secondary font-mono"><span className="px-2 py-1 rounded bg-surface-container-low font-bold text-text-primary text-[11px]">13c8ef2882a...9b421a</span></td><td className="py-3.5 px-space-md"><div className="flex items-center gap-1.5"><span className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-caption text-[10px] font-bold">ED</span><span className="text-text-primary font-medium">E. Dela Cruz (Registrar)</span></div></td><td className="py-3.5 px-space-md text-text-secondary font-caption text-caption">2025-03-24 11:15:00</td><td className="py-3.5 px-space-md text-right"><span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container text-error font-caption text-caption font-bold"><span className="w-1.5 h-1.5 rounded-full bg-error"></span>Action Enforced</span></td></tr><tr className="hover:bg-surface-container-low/60 transition-colors"><td className="py-3.5 px-space-md"><div className="flex items-center gap-space-sm"><span className="material-symbols-outlined text-secondary text-[20px]">assured_workload</span><div className="flex flex-col"><span className="font-bold text-text-primary">PAS 16 Deprecation Attestation</span><span className="font-caption text-caption text-text-secondary">ASSET-VALUATION-4892COPIES.csv</span></div></div></td><td className="py-3.5 px-space-md font-caption text-caption text-text-secondary font-mono"><span className="px-2 py-1 rounded bg-surface-container-low font-bold text-text-primary text-[11px]">44e908da01b...cc381f</span></td><td className="py-3.5 px-space-md"><div className="flex items-center gap-1.5"><span className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-caption text-[10px] font-bold">AUD</span><span className="text-text-primary font-medium">Internal Audit Bureau</span></div></td><td className="py-3.5 px-space-md text-text-secondary font-caption text-caption">2025-03-21 09:04:12</td><td className="py-3.5 px-space-md text-right"><span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-soft-blue text-primary font-caption text-caption font-bold"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>Certified Intact</span></td></tr></tbody></table></div></div></div><div id="tab-panel-schedule" className="reports-panel hidden flex-col w-full gap-space-xl"><div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/20"><div><span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">Automation Engine</span><h3 className="font-headline-3 text-headline-4 text-text-primary font-bold">Recurring Statutory Dispatch Triggers</h3><p className="font-caption text-caption text-text-secondary mt-0.5">Manage cron schedules, distribution channels, and secure dispatch nodes to statutory bodies.</p></div><button onClick={() => alert('New automated schedule modal: specify cron interval, target distribution list, and report parameters.')} className="h-11 px-space-lg rounded-xl bg-action-green text-text-primary hover:bg-action-green-hover font-body-medium text-small font-bold flex items-center gap-space-xs transition-all shadow-sm w-fit"><span className="material-symbols-outlined text-[20px]">more_time</span><span className="">Add Schedule Trigger</span></button></div><div className="grid grid-cols-1 md:grid-cols-3 gap-space-md"><div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col justify-between"><div className="flex items-center justify-between mb-space-sm"><span className="font-caption text-caption font-mono px-2 py-1 rounded bg-surface-container-low font-bold text-primary">0 5 * * *</span><span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-action-green/20 text-text-primary font-caption text-caption font-bold"><span className="w-1.5 h-1.5 rounded-full bg-action-green"></span>Active</span></div><h4 className="font-headline-4 text-headline-4 text-text-primary font-bold mb-1">Board of Regents Daily Dossier</h4><p className="font-caption text-caption text-text-secondary mb-space-md">Circulation, POS reconciliation, and physical inventory daily summary delivered every morning at 05:00 PHT.</p><div className="space-y-1.5 text-caption font-caption text-text-secondary mb-space-md pt-2 border-t border-outline-variant/20"><div className="flex justify-between"><span className="">Channel:</span><span className="font-semibold text-text-primary">Encrypted Mail + Secure FTP</span></div><div className="flex justify-between"><span className="">Recipients:</span><span className="font-semibold text-text-primary">regents@univ.edu.ph (6)</span></div><div className="flex justify-between"><span className="">Next Run:</span><span className="font-semibold text-primary">Tomorrow, 05:00 PHT</span></div></div><div className="flex items-center gap-2"><button onClick={(e) => { (window as any).triggerRunNow?.('Board of Regents Daily Dossier'); }} className="flex-1 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary font-caption text-caption font-bold flex items-center justify-center gap-1 transition-colors"><span className="material-symbols-outlined text-[16px] text-primary">play_arrow</span><span className="">Run Now</span></button><button className="h-9 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-secondary transition-colors" title="Configure Schedule"><span className="material-symbols-outlined text-[18px]">settings</span></button></div></div><div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col justify-between"><div className="flex items-center justify-between mb-space-sm"><span className="font-caption text-caption font-mono px-2 py-1 rounded bg-surface-container-low font-bold text-secondary">0 20 * * 5</span><span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-action-green/20 text-text-primary font-caption text-caption font-bold"><span className="w-1.5 h-1.5 rounded-full bg-action-green"></span>Active</span></div><h4 className="font-headline-4 text-headline-4 text-text-primary font-bold mb-1">Weekly Academic Demand Ledger</h4><p className="font-caption text-caption text-text-secondary mb-space-md">Departmental lending velocity and waitlist report compiled every Friday evening for Dean's council review.</p><div className="space-y-1.5 text-caption font-caption text-text-secondary mb-space-md pt-2 border-t border-outline-variant/20"><div className="flex justify-between"><span className="">Channel:</span><span className="font-semibold text-text-primary">Cloud Storage + Email Digest</span></div><div className="flex justify-between"><span className="">Recipients:</span><span className="font-semibold text-text-primary">academic-council@univ.edu.ph</span></div><div className="flex justify-between"><span className="">Next Run:</span><span className="font-semibold text-secondary">Friday, 20:00 PHT</span></div></div><div className="flex items-center gap-2"><button onClick={(e) => { (window as any).triggerRunNow?.('Weekly Academic Demand Ledger'); }} className="flex-1 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary font-caption text-caption font-bold flex items-center justify-center gap-1 transition-colors"><span className="material-symbols-outlined text-[16px] text-primary">play_arrow</span><span className="">Run Now</span></button><button className="h-9 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-secondary transition-colors" title="Configure Schedule"><span className="material-symbols-outlined text-[18px]">settings</span></button></div></div><div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col justify-between"><div className="flex items-center justify-between mb-space-sm"><span className="font-caption text-caption font-mono px-2 py-1 rounded bg-surface-container-low font-bold text-tertiary">0 0 1 * *</span><span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-action-green/20 text-text-primary font-caption text-caption font-bold"><span className="w-1.5 h-1.5 rounded-full bg-action-green"></span>Active</span></div><h4 className="font-headline-4 text-headline-4 text-text-primary font-bold mb-1">CHEd Accreditation Monthly Packet</h4><p className="font-caption text-caption text-text-secondary mb-space-md">Statutory library records, ISO 2789:2018 preservation manifest, and fine collections ledger serialized for national registry.</p><div className="space-y-1.5 text-caption font-caption text-text-secondary mb-space-md pt-2 border-t border-outline-variant/20"><div className="flex justify-between"><span className="">Channel:</span><span className="font-semibold text-text-primary">CHEd Portal API + Print Queue</span></div><div className="flex justify-between"><span className="">Recipients:</span><span className="font-semibold text-text-primary">ched-liaison@univ.edu.ph</span></div><div className="flex justify-between"><span className="">Next Run:</span><span className="font-semibold text-primary">1 Apr 2025, 00:00 PHT</span></div></div><div className="flex items-center gap-2"><button onClick={(e) => { (window as any).triggerRunNow?.('CHEd Accreditation Monthly Packet'); }} className="flex-1 h-9 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-primary font-caption text-caption font-bold flex items-center justify-center gap-1 transition-colors"><span className="material-symbols-outlined text-[16px] text-primary">play_arrow</span><span className="">Run Now</span></button><button className="h-9 px-3 rounded-lg bg-surface-container-low hover:bg-surface-container text-text-secondary transition-colors" title="Configure Schedule"><span className="material-symbols-outlined text-[18px]">settings</span></button></div></div></div><div id="schedule-run-alert" className="hidden p-space-md rounded-xl bg-action-green/20 text-text-primary border border-action-green/40 flex items-center justify-between font-body-medium text-small"><div className="flex items-center gap-space-sm font-semibold"><span className="material-symbols-outlined text-[20px] text-primary">task_alt</span><span id="schedule-run-text" className="">Dispatched automated task immediately.</span></div><button onClick={() => { document.getElementById('schedule-run-alert')?.classList.add('hidden'); }} className="text-text-secondary hover:text-text-primary font-caption text-caption font-bold">Dismiss</button></div></div>
{/* Interactive Client-side Script for Form Synthesis State */}

</div>
    </div>
  );
};

export default Reports;
