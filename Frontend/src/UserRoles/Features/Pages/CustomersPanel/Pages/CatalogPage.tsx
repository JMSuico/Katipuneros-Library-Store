// [Layer: UserRoles/Features/Pages/CustomersPanel/Pages]
// CatalogPage.tsx -- Customer Book Catalog and OPAC Search
// Converted directly from NavCatalogPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const CatalogPage: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
  // Favorite Toggle Micro-Interaction
  function toggleFavorite(btn: HTMLElement) {
    const icon = btn.querySelector('.material-symbols-outlined') as HTMLElement | null;
    if (!icon) return;
    const isFavorited = icon.innerText === 'favorite';
    
    if (isFavorited) {
      icon.innerText = 'favorite_border';
      icon.style.fontVariationSettings = "'FILL' 0";
      btn.classList.remove('text-status-danger');
      btn.classList.add('text-text-secondary');
    } else {
      icon.innerText = 'favorite';
      icon.style.fontVariationSettings = "'FILL' 1";
      btn.classList.remove('text-text-secondary');
      btn.classList.add('text-status-danger');
    }
  }

  // Reservation Feedback Micro-Interaction
  let toastTimer: ReturnType<typeof setTimeout> | undefined;
  function triggerReservation(title: string, author: string, location: string, isWaitlist: boolean = false) {
    const toast = document.getElementById('reservation-toast');
    const toastTitle = document.getElementById('toast-title');
    const toastBody = document.getElementById('toast-body');

    if (isWaitlist) {
      if (toastTitle) toastTitle.textContent = `Waitlist Position Confirmed: #4`;
      if (toastBody) toastBody.textContent = `Notification will be dispatched when ${title} returns to circulation.`;
    } else {
      if (toastTitle) toastTitle.textContent = `Book Reserved: ${title}`;
      if (toastBody) toastBody.textContent = `Available for pickup at Stacks Desk (${location}) for 48 hours.`;
    }

    if (toast) {
      toast.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
      toast.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
    }

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      dismissToast();
    }, 4000);
  }

  function dismissToast() {
    const toast = document.getElementById('reservation-toast');
    if (toast) {
      toast.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
      toast.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
    }
  }

  w.toggleFavorite = toggleFavorite;
  w.triggerReservation = triggerReservation;
  w.dismissToast = dismissToast;

  // View Switcher (Grid vs Compact List View)
  const viewGridBtn = document.getElementById('view-grid-btn');
  const viewListBtn = document.getElementById('view-list-btn');
  const catalogGrid = document.getElementById('book-catalog-container');

  viewListBtn.addEventListener('click', () => {
    catalogGrid.classList.remove('xl:grid-cols-4', 'sm:grid-cols-2');
    catalogGrid.classList.add('grid-cols-1');
    
    viewListBtn.classList.add('bg-primary', 'text-on-primary', 'shadow-sm');
    viewListBtn.classList.remove('text-text-secondary');
    viewGridBtn.classList.remove('bg-primary', 'text-on-primary', 'shadow-sm');
    viewGridBtn.classList.add('text-text-secondary');
  });

  viewGridBtn.addEventListener('click', () => {
    catalogGrid.classList.remove('grid-cols-1');
    catalogGrid.classList.add('sm:grid-cols-2', 'xl:grid-cols-4');

    viewGridBtn.classList.add('bg-primary', 'text-on-primary', 'shadow-sm');
    viewGridBtn.classList.remove('text-text-secondary');
    viewListBtn.classList.remove('bg-primary', 'text-on-primary', 'shadow-sm');
    viewListBtn.classList.add('text-text-secondary');
  });

    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
{/* Catalog Atmosphere Background Accents */}
<div className="relative w-full overflow-hidden pb-space-3xl">
{/* Ambient Glass Gradient Orbs */}
<div className="absolute -top-12 left-1/4 w-96 h-96 bg-primary-fixed-dim/20 rounded-full blur-3xl pointer-events-none -z-10"></div>
<div className="absolute top-48 right-10 w-80 h-80 bg-action-green/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
{/* Section 1: Catalog Header & Dynamic Query Bar */}
<div className="w-full flex flex-col gap-space-lg pt-space-md">
{/* Title & Micro-stats row */}
<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
<div className="flex flex-col gap-space-xs max-w-2xl">
<div className="flex items-center gap-space-xs">
<span className="px-space-sm py-0.5 rounded-full bg-soft-blue text-primary font-caption text-caption uppercase tracking-wider font-semibold">Scholastic Registry 2024</span>
<span className="w-1.5 h-1.5 rounded-full bg-action-green"></span>
<span className="font-caption text-caption text-text-secondary">Direct Access Stacks</span>
</div>
<h1 className="font-headline-1 text-headline-1 text-text-primary tracking-tight">Explore Scholastic Catalog</h1>
<p className="font-body-large text-body-large text-text-secondary leading-relaxed">
            Discover books, folios, and academic monographs curated across ten university divisions from the Katipuneros archival repository.
          </p>
</div>
{/* Metric pill summary */}
<div className="flex items-center gap-space-sm bg-glass-surface backdrop-blur-xl p-space-sm rounded-2xl shadow-sm self-start lg:self-auto">
<div className="px-space-md py-space-xs rounded-xl bg-surface-container-lowest/80 text-left">
<div className="font-caption text-caption text-text-secondary">Catalog Volumes</div>
<div className="font-headline-4 text-headline-4 text-primary">1,248</div>
</div>
<div className="px-space-md py-space-xs rounded-xl bg-surface-container-lowest/80 text-left">
<div className="font-caption text-caption text-text-secondary">Active Circulation</div>
<div className="font-headline-4 text-headline-4 text-text-primary">89.4%</div>
</div>
</div>
</div>
{/* Main Unified Control Deck (Glassmorphic Bar) */}
<div className="w-full bg-glass-surface backdrop-blur-2xl rounded-2xl p-space-md shadow-[0_8px_30px_rgba(0,101,138,0.06)] flex flex-col gap-space-md">
{/* Main Search Bar */}
<div className="flex flex-col md:flex-row items-center gap-space-sm w-full">
<div className="relative flex-1 w-full">
<span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-primary text-xl pointer-events-none">search</span>
<input className="w-full pl-12 pr-space-xl py-3.5 bg-surface-container-lowest/90 rounded-xl font-body text-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:bg-surface-container-lowest transition-all shadow-sm" id="catalog-search" placeholder="Search by keyword, author, full title, or Dewey Decimal/ISBN code..." type="text" />
<button className="absolute right-space-sm top-1/2 -translate-y-1/2 px-space-sm py-1 rounded-lg bg-surface-container-high text-text-secondary font-caption text-caption hover:text-text-primary" type="button">
              Clear
            </button>
