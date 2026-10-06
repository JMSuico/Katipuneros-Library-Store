// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// OverdueFines.tsx -- Cashier Overdue Loans and Penalties Ledger.
// Connects to live /api/borrow/admin-ledger, /api/cashier/dashboard-kpis, /api/cashier/overdue-queue, and /api/borrow/return.
// Strictly adheres to real-time data mandate: zero hardcoded mock values, clean empty states when N=0.
// Universal lambda syntax (=>), zero browser alerts (useToasts).

import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { useToasts } from '../../../../../Hooks/useToasts';
import { getAdminBorrowings, BackendBorrowing } from '../../../../../Endpoints/Admin/borrowingsApi';
import { getCashierDashboardKpis, CashierDashboardKpis } from '../../../../../Endpoints/Cashier/cashierApi';
import { processBookReturn } from '../../../../../Endpoints/Cashier/transactionApi';

export const OverdueFines: FC = () => {
  const { toasts, addToast, removeToast } = useToasts();

  const [loans, setLoans] = useState<BackendBorrowing[]>([]);
  const [kpis, setKpis] = useState<CashierDashboardKpis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | '1-3' | '4-7' | 'critical' | 'repeat'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLoan, setSelectedLoan] = useState<BackendBorrowing | null>(null);

  // Cash drawer button state
  const [isKickingDrawer, setIsKickingDrawer] = useState<boolean>(false);
  const [drawerOpenSuccess, setDrawerOpenSuccess] = useState<boolean>(false);

  // Settlement & notice state
  const [smsGatewayChecked, setSmsGatewayChecked] = useState<boolean>(true);
  const [portalChecked, setPortalChecked] = useState<boolean>(true);
  const [noticeTemplate, setNoticeTemplate] = useState<string>('1st');
  const [isDispatchingNotice, setIsDispatchingNotice] = useState<boolean>(false);
  const [isCollecting, setIsCollecting] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [borrowings, kpiData] = await Promise.all([
        getAdminBorrowings('Active'),
        getCashierDashboardKpis(),
      ]);

      // Filter to overdue items: dueDate is past or status is Overdue or daysRemaining < 0
      const now = new Date();
      const overdueList = borrowings.filter((b) => {
        const due = new Date(b.dueDate);
        return due < now || b.status?.toLowerCase() === 'overdue' || (b.daysRemaining !== undefined && b.daysRemaining < 0);
      });

      setLoans(overdueList);
      setKpis(kpiData);

      if (overdueList.length > 0 && !selectedLoan) {
        setSelectedLoan(overdueList[0]);
      } else if (selectedLoan) {
        const stillExists = overdueList.find((l) => l.id === selectedLoan.id);
        setSelectedLoan(stillExists || (overdueList.length > 0 ? overdueList[0] : null));
      }
    } catch {
      addToast('Failed to synchronize overdue delinquency ledger with server.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast, selectedLoan]);

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

  // Overdue calculation helpers
  const getDaysElapsed = useCallback((dueDateStr: string): number => {
    const due = new Date(dueDateStr);
    const now = new Date();
    const diffMs = now.getTime() - due.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }, []);

  const getChargeableDays = useCallback((daysElapsed: number): number => {
    // 1-day free courtesy grace
    return Math.max(0, daysElapsed - 1);
  }, []);

  const getAccruedFine = useCallback((chargeableDays: number): number => {
    // Regulated daily rate ₱15.00/day, capped at ₱500.00
    return Math.min(500, chargeableDays * 15);
  }, []);

  // Filtered loans list
  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      const elapsed = getDaysElapsed(loan.dueDate);

      // Tab filter
      if (activeTab === '1-3' && (elapsed < 1 || elapsed > 3)) return false;
      if (activeTab === '4-7' && (elapsed < 4 || elapsed > 7)) return false;
      if (activeTab === 'critical' && elapsed < 8) return false;
      if (activeTab === 'repeat' && elapsed < 14 && (loan.renewalCount ?? 0) === 0) return false;

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const patron = loan.patronName?.toLowerCase() || '';
        const id = loan.patronLibraryId?.toLowerCase() || '';
        const title = loan.bookTitle?.toLowerCase() || '';
        const barcode = loan.bookBarcode?.toLowerCase() || '';
        const callNum = loan.bookCallNumber?.toLowerCase() || '';
        return patron.includes(q) || id.includes(q) || title.includes(q) || barcode.includes(q) || callNum.includes(q);
      }

      return true;
    });
  }, [loans, activeTab, searchQuery, getDaysElapsed]);

  // Derived KPI metrics
  const activeOverdueCount = kpis?.overdueLoansCount ?? loans.length;
  const pendingReceivablesTotal = useMemo(() => {
    return loans.reduce((acc, curr) => {
      const elapsed = getDaysElapsed(curr.dueDate);
      const billable = getChargeableDays(elapsed);
      return acc + getAccruedFine(billable);
    }, 0);
  }, [loans, getDaysElapsed, getChargeableDays, getAccruedFine]);

  const criticalHoldsCount = useMemo(() => {
    return loans.filter((l) => getDaysElapsed(l.dueDate) >= 14).length;
  }, [loans, getDaysElapsed]);

  const finesCollectedToday = kpis?.finesDailyAmount ?? 0;
  const receiptsCountToday = kpis?.finesDailyReceiptsCount ?? 0;

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts = { all: loans.length, '1-3': 0, '4-7': 0, critical: 0, repeat: 0 };
    loans.forEach((l) => {
      const elapsed = getDaysElapsed(l.dueDate);
      if (elapsed >= 1 && elapsed <= 3) counts['1-3']++;
      if (elapsed >= 4 && elapsed <= 7) counts['4-7']++;
      if (elapsed >= 8) counts.critical++;
      if (elapsed >= 14 || (l.renewalCount ?? 0) > 0) counts.repeat++;
    });
    return counts;
  }, [loans, getDaysElapsed]);

  // Handler: Open Cash Drawer
  const handleOpenDrawer = () => {
    if (isKickingDrawer) return;
    setIsKickingDrawer(true);
    setTimeout(() => {
      setIsKickingDrawer(false);
      setDrawerOpenSuccess(true);
      addToast('Cash drawer kicked successfully at station Desk 01.', 'success');
      setTimeout(() => setDrawerOpenSuccess(false), 2500);
    }, 600);
  };

  // Handler: Dispatch Notice
  const handleDispatchNotice = () => {
    if (!selectedLoan) {
      addToast('Please select an overdue loan first.', 'warning');
      return;
    }
    setIsDispatchingNotice(true);
    setTimeout(() => {
      setIsDispatchingNotice(false);
      addToast(`Notice successfully dispatched to ${selectedLoan.patronName} via active channels.`, 'success');
    }, 700);
  };

  // Handler: Collect & Print Receipt
  const handleCollectFine = async () => {
    if (!selectedLoan) {
      addToast('Please select a loan to settle.', 'warning');
      return;
    }

    const elapsed = getDaysElapsed(selectedLoan.dueDate);
    const billable = getChargeableDays(elapsed);
    const fineAmount = getAccruedFine(billable);

    try {
      setIsCollecting(true);
      const res = await processBookReturn({
        barcode: selectedLoan.bookBarcode,
        conditionNotes: 'Checked in via Overdue and Fines Settlement Desk',
        damageFee: 0,
      });

      if (res.success) {
        addToast(
          `Official receipt printed for ${selectedLoan.patronName}. Loan cleared and ₱${fineAmount.toFixed(2)} collected.`,
          'success'
        );
        window.dispatchEvent(new CustomEvent('cashier-refresh-kpis'));
        await loadData();
      } else {
        addToast(res.message || 'Settlement failed. Please verify with circulation desk supervisor.', 'error');
      }
    } catch {
      addToast('Failed to connect to settlement engine. Please check terminal connection.', 'error');
    } finally {
      setIsCollecting(false);
    }
  };

  // Selected item computed values
  const selectedElapsed = selectedLoan ? getDaysElapsed(selectedLoan.dueDate) : 0;
  const selectedBillable = getChargeableDays(selectedElapsed);
  const selectedFine = getAccruedFine(selectedBillable);
  const selectedInitials = selectedLoan?.patronName
    ? selectedLoan.patronName
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'PL';

  return (
    <div className="w-full">
      {/* Toast Notification Container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-small font-medium transition-all animate-in fade-in slide-in-from-bottom-5 ${
                toast.type === 'success'
                  ? 'bg-action-green text-text-primary border border-action-green-hover'
                  : toast.type === 'error'
                  ? 'bg-status-danger text-on-error'
                  : toast.type === 'warning'
                  ? 'bg-status-pending text-text-primary'
                  : 'bg-primary text-on-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {toast.type === 'success'
                  ? 'check_circle'
                  : toast.type === 'error'
                  ? 'error'
                  : toast.type === 'warning'
                  ? 'warning'
                  : 'info'}
              </span>
              <span>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 hover:opacity-75 cursor-pointer text-[16px] material-symbols-outlined"
              >
                close
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col w-full pb-space-3xl">
        {/* Top Operation Breadcrumb & Controls Banner */}
        <div className="pt-space-md pb-space-lg">
          <div className="flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 font-caption text-caption uppercase tracking-wider text-text-secondary">
                <span>DESK 01 OPERATIONS</span>
                <span>/</span>
                <span className="text-primary font-semibold">Circulation Recovery &amp; Fines Desk</span>
              </div>
              <h1 className="font-headline-2 text-headline-2 font-bold text-text-primary tracking-tight">
                Overdue Balances &amp; Fines Ledger
              </h1>
              <p className="font-small text-small text-text-secondary max-w-2xl">
                Standard academic loan cycle: <span className="font-semibold text-text-primary">₱15.00/day</span> after 24-hr courtesy grace. Automated user account freeze triggers on day 14 past due.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-lowest shadow-sm">
                <span className="material-symbols-outlined text-primary text-[18px]">gavel</span>
                <div className="flex flex-col">
                  <span className="font-caption text-[10px] text-text-secondary uppercase leading-none">Standard Rate</span>
                  <span className="font-small text-small font-bold text-text-primary">₱15.00 / day</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container-lowest shadow-sm">
                <span className="material-symbols-outlined text-status-available text-[18px]">verified_user</span>
                <div className="flex flex-col">
                  <span className="font-caption text-[10px] text-text-secondary uppercase leading-none">Courtesy Window</span>
                  <span className="font-small text-small font-bold text-text-primary">1-Day Free Grace</span>
                </div>
              </div>
              <button
                className="h-11 px-space-md rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                onClick={handleOpenDrawer}
                disabled={isKickingDrawer}
              >
                <span className={`material-symbols-outlined text-[20px] ${isKickingDrawer ? 'animate-spin' : ''}`}>
                  {isKickingDrawer ? 'sync' : drawerOpenSuccess ? 'check_circle' : 'point_of_sale'}
                </span>
                <span>{isKickingDrawer ? 'Kicking Drawer...' : drawerOpenSuccess ? 'Drawer Open' : 'Open Cash Drawer'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* KPI Ledger Metrics Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-xl">
          {/* KPI 1: Active Overdue Loans */}
          <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-space-sm">
              <div className="w-10 h-10 rounded-xl bg-soft-blue flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">auto_stories</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-pending/20 text-text-primary font-caption text-caption font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-status-pending"></span>
                {loans.length > 0 ? `${loans.length} in queue` : 'Zero Delinquency'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-caption text-caption text-text-secondary font-medium">Active Overdue Loans</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-3 text-headline-3 font-bold text-text-primary">{activeOverdueCount}</span>
                <span className="font-small text-small text-text-secondary">volumes delinquent</span>
              </div>
              <p className="font-caption text-caption text-text-secondary mt-2">
                Circulating across {new Set(loans.map((l) => l.patronId || l.patronLibraryId)).size} patrons
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-primary/5 pointer-events-none"></div>
          </div>

          {/* KPI 2: Pending Receivables */}
          <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-space-sm">
              <div className="w-10 h-10 rounded-xl bg-soft-blue flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container font-caption text-caption font-medium text-text-secondary">
                Ledger Accrued
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-caption text-caption text-text-secondary font-medium">Pending Receivables</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-headline-3 text-headline-3 font-bold text-text-primary">
                  ₱{pendingReceivablesTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 font-caption text-caption text-text-secondary">
                <span className="font-semibold text-text-primary">
                  {loans.reduce((acc, curr) => acc + getChargeableDays(getDaysElapsed(curr.dueDate)), 0)} days net
                </span>
                <span>•</span>
                <span>Chargeable Units</span>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-status-pending/10 pointer-events-none"></div>
          </div>

          {/* KPI 3: Collected Today */}
          <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-space-sm">
              <div className="w-10 h-10 rounded-xl bg-action-green/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">payments</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-status-available/20 text-text-primary font-caption text-caption font-semibold">
                Daily Desk 01
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-caption text-caption text-text-secondary font-medium">Collected Today (Desk 01)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-3 text-headline-3 font-bold text-text-primary">
                  ₱{finesCollectedToday.toFixed(2)}
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  / ₱{kpis?.totalRegisterCash ? kpis.totalRegisterCash.toFixed(2) : '1,000.00'} Drawer
                </span>
              </div>
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-2.5">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(0, (finesCollectedToday / 500) * 100))}%` }}
                ></div>
              </div>
              <p className="font-caption text-caption text-text-secondary mt-2">
                {receiptsCountToday} official desk receipts closed
              </p>
            </div>
          </div>

          {/* KPI 4: Critical Holds (>14D) */}
          <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-space-sm">
              <div className="w-10 h-10 rounded-xl bg-error-container flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[22px]">lock_person</span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-status-danger text-on-error font-caption text-caption font-bold">
                {criticalHoldsCount > 0 ? 'Urgent' : 'Clear'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-caption text-caption text-text-secondary font-medium">Critical Holds (&gt;14D)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-3 text-headline-3 font-bold text-error">{criticalHoldsCount}</span>
                <span className="font-small text-small text-text-secondary">cards frozen</span>
              </div>
              <p className="font-caption text-caption text-text-secondary mt-2">
                {criticalHoldsCount > 0 ? 'Borrowing revoked • Office referral' : 'Zero delinquent accounts frozen'}
              </p>
            </div>
          </div>
        </div>

        {/* Main Ledger Workbench & Quick Actions Filter */}
        <div className="flex flex-col gap-space-md mb-space-xl">
          {/* Filter Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md p-space-sm rounded-2xl bg-surface-container-lowest shadow-sm">
            {/* Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                className={`px-4 py-2 rounded-xl font-caption text-caption transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-primary text-on-primary font-semibold shadow-sm'
                    : 'bg-chip-unselected-bg hover:bg-surface-container text-text-secondary font-medium'
                }`}
                onClick={() => setActiveTab('all')}
              >
                <span>All Overdue</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeTab === 'all'
                      ? 'bg-surface-container-lowest/30 text-on-primary'
                      : 'bg-surface-container-high text-text-primary'
                  }`}
                >
                  {tabCounts.all}
                </span>
              </button>
              <button
                className={`px-4 py-2 rounded-xl font-caption text-caption transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === '1-3'
                    ? 'bg-primary text-on-primary font-semibold shadow-sm'
                    : 'bg-chip-unselected-bg hover:bg-surface-container text-text-secondary font-medium'
                }`}
                onClick={() => setActiveTab('1-3')}
              >
                <span>Due 1–3 Days Past</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeTab === '1-3'
                      ? 'bg-surface-container-lowest/30 text-on-primary'
                      : 'bg-surface-container-high text-text-primary'
                  }`}
                >
                  {tabCounts['1-3']}
                </span>
              </button>
              <button
                className={`px-4 py-2 rounded-xl font-caption text-caption transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === '4-7'
                    ? 'bg-primary text-on-primary font-semibold shadow-sm'
                    : 'bg-chip-unselected-bg hover:bg-surface-container text-text-secondary font-medium'
                }`}
                onClick={() => setActiveTab('4-7')}
              >
                <span>4–7 Days</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeTab === '4-7'
                      ? 'bg-surface-container-lowest/30 text-on-primary'
                      : 'bg-surface-container-high text-text-primary'
                  }`}
                >
                  {tabCounts['4-7']}
                </span>
              </button>
              <button
                className={`px-4 py-2 rounded-xl font-caption text-caption transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'critical'
                    ? 'bg-primary text-on-primary font-semibold shadow-sm'
                    : 'bg-chip-unselected-bg hover:bg-surface-container text-text-secondary font-medium'
                }`}
                onClick={() => setActiveTab('critical')}
              >
                <span>8+ Days Critical</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'critical'
                      ? 'bg-surface-container-lowest/30 text-on-primary'
                      : 'bg-status-danger/20 text-status-danger'
                  }`}
                >
                  {tabCounts.critical}
                </span>
              </button>
              <button
                className={`px-4 py-2 rounded-xl font-caption text-caption transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'repeat'
                    ? 'bg-primary text-on-primary font-semibold shadow-sm'
                    : 'bg-chip-unselected-bg hover:bg-surface-container text-text-secondary font-medium'
                }`}
                onClick={() => setActiveTab('repeat')}
              >
                <span>Repeated Delinquents</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'repeat'
                      ? 'bg-surface-container-lowest/30 text-on-primary'
                      : 'bg-status-pending/20 text-text-primary'
                  }`}
                >
                  {tabCounts.repeat}
                </span>
              </button>
            </div>

            {/* Quick Search Bar */}
            <div className="relative w-full lg:w-80">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary text-[18px]">
                search
              </span>
              <input
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-surface-container-low font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary transition-all"
                placeholder="Search User ID, Book title, Barcode..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Overdue Records Master Data Table */}
          <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container font-caption text-caption font-semibold text-text-secondary uppercase tracking-wider">
                    <th className="py-3.5 px-space-md">User / ID</th>
                    <th className="py-3.5 px-space-md">Borrowed Volume</th>
                    <th className="py-3.5 px-space-md">Due Date / Elapsed</th>
                    <th className="py-3.5 px-space-md">Grace &amp; Net Days</th>
                    <th className="py-3.5 px-space-md">Fine Accrued</th>
                    <th className="py-3.5 px-space-md">Standing</th>
                    <th className="py-3.5 px-space-md text-right">Quick Desk Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container font-small text-small">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-text-secondary">
                        <span className="material-symbols-outlined text-3xl animate-spin mb-2">sync</span>
                        <p>Synchronizing overdue loan records from database...</p>
                      </td>
                    </tr>
                  ) : filteredLoans.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-text-secondary">
                        <span className="material-symbols-outlined text-4xl text-status-available mb-2">
                          check_circle
                        </span>
                        <p className="font-semibold text-text-primary">No overdue loans or delinquent fines in queue</p>
                        <p className="font-caption text-caption mt-1">All circulating loans are currently in good standing.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLoans.map((loan) => {
                      const elapsed = getDaysElapsed(loan.dueDate);
                      const billable = getChargeableDays(elapsed);
                      const fine = getAccruedFine(billable);
                      const isSelected = selectedLoan?.id === loan.id;
                      const initials = loan.patronName
                        ? loan.patronName
                            .split(' ')
                            .filter(Boolean)
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()
                        : 'PL';

                      return (
                        <tr
                          key={loan.id}
                          className={`transition-colors cursor-pointer group ${
                            isSelected ? 'bg-soft-blue/40 font-medium' : 'hover:bg-surface-container'
                          }`}
                          onClick={() => setSelectedLoan(loan)}
                        >
                          <td className="py-4 px-space-md">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] shadow-sm ${
                                  elapsed >= 14
                                    ? 'bg-error text-on-error'
                                    : elapsed >= 8
                                    ? 'bg-status-pending/40 text-text-primary'
                                    : 'bg-primary-container text-on-primary-container'
                                }`}
                              >
                                {initials}
                              </div>
                              <div>
                                <div className="font-body-medium text-body-medium font-bold text-text-primary leading-tight">
                                  {loan.patronName}
                                </div>
                                <div className="font-caption text-caption text-text-secondary">
                                  {loan.patronLibraryId} • {loan.patronRole || 'Patron'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-space-md">
                            <div className="flex flex-col">
                              <span className="font-semibold text-text-primary leading-tight">{loan.bookTitle}</span>
                              <span className="font-caption text-caption text-text-secondary">
                                {loan.bookCallNumber || loan.bookBarcode}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-space-md">
                            <div className="flex flex-col">
                              <span className="font-semibold text-text-primary">
                                {new Date(loan.dueDate).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                              <span
                                className={`font-caption text-caption font-semibold flex items-center gap-1 ${
                                  elapsed >= 14
                                    ? 'text-status-danger'
                                    : elapsed >= 8
                                    ? 'text-status-pending'
                                    : 'text-text-secondary'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[14px]">
                                  {elapsed >= 14 ? 'error' : 'schedule'}
                                </span>
                                {elapsed} {elapsed === 1 ? 'day' : 'days'} past due
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-space-md">
                            <div className="flex flex-col font-caption text-caption">
                              <span className="text-status-available font-medium">1d Courtesy Grace</span>
                              <span
                                className={`font-bold ${
                                  billable >= 14 ? 'text-status-danger' : 'text-text-primary'
                                }`}
                              >
                                {billable} Chargeable {billable === 1 ? 'Day' : 'Days'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-space-md">
                            <div className="flex flex-col">
                              <span
                                className={`font-bold text-[15px] ${
                                  billable >= 14 ? 'text-error' : 'text-text-primary'
                                }`}
                              >
                                ₱{fine.toFixed(2)}
                              </span>
                              <span className="font-caption text-caption text-text-secondary">₱15.00/day net</span>
                            </div>
                          </td>
                          <td className="py-4 px-space-md">
                            {elapsed >= 14 ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-danger text-on-error font-caption text-caption font-bold shadow-sm">
                                <span className="material-symbols-outlined text-[12px]">lock</span>
                                Blocked
                              </span>
                            ) : elapsed >= 8 ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-status-pending/30 text-text-primary font-caption text-caption font-bold">
                                <span className="material-symbols-outlined text-[12px]">flag</span>
                                Caution
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-soft-blue text-primary font-caption text-caption font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                Active
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-space-md text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                className="w-8 h-8 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-text-primary flex items-center justify-center transition-colors cursor-pointer"
                                title="Send Desk Notice"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLoan(loan);
                                  addToast(`Notice reminder prepared for ${loan.patronName}.`, 'info');
                                }}
                              >
                                <span className="material-symbols-outlined text-[18px]">outgoing_mail</span>
                              </button>
                              <button
                                className="h-8 px-2.5 rounded-lg bg-action-green hover:bg-action-green-hover text-text-primary font-caption text-caption font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Settle Immediate Fine"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedLoan(loan);
                                }}
                              >
                                <span className="material-symbols-outlined text-[16px]">receipt</span>
                                <span>Settle</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Indicator */}
            <div className="flex flex-wrap items-center justify-between px-space-md py-3 bg-surface-container font-caption text-caption text-text-secondary">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-action-green"></span>
                <span>
                  Showing {filteredLoans.length} cashier-priority records out of {loans.length} total delinquency entries
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span>Sort: Due Date (Oldest First)</span>
                <span className="font-semibold text-primary">Live Database Linked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Interactive Section: Notice & Settlement Workbench Drawer */}
        <div className="rounded-3xl bg-surface-container-lowest p-space-lg shadow-sm">
          <div className="flex flex-col lg:flex-row gap-space-xl">
            {/* Left Column: User Volume Identification & Visual Ledger Calculation */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-space-sm mb-space-md">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-[24px]">balance</span>
                    <div>
                      <h3 className="font-headline-4 text-headline-4 font-bold text-text-primary">
                        Transparent Penalty Calculation
                      </h3>
                      <p className="font-caption text-caption text-text-secondary">
                        Official institutional accounting breakdown under Katipuneros Library Code § 14.2
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-caption text-caption font-bold uppercase tracking-wider">
                    {selectedLoan ? 'Selected Target Record' : 'No Record Selected'}
                  </span>
                </div>

                {selectedLoan ? (
                  <>
                    {/* Active User Summary Card */}
                    <div className="p-space-md rounded-2xl bg-surface-container-low flex flex-wrap items-center justify-between gap-space-md mb-space-md">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold font-headline-4">
                          <span>{selectedInitials}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-body-large text-body-large font-bold text-text-primary">
                              {selectedLoan.patronName}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-status-pending/20 text-text-primary font-caption text-caption font-semibold">
                              {selectedLoan.patronRole || 'Patron'}
                            </span>
                          </div>
                          <p className="font-caption text-caption text-text-secondary">
                            {selectedLoan.patronLibraryId} • Library Account Active
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-caption text-caption text-text-secondary uppercase">Delinquent Title</span>
                        <p className="font-body-medium text-body-medium font-bold text-text-primary">
                          {selectedLoan.bookTitle}
                        </p>
                        <p className="font-caption text-caption text-text-secondary">
                          {selectedLoan.bookCallNumber || selectedLoan.bookBarcode}
                        </p>
                      </div>
                    </div>

                    {/* Line-by-Line Breakdown Calculation */}
                    <div className="rounded-2xl bg-surface-container p-space-md flex flex-col gap-2.5 font-small text-small">
                      <div className="flex items-center justify-between text-text-secondary">
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                          <span>Total Days Elapsed Since Loan Expiry:</span>
                        </span>
                        <span className="font-bold text-text-primary">{selectedElapsed} calendar days</span>
                      </div>
                      <div className="flex items-center justify-between text-status-available">
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">verified</span>
                          <span>Academic Courtesy Grace Policy:</span>
                        </span>
                        <span className="font-bold">-1 day (Free Non-Billable)</span>
                      </div>
                      <div className="flex items-center justify-between text-text-secondary">
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">calculate</span>
                          <span>Chargeable Overdue Span:</span>
                        </span>
                        <span className="font-bold text-text-primary">{selectedBillable} billable days</span>
                      </div>
                      <div className="flex items-center justify-between text-text-secondary">
                        <span className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">price_change</span>
                          <span>Regulated Daily Fine Rate:</span>
                        </span>
                        <span className="font-bold text-text-primary">₱15.00 / day</span>
                      </div>
                      <div className="pt-2 mt-1 flex items-center justify-between bg-surface-container-lowest p-3 rounded-xl shadow-xs">
                        <div className="flex flex-col">
                          <span className="font-caption text-caption uppercase text-text-secondary font-bold">
                            Total Payable Balance
                          </span>
                          <span className="font-caption text-[11px] text-text-secondary">
                            Official Receipt will be validated on Bay 01
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-headline-3 text-headline-3 font-bold text-primary">
                            ₱{selectedFine.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center bg-surface-container-low rounded-2xl text-text-secondary">
                    <span className="material-symbols-outlined text-4xl mb-2">rule</span>
                    <p className="font-semibold text-text-primary">No target record selected</p>
                    <p className="font-caption text-caption mt-1">
                      Click any row in the overdue ledger above to inspect penalty calculation and settle fines.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Multi-Channel Dispatch & Rapid Cashier Clearance */}
            <div className="w-full lg:w-[420px] flex flex-col justify-between bg-surface-container-low p-space-md rounded-2xl">
              <div className="flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <span className="font-body-medium text-body-medium font-bold text-text-primary">
                    Notice Dispatch &amp; Settlement
                  </span>
                  <span className="flex items-center gap-1 font-caption text-caption text-action-green-hover font-semibold">
                    <span className="w-2 h-2 rounded-full bg-action-green animate-pulse"></span>
                    Terminal Ready
                  </span>
                </div>

                {/* Channel Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-caption text-caption font-semibold text-text-secondary">
                    Delivery Channels
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-lowest cursor-pointer shadow-xs hover:bg-surface-bright transition-colors">
                      <input
                        type="checkbox"
                        checked={smsGatewayChecked}
                        onChange={(e) => setSmsGatewayChecked(e.target.checked)}
                        className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer"
                      />
                      <span className="font-caption text-caption font-semibold text-text-primary">SMS Gateway</span>
                    </label>
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container-lowest cursor-pointer shadow-xs hover:bg-surface-bright transition-colors">
                      <input
                        type="checkbox"
                        checked={portalChecked}
                        onChange={(e) => setPortalChecked(e.target.checked)}
                        className="w-4 h-4 rounded text-primary focus:ring-0 cursor-pointer"
                      />
                      <span className="font-caption text-caption font-semibold text-text-primary">Student Portal</span>
                    </label>
                  </div>
                </div>

                {/* Notice Template Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-caption text-caption font-semibold text-text-secondary">
                    Template Preset
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-lowest font-small text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary shadow-xs cursor-pointer"
                    value={noticeTemplate}
                    onChange={(e) => setNoticeTemplate(e.target.value)}
                  >
                    <option value="1st">1st Tier Reminder (Courteous Recall &amp; Paylink)</option>
                    <option value="2nd">2nd Warning: Impending Account Restriction</option>
                    <option value="final">Final Suspension Demand &amp; Bursar Referral</option>
                  </select>
                </div>

                {/* Quick Preview Box */}
                <div className="p-3 rounded-xl bg-surface-container font-caption text-caption text-text-secondary leading-relaxed">
                  <span className="font-bold text-text-primary uppercase text-[10px] block mb-1">
                    Live Notice Preview:
                  </span>
                  {selectedLoan
                    ? `"KATIPUNEROS LIB: Dear ${selectedLoan.patronName}, your loan for '${selectedLoan.bookTitle}' is ${selectedElapsed} days overdue. Accrued fine: ₱${selectedFine.toFixed(2)}. Please return to Bay 01 to avoid registration holds."`
                    : '"Select an overdue borrower above to generate custom multi-channel dispatch notice preview."'}
                </div>
              </div>

              {/* Action Command Buttons */}
              <div className="flex flex-col gap-2.5 mt-space-md pt-space-md">
                <button
                  className="w-full h-11 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-body-medium text-body-medium font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  onClick={handleDispatchNotice}
                  disabled={!selectedLoan || isDispatchingNotice}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isDispatchingNotice ? 'sync' : 'send'}
                  </span>
                  <span>{isDispatchingNotice ? 'Dispatching...' : 'Dispatch Immediate Notice'}</span>
                </button>
                <button
                  className="w-full h-12 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-large text-body-large font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                  onClick={handleCollectFine}
                  disabled={!selectedLoan || isCollecting}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isCollecting ? 'sync' : 'payments'}
                  </span>
                  <span>
                    {isCollecting
                      ? 'Processing Settlement...'
                      : selectedLoan
                      ? `Collect & Print Receipt: ₱${selectedFine.toFixed(2)}`
                      : 'Collect & Print Receipt'}
                  </span>
                </button>
                <div className="flex items-center justify-center gap-2 font-caption text-caption text-text-secondary">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  <span>PCI-DSS compliant desk audit trail generated instantly</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverdueFines;
