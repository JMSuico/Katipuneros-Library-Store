// [Layer: UserRoles/Features/Pages/CustomersPanel/Pages]
// CustomerDashboard.tsx -- Customer Portal Home and Active Borrowings
// Converted directly from NavHomePage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const CustomerDashboard: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
// Micro-interactions: Discipline Filter Pills Toggling
    const filterPills = document.querySelectorAll('.filter-chip');
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => {
          p.classList.remove('bg-primary', 'text-on-primary');
          p.classList.add('bg-surface-container-lowest', 'text-text-secondary');
        });
        pill.classList.remove('bg-surface-container-lowest', 'text-text-secondary');
        pill.classList.add('bg-primary', 'text-on-primary');
      });
    });

    // Micro-interactions: Instant Search Enter Key Feedback
    const searchInput = document.getElementById('catalog-instant-search');
    if (searchInput) {
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim().length > 0) {
          const term = searchInput.value.trim();
          const targetNav = document.querySelector('a[data-path="customer-catalog"]');
          if (targetNav) {
            targetNav.click();
          }
        }
      });
    }

    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
{/* Top Ambient Atmosphere Layer */}
<div className="relative w-full overflow-hidden pb-space-2xl">
<div className="absolute -top-32 -left-20 w-96 h-96 bg-primary-fixed/40 rounded-full blur-3xl pointer-events-none -z-10"></div>
<div className="absolute top-12 right-0 w-[480px] h-[480px] bg-action-green/15 rounded-full blur-3xl pointer-events-none -z-10"></div>
{/* 1. Patron Greeting & Hero Search & Live Metric Banner */}
<div className="w-full pt-space-lg">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
{/* Left: Editorial Typography & Search */}
<div className="lg:col-span-8 flex flex-col gap-space-md">
<div className="flex items-center gap-space-xs text-secondary font-caption text-caption uppercase tracking-wider">
<span className="inline-block w-2 h-2 rounded-full bg-action-green animate-pulse"></span>
<span className="">Katipuneros Stacks • Circulation Terminal 04</span>
</div>
<div className="flex flex-col gap-space-xs">
<h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
              Good morning, <span className="text-primary underline decoration-action-green decoration-4 underline-offset-8">Jhon</span>
</h1>
<p className="font-body-large text-body-large text-text-secondary max-w-2xl">
              Find something interesting to read across our academic stacks today. 42,000+ volumes, monographs, and peer-reviewed reserves ready at hand.
            </p>
