// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// UserManagement.tsx -- Admin User Directory and Patron Accounts
// Converted directly from SiderbarUserManagementPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const UserManagement: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
function toggleDrawer(open) {
      const backdrop = document.getElementById('drawer-backdrop');
      const panel = document.getElementById('drawer-panel');
      if (open) {
        backdrop.classList.remove('pointer-events-none', 'opacity-0');
        backdrop.classList.add('opacity-100');
        panel.classList.remove('translate-x-full');
        panel.classList.add('translate-x-0');
      } else {
        backdrop.classList.add('pointer-events-none', 'opacity-0');
        backdrop.classList.remove('opacity-100');
        panel.classList.add('translate-x-full');
        panel.classList.remove('translate-x-0');
      }
    }

    document.getElementById('open-new-user-btn')?.addEventListener('click', function() {
      toggleDrawer(true);
    });
try { w.toggleDrawer = toggleDrawer; } catch (_) {}
    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
<div className="flex flex-col gap-space-lg w-full">
{/* Top Metadata & Header Title */}
<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-space-xs font-caption text-caption text-text-secondary uppercase tracking-widest">
<span className="">Admin Console</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="">Management</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="text-primary font-semibold">Users</span>
</div>
<h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight font-bold">User Account Directory &amp; Governance</h1>
<p className="font-body text-body text-text-secondary max-w-2xl">
          Manage patron credentials, institutional affiliation, circulation clearances, and role authorizations across the academic repository.
        </p>
</div>
{/* Quick Operational Metrics Strip */}
<div className="flex items-center gap-space-sm bg-surface-container-lowest p-1.5 rounded-xl shadow-sm self-start lg:self-auto">
<div className="px-space-md py-1.5 flex flex-col items-center">
<span className="font-caption text-caption text-text-secondary">Active Patrons</span>
<span className="font-headline-4 text-headline-4 text-primary font-bold">3,280</span>
</div>
<div className="w-px h-8 bg-surface-container"></div>
<div className="px-space-md py-1.5 flex flex-col items-center">
<span className="font-caption text-caption text-text-secondary">On-Hold / Fines</span>
<span className="font-headline-4 text-headline-4 text-status-danger font-bold">45</span>
</div>
<div className="w-px h-8 bg-surface-container"></div>
<div className="px-space-md py-1.5 flex flex-col items-center">
<span className="font-caption text-caption text-text-secondary">Staff Desks</span>
<span className="font-headline-4 text-headline-4 text-secondary font-bold">40</span>
</div>
</div>
</div>
{/* Search, Filters, and Bulk Action Controls */}
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col gap-space-md">
<div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-space-md">
{/* Search Pill */}
<div className="relative flex-1 max-w-xl">
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-[20px]">search</span>
<input className="w-full bg-surface-container-low pl-11 pr-space-md py-2.5 rounded-full font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/30 transition-all shadow-inner" placeholder="Search patron by full name, KP-ID (#KP-77401), email, or RFID barcode..." type="text" />
<span className="absolute right-3 top-1/2 -translate-y-1/2 font-caption text-[11px] bg-surface-container px-2 py-0.5 rounded text-text-secondary tracking-wide">⌘K</span>
</div>
{/* Right Trigger Buttons */}
<div className="flex items-center gap-space-sm self-end xl:self-auto">
<button className="flex items-center gap-space-xs px-space-md py-2.5 rounded-full bg-surface-container-low hover:bg-surface-container text-text-primary font-small text-small font-semibold transition-all" type="button">
<span className="material-symbols-outlined text-[18px] text-text-secondary">file_download</span>
<span className="">Export CSV / Excel</span>
</button>
<button className="flex items-center gap-space-xs px-space-lg py-2.5 rounded-full bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-bold transition-all shadow-sm" id="open-new-user-btn" type="button">
<span className="material-symbols-outlined text-[18px]">person_add</span>
<span className="">+ Add User</span>
</button>
</div>
</div>
{/* Segmented Category Filters */}
<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-sm pt-space-xs">
<div className="flex flex-wrap items-center gap-space-xs">
<span className="font-caption text-caption text-text-secondary mr-2 uppercase tracking-wider">Role Scope:</span>
<button className="px-3.5 py-1.5 rounded-full font-caption text-caption font-semibold bg-primary text-on-primary shadow-sm transition-colors" type="button">
            All (3,420)
          </button>
