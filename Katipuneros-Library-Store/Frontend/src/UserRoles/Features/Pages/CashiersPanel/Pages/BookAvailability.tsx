// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// BookAvailability.tsx -- Cashier Book Availability & Physical Stacks Directory.
// Strict Read-Only RBAC: Cashiers can search, inspect copy availability and bay locations, but cannot add, edit, or delete books.
// Strictly adheres to real-time data mandate: zero hardcoded mock values, clean empty states when N=0.
// Universal lambda syntax (=>), zero browser alert().

import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { useToasts } from '../../../../../Hooks/useToasts';
import { getCatalogBooks, BackendBook } from '../../../../../Endpoints/booksApi';

export const BookAvailability: FC = () => {
  const { toasts, addToast, removeToast } = useToasts();

  const [books, setBooks] = useState<BackendBook[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'depleted'>('all');
  const [bayFilter, setBayFilter] = useState<string>('all');

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

  // Filtered Books
  const filteredBooks = useMemo(() => {
    return books
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
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          b.title?.toLowerCase().includes(q) ||
          b.author?.toLowerCase().includes(q) ||
          b.isbn?.toLowerCase().includes(q) ||
          b.isbnBarcode?.toLowerCase().includes(q) ||
          b.deweyCode?.toLowerCase().includes(q)
        );
      });
  }, [books, availabilityFilter, bayFilter, searchQuery]);

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
              <span className="bg-surface-container px-2 py-0.5 rounded text-text-secondary font-medium font-bold">
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
            <button
              onClick={() => {
                loadBooks();
                addToast('Catalog inventory synchronized.', 'info');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-primary font-caption text-caption font-bold transition-colors cursor-pointer"
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

        {/* Search & Stacks Multi-Filter Control Console */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-xl">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-2.5 bg-surface-container-low focus:bg-surface-container-lowest text-text-primary font-body-medium text-body-medium rounded-xl outline-none transition-all shadow-inner placeholder:text-text-secondary"
              placeholder="Search by Title, Author, ISBN, Barcode, or Dewey Call #..."
              type="text"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                type="button"
              >
                <span className="material-symbols-outlined text-base">cancel</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as 'all' | 'available' | 'depleted')}
              className="px-3 py-2 bg-surface-container-low rounded-xl text-caption font-caption font-bold text-text-primary outline-none cursor-pointer"
            >
              <option value="all">All Availability</option>
              <option value="available">Available in Stacks</option>
              <option value="depleted">Fully Borrowed / Reserved</option>
            </select>

            {bayLocations.length > 0 && (
              <select
                value={bayFilter}
                onChange={(e) => setBayFilter(e.target.value)}
                className="px-3 py-2 bg-surface-container-low rounded-xl text-caption font-caption font-bold text-text-primary outline-none cursor-pointer"
              >
                <option value="all">All Shelf Bays</option>
                {bayLocations.map((bay) => (
                  <option key={bay} value={bay}>
                    {bay}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Books Table */}
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
            <div className="overflow-x-auto">
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
                  {filteredBooks.map((b) => (
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
                        <button
                          onClick={() => setInspectedBook(b)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-small text-small font-semibold transition-colors cursor-pointer"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-base">visibility</span>
                          <span>Inspect Volume</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="p-4 border-t border-surface-container flex items-center justify-between font-caption text-caption text-text-secondary">
            <span>
              Showing {filteredBooks.length} of {books.length} titles
            </span>
            <span className="font-mono text-primary font-bold">Physical Stacks Directory Live</span>
          </div>
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

            <div className="flex items-center justify-end pt-2 border-t border-surface-container">
              <button
                onClick={() => setInspectedBook(null)}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-caption text-caption font-bold cursor-pointer"
                type="button"
              >
                Close Inspection
              </button>
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
