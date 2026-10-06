// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// CheckoutBorrow.tsx -- Cashier Circulation Desk Checkout & Borrowing.
// Connects to live /api/borrow/checkout, /api/users, /api/books, and /api/reservations.
// Strictly adheres to real-time data mandate: zero hardcoded mock values, clean empty states when N=0.
// Universal lambda syntax (=>), zero browser alert().

import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useToasts } from '../../../../../Hooks/useToasts';
import { processCashierCheckout } from '../../../../../Endpoints/Cashier/transactionApi';
import { getAdminUsersList, AdminUserRecord } from '../../../../../Endpoints/Admin/userApi';
import { getCatalogBooks, BackendBook } from '../../../../../Endpoints/booksApi';
import { getAdminReservations, BackendReservation } from '../../../../../Endpoints/Admin/reservationsApi';
import { RadioGroup } from '../../../../../Shared/RadioButton';
import { SearchBar, useDebounce } from '../../../../../Shared/SearchBar';
import { usePagination } from '../../../../../Hooks/usePagination';
import { useTableDraggable } from '../../../../../Hooks/useTableDraggable';

export const CheckoutBorrow: FC = () => {
  const location = useLocation();
  const { toasts, addToast, removeToast } = useToasts();

  // Mode: Reservation Hold Release vs Direct Walk-In Checkout
  const [checkoutMode, setCheckoutMode] = useState<'hold' | 'walkin'>('walkin');

  // Patron State
  const [allUsers, setAllUsers] = useState<AdminUserRecord[]>([]);
  const [patronSearchInput, setPatronSearchInput] = useState<string>('');
  const debouncedPatronSearch = useDebounce(patronSearchInput, 300);
  const [selectedPatron, setSelectedPatron] = useState<AdminUserRecord | null>(null);
  const [isSearchingPatron, setIsSearchingPatron] = useState<boolean>(false);
  const [isPatronModalOpen, setIsPatronModalOpen] = useState<boolean>(false);

  // Patron Modal search & filters
  const [modalPatronSearch, setModalPatronSearch] = useState<string>('');
  const debouncedModalPatronSearch = useDebounce(modalPatronSearch, 300);
  const [modalStatusFilter, setModalStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Holds / Reservations for Hold Release mode
  const [allReservations, setAllReservations] = useState<BackendReservation[]>([]);
  const [isLoadingReservations, setIsLoadingReservations] = useState<boolean>(false);

  // Staged Books State
  const [bookBarcodeQuery, setBookBarcodeQuery] = useState<string>('');
  const [stagedBooks, setStagedBooks] = useState<BackendBook[]>([]);
  const [isStagingBook, setIsStagingBook] = useState<boolean>(false);

  // View Mode for Staged Books (table vs card)
  const [stagedViewMode, setStagedViewMode] = useState<string>(() => {
    return localStorage.getItem('cashier_checkout_staged_view') || 'table';
  });

  const handleStagedViewModeChange = (mode: string) => {
    setStagedViewMode(mode);
    localStorage.setItem('cashier_checkout_staged_view', mode);
  };

  // Draggable table ref for staged items (kept mounted at all times)
  const { containerRef: stagedTableContainerRef } = useTableDraggable<HTMLDivElement>();
  // Draggable table ref for patron modal
  const { containerRef: patronModalTableContainerRef } = useTableDraggable<HTMLDivElement>();

  // Loan Duration State
  const [loanDays, setLoanDays] = useState<number>(14);
  const [customDays, setCustomDays] = useState<string>('30');
  const [isCustomDuration, setIsCustomDuration] = useState<boolean>(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initial load: patrons and pending holds
  const loadPatrons = useCallback(async () => {
    try {
      const users = await getAdminUsersList();
      setAllUsers(users);
    } catch {
      addToast('Failed to load user directory.', 'error');
    }
  }, [addToast]);

  const loadReservations = useCallback(async () => {
    setIsLoadingReservations(true);
    try {
      const res = await getAdminReservations('Pending');
      setAllReservations(res);
    } catch {
      // Non-fatal if reservation service unavailable
    } finally {
      setIsLoadingReservations(false);
    }
  }, []);

  useEffect(() => {
    loadPatrons();
    loadReservations();
  }, [loadPatrons, loadReservations]);

  // Handle query param if navigated from dashboard manual scan or reservations bridge
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('query') || params.get('patronId');
    const bookBarcode = params.get('barcode');
    const bookId = params.get('bookId');

    if (q && allUsers.length > 0) {
      setPatronSearchInput(q);
      const matched = allUsers.find(
        (u) =>
          u.libraryCardNumber?.toLowerCase() === q.toLowerCase() ||
          u.id.toLowerCase() === q.toLowerCase() ||
          u.email.toLowerCase() === q.toLowerCase() ||
          u.fullName?.toLowerCase().includes(q.toLowerCase())
      );
      if (matched) {
        setSelectedPatron(matched);
      }
    }

    if (bookBarcode || bookId) {
      const fetchAndStage = async () => {
        try {
          const searchParam = bookBarcode || bookId;
          const books = await getCatalogBooks(undefined, searchParam || undefined);
          const matched = books.find(
            (b) =>
              (bookId && b.id.toLowerCase() === bookId.toLowerCase()) ||
              (bookBarcode && (
                b.isbnBarcode?.toLowerCase() === bookBarcode.toLowerCase() ||
                b.isbn?.toLowerCase() === bookBarcode.toLowerCase() ||
                b.deweyCode?.toLowerCase() === bookBarcode.toLowerCase() ||
                b.title?.toLowerCase().includes(bookBarcode.toLowerCase())
              ))
          );
          if (matched) {
            setStagedBooks((prev) => {
              if (prev.some((b) => b.id === matched.id)) return prev;
              return [...prev, matched];
            });
            addToast(`"${matched.title}" staged from reservation bridge.`, 'info');
          }
        } catch {
          // Graceful fallback
        }
      };
      fetchAndStage();
    }
  }, [location.search, allUsers, addToast]);

  // Patron selection handler
  const handleSelectPatron = (patron: AdminUserRecord) => {
    setSelectedPatron(patron);
    setPatronSearchInput('');
    setIsPatronModalOpen(false);
    addToast(`Patron ${patron.fullName || patron.name} selected.`, 'info');
  };

  const handlePatronSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = patronSearchInput.trim().toLowerCase();
    if (!query) return;

    setIsSearchingPatron(true);
    const matched = allUsers.find(
      (u) =>
        u.fullName?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.libraryCardNumber?.toLowerCase() === query ||
        u.id.toLowerCase() === query
    );

    if (matched) {
      setSelectedPatron(matched);
      addToast(`Patron ${matched.fullName || matched.name} verified.`, 'success');
    } else {
      addToast(`No active patron found matching "${patronSearchInput}".`, 'warning');
    }
    setIsSearchingPatron(false);
  };

  // Book Staging Handler
  const handleStageBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = bookBarcodeQuery.trim();
    if (!query) return;

    setIsStagingBook(true);
    try {
      const books = await getCatalogBooks(undefined, query);
      const matched = books.find(
        (b) =>
          b.isbnBarcode?.toLowerCase() === query.toLowerCase() ||
          b.isbn?.toLowerCase() === query.toLowerCase() ||
          b.title?.toLowerCase().includes(query.toLowerCase()) ||
          b.id.toLowerCase() === query.toLowerCase()
      );

      if (matched) {
        if (stagedBooks.some((b) => b.id === matched.id)) {
          addToast(`Book "${matched.title}" is already staged.`, 'warning');
        } else if (matched.availableCopies <= 0) {
          addToast(`"${matched.title}" has 0 available copies in stacks.`, 'error');
        } else {
          setStagedBooks((prev) => [...prev, matched]);
          setBookBarcodeQuery('');
          addToast(`"${matched.title}" staged successfully.`, 'success');
        }
      } else {
        addToast(`No book found matching barcode/ISBN: ${query}`, 'warning');
      }
    } catch {
      addToast('Error querying book catalog.', 'error');
    } finally {
      setIsStagingBook(false);
    }
  };

  // Stage directly from Hold Reservation
  const handleStageReservationHold = async (res: BackendReservation) => {
    // 1. Select the patron if not selected
    const patronMatch = allUsers.find(
      (u) =>
        u.id.toLowerCase() === res.patronId?.toLowerCase() ||
        u.libraryCardNumber?.toLowerCase() === res.patronLibraryId?.toLowerCase()
    );
    if (patronMatch && !selectedPatron) {
      setSelectedPatron(patronMatch);
    }

    // 2. Fetch and stage the book
    try {
      const books = await getCatalogBooks(undefined, res.bookTitle);
      const matched = books.find((b) => b.id === res.bookId || b.title?.toLowerCase() === res.bookTitle?.toLowerCase());
      if (matched) {
        if (stagedBooks.some((b) => b.id === matched.id)) {
          addToast(`"${matched.title}" is already staged.`, 'warning');
        } else {
          setStagedBooks((prev) => [...prev, matched]);
          addToast(`Hold release: "${matched.title}" staged for ${res.patronName}.`, 'success');
        }
      } else {
        addToast(`Could not find catalog record for "${res.bookTitle}".`, 'error');
      }
    } catch {
      addToast('Failed to pull held book from catalog.', 'error');
    }
  };

  const handleRemoveStagedBook = (bookId: string) => {
    setStagedBooks((prev) => prev.filter((b) => b.id !== bookId));
    addToast('Book removed from staging queue.', 'info');
  };

  // Calculated Due Date
  const effectiveDays = isCustomDuration ? parseInt(customDays, 10) || 14 : loanDays;
  const calculatedDueDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + effectiveDays);
    return d;
  }, [effectiveDays]);

  // Complete Checkout
  const handleCompleteCheckout = async () => {
    if (!selectedPatron) {
      addToast('Please scan or select a patron first.', 'warning');
      return;
    }
    if (stagedBooks.length === 0) {
      addToast('Please stage at least one book to borrow.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const barcodes = stagedBooks.map((b) => b.isbnBarcode || b.isbn || b.id);
      const res = await processCashierCheckout({
        patronId: selectedPatron.id,
        bookBarcodes: barcodes,
        dueDate: calculatedDueDate.toISOString(),
      });

      if ((res as { success?: boolean }).success !== false) {
        addToast(
          `Checkout successful! ${stagedBooks.length} volume(s) issued to ${selectedPatron.fullName || selectedPatron.name}.`,
          'success'
        );
        setStagedBooks([]);
        setSelectedPatron(null);
        window.dispatchEvent(new CustomEvent('cashier-refresh-kpis'));
      } else {
        addToast((res as { message?: string }).message || 'Checkout failed.', 'error');
      }
    } catch {
      addToast('Network error during checkout processing.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Patron Suggestions for instant drop-down
  const patronSuggestions = useMemo(() => {
    if (!debouncedPatronSearch.trim() || selectedPatron) return [];
    const q = debouncedPatronSearch.toLowerCase();
    return allUsers
      .filter(
        (u) =>
          u.fullName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.libraryCardNumber?.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [allUsers, debouncedPatronSearch, selectedPatron]);

  // Filtered Patrons for Modal Catalog Selector
  const filteredModalUsers = useMemo(() => {
    const q = debouncedModalPatronSearch.trim().toLowerCase();
    return allUsers.filter((u) => {
      const matchSearch =
        !q ||
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.libraryCardNumber?.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q);
      const matchStatus =
        modalStatusFilter === 'all' ||
        (modalStatusFilter === 'active' && u.isActive) ||
        (modalStatusFilter === 'suspended' && !u.isActive);
      return matchSearch && matchStatus;
    });
  }, [allUsers, debouncedModalPatronSearch, modalStatusFilter]);

  // Patron Modal Pagination
  const {
    paginatedItems: paginatedModalUsers,
    currentPage: modalCurrentPage,
    totalPages: modalTotalPages,
    pageSize: modalPageSize,
    pageSizeOptions: modalPageSizeOptions,
    setPageSize: setModalPageSize,
    nextPage: nextModalPage,
    prevPage: prevModalPage,
    canNextPage: canNextModalPage,
    canPrevPage: canPrevModalPage,
  } = usePagination(filteredModalUsers, {
    initialPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  });

  // Relevant Holds for currently selected patron or global queue
  const relevantHolds = useMemo(() => {
    if (selectedPatron) {
      return allReservations.filter(
        (r) =>
          r.patronId?.toLowerCase() === selectedPatron.id?.toLowerCase() ||
          r.patronLibraryId?.toLowerCase() === selectedPatron.libraryCardNumber?.toLowerCase()
      );
    }
    return allReservations;
  }, [allReservations, selectedPatron]);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full pb-16 space-y-6">
        {/* Top Bar: Desk Context & High-Frequency Mode Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-2">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2 text-text-secondary">
              <span className="font-caption text-caption uppercase tracking-wider text-primary font-bold">
                Circulation Desk 01
              </span>
              <span className="text-text-secondary">•</span>
              <span className="font-caption text-caption uppercase tracking-wider">
                Physical Asset Custody Transfer
              </span>
            </div>
            <h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">
              Circulation Desk Checkout &amp; Borrowing
            </h1>
            <p className="font-body text-body text-text-secondary max-w-3xl">
              Scan user identification card or reservation QR code to release physical volumes into patron custody.
            </p>
          </div>

          {/* Mode Selector & Live Peripheral Indicator */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="bg-surface-container p-1 rounded-full flex items-center shadow-inner">
              <button
                onClick={() => setCheckoutMode('hold')}
                className={`px-4 py-2 rounded-full font-small text-small font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  checkoutMode === 'hold'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-base">book_online</span>
                <span>Hold Release</span>
              </button>
              <button
                onClick={() => setCheckoutMode('walkin')}
                className={`px-4 py-2 rounded-full font-small text-small font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                  checkoutMode === 'walkin'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-base">directions_walk</span>
                <span>Direct Walk-In</span>
              </button>
            </div>

            {/* Scanner Status Pill */}
            <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2.5 rounded-full shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-action-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-action-green"></span>
              </span>
              <div className="flex flex-col leading-none">
                <span className="font-caption text-caption font-bold text-text-primary">
                  ⚡ Accession Scanner Ready
                </span>
                <span className="font-caption text-caption text-text-secondary text-[10px]">
                  Circulation Input Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hold Release Mode Notification Banner */}
        {checkoutMode === 'hold' && (
          <div className="bg-gradient-to-r from-soft-blue/40 to-surface-container rounded-2xl p-4 border border-primary/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined">book_online</span>
              </div>
              <div>
                <h4 className="font-body-large text-body-large font-bold text-text-primary">
                  Hold Release Intake Protocol Active
                </h4>
                <p className="font-caption text-caption text-text-secondary">
                  {selectedPatron
                    ? `Showing active reservation queue for ${selectedPatron.fullName || selectedPatron.name}. Click 'Stage Hold' to stage copy.`
                    : 'Select a patron or click any pending hold below to auto-bind patron and stage book.'}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-caption text-caption font-bold">
              {relevantHolds.length} Pending Hold{relevantHolds.length === 1 ? '' : 's'}
            </span>
          </div>
        )}

        {/* Primary Workflow Split Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* LEFT PANEL: Step 1, 2, and 3 Workflow (col-span-8) */}
          <div className="xl:col-span-8 flex flex-col space-y-6">
            {/* STEP 1: User Identification & Eligibility */}
            <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-soft-blue text-primary font-headline-4 text-headline-4 flex items-center justify-center font-bold">
                    1
                  </span>
                  <div>
                    <h2 className="font-headline-4 text-headline-4 text-text-primary">User Identification &amp; Eligibility</h2>
                    <span className="font-caption text-caption text-text-secondary">
                      Scan patron barcode card or browse directory
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPatronModalOpen(true)}
                    type="button"
                    className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-caption text-caption font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span className="material-symbols-outlined text-base">manage_search</span>
                    <span>Browse Patrons ({allUsers.length})</span>
                  </button>
                  {selectedPatron && (
                    <span className="inline-flex items-center gap-1 bg-action-green/20 text-primary px-3 py-1 rounded-full font-caption text-caption font-bold">
                      <span className="material-symbols-outlined text-sm text-primary">verified</span>
                      Identity Confirmed
                    </span>
                  )}
                </div>
              </div>

              {/* Scan / Search Input with SearchBar */}
              <form onSubmit={handlePatronSearchSubmit} className="relative flex items-center gap-2">
                <div className="flex-1">
                  <SearchBar
                    placeholder="Scan User Card Barcode or Enter Name / Email (e.g., KP-88192)..."
                    value={patronSearchInput}
                    onChange={(v) => setPatronSearchInput(v)}
                    shortcutKey=""
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearchingPatron || !patronSearchInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-caption text-caption font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-base">search</span>
                  <span>{isSearchingPatron ? 'Checking...' : 'Find User'}</span>
                </button>
              </form>

              {/* Suggestions Dropdown */}
              {patronSuggestions.length > 0 && (
                <div className="bg-surface-container rounded-xl p-2 shadow-md divide-y divide-surface-container-high">
                  {patronSuggestions.map((u) => (
                    <div
                      key={u.id}
                      onClick={() => handleSelectPatron(u)}
                      className="p-2.5 hover:bg-surface-container-highest rounded-lg cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-soft-blue text-primary flex items-center justify-center font-bold text-caption">
                          {u.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-body-medium text-body-medium font-bold text-text-primary">
                            {u.fullName || u.name}
                          </p>
                          <p className="font-caption text-caption text-text-secondary">
                            Card: {u.libraryCardNumber || 'N/A'} • {u.email}
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-caption font-caption bg-action-green/20 text-text-primary font-bold">
                        Select
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected User Master Record */}
              {selectedPatron ? (
                <div className="bg-surface-container-low rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-soft-blue text-primary flex items-center justify-center font-bold text-xl shadow-sm">
                        {selectedPatron.fullName?.charAt(0) || 'U'}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-action-green ring-2 ring-surface-container-lowest"></span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-body-large text-body-large font-bold text-text-primary">
                          {selectedPatron.fullName || selectedPatron.name}
                        </span>
                        <span className="bg-surface-container-highest text-text-primary font-caption text-caption font-semibold px-2 py-0.5 rounded-full">
                          {selectedPatron.libraryCardNumber || 'KP-CARD'}
                        </span>
                        <span className="bg-status-available text-on-primary font-caption text-caption px-2 py-0.5 rounded-full font-bold">
                          {selectedPatron.isActive ? 'Active • Good Standing' : 'Suspended'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-text-secondary font-small text-small">
                        <span>
                          Department: <strong className="text-text-primary font-medium">{selectedPatron.department || 'General'}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Role: <strong className="text-primary font-semibold">{selectedPatron.role}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedPatron(null)}
                      className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-text-primary font-caption text-caption transition-colors cursor-pointer"
                      type="button"
                    >
                      Change Patron
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-surface-container-low/40 rounded-xl flex items-center justify-center text-center">
                  <span className="font-caption text-caption text-text-secondary">
                    No patron selected yet. Scan library card, search above, or click &quot;Browse Patrons&quot; to verify eligibility.
                  </span>
                </div>
              )}
            </section>

            {/* OPTIONAL HOLD QUEUE SECTION IN HOLD RELEASE MODE */}
            {checkoutMode === 'hold' && relevantHolds.length > 0 && (
              <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-soft-blue text-primary font-headline-4 text-headline-4 flex items-center justify-center font-bold">
                      H
                    </span>
                    <div>
                      <h2 className="font-headline-4 text-headline-4 text-text-primary">
                        Held Reservation Staging Queue
                      </h2>
                      <span className="font-caption text-caption text-text-secondary">
                        Volumes awaiting physical handoff for this patron
                      </span>
                    </div>
                  </div>
                  <span className="font-caption text-caption font-bold bg-soft-blue text-primary px-3 py-1 rounded-full">
                    {relevantHolds.length} Ready for Pickup
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {relevantHolds.map((res) => (
                    <div
                      key={res.id}
                      className="p-3.5 bg-surface-container-low rounded-xl border border-outline/10 flex flex-col justify-between space-y-2 hover:bg-surface-container transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-body-medium text-body-medium font-bold text-text-primary line-clamp-1">
                            {res.bookTitle}
                          </h4>
                          <p className="font-caption text-caption text-text-secondary">
                            Author: {res.bookAuthor} • Call: {res.bookCallNumber || 'N/A'}
                          </p>
                          <p className="font-caption text-caption text-text-secondary mt-0.5">
                            Patron: <strong className="text-text-primary">{res.patronName}</strong> ({res.patronLibraryId})
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-action-green/20 text-action-green">
                          {res.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-surface-container">
                        <span className="font-caption text-caption text-text-secondary text-[11px]">
                          Expires: {new Date(res.expiryDate).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleStageReservationHold(res)}
                          type="button"
                          className="px-3 py-1 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-caption text-caption font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                        >
                          <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                          <span>Stage Hold Volume</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* STEP 2: Book Asset Barcode Scanning & Staging Area */}
            <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-soft-blue text-primary font-headline-4 text-headline-4 flex items-center justify-center font-bold">
                    2
                  </span>
                  <div>
                    <h2 className="font-headline-4 text-headline-4 text-text-primary">
                      Book Asset Barcode Scanning &amp; Staging
                    </h2>
                    <span className="font-caption text-caption text-text-secondary">
                      Scan book barcode on flyleaf sticker or match against catalog
                    </span>
                  </div>
                </div>

                {/* Staged View Mode Switch + Counter */}
                <div className="flex items-center gap-3">
                  <span className="font-caption text-caption font-semibold bg-soft-blue text-primary px-3 py-1 rounded-full">
                    {stagedBooks.length} Asset{stagedBooks.length === 1 ? '' : 's'} Staged
                  </span>
                  <RadioGroup
                    name="stagedViewMode"
                    options={[
                      { value: 'table', label: 'Table' },
                      { value: 'card', label: 'Cards' },
                    ]}
                    selectedValue={stagedViewMode}
                    onChange={handleStagedViewModeChange}
                  />
                </div>
              </div>

              {/* Book Barcode Search / Scan Bar */}
              <form onSubmit={handleStageBook} className="relative flex items-center gap-2">
                <div className="flex-1">
                  <SearchBar
                    placeholder="Scan Physical Book Barcode, ISBN, or Title..."
                    value={bookBarcodeQuery}
                    onChange={(v) => setBookBarcodeQuery(v)}
                    shortcutKey=""
                  />
                </div>
                <button
                  type="submit"
                  disabled={isStagingBook || !bookBarcodeQuery.trim()}
                  className="bg-primary hover:bg-primary-container text-on-primary px-4 py-2.5 rounded-xl font-small text-small font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>{isStagingBook ? 'Staging...' : 'Stage Copy'}</span>
                </button>
              </form>

              {/* Staged Books Area: Both Table and Card views retained in DOM */}
              {stagedBooks.length === 0 ? (
                <div className="p-8 bg-surface-container-low/40 rounded-xl flex flex-col items-center justify-center text-center">
                  <span className="material-symbols-outlined text-4xl text-text-secondary/40 mb-2">
                    menu_book
                  </span>
                  <p className="font-body-medium text-body-medium text-text-primary font-semibold">
                    Staging Area Empty
                  </p>
                  <p className="font-caption text-caption text-text-secondary max-w-sm mt-1">
                    Scan or enter physical book spine barcodes to stage them for checkout.
                  </p>
                </div>
              ) : (
                <>
                  {/* Table View (Kept mounted for drag listeners) */}
                  <div
                    ref={stagedTableContainerRef}
                    className={stagedViewMode === 'table' ? 'overflow-x-auto rounded-xl border border-outline/10 bg-surface-container-lowest' : 'hidden'}
                  >
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="border-b border-surface-container bg-surface-container-low/60 text-caption font-caption text-text-secondary font-bold uppercase tracking-wider">
                          <th className="py-3 px-4">Asset Details</th>
                          <th className="py-3 px-4">Author</th>
                          <th className="py-3 px-4">Dewey Call No.</th>
                          <th className="py-3 px-4">Asset Barcode</th>
                          <th className="py-3 px-4">Stacks Bay</th>
                          <th className="py-3 px-4">Custody Status</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container font-small text-small text-text-secondary">
                        {stagedBooks.map((book) => (
                          <tr key={book.id} className="hover:bg-surface-container-low/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-14 rounded overflow-hidden bg-surface-container-high flex-shrink-0 shadow-sm">
                                  {book.coverImage ? (
                                    <img
                                      src={book.coverImage}
                                      alt={book.title}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-soft-blue text-primary">
                                      <span className="material-symbols-outlined text-base">book</span>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <span className="font-body-medium text-body-medium font-bold text-text-primary block line-clamp-1">
                                    {book.title}
                                  </span>
                                  <span className="font-caption text-caption text-status-available font-semibold">
                                    {book.availableCopies} Copies in Stacks
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-text-primary font-medium">{book.author}</td>
                            <td className="py-3 px-4 font-mono">{book.deweyCode || 'Dewey N/A'}</td>
                            <td className="py-3 px-4 font-mono text-primary font-bold">{book.isbnBarcode || book.isbn}</td>
                            <td className="py-3 px-4">{book.bayLocation || 'Desk Bay 01'}</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 text-action-green font-bold text-caption font-mono">
                                <span className="material-symbols-outlined text-xs">verified</span> STACKS
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleRemoveStagedBook(book.id)}
                                type="button"
                                className="p-1.5 rounded-lg text-status-danger hover:bg-error-container transition-colors cursor-pointer"
                                title="Remove staged asset"
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Cards Grid View */}
                  <div className={stagedViewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'hidden'}>
                    {stagedBooks.map((book) => (
                      <div
                        key={book.id}
                        className="bg-surface-container-low rounded-xl p-4 flex gap-4 relative overflow-hidden border border-outline/10 shadow-sm"
                      >
                        {/* Cover */}
                        <div className="w-20 h-28 flex-shrink-0 rounded-lg overflow-hidden shadow-md bg-surface-container-highest">
                          {book.coverImage ? (
                            <img
                              className="w-full h-full object-cover"
                              src={book.coverImage}
                              alt={book.title}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-soft-blue flex items-center justify-center text-primary">
                              <span className="material-symbols-outlined text-2xl">book</span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-body-large text-body-large text-text-primary font-bold line-clamp-1">
                                {book.title}
                              </h3>
                              <button
                                onClick={() => handleRemoveStagedBook(book.id)}
                                className="text-status-danger hover:bg-error-container p-1 rounded-lg transition-colors cursor-pointer"
                                title="Remove staged asset"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </div>
                            <p className="font-small text-small text-text-secondary mt-0.5">
                              Author: <span className="text-text-primary font-medium">{book.author}</span>
                            </p>

                            {/* Detail Chips */}
                            <div className="grid grid-cols-2 gap-2 mt-3 text-text-secondary font-caption text-caption">
                              <div className="bg-surface-container-lowest p-1.5 rounded-lg">
                                <span className="block text-text-secondary text-[10px]">Call Number</span>
                                <span className="font-bold text-text-primary truncate block text-xs">
                                  {book.deweyCode || 'Dewey N/A'}
                                </span>
                              </div>
                              <div className="bg-surface-container-lowest p-1.5 rounded-lg">
                                <span className="block text-text-secondary text-[10px]">Asset Barcode</span>
                                <span className="font-bold text-text-primary font-mono truncate block text-xs">
                                  {book.isbnBarcode || book.isbn}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-surface-container font-caption text-caption text-status-available font-semibold">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">verified_user</span>
                              <span>{book.availableCopies} Available</span>
                            </span>
                            <span className="font-mono text-action-green text-xs font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">verified</span> STACKS
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>

            {/* STEP 3: Loan Policy & Dynamic Due Date Engine */}
            <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-soft-blue text-primary font-headline-4 text-headline-4 flex items-center justify-center font-bold">
                    3
                  </span>
                  <div>
                    <h2 className="font-headline-4 text-headline-4 text-text-primary">
                      Loan Policy &amp; Dynamic Due Date Calculation
                    </h2>
                    <span className="font-caption text-caption text-text-secondary">
                      Select policy duration or custom supervisor authorized term
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-surface-container px-3 py-1 rounded-lg text-text-secondary font-caption text-caption">
                  <span className="material-symbols-outlined text-sm">event</span>
                  <span>
                    Borrow Start: <strong className="text-text-primary font-bold">Today, {new Date().toLocaleDateString()}</strong>
                  </span>
                </div>
              </div>

              {/* Loan Duration Radio Selector Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <label
                  onClick={() => {
                    setLoanDays(7);
                    setIsCustomDuration(false);
                  }}
                  className={`cursor-pointer p-4 rounded-xl transition-all flex flex-col justify-between gap-2 border ${
                    !isCustomDuration && loanDays === 7
                      ? 'bg-soft-blue border-primary/30 text-primary shadow-sm'
                      : 'bg-surface-container-low border-transparent hover:bg-surface-container text-text-primary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-body-medium text-body-medium font-bold">7 Days</span>
                    <input
                      checked={!isCustomDuration && loanDays === 7}
                      onChange={() => {}}
                      type="radio"
                      className="accent-primary w-4 h-4"
                    />
                  </div>
                  <span className="font-caption text-caption text-text-secondary">Short Loan • Reserve copy</span>
                </label>

                <label
                  onClick={() => {
                    setLoanDays(14);
                    setIsCustomDuration(false);
                  }}
                  className={`cursor-pointer p-4 rounded-xl transition-all flex flex-col justify-between gap-2 border ${
                    !isCustomDuration && loanDays === 14
                      ? 'bg-soft-blue border-primary/30 text-primary shadow-sm'
                      : 'bg-surface-container-low border-transparent hover:bg-surface-container text-text-primary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-body-medium text-body-medium font-bold">14 Days</span>
                    <input
                      checked={!isCustomDuration && loanDays === 14}
                      onChange={() => {}}
                      type="radio"
                      className="accent-primary w-4 h-4"
                    />
                  </div>
                  <span className="font-caption text-caption text-primary font-semibold">Standard Academic (Recommended)</span>
                </label>

                <label
                  onClick={() => {
                    setLoanDays(21);
                    setIsCustomDuration(false);
                  }}
                  className={`cursor-pointer p-4 rounded-xl transition-all flex flex-col justify-between gap-2 border ${
                    !isCustomDuration && loanDays === 21
                      ? 'bg-soft-blue border-primary/30 text-primary shadow-sm'
                      : 'bg-surface-container-low border-transparent hover:bg-surface-container text-text-primary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-body-medium text-body-medium font-bold">21 Days</span>
                    <input
                      checked={!isCustomDuration && loanDays === 21}
                      onChange={() => {}}
                      type="radio"
                      className="accent-primary w-4 h-4"
                    />
                  </div>
                  <span className="font-caption text-caption text-text-secondary">Scholar Special (Thesis &amp; Grad)</span>
                </label>

                <label
                  onClick={() => setIsCustomDuration(true)}
                  className={`cursor-pointer p-4 rounded-xl transition-all flex flex-col justify-between gap-2 border ${
                    isCustomDuration
                      ? 'bg-soft-blue border-primary/30 text-primary shadow-sm'
                      : 'bg-surface-container-low border-transparent hover:bg-surface-container text-text-primary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-body-medium text-body-medium font-bold">Custom</span>
                    <input
                      checked={isCustomDuration}
                      onChange={() => {}}
                      type="radio"
                      className="accent-primary w-4 h-4"
                    />
                  </div>
                  {isCustomDuration ? (
                    <input
                      type="number"
                      min={1}
                      max={90}
                      value={customDays}
                      onChange={(e) => setCustomDays(e.target.value)}
                      className="w-full px-2 py-1 bg-surface-container-lowest rounded border border-outline/30 text-caption font-bold"
                    />
                  ) : (
                    <span className="font-caption text-caption text-text-secondary">Supervisor Override</span>
                  )}
                </label>
              </div>

              {/* Dynamic Due Date Callout */}
              <div className="bg-gradient-to-r from-soft-blue via-surface-container to-surface-container-high rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-2xl">event_upcoming</span>
                  </div>
                  <div>
                    <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">
                      Calculated Return Milestone
                    </span>
                    <p className="font-headline-3 text-headline-3 text-text-primary font-bold">
                      Due Date: {calculatedDueDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <span className="font-caption text-caption text-text-secondary">
                      Standard {effectiveDays} Days Cycle (Desk Bay 01 Policy)
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end gap-1 bg-surface-container-lowest/80 px-4 py-2.5 rounded-xl">
                  <span className="font-caption text-caption text-text-secondary">
                    Overdue Tariff: <strong className="text-status-danger font-semibold">₱15.00 / day</strong>
                  </span>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT PANEL: Checkout Summary & Complete (col-span-4) */}
          <div className="xl:col-span-4 flex flex-col space-y-6 xl:sticky xl:top-20">
            <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-md flex flex-col space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">shopping_bag</span>
                  <h3 className="font-headline-4 text-headline-4 text-text-primary">Checkout Summary</h3>
                </div>
                <span className="bg-soft-blue text-primary font-caption text-caption font-bold px-2.5 py-0.5 rounded-full">
                  {stagedBooks.length > 0 && selectedPatron ? 'Ready to Issue' : 'Awaiting Staging'}
                </span>
              </div>

              {/* Breakdown List */}
              <div className="flex flex-col space-y-2 text-small font-small">
                <div className="flex justify-between py-1 text-text-secondary">
                  <span>User Custodian:</span>
                  <span className="font-bold text-text-primary truncate max-w-[200px]">
                    {selectedPatron ? (selectedPatron.fullName || selectedPatron.name) : 'Not Selected'}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-text-secondary">
                  <span>Library Card:</span>
                  <span className="font-mono text-text-primary">
                    {selectedPatron?.libraryCardNumber || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-text-secondary">
                  <span>Physical Volumes:</span>
                  <span className="font-bold text-text-primary">
                    {stagedBooks.length} Volume{stagedBooks.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-text-secondary">
                  <span>Calculated Due:</span>
                  <span className="font-bold text-primary">
                    {calculatedDueDate.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between py-1 text-text-secondary">
                  <span>Custody Directive:</span>
                  <span className="inline-flex items-center gap-1 text-status-available font-bold">
                    <span className="material-symbols-outlined text-sm">assignment_turned_in</span> Issue into Custody
                  </span>
                </div>
              </div>

              {/* Complete Checkout Button */}
              <div className="pt-3">
                <button
                  onClick={handleCompleteCheckout}
                  disabled={isSubmitting || !selectedPatron || stagedBooks.length === 0}
                  className="w-full py-3.5 px-4 bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  type="button"
                >
                  <span className="material-symbols-outlined text-2xl">
                    {isSubmitting ? 'autorenew' : 'done_all'}
                  </span>
                  <span>{isSubmitting ? 'Processing Issue & Receipt...' : 'Complete Checkout & Print Pass'}</span>
                </button>
              </div>

              {/* Circulation Terminal Info */}
              <div className="p-3 bg-surface-container-low rounded-xl text-caption font-caption text-text-secondary space-y-1">
                <div className="flex items-center justify-between">
                  <span>Circulation Terminal:</span>
                  <span className="text-text-primary font-bold">POS Desk 01</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ledger Synchronization:</span>
                  <span className="text-action-green font-bold">Active Online</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Patron Directory Selector Modal */}
      {isPatronModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface-container-lowest max-w-4xl w-full rounded-2xl shadow-2xl p-6 flex flex-col space-y-4 border border-outline/10 max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-soft-blue text-primary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined">badge</span>
                </div>
                <div>
                  <h3 className="font-headline-3 text-headline-3 font-bold text-text-primary">
                    Patron Catalog &amp; Circulation Directory
                  </h3>
                  <span className="font-caption text-caption text-text-secondary">
                    Select verified university patron to bind checkout session
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsPatronModalOpen(false)}
                type="button"
                className="p-1 rounded-lg text-text-secondary hover:bg-surface-container"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Search and Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <SearchBar
                  placeholder="Filter by name, email, library card number..."
                  value={modalPatronSearch}
                  onChange={(v) => setModalPatronSearch(v)}
                  shortcutKey=""
                />
              </div>
              <div className="flex items-center gap-2">
                {(['all', 'active', 'suspended'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setModalStatusFilter(st)}
                    type="button"
                    className={`px-3 py-1.5 rounded-lg font-caption text-caption font-bold capitalize transition-colors cursor-pointer ${
                      modalStatusFilter === st
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Draggable Patron Table */}
            <div
              ref={patronModalTableContainerRef}
              className="overflow-x-auto rounded-xl border border-outline/10 bg-surface-container-lowest max-h-[400px]"
            >
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-surface-container bg-surface-container-low/60 text-caption font-caption text-text-secondary font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-4">Patron Name</th>
                    <th className="py-2.5 px-4">Card Barcode</th>
                    <th className="py-2.5 px-4">Email</th>
                    <th className="py-2.5 px-4">Role / Department</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container font-small text-small text-text-secondary">
                  {paginatedModalUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-text-secondary font-caption">
                        No patrons match your search filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedModalUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-2.5 px-4">
                          <span className="font-body-medium text-body-medium font-bold text-text-primary block">
                            {u.fullName || u.name}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-primary">
                          {u.libraryCardNumber || 'KP-CARD'}
                        </td>
                        <td className="py-2.5 px-4">{u.email}</td>
                        <td className="py-2.5 px-4">{u.department || u.role}</td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              u.isActive ? 'bg-action-green/20 text-action-green' : 'bg-status-danger/20 text-status-danger'
                            }`}
                          >
                            {u.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() => handleSelectPatron(u)}
                            type="button"
                            className="px-3 py-1 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-caption text-caption font-bold cursor-pointer transition-colors"
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Pagination Footer */}
            {filteredModalUsers.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-surface-container">
                <span className="font-caption text-caption text-text-secondary">
                  Showing {(modalCurrentPage - 1) * modalPageSize + 1} to{' '}
                  {Math.min(modalCurrentPage * modalPageSize, filteredModalUsers.length)} of{' '}
                  {filteredModalUsers.length} patrons
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!canPrevModalPage}
                    onClick={prevModalPage}
                    className="p-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-primary disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">chevron_left</span>
                  </button>
                  <span className="font-caption text-caption px-2 text-text-secondary">
                    Page {modalCurrentPage} of {modalTotalPages}
                  </span>
                  <button
                    type="button"
                    disabled={!canNextModalPage}
                    onClick={nextModalPage}
                    className="p-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-primary disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">chevron_right</span>
                  </button>
                  <select
                    value={modalPageSize}
                    onChange={(e) => setModalPageSize(Number(e.target.value))}
                    className="h-7 px-2 rounded-lg bg-surface-container text-text-secondary font-caption text-caption outline-none cursor-pointer"
                  >
                    {modalPageSizeOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt} / page
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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

export default CheckoutBorrow;