<button className="px-3.5 py-1.5 rounded-full font-caption text-caption font-medium bg-chip-unselected-bg text-text-secondary hover:bg-surface-container hover:text-text-primary transition-colors" type="button">
            Customers / Patrons (3,380)
          </button>
<button className="px-3.5 py-1.5 rounded-full font-caption text-caption font-medium bg-chip-unselected-bg text-text-secondary hover:bg-surface-container hover:text-text-primary transition-colors" type="button">
            Cashiers (24)
          </button>
<button className="px-3.5 py-1.5 rounded-full font-caption text-caption font-medium bg-chip-unselected-bg text-text-secondary hover:bg-surface-container hover:text-text-primary transition-colors" type="button">
            Administrators (16)
          </button>
</div>
<div className="flex flex-wrap items-center gap-space-xs">
<span className="font-caption text-caption text-text-secondary mr-2 uppercase tracking-wider">Account State:</span>
<button className="px-3 py-1 rounded-full font-caption text-caption font-semibold bg-soft-blue text-primary" type="button">
            Active (3,280)
          </button>
<button className="px-3 py-1 rounded-full font-caption text-caption font-medium bg-surface-container-low text-text-secondary hover:text-text-primary" type="button">
            Inactive (95)
          </button>
<button className="px-3 py-1 rounded-full font-caption text-caption font-medium bg-surface-container-low text-status-danger hover:bg-error-container" type="button">
            Suspended / Hold (45)
          </button>
</div>
</div>
</div>
{/* Data Table & Layout Area */}
<div className="relative w-full bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
<div className="overflow-x-auto">
<table className="w-full text-left border-collapse">
<thead>
<tr className="bg-surface-container-low text-text-secondary font-caption text-caption uppercase tracking-wider">
<th className="py-3.5 px-space-md font-semibold">User ID</th>
<th className="py-3.5 px-space-md font-semibold">Patron / User Details</th>
<th className="py-3.5 px-space-md font-semibold">Institutional Role</th>
<th className="py-3.5 px-space-md font-semibold">Account Status</th>
<th className="py-3.5 px-space-md font-semibold">Registration &amp; Login</th>
<th className="py-3.5 px-space-md font-semibold">Active Circulation</th>
<th className="py-3.5 px-space-md font-semibold text-right">Actions</th>
</tr>
</thead>
<tbody className="divide-y-0">
{/* Row 1: Sofia Morales (Focus Item) */}
<tr className="bg-soft-blue/30 hover:bg-soft-blue/50 transition-colors group cursor-pointer" onClick={(e) => { (window as any).toggleDrawer?.(true); }}>
<td className="py-3.5 px-space-md font-small text-small font-bold text-primary">
                #KP-77401
              </td>
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-sm">
<img className="w-9 h-9 rounded-full object-cover shadow-sm" data-alt="A clean, natural photographic portrait of Sofia Morales, an academic Filipina student with glasses and hair tied back, wearing a neat university collared shirt in warm natural library lighting with soft bokeh background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1xp1xbV7PvMd-4u431pvisRoSQqgcNI_2LD4BKKJenSt3S4TXi_FtWeXBwImNk8xPjpNVRmqRAfRabD7iGGxCTBCtPqa7xLzIUJVJXYPG1JmF12Y5DuJlIZhxwF2puWsjNT8n_qQ81NJRcEkRl3ISx2hjUxCITTySKn3x8Iou6qaOkI558bS3vaCxqLuaEz6Ux4_SthnbFQjZTVSKD7P2BJbh5wIb6n7BQqr3Dbu3bbo7kKpOi-BH" />
<div className="flex flex-col min-w-0">
<span className="font-small text-small font-semibold text-text-primary group-hover:text-primary transition-colors truncate">Sofia Morales</span>
<span className="font-caption text-caption text-text-secondary truncate">s.morales@upk.edu.ph</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-caption text-caption font-semibold bg-secondary-container text-on-secondary-container">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Customer (Undergrad)
                </span>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-caption text-caption font-semibold bg-status-available/15 text-status-available">
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
                  Active
                </span>