</div>
{/* Quick Actions Button Group */}
<div className="flex items-center gap-space-sm w-full md:w-auto shrink-0 justify-between md:justify-end">
{/* Filter Drawer Trigger for Small Screens */}
<button className="lg:hidden flex items-center gap-space-xs px-space-md py-3 rounded-xl bg-surface-container-lowest text-text-primary font-small text-small shadow-sm hover:bg-surface-container-high transition-colors" id="toggle-filter-drawer">
<span className="material-symbols-outlined text-base">tune</span>
<span className="">Filters</span>
</button>
{/* View Modes (Grid vs List) */}
<div className="flex items-center p-1 bg-surface-container-lowest/90 rounded-xl shadow-sm">
<button aria-label="Grid View" className="p-2 rounded-lg bg-primary text-on-primary shadow-sm transition-all flex items-center justify-center" id="view-grid-btn">
<span className="material-symbols-outlined text-lg">grid_view</span>
</button>
<button aria-label="List View" className="p-2 rounded-lg text-text-secondary hover:text-text-primary transition-all flex items-center justify-center" id="view-list-btn">
<span className="material-symbols-outlined text-lg">view_list</span>
</button>
</div>
{/* Master Search Execute */}
<button className="flex items-center gap-space-xs px-space-lg py-3 rounded-xl bg-action-green text-text-primary font-body-medium text-body-medium font-semibold hover:bg-action-green-hover transition-all shadow-sm">
<span className="">Search Stacks</span>
<span className="material-symbols-outlined text-base">arrow_forward</span>
</button>
</div>
</div>
{/* Filter Controls Strip */}
<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-space-sm pt-space-xs">
{/* Availability Select */}
<div className="flex flex-col gap-1">
<label className="font-caption text-caption text-text-secondary px-1">Availability</label>
<div className="relative">
<select className="w-full appearance-none bg-surface-container-lowest/80 text-text-primary font-small text-small px-space-md py-2.5 rounded-xl shadow-sm focus:outline-none cursor-pointer">
<option value="all">All Copies (1,248)</option>
<option selected={true} value="now">Available Now (942)</option>
<option value="limited">Limited Copies (&lt; 3)</option>
<option value="waitlist">Waitlist / In Circulation</option>
</select>
<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-lg">expand_more</span>
</div>
</div>
{/* Publication Era Range */}
<div className="flex flex-col gap-1">
<label className="font-caption text-caption text-text-secondary px-1">Publication Era</label>
<div className="relative">
<select className="w-full appearance-none bg-surface-container-lowest/80 text-text-primary font-small text-small px-space-md py-2.5 rounded-xl shadow-sm focus:outline-none cursor-pointer">
<option value="any">Any Era (1800 - 2024)</option>
<option value="2020">Contemporary (2020–2024)</option>
<option value="2000">Modern Digital (2000–2019)</option>
<option value="classic">Classical Folios (&lt; 2000)</option>
</select>
<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-lg">expand_more</span>
</div>
</div>
{/* Academic Division / Department */}
<div className="flex flex-col gap-1">
<label className="font-caption text-caption text-text-secondary px-1">Faculty Category</label>
<div className="relative">
<select className="w-full appearance-none bg-surface-container-lowest/80 text-text-primary font-small text-small px-space-md py-2.5 rounded-xl shadow-sm focus:outline-none cursor-pointer">
<option value="all">All Divisions</option>
<option value="cs">Computer Science &amp; Info</option>
<option value="lit">Letters &amp; Human Sciences</option>
<option value="law">Law, Public Policy &amp; Ethics</option>
<option value="eng">Engineering &amp; Applied Math</option>
</select>
<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-lg">expand_more</span>
</div>
</div>
{/* Sort Sequence Dropdown */}
<div className="flex flex-col gap-1">
<label className="font-caption text-caption text-text-secondary px-1">Sort Registry</label>
<div className="relative">
<select className="w-full appearance-none bg-surface-container-lowest/80 text-text-primary font-small text-small px-space-md py-2.5 rounded-xl shadow-sm focus:outline-none cursor-pointer">
<option value="popular">Most Popular (Circulation)</option>
<option value="newest">Newest Additions</option>
<option value="az">Title: A to Z</option>
<option value="borrowed">Most Borrowed This Term</option>
<option value="available">Highest Availability</option>
</select>
<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-lg">swap_vert</span>
</div>
</div>
</div>
</div>
{/* Section 2: Horizontal Discipline Scroll Chips */}
<div className="flex items-center gap-space-xs overflow-x-auto pb-space-xs pt-1 no-scrollbar">
<button className="px-space-md py-2 rounded-full bg-action-green text-text-primary font-body-medium text-body-medium font-semibold shadow-sm shrink-0 flex items-center gap-1.5 transition-transform hover:scale-105">
<span className="">All Disciplines</span>
<span className="text-caption font-mono bg-text-primary/10 px-1.5 py-0.5 rounded-full">1,248</span>
</button>
<button className="px-space-md py-2 rounded-full bg-chip-unselected-bg text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest transition-all font-small text-small shrink-0">
          Technology &amp; Systems
        </button>
<button className="px-space-md py-2 rounded-full bg-chip-unselected-bg text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest transition-all font-small text-small shrink-0">
          Pure Science &amp; Physics
        </button>
<button className="px-space-md py-2 rounded-full bg-chip-unselected-bg text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest transition-all font-small text-small shrink-0">
          Classic Literature
        </button>
<button className="px-space-md py-2 rounded-full bg-chip-unselected-bg text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest transition-all font-small text-small shrink-0">
          Philosophy &amp; Logic
        </button>
