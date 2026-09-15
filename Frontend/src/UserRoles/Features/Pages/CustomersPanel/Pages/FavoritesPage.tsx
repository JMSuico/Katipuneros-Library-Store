// [Layer: UserRoles/Features/Pages/CustomersPanel/Pages]
// FavoritesPage.tsx -- Customer Saved Books and Reading List
// Converted directly from NavFavoritesPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC } from 'react';

const FavoritesPage: FC = () => {
  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
{/* Toast Notification (Top Right Floating Micro-Feedback) */}
<div className="fixed bottom-6 right-6 z-50 flex items-center gap-space-md p-space-md rounded-xl bg-surface-container-lowest/90 backdrop-blur-xl shadow-xl transition-all duration-300 transform translate-y-0 opacity-100" id="status-toast">
<div className="w-10 h-10 rounded-full bg-action-green/20 flex items-center justify-center text-primary shrink-0">
<span className="material-symbols-outlined text-xl">auto_stories</span>
</div>
<div className="flex flex-col pr-space-md">
<p className="font-body-medium text-body-medium text-text-primary font-semibold">Ready for Circulation Hold</p>
<p className="font-caption text-caption text-text-secondary">"Clean Architecture" has 4 physical copies in Bay 14.</p>
</div>
<button className="text-text-secondary hover:text-text-primary p-space-xs rounded-full" onClick={() => { document.getElementById('status-toast')?.classList.add('opacity-0', 'pointer-events-none'); }}>
<span className="material-symbols-outlined text-lg">close</span>
</button>
</div>
{/* Breadcrumbs & Patron Overview */}
<section className="w-full pb-space-lg">
<div className="flex flex-col gap-space-xs mb-space-md">
<div className="flex items-center gap-space-xs font-caption text-caption text-secondary tracking-wider font-semibold uppercase">
<span className="material-symbols-outlined text-base">bookmarks</span>
<span className="">Patron Wishlist &amp; Saved Stacks</span>
<span className="">•</span>
<span className="">AY 2026–2027</span>
</div>
<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
<div>
<h1 className="font-headline-1 text-headline-1 text-text-primary tracking-tight">My Saved Books &amp; Wishlist</h1>
<p className="font-body-large text-body-large text-text-secondary max-w-3xl mt-1">
            Curate your academic reading lists, track real-time physical stack inventory, and trigger batch reservation holds for pickup at the Circulation Desk.
          </p>
</div>
{/* Header Actions */}
<div className="flex flex-wrap items-center gap-space-sm shrink-0">
<button className="h-11 px-space-md rounded-full bg-surface-container-lowest/80 hover:bg-surface-container-lowest text-text-primary font-small text-small font-medium shadow-sm transition-all duration-150 flex items-center gap-space-xs" type="button">
<span className="material-symbols-outlined text-lg">playlist_add</span>
<span className="">+ Create Reading List</span>
</button>
<button className="h-11 px-space-md rounded-full bg-surface-container-lowest/80 hover:bg-surface-container-lowest text-secondary font-small text-small font-medium shadow-sm transition-all duration-150 flex items-center gap-space-xs" type="button">
<span className="material-symbols-outlined text-lg">download</span>
<span className="">Export (BibTeX / CSV)</span>
</button>
<button className="h-11 px-space-lg rounded-full bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-semibold shadow-md hover:shadow-lg transition-all duration-150 flex items-center gap-space-xs" type="button">
<span className="material-symbols-outlined text-lg">shopping_bag_speed</span>
<span className="">Reserve All Available (8)</span>
</button>
</div>
</div>
</div>
{/* 4 Metrics Glass Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mt-space-md">
{/* Total Saved */}
<div className="p-space-lg rounded-xl bg-surface-container-lowest/70 backdrop-blur-md shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase text-text-secondary tracking-wider font-semibold">Total Saved</span>
<span className="w-8 h-8 rounded-full bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: '\'FILL\' 1' }}>favorite</span>
</span>
</div>
<div className="mt-space-md">
<div className="font-headline-2 text-headline-2 text-text-primary font-bold">12 Titles</div>
<p className="font-caption text-caption text-text-secondary mt-1">Organized across 3 custom lists</p>
</div>
<div className="w-full bg-surface-variant h-1.5 rounded-full mt-space-md overflow-hidden">
<div className="bg-primary h-full rounded-full" style={{ width: '100%' }}></div>
</div>
</div>
{/* Available for Hold */}
<div className="p-space-lg rounded-xl bg-surface-container-lowest/70 backdrop-blur-md shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase text-text-secondary tracking-wider font-semibold">Available for Hold</span>
<span className="w-8 h-8 rounded-full bg-status-available/20 flex items-center justify-center text-secondary">
<span className="material-symbols-outlined text-lg">check_circle</span>
</span>
</div>
<div className="mt-space-md">
<div className="font-headline-2 text-headline-2 text-text-primary font-bold">08 Titles</div>
<p className="font-caption text-caption text-text-secondary mt-1">Ready in physical library stacks</p>
</div>
<div className="w-full bg-surface-variant h-1.5 rounded-full mt-space-md overflow-hidden">
<div className="bg-action-green h-full rounded-full" style={{ width: '66%' }}></div>
</div>
</div>
{/* Low Stock */}
<div className="p-space-lg rounded-xl bg-surface-container-lowest/70 backdrop-blur-md shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase text-text-secondary tracking-wider font-semibold">Low Stock (1 Left)</span>
<span className="w-8 h-8 rounded-full bg-status-pending/20 flex items-center justify-center text-status-pending">
<span className="material-symbols-outlined text-lg">schedule</span>
</span>
</div>
<div className="mt-space-md">
<div className="font-headline-2 text-headline-2 text-text-primary font-bold">03 Titles</div>
<p className="font-caption text-caption text-text-secondary mt-1">High campus checkout demand</p>
</div>
<div className="w-full bg-surface-variant h-1.5 rounded-full mt-space-md overflow-hidden">
<div className="bg-status-pending h-full rounded-full" style={{ width: '25%' }}></div>
</div>
</div>
{/* Checked Out / Waitlist */}
<div className="p-space-lg rounded-xl bg-surface-container-lowest/70 backdrop-blur-md shadow-sm flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase text-text-secondary tracking-wider font-semibold">Checked Out</span>
<span className="w-8 h-8 rounded-full bg-status-danger/20 flex items-center justify-center text-status-danger">
<span className="material-symbols-outlined text-lg">hourglass_empty</span>
</span>
</div>
<div className="mt-space-md">
<div className="font-headline-2 text-headline-2 text-text-primary font-bold">01 Title</div>
<p className="font-caption text-caption text-text-secondary mt-1">Auto-notification enabled</p>
</div>
<div className="w-full bg-surface-variant h-1.5 rounded-full mt-space-md overflow-hidden">
<div className="bg-status-danger h-full rounded-full" style={{ width: '8%' }}></div>
</div>
</div>
</div>
</section>
{/* Reading Lists Tabs & Filter Navigation */}
<section className="w-full py-space-md flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
{/* Filter Chips */}
<div className="flex items-center gap-space-xs overflow-x-auto pb-1">
<button className="h-10 px-space-md rounded-full bg-primary text-on-primary font-small text-small font-semibold shadow-sm flex items-center gap-space-xs shrink-0">
<span className="">All Saved</span>
<span className="w-5 h-5 rounded-full bg-surface-container-lowest/20 flex items-center justify-center text-caption font-bold">12</span>
</button>
<button className="h-10 px-space-md rounded-full bg-chip-unselected-bg hover:bg-surface-container-lowest text-text-primary font-small text-small font-medium transition-colors flex items-center gap-space-xs shrink-0">
<span className="">Thesis &amp; Dissertation Stacks</span>
<span className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center text-caption text-text-secondary">5</span>
</button>
<button className="h-10 px-space-md rounded-full bg-chip-unselected-bg hover:bg-surface-container-lowest text-text-primary font-small text-small font-medium transition-colors flex items-center gap-space-xs shrink-0">
<span className="">Software Architecture &amp; Systems</span>
<span className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center text-caption text-text-secondary">4</span>
</button>
<button className="h-10 px-space-md rounded-full bg-chip-unselected-bg hover:bg-surface-container-lowest text-text-primary font-small text-small font-medium transition-colors flex items-center gap-space-xs shrink-0">
<span className="">Classical Philosophy</span>
<span className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center text-caption text-text-secondary">3</span>
</button>
</div>
{/* Controls: Search, Sort, View Layout Toggle */}
<div className="flex items-center gap-space-sm flex-wrap sm:flex-nowrap">
{/* Search */}
<div className="flex items-center bg-surface-container-lowest/90 rounded-full px-space-md py-space-xs shadow-sm flex-1 sm:w-72">
<span className="material-symbols-outlined text-text-secondary text-lg mr-space-xs">search</span>
<input className="w-full bg-transparent font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none" placeholder="Filter by title, author, call no..." type="text" />
</div>
{/* Sort Dropdown */}
<div className="relative">
<select className="h-10 appearance-none bg-surface-container-lowest/90 font-small text-small text-text-primary pl-space-md pr-8 py-space-xs rounded-full shadow-sm cursor-pointer focus:outline-none">
<option>Sort: Recently Added</option>
<option>Sort: Shelf Availability</option>
<option>Sort: Dewey Decimal (Asc)</option>
<option>Sort: Highest Rated</option>
</select>
<span className="material-symbols-outlined absolute right-2.5 top-2.5 text-text-secondary pointer-events-none text-base">expand_more</span>
</div>
{/* View Toggle */}
<div className="flex items-center bg-surface-container-lowest/90 p-1 rounded-full shadow-sm">
<button className="p-1.5 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xs" title="Grid View">
<span className="material-symbols-outlined text-lg">grid_view</span>
</button>
<button className="p-1.5 rounded-full text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors" title="List View">
<span className="material-symbols-outlined text-lg">view_list</span>
</button>
</div>
</div>
</section>
{/* Saved Books Grid (High-Density Cards) */}
<section className="w-full py-space-md">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
{/* Book 1: Clean Architecture */}
<div className="group relative flex flex-col justify-between rounded-xl bg-surface-container-lowest/80 backdrop-blur-md p-space-md shadow-sm hover:shadow-md transition-all duration-200">
<div className="flex gap-space-md">
{/* Book Cover */}
<div className="w-28 h-40 shrink-0 rounded-lg overflow-hidden relative shadow-md bg-surface-container">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" data-alt="Cover of the book Clean Architecture by Robert C. Martin with minimalist geometric shapes and cool tech blue aesthetics, soft lighting, professional studio shot on crisp clean desk" src="https://lh3.googleusercontent.com/aida-public/AB6AXuADdOG0R4v9UsiqbFjEhM4WHEy_2-nqDRyeHgeORhtSYTIgHHzZ60fCHGgHgytetAOT2lzY2vXdLtWvYPc4-gpEWETvZwEU5r8jV-QHNMbLYMdos62RZQQnoKuGUmHrxkEZVY90sbuuTDVAXTzyMBCXi_nLzA6q_Kkt1dpQ2crQZxIM9sFtZnvXQW-sc-4zZ1icjYKnwv7aUgEi3zi1uPd9GzlNVzK38sfgURO15Y66eaebzJ5o2VEB" />
<div className="absolute top-2 left-2">
<span className="px-2 py-0.5 rounded-full bg-surface-container-lowest/90 font-caption text-caption text-text-primary font-bold shadow-xs">005.1</span>
</div>
</div>
{/* Metadata */}
<div className="flex flex-col flex-1 min-w-0">
<div className="flex items-start justify-between gap-space-xs">
<span className="px-space-xs py-0.5 rounded font-caption text-caption font-semibold bg-soft-blue text-primary">Bay 14 • Shelf 3B</span>
<button className="text-status-danger hover:scale-110 transition-transform p-1" title="Remove from favorites">
<span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: '\'FILL\' 1' }}>favorite</span>
</button>
</div>
<h3 className="font-headline-4 text-headline-4 text-text-primary mt-1 line-clamp-2 group-hover:text-primary transition-colors">
              Clean Architecture
            </h3>