</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col">
<span className="font-small text-small text-text-primary">Aug 14, 2022</span>
<span className="font-caption text-caption text-text-secondary">Today, 09:22 AM</span>
</div>
</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-2">
<span className="font-caption text-caption text-text-secondary">Loans: <strong className="text-text-primary">2/4</strong></span>
<span className="font-caption text-caption text-text-secondary">Holds: <strong className="text-text-primary">1</strong></span>
</div>
<span className="font-caption text-[11px] font-semibold text-status-available">Fines: ₱0.00 clear</span>
</div>
</td>
<td className="py-3.5 px-space-md text-right" onClick={() => { try { ; } catch (err) { console.error(err); } }}>
<div className="flex items-center justify-end gap-1">
<button className="p-1.5 rounded-lg text-primary hover:bg-surface-container transition-colors" onClick={(e) => { (window as any).toggleDrawer?.(true); }} title="Inspect Profile" type="button">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container transition-colors" title="Edit Credentials" type="button">
<span className="material-symbols-outlined text-[18px]">edit_square</span>
</button>
<button className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container transition-colors" title="More options" type="button">
<span className="material-symbols-outlined text-[18px]">more_vert</span>
</button>
</div>
</td>
</tr>
{/* Row 2: Dr. Leandro Santos */}
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="py-3.5 px-space-md font-small text-small font-bold text-text-secondary">
                #KP-10294
              </td>
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-sm">
<img className="w-9 h-9 rounded-full object-cover shadow-sm" data-alt="Distinguished university professor portrait, middle-aged Filipino scholar with salt-and-pepper hair in a dark blue linen academic blazer, neutral academic bookstore setting with warm lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_xpduNAxwlpU8pLZZZuZhiovo2-d0eTyS95uGUYpQmIBRsbyjh5zPSBH6Yx6Do5yRCKlg7-TpRTRyl1ZAqZM2Wio-93suN9hfr0mqZ8TOmpko45DkyfuY1BDpNAjXbhveefsSalRw3JLkubCp8EWLKuR0wliNHSH06sI8q1HhsGLlWc9hnGmUucLOa7dpJpp-Knnq5H7zSmJJOqQZN1ck9HSAwwCkN4E7t1Kuy5aCHbfFRMVHkma3" />
<div className="flex flex-col min-w-0">
<span className="font-small text-small font-semibold text-text-primary group-hover:text-primary transition-colors truncate">Dr. Leandro Santos</span>
<span className="font-caption text-caption text-text-secondary truncate">l.santos@dept.upk.edu.ph</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-caption text-caption font-semibold bg-surface-container text-text-primary">
<span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  Faculty Scholar
                </span>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-caption text-caption font-semibold bg-status-available/15 text-status-available">
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
                  Active
                </span>