<button className="px-space-md py-2 rounded-full bg-chip-unselected-bg text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest transition-all font-small text-small shrink-0">
          Business &amp; Macro-Econ
        </button>
<button className="px-space-md py-2 rounded-full bg-chip-unselected-bg text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest transition-all font-small text-small shrink-0">
          Education &amp; Pedagogy
        </button>
<button className="px-space-md py-2 rounded-full bg-chip-unselected-bg text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest transition-all font-small text-small shrink-0">
          Law &amp; Governance
        </button>
<button className="px-space-md py-2 rounded-full bg-chip-unselected-bg text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest transition-all font-small text-small shrink-0">
          Applied Engineering
        </button>
</div>
</div>
{/* Main Body: Multi-column Asymmetric Stacks Layout */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mt-space-lg items-start">
{/* Section 4: Glass Side Filter Drawer / Stacks Curator Summary (lg:col-span-3) */}
<aside className="hidden lg:flex flex-col gap-space-md lg:col-span-3 sticky top-24">
{/* Physical Location Locator Box */}
<div className="bg-glass-surface backdrop-blur-xl rounded-2xl p-space-md shadow-sm flex flex-col gap-space-sm">
<div className="flex items-center justify-between pb-space-xs">
<span className="font-headline-4 text-headline-4 text-text-primary flex items-center gap-1.5">
<span className="material-symbols-outlined text-primary">shelves</span>
              Stacks Navigator
            </span>
<span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-caption text-caption">Floor 2 &amp; 3</span>
</div>
<p className="font-small text-small text-text-secondary">Select collection zones to highlight shelf proximity on your mobile patron map.</p>
<div className="flex flex-col gap-2 pt-space-xs">
<label className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-lowest/80 hover:bg-surface-container-lowest transition-all cursor-pointer">
<span className="flex items-center gap-2 font-small text-small text-text-primary">
<input defaultChecked className="w-4 h-4 rounded text-primary focus:ring-0 accent-primary" type="checkbox" />
<span className="">Bay A · Math &amp; Tech</span>
</span>
<span className="font-caption text-caption text-text-secondary">412 vol</span>
</label>
<label className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-lowest/80 hover:bg-surface-container-lowest transition-all cursor-pointer">
<span className="flex items-center gap-2 font-small text-small text-text-primary">
<input defaultChecked className="w-4 h-4 rounded text-primary focus:ring-0 accent-primary" type="checkbox" />
<span className="">Bay B · Humanities</span>
</span>
<span className="font-caption text-caption text-text-secondary">380 vol</span>
</label>
<label className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-lowest/80 hover:bg-surface-container-lowest transition-all cursor-pointer">
<span className="flex items-center gap-2 font-small text-small text-text-primary">
<input className="w-4 h-4 rounded text-primary focus:ring-0 accent-primary" type="checkbox" />
<span className="">Rare Folios &amp; Archives</span>
</span>
<span className="font-caption text-caption text-status-pending font-semibold">Special Permit</span>
</label>
<label className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-lowest/80 hover:bg-surface-container-lowest transition-all cursor-pointer">
<span className="flex items-center gap-2 font-small text-small text-text-primary">
<input defaultChecked className="w-4 h-4 rounded text-primary focus:ring-0 accent-primary" type="checkbox" />
<span className="">Reserved Reference Desk</span>
</span>
<span className="font-caption text-caption text-text-secondary">114 vol</span>
</label>
</div>
</div>
{/* Binding & Format Selector */}
<div className="bg-glass-surface backdrop-blur-xl rounded-2xl p-space-md shadow-sm flex flex-col gap-space-sm">
<span className="font-body-medium text-body-medium font-semibold text-text-primary">Binding &amp; Media</span>
<div className="flex flex-wrap gap-1.5">
<button className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-caption text-caption shadow-sm">All Formats</button>
<button className="px-3 py-1.5 rounded-lg bg-surface-container-lowest/80 text-text-secondary hover:text-text-primary font-caption text-caption">Hardcover Monograph</button>
<button className="px-3 py-1.5 rounded-lg bg-surface-container-lowest/80 text-text-secondary hover:text-text-primary font-caption text-caption">Trade Paperback</button>
<button className="px-3 py-1.5 rounded-lg bg-surface-container-lowest/80 text-text-secondary hover:text-text-primary font-caption text-caption">Digital eFolio (PDF)</button>
</div>
<div className="pt-space-xs flex flex-col gap-1.5">
<span className="font-caption text-caption text-text-secondary">Primary Language</span>
<div className="flex gap-2">
<span className="px-2.5 py-1 rounded-md bg-surface-container-high text-text-primary font-caption text-caption font-semibold">English (98%)</span>
<span className="px-2.5 py-1 rounded-md bg-surface-container-lowest text-text-secondary font-caption text-caption">Filipino</span>
<span className="px-2.5 py-1 rounded-md bg-surface-container-lowest text-text-secondary font-caption text-caption">Spanish</span>
</div>
</div>
</div>
{/* Loan Quota Mini Progress Visualization */}
<div className="bg-soft-blue/70 rounded-2xl p-space-md shadow-sm flex flex-col gap-space-xs relative overflow-hidden">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase text-primary font-bold tracking-wider">Patron Reserve Quota</span>
<span className="font-caption text-caption text-text-primary font-semibold">3 of 5 Used</span>
</div>
{/* SVG Progress Arc / Bar */}
<div className="w-full bg-surface-container-lowest/70 h-2.5 rounded-full overflow-hidden mt-1">
<div className="bg-action-green h-full rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
</div>
<p className="font-caption text-caption text-text-secondary pt-1">
            You can hold 2 additional volumes concurrently under Graduate Patron privileges.
          </p>
</div>
</aside>
{/* Section 3: Scholastic Book Grid (lg:col-span-9) */}
<section className="lg:col-span-9 flex flex-col gap-space-lg">
{/* Results count & Quick badge toggle bar */}
<div className="flex items-center justify-between px-space-xs">
<div className="flex items-center gap-space-xs">
<span className="font-body-medium text-body-medium font-semibold text-text-primary">Showing 1–8 of 1,248 Titles</span>
<span className="font-caption text-caption text-text-secondary">• Stacks sync verified 3m ago</span>
</div>
<div className="flex items-center gap-2">
<span className="text-caption font-caption text-text-secondary hidden sm:inline">Active Filter:</span>
<span className="inline-flex items-center gap-1 bg-surface-container-highest px-2.5 py-1 rounded-full text-caption font-caption text-text-primary">
              Available &amp; Limited
              <button className="hover:text-error transition-colors"><span className="material-symbols-outlined text-xs">close</span></button>
</span>
</div>
</div>
{/* 4-Column Responsive Product Card Grid (2 on mobile/tablet, 4 on desktop) */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md" id="book-catalog-container">
{/* Book 1: Clean Code */}
<article className="group bg-surface-container-lowest/90 rounded-2xl p-space-md shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
{/* Favorite button absolute */}
<button aria-label="Favorite Book" className="absolute top-space-md right-space-md z-10 w-8 h-8 rounded-full bg-glass-surface backdrop-blur-md flex items-center justify-center text-text-secondary hover:text-status-danger transition-colors shadow-sm" onClick={(e) => { (window as any).toggleFavorite?.(e.currentTarget); }}>
<span className="material-symbols-outlined text-lg">favorite_border</span>
</button>
{/* Book Cover Showcase with 3D perspective flair */}
<div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-surface-container shadow-inner mb-space-sm group-hover:scale-[1.02] transition-transform duration-300">
<img className="w-full h-full object-cover" data-alt="Photorealistic 3D academic book cover of Clean Code by Robert C. Martin standing at a 20 degree angle. Blue cloth spine, sharp modern typography, subtle library barcode stamp on the corner, warm studio light, clean minimal academic studio aesthetic in shades of soft blue and navy." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOJXvKpu8Q-RKeVZCFzgfFrrFSdPDVWZoqJD9Oi7RQXJ6DfABCMVO4NPr003fZL2NITVQE1nNKJN1b_BYEN5vkDVbT0cGE71rd9JEzRnfNg6DDo5ImRQygPriY_IOr49kxxwNWHuFYOf_aff5d6b3e0QeIRwIFDulEWDtVC-ZgXTwfhFnBYps8yUHtsXTgNjJBmdQCqOvC0Au09litR3aACf-du1gkI4J-cZhX-C3sYCWx_t30E9Gn" />
<span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-surface-container-lowest/95 backdrop-blur-sm font-caption text-caption text-primary font-mono font-semibold shadow-xs">
                Dewey: 005.1 MAR
              </span>
</div>
{/* Content & Metadata */}
<div className="flex flex-col gap-1 flex-1">
<div className="flex items-center justify-between gap-1">
<span className="font-caption text-caption uppercase text-primary font-semibold tracking-wider">Technology</span>
<div className="flex items-center gap-0.5 text-text-primary font-caption text-caption">
<span className="material-symbols-outlined text-status-pending text-sm" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-semibold">4.9</span>
<span className="text-text-secondary">(342)</span>
</div>
</div>
<h3 className="font-headline-4 text-headline-4 text-text-primary group-hover:text-primary transition-colors line-clamp-1 text-base font-semibold">
                Clean Code
              </h3>
<p className="font-small text-small text-text-secondary line-clamp-1">Robert C. Martin</p>
{/* Stock pill */}
<div className="pt-2 flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-action-green"></span>
<span className="font-caption text-caption text-status-available font-semibold">4 Available in Bay A-12</span>
</div>
</div>
{/* Action footer */}
<div className="pt-space-md flex flex-col gap-space-xs mt-auto">
<button className="w-full py-2.5 rounded-xl bg-action-green text-text-primary font-body-medium text-body-medium font-semibold hover:bg-action-green-hover transition-colors shadow-sm flex items-center justify-center gap-1.5" onClick={(e) => { (window as any).triggerReservation?.('Clean Code', 'Robert C. Martin', 'Bay A-12'); }}>
<span className="material-symbols-outlined text-base">bookmark_add</span>
<span className="">Reserve Book</span>
</button>
<button className="w-full py-2 rounded-xl bg-soft-blue/60 text-primary font-small text-small hover:bg-soft-blue transition-colors text-center font-medium">
                View Details &amp; Stacks
              </button>
</div>
</article>
{/* Book 2: The Great Gatsby */}
<article className="group bg-surface-container-lowest/90 rounded-2xl p-space-md shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
<button aria-label="Favorite Book" className="absolute top-space-md right-space-md z-10 w-8 h-8 rounded-full bg-glass-surface backdrop-blur-md flex items-center justify-center text-text-secondary hover:text-status-danger transition-colors shadow-sm" onClick={(e) => { (window as any).toggleFavorite?.(e.currentTarget); }}>
<span className="material-symbols-outlined text-lg">favorite_border</span>
</button>
<div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-surface-container shadow-inner mb-space-sm group-hover:scale-[1.02] transition-transform duration-300">
<img className="w-full h-full object-cover" data-alt="Editorial hardcover edition of The Great Gatsby by F. Scott Fitzgerald. Deep royal blue canvas with celestial art deco golden eyes and skyline illustration. Soft library museum lighting, soft matte paper texture, calm scholarly presence." src="https://lh3.googleusercontent.com/aida-public/AB6AXuALlSKeixqzqK3eviLxE7O09X0G9pkXUTB_Hzt2UJL1pfeSkIktzgSZuPCMwIcGkgzkntAl6D1mjOhTzXYDUT76yqo9Dkp8AEPGFZ6jqu2Vo9rOva2W_MPi6-CftNd0n-9zjHlHDo3uux0GbMRb7SQb3zM4GR3k4T-4VBiEKYvIGGcb2kB1t4VSL242FYCwxiIPraARhCzVWaLiNs4SPb2mKpj0CUfJmeoLAGLR_xYVKAP_wwFXEgtk" />
<span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-surface-container-lowest/95 backdrop-blur-sm font-caption text-caption text-primary font-mono font-semibold shadow-xs">
                Dewey: 813.52 FIT
              </span>
</div>
<div className="flex flex-col gap-1 flex-1">
<div className="flex items-center justify-between gap-1">
<span className="font-caption text-caption uppercase text-primary font-semibold tracking-wider">Literature</span>
<div className="flex items-center gap-0.5 text-text-primary font-caption text-caption">
<span className="material-symbols-outlined text-status-pending text-sm" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-semibold">4.8</span>
<span className="text-text-secondary">(512)</span>
</div>
</div>
<h3 className="font-headline-4 text-headline-4 text-text-primary group-hover:text-primary transition-colors line-clamp-1 text-base font-semibold">
                The Great Gatsby
              </h3>
<p className="font-small text-small text-text-secondary line-clamp-1">F. Scott Fitzgerald</p>
<div className="pt-2 flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-action-green"></span>
<span className="font-caption text-caption text-status-available font-semibold">2 Available in Bay B-04</span>
</div>
</div>
<div className="pt-space-md flex flex-col gap-space-xs mt-auto">
<button className="w-full py-2.5 rounded-xl bg-action-green text-text-primary font-body-medium text-body-medium font-semibold hover:bg-action-green-hover transition-colors shadow-sm flex items-center justify-center gap-1.5" onClick={(e) => { (window as any).triggerReservation?.('The Great Gatsby', 'F. Scott Fitzgerald', 'Bay B-04'); }}>
<span className="material-symbols-outlined text-base">bookmark_add</span>
<span className="">Reserve Book</span>
</button>
<button className="w-full py-2 rounded-xl bg-soft-blue/60 text-primary font-small text-small hover:bg-soft-blue transition-colors text-center font-medium">
                View Details &amp; Stacks
              </button>
</div>
</article>
{/* Book 3: SICP */}
<article className="group bg-surface-container-lowest/90 rounded-2xl p-space-md shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
<button aria-label="Favorite Book" className="absolute top-space-md right-space-md z-10 w-8 h-8 rounded-full bg-glass-surface backdrop-blur-md flex items-center justify-center text-status-danger shadow-sm" onClick={(e) => { (window as any).toggleFavorite?.(e.currentTarget); }}>
<span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: '\'FILL\' 1' }}>favorite</span>
</button>
<div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-surface-container shadow-inner mb-space-sm group-hover:scale-[1.02] transition-transform duration-300">
<img className="w-full h-full object-cover" data-alt="Structure and Interpretation of Computer Programs MIT press purple hardcover edition with wizard illustration on cover. Academic library catalog volume on sleek birch counter, dramatic rim lighting, soft reflections." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYEFPjIoKYjU4LssNPHvSe3Q0cAywNhWApd5Y-QKx-qzqL1nrfs4H2zNhFwUtp-MZymD7ROoDkQD27QsZ5KT8dR9G6Yo1Wk6PLDOateMBpO17WF06igua6OMa-XrnFTJ79mkrW0U0Sh-uhMUXmMvzN0E_cKz9nf5JNHMSpXOQ__4p97ptAxocitdsVEmwwXcD9Y4DYPsUr6iUvf51dNxc0t1wFvz4Z85f3ifBlv880XzMd-FxtaPPg" />
<span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-surface-container-lowest/95 backdrop-blur-sm font-caption text-caption text-primary font-mono font-semibold shadow-xs">
                Dewey: 005.133 ABE
              </span>