<p className="font-small text-small text-text-secondary truncate mt-0.5">Robert C. Martin</p>
<div className="flex items-center gap-1.5 mt-2">
<span className="material-symbols-outlined text-status-pending text-sm" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-caption text-caption text-text-primary font-bold">4.8</span>
<span className="font-caption text-caption text-text-secondary">(342 reviews)</span>
</div>
<div className="mt-auto pt-space-xs">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-caption text-caption font-semibold bg-status-available/20 text-text-primary">
<span className="w-2 h-2 rounded-full bg-status-available"></span>
                Available (4 Copies)
              </span>
</div>
</div>
</div>
{/* Card Footer Actions */}
<div className="mt-space-md pt-space-md flex items-center justify-between gap-space-xs bg-surface-container-low/40 -mx-space-md -mb-space-md p-space-md rounded-b-xl">
<div className="relative flex-1">
<select className="w-full appearance-none bg-surface-container-lowest font-caption text-caption text-text-secondary pl-3 pr-6 py-2 rounded-lg cursor-pointer focus:outline-none">
<option>Software Architecture &amp; Systems</option>
<option>Thesis Stacks</option>
<option>Move to...</option>
</select>
<span className="material-symbols-outlined absolute right-1.5 top-2 text-text-secondary text-sm pointer-events-none">expand_more</span>
</div>
<button className="h-9 px-space-md rounded-lg bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-semibold shadow-sm transition-all flex items-center gap-1 shrink-0" type="button">
<span className="material-symbols-outlined text-base">bookmark_add</span>
<span className="">Reserve</span>
</button>
</div>
</div>
{/* Book 2: The Great Gatsby */}
<div className="group relative flex flex-col justify-between rounded-xl bg-surface-container-lowest/80 backdrop-blur-md p-space-md shadow-sm hover:shadow-md transition-all duration-200">
<div className="flex gap-space-md">
{/* Book Cover */}
<div className="w-28 h-40 shrink-0 rounded-lg overflow-hidden relative shadow-md bg-surface-container">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" data-alt="Vintage book cover of The Great Gatsby with golden 1920s Art Deco typography and celestial blue twilight illustration, photorealistic studio lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBx590Jx00wGIFeAggsfrauvX3GvoCGoTwsiWf1VAtVvKUcxnshaESmYwj7BFsLDhjl4zaBleGjIFHVSEvEycOGY9DHUf1Tq_cmwH07p48_9pP-Qc_sUbb6bO46uL7lYzfWS2-QjkMUaPzLuFgXxhkl8ygvM6o-Wk_UbFCcUKJ70Dtu0sfDKk7sDEoxYhJuMmUXL8aFyG6cs0S9LWaja6FX1Np_4Z60S0vIE_Q0EY3aO9QDuxItWOye" />
<div className="absolute top-2 left-2">
<span className="px-2 py-0.5 rounded-full bg-surface-container-lowest/90 font-caption text-caption text-text-primary font-bold shadow-xs">813.52</span>
</div>
</div>
{/* Metadata */}
<div className="flex flex-col flex-1 min-w-0">
<div className="flex items-start justify-between gap-space-xs">
<span className="px-space-xs py-0.5 rounded font-caption text-caption font-semibold bg-soft-blue text-primary">Bay 03 • Shelf C-12</span>
<button className="text-status-danger hover:scale-110 transition-transform p-1" title="Remove from favorites">
<span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: '\'FILL\' 1' }}>favorite</span>
</button>
</div>
<h3 className="font-headline-4 text-headline-4 text-text-primary mt-1 line-clamp-2 group-hover:text-primary transition-colors">
              The Great Gatsby
            </h3>