</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col">
<span className="font-small text-small text-text-primary">Sep 01, 2018</span>
<span className="font-caption text-caption text-text-secondary">Yesterday, 04:15 PM</span>
</div>
</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-2">
<span className="font-caption text-caption text-text-secondary">Loans: <strong className="text-text-primary">6/10</strong></span>
<span className="font-caption text-caption text-text-secondary">Holds: <strong className="text-text-primary">0</strong></span>
</div>
<span className="font-caption text-[11px] font-semibold text-status-available">Fines: ₱0.00 clear</span>
</div>
</td>
<td className="py-3.5 px-space-md text-right">
<div className="flex items-center justify-end gap-1">
<button className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-surface-container transition-colors" title="Inspect Profile" type="button">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container transition-colors" title="Edit Credentials" type="button">
<span className="material-symbols-outlined text-[18px]">edit_square</span>
</button>
<button className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container transition-colors" title="More options" type="button">
<span className="material-symbols-outlined text-[18px]">more_vert</span>
</button>
</div>
</td>
</tr>
{/* Row 3: Marco Valencia (Suspended with Fine) */}
<tr className="bg-error-container/20 hover:bg-error-container/30 transition-colors group">
<td className="py-3.5 px-space-md font-small text-small font-bold text-status-danger">
                #KP-88219
              </td>
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-sm">
<div className="w-9 h-9 rounded-full bg-status-danger/20 text-status-danger flex items-center justify-center font-bold text-small">
                    MV
                  </div>
<div className="flex flex-col min-w-0">
<span className="font-small text-small font-semibold text-text-primary group-hover:text-status-danger transition-colors truncate">Marco Valencia</span>
<span className="font-caption text-caption text-text-secondary truncate">m.valencia@upk.edu.ph</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-caption text-caption font-semibold bg-surface-container text-text-primary">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Customer (Undergrad)
                </span>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-caption text-caption font-semibold bg-error-container text-on-error-container">
<span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                  Suspended / Fine Hold
                </span>
</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col">
<span className="font-small text-small text-text-primary">Nov 11, 2023</span>
<span className="font-caption text-caption text-text-secondary">12 days ago</span>
</div>
</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col gap-1">
<div className="flex items-center gap-2">
<span className="font-caption text-caption text-text-secondary">Loans: <strong className="text-status-danger font-bold">1/4 (Overdue)</strong></span>
</div>
<span className="font-caption text-[11px] font-bold text-status-danger">Fines: ₱340.00 Overdue</span>
</div>
</td>
<td className="py-3.5 px-space-md text-right">
<div className="flex items-center justify-end gap-1">
<button className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-surface-container transition-colors" title="Inspect Profile" type="button">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1.5 rounded-lg text-status-danger hover:bg-error-container transition-colors" title="Clear Fines &amp; Reactivate" type="button">
<span className="material-symbols-outlined text-[18px]">lock_reset</span>
</button>
<button className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container transition-colors" title="More options" type="button">
<span className="material-symbols-outlined text-[18px]">more_vert</span>
</button>
</div>
</td>
</tr>
{/* Row 4: Rowena Tan (Cashier) */}
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="py-3.5 px-space-md font-small text-small font-bold text-text-secondary">
                #KP-00442
              </td>
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-sm">
<img className="w-9 h-9 rounded-full object-cover shadow-sm" data-alt="Young professional Filipina staff member in clean corporate blue library vest, smiling warmly at university circulation desk with modern barcode scanner equipment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4SoVGR6Rt9c6IcnqTWYXTSZv_B9ER2BakTvgQ1CdMlgB16IVHVvJBjdwtyJgZYeQ8AavcijWwu0VR6B08e7HFeyQnnBXaNuVkTQRQuaPAEwegLOMgrLYQHiiljnIh47KQ01pBGK3nZKjDrHu3WBFt7YrpBWqWIffoVl4wqtoFTC53bf3IN39LdrB7aIGWSnJXSV3_pzdDeu9anNHlbPgUjXpDdG4588Yx-sIpD-sTwF_zLTQNpoAv" />
<div className="flex flex-col min-w-0">
<span className="font-small text-small font-semibold text-text-primary group-hover:text-primary transition-colors truncate">Rowena Tan</span>
<span className="font-caption text-caption text-text-secondary truncate">rtan.staff@upk.edu.ph</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-caption text-caption font-semibold bg-tertiary-fixed text-on-tertiary-fixed-variant">
<span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                  Cashier Desk 01
                </span>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-caption text-caption font-semibold bg-status-available/15 text-status-available">
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
                  Active
                </span>