</div>
<div className="flex flex-col gap-1 flex-1">
<div className="flex items-center justify-between gap-1">
<span className="font-caption text-caption uppercase text-primary font-semibold tracking-wider">Tech &amp; Systems</span>
<div className="flex items-center gap-0.5 text-text-primary font-caption text-caption">
<span className="material-symbols-outlined text-status-pending text-sm" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-semibold">5.0</span>
<span className="text-text-secondary">(189)</span>
</div>
</div>
<h3 className="font-headline-4 text-headline-4 text-text-primary group-hover:text-primary transition-colors line-clamp-1 text-base font-semibold">
                SICP
              </h3>
<p className="font-small text-small text-text-secondary line-clamp-1">Abelson &amp; Sussman</p>
<div className="pt-2 flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-status-pending"></span>
<span className="font-caption text-caption text-status-pending font-bold">1 Copy Left (High Demand)</span>
</div>
</div>
<div className="pt-space-md flex flex-col gap-space-xs mt-auto">
<button className="w-full py-2.5 rounded-xl bg-action-green text-text-primary font-body-medium text-body-medium font-semibold hover:bg-action-green-hover transition-colors shadow-sm flex items-center justify-center gap-1.5" onClick={(e) => { (window as any).triggerReservation?.('SICP', 'Abelson &amp; Sussman', 'Bay A-03'); }}>
<span className="material-symbols-outlined text-base">bookmark_add</span>
<span className="">Claim Last Copy</span>
</button>
<button className="w-full py-2 rounded-xl bg-soft-blue/60 text-primary font-small text-small hover:bg-soft-blue transition-colors text-center font-medium">
                View Details &amp; Stacks
              </button>