</div>
{/* Hero Search Input Container */}
<div className="w-full mt-space-sm">
<div className="relative flex items-center bg-surface-container-lowest/90 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgba(0,101,138,0.08)] p-2 pr-3 focus-within:ring-2 focus-within:ring-primary transition-all">
<span className="material-symbols-outlined text-text-secondary ml-space-md mr-space-sm text-2xl">search</span>
<input className="w-full bg-transparent font-body text-body text-text-primary placeholder:text-text-secondary focus:outline-none" id="catalog-instant-search" placeholder="Search by title, author, Dewey decimal, or ISBN..." type="text" />
<button className="flex items-center gap-1.5 px-space-lg py-2.5 bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium rounded-full shadow-sm transition-transform active:scale-95 shrink-0" type="button">
<span className="">Explore Stacks</span>
<span className="material-symbols-outlined text-lg">arrow_forward</span>
</button>
</div>
{/* Instant Filter Pills */}
<div className="flex items-center gap-2 mt-space-md overflow-x-auto pb-2 scrollbar-none" id="filter-pills-container">
<button className="filter-chip px-space-md py-1.5 rounded-full font-small text-small bg-primary text-on-primary shadow-sm whitespace-nowrap transition-all" type="button">All Disciplines</button>
<button className="filter-chip px-space-md py-1.5 rounded-full font-small text-small bg-surface-container-lowest text-text-secondary hover:text-text-primary hover:bg-surface-container shadow-sm whitespace-nowrap transition-all" type="button">Technology</button>
<button className="filter-chip px-space-md py-1.5 rounded-full font-small text-small bg-surface-container-lowest text-text-secondary hover:text-text-primary hover:bg-surface-container shadow-sm whitespace-nowrap transition-all" type="button">Science</button>
<button className="filter-chip px-space-md py-1.5 rounded-full font-small text-small bg-surface-container-lowest text-text-secondary hover:text-text-primary hover:bg-surface-container shadow-sm whitespace-nowrap transition-all" type="button">Literature</button>
<button className="filter-chip px-space-md py-1.5 rounded-full font-small text-small bg-surface-container-lowest text-text-secondary hover:text-text-primary hover:bg-surface-container shadow-sm whitespace-nowrap transition-all" type="button">History</button>
<button className="filter-chip px-space-md py-1.5 rounded-full font-small text-small bg-surface-container-lowest text-text-secondary hover:text-text-primary hover:bg-surface-container shadow-sm whitespace-nowrap transition-all" type="button">Business</button>
<button className="filter-chip px-space-md py-1.5 rounded-full font-small text-small bg-surface-container-lowest text-text-secondary hover:text-text-primary hover:bg-surface-container shadow-sm whitespace-nowrap transition-all" type="button">Education</button>
<button className="filter-chip px-space-md py-1.5 rounded-full font-small text-small bg-surface-container-lowest text-text-secondary hover:text-text-primary hover:bg-surface-container shadow-sm whitespace-nowrap transition-all" type="button">Engineering</button>
</div>
</div>
</div>
{/* Right: 3D Floating Quick-Metrics Hologram Card */}
<div className="lg:col-span-4 relative flex justify-center lg:justify-end">
<div className="w-full max-w-sm bg-gradient-to-br from-surface-container-lowest/90 via-surface-container/70 to-soft-blue/50 backdrop-blur-xl rounded-3xl p-space-lg shadow-[0_16px_40px_rgba(24,50,61,0.08)] flex flex-col gap-space-md">
<div className="flex items-center justify-between pb-space-sm">
<div className="flex items-center gap-space-xs">
<div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
<span className="material-symbols-outlined text-base">badge</span>
</div>
<div>
<p className="font-caption text-caption text-text-secondary uppercase">Card Status • 2024</p>
<p className="font-headline-4 text-headline-4 text-text-primary">Graduate Scholar</p>
</div>
</div>
<span className="px-2.5 py-0.5 rounded-full font-caption text-caption bg-action-green/30 text-text-primary font-semibold">Active</span>
</div>
{/* Live Metrics Strip */}
<div className="grid grid-cols-3 gap-2 text-center bg-surface-container-lowest/60 rounded-2xl p-space-sm">
<div className="flex flex-col items-center">
<span className="font-headline-3 text-headline-3 text-primary">2</span>
<span className="font-caption text-caption text-text-secondary">Holds Active</span>
</div>
<div className="flex flex-col items-center">
<span className="font-headline-3 text-headline-3 text-text-primary">2</span>
<span className="font-caption text-caption text-text-secondary">Loans in Hand</span>
</div>
<div className="flex flex-col items-center">
<span className="font-headline-3 text-headline-3 text-status-pending">3d</span>
<span className="font-caption text-caption text-text-secondary">Next Due</span>
</div>
</div>
{/* Quick circulation insight note */}
<div className="flex items-center gap-space-sm bg-soft-blue/40 rounded-xl p-space-xs px-space-sm">
<span className="material-symbols-outlined text-primary text-xl">auto_stories</span>
<p className="font-small text-small text-text-primary leading-tight">
<strong>1 hold ready!</strong> Pick up at Circulation Desk Bay 2 before 5:00 PM.
              </p>