<p className="font-small text-small text-text-secondary truncate mt-0.5">F. Scott Fitzgerald</p>
<div className="flex items-center gap-1.5 mt-2">
<span className="material-symbols-outlined text-status-pending text-sm" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-caption text-caption text-text-primary font-bold">4.6</span>
<span className="font-caption text-caption text-text-secondary">(890 reviews)</span>
</div>
<div className="mt-auto pt-space-xs">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-caption text-caption font-semibold bg-status-pending/20 text-text-primary">
<span className="w-2 h-2 rounded-full bg-status-pending"></span>
                1 Copy Left (Low Stock)
              </span>
</div>
</div>
</div>
{/* Card Footer Actions */}
<div className="mt-space-md pt-space-md flex items-center justify-between gap-space-xs bg-surface-container-low/40 -mx-space-md -mb-space-md p-space-md rounded-b-xl">
<div className="relative flex-1">
<select className="w-full appearance-none bg-surface-container-lowest font-caption text-caption text-text-secondary pl-3 pr-6 py-2 rounded-lg cursor-pointer focus:outline-none">
<option>Thesis Reference</option>
<option>Literature 101</option>
<option>Move to...</option>
</select>
<span className="material-symbols-outlined absolute right-1.5 top-2 text-text-secondary text-sm pointer-events-none">expand_more</span>
</div>
<button className="h-9 px-space-md rounded-lg bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-semibold shadow-sm transition-all flex items-center gap-1 shrink-0" type="button">
<span className="material-symbols-outlined text-base">bookmark_add</span>
<span className="">Reserve</span>
</button>
</div>
</div>
{/* Book 3: Meditations */}
<div className="group relative flex flex-col justify-between rounded-xl bg-surface-container-lowest/80 backdrop-blur-md p-space-md shadow-sm hover:shadow-md transition-all duration-200">
<div className="flex gap-space-md">
{/* Book Cover */}
<div className="w-28 h-40 shrink-0 rounded-lg overflow-hidden relative shadow-md bg-surface-container">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" data-alt="Cover of Meditations by Marcus Aurelius showing a classical Roman marble bust in dramatic chiaroscuro lighting, deep stone blue aesthetic, minimalist editorial" src="https://lh3.googleusercontent.com/aida-public/AB6AXuClPzYf7hVIwQusWw29b-OZ7FeKoyxS_XBdNUg-v12R8Ewx-DJT4ifUt66x8aB9rJR5gHa8yDmG2VJOCZD14CwBd8GD1ycqnjOq5OgHWRIdKTEAUH8mTiXifnZyYByFdP4PLZMRQKeKwcOYAgJ3YStYfuNRYVi1KGNwcSUWJdXLkPjd24LNJKcJSZz53JtdBAZU-fKNzgQEI35PdTmuOo70RR4hHHBRp43ixoeo8Ua5S0sYYHLDDSi7" />
<div className="absolute top-2 left-2">
<span className="px-2 py-0.5 rounded-full bg-surface-container-lowest/90 font-caption text-caption text-text-primary font-bold shadow-xs">188</span>
</div>
</div>
{/* Metadata */}
<div className="flex flex-col flex-1 min-w-0">
<div className="flex items-start justify-between gap-space-xs">
<span className="px-space-xs py-0.5 rounded font-caption text-caption font-semibold bg-soft-blue text-primary">Bay 08 • Shelf 02</span>
<button className="text-status-danger hover:scale-110 transition-transform p-1" title="Remove from favorites">
<span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: '\'FILL\' 1' }}>favorite</span>
</button>
</div>
<h3 className="font-headline-4 text-headline-4 text-text-primary mt-1 line-clamp-2 group-hover:text-primary transition-colors">
              Meditations
            </h3>