</div>
</article>
{/* Book 4: Meditations */}
<article className="group bg-surface-container-lowest/90 rounded-2xl p-space-md shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
<button aria-label="Favorite Book" className="absolute top-space-md right-space-md z-10 w-8 h-8 rounded-full bg-glass-surface backdrop-blur-md flex items-center justify-center text-text-secondary hover:text-status-danger transition-colors shadow-sm" onClick={(e) => { (window as any).toggleFavorite?.(e.currentTarget); }}>
<span className="material-symbols-outlined text-lg">favorite_border</span>
</button>
<div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-surface-container shadow-inner mb-space-sm group-hover:scale-[1.02] transition-transform duration-300">
<img className="w-full h-full object-cover" data-alt="Scholarly minimalist edition of Meditations by Marcus Aurelius. Classical Roman marble bust embossed on textured slate blue cover with embossed typography. Ambient daylight from high arched library window." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBtH-lzRHw9PZIbkZaSAGUiCP011eAtuX6n_jNXpnPh1s79j_Dw8W6kntkaJ-wX8zOJlPcNt0--8HhNEDm0EIH3IZKsqr-mrvFV179Hgfc57xJR1RkNoM03w6HIlcX5VgI6j9wh7esqv3V8G8sPawj4lBgOcLyDdWXCupK1Y_uEUoj5l8gt335AXg7aFN1SbsT5jWkPISiMYleq9Z-ZvWsuZbgNJXUB3E5m-oyyLsVNUmqsmH_Wwkrv" />
<span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-surface-container-lowest/95 backdrop-blur-sm font-caption text-caption text-primary font-mono font-semibold shadow-xs">
                Dewey: 188 AUR
              </span>