</div>
</div>
</div>
</div>
</div>
{/* 2. Personalized Featured Spotlight */}
<div className="w-full mt-space-2xl">
<div className="flex items-center justify-between mb-space-md">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary">award_star</span>
<h2 className="font-headline-3 text-headline-3 text-text-primary">Curator's Spotlight Selection</h2>
</div>
<span className="font-caption text-caption text-text-secondary">Selected based on your computer science &amp; software engineering coursework</span>
</div>
<div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-text-primary via-primary to-tertiary text-on-primary shadow-2xl p-space-lg lg:p-space-xl">
{/* Subtle back glow */}
<div className="absolute -right-20 -bottom-20 w-80 h-80 bg-action-green/20 rounded-full blur-3xl pointer-events-none"></div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center relative z-10">
{/* 3D Hardcover Book Rendering Presentation */}
<div className="lg:col-span-4 flex justify-center items-center py-space-sm">
<div className="group relative perspective-1000">
{/* Book Cover with 3D Depth & Shadow */}
<div className="relative w-56 h-80 rounded-r-2xl rounded-l-md shadow-[20px_20px_40px_rgba(0,0,0,0.5)] transform -rotate-y-12 group-hover:rotate-y-0 transition-transform duration-500 overflow-hidden bg-surface-container-highest">
<img className="w-full h-full object-cover" data-alt="Editorial book cover of Clean Code: A Handbook of Agile Software Craftsmanship by Robert C. Martin. Minimalist dark turquoise academic sleeve, high contrast typography, elegant lime green spine bookmark ribbon, soft studio spotlight, pristine condition." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXr4DzJccwNb8rLqp3Hxym8oUOlXy4ExXF6-AnsjpqBAXUhQq730_ZOe3JZxx-PyiWo-PWMtHEu6U6zXT9r1_nM5WjuTuurdx24vCcadYyRFNKfKFGm1u6qLTAqjCZb01jHRJidBJNHNI9fDLkUrL8gqk5GZjTSiaQ3lB7yZYcibPc90t2zuypBn7ku9Jg2laIiAPYWfbJNQbEA7oJ5Nh43zeOwwstXK8GtMmZ2C-9h9lDXOwVW-bB" />
{/* Physical bookmark ribbon drop */}
<div className="absolute top-0 right-8 w-4 h-24 bg-action-green shadow-md rounded-b-sm flex flex-col justify-end items-center pb-1">
<div className="w-2 h-2 bg-text-primary rounded-full opacity-60"></div>
</div>
{/* Spine shadow illusion */}
<div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/40 via-white/10 to-transparent"></div>
</div>
</div>
</div>
{/* Book Metadata & Actions */}
<div className="lg:col-span-8 flex flex-col gap-space-md">
<div className="flex flex-wrap items-center gap-2">
<span className="px-3 py-1 bg-action-green text-text-primary rounded-full font-caption text-caption font-semibold tracking-wide uppercase">
                Academic Essential
              </span>
<span className="px-3 py-1 bg-surface-container-lowest/20 backdrop-blur-md text-on-primary rounded-full font-caption text-caption">
                Dewey: 005.1 M382c
              </span>
<span className="px-3 py-1 bg-status-available text-surface-container-lowest rounded-full font-caption text-caption font-semibold flex items-center gap-1">
<span className="w-1.5 h-1.5 rounded-full bg-white"></span> 4 Copies Available
              </span>
</div>
<div className="flex flex-col gap-space-xs">
<h3 className="font-headline-1 text-headline-1 text-on-primary font-bold tracking-tight">
                Clean Code: A Handbook of Agile Software Craftsmanship
              </h3>
<p className="font-body-large text-body-large text-secondary-container">
                by Robert C. Martin ("Uncle Bob") • Prentice Hall International Series
              </p>
</div>
<p className="font-body text-body text-surface-variant max-w-2xl leading-relaxed">
              Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Master the principles, patterns, and practices of writing clean software code with real-world case studies in refactoring.
            </p>
