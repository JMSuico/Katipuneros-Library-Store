import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToasts } from '../../../../../Hooks/useToasts';
import {
  getCashierDashboardKpis,
  getCashierIntakeQueue,
  getCashierOverdueQueue,
  CashierDashboardKpis,
  CashierIntakeQueueItem,
  CashierOverdueQueueItem,
} from '../../../../../Endpoints/Cashier/cashierApi';
import { RadioGroup } from '../../../../../Shared/RadioButton';
import { SearchBar, useDebounce } from '../../../../../Shared/SearchBar';
import { usePagination } from '../../../../../Hooks/usePagination';
import { useTableDraggable } from '../../../../../Hooks/useTableDraggable';

interface UnifiedScheduleItem {
  id: string;
  type: 'pickup' | 'overdue';
  title: string;
  patronName: string;
  libraryCardNumber: string;
  dateLabel: string;
  badge: string;
  badgeType: 'primary' | 'danger';
  targetQuery: string;
  actionLabel: string;
  rawItem: CashierIntakeQueueItem | CashierOverdueQueueItem;
}

export const Schedules: FC = () => {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToasts();

  const [kpis, setKpis] = useState<CashierDashboardKpis | null>(null);
  const [intakeQueue, setIntakeQueue] = useState<CashierIntakeQueueItem[]>([]);
  const [overdueQueue, setOverdueQueue] = useState<CashierOverdueQueueItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDurationDays, setSelectedDurationDays] = useState<number>(14);

  // View state & primitives
  const [viewMode, setViewMode] = useState<string>(() => {
    return localStorage.getItem('cashier_schedules_view') || 'table';
  });

  const { containerRef: tableContainerRef } = useTableDraggable<HTMLDivElement>();

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
    localStorage.setItem('cashier_schedules_view', mode);
  };

  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [typeFilter, setTypeFilter] = useState<'all' | 'pickup' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc' | 'patron-asc' | 'title-asc'>('date-asc');

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

  // Unified items
  const unifiedItems: UnifiedScheduleItem[] = useMemo(() => {
    const pickups: UnifiedScheduleItem[] = intakeQueue.map((item) => ({
      id: `pickup-${item.id}`,
      type: 'pickup',
      title: item.bookTitle,
      patronName: item.patronName,
      libraryCardNumber: item.libraryCardNumber || 'KP-CARD',
      dateLabel: `Pickup: ${item.requestedPickupDate}`,
      badge: `${item.durationDays}d Hold Term`,
      badgeType: 'primary',
      targetQuery: item.libraryCardNumber || item.patronName,
      actionLabel: 'Release Hold',
      rawItem: item,
    }));

    const overdues: UnifiedScheduleItem[] = overdueQueue.map((item) => ({
      id: `overdue-${item.id}`,
      type: 'overdue',
      title: item.bookTitle,
      patronName: item.patronName,
      libraryCardNumber: item.libraryCardNumber || 'KP-CARD',
      dateLabel: `Due: ${item.dueDate} (${item.daysOverdue}d overdue)`,
      badge: `₱${item.calculatedFine.toFixed(2)} Fine`,
      badgeType: 'danger',
      targetQuery: item.barcode || item.libraryCardNumber,
      actionLabel: 'Process Return',
      rawItem: item,
    }));

    return [...pickups, ...overdues];
  }, [intakeQueue, overdueQueue]);

  // Filtered and Sorted
  const filteredItems = useMemo(() => {
    const list = unifiedItems
      .filter((item) => {
        if (typeFilter === 'pickup') return item.type === 'pickup';
        if (typeFilter === 'overdue') return item.type === 'overdue';
        return true;
      })
      .filter((item) => {
        if (!debouncedSearch.trim()) return true;
        const q = debouncedSearch.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.patronName.toLowerCase().includes(q) ||
          item.libraryCardNumber.toLowerCase().includes(q) ||
          item.dateLabel.toLowerCase().includes(q)
        );
      });

    return [...list].sort((a, b) => {
      if (sortBy === 'patron-asc') return a.patronName.localeCompare(b.patronName);
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
      if (sortBy === 'date-asc') return a.dateLabel.localeCompare(b.dateLabel);
      if (sortBy === 'date-desc') return b.dateLabel.localeCompare(a.dateLabel);
      return 0;
    });
  }, [unifiedItems, typeFilter, debouncedSearch, sortBy]);

  // Pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    startIndex,
    endIndex,
    canNextPage,
    canPrevPage,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    pageSizeOptions,
  } = usePagination(filteredItems, { initialPageSize: 10, pageSizeOptions: [10, 25, 50, 100] });

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

            {/* View Switcher RadioGroup & Sync Action */}
            <div className="flex flex-wrap items-center gap-2">
              <RadioGroup
                name="cashierSchedulesView"
                selectedValue={viewMode}
                onChange={handleViewModeChange}
                options={[
                  { value: 'table', label: 'Table' },
                  { value: 'card', label: 'Cards' },
                ]}
                variant="simple"
              />

              <button
                onClick={() => {
                  loadData();
                  addToast('Circulation schedules synchronized.', 'info');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-caption text-caption font-bold transition-colors cursor-pointer"
                type="button"
              >
                <span className="material-symbols-outlined text-base">sync</span>
                <span>Refresh</span>
              </button>
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

        {/* Search, Filter & Sort Bar */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex-1 max-w-xl">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Search schedule by book title, patron, or card #..."
            />
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-caption font-caption font-bold transition-colors cursor-pointer ${
                  typeFilter === 'all'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                All Events ({unifiedItems.length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('pickup')}
                className={`px-3 py-1.5 rounded-lg text-caption font-caption font-bold transition-colors cursor-pointer ${
                  typeFilter === 'pickup'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Hold Pickups ({intakeQueue.length})
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('overdue')}
                className={`px-3 py-1.5 rounded-lg text-caption font-caption font-bold transition-colors cursor-pointer ${
                  typeFilter === 'overdue'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Overdue Returns ({overdueQueue.length})
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort schedule events"
              className="px-3 py-2 bg-surface-container-low rounded-xl text-caption font-caption font-bold text-text-primary outline-none cursor-pointer border border-outline/10"
            >
              <option value="date-asc">Date (Earliest First)</option>
              <option value="date-desc">Date (Latest First)</option>
              <option value="patron-asc">Patron: A to Z</option>
              <option value="title-asc">Book Title: A to Z</option>
            </select>
          </div>
        </div>

        {/* Schedule Queue Section (Table & Cards) */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="font-caption text-caption text-text-secondary mt-2">Loading shift schedule...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center p-6">
              <span className="material-symbols-outlined text-5xl text-status-available/60 mb-2">
                verified
              </span>
              <p className="font-body-medium text-body-medium text-text-primary font-semibold">
                No scheduled queue events found
              </p>
              <p className="font-caption text-caption text-text-secondary max-w-sm mt-1">
                {searchQuery
                  ? `No events matching "${searchQuery}". Clear query to view all items.`
                  : 'All holds and return deadlines are currently clear.'}
              </p>
            </div>
          ) : (
            <>
              {/* Table Container (Kept mounted with ref to preserve drag listeners) */}
              <div
                ref={tableContainerRef}
                className={viewMode === 'table' ? 'overflow-x-auto' : 'hidden'}
              >
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-surface-container-low text-text-secondary font-caption text-caption uppercase tracking-wider">
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Circulation Item</th>
                      <th className="py-3 px-4">Patron Account</th>
                      <th className="py-3 px-4">Schedule / Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high/40 text-small font-small">
                    {paginatedItems.map((item) => (
                      <tr key={item.id} className="hover:bg-surface-container-low/60 transition-colors">
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-caption text-caption font-bold ${
                              item.type === 'pickup'
                                ? 'bg-soft-blue text-primary'
                                : 'bg-error-container text-on-error-container'
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs">
                              {item.type === 'pickup' ? 'shopping_bag' : 'warning'}
                            </span>
                            {item.type === 'pickup' ? 'Hold Pickup' : 'Overdue Return'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-body-medium text-body-medium font-bold text-text-primary">
                              {item.title}
                            </span>
                            <span className="font-caption text-caption text-text-secondary mt-0.5">
                              {item.type === 'pickup'
                                ? `Bay: ${(item.rawItem as CashierIntakeQueueItem).stacksLocation || 'Desk Bay 01'}`
                                : `Barcode: ${(item.rawItem as CashierOverdueQueueItem).barcode || 'N/A'}`}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-text-primary">
                              {item.patronName}
                            </span>
                            <span className="font-caption text-caption text-text-secondary font-mono">
                              Card: {item.libraryCardNumber}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span
                              className={`font-bold ${
                                item.type === 'pickup' ? 'text-primary' : 'text-error'
                              }`}
                            >
                              {item.dateLabel}
                            </span>
                            <span className="font-caption text-caption text-text-secondary mt-0.5">
                              {item.badge}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => {
                              if (item.type === 'pickup') {
                                navigate(`/cashier/checkout?query=${encodeURIComponent(item.targetQuery)}`);
                              } else {
                                navigate(`/cashier/returns?barcode=${encodeURIComponent(item.targetQuery)}`);
                              }
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-small text-small font-semibold transition-colors cursor-pointer ${
                              item.type === 'pickup'
                                ? 'bg-primary hover:bg-primary-hover text-on-primary'
                                : 'bg-surface-container hover:bg-surface-container-high text-primary'
                            }`}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-base">
                              {item.type === 'pickup' ? 'shopping_cart_checkout' : 'assignment_return'}
                            </span>
                            <span>{item.actionLabel}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards Grid View */}
              {viewMode === 'card' && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-between border border-outline/10 hover:border-primary/20 transition-all shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-caption text-caption font-bold ${
                              item.type === 'pickup'
                                ? 'bg-soft-blue text-primary'
                                : 'bg-error-container text-on-error-container'
                            }`}
                          >
                            <span className="material-symbols-outlined text-xs">
                              {item.type === 'pickup' ? 'shopping_bag' : 'warning'}
                            </span>
                            {item.type === 'pickup' ? 'Hold Pickup' : 'Overdue'}
                          </span>
                          <span className="font-caption text-caption text-text-secondary font-mono">
                            {item.libraryCardNumber}
                          </span>
                        </div>

                        <h4 className="font-body-medium text-body-medium font-bold text-text-primary line-clamp-2">
                          {item.title}
                        </h4>
                        <p className="font-caption text-caption text-text-secondary mt-1">
                          Patron: <strong className="text-text-primary">{item.patronName}</strong>
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-caption font-caption">
                        <div>
                          <span className="text-text-secondary block">Timeline:</span>
                          <span
                            className={`font-bold ${
                              item.type === 'pickup' ? 'text-primary' : 'text-error'
                            }`}
                          >
                            {item.dateLabel}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-surface-container-highest font-bold text-text-primary">
                          {item.badge}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-end">
                        <button
                          onClick={() => {
                            if (item.type === 'pickup') {
                              navigate(`/cashier/checkout?query=${encodeURIComponent(item.targetQuery)}`);
                            } else {
                              navigate(`/cashier/returns?barcode=${encodeURIComponent(item.targetQuery)}`);
                            }
                          }}
                          className={`w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg font-small text-small font-semibold transition-colors cursor-pointer ${
                            item.type === 'pickup'
                              ? 'bg-primary hover:bg-primary-hover text-on-primary'
                              : 'bg-surface-container hover:bg-surface-container-high text-primary'
                          }`}
                          type="button"
                        >
                          <span className="material-symbols-outlined text-base">
                            {item.type === 'pickup' ? 'shopping_cart_checkout' : 'assignment_return'}
                          </span>
                          <span>{item.actionLabel}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination Footer */}
              <div className="p-4 border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-4 font-caption text-caption text-text-secondary">
                <div className="flex items-center gap-2">
                  <span>
                    Showing <span className="font-bold text-text-primary">{totalItems === 0 ? 0 : startIndex + 1}</span> to{' '}
                    <span className="font-bold text-text-primary">{Math.min(endIndex, totalItems)}</span> of{' '}
                    <span className="font-bold text-text-primary">{totalItems}</span> events
                  </span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <span>Rows:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      aria-label="Events per page"
                      className="bg-surface-container-low border border-outline/10 text-text-primary font-bold rounded-lg px-2 py-1 outline-none cursor-pointer"
                    >
                      {pageSizeOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => prevPage()}
                    disabled={!canPrevPage}
                    className="p-1.5 rounded-lg border border-outline/10 text-text-primary hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    type="button"
                    title="Previous page"
                  >
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                  </button>
                  <span className="px-3 font-bold text-text-primary">
                    Page {currentPage} of {Math.max(1, totalPages)}
                  </span>
                  <button
                    onClick={() => nextPage()}
                    disabled={!canNextPage}
                    className="p-1.5 rounded-lg border border-outline/10 text-text-primary hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    type="button"
                    title="Next page"
                  >
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                  </button>
                </div>
              </div>
            </>
          )}
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
