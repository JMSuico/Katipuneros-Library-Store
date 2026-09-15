// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// BookAvailability.tsx -- Cashier Book Availability and Stack Catalog
// Converted directly from SidebarBookAvailabilityPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const BookAvailability: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
// Wire up blueprint view trigger inside copy inventory drawer
    document.querySelectorAll("button").forEach(btn => {
      if (btn.innerText.includes("Show Stacks Floorplan")) {
        btn.addEventListener("click", () => {
          document.getElementById('floorplanModal').classList.remove('hidden');
        });
      }
    });

    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full pb-space-3xl">
{/* Top Context Header & Terminal Read-Only State Indicator */}
<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-xl">
<div className="flex flex-col gap-space-xs">
<div className="flex items-center gap-space-sm text-text-secondary font-caption text-caption">
<span className="inline-flex items-center gap-1 font-bold text-primary">
<span className="material-symbols-outlined text-base">shelves</span>
          INVENTORY ARCHIVE
        </span>
<span className="">•</span>
<span className="">Catalog &amp; Physical Stacks Directory</span>
<span className="">•</span>
<span className="bg-surface-container px-space-xs py-0.5 rounded text-on-surface-variant font-medium">Read-Only Staff Terminal</span>
</div>
<h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">Book Availability &amp; Stacks Directory</h1>
<p className="font-body text-body text-text-secondary">Verify real-time copy positions, physical shelf tags, waitlist saturation, and hold allocations.</p>
</div>
{/* Quick Operations Pill Bar */}
<div className="flex items-center flex-wrap gap-space-sm">
<div className="flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-space-sm rounded-full shadow-sm">
<span className="w-2.5 h-2.5 rounded-full bg-status-available animate-pulse"></span>
<span className="font-small text-small font-medium text-text-primary">Bay Radio Mesh Active</span>
<span className="text-text-secondary text-caption font-caption">(Sync: 12s ago)</span>
</div>
<button className="inline-flex items-center gap-space-xs bg-action-green hover:bg-action-green-hover text-text-primary px-space-lg py-space-sm rounded-full font-body-medium text-body-medium shadow-sm transition-all transform active:scale-95" onClick={() => { document.getElementById('copyDrawer')?.classList.remove('translate-x-full'); }} type="button">
<span className="material-symbols-outlined text-xl">barcode_scanner</span>
<span className="">Scan Physical Copy</span>
</button>
</div>
</div>
{/* Metric Overview Bento Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-space-md mb-space-xl">
{/* Total Titles */}
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">Catalog Titles</span>
<span className="p-1.5 rounded-lg bg-soft-blue text-primary material-symbols-outlined text-lg">auto_stories</span>
</div>
<div className="mt-space-md">
<div className="font-headline-2 text-headline-2 text-text-primary leading-none">1,248</div>
<p className="font-caption text-caption text-text-secondary mt-1">42 categories indexed</p>
</div>
<div className="absolute -right-2 -bottom-2 w-16 h-16 bg-primary/5 rounded-full pointer-events-none"></div>
</div>
{/* Total Physical Assets */}
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">Total Physical Copies</span>
<span className="p-1.5 rounded-lg bg-secondary-container text-on-secondary-container material-symbols-outlined text-lg">layers</span>
</div>
<div className="mt-space-md">
<div className="font-headline-2 text-headline-2 text-text-primary leading-none">4,850</div>
<div className="flex items-center gap-1 text-caption font-caption text-text-secondary mt-1">
<span className="font-semibold text-primary">Avg 3.8</span> copies per title
        </div>