<div className="flex flex-wrap items-center gap-space-lg text-secondary-fixed">
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-action-green text-xl" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-body-medium text-body-medium font-bold text-on-primary">4.9</span>
<span className="font-caption text-caption text-surface-variant">(348 faculty citations)</span>
</div>
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-secondary-container text-xl">location_on</span>
<span className="font-body-medium text-body-medium">Stack Bay 14 (Shelf 3B)</span>
</div>
<div className="flex items-center gap-1.5">
<span className="material-symbols-outlined text-secondary-container text-xl">schedule</span>
<span className="font-body-medium text-body-medium">14-Day Lending Period</span>
</div>
</div>
{/* Action Buttons */}
<div className="flex flex-wrap items-center gap-space-md pt-space-xs">
<button className="px-space-xl py-3 rounded-full bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2" type="button">
<span className="material-symbols-outlined text-xl">book</span>
<span className="">Reserve Book Now</span>
</button>
<button className="px-space-lg py-3 rounded-full bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 backdrop-blur-md text-on-primary font-body-medium text-body-medium transition-colors flex items-center gap-2" type="button">
<span className="material-symbols-outlined text-xl">info</span>
<span className="">Inspect Stacks Details</span>
</button>
<button className="p-3 rounded-full bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 backdrop-blur-md text-on-primary transition-colors" title="Bookmark for later" type="button">
<span className="material-symbols-outlined text-xl">favorite_border</span>
</button>
</div>
</div>
</div>
</div>
</div>
{/* 3. Quick Patron Summary Cards (Clickable shortcuts) */}
<div className="w-full mt-space-xl">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
{/* Holds Card */}
<a className="group bg-surface-container-lowest hover:bg-soft-blue/40 rounded-2xl p-space-md shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-40" data-path="customer-reservations" href="#">
<div className="flex items-start justify-between">
<div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-2xl">bookmark_added</span>
</div>
<span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">north_east</span>
</div>
<div>
<div className="flex items-center gap-2">
<span className="font-headline-3 text-headline-3 text-text-primary">2</span>
<span className="font-body-medium text-body-medium text-text-secondary">Active Holds</span>
</div>
<div className="flex items-center gap-1.5 mt-1 text-primary">
<span className="w-2 h-2 rounded-full bg-action-green"></span>
<span className="font-caption text-caption font-semibold">1 Ready at Front Desk</span>
</div>
</div>
</a>
{/* Loans Card */}
<a className="group bg-surface-container-lowest hover:bg-soft-blue/40 rounded-2xl p-space-md shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-40" data-path="customer-borrowings" href="#">
<div className="flex items-start justify-between">
<div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-2xl">local_library</span>
</div>
<span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">north_east</span>
</div>
<div>
<div className="flex items-center gap-2">
<span className="font-headline-3 text-headline-3 text-text-primary">2</span>
<span className="font-body-medium text-body-medium text-text-secondary">Active Loans</span>
</div>
<div className="flex items-center gap-1.5 mt-1 text-status-pending">
<span className="material-symbols-outlined text-sm">schedule</span>
<span className="font-caption text-caption font-semibold">1 Due in 3 days</span>
</div>
</div>
</a>
{/* Favorites Card */}
<a className="group bg-surface-container-lowest hover:bg-soft-blue/40 rounded-2xl p-space-md shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-40" data-path="customer-favorites" href="#">
<div className="flex items-start justify-between">
<div className="w-10 h-10 rounded-xl bg-error-container/40 flex items-center justify-center text-status-danger group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: '\'FILL\' 1' }}>favorite</span>
</div>
<span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">north_east</span>
</div>
<div>
<div className="flex items-center gap-2">
<span className="font-headline-3 text-headline-3 text-text-primary">8</span>
<span className="font-body-medium text-body-medium text-text-secondary">Saved Stacks</span>
</div>
<p className="font-caption text-caption text-text-secondary mt-1 truncate">
              Clean Architecture, Sapiens +6 more
            </p>
</div>
</a>
{/* Recommendations Shortcut */}
<a className="group bg-surface-container-lowest hover:bg-soft-blue/40 rounded-2xl p-space-md shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-40" href="#recommendations-section">
<div className="flex items-start justify-between">
<div className="w-10 h-10 rounded-xl bg-action-green/30 flex items-center justify-center text-text-primary group-hover:scale-105 transition-transform">
<span className="material-symbols-outlined text-2xl">magic_button</span>
</div>
<span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">south</span>
</div>
<div>
<div className="flex items-center gap-2">
<span className="font-headline-3 text-headline-3 text-text-primary">12</span>
<span className="font-body-medium text-body-medium text-text-secondary">Curated For You</span>
</div>
<p className="font-caption text-caption text-primary mt-1 font-semibold">
              Updated this morning
            </p>
</div>
</a>
</div>
</div>
{/* 4. Recommended For You (Interactive horizontal book cards) */}
<div className="w-full mt-space-2xl" id="recommendations-section">
<div className="flex flex-col sm:flex-row sm:items-end justify-between mb-space-lg gap-2">
<div>
<span className="font-caption text-caption uppercase text-text-secondary tracking-wider font-semibold">Tailored Stacks</span>
<h2 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">Recommended For You</h2>
</div>
<div className="flex items-center gap-space-xs">
<button className="p-2 rounded-full bg-surface-container-lowest hover:bg-surface-container shadow-sm text-text-primary transition-colors" title="Previous books" type="button">
<span className="material-symbols-outlined">chevron_left</span>
</button>
<button className="p-2 rounded-full bg-surface-container-lowest hover:bg-surface-container shadow-sm text-text-primary transition-colors" title="Next books" type="button">
<span className="material-symbols-outlined">chevron_right</span>
</button>
</div>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
{/* Book 1: Clean Architecture */}
<div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
<div className="flex flex-col gap-space-sm">
{/* 3D Perspective Book Display */}
<div className="relative w-full h-56 bg-surface-container-low rounded-xl overflow-hidden flex items-center justify-center p-3">
<span className="absolute top-3 left-3 px-2 py-0.5 rounded-full font-caption text-caption bg-status-available text-surface-container-lowest font-medium shadow-sm">
                Available • 3 in stock
              </span>