</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col">
<span className="font-small text-small text-text-primary">Jan 10, 2021</span>
<span className="font-caption text-caption text-text-secondary">Active Now</span>
</div>
</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col gap-1">
<span className="font-caption text-caption text-text-secondary">Shift: 08:00 - 17:00</span>
<span className="font-caption text-[11px] font-semibold text-primary">Terminal POS #3</span>
</div>
</td>
<td className="py-3.5 px-space-md text-right">
<div className="flex items-center justify-end gap-1">
<button className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-surface-container transition-colors" title="Inspect Profile" type="button">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container transition-colors" title="Edit Credentials" type="button">
<span className="material-symbols-outlined text-[18px]">edit_square</span>
</button>
<button className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container transition-colors" title="More options" type="button">
<span className="material-symbols-outlined text-[18px]">more_vert</span>
</button>
</div>
</td>
</tr>
{/* Row 5: Alyssa Gomez (Pending Verification) */}
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="py-3.5 px-space-md font-small text-small font-bold text-text-secondary">
                #KP-77983
              </td>
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-sm">
<div className="w-9 h-9 rounded-full bg-status-pending/20 text-status-pending flex items-center justify-center font-bold text-small">
                    AG
                  </div>
<div className="flex flex-col min-w-0">
<span className="font-small text-small font-semibold text-text-primary group-hover:text-primary transition-colors truncate">Alyssa Gomez</span>
<span className="font-caption text-caption text-text-secondary truncate">a.gomez.new@upk.edu.ph</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-caption text-caption font-semibold bg-surface-container text-text-primary">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Customer (Freshman)
                </span>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-caption text-caption font-semibold bg-status-pending/20 text-status-pending">
<span className="w-1.5 h-1.5 rounded-full bg-status-pending"></span>
                  Pending Verification
                </span>
</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col">
<span className="font-small text-small text-text-primary">Oct 24, 2024</span>
<span className="font-caption text-caption text-text-secondary">Never logged in</span>
</div>
</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col gap-1">
<span className="font-caption text-caption text-text-secondary">Loans: 0/4</span>
<span className="font-caption text-[11px] text-text-secondary">Awaiting ID badge scan</span>
</div>
</td>
<td className="py-3.5 px-space-md text-right">
<div className="flex items-center justify-end gap-1">
<button className="px-2.5 py-1 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-on-primary font-caption text-caption font-semibold transition-colors" type="button">
                    Approve
                  </button>
<button className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container transition-colors" title="More options" type="button">
<span className="material-symbols-outlined text-[18px]">more_vert</span>
</button>
</div>
</td>
</tr>
{/* Row 6: Gabriel Reyes (Admin Supervisor) */}
<tr className="hover:bg-surface-container-low transition-colors group">
<td className="py-3.5 px-space-md font-small text-small font-bold text-text-secondary">
                #KP-00018
              </td>
<td className="py-3.5 px-space-md">
<div className="flex items-center gap-space-sm">
<div className="w-9 h-9 rounded-full bg-primary-container text-on-primary font-bold text-small flex items-center justify-center">
                    GR
                  </div>
<div className="flex flex-col min-w-0">
<span className="font-small text-small font-semibold text-text-primary group-hover:text-primary transition-colors truncate">Gabriel Reyes</span>
<span className="font-caption text-caption text-text-secondary truncate">g.reyes.admin@upk.edu.ph</span>
</div>
</div>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-caption text-caption font-semibold bg-primary-fixed text-on-primary-fixed-variant">
<span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Admin Supervisor
                </span>
</td>
<td className="py-3.5 px-space-md">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-caption text-caption font-semibold bg-status-available/15 text-status-available">
<span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
                  Active
                </span>