</div>
<div className="absolute -right-2 -bottom-2 w-16 h-16 bg-secondary/5 rounded-full pointer-events-none"></div>
</div>
{/* Available on Stacks (High visual weight) */}
<div className="bg-soft-blue/70 rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider text-primary font-bold">Ready on Stacks</span>
<span className="p-1.5 rounded-lg bg-surface-container-lowest text-status-available material-symbols-outlined text-lg">shelves</span>
</div>
<div className="mt-space-md">
<div className="flex items-baseline gap-2">
<span className="font-headline-2 text-headline-2 text-text-primary leading-none">3,890</span>
<span className="bg-action-green text-text-primary font-caption text-caption font-bold px-1.5 py-0.5 rounded-full">80.2%</span>
</div>
<div className="w-full bg-surface-container-lowest/80 h-1.5 rounded-full mt-2 overflow-hidden">
<div className="bg-primary h-full rounded-full" style={{ width: '80.2%' }}></div>
</div>
</div>
</div>
{/* Active on Loan */}
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">Active on Loan</span>
<span className="p-1.5 rounded-lg bg-surface-container text-text-primary material-symbols-outlined text-lg">local_library</span>
</div>
<div className="mt-space-md">
<div className="font-headline-2 text-headline-2 text-text-primary leading-none">740</div>
<p className="font-caption text-caption text-status-pending mt-1 font-semibold">15.2% circulating</p>
</div>
</div>
{/* Reserved in Staging */}
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">Staged Holds</span>
<span className="p-1.5 rounded-lg bg-surface-container text-status-pending material-symbols-outlined text-lg">shopping_bag</span>
</div>
<div className="mt-space-md">
<div className="font-headline-2 text-headline-2 text-text-primary leading-none">160</div>
<p className="font-caption text-caption text-text-secondary mt-1">Locker Bays 01–03</p>
</div>
</div>
{/* Maintenance / Repair / Lost */}
<div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm relative overflow-hidden flex flex-col justify-between">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">In Bindery / Lost</span>
<span className="p-1.5 rounded-lg bg-error-container text-error material-symbols-outlined text-lg">build_circle</span>
</div>
<div className="mt-space-md">
<div className="font-headline-2 text-headline-2 text-status-danger leading-none">60</div>
<p className="font-caption text-caption text-status-danger mt-1 font-medium">1.2% out of circulation</p>
</div>
</div>
</div>
{/* Search & Stacks Multi-Filter Control Console */}
<div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm mb-space-lg flex flex-col gap-space-md">
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md items-center">
{/* Deep Omni-Search */}
<div className="lg:col-span-6 relative">
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-xl">search</span>
<input className="w-full pl-12 pr-12 py-3 bg-surface-container-low focus:bg-surface-container-lowest text-text-primary font-body-medium text-body-medium rounded-xl outline-none transition-all shadow-inner placeholder:text-text-secondary" placeholder="Search by Book Title, Author, ISBN-13, or Dewey Call # (e.g., 005.133)..." type="text" value="Clean Code" />
<button className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1" type="button">
<span className="material-symbols-outlined text-lg">cancel</span>
</button>
</div>
{/* Bay Location Picker */}
<div className="lg:col-span-3">
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-lg">meeting_room</span>
<select className="w-full pl-10 pr-8 py-3 bg-surface-container-low text-text-primary font-small text-small rounded-xl outline-none appearance-none cursor-pointer">
<option value="all">All Stacks Locations (Bay 01 – 14)</option>
<option selected={true} value="bay-14">Bay 14 — Computer Science &amp; Engineering</option>
<option value="bay-01">Bay 01 — Staging &amp; Circulation Hold Lockers</option>
<option value="bay-04">Bay 04 — Philosophy &amp; Social Thought</option>
<option value="bay-08">Bay 08 — Philippine History &amp; Rizaliana</option>
<option value="bay-11">Bay 11 — Natural Sciences &amp; Math</option>
</select>
<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-lg">expand_more</span>
</div>
</div>
{/* Stock Condition / Availability Status Filter */}
<div className="lg:col-span-3">
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-lg">tune</span>
<select className="w-full pl-10 pr-8 py-3 bg-surface-container-low text-text-primary font-small text-small rounded-xl outline-none appearance-none cursor-pointer">
<option value="all">All Inventory States</option>
<option selected={true} value="available">Available Now (&gt; 0 Physical on Stacks)</option>
<option value="limited">Low Stock (≤ 1 Physical Copy)</option>
<option value="defaultChecked-out">Fully Checked Out</option>
<option value="reserved">Staged Holds Pending Pickup</option>
</select>
<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-lg">expand_more</span>
</div>
</div>
</div>
{/* Quick Chips Row & View Toggle */}
<div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
<div className="flex flex-wrap items-center gap-space-xs">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold mr-1">Dewey Categories:</span>
<button className="bg-primary text-on-primary px-space-sm py-1 rounded-full font-caption text-caption font-medium transition-all shadow-sm">
          000 - Computer Science (418)
        </button>
<button className="bg-surface-container hover:bg-surface-container-high text-text-secondary px-space-sm py-1 rounded-full font-caption text-caption font-medium transition-all">
          100 - Philosophy (88)
        </button>
<button className="bg-surface-container hover:bg-surface-container-high text-text-secondary px-space-sm py-1 rounded-full font-caption text-caption font-medium transition-all">
          300 - Social Sciences (264)
        </button>
<button className="bg-surface-container hover:bg-surface-container-high text-text-secondary px-space-sm py-1 rounded-full font-caption text-caption font-medium transition-all">
          600 - Technology (312)
        </button>
<button className="bg-surface-container hover:bg-surface-container-high text-text-secondary px-space-sm py-1 rounded-full font-caption text-caption font-medium transition-all">
          900 - History &amp; Geography (166)
        </button>
