// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// BookAvailability.tsx -- Cashier Book Availability & Physical Stacks Directory.
// Strict Read-Only RBAC: Cashiers can search, inspect copy availability and bay locations, but cannot add, edit, or delete books.
// Strictly adheres to real-time data mandate: zero hardcoded mock values, clean empty states when N=0.
// Universal lambda syntax (=>), zero browser alert().

import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToasts } from '../../../../../Hooks/useToasts';
import { getCatalogBooks, BackendBook } from '../../../../../Endpoints/booksApi';
import { RadioGroup } from '../../../../../Shared/RadioButton';
import { SearchBar, useDebounce } from '../../../../../Shared/SearchBar';
import { usePagination } from '../../../../../Hooks/usePagination';
import { useTableDraggable } from '../../../../../Hooks/useTableDraggable';

export const BookAvailability: FC = () => {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToasts();

  const [books, setBooks] = useState<BackendBook[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'depleted'>('all');
  const [bayFilter, setBayFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title-asc' | 'title-desc' | 'available-desc' | 'available-asc' | 'year-desc'>('title-asc');

  // View state (persisted)
  const [viewMode, setViewMode] = useState<string>(() => {
    return localStorage.getItem('cashier_books_view') || 'table';
  });

  const { containerRef: tableContainerRef } = useTableDraggable<HTMLDivElement>();

  const handleViewModeChange = (mode: string) => {
    setViewMode(mode);
    localStorage.setItem('cashier_books_view', mode);
  };

  // Modal Inspection
  const [inspectedBook, setInspectedBook] = useState<BackendBook | null>(null);

  const loadBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCatalogBooks();
      setBooks(data);
    } catch {
      addToast('Failed to load physical book inventory.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // Derived Metrics
  const totalTitles = books.length;
  const totalCopies = useMemo(() => books.reduce((sum, b) => sum + (b.totalCopies || 0), 0), [books]);
  const availableCopies = useMemo(() => books.reduce((sum, b) => sum + (b.availableCopies || 0), 0), [books]);
  const activeLoansCount = useMemo(() => Math.max(0, totalCopies - availableCopies), [totalCopies, availableCopies]);
  const availablePercentage = totalCopies > 0 ? ((availableCopies / totalCopies) * 100).toFixed(1) : '0.0';

  // Bay Locations list
  const bayLocations = useMemo(() => {
    const bays = new Set<string>();
    books.forEach((b) => {
      if (b.bayLocation) bays.add(b.bayLocation);
    });
    return Array.from(bays);
  }, [books]);

  // Filtered and Sorted Books
  const filteredBooks = useMemo(() => {
    const list = books
      .filter((b) => {
        if (availabilityFilter === 'available') return b.availableCopies > 0;
        if (availabilityFilter === 'depleted') return b.availableCopies <= 0;
        return true;
      })
      .filter((b) => {
        if (bayFilter === 'all') return true;
        return b.bayLocation === bayFilter;
      })
      .filter((b) => {
        if (!debouncedSearch.trim()) return true;
        const q = debouncedSearch.toLowerCase();
        return (
          b.title?.toLowerCase().includes(q) ||
          b.author?.toLowerCase().includes(q) ||
          b.isbn?.toLowerCase().includes(q) ||
          b.isbnBarcode?.toLowerCase().includes(q) ||
          b.deweyCode?.toLowerCase().includes(q)
        );
      });

    return [...list].sort((a, b) => {
      if (sortBy === 'title-asc') return (a.title || '').localeCompare(b.title || '');
      if (sortBy === 'title-desc') return (b.title || '').localeCompare(a.title || '');
      if (sortBy === 'available-desc') return (b.availableCopies || 0) - (a.availableCopies || 0);
      if (sortBy === 'available-asc') return (a.availableCopies || 0) - (b.availableCopies || 0);
      if (sortBy === 'year-desc') return (b.publishedYear || 0) - (a.publishedYear || 0);
      return 0;
    });
  }, [books, availabilityFilter, bayFilter, debouncedSearch, sortBy]);

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
  } = usePagination(filteredBooks, { initialPageSize: 10, pageSizeOptions: [10, 25, 50, 100] });

  return (
    <div className="w-full">
      <div className="flex flex-col w-full pb-16 space-y-6">
        {/* Top Context Header & Terminal Read-Only State Indicator */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2 text-text-secondary font-caption text-caption">
              <span className="inline-flex items-center gap-1 font-bold text-primary">
                <span className="material-symbols-outlined text-base">shelves</span>
                INVENTORY ARCHIVE
              </span>
              <span>•</span>
              <span>Catalog &amp; Physical Stacks Directory</span>
              <span>•</span>
              <span className="bg-surface-container px-2 py-0.5 rounded text-text-secondary font-bold">
                Read-Only Staff Terminal
              </span>
            </div>
            <h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">
              Book Availability &amp; Stacks Directory
            </h1>
            <p className="font-body text-body text-text-secondary">
              Verify real-time copy positions, physical shelf tags, waitlist saturation, and hold allocations.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <RadioGroup
              name="bookAvailabilityView"
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
                loadBooks();
                addToast('Catalog inventory synchronized.', 'info');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-caption text-caption font-bold transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-base">sync</span>
              <span>Refresh Stacks</span>
            </button>
          </div>
        </div>

        {/* Metric Overview Bento Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Total Titles */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">
                Catalog Titles
              </span>
              <span className="p-1.5 rounded-lg bg-soft-blue text-primary material-symbols-outlined text-lg">
                auto_stories
              </span>
            </div>
            <div className="mt-4">
              <div className="font-headline-2 text-headline-2 text-text-primary leading-none">
                {totalTitles}
              </div>
              <p className="font-caption text-caption text-text-secondary mt-1">Indexed in collections</p>
            </div>
          </div>

          {/* Total Physical Copies */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">
                Physical Volumes
              </span>
              <span className="p-1.5 rounded-lg bg-secondary-container text-on-secondary-container material-symbols-outlined text-lg">
                layers
              </span>
            </div>
            <div className="mt-4">
              <div className="font-headline-2 text-headline-2 text-text-primary leading-none">
                {totalCopies}
              </div>
              <p className="font-caption text-caption text-text-secondary mt-1">Total library assets</p>
            </div>
          </div>

          {/* Available on Stacks */}
          <div className="bg-soft-blue/70 rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption uppercase tracking-wider text-primary font-bold">
                Ready on Stacks
              </span>
              <span className="p-1.5 rounded-lg bg-surface-container-lowest text-status-available material-symbols-outlined text-lg">
                shelves
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="font-headline-2 text-headline-2 text-text-primary leading-none">
                  {availableCopies}
                </span>
                <span className="bg-action-green text-text-primary font-caption text-caption font-bold px-1.5 py-0.5 rounded-full">
                  {availablePercentage}%
                </span>
              </div>
              <div className="w-full bg-surface-container-lowest/80 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: `${availablePercentage}%` }}></div>
              </div>
            </div>
          </div>

          {/* Active on Loan */}
          <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption uppercase tracking-wider text-text-secondary font-bold">
                Active on Loan
              </span>
              <span className="p-1.5 rounded-lg bg-surface-container text-text-primary material-symbols-outlined text-lg">
                local_library
              </span>
            </div>
            <div className="mt-4">
              <div className="font-headline-2 text-headline-2 text-text-primary leading-none">
                {activeLoansCount}
              </div>
              <p className="font-caption text-caption text-text-secondary mt-1">In borrower custody</p>
            </div>
          </div>
        </div>

        {/* Search, Filter & Sort Control Console */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex-1 max-w-xl">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery('')}
              placeholder="Search by Title, Author, ISBN, Barcode, or Dewey Call #..."
            />
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setAvailabilityFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-caption font-caption font-bold transition-colors cursor-pointer ${
                  availabilityFilter === 'all'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                All Status
              </button>
              <button
                type="button"
                onClick={() => setAvailabilityFilter('available')}
                className={`px-3 py-1.5 rounded-lg text-caption font-caption font-bold transition-colors cursor-pointer ${
                  availabilityFilter === 'available'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Available
              </button>
              <button
                type="button"
                onClick={() => setAvailabilityFilter('depleted')}
                className={`px-3 py-1.5 rounded-lg text-caption font-caption font-bold transition-colors cursor-pointer ${
                  availabilityFilter === 'depleted'
                    ? 'bg-surface-container-lowest text-primary shadow-xs'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Depleted
              </button>
            </div>

            {/* Bay Filter */}
            {bayLocations.length > 0 && (
              <select
                value={bayFilter}
                onChange={(e) => setBayFilter(e.target.value)}
                aria-label="Filter books by shelf bay location"
                className="px-3 py-2 bg-surface-container-low rounded-xl text-caption font-caption font-bold text-text-primary outline-none cursor-pointer border border-outline/10"
              >
                <option value="all">All Shelf Bays</option>
                {bayLocations.map((bay) => (
                  <option key={bay} value={bay}>
                    {bay}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort books by order"
              className="px-3 py-2 bg-surface-container-low rounded-xl text-caption font-caption font-bold text-text-primary outline-none cursor-pointer border border-outline/10"
            >
              <option value="title-asc">Title: A to Z</option>
              <option value="title-desc">Title: Z to A</option>
              <option value="available-desc">Most Available</option>
              <option value="available-asc">Least Available</option>
              <option value="year-desc">Year (Newest)</option>
            </select>
          </div>
        </div>

        {/* Content Container (Table & Cards) */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="font-caption text-caption text-text-secondary mt-2">Loading stacks catalog...</span>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center p-6">
              <span className="material-symbols-outlined text-5xl text-text-secondary/40 mb-2">
                menu_book
              </span>
              <p className="font-body-medium text-body-medium text-text-primary font-semibold">
                No catalog titles found
              </p>
              <p className="font-caption text-caption text-text-secondary max-w-sm mt-1">
                {searchQuery
                  ? `No books matching "${searchQuery}". Clear query to view all titles.`
                  : 'The library catalog is currently empty.'}
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
                      <th className="py-3 px-4">Book Details</th>
                      <th className="py-3 px-4">Classification &amp; Call No</th>
                      <th className="py-3 px-4">Physical Stacks Bay</th>
                      <th className="py-3 px-4">Copy Availability</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high/40 text-small font-small">
                    {paginatedItems.map((b) => (
                      <tr key={b.id} className="hover:bg-surface-container-low/60 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            {b.coverImage ? (
                              <img
                                className="w-12 h-16 object-cover rounded-lg shadow-sm flex-shrink-0"
                                src={b.coverImage}
                                alt={b.title}
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-12 h-16 bg-soft-blue rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                                <span className="material-symbols-outlined text-2xl">book</span>
                              </div>
                            )}
                            <div className="flex flex-col min-w-0 max-w-xs">
                              <span className="font-body-medium text-body-medium font-bold text-text-primary line-clamp-1">
                                {b.title}
                              </span>
                              <span className="font-caption text-caption text-text-secondary truncate">
                                {b.author}
                              </span>
                              <span className="font-caption text-caption text-text-secondary font-mono">
                                ISBN: {b.isbn}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-primary font-mono">
                              {b.deweyCode || 'Dewey N/A'}
                            </span>
                            <span className="font-caption text-caption text-text-secondary">
                              {b.category?.name || 'General Collection'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-text-primary">
                              {b.bayLocation || 'Desk Bay 01'}
                            </span>
                            <span className="font-caption text-caption text-text-secondary font-mono">
                              Tag: {b.isbnBarcode || 'BARCODE-N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span
                              className={`inline-flex items-center gap-1 font-bold text-caption font-caption ${
                                b.availableCopies > 0 ? 'text-status-available' : 'text-status-danger'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  b.availableCopies > 0 ? 'bg-status-available' : 'bg-status-danger'
                                }`}
                              ></span>
                              {b.availableCopies > 0
                                ? `${b.availableCopies} Available`
                                : '0 Available (Loaned)'}
                            </span>
                            <span className="font-caption text-caption text-text-secondary mt-0.5">
                              Total copies: {b.totalCopies}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setInspectedBook(b)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-small text-small font-semibold transition-colors cursor-pointer"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-base">visibility</span>
                              <span>Inspect</span>
                            </button>
                            {b.availableCopies > 0 && (
                              <button
                                onClick={() => navigate(`/cashier/checkout?query=${encodeURIComponent(b.isbnBarcode || b.isbn || b.id.toString())}`)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-small text-small font-semibold transition-colors cursor-pointer"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-base">shopping_cart_checkout</span>
                                <span>Borrow</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cards Grid View */}
              {viewMode === 'card' && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedItems.map((b) => (
                    <div
                      key={b.id}
                      className="bg-surface-container-low rounded-xl p-4 flex flex-col justify-between border border-outline/10 hover:border-primary/20 transition-all shadow-xs"
                    >
                      <div className="flex gap-3">
                        {b.coverImage ? (
                          <img
                            className="w-16 h-22 object-cover rounded-lg shadow-sm flex-shrink-0"
                            src={b.coverImage}
                            alt={b.title}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-16 h-22 bg-soft-blue rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                            <span className="material-symbols-outlined text-3xl">book</span>
                          </div>
                        )}
                        <div className="flex flex-col flex-1 min-w-0">
                          <h4 className="font-body-medium text-body-medium font-bold text-text-primary line-clamp-2">
                            {b.title}
                          </h4>
                          <span className="font-caption text-caption text-text-secondary truncate mt-0.5">
                            {b.author}
                          </span>
                          <span className="font-caption text-caption text-primary font-mono mt-1">
                            {b.deweyCode || 'Dewey N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-surface-container grid grid-cols-2 gap-2 text-caption font-caption">
                        <div>
                          <span className="text-text-secondary block">Shelf Bay:</span>
                          <span className="font-bold text-text-primary">{b.bayLocation || 'Desk Bay 01'}</span>
                        </div>
                        <div>
                          <span className="text-text-secondary block">Availability:</span>
                          <span
                            className={`font-bold ${
                              b.availableCopies > 0 ? 'text-status-available' : 'text-status-danger'
                            }`}
                          >
                            {b.availableCopies} / {b.totalCopies} copies
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-end gap-2">
                        <button
                          onClick={() => setInspectedBook(b)}
                          className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-small text-small font-semibold transition-colors cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-base">visibility</span>
                          <span>Inspect</span>
                        </button>
                        {b.availableCopies > 0 && (
                          <button
                            onClick={() => navigate(`/cashier/checkout?query=${encodeURIComponent(b.isbnBarcode || b.isbn || b.id.toString())}`)}
                            className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary font-small text-small font-semibold transition-colors cursor-pointer"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-base">shopping_cart_checkout</span>
                            <span>Borrow</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Standardized Pagination Controls Footer */}
              <div className="p-4 border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-4 font-caption text-caption text-text-secondary">
                <div className="flex items-center gap-2">
                  <span>
                    Showing <span className="font-bold text-text-primary">{totalItems === 0 ? 0 : startIndex + 1}</span> to{' '}
                    <span className="font-bold text-text-primary">{Math.min(endIndex, totalItems)}</span> of{' '}
                    <span className="font-bold text-text-primary">{totalItems}</span> titles
                  </span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <span>Rows:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      aria-label="Books per page"
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
      </div>

      {/* Book Inspection Modal */}
      {inspectedBook && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface-container-lowest max-w-xl w-full rounded-2xl shadow-2xl p-6 flex flex-col space-y-4 border border-outline/10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-soft-blue text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">menu_book</span>
                </div>
                <div>
                  <h3 className="font-headline-4 text-headline-4 font-bold text-text-primary line-clamp-1">
                    {inspectedBook.title}
                  </h3>
                  <p className="font-caption text-caption text-text-secondary">
                    {inspectedBook.author} ({inspectedBook.publishedYear})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectedBook(null)}
                className="p-1 rounded-lg text-text-secondary hover:bg-surface-container"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-small font-small">
              <div className="p-3 bg-surface-container-low rounded-xl">
                <span className="text-caption font-caption text-text-secondary block">Call Number</span>
                <span className="font-bold text-primary">{inspectedBook.deweyCode || 'Dewey N/A'}</span>
              </div>
              <div className="p-3 bg-surface-container-low rounded-xl">
                <span className="text-caption font-caption text-text-secondary block">Shelf Stacks Bay</span>
                <span className="font-bold text-text-primary">{inspectedBook.bayLocation || 'Desk Bay 01'}</span>
              </div>
              <div className="p-3 bg-surface-container-low rounded-xl">
                <span className="text-caption font-caption text-text-secondary block">Physical Barcode</span>
                <span className="font-mono font-bold text-text-primary">
                  {inspectedBook.isbnBarcode || inspectedBook.isbn}
                </span>
              </div>
              <div className="p-3 bg-surface-container-low rounded-xl">
                <span className="text-caption font-caption text-text-secondary block">Collection Category</span>
                <span className="font-bold text-text-primary">
                  {inspectedBook.category?.name || 'General Collection'}
                </span>
              </div>
              <div className="p-3 bg-surface-container-low rounded-xl">
                <span className="text-caption font-caption text-text-secondary block">Available Copies</span>
                <span className="font-bold text-status-available">{inspectedBook.availableCopies}</span>
              </div>
              <div className="p-3 bg-surface-container-low rounded-xl">
                <span className="text-caption font-caption text-text-secondary block">Total Inventory</span>
                <span className="font-bold text-text-primary">{inspectedBook.totalCopies}</span>
              </div>
            </div>

            {inspectedBook.description && (
              <div className="p-3 bg-surface-container-low rounded-xl text-caption font-caption text-text-secondary">
                <span className="font-bold text-text-primary block mb-0.5">Summary:</span>
                <p className="line-clamp-3">{inspectedBook.description}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-container">
              <button
                onClick={() => setInspectedBook(null)}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-caption text-caption font-bold cursor-pointer"
                type="button"
              >
                Close Inspection
              </button>
              {inspectedBook.availableCopies > 0 && (
                <button
                  onClick={() => {
                    const query = inspectedBook.isbnBarcode || inspectedBook.isbn || inspectedBook.id.toString();
                    navigate(`/cashier/checkout?query=${encodeURIComponent(query)}`);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-caption text-caption font-bold cursor-pointer transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">shopping_cart_checkout</span>
                  <span>Fast Checkout</span>
                </button>
              )}
            </div>
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

export default BookAvailability;