</div>
<div className="flex flex-col gap-1 flex-1">
<div className="flex items-center justify-between gap-1">
<span className="font-caption text-caption uppercase text-primary font-semibold tracking-wider">Philosophy</span>
<div className="flex items-center gap-0.5 text-text-primary font-caption text-caption">
<span className="material-symbols-outlined text-status-pending text-sm" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-semibold">4.9</span>
<span className="text-text-secondary">(740)</span>
</div>
</div>
<h3 className="font-headline-4 text-headline-4 text-text-primary group-hover:text-primary transition-colors line-clamp-1 text-base font-semibold">
                Meditations
              </h3>
<p className="font-small text-small text-text-secondary line-clamp-1">Marcus Aurelius</p>
<div className="pt-2 flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-action-green"></span>
<span className="font-caption text-caption text-status-available font-semibold">6 Available in Bay B-19</span>
</div>
</div>
<div className="pt-space-md flex flex-col gap-space-xs mt-auto">
<button className="w-full py-2.5 rounded-xl bg-action-green text-text-primary font-body-medium text-body-medium font-semibold hover:bg-action-green-hover transition-colors shadow-sm flex items-center justify-center gap-1.5" onClick={(e) => { (window as any).triggerReservation?.('Meditations', 'Marcus Aurelius', 'Bay B-19'); }}>
<span className="material-symbols-outlined text-base">bookmark_add</span>
<span className="">Reserve Book</span>
</button>
<button className="w-full py-2 rounded-xl bg-soft-blue/60 text-primary font-small text-small hover:bg-soft-blue transition-colors text-center font-medium">
                View Details &amp; Stacks
              </button>
</div>
</article>
{/* Book 5: Introduction to Algorithms (CLRS) */}
<article className="group bg-surface-container-lowest/90 rounded-2xl p-space-md shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
<button aria-label="Favorite Book" className="absolute top-space-md right-space-md z-10 w-8 h-8 rounded-full bg-glass-surface backdrop-blur-md flex items-center justify-center text-text-secondary hover:text-status-danger transition-colors shadow-sm" onClick={(e) => { (window as any).toggleFavorite?.(e.currentTarget); }}>
<span className="material-symbols-outlined text-lg">favorite_border</span>
</button>
<div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-surface-container shadow-inner mb-space-sm group-hover:scale-[1.02] transition-transform duration-300">
<img className="w-full h-full object-cover" data-alt="Thick collegiate textbook Introduction to Algorithms fourth edition by Cormen, Leiserson, Rivest, Stein. Large academic volume with mobile wireframe nodes geometric diagram on deep teal background. Solid studio contrast." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpnFX0dRnD6cQgKNDbAFxww-3Kt4hMYm4qYGHWYc_6VUoCKmeRlZdSpDU-HvY8nfSUaE15UN5IxIMry5RwRkLp-lRH2YM8AQNvyRpkPLMc1FOjiAqKugfaRUEVumpWm3ruqib1Heyo3XjPbEQr2I2z7P_gMnWJ8He7k2D1UQ4PPnxIwVp-7WAOmLNfxzgikr8FvIsAudVsezw1mnotbYVW0evi9DPYmIHI9KXYTDT8EI39cGKUmYlq" />
<span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-surface-container-lowest/95 backdrop-blur-sm font-caption text-caption text-primary font-mono font-semibold shadow-xs">
                Dewey: 005.1 COR
              </span>
</div>
<div className="flex flex-col gap-1 flex-1">
<div className="flex items-center justify-between gap-1">
<span className="font-caption text-caption uppercase text-primary font-semibold tracking-wider">Engineering</span>
<div className="flex items-center gap-0.5 text-text-primary font-caption text-caption">
<span className="material-symbols-outlined text-status-pending text-sm" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-semibold">4.9</span>
<span className="text-text-secondary">(820)</span>
</div>
</div>
<h3 className="font-headline-4 text-headline-4 text-text-primary group-hover:text-primary transition-colors line-clamp-1 text-base font-semibold">
                Introduction to Algorithms
              </h3>
<p className="font-small text-small text-text-secondary line-clamp-1">Cormen, Leiserson, Rivest, Stein</p>
<div className="pt-2 flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-status-danger"></span>
<span className="font-caption text-caption text-status-danger font-semibold">0 Available · 3 on Waitlist</span>
</div>
</div>
<div className="pt-space-md flex flex-col gap-space-xs mt-auto">
<button className="w-full py-2.5 rounded-xl bg-surface-container-high text-text-primary font-body-medium text-body-medium font-semibold hover:bg-surface-variant transition-colors shadow-sm flex items-center justify-center gap-1.5" onClick={(e) => { (window as any).triggerReservation?.('Introduction to Algorithms', 'Cormen et al.', 'Reserved Stacks', true); }}>
<span className="material-symbols-outlined text-base">hourglass_top</span>
<span className="">Join Waitlist</span>
</button>
<button className="w-full py-2 rounded-xl bg-soft-blue/60 text-primary font-small text-small hover:bg-soft-blue transition-colors text-center font-medium">
                View Details &amp; Stacks
              </button>
</div>
</article>
{/* Book 6: The Design of Everyday Things */}
<article className="group bg-surface-container-lowest/90 rounded-2xl p-space-md shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
<button aria-label="Favorite Book" className="absolute top-space-md right-space-md z-10 w-8 h-8 rounded-full bg-glass-surface backdrop-blur-md flex items-center justify-center text-text-secondary hover:text-status-danger transition-colors shadow-sm" onClick={(e) => { (window as any).toggleFavorite?.(e.currentTarget); }}>
<span className="material-symbols-outlined text-lg">favorite_border</span>
</button>
<div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-surface-container shadow-inner mb-space-sm group-hover:scale-[1.02] transition-transform duration-300">
<img className="w-full h-full object-cover" data-alt="The Design of Everyday Things by Don Norman modern design book. Features minimalist teapot with spout on handle side, bold clean sans-serif typography, soft blue background with slight lime green shadow accent." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUGr5jzI--hDYinVQSG7L5x47sopByZAzqGLGIQ1k78AUCDL-K4hPjdO4Vi3IiHhntR3Hz5zIj3JVCoP44QTQvxRl-6jpH8MmT4cpzCr0SHLF6DY5-Za7s5FZt5gkYNuX9COea-we9Q5XoROLDgt1nPz10wFhSsWBkMHufGiRzzZqlI8SMlnDGquhw2a1utmsTwDC406J_kFH9PuWi7LgON0TnjwjEj6kteScQ_pUYeC9uTUlxAXUK" />
<span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-surface-container-lowest/95 backdrop-blur-sm font-caption text-caption text-primary font-mono font-semibold shadow-xs">
                Dewey: 745.2 NOR
              </span>