</div>
<div className="flex items-center gap-space-sm text-caption font-caption text-text-secondary">
<span className="">Showing <strong className="text-text-primary">1 - 6</strong> of <strong>12</strong> titles matched</span>
<button className="p-1 rounded-lg hover:bg-surface-container text-text-secondary" title="Reset Filters">
<span className="material-symbols-outlined text-base">restart_alt</span>
</button>
</div>
</div>
</div>
{/* Primary Book Availability Catalog Table */}
<div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low text-text-secondary font-caption text-caption uppercase tracking-wider">
<th className="py-space-sm px-space-md font-semibold">Book &amp; Bibliographic Details</th>
<th className="py-space-sm px-space-md font-semibold">Dewey / Stacks Location</th>
<th className="py-space-sm px-space-md font-semibold text-center">Copy Allocation (Avail / Total)</th>
<th className="py-space-sm px-space-md font-semibold text-center">Circulation Dynamics</th>
<th className="py-space-sm px-space-md font-semibold">Status Badge</th>
<th className="py-space-sm px-space-md font-semibold text-right">Physical Asset Drawer</th>
</tr>
</thead>
<tbody className="divide-y-0">
{/* Item 1: Highlighted Row (Clean Code) */}
<tr className="hover:bg-soft-blue/30 transition-colors group bg-soft-blue/15">
<td className="py-space-md px-space-md">
<div className="flex items-center gap-space-md">
<img className="w-12 h-16 object-cover rounded-lg shadow-sm flex-shrink-0" data-alt="Cover of the book Clean Code: A Handbook of Agile Software Craftsmanship by Robert C. Martin with iconic academic typography, blue and white minimalist palette, crisp clean studio lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9pwn_TGMUOsJXW60iO_JHm_0uJc1IXg1q3rk1lRjdxwlzdeSlnhFmaAylj-yM1jLdGDg7llDs7jmJgSx78PP6B-joH_Wj5QQ3m5wEZYgbM2IZAwmoz71mqI66M872pE2TRI0895h7GJCpzue0m5BVVqWJy7j-kXZpxWXM4SAInYYRh7_W8y1uhQ-L9veZsSxGMBRTqPwbwM6VAVvms771Npd6L_N2aD6gTYcynW070szSJzwBciIA" />
<div className="flex flex-col min-w-0">
<div className="flex items-center gap-2">
<span className="font-body-medium text-body-medium font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                      Clean Code: A Handbook of Agile Software Craftsmanship
                    </span>
<span className="bg-soft-blue text-primary text-caption font-caption px-1.5 py-0.5 rounded font-bold uppercase">Staff Top Pick</span>
</div>
<span className="font-small text-small text-text-secondary">Robert C. Martin (Uncle Bob) • Prentice Hall (2008)</span>
<span className="font-caption text-caption text-text-secondary mt-0.5">ISBN-13: 978-0132350884</span>
</div>
</div>
</td>
<td className="py-space-md px-space-md">
<div className="flex flex-col">
<span className="font-body-medium text-body-medium font-bold text-primary">005.133 MAR</span>
<span className="font-small text-small text-text-primary font-medium flex items-center gap-1 mt-0.5">
<span className="material-symbols-outlined text-sm text-text-secondary">pin_drop</span>
                  Bay 14 • Shelf 3B
                </span>
<span className="font-caption text-caption text-text-secondary">Computer Science Stacks East</span>
</div>
</td>
<td className="py-space-md px-space-md text-center">
<div className="inline-flex flex-col items-center">
<div className="flex items-baseline gap-1">
<span className="font-headline-3 text-headline-3 text-status-available font-bold leading-none">2</span>
<span className="font-headline-4 text-headline-4 text-text-secondary leading-none">/ 6</span>
</div>
<span className="font-caption text-caption text-text-secondary mt-1">2 Free on Stacks</span>
</div>
</td>
<td className="py-space-md px-space-md text-center">
<div className="inline-flex flex-col items-center gap-0.5">
<span className="bg-surface-container px-space-sm py-0.5 rounded-full font-caption text-caption font-semibold text-text-primary">
                  1 Borrower active
                </span>
<span className="text-status-pending font-caption text-caption font-medium">1 Staged Reserve</span>
<span className="text-status-danger font-caption text-caption">1 In Repair</span>
</div>
</td>
<td className="py-space-md px-space-md">
<span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-status-available/15 text-text-primary font-caption text-caption font-bold">
<span className="w-2 h-2 rounded-full bg-status-available"></span>
                Available Now
              </span>
</td>
<td className="py-space-md px-space-md text-right">
<button className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-container text-on-primary px-space-md py-2 rounded-xl font-small text-small font-medium shadow-sm transition-all transform active:scale-95" onClick={() => { document.getElementById('copyDrawer')?.classList.remove('translate-x-full'); }} type="button">
<span className="material-symbols-outlined text-lg">inventory_2</span>
<span className="">Inspect 6 Copies</span>
</button>
</td>
</tr>
{/* Item 2: The Pragmatic Programmer */}
<tr className="hover:bg-surface-container-low/60 transition-colors group">
<td className="py-space-md px-space-md">
<div className="flex items-center gap-space-md">
<img className="w-12 h-16 object-cover rounded-lg shadow-sm flex-shrink-0" data-alt="Cover of The Pragmatic Programmer book with silver and blue academic tones, clean graphic modern book cover, soft lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5cI4DGVONeUi5VzIlFPyv2gTfoQJ9AhRLP9OebTbxkNkVzJ1BOY873umyaHAQ6F0g7MdQu5WY-OLBAKivx8nTK6_w3lUzeVM_ubchHjhiVy-VeNUrFEYzpF7EudPbFNQf-7THolicHXRep6CxqJBZ4k7kVJg6qDDUmASBsfkgr_uJ8RS9cC9BNz1wCsnvwhqPkuNuPaQ416-0IiGhJK3TgOKXqJQHoNNBM2aHh0iiOn15rbgPi9oN" />
<div className="flex flex-col min-w-0">
<span className="font-body-medium text-body-medium font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                    The Pragmatic Programmer: Your Journey to Mastery (20th Anniv.)
                  </span>