<button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/80 hover:bg-surface-container-lowest flex items-center justify-center text-text-secondary hover:text-status-danger transition-colors shadow-sm" type="button">
<span className="material-symbols-outlined text-lg">favorite_border</span>
</button>
<div className="w-32 h-44 rounded shadow-[8px_8px_20px_rgba(0,0,0,0.15)] transform -rotate-2 group-hover:rotate-0 transition-transform duration-300 overflow-hidden">
<img className="w-full h-full object-cover" data-alt="Editorial book cover of Clean Architecture: A Craftsman's Guide to Software Structure and Design by Robert C. Martin. Modern technical book layout with crisp typography, soft cerulean blue spine, high detail academic styling on crisp backdrop." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwCNXJH5oFw4AXEr64Y08fHYDUPzfLM-DqJO10JpX89rstCqkXC4efxOqZwVazOChABN_bGVCHberE6_l_Q74qAjLC4EDVak0j5h9gLD73mTkWg59o4zPiZuNruJCJ6v7kJbaKlrBlK-N6JNbpaG6FDr-B7mLoDWgBxRNP6lMEwhVBTB0cAeC0xzbEllku_l5dMYnYrSqKJS1cORtyUIH79zX-PXLWWDmlvdHVckL2U6kgwJlBlIIw" />
</div>
</div>
{/* Book Meta */}
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between text-text-secondary font-caption text-caption">
<span className="">Technology • 005.1 M382a</span>
<span className="flex items-center text-primary font-semibold">
<span className="material-symbols-outlined text-sm text-action-green mr-0.5" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span> 4.8
                </span>
</div>
<h4 className="font-headline-4 text-headline-4 text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                Clean Architecture
              </h4>
<p className="font-small text-small text-text-secondary">Robert C. Martin</p>
</div>
</div>
<div className="pt-space-md flex items-center justify-between gap-2">
<span className="font-caption text-caption text-text-secondary">Stack Bay 14</span>
<button className="px-space-md py-2 rounded-full bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-semibold shadow-sm transition-transform active:scale-95" type="button">
              Reserve
            </button>
</div>
</div>
{/* Book 2: The Great Gatsby */}
<div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
<div className="flex flex-col gap-space-sm">
<div className="relative w-full h-56 bg-surface-container-low rounded-xl overflow-hidden flex items-center justify-center p-3">
<span className="absolute top-3 left-3 px-2 py-0.5 rounded-full font-caption text-caption bg-status-pending text-text-primary font-medium shadow-sm">
                1 Copy Left
              </span>
<button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/80 hover:bg-surface-container-lowest flex items-center justify-center text-text-secondary hover:text-status-danger transition-colors shadow-sm" type="button">
<span className="material-symbols-outlined text-lg">favorite_border</span>
</button>
<div className="w-32 h-44 rounded shadow-[8px_8px_20px_rgba(0,0,0,0.15)] transform rotate-2 group-hover:rotate-0 transition-transform duration-300 overflow-hidden">
<img className="w-full h-full object-cover" data-alt="Vintage hardcover book cover of The Great Gatsby by F. Scott Fitzgerald. Elegant dark navy art-deco design with celestial eyes and subtle gold accents, pristine condition academic library edition." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlA9cw1EGf9R6J2IeGaSYtyR6_Pam636LeifTi8UJndg5W2JZ2yxQkuoQYsusR4fgTFucSuXbNl8JgCFKkyynyfZcrzIEIdKRdN-JTj_0hIUntl5pY7L7h3r_9vJ5_klSeUFiAc0T1KjvVeJYErz5AsG2NEYKJtfvTVKplQJqZAaC5cKqGdpD_RxzjLEJPsEGeZnOw3D71ucAp63PtPufuu6hGDxcvzHR1FsARmaS29UJhdffC-AG0" />
</div>
</div>
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between text-text-secondary font-caption text-caption">
<span className="">Literature • 813.52 F553g</span>
<span className="flex items-center text-primary font-semibold">
<span className="material-symbols-outlined text-sm text-action-green mr-0.5" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span> 4.7
                </span>
</div>
<h4 className="font-headline-4 text-headline-4 text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                The Great Gatsby
              </h4>
<p className="font-small text-small text-text-secondary">F. Scott Fitzgerald</p>
</div>
</div>
<div className="pt-space-md flex items-center justify-between gap-2">
<span className="font-caption text-caption text-text-secondary">Stack Bay 03</span>
<button className="px-space-md py-2 rounded-full bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-semibold shadow-sm transition-transform active:scale-95" type="button">
              Reserve
            </button>
