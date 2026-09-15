// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// Notifications.tsx -- Cashier Operations Notifications and Alerts
// Converted directly from SidebarNotificationsPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const Notifications: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
(function highlightNav() {
      const activeClasses = ['bg-[#9BE564]', 'text-[#18323D]', 'font-bold', 'rounded-xl', 'shadow-sm'];
      const defaultClasses = ['text-cyan-100/90', 'hover:bg-[#9BE564]', 'hover:text-[#18323D]'];
      const links = document.querySelectorAll('aside nav a');
      links.forEach(link => {
        const isNotifications = link.getAttribute('data-path') === 'notifications';
        if (isNotifications) {
          link.classList.remove('text-cyan-100/90', 'hover:bg-[#9BE564]', 'hover:text-[#18323D]', 'text-text-secondary', 'hover:bg-surface-container-high', 'hover:text-text-primary');
          link.classList.add(...activeClasses);
          const badge = link.querySelector('span:last-child');
          if (badge) {
            badge.className = 'px-2 py-0.5 rounded-full bg-[#18323D] text-[#9BE564] font-caption text-caption font-bold shadow-sm';
          }
        }
      });
    })();


(function() {
      const tabs = document.querySelectorAll('.filter-tab');
      const items = document.querySelectorAll('.notification-item');

      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          tabs.forEach(t => {
            t.classList.remove('bg-surface-container-lowest', 'text-text-primary', 'shadow-sm', 'font-semibold');
            t.classList.add('text-text-secondary', 'font-medium');
          });

          tab.classList.add('bg-surface-container-lowest', 'text-text-primary', 'shadow-sm', 'font-semibold');
          tab.classList.remove('text-text-secondary', 'font-medium');

          const category = tab.getAttribute('data-tab');

          items.forEach(item => {
            if (category === 'all') {
              item.style.display = 'flex';
            } else {
              const itemCat = item.getAttribute('data-category');
              if (itemCat === category) {
                item.style.display = 'flex';
              } else {
                item.style.display = 'none';
              }
            }
          });
        });
      });

      const markAllBtn = document.getElementById('markAllReadBtn');
      if (markAllBtn) {
        markAllBtn.addEventListener('click', () => {
          items.forEach(item => {
            item.classList.remove('bg-soft-blue');
            item.classList.add('bg-surface-container-lowest', 'opacity-85');
            const borderAccent = item.querySelector('.absolute.left-0');
            if (borderAccent) {
              borderAccent.style.opacity = '0.3';
            }
          });
          markAllBtn.innerHTML = '<span class="material-symbols-outlined text-[18px] text-action-green">check</span> All Marked Read';
          setTimeout(() => {
            markAllBtn.innerHTML = '<span class="material-symbols-outlined text-[18px] text-primary">done_all</span> Mark All as Read';
          }, 3000);
        });
      }

      const broadcastForm = document.getElementById('broadcastForm');
      if (broadcastForm) {
        broadcastForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const submitBtn = broadcastForm.querySelector('button[type="submit"]');
          const originalText = submitBtn.innerHTML;
          submitBtn.innerHTML = '<span class="material-symbols-outlined text-[18px] animate-spin">autorenew</span> Sending...';
          submitBtn.disabled = true;

          setTimeout(() => {
            submitBtn.innerHTML = '<span class="material-symbols-outlined text-[18px]">check_circle</span> Dispatched!';
            submitBtn.classList.remove('bg-action-green');
            submitBtn.classList.add('bg-status-available', 'text-on-primary');
            broadcastForm.reset();

            setTimeout(() => {
              submitBtn.innerHTML = originalText;
              submitBtn.classList.remove('bg-status-available', 'text-on-primary');
              submitBtn.classList.add('bg-action-green', 'text-text-primary');
              submitBtn.disabled = false;
            }, 2500);
          }, 600);
        });
      }
    });

    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">

<div className="w-full pb-space-2xl pt-space-lg flex flex-col gap-space-xl">
<section className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg">
<div className="flex flex-col gap-1.5 max-w-3xl">
<div className="flex items-center gap-2 font-caption text-caption uppercase tracking-wider text-text-secondary font-semibold">
<span className="">DESK 01 OPERATIONS</span>
<span className="text-text-secondary/50">/</span>
<span className="text-primary font-bold">Operational Notifications &amp; Alerts</span>
<span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-soft-blue text-primary text-[10px] font-bold">
<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> LIVE WEBSOCKET
          </span>