</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col">
<span className="font-small text-small text-text-primary">Feb 01, 2019</span>
<span className="font-caption text-caption text-text-secondary">2 hours ago</span>
</div>
</td>
<td className="py-3.5 px-space-md">
<div className="flex flex-col gap-1">
<span className="font-caption text-caption text-text-secondary">Access: Level 4 Super</span>
<span className="font-caption text-[11px] font-semibold text-status-available">2FA Secured</span>
</div>
</td>
<td className="py-3.5 px-space-md text-right">
<div className="flex items-center justify-end gap-1">
<button className="p-1.5 rounded-lg text-text-secondary hover:text-primary hover:bg-surface-container transition-colors" title="Inspect Profile" type="button">
<span className="material-symbols-outlined text-[18px]">visibility</span>
</button>
<button className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container transition-colors" title="Edit Credentials" type="button">
<span className="material-symbols-outlined text-[18px]">edit_square</span>
</button>
<button className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-container transition-colors" title="More options" type="button">
<span className="material-symbols-outlined text-[18px]">more_vert</span>
</button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
{/* Pagination & Density Control Footer */}
<div className="p-space-md bg-surface-container-lowest flex flex-col sm:flex-row items-center justify-between gap-space-md">
<div className="flex items-center gap-space-md">
<span className="font-small text-small text-text-secondary">
            Showing <strong className="text-text-primary">1–10</strong> of <strong className="text-text-primary">3,420</strong> registered accounts
          </span>
<div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption">
<span className="">Rows:</span>
<select className="bg-surface-container-low py-1 px-2 rounded-lg font-small text-small text-text-primary focus:outline-none">
<option>10</option>
<option>25</option>
<option>50</option>
<option>100</option>
</select>
</div>
</div>
<div className="flex items-center gap-space-xs">
<button className="p-1.5 rounded-lg text-outline-variant cursor-not-allowed" disabled={true} type="button">
<span className="material-symbols-outlined text-[20px]">keyboard_double_arrow_left</span>
</button>
<button className="p-1.5 rounded-lg text-outline-variant cursor-not-allowed" disabled={true} type="button">
<span className="material-symbols-outlined text-[20px]">chevron_left</span>
</button>
<button className="w-8 h-8 rounded-lg bg-primary text-on-primary font-caption text-caption font-bold flex items-center justify-center shadow-sm" type="button">
            1
          </button>
<button className="w-8 h-8 rounded-lg text-text-secondary hover:bg-surface-container font-caption text-caption font-medium flex items-center justify-center transition-colors" type="button">
            2
          </button>
<button className="w-8 h-8 rounded-lg text-text-secondary hover:bg-surface-container font-caption text-caption font-medium flex items-center justify-center transition-colors" type="button">
            3
          </button>
<span className="px-1 text-text-secondary font-caption text-caption">...</span>
<button className="w-8 h-8 rounded-lg text-text-secondary hover:bg-surface-container font-caption text-caption font-medium flex items-center justify-center transition-colors" type="button">
            342
          </button>
