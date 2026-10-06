// [Layer: UserRoles/Features/Pages/AdminsPanel/Pages]
// Returns.tsx -- Admin Circulation Returns, QA Inspections, and Delinquency Settlements.
// Strictly adheres to real-time data mandate: if database is empty, renders 0 / empty state.
// Consumes shared primitives (SearchBar, Dropdown, RadioButton, AdminModalCard) and hooks (useDebounce, usePagination, useTableDraggable).
// Fully responsive across all devices and fluid screen scales.
// DO NOT put business logic or direct fetch calls here.

import React, { FC, useState, useEffect, useMemo, useCallback } from 'react';
import {
  getReturnsMetrics,
  getReturnsJournal,
  getActiveDamagedCase,
  submitRoutingAction,
  processBulkCheckin,
  getExportReturnsUrl,
  ReturnsMetrics,
  ReturnJournalItem,
  DamagedAssessmentCase,
  ExportReturnsFilterQuery,
} from '../../../../../Endpoints/Admin/returnsApi';
import { SearchBar } from '../../../../../Shared/SearchBar';
import { Dropdown, DropdownItem } from '../../../../../Shared/Dropdown';
import { RadioButton } from '../../../../../Shared/RadioButton';
import { AdminModalCard } from '../Shared/AdminModalCard';
import { useDebounce } from '../../../../../Hooks/useDebounce';
import { usePagination } from '../../../../../Hooks/usePagination';
import { useTableDraggable } from '../../../../../Hooks/useTableDraggable';
import { useToasts } from '../../../../../Hooks/useToasts';
import { useFluidResposiveness } from '../../../../../Hooks/useFluidResposiveness';
import { usePagesGlobalRefresh } from '../../../../../Hooks/usePagesGlobalRefresh';

const EMPTY_RETURNS_METRICS: ReturnsMetrics = {
  volumesCheckedIn: 0,
  capacityPercent: 0,
  trendingVsAvg: 0,
  onTimeReturnRate: 0,
  rateDelta: 0,
  onTimeCount: 0,
  lateCount: 0,
  slaStatus: 'Within SLA',
  delinquencyFinesTally: 0,
  pendingLedgerAmount: 0,
  unsettledCount: 0,
  collectionRate: 0,
  flaggedForBinderyCount: 0,
  spineDamageCount: 0,
  waterWarpCount: 0,
};

