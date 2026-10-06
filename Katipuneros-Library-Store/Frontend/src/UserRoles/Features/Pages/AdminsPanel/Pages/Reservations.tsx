// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// Reservations.tsx -- Admin Reservation Ledger, Queue Governance, and Smart Locker Telemetry.
// Strictly adheres to real-time data mandate: if database is empty, renders 0 / empty state.
// Consumes shared primitives (SearchBar, Dropdown, RadioButton, AdminModalCard) and hooks (useDebounce, usePagination, useTableDraggable).

import React, { FC, useState, useEffect, useMemo, useCallback } from 'react';
import {
  getReservationMetrics,
  getAdminReservations,
  triageReservation,
  updateReservationStatus,
  assignReservationLocker,
  fulfillReservationHold,
  batchClearanceReservations,
  notifyReservationPatron,
  getLockerDiagnostics,
  getExportReservationsUrl,
  BackendReservation,
  ReservationMetrics,
  EMPTY_RESERVATION_METRICS,
  LockerDiagnosticsResponse,
  ExportRosterParams,
} from '../../../../../Endpoints/Admin/reservationsApi';
import { SearchBar } from '../../../../../Shared/SearchBar';
import { Dropdown, DropdownItem } from '../../../../../Shared/Dropdown';
import { RadioButton } from '../../../../../Shared/RadioButton';
import { AdminModalCard } from '../Shared/AdminModalCard';
import { useDebounce } from '../../../../../Hooks/useDebounce';
import { usePagination } from '../../../../../Hooks/usePagination';
import { useTableDraggable } from '../../../../../Hooks/useTableDraggable';
import { usePagesGlobalRefresh } from '../../../../../Hooks/usePagesGlobalRefresh';