<button className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container transition-colors" type="button">
<span className="material-symbols-outlined text-[20px]">chevron_right</span>
</button>
<button className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-container transition-colors" type="button">
<span className="material-symbols-outlined text-[20px]">keyboard_double_arrow_right</span>
</button>
</div>
</div>
</div>
</div>
{/* Interactive Slide-Over Drawer: Patron Inspection (Sofia Morales) */}
<div className="fixed inset-0 bg-text-primary/30 backdrop-blur-sm z-50 transition-opacity duration-300 opacity-0 pointer-events-none" id="drawer-backdrop" onClick={(e) => { (window as any).toggleDrawer?.(false); }}>
<div className="fixed right-0 top-0 h-full w-full max-w-lg bg-surface-container-lowest shadow-2xl z-50 flex flex-col justify-between transform translate-x-full transition-transform duration-300 ease-out" id="drawer-panel" onClick={() => { try { ; } catch (err) { console.error(err); } }}>
{/* Drawer Header */}
<div className="p-space-lg bg-surface-container-lowest flex items-start justify-between">
<div className="flex items-center gap-space-md">
<img className="w-14 h-14 rounded-full object-cover shadow-md" data-alt="Close up photographic profile portrait of university student Sofia Morales smiling gently with round glasses, modern student library card style" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1XekrmOF2kT647zAZ-GO_dPke0QHxcw181eDya-cvHvFRjTSArRvcuOU_NR_Z_odXp3pB45qI2O8H_Pa3YQjtgH_orca08D7sq2zcbT5uKOglYrieI-O5O2TEXtjFzDP4qxr4RvSg-kSWAZAGleDdEcZ_L4pnwv4zBq6a6NbC_r910sd7KO0lIs-ntLzEd8tovdh8yOQco2opea50LSNthgYROOY1adypo_eO8-EMcF3gPKyGBc_s" />
<div className="flex flex-col">
<div className="flex items-center gap-2">
<h2 className="font-headline-4 text-headline-4 text-text-primary font-bold">Sofia Morales</h2>
<span className="font-caption text-caption bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded font-bold">#KP-77401</span>
</div>
<span className="font-small text-small text-text-secondary">BS Computer Science (Yr 3)</span>
<span className="font-caption text-caption text-primary font-medium">College of Engineering &amp; IT</span>
</div>
</div>
<button className="p-2 text-text-secondary hover:bg-surface-container rounded-full transition-colors" onClick={(e) => { (window as any).toggleDrawer?.(false); }} type="button">
<span className="material-symbols-outlined text-[20px]">close</span>
</button>
</div>
{/* Drawer Body (Scrollable Details) */}
<div className="px-space-lg py-space-md flex-1 overflow-y-auto flex flex-col gap-space-lg">
{/* Key Governance Indicators */}
<div className="grid grid-cols-2 gap-space-sm">
<div className="bg-surface-container-low p-space-md rounded-xl flex flex-col">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider">Circulation Quota</span>
<div className="flex items-baseline gap-1 mt-1">
<span className="font-headline-3 text-headline-3 font-bold text-primary">2</span>
<span className="font-caption text-caption text-text-secondary">of 4 volumes</span>
</div>
<div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2 overflow-hidden">
<div className="bg-primary h-full rounded-full" style={{ width: '50%' }}></div>
</div>
</div>
<div className="bg-surface-container-low p-space-md rounded-xl flex flex-col">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider">On-Time Return Rate</span>
<div className="flex items-baseline gap-1 mt-1">
<span className="font-headline-3 text-headline-3 font-bold text-status-available">98.4%</span>
<span className="font-caption text-caption text-status-available font-semibold">Exemplary</span>
</div>
<div className="w-full bg-surface-container-highest rounded-full h-1.5 mt-2 overflow-hidden">
<div className="bg-status-available h-full rounded-full" style={{ width: '98.4%' }}></div>
</div>
</div>
</div>
{/* Clearance & Governance Toggles */}
<div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-space-md">
<h3 className="font-small text-small font-bold text-text-primary uppercase tracking-wider">Institutional Permissions</h3>
<div className="flex items-center justify-between">
<div className="flex flex-col">
<span className="font-small text-small font-semibold text-text-primary">Circulation Borrowing Clearance</span>
<span className="font-caption text-caption text-text-secondary">Allow checking out physical repository volumes</span>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input defaultChecked className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-defaultChecked:after:translate-x-full peer-defaultChecked:after:border-surface-container-lowest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:border-surface-container-highest after:rounded-full after:h-5 after:w-5 after:transition-all peer-defaultChecked:bg-action-green"></div>
</label>
</div>
<div className="w-full h-px bg-surface-container"></div>
<div className="flex items-center justify-between">
<div className="flex flex-col">
<span className="font-small text-small font-semibold text-text-primary">Account Standing</span>
<span className="font-caption text-caption text-text-secondary">Active privileges vs account freeze</span>
</div>
<span className="font-caption text-caption px-2.5 py-1 rounded-full font-bold bg-status-available/20 text-status-available">
              Active Privilege
            </span>