</div>
<h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">
          Circulation Desk Notification Center
        </h1>
<p className="font-body text-body text-text-secondary">
          Real-time alerts for pending reservation queues, return deadlines, hold pickups, system synchronization, and patron communications.
        </p>
</div>
<div className="flex flex-wrap items-center gap-2.5">
<button className="h-11 px-4 rounded-xl bg-surface-container-lowest text-text-primary font-small text-small font-semibold shadow-sm hover:bg-surface-container-high transition-all flex items-center gap-2" id="markAllReadBtn">
<span className="material-symbols-outlined text-[18px] text-primary">done_all</span>
          Mark All as Read
        </button>
<div className="relative">
<button className="h-11 px-4 rounded-xl bg-surface-container-lowest text-text-primary font-small text-small font-semibold shadow-sm hover:bg-surface-container-high transition-all flex items-center gap-2" id="priorityFilterToggle">
<span className="material-symbols-outlined text-[18px] text-text-secondary">filter_list</span>
            Filter by Priority
            <span className="material-symbols-outlined text-[18px] text-text-secondary">expand_more</span>
</button>
</div>
<button className="h-11 px-4 rounded-xl bg-primary text-on-primary font-small text-small font-semibold shadow-sm hover:bg-primary-container transition-all flex items-center gap-2">
<span className="material-symbols-outlined text-[18px]">tune</span>
          Notification Settings
        </button>
</div>
</section>
<section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
<div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
<div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-status-danger/10 pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
<div className="flex items-center justify-between">
<div className="w-10 h-10 rounded-xl bg-status-danger/15 flex items-center justify-center text-status-danger">
<span className="material-symbols-outlined text-[22px]">error</span>
</div>
<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-status-danger text-on-error font-caption text-caption font-bold animate-pulse">
            HIGH PRIORITY
          </span>
</div>
<div className="mt-4">
<div className="flex items-baseline gap-2">
<span className="font-headline-1 text-headline-1 text-text-primary">4</span>
<span className="font-caption text-caption font-semibold text-status-danger uppercase tracking-wider">Unread</span>
</div>
<p className="font-body-medium text-body-medium font-semibold text-text-primary mt-0.5">Urgent Action Items</p>
<p className="font-caption text-caption text-text-secondary mt-1">Immediate desk cashier handling needed</p>
</div>
</div>
<div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
<div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-action-green/15 pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
<div className="flex items-center justify-between">
<div className="w-10 h-10 rounded-xl bg-soft-blue flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[22px]">inventory_2</span>
</div>
<span className="font-caption text-caption font-semibold text-text-secondary">Bay Locker Area</span>
</div>
<div className="mt-4">
<div className="flex items-baseline gap-2">
<span className="font-headline-1 text-headline-1 text-text-primary">9</span>
<span className="font-caption text-caption font-semibold text-status-available uppercase tracking-wider">Active</span>
</div>
<p className="font-body-medium text-body-medium font-semibold text-text-primary mt-0.5">Staging Locker Holds</p>
<p className="font-caption text-caption text-text-secondary mt-1">Awaiting patron pickup within 24 hours</p>
</div>
</div>
<div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
<div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-status-pending/10 pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
<div className="flex items-center justify-between">
<div className="w-10 h-10 rounded-xl bg-status-pending/15 flex items-center justify-center text-status-pending">
<span className="material-symbols-outlined text-[22px]">mark_email_read</span>
</div>
<span className="font-caption text-caption font-semibold text-text-secondary">Automated Dispatch</span>
</div>
<div className="mt-4">
<div className="flex items-baseline gap-2">
<span className="font-headline-1 text-headline-1 text-text-primary">18</span>
<span className="font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider">Today</span>
</div>
<p className="font-body-medium text-body-medium font-semibold text-text-primary mt-0.5">Return Reminders Sent</p>
<p className="font-caption text-caption text-text-secondary mt-1">Automated SMS &amp; patron portal notices</p>
</div>
</div>
<div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
<div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-action-green/20 pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
<div className="flex items-center justify-between">
<div className="w-10 h-10 rounded-xl bg-action-green/20 flex items-center justify-center text-text-primary">
<span className="material-symbols-outlined text-[22px]">sync_alt</span>
</div>
<span className="inline-flex items-center gap-1 font-caption text-caption font-semibold text-action-green-hover">
<span className="w-2 h-2 rounded-full bg-action-green"></span> 18ms Latency
          </span>
