// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// Schedules.tsx -- Cashier Library Schedules and Desk Shifts
// Converted directly from SidebarSchedulesPage/code.html.
// DO NOT put business logic or direct API calls here.
import { FC, useEffect } from 'react';

const Schedules: FC = () => {
  useEffect(() => {
    const document: any = window.document;
    const w = window as any;
    try {
// Micro-interaction for Calendar Duration Calculator Buttons
  document.querySelectorAll('.duration-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.duration-btn').forEach(btn => {
        btn.classList.remove('bg-primary', 'text-on-primary', 'shadow-sm');
        btn.classList.add('bg-surface-container', 'text-text-primary');
      });
      button.classList.remove('bg-surface-container', 'text-text-primary');
      button.classList.add('bg-primary', 'text-on-primary', 'shadow-sm');
      
      const days = parseInt(button.getAttribute('data-days'), 10);
      const targetLabel = document.getElementById('calculated-due-date');
      if (days === 7) {
        targetLabel.textContent = 'Nov 02, 2026';
      } else if (days === 14) {
        targetLabel.textContent = 'Nov 09, 2026';
      } else if (days === 21) {
        targetLabel.textContent = 'Nov 16, 2026';
      }
    });
  });

  // Micro-interaction for View Switcher Buttons
  document.querySelectorAll('.schedule-view-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.schedule-view-tab').forEach(t => {
        t.classList.remove('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
        t.classList.add('text-text-secondary');
      });
      tab.classList.add('bg-surface-container-lowest', 'text-primary', 'shadow-sm');
      tab.classList.remove('text-text-secondary');
    });
  });

    } catch (err) {
      console.error("UI interaction script error:", err);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full pb-space-3xl gap-space-lg">
{/* Top Schedule Header & Quick Operation Metric Ribbon */}
<section className="flex flex-col gap-space-md">
<div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md bg-surface-container-lowest/80 backdrop-blur-md p-space-lg rounded-xl shadow-sm">
<div className="flex flex-col sm:flex-row sm:items-center gap-space-md">
<div className="flex items-center gap-space-xs bg-surface-container-low p-1 rounded-full shadow-inner">
<button aria-label="Previous date range" className="w-9 h-9 flex items-center justify-center rounded-full text-text-secondary hover:bg-surface-container-lowest hover:text-primary transition-all" type="button">
<span className="material-symbols-outlined text-lg">chevron_left</span>
</button>
<div className="px-space-md flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-xl">event</span>
<span className="font-headline-4 text-headline-4 text-text-primary whitespace-nowrap">Monday, Oct 26, 2026</span>
</div>
<button aria-label="Next date range" className="w-9 h-9 flex items-center justify-center rounded-full text-text-secondary hover:bg-surface-container-lowest hover:text-primary transition-all" type="button">
<span className="material-symbols-outlined text-lg">chevron_right</span>
</button>
</div>
<button className="px-space-md py-2 rounded-full bg-soft-blue text-primary font-small text-small font-bold hover:bg-primary hover:text-on-primary transition-all flex items-center gap-1.5 shadow-sm" type="button">
<span className="material-symbols-outlined text-base">today</span>
<span className="">Today</span>
</button>
<div className="hidden 2xl:flex items-center gap-2 text-text-secondary font-caption text-caption pl-space-xs">
<span className="w-2 h-2 rounded-full bg-action-green animate-pulse"></span>
<span className="">Circulation Desk 01 Active Sync</span>
</div>
</div>
{/* View Switcher Tabs & Quick Dispatch Action */}
<div className="flex flex-wrap items-center gap-space-sm">
<div className="inline-flex bg-surface-container-low p-1 rounded-full shadow-inner text-text-secondary">
<button className="schedule-view-tab px-space-md py-1.5 rounded-full bg-surface-container-lowest text-primary font-caption text-caption font-bold shadow-sm transition-all" data-view="day" type="button">
            Day View
          </button>
<button className="schedule-view-tab px-space-md py-1.5 rounded-full text-text-secondary hover:text-primary font-caption text-caption font-bold transition-all" data-view="week" type="button">
            Week View
          </button>
<button className="schedule-view-tab px-space-md py-1.5 rounded-full text-text-secondary hover:text-primary font-caption text-caption font-bold transition-all" data-view="month" type="button">
            Month View
          </button>
<button className="schedule-view-tab px-space-md py-1.5 rounded-full text-text-secondary hover:text-primary font-caption text-caption font-bold transition-all" data-view="agenda" type="button">
            Agenda List
          </button>
</div>
<button className="px-space-lg py-2.5 rounded-full bg-action-green text-text-primary hover:bg-action-green-hover font-small text-small font-bold transition-all flex items-center gap-2 shadow-sm" type="button">
<span className="material-symbols-outlined text-lg">add_alarm</span>
<span className="">Book Timeslot</span>
</button>
</div>
</div>
{/* Quick Stats Cards Strip */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
<div className="bg-surface-container-lowest p-space-md rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
<div className="flex flex-col">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">Pickups Scheduled</span>
<div className="flex items-baseline gap-space-xs mt-1">
<span className="font-headline-2 text-headline-2 text-primary font-bold">14</span>
<span className="font-caption text-caption text-status-available font-bold">+2 walk-in hold</span>
</div>
<span className="font-caption text-caption text-text-secondary mt-1">9 Bay Desk • 5 Staged Lockers</span>
</div>
<div className="w-12 h-12 rounded-xl bg-soft-blue text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-2xl">shopping_bag</span>
</div>
</div>
<div className="bg-surface-container-lowest p-space-md rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
<div className="flex flex-col">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">Due Returns Today</span>
<div className="flex items-baseline gap-space-xs mt-1">
<span className="font-headline-2 text-headline-2 text-secondary font-bold">9</span>
<span className="font-caption text-caption text-text-secondary font-bold">of 24 weekly</span>
</div>
<span className="font-caption text-caption text-text-secondary mt-1">4 Counter • 5 Smart Drop</span>
</div>
<div className="w-12 h-12 rounded-xl bg-surface-container text-secondary flex items-center justify-center">
<span className="material-symbols-outlined text-2xl">assignment_return</span>
</div>
</div>
<div className="bg-surface-container-lowest p-space-md rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
<div className="flex flex-col">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">Expiring Holds</span>
<div className="flex items-baseline gap-space-xs mt-1">
<span className="font-headline-2 text-headline-2 text-status-pending font-bold">3</span>
<span className="font-caption text-caption text-status-danger font-bold">by 06:00 PM</span>
</div>
<span className="font-caption text-caption text-text-secondary mt-1">Awaiting patron clearance</span>
</div>
<div className="w-12 h-12 rounded-xl bg-status-pending/15 text-status-pending flex items-center justify-center">
<span className="material-symbols-outlined text-2xl">hourglass_bottom</span>
</div>
</div>
<div className="bg-primary text-on-primary p-space-md rounded-xl flex items-center justify-between shadow-sm relative overflow-hidden">
<div className="flex flex-col">
<span className="font-caption text-caption uppercase tracking-wider text-primary-fixed font-bold">Locker Utilization</span>
<div className="flex items-baseline gap-space-xs mt-1">
<span className="font-headline-2 text-headline-2 text-on-primary font-bold">88%</span>
<span className="font-caption text-caption text-primary-fixed font-medium">14 of 16 filled</span>
</div>
<span className="font-caption text-caption text-primary-fixed-dim mt-1">Auto-purge scheduled 8 PM</span>
</div>
<div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center">
<span className="material-symbols-outlined text-2xl">lock_clock</span>
</div>
</div>
</div>
</section>
{/* Conflict Detection Alert Banner */}
<section className="w-full">
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-space-md relative overflow-hidden">
<div className="absolute left-0 top-0 bottom-0 w-2 bg-status-pending"></div>
<div className="flex items-start gap-space-md pl-space-xs">
<div className="w-10 h-10 rounded-full bg-status-pending/20 text-status-pending flex items-center justify-center shrink-0 mt-0.5">
<span className="material-symbols-outlined text-xl">warning_amber</span>
</div>
<div className="flex flex-col">
<div className="flex items-center gap-space-sm flex-wrap">
<span className="font-body-medium text-body-medium text-text-primary font-bold">Schedule Alert: 1 Potential Conflict Detected</span>
<span className="bg-status-pending/20 text-status-pending font-caption text-caption font-bold px-2 py-0.5 rounded-full">Automated Mitigation Applied</span>
</div>
<p className="font-small text-small text-text-secondary mt-0.5">
            Bay 01 Staging Locker <strong className="text-text-primary">#B-04</strong> overlap resolved for 2:30 PM. Patron Hold #HLD-9942 reassigned seamlessly to Available Locker <strong className="text-primary">#C-01</strong>.
          </p>
</div>
</div>
<div className="flex items-center gap-space-sm shrink-0 self-end md:self-center">
<button className="px-space-md py-2 rounded-lg bg-surface-container text-primary hover:bg-soft-blue font-caption text-caption font-bold transition-all" type="button">
          View Resolution Log
        </button>
<button className="px-space-md py-2 rounded-lg bg-action-green text-text-primary hover:bg-action-green-hover font-caption text-caption font-bold transition-all shadow-sm" type="button">
          Acknowledge
        </button>
</div>
</div>
</section>
{/* Main Work Area: Multi-Lane Calendar Grid (Left) + Schedule Intelligence Sidebar (Right) */}
<section className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg items-start">
{/* Left Column: Interactive Multi-Lane Daily Schedule (8 Columns on XL) */}
<div className="xl:col-span-8 flex flex-col gap-space-md bg-surface-container-lowest p-space-lg rounded-xl shadow-sm">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm">
<div className="flex items-center gap-space-sm">
<div className="w-3 h-3 rounded-full bg-primary"></div>
<h2 className="font-headline-3 text-headline-3 text-text-primary">Multi-Lane Circulation Timeline</h2>
<span className="font-caption text-caption text-text-secondary bg-surface-container px-2.5 py-0.5 rounded-full">Live Bay 01 Dispatch</span>
</div>
<div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption">
<span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-primary-container"></span> Hold Pickup</span>
<span className="inline-flex items-center gap-1 ml-2"><span className="w-2.5 h-2.5 rounded bg-secondary"></span> Returns Due</span>
<span className="inline-flex items-center gap-1 ml-2"><span className="w-2.5 h-2.5 rounded bg-tertiary"></span> Smart Drop Cycle</span>
</div>
</div>
{/* Schedule Timeline Lanes Container */}
<div className="w-full overflow-x-auto rounded-xl bg-surface-container-low/40 p-space-sm">
<div className="min-w-[760px] flex flex-col gap-space-xs">
{/* Lane Column Header Titles */}
<div className="grid grid-cols-12 gap-space-xs py-space-xs text-text-secondary font-caption text-caption font-bold uppercase tracking-wider px-space-xs">
<div className="col-span-2 text-center">Time Slot</div>
<div className="col-span-4 bg-soft-blue/60 text-primary py-1 px-space-sm rounded-lg text-left flex items-center gap-1.5">
<span className="material-symbols-outlined text-sm">handshake</span>
<span className="">Pickup Desk Bay 01</span>
</div>
<div className="col-span-3 bg-surface-container py-1 px-space-sm rounded-lg text-left flex items-center gap-1.5">
<span className="material-symbols-outlined text-sm">assignment_returned</span>
<span className="">Expected Returns</span>
</div>
<div className="col-span-3 bg-secondary-container/40 text-secondary py-1 px-space-sm rounded-lg text-left flex items-center gap-1.5">
<span className="material-symbols-outlined text-sm">inventory_2</span>
<span className="">Smart Drop Box</span>
</div>
</div>
{/* Timeslot Row: 08:00 AM - 09:00 AM */}
<div className="grid grid-cols-12 gap-space-xs py-space-xs items-stretch group">
<div className="col-span-2 flex flex-col items-center justify-center bg-surface-container-lowest rounded-lg p-space-xs shadow-sm">
<span className="font-caption text-caption font-bold text-text-primary">08:00 AM</span>
<span className="font-caption text-caption text-text-secondary text-[11px]">Station Boot</span>
</div>
<div className="col-span-4 bg-surface-container-lowest/60 rounded-lg p-2.5 flex items-center justify-between text-text-secondary font-caption text-caption">
<span className="italic text-text-secondary/70">No counter pickups queued</span>
<span className="material-symbols-outlined text-sm text-text-secondary/40">lock</span>
</div>
<div className="col-span-3 bg-surface-container-lowest/60 rounded-lg p-2.5 flex items-center justify-between text-text-secondary font-caption text-caption">
<span className="text-text-secondary/70">Early drop window</span>
</div>
<div className="col-span-3 bg-surface-container-lowest rounded-lg p-2 shadow-sm flex items-center justify-between">
<div className="flex flex-col">
<span className="font-caption text-caption font-bold text-tertiary">Morning Intake Sweep</span>
<span className="text-[11px] text-text-secondary">Bin A &amp; B Audit (18 items)</span>
</div>
<span className="bg-status-available/20 text-status-available font-caption text-caption font-bold px-2 py-0.5 rounded-full">Completed</span>
</div>
</div>
{/* Timeslot Row: 09:00 AM - 10:30 AM (Active Now Highlight) */}
<div className="grid grid-cols-12 gap-space-xs py-space-xs items-stretch relative">
<div className="col-span-2 flex flex-col items-center justify-center bg-primary text-on-primary rounded-lg p-space-xs shadow-md">
<span className="font-caption text-caption font-bold uppercase tracking-wider text-[10px] text-action-green">Current Slot</span>
<span className="font-body-medium text-body-medium font-bold">09:30 AM</span>
<span className="font-caption text-caption text-primary-fixed-dim text-[11px]">Bay 01 Live</span>
</div>
{/* Event Card: Sofia Morales Pickup */}
<div className="col-span-4 bg-soft-blue/90 rounded-lg p-space-sm shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
<div className="flex items-start justify-between gap-1">
<div>
<div className="flex items-center gap-1.5">
<span className="font-body-medium text-body-medium font-bold text-text-primary">Sofia Morales</span>
<span className="bg-status-available text-on-primary font-caption text-caption px-1.5 py-0.2 rounded text-[10px] font-bold">Present</span>
</div>
<p className="font-small text-small text-primary font-semibold truncate mt-0.5">Clean Code: A Handbook</p>
<p className="font-caption text-caption text-text-secondary">ID: #RES-8821 • Locker #A-02</p>
</div>
<button aria-label="Process pickup" className="w-8 h-8 rounded-full bg-action-green text-text-primary flex items-center justify-center hover:bg-action-green-hover shadow-sm" type="button">
<span className="material-symbols-outlined text-sm">check</span>
</button>
</div>
<div className="flex items-center justify-between pt-2 mt-1">
<span className="font-caption text-caption text-text-secondary">Staged by: Station #01</span>
<span className="bg-primary text-on-primary font-caption text-caption px-2 py-0.5 rounded-full text-[10px] font-bold">Confirmed Pickup</span>
</div>
</div>
{/* Expected Return: Early Walk-in */}
<div className="col-span-3 bg-surface-container-lowest rounded-lg p-space-sm shadow-sm flex flex-col justify-between">
<div>
<span className="font-small text-small font-bold text-text-primary">Carlos Mendoza</span>
<p className="font-caption text-caption text-secondary font-medium truncate">Design Patterns (GoF)</p>
<span className="font-caption text-caption text-text-secondary">Loan #CK-4102</span>
</div>
<div className="flex items-center justify-between pt-1">
<span className="text-[11px] text-text-secondary">Due: 10:00 AM</span>
<span className="bg-surface-container text-secondary font-caption text-caption px-2 py-0.5 rounded-full text-[10px] font-bold">On Schedule</span>
</div>
</div>
{/* Smart Drop cycle */}
<div className="col-span-3 bg-surface-container-lowest/70 rounded-lg p-space-sm flex items-center justify-between">
<div className="flex flex-col">
<span className="font-caption text-caption font-bold text-text-primary">Sensor Sweep #02</span>
<span className="text-[11px] text-text-secondary">Auto RFID telemetry</span>
</div>
<span className="material-symbols-outlined text-status-available text-lg">sensors</span>
</div>
</div>
{/* Timeslot Row: 11:00 AM - 12:30 PM */}
<div className="grid grid-cols-12 gap-space-xs py-space-xs items-stretch">
<div className="col-span-2 flex flex-col items-center justify-center bg-surface-container-lowest rounded-lg p-space-xs shadow-sm">
<span className="font-caption text-caption font-bold text-text-primary">11:00 AM</span>
<span className="font-caption text-caption text-text-secondary text-[11px]">Midday Peak</span>
</div>
<div className="col-span-4 bg-surface-container-lowest rounded-lg p-space-sm shadow-sm flex flex-col justify-between">
<div className="flex items-start justify-between">
<div>
<span className="font-body-medium text-body-medium font-bold text-text-primary">Clara Reyes</span>
<p className="font-small text-small text-primary font-semibold truncate">Modern Operating Systems</p>
<span className="font-caption text-caption text-text-secondary">ID: #RES-8830 • Desk Collect</span>
</div>
<span className="bg-soft-blue text-primary font-caption text-caption px-2 py-0.5 rounded text-[10px] font-bold">Staged Bay 1</span>
</div>
<div className="flex items-center justify-between pt-1">
<span className="font-caption text-caption text-text-secondary">Expires: 06:00 PM</span>
<span className="bg-primary-container text-on-primary-container font-caption text-caption px-2 py-0.5 rounded-full text-[10px] font-bold">Confirmed Pickup</span>
</div>
</div>
{/* Return Due: Marcus Aurelius (High Value Item) */}
<div className="col-span-3 bg-surface-container-lowest rounded-lg p-space-sm shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between">
<span className="font-small text-small font-bold text-text-primary">Marcus Aurelius</span>
<span className="material-symbols-outlined text-status-pending text-sm" title="High circulation demand">priority_high</span>
</div>
<p className="font-caption text-caption text-secondary font-semibold truncate">Structure &amp; Interpretation of Comp Programs</p>
<span className="font-caption text-caption text-text-secondary">Hold queue: 3 waiting</span>
</div>
<div className="flex items-center justify-between pt-1">
<span className="text-[11px] text-status-pending font-bold">Due Window 11:00 AM</span>
<span className="bg-status-pending/20 text-status-pending font-caption text-caption px-2 py-0.5 rounded-full text-[10px] font-bold">Due Return</span>
</div>
</div>
{/* Drop-Box Cycle Batch */}
<div className="col-span-3 bg-surface-container-lowest rounded-lg p-space-sm shadow-sm flex flex-col justify-between">
<div>
<span className="font-caption text-caption font-bold text-text-primary">Midday Empty &amp; Sort</span>
<p className="font-caption text-caption text-text-secondary">Bin #North-Gate Conveyor</p>
</div>
<div className="flex items-center justify-between pt-1">
<span className="text-[11px] text-text-secondary">Assigned: Desk Intern</span>
<span className="bg-surface-container text-text-secondary font-caption text-caption px-2 py-0.5 rounded text-[10px] font-bold">Scheduled</span>
</div>
</div>
</div>
{/* Timeslot Row: 02:00 PM - 03:30 PM (Conflict & Faculty Pickups) */}
<div className="grid grid-cols-12 gap-space-xs py-space-xs items-stretch">
<div className="col-span-2 flex flex-col items-center justify-center bg-surface-container-lowest rounded-lg p-space-xs shadow-sm">
<span className="font-caption text-caption font-bold text-text-primary">02:00 PM</span>
<span className="font-caption text-caption text-text-secondary text-[11px]">Afternoon Run</span>
</div>
{/* Faculty Fast-Track Pickup */}
<div className="col-span-4 bg-primary text-on-primary rounded-lg p-space-sm shadow-sm flex flex-col justify-between">
<div className="flex items-start justify-between">
<div>
<div className="flex items-center gap-1.5">
<span className="font-body-medium text-body-medium font-bold text-on-primary">Dr. Aris Thorne</span>
<span className="bg-action-green text-text-primary font-caption text-caption px-1.5 py-0.2 rounded text-[10px] font-bold">Faculty VIP</span>
</div>
<p className="font-small text-small text-primary-fixed font-semibold truncate">Philippine Cartography 1320–1898</p>
<p className="font-caption text-caption text-primary-fixed-dim">ID: #RES-FAC-019 • Special Archive</p>
</div>
<div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-on-primary">
<span className="material-symbols-outlined text-sm">stars</span>
</div>
</div>
<div className="flex items-center justify-between pt-2">
<span className="font-caption text-caption text-primary-fixed">Hold Vault Desk 01</span>
<span className="bg-primary-container text-on-primary font-caption text-caption px-2 py-0.5 rounded-full text-[10px] font-bold">Fast-Track Scheduled</span>
</div>
</div>
{/* Overdue Risk Return: Beatrice Gomez */}
<div className="col-span-3 bg-error-container/40 rounded-lg p-space-sm shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between">
<span className="font-small text-small font-bold text-text-primary">Beatrice Gomez</span>
<span className="bg-status-danger text-on-primary font-caption text-caption px-1.5 py-0.2 rounded text-[10px] font-bold">Risk</span>
</div>
<p className="font-caption text-caption text-text-primary font-medium truncate">Artificial Intelligence: Modern Approach</p>
<span className="font-caption text-caption text-status-danger font-medium">+1 Day Grace Period Ending</span>
</div>
<div className="flex items-center justify-between pt-1">
<span className="text-[11px] text-text-secondary">Fine Pending: ₱50.00</span>
<span className="bg-status-danger text-on-primary font-caption text-caption px-2 py-0.5 rounded-full text-[10px] font-bold">Overdue Risk</span>
</div>
</div>
{/* Reassigned Locker Slot (Auto Conflict Resolved) */}
<div className="col-span-3 bg-surface-container-lowest rounded-lg p-space-sm shadow-sm flex flex-col justify-between">
<div>
<div className="flex items-center justify-between">
<span className="font-caption text-caption font-bold text-text-primary">Staging Locker #C-01</span>
<span className="material-symbols-outlined text-status-available text-sm">swap_horiz</span>
</div>
<p className="font-caption text-caption text-text-secondary">Reassigned from #B-04 for Patron Hold #HLD-9942</p>
</div>
<div className="flex items-center justify-between pt-1">
<span className="text-[11px] text-status-available font-bold">Ready for Pickup</span>
<span className="bg-surface-container text-primary font-caption text-caption px-2 py-0.5 rounded text-[10px] font-bold">Rerouted</span>
</div>
</div>
</div>
{/* Timeslot Row: 04:30 PM - 06:00 PM (Closing Windows) */}
<div className="grid grid-cols-12 gap-space-xs py-space-xs items-stretch">
<div className="col-span-2 flex flex-col items-center justify-center bg-surface-container-lowest rounded-lg p-space-xs shadow-sm">
<span className="font-caption text-caption font-bold text-text-primary">04:30 PM</span>
<span className="font-caption text-caption text-text-secondary text-[11px]">Evening Cycle</span>
</div>
{/* Pickup Hold: Julian Valenzuela */}
<div className="col-span-4 bg-surface-container-lowest rounded-lg p-space-sm shadow-sm flex flex-col justify-between">
<div>
<span className="font-body-medium text-body-medium font-bold text-text-primary">Julian Valenzuela</span>
<p className="font-small text-small text-primary font-semibold truncate">Design of Everyday Things</p>
<span className="font-caption text-caption text-text-secondary">ID: #RES-8914 • Desk Bay 01</span>
</div>
<div className="flex items-center justify-between pt-1">
<span className="font-caption text-caption text-text-secondary">Contacted via SMS</span>
<span className="bg-soft-blue text-primary font-caption text-caption px-2 py-0.5 rounded-full text-[10px] font-bold">Awaiting Arrival</span>
</div>
</div>
{/* Return Window Closing: Mateo Santos */}
<div className="col-span-3 bg-status-pending/10 rounded-lg p-space-sm shadow-sm flex flex-col justify-between">
<div>
<span className="font-small text-small font-bold text-text-primary">Mateo Santos</span>
<p className="font-caption text-caption text-secondary font-semibold truncate">Introduction to Algorithms (CLRS)</p>
<span className="font-caption text-caption text-text-secondary">Counter Return Window Closes 5:00 PM</span>
</div>
<div className="flex items-center justify-between pt-1">
<span className="text-[11px] text-status-pending font-bold">Closing Soon</span>
<span className="bg-status-pending text-on-primary font-caption text-caption px-2 py-0.5 rounded-full text-[10px] font-bold">Expiring Hold</span>
</div>
</div>
{/* Smart Drop Final Flush */}
<div className="col-span-3 bg-surface-container-lowest rounded-lg p-space-sm shadow-sm flex flex-col justify-between">
<div>
<span className="font-caption text-caption font-bold text-text-primary">Night Drop Seal &amp; Lock</span>
<p className="font-caption text-caption text-text-secondary">Bay Locker system switches to auto-dispense</p>
</div>
<div className="flex items-center justify-between pt-1">
<span className="text-[11px] text-text-secondary">Auto Timer 08:00 PM</span>
<span className="bg-surface-container text-text-secondary font-caption text-caption px-2 py-0.5 rounded text-[10px] font-bold">Automated</span>
</div>
</div>
</div>
</div>
</div>
{/* Quick Dispatch & Slot Finder Interactive Toolbar */}
<div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-sm bg-surface-container-low p-space-md rounded-xl">
<div className="flex items-center gap-space-md w-full sm:w-auto">
<div className="w-10 h-10 rounded-xl bg-primary-container text-on-primary flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-xl">qr_code_scanner</span>
</div>
<div className="flex flex-col">
<span className="font-body-medium text-body-medium text-text-primary font-bold">Fast Time Slot Reservation Scanner</span>
<span className="font-caption text-caption text-text-secondary">Instantly find the next free locker or cashier pickup bay</span>
</div>
</div>
<div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
<button className="px-space-md py-2 rounded-lg bg-surface-container-lowest text-primary hover:bg-surface-container font-small text-small font-bold transition-all shadow-sm" type="button">
            Check Locker Grid
          </button>
<button className="px-space-md py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-small text-small font-bold transition-all shadow-sm" type="button">
            Quick Book Window
          </button>
</div>
</div>
</div>
{/* Right Column: Chronological Agenda & Dynamic Return Date Calculator (4 Columns on XL) */}
<div className="xl:col-span-4 flex flex-col gap-space-lg">
{/* Today's Pending Milestones Chronological Agenda */}
<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md">
<div className="flex items-center justify-between pb-space-xs">
<div className="flex items-center gap-space-xs">
<span className="material-symbols-outlined text-primary text-xl">checklist_rtl</span>
<h3 className="font-headline-4 text-headline-4 text-text-primary">Today's Agenda</h3>
</div>
<span className="bg-soft-blue text-primary font-caption text-caption font-bold px-2 py-0.5 rounded-full">4 Pending</span>
</div>
<div className="relative flex flex-col gap-space-md pl-space-md before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-high">
{/* Milestone 1: 09:30 AM */}
<div className="relative flex flex-col gap-1 group">
<div className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full bg-primary ring-4 ring-surface-container-lowest shadow-sm"></div>
<div className="flex items-center justify-between">
<span className="font-caption text-caption font-bold text-primary tracking-wide">09:30 AM • Pickup Hold</span>
<span className="bg-status-available/15 text-status-available font-caption text-caption font-bold px-2 py-0.2 rounded text-[11px]">Ready</span>
</div>
<span className="font-body-medium text-body-medium font-bold text-text-primary group-hover:text-primary transition-colors">Sofia Morales</span>
<span className="font-small text-small text-text-secondary">Clean Code (Robert C. Martin)</span>
<div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption mt-1">
<span className="material-symbols-outlined text-sm text-text-secondary">lock</span>
<span className="">Staged in Locker #A-02 • Bay 01</span>
</div>
</div>
{/* Milestone 2: 11:00 AM */}
<div className="relative flex flex-col gap-1 group">
<div className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full bg-secondary ring-4 ring-surface-container-lowest shadow-sm"></div>
<div className="flex items-center justify-between">
<span className="font-caption text-caption font-bold text-secondary tracking-wide">11:00 AM • Return Due</span>
<span className="bg-status-pending/20 text-status-pending font-caption text-caption font-bold px-2 py-0.2 rounded text-[11px]">High Demand</span>
</div>
<span className="font-body-medium text-body-medium font-bold text-text-primary group-hover:text-secondary transition-colors">Marcus Aurelius</span>
<span className="font-small text-small text-text-secondary">Structure &amp; Interpretation of Comp Programs</span>
<div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption mt-1">
<span className="material-symbols-outlined text-sm text-text-secondary">counter_1</span>
<span className="">Front Desk Counter Return #01</span>
</div>
</div>
{/* Milestone 3: 02:00 PM */}
<div className="relative flex flex-col gap-1 group">
<div className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full bg-action-green ring-4 ring-surface-container-lowest shadow-sm"></div>
<div className="flex items-center justify-between">
<span className="font-caption text-caption font-bold text-text-primary tracking-wide">02:00 PM • Faculty Fast-Track</span>
<span className="bg-primary text-on-primary font-caption text-caption font-bold px-2 py-0.2 rounded text-[11px]">Archival</span>
</div>
<span className="font-body-medium text-body-medium font-bold text-text-primary group-hover:text-primary transition-colors">Dr. Aris Thorne</span>
<span className="font-small text-small text-text-secondary">Philippine Cartography (Rare Folio 1898)</span>
<div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption mt-1">
<span className="material-symbols-outlined text-sm text-text-secondary">verified</span>
<span className="">Requires Librarian Signature Check</span>
</div>
</div>
{/* Milestone 4: 04:30 PM */}
<div className="relative flex flex-col gap-1 group">
<div className="absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full bg-status-danger ring-4 ring-surface-container-lowest shadow-sm"></div>
<div className="flex items-center justify-between">
<span className="font-caption text-caption font-bold text-status-danger tracking-wide">04:30 PM • Return Closing</span>
<span className="bg-status-danger/15 text-status-danger font-caption text-caption font-bold px-2 py-0.2 rounded text-[11px]">Expiring</span>
</div>
<span className="font-body-medium text-body-medium font-bold text-text-primary group-hover:text-status-danger transition-colors">Mateo Santos</span>
<span className="font-small text-small text-text-secondary">Introduction to Algorithms (CLRS 4th Ed.)</span>
<div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption mt-1">
<span className="material-symbols-outlined text-sm text-text-secondary">schedule</span>
<span className="">Final SMS Notice Sent at 08:30 AM</span>
</div>
</div>
</div>
</div>
{/* Dynamic Return Date Calculation Card */}
<div className="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm flex flex-col gap-space-md relative overflow-hidden">
<div className="flex items-center justify-between">
<div className="flex items-center gap-space-xs">
<div className="w-8 h-8 rounded-lg bg-soft-blue text-primary flex items-center justify-center">
<span className="material-symbols-outlined text-lg">calculate</span>
</div>
<h3 className="font-headline-4 text-headline-4 text-text-primary">Due Date Calculator</h3>
</div>
<span className="font-caption text-caption text-text-secondary">Auto Policy Engine</span>
</div>
<p className="font-caption text-caption text-text-secondary">
          Simulate patron loan periods and preview automated grace periods, holiday roll-forwards, and projected due dates.
        </p>
{/* Loan Duration Chips */}
<div className="flex flex-col gap-space-xs">
<label className="font-caption text-caption text-text-secondary uppercase tracking-wider font-bold">Standard Loan Period</label>
<div className="grid grid-cols-3 gap-space-xs" id="duration-selector">
<button className="duration-btn py-2.5 px-space-sm rounded-xl font-small text-small font-bold text-center bg-surface-container text-text-primary hover:bg-soft-blue transition-all" data-days="7" type="button">
              7 Days
            </button>
<button className="duration-btn py-2.5 px-space-sm rounded-xl font-small text-small font-bold text-center bg-primary text-on-primary shadow-sm transition-all" data-days="14" type="button">
              14 Days
            </button>
<button className="duration-btn py-2.5 px-space-sm rounded-xl font-small text-small font-bold text-center bg-surface-container text-text-primary hover:bg-soft-blue transition-all" data-days="21" type="button">
              21 Days
            </button>
</div>
</div>
{/* Start Date & Patron Type Selectors */}
<div className="grid grid-cols-2 gap-space-sm">
<div className="flex flex-col gap-1">
<label className="font-caption text-caption text-text-secondary font-semibold">Start Date</label>
<div className="bg-surface-container-low px-space-sm py-2 rounded-lg flex items-center justify-between">
<span className="font-small text-small text-text-primary font-medium" id="start-date-display">Oct 26, 2026</span>
<span className="material-symbols-outlined text-base text-text-secondary">calendar_month</span>
</div>
</div>
<div className="flex flex-col gap-1">
<label className="font-caption text-caption text-text-secondary font-semibold">Patron Tier</label>
<div className="bg-surface-container-low px-space-sm py-2 rounded-lg flex items-center justify-between">
<span className="font-small text-small text-text-primary font-medium">Undergraduate</span>
<span className="material-symbols-outlined text-base text-text-secondary">badge</span>
</div>
</div>
</div>
{/* Calculated Outcome Panel */}
<div className="bg-soft-blue/60 p-space-md rounded-xl flex flex-col gap-space-xs">
<div className="flex items-center justify-between">
<span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">Projected Return Window</span>
<span className="bg-action-green text-text-primary font-caption text-caption font-bold px-2 py-0.5 rounded-full">Zero Overlaps</span>
</div>
<div className="flex items-baseline gap-space-xs">
<span className="font-headline-3 text-headline-3 text-primary font-bold" id="calculated-due-date">Nov 09, 2026</span>
<span className="font-body-medium text-body-medium text-text-secondary font-medium">at 08:00 PM</span>
</div>
<div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption mt-1">
<span className="material-symbols-outlined text-sm text-status-available">check_circle</span>
<span className="">Includes 24-hr grace buffer before overdue late fees trigger.</span>
</div>
</div>
{/* Action Button */}
<button className="w-full py-3 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-small text-small font-bold transition-all shadow-sm flex items-center justify-center gap-2" type="button">
<span className="material-symbols-outlined text-lg">schedule_send</span>
<span className="">Apply Date to Current Checkout</span>
</button>
</div>
{/* Station Status Card with Photo Presence */}
<div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm flex items-center gap-space-md">
<div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm">
<img className="w-full h-full object-cover" data-alt="A modern university library circulation counter station with ambient blue lighting, oak wood desk fixtures, touch terminal screens, organized book stacks, and tranquil natural morning light pouring through minimalist architectural windows." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiO8a7GetruKTj7xcZ79hg1a5TquBIBavD9ju80GbBPnE8dxN7CIYakb1zr9S-xLahTNsQnEZqlsAYt6bhE1eu4rvzrT2LBUttyS9EePz33ZChUUhyvbPrshxK64UrCA5LKt8_6bA8ZyMDck-HXtRUs0g8xaTC3koRZBG9-LtEqJTV0AU9Yij8otazuqW7Gtt4tBXA1Vjl_k8YBDneMYIQl8rMDBiwMUPxKzJN0cbdwgnAXk1MgKdO" />
</div>
<div className="flex flex-col">
<span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-bold">Bay 01 Capacity</span>
<span className="font-body-medium text-body-medium font-bold text-text-primary">Desk 01 • Staging Bay A</span>
<span className="font-caption text-caption text-status-available font-semibold">12 Locker Dispatches Pending Today</span>
</div>
</div>
</div>
</section>
</div>

    </div>
  );
};

export default Schedules;