<span className="font-small text-small text-text-secondary">David Thomas, Andrew Hunt • Addison-Wesley</span>
<span className="font-caption text-caption text-text-secondary mt-0.5">ISBN-13: 978-0135957059</span>
</div>
</div>
</td>
<td className="py-space-md px-space-md">
<div className="flex flex-col">
<span className="font-body-medium text-body-medium font-bold text-primary">005.1 THO</span>
<span className="font-small text-small text-text-primary font-medium flex items-center gap-1 mt-0.5">
<span className="material-symbols-outlined text-sm text-text-secondary">pin_drop</span>
                  Bay 14 • Shelf 2A
                </span>
<span className="font-caption text-caption text-text-secondary">Software Methodology Section</span>
</div>
</td>
<td className="py-space-md px-space-md text-center">
<div className="inline-flex flex-col items-center">
<div className="flex items-baseline gap-1">
<span className="font-headline-3 text-headline-3 text-status-pending font-bold leading-none">1</span>
<span className="font-headline-4 text-headline-4 text-text-secondary leading-none">/ 4</span>
</div>
<span className="font-caption text-caption text-status-pending font-semibold mt-1">Critical Stock</span>
</div>
</td>
<td className="py-space-md px-space-md text-center">
<div className="inline-flex flex-col items-center gap-0.5">
<span className="bg-surface-container px-space-sm py-0.5 rounded-full font-caption text-caption font-semibold text-text-primary">
                  3 Borrowers active
                </span>
<span className="text-text-secondary font-caption text-caption">0 In Hold Queue</span>
</div>
</td>
<td className="py-space-md px-space-md">
<span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-status-pending/20 text-text-primary font-caption text-caption font-bold">
<span className="w-2 h-2 rounded-full bg-status-pending"></span>
                Limited: 1 Copy Left
              </span>
</td>
<td className="py-space-md px-space-md text-right">
<button className="inline-flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high text-text-primary px-space-md py-2 rounded-xl font-small text-small font-medium transition-all" type="button">
<span className="material-symbols-outlined text-lg">inventory_2</span>
<span className="">Inspect 4 Copies</span>
</button>
</td>
</tr>
{/* Item 3: Design Patterns (GoF) */}
<tr className="hover:bg-surface-container-low/60 transition-colors group">
<td className="py-space-md px-space-md">
<div className="flex items-center gap-space-md">
<img className="w-12 h-16 object-cover rounded-lg shadow-sm flex-shrink-0" data-alt="Cover of Design Patterns Elements of Reusable Object-Oriented Software classic computer science textbook, deep teal and ivory design on soft white book cover." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYRMgL2mjp8bfHZcE2IR6O2JbS1DJjRndrjS2brnGFEDylC5Kbh0uMMl5gGezvBTE4vRTu-DUxGXj3FJo6XNWojtKcLL1nTuGtfDaMebSQSprwTNTBo7YMp4wyV6f34VBj2QNoMNy3wssp3Bqb8aOsTz3OwpsglYYFWcIcNnF_8TrLoahOduvkddqlXhNDkBVuaiy_uMfoL_2e-WP7ip3HYz5FXAqVsYtLO0idpNWZGrVbJSKWo_IF" />
<div className="flex flex-col min-w-0">
<span className="font-body-medium text-body-medium font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                    Design Patterns: Elements of Reusable Object-Oriented Software
                  </span>
<span className="font-small text-small text-text-secondary">Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides</span>
<span className="font-caption text-caption text-text-secondary mt-0.5">ISBN-13: 978-0201633610</span>
</div>
</div>
</td>
<td className="py-space-md px-space-md">
<div className="flex flex-col">
<span className="font-body-medium text-body-medium font-bold text-primary">005.133 GOF</span>
<span className="font-small text-small text-text-primary font-medium flex items-center gap-1 mt-0.5">
<span className="material-symbols-outlined text-sm text-text-secondary">pin_drop</span>
                  Bay 14 • Shelf 4C
                </span>
<span className="font-caption text-caption text-text-secondary">Architecture &amp; Core Patterns</span>
</div>
</td>
<td className="py-space-md px-space-md text-center">
<div className="inline-flex flex-col items-center">
<div className="flex items-baseline gap-1">
<span className="font-headline-3 text-headline-3 text-status-danger font-bold leading-none">0</span>
<span className="font-headline-4 text-headline-4 text-text-secondary leading-none">/ 5</span>
</div>
<span className="font-caption text-caption text-status-danger font-semibold mt-1">Depleted on Stacks</span>
</div>
</td>
<td className="py-space-md px-space-md text-center">
<div className="inline-flex flex-col items-center gap-0.5">
<span className="bg-surface-container px-space-sm py-0.5 rounded-full font-caption text-caption font-semibold text-text-primary">
                  5 Borrowers active
                </span>
<span className="text-status-danger font-caption text-caption font-bold">Waitlist: 4 Students</span>
</div>
</td>
<td className="py-space-md px-space-md">
<span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-status-danger/15 text-status-danger font-caption text-caption font-bold">
<span className="w-2 h-2 rounded-full bg-status-danger"></span>
                Waitlist Active (0 Avail)
              </span>