</div>
</div>
{/* Book 3: Meditations */}
<div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
<div className="flex flex-col gap-space-sm">
<div className="relative w-full h-56 bg-surface-container-low rounded-xl overflow-hidden flex items-center justify-center p-3">
<span className="absolute top-3 left-3 px-2 py-0.5 rounded-full font-caption text-caption bg-status-available text-surface-container-lowest font-medium shadow-sm">
                Available • 5 in stock
              </span>
<button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/80 hover:bg-surface-container-lowest flex items-center justify-center text-text-secondary hover:text-status-danger transition-colors shadow-sm" type="button">
<span className="material-symbols-outlined text-lg">favorite_border</span>
</button>
<div className="w-32 h-44 rounded shadow-[8px_8px_20px_rgba(0,0,0,0.15)] transform -rotate-2 group-hover:rotate-0 transition-transform duration-300 overflow-hidden">
<img className="w-full h-full object-cover" data-alt="Classic book cover of Meditations by Marcus Aurelius. Minimalist classical bust sculpture motif, stone texture, subtle teal and marble accents, academic publishing format." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyHd9oFmTbnyQcMnGovJhgc_4hBvIWd8_rPDN75T6IX73Mf2KoIG6iC5dLiU-rz4vjn0tT-xYk7sZq6sPrHTdMmpjk8OEiLyOFUP9CsVHt_eL5B6aAmFKXc86Kg1q7gIjf3jwou0L-P6J75eb0gaOpI2PKWRkqjAbYJWxTVZ0oPHFCAbzt5uWSq0ehJRX5L287s1NFF5WC3deXeA3oTnrSaT0zqAhWIWpxp46qRkjXJuM7mDIkr-Xu" />
</div>
</div>
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between text-text-secondary font-caption text-caption">
<span className="">Philosophy • 188 A927m</span>
<span className="flex items-center text-primary font-semibold">
<span className="material-symbols-outlined text-sm text-action-green mr-0.5" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span> 4.9
                </span>
</div>
<h4 className="font-headline-4 text-headline-4 text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                Meditations
              </h4>
<p className="font-small text-small text-text-secondary">Marcus Aurelius</p>
</div>
</div>
<div className="pt-space-md flex items-center justify-between gap-2">
<span className="font-caption text-caption text-text-secondary">Stack Bay 08</span>
<button className="px-space-md py-2 rounded-full bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-semibold shadow-sm transition-transform active:scale-95" type="button">
              Reserve
            </button>
</div>
</div>
{/* Book 4: Intro to Algorithms (CLRS) */}
<div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group">
<div className="flex flex-col gap-space-sm">
<div className="relative w-full h-56 bg-surface-container-low rounded-xl overflow-hidden flex items-center justify-center p-3">
<span className="absolute top-3 left-3 px-2 py-0.5 rounded-full font-caption text-caption bg-status-danger text-surface-container-lowest font-medium shadow-sm">
                Checked Out • 0 Available
              </span>
<button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/80 hover:bg-surface-container-lowest flex items-center justify-center text-text-secondary hover:text-status-danger transition-colors shadow-sm" type="button">
<span className="material-symbols-outlined text-lg">favorite_border</span>
</button>
<div className="w-32 h-44 rounded shadow-[8px_8px_20px_rgba(0,0,0,0.15)] transform rotate-2 group-hover:rotate-0 transition-transform duration-300 overflow-hidden">
<img className="w-full h-full object-cover" data-alt="Editorial book cover of Introduction to Algorithms Fourth Edition by Cormen, Leiserson, Rivest, and Stein. MIT Press signature minimalist style, modern geometric node-link data structures illustration on crisp white sleeve." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVsZk44FHl7Mq2Hdpp_KbOeI6J2VMt7IQLq4HliuHKLAUbfvTt26nOoL0Wtyx5r_reX390EzwQoYFI2bvfpii-lIymxJRh-zl_Go6B5dndE-m54taWyKN7s8BB3RaAuEZp7AxTMtwdZYPLure6wVWsPTdCcdlQiwUTtU14MRysJoB7tY19fAUp2RSU3IQjj7Ey9nxd7MjbNOwI51_mtWNv8v_Ukoxt_dQn-luK5j9bWu-bbib8QYCu" />
</div>
</div>
<div className="flex flex-col gap-1">
<div className="flex items-center justify-between text-text-secondary font-caption text-caption">
<span className="">Engineering • 005.1 C811i</span>
<span className="flex items-center text-primary font-semibold">
<span className="material-symbols-outlined text-sm text-action-green mr-0.5" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span> 4.9
                </span>