</div>
<div className="mt-4">
<div className="flex items-baseline gap-2">
<span className="font-headline-4 text-headline-4 text-text-primary">Real-Time</span>
<span className="font-caption text-caption font-semibold text-action-green uppercase tracking-wider">Active</span>
</div>
<p className="font-body-medium text-body-medium font-semibold text-text-primary mt-0.5">System Sync Status</p>
<p className="font-caption text-caption text-text-secondary mt-1">WebSocket Desk Bay 01 fully connected</p>
</div>
</div>
</section>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
<div className="lg:col-span-8 flex flex-col gap-space-md">
<div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 select-none">
<div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-container">
<button className="filter-tab px-3.5 py-1.5 rounded-lg bg-surface-container-lowest text-text-primary font-small text-small font-semibold shadow-sm transition-all flex items-center gap-2" data-tab="all">
<span className="">All Alerts</span>
<span className="px-1.5 py-0.2 rounded-full bg-surface-container text-text-secondary font-caption text-caption font-bold">14</span>
</button>
<button className="filter-tab px-3.5 py-1.5 rounded-lg text-text-secondary hover:text-text-primary font-small text-small font-medium transition-all flex items-center gap-2" data-tab="urgent">
<span className="">Urgent / Action Required</span>
<span className="px-1.5 py-0.2 rounded-full bg-status-danger text-on-error font-caption text-caption font-bold">4</span>
</button>
<button className="filter-tab px-3.5 py-1.5 rounded-lg text-text-secondary hover:text-text-primary font-small text-small font-medium transition-all flex items-center gap-2" data-tab="hold">
<span className="">Hold Reservations</span>
<span className="px-1.5 py-0.2 rounded-full bg-surface-container-high text-text-primary font-caption text-caption font-bold">5</span>
</button>
<button className="filter-tab px-3.5 py-1.5 rounded-lg text-text-secondary hover:text-text-primary font-small text-small font-medium transition-all flex items-center gap-2" data-tab="returns">
<span className="">Returns &amp; Overdue</span>
<span className="px-1.5 py-0.2 rounded-full bg-surface-container-high text-text-primary font-caption text-caption font-bold">3</span>
</button>
<button className="filter-tab px-3.5 py-1.5 rounded-lg text-text-secondary hover:text-text-primary font-small text-small font-medium transition-all flex items-center gap-2" data-tab="system">
<span className="">System &amp; Shift</span>
<span className="px-1.5 py-0.2 rounded-full bg-surface-container-high text-text-primary font-caption text-caption font-bold">2</span>
</button>
</div>
<div className="hidden sm:flex items-center gap-2 text-text-secondary font-caption text-caption whitespace-nowrap">
<span className="w-2 h-2 rounded-full bg-primary"></span>
<span className="">4 Unread Alerts</span>
</div>
</div>
<div className="flex flex-col gap-space-sm" id="notificationsFeed">
<article className="notification-item relative overflow-hidden rounded-2xl bg-soft-blue p-space-md sm:p-space-lg shadow-sm transition-all duration-200 hover:shadow-md flex flex-col sm:flex-row gap-space-md" data-category="urgent">
<div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>
<div className="flex-shrink-0">
<div className="w-12 h-12 rounded-xl bg-status-danger/15 flex items-center justify-center text-status-danger">
<span className="material-symbols-outlined text-[26px]">warning</span>
</div>
</div>
<div className="flex flex-col flex-1 min-w-0">
<div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
<div className="flex items-center gap-2 flex-wrap">
<span className="px-2 py-0.5 rounded-full bg-status-danger text-on-error font-caption text-caption font-bold uppercase">
                    Urgent Overdue
                  </span>
<h3 className="font-headline-4 text-headline-4 text-text-primary">
                    Critical Overdue Threshold Reached — Sofia Del Rosario
                  </h3>