<p className="font-small text-small text-text-secondary truncate mt-0.5">Marcus Aurelius (G. Long)</p>
<div className="flex items-center gap-1.5 mt-2">
<span className="material-symbols-outlined text-status-pending text-sm" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-caption text-caption text-text-primary font-bold">4.9</span>
<span className="font-caption text-caption text-text-secondary">(1.2k reviews)</span>
</div>
<div className="mt-auto pt-space-xs">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-caption text-caption font-semibold bg-status-available/20 text-text-primary">
<span className="w-2 h-2 rounded-full bg-status-available"></span>
                Available (6 Copies)
              </span>
</div>
</div>
</div>
{/* Card Footer Actions */}
<div className="mt-space-md pt-space-md flex items-center justify-between gap-space-xs bg-surface-container-low/40 -mx-space-md -mb-space-md p-space-md rounded-b-xl">
<div className="relative flex-1">
<select className="w-full appearance-none bg-surface-container-lowest font-caption text-caption text-text-secondary pl-3 pr-6 py-2 rounded-lg cursor-pointer focus:outline-none">
<option>Classical Philosophy</option>
<option>Personal Stacks</option>
<option>Move to...</option>
</select>
<span className="material-symbols-outlined absolute right-1.5 top-2 text-text-secondary text-sm pointer-events-none">expand_more</span>
</div>
<button className="h-9 px-space-md rounded-lg bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-semibold shadow-sm transition-all flex items-center gap-1 shrink-0" type="button">
<span className="material-symbols-outlined text-base">bookmark_add</span>
<span className="">Reserve</span>
</button>
</div>
</div>
{/* Book 4: CLRS Algorithm (Waitlist State) */}
<div className="group relative flex flex-col justify-between rounded-xl bg-surface-container-lowest/80 backdrop-blur-md p-space-md shadow-sm hover:shadow-md transition-all duration-200">
<div className="flex gap-space-md">
{/* Book Cover */}
<div className="w-28 h-40 shrink-0 rounded-lg overflow-hidden relative shadow-md bg-surface-container">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" data-alt="Cover of Introduction to Algorithms CLRS 4th Edition textbook with abstract network graph node art in cyan and deep navy blue colors on clean matte paper" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeAbUpZxUe0A1CSM73YirvlimAnvJipYLlMpeWMSEO44TS7NHETikxYtUvr_zBbRg6d4QpEO1qhAsWS8hL3XWxT6F_ap9w8-G4vstx9hy5U9QtfXy7lZzW_XxgMqF48Y256PviYwCKTFdeiacOlXCufz0uK61m0XWBw1gGiM8_EZKDS2Lezm7wzU7zxkeyqunhQWgqnVBcF6m9Z3gbhKln6KxZIB8HV19oT7BzDGyP9dqhyPeM48xB" />
<div className="absolute top-2 left-2">
<span className="px-2 py-0.5 rounded-full bg-surface-container-lowest/90 font-caption text-caption text-text-primary font-bold shadow-xs">005.1</span>
</div>
</div>
{/* Metadata */}
<div className="flex flex-col flex-1 min-w-0">
<div className="flex items-start justify-between gap-space-xs">
<span className="px-space-xs py-0.5 rounded font-caption text-caption font-semibold bg-surface-container-high text-text-secondary">Bay 02 • Core Reserve</span>
<button className="text-status-danger hover:scale-110 transition-transform p-1" title="Remove from favorites">
<span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: '\'FILL\' 1' }}>favorite</span>
</button>
</div>
<h3 className="font-headline-4 text-headline-4 text-text-primary mt-1 line-clamp-2 group-hover:text-primary transition-colors">
              Introduction to Algorithms
            </h3>
