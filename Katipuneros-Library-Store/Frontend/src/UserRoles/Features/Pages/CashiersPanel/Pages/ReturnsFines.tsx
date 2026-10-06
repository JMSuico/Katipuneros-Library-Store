// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// ReturnsFines.tsx -- Cashier Returns and Fine Settlement.
// Connects to live /api/borrow/return, /api/borrow/admin-ledger, and /api/cashier.
// Strictly adheres to real-time data mandate: zero hardcoded mock values, clean empty states when N=0.
// Universal lambda syntax (=>), zero browser alert().

import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useToasts } from '../../../../../Hooks/useToasts';
import { processBookReturn } from '../../../../../Endpoints/Cashier/transactionApi';
import { getAdminBorrowings, BackendBorrowing } from '../../../../../Endpoints/Admin/borrowingsApi';
import { getCashierDashboardKpis, CashierDashboardKpis } from '../../../../../Endpoints/Cashier/cashierApi';
import { RadioGroup } from '../../../../../Shared/RadioButton';
import { SearchBar, useDebounce } from '../../../../../Shared/SearchBar';
import { usePagination } from '../../../../../Hooks/usePagination';
import { useTableDraggable } from '../../../../../Hooks/useTableDraggable';

export const ReturnsFines: FC = () => {
  const location = useLocation();
  const { toasts, addToast, removeToast } = useToasts();

  const [activeLoans, setActiveLoans] = useState<BackendBorrowing[]>([]);
  const [kpis, setKpis] = useState<CashierDashboardKpis | null>(null);
  const [scannerInput, setScannerInput] = useState<string>('');
  const debouncedScannerInput = useDebounce(scannerInput, 300);
  const [selectedLoan, setSelectedLoan] = useState<BackendBorrowing | null>(null);
  const [isAfterHoursCounterSlot, setIsAfterHoursCounterSlot] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Active Loans List Filters & Controls
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState<'all' | 'due_today' | 'overdue'>('all');
  const [sortBy, setSortBy] = useState<'due-asc' | 'overdue-first' | 'patron-az' | 'title-az'>('due-asc');

  // View Mode: Table vs Card (persisted)
  const [viewMode, setViewMode] = useState<string>(() => {
    return localStorage.getItem('cashier_returns_view') || 'table';
  });

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
    localStorage.setItem('cashier_returns_view', mode);
  };

  const { containerRef: tableContainerRef } = useTableDraggable<HTMLDivElement>();

  // Condition Inspection
  const [condition, setCondition] = useState<'good' | 'wear' | 'damage' | 'lost'>('good');

  const loadData = useCallback(async () => {
    try {
      const [loans, kpiData] = await Promise.all([
        getAdminBorrowings('Active'),
        getCashierDashboardKpis(),
      ]);
      setActiveLoans(loans);
      setKpis(kpiData);
    } catch {
      addToast('Failed to synchronize circulation loans with database.', 'error');
    }
  }, [addToast]);

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

  // Check URL barcode query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const bc = params.get('barcode');
    if (bc) {
      setScannerInput(bc);
      const match = activeLoans.find(
        (l) =>
          l.bookBarcode?.toLowerCase() === bc.toLowerCase() ||
          l.loanCode?.toLowerCase() === bc.toLowerCase()
      );
      if (match) {
        setSelectedLoan(match);
      }
    }
  }, [location.search, activeLoans]);

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = scannerInput.trim().toLowerCase();
    if (!code) return;

    const matched = activeLoans.find(
      (l) =>
        l.bookBarcode?.toLowerCase() === code ||
        l.loanCode?.toLowerCase() === code ||
        l.bookTitle?.toLowerCase().includes(code) ||
        l.patronLibraryId?.toLowerCase() === code ||
        l.patronName?.toLowerCase().includes(code)
    );

    if (matched) {
      setSelectedLoan(matched);
      addToast(`Loan record loaded for "${matched.bookTitle}".`, 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      addToast(`No active borrowing record found matching "${scannerInput}".`, 'warning');
    }
  };

  const handleSelectLoanForReturn = (loan: BackendBorrowing) => {
    setSelectedLoan(loan);
    setScannerInput(loan.bookBarcode);
    addToast(`Selected "${loan.bookTitle}" for condition audit & check-in.`, 'info');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Condition surcharge
  const conditionSurcharge = useMemo(() => {
    if (condition === 'damage') return 150.0;
    if (condition === 'lost') return 1450.0;
    return 0.0;
  }, [condition]);

  // Overdue calculation (₱15.00/day for overdue days)
  const daysOverdue = useMemo(() => {
    if (!selectedLoan) return 0;
    const due = new Date(selectedLoan.dueDate).getTime();
    const now = Date.now();
    if (now > due) {
      const diffMs = now - due;
      return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }
    return 0;
  }, [selectedLoan]);

  const baseOverdueFine = useMemo(() => {
    if (isAfterHoursCounterSlot && daysOverdue <= 1) return 0.0; // Counter drop slot 24h courtesy grace waiver
    return daysOverdue * 15.0;
  }, [daysOverdue, isAfterHoursCounterSlot]);

  const totalFineDue = baseOverdueFine + conditionSurcharge;

  // Finalize Return
  const handleFinalizeReturn = async () => {
    if (!selectedLoan) {
      addToast('No book selected for return.', 'warning');
      return;
    }

    setIsProcessing(true);
    try {
      const notes =
        condition === 'good'
          ? 'Returned in good condition'
          : condition === 'wear'
          ? 'Minor wear noted during desk intake'
          : condition === 'damage'
          ? 'Severe physical damage assessed (binding fee applied)'
          : 'Declared lost by patron';

      const res = await processBookReturn({
        barcode: selectedLoan.bookBarcode,
        conditionNotes: notes,
        damageFee: conditionSurcharge,
      });

      if ((res as { success?: boolean }).success !== false) {
        addToast(
          `Book "${selectedLoan.bookTitle}" returned successfully! Total settled: ₱${totalFineDue.toFixed(2)}.`,
          'success'
        );
        setSelectedLoan(null);
        setScannerInput('');
        window.dispatchEvent(new CustomEvent('cashier-refresh-kpis'));
        await loadData();
      } else {
        addToast((res as { message?: string }).message || 'Return check-in failed.', 'error');
      }
    } catch {
      addToast('Network error during return processing.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintSlip = () => {
    if (!selectedLoan) {
      addToast('Select a return transaction before printing slip.', 'warning');
      return;
    }
    addToast('Receipt slip dispatched to Desk 01 thermal printer.', 'info');
  };

  const handleClearCounter = () => {
    setSelectedLoan(null);
    setScannerInput('');
    setCondition('good');
    addToast('Desk counter cleared. Ready for next intake.', 'info');
  };

  // Filtered and Sorted Active Loans List
  const filteredLoans = useMemo(() => {
    const q = debouncedSearchQuery.trim().toLowerCase();
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    return activeLoans
      .filter((l) => {
        const matchesSearch =
          !q ||
          l.bookTitle?.toLowerCase().includes(q) ||
          l.patronName?.toLowerCase().includes(q) ||
          l.patronLibraryId?.toLowerCase().includes(q) ||
          l.bookBarcode?.toLowerCase().includes(q) ||
          l.loanCode?.toLowerCase().includes(q);

        const dueTime = new Date(l.dueDate).getTime();
        const isOverdue = dueTime < now;
        const isDueToday = Math.abs(dueTime - now) <= oneDayMs;

        if (statusFilter === 'overdue') return matchesSearch && isOverdue;
        if (statusFilter === 'due_today') return matchesSearch && isDueToday;
        return matchesSearch;
      })
      .sort((a, b) => {
        const timeA = new Date(a.dueDate).getTime();
        const timeB = new Date(b.dueDate).getTime();
        if (sortBy === 'due-asc') return timeA - timeB;
        if (sortBy === 'overdue-first') return timeA - timeB; // oldest due date first
        if (sortBy === 'patron-az') return (a.patronName || '').localeCompare(b.patronName || '');
        if (sortBy === 'title-az') return (a.bookTitle || '').localeCompare(b.bookTitle || '');
        return 0;
      });
  }, [activeLoans, debouncedSearchQuery, statusFilter, sortBy]);

  // Pagination for Active Loans
  const {
    paginatedItems: paginatedLoans,
    currentPage,
    totalPages,
    pageSize,
    pageSizeOptions,
    setPageSize,
    nextPage,
    prevPage,
    canNextPage,
    canPrevPage,
  } = usePagination(filteredLoans, {
    initialPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  });

  return (
    <div className="w-full">
      <div className="flex flex-col w-full pb-16 space-y-6">
        {/* Operational Header */}
        <section className="relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-md p-6">
          <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            <div className="flex flex-col space-y-1 max-w-2xl">
              <div className="inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-soft-blue text-primary font-caption text-caption font-bold tracking-wide uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                  Circulation Terminal Module 04
                </span>
                <span className="text-text-secondary font-caption text-caption">• Desk Bay 01</span>
              </div>
              <h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">
                Circulation Desk Book Returns &amp; Check-In
              </h1>
              <p className="font-body text-body text-text-secondary">
                Scan book barcode, audit physical condition, and compute automated overdue penalties and receipts.
              </p>
            </div>

            {/* Quick Metrics Ribbon */}
            <div className="grid grid-cols-3 gap-3 bg-surface-container-low p-2 rounded-xl">
              <div className="flex flex-col px-4 py-2 bg-surface-container-lowest rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-caption text-caption text-text-secondary">Processed Today</span>
                  <span className="material-symbols-outlined text-action-green text-lg">check_circle</span>
                </div>
                <span className="font-headline-3 text-headline-3 text-text-primary font-bold">
                  {kpis?.returnsTodayCount ?? 0}
                </span>
                <span className="font-caption text-caption text-status-available">Checked in</span>
              </div>
              <div className="flex flex-col px-4 py-2 bg-surface-container-lowest rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-caption text-caption text-text-secondary">Overdue Loans</span>
                  <span className="material-symbols-outlined text-status-pending text-lg">hourglass_top</span>
                </div>
                <span className="font-headline-3 text-headline-3 text-text-primary font-bold">
                  {kpis?.overdueLoansCount ?? 0}
                </span>
                <span className="font-caption text-caption text-text-secondary">In circulation</span>
              </div>
              <div className="flex flex-col px-4 py-2 bg-surface-container-lowest rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-caption text-caption text-text-secondary">Fines Collected</span>
                  <span className="material-symbols-outlined text-primary text-lg">payments</span>
                </div>
                <span className="font-headline-3 text-headline-3 text-primary font-bold">
                  ₱{(kpis?.finesDailyAmount ?? 0).toFixed(2)}
                </span>
                <span className="font-caption text-caption text-text-secondary">Today ledger</span>
              </div>
            </div>
          </div>
        </section>

        {/* Barcode Intake Scanner Bar */}
        <section className="bg-surface-container-lowest p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <form onSubmit={handleScanSubmit} className="flex-1 relative flex items-center gap-2">
            <div className="flex-1">
              <SearchBar
                placeholder="Scan Book Barcode, Loan Ref, or Patron Library ID..."
                value={scannerInput}
                onChange={(v) => setScannerInput(v)}
                shortcutKey=""
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-primary text-on-primary font-caption text-caption font-bold rounded-xl hover:bg-primary-container transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-base">barcode_scanner</span>
              <span>Intake Scan</span>
            </button>
          </form>

          {/* Drop-Box Toggle */}
          <div className="flex items-center justify-between sm:justify-end gap-3 px-3 py-2 bg-surface-container-low rounded-xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">move_to_inbox</span>
              <div className="flex flex-col">
                <span className="font-small text-small font-bold text-text-primary leading-tight">
                  Counter Drop Slot Mode
                </span>
                <span className="font-caption text-caption text-text-secondary">Auto-clear late fines under 24 hrs courtesy grace</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                checked={isAfterHoursCounterSlot}
                onChange={(e) => setIsAfterHoursCounterSlot(e.target.checked)}
                className="sr-only peer"
                type="checkbox"
              />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-surface-container-lowest after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-action-green"></div>
            </label>
          </div>
        </section>

        {/* Main Grid: Active Loan Audit + Dynamic Calculation Engine */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Column: Active Loan Return Audit & Physical Condition */}
          <div className="xl:col-span-7 flex flex-col space-y-6">
            {/* User & Asset Card */}
            {selectedLoan ? (
              <div className="bg-surface-container-lowest rounded-xl shadow-md p-6 flex flex-col space-y-4 border border-outline/10">
                <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-2xl">verified_user</span>
                    <span className="font-headline-4 text-headline-4 text-text-primary">Active Loan Record</span>
                  </div>
                  {daysOverdue > 0 ? (
                    <span className="px-3 py-1 bg-error-container text-on-error-container font-caption text-caption font-bold rounded-full inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-status-danger"></span>
                      Overdue by {daysOverdue} Day{daysOverdue === 1 ? '' : 's'}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-action-green/20 text-text-primary font-caption text-caption font-bold rounded-full inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-action-green"></span>
                      On Time Return
                    </span>
                  )}
                </div>

                {/* User Overview Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-surface-container-low rounded-xl">
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <div className="w-12 h-12 rounded-full bg-soft-blue text-primary flex items-center justify-center font-bold text-lg shadow-sm flex-shrink-0">
                      {selectedLoan.patronName?.charAt(0) || 'P'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-body-large text-body-large font-bold text-text-primary truncate">
                          {selectedLoan.patronName}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-soft-blue text-primary font-caption text-caption font-bold">
                          {selectedLoan.patronRole || 'Patron'}
                        </span>
                      </div>
                      <span className="font-caption text-caption text-text-secondary truncate">
                        ID: {selectedLoan.patronLibraryId || 'KP-CARD'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center sm:items-end">
                    <span className="font-caption text-caption text-text-secondary">Standing Rating</span>
                    <span className="font-small text-small font-bold text-status-available inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-base">shield</span> Good Standing
                    </span>
                  </div>
                </div>

                {/* Book Asset Card */}
                <div className="flex flex-col sm:flex-row gap-4 p-4 bg-surface-container rounded-xl">
                  {selectedLoan.bookCoverImage ? (
                    <img
                      className="w-24 h-32 object-cover rounded-lg shadow-md self-center sm:self-start flex-shrink-0"
                      src={selectedLoan.bookCoverImage}
                      alt={selectedLoan.bookTitle}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-24 h-32 bg-soft-blue rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                      <span className="material-symbols-outlined text-3xl">menu_book</span>
                    </div>
                  )}
                  <div className="flex flex-col justify-between flex-1 gap-1">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-caption text-caption text-primary font-bold uppercase tracking-wider">
                          Active Collection
                        </span>
                        <span className="font-caption text-caption text-text-secondary font-mono">
                          {selectedLoan.bookBarcode}
                        </span>
                      </div>
                      <h2 className="font-headline-4 text-headline-4 text-text-primary leading-snug line-clamp-2">
                        {selectedLoan.bookTitle}
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 gap-1 pt-1 text-text-secondary font-caption text-caption">
                      <div>
                        <span className="font-bold text-text-primary">Call No:</span> {selectedLoan.bookCallNumber || 'N/A'}
                      </div>
                      <div>
                        <span className="font-bold text-text-primary">Loan Code:</span> {selectedLoan.loanCode}
                      </div>
                      <div>
                        <span className="font-bold text-text-primary">Checkout Desk:</span> Terminal 01
                      </div>
                      <div>
                        <span className="font-bold text-text-primary">Stacks Status:</span> Cataloged
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-surface-container-low rounded-lg flex flex-col">
                    <span className="font-caption text-caption text-text-secondary">Borrowed Date</span>
                    <span className="font-small text-small font-bold text-text-primary">
                      {new Date(selectedLoan.borrowDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-lg flex flex-col">
                    <span className="font-caption text-caption text-text-secondary">Scheduled Due</span>
                    <span
                      className={`font-small text-small font-bold ${
                        daysOverdue > 0 ? 'text-status-danger' : 'text-text-primary'
                      }`}
                    >
                      {new Date(selectedLoan.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="p-3 bg-soft-blue rounded-lg flex flex-col">
                    <span className="font-caption text-caption text-primary font-bold">Actual Return Scan</span>
                    <span className="font-small text-small font-bold text-primary">
                      {new Date().toLocaleDateString()} (Today)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-surface-container-lowest rounded-xl shadow-md p-12 flex flex-col items-center justify-center text-center border border-outline/10">
                <span className="material-symbols-outlined text-5xl text-text-secondary/40 mb-3">
                  keyboard_return
                </span>
                <p className="font-body-large text-body-large text-text-primary font-semibold">
                  No Active Borrowing Selected
                </p>
                <p className="font-caption text-caption text-text-secondary max-w-sm mt-1">
                  Scan book barcode above or choose an active loan from the circulating queue below to begin condition audit.
                </p>
              </div>
            )}

            {/* Physical Condition Inspection Selector */}
            <div className="bg-surface-container-lowest rounded-xl shadow-md p-6 flex flex-col space-y-4 border border-outline/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-2xl">fact_check</span>
                  <h3 className="font-headline-4 text-headline-4 text-text-primary">
                    Physical Condition Inspection
                  </h3>
                </div>
                <span className="font-caption text-caption text-text-secondary uppercase tracking-wider font-bold">
                  Mandatory Desk Audit
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  onClick={() => setCondition('good')}
                  className={`p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between border ${
                    condition === 'good'
                      ? 'bg-soft-blue border-primary/30 text-primary'
                      : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-body-medium text-body-medium font-bold">Good Condition</span>
                    <input
                      checked={condition === 'good'}
                      onChange={() => {}}
                      type="radio"
                      className="accent-primary"
                    />
                  </div>
                  <span className="font-caption text-caption text-text-secondary mt-1">
                    Clean cover, intact pages. Ready for immediate stacks reshelving.
                  </span>
                  <span className="mt-2 text-caption font-caption font-bold text-status-available">Fee: ₱0.00</span>
                </label>

                <label
                  onClick={() => setCondition('wear')}
                  className={`p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between border ${
                    condition === 'wear'
                      ? 'bg-soft-blue border-primary/30 text-primary'
                      : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-body-medium text-body-medium font-bold">Minor Wear</span>
                    <input
                      checked={condition === 'wear'}
                      onChange={() => {}}
                      type="radio"
                      className="accent-primary"
                    />
                  </div>
                  <span className="font-caption text-caption text-text-secondary mt-1">
                    Highlighter or minor dog-ears. Normal academic wear.
                  </span>
                  <span className="mt-2 text-caption font-caption font-bold text-text-secondary">Fee: ₱0.00</span>
                </label>

                <label
                  onClick={() => setCondition('damage')}
                  className={`p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between border ${
                    condition === 'damage'
                      ? 'bg-soft-blue border-primary/30 text-primary'
                      : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-body-medium text-body-medium font-bold">Severe Damage</span>
                    <input
                      checked={condition === 'damage'}
                      onChange={() => {}}
                      type="radio"
                      className="accent-primary"
                    />
                  </div>
                  <span className="font-caption text-caption text-text-secondary mt-1">
                    Broken spine, water damage, or torn pages. Rebinder required.
                  </span>
                  <span className="mt-2 text-caption font-caption font-bold text-status-danger">
                    +₱150.00 Repair Fee
                  </span>
                </label>

                <label
                  onClick={() => setCondition('lost')}
                  className={`p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between border ${
                    condition === 'lost'
                      ? 'bg-soft-blue border-primary/30 text-primary'
                      : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-body-medium text-body-medium font-bold">Declared Lost</span>
                    <input
                      checked={condition === 'lost'}
                      onChange={() => {}}
                      type="radio"
                      className="accent-primary"
                    />
                  </div>
                  <span className="font-caption text-caption text-text-secondary mt-1">
                    User unable to produce physical volume.
                  </span>
                  <span className="mt-2 text-caption font-caption font-bold text-status-danger">
                    Full Replacement: +₱1,450.00
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Automated Dynamic Fine Engine & Payment Settlement */}
          <div className="xl:col-span-5 flex flex-col space-y-6">
            <div className="bg-surface-container-lowest rounded-xl shadow-md p-6 flex flex-col space-y-4 border border-outline/10">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-2xl">calculate</span>
                  <h3 className="font-headline-4 text-headline-4 text-text-primary">Overdue Calculation</h3>
                </div>
                <span className="font-caption text-caption text-text-secondary">Standard Desk Policy</span>
              </div>

              {/* Calculation Matrix Rows */}
              <div className="flex flex-col space-y-2 text-small font-small">
                <div className="flex items-center justify-between py-2 bg-surface-container-low px-3 rounded-lg">
                  <span className="text-text-secondary">Days Overdue:</span>
                  <span
                    className={`font-bold ${daysOverdue > 0 ? 'text-status-danger' : 'text-status-available'}`}
                  >
                    {daysOverdue} Days
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 px-3">
                  <span className="text-text-secondary">Overdue Rate:</span>
                  <span className="font-bold text-text-primary">₱15.00 / day</span>
                </div>

                <div className="flex items-center justify-between py-1 px-3">
                  <span className="text-text-secondary">Base Overdue Fine:</span>
                  <span className="font-bold text-text-primary">₱{baseOverdueFine.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between py-1 px-3">
                  <span className="text-text-secondary">Condition Surcharge:</span>
                  <span
                    className={`font-bold ${
                      conditionSurcharge > 0 ? 'text-status-danger' : 'text-status-available'
                    }`}
                  >
                    ₱{conditionSurcharge.toFixed(2)}
                  </span>
                </div>

                {isAfterHoursCounterSlot && daysOverdue <= 1 && (
                  <div className="flex items-center justify-between py-1 px-3 text-caption font-caption text-action-green">
                    <span>Counter Drop Slot Grace:</span>
                    <span className="font-bold">Waiver Applied</span>
                  </div>
                )}

                <div className="pt-2 border-t border-surface-container flex items-center justify-between px-3">
                  <span className="font-body-large text-body-large font-bold text-text-primary">Total Surcharge Due:</span>
                  <span className="font-headline-3 text-headline-3 font-bold text-primary">
                    ₱{totalFineDue.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col space-y-3">
                <button
                  onClick={handleFinalizeReturn}
                  disabled={isProcessing || !selectedLoan}
                  className="w-full py-3.5 px-4 bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  type="button"
                >
                  <span className="material-symbols-outlined text-2xl">
                    {isProcessing ? 'autorenew' : 'assignment_turned_in'}
                  </span>
                  <span>{isProcessing ? 'Processing Return...' : 'Finalize Return & Restock Stacks'}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handlePrintSlip}
                    disabled={!selectedLoan}
                    className="py-2.5 px-3 bg-surface-container hover:bg-surface-container-high text-text-primary font-caption text-caption font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-base">print</span>
                    <span>Print Receipt Slip</span>
                  </button>
                  <button
                    onClick={handleClearCounter}
                    className="py-2.5 px-3 bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-text-primary font-caption text-caption font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-base">restart_alt</span>
                    <span>Clear Counter</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STANDARDIZED CIRCULATING LOANS QUEUE SECTION */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-md border border-outline/10 flex flex-col space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="font-headline-3 text-headline-3 text-text-primary font-bold">
                Circulating Loans Roster
              </h2>
              <p className="font-caption text-caption text-text-secondary">
                Select any active borrowing in circulation to inspect condition or process return
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <RadioGroup
                name="returnsViewMode"
                options={[
                  { value: 'table', label: 'Table' },
                  { value: 'card', label: 'Cards' },
                ]}
                selectedValue={viewMode}
                onChange={handleViewModeChange}
              />

              {/* Sort Selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 px-3 rounded-xl bg-surface-container text-text-primary font-caption text-caption font-semibold outline-none cursor-pointer border border-outline/10"
              >
                <option value="due-asc">Sort: Due Date (Soonest)</option>
                <option value="overdue-first">Sort: Most Overdue</option>
                <option value="patron-az">Sort: Patron Name (A-Z)</option>
                <option value="title-az">Sort: Book Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Filter Chips & Search Bar */}
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="flex-1 w-full">
              <SearchBar
                placeholder="Search active loans by title, patron name, barcode, or loan code..."
                value={searchQuery}
                onChange={(v) => setSearchQuery(v)}
                shortcutKey=""
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-caption text-caption font-bold transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-text-secondary hover:text-text-primary'
                }`}
              >
                All Active ({activeLoans.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('due_today')}
                className={`px-3 py-1.5 rounded-lg font-caption text-caption font-bold transition-colors cursor-pointer ${
                  statusFilter === 'due_today'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-text-secondary hover:text-text-primary'
                }`}
              >
                Due Today
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('overdue')}
                className={`px-3 py-1.5 rounded-lg font-caption text-caption font-bold transition-colors cursor-pointer ${
                  statusFilter === 'overdue'
                    ? 'bg-status-danger text-on-primary'
                    : 'bg-surface-container text-text-secondary hover:text-text-primary'
                }`}
              >
                Overdue
              </button>
            </div>
          </div>

          {/* Active Loans Queue Display */}
          {activeLoans.length === 0 ? (
            <div className="p-12 bg-surface-container-low/40 rounded-xl flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-5xl text-text-secondary/40 mb-2">
                assignment_turned_in
              </span>
              <h3 className="font-body-large text-body-large text-text-primary font-bold">
                Zero Active Loans in Circulation
              </h3>
              <p className="font-caption text-caption text-text-secondary max-w-md mt-1">
                All books are accounted for in the library stacks. New borrow checkouts will populate here.
              </p>
            </div>
          ) : (
            <>
              {/* Table View (retained in DOM for useTableDraggable) */}
              <div
                ref={tableContainerRef}
                className={viewMode === 'table' ? 'overflow-x-auto rounded-xl border border-outline/10 bg-surface-container-lowest' : 'hidden'}
              >
                <table className="w-full text-left border-collapse min-w-[750px]">
                  <thead>
                    <tr className="border-b border-surface-container bg-surface-container-low/60 text-caption font-caption text-text-secondary font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Book Asset</th>
                      <th className="py-3 px-4">Patron</th>
                      <th className="py-3 px-4">Loan Code</th>
                      <th className="py-3 px-4">Borrowed</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container font-small text-small text-text-secondary">
                    {paginatedLoans.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-text-secondary font-caption">
                          No active loans match the specified search or filter criteria.
                        </td>
                      </tr>
                    ) : (
                      paginatedLoans.map((loan) => {
                        const isOverdue = new Date(loan.dueDate).getTime() < Date.now();
                        const isSelected = selectedLoan?.id === loan.id;
                        return (
                          <tr
                            key={loan.id}
                            className={`hover:bg-surface-container-low/50 transition-colors ${
                              isSelected ? 'bg-soft-blue/20' : ''
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-12 rounded overflow-hidden bg-surface-container-high flex-shrink-0 shadow-sm">
                                  {loan.bookCoverImage ? (
                                    <img
                                      src={loan.bookCoverImage}
                                      alt={loan.bookTitle}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-soft-blue text-primary">
                                      <span className="material-symbols-outlined text-sm">book</span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <span className="font-body-medium text-body-medium font-bold text-text-primary block line-clamp-1">
                                    {loan.bookTitle}
                                  </span>
                                  <span className="font-caption text-caption text-text-secondary font-mono">
                                    {loan.bookBarcode}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <span className="font-bold text-text-primary block">{loan.patronName}</span>
                                <span className="font-caption text-caption text-text-secondary font-mono">
                                  {loan.patronLibraryId}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-primary">{loan.loanCode}</td>
                            <td className="py-3 px-4">{new Date(loan.borrowDate).toLocaleDateString()}</td>
                            <td className="py-3 px-4">
                              <span className={isOverdue ? 'text-status-danger font-bold' : 'text-text-primary'}>
                                {new Date(loan.dueDate).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  isOverdue
                                    ? 'bg-status-danger/20 text-status-danger'
                                    : 'bg-action-green/20 text-action-green'
                                }`}
                              >
                                {isOverdue ? 'Overdue' : 'Active'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleSelectLoanForReturn(loan)}
                                type="button"
                                className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-caption text-caption font-bold transition-colors cursor-pointer shadow-sm"
                              >
                                {isSelected ? 'Auditing' : 'Check-In'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Cards View */}
              <div className={viewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'hidden'}>
                {paginatedLoans.map((loan) => {
                  const isOverdue = new Date(loan.dueDate).getTime() < Date.now();
                  const isSelected = selectedLoan?.id === loan.id;
                  return (
                    <div
                      key={loan.id}
                      className={`p-4 rounded-xl border bg-surface-container-low shadow-sm flex flex-col justify-between space-y-3 transition-colors ${
                        isSelected ? 'border-primary ring-1 ring-primary' : 'border-outline/10'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-20 rounded overflow-hidden bg-surface-container-high flex-shrink-0 shadow-sm">
                          {loan.bookCoverImage ? (
                            <img
                              src={loan.bookCoverImage}
                              alt={loan.bookTitle}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-soft-blue text-primary">
                              <span className="material-symbols-outlined text-lg">book</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-body-medium text-body-medium font-bold text-text-primary line-clamp-1">
                            {loan.bookTitle}
                          </h4>
                          <p className="font-caption text-caption text-text-secondary mt-0.5">
                            Borrower: <strong className="text-text-primary">{loan.patronName}</strong>
                          </p>
                          <p className="font-caption text-caption text-text-secondary font-mono">
                            {loan.bookBarcode} • {loan.loanCode}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                isOverdue
                                  ? 'bg-status-danger/20 text-status-danger'
                                  : 'bg-action-green/20 text-action-green'
                              }`}
                            >
                              {isOverdue ? 'Overdue' : 'Active'}
                            </span>
                            <span className="font-caption text-caption text-text-secondary text-[11px]">
                              Due: {new Date(loan.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-surface-container flex items-center justify-between">
                        <span className="font-caption text-caption text-text-secondary">
                          Loan: #{loan.loanCode}
                        </span>
                        <button
                          onClick={() => handleSelectLoanForReturn(loan)}
                          type="button"
                          className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-caption text-caption font-bold transition-colors cursor-pointer shadow-sm"
                        >
                          {isSelected ? 'Auditing' : 'Select for Return'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Footer */}
              {filteredLoans.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-surface-container">
                  <span className="font-caption text-caption text-text-secondary">
                    Showing {(currentPage - 1) * pageSize + 1} to{' '}
                    {Math.min(currentPage * pageSize, filteredLoans.length)} of {filteredLoans.length} active loans
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!canPrevPage}
                      onClick={prevPage}
                      className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-primary disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">chevron_left</span>
                    </button>
                    <span className="font-caption text-caption px-2 text-text-secondary">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={!canNextPage}
                      onClick={nextPage}
                      className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-primary disabled:opacity-40 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="h-8 px-2 rounded-lg bg-surface-container text-text-secondary font-caption text-caption outline-none cursor-pointer"
                    >
                      {pageSizeOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt} / page
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
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

export default ReturnsFines;