<span className="px-2 py-0.5 rounded bg-surface-container-lowest/80 text-text-secondary font-caption text-caption font-mono">
                    ID: #2022-09411
                  </span>
</div>
<div className="flex items-center gap-1 text-text-secondary font-caption text-caption whitespace-nowrap">
<span className="material-symbols-outlined text-[14px]">schedule</span>
<span className="">12m ago</span>
</div>
</div>
<p className="font-body text-body text-text-primary/90 mt-1 leading-relaxed">
                Loan for <strong className="font-semibold text-text-primary">‘Principles of Modern Thermodynamics’</strong> has reached <span className="text-status-danger font-semibold">15 days overdue</span>. Patron borrowing privileges are automatically frozen. Outstanding overdue fine balance: <span className="font-semibold font-mono text-status-danger">₱210.00</span>.
              </p>
<div className="flex flex-wrap items-center justify-between gap-space-sm mt-space-md pt-space-sm">
<span className="font-caption text-caption text-text-secondary flex items-center gap-1.5">
<span className="material-symbols-outlined text-[15px] text-primary">precision_manufacturing</span>
                  Automated Compliance Trigger • Bay 01
                </span>
<div className="flex items-center gap-2">
<button className="h-9 px-3 rounded-lg bg-surface-container-lowest text-text-primary hover:bg-surface-container font-small text-small font-medium transition-colors">
                    Send Final Notice
                  </button>
<button className="h-9 px-4 rounded-lg bg-action-green text-text-primary hover:bg-action-green-hover font-small text-small font-bold shadow-sm transition-colors flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px]">manage_search</span>
                    Review Overdue Account
                  </button>
</div>
</div>
</div>
</article>
<article className="notification-item relative overflow-hidden rounded-2xl bg-soft-blue p-space-md sm:p-space-lg shadow-sm transition-all duration-200 hover:shadow-md flex flex-col sm:flex-row gap-space-md" data-category="hold">
<div className="absolute left-0 top-0 bottom-0 w-1.5 bg-status-available"></div>
<div className="flex-shrink-0">
<div className="w-12 h-12 rounded-xl bg-status-available/20 flex items-center justify-center text-status-available">
<span className="material-symbols-outlined text-[26px]">fact_check</span>
</div>
</div>
<div className="flex flex-col flex-1 min-w-0">
<div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
<div className="flex items-center gap-2 flex-wrap">
<span className="px-2 py-0.5 rounded-full bg-surface-container-lowest text-status-available font-caption text-caption font-bold uppercase">
                    Hold Ready
                  </span>
<h3 className="font-headline-4 text-headline-4 text-text-primary">
                    Physical Copy Staged &amp; Verified — Marcus Aurelius
                  </h3>
<span className="px-2 py-0.5 rounded bg-surface-container-lowest/80 text-text-secondary font-caption text-caption font-mono">
                    Hold #KP-RES-2026-00914
                  </span>
</div>
<div className="flex items-center gap-1 text-text-secondary font-caption text-caption whitespace-nowrap">
<span className="material-symbols-outlined text-[14px]">schedule</span>
<span className="">28m ago</span>
</div>
</div>
<p className="font-body text-body text-text-primary/90 mt-1 leading-relaxed">
<strong className="font-semibold text-text-primary">‘Structure and Interpretation of Computer Programs’</strong> was placed in <span className="font-bold text-primary font-mono">Staging Locker #B-04</span>. Patron notified via automated SMS with temporary unlock PIN: <span className="font-mono font-bold bg-surface-container-lowest px-1.5 py-0.5 rounded text-text-primary">#4892</span>.
              </p>
<div className="flex flex-wrap items-center justify-between gap-space-sm mt-space-md pt-space-sm">
<span className="font-caption text-caption text-text-secondary flex items-center gap-1.5">
<span className="material-symbols-outlined text-[15px] text-primary">directions_walk</span>
                  Stacks Runner Desk 01 (Bay 01 Staging Bay)
                </span>
<div className="flex items-center gap-2">
<button className="h-9 px-3 rounded-lg bg-surface-container-lowest text-text-primary hover:bg-surface-container font-small text-small font-medium transition-colors">
                    Release Hold
                  </button>
