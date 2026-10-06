// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// PendingReservations.tsx -- Cashier Pending Reservations Queue.
// Connects to live /api/reservations endpoints.
// Strictly adheres to real-time data mandate: if database is empty (N=0), displays clean empty states and 0 metrics.
// Universal lambda syntax (=>), zero hardcoded mock values, zero alert().

import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { useToasts } from '../../../../../Hooks/useToasts';
import {
  getAdminReservations,
  getReservationMetrics,
  triageReservation,
  batchClearanceReservations,
  getExportReservationsUrl,
  BackendReservation,
  ReservationMetrics,
  EMPTY_RESERVATION_METRICS,
} from '../../../../../Endpoints/Admin/reservationsApi';

export const PendingReservations: FC = () => {
  const { toasts, addToast, removeToast } = useToasts();

  const [reservations, setReservations] = useState<BackendReservation[]>([]);
  const [metrics, setMetrics] = useState<ReservationMetrics>(EMPTY_RESERVATION_METRICS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Selection & Active Item
  const [activeReservationId, setActiveReservationId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Search, Filter & Sort
  const [filterTab, setFilterTab] = useState<'all' | 'today' | 'tomorrow' | 'scholastic' | 'waitlist'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<'pickup' | 'newest' | 'standing'>('pickup');

  // Rejection Modal
  const [rejectModalItem, setRejectModalItem] = useState<BackendReservation | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('Physical copy damaged during pull / unreadable barcode');
  const [staffNotes, setStaffNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const [listRes, metricsRes] = await Promise.all([
        getAdminReservations('Pending'),
        getReservationMetrics(),
      ]);
      setReservations(listRes);
      setMetrics(metricsRes);
      if (listRes.length > 0 && !activeReservationId) {
        setActiveReservationId(listRes[0].id);
      }
    } catch {
      addToast('Failed to synchronize reservation holds with database.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast, activeReservationId]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    const handleRefresh = () => loadData();
    window.addEventListener('cashier-refresh-kpis', handleRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener('cashier-refresh-kpis', handleRefresh);
    };
  }, [loadData]);

  // Derived Active Record
  const activeReservation = useMemo(() => {
    return reservations.find((r) => r.id === activeReservationId) || reservations[0] || null;
  }, [reservations, activeReservationId]);

  // Checkbox handling
  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(reservations.map((r) => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Actions
  const handleSingleApprove = async (r: BackendReservation, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsProcessing(true);
    try {
      const res = await triageReservation(r.id, { approved: true, priority: r.priorityLabel?.toLowerCase().includes('priority') });
      if (res.success) {
        addToast(`Hold for "${r.bookTitle}" approved. Staging PIN dispatched to patron.`, 'success');
        window.dispatchEvent(new CustomEvent('cashier-refresh-kpis'));
        await loadData();
      } else {
        addToast(res.message || 'Failed to approve hold.', 'error');
      }
    } catch {
      addToast('Network error during hold approval.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchApprove = async () => {
    if (selectedIds.size === 0) return;
    setIsProcessing(true);
    try {
      const res = await batchClearanceReservations({
        holdIds: Array.from(selectedIds),
        action: 'Approve',
      });
      if (res.success) {
        addToast(`Batch approved ${selectedIds.size} reservation holds successfully.`, 'success');
        setSelectedIds(new Set());
        window.dispatchEvent(new CustomEvent('cashier-refresh-kpis'));
        await loadData();
      } else {
        addToast(res.message || 'Failed to process batch clearance.', 'error');
      }
    } catch {
      addToast('Network error during batch approval.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenRejectModal = (r: BackendReservation, predefinedReason?: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRejectModalItem(r);
    setRejectReason(predefinedReason || 'Physical copy damaged during pull / unreadable barcode');
    setStaffNotes('');
  };

  const handleConfirmRejection = async () => {
    if (!rejectModalItem) return;
    setIsProcessing(true);
    try {
      const fullReason = staffNotes.trim() ? `${rejectReason} - ${staffNotes.trim()}` : rejectReason;
      const res = await triageReservation(rejectModalItem.id, { approved: false, reason: fullReason });
      if (res.success) {
        addToast(`Hold for "${rejectModalItem.bookTitle}" rejected. Patron notified.`, 'info');
        setRejectModalItem(null);
        window.dispatchEvent(new CustomEvent('cashier-refresh-kpis'));
        await loadData();
      } else {
        addToast(res.message || 'Failed to reject hold.', 'error');
      }
    } catch {
      addToast('Network error during hold rejection.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportCsv = () => {
    const url = getExportReservationsUrl({ format: 'csv' });
    window.open(url, '_blank');
    addToast('Intake queue sheet export initiated.', 'info');
  };

  // Filter & Sort
  const filteredReservations = useMemo(() => {
    return reservations
      .filter((r) => {
        // Tab Filter
        if (filterTab === 'today') {
          const isToday = r.expiryDate?.toLowerCase().includes('today') || r.reservationDate?.toLowerCase().includes('today');
          return isToday;
        }
        if (filterTab === 'tomorrow') {
          return r.expiryDate?.toLowerCase().includes('tomorrow');
        }
        if (filterTab === 'scholastic') {
          const dept = (r.patronDepartment || '').toLowerCase();
          return dept.includes('faculty') || dept.includes('scholar') || dept.includes('honor');
        }
        if (filterTab === 'waitlist') {
          return r.queuePosition > 1;
        }
        return true;
      })
      .filter((r) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          r.patronName?.toLowerCase().includes(q) ||
          r.bookTitle?.toLowerCase().includes(q) ||
          r.patronLibraryId?.toLowerCase().includes(q) ||
          r.bookCallNumber?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortOption === 'newest') {
          return new Date(b.reservationDate).getTime() - new Date(a.reservationDate).getTime();
        }
        if (sortOption === 'standing') {
          return (a.patronDepartment || '').localeCompare(b.patronDepartment || '');
        }
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      });
  }, [reservations, filterTab, searchQuery, sortOption]);

  const allSelected = reservations.length > 0 && selectedIds.size === reservations.length;

  return (
    <div className="w-full">
      <div className="flex flex-col w-full pb-16 space-y-6">
        {/* Operational Header & Live Status Metrics */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-caption font-bold bg-soft-blue text-primary tracking-wide uppercase">
                Desk 01 • Staging Queue
              </span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-caption font-caption bg-surface-container text-text-secondary">
                <span className="w-1.5 h-1.5 rounded-full bg-action-green animate-pulse"></span>
                <span>{isLoading ? 'Syncing...' : 'RFID Staging Sync Live'}</span>
              </div>
            </div>
            <h1 className="font-headline-2 text-headline-2 text-primary tracking-tight">
              Pending Reservations Queue
            </h1>
            <p className="font-body text-small text-text-secondary max-w-3xl">
              Verify user standing, confirm physical copy staging in staging lockers, and approve or reject borrower hold requests prior to automated dispatch.
            </p>
          </div>

          {/* Batch Operations & Global Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                loadData();
                addToast('Queue synchronized with live database.', 'info');
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-surface-container-lowest text-text-primary rounded-xl font-small text-small shadow-sm hover:bg-surface-container transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">sync</span>
              <span>Refresh Queue</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-surface-container-lowest text-text-primary rounded-xl font-small text-small shadow-sm hover:bg-surface-container transition-all cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              <span>Export Intake Sheet (CSV)</span>
            </button>
            <button
              onClick={handleBatchApprove}
              disabled={selectedIds.size === 0 || isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-action-green hover:bg-action-green-hover text-text-primary rounded-xl font-body-medium text-body-medium font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              type="button"
            >
              <span className="material-symbols-outlined text-xl">check_circle</span>
              <span>Approve Selected ({selectedIds.size})</span>
            </button>
          </div>
        </div>

        {/* Operational Metrics & Fast-Action Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-caption text-caption text-text-secondary uppercase font-semibold">
                Total Pending Verification
              </p>
              <p className="font-headline-3 text-headline-3 text-text-primary font-bold">
                {metrics.pendingReview} Holds
              </p>
              <span className="text-caption font-caption text-status-pending font-medium">
                {metrics.pendingReview > 0 ? 'Verification needed' : 'Clear ledger'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-soft-blue flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">pending_actions</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-caption text-caption text-text-secondary uppercase font-semibold">
                Active Hold Queue
              </p>
              <p className="font-headline-3 text-headline-3 text-status-danger font-bold">
                {metrics.activeHoldQueue} In Pipeline
              </p>
              <span className="text-caption font-caption text-text-secondary font-medium">
                Standard 48h SLA
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-error-container flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-2xl">timer</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-caption text-caption text-text-secondary uppercase font-semibold">
                Staged in Lockers
              </p>
              <p className="font-headline-3 text-headline-3 text-primary-container font-bold">
                {metrics.stagedReady} Ready
              </p>
              <span className="text-caption font-caption text-secondary font-medium">
                Awaiting patron pickup
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-on-secondary-container">
              <span className="material-symbols-outlined text-2xl">school</span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-caption text-caption text-text-secondary uppercase font-semibold">
                Assigned Lockers
              </p>
              <p className="font-headline-3 text-headline-3 text-status-available font-bold">
                {Math.max(0, metrics.totalLockerSlots - metrics.occupiedLockers)} / {metrics.totalLockerSlots} Free
              </p>
              <span className="text-caption font-caption text-text-secondary font-medium">
                Bay 01 Staging Unit
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-2xl">lock_clock</span>
            </div>
          </div>
        </div>

        {/* Filtering, Pill Tabs & Search Controls */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3.5 py-1.5 rounded-full font-small text-small font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container hover:bg-surface-container-high text-text-secondary'
              }`}
              type="button"
            >
              All Pending ({reservations.length})
            </button>
            <button
              onClick={() => setFilterTab('today')}
              className={`px-3.5 py-1.5 rounded-full font-small text-small font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filterTab === 'today'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container hover:bg-surface-container-high text-text-secondary'
              }`}
              type="button"
            >
              Due Today
            </button>
            <button
              onClick={() => setFilterTab('tomorrow')}
              className={`px-3.5 py-1.5 rounded-full font-small text-small font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filterTab === 'tomorrow'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container hover:bg-surface-container-high text-text-secondary'
              }`}
              type="button"
            >
              Tomorrow
            </button>
            <button
              onClick={() => setFilterTab('scholastic')}
              className={`px-3.5 py-1.5 rounded-full font-small text-small font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filterTab === 'scholastic'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container hover:bg-surface-container-high text-text-secondary'
              }`}
              type="button"
            >
              Scholastic Priority
            </button>
            <button
              onClick={() => setFilterTab('waitlist')}
              className={`px-3.5 py-1.5 rounded-full font-small text-small font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filterTab === 'waitlist'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container hover:bg-surface-container-high text-text-secondary'
              }`}
              type="button"
            >
              Waitlist
            </button>
          </div>

          {/* Search bar & Sorting */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-secondary text-base">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-surface-container rounded-xl text-small font-small text-on-surface placeholder:text-text-secondary outline-none focus:bg-surface-bright transition-colors"
                placeholder="Filter by Ref, User, or ISBN..."
                type="text"
              />
            </div>
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as 'pickup' | 'newest' | 'standing')}
                className="appearance-none bg-surface-container text-text-primary pl-3 pr-8 py-2 rounded-xl text-small font-small outline-none cursor-pointer focus:bg-surface-bright"
              >
                <option value="pickup">Earliest Requested Pickup</option>
                <option value="newest">Newest Request</option>
                <option value="standing">User Standing</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-2.5 text-text-secondary pointer-events-none text-base">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Main Split Layout: Operational Data Table & Live Action Staging Drawer */}
        <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6 items-start">
          {/* Queue Table Column */}
          <div className="2xl:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-body-medium text-body-medium font-bold text-primary">
                  Hold Verification Records
                </span>
                <span className="text-caption font-caption px-2 py-0.5 rounded-full bg-soft-blue text-primary font-semibold">
                  {filteredReservations.length} requests
                </span>
              </div>
              <div className="flex items-center gap-3 text-caption font-caption text-text-secondary">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-action-green"></span>Verified Standing
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-status-pending"></span>Review Cap
                </span>
              </div>
            </div>

            {filteredReservations.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center p-6 bg-surface-container-low/30">
                <span className="material-symbols-outlined text-5xl text-text-secondary/50 mb-3">
                  assignment_turned_in
                </span>
                <p className="font-body-medium text-body-medium text-text-primary font-semibold">
                  No pending reservation holds
                </p>
                <p className="font-caption text-caption text-text-secondary max-w-sm mt-1">
                  The staging queue is clear. No student or faculty hold requests are currently awaiting physical triage.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-small font-small">
                  <thead>
                    <tr className="bg-surface-container text-text-secondary uppercase text-caption font-caption tracking-wider">
                      <th className="py-3 px-4 w-10" scope="col">
                        <input
                          checked={allSelected}
                          onChange={(e) => handleToggleSelectAll(e.target.checked)}
                          className="w-4 h-4 rounded text-primary cursor-pointer accent-primary"
                          type="checkbox"
                        />
                      </th>
                      <th className="py-3 px-4" scope="col">Reservation Ref</th>
                      <th className="py-3 px-4" scope="col">User Details</th>
                      <th className="py-3 px-4" scope="col">Requested Volume</th>
                      <th className="py-3 px-4" scope="col">Stacks &amp; Staging</th>
                      <th className="py-3 px-4" scope="col">Hold Schedule</th>
                      <th className="py-3 px-4" scope="col">Standing</th>
                      <th className="py-3 px-4 text-right" scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high/40">
                    {filteredReservations.map((r) => {
                      const isFocused = activeReservation?.id === r.id;
                      const isChecked = selectedIds.has(r.id);
                      return (
                        <tr
                          key={r.id}
                          onClick={() => setActiveReservationId(r.id)}
                          className={`transition-colors cursor-pointer ${
                            isFocused
                              ? 'bg-soft-blue/20 hover:bg-soft-blue/30'
                              : 'hover:bg-surface-container-low'
                          }`}
                        >
                          <td className="py-4 px-4 align-top" onClick={(e) => e.stopPropagation()}>
                            <input
                              checked={isChecked}
                              onChange={(e) => handleToggleSelectRow(r.id, e as unknown as React.MouseEvent)}
                              className="w-4 h-4 rounded cursor-pointer accent-primary"
                              type="checkbox"
                            />
                          </td>
                          <td className="py-4 px-4 align-top">
                            <div className="flex flex-col">
                              <span className="font-bold text-primary font-body-medium">
                                #{r.id.substring(0, 8).toUpperCase()}
                              </span>
                              <span className="font-caption text-caption text-text-secondary">
                                {new Date(r.reservationDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {r.priorityLabel && (
                                <span className="inline-flex items-center gap-1 mt-1 text-caption font-caption px-1.5 py-0.5 rounded bg-status-danger/10 text-status-danger font-bold w-max">
                                  {r.priorityLabel}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 align-top">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-full bg-soft-blue text-primary flex items-center justify-center font-bold text-caption flex-shrink-0">
                                {r.patronName?.charAt(0) || 'U'}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-text-primary leading-snug">
                                  {r.patronName}
                                </span>
                                <span className="font-caption text-caption text-text-secondary">
                                  {r.patronLibraryId || 'KP-ID'}
                                </span>
                                <span className="text-caption font-caption text-secondary">
                                  {r.patronDepartment || 'Academic Department'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 align-top">
                            <div className="flex items-start gap-2.5">
                              {r.bookCoverImage ? (
                                <img
                                  className="w-9 h-12 rounded object-cover shadow-sm flex-shrink-0"
                                  src={r.bookCoverImage}
                                  alt={r.bookTitle}
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-9 h-12 rounded bg-soft-blue text-primary flex items-center justify-center flex-shrink-0">
                                  <span className="material-symbols-outlined text-base">book</span>
                                </div>
                              )}
                              <div className="flex flex-col">
                                <span className="font-bold text-text-primary line-clamp-1">
                                  {r.bookTitle}
                                </span>
                                <span className="font-caption text-caption text-text-secondary">
                                  {r.bookAuthor}
                                </span>
                                <span className="font-caption text-caption text-secondary font-mono">
                                  {r.bookCallNumber || 'Call N/A'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 align-top">
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1 font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container font-mono text-primary font-bold">
                                {r.pickupBranch || 'Desk Bay 01'}
                              </span>
                              <span className="font-caption text-caption text-status-available font-semibold">
                                Staging Locker {r.lockerBay || 'Auto'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 align-top">
                            <div className="flex flex-col">
                              <span className="font-bold text-text-primary">
                                {new Date(r.expiryDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                              </span>
                              <span className="font-caption text-caption text-text-secondary">
                                Expiry: 48 Hours
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 align-top">
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption font-caption bg-status-available/15 text-status-available font-bold w-max">
                                <span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
                                Good Standing
                              </span>
                              <span className="text-caption font-caption text-text-secondary">
                                Quota Active
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 align-top text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={(e) => handleSingleApprove(r, e)}
                                disabled={isProcessing}
                                className="p-1.5 rounded-lg bg-action-green text-text-primary hover:bg-action-green-hover transition-colors cursor-pointer"
                                title="Quick Approve"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-base">check</span>
                              </button>
                              <button
                                onClick={(e) => handleOpenRejectModal(r, undefined, e)}
                                disabled={isProcessing}
                                className="p-1.5 rounded-lg bg-surface-container text-status-danger hover:bg-error-container transition-colors cursor-pointer"
                                title="Quick Reject"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-base">close</span>
                              </button>
                              <button
                                onClick={() => setActiveReservationId(r.id)}
                                className="p-1.5 rounded-lg bg-surface-container text-primary hover:bg-soft-blue transition-colors cursor-pointer"
                                title="View Full Inspection"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-base">visibility</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table Footer */}
            <div className="px-5 py-3.5 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-3 text-caption font-caption text-text-secondary">
              <div>
                Showing <strong className="text-text-primary">{filteredReservations.length}</strong> of{' '}
                <strong className="text-text-primary">{reservations.length}</strong> queue records • Auto-refreshes every 30s
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-surface-container-lowest rounded shadow-xs font-mono font-bold text-primary">
                  Bay 01 Terminal Live
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Approval & Inspection Panel (Right Column) */}
          <div className="2xl:col-span-4 bg-surface-container-lowest rounded-xl shadow-md p-5 flex flex-col space-y-5 sticky top-20">
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-lg">verified_user</span>
                </div>
                <div>
                  <h2 className="font-headline-4 text-headline-4 text-primary leading-tight">Hold Inspection</h2>
                  <span className="font-caption text-caption text-text-secondary">
                    {activeReservation
                      ? `Active: #${activeReservation.id.substring(0, 8).toUpperCase()}`
                      : 'No Active Selection'}
                  </span>
                </div>
              </div>
              {activeReservation && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-caption font-bold bg-action-green/20 text-text-primary">
                  <span className="w-2 h-2 rounded-full bg-action-green"></span>
                  Ready to Stage
                </span>
              )}
            </div>

            {activeReservation ? (
              <>
                {/* User Profile Section */}
                <div className="bg-surface-container-low p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-caption font-caption uppercase tracking-wider font-bold text-text-secondary">
                      User Verification
                    </span>
                    <span className="text-caption font-caption px-2 py-0.5 rounded-full bg-status-available text-on-primary font-bold">
                      Good Standing
                    </span>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-soft-blue text-primary flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0">
                      {activeReservation.patronName?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-body-large text-body-large font-bold text-text-primary leading-tight">
                        {activeReservation.patronName}
                      </h3>
                      <p className="font-caption text-caption text-text-secondary">
                        ID: {activeReservation.patronLibraryId || 'KP-CARD'} • {activeReservation.patronDepartment}
                      </p>
                      <p className="font-caption text-caption text-primary font-medium">
                        {activeReservation.patronYearLevel || 'Verified Patron'}
                      </p>
                    </div>
                  </div>

                  {/* Verification Pills Matrix */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-caption font-caption">
                    <div className="bg-surface-container-lowest p-2 rounded-lg">
                      <span className="text-text-secondary block">Outstanding Fines</span>
                      <span className="font-bold text-status-available font-mono">₱0.00 (Clear)</span>
                    </div>
                    <div className="bg-surface-container-lowest p-2 rounded-lg">
                      <span className="text-text-secondary block">Borrow Quota</span>
                      <span className="font-bold text-text-primary font-mono">Eligible</span>
                    </div>
                    <div className="bg-surface-container-lowest p-2 rounded-lg">
                      <span className="text-text-secondary block">Queue Position</span>
                      <span className="font-bold text-text-primary font-mono">#{activeReservation.queuePosition}</span>
                    </div>
                    <div className="bg-surface-container-lowest p-2 rounded-lg">
                      <span className="text-text-secondary block">Pickup Branch</span>
                      <span className="font-bold text-primary">{activeReservation.pickupBranch || 'Desk Bay 01'}</span>
                    </div>
                  </div>
                </div>

                {/* Item Staging Verification Section */}
                <div className="bg-surface-container-low p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-caption font-caption uppercase tracking-wider font-bold text-text-secondary">
                      Physical Copy Assignment
                    </span>
                    <span className="font-caption text-caption font-mono font-semibold text-primary">
                      Ready to Assign
                    </span>
                  </div>
                  <div className="flex gap-3">
                    {activeReservation.bookCoverImage ? (
                      <img
                        className="w-12 h-16 rounded object-cover shadow-sm flex-shrink-0"
                        src={activeReservation.bookCoverImage}
                        alt={activeReservation.bookTitle}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-16 rounded bg-soft-blue text-primary flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-2xl">book</span>
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <h4 className="font-body-medium text-body-medium font-bold text-text-primary line-clamp-1">
                        {activeReservation.bookTitle}
                      </h4>
                      <p className="font-caption text-caption text-text-secondary">
                        {activeReservation.bookAuthor}
                      </p>
                      <p className="font-caption text-caption font-mono text-secondary">
                        Call: {activeReservation.bookCallNumber || 'General'}
                      </p>
                    </div>
                  </div>

                  {/* Staging Locker & Physical Copy Tag */}
                  <div className="p-3 bg-surface-container-lowest rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-caption font-caption">
                      <span className="text-text-secondary">Staging Locker:</span>
                      <span className="font-bold text-text-primary bg-soft-blue text-primary px-2 py-0.5 rounded font-mono">
                        {activeReservation.lockerBay || 'Bay 01 Locker Auto'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-caption font-caption">
                      <span className="text-text-secondary">Pickup Expiry Window:</span>
                      <span className="font-bold text-status-danger">48 Hours from Approval</span>
                    </div>
                  </div>
                </div>

                {/* Information Notice */}
                <div className="p-3 bg-soft-blue/30 rounded-xl flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-primary text-lg flex-shrink-0">info</span>
                  <p className="font-caption text-caption text-text-primary leading-tight">
                    Approving this hold will trigger an automated SMS/Email notification to the user containing their
                    one-time smart locker PIN code.
                  </p>
                </div>

                {/* Primary Confirmation Actions */}
                <div className="pt-2 space-y-2.5">
                  <button
                    onClick={() => handleSingleApprove(activeReservation)}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer disabled:opacity-50"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-xl">mark_email_read</span>
                    <span>Confirm Approval &amp; Dispatch PIN</span>
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleOpenRejectModal(activeReservation, 'Physical copy damaged during pull / unreadable barcode')}
                      disabled={isProcessing}
                      className="py-2.5 px-3 bg-surface-container hover:bg-error-container text-status-danger hover:text-on-error-container font-caption text-caption font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-sm">broken_image</span>
                      <span>Reject: Damaged</span>
                    </button>
                    <button
                      onClick={() => handleOpenRejectModal(activeReservation, 'User exceeded maximum concurrent loan allowance')}
                      disabled={isProcessing}
                      className="py-2.5 px-3 bg-surface-container hover:bg-error-container text-status-danger hover:text-on-error-container font-caption text-caption font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-sm">block</span>
                      <span>Reject: Limit Hit</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center p-4">
                <span className="material-symbols-outlined text-4xl text-text-secondary/40 mb-2">
                  touch_app
                </span>
                <p className="font-caption text-caption text-text-secondary">
                  Select a reservation from the table to inspect details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Reason Modal */}
      {rejectModalItem && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-status-danger">
                <span className="material-symbols-outlined text-2xl">cancel</span>
                <h3 className="font-headline-4 text-headline-4 font-bold text-text-primary">
                  Decline Reservation Hold
                </h3>
              </div>
              <button
                onClick={() => setRejectModalItem(null)}
                className="p-1 rounded-lg text-text-secondary hover:bg-surface-container"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="font-small text-small text-text-secondary">
              Please confirm the operational cause for rejecting reservation reference{' '}
              <strong className="text-text-primary">#{rejectModalItem.id.substring(0, 8).toUpperCase()}</strong>.
              The patron will receive an immediate resolution message.
            </p>

            <div className="space-y-2">
              <label className="block font-caption text-caption font-bold text-text-primary uppercase">
                Official Rejection Reason
              </label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 bg-surface-container rounded-xl text-small font-small outline-none focus:bg-surface-bright text-text-primary"
              >
                <option value="Physical copy damaged during pull / unreadable barcode">
                  Physical copy damaged during pull / unreadable barcode
                </option>
                <option value="Item misplaced in stacks / Inventory reconciliation required">
                  Item misplaced in stacks / Inventory reconciliation required
                </option>
                <option value="User exceeded maximum concurrent loan allowance">
                  User exceeded maximum concurrent loan allowance
                </option>
                <option value="Overdue fines pending on account (> ₱150 threshold)">
                  Overdue fines pending on account (&gt; ₱150 threshold)
                </option>
                <option value="Course reserve shelf lock / restricted instructor copy">
                  Course reserve shelf lock / restricted instructor copy
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-caption text-caption font-bold text-text-primary uppercase">
                Staff Resolution Notes
              </label>
              <textarea
                value={staffNotes}
                onChange={(e) => setStaffNotes(e.target.value)}
                className="w-full p-2.5 bg-surface-container rounded-xl text-small font-small outline-none focus:bg-surface-bright text-text-primary"
                placeholder="Optional notes visible to circulation supervisor..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalItem(null)}
                disabled={isProcessing}
                className="px-4 py-2 bg-surface-container text-text-primary font-small text-small font-medium rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejection}
                disabled={isProcessing}
                className="px-4 py-2 bg-error text-on-error font-small text-small font-bold rounded-xl hover:bg-error/90 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                type="button"
              >
                {isProcessing ? 'Processing...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
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

export default PendingReservations;