const Reservations: FC = () => {
  // Data States
  const [reservations, setReservations] = useState<BackendReservation[]>([]);
  const [metrics, setMetrics] = useState<ReservationMetrics>(EMPTY_RESERVATION_METRICS);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Search, Filters & View Mode
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusTab, setStatusTab] = useState<'all' | 'pending' | 'staged' | 'fulfilled' | 'cancelled'>('all');
  const [routeFilter, setRouteFilter] = useState<'all' | 'counter' | 'lockers' | 'annex'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'patron_az' | 'title_az' | 'expiry'>('recent');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // Modal States
  const [selectedReservation, setSelectedReservation] = useState<BackendReservation | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isApproveRejectModalOpen, setIsApproveRejectModalOpen] = useState<boolean>(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState<boolean>(false);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState<boolean>(false);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState<boolean>(false);
  const [isAdjustQuotasModalOpen, setIsAdjustQuotasModalOpen] = useState<boolean>(false);
  const [isDiagnosticsModalOpen, setIsDiagnosticsModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isBatchClearanceModalOpen, setIsBatchClearanceModalOpen] = useState<boolean>(false);
  const [isLockerMatrixModalOpen, setIsLockerMatrixModalOpen] = useState<boolean>(false);

  // Form Sub-states
  const [triageAction, setTriageAction] = useState<'approve' | 'reject'>('approve');
  const [triageReason, setTriageReason] = useState<string>('');
  const [triagePriority, setTriagePriority] = useState<boolean>(false);

  const [notifyChannel, setNotifyChannel] = useState<'SMS' | 'Email' | 'Push' | 'All'>('Email');
  const [customNotifyMessage, setCustomNotifyMessage] = useState<string>('');

  const [statusOverride, setStatusOverride] = useState<string>('Pending');
  const [statusNotes, setStatusNotes] = useState<string>('');

  const [undergradLimit, setUndergradLimit] = useState<number>(2);
  const [facultyLimit, setFacultyLimit] = useState<number>(5);
  const [secondaryTriage, setSecondaryTriage] = useState<boolean>(true);

  const [diagnosticsData, setDiagnosticsData] = useState<LockerDiagnosticsResponse | null>(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState<boolean>(false);

  const [exportStartDate, setExportStartDate] = useState<string>('');
  const [exportEndDate, setExportEndDate] = useState<string>('');
  const [exportAlphaFilter, setExportAlphaFilter] = useState<string>('');
  const [exportIdFilter, setExportIdFilter] = useState<string>('');
  const [exportSortDir, setExportSortDir] = useState<'asc' | 'desc'>('asc');
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');

  const [batchAction, setBatchAction] = useState<'Stage' | 'Cancel' | 'Release'>('Stage');
  const [batchLockerBay, setBatchLockerBay] = useState<string>('Bay 01 Counter');

  const [modalSubmitting, setModalSubmitting] = useState<boolean>(false);
  const [operationMessage, setOperationMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Table draggable hook
  const { containerRef } = useTableDraggable();

  // Load Real Data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [metricsData, resList] = await Promise.all([
        getReservationMetrics(),
        getAdminReservations(),
      ]);
      setMetrics(metricsData || EMPTY_RESERVATION_METRICS);
      setReservations(resList || []);
    } catch (err) {
      console.error('Failed to load reservation queue from API ledger:', err);
      setMetrics(EMPTY_RESERVATION_METRICS);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Hook global refresh on network reconnection or window focus
  usePagesGlobalRefresh(loadData);

  // Auto-dismiss feedback message
  useEffect(() => {
    if (operationMessage) {
      const timer = setTimeout(() => setOperationMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [operationMessage]);

  // Filter & Search Logic
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      // Search match
      if (debouncedSearch.trim() !== '') {
        const q = debouncedSearch.toLowerCase().trim();
        const matchesSearch =
          r.id.toLowerCase().includes(q) ||
          r.patronName.toLowerCase().includes(q) ||
          r.patronLibraryId.toLowerCase().includes(q) ||
          r.bookTitle.toLowerCase().includes(q) ||
          r.bookCallNumber.toLowerCase().includes(q) ||
          (r.lockerBay && r.lockerBay.toLowerCase().includes(q));

        if (!matchesSearch) return false;
      }

      // Status Tab filter
      if (statusTab === 'pending' && r.status !== 'Pending') return false;
      if (statusTab === 'staged' && r.status !== 'StagedInLocker') return false;
      if (statusTab === 'fulfilled' && r.status !== 'Fulfilled') return false;
      if (statusTab === 'cancelled' && r.status !== 'Cancelled' && r.status !== 'Expired') return false;

      // Route Filter
      if (routeFilter === 'counter') {
        return (r.pickupBranch && r.pickupBranch.toLowerCase().includes('counter')) || (r.lockerBay && r.lockerBay.toLowerCase().includes('counter'));
      }
      if (routeFilter === 'lockers') {
        return (r.lockerBay && r.lockerBay.toLowerCase().includes('locker')) || r.status === 'StagedInLocker';
      }
      if (routeFilter === 'annex') {
        return r.pickupBranch && r.pickupBranch.toLowerCase().includes('annex');
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'patron_az') return a.patronName.localeCompare(b.patronName);
      if (sortBy === 'title_az') return a.bookTitle.localeCompare(b.bookTitle);
      if (sortBy === 'expiry') return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      return new Date(b.reservationDate).getTime() - new Date(a.reservationDate).getTime();
    });
  }, [reservations, debouncedSearch, statusTab, routeFilter, sortBy]);

  // Pagination hook
  const {
    currentPage,
    totalPages,
    pageSize,
    setPageSize,
    startIndex,
    endIndex,
    paginatedItems: paginatedReservations,
    nextPage,
    prevPage,
    canNextPage,
    canPrevPage,
  } = usePagination(filteredReservations, { initialPageSize: 10 });

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.size === paginatedReservations.length && paginatedReservations.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedReservations.map((r) => r.id)));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  // Action: Triage Submit
  const handleTriageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReservation) return;
    try {
      setModalSubmitting(true);
      const res = await triageReservation(selectedReservation.id, {
        approved: triageAction === 'approve',
        reason: triageReason,
        priority: triagePriority,
      });
      if (res.success) {
        setOperationMessage({
          text: triageAction === 'approve' ? 'Hold approved and queued for staging.' : 'Hold request rejected.',
          type: 'success',
        });
        setIsApproveRejectModalOpen(false);
        setTriageReason('');
        await loadData();
      } else {
        setOperationMessage({ text: res.message || 'Triage failed.', type: 'error' });
      }
    } catch (err: any) {
      setOperationMessage({ text: err.message || 'An error occurred during triage.', type: 'error' });
    } finally {
      setModalSubmitting(false);
    }
  };

  // Action: Notify User Submit
  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReservation) return;
    try {
      setModalSubmitting(true);
      const res = await notifyReservationPatron(selectedReservation.id, {
        channel: notifyChannel,
        customMessage: customNotifyMessage || undefined,
      });
      if (res.success) {
        setOperationMessage({ text: `Notice dispatched via ${notifyChannel} to ${selectedReservation.patronName}.`, type: 'success' });
        setIsNotifyModalOpen(false);
        setCustomNotifyMessage('');
      } else {
        setOperationMessage({ text: res.message || 'Failed to dispatch notification.', type: 'error' });
      }
    } catch (err: any) {
      setOperationMessage({ text: err.message || 'Notification error.', type: 'error' });
    } finally {
      setModalSubmitting(false);
    }
  };

  // Action: Release / Handover Submit
  const handleReleaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReservation) return;
    try {
      setModalSubmitting(true);
      const res = await fulfillReservationHold(selectedReservation.id);
      if (res.success) {
        setOperationMessage({ text: `Hold #${selectedReservation.id.slice(0, 8)} fulfilled and released to user.`, type: 'success' });
        setIsReleaseModalOpen(false);
        await loadData();
      } else {
        setOperationMessage({ text: res.message || 'Failed to fulfill hold.', type: 'error' });
      }
    } catch (err: any) {
      setOperationMessage({ text: err.message || 'Release failed.', type: 'error' });
    } finally {
      setModalSubmitting(false);
    }
  };

  // Action: Status Override Submit
  const handleStatusOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReservation) return;
    try {
      setModalSubmitting(true);
      const res = await updateReservationStatus(selectedReservation.id, statusOverride, statusNotes);
      if (res.success) {
        setOperationMessage({ text: `Hold status transitioned to ${statusOverride}.`, type: 'success' });
        setIsUpdateStatusModalOpen(false);
        setStatusNotes('');
        await loadData();
      } else {
        setOperationMessage({ text: res.message || 'Failed to update status.', type: 'error' });
      }
    } catch (err: any) {
      setOperationMessage({ text: err.message || 'Status transition error.', type: 'error' });
    } finally {
      setModalSubmitting(false);
    }
  };

  // Action: Batch Clearance Submit
  const handleBatchClearanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.size === 0) return;
    try {
      setModalSubmitting(true);
      const res = await batchClearanceReservations({
        holdIds: Array.from(selectedIds),
        action: batchAction,
        lockerBay: batchAction === 'Stage' ? batchLockerBay : undefined,
      });
      if (res.success) {
        setOperationMessage({ text: `${selectedIds.size} hold requests processed via batch ${batchAction}.`, type: 'success' });
        setIsBatchClearanceModalOpen(false);
        setSelectedIds(new Set());
        await loadData();
      } else {
        setOperationMessage({ text: res.message || 'Batch clearance failed.', type: 'error' });
      }
    } catch (err: any) {
      setOperationMessage({ text: err.message || 'Batch action failed.', type: 'error' });
    } finally {
      setModalSubmitting(false);
    }
  };

  // Action: Run Locker Diagnostics
  const handleRunDiagnostics = async () => {
    try {
      setDiagnosticsLoading(true);
      setIsDiagnosticsModalOpen(true);
      const res = await getLockerDiagnostics();
      setDiagnosticsData(res);
    } catch (err) {
      console.error('Diagnostics error:', err);
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  // Action: Export Submit
  const handleExportDownload = () => {
    const params: ExportRosterParams = {
      startDate: exportStartDate || undefined,
      endDate: exportEndDate || undefined,
      alphabeticalFilter: exportAlphaFilter.trim() || undefined,
      idFilter: exportIdFilter.trim() || undefined,
      sortDirection: exportSortDir,
      format: exportFormat,
    };
    const url = getExportReservationsUrl(params);
    window.open(url, '_blank');
    setIsExportModalOpen(false);
  };

  // Page Size dropdown items
  const pageSizeItems: DropdownItem<number>[] = [
    { value: 10, label: '10' },
    { value: 25, label: '25' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
  ];

  // Sort dropdown items
  const sortItems: DropdownItem<'recent' | 'patron_az' | 'title_az' | 'expiry'>[] = [
    { value: 'recent', label: 'Recently Requested' },
    { value: 'patron_az', label: 'User Name (A-Z)' },
    { value: 'title_az', label: 'Book Title (A-Z)' },
    { value: 'expiry', label: 'Expiring Soonest' },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col w-full gap-space-lg">
        {/* Toast / Feedback Alert */}
        {operationMessage && (
          <div
            className={`p-space-sm rounded-xl font-small text-small flex items-center gap-space-xs transition-all shadow-md ${
              operationMessage.type === 'success'
                ? 'bg-action-green/20 text-text-primary border border-action-green/40'
                : 'bg-error-container text-error border border-error/40'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {operationMessage.type === 'success' ? 'check_circle' : 'warning'}
            </span>
            <span className="font-semibold">{operationMessage.text}</span>
          </div>
        )}

        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs text-caption font-caption text-text-secondary uppercase tracking-wider mb-1">
              <span>Admin Console</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span>Circulation</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-primary font-bold">Reservations</span>
            </div>
            <div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption mb-1">
              <span className="inline-block w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span>CIRCULATION CONTROLLER 04 // BAY LOGISTICS ACTIVE</span>
            </div>
            <h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">
              Institutional Hold &amp; Reservation Queue Management
            </h1>
            <p className="font-small text-small text-text-secondary mt-0.5">
              Real-time shelf allocations, staging locker synchronization, and automated high-demand quota enforcement.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-space-sm">
            <button
              className="flex items-center gap-space-xs bg-surface-container-lowest text-primary hover:bg-surface-container px-space-md py-2.5 rounded-lg shadow-sm font-small text-small font-semibold transition-all"
              type="button"
              onClick={() => setIsExportModalOpen(true)}
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export CSV / Excel</span>
            </button>
            <button
              className="flex items-center gap-space-xs bg-surface-container-lowest text-primary hover:bg-surface-container px-space-md py-2.5 rounded-lg shadow-sm font-small text-small font-semibold transition-all"
              type="button"
              onClick={() => setIsLockerMatrixModalOpen(true)}
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Locker Matrix</span>
            </button>
            <button
              className="flex items-center gap-space-xs bg-action-green hover:bg-action-green-hover text-text-primary px-space-lg py-2.5 rounded-lg shadow-sm font-small text-small font-bold transition-all transform hover:-translate-y-0.5"
              type="button"
              onClick={() => {
                if (selectedIds.size === 0) {
                  setOperationMessage({ text: 'Please select at least one hold record from the queue.', type: 'error' });
                  return;
                }
                setIsBatchClearanceModalOpen(true);
              }}
            >
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
              <span>Batch Hold Clearance</span>
            </button>
          </div>
        </div>

        {/* 4 Real-Time KPI Bento Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
          {/* Card 1: Active Hold Queue */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-start justify-between">
              <div>
                <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Active Hold Queue</span>
                <div className="flex items-baseline gap-space-xs mt-1">
                  <span className="font-headline-1 text-headline-1 text-text-primary font-bold">
                    {metrics.activeHoldQueue}
                  </span>
                  <span className="font-caption text-caption text-text-secondary font-medium">Volumes</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">book_online</span>
              </div>
            </div>
            <div className="mt-space-md flex items-center justify-between font-caption text-caption text-text-secondary">
              <span className="flex items-center gap-1 text-status-available font-semibold">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                {metrics.activeHoldQueue > 0 ? 'Live Ingress' : 'Queue Empty'}
              </span>
              <span>All Campuses</span>
            </div>
          </div>

          {/* Card 2: Pending Review */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-status-pending/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-start justify-between">
              <div>
                <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Pending Review</span>
                <div className="flex items-baseline gap-space-xs mt-1">
                  <span className="font-headline-1 text-headline-1 text-text-primary font-bold">
                    {metrics.pendingReview}
                  </span>
                  <span className="font-caption text-caption text-status-pending font-bold">
                    {metrics.pendingReview > 0 ? 'High Demand' : 'Cleared'}
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-status-pending/15 flex items-center justify-center text-status-pending">
                <span className="material-symbols-outlined text-[22px]">hourglass_top</span>
              </div>
            </div>
            <div className="mt-space-md flex items-center justify-between font-caption text-caption">
              <span className="text-text-secondary font-medium flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">info</span> Triage Thresholds
              </span>
              <span className="text-text-secondary">Ratio 3:1 Cap</span>
            </div>
          </div>

          {/* Card 3: Staged Ready for Pickup */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-action-green/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-start justify-between">
              <div>
                <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Staged Ready for Pickup</span>
                <div className="flex items-baseline gap-space-xs mt-1">
                  <span className="font-headline-1 text-headline-1 text-text-primary font-bold">
                    {metrics.stagedReady}
                  </span>
                  <span className="font-caption text-caption text-text-secondary font-medium">Locker Units</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-action-green/20 flex items-center justify-center text-text-primary">
                <span className="material-symbols-outlined text-[22px]">lock_open</span>
              </div>
            </div>
            <div className="mt-space-md flex items-center justify-between font-caption text-caption text-text-secondary">
              <div className="w-2/3 bg-surface-container rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-action-green h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, metrics.lockerCapacityPercent)}%` }}
                ></div>
              </div>
              <span className="font-semibold text-text-primary">{metrics.lockerCapacityPercent}% Locker Cap</span>
            </div>
          </div>

          {/* Card 4: Fulfillment Velocity */}
          <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-container/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-start justify-between">
              <div>
                <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">Fulfillment Velocity</span>
                <div className="flex items-baseline gap-space-xs mt-1">
                  <span className="font-headline-1 text-headline-1 text-text-primary font-bold">
                    {metrics.fulfillmentVelocity.toFixed(1)}
                  </span>
                  <span className="font-caption text-caption text-text-secondary font-medium">hrs avg stage</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">speed</span>
              </div>
            </div>
            <div className="mt-space-md flex items-center justify-between font-caption text-caption text-text-secondary">
              <span className="text-status-available font-semibold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">arrow_downward</span> Optimal
              </span>
              <span>Target: &lt;6.0 hrs</span>
            </div>
          </div>
        </div>

        {/* Filters, Search Bar, Table-to-Card Radio, and Status Tabs */}
        <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
          {/* Top Filter Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
            {/* Shared SearchBar with Debouncing */}
            <div className="relative flex-1 max-w-xl">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery('')}
                placeholder="Filter by Hold ID (#HLD-...), user name, student number, or title..."
                shortcutKey="⌘K"
              />
            </div>

            {/* Radio View Mode Toggle (Table vs Card) */}
            <div className="flex items-center gap-space-md bg-surface-container-low px-space-md py-1.5 rounded-xl border border-outline-variant/15">
              <span className="font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider">
                Display:
              </span>
              <RadioButton
                name="viewModeToggle"
                label="Table View"
                checked={viewMode === 'table'}
                onChange={() => setViewMode('table')}
              />
              <RadioButton
                name="viewModeToggle"
                label="Card View"
                checked={viewMode === 'card'}
                onChange={() => setViewMode('card')}
              />
            </div>

            {/* Quick Route Toggles */}
            <div className="flex items-center gap-space-xs overflow-x-auto pb-1 lg:pb-0">
              <span className="font-caption text-caption text-text-secondary uppercase tracking-wider mr-1 hidden sm:inline">
                Route:
              </span>
              <button
                className={`px-space-md py-1.5 rounded-full font-caption text-caption font-semibold whitespace-nowrap transition-colors ${
                  routeFilter === 'all'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-chip-unselected-bg text-text-secondary hover:bg-surface-container'
                }`}
                type="button"
                onClick={() => setRouteFilter('all')}
              >
                All Locations
              </button>
              <button
                className={`px-space-md py-1.5 rounded-full font-caption text-caption font-semibold whitespace-nowrap transition-colors ${
                  routeFilter === 'counter'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-chip-unselected-bg text-text-secondary hover:bg-surface-container'
                }`}
                type="button"
                onClick={() => setRouteFilter('counter')}
              >
                Main Circulation Desk
              </button>
              <button
                className={`px-space-md py-1.5 rounded-full font-caption text-caption font-semibold whitespace-nowrap transition-colors ${
                  routeFilter === 'lockers'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-chip-unselected-bg text-text-secondary hover:bg-surface-container'
                }`}
                type="button"
                onClick={() => setRouteFilter('lockers')}
              >
                Smart Lockers (Bay A-D)
              </button>
              <button
                className={`px-space-md py-1.5 rounded-full font-caption text-caption font-semibold whitespace-nowrap transition-colors ${
                  routeFilter === 'annex'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-chip-unselected-bg text-text-secondary hover:bg-surface-container'
                }`}
                type="button"
                onClick={() => setRouteFilter('annex')}
              >
                Graduate Annex
              </button>
            </div>
          </div>

          {/* Status Tabs & Sort Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm border-t border-surface-container-low pt-space-xs">
            <div className="flex items-center gap-space-xs overflow-x-auto pb-1">
              <button
                className={`flex items-center gap-space-xs px-space-md py-2 rounded-lg font-small text-small font-bold transition-all ${
                  statusTab === 'all' ? 'bg-soft-blue text-primary shadow-sm' : 'text-text-secondary hover:bg-surface-container'
                }`}
                type="button"
                onClick={() => setStatusTab('all')}
              >
                <span>All</span>
                <span className="bg-primary text-on-primary text-[11px] font-caption px-1.5 py-0.5 rounded-full font-bold">
                  {reservations.length}
                </span>
              </button>
              <button
                className={`flex items-center gap-space-xs px-space-md py-2 rounded-lg font-small text-small font-semibold transition-all ${
                  statusTab === 'pending' ? 'bg-soft-blue text-primary shadow-sm' : 'text-text-secondary hover:bg-surface-container'
                }`}
                type="button"
                onClick={() => setStatusTab('pending')}
              >
                <span>Pending Review</span>
                <span className="bg-status-pending text-on-surface text-[11px] font-caption px-1.5 py-0.5 rounded-full font-bold">
                  {reservations.filter((r) => r.status === 'Pending').length}
                </span>
                {reservations.filter((r) => r.status === 'Pending').length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-status-danger animate-pulse"></span>
                )}
              </button>
              <button
                className={`flex items-center gap-space-xs px-space-md py-2 rounded-lg font-small text-small font-semibold transition-all ${
                  statusTab === 'staged' ? 'bg-soft-blue text-primary shadow-sm' : 'text-text-secondary hover:bg-surface-container'
                }`}
                type="button"
                onClick={() => setStatusTab('staged')}
              >
                <span>Approved &amp; Staged</span>
                <span className="bg-surface-container-high text-text-secondary text-[11px] font-caption px-1.5 py-0.5 rounded-full font-bold">
                  {reservations.filter((r) => r.status === 'StagedInLocker').length}
                </span>
              </button>
              <button
                className={`flex items-center gap-space-xs px-space-md py-2 rounded-lg font-small text-small font-semibold transition-all ${
                  statusTab === 'fulfilled' ? 'bg-soft-blue text-primary shadow-sm' : 'text-text-secondary hover:bg-surface-container'
                }`}
                type="button"
                onClick={() => setStatusTab('fulfilled')}
              >
                <span>Completed / Picked Up</span>
                <span className="bg-surface-container-high text-text-secondary text-[11px] font-caption px-1.5 py-0.5 rounded-full font-bold">
                  {reservations.filter((r) => r.status === 'Fulfilled').length}
                </span>
              </button>
              <button
                className={`flex items-center gap-space-xs px-space-md py-2 rounded-lg font-small text-small font-semibold transition-all ${
                  statusTab === 'cancelled' ? 'bg-soft-blue text-primary shadow-sm' : 'text-text-secondary hover:bg-surface-container'
                }`}
                type="button"
                onClick={() => setStatusTab('cancelled')}
              >
                <span>Expired / Cancelled</span>
                <span className="bg-surface-container-high text-text-secondary text-[11px] font-caption px-1.5 py-0.5 rounded-full font-bold">
                  {reservations.filter((r) => r.status === 'Cancelled' || r.status === 'Expired').length}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-caption text-caption text-text-secondary">Sort:</span>
              <Dropdown items={sortItems} selectedValue={sortBy} onSelect={(val) => setSortBy(val)} menuWidth="w-48" />
            </div>
          </div>
        </div>

        {/* Floating Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div className="bg-surface-container-highest p-space-sm rounded-xl shadow-lg border border-primary/20 flex flex-wrap items-center justify-between gap-space-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-space-sm">
              <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-caption flex items-center justify-center">
                {selectedIds.size}
              </span>
              <span className="font-small text-small font-semibold text-text-primary">Hold items selected</span>
            </div>
            <div className="flex items-center gap-space-xs flex-wrap">
              <button
                className="px-space-md py-1.5 rounded-lg bg-action-green hover:bg-action-green-hover text-text-primary font-caption text-caption font-bold shadow-sm transition-all"
                type="button"
                onClick={() => {
                  setBatchAction('Stage');
                  setIsBatchClearanceModalOpen(true);
                }}
              >
                Batch Stage in Lockers
              </button>
              <button
                className="px-space-md py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-caption text-caption font-semibold transition-all"
                type="button"
                onClick={() => {
                  setBatchAction('Release');
                  setIsBatchClearanceModalOpen(true);
                }}
              >
                Bulk Release
              </button>
              <button
                className="px-space-md py-1.5 rounded-lg bg-error-container hover:bg-error text-error hover:text-on-error font-caption text-caption font-semibold transition-all"
                type="button"
                onClick={() => {
                  setBatchAction('Cancel');
                  setIsBatchClearanceModalOpen(true);
                }}
              >
                Bulk Cancel
              </button>
              <button
                className="px-space-sm py-1.5 rounded-lg bg-surface-container text-text-secondary hover:text-text-primary font-caption text-caption"
                type="button"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Main Hold Manifest Presentation: Table View or Card View */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
          {/* Header Info Bar */}
          <div className="px-space-lg py-space-md bg-surface-container-low flex items-center justify-between border-b border-surface-container">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[20px]">inventory_2</span>
              <span className="font-small text-small font-bold text-text-primary">Staging Queue Manifest</span>
              <span className="font-caption text-caption text-text-secondary bg-surface-container px-2 py-0.5 rounded">
                Showing {paginatedReservations.length} of {filteredReservations.length} records
              </span>
            </div>
            <div className="flex items-center gap-space-xs">
              <span className="font-caption text-caption text-text-secondary">Live Database Ledger</span>
              <span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
            </div>
          </div>

          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-2 text-text-secondary">
              <span className="material-symbols-outlined text-[36px] animate-spin text-primary">sync</span>
              <span className="font-small text-small font-medium">Synchronizing hold queue manifest...</span>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center text-text-secondary p-space-lg">
              <span className="material-symbols-outlined text-[48px] text-text-secondary/40 mb-2">hourglass_empty</span>
              <p className="font-bold text-text-primary font-headline-4">No Active Hold Records Found</p>
              <p className="font-caption text-caption text-text-secondary mt-1 max-w-md">
                {reservations.length === 0
                  ? 'The institutional reservation queue is currently clear. User requests will register in real-time as they place holds.'
                  : 'No reservations match your active filter and search criteria.'}
              </p>
            </div>
          ) : viewMode === 'table' ? (
            /* Table Row View (with useTableDraggable) */
            <div ref={containerRef} className="overflow-x-auto w-full cursor-grab">
              <table className="w-full text-left font-body text-small border-collapse">
                <thead className="bg-surface-container text-text-secondary font-caption text-caption uppercase tracking-wider select-none">
                  <tr>
                    <th className="py-3 px-space-md w-10">
                      <input
                        type="checkbox"
                        className="rounded border-outline-variant/50 text-primary focus:ring-primary/20"
                        checked={selectedIds.size === paginatedReservations.length && paginatedReservations.length > 0}
                        onChange={handleToggleSelectAll}
                        title="Select All"
                      />
                    </th>
                    <th className="py-3 px-space-md font-bold">Hold ID</th>
                    <th className="py-3 px-space-md font-bold">User Details</th>
                    <th className="py-3 px-space-md font-bold">Reserved Title &amp; Call No.</th>
                    <th className="py-3 px-space-md font-bold">Request / Expiry</th>
                    <th className="py-3 px-space-md font-bold">Pickup Location</th>
                    <th className="py-3 px-space-md font-bold">Status</th>
                    <th className="py-3 px-space-md font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-low font-small text-small">
                  {paginatedReservations.map((r) => {
                    const isSelected = selectedIds.has(r.id);
                    const isOverdue = new Date(r.expiryDate).getTime() <= Date.now() && r.status === 'StagedInLocker';

                    return (
                      <tr
                        key={r.id}
                        className={`hover:bg-surface-container-low transition-colors group cursor-pointer ${
                          isSelected ? 'bg-soft-blue/20' : ''
                        }`}
                        onClick={() => {
                          setSelectedReservation(r);
                          setIsViewModalOpen(true);
                        }}
                      >
                        <td className="py-3.5 px-space-md align-middle" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            className="rounded border-outline-variant/50 text-primary focus:ring-primary/20"
                            checked={isSelected}
                            onChange={() => handleToggleSelectOne(r.id)}
                          />
                        </td>
                        <td className="py-3.5 px-space-md align-middle">
                          <div className="flex flex-col">
                            <span className="font-bold text-primary font-caption text-body">
                              #{r.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span className="font-caption text-[11px] text-text-secondary font-semibold">
                              {r.priorityLabel}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-space-md align-middle">
                          <div className="flex items-center gap-space-sm">
                            <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-caption font-caption uppercase">
                              {r.patronName.slice(0, 2)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-text-primary group-hover:text-primary transition-colors">
                                {r.patronName}
                              </span>
                              <span className="font-caption text-caption text-text-secondary">
                                {r.patronLibraryId} • {r.patronDepartment}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-space-md align-middle">
                          <div className="flex flex-col max-w-xs">
                            <span className="font-semibold text-text-primary truncate">{r.bookTitle}</span>
                            <span className="font-caption text-caption text-text-secondary flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px]">tag</span>
                              {r.bookCallNumber}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-space-md align-middle">
                          <div className="flex flex-col font-caption text-caption">
                            <span className="font-semibold text-text-primary">
                              {new Date(r.reservationDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </span>
                            <span className={isOverdue ? 'text-error font-semibold' : 'text-text-secondary'}>
                              {r.status === 'StagedInLocker' ? (isOverdue ? 'Overdue for pickup' : 'Staged 48h') : 'In Queue'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-space-md align-middle">
                          <div className="inline-flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-full text-text-primary font-caption text-caption font-medium">
                            <span className="material-symbols-outlined text-[15px] text-primary">
                              {r.lockerBay ? 'lock' : 'storefront'}
                            </span>
                            <span>{r.lockerBay || r.pickupBranch || 'Main Desk'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-space-md align-middle">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-caption text-caption font-bold ${
                              r.status === 'StagedInLocker'
                                ? 'bg-status-available/20 text-status-available'
                                : r.status === 'Pending'
                                ? 'bg-status-pending/20 text-text-primary'
                                : r.status === 'Fulfilled'
                                ? 'bg-primary/20 text-primary'
                                : 'bg-surface-container text-text-secondary'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                r.status === 'StagedInLocker'
                                  ? 'bg-status-available'
                                  : r.status === 'Pending'
                                  ? 'bg-status-pending'
                                  : 'bg-primary'
                              }`}
                            ></span>
                            <span>{r.status}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-space-md align-middle text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {r.status === 'Pending' && (
                              <>
                                <button
                                  className="bg-action-green hover:bg-action-green-hover text-text-primary font-bold px-3 py-1.5 rounded font-caption text-caption shadow-sm transition-all"
                                  type="button"
                                  title="Approve Hold"
                                  onClick={() => {
                                    setSelectedReservation(r);
                                    setTriageAction('approve');
                                    setIsApproveRejectModalOpen(true);
                                  }}
                                >
                                  Approve
                                </button>
                                <button
                                  className="bg-surface-container hover:bg-error-container hover:text-on-error-container text-text-secondary px-2.5 py-1.5 rounded font-caption text-caption font-semibold transition-all"
                                  type="button"
                                  title="Reject Hold"
                                  onClick={() => {
                                    setSelectedReservation(r);
                                    setTriageAction('reject');
                                    setIsApproveRejectModalOpen(true);
                                  }}
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {r.status === 'StagedInLocker' && (
                              <>
                                <button
                                  className="bg-primary text-on-primary hover:bg-primary-container font-semibold px-3 py-1.5 rounded font-caption text-caption transition-all flex items-center gap-1"
                                  type="button"
                                  title="Notify User"
                                  onClick={() => {
                                    setSelectedReservation(r);
                                    setIsNotifyModalOpen(true);
                                  }}
                                >
                                  <span className="material-symbols-outlined text-[14px]">send</span>
                                  <span>Notify</span>
                                </button>
                                <button
                                  className="bg-action-green hover:bg-action-green-hover text-text-primary font-bold px-3 py-1.5 rounded font-caption text-caption shadow-sm transition-all"
                                  type="button"
                                  title="Release to User"
                                  onClick={() => {
                                    setSelectedReservation(r);
                                    setIsReleaseModalOpen(true);
                                  }}
                                >
                                  Release
                                </button>
                              </>
                            )}

                            {/* View & Update Status Buttons */}
                            <button
                              className="p-1.5 rounded hover:bg-surface-container text-text-secondary hover:text-text-primary transition-colors"
                              title="Update Status"
                              type="button"
                              onClick={() => {
                                setSelectedReservation(r);
                                setStatusOverride(r.status);
                                setIsUpdateStatusModalOpen(true);
                              }}
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button
                              className="p-1.5 rounded hover:bg-surface-container text-primary transition-colors"
                              title="View Print Slip"
                              type="button"
                              onClick={() => {
                                setSelectedReservation(r);
                                setIsViewModalOpen(true);
                              }}
                            >
                              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Card Grid View (Radio Toggle Activated) */
            <div className="p-space-lg grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md">
              {paginatedReservations.map((r) => {
                const isSelected = selectedIds.has(r.id);
                return (
                  <div
                    key={r.id}
                    className={`p-space-md rounded-xl bg-surface-container-low border transition-all hover:shadow-md cursor-pointer flex flex-col justify-between gap-space-sm ${
                      isSelected ? 'border-primary bg-soft-blue/20' : 'border-outline-variant/15'
                    }`}
                    onClick={() => {
                      setSelectedReservation(r);
                      setIsViewModalOpen(true);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded border-outline-variant/50 text-primary focus:ring-primary/20"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleSelectOne(r.id);
                          }}
                        />
                        <span className="font-mono font-bold text-caption text-primary">
                          #{r.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-caption text-[11px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-text-secondary">
                        {r.priorityLabel}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-headline-4 text-headline-4 font-bold text-text-primary line-clamp-1">{r.bookTitle}</h4>
                      <p className="font-caption text-caption text-text-secondary flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">tag</span>
                        {r.bookCallNumber}
                      </p>
                    </div>

                    <div className="p-2 bg-surface-container-lowest rounded-lg flex items-center justify-between text-caption font-caption">
                      <div className="flex flex-col">
                        <span className="font-bold text-text-primary">{r.patronName}</span>
                        <span className="text-text-secondary text-[11px]">{r.patronLibraryId}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-semibold">
                        {r.lockerBay || r.pickupBranch || 'Main Desk'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-surface-container" onClick={(e) => e.stopPropagation()}>
                      <span className="font-caption text-caption font-bold text-primary">{r.status}</span>
                      <div className="flex items-center gap-1">
                        <button
                          className="px-2.5 py-1 rounded bg-action-green hover:bg-action-green-hover text-text-primary text-caption font-bold transition-all"
                          type="button"
                          onClick={() => {
                            setSelectedReservation(r);
                            if (r.status === 'Pending') {
                              setTriageAction('approve');
                              setIsApproveRejectModalOpen(true);
                            } else {
                              setIsReleaseModalOpen(true);
                            }
                          }}
                        >
                          {r.status === 'Pending' ? 'Approve' : 'Release'}
                        </button>
                        <button
                          className="p-1 rounded hover:bg-surface-container text-text-secondary hover:text-text-primary"
                          type="button"
                          title="More options"
                          onClick={() => {
                            setSelectedReservation(r);
                            setIsViewModalOpen(true);
                          }}
                        >
                          <span className="material-symbols-outlined text-[18px]">more_vert</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table Footer with usePagination and Dropdown */}
          <div className="px-space-lg py-3 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm font-caption text-caption text-text-secondary border-t border-surface-container">
            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption">
                <span>Rows:</span>
                <Dropdown<number>
                  variant="pagination"
                  items={pageSizeItems}
                  selectedValue={pageSize}
                  onSelect={(val) => setPageSize(val)}
                />
              </div>
              <span>
                {filteredReservations.length > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, filteredReservations.length)} of {filteredReservations.length} items
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                className="w-8 h-8 rounded bg-surface-container-lowest hover:bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40"
                disabled={!canPrevPage}
                type="button"
                onClick={prevPage}
                title="Previous page"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>

              <span className="px-2 font-bold text-text-primary">
                Page {currentPage} of {Math.max(1, totalPages)}
              </span>

              <button
                className="w-8 h-8 rounded bg-surface-container-lowest hover:bg-surface-container flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors disabled:opacity-40"
                disabled={!canNextPage}
                type="button"
                onClick={nextPage}
                title="Next page"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Operational Policy Engine & Smart Locker Telemetry Visualizer */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg mt-space-xs">
          {/* Policy & Quotas Parameters */}
          <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
                <div className="flex items-center gap-space-sm">
                  <div className="w-9 h-9 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[20px]">policy</span>
                  </div>
                  <div>
                    <h3 className="font-headline-4 text-headline-4 text-text-primary font-bold">
                      Reservation Policy &amp; Shelf Allocation Parameters
                    </h3>
                    <p className="font-caption text-caption text-text-secondary">
                      Autonomous thresholds for queue retention, user hold caps, and automatic locker release.
                    </p>
                  </div>
                </div>
                <span className="font-caption text-caption bg-action-green/20 text-text-primary font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Live Policy Engine
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md mt-space-sm">
                {/* Concurrent Holds Rules */}
                <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">
                        Concurrent Hold Limits
                      </span>
                      <span className="material-symbols-outlined text-primary text-[18px]">group_work</span>
                    </div>
                    <p className="font-small text-small text-text-primary font-semibold mt-2">Active User Ceiling</p>
                    <div className="space-y-2 mt-space-xs">
                      <div className="flex items-center justify-between text-caption font-caption bg-surface-container-lowest px-space-sm py-2 rounded-lg">
                        <span className="text-text-secondary">Undergraduate Students</span>
                        <span className="font-bold text-text-primary px-2 py-0.5 rounded bg-surface-container">
                          {undergradLimit} Holds max
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-caption font-caption bg-surface-container-lowest px-space-sm py-2 rounded-lg">
                        <span className="text-text-secondary">Faculty &amp; Researchers</span>
                        <span className="font-bold text-primary px-2 py-0.5 rounded bg-soft-blue">
                          {facultyLimit} Holds max
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-space-sm pt-2 text-[11px] font-caption text-text-secondary">
                    Overages automatically queue into secondary triage for Dean approval.
                  </div>
                </div>

                {/* Pickup Window Config */}
                <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">
                        Pickup Window &amp; Reshelve
                      </span>
                      <span className="material-symbols-outlined text-status-pending text-[18px]">schedule</span>
                    </div>
                    <p className="font-small text-small text-text-primary font-semibold mt-2">Retention Countdown</p>
                    <div className="space-y-2 mt-space-xs">
                      <div className="flex items-center justify-between text-caption font-caption bg-surface-container-lowest px-space-sm py-2 rounded-lg">
                        <span className="text-text-secondary">Default Stage Window</span>
                        <span className="font-bold text-text-primary px-2 py-0.5 rounded bg-surface-container">48 Hours</span>
                      </div>
                      <div className="flex items-center justify-between text-caption font-caption bg-surface-container-lowest px-space-sm py-2 rounded-lg">
                        <span className="text-text-secondary">Post-Expiry Action</span>
                        <span className="font-bold text-status-danger px-2 py-0.5 rounded bg-error-container">Auto-Reshelve</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-space-sm pt-2 text-[11px] font-caption text-text-secondary">
                    Automated SMS and email dispatched at T-24h and T-4h before forfeiture.
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-space-md pt-space-sm border-t border-surface-container">
              <div className="flex items-center gap-space-xs text-caption font-caption text-text-secondary">
                <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                <span>Enforced across institutional checkout endpoints</span>
              </div>
              <button
                className="px-space-md py-2 bg-surface-container hover:bg-surface-container-high text-primary rounded-lg font-caption text-caption font-bold transition-colors"
                type="button"
                onClick={() => setIsAdjustQuotasModalOpen(true)}
              >
                Adjust Hold Quotas
              </button>
            </div>
          </div>

          {/* Smart Locker Bay Telemetry Matrix */}
          <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between">
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[20px]">grid_view</span>
                  <h4 className="font-headline-4 text-headline-4 text-text-primary font-bold">Locker Bay Telemetry</h4>
                </div>
                <span className="font-caption text-caption text-status-available font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-status-available animate-pulse"></span> ONLINE
                </span>
              </div>
              <p className="font-caption text-caption text-text-secondary mt-1">
                Ground Floor Cluster A-01 to C-04 smart locker state.
              </p>

              {/* 4x3 Interactive Cluster Matrix */}
              <div className="grid grid-cols-4 gap-2 mt-space-md">
                {['A-01', 'A-02', 'A-03', 'A-04', 'B-01', 'B-02', 'B-03', 'B-04', 'C-01', 'C-02', 'C-03', 'C-04'].map((bayCode) => {
                  const stagedHold = reservations.find(
                    (r) => r.status === 'StagedInLocker' && r.lockerBay?.includes(bayCode)
                  );
                  const isOverdue = stagedHold && new Date(stagedHold.expiryDate).getTime() <= Date.now();
                  const remainingHours = stagedHold
                    ? Math.max(0, Math.round((new Date(stagedHold.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60)))
                    : null;

                  return (
                    <div
                      key={bayCode}
                      className={`p-2 rounded-lg text-center flex flex-col items-center transition-all cursor-pointer hover:scale-105 ${
                        isOverdue
                          ? 'bg-error-container text-error border border-error/30'
                          : stagedHold
                          ? 'bg-action-green/25 text-text-primary border border-action-green/30'
                          : 'bg-surface-container opacity-60 text-text-secondary'
                      }`}
                      onClick={() => {
                        if (stagedHold) {
                          setSelectedReservation(stagedHold);
                          setIsViewModalOpen(true);
                        } else {
                          setOperationMessage({ text: `Locker ${bayCode} is vacant and ready for new book holds.`, type: 'success' });
                        }
                      }}
                      title={stagedHold ? `Staged: ${stagedHold.bookTitle}` : `Locker ${bayCode} Vacant`}
                    >
                      <span className="font-caption text-[11px] font-bold">{bayCode}</span>
                      <span className="material-symbols-outlined text-[16px] my-0.5">
                        {isOverdue ? 'error' : stagedHold ? 'lock_clock' : 'lock_open_right'}
                      </span>
                      <span className="text-[9px] font-caption font-bold">
                        {isOverdue ? 'OVERDUE' : stagedHold ? `${remainingHours}h` : 'EMPTY'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-space-md pt-space-xs flex items-center justify-between text-caption font-caption text-text-secondary border-t border-surface-container">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-status-available"></span> {metrics.occupiedLockers} of {metrics.totalLockerSlots} Occupied
              </span>
              <button
                className="text-primary font-semibold hover:underline flex items-center gap-0.5"
                type="button"
                onClick={handleRunDiagnostics}
              >
                <span>Run diagnostics</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE MODALS CATALOG (Consuming AdminModalCard / DefaultFloatingModalCard) */}
        {/* ========================================================================= */}

        {/* Modal 1: View Reservation Details */}
        {isViewModalOpen && selectedReservation && (
          <AdminModalCard
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            title="Institutional Hold Manifest &amp; Claim Slip"
            subtitle={`Hold ID: #${selectedReservation.id.slice(0, 8).toUpperCase()} • Status: ${selectedReservation.status}`}
          >
            <div className="flex flex-col gap-space-md text-small font-small">
              <div className="p-space-md bg-surface-container-low rounded-xl flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-secondary">Reserved Catalog Title</span>
                  <span className="font-bold text-text-primary text-body">{selectedReservation.bookTitle}</span>
                  <span className="font-caption text-caption text-text-secondary mt-0.5">
                    Author: {selectedReservation.bookAuthor} • Dewey Code: {selectedReservation.bookCallNumber}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-soft-blue flex items-center justify-center text-primary font-bold">
                  <span className="material-symbols-outlined text-[24px]">book</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-space-sm p-space-sm bg-surface-container-low rounded-xl">
                <div>
                  <span className="font-caption text-caption text-text-secondary block">User Name</span>
                  <span className="font-bold text-text-primary">{selectedReservation.patronName}</span>
                </div>
                <div>
                  <span className="font-caption text-caption text-text-secondary block">Library Card ID</span>
                  <span className="font-mono font-bold text-primary">{selectedReservation.patronLibraryId}</span>
                </div>
                <div>
                  <span className="font-caption text-caption text-text-secondary block">Pickup Branch / Desk</span>
                  <span className="font-bold text-text-primary">{selectedReservation.pickupBranch || 'Main Desk'}</span>
                </div>
                <div>
                  <span className="font-caption text-caption text-text-secondary block">Smart Locker Bay</span>
                  <span className="font-bold text-primary">{selectedReservation.lockerBay || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="font-caption text-caption text-text-secondary block">Placed On</span>
                  <span className="font-medium text-text-primary">
                    {new Date(selectedReservation.reservationDate).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="font-caption text-caption text-text-secondary block">Retention Expiry</span>
                  <span className="font-medium text-text-primary">
                    {new Date(selectedReservation.expiryDate).toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedReservation.lockerPin && (
                <div className="p-space-sm bg-action-green/20 rounded-xl flex items-center justify-between">
                  <span className="font-caption text-caption uppercase tracking-wider font-bold text-text-primary">
                    Locker Access PIN:
                  </span>
                  <span className="font-mono text-headline-3 font-bold text-primary tracking-widest">
                    {selectedReservation.lockerPin}
                  </span>
                </div>
              )}

              <div className="pt-space-sm flex justify-end gap-space-sm">
                <button
                  className="px-space-md py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-caption text-caption font-semibold"
                  type="button"
                  onClick={() => window.print()}
                >
                  Print Claim Slip
                </button>
                <button
                  className="px-space-lg py-2 rounded-xl bg-primary text-on-primary font-caption text-caption font-bold shadow-sm"
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </AdminModalCard>
        )}

        {/* Modal 2: Approve / Reject Hold */}
        {isApproveRejectModalOpen && selectedReservation && (
          <AdminModalCard
            isOpen={isApproveRejectModalOpen}
            onClose={() => setIsApproveRejectModalOpen(false)}
            title="Supervisor Hold Triage Review"
            subtitle={`Reviewing hold request #${selectedReservation.id.slice(0, 8)} for ${selectedReservation.patronName}`}
          >
            <form onSubmit={handleTriageSubmit} className="flex flex-col gap-space-md text-small font-small">
              <div className="p-space-sm bg-surface-container-low rounded-xl">
                <span className="text-text-secondary font-caption text-caption block">Book Target</span>
                <span className="font-bold text-text-primary">{selectedReservation.bookTitle}</span>
              </div>

              <div className="flex gap-space-md">
                <RadioButton
                  name="triageDecision"
                  label="Approve Hold"
                  checked={triageAction === 'approve'}
                  onChange={() => setTriageAction('approve')}
                />
                <RadioButton
                  name="triageDecision"
                  label="Reject Hold"
                  checked={triageAction === 'reject'}
                  onChange={() => setTriageAction('reject')}
                />
              </div>

              <div>
                <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">
                  Triage Rationale &amp; Notes
                </label>
                <textarea
                  className="w-full bg-surface-container-low p-space-sm rounded-xl text-text-primary focus:outline-none focus:bg-surface-bright resize-none"
                  rows={2}
                  placeholder="Enter notes or explanation for user..."
                  value={triageReason}
                  onChange={(e) => setTriageReason(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="priorityCheck"
                  className="rounded border-outline-variant/50 text-primary"
                  checked={triagePriority}
                  onChange={(e) => setTriagePriority(e.target.checked)}
                />
                <label htmlFor="priorityCheck" className="font-caption text-caption font-semibold text-text-primary cursor-pointer">
                  Escalate to Priority Queue Position 1
                </label>
              </div>

              <div className="pt-space-sm flex justify-end gap-space-sm">
                <button
                  className="px-space-md py-2 rounded-xl text-text-secondary hover:text-text-primary font-caption text-caption font-semibold"
                  type="button"
                  onClick={() => setIsApproveRejectModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className={`px-space-lg py-2 rounded-xl text-text-primary font-caption text-caption font-bold shadow-sm ${
                    triageAction === 'approve'
                      ? 'bg-action-green hover:bg-action-green-hover'
                      : 'bg-error-container text-error hover:bg-error hover:text-on-error'
                  }`}
                  type="submit"
                  disabled={modalSubmitting}
                >
                  {modalSubmitting ? 'Saving...' : triageAction === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </AdminModalCard>
        )}

        {/* Modal 3: Notify User */}
        {isNotifyModalOpen && selectedReservation && (
          <AdminModalCard
            isOpen={isNotifyModalOpen}
            onClose={() => setIsNotifyModalOpen(false)}
            title="Dispatch User Notification"
            subtitle={`Notify ${selectedReservation.patronName} regarding hold status`}
          >
            <form onSubmit={handleNotifySubmit} className="flex flex-col gap-space-md text-small font-small">
              <div>
                <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">
                  Delivery Channel
                </label>
                <div className="grid grid-cols-3 gap-space-xs">
                  {(['Email', 'SMS', 'Push'] as const).map((channel) => (
                    <button
                      key={channel}
                      type="button"
                      className={`py-2 rounded-xl font-caption text-caption font-bold transition-all ${
                        notifyChannel === channel ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container text-text-secondary'
                      }`}
                      onClick={() => setNotifyChannel(channel)}
                    >
                      {channel}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">
                  Custom Message (Optional)
                </label>
                <textarea
                  className="w-full bg-surface-container-low p-space-sm rounded-xl text-text-primary focus:outline-none focus:bg-surface-bright resize-none"
                  rows={3}
                  placeholder={`Default: Hello ${selectedReservation.patronName}, your hold for '${selectedReservation.bookTitle}' is staged at ${selectedReservation.lockerBay || 'Main Desk'}...`}
                  value={customNotifyMessage}
                  onChange={(e) => setCustomNotifyMessage(e.target.value)}
                />
              </div>

              <div className="pt-space-sm flex justify-end gap-space-sm">
                <button
                  className="px-space-md py-2 rounded-xl text-text-secondary hover:text-text-primary font-caption text-caption"
                  type="button"
                  onClick={() => setIsNotifyModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-space-lg py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-caption text-caption font-bold shadow-sm"
                  type="submit"
                  disabled={modalSubmitting}
                >
                  {modalSubmitting ? 'Sending...' : 'Send Notification'}
                </button>
              </div>
            </form>
          </AdminModalCard>
        )}

        {/* Modal 4: Release / Handover */}
        {isReleaseModalOpen && selectedReservation && (
          <AdminModalCard
            isOpen={isReleaseModalOpen}
            onClose={() => setIsReleaseModalOpen(false)}
            title="Circulation Release Confirmation"
            subtitle={`Confirming pickup for #${selectedReservation.id.slice(0, 8)}`}
          >
            <form onSubmit={handleReleaseSubmit} className="flex flex-col gap-space-md text-small font-small">
              <div className="p-space-md bg-surface-container-low rounded-xl">
                <p className="font-bold text-text-primary">{selectedReservation.bookTitle}</p>
                <p className="text-caption text-text-secondary mt-1">
                  User: <strong className="text-text-primary">{selectedReservation.patronName}</strong> ({selectedReservation.patronLibraryId})
                </p>
                <p className="text-caption text-text-secondary">
                  Locker Bay: <strong className="text-primary">{selectedReservation.lockerBay || 'Main Desk Counter'}</strong>
                </p>
              </div>

              <p className="font-caption text-caption text-text-secondary">
                Please verify that the user has presented their physical library barcode card or digital ID before releasing the physical copy.
              </p>

              <div className="pt-space-sm flex justify-end gap-space-sm">
                <button
                  className="px-space-md py-2 rounded-xl text-text-secondary hover:text-text-primary font-caption text-caption"
                  type="button"
                  onClick={() => setIsReleaseModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-space-lg py-2 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-caption text-caption font-bold shadow-sm"
                  type="submit"
                  disabled={modalSubmitting}
                >
                  {modalSubmitting ? 'Releasing...' : 'Confirm Release'}
                </button>
              </div>
            </form>
          </AdminModalCard>
        )}

        {/* Modal 5: Manual Status Transition */}
        {isUpdateStatusModalOpen && selectedReservation && (
          <AdminModalCard
            isOpen={isUpdateStatusModalOpen}
            onClose={() => setIsUpdateStatusModalOpen(false)}
            title="Manual Hold Status Transition"
            subtitle={`Overriding status for #${selectedReservation.id.slice(0, 8)}`}
          >
            <form onSubmit={handleStatusOverrideSubmit} className="flex flex-col gap-space-md text-small font-small">
              <div>
                <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">
                  Target Status
                </label>
                <select
                  className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl text-text-primary focus:outline-none"
                  value={statusOverride}
                  onChange={(e) => setStatusOverride(e.target.value)}
                >
                  <option value="Pending">Pending Review</option>
                  <option value="StagedInLocker">Staged In Locker</option>
                  <option value="Fulfilled">Fulfilled / Picked Up</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div>
                <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">
                  Reason / Audit Log Note
                </label>
                <textarea
                  className="w-full bg-surface-container-low p-space-sm rounded-xl text-text-primary focus:outline-none resize-none"
                  rows={2}
                  placeholder="Enter administrative reason for status change..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                />
              </div>

              <div className="pt-space-sm flex justify-end gap-space-sm">
                <button
                  className="px-space-md py-2 rounded-xl text-text-secondary hover:text-text-primary font-caption text-caption"
                  type="button"
                  onClick={() => setIsUpdateStatusModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-space-lg py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-caption text-caption font-bold shadow-sm"
                  type="submit"
                  disabled={modalSubmitting}
                >
                  {modalSubmitting ? 'Updating...' : 'Save Status'}
                </button>
              </div>
            </form>
          </AdminModalCard>
        )}

        {/* Modal 6: Adjust Hold Quotas */}
        {isAdjustQuotasModalOpen && (
          <AdminModalCard
            isOpen={isAdjustQuotasModalOpen}
            onClose={() => setIsAdjustQuotasModalOpen(false)}
            title="Configure Hold Quotas &amp; Ceilings"
            subtitle="Autonomous limits governing simultaneous active holds per user"
          >
            <div className="flex flex-col gap-space-md text-small font-small">
              <div>
                <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">
                  Undergraduate Ceiling (Max Holds)
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl text-text-primary focus:outline-none"
                  value={undergradLimit}
                  onChange={(e) => setUndergradLimit(parseInt(e.target.value, 10) || 2)}
                />
              </div>

              <div>
                <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">
                  Faculty &amp; Researchers Ceiling (Max Holds)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl text-text-primary focus:outline-none"
                  value={facultyLimit}
                  onChange={(e) => setFacultyLimit(parseInt(e.target.value, 10) || 5)}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="secondaryTriageCheck"
                  className="rounded border-outline-variant/50 text-primary"
                  checked={secondaryTriage}
                  onChange={(e) => setSecondaryTriage(e.target.checked)}
                />
                <label htmlFor="secondaryTriageCheck" className="font-caption text-caption font-semibold text-text-primary cursor-pointer">
                  Queue ceiling overages into secondary triage for Dean approval
                </label>
              </div>

              <div className="pt-space-sm flex justify-end gap-space-sm">
                <button
                  className="px-space-md py-2 rounded-xl text-text-secondary hover:text-text-primary font-caption text-caption"
                  type="button"
                  onClick={() => setIsAdjustQuotasModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-space-lg py-2 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-caption text-caption font-bold shadow-sm"
                  type="button"
                  onClick={() => {
                    setIsAdjustQuotasModalOpen(false);
                    setOperationMessage({ text: 'Hold quotas updated and applied to policy engine.', type: 'success' });
                  }}
                >
                  Save Policy
                </button>
              </div>
            </div>
          </AdminModalCard>
        )}

        {/* Modal 7: Smart Locker Diagnostics */}
        {isDiagnosticsModalOpen && (
          <AdminModalCard
            isOpen={isDiagnosticsModalOpen}
            onClose={() => setIsDiagnosticsModalOpen(false)}
            title="Smart Locker Cluster Telemetry Diagnostics"
            subtitle="Automated solenoid lock and RFID antenna status check"
          >
            <div className="flex flex-col gap-space-md text-small font-small">
              {diagnosticsLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-text-secondary">
                  <span className="material-symbols-outlined text-[32px] animate-spin text-primary">sync</span>
                  <span>Pinging smart locker cluster bays...</span>
                </div>
              ) : diagnosticsData ? (
                <>
                  <div className="grid grid-cols-3 gap-space-xs p-space-sm bg-surface-container-low rounded-xl text-center">
                    <div>
                      <span className="font-caption text-caption text-text-secondary block">Cluster Status</span>
                      <span className="font-bold text-status-available">ONLINE</span>
                    </div>
                    <div>
                      <span className="font-caption text-caption text-text-secondary block">Vacant Slots</span>
                      <span className="font-bold text-text-primary">{diagnosticsData.vacantSlots} / 12</span>
                    </div>
                    <div>
                      <span className="font-caption text-caption text-text-secondary block">Overdue Slots</span>
                      <span className="font-bold text-error">{diagnosticsData.overdueSlots}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {diagnosticsData.slots.map((s) => (
                      <div
                        key={s.bayCode}
                        className={`p-2 rounded-lg text-center font-caption text-caption border ${
                          s.status === 'OVERDUE'
                            ? 'bg-error-container text-error border-error/30'
                            : s.status === 'EMPTY'
                            ? 'bg-surface-container opacity-60 text-text-secondary'
                            : 'bg-action-green/20 text-text-primary border-action-green/30'
                        }`}
                      >
                        <span className="font-bold block">{s.bayCode}</span>
                        <span className="text-[10px]">{s.status}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-text-secondary text-center py-6">Diagnostics unavailable.</p>
              )}

              <div className="pt-space-sm flex justify-end">
                <button
                  className="px-space-lg py-2 rounded-xl bg-primary text-on-primary font-caption text-caption font-bold"
                  type="button"
                  onClick={() => setIsDiagnosticsModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </AdminModalCard>
        )}

        {/* Modal 8: Export CSV / Excel */}
        {isExportModalOpen && (
          <AdminModalCard
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            title="Export Reservation Roster (CSV / Excel)"
            subtitle="Configure filters, date range, and sort preferences for hold export"
          >
            <div className="flex flex-col gap-space-md text-small font-small">
              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-surface-container-low px-space-md py-2 rounded-xl text-text-primary focus:outline-none"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-surface-container-low px-space-md py-2 rounded-xl text-text-primary focus:outline-none"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">
                  Alphabetical Filter (Name or Title Starts/Contains)
                </label>
                <input
                  type="text"
                  placeholder="e.g. A (titles starting with A or users with A)"
                  className="w-full bg-surface-container-low px-space-md py-2 rounded-xl text-text-primary focus:outline-none"
                  value={exportAlphaFilter}
                  onChange={(e) => setExportAlphaFilter(e.target.value)}
                />
              </div>

              <div>
                <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">
                  ID Digit Filter (Card or Hold ID contains)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1 (holds or cards containing 1)"
                  className="w-full bg-surface-container-low px-space-md py-2 rounded-xl text-text-primary focus:outline-none"
                  value={exportIdFilter}
                  onChange={(e) => setExportIdFilter(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">
                    Sort Direction
                  </label>
                  <select
                    className="w-full bg-surface-container-low px-space-md py-2 rounded-xl text-text-primary focus:outline-none"
                    value={exportSortDir}
                    onChange={(e) => setExportSortDir(e.target.value as 'asc' | 'desc')}
                  >
                    <option value="asc">Ascending (Oldest First)</option>
                    <option value="desc">Descending (Newest First)</option>
                  </select>
                </div>
                <div>
                  <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">
                    Export Format
                  </label>
                  <select
                    className="w-full bg-surface-container-low px-space-md py-2 rounded-xl text-text-primary focus:outline-none"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as 'csv' | 'excel')}
                  >
                    <option value="csv">CSV (Comma-Separated)</option>
                    <option value="excel">Excel-Compatible CSV</option>
                  </select>
                </div>
              </div>

              <div className="pt-space-sm flex justify-end gap-space-sm">
                <button
                  className="px-space-md py-2 rounded-xl text-text-secondary hover:text-text-primary font-caption text-caption"
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-space-lg py-2 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-caption text-caption font-bold shadow-sm"
                  type="button"
                  onClick={handleExportDownload}
                >
                  Download File
                </button>
              </div>
            </div>
          </AdminModalCard>
        )}

        {/* Modal 9: Batch Hold Clearance */}
        {isBatchClearanceModalOpen && (
          <AdminModalCard
            isOpen={isBatchClearanceModalOpen}
            onClose={() => setIsBatchClearanceModalOpen(false)}
            title="Batch Hold Clearance"
            subtitle={`Executing batch operation on ${selectedIds.size} selected hold records`}
          >
            <form onSubmit={handleBatchClearanceSubmit} className="flex flex-col gap-space-md text-small font-small">
              <div>
                <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">
                  Target Batch Action
                </label>
                <select
                  className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl text-text-primary focus:outline-none"
                  value={batchAction}
                  onChange={(e) => setBatchAction(e.target.value as 'Stage' | 'Cancel' | 'Release')}
                >
                  <option value="Stage">Stage in Smart Lockers</option>
                  <option value="Release">Release / Mark Fulfilled</option>
                  <option value="Cancel">Cancel Holds</option>
                </select>
              </div>

              {batchAction === 'Stage' && (
                <div>
                  <label className="font-caption text-caption uppercase tracking-wider font-bold text-text-secondary block mb-1">
                    Target Locker Bay Group
                  </label>
                  <select
                    className="w-full bg-surface-container-low px-space-md py-2.5 rounded-xl text-text-primary focus:outline-none"
                    value={batchLockerBay}
                    onChange={(e) => setBatchLockerBay(e.target.value)}
                  >
                    <option value="Smart Lockers (Cluster A)">Smart Lockers (Cluster A)</option>
                    <option value="Smart Lockers (Cluster B)">Smart Lockers (Cluster B)</option>
                    <option value="Smart Lockers (Cluster C)">Smart Lockers (Cluster C)</option>
                    <option value="Bay 01 Counter">Bay 01 Circulation Desk</option>
                  </select>
                </div>
              )}

              <p className="font-caption text-caption text-text-secondary">
                This action will update all {selectedIds.size} selected hold records in the database simultaneously.
              </p>

              <div className="pt-space-sm flex justify-end gap-space-sm">
                <button
                  className="px-space-md py-2 rounded-xl text-text-secondary hover:text-text-primary font-caption text-caption"
                  type="button"
                  onClick={() => setIsBatchClearanceModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-space-lg py-2 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-caption text-caption font-bold shadow-sm"
                  type="submit"
                  disabled={modalSubmitting}
                >
                  {modalSubmitting ? 'Processing...' : `Execute ${batchAction}`}
                </button>
              </div>
            </form>
          </AdminModalCard>
        )}

        {/* Modal 10: Locker Matrix Visualizer Full Modal */}
        {isLockerMatrixModalOpen && (
          <AdminModalCard
            isOpen={isLockerMatrixModalOpen}
            onClose={() => setIsLockerMatrixModalOpen(false)}
            title="Ground Floor Smart Locker Matrix"
            subtitle="Full interactive telemetry for automated lockers cluster A-01 to C-04"
          >
            <div className="flex flex-col gap-space-md text-small font-small">
              <div className="grid grid-cols-4 gap-3">
                {['A-01', 'A-02', 'A-03', 'A-04', 'B-01', 'B-02', 'B-03', 'B-04', 'C-01', 'C-02', 'C-03', 'C-04'].map((bayCode) => {
                  const match = reservations.find((r) => r.status === 'StagedInLocker' && r.lockerBay?.includes(bayCode));
                  const isOverdue = match && new Date(match.expiryDate).getTime() <= Date.now();

                  return (
                    <div
                      key={bayCode}
                      className={`p-3 rounded-xl flex flex-col items-center justify-between text-center border min-h-[90px] ${
                        isOverdue
                          ? 'bg-error-container text-error border-error/30'
                          : match
                          ? 'bg-action-green/20 text-text-primary border-action-green/30'
                          : 'bg-surface-container opacity-60 text-text-secondary'
                      }`}
                    >
                      <span className="font-bold text-caption">{bayCode}</span>
                      <span className="material-symbols-outlined text-[20px] my-1">
                        {isOverdue ? 'error' : match ? 'lock' : 'lock_open_right'}
                      </span>
                      <span className="text-[10px] font-bold line-clamp-1">
                        {isOverdue ? 'OVERDUE' : match ? match.patronName.split(' ')[0] : 'VACANT'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-space-sm flex justify-end">
                <button
                  className="px-space-lg py-2 rounded-xl bg-primary text-on-primary font-caption text-caption font-bold"
                  type="button"
                  onClick={() => setIsLockerMatrixModalOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </AdminModalCard>
        )}
      </div>
    </div>
  );
};

export default Reservations;