</div>
<div className="flex flex-col gap-1 flex-1">
<div className="flex items-center justify-between gap-1">
<span className="font-caption text-caption uppercase text-primary font-semibold tracking-wider">Design &amp; HCI</span>
<div className="flex items-center gap-0.5 text-text-primary font-caption text-caption">
<span className="material-symbols-outlined text-status-pending text-sm" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-semibold">4.8</span>
<span className="text-text-secondary">(429)</span>
</div>
</div>
<h3 className="font-headline-4 text-headline-4 text-text-primary group-hover:text-primary transition-colors line-clamp-1 text-base font-semibold">
                The Design of Everyday Things
              </h3>
<p className="font-small text-small text-text-secondary line-clamp-1">Don Norman</p>
<div className="pt-2 flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-action-green"></span>
<span className="font-caption text-caption text-status-available font-semibold">5 Available in Bay C-01</span>
</div>
</div>
<div className="pt-space-md flex flex-col gap-space-xs mt-auto">
<button className="w-full py-2.5 rounded-xl bg-action-green text-text-primary font-body-medium text-body-medium font-semibold hover:bg-action-green-hover transition-colors shadow-sm flex items-center justify-center gap-1.5" onClick={(e) => { (window as any).triggerReservation?.('The Design of Everyday Things', 'Don Norman', 'Bay C-01'); }}>
<span className="material-symbols-outlined text-base">bookmark_add</span>
<span className="">Reserve Book</span>
</button>
<button className="w-full py-2 rounded-xl bg-soft-blue/60 text-primary font-small text-small hover:bg-soft-blue transition-colors text-center font-medium">
                View Details &amp; Stacks
              </button>
</div>
</article>
{/* Book 7: Atomic Habits */}
<article className="group bg-surface-container-lowest/90 rounded-2xl p-space-md shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
<button aria-label="Favorite Book" className="absolute top-space-md right-space-md z-10 w-8 h-8 rounded-full bg-glass-surface backdrop-blur-md flex items-center justify-center text-text-secondary hover:text-status-danger transition-colors shadow-sm" onClick={(e) => { (window as any).toggleFavorite?.(e.currentTarget); }}>
<span className="material-symbols-outlined text-lg">favorite_border</span>
</button>
<div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-surface-container shadow-inner mb-space-sm group-hover:scale-[1.02] transition-transform duration-300">
<img className="w-full h-full object-cover" data-alt="Atomic Habits by James Clear clean hardcover display on glass desk. Crisp paper dust jacket with tiny gold dot matrix pattern forming letterforms. Bright library atmosphere, sharp focused depth of field." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3a02HUffEUe7b05GK73fta9q0px-e4L8wn_izuh2Ae9G5OqFRaVnj518DrxTC8FhlGJdXEkMBCpobOsk2L26ZATvDFfVC73yOYOrNob1hDuJxCghCh5eDmU3HHq-arGHzRLUk1WWjeXoDvxY-qg54BD35KJevjRpN6kqBtNO_I0wibZwpnZWjypF7CVkFGvSq7jzxUSt6Og6s95wRHFox0Shn6D-GhqC5NEgMtvMPMTa4h9GLAqjq" />
<span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-surface-container-lowest/95 backdrop-blur-sm font-caption text-caption text-primary font-mono font-semibold shadow-xs">
                Dewey: 158.1 CLE
              </span>
</div>
<div className="flex flex-col gap-1 flex-1">
<div className="flex items-center justify-between gap-1">
<span className="font-caption text-caption uppercase text-primary font-semibold tracking-wider">Behavioral Sci</span>
<div className="flex items-center gap-0.5 text-text-primary font-caption text-caption">
<span className="material-symbols-outlined text-status-pending text-sm" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-semibold">4.9</span>
<span className="text-text-secondary">(1,120)</span>
</div>
</div>
<h3 className="font-headline-4 text-headline-4 text-text-primary group-hover:text-primary transition-colors line-clamp-1 text-base font-semibold">
                Atomic Habits
              </h3>
<p className="font-small text-small text-text-secondary line-clamp-1">James Clear</p>
<div className="pt-2 flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-action-green"></span>
<span className="font-caption text-caption text-status-available font-semibold">8 Available in Bay D-07</span>
</div>
</div>
<div className="pt-space-md flex flex-col gap-space-xs mt-auto">
<button className="w-full py-2.5 rounded-xl bg-action-green text-text-primary font-body-medium text-body-medium font-semibold hover:bg-action-green-hover transition-colors shadow-sm flex items-center justify-center gap-1.5" onClick={(e) => { (window as any).triggerReservation?.('Atomic Habits', 'James Clear', 'Bay D-07'); }}>
<span className="material-symbols-outlined text-base">bookmark_add</span>
<span className="">Reserve Book</span>
</button>
<button className="w-full py-2 rounded-xl bg-soft-blue/60 text-primary font-small text-small hover:bg-soft-blue transition-colors text-center font-medium">
                View Details &amp; Stacks
              </button>