<p className="font-small text-small text-text-secondary truncate mt-0.5">Cormen, Leiserson, Rivest, Stein</p>
<div className="flex items-center gap-1.5 mt-2">
<span className="material-symbols-outlined text-status-pending text-sm" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-caption text-caption text-text-primary font-bold">4.9</span>
<span className="font-caption text-caption text-text-secondary">(2.1k reviews)</span>
</div>
<div className="mt-auto pt-space-xs">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-caption text-caption font-semibold bg-status-danger/20 text-text-primary">
<span className="w-2 h-2 rounded-full bg-status-danger"></span>
                Checked Out (3 on Waitlist)
              </span>
</div>
</div>
</div>
{/* Card Footer Actions */}
<div className="mt-space-md pt-space-md flex items-center justify-between gap-space-xs bg-surface-container-low/40 -mx-space-md -mb-space-md p-space-md rounded-b-xl">
<label className="flex items-center gap-1.5 cursor-pointer font-caption text-caption text-text-secondary">
<input defaultChecked className="w-4 h-4 rounded text-primary focus:ring-primary" type="checkbox" />
<span className="">Notify on Return</span>
</label>
<button className="h-9 px-space-md rounded-lg bg-status-pending/20 hover:bg-status-pending/30 text-text-primary font-small text-small font-semibold shadow-sm transition-all flex items-center gap-1 shrink-0" type="button">
<span className="material-symbols-outlined text-base">hourglass_top</span>
<span className="">Join Waitlist</span>
</button>
</div>
</div>
{/* Book 5: Atomic Habits */}
<div className="group relative flex flex-col justify-between rounded-xl bg-surface-container-lowest/80 backdrop-blur-md p-space-md shadow-sm hover:shadow-md transition-all duration-200">
<div className="flex gap-space-md">
{/* Book Cover */}
<div className="w-28 h-40 shrink-0 rounded-lg overflow-hidden relative shadow-md bg-surface-container">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" data-alt="Cover of Atomic Habits by James Clear with golden dot matrix gradient typography on minimalist light cream background, soft studio lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZasN2v2jIDQyR6AWBhlB7u06pnrgFlMIzC_BZbiymKDrBXpuntNiioQ177mVt9-Ebf5Nf1X91ZDPZuQizZHqzzVIAM6Y_UiYgeMbKyovsBOjph_KaPFUaH-DJkNHdyChtRogi1XICjVuzD769IPXIxU4-1jXrWGK3R29TRNNCzOT0--h6lc4HSMYf9pbS9X616xZqs5F4_XMIKo1TrMph6OxpzGvtabfmwbvLNkd2SGJ9-0HQ09Nx" />
<div className="absolute top-2 left-2">
<span className="px-2 py-0.5 rounded-full bg-surface-container-lowest/90 font-caption text-caption text-text-primary font-bold shadow-xs">158.1</span>
</div>
</div>
{/* Metadata */}
<div className="flex flex-col flex-1 min-w-0">
<div className="flex items-start justify-between gap-space-xs">
<span className="px-space-xs py-0.5 rounded font-caption text-caption font-semibold bg-soft-blue text-primary">Bay 07 • Shelf D-07</span>
<button className="text-status-danger hover:scale-110 transition-transform p-1" title="Remove from favorites">
<span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: '\'FILL\' 1' }}>favorite</span>
</button>
</div>
<h3 className="font-headline-4 text-headline-4 text-text-primary mt-1 line-clamp-2 group-hover:text-primary transition-colors">
              Atomic Habits
            </h3>