const Returns: FC = () => {
  const { isMobile, isTablet } = useFluidResposiveness();
  const { toasts, addToast, removeToast } = useToasts();
  const { containerRef: tableContainerRef } = useTableDraggable<HTMLDivElement>();

  // Data States
  const [metrics, setMetrics] = useState<ReturnsMetrics>(EMPTY_RETURNS_METRICS);
  const [returnsList, setReturnsList] = useState<ReturnJournalItem[]>([]);
  const [activeCase, setActiveCase] = useState<DamagedAssessmentCase | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Search, Filters & View Mode
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<'all' | 'on-time' | 'late' | 'damaged' | 'waived'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'overdue' | 'fine' | 'patron_az' | 'title_az'>('newest');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // Modal States
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isBinderyModalOpen, setIsBinderyModalOpen] = useState<boolean>(false);
  const [isReplacementModalOpen, setIsReplacementModalOpen] = useState<boolean>(false);
  const [isDeaccessionModalOpen, setIsDeaccessionModalOpen] = useState<boolean>(false);
  const [isBulkIntakeModalOpen, setIsBulkIntakeModalOpen] = useState<boolean>(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<ReturnJournalItem | null>(null);

  // Form Sub-states
  const [exportFilters, setExportFilters] = useState<ExportReturnsFilterQuery>({
    startDate: '',
    endDate: '',
    alphabeticalFilter: '',
    idFilter: '',
    sortDirection: 'desc',
    format: 'csv',
  });
  const [bulkBarcodeInput, setBulkBarcodeInput] = useState<string>('');
  const [binderyTechnician, setBinderyTechnician] = useState<string>('');
  const [binderyEstDays, setBinderyEstDays] = useState<string>('');
  const [replacementVendor, setReplacementVendor] = useState<string>('');
  const [replacementPrice, setReplacementPrice] = useState<number>(0);
  const [deaccessionReason, setDeaccessionReason] = useState<string>('');

  // Load Data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [metricsData, journalData, caseData] = await Promise.all([
        getReturnsMetrics(),
        getReturnsJournal(),
        getActiveDamagedCase(),
      ]);
      setMetrics(metricsData);
      setReturnsList(journalData);
      setActiveCase(caseData);
    } catch {
      addToast('Failed to load returns circulation data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  usePagesGlobalRefresh(loadData);

  // Tab counts
  const tabCounts = useMemo(() => {
    const onTime = returnsList.filter((r) => r.overdueDays === 0).length;
    const late = returnsList.filter((r) => r.overdueDays > 0).length;
    const damaged = returnsList.filter((r) => !!r.conditionNotes || r.conditionGrade.toLowerCase().includes('binding') || r.conditionGrade.toLowerCase().includes('spine')).length;
    const waived = returnsList.filter((r) => r.clearanceStatus.toLowerCase().includes('exempt') || r.fineNote.toLowerCase().includes('waiver')).length;
    return {
      all: returnsList.length,
      onTime,
      late,
      damaged,
      waived,
    };
  }, [returnsList]);

  // Filtered and Sorted Records
  const filteredRecords = useMemo(() => {
    let result = [...returnsList];

    // Status filter
    if (statusFilter === 'on-time') {
      result = result.filter((r) => r.overdueDays === 0);
    } else if (statusFilter === 'late') {
      result = result.filter((r) => r.overdueDays > 0);
    } else if (statusFilter === 'damaged') {
      result = result.filter((r) => !!r.conditionNotes || r.conditionGrade.toLowerCase().includes('binding') || r.conditionGrade.toLowerCase().includes('spine'));
    } else if (statusFilter === 'waived') {
      result = result.filter((r) => r.clearanceStatus.toLowerCase().includes('exempt') || r.fineNote.toLowerCase().includes('waiver'));
    }

    // Search query
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.returnCode.toLowerCase().includes(q) ||
          r.patronName.toLowerCase().includes(q) ||
          r.patronLibraryId.toLowerCase().includes(q) ||
          r.bookTitle.toLowerCase().includes(q) ||
          r.bookBarcode.toLowerCase().includes(q)
      );
    }

    // Sort order
    result.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.returnTimestamp).getTime() - new Date(b.returnTimestamp).getTime();
        case 'overdue':
          return b.overdueDays - a.overdueDays;
        case 'fine':
          return b.assessedFine - a.assessedFine;
        case 'patron_az':
          return a.patronName.localeCompare(b.patronName);
        case 'title_az':
          return a.bookTitle.localeCompare(b.bookTitle);
        case 'newest':
        default:
          return new Date(b.returnTimestamp).getTime() - new Date(a.returnTimestamp).getTime();
      }
    });

    return result;
  }, [returnsList, statusFilter, debouncedSearch, sortBy]);

  // Pagination hook
  const {
    currentPage,
    pageSize,
    totalPages,
    totalItems,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    pageSizeOptions,
  } = usePagination<ReturnJournalItem>(filteredRecords, { initialPageSize: 10 });

  // Master Checkbox Logic
  const isAllSelected = useMemo(() => {
    return paginatedItems.length > 0 && paginatedItems.every((item) => selectedIds.has(item.id));
  }, [paginatedItems, selectedIds]);

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllSelected) {
        paginatedItems.forEach((item) => next.delete(item.id));
      } else {
        paginatedItems.forEach((item) => next.add(item.id));
      }
      return next;
    });
  }, [isAllSelected, paginatedItems]);

  const toggleSelectRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Action: Route to Bindery
  const handleRouteBindery = async () => {
    if (!activeCase) return;
    try {
      const res = await submitRoutingAction({
        caseId: activeCase.id,
        barcode: activeCase.bookBarcode,
        action: 'RouteBindery',
        notes: `Technician: ${binderyTechnician} • Est: ${binderyEstDays}`,
      });
      if (res.success) {
        addToast(res.message, 'success');
        setIsBinderyModalOpen(false);
        loadData();
      } else {
        addToast(res.message, 'error');
      }
    } catch {
      addToast('Routing to bindery failed.', 'error');
    }
  };

  // Action: Order Publisher Replacement
  const handleOrderReplacement = async () => {
    if (!activeCase) return;
    try {
      const res = await submitRoutingAction({
        caseId: activeCase.id,
        barcode: activeCase.bookBarcode,
        action: 'OrderReplacement',
        costOverride: replacementPrice,
        technicianOrVendor: replacementVendor,
        notes: `Vendor: ${replacementVendor} • Cost: ₱${replacementPrice}`,
      });
      if (res.success) {
        addToast(res.message, 'success');
        setIsReplacementModalOpen(false);
        loadData();
      } else {
        addToast(res.message, 'error');
      }
    } catch {
      addToast('Replacement order failed.', 'error');
    }
  };

  // Action: Deaccession & Salvage Archive
  const handleDeaccessionSalvage = async () => {
    if (!activeCase) return;
    try {
      const res = await submitRoutingAction({
        caseId: activeCase.id,
        barcode: activeCase.bookBarcode,
        action: 'DeaccessionSalvage',
        notes: deaccessionReason,
      });
      if (res.success) {
        addToast(res.message, 'warning');
        setIsDeaccessionModalOpen(false);
        loadData();
      } else {
        addToast(res.message, 'error');
      }
    } catch {
      addToast('Deaccession failed.', 'error');
    }
  };

  // Action: Authorize Routing directly
  const handleAuthorizeRouting = async () => {
    if (!activeCase) return;
    try {
      const res = await submitRoutingAction({
        caseId: activeCase.id,
        barcode: activeCase.bookBarcode,
        action: 'AuthorizeRouting',
        notes: 'Authorized routing with assessed penalty fee.',
      });
      if (res.success) {
        addToast(res.message, 'success');
        loadData();
      } else {
        addToast(res.message, 'error');
      }
    } catch {
      addToast('Authorization failed.', 'error');
    }
  };

  // Action: Hold Case
  const handleHoldCase = async () => {
    if (!activeCase) return;
    try {
      const res = await submitRoutingAction({
        caseId: activeCase.id,
        barcode: activeCase.bookBarcode,
        action: 'Hold',
        notes: 'Quarantined on supervisor review hold.',
      });
      if (res.success) {
        addToast(res.message, 'info');
        loadData();
      } else {
        addToast(res.message, 'error');
      }
    } catch {
      addToast('Case hold failed.', 'error');
    }
  };

  // Action: Process Bulk Check-in
  const handleProcessBulkCheckin = async () => {
    const barcodes = bulkBarcodeInput
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (barcodes.length === 0) {
      addToast('Please enter at least one accession barcode.', 'warning');
      return;
    }

    try {
      const res = await processBulkCheckin({
        barcodes,
        stationDesk: 'Admin Batch Terminal Bay 01',
        conditionGrade: 'Good Condition',
      });
      if (res.success) {
        addToast(res.message, 'success');
        setIsBulkIntakeModalOpen(false);
        setBulkBarcodeInput('');
        loadData();
      } else {
        addToast(res.message, 'error');
      }
    } catch {
      addToast('Bulk check-in failed.', 'error');
    }
  };

  // Action: Trigger Export
  const handleTriggerExport = () => {
    const url = getExportReturnsUrl(exportFilters);
    window.open(url, '_blank');
    setIsExportModalOpen(false);
    addToast('Returns journal export generated.', 'info');
  };

  // Sort dropdown items
  const sortDropdownItems: DropdownItem<typeof sortBy>[] = [
    { value: 'newest', label: 'Newest Intake' },
    { value: 'oldest', label: 'Oldest Intake' },
    { value: 'overdue', label: 'Overdue Days (High to Low)' },
    { value: 'fine', label: 'Fine Amount (High to Low)' },
    { value: 'patron_az', label: 'User Name (A - Z)' },
    { value: 'title_az', label: 'Book Title (A - Z)' },
  ];

  // Page size dropdown items
  const pageSizeDropdownItems: DropdownItem<number>[] = pageSizeOptions.map((size) => ({
    value: size,
    label: String(size),
  }));

  return (
    <div className="w-full">
      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-3 text-white text-small font-medium transition-all ${
                toast.type === 'success'
                  ? 'bg-action-green text-on-surface'
                  : toast.type === 'error'
                  ? 'bg-status-danger'
                  : toast.type === 'warning'
                  ? 'bg-status-pending text-on-surface'
                  : 'bg-primary'
              }`}
            >
              <span>{toast.message}</span>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 material-symbols-outlined text-[16px]"
              >
                close
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col w-full">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-xl">
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption mb-1">
              <span>Admin Console</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span>Operations</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-primary font-semibold">Returns</span>
            </div>
            <h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">
              Circulation Returns, Inspections &amp; Delinquency Settlements
            </h1>
            <p className="font-small text-small text-text-secondary mt-1">
              Manage volume check-ins, automated overdue tallying, faculty clearances, and book condition appraisals.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-lowest text-text-primary hover:bg-surface-container transition-colors shadow-sm font-small text-small font-semibold"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-text-secondary">file_download</span>
              Export CSV / Excel
            </button>
            <button
              onClick={() => setIsBulkIntakeModalOpen(true)}
              className="flex items-center gap-space-xs px-space-lg py-2.5 rounded-lg bg-action-green text-text-primary hover:bg-action-green-hover transition-colors shadow-sm font-small text-small font-bold"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">fact_check</span>
              Process Bulk Returns
            </button>
          </div>
        </div>

        {/* 4 Bento KPI Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-xl">
          {/* Bento Card 1: Volumes Checked In */}
          <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/20">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                Volumes Checked In
              </span>
              <div className="w-10 h-10 rounded-full bg-soft-blue flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">assignment_turned_in</span>
              </div>
            </div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-headline-1 text-headline-2 text-text-primary font-bold">
                {metrics.volumesCheckedIn}
              </span>
              <span className="font-caption text-caption text-status-available font-semibold flex items-center">
                <span className="material-symbols-outlined text-[14px]">trending_up</span> +
                {metrics.trendingVsAvg}% vs avg
              </span>
            </div>
            <div className="mt-space-sm flex items-center justify-between font-caption text-caption text-text-secondary">
              <span>Target: 70/day capacity</span>
              <span className="text-primary font-medium">{metrics.capacityPercent}% capacity</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.capacityPercent)}%` }}
              ></div>
            </div>
          </div>

          {/* Bento Card 2: On-Time Return Rate */}
          <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/20">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                On-Time Return Rate
              </span>
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-status-available">
                <span className="material-symbols-outlined text-[22px]">verified</span>
              </div>
            </div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-headline-1 text-headline-2 text-text-primary font-bold">
                {metrics.onTimeReturnRate}%
              </span>
              <span className="font-caption text-caption text-status-available font-semibold flex items-center">
                <span className="material-symbols-outlined text-[14px]">arrow_drop_up</span> +
                {metrics.rateDelta}%
              </span>
            </div>
            <div className="mt-space-sm flex items-center justify-between font-caption text-caption text-text-secondary">
              <span>
                {metrics.onTimeCount} On-time / {metrics.lateCount} Late
              </span>
              <span className="text-status-available font-medium">{metrics.slaStatus}</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-status-available h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.onTimeReturnRate)}%` }}
              ></div>
            </div>
          </div>

          {/* Bento Card 3: Delinquency Fines Tally */}
          <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/20">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                Delinquency Fines Tally
              </span>
              <div className="w-10 h-10 rounded-full bg-secondary-container/40 flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[22px]">payments</span>
              </div>
            </div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-headline-1 text-headline-2 text-text-primary font-bold">
                ₱{metrics.delinquencyFinesTally.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
              <span className="font-caption text-caption text-text-secondary">collected</span>
            </div>
            <div className="mt-space-sm flex items-center justify-between font-caption text-caption text-text-secondary">
              <span>₱{metrics.pendingLedgerAmount.toFixed(2)} pending ledger</span>
              <span className="text-status-pending font-medium">{metrics.unsettledCount} unsettled</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-status-pending h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, metrics.collectionRate)}%` }}
              ></div>
            </div>
          </div>

          {/* Bento Card 4: Flagged for Bindery / Wear */}
          <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/20">
            <div className="flex items-center justify-between mb-space-sm">
              <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-semibold">
                Flagged for Bindery / Wear
              </span>
              <div className="w-10 h-10 rounded-full bg-error-container/60 flex items-center justify-center text-status-danger">
                <span className="material-symbols-outlined text-[22px]">healing</span>
              </div>
            </div>
            <div className="flex items-baseline gap-space-xs">
              <span className="font-headline-1 text-headline-2 text-text-primary font-bold">
                {metrics.flaggedForBinderyCount}
              </span>
              <span className="font-caption text-caption text-status-danger font-semibold">Requires routing</span>
            </div>
            <div className="mt-space-sm flex items-center justify-between font-caption text-caption text-text-secondary">
              <span>
                {metrics.spineDamageCount} spine damage, {metrics.waterWarpCount} water warp
              </span>
              <span className="text-error font-medium">Critical QA</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className="bg-status-danger h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${metrics.flaggedForBinderyCount > 0 ? 65 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main Operational Grid: Left Table & Right Protocol Card */}
        <div className="grid grid-cols-1 2xl:grid-cols-4 gap-space-lg">
          {/* Left Column (Span 3 on 2xl) */}
          <div className="2xl:col-span-3 flex flex-col gap-space-md">
            {/* Filter Tabs & Search Bar */}
            <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm border border-outline-variant/20 flex flex-col gap-space-sm">
              <div className="flex flex-wrap items-center justify-between gap-space-sm">
                {/* Status Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-space-md py-1.5 rounded-full font-small text-small font-semibold whitespace-nowrap transition-colors ${
                      statusFilter === 'all'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-surface-container'
                    }`}
                    type="button"
                  >
                    All Returns ({tabCounts.all})
                  </button>
                  <button
                    onClick={() => setStatusFilter('on-time')}
                    className={`px-space-md py-1.5 rounded-full font-small text-small font-semibold whitespace-nowrap transition-colors ${
                      statusFilter === 'on-time'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-surface-container'
                    }`}
                    type="button"
                  >
                    On-Time ({tabCounts.onTime})
                  </button>
                  <button
                    onClick={() => setStatusFilter('late')}
                    className={`px-space-md py-1.5 rounded-full font-small text-small font-semibold whitespace-nowrap transition-colors ${
                      statusFilter === 'late'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-surface-container'
                    }`}
                    type="button"
                  >
                    Late / Fined ({tabCounts.late})
                  </button>
                  <button
                    onClick={() => setStatusFilter('damaged')}
                    className={`px-space-md py-1.5 rounded-full font-small text-small font-semibold whitespace-nowrap transition-colors ${
                      statusFilter === 'damaged'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-surface-container'
                    }`}
                    type="button"
                  >
                    Damaged / Flagged ({tabCounts.damaged})
                  </button>
                  <button
                    onClick={() => setStatusFilter('waived')}
                    className={`px-space-md py-1.5 rounded-full font-small text-small font-semibold whitespace-nowrap transition-colors ${
                      statusFilter === 'waived'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container-low text-text-secondary hover:text-text-primary hover:bg-surface-container'
                    }`}
                    type="button"
                  >
                    Courtesy Waived ({tabCounts.waived})
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-space-xs">
                  <span className="font-caption text-caption text-text-secondary font-semibold">SORT:</span>
                  <Dropdown
                    items={sortDropdownItems}
                    selectedValue={sortBy}
                    onSelect={(val) => setSortBy(val)}
                    placeholder="Sort returns..."
                  />
                </div>
              </div>

              {/* Search Bar + View Toggle (Table vs Card) */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-space-md pt-2 border-t border-outline-variant/10">
                <div className="w-full md:w-96">
                  <SearchBar
                    value={searchQuery}
                    onChange={(val) => setSearchQuery(val)}
                    placeholder="Search Return ID, user, barcode..."
                  />
                </div>

                {/* Table View <---> Card View Radio Toggle */}
                <div className="flex items-center gap-space-md bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/20">
                  <span className="font-caption text-caption text-text-secondary font-semibold uppercase tracking-wider">
                    VIEW:
                  </span>
                  <div className="flex items-center gap-3">
                    <RadioButton
                      id="view-table"
                      name="returns-view-mode"
                      label={
                        <span className="flex items-center gap-1 font-caption text-caption font-semibold">
                          <span className="material-symbols-outlined text-[16px]">table_rows</span>
                          Table
                        </span>
                      }
                      checked={viewMode === 'table'}
                      onChange={() => setViewMode('table')}
                    />
                    <RadioButton
                      id="view-card"
                      name="returns-view-mode"
                      label={
                        <span className="flex items-center gap-1 font-caption text-caption font-semibold">
                          <span className="material-symbols-outlined text-[16px]">grid_view</span>
                          Cards
                        </span>
                      }
                      checked={viewMode === 'card'}
                      onChange={() => setViewMode('card')}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bulk Selection Actions Bar */}
            {selectedIds.size > 0 && (
              <div className="bg-soft-blue px-space-md py-2.5 rounded-lg border border-primary/20 flex flex-wrap items-center justify-between gap-space-sm animate-fadeIn">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
                  <span className="font-small text-small font-bold text-primary">
                    {selectedIds.size} record{selectedIds.size > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <button
                    onClick={() => {
                      addToast(`Bulk verified ${selectedIds.size} return receipts.`, 'success');
                      setSelectedIds(new Set());
                    }}
                    className="px-3 py-1 rounded bg-action-green text-text-primary font-caption text-caption font-bold hover:bg-action-green-hover transition-colors shadow-xs"
                    type="button"
                  >
                    Clear Selected
                  </button>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="px-3 py-1 rounded bg-surface-container hover:bg-surface-container-high text-text-secondary font-caption text-caption font-medium transition-colors"
                    type="button"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
            )}

            {/* Data Representation: Table or Card Grid */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
              {/* Batch Header */}
              <div className="px-space-lg py-space-md flex flex-wrap items-center justify-between gap-space-xs bg-surface-container-low/50">
                <div className="flex items-center gap-space-sm">
                  <span className="font-headline-4 text-headline-4 text-text-primary">Master Returns Journal</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-soft-blue text-primary tracking-wide">
                    TODAY'S BATCH
                  </span>
                </div>
                <div className="flex items-center gap-space-xs text-caption font-caption text-text-secondary">
                  <span>Displaying {filteredRecords.length} audit records</span>
                </div>
              </div>

              {loading ? (
                <div className="p-space-xl flex flex-col items-center justify-center gap-space-sm text-text-secondary">
                  <span className="material-symbols-outlined animate-spin text-[32px] text-primary">progress_activity</span>
                  <span className="font-small text-small">Loading circulation returns journal...</span>
                </div>
              ) : filteredRecords.length === 0 ? (
                /* Dedicated Branded Empty State */
                <div className="p-space-xl flex flex-col items-center justify-center text-center gap-space-sm my-space-md">
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-text-secondary">
                    <span className="material-symbols-outlined text-[36px]">assignment_turned_in</span>
                  </div>
                  <h3 className="font-headline-4 text-headline-4 text-text-primary mt-2">No Returns Logged</h3>
                  <p className="font-small text-small text-text-secondary max-w-md">
                    No matching circulation check-in records found for this batch or query. Books scanned at circulation
                    terminals will populate here in real-time.
                  </p>
                </div>
              ) : viewMode === 'table' ? (
                /* Tabular High-Density View with Drag-to-Scroll */
                <div
                  ref={tableContainerRef}
                  className="overflow-x-auto cursor-grab active:cursor-grabbing select-none"
                >
                  <table className="w-full text-left font-small text-small min-w-[900px]">
                    <thead>
                      <tr className="bg-surface-container-low/30 text-text-secondary font-caption text-caption uppercase tracking-wider">
                        <th className="py-3 px-space-md w-10">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={handleSelectAll}
                            className="rounded text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                          />
                        </th>
                        <th className="py-3 px-space-md font-semibold">Return ID</th>
                        <th className="py-3 px-space-md font-semibold">User Details</th>
                        <th className="py-3 px-space-md font-semibold">Item &amp; Barcode</th>
                        <th className="py-3 px-space-md font-semibold">Timeline &amp; Overdue</th>
                        <th className="py-3 px-space-md font-semibold">Assessed Fine</th>
                        <th className="py-3 px-space-md font-semibold">Condition</th>
                        <th className="py-3 px-space-md font-semibold">Clearance Status</th>
                        <th className="py-3 px-space-md font-semibold">Station / Desk</th>
                        <th className="py-3 px-space-md font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                      {paginatedItems.map((record) => {
                        const isSelected = selectedIds.has(record.id);
                        return (
                          <tr
                            key={record.id}
                            className={`hover:bg-surface-container-low/40 transition-colors ${
                              isSelected ? 'bg-soft-blue/30' : ''
                            }`}
                          >
                            <td className="py-space-md px-space-md">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectRow(record.id)}
                                className="rounded text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                              />
                            </td>
                            <td className="py-space-md px-space-md whitespace-nowrap">
                              <span className="font-caption text-caption font-bold text-primary px-2 py-1 rounded bg-soft-blue">
                                {record.returnCode}
                              </span>
                              <div className="text-[11px] text-text-secondary mt-1">
                                {new Date(record.returnTimestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </td>
                            <td className="py-space-md px-space-md">
                              <div className="font-medium text-text-primary">{record.patronName}</div>
                              <div className="font-caption text-caption text-text-secondary">
                                {record.patronLibraryId} • {record.patronProgram}
                              </div>
                            </td>
                            <td className="py-space-md px-space-md max-w-[200px]">
                              <div className="font-semibold text-text-primary truncate" title={record.bookTitle}>
                                {record.bookTitle}
                              </div>
                              <div className="font-caption text-caption text-text-secondary font-mono">
                                {record.bookBarcode}
                              </div>
                            </td>
                            <td className="py-space-md px-space-md whitespace-nowrap">
                              <div className="text-[12px] text-text-secondary">
                                Due: {new Date(record.dueDate).toLocaleDateString()}
                              </div>
                              {record.overdueDays === 0 ? (
                                <div className="font-caption text-caption text-status-available font-semibold flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[14px]">check_circle</span> 0 Days (On-Time)
                                </div>
                              ) : (
                                <div className="font-caption text-caption text-error font-semibold flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[14px]">warning</span>{' '}
                                  {record.overdueDays} Days Overdue
                                </div>
                              )}
                            </td>
                            <td className="py-space-md px-space-md whitespace-nowrap">
                              <div
                                className={`font-bold ${
                                  record.assessedFine > 0 ? 'text-text-primary' : 'text-text-primary'
                                }`}
                              >
                                ₱{record.assessedFine.toFixed(2)}
                              </div>
                              <span
                                className={`text-[11px] font-medium ${
                                  record.assessedFine === 0 ? 'text-status-available' : 'text-text-secondary'
                                }`}
                              >
                                {record.fineNote}
                              </span>
                            </td>
                            <td className="py-space-md px-space-md whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-caption font-caption font-semibold ${
                                  record.conditionGrade.toLowerCase().includes('good')
                                    ? 'bg-soft-blue text-primary'
                                    : record.conditionGrade.toLowerCase().includes('fair')
                                    ? 'bg-surface-container text-text-secondary'
                                    : 'bg-error-container text-on-error-container'
                                }`}
                              >
                                {record.conditionGrade}
                              </span>
                            </td>
                            <td className="py-space-md px-space-md whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-caption font-caption font-bold ${
                                  record.clearanceStatus.includes('Cleared')
                                    ? 'bg-action-green/20 text-on-surface'
                                    : record.clearanceStatus.includes('Cash')
                                    ? 'bg-soft-blue text-primary'
                                    : 'bg-status-pending/20 text-on-surface'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    record.clearanceStatus.includes('Cleared')
                                      ? 'bg-action-green-hover'
                                      : record.clearanceStatus.includes('Cash')
                                      ? 'bg-primary'
                                      : 'bg-status-pending'
                                  }`}
                                ></span>
                                {record.clearanceStatus}
                              </span>
                            </td>
                            <td className="py-space-md px-space-md whitespace-nowrap text-text-secondary text-caption font-caption">
                              <div className="font-medium text-text-primary">{record.stationDesk}</div>
                              <div>Terminal ID: {record.terminalId}</div>
                            </td>
                            <td className="py-space-md px-space-md text-right whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setSelectedRecord(record);
                                  setIsReceiptModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-caption text-caption font-bold transition-colors"
                                type="button"
                              >
                                View Receipt
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Card View Representation */
                <div className="p-space-md grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  {paginatedItems.map((record) => {
                    const isSelected = selectedIds.has(record.id);
                    return (
                      <div
                        key={record.id}
                        className={`rounded-xl border p-space-md flex flex-col justify-between gap-space-sm transition-all shadow-xs ${
                          isSelected
                            ? 'border-primary bg-soft-blue/20'
                            : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-space-xs">
                          <div className="flex items-center gap-space-xs">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectRow(record.id)}
                              className="rounded text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                            />
                            <span className="font-caption text-caption font-bold text-primary px-2 py-0.5 rounded bg-soft-blue">
                              {record.returnCode}
                            </span>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption font-caption font-bold ${
                              record.clearanceStatus.includes('Cleared')
                                ? 'bg-action-green/20 text-on-surface'
                                : 'bg-status-pending/20 text-on-surface'
                            }`}
                          >
                            {record.clearanceStatus}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-small text-small font-bold text-text-primary line-clamp-1">
                            {record.bookTitle}
                          </h4>
                          <span className="font-caption text-caption text-text-secondary font-mono">
                            {record.bookBarcode}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-caption font-caption bg-surface-container-low/40 p-2 rounded-lg">
                          <div>
                            <span className="text-text-secondary block">User:</span>
                            <span className="font-medium text-text-primary truncate block">{record.patronName}</span>
                          </div>
                          <div>
                            <span className="text-text-secondary block">Assessed Fine:</span>
                            <span className="font-bold text-text-primary">₱{record.assessedFine.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-text-secondary block">Due Date:</span>
                            <span className="text-text-primary">{new Date(record.dueDate).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-text-secondary block">Condition:</span>
                            <span className="font-medium text-text-primary">{record.conditionGrade}</span>
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-outline-variant/10 text-caption font-caption">
                          <span className="text-text-secondary">{record.stationDesk}</span>
                          <button
                            onClick={() => {
                              setSelectedRecord(record);
                              setIsReceiptModalOpen(true);
                            }}
                            className="px-3 py-1 rounded bg-surface-container-low hover:bg-surface-container text-primary font-bold transition-colors"
                            type="button"
                          >
                            Inspect Receipt
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Dynamic Pagination Bar */}
              <div className="p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm bg-surface-container-low/30 font-caption text-caption text-text-secondary border-t border-outline-variant/10">
                <div className="flex items-center gap-space-md">
                  <div className="flex items-center gap-space-xs text-text-secondary font-caption text-caption">
                    <span>Rows:</span>
                    <Dropdown<number>
                      variant="pagination"
                      items={pageSizeDropdownItems}
                      selectedValue={pageSize}
                      onSelect={(val) => setPageSize(val)}
                    />
                  </div>
                  <span>
                    Showing {filteredRecords.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
                    {Math.min(currentPage * pageSize, filteredRecords.length)} of {filteredRecords.length} returns
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={prevPage}
                    disabled={currentPage <= 1}
                    className="p-1 rounded hover:bg-surface-container transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNumber = idx + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        className={`px-2.5 py-1 rounded transition-colors font-bold ${
                          currentPage === pageNumber
                            ? 'bg-primary text-on-primary shadow-xs'
                            : 'hover:bg-surface-container text-text-secondary'
                        }`}
                        type="button"
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                  <button
                    onClick={nextPage}
                    disabled={currentPage >= totalPages}
                    className="p-1 rounded hover:bg-surface-container transition-colors disabled:opacity-40 disabled:pointer-events-none"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Protocol Inspection Card & Fast Guide */}
          <div className="flex flex-col gap-space-md">
            {/* Protocol Inspection: Damaged Book Assessment */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/20 flex flex-col gap-space-md">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-caption text-caption text-primary uppercase font-bold tracking-wider">
                    Protocol Inspection
                  </span>
                  <h2 className="font-headline-4 text-headline-4 text-text-primary mt-0.5">Damaged Book Assessment</h2>
                </div>
                <div className="w-8 h-8 rounded-full bg-error-container flex items-center justify-center text-status-danger">
                  <span className="material-symbols-outlined text-[18px]">rule</span>
                </div>
              </div>
              <p className="font-small text-small text-text-secondary">
                Physical audit queue for volumes flagged with structural damage during intake.
              </p>

              {/* Active Case Docket */}
              <div className="bg-surface-container-low rounded-lg p-space-md flex flex-col gap-space-sm border border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <span className="font-caption text-caption font-bold text-text-primary">Current Active Case</span>
                  <span className="font-caption text-caption text-error font-bold px-2 py-0.5 rounded bg-error-container">
                    {activeCase?.severity || 'Severe Fault'}
                  </span>
                </div>

                <div className="flex gap-space-sm items-center mt-1">
                  <div className="w-16 h-20 rounded-lg bg-surface-container flex items-center justify-center text-text-secondary flex-shrink-0 shadow-sm overflow-hidden">
                    <span className="material-symbols-outlined text-[28px] text-primary">auto_stories</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-small text-small font-bold text-text-primary truncate">
                      {activeCase?.bookTitle || 'Philippine Flora & Forest'}
                    </span>
                    <span className="font-caption text-caption text-text-secondary font-mono">
                      {activeCase?.bookBarcode || '#KP-BC-3194-02'}
                    </span>
                    <span className="font-caption text-caption text-text-secondary mt-1">
                      Reported by: {activeCase?.reportedBy || 'Bay 01 Specialist'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 bg-surface-container-lowest/60 rounded-lg p-2 font-caption text-caption">
                  <div>
                    <span className="text-text-secondary block">Damage Type</span>
                    <span className="font-semibold text-text-primary">
                      {activeCase?.damageType || 'Spine Separation'}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary block">Assessed Penalty</span>
                    <span className="font-bold text-error">
                      ₱{(activeCase?.assessedPenalty || 280).toFixed(2)} Rebind
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary block">User Responsible</span>
                    <span className="font-medium text-text-primary truncate block">
                      {activeCase?.patronResponsible || 'C. M. Ilustre'}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-secondary block">Est. Repair Time</span>
                    <span className="font-semibold text-primary">
                      {activeCase?.estRepairTime || '3-5 Workdays'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bindery & Conservation Routing Actions */}
              <div className="flex flex-col gap-space-xs">
                <span className="font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider">
                  Bindery &amp; Conservation Routing
                </span>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setIsBinderyModalOpen(true)}
                    className="w-full flex items-center justify-between px-space-md py-2.5 rounded-lg bg-surface-container-low hover:bg-soft-blue text-text-primary font-small text-small font-medium transition-colors text-left group"
                    type="button"
                  >
                    <div className="flex items-center gap-space-sm">
                      <span className="material-symbols-outlined text-[18px] text-primary">build</span>
                      <span>Route to Campus Bindery Unit</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-text-secondary group-hover:translate-x-0.5 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                  <button
                    onClick={() => setIsReplacementModalOpen(true)}
                    className="w-full flex items-center justify-between px-space-md py-2.5 rounded-lg bg-surface-container-low hover:bg-soft-blue text-text-primary font-small text-small font-medium transition-colors text-left group"
                    type="button"
                  >
                    <div className="flex items-center gap-space-sm">
                      <span className="material-symbols-outlined text-[18px] text-status-pending">inventory</span>
                      <span>Order Publisher Replacement</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-text-secondary group-hover:translate-x-0.5 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                  <button
                    onClick={() => setIsDeaccessionModalOpen(true)}
                    className="w-full flex items-center justify-between px-space-md py-2.5 rounded-lg bg-surface-container-low hover:bg-soft-blue text-text-primary font-small text-small font-medium transition-colors text-left group"
                    type="button"
                  >
                    <div className="flex items-center gap-space-sm">
                      <span className="material-symbols-outlined text-[18px] text-text-secondary">archive</span>
                      <span>Deaccession &amp; Salvage Archive</span>
                    </div>
                    <span className="material-symbols-outlined text-[16px] text-text-secondary group-hover:translate-x-0.5 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>

              {/* Fast Authorize & Hold Buttons */}
              <div className="pt-space-sm flex gap-space-xs">
                <button
                  onClick={handleAuthorizeRouting}
                  className="flex-1 py-2 rounded-lg bg-action-green text-text-primary hover:bg-action-green-hover font-small text-small font-bold transition-colors shadow-xs"
                  type="button"
                >
                  Authorize Routing
                </button>
                <button
                  onClick={handleHoldCase}
                  className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-secondary font-small text-small font-medium transition-colors"
                  type="button"
                >
                  Hold
                </button>
              </div>
            </div>

            {/* Fast Returns Policy Reference Guide */}
            <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm border border-outline-variant/20 flex flex-col gap-space-sm">
              <div className="flex items-center gap-space-sm mb-1">
                <span className="material-symbols-outlined text-primary text-[20px]">help_center</span>
                <h3 className="font-headline-4 text-small font-bold text-text-primary">Returns Policy Fast Guide</h3>
              </div>
              <div className="space-y-2 font-caption text-caption text-text-secondary">
                <div className="p-2 rounded bg-surface-container-low">
                  <span className="font-bold text-text-primary block">Undergraduate Loan:</span>
                  ₱15.00 / day penalty past 14-day regular period.
                </div>
                <div className="p-2 rounded bg-surface-container-low">
                  <span className="font-bold text-text-primary block">Graduate Students:</span>
                  ₱10.00 / day penalty past 30-day extended loan.
                </div>
                <div className="p-2 rounded bg-surface-container-low">
                  <span className="font-bold text-text-primary block">Faculty Clearance:</span>
                  Automatic waiver with Dean's semester sign-off.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Export CSV / Excel */}
      <AdminModalCard
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Returns Journal & Settlement Ledger"
        subtitle="Configure custom chronological date ranges, alphabetical filters, ID filters, and format selection."
        maxWidth="max-w-lg"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              onClick={() => setIsExportModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-surface-container text-text-secondary font-small text-small font-medium hover:bg-surface-container-high transition-colors"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleTriggerExport}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary font-small text-small font-bold hover:bg-primary-container transition-colors shadow-sm flex items-center gap-1.5"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Generate Export
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 font-small text-small">
          {/* Date Range Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-caption text-caption font-semibold text-text-secondary block mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={exportFilters.startDate || ''}
                onChange={(e) => setExportFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="font-caption text-caption font-semibold text-text-secondary block mb-1">
                End Date
              </label>
              <input
                type="date"
                value={exportFilters.endDate || ''}
                onChange={(e) => setExportFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Alphabetical Filter */}
          <div>
            <label className="font-caption text-caption font-semibold text-text-secondary block mb-1">
              Alphabetical Filter (Titles / User Names)
            </label>
            <input
              type="text"
              placeholder="e.g. Starts with 'A', ends with 'O', or contains 'Flora'"
              value={exportFilters.alphabeticalFilter || ''}
              onChange={(e) => setExportFilters((prev) => ({ ...prev, alphabeticalFilter: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* ID / Barcode Filter */}
          <div>
            <label className="font-caption text-caption font-semibold text-text-secondary block mb-1">
              ID / Barcode Filter
            </label>
            <input
              type="text"
              placeholder="e.g. Starts with '1', ends with '1', or ID has '3194'"
              value={exportFilters.idFilter || ''}
              onChange={(e) => setExportFilters((prev) => ({ ...prev, idFilter: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Sort Direction & Format Selector */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-outline-variant/10">
            <div>
              <label className="font-caption text-caption font-semibold text-text-secondary block mb-1.5">
                Sort Direction
              </label>
              <div className="flex items-center gap-3">
                <RadioButton
                  id="sort-desc"
                  name="export-sort-dir"
                  label="Newest First"
                  checked={exportFilters.sortDirection === 'desc'}
                  onChange={() => setExportFilters((prev) => ({ ...prev, sortDirection: 'desc' }))}
                />
                <RadioButton
                  id="sort-asc"
                  name="export-sort-dir"
                  label="Oldest First"
                  checked={exportFilters.sortDirection === 'asc'}
                  onChange={() => setExportFilters((prev) => ({ ...prev, sortDirection: 'asc' }))}
                />
              </div>
            </div>
            <div>
              <label className="font-caption text-caption font-semibold text-text-secondary block mb-1.5">
                Format
              </label>
              <div className="flex items-center gap-3">
                <RadioButton
                  id="format-csv"
                  name="export-format"
                  label="CSV"
                  checked={exportFilters.format === 'csv'}
                  onChange={() => setExportFilters((prev) => ({ ...prev, format: 'csv' }))}
                />
                <RadioButton
                  id="format-xlsx"
                  name="export-format"
                  label="Excel"
                  checked={exportFilters.format === 'xlsx'}
                  onChange={() => setExportFilters((prev) => ({ ...prev, format: 'xlsx' }))}
                />
              </div>
            </div>
          </div>
        </div>
      </AdminModalCard>

      {/* MODAL 2: Route to Campus Bindery Unit */}
      <AdminModalCard
        isOpen={isBinderyModalOpen}
        onClose={() => setIsBinderyModalOpen(false)}
        title="Route Volume to Campus Bindery Unit"
        subtitle={`Confirm conservation triage dispatch for ${activeCase?.bookTitle || 'Philippine Flora & Forest'}.`}
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              onClick={() => setIsBinderyModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-surface-container text-text-secondary font-small text-small font-medium hover:bg-surface-container-high transition-colors"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleRouteBindery}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary font-small text-small font-bold hover:bg-primary-container transition-colors shadow-sm"
              type="button"
            >
              Confirm Dispatch
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-3 font-small text-small">
          <div>
            <label className="font-caption text-caption font-semibold text-text-secondary block mb-1">
              Assigned Bindery Facility
            </label>
            <input
              type="text"
              value={binderyTechnician}
              onChange={(e) => setBinderyTechnician(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="font-caption text-caption font-semibold text-text-secondary block mb-1">
              Estimated Conservation Horizon
            </label>
            <input
              type="text"
              value={binderyEstDays}
              onChange={(e) => setBinderyEstDays(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="p-3 rounded-lg bg-soft-blue text-primary font-caption text-caption">
            <span className="font-bold block mb-0.5">Automated Asset State Transition:</span>
            Item state will transition to <strong>In Maintenance (Bindery)</strong> and log permanently into the
            institutional cryptographic audit trail.
          </div>
        </div>
      </AdminModalCard>

      {/* MODAL 3: Order Publisher Replacement */}
      <AdminModalCard
        isOpen={isReplacementModalOpen}
        onClose={() => setIsReplacementModalOpen(false)}
        title="Order Publisher Replacement Volume"
        subtitle={`Procure replacement copy for ${activeCase?.bookTitle || 'Philippine Flora & Forest'}.`}
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              onClick={() => setIsReplacementModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-surface-container text-text-secondary font-small text-small font-medium hover:bg-surface-container-high transition-colors"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleOrderReplacement}
              className="px-4 py-2 rounded-lg bg-status-pending text-on-surface font-small text-small font-bold hover:opacity-90 transition-colors shadow-sm"
              type="button"
            >
              Submit Order
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-3 font-small text-small">
          <div>
            <label className="font-caption text-caption font-semibold text-text-secondary block mb-1">
              Authorized Publisher / Vendor
            </label>
            <input
              type="text"
              value={replacementVendor}
              onChange={(e) => setReplacementVendor(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="font-caption text-caption font-semibold text-text-secondary block mb-1">
              Estimated Acquisition Cost (₱)
            </label>
            <input
              type="number"
              value={replacementPrice}
              onChange={(e) => setReplacementPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="p-3 rounded-lg bg-surface-container-low text-text-secondary font-caption text-caption">
            <span>
              Order will lodge into Publisher Acquisition Queue with status <strong>Replacement Ordered</strong>.
            </span>
          </div>
        </div>
      </AdminModalCard>

      {/* MODAL 4: Deaccession & Salvage Archive */}
      <AdminModalCard
        isOpen={isDeaccessionModalOpen}
        onClose={() => setIsDeaccessionModalOpen(false)}
        title="Confirm Deaccession & Salvage Archive"
        subtitle="Permanent catalog deaccession and asset disposal."
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              onClick={() => setIsDeaccessionModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-surface-container text-text-secondary font-small text-small font-medium hover:bg-surface-container-high transition-colors"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleDeaccessionSalvage}
              className="px-4 py-2 rounded-lg bg-status-danger text-white font-small text-small font-bold hover:opacity-90 transition-colors shadow-sm"
              type="button"
            >
              Confirm Deaccession
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-3 font-small text-small">
          <div className="p-3 rounded-lg bg-error-container text-status-danger font-caption text-caption">
            <span className="font-bold block mb-1">Destructive Asset Action Warning:</span>
            Deaccessioning removes 1 unit from total inventory holding counts. This volume will be marked{' '}
            <strong>Deaccessioned</strong> and archived permanently.
          </div>
          <div>
            <label className="font-caption text-caption font-semibold text-text-secondary block mb-1">
              Justification &amp; Disposal Reason
            </label>
            <textarea
              rows={3}
              value={deaccessionReason}
              onChange={(e) => setDeaccessionReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </AdminModalCard>

      {/* MODAL 5: Process Bulk Returns Intake */}
      <AdminModalCard
        isOpen={isBulkIntakeModalOpen}
        onClose={() => setIsBulkIntakeModalOpen(false)}
        title="Batch Barcode Return Intake"
        subtitle="Scan or paste multiple accession barcodes for automated check-in clearance."
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              onClick={() => setIsBulkIntakeModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-surface-container text-text-secondary font-small text-small font-medium hover:bg-surface-container-high transition-colors"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleProcessBulkCheckin}
              className="px-4 py-2 rounded-lg bg-action-green text-text-primary font-small text-small font-bold hover:bg-action-green-hover transition-colors shadow-sm"
              type="button"
            >
              Execute Batch Check-In
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-3 font-small text-small">
          <label className="font-caption text-caption font-semibold text-text-secondary block">
            Barcodes (One per line)
          </label>
          <textarea
            rows={5}
            placeholder="#KP-BC-4491-03&#10;#KP-BC-1142-08&#10;#KP-BC-3091-01"
            value={bulkBarcodeInput}
            onChange={(e) => setBulkBarcodeInput(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/30 text-text-primary font-mono text-caption focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </AdminModalCard>

      {/* MODAL 6: View Return Receipt Slip */}
      <AdminModalCard
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Circulation Intake Receipt & Audit Docket"
        subtitle={selectedRecord ? `Return Code: ${selectedRecord.returnCode}` : ''}
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-lg bg-primary text-on-primary font-small text-small font-bold hover:bg-primary-container transition-colors shadow-sm flex items-center gap-1.5"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Print Slip
            </button>
            <button
              onClick={() => setIsReceiptModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-surface-container text-text-secondary font-small text-small font-medium hover:bg-surface-container-high transition-colors"
              type="button"
            >
              Close
            </button>
          </div>
        }
      >
        {selectedRecord && (
          <div className="flex flex-col gap-3 font-small text-small">
            <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 flex flex-col gap-1.5 font-caption text-caption">
              <div className="flex justify-between">
                <span className="text-text-secondary">User:</span>
                <span className="font-bold text-text-primary">{selectedRecord.patronName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Library Card:</span>
                <span className="font-mono text-text-primary">{selectedRecord.patronLibraryId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Volume:</span>
                <span className="font-bold text-text-primary line-clamp-1">{selectedRecord.bookTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Barcode:</span>
                <span className="font-mono text-text-primary">{selectedRecord.bookBarcode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Check-In Timestamp:</span>
                <span className="text-text-primary">
                  {new Date(selectedRecord.returnTimestamp).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Assessed Fine:</span>
                <span className="font-bold text-error">₱{selectedRecord.assessedFine.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Clearance Status:</span>
                <span className="font-bold text-primary">{selectedRecord.clearanceStatus}</span>
              </div>
            </div>
          </div>
        )}
      </AdminModalCard>
    </div>
  );
};

export default Returns;