<button className="h-9 px-3.5 rounded-lg bg-surface-container-lowest text-primary hover:bg-surface-container-high font-small text-small font-semibold shadow-sm transition-colors flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px]">receipt</span>
                    View Reservation Slip
                  </button>
</div>
</div>
</div>
</article>
<article className="notification-item relative overflow-hidden rounded-2xl bg-soft-blue p-space-md sm:p-space-lg shadow-sm transition-all duration-200 hover:shadow-md flex flex-col sm:flex-row gap-space-md" data-category="returns">
<div className="absolute left-0 top-0 bottom-0 w-1.5 bg-status-pending"></div>
<div className="flex-shrink-0">
<div className="w-12 h-12 rounded-xl bg-status-pending/20 flex items-center justify-center text-status-pending">
<span className="material-symbols-outlined text-[26px]">hourglass_top</span>
</div>
</div>
<div className="flex flex-col flex-1 min-w-0">
<div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
<div className="flex items-center gap-2 flex-wrap">
<span className="px-2 py-0.5 rounded-full bg-status-pending/20 text-text-primary font-caption text-caption font-bold uppercase">
                    High Demand Return
                  </span>
<h3 className="font-headline-4 text-headline-4 text-text-primary">
                    High-Demand Volume Due Within 2 Hours — Mateo Santos
                  </h3>
</div>
<div className="flex items-center gap-1 text-text-secondary font-caption text-caption whitespace-nowrap">
<span className="material-symbols-outlined text-[14px]">schedule</span>
<span className="">45m ago</span>
</div>
</div>
<p className="font-body text-body text-text-primary/90 mt-1 leading-relaxed">
<strong className="font-semibold text-text-primary">‘Introduction to Algorithms (CLRS)’</strong> has <span className="font-bold text-text-primary">3 pending holds</span> in queue. Expected return at Front Desk Counter before <span className="font-bold text-status-danger">04:30 PM</span> today.
              </p>
<div className="flex flex-wrap items-center justify-between gap-space-sm mt-space-md pt-space-sm">
<span className="font-caption text-caption text-text-secondary flex items-center gap-1.5">
<span className="material-symbols-outlined text-[15px] text-primary">schedule_send</span>
                  Circulation Scheduler Service • Bay 01
                </span>
<div className="flex items-center gap-2">
<button className="h-9 px-3 rounded-lg bg-surface-container-lowest text-text-primary hover:bg-surface-container font-small text-small font-medium transition-colors">
                    Check Queue (3)
                  </button>
<button className="h-9 px-3.5 rounded-lg bg-surface-container-lowest text-primary hover:bg-surface-container-high font-small text-small font-semibold shadow-sm transition-colors flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px]">flag</span>
                    Flag for Priority Reshelve
                  </button>
</div>
</div>
</div>
</article>
<article className="notification-item relative overflow-hidden rounded-2xl bg-soft-blue p-space-md sm:p-space-lg shadow-sm transition-all duration-200 hover:shadow-md flex flex-col sm:flex-row gap-space-md" data-category="hold">
<div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-container"></div>
<div className="flex-shrink-0">
<div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
<span className="material-symbols-outlined text-[26px]">menu_book</span>
</div>
</div>
<div className="flex flex-col flex-1 min-w-0">
<div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
<div className="flex items-center gap-2 flex-wrap">
<span className="px-2 py-0.5 rounded-full bg-primary text-on-primary font-caption text-caption font-bold uppercase">
                    Faculty Fast-Track
                  </span>
<h3 className="font-headline-4 text-headline-4 text-text-primary">
                    New Scholastic Fast-Track Reservation — Dr. Aris Thorne (Faculty VIP)
                  </h3>
</div>
<div className="flex items-center gap-1 text-text-secondary font-caption text-caption whitespace-nowrap">
<span className="material-symbols-outlined text-[14px]">schedule</span>
<span className="">1h ago</span>
</div>
</div>
<p className="font-body text-body text-text-primary/90 mt-1 leading-relaxed">
                Requested <strong className="font-semibold text-text-primary">‘Philippine Cartography 1320–1898’</strong> (Special Archival Collection) for counter pickup today at <span className="font-bold text-text-primary font-mono">02:00 PM</span>. Requires white-glove packaging and cashier counter verification.
              </p>