<p className="font-small text-small text-text-secondary truncate mt-0.5">James Clear</p>
<div className="flex items-center gap-1.5 mt-2">
<span className="material-symbols-outlined text-status-pending text-sm" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-caption text-caption text-text-primary font-bold">4.9</span>
<span className="font-caption text-caption text-text-secondary">(3.5k reviews)</span>
</div>
<div className="mt-auto pt-space-xs">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-caption text-caption font-semibold bg-status-available/20 text-text-primary">
<span className="w-2 h-2 rounded-full bg-status-available"></span>
                Available (8 Copies)
              </span>
</div>
</div>
</div>
{/* Card Footer Actions */}
<div className="mt-space-md pt-space-md flex items-center justify-between gap-space-xs bg-surface-container-low/40 -mx-space-md -mb-space-md p-space-md rounded-b-xl">
<div className="relative flex-1">
<select className="w-full appearance-none bg-surface-container-lowest font-caption text-caption text-text-secondary pl-3 pr-6 py-2 rounded-lg cursor-pointer focus:outline-none">
<option>Thesis Stacks</option>
<option>Productivity Lists</option>
<option>Move to...</option>
</select>
<span className="material-symbols-outlined absolute right-1.5 top-2 text-text-secondary text-sm pointer-events-none">expand_more</span>
</div>
<button className="h-9 px-space-md rounded-lg bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-semibold shadow-sm transition-all flex items-center gap-1 shrink-0" type="button">
<span className="material-symbols-outlined text-base">bookmark_add</span>
<span className="">Reserve</span>
</button>
</div>
</div>
{/* Book 6: The Design of Everyday Things */}
<div className="group relative flex flex-col justify-between rounded-xl bg-surface-container-lowest/80 backdrop-blur-md p-space-md shadow-sm hover:shadow-md transition-all duration-200">
<div className="flex gap-space-md">
{/* Book Cover */}
<div className="w-28 h-40 shrink-0 rounded-lg overflow-hidden relative shadow-md bg-surface-container">
<img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" data-alt="Cover of The Design of Everyday Things by Don Norman featuring the iconic impossible teapot illustration on pure white and red cover, macro graphic design book" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2B9PTjJ_zuHQvoO_DzozOeQu5tGjli-whkHlUtDAx-mRz9oJ9c1vvTlkNnxGYRMhTKuiJ-TlZJL_R6wS6QM0wdllRN8_nswLC3JKMvTO5nc697TDos1oOKTcHGpY_RAyh97cEES-vVCzfdklVI-ZEW7b0M5XQfvWg_HxgB5ir4ufwHMQekiPpEIQ_w7z8TyyqPBI4E9czq88M4Kr3F_Li95ls8l54Uiqg3eBLcvf1aHoWYsQ1Pwh6" />
<div className="absolute top-2 left-2">
<span className="px-2 py-0.5 rounded-full bg-surface-container-lowest/90 font-caption text-caption text-text-primary font-bold shadow-xs">745.2</span>
</div>
</div>
{/* Metadata */}
<div className="flex flex-col flex-1 min-w-0">
<div className="flex items-start justify-between gap-space-xs">
<span className="px-space-xs py-0.5 rounded font-caption text-caption font-semibold bg-soft-blue text-primary">Bay 11 • Shelf C-01</span>
<button className="text-status-danger hover:scale-110 transition-transform p-1" title="Remove from favorites">
<span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: '\'FILL\' 1' }}>favorite</span>
</button>
</div>
<h3 className="font-headline-4 text-headline-4 text-text-primary mt-1 line-clamp-2 group-hover:text-primary transition-colors">
              The Design of Everyday Things
            </h3>