</td>
<td className="py-space-md px-space-md text-right">
<button className="inline-flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high text-text-primary px-space-md py-2 rounded-xl font-small text-small font-medium transition-all" type="button">
<span className="material-symbols-outlined text-lg">inventory_2</span>
<span className="">Inspect 5 Copies</span>
</button>
</td>
</tr>
{/* Item 4: Introduction to Algorithms (CLRS) */}
<tr className="hover:bg-surface-container-low/60 transition-colors group">
<td className="py-space-md px-space-md">
<div className="flex items-center gap-space-md">
<img className="w-12 h-16 object-cover rounded-lg shadow-sm flex-shrink-0" data-alt="Cover of Introduction to Algorithms textbook by Cormen, Leiserson, Rivest and Stein, blue and white clean textbook layout with mathematical graphics." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD67DYkBYTdKvnzRSi621HKg5Hrw6dOwkDb1Z70qEHyIqkmaFpPM5MHmgq7YfJRslQmnsoUVw6Q_9n5lMLdcA2QT8qni8qqRnyjNdHX-zysc4z86E9EIpKTpo4wcdPucfaJBRUti4ynNi3MpofdsuRfKNkZngb1i1gCj3k-vwuEKzKThkxWKwFvaJVbaKJ2o-WV7-Ji53FlzHQvyVvrqIt1WiB6tlUGF5BIkXPrxPmQ7O5e8gG5sSxh" />
<div className="flex flex-col min-w-0">
<span className="font-body-medium text-body-medium font-bold text-text-primary group-hover:text-primary transition-colors truncate">
                    Introduction to Algorithms (4th Edition)
                  </span>
<span className="font-small text-small text-text-secondary">Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest</span>
<span className="font-caption text-caption text-text-secondary mt-0.5">ISBN-13: 978-0262046305</span>
</div>
</div>
</td>
<td className="py-space-md px-space-md">
<div className="flex flex-col">
<span className="font-body-medium text-body-medium font-bold text-primary">005.1 COR</span>
<span className="font-small text-small text-text-primary font-medium flex items-center gap-1 mt-0.5">
<span className="material-symbols-outlined text-sm text-text-secondary">pin_drop</span>
                  Bay 14 • Shelf 1A
                </span>
<span className="font-caption text-caption text-text-secondary">Theoretical Computer Science</span>
</div>
</td>
<td className="py-space-md px-space-md text-center">
<div className="inline-flex flex-col items-center">
<div className="flex items-baseline gap-1">
<span className="font-headline-3 text-headline-3 text-status-available font-bold leading-none">4</span>
<span className="font-headline-4 text-headline-4 text-text-secondary leading-none">/ 8</span>
</div>
<span className="font-caption text-caption text-status-available font-semibold mt-1">4 Free on Stacks</span>
</div>
</td>
<td className="py-space-md px-space-md text-center">
<div className="inline-flex flex-col items-center gap-0.5">
<span className="bg-surface-container px-space-sm py-0.5 rounded-full font-caption text-caption font-semibold text-text-primary">
                  3 Borrowers active
                </span>
<span className="text-status-pending font-caption text-caption">1 Held Bay 01</span>
</div>
</td>
<td className="py-space-md px-space-md">
<span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-status-available/15 text-text-primary font-caption text-caption font-bold">
<span className="w-2 h-2 rounded-full bg-status-available"></span>
                Available Now
              </span>