<div className="flex flex-wrap items-center justify-between gap-space-sm mt-space-md pt-space-sm">
<span className="font-caption text-caption text-text-secondary flex items-center gap-1.5">
<span className="material-symbols-outlined text-[15px] text-primary">school</span>
                  Faculty Academic Portal • VIP Priority Tier
                </span>
<div className="flex items-center gap-2">
<button className="h-9 px-3 rounded-lg bg-surface-container-lowest text-text-primary hover:bg-surface-container font-small text-small font-medium transition-colors">
                    Dismiss
                  </button>
<button className="h-9 px-4 rounded-lg bg-action-green text-text-primary hover:bg-action-green-hover font-small text-small font-bold shadow-sm transition-colors flex items-center gap-1.5">
<span className="material-symbols-outlined text-[16px]">verified</span>
                    Review &amp; Approve
                  </button>
</div>
</div>
</div>
</article>
<article className="notification-item relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-md sm:p-space-lg shadow-sm transition-all duration-200 hover:shadow-md flex flex-col sm:flex-row gap-space-md opacity-90" data-category="system">
<div className="flex-shrink-0">
<div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-text-secondary">
<span className="material-symbols-outlined text-[26px]">check_circle</span>
</div>
</div>
<div className="flex flex-col flex-1 min-w-0">
<div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-1">
<div className="flex items-center gap-2 flex-wrap">
<span className="px-2 py-0.5 rounded-full bg-surface-container text-text-secondary font-caption text-caption font-medium uppercase">
                    System Event • Read
                  </span>
<h3 className="font-headline-4 text-headline-4 text-text-primary">
                    Morning Cash Drawer Balance Calibrated
                  </h3>
</div>
<div className="flex items-center gap-1 text-text-secondary font-caption text-caption whitespace-nowrap">
<span className="material-symbols-outlined text-[14px]">schedule</span>
<span className="">08:00 AM</span>
</div>
</div>
<p className="font-body text-body text-text-secondary mt-1 leading-relaxed">
                Register float initialized at <span className="font-semibold font-mono text-text-primary">₱1,450.00</span> by Head Cashier Elena Vance. Dual-key hardware verification verified on Station Bay 01.
              </p>
<div className="flex flex-wrap items-center justify-between gap-space-sm mt-space-md pt-space-sm">
<span className="font-caption text-caption text-text-secondary flex items-center gap-1.5">
<span className="material-symbols-outlined text-[15px]">point_of_sale</span>
                  POS Hardware Sync • Station Bay 01
                </span>
<span className="font-caption text-caption font-semibold text-status-available flex items-center gap-1">
<span className="material-symbols-outlined text-[16px]">verified_user</span>
                  Verified &amp; Logged
                </span>
</div>
</div>
</article>
</div>
</div>
<div className="lg:col-span-4 flex flex-col gap-space-md">
<div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[22px]">podcasts</span>
<h2 className="font-headline-4 text-headline-4 text-text-primary">Quick Desk Broadcast</h2>
</div>
<span className="px-2 py-0.5 rounded-full bg-soft-blue text-primary font-caption text-caption font-bold">Runner Comms</span>
</div>
<p className="font-small text-small text-text-secondary">
            Send an instant operational directive or stacks assistance request to runners on active floor duty.
          </p>
<form className="flex flex-col gap-space-sm" id="broadcastForm">
<div className="flex flex-col gap-1.5">
<label className="font-caption text-caption font-semibold text-text-secondary uppercase">Broadcast Target</label>
<select className="w-full h-11 px-3 rounded-xl bg-surface-container-low font-small text-small text-text-primary focus:outline-none focus:bg-surface-container-lowest transition-colors">
<option value="runners">All Stacks Runners (Bay 01 &amp; Stacks A/B)</option>
<option value="head">Circulation Head Supervisor</option>
<option value="security">Library Gate &amp; Security</option>
<option value="archive">Special Collections Desk</option>
</select>
</div>
<div className="flex flex-col gap-1.5">
<label className="font-caption text-caption font-semibold text-text-secondary uppercase">Quick Message / Urgent Request</label>
<textarea className="w-full p-3 rounded-xl bg-surface-container-low font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none focus:bg-surface-container-lowest resize-none transition-colors" placeholder="e.g., Priority pickup needed for CLRS book at Bay 01 counter..." rows={3}></textarea>
</div>
<div className="flex items-center justify-between pt-1">
<label className="flex items-center gap-2 cursor-pointer select-none">
<input defaultChecked className="w-4 h-4 rounded text-primary focus:ring-0 accent-primary" type="checkbox"/>
<span className="font-caption text-caption text-text-secondary font-medium">Tag as High Urgency</span>
</label>
<button className="h-10 px-4 rounded-xl bg-action-green text-text-primary font-small text-small font-bold hover:bg-action-green-hover shadow-sm transition-all flex items-center gap-1.5" type="submit">
<span className="material-symbols-outlined text-[18px]">send</span>
                Broadcast
              </button>
