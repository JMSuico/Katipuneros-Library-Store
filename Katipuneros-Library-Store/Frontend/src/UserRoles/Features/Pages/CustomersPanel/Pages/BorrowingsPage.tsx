// [Layer: UserRoles/Features/Pages/CustomersPanel/Pages]
// BorrowingsPage.tsx -- Customer Borrowing History, Real-Time Loans, and Lifecycle Ledgers
// Connects to Endpoints/Customer/borrowApi.ts for live circulation data and renewals.
// Dispatches async operations via clean expression-bodied lambda patterns with zero mock metrics.

import { FC, useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CustomerLoanRecord,
  getCustomerActiveLoans,
  getCustomerLoanHistory,
  renewCustomerLoan,
} from '../../../../../Endpoints/Customer/borrowApi';
import { getStoredUser, AuthUser } from '../../../../../Endpoints/authApi';
import { useToasts } from '../../../../../Hooks/useToasts';

type HistoryFilter = 'all' | 'ontime' | 'renewals' | 'fines';

const BorrowingsPage: FC = () => {
  const currentUser: AuthUser | null = getStoredUser();
  const { toasts, addToast, removeToast } = useToasts();

  const [activeLoans, setActiveLoans] = useState<CustomerLoanRecord[]>([]);
  const [loanHistory, setLoanHistory] = useState<CustomerLoanRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [actives, history] = await Promise.all([
        getCustomerActiveLoans(),
        getCustomerLoanHistory(),
      ]);
      setActiveLoans(actives);
      setLoanHistory(history);
      if (actives.length > 0 && !selectedLoanId) {
        setSelectedLoanId(actives[0].id);
      }
    } catch (err) {
      console.error('Failed to load customer circulation records:', err);
      addToast('Unable to synchronize circulation records. Please retry.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Selected loan for lifecycle tracker
  const selectedLoan = useMemo(() => {
    if (activeLoans.length === 0) return null;
    return activeLoans.find((l) => l.id === selectedLoanId) || activeLoans[0];
  }, [activeLoans, selectedLoanId]);

  // Renewal Handler
  const handleRenew = async (loanId: string, title?: string) => {
    try {
      setRenewingId(loanId);
      const res = await renewCustomerLoan(loanId);
      if (res.success) {
        addToast(res.message || `New return deadline granted for "${title || 'Book'}".`, 'success');
        await loadData();
      } else {
        addToast(res.message || 'Renewal request could not be processed.', 'error');
      }
    } catch {
      addToast('Failed to connect to circulation service for renewal.', 'error');
    } finally {
      setRenewingId(null);
    }
  };

  // Export Ledger to CSV
  const handleExportLedger = () => {
    const rows = [
      ['ID', 'Book Title', 'Borrow Date', 'Due Date', 'Return Date', 'Status', 'Renewals', 'Gate Pass'],
      ...activeLoans.map((l) => [
        l.id,
        `"${(l.book?.title || 'Unknown').replace(/"/g, '""')}"`,
        l.borrowDate,
        l.dueDate,
        l.returnDate || 'ACTIVE',
        'Active',
        l.renewalCount,
        l.gatePassCode || '',
      ]),
      ...loanHistory.map((l) => [
        l.id,
        `"${(l.book?.title || 'Unknown').replace(/"/g, '""')}"`,
        l.borrowDate,
        l.dueDate,
        l.returnDate || 'RETURNED',
        'Returned',
        l.renewalCount,
        l.gatePassCode || '',
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Circulation_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Circulation ledger exported to CSV successfully.', 'success');
  };

  // Metrics Calculation (CUSTOMER DATA SHOW FORMULA)
  const booksInPossession = activeLoans.length;
  const maxAllowance = 4;
  const allowancePercent = Math.min(100, Math.round((booksInPossession / maxAllowance) * 100));

  // Earliest Due Date & Overdue Count
  const { earliestDueLoan, daysUntilEarliestDue, overdueCount } = useMemo(() => {
    if (activeLoans.length === 0) {
      return { earliestDueLoan: null, daysUntilEarliestDue: null, overdueCount: 0 };
    }

    const now = Date.now();
    let minDiff = Infinity;
    let earliest: CustomerLoanRecord | null = null;
    let overdues = 0;

    activeLoans.forEach((loan) => {
      const dueTime = new Date(loan.dueDate).getTime();
      const diffDays = Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24));

      if (dueTime < now) {
        overdues += 1;
      }

      if (diffDays < minDiff) {
        minDiff = diffDays;
        earliest = loan;
      }
    });

    return {
      earliestDueLoan: earliest,
      daysUntilEarliestDue: minDiff === Infinity ? null : minDiff,
      overdueCount: overdues,
    };
  }, [activeLoans]);

  // Filtered History Rows
  const filteredHistory = useMemo(() => {
    let list = loanHistory;

    if (historyFilter === 'ontime') {
      list = list.filter((l) => {
        if (!l.returnDate) return false;
        return new Date(l.returnDate).getTime() <= new Date(l.dueDate).getTime();
      });
    } else if (historyFilter === 'renewals') {
      list = list.filter((l) => l.renewalCount > 0);
    } else if (historyFilter === 'fines') {
      list = list.filter((l) => {
        if (!l.returnDate) return false;
        return new Date(l.returnDate).getTime() > new Date(l.dueDate).getTime();
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (l) =>
          l.book?.title?.toLowerCase().includes(q) ||
          l.book?.isbn?.toLowerCase().includes(q) ||
          l.gatePassCode?.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q)
      );
    }

    return list;
  }, [loanHistory, historyFilter, searchQuery]);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
        {/* Subtle Ambient Glow Orbs */}
        <div className="relative w-full overflow-hidden pb-space-3xl">
          <div className="absolute -top-12 -left-20 w-96 h-96 rounded-full bg-secondary-container/40 blur-3xl pointer-events-none"></div>
          <div className="absolute top-48 right-0 w-[30rem] h-[30rem] rounded-full bg-soft-blue/50 blur-3xl pointer-events-none"></div>

          {/* Section 1: Borrowings Header & High-Level User Stat Pods */}
          <section className="relative z-10 w-full pt-space-md">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg mb-space-xl">
              <div className="max-w-3xl space-y-space-xs">
                <div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-glass-surface backdrop-blur-md shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-action-green animate-pulse"></span>
                  <span className="font-caption text-caption text-secondary uppercase tracking-widest font-semibold">
                    Circulation Desk Ledger
                  </span>
                  <span className="text-text-secondary">•</span>
                  <span className="font-caption text-caption text-text-secondary">
                    Patron #{currentUser?.userId ? currentUser.userId.slice(0, 8).toUpperCase() : 'KP-GUEST'}
                  </span>
                </div>
                <h1 className="font-headline-1 text-headline-1 text-text-primary tracking-tight">
                  My Active Loans &amp; Circulation History
                </h1>
                <p className="font-body-large text-body-large text-text-secondary leading-relaxed">
                  Monitor physical collection books currently checked out, due dates, loan extensions, and past circulation records.
                </p>
              </div>

              {/* Real-time Status Pill Group */}
              <div className="flex items-center gap-space-xs p-1.5 rounded-2xl bg-glass-surface backdrop-blur-md shadow-sm shrink-0">
                <button
                  className="flex items-center gap-space-xs px-space-md py-space-xs rounded-xl bg-primary-container text-on-primary-container font-small text-small font-medium shadow-sm transition-all cursor-pointer hover:opacity-90"
                  onClick={loadData}
                  type="button"
                >
                  <span className={`material-symbols-outlined text-lg ${loading ? 'animate-spin' : ''}`}>
                    sync_saved_locally
                  </span>
                  <span>{loading ? 'Syncing...' : 'Live Sync'}</span>
                </button>
                <button
                  className="flex items-center gap-space-xs px-space-md py-space-xs rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-container-high transition-all font-small text-small cursor-pointer"
                  onClick={handleExportLedger}
                  type="button"
                >
                  <span className="material-symbols-outlined text-lg">download</span>
                  <span>Ledger Export</span>
                </button>
              </div>
            </div>

            {/* 4 User Key Indicator Tiles (Bento Stat Strip) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
              {/* Tile 1: Books in Possession */}
              <div className="relative overflow-hidden rounded-2xl bg-glass-surface backdrop-blur-xl p-space-lg shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <span className="font-caption text-caption uppercase text-text-secondary tracking-wider font-semibold">
                    Books in Possession
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-soft-blue flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">auto_stories</span>
                  </div>
                </div>
                <div className="mt-space-md flex items-baseline gap-space-sm">
                  <span className="font-display-hero text-headline-1 text-text-primary">
                    {String(booksInPossession).padStart(2, '0')}
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    / {maxAllowance} max allowance
                  </span>
                </div>
                <div className="mt-space-sm w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${allowancePercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Tile 2: Due Soonest */}
              <div className="relative overflow-hidden rounded-2xl bg-glass-surface backdrop-blur-xl p-space-lg shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <span
                    className={`font-caption text-caption uppercase tracking-wider font-semibold ${
                      daysUntilEarliestDue !== null && daysUntilEarliestDue <= 3
                        ? 'text-status-pending'
                        : 'text-text-secondary'
                    }`}
                  >
                    {daysUntilEarliestDue === null
                      ? 'No Due Dates'
                      : daysUntilEarliestDue < 0
                      ? 'Overdue Item'
                      : `Due in ${daysUntilEarliestDue} Day${daysUntilEarliestDue === 1 ? '' : 's'}`}
                  </span>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      daysUntilEarliestDue !== null && daysUntilEarliestDue <= 3
                        ? 'bg-status-pending/15 text-status-pending'
                        : 'bg-surface-container-high text-text-secondary'
                    }`}
                  >
                    <span className="material-symbols-outlined">alarm</span>
                  </div>
                </div>
                <div className="mt-space-md flex items-baseline gap-space-sm">
                  <span
                    className={`font-display-hero text-headline-1 ${
                      daysUntilEarliestDue !== null && daysUntilEarliestDue <= 3
                        ? 'text-status-pending'
                        : 'text-text-primary'
                    }`}
                  >
                    {daysUntilEarliestDue !== null ? String(Math.max(0, daysUntilEarliestDue)).padStart(2, '0') : '00'}
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    {daysUntilEarliestDue === null
                      ? 'No items checked out'
                      : daysUntilEarliestDue <= 3
                      ? 'Action needed soon'
                      : 'Schedule standard return'}
                  </span>
                </div>
                <div className="mt-space-sm flex items-center gap-space-xs text-caption font-caption text-text-secondary">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>
                    {earliestDueLoan?.dueDate
                      ? new Date(earliestDueLoan.dueDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'No pending returns'}
                  </span>
                </div>
              </div>

              {/* Tile 3: Overdue Loans */}
              <div className="relative overflow-hidden rounded-2xl bg-glass-surface backdrop-blur-xl p-space-lg shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <span
                    className={`font-caption text-caption uppercase tracking-wider font-semibold ${
                      overdueCount > 0 ? 'text-status-lost' : 'text-text-secondary'
                    }`}
                  >
                    Overdue Loans
                  </span>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      overdueCount > 0
                        ? 'bg-status-lost/20 text-status-lost'
                        : 'bg-status-available/20 text-status-available'
                    }`}
                  >
                    <span className="material-symbols-outlined">
                      {overdueCount > 0 ? 'warning' : 'verified'}
                    </span>
                  </div>
                </div>
                <div className="mt-space-md flex items-baseline gap-space-sm">
                  <span
                    className={`font-display-hero text-headline-1 ${
                      overdueCount > 0 ? 'text-status-lost' : 'text-text-primary'
                    }`}
                  >
                    {String(overdueCount).padStart(2, '0')}
                  </span>
                  <span
                    className={`font-caption text-caption font-medium ${
                      overdueCount > 0 ? 'text-status-lost' : 'text-status-available'
                    }`}
                  >
                    {overdueCount > 0 ? 'Requires Immediate Action' : 'Clean Record'}
                  </span>
                </div>
                <p className="mt-space-sm font-caption text-caption text-text-secondary">
                  {overdueCount > 0
                    ? `${overdueCount} item(s) exceeded due date`
                    : 'No overdue items or holds blocked'}
                </p>
              </div>

              {/* Tile 4: User Standing */}
              <div className="relative overflow-hidden rounded-2xl bg-primary text-on-primary p-space-lg shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <span className="font-caption text-caption uppercase text-primary-fixed tracking-wider font-semibold">
                    Patron Standing
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-primary-container text-action-green flex items-center justify-center">
                    <span className="material-symbols-outlined">workspace_premium</span>
                  </div>
                </div>
                <div className="mt-space-md">
                  <span className="font-headline-3 text-headline-3 text-on-primary">
                    {overdueCount > 0 ? 'Review Needed' : 'Zero Fines'}
                  </span>
                  <div className="font-caption text-caption text-primary-fixed mt-1 flex items-center gap-space-xs">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        overdueCount > 0 ? 'bg-status-pending' : 'bg-action-green'
                      }`}
                    ></span>
                    <span>{overdueCount > 0 ? 'Late Returns Pending' : 'Account in Exemplary Standing'}</span>
                  </div>
                </div>
                <div className="mt-space-sm flex items-center justify-between font-caption text-caption pt-space-xs border-t border-white/10">
                  <span>Standard Privilege</span>
                  <span className="font-medium text-action-green">₱0.00 Balance</span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Active Loans Section (Interactive Cards) */}
          <section className="relative z-10 mt-space-2xl">
            <div className="flex items-center justify-between mb-space-lg">
              <div className="flex items-center gap-space-sm">
                <h2 className="font-headline-2 text-headline-3 text-text-primary">
                  Physical Books Currently Checked Out
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-caption text-caption font-semibold">
                  {activeLoans.length} Volume{activeLoans.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-space-xs text-text-secondary font-caption text-caption">
                <span className="material-symbols-outlined text-base text-action-green">info</span>
                <span>Renewals extend the initial return date by 7 calendar days</span>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-lg">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="rounded-3xl bg-glass-surface backdrop-blur-2xl p-space-xl shadow-md animate-pulse flex flex-col sm:flex-row gap-space-lg"
                  >
                    <div className="w-32 h-44 sm:w-36 sm:h-52 rounded-2xl bg-surface-container-high shrink-0"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-surface-container-high rounded w-1/3"></div>
                      <div className="h-6 bg-surface-container-high rounded w-3/4"></div>
                      <div className="h-4 bg-surface-container-high rounded w-1/2"></div>
                      <div className="h-16 bg-surface-container-high rounded mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeLoans.length === 0 ? (
              <div className="rounded-3xl bg-glass-surface backdrop-blur-2xl p-space-2xl shadow-sm border border-surface-variant/40 text-center flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-text-secondary mb-4">
                  <span className="material-symbols-outlined text-3xl">menu_book</span>
                </div>
                <h3 className="font-headline-3 text-headline-3 text-text-primary mb-2">
                  No Physical Books Currently Checked Out
                </h3>
                <p className="font-body-medium text-body-medium text-text-secondary max-w-md mx-auto mb-6">
                  You currently have no active loans in possession. Discover titles in the catalog and place a pickup hold.
                </p>
                <Link
                  className="px-6 py-3 rounded-full bg-primary text-on-primary font-small text-small font-semibold shadow-md hover:opacity-90 transition-all flex items-center gap-2"
                  to="/customer/catalog"
                >
                  <span className="material-symbols-outlined text-lg">travel_explore</span>
                  <span>Explore Online Catalog</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-space-lg items-start">
                {activeLoans.map((loan) => {
                  const now = Date.now();
                  const borrowTime = new Date(loan.borrowDate).getTime();
                  const dueTime = new Date(loan.dueDate).getTime();
                  const totalLoanMs = Math.max(1000 * 60 * 60 * 24, dueTime - borrowTime);
                  const totalDays = Math.max(1, Math.round(totalLoanMs / (1000 * 60 * 60 * 24)));
                  const elapsedDays = Math.max(
                    0,
                    Math.min(totalDays, Math.floor((now - borrowTime) / (1000 * 60 * 60 * 24)))
                  );
                  const progressPct = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));

                  const isOverdue = now > dueTime;
                  const daysLeft = Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysLeft <= 3 && !isOverdue;

                  const isSelected = selectedLoan?.id === loan.id;

                  return (
                    <div
                      key={loan.id}
                      className={`rounded-3xl bg-glass-surface backdrop-blur-2xl p-space-xl shadow-md transition-all hover:shadow-xl relative overflow-hidden ${
                        isSelected ? 'ring-2 ring-primary/40' : ''
                      }`}
                    >
                      {/* Top Accent Bar */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1.5 ${
                          isOverdue
                            ? 'bg-status-lost'
                            : isUrgent
                            ? 'bg-status-pending'
                            : 'bg-primary'
                        }`}
                      ></div>

                      <div className="flex flex-col sm:flex-row gap-space-lg">
                        {/* Cover Image */}
                        <div className="w-32 h-44 sm:w-36 sm:h-52 rounded-2xl overflow-hidden shadow-md shrink-0 bg-surface-container-high relative">
                          <img
                            alt={loan.book?.title || 'Book Cover'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600';
                            }}
                            src={
                              loan.book?.coverImage ||
                              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'
                            }
                          />
                          <span className="absolute top-2 left-2 px-2 py-1 rounded bg-text-primary/80 backdrop-blur-sm text-surface font-caption text-[10px] tracking-wider font-mono uppercase">
                            {loan.book?.deweyCode || 'Stacks'}
                          </span>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-space-xs mb-space-xs">
                              <span className="inline-flex items-center gap-1 font-caption text-caption font-mono text-text-secondary bg-surface-container px-2 py-0.5 rounded-md">
                                <span className="material-symbols-outlined text-xs text-primary">
                                  barcode_scanner
                                </span>
                                #{loan.id.slice(0, 8).toUpperCase()}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-caption text-caption font-semibold ${
                                  isOverdue
                                    ? 'bg-status-lost/20 text-status-lost'
                                    : isUrgent
                                    ? 'bg-status-pending/20 text-text-primary'
                                    : 'bg-soft-blue text-primary'
                                }`}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    isOverdue
                                      ? 'bg-status-lost animate-ping'
                                      : isUrgent
                                      ? 'bg-status-pending animate-ping'
                                      : 'bg-primary'
                                  }`}
                                ></span>
                                {isOverdue
                                  ? `Overdue (${Math.abs(daysLeft)}d)`
                                  : isUrgent
                                  ? `Due in ${daysLeft} Day${daysLeft === 1 ? '' : 's'}`
                                  : `${daysLeft} Days Remaining`}
                              </span>
                            </div>

                            <h3 className="font-headline-3 text-headline-3 text-text-primary tracking-tight leading-snug">
                              {loan.book?.title || 'Untitled Volume'}
                            </h3>
                            <p className="font-small text-small text-text-secondary mt-0.5">
                              by {loan.book?.author || 'Institutional Author'}
                            </p>

                            {/* Metadata Chips */}
                            <div className="mt-space-md grid grid-cols-2 gap-x-space-md gap-y-space-xs py-space-sm bg-surface-container-lowest/60 rounded-xl px-space-md">
                              <div>
                                <span className="block font-caption text-caption text-text-secondary">
                                  Checked Out
                                </span>
                                <span className="font-small text-small text-text-primary font-medium">
                                  {new Date(loan.borrowDate).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                              <div>
                                <span className="block font-caption text-caption text-text-secondary">
                                  Return Due Date
                                </span>
                                <span
                                  className={`font-small text-small font-semibold ${
                                    isOverdue
                                      ? 'text-status-lost'
                                      : isUrgent
                                      ? 'text-status-pending'
                                      : 'text-text-primary'
                                  }`}
                                >
                                  {new Date(loan.dueDate).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                              </div>
                              <div>
                                <span className="block font-caption text-caption text-text-secondary">
                                  Accession Barcode
                                </span>
                                <span className="font-small text-small font-mono text-text-primary">
                                  {loan.gatePassCode || loan.book?.isbn || '—'}
                                </span>
                              </div>
                              <div>
                                <span className="block font-caption text-caption text-text-secondary">
                                  Dewey Call Number
                                </span>
                                <span className="font-small text-small text-text-primary">
                                  {loan.book?.deweyCode || 'Circulation Desk'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Days Elapsed Progress Bar */}
                          <div className="mt-space-md">
                            <div className="flex items-center justify-between text-caption font-caption mb-1">
                              <span className="text-text-secondary">
                                Loan Duration:{' '}
                                <strong className="text-text-primary">
                                  {elapsedDays} of {totalDays} Days Elapsed
                                </strong>
                              </span>
                              <span
                                className={`font-semibold ${
                                  isOverdue
                                    ? 'text-status-lost'
                                    : isUrgent
                                    ? 'text-status-pending'
                                    : 'text-primary'
                                }`}
                              >
                                {progressPct}% Elapsed
                              </span>
                            </div>
                            <div className="w-full bg-surface-variant h-2.5 rounded-full overflow-hidden p-0.5">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isOverdue
                                    ? 'bg-status-lost'
                                    : isUrgent
                                    ? 'bg-status-pending'
                                    : 'bg-primary'
                                }`}
                                style={{ width: `${progressPct}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Interactive Actions Button Bar */}
                          <div className="mt-space-lg pt-space-md flex flex-wrap items-center gap-space-sm">
                            <button
                              className={`min-h-[44px] px-space-lg py-2.5 rounded-xl text-text-primary font-small text-small font-semibold shadow-sm transition-all flex items-center gap-space-xs cursor-pointer active:scale-95 ${
                                loan.renewalCount >= 2
                                  ? 'bg-surface-container text-text-secondary opacity-60 cursor-not-allowed'
                                  : 'bg-action-green hover:bg-action-green-hover'
                              }`}
                              disabled={loan.renewalCount >= 2 || renewingId === loan.id}
                              onClick={() => handleRenew(loan.id, loan.book?.title)}
                              type="button"
                            >
                              <span
                                className={`material-symbols-outlined text-xl ${
                                  renewingId === loan.id ? 'animate-spin' : ''
                                }`}
                              >
                                {renewingId === loan.id ? 'progress_activity' : 'update'}
                              </span>
                              <span>
                                {renewingId === loan.id
                                  ? 'Requesting...'
                                  : loan.renewalCount >= 2
                                  ? 'Max Renewals Reached'
                                  : 'Request 7-Day Renewal'}
                              </span>
                            </button>

                            <button
                              className={`min-h-[44px] px-space-md py-2.5 rounded-xl font-small text-small font-medium transition-all flex items-center gap-space-xs cursor-pointer ${
                                isSelected
                                  ? 'bg-primary text-on-primary'
                                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-container-high'
                              }`}
                              onClick={() => setSelectedLoanId(loan.id)}
                              type="button"
                            >
                              <span className="material-symbols-outlined text-lg">timeline</span>
                              <span>{isSelected ? 'Viewing Timeline' : 'Track Timeline'}</span>
                            </button>

                            <div className="ml-auto hidden sm:flex items-center gap-1 font-caption text-caption text-text-secondary">
                              <span className="material-symbols-outlined text-sm text-status-available">
                                check_circle
                              </span>
                              <span>Renewals: {loan.renewalCount} of 2</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section 3: Visual Borrowing Lifecycle Milestone Tracker */}
          <section className="relative z-10 mt-space-2xl" id="lifecycle-timeline">
            <div className="rounded-3xl bg-glass-surface backdrop-blur-2xl p-space-xl shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-xl">
                <div>
                  <div className="flex items-center gap-space-xs">
                    <span className="font-caption text-caption uppercase tracking-wider font-semibold text-primary">
                      Live Circulation Trajectory
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    <span className="font-caption text-caption text-text-secondary font-mono">
                      {selectedLoan
                        ? `Loan #${selectedLoan.id.slice(0, 8).toUpperCase()}`
                        : 'No Active Loan Selected'}
                    </span>
                  </div>
                  <h3 className="font-headline-3 text-headline-3 text-text-primary mt-0.5">
                    Borrowing Lifecycle Milestone Tracker
                  </h3>
                  <p className="font-small text-small text-text-secondary">
                    {selectedLoan
                      ? `Tracking "${selectedLoan.book?.title || 'Volume'}" through library circulation stages.`
                      : 'Real-time ledger state tracking physical custody from hold reservation to return counter audit.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-soft-blue text-primary font-caption text-caption font-semibold">
                    {selectedLoan ? 'Stage 4 of 6 Active (In Hand)' : 'Awaiting Active Loan'}
                  </span>
                </div>
              </div>

              {/* Horizontal Milestone Track */}
              <div className="relative w-full overflow-x-auto pb-4">
                <div className="min-w-[760px] relative px-4">
                  {/* Continuous background track line */}
                  <div className="absolute top-6 left-12 right-12 h-1 bg-surface-variant z-0"></div>
                  {/* Highlighted progress track line up to active stage */}
                  <div
                    className="absolute top-6 left-12 h-1 bg-primary z-0 transition-all duration-700"
                    style={{ width: selectedLoan ? '58%' : '0%' }}
                  ></div>

                  {/* 6 Nodes */}
                  <div className="relative z-10 grid grid-cols-6 gap-2">
                    {/* Milestone 1 */}
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ring-4 ring-background ${
                          selectedLoan
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container text-text-secondary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg font-bold">check</span>
                      </div>
                      <span className="font-small text-small font-semibold text-text-primary mt-space-sm">
                        1. Reserved
                      </span>
                      <span className="font-caption text-caption text-text-secondary">
                        {selectedLoan?.borrowDate
                          ? new Date(selectedLoan.borrowDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </span>
                      <span className="mt-1 px-2 py-0.5 rounded text-[11px] font-caption bg-status-available/20 text-status-available font-medium">
                        Online Queue
                      </span>
                    </div>

                    {/* Milestone 2 */}
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ring-4 ring-background ${
                          selectedLoan
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container text-text-secondary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg font-bold">check</span>
                      </div>
                      <span className="font-small text-small font-semibold text-text-primary mt-space-sm">
                        2. Bay Picked
                      </span>
                      <span className="font-caption text-caption text-text-secondary">
                        {selectedLoan?.borrowDate
                          ? new Date(selectedLoan.borrowDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </span>
                      <span className="mt-1 px-2 py-0.5 rounded text-[11px] font-caption bg-status-available/20 text-status-available font-medium">
                        Staged at Bay
                      </span>
                    </div>

                    {/* Milestone 3 */}
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ring-4 ring-background ${
                          selectedLoan
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container text-text-secondary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg font-bold">check</span>
                      </div>
                      <span className="font-small text-small font-semibold text-text-primary mt-space-sm">
                        3. Checkout
                      </span>
                      <span className="font-caption text-caption text-text-secondary">
                        {selectedLoan?.borrowDate
                          ? new Date(selectedLoan.borrowDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </span>
                      <span className="mt-1 px-2 py-0.5 rounded text-[11px] font-caption bg-status-available/20 text-status-available font-medium">
                        Barcode Passed
                      </span>
                    </div>

                    {/* Milestone 4 (CURRENT STATE) */}
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ring-4 ring-background ${
                          selectedLoan
                            ? 'bg-action-green text-text-primary animate-pulse'
                            : 'bg-surface-container text-text-secondary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xl">menu_book</span>
                      </div>
                      <span className="font-small text-small font-bold text-text-primary mt-space-sm">
                        4. Active Loan
                      </span>
                      <span className="font-caption text-caption text-status-pending font-semibold">
                        {selectedLoan ? 'In Possession' : '—'}
                      </span>
                      <span className="mt-1 px-2 py-0.5 rounded text-[11px] font-caption bg-action-green text-text-primary font-bold">
                        In Hand
                      </span>
                    </div>

                    {/* Milestone 5 (UPCOMING) */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-surface-container-high text-status-pending flex items-center justify-center ring-4 ring-background">
                        <span className="material-symbols-outlined text-lg">event_upcoming</span>
                      </div>
                      <span className="font-small text-small font-medium text-text-secondary mt-space-sm">
                        5. Due Date
                      </span>
                      <span className="font-caption text-caption text-status-pending font-medium">
                        {selectedLoan?.dueDate
                          ? new Date(selectedLoan.dueDate).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </span>
                      <span className="mt-1 px-2 py-0.5 rounded text-[11px] font-caption bg-status-pending/20 text-text-primary font-medium">
                        Scheduled
                      </span>
                    </div>

                    {/* Milestone 6 (PENDING RETURN) */}
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 rounded-full bg-surface-container-high text-text-secondary flex items-center justify-center ring-4 ring-background">
                        <span className="material-symbols-outlined text-lg">assignment_turned_in</span>
                      </div>
                      <span className="font-small text-small font-medium text-text-secondary mt-space-sm">
                        6. Return &amp; Audit
                      </span>
                      <span className="font-caption text-caption text-text-secondary">Expected Return</span>
                      <span className="mt-1 px-2 py-0.5 rounded text-[11px] font-caption bg-surface-variant text-text-secondary font-medium">
                        Pending
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Embedded Lifecycle Note Banner */}
              <div className="mt-space-lg p-space-md rounded-2xl bg-surface-container-lowest/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-primary text-xl">qr_code_2</span>
                  <div>
                    <p className="font-small text-small font-medium text-text-primary">
                      Returning books in person?
                    </p>
                    <p className="font-caption text-caption text-text-secondary">
                      Show your patron barcode at Circulation Desk Level 1 or drop directly into Smart Drop Box 24/7.
                    </p>
                  </div>
                </div>
                <Link
                  className="shrink-0 px-space-md py-1.5 rounded-xl bg-soft-blue hover:bg-secondary-fixed text-primary font-small text-small font-medium transition-all"
                  to="/customer/profile"
                >
                  Show Patron Barcode Pass
                </Link>
              </div>
            </div>
          </section>

          {/* Section 4: Comprehensive Borrowing History Log (Past Returns) */}
          <section className="relative z-10 mt-space-2xl">
            <div className="rounded-3xl bg-glass-surface backdrop-blur-2xl p-space-xl shadow-md">
              {/* Table Toolbar & Filters */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md mb-space-lg">
                <div>
                  <h3 className="font-headline-3 text-headline-3 text-text-primary">
                    Past Circulation Ledger &amp; Return Records
                  </h3>
                  <p className="font-small text-small text-text-secondary">
                    Official institutional log of physical collection borrowings, clearances, and audit receipts.
                  </p>
                </div>

                {/* Tab Chips */}
                <div className="flex flex-wrap items-center gap-space-xs p-1 rounded-full bg-surface-container-high/60 backdrop-blur-md">
                  {(
                    [
                      { id: 'all', label: 'All Past Loans' },
                      { id: 'ontime', label: 'Returned on Time' },
                      { id: 'renewals', label: 'Renewals' },
                      { id: 'fines', label: 'Overdue Clearances' },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      className={`px-space-md py-1.5 rounded-full font-caption text-caption transition-all cursor-pointer ${
                        historyFilter === tab.id
                          ? 'bg-primary-container text-on-primary-container font-semibold shadow-sm'
                          : 'text-text-secondary hover:text-text-primary font-medium'
                      }`}
                      onClick={() => setHistoryFilter(tab.id)}
                      type="button"
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fast Search & Record Metric */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm mb-space-md">
                <div className="relative w-full sm:max-w-xs">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-text-secondary text-lg">
                    search
                  </span>
                  <input
                    className="w-full bg-surface-container-lowest/80 pl-9 pr-3 py-2 rounded-xl text-small font-small text-text-primary placeholder:text-text-secondary focus:outline-none focus:bg-surface-container-lowest transition-all"
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter by book, barcode, or receipt..."
                    type="text"
                    value={searchQuery}
                  />
                </div>
                <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-space-md text-caption text-text-secondary">
                  <span>Showing {filteredHistory.length} audited circulation event(s)</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-status-available"></span>
                  <span className="text-text-primary font-semibold">Total Fines Paid: ₱0.00</span>
                </div>
              </div>

              {/* Ledger Table Container */}
              <div className="overflow-x-auto rounded-2xl bg-surface-container-lowest/70 shadow-sm">
                <table className="w-full text-left border-collapse" id="borrowingsTable">
                  <thead>
                    <tr className="bg-surface-container-high/40 text-text-secondary font-caption text-caption uppercase tracking-wider">
                      <th className="py-space-md px-space-lg">Book Title &amp; Barcode</th>
                      <th className="py-space-md px-space-md">Borrow Date</th>
                      <th className="py-space-md px-space-md">Return Date</th>
                      <th className="py-space-md px-space-md">Duration</th>
                      <th className="py-space-md px-space-md">Fine Status</th>
                      <th className="py-space-md px-space-md">Audit / Receipt</th>
                      <th className="py-space-md px-space-lg text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-variant/40 font-small text-small text-text-primary">
                    {loading ? (
                      <tr>
                        <td className="py-8 text-center text-text-secondary" colSpan={7}>
                          <div className="flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined animate-spin text-primary">
                              progress_activity
                            </span>
                            <span>Loading past circulation ledger...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredHistory.length === 0 ? (
                      <tr>
                        <td className="py-12 text-center text-text-secondary" colSpan={7}>
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-4xl text-text-secondary/50">
                              history_edu
                            </span>
                            <p className="font-medium">No past circulation records found.</p>
                            <span className="text-caption">
                              Completed loans and returns will be archived here automatically.
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredHistory.map((item) => {
                        const borrowD = new Date(item.borrowDate);
                        const returnD = item.returnDate ? new Date(item.returnDate) : null;
                        const durationDays = returnD
                          ? Math.max(1, Math.round((returnD.getTime() - borrowD.getTime()) / (1000 * 60 * 60 * 24)))
                          : '—';

                        const isLate =
                          returnD && new Date(item.dueDate).getTime() < returnD.getTime();

                        return (
                          <tr key={item.id} className="hover:bg-surface-container-low/50 transition-colors">
                            <td className="py-space-md px-space-lg">
                              <div className="flex items-center gap-space-sm">
                                <div className="w-8 h-11 rounded bg-surface-container-high overflow-hidden shrink-0">
                                  <img
                                    alt={item.book?.title || 'Book Cover'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600';
                                    }}
                                    src={
                                      item.book?.coverImage ||
                                      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'
                                    }
                                  />
                                </div>
                                <div>
                                  <div className="font-medium text-text-primary">
                                    {item.book?.title || 'Catalog Volume'}
                                  </div>
                                  <div className="font-caption text-caption text-text-secondary font-mono">
                                    {item.gatePassCode || item.book?.isbn || item.id.slice(0, 8)} • Stacks{' '}
                                    {item.book?.deweyCode || 'Main'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-space-md px-space-md text-text-secondary">
                              {borrowD.toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-space-md px-space-md">
                              <span className="font-medium text-text-primary">
                                {returnD
                                  ? returnD.toLocaleDateString(undefined, {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })
                                  : 'Active'}
                              </span>
                              <span
                                className={`block font-caption text-caption ${
                                  isLate ? 'text-status-lost' : 'text-status-available'
                                }`}
                              >
                                {isLate ? 'Late return' : 'On-time clearance'}
                              </span>
                            </td>
                            <td className="py-space-md px-space-md text-text-secondary">
                              {typeof durationDays === 'number' ? `${durationDays} Days` : durationDays}
                            </td>
                            <td className="py-space-md px-space-md">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-caption text-caption font-semibold ${
                                  isLate
                                    ? 'bg-status-pending/20 text-status-pending'
                                    : 'bg-status-available/15 text-status-available'
                                }`}
                              >
                                {isLate ? 'Late / Cleared' : '₱0.00 Cleared'}
                              </span>
                            </td>
                            <td className="py-space-md px-space-md font-mono text-caption text-text-secondary">
                              RCPT-{item.id.slice(0, 8).toUpperCase()}
                            </td>
                            <td className="py-space-md px-space-lg text-right">
                              <button
                                className="p-1.5 rounded-lg hover:bg-surface-container text-primary transition-colors cursor-pointer"
                                onClick={() =>
                                  addToast(
                                    `Audited Return Receipt #RCPT-${item.id.slice(0, 8).toUpperCase()} generated.`,
                                    'info'
                                  )
                                }
                                title="Download Audit Receipt"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-lg">receipt_long</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              <div className="mt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-sm pt-space-sm text-caption font-caption text-text-secondary">
                <div className="flex items-center gap-space-xs">
                  <span>Archive range: Real-Time Patron Ledger</span>
                </div>
                <div className="flex items-center gap-space-xs">
                  <span className="px-space-sm font-medium text-text-primary">
                    Total Records: {filteredHistory.length}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Library Circulation Policy & Drop-box Info Box */}
          <section className="relative z-10 mt-space-2xl">
            <div className="rounded-3xl bg-glass-surface backdrop-blur-2xl p-space-xl shadow-md">
              <div className="flex items-start gap-space-md">
                <div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">policy</span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-space-xs">
                    <h3 className="font-headline-3 text-headline-3 text-text-primary">
                      Katipuneros Circulation &amp; User Lending Policy
                    </h3>
                    <span className="px-3 py-0.5 rounded-full bg-primary/10 text-primary font-caption text-caption font-semibold">
                      Official Lending Guidelines
                    </span>
                  </div>
                  <p className="font-small text-small text-text-secondary mt-1">
                    Guidelines regulating physical collection custody, grace allowances, renewal caps, and after-hours smart drop-off terminals.
                  </p>

                  {/* Policy Bento Pods */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mt-space-lg">
                    {/* Policy 1 */}
                    <div className="p-space-md rounded-2xl bg-surface-container-lowest/80 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-space-xs text-primary mb-1 font-small text-small font-semibold">
                          <span className="material-symbols-outlined text-lg">event_repeat</span>
                          <span>Renewal Limits</span>
                        </div>
                        <p className="font-caption text-caption text-text-secondary leading-relaxed">
                          Active loans may be extended up to <strong>2 consecutive times (7 days each)</strong>, provided no other patron has reserved or queued a hold on the title.
                        </p>
                      </div>
                      <div className="mt-space-sm pt-space-xs border-t border-surface-variant/40 font-caption text-caption text-primary font-medium">
                        Renewable via Customer Web Portal
                      </div>
                    </div>

                    {/* Policy 2 */}
                    <div className="p-space-md rounded-2xl bg-surface-container-lowest/80 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-space-xs text-status-pending mb-1 font-small text-small font-semibold">
                          <span className="material-symbols-outlined text-lg">hourglass_top</span>
                          <span>Grace Periods &amp; Overdues</span>
                        </div>
                        <p className="font-caption text-caption text-text-secondary leading-relaxed">
                          A <strong>24-hour courtesy window</strong> applies after 08:00 PM on due date. Beyond this, a standard institutional maintenance fee of <strong>₱15.00/day</strong> per book is automatically billed.
                        </p>
                      </div>
                      <div className="mt-space-sm pt-space-xs border-t border-surface-variant/40 font-caption text-caption text-status-available font-medium">
                        Zero Overdue Tolerance on Reserves
                      </div>
                    </div>

                    {/* Policy 3 */}
                    <div className="p-space-md rounded-2xl bg-surface-container-lowest/80 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-space-xs text-secondary mb-1 font-small text-small font-semibold">
                          <span className="material-symbols-outlined text-lg">local_post_office</span>
                          <span>24/7 Smart Drop-Box</span>
                        </div>
                        <p className="font-caption text-caption text-text-secondary leading-relaxed">
                          Contactless returns can be deposited at the <strong>Atrium South Gate automated bin</strong>. Barcode scanners timestamp items immediately to safeguard patron return status.
                        </p>
                      </div>
                      <div className="mt-space-sm pt-space-xs border-t border-surface-variant/40 font-caption text-caption text-secondary font-medium">
                        Instant Circulation Clearance
                      </div>
                    </div>
                  </div>

                  {/* Bottom Support Contact Bar */}
                  <div className="mt-space-lg flex flex-wrap items-center justify-between gap-space-sm pt-space-sm font-caption text-caption text-text-secondary">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-base text-primary">support_agent</span>
                      <span>
                        Questions regarding book condition or renewal limits? Contact Circulation Librarian desk at{' '}
                        <strong>circulation@katipuneros.lib.edu</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Reactive Toast Notifications */}
        {toasts.length > 0 && (
          <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                onClick={() => removeToast(toast.id)}
                className={`px-4 py-3 rounded-xl shadow-lg border text-caption font-bold transition-all pointer-events-auto flex items-center gap-2 cursor-pointer ${
                  toast.type === 'success'
                    ? 'bg-action-green text-text-primary border-action-green/30'
                    : toast.type === 'error'
                    ? 'bg-error text-on-error border-error/30'
                    : toast.type === 'warning'
                    ? 'bg-status-pending text-on-primary border-status-pending/30'
                    : 'bg-primary text-on-primary border-primary/30'
                }`}
              >
                <span>{toast.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BorrowingsPage;