</td>
<td className="py-space-md px-space-md text-right">
<button className="inline-flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high text-text-primary px-space-md py-2 rounded-xl font-small text-small font-medium transition-all" type="button">
<span className="material-symbols-outlined text-lg">inventory_2</span>
<span className="">Inspect 8 Copies</span>
</button>
</td>
</tr>
</tbody>
</table>
</div>
{/* Table Bottom Bar & Pagination */}
<div className="px-space-lg py-space-md bg-surface-container-low/40 flex flex-col sm:flex-row items-center justify-between gap-space-sm text-small font-small text-text-secondary">
<div className="flex items-center gap-2">
<span className="">Rows per page:</span>
<select className="bg-surface-container-lowest text-text-primary px-2 py-1 rounded-lg outline-none cursor-pointer">
<option>10</option>
<option>25</option>
<option>50</option>
</select>
<span className="ml-2">1–4 of 12 catalog results for Bay 14</span>
</div>
<div className="flex items-center gap-1">
<button className="p-1.5 rounded-lg bg-surface-container-lowest text-text-secondary hover:text-text-primary disabled={true}:opacity-40" disabled={true}>
<span className="material-symbols-outlined text-base">chevron_left</span>
</button>
<button className="px-3 py-1 rounded-lg bg-primary text-on-primary font-bold">1</button>
<button className="px-3 py-1 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-text-primary">2</button>
<button className="p-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-text-primary">
<span className="material-symbols-outlined text-base">chevron_right</span>
</button>
</div>
</div>
</div>
{/* Real-time Physical Inventory Drawer / Modal (Slide-in for Clean Code) */}
<div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-surface-container-lowest shadow-2xl z-50 transform translate-x-0 transition-transform duration-300 ease-in-out flex flex-col" id="copyDrawer">
{/* Drawer Header */}
<div className="p-space-lg bg-soft-blue/60 flex items-start justify-between gap-space-md">
<div className="flex items-start gap-space-md">
<img className="w-14 h-20 object-cover rounded-lg shadow-sm flex-shrink-0" data-alt="Cover of the book Clean Code by Robert C. Martin with iconic academic typography, blue and white minimalist palette, crisp clean studio lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAI0XIRVO9jX5WIN45BOL1dNCynYmyJGi_zYtb3NzHvbEHWdNjSUbN_Gk4PcXE7mIqI3rq8eDbdjjglFtD_uteTqrwlRJ3GqeNHVAt8DWSAjPzi-xJ8qS_9yTdc4HiJoVdULCcRRUcX-lrpjMqWjlCxlyRM4s12gCtg-Zp-3K815V6opIo9YW-CiNuzJ_0ZNYyRs5lhBcKj4c0HUxP9dk_9Jed3KDlPdEUDCry4NboqX5ZaEOvAWcoV" />
<div className="flex flex-col">
<div className="flex items-center gap-space-xs">
<span className="bg-primary text-on-primary font-caption text-caption px-space-xs py-0.5 rounded font-bold uppercase">Physical Inventory Breakdown</span>
<span className="font-caption text-caption text-text-secondary">ID: #CAT-005133-MAR</span>
</div>
<h2 className="font-headline-4 text-headline-4 text-text-primary font-bold leading-tight mt-1">Clean Code</h2>
<span className="font-small text-small text-text-secondary">Robert C. Martin • Stacks Dewey: <strong className="text-primary font-bold">005.133 MAR</strong></span>
</div>
</div>
<button className="p-1.5 rounded-full hover:bg-surface-container text-text-secondary hover:text-text-primary transition-colors" onClick={() => { document.getElementById('copyDrawer')?.classList.add('translate-x-full'); }} type="button">
<span className="material-symbols-outlined text-xl">close</span>
</button>
</div>
{/* Drawer Quick Verification Banner */}
<div className="px-space-lg py-space-sm bg-surface-container-low flex items-center justify-between">
<div className="flex items-center gap-space-sm text-small font-small">
<span className="font-semibold text-text-primary">Physical Assets: 6 registered</span>
<span className="text-text-secondary">•</span>
<span className="text-status-available font-bold">2 Available on Shelf</span>
<span className="text-text-secondary">•</span>
<span className="text-status-pending font-medium">1 Reserved</span>
</div>
<button className="inline-flex items-center gap-1 text-primary hover:text-primary-container font-caption text-caption font-bold" type="button">
<span className="material-symbols-outlined text-sm">map</span>
<span className="">Show Stacks Floorplan (Bay 14)</span>
</button>
</div>
{/* Live Barcode Quick Scan Input for Cashier Desk Verification */}
<div className="p-space-lg bg-surface-container/40">
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-lg">qr_code_scanner</span>
<input className="w-full pl-10 pr-24 py-2.5 bg-surface-container-lowest text-text-primary font-small text-small rounded-xl outline-none shadow-sm focus:ring-2 focus:ring-primary/20" placeholder="Scan or type physical item barcode (e.g. KP-BC-4491-01)..." type="text" />
<button className="absolute right-2 top-1/2 -translate-y-1/2 bg-action-green text-text-primary px-3 py-1 rounded-lg font-caption text-caption font-bold hover:bg-action-green-hover transition-colors" type="button">
          Verify
        </button>