<p className="font-small text-small text-text-secondary truncate mt-0.5">Don Norman</p>
<div className="flex items-center gap-1.5 mt-2">
<span className="material-symbols-outlined text-status-pending text-sm" style={{ fontVariationSettings: '\'FILL\' 1' }}>star</span>
<span className="font-caption text-caption text-text-primary font-bold">4.7</span>
<span className="font-caption text-caption text-text-secondary">(1.4k reviews)</span>
</div>
<div className="mt-auto pt-space-xs">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-caption text-caption font-semibold bg-status-available/20 text-text-primary">
<span className="w-2 h-2 rounded-full bg-status-available"></span>
                Available (5 Copies)
              </span>
</div>
</div>
</div>
{/* Card Footer Actions */}
<div className="mt-space-md pt-space-md flex items-center justify-between gap-space-xs bg-surface-container-low/40 -mx-space-md -mb-space-md p-space-md rounded-b-xl">
<div className="relative flex-1">
<select className="w-full appearance-none bg-surface-container-lowest font-caption text-caption text-text-secondary pl-3 pr-6 py-2 rounded-lg cursor-pointer focus:outline-none">
<option>Software Architecture &amp; Systems</option>
<option>Human Factors Reading</option>
<option>Move to...</option>
</select>
<span className="material-symbols-outlined absolute right-1.5 top-2 text-text-secondary text-sm pointer-events-none">expand_more</span>
</div>
<button className="h-9 px-space-md rounded-lg bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-semibold shadow-sm transition-all flex items-center gap-1 shrink-0" type="button">
<span className="material-symbols-outlined text-base">bookmark_add</span>
<span className="">Reserve</span>
</button>
</div>
</div>
</div>
</section>
{/* Reading List Organization & Quick Notes Section (Split Two-Column Grid) */}
<section className="w-full py-space-lg">
<div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg items-stretch">
{/* Thesis Reference Notes Card */}
<div className="lg:col-span-2 rounded-xl bg-surface-container-lowest/80 backdrop-blur-md p-space-lg shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-xl">edit_note</span>
<h2 className="font-headline-3 text-headline-3 text-text-primary">Thesis Reference Annotations</h2>
</div>
<span className="font-caption text-caption text-text-secondary bg-surface-container px-space-xs py-1 rounded">Auto-saved 2m ago</span>
</div>
<p className="font-body text-body text-text-secondary mt-1">
            Quick notes on your current favorites for citation tracking, chapter references, and advisory consultation.
          </p>