</div>
<h4 className="font-headline-4 text-headline-4 text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                Intro to Algorithms (CLRS)
              </h4>
<p className="font-small text-small text-text-secondary">Cormen, Leiserson, Rivest, Stein</p>
</div>
</div>
<div className="pt-space-md flex items-center justify-between gap-2">
<span className="font-caption text-caption text-text-secondary">Waitlist: 2 users</span>
<button className="px-space-md py-2 rounded-full bg-soft-blue hover:bg-secondary-container text-primary font-small text-small font-semibold shadow-sm transition-colors" type="button">
              Join Waitlist
            </button>
</div>
</div>
</div>
</div>
{/* 5. Popular This Week Carousel / High-Circulation Track */}
<div className="w-full mt-space-3xl">
<div className="flex items-center justify-between mb-space-md">
<div>
<span className="font-caption text-caption uppercase text-text-secondary tracking-wider font-semibold">Circulation Radar</span>
<h3 className="font-headline-3 text-headline-3 text-text-primary">Popular Across Campus This Week</h3>
</div>
<a className="flex items-center gap-1 text-primary hover:text-primary-container font-small text-small font-medium transition-colors" data-path="customer-catalog" href="#">
<span className="">View All 140+ Trends</span>
<span className="material-symbols-outlined text-sm">arrow_forward</span>
</a>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
{/* Popular 1: Atomic Habits */}
<div className="flex items-center gap-space-md p-space-md bg-surface-container-lowest/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all">
<div className="w-20 h-28 rounded-lg overflow-hidden shrink-0 shadow-md">
<img className="w-full h-full object-cover" data-alt="Editorial book cover of Atomic Habits by James Clear. Clean minimalist design with tiny yellow and white particles coalescing into bold dark lettering, crisp academic lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXgoqGw42Ve7fTJGwGmQ_lRFQovriA8SMzRtqvhfLBBsXlnbwbM0LWL60fWQDEYGW_qeYuUNbXIp2fFZJkf5i_FA-_JrRv8-lTaxG2ZRdOn1woCwcgdgzEsi1Icg8PSfEDKo03h5KSMuRK8pllodSUSbRuoz_ldvJtxbh9-YrjUkWR_kdH114EotvByOf45a1ahG9QUAT9KcMT2cCl14Z41P0y7F-505P4mrOzT45IG7ydRlOweneG" />
</div>
<div className="flex flex-col justify-between flex-1 min-w-0">
<div>
<span className="font-caption text-caption text-text-secondary">Dewey 158.1 • Bay 05</span>
<h5 className="font-body-medium text-body-medium text-text-primary font-bold truncate">Atomic Habits</h5>
<p className="font-small text-small text-text-secondary truncate">James Clear</p>
</div>
<div className="mt-2 flex items-center justify-between">
<span className="font-caption text-caption text-status-available font-semibold">Available</span>
<button className="p-1.5 rounded-full bg-soft-blue text-primary hover:bg-action-green hover:text-text-primary transition-colors" type="button">
<span className="material-symbols-outlined text-base">bookmark</span>
</button>
</div>
</div>
</div>
{/* Popular 2: The Design of Everyday Things */}
<div className="flex items-center gap-space-md p-space-md bg-surface-container-lowest/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all">
<div className="w-20 h-28 rounded-lg overflow-hidden shrink-0 shadow-md">
<img className="w-full h-full object-cover" data-alt="Editorial book cover of The Design of Everyday Things by Don Norman. Famous impossible coffeepot graphic on crisp white background with bold modern red and black typography." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPdx_o0G_DRsBQu_StswWIcC-BrmqjgTIBsHGhsnWdUUsxmgeO5g_5_g7EdT79GNd2HlEcnjc-m3urI52TF7uMRQBTtGXKWyziWCP_RaInsjPSjqfO1qKipCI8IqdHwMb95zfQH5jGcNlf4US4NKaw6DXNyqfNlNgWtuVSI5LacnRDpaqTbehYTqHjWHGvL5Ho7wCdCQgtDWMz91cOrxPRsHTK6EsySiUc8QYRKZcr-CRdD1Kb8vWF" />
</div>
<div className="flex flex-col justify-between flex-1 min-w-0">
<div>
<span className="font-caption text-caption text-text-secondary">Dewey 745.2 • Bay 11</span>
<h5 className="font-body-medium text-body-medium text-text-primary font-bold truncate">Design of Everyday Things</h5>
<p className="font-small text-small text-text-secondary truncate">Don Norman</p>
</div>
<div className="mt-2 flex items-center justify-between">
<span className="font-caption text-caption text-status-available font-semibold">Available</span>
<button className="p-1.5 rounded-full bg-soft-blue text-primary hover:bg-action-green hover:text-text-primary transition-colors" type="button">
<span className="material-symbols-outlined text-base">bookmark</span>
</button>
</div>
</div>
</div>
{/* Popular 3: A Brief History of Time */}
<div className="flex items-center gap-space-md p-space-md bg-surface-container-lowest/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all">
<div className="w-20 h-28 rounded-lg overflow-hidden shrink-0 shadow-md">
<img className="w-full h-full object-cover" data-alt="Editorial book cover of A Brief History of Time by Stephen Hawking. Deep cosmic space imagery with shimmering nebula, silver typography, prestigious scientific edition." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDP20dFSsx4Uqpy2G2w4cVv9wb718EJ90bTOC7tHKAbRFLmRNnedVetP_iqaaGlh-YIX_KVpE5Az3l9J_uGb_KINXo5Uu_1JQp1AeE-qUT7frzYvvm-wBHF0WfMPK_BHm4VTmfDI9drlataH1Yrn7DegSWoi7J5GyG7GUV12Kadx0MRZeZ5NcL84gt-pZIt2mdMtTtTqf0A9js_PesnIvXgnPUiYrOGebvPZRb0A1xHtspTLNxOmqmV" />
</div>
<div className="flex flex-col justify-between flex-1 min-w-0">
<div>
<span className="font-caption text-caption text-text-secondary">Dewey 523.1 • Bay 02</span>
<h5 className="font-body-medium text-body-medium text-text-primary font-bold truncate">A Brief History of Time</h5>
<p className="font-small text-small text-text-secondary truncate">Stephen Hawking</p>
</div>
<div className="mt-2 flex items-center justify-between">
<span className="font-caption text-caption text-status-pending font-semibold">1 Copy Left</span>
<button className="p-1.5 rounded-full bg-soft-blue text-primary hover:bg-action-green hover:text-text-primary transition-colors" type="button">
<span className="material-symbols-outlined text-base">bookmark</span>
</button>
</div>
</div>
</div>
{/* Popular 4: Zero to One */}
<div className="flex items-center gap-space-md p-space-md bg-surface-container-lowest/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all">
<div className="w-20 h-28 rounded-lg overflow-hidden shrink-0 shadow-md">
<img className="w-full h-full object-cover" data-alt="Editorial book cover of Zero to One: Notes on Startups by Peter Thiel with Blake Masters. Minimalist stark navy blue and silver vertical numeric emblem, high contrast venture business typography." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhdNehBRWkFYU6zJqOU-jjnrJdlHzjjrU5gefKZgB7rCxz5xSfqCid2uYmbfEZsIFRWXRkOuX7XXXFL1cIGqSQvNDs5wKagt1GK_fLX6O95k9_VzpEiAEGgUF9O8WeufL-AZrdkyUDkx0Uhm7EmQgLgh31aQ6eQyIefY8FLTOoIkoyEl9MA0YPyJLBRsCzVnF4hmg6SODjLXDo2qOn38mHL9RsN-eFpOOqJgoWTwEDEyZxqCbXIFEb" />
</div>
<div className="flex flex-col justify-between flex-1 min-w-0">
<div>
<span className="font-caption text-caption text-text-secondary">Dewey 658.1 • Bay 09</span>
<h5 className="font-body-medium text-body-medium text-text-primary font-bold truncate">Zero to One</h5>
<p className="font-small text-small text-text-secondary truncate">Peter Thiel, Blake Masters</p>
</div>
<div className="mt-2 flex items-center justify-between">
<span className="font-caption text-caption text-status-available font-semibold">Available</span>
<button className="p-1.5 rounded-full bg-soft-blue text-primary hover:bg-action-green hover:text-text-primary transition-colors" type="button">
<span className="material-symbols-outlined text-base">bookmark</span>
</button>
</div>
</div>
</div>
</div>
</div>
</div>

</div>
    </div>
  );
};

export default CustomerDashboard;