</div>
</div>
{/* Physical Copies List */}
<div className="flex-1 overflow-y-auto p-space-lg flex flex-col gap-space-md">
{/* Copy 1: Available */}
<div className="p-space-md bg-surface-container-low rounded-xl flex flex-col gap-space-xs transition-all hover:shadow-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="font-body-medium text-body-medium font-bold text-text-primary">Copy #KP-BC-4491-01</span>
<span className="bg-status-available/20 text-status-available px-space-xs py-0.5 rounded font-caption text-caption font-bold">AVAILABLE</span>
</div>
<span className="text-caption font-caption text-text-secondary">Acquired: Jan 2023</span>
</div>
<div className="grid grid-cols-2 gap-space-sm text-small font-small text-text-secondary mt-1">
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-base text-primary">shelves</span>
<span className="text-text-primary font-medium">Bay 14, Shelf 3B</span>
</div>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-base text-status-available">verified</span>
<span className="">Condition: <strong className="text-text-primary">Good (Clean Binding)</strong></span>
</div>
</div>
<div className="flex items-center justify-between pt-space-xs text-caption font-caption text-text-secondary">
<span className="">RFID Tag: Active [E200-983A-11]</span>
<span className="text-primary font-medium">Ready for immediate checkout</span>
</div>
</div>
{/* Copy 2: Staged for Hold */}
<div className="p-space-md bg-soft-blue/30 rounded-xl flex flex-col gap-space-xs transition-all hover:shadow-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="font-body-medium text-body-medium font-bold text-text-primary">Copy #KP-BC-4491-02</span>
<span className="bg-status-pending text-on-primary px-space-xs py-0.5 rounded font-caption text-caption font-bold">STAGED HOLD</span>
</div>
<span className="text-caption font-caption text-status-pending font-bold">Expires: Today, 6:00 PM</span>
</div>
<div className="grid grid-cols-2 gap-space-sm text-small font-small text-text-secondary mt-1">
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-base text-primary">lock</span>
<span className="text-text-primary font-medium">Bay 01 Locker C-02</span>
</div>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-base text-text-secondary">person</span>
<span className="">Held For: <strong className="text-text-primary">Hold #KP-RES-00918</strong></span>
</div>
</div>
<div className="flex items-center justify-between pt-space-xs text-caption font-caption text-text-secondary">
<span className="">Patron: Maria Santos (ID: STU-8821)</span>
<span className="text-text-secondary">Pre-scanned by Desk Bay 01</span>
</div>
</div>
{/* Copy 3: On Loan */}
<div className="p-space-md bg-surface-container-low rounded-xl flex flex-col gap-space-xs transition-all hover:shadow-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="font-body-medium text-body-medium font-bold text-text-primary">Copy #KP-BC-4491-03</span>
<span className="bg-secondary text-on-secondary px-space-xs py-0.5 rounded font-caption text-caption font-bold">ON LOAN</span>
</div>
<span className="text-caption font-caption text-text-primary font-semibold">Due: Nov 09, 2026 (14 Days left)</span>
</div>
<div className="grid grid-cols-2 gap-space-sm text-small font-small text-text-secondary mt-1">
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-base text-secondary">badge</span>
<span className="">Borrower: <strong className="text-text-primary">Jhon Doe</strong></span>
</div>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-base text-text-secondary">receipt</span>
<span className="">Loan Token: #LN-2026-9014</span>
</div>
</div>
<div className="flex items-center justify-between pt-space-xs text-caption font-caption text-text-secondary">
<span className="">Issued at: Cashier Desk #2</span>
<span className="text-status-available font-medium">Standard Circ (No Fines)</span>
</div>
</div>
{/* Copy 4: Available (Minor Wear) */}
<div className="p-space-md bg-surface-container-low rounded-xl flex flex-col gap-space-xs transition-all hover:shadow-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="font-body-medium text-body-medium font-bold text-text-primary">Copy #KP-BC-4491-04</span>
<span className="bg-status-available/20 text-status-available px-space-xs py-0.5 rounded font-caption text-caption font-bold">AVAILABLE</span>
</div>
<span className="text-caption font-caption text-text-secondary">Acquired: Sep 2024</span>
</div>
<div className="grid grid-cols-2 gap-space-sm text-small font-small text-text-secondary mt-1">
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-base text-primary">shelves</span>
<span className="text-text-primary font-medium">Bay 14, Shelf 3B</span>
</div>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-base text-status-pending">history_edu</span>
<span className="">Condition: <strong className="text-text-primary">Minor Wear (Cover crease)</strong></span>
</div>
</div>
<div className="flex items-center justify-between pt-space-xs text-caption font-caption text-text-secondary">
<span className="">RFID Tag: Active [E200-983A-14]</span>
<span className="text-primary font-medium">Circulation Approved</span>
</div>
</div>
{/* Copy 5: Bindery Repair */}
<div className="p-space-md bg-error-container/20 rounded-xl flex flex-col gap-space-xs transition-all hover:shadow-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="font-body-medium text-body-medium font-bold text-text-primary">Copy #KP-BC-4491-05</span>
<span className="bg-error-container text-error px-space-xs py-0.5 rounded font-caption text-caption font-bold">IN MAINTENANCE</span>
</div>
<span className="text-caption font-caption text-error font-medium">Estimated: Nov 02, 2026</span>
</div>
<div className="grid grid-cols-2 gap-space-sm text-small font-small text-text-secondary mt-1">
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-base text-error">build</span>
<span className="text-text-primary font-medium">Bindery Workshop Rm 102</span>
</div>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-base text-text-secondary">notes</span>
<span className="">Issue: <strong className="text-text-primary">Spine repair &amp; rebinding</strong></span>
</div>
</div>
<div className="flex items-center justify-between pt-space-xs text-caption font-caption text-text-secondary">
<span className="">Ticket: #MNT-2026-441</span>
<span className="text-status-danger font-medium">Unavailable for check-out</span>
</div>
</div>
{/* Copy 6: On Loan */}
<div className="p-space-md bg-surface-container-low rounded-xl flex flex-col gap-space-xs transition-all hover:shadow-sm">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="font-body-medium text-body-medium font-bold text-text-primary">Copy #KP-BC-4491-06</span>
<span className="bg-secondary text-on-secondary px-space-xs py-0.5 rounded font-caption text-caption font-bold">ON LOAN</span>
</div>
<span className="text-caption font-caption text-text-primary font-semibold">Due: Nov 14, 2026</span>
</div>
<div className="grid grid-cols-2 gap-space-sm text-small font-small text-text-secondary mt-1">
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-base text-secondary">badge</span>
<span className="">Borrower: <strong className="text-text-primary">Sarah Jenkins</strong></span>
</div>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-base text-text-secondary">receipt</span>
<span className="">Loan Token: #LN-2026-9102</span>
</div>
</div>
<div className="flex items-center justify-between pt-space-xs text-caption font-caption text-text-secondary">
<span className="">Issued at: Self-Check Kiosk B</span>
<span className="text-status-available font-medium">Standard Faculty Loan</span>
</div>
</div>
</div>
{/* Drawer Footer Actions */}
<div className="p-space-md bg-surface-container-low flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-xs text-caption font-caption text-text-secondary">
<span className="material-symbols-outlined text-base">lock</span>
<span className="">Catalog modification locked (Admin credentials required={true})</span>
</div>
<div className="flex items-center gap-space-sm">
<button className="bg-surface-container hover:bg-surface-container-high text-text-primary px-space-md py-2 rounded-xl font-small text-small font-medium transition-colors" onClick={() => { document.getElementById('copyDrawer')?.classList.add('translate-x-full'); }} type="button">
          Close Inspection
        </button>