</div>
</form>
</div>
<div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-space-md">
<div className="flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-[22px]">settings_suggest</span>
<h2 className="font-headline-4 text-headline-4 text-text-primary">Desk Preferences</h2>
</div>
<div className="flex flex-col divide-y divide-surface-container-high/40">
<div className="py-3 flex items-center justify-between">
<div className="flex flex-col pr-4">
<span className="font-body-medium text-body-medium font-semibold text-text-primary">Desk Audio Chime</span>
<span className="font-caption text-caption text-text-secondary">Audible alert on urgent holds &amp; system halts</span>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input defaultChecked className="sr-only peer" id="chimeToggle" type="checkbox"/>
<div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-defaultChecked:after:translate-x-full peer-defaultChecked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-defaultChecked:bg-action-green"></div>
</label>
</div>
<div className="py-3 flex items-center justify-between">
<div className="flex flex-col pr-4">
<span className="font-body-medium text-body-medium font-semibold text-text-primary">Auto-Dismiss Low Priority</span>
<span className="font-caption text-caption text-text-secondary">Archive routine logs after 24h</span>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input defaultChecked className="sr-only peer" id="autoDismissToggle" type="checkbox"/>
<div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-defaultChecked:after:translate-x-full peer-defaultChecked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-defaultChecked:bg-action-green"></div>
</label>
</div>
<div className="py-3 flex items-center justify-between">
<div className="flex flex-col pr-4">
<span className="font-body-medium text-body-medium font-semibold text-text-primary">Patron Arrival Pings</span>
<span className="font-caption text-caption text-text-secondary">Flash screen when RFID gate detects hold borrower</span>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input defaultChecked className="sr-only peer" type="checkbox"/>
<div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-defaultChecked:after:translate-x-full peer-defaultChecked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-defaultChecked:bg-action-green"></div>
</label>
</div>
<div className="py-3 flex items-center justify-between">
<div className="flex flex-col pr-4">
<span className="font-body-medium text-body-medium font-semibold text-text-primary">Locker Timeout Alarms</span>
<span className="font-caption text-caption text-text-secondary">Warn when physical hold hits &gt;48 hours</span>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input className="sr-only peer" type="checkbox"/>
<div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-defaultChecked:after:translate-x-full peer-defaultChecked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-defaultChecked:bg-action-green"></div>
</label>
</div>
</div>
</div>
<div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm flex flex-col gap-3">
<div className="flex items-center justify-between">
<span className="font-caption text-caption font-bold text-text-secondary uppercase tracking-wider">Shift Synchronization Health</span>
<span className="font-caption text-caption font-bold text-action-green-hover">OPTIMAL</span>
</div>
<div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low">
<span className="material-symbols-outlined text-primary text-[24px]">router</span>
<div className="flex flex-col min-w-0 flex-1">
<div className="flex items-center justify-between">
<span className="font-small text-small font-semibold text-text-primary">Bay 01 Node: Primary</span>
<span className="font-caption text-caption text-text-secondary font-mono">192.168.10.42</span>
</div>
<div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
<div className="bg-action-green h-full rounded-full w-[96%]"></div>
</div>
</div>
</div>
<p className="font-caption text-caption text-text-secondary">
            Last synchronized with Katipuneros Circulation Master Cluster 4 seconds ago.
          </p>
</div>
</div>
</div>
</div>

</div>
    </div>
  );
};

export default Notifications;