<div className="mt-space-md space-y-space-sm">
<div className="p-space-md rounded-lg bg-surface-container-low/60 flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
<div className="flex items-start gap-space-sm">
<span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0"></span>
<div>
<h4 className="font-body-medium text-body-medium text-text-primary font-semibold">Clean Architecture (Ch. 5 &amp; 14)</h4>
<p className="font-caption text-caption text-text-secondary">Crucial for System Architecture chapter in Software Engineering dissertation.</p>
</div>
</div>
<div className="flex items-center gap-space-xs self-end md:self-auto">
<span className="px-2 py-0.5 rounded font-caption text-caption bg-soft-blue text-primary font-medium">Cited in Draft v2.1</span>
<button className="text-text-secondary hover:text-text-primary p-1">
<span className="material-symbols-outlined text-base">edit</span>
</button>
</div>
</div>
<div className="p-space-md rounded-lg bg-surface-container-low/60 flex flex-col md:flex-row md:items-center justify-between gap-space-sm">
<div className="flex items-start gap-space-sm">
<span className="w-2 h-2 rounded-full bg-status-pending mt-2 shrink-0"></span>
<div>
<h4 className="font-body-medium text-body-medium text-text-primary font-semibold">CLRS Algorithms (Ch. 24: Single-Source Shortest Paths)</h4>
<p className="font-caption text-caption text-text-secondary">Referenced for Dijkstra optimization benchmarks in thesis appendix.</p>
</div>
</div>
<div className="flex items-center gap-space-xs self-end md:self-auto">
<span className="px-2 py-0.5 rounded font-caption text-caption bg-surface-variant text-text-secondary font-medium">Pending Hold</span>
<button className="text-text-secondary hover:text-text-primary p-1">
<span className="material-symbols-outlined text-base">edit</span>
</button>
</div>
</div>
</div>
</div>
<div className="mt-space-md pt-space-sm flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<input className="bg-surface-container-low px-space-md py-2 rounded-lg font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none w-64 md:w-96" placeholder="Add a research note for a saved volume..." type="text" />
<button className="h-9 px-space-md rounded-lg bg-secondary text-on-secondary font-small text-small font-medium hover:bg-secondary-container hover:text-on-secondary-container transition-colors">Add</button>
</div>
<button className="font-caption text-caption text-primary font-semibold hover:underline">View All 12 Notes</button>
</div>
</div>
{/* Library Stacks Locator Shortcut */}
<div className="rounded-xl bg-surface-container-lowest/80 backdrop-blur-md p-space-lg shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-xl">map</span>
<h2 className="font-headline-3 text-headline-3 text-text-primary">Physical Stacks Locator</h2>
</div>
<p className="font-body text-body text-text-secondary mt-1">
            Locations for your currently saved 6 volumes relative to Level 2 Central Desk.
          </p>
<div className="mt-space-md space-y-space-xs font-small text-small">
<div className="flex items-center justify-between p-space-xs rounded bg-surface-container-low">
<span className="font-medium text-text-primary">Bay 14 (Tech &amp; Computing)</span>
<span className="font-caption text-caption font-bold text-primary">Level 2, North Wing</span>
</div>
<div className="flex items-center justify-between p-space-xs rounded bg-surface-container-low">
<span className="font-medium text-text-primary">Bay 08 (Philosophy &amp; Ethics)</span>
<span className="font-caption text-caption font-bold text-primary">Level 2, East Aisle</span>
</div>
<div className="flex items-center justify-between p-space-xs rounded bg-surface-container-low">
<span className="font-medium text-text-primary">Bay 03 (American Literature)</span>
<span className="font-caption text-caption font-bold text-primary">Level 1, South Wing</span>
</div>
<div className="flex items-center justify-between p-space-xs rounded bg-surface-container-low">
<span className="font-medium text-text-primary">Bay 02 (Core Algorithmic Reserve)</span>
<span className="font-caption text-caption font-bold text-status-pending">Behind Desk (Ask Staff)</span>
</div>
</div>
</div>
<div className="mt-space-md pt-space-sm flex items-center justify-between">
<div className="flex items-center gap-1 font-caption text-caption text-text-secondary">
<span className="material-symbols-outlined text-sm text-status-available">verified</span>
<span className="">All bays open until 10:00 PM</span>
</div>
<a className="font-caption text-caption text-primary font-bold hover:underline flex items-center gap-0.5" href="#">
<span className="">Interactive Floorplan</span>
<span className="material-symbols-outlined text-xs">arrow_forward</span>
</a>
</div>
</div>
</div>
</section>
</div>
    </div>
  );
};

export default FavoritesPage;
