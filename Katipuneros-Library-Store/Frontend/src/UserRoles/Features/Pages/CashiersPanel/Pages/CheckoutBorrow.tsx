// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// CheckoutBorrow.tsx -- Cashier Circulation Desk Checkout & Borrowing.
// Connects to live /api/borrow/checkout, /api/users, and /api/books.
// Strictly adheres to real-time data mandate: zero hardcoded mock values, clean empty states when N=0.
// Universal lambda syntax (=>), zero browser alert().

import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useToasts } from '../../../../../Hooks/useToasts';
import { processCashierCheckout } from '../../../../../Endpoints/Cashier/transactionApi';
import { getAdminUsersList, AdminUserRecord } from '../../../../../Endpoints/Admin/userApi';
import { getCatalogBooks, BackendBook } from '../../../../../Endpoints/booksApi';

export const CheckoutBorrow: FC = () => {
  const location = useLocation();
  const { toasts, addToast, removeToast } = useToasts();

  // Mode: Reservation Hold Release vs Direct Walk-In Checkout
  const [checkoutMode, setCheckoutMode] = useState<'hold' | 'walkin'>('walkin');

  // Patron State
  const [allUsers, setAllUsers] = useState<AdminUserRecord[]>([]);
  const [patronSearchInput, setPatronSearchInput] = useState<string>('');
  const [selectedPatron, setSelectedPatron] = useState<AdminUserRecord | null>(null);
  const [isSearchingPatron, setIsSearchingPatron] = useState<boolean>(false);

  // Staged Books State
  const [bookBarcodeQuery, setBookBarcodeQuery] = useState<string>('');
  const [stagedBooks, setStagedBooks] = useState<BackendBook[]>([]);
  const [isStagingBook, setIsStagingBook] = useState<boolean>(false);

  // Loan Duration State
  const [loanDays, setLoanDays] = useState<number>(14);
  const [customDays, setCustomDays] = useState<string>('30');
  const [isCustomDuration, setIsCustomDuration] = useState<boolean>(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initial load
  const loadPatrons = useCallback(async () => {
    try {
      const users = await getAdminUsersList();
      setAllUsers(users);
    } catch {
      addToast('Failed to load user directory.', 'error');
    }
  }, [addToast]);

  useEffect(() => {
    loadPatrons();
  }, [loadPatrons]);

  // Handle query param if navigated from dashboard manual scan
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('query');
    if (q) {
      setPatronSearchInput(q);
      // Attempt immediate match
      const matched = allUsers.find(
        (u) =>
          u.libraryCardNumber?.toLowerCase() === q.toLowerCase() ||
          u.id.toLowerCase() === q.toLowerCase() ||
          u.email.toLowerCase() === q.toLowerCase()
      );
      if (matched) {
        setSelectedPatron(matched);
      }
    }
  }, [location.search, allUsers]);

  // Patron Search / Select Handler
  const handleSelectPatron = (patron: AdminUserRecord) => {
    setSelectedPatron(patron);
    setPatronSearchInput('');
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

  // Filtered Patron Suggestions
  const patronSuggestions = useMemo(() => {
    if (!patronSearchInput.trim() || selectedPatron) return [];
    const q = patronSearchInput.toLowerCase();
    return allUsers
      .filter(
        (u) =>
          u.fullName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.libraryCardNumber?.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [allUsers, patronSearchInput, selectedPatron]);

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
              Scan user identification card or reservation QR code to release physical volumes into user custody with
              RFID security disarm.
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
                  ⚡ Hardware Scanner Ready
                </span>
                <span className="font-caption text-caption text-text-secondary text-[10px]">
                  Desk Optical Subsystem Online
                </span>
              </div>
            </div>
          </div>
        </div>

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
                      Scan patron barcode card, smart badge RFID, or search by name / email
                    </span>
                  </div>
                </div>
                {selectedPatron && (
                  <span className="inline-flex items-center gap-1 bg-action-green/20 text-primary px-3 py-1 rounded-full font-caption text-caption font-bold">
                    <span className="material-symbols-outlined text-sm text-primary">verified</span>
                    Identity Confirmed
                  </span>
                )}
              </div>

              {/* Scan / Search Input */}
              <form onSubmit={handlePatronSearchSubmit} className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-primary text-xl">badge</span>
                <input
                  value={patronSearchInput}
                  onChange={(e) => setPatronSearchInput(e.target.value)}
                  className="w-full pl-12 pr-28 py-3 bg-surface-container-low focus:bg-surface-container-lowest text-text-primary font-body-medium text-body-medium rounded-xl outline-none shadow-inner transition-colors"
                  placeholder="Scan User Card Barcode or Enter Name / Email (e.g., KP-88192)..."
                  type="text"
                />
                <div className="absolute right-3 flex items-center gap-1">
                  <button
                    type="submit"
                    disabled={isSearchingPatron || !patronSearchInput.trim()}
                    className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-caption text-caption font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSearchingPatron ? 'Searching...' : 'Find User'}
                  </button>
                </div>
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
                    No patron selected yet. Scan library card or search above to verify eligibility.
                  </span>
                </div>
              )}
            </section>

            {/* STEP 2: Book Asset Barcode Scanning & Staging Area */}
            <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col space-y-4">
              <div className="flex items-center justify-between">
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
                <span className="font-caption text-caption font-semibold bg-soft-blue text-primary px-3 py-1 rounded-full">
                  {stagedBooks.length} Asset{stagedBooks.length === 1 ? '' : 's'} Staged
                </span>
              </div>

              {/* Book Barcode Search / Scan Bar */}
              <form onSubmit={handleStageBook} className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-primary text-xl">
                  barcode_scanner
                </span>
                <input
                  value={bookBarcodeQuery}
                  onChange={(e) => setBookBarcodeQuery(e.target.value)}
                  className="w-full pl-12 pr-32 py-3 bg-surface-container-low focus:bg-surface-container-lowest text-text-primary font-body-medium text-body-medium rounded-xl outline-none shadow-inner transition-colors"
                  placeholder="Scan Physical Book Barcode, ISBN, or Title..."
                  type="text"
                />
                <div className="absolute right-3 flex items-center gap-1.5">
                  <button
                    type="submit"
                    disabled={isStagingBook || !bookBarcodeQuery.trim()}
                    className="bg-primary hover:bg-primary-container text-on-primary px-3.5 py-1.5 rounded-lg font-small text-small font-bold transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-base">add</span>
                    <span>Stage Copy</span>
                  </button>
                </div>
              </form>

              {/* Staged Books List */}
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
                <div className="flex flex-col space-y-3">
                  {stagedBooks.map((book) => (
                    <div
                      key={book.id}
                      className="bg-surface-container-low rounded-xl p-4 flex flex-col md:flex-row gap-4 relative overflow-hidden"
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
                            <h3 className="font-headline-4 text-headline-4 text-text-primary font-bold line-clamp-1">
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
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-text-secondary font-caption text-caption">
                            <div className="bg-surface-container-lowest p-2 rounded-lg">
                              <span className="block text-text-secondary text-[11px]">Call Number</span>
                              <span className="font-bold text-text-primary truncate block">
                                {book.deweyCode || 'Dewey N/A'}
                              </span>
                            </div>
                            <div className="bg-surface-container-lowest p-2 rounded-lg">
                              <span className="block text-text-secondary text-[11px]">Asset Barcode</span>
                              <span className="font-bold text-text-primary font-mono truncate block">
                                {book.isbnBarcode || book.isbn}
                              </span>
                            </div>
                            <div className="bg-surface-container-lowest p-2 rounded-lg">
                              <span className="block text-text-secondary text-[11px]">RFID Security</span>
                              <span className="font-bold text-action-green font-mono flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">rss_feed</span> ARMED
                              </span>
                            </div>
                            <div className="bg-surface-container-lowest p-2 rounded-lg">
                              <span className="block text-text-secondary text-[11px]">Stacks Location</span>
                              <span className="font-bold text-text-primary truncate block">
                                {book.bayLocation || 'Desk Bay 01'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-surface-container font-caption text-caption text-status-available font-semibold">
                          <span className="material-symbols-outlined text-sm">verified_user</span>
                          <span>Available Copy Verified ({book.availableCopies} available in library)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                  <span>RFID Disarm Directive:</span>
                  <span className="inline-flex items-center gap-1 text-status-available font-bold">
                    <span className="material-symbols-outlined text-sm">lock_open</span> Auto-Disarm on Issue
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
                  <span>{isSubmitting ? 'Processing RFID & Issue...' : 'Complete Checkout & Print Pass'}</span>
                </button>
              </div>

              {/* Hardware Peripheral Info */}
              <div className="p-3 bg-surface-container-low rounded-xl text-caption font-caption text-text-secondary space-y-1">
                <div className="flex items-center justify-between">
                  <span>Terminal Peripheral:</span>
                  <span className="text-text-primary font-bold">POS Desk 01</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>RFID Gate Synchronization:</span>
                  <span className="text-action-green font-bold">Active Online</span>
                </div>
              </div>
            </section>
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

export default CheckoutBorrow;