<button className="bg-primary hover:bg-primary-container text-on-primary px-space-md py-2 rounded-xl font-small text-small font-bold transition-colors inline-flex items-center gap-1" type="button">
<span className="material-symbols-outlined text-base">print</span>
<span className="">Print Bay 14 Slip</span>
</button>
</div>
</div>
</div>
{/* Interactive Floorplan & Bay Spatial Telemetry Modal Overlay (Hidden by default, callable) */}
<div className="hidden fixed inset-0 z-50 bg-text-primary/40 backdrop-blur-sm flex items-center justify-center p-space-lg" id="floorplanModal">
<div className="bg-surface-container-lowest rounded-2xl w-full max-w-4xl max-h-[921px] overflow-hidden shadow-2xl flex flex-col">
<div className="p-space-lg bg-soft-blue flex items-center justify-between">
<div className="flex items-center gap-space-sm">
<span className="material-symbols-outlined text-2xl text-primary">map</span>
<div>
<h3 className="font-headline-4 text-headline-4 text-text-primary">Bay 14 Stacks Navigation Blueprint</h3>
<span className="font-caption text-caption text-text-secondary">Level 2 • North Wing • Computer Science &amp; Technical Systems</span>
</div>
</div>
<button className="p-1 rounded-full hover:bg-surface-container text-text-secondary hover:text-text-primary" onClick={() => { document.getElementById('floorplanModal')?.classList.add('hidden'); }} type="button">
<span className="material-symbols-outlined text-xl">close</span>
</button>
</div>
<div className="p-space-xl flex flex-col items-center justify-center bg-surface-container-low">
{/* Blueprint Diagram (Inline SVG Representation) */}
<svg className="w-full max-w-2xl h-64 text-primary" fill="none" viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
<rect fill="#FFFFFF" height="220" opacity="0.4" rx="12" stroke="currentColor" stroke-dasharray="4 4" strokeWidth="1.5" width="580" x="10" y="10"></rect>
{/* Corridor */}
<rect fill="#D9EEF5" height="40" opacity="0.6" width="540" x="30" y="100"></rect>
<text fill="#18323D" font-family="Inter" font-size="12" font-weight="600" x="40" y="125">CENTRAL AISLE (BAY 14 AISLE PASS)</text>
{/* Shelf 1 */}
<rect fill="#EEF5F6" height="50" rx="6" width="100" x="50" y="30"></rect>
<text fill="#647982" font-family="Inter" font-size="12" font-weight="500" x="65" y="60">Shelf 1A/B</text>
{/* Shelf 2 */}
<rect fill="#EEF5F6" height="50" rx="6" width="100" x="180" y="30"></rect>
<text fill="#647982" font-family="Inter" font-size="12" font-weight="500" x="195" y="60">Shelf 2A/B</text>
{/* Shelf 3 (Target highlighted) */}
<rect fill="#00658a" height="50" rx="6" width="120" x="310" y="30"></rect>
<text fill="#FFFFFF" font-family="Inter" font-size="12" font-weight="700" x="325" y="55">Shelf 3B (Target)</text>
<text fill="#9BE564" font-family="Inter" font-size="10" font-weight="600" x="325" y="70">005.133 MAR (2 Ready)</text>
{/* Shelf 4 */}
<rect fill="#EEF5F6" height="50" rx="6" width="100" x="450" y="30"></rect>
<text fill="#647982" font-family="Inter" font-size="12" font-weight="500" x="465" y="60">Shelf 4A/C</text>
{/* South Stacks */}
<rect fill="#EEF5F6" height="50" rx="6" width="100" x="50" y="160"></rect>
<rect fill="#EEF5F6" height="50" rx="6" width="100" x="180" y="160"></rect>
<rect fill="#EEF5F6" height="50" rx="6" width="100" x="310" y="160"></rect>
<rect fill="#EEF5F6" height="50" rx="6" width="100" x="450" y="160"></rect>
</svg>
</div>
<div className="p-space-md bg-surface-container-lowest flex justify-end">
<button className="bg-primary text-on-primary px-space-lg py-2 rounded-xl font-small text-small font-medium" onClick={() => { document.getElementById('floorplanModal')?.classList.add('hidden'); }} type="button">
          Close Blueprint View
        </button>
</div>
</div>
</div>
{/* Inline Script for Interactive Demo Handlers */}

</div>
    </div>
  );
};

export default BookAvailability;