</div>
</article>
{/* Book 8: A Brief History of Time */}
<article className="group bg-surface-container-lowest/90 rounded-2xl p-space-md shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
<button aria-label="Favorite Book" className="absolute top-space-md right-space-md z-10 w-8 h-8 rounded-full bg-glass-surface backdrop-blur-md flex items-center justify-center text-text-secondary hover:text-status-danger transition-colors shadow-sm" onClick={(e) => { (window as any).toggleFavorite?.(e.currentTarget); }}>
<span className="material-symbols-outlined text-lg">favorite_border</span>
</button>
<div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-surface-container shadow-inner mb-space-sm group-hover:scale-[1.02] transition-transform duration-300">
<img className="w-full h-full object-cover" data-alt="A Brief History of Time by Stephen Hawking folio edition with celestial stellar nebula rendering on deep twilight blue binding. Crisp foil stamping, modern aesthetic, ambient academic bookshelf backdrop." src="https://lh3.googleusercontent.com/aida-public/AB6AXuByeKopV4b7gmO69zqgOcgSpRLGQEIJrCtQX0To7M-rURmj0D4HCEcY84ZmMCUALCrgiELQd7Kvr_4EXk-5gsHA0z8opOJmiUESnoLhEVse4CKf8T6ULiFZQHPLZv_z9L2TX4ERcsL1Np6ZBDHiRfGit0b9f_LeMidnXaHG5iMnByKwcKTGkQKQ4tFsLJyBbqpaqx3ReTexFeUk9q8WoXnruOczg4_W58duk8vlj7Gy95tMaWJoIQhI" />
<span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-surface-container-lowest/95 backdrop-blur-sm font-caption text-caption text-primary font-mono font-semibold shadow-xs">
                Dewey: 523.1 HAW
              </span>
</div>
<div className="flex flex-col gap-1 flex-1">
<div className="flex items-center justify-between gap-1">
<span className="font-caption text-caption uppercase text-primary font-semibold tracking-wider">Physics &amp; Space</span>
<div className="flex items-center gap-0.5 text-text-primary font-caption text-caption">
<span className="material-symbols-outlined text-status-pending text-sm" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-semibold">4.8</span>
<span className="text-text-secondary">(694)</span>
</div>
</div>
<h3 className="font-headline-4 text-headline-4 text-text-primary group-hover:text-primary transition-colors line-clamp-1 text-base font-semibold">
                A Brief History of Time
              </h3>
<p className="font-small text-small text-text-secondary line-clamp-1">Stephen Hawking</p>
<div className="pt-2 flex items-center gap-1.5">
<span className="w-2 h-2 rounded-full bg-action-green"></span>
<span className="font-caption text-caption text-status-available font-semibold">3 Available in Bay A-08</span>
</div>
</div>
<div className="pt-space-md flex flex-col gap-space-xs mt-auto">
<button className="w-full py-2.5 rounded-xl bg-action-green text-text-primary font-body-medium text-body-medium font-semibold hover:bg-action-green-hover transition-colors shadow-sm flex items-center justify-center gap-1.5" onClick={(e) => { (window as any).triggerReservation?.('A Brief History of Time', 'Stephen Hawking', 'Bay A-08'); }}>
<span className="material-symbols-outlined text-base">bookmark_add</span>
<span className="">Reserve Book</span>
</button>
<button className="w-full py-2 rounded-xl bg-soft-blue/60 text-primary font-small text-small hover:bg-soft-blue transition-colors text-center font-medium">
                View Details &amp; Stacks
              </button>
</div>
</article>
</div>
{/* Section 4.2: High-Contrast Pagination Deck */}
<div className="w-full bg-glass-surface backdrop-blur-xl rounded-2xl p-space-md shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md mt-space-md">
<div className="font-small text-small text-text-secondary flex items-center gap-1">
<span className="">Showing records</span>
<span className="font-semibold text-text-primary font-mono">1 – 8</span>
<span className="">of</span>
<span className="font-semibold text-text-primary font-mono">1,248</span>
<span className="">volumes cataloged</span>
</div>
{/* Page Buttons Group */}
<nav aria-label="Pagination" className="flex items-center gap-1.5">
<button aria-label="Previous Page" className="w-9 h-9 rounded-xl bg-surface-container-lowest/80 text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors shadow-xs">
<span className="material-symbols-outlined text-base">chevron_left</span>
</button>
<button className="w-9 h-9 rounded-xl bg-primary text-on-primary font-body-medium text-body-medium font-bold shadow-sm flex items-center justify-center">
              1
            </button>
<button className="w-9 h-9 rounded-xl bg-surface-container-lowest/80 text-text-primary hover:bg-surface-container-lowest font-body-medium text-body-medium flex items-center justify-center transition-colors">
              2
            </button>
<button className="w-9 h-9 rounded-xl bg-surface-container-lowest/80 text-text-primary hover:bg-surface-container-lowest font-body-medium text-body-medium flex items-center justify-center transition-colors">
              3
            </button>
<span className="px-1 text-text-secondary font-mono">...</span>
<button className="w-9 h-9 rounded-xl bg-surface-container-lowest/80 text-text-primary hover:bg-surface-container-lowest font-body-medium text-body-medium flex items-center justify-center transition-colors">
              156
            </button>
<button aria-label="Next Page" className="w-9 h-9 rounded-xl bg-surface-container-lowest/80 text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors shadow-xs">
<span className="material-symbols-outlined text-base">chevron_right</span>
</button>
</nav>
</div>
</section>
</div>
</div>
{/* Interactive Reservation Confirmation Toast (Hidden by default, triggered via JS) */}
<div className="fixed bottom-6 right-6 z-50 transform translate-y-24 opacity-0 transition-all duration-300 pointer-events-none" id="reservation-toast">
<div className="bg-primary text-on-primary p-space-md rounded-2xl shadow-xl flex items-center gap-space-md max-w-md border-l-4 border-action-green">
<div className="w-10 h-10 rounded-full bg-action-green text-text-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-xl">bookmark_added</span>
</div>
<div className="flex flex-col">
<span className="font-body-medium text-body-medium font-bold" id="toast-title">Hold Requested</span>
<span className="font-small text-small text-secondary-container" id="toast-body">Added to your circulation desk queue.</span>
</div>
<button className="p-1 rounded-full hover:bg-white/10 text-on-primary transition-colors ml-auto pointer-events-auto" onClick={(e) => { (window as any).dismissToast?.(); }}>
<span className="material-symbols-outlined text-sm">close</span>
</button>
</div>
</div>
</div>

    </div>
  );
};

export default CatalogPage;
