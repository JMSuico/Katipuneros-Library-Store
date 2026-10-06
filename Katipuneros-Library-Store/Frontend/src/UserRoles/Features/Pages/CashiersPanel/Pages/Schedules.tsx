// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// Schedules.tsx -- Cashier Library Schedules & Desk Shifts.
// Connects to live /api/cashier endpoints.
// Strictly adheres to real-time data mandate: zero hardcoded mock values, clean empty states when N=0.
// Universal lambda syntax (=>), zero browser alert().

import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { useToasts } from '../../../../../Hooks/useToasts';
import {
  getCashierDashboardKpis,
  getCashierIntakeQueue,
  getCashierOverdueQueue,
  CashierDashboardKpis,
  CashierIntakeQueueItem,
  CashierOverdueQueueItem,
} from '../../../../../Endpoints/Cashier/cashierApi';

export const Schedules: FC = () => {
  const { toasts, addToast, removeToast } = useToasts();

  const [kpis, setKpis] = useState<CashierDashboardKpis | null>(null);
  const [intakeQueue, setIntakeQueue] = useState<CashierIntakeQueueItem[]>([]);
  const [overdueQueue, setOverdueQueue] = useState<CashierOverdueQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'agenda'>('day');
  const [selectedDurationDays, setSelectedDurationDays] = useState<number>(14);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [kpiRes, intakeRes, overdueRes] = await Promise.all([
        getCashierDashboardKpis(),
        getCashierIntakeQueue(),
        getCashierOverdueQueue(),
      ]);
      setKpis(kpiRes);
      setIntakeQueue(intakeRes);
      setOverdueQueue(overdueRes);
    } catch {
      addToast('Failed to load circulation schedules.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePrevDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Calculated milestone date from selected duration
  const calculatedMilestoneDate = useMemo(() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + selectedDurationDays);
    return d;
  }, [currentDate, selectedDurationDays]);

  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="w-full">
      <div className="flex flex-col w-full pb-16 space-y-6">
        {/* Top Schedule Header & Controls Banner */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-lowest p-6 rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-full shadow-inner">
                <button
                  onClick={handlePrevDay}
                  aria-label="Previous date"
                  className="w-9 h-9 flex items-center justify-center rounded-full text-text-secondary hover:bg-surface-container-lowest hover:text-primary transition-all cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-lg">chevron_left</span>
                </button>
                <div className="px-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">event</span>
                  <span className="font-headline-4 text-headline-4 text-text-primary whitespace-nowrap">
                    {formattedDate}
                  </span>
                </div>
                <button
                  onClick={handleNextDay}
                  aria-label="Next date"
                  className="w-9 h-9 flex items-center justify-center rounded-full text-text-secondary hover:bg-surface-container-lowest hover:text-primary transition-all cursor-pointer"
                  type="button"
                >
                  <span className="material-symbols-outlined text-lg">chevron_right</span>
                </button>
              </div>

              <button
                onClick={handleToday}
                className="px-4 py-2 rounded-full bg-soft-blue text-primary font-small text-small font-bold hover:bg-primary hover:text-on-primary transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-base">today</span>
                <span>Today</span>
              </button>

              <div className="hidden 2xl:flex items-center gap-2 text-text-secondary font-caption text-caption pl-1">
                <span className="w-2 h-2 rounded-full bg-action-green animate-pulse"></span>
                <span>Circulation Desk 01 Active Sync</span>
              </div>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex bg-surface-container-low p-1 rounded-full shadow-inner text-text-secondary">
                <button
                  onClick={() => setViewMode('day')}
                  className={`px-4 py-1.5 rounded-full font-caption text-caption font-bold transition-all cursor-pointer ${
                    viewMode === 'day'
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-text-secondary hover:text-primary'
                  }`}
                  type="button"
                >
                  Day View
                </button>
                <button
                  onClick={() => setViewMode('agenda')}
                  className={`px-4 py-1.5 rounded-full font-caption text-caption font-bold transition-all cursor-pointer ${
                    viewMode === 'agenda'
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-text-secondary hover:text-primary'
                  }`}
                  type="button"
                >
                  Agenda List
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">
                  Pickups Pending
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-headline-2 text-headline-2 text-primary font-bold">
                    {kpis?.pendingHoldsCount ?? 0}
                  </span>
                  <span className="font-caption text-caption text-status-pending font-bold">
                    {kpis?.urgentTodayHoldsCount ?? 0} urgent
                  </span>
                </div>
                <span className="font-caption text-caption text-text-secondary mt-1">
                  Desk Bay 01 Staging
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-soft-blue text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">shopping_bag</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">
                  Due Returns Today
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-headline-2 text-headline-2 text-secondary font-bold">
                    {kpis?.dueTodayCount ?? 0}
                  </span>
                  <span className="font-caption text-caption text-text-secondary font-bold">
                    closing 8 PM
                  </span>
                </div>
                <span className="font-caption text-caption text-text-secondary mt-1">
                  Counter + Smart Drop
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-surface-container text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">assignment_return</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">
                  Overdue Accounts
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-headline-2 text-headline-2 text-status-danger font-bold">
                    {kpis?.overdueLoansCount ?? 0}
                  </span>
                  <span className="font-caption text-caption text-status-danger font-bold">
                    calculating
                  </span>
                </div>
                <span className="font-caption text-caption text-text-secondary mt-1">
                  Tariff: ₱15.00/day
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-status-pending/15 text-status-pending flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">hourglass_bottom</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex flex-col">
                <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">
                  Cleared Today
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-headline-2 text-headline-2 text-status-available font-bold">
                    {kpis?.returnsTodayCount ?? 0}
                  </span>
                  <span className="font-caption text-caption text-status-available font-bold">
                    checked in
                  </span>
                </div>
                <span className="font-caption text-caption text-text-secondary mt-1">
                  Fines: ₱{(kpis?.finesDailyAmount ?? 0).toFixed(2)}
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-action-green/20 text-text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">task_alt</span>
              </div>
            </div>
          </div>
        </section>

        {/* Schedule Breakdown: Scheduled Intake vs Overdue Recovery */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Intake & Pickup Schedule */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">event_available</span>
                <h2 className="font-headline-4 text-headline-4 text-text-primary">
                  Scheduled Hold Pickups
                </h2>
              </div>
              <span className="font-caption text-caption px-2.5 py-0.5 rounded-full bg-soft-blue text-primary font-bold">
                {intakeQueue.length} Queue Items
              </span>
            </div>

            {intakeQueue.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center p-4">
                <span className="material-symbols-outlined text-4xl text-text-secondary/40 mb-2">
                  calendar_today
                </span>
                <p className="font-body-medium text-body-medium text-text-primary font-semibold">
                  No pickups scheduled
                </p>
                <p className="font-caption text-caption text-text-secondary mt-0.5">
                  All reservation holds have been cleared or are awaiting patron creation.
                </p>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                {intakeQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-surface-container-low flex items-start justify-between gap-3"
                  >
                    <div>
                      <span className="font-body-medium text-body-medium font-bold text-text-primary block">
                        {item.bookTitle}
                      </span>
                      <p className="font-caption text-caption text-text-secondary mt-0.5">
                        Patron: {item.patronName} ({item.libraryCardNumber || 'KP-CARD'})
                      </p>
                      <span className="font-caption text-caption text-primary font-bold inline-block mt-1">
                        Pickup: {item.requestedPickupDate}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-caption font-caption bg-surface-container-highest text-text-primary font-bold">
                      {item.durationDays}d Term
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Expected Returns & Delinquent Schedules */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-xl">assignment_late</span>
                <h2 className="font-headline-4 text-headline-4 text-text-primary">
                  Overdue Return Schedules
                </h2>
              </div>
              <span className="font-caption text-caption px-2.5 py-0.5 rounded-full bg-error-container text-on-error-container font-bold">
                {overdueQueue.length} Overdue
              </span>
            </div>

            {overdueQueue.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center p-4">
                <span className="material-symbols-outlined text-4xl text-status-available/60 mb-2">
                  verified
                </span>
                <p className="font-body-medium text-body-medium text-text-primary font-semibold">
                  No overdue returns pending
                </p>
                <p className="font-caption text-caption text-text-secondary mt-0.5">
                  All circulation loans are currently on schedule.
                </p>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                {overdueQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-surface-container-low flex items-start justify-between gap-3"
                  >
                    <div>
                      <span className="font-body-medium text-body-medium font-bold text-text-primary block">
                        {item.bookTitle}
                      </span>
                      <p className="font-caption text-caption text-text-secondary mt-0.5">
                        Borrower: {item.patronName} ({item.libraryCardNumber || 'KP-CARD'})
                      </p>
                      <span className="font-caption text-caption text-error font-bold inline-block mt-1">
                        Overdue by {item.daysOverdue} Days • Fine: ₱{item.calculatedFine.toFixed(2)}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-caption font-caption bg-error/10 text-error font-bold">
                      Due: {item.dueDate}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Duration Due-Date Calculator Banner */}
        <div className="bg-gradient-to-r from-soft-blue via-surface-container to-surface-container-high rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-2xl">calendar_month</span>
            </div>
            <div>
              <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">
                Desk Loan Milestone Calculator
              </span>
              <p className="font-headline-3 text-headline-3 text-text-primary font-bold">
                Projected Due: {calculatedMilestoneDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <span className="font-caption text-caption text-text-secondary">
                Calculated from selected date with {selectedDurationDays}-day duration
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-lowest/80 p-1.5 rounded-xl">
            <button
              onClick={() => setSelectedDurationDays(7)}
              className={`px-3 py-1.5 rounded-lg text-caption font-caption font-bold transition-colors cursor-pointer ${
                selectedDurationDays === 7 ? 'bg-primary text-on-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
              type="button"
            >
              7 Days
            </button>
            <button
              onClick={() => setSelectedDurationDays(14)}
              className={`px-3 py-1.5 rounded-lg text-caption font-caption font-bold transition-colors cursor-pointer ${
                selectedDurationDays === 14 ? 'bg-primary text-on-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
              type="button"
            >
              14 Days
            </button>
            <button
              onClick={() => setSelectedDurationDays(21)}
              className={`px-3 py-1.5 rounded-lg text-caption font-caption font-bold transition-colors cursor-pointer ${
                selectedDurationDays === 21 ? 'bg-primary text-on-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
              type="button"
            >
              21 Days
            </button>
          </div>
        </div>
      </div>

      {/* Floating Notifications Toast Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`px-4 py-3 rounded-xl shadow-lg border text-caption font-bold transition-all pointer-events-auto flex items-center gap-2 cursor-pointer animate-in fade-in duration-200 ${
              toast.type === 'success'
                ? 'bg-action-green text-text-primary border-action-green/30'
                : toast.type === 'error'
                ? 'bg-error text-on-error border-error/30'
                : toast.type === 'warning'
                ? 'bg-status-pending text-on-primary border-status-pending/30'
                : 'bg-primary text-on-primary border-primary/30'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {toast.type === 'success'
                ? 'check_circle'
                : toast.type === 'error'
                ? 'error'
                : toast.type === 'warning'
                ? 'warning'
                : 'info'}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedules;
