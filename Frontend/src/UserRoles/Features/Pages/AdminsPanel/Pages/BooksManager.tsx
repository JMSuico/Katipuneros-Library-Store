// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// BooksManager.tsx -- Admin Book and Catalog Management
// Converted directly from SidebarBookManagementPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC } from 'react';

const BooksManager: FC = () => {
  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
<div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-md mb-space-lg">
<div className="flex flex-col max-w-3xl">
<div className="flex items-center gap-space-xs text-caption font-caption text-text-secondary uppercase tracking-wider mb-1">
<span className="">Admin Console</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="">Management</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="text-primary font-bold">Book Catalog</span>
</div>
<h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight font-bold">
        Master Book Catalog &amp; Title Repository
      </h1>
<p className="font-body text-body text-text-secondary mt-0.5">
        Create, catalog, index, and archive bibliographic records across academic disciplines.
      </p>
</div>
<div className="flex flex-wrap items-center gap-space-sm">
<button className="h-11 px-space-md bg-surface-container-lowest text-text-primary rounded-xl font-small text-small font-semibold shadow-sm hover:bg-surface-container transition-colors flex items-center gap-space-xs" type="button">
<span className="material-symbols-outlined text-[18px] text-primary">file_download</span>
        Export MARC 21 / CSV
      </button>
<button className="h-11 px-space-md bg-soft-blue text-primary rounded-xl font-small text-small font-bold hover:bg-secondary-fixed transition-colors flex items-center gap-space-xs" type="button">
<span className="material-symbols-outlined text-[18px]">input</span>
        Batch ISBN Import
      </button>
<button className="h-11 px-space-lg bg-action-green text-text-primary rounded-xl font-small text-small font-bold shadow-sm hover:bg-action-green-hover transition-all flex items-center gap-space-xs" type="button">
<span className="material-symbols-outlined text-[20px]">add_circle</span>
        Add New Book
      </button>
</div>
</div>
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
<div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex items-center gap-space-md">
<div className="w-12 h-12 rounded-xl bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[24px]">menu_book</span>
</div>
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Total Titles</span>
<div className="flex items-baseline gap-2">
<span className="font-headline-3 text-headline-3 font-bold text-text-primary">1,248</span>
<span className="font-caption text-caption text-status-available font-semibold">+14 this mo</span>
</div>
</div>
</div>
<div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex items-center gap-space-md">
<div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[24px]">layers</span>
</div>
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Physical Copies</span>
<div className="flex items-baseline gap-2">
<span className="font-headline-3 text-headline-3 font-bold text-text-primary">4,892</span>
<span className="font-caption text-caption text-text-secondary font-medium">91.4% Healthy</span>
</div>
</div>
</div>
<div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex items-center gap-space-md">
<div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
<span className="material-symbols-outlined text-[24px]">sync</span>
</div>
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">In Circulation</span>
<div className="flex items-baseline gap-2">
<span className="font-headline-3 text-headline-3 font-bold text-text-primary">1,402</span>
<span className="font-caption text-caption text-status-pending font-semibold">28 Holds</span>
</div>
</div>
</div>
<div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex items-center gap-space-md">
<div className="w-12 h-12 rounded-xl bg-primary-fixed flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[24px]">domain</span>
</div>
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Active Disciplines</span>
<div className="flex items-baseline gap-2">
<span className="font-headline-3 text-headline-3 font-bold text-text-primary">42</span>
<span className="font-caption text-caption text-primary font-medium">6 Campuses</span>
</div>
</div>
</div>
</div>
<div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm mb-space-md flex flex-col gap-space-md">
<div className="flex flex-col md:flex-row gap-space-md items-center justify-between">
<div className="relative w-full md:w-96">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">search</span>
<input className="w-full bg-surface-container-low pl-10 pr-4 py-2.5 rounded-full font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none focus:bg-surface-container-lowest shadow-sm" placeholder="Search Title, Author, ISBN-13, Dewey Call No..." type="text" />
</div>
<div className="flex items-center gap-space-sm w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
<div className="flex items-center gap-1 bg-surface-container-low px-3 py-1.5 rounded-xl text-caption font-caption text-text-secondary">
<span className="material-symbols-outlined text-[16px]">filter_alt</span>
<span className="">Status:</span>
<span className="text-text-primary font-semibold">Active Only</span>
<span className="material-symbols-outlined text-[14px]">expand_more</span>
</div>
<div className="flex items-center gap-1 bg-surface-container-low px-3 py-1.5 rounded-xl text-caption font-caption text-text-secondary">
<span className="material-symbols-outlined text-[16px]">sort</span>
<span className="">Sort:</span>
<span className="text-text-primary font-semibold">Recently Added</span>
<span className="material-symbols-outlined text-[14px]">expand_more</span>
</div>
<button className="w-9 h-9 flex items-center justify-center bg-surface-container-low hover:bg-surface-container rounded-xl text-text-secondary transition-colors" title="Toggle Layout View" type="button">
<span className="material-symbols-outlined text-[18px]">table_rows</span>
</button>
</div>
</div>
<div className="flex items-center gap-space-xs overflow-x-auto pb-1 pt-1">
<button className="px-space-md py-1.5 rounded-full font-caption text-caption font-bold bg-primary text-on-primary whitespace-nowrap shadow-sm" type="button">
        All Categories
      </button>
<button className="px-space-md py-1.5 rounded-full font-caption text-caption font-semibold bg-chip-unselected-bg text-text-secondary hover:bg-surface-container whitespace-nowrap transition-colors" type="button">
        Computer Science (312)
      </button>
<button className="px-space-md py-1.5 rounded-full font-caption text-caption font-semibold bg-chip-unselected-bg text-text-secondary hover:bg-surface-container whitespace-nowrap transition-colors" type="button">
        History &amp; Philosophy (184)
      </button>
<button className="px-space-md py-1.5 rounded-full font-caption text-caption font-semibold bg-chip-unselected-bg text-text-secondary hover:bg-surface-container whitespace-nowrap transition-colors" type="button">
        Mathematics (142)
      </button>
<button className="px-space-md py-1.5 rounded-full font-caption text-caption font-semibold bg-chip-unselected-bg text-text-secondary hover:bg-surface-container whitespace-nowrap transition-colors" type="button">
        Literature (280)
      </button>
<button className="px-space-md py-1.5 rounded-full font-caption text-caption font-semibold bg-chip-unselected-bg text-text-secondary hover:bg-surface-container whitespace-nowrap transition-colors" type="button">
        Natural Sciences (198)
      </button>
</div>
</div>
<div className="grid grid-cols-1 2xl:grid-cols-12 gap-space-lg items-start">
<div className="2xl:col-span-8 bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden flex flex-col">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low text-text-secondary font-caption text-caption uppercase tracking-wider">
<th className="py-3.5 px-space-md font-semibold">Title &amp; Edition</th>
<th className="py-3.5 px-space-sm font-semibold">Dewey / ISBN</th>
<th className="py-3.5 px-space-sm font-semibold">Academic Area</th>
<th className="py-3.5 px-space-sm font-semibold">Copies Breakdown</th>
<th className="py-3.5 px-space-sm font-semibold">Catalog Status</th>
<th className="py-3.5 px-space-md text-right font-semibold">Actions</th>
</tr>
</thead>
<tbody className="divide-y-0 text-small font-small">
<tr className="hover:bg-surface-container-low/60 transition-colors group cursor-pointer bg-soft-blue/20">
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-sm">
<img className="w-10 h-14 object-cover rounded-lg shadow-sm flex-shrink-0" data-alt="Cover of Structure and Interpretation of Computer Programs with MIT purple and gold minimalist academic binding in soft studio lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw4zxQ2JI6UPPFNHDrWT8AmfMXthk-1herKcNtq5-T6oHjKWdPu8Wqyzqp1cV436VZfZFd8iCCNm805Wy3aHf6f9mSExADn-VV9or_h5p-LOVew6KbBLS5599kGFBhsfUs2-KAuOmsNYZjrOUqzzt1f8smZTvbg10-XS-miA9WXK0pyW_vE3OBepf8ozWXmXeSLQQgGHdmVmSWpriqf-OrYKxXox30Lu3R1x3AyygWFkLEIFwzCZd3" />
<div className="flex flex-col min-w-0 max-w-xs">
<span className="font-bold text-text-primary truncate">Structure and Interpretation of Computer Programs</span>
<span className="font-caption text-caption text-text-secondary truncate">Harold Abelson, Gerald Jay Sussman · 2nd Ed.</span>
<span className="font-caption text-[11px] text-primary mt-0.5">ID: #BK-10492</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-sm">
<div className="flex flex-col">
<span className="font-semibold text-text-primary tracking-wide">005.1 ABE</span>
<span className="font-caption text-caption text-text-secondary tracking-tight">978-0262510875</span>
</div>
</td>
<td className="py-3.5 px-space-sm">
<span className="px-2.5 py-1 rounded-full bg-soft-blue text-primary font-caption text-caption font-semibold">
                  Computer Science
                </span>
</td>
<td className="py-3.5 px-space-sm">
<div className="flex flex-col gap-1 min-w-[130px]">
<div className="flex items-center justify-between font-caption text-caption">
<span className="font-bold text-text-primary">4 Total</span>
<span className="text-status-available font-semibold">2 Avail</span>
</div>
<div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex">
<div className="bg-status-available h-full" style={{ width: '50%' }}></div>
<div className="bg-primary h-full" style={{ width: '25%' }}></div>
<div className="bg-status-pending h-full" style={{ width: '25%' }}></div>
</div>
<span className="font-caption text-[10px] text-text-secondary">1 Borrowed · 1 Reserved</span>
</div>
</td>
<td className="py-3.5 px-space-sm">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-status-available/15 text-status-available font-caption text-caption font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
                  In Circulation
                </span>
</td>
<td className="py-3.5 px-space-md text-right">
<div className="flex items-center justify-end gap-1">
<button className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container hover:text-primary transition-colors" title="Quick Edit" type="button">
<span className="material-symbols-outlined text-[18px]">edit</span>
</button>
<button className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container hover:text-primary transition-colors" title="Physical Inventory" type="button">
<span className="material-symbols-outlined text-[18px]">qr_code_2</span>
</button>
<button className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container hover:text-text-primary transition-colors" title="More options" type="button">
<span className="material-symbols-outlined text-[18px]">more_vert</span>
</button>
</div>
</td>
</tr>
<tr className="hover:bg-surface-container-low/60 transition-colors group cursor-pointer bg-surface-container-lowest">
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-sm">
<img className="w-10 h-14 object-cover rounded-lg shadow-sm flex-shrink-0" data-alt="Cover of Clean Code book with blue aesthetic background minimalist academic library display soft lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYtXDi51wzx_1Z0L0KHQirg6jlOa16m0MnGvS3H4-EAXJXpXV8mLutmDpYRBRmZ-orEf3cfX3LuZO7UoYNr49EOL_s-p1lrcBww8GMBtIqXiQcrclMLngwCC0wJ_69yIiuUf7nyzdDfZYhIy8vRkCbNVkudIa5344-Ux0MoBT6rvU8vI3EU59scJdfR4HhukIXcsOuKFALG2KWKVWol-5Va34-2FdbPqpgCo2FCXe1SK4vBz5r9Qap" />
<div className="flex flex-col min-w-0 max-w-xs">
<span className="font-bold text-text-primary truncate">Clean Code: A Handbook of Agile Software Craftsmanship</span>
<span className="font-caption text-caption text-text-secondary truncate">Robert C. Martin · 1st Ed.</span>
<span className="font-caption text-[11px] text-primary mt-0.5">ID: #BK-10834</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-sm">
<div className="flex flex-col">
<span className="font-semibold text-text-primary tracking-wide">005.133 MAR</span>
<span className="font-caption text-caption text-text-secondary tracking-tight">978-0132350884</span>
</div>
</td>
<td className="py-3.5 px-space-sm">
<span className="px-2.5 py-1 rounded-full bg-soft-blue text-primary font-caption text-caption font-semibold">
                  Computer Science
                </span>
</td>
<td className="py-3.5 px-space-sm">
<div className="flex flex-col gap-1 min-w-[130px]">
<div className="flex items-center justify-between font-caption text-caption">
<span className="font-bold text-text-primary">6 Total</span>
<span className="text-status-available font-semibold">2 Avail</span>
</div>
<div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex">
<div className="bg-status-available h-full" style={{ width: '33.3%' }}></div>
<div className="bg-primary h-full" style={{ width: '50%' }}></div>
<div className="bg-status-pending h-full" style={{ width: '16.7%' }}></div>
</div>
<span className="font-caption text-[10px] text-text-secondary">3 Borrowed · 1 Reserved</span>
</div>
</td>
<td className="py-3.5 px-space-sm">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-status-available/15 text-status-available font-caption text-caption font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
                  In Circulation
                </span>
</td>
<td className="py-3.5 px-space-md text-right">
<div className="flex items-center justify-end gap-1">
<button className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container hover:text-primary transition-colors" title="Quick Edit" type="button">
<span className="material-symbols-outlined text-[18px]">edit</span>
</button>
<button className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container hover:text-primary transition-colors" title="Physical Inventory" type="button">
<span className="material-symbols-outlined text-[18px]">qr_code_2</span>
</button>
<button className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container hover:text-text-primary transition-colors" title="More options" type="button">
<span className="material-symbols-outlined text-[18px]">more_vert</span>
</button>
</div>
</td>
</tr>
<tr className="hover:bg-surface-container-low/60 transition-colors group cursor-pointer bg-surface-container-lowest">
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-sm">
<img className="w-10 h-14 object-cover rounded-lg shadow-sm flex-shrink-0" data-alt="Cover of Meditations by Marcus Aurelius vintage classical philosophical scholarly edition soft lighting deep blue accents" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAayganp4NAFnN83P6pU1J8xLi_ZYoSqLwPGXJintesMDjUpBd35DIdMmmdF4jC0nxuoVirY1VREhCBZI0R1v80dTOyoTP8F9F2jzvmdAq8Pnfqu7UNGaNxjGTu2QWcIoECU_3duMIsdv90dXkwDT12mr4RUHSzSUCEclMy51O5sqgy8S_2uFPwNwqRVGVrGXJYxhUpk0wsBVdbdTV4YW_r_8A0Aa1MqGszWxXwYC3P9ToDmlTF5n8m" />
<div className="flex flex-col min-w-0 max-w-xs">
<span className="font-bold text-text-primary truncate">Meditations: A New Translation</span>
<span className="font-caption text-caption text-text-secondary truncate">Marcus Aurelius, Gregory Hays · Modern Library</span>
<span className="font-caption text-[11px] text-primary mt-0.5">ID: #BK-09210</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-sm">
<div className="flex flex-col">
<span className="font-semibold text-text-primary tracking-wide">188.092 AUR</span>
<span className="font-caption text-caption text-text-secondary tracking-tight">978-0812968255</span>
</div>
</td>
<td className="py-3.5 px-space-sm">
<span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-caption text-caption font-semibold">
                  Philosophy
                </span>
</td>
<td className="py-3.5 px-space-sm">
<div className="flex flex-col gap-1 min-w-[130px]">
<div className="flex items-center justify-between font-caption text-caption">
<span className="font-bold text-text-primary">3 Total</span>
<span className="text-status-danger font-semibold">0 Avail</span>
</div>
<div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex">
<div className="bg-primary h-full" style={{ width: '100%' }}></div>
</div>
<span className="font-caption text-[10px] text-text-secondary">3 Borrowed · 0 Reserved</span>
</div>
</td>
<td className="py-3.5 px-space-sm">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-status-pending/20 text-status-pending font-caption text-caption font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-status-pending"></span>
                  Restricted Reserve
                </span>
</td>
<td className="py-3.5 px-space-md text-right">
<div className="flex items-center justify-end gap-1">
<button className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container hover:text-primary transition-colors" title="Quick Edit" type="button">
<span className="material-symbols-outlined text-[18px]">edit</span>
</button>
<button className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container hover:text-primary transition-colors" title="Physical Inventory" type="button">
<span className="material-symbols-outlined text-[18px]">qr_code_2</span>
</button>
<button className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container hover:text-text-primary transition-colors" title="More options" type="button">
<span className="material-symbols-outlined text-[18px]">more_vert</span>
</button>
</div>
</td>
</tr>
<tr className="hover:bg-surface-container-low/60 transition-colors group cursor-pointer bg-surface-container-lowest">
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-sm">
<img className="w-10 h-14 object-cover rounded-lg shadow-sm flex-shrink-0" data-alt="Calculus Early Transcendentals university textbook cover in modern academic turquoise blue design studio crisp lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQaidXR4faEIoVOcYYyiEIVX5NwVmxm0NYlS3Bhz3Ju-lMTlibjROyMpWUKsK4Wacab1tuRr9d1KEWr78ycYdcv8l6Rk7dJ6vtG7nBSjHf8df5Q2u123IHzh8RxmWfW5HfppSAwqX9tIE5bmHPmiUs2eGFG7fR2ZC9K63n4iIeLapAK2e6qxIreC6LMJGesZWPq6RyhElUzQllZOZMtmGEDUnHCnzZXMGWe5eqTOyJekY7Yz5OMoFK" />
<div className="flex flex-col min-w-0 max-w-xs">
<span className="font-bold text-text-primary truncate">Calculus: Early Transcendentals</span>
<span className="font-caption text-caption text-text-secondary truncate">James Stewart · 8th Ed.</span>
<span className="font-caption text-[11px] text-primary mt-0.5">ID: #BK-11005</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-sm">
<div className="flex flex-col">
<span className="font-semibold text-text-primary tracking-wide">515.15 STE</span>
<span className="font-caption text-caption text-text-secondary tracking-tight">978-1285741550</span>
</div>
</td>
<td className="py-3.5 px-space-sm">
<span className="px-2.5 py-1 rounded-full bg-soft-blue text-primary font-caption text-caption font-semibold">
                  Mathematics
                </span>
</td>
<td className="py-3.5 px-space-sm">
<div className="flex flex-col gap-1 min-w-[130px]">
<div className="flex items-center justify-between font-caption text-caption">
<span className="font-bold text-text-primary">8 Total</span>
<span className="text-status-available font-semibold">6 Avail</span>
</div>
<div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex">
<div className="bg-status-available h-full" style={{ width: '75%' }}></div>
<div className="bg-primary h-full" style={{ width: '25%' }}></div>
</div>
<span className="font-caption text-[10px] text-text-secondary">2 Borrowed · 0 Reserved</span>
</div>
</td>
<td className="py-3.5 px-space-sm">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-status-available/15 text-status-available font-caption text-caption font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
                  In Circulation
                </span>
</td>
<td className="py-3.5 px-space-md text-right">
<div className="flex items-center justify-end gap-1">
<button className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container hover:text-primary transition-colors" title="Quick Edit" type="button">
<span className="material-symbols-outlined text-[18px]">edit</span>
</button>
<button className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container hover:text-primary transition-colors" title="Physical Inventory" type="button">
<span className="material-symbols-outlined text-[18px]">qr_code_2</span>
</button>
<button className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container hover:text-text-primary transition-colors" title="More options" type="button">
<span className="material-symbols-outlined text-[18px]">more_vert</span>
</button>
</div>
</td>
</tr>
<tr className="hover:bg-surface-container-low/60 transition-colors group cursor-pointer bg-surface-container-lowest">
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-sm">
<img className="w-10 h-14 object-cover rounded-lg shadow-sm flex-shrink-0" data-alt="Cover of The Republic by Plato academic classical translation in blue tone clean book composition" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAS3xoL-L4_hUOUsl5FEtUb5e-se7MtJBM6FLGSBzMyKX8Nv9XsEyx57n-QNUvkyjrkN1YSBHeS-1X53uABgmNKAYCCufOxKa3-mwAEjxS12ggdBoIMnba-5rkDgTU5ZiUn48p9Pi_9wyvxuHpkyGKy8fKVGb_XMkUty1EDvO2ysa5igXggZjvRLDnTt9s7NQahFqJ2PzMYXgPGtKPs2yow6mcHhLtotlbMVAtLjZmwcf6sRsqHX1aA" />
<div className="flex flex-col min-w-0 max-w-xs">
<span className="font-bold text-text-primary truncate">The Republic</span>
<span className="font-caption text-caption text-text-secondary truncate">Plato, Allan Bloom · 2nd Ed.</span>
<span className="font-caption text-[11px] text-primary mt-0.5">ID: #BK-08499</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-sm">
<div className="flex flex-col">
<span className="font-semibold text-text-primary tracking-wide">321.07 PLA</span>
<span className="font-caption text-caption text-text-secondary tracking-tight">978-0465069347</span>
</div>
</td>
<td className="py-3.5 px-space-sm">
<span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-caption text-caption font-semibold">
                  Philosophy
                </span>
</td>
<td className="py-3.5 px-space-sm">
<div className="flex flex-col gap-1 min-w-[130px]">
<div className="flex items-center justify-between font-caption text-caption">
<span className="font-bold text-text-primary">2 Total</span>
<span className="text-text-secondary font-semibold">0 Avail</span>
</div>
<div className="w-full bg-surface-container h-2 rounded-full overflow-hidden flex">
<div className="bg-outline h-full" style={{ width: '100%' }}></div>
</div>
<span className="font-caption text-[10px] text-text-secondary">0 Borrowed · Archived</span>
</div>
</td>
<td className="py-3.5 px-space-sm">
<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-text-secondary font-caption text-caption font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                  Archived
                </span>
</td>
<td className="py-3.5 px-space-md text-right">
<div className="flex items-center justify-end gap-1">
<button className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container hover:text-primary transition-colors" title="Quick Edit" type="button">
<span className="material-symbols-outlined text-[18px]">edit</span>
</button>
<button className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container hover:text-primary transition-colors" title="Physical Inventory" type="button">
<span className="material-symbols-outlined text-[18px]">qr_code_2</span>
</button>
<button className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container hover:text-text-primary transition-colors" title="More options" type="button">
<span className="material-symbols-outlined text-[18px]">more_vert</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
<div className="flex flex-col sm:flex-row items-center justify-between p-space-md bg-surface-container-low/40 gap-space-sm">
<span className="font-caption text-caption text-text-secondary">
          Showing <span className="font-bold text-text-primary">1–5</span> of <span className="font-bold text-text-primary">1,248</span> titles across <span className="font-bold text-text-primary">42</span> departments
        </span>
<div className="flex items-center gap-1">
<button className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-container transition-colors disabled={true}:opacity-40" disabled={true} type="button">
<span className="material-symbols-outlined text-[18px]">chevron_left</span>
</button>
<button className="w-8 h-8 rounded-lg flex items-center justify-center font-caption text-caption font-bold bg-primary text-on-primary shadow-sm" type="button">1</button>
<button className="w-8 h-8 rounded-lg flex items-center justify-center font-caption text-caption text-text-secondary hover:bg-surface-container transition-colors" type="button">2</button>
<button className="w-8 h-8 rounded-lg flex items-center justify-center font-caption text-caption text-text-secondary hover:bg-surface-container transition-colors" type="button">3</button>
<span className="font-caption text-caption px-1 text-text-secondary">...</span>
<button className="w-8 h-8 rounded-lg flex items-center justify-center font-caption text-caption text-text-secondary hover:bg-surface-container transition-colors" type="button">156</button>
<button className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-surface-container transition-colors" type="button">
<span className="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
</div>
</div>
</div>
<div className="2xl:col-span-4 bg-surface-container-lowest rounded-2xl shadow-sm p-space-lg flex flex-col gap-space-md">
<div className="flex items-center justify-between pb-space-sm">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-[20px]">visibility</span>
<span className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">Quick Inspector</span>
</div>
<span className="font-caption text-caption bg-status-available/15 text-status-available px-2.5 py-0.5 rounded-full font-bold">Cataloged</span>
</div>
<div className="flex gap-space-md items-start">
<img className="w-24 h-32 object-cover rounded-xl shadow-md flex-shrink-0" data-alt="Front view of the academic textbook Structure and Interpretation of Computer Programs in clean university book preservation format" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXhlUlhql0ED-KzA0MRigtgyuS4d6GiBol9Mhs6bNLLsaot4qrA4egXouWiF97AvRX1Cqsx3J3ConZyDDMLJNrnQ79IT9NYcaOuxX7ibnmBrUEEn9geMjT5nSVrazDewrkePHS8bjjzlpFBXgNrQ2y3pAKFynxTl7AAkbT3mUQlLeasTBB46UAevDav3yLhkwvGtpkjWzAWiYpd7wZCE1FCyS7aVzzp1U_3dG5aDQkjQb2RwvOXPBi" />
<div className="flex flex-col">
<h3 className="font-headline-4 text-headline-4 font-bold text-text-primary leading-tight">
            Structure and Interpretation of Computer Programs
          </h3>
<span className="font-small text-small text-text-secondary mt-1">Harold Abelson, Gerald Jay Sussman</span>
<div className="flex items-center gap-2 mt-2">
<span className="px-2 py-0.5 rounded bg-soft-blue text-primary font-caption text-caption font-semibold">1996</span>
<span className="font-caption text-caption text-text-secondary">MIT Press · 2nd Ed.</span>
</div>
</div>
</div>
<div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-2">
<span className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">Bibliographic Codes</span>
<div className="grid grid-cols-2 gap-2 text-caption font-caption">
<div>
<span className="text-text-secondary block">Call Number:</span>
<span className="font-bold text-text-primary">005.1 ABE 1996</span>
</div>
<div>
<span className="text-text-secondary block">ISBN-13:</span>
<span className="font-bold text-text-primary">978-0262510875</span>
</div>
<div>
<span className="text-text-secondary block">LCCN:</span>
<span className="font-bold text-text-primary">96-017753</span>
</div>
<div>
<span className="text-text-secondary block">Language:</span>
<span className="font-bold text-text-primary">English (US)</span>
</div>
</div>
</div>
<div className="flex flex-col gap-space-xs">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary">Copy Health Summary (4 Registered)</span>
<button className="font-caption text-caption text-primary hover:underline font-semibold" type="button">+ Add Copy</button>
</div>
<div className="flex flex-col gap-2">
<div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low text-small font-small">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[18px] text-status-available">check_circle</span>
<div className="flex flex-col">
<span className="font-semibold text-text-primary">Copy #CP-01 · Barcode 88401</span>
<span className="font-caption text-caption text-text-secondary">Bay 14 · Shelf 3B (Open Stacks)</span>
</div>
</div>
<span className="font-caption text-caption px-2 py-0.5 rounded bg-status-available/15 text-status-available font-bold">On Shelf</span>
</div>
<div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low text-small font-small">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[18px] text-status-available">check_circle</span>
<div className="flex flex-col">
<span className="font-semibold text-text-primary">Copy #CP-02 · Barcode 88402</span>
<span className="font-caption text-caption text-text-secondary">Bay 14 · Shelf 3B (Open Stacks)</span>
</div>
</div>
<span className="font-caption text-caption px-2 py-0.5 rounded bg-status-available/15 text-status-available font-bold">On Shelf</span>
</div>
<div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low text-small font-small">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[18px] text-status-pending">pending_actions</span>
<div className="flex flex-col">
<span className="font-semibold text-text-primary">Copy #CP-03 · Barcode 88403</span>
<span className="font-caption text-caption text-text-secondary">Locker C-02 (Ready for Hold)</span>
</div>
</div>
<span className="font-caption text-caption px-2 py-0.5 rounded bg-status-pending/20 text-status-pending font-bold">Reserved</span>
</div>
<div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low text-small font-small">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-[18px] text-primary">person</span>
<div className="flex flex-col">
<span className="font-semibold text-text-primary">Copy #CP-04 · Barcode 88404</span>
<span className="font-caption text-caption text-text-secondary">Patron: Marcus Aurelius (Due May 18)</span>
</div>
</div>
<span className="font-caption text-caption px-2 py-0.5 rounded bg-soft-blue text-primary font-bold">Loaned</span>
</div>
</div>
</div>
<div className="grid grid-cols-2 gap-space-sm pt-space-xs">
<button className="h-10 px-space-sm rounded-xl bg-soft-blue hover:bg-secondary-fixed text-primary font-small text-small font-bold transition-colors flex items-center justify-center gap-1" type="button">
<span className="material-symbols-outlined text-[18px]">edit_note</span>
          Edit Classification
        </button>
<button className="h-10 px-space-sm rounded-xl bg-primary hover:bg-primary-container text-on-primary font-small text-small font-bold transition-colors flex items-center justify-center gap-1 shadow-sm" type="button">
<span className="material-symbols-outlined text-[18px]">inventory</span>
          Manage Copies
        </button>
</div>
<div className="flex items-center justify-between pt-2">
<button className="font-caption text-caption text-status-danger hover:underline flex items-center gap-1 font-semibold" type="button">
<span className="material-symbols-outlined text-[16px]">archive</span>
          Archive Record
        </button>
<button className="font-caption text-caption text-text-secondary hover:text-text-primary flex items-center gap-1 font-medium" type="button">
<span className="material-symbols-outlined text-[16px]">history</span>
          Audit History
        </button>
</div>
</div>
</div>
</div>
    </div>
  );
};

export default BooksManager;