</div>
<div className="w-full h-px bg-surface-container"></div>
<div className="flex items-center justify-between">
<div className="flex flex-col">
<span className="font-small text-small font-semibold text-text-primary">Academic Overdue Ledger</span>
<span className="font-caption text-caption text-text-secondary">Pending financial obligations</span>
</div>
<span className="font-caption text-caption px-2.5 py-1 rounded-full font-bold bg-status-available/20 text-status-available">
              ₱0.00 (Cleared)
            </span>
</div>
</div>
{/* Currently Loaned Material */}
<div className="flex flex-col gap-space-sm">
<div className="flex items-center justify-between">
<h3 className="font-small text-small font-bold text-text-primary uppercase tracking-wider">Active Volume Loans (2)</h3>
<span className="font-caption text-caption text-primary font-semibold cursor-pointer hover:underline">Loan History</span>
</div>
{/* Book Item 1 */}
<div className="bg-surface-container-low p-space-sm rounded-xl flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-14 bg-primary/20 rounded flex items-center justify-center text-primary font-bold font-caption text-caption">
                BOOK
              </div>
<div className="flex flex-col">
<span className="font-small text-small font-semibold text-text-primary line-clamp-1">Introduction to Algorithms (4th Ed.)</span>
<span className="font-caption text-caption text-text-secondary">Due: Nov 18, 2024 (In 6 days)</span>
</div>
</div>
<span className="font-caption text-caption px-2 py-0.5 rounded bg-status-available/15 text-status-available font-semibold">On-Time</span>
</div>
{/* Book Item 2 */}
<div className="bg-surface-container-low p-space-sm rounded-xl flex items-center justify-between gap-space-md">
<div className="flex items-center gap-space-sm">
<div className="w-10 h-14 bg-secondary/20 rounded flex items-center justify-center text-secondary font-bold font-caption text-caption">
                BOOK
              </div>
<div className="flex flex-col">
<span className="font-small text-small font-semibold text-text-primary line-clamp-1">Design Patterns: Reusable Elements</span>
<span className="font-caption text-caption text-text-secondary">Due: Nov 24, 2024 (In 12 days)</span>
</div>
</div>
<span className="font-caption text-caption px-2 py-0.5 rounded bg-status-available/15 text-status-available font-semibold">On-Time</span>
</div>
</div>
{/* Account Credentials & Security Summary */}
<div className="bg-surface-container-low p-space-md rounded-xl flex flex-col gap-space-xs">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider">Security &amp; RFID Badge</span>
<div className="flex items-center justify-between mt-1">
<span className="font-small text-small text-text-primary font-medium">RFID Serial Code:</span>
<span className="font-caption text-caption font-mono bg-surface-container px-2 py-0.5 rounded text-text-primary">RF-9821-KP77</span>
</div>
<div className="flex items-center justify-between">
<span className="font-small text-small text-text-primary font-medium">Registered Device PIN:</span>
<span className="font-caption text-caption text-text-secondary">•••• Configured</span>
</div>
<div className="flex items-center justify-between">
<span className="font-small text-small text-text-primary font-medium">Institutional SSO:</span>
<span className="font-caption text-caption text-primary font-semibold">Verified Active</span>
</div>
</div>
</div>
{/* Drawer Footer Action Bar */}
<div className="p-space-lg bg-surface-container-lowest flex items-center justify-between gap-space-sm">
<button className="flex-1 py-2.5 px-space-md rounded-full bg-error-container text-on-error-container font-small text-small font-bold hover:bg-error hover:text-on-error transition-colors flex items-center justify-center gap-1" type="button">
<span className="material-symbols-outlined text-[18px]">block</span>
<span className="">Suspend Hold</span>
</button>
<button className="flex-1 py-2.5 px-space-md rounded-full bg-primary hover:bg-primary-container text-on-primary font-small text-small font-bold transition-colors flex items-center justify-center gap-1 shadow-sm" type="button">
<span className="material-symbols-outlined text-[18px]">save</span>
<span className="">Save Changes</span>
</button>
</div>
</div>
</div>
{/* Client-side Interactive Drawer Logic */}

</div>
    </div>
  );
};

export default UserManagement;
