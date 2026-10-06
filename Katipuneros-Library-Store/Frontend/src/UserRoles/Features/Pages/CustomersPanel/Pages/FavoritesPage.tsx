// [Layer: UserRoles/Features/Pages/CustomersPanel/Pages]
// FavoritesPage.tsx -- Customer Saved Books, Wishlist Triage, and Reading Lists
// Fully reactive React 19 component wired to favoriteApi, booksApi, and reservationApi.
// Strictly adheres to Zero Mock Data (N=0 empty state), Universal Lambda syntax (=>),
// and reactive toast notifications via useToasts.

import React, { FC, useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BackendBook } from '../../../../../Endpoints/booksApi';
import {
  getCustomerFavorites,
  removeCustomerFavorite,
  getReadingLists,
  createReadingList,
} from '../../../../../Endpoints/Customer/favoriteApi';
import {
  requestCustomerReservation,
  CustomerReservationResponse,
} from '../../../../../Endpoints/Customer/reservationApi';
import { useToasts } from '../../../../../Hooks/useToasts';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400';

type SortOption = 'recent' | 'availability' | 'title' | 'dewey';
type ViewMode = 'grid' | 'list';

export const FavoritesPage: FC = () => {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToasts();

  // Primary State
  const [favorites, setFavorites] = useState<BackendBook[]>([]);
  const [readingLists, setReadingLists] = useState<string[]>(['All Saved']);
  const [selectedList, setSelectedList] = useState<string>('All Saved');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal State
  const [isCreateListOpen, setIsCreateListOpen] = useState<boolean>(false);
  const [newListName, setNewListName] = useState<string>('');
  const [isReservingAll, setIsReservingAll] = useState<boolean>(false);
  const [reservingBookId, setReservingBookId] = useState<string | null>(null);

  // Load Saved Favorites and Lists
  const loadFavoritesData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [favs, lists] = await Promise.all([
        getCustomerFavorites(),
        getReadingLists(),
      ]);
      setFavorites(favs);
      setReadingLists(lists.length ? lists : ['All Saved']);
    } catch (err: unknown) {
      console.error('Failed to load favorites data:', err);
      addToast('Error loading your saved books collection.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadFavoritesData();
  }, [loadFavoritesData]);

  // KPI Calculations ($N=0$ safe)
  const totalSaved = favorites.length;
  const availableBooks = useMemo(
    () => favorites.filter((b) => (b.availableCopies ?? 0) > 0),
    [favorites]
  );
  const availableCount = availableBooks.length;
  const checkedOutCount = useMemo(
    () => favorites.filter((b) => (b.availableCopies ?? 0) === 0).length,
    [favorites]
  );

  const availablePercent = totalSaved > 0 ? Math.round((availableCount / totalSaved) * 100) : 0;
  const checkedOutPercent = totalSaved > 0 ? Math.round((checkedOutCount / totalSaved) * 100) : 0;

  // Filtered & Sorted Books
  const filteredBooks = useMemo(() => {
    let result = [...favorites];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn?.toLowerCase().includes(q) ||
          b.deweyCode?.toLowerCase().includes(q) ||
          b.bayLocation?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'availability':
          return (b.availableCopies ?? 0) - (a.availableCopies ?? 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'dewey':
          return (a.deweyCode || '').localeCompare(b.deweyCode || '');
        case 'recent':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    return result;
  }, [favorites, searchQuery, sortBy]);

  // Remove Book from Favorites
  const handleRemoveFavorite = async (bookId: string, title: string) => {
    const success = await removeCustomerFavorite(bookId);
    if (success) {
      setFavorites((prev) => prev.filter((b) => b.id !== bookId));
      addToast(`Removed "${title}" from your saved stacks.`, 'info');
    } else {
      addToast('Failed to remove book from saved list.', 'error');
    }
  };

  // Single Book Reservation
  const handleReserveBook = async (book: BackendBook) => {
    if ((book.availableCopies ?? 0) <= 0) {
      addToast(`"${book.title}" is currently checked out. Please check back later.`, 'warning');
      return;
    }

    setReservingBookId(book.id);
    try {
      const res: CustomerReservationResponse = await requestCustomerReservation({
        bookId: book.id,
        pickupBranch: 'Main Circulation Desk',
      });

      if (res.success) {
        addToast(res.message || `Hold confirmed for "${book.title}". Pickup at Main Circulation Desk.`, 'success');
        // Refresh catalog quantities
        await loadFavoritesData();
      } else {
        addToast(res.message || 'Unable to place hold request.', 'error');
      }
    } catch {
      addToast('Network error while processing hold request.', 'error');
    } finally {
      setReservingBookId(null);
    }
  };

  // Batch Reserve All Available
  const handleReserveAllAvailable = async () => {
    if (availableCount === 0) {
      addToast('No saved titles are currently available in stacks for pickup.', 'warning');
      return;
    }

    setIsReservingAll(true);
    let successCount = 0;

    try {
      for (const book of availableBooks) {
        const res = await requestCustomerReservation({
          bookId: book.id,
          pickupBranch: 'Main Circulation Desk',
        });
        if (res.success) successCount++;
      }

      if (successCount > 0) {
        addToast(`Successfully placed holds for ${successCount} title(s). Ready for pickup staging.`, 'success');
        await loadFavoritesData();
      } else {
        addToast('Could not reserve saved titles. Please verify your loan quota.', 'error');
      }
    } catch {
      addToast('Error processing batch reservations.', 'error');
    } finally {
      setIsReservingAll(false);
    }
  };

  // Create Custom Reading List
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newListName.trim();
    if (!clean) return;

    const ok = await createReadingList(clean);
    if (ok) {
      setReadingLists((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
      setSelectedList(clean);
      setNewListName('');
      setIsCreateListOpen(false);
      addToast(`Reading list "${clean}" created successfully.`, 'success');
    } else {
      addToast('Failed to create reading list.', 'error');
    }
  };

  // Export BibTeX and CSV Files
  const handleExportBibTeX = () => {
    if (!favorites.length) {
      addToast('No saved books to export.', 'warning');
      return;
    }

    const bibEntries = favorites.map((b) => {
      const citeKey = `${(b.author || 'author').split(' ')[0].toLowerCase()}${b.publishedYear || 2026}${b.title.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '')}`;
      return `@book{${citeKey},
  title = {${b.title}},
  author = {${b.author}},
  year = {${b.publishedYear || 2026}},
  isbn = {${b.isbn || 'N/A'}},
  note = {Dewey: ${b.deweyCode || 'N/A'} • Bay: ${b.bayLocation || 'General Stacks'}}
}`;
    }).join('\n\n');

    const blob = new Blob([bibEntries], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Katipuneros_Saved_Books_${new Date().toISOString().slice(0, 10)}.bib`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('BibTeX citation archive exported successfully.', 'success');
  };

  const handleExportCSV = () => {
    if (!favorites.length) {
      addToast('No saved books to export.', 'warning');
      return;
    }

    const headers = ['Title', 'Author', 'ISBN', 'Dewey Code', 'Bay Location', 'Available Copies', 'Total Copies'];
    const rows = favorites.map((b) => [
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.author.replace(/"/g, '""')}"`,
      `"${b.isbn || ''}"`,
      `"${b.deweyCode || ''}"`,
      `"${b.bayLocation || ''}"`,
      b.availableCopies ?? 0,
      b.totalCopies ?? 0,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Katipuneros_Wishlist_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    addToast('Wishlist CSV table exported successfully.', 'success');
  };

  return (
    <div className="w-full">
      {/* Toast Feedback Ribbon */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`p-4 rounded-xl shadow-xl flex items-center justify-between gap-3 text-small backdrop-blur-md transition-all ${
                t.type === 'success'
                  ? 'bg-action-green/90 text-text-primary'
                  : t.type === 'error'
                  ? 'bg-status-danger/90 text-white'
                  : t.type === 'warning'
                  ? 'bg-status-pending/90 text-text-primary'
                  : 'bg-surface-container-lowest/90 text-text-primary border border-outline-variant/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">
                  {t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info'}
                </span>
                <span>{t.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="opacity-70 hover:opacity-100 p-1"
                aria-label="Close notification"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Breadcrumbs & Header Section */}
      <section className="w-full pb-space-lg">
        <div className="flex flex-col gap-space-xs mb-space-md">
          <div className="flex items-center gap-space-xs font-caption text-caption text-secondary tracking-wider font-semibold uppercase">
            <span className="material-symbols-outlined text-base">bookmarks</span>
            <span>User Wishlist &amp; Saved Stacks</span>
            <span>•</span>
            <span>AY 2026–2027</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
            <div>
              <h1 className="font-headline-1 text-headline-1 text-text-primary tracking-tight">
                My Saved Books &amp; Wishlist
              </h1>
              <p className="font-body-large text-body-large text-text-secondary max-w-3xl mt-1">
                Curate your academic reading lists, track real-time physical stack inventory, and trigger batch reservation holds for pickup at the Circulation Desk.
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-space-sm shrink-0">
              <button
                type="button"
                onClick={() => setIsCreateListOpen(true)}
                className="h-11 px-space-md rounded-full bg-surface-container-lowest/80 hover:bg-surface-container-lowest text-text-primary font-small text-small font-medium shadow-sm transition-all duration-150 flex items-center gap-space-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">playlist_add</span>
                <span>+ Create Reading List</span>
              </button>

              <div className="flex items-center gap-1 bg-surface-container-lowest/80 p-1 rounded-full shadow-sm">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="h-9 px-3 rounded-full hover:bg-surface-container text-secondary font-small text-small font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  title="Export CSV Table"
                >
                  <span className="material-symbols-outlined text-base">table_view</span>
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportBibTeX}
                  className="h-9 px-3 rounded-full hover:bg-surface-container text-secondary font-small text-small font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  title="Export BibTeX Archive"
                >
                  <span className="material-symbols-outlined text-base">download</span>
                  <span>BibTeX</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleReserveAllAvailable}
                disabled={isReservingAll || availableCount === 0}
                className="h-11 px-space-lg rounded-full bg-action-green hover:bg-action-green-hover disabled:opacity-50 disabled:cursor-not-allowed text-text-primary font-small text-small font-semibold shadow-md hover:shadow-lg transition-all duration-150 flex items-center gap-space-xs cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">
                  {isReservingAll ? 'progress_activity' : 'shopping_bag_speed'}
                </span>
                <span>
                  {isReservingAll ? 'Reserving...' : `Reserve All Available (${availableCount})`}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Metrics Glass Cards ($N=0$ Safe) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md mt-space-md">
          {/* Total Saved */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest/70 backdrop-blur-md shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption uppercase text-text-secondary tracking-wider font-semibold">
                Total Saved
              </span>
              <span className="w-8 h-8 rounded-full bg-soft-blue flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                  favorite
                </span>
              </span>
            </div>
            <div className="mt-space-md">
              <div className="font-headline-2 text-headline-2 text-text-primary font-bold">
                {totalSaved} {totalSaved === 1 ? 'Title' : 'Titles'}
              </div>
              <p className="font-caption text-caption text-text-secondary mt-1">
                Saved to your personal collection
              </p>
            </div>
            <div className="w-full bg-surface-variant h-1.5 rounded-full mt-space-md overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all" style={{ width: totalSaved > 0 ? '100%' : '0%' }}></div>
            </div>
          </div>

          {/* Available for Hold */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest/70 backdrop-blur-md shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption uppercase text-text-secondary tracking-wider font-semibold">
                Available for Hold Now
              </span>
              <span className="w-8 h-8 rounded-full bg-status-available/20 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-lg">check_circle</span>
              </span>
            </div>
            <div className="mt-space-md">
              <div className="font-headline-2 text-headline-2 text-text-primary font-bold">
                {availableCount} {availableCount === 1 ? 'Title' : 'Titles'}
              </div>
              <p className="font-caption text-caption text-text-secondary mt-1">
                Ready in physical library stacks
              </p>
            </div>
            <div className="w-full bg-surface-variant h-1.5 rounded-full mt-space-md overflow-hidden">
              <div className="bg-action-green h-full rounded-full transition-all" style={{ width: `${availablePercent}%` }}></div>
            </div>
          </div>

          {/* Reading Lists */}
          <div className="p-space-lg rounded-xl bg-surface-container-lowest/70 backdrop-blur-md shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption uppercase text-text-secondary tracking-wider font-semibold">
                Reading Lists
              </span>
              <span className="w-8 h-8 rounded-full bg-soft-blue flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">collections_bookmark</span>
              </span>
            </div>
            <div className="mt-space-md">
              <div className="font-headline-2 text-headline-2 text-text-primary font-bold">
                {readingLists.length} {readingLists.length === 1 ? 'List' : 'Lists'}
              </div>
              <p className="font-caption text-caption text-text-secondary mt-1">
                Curated topical reading collections
              </p>
            </div>
            <div className="w-full bg-surface-variant h-1.5 rounded-full mt-space-md overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all" style={{ width: readingLists.length > 0 ? '100%' : '0%' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Reading Lists Tabs & Filter Navigation */}
      <section className="w-full py-space-md flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        {/* Filter Chips */}
        <div className="flex items-center gap-space-xs overflow-x-auto pb-1 max-w-xl">
          {readingLists.map((list) => {
            const isSelected = selectedList === list;
            return (
              <button
                key={list}
                type="button"
                onClick={() => setSelectedList(list)}
                className={`h-10 px-space-md rounded-full font-small text-small font-semibold shadow-sm flex items-center gap-space-xs shrink-0 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-lowest/80 hover:bg-surface-container-lowest text-text-primary'
                }`}
              >
                <span>{list}</span>
                {list === 'All Saved' && (
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-caption font-bold ${
                      isSelected ? 'bg-surface-container-lowest/20' : 'bg-surface-container text-text-secondary'
                    }`}
                  >
                    {totalSaved}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Controls: Search, Sort, View Layout Toggle */}
        <div className="flex items-center gap-space-sm flex-wrap sm:flex-nowrap">
          {/* Search */}
          <div className="flex items-center bg-surface-container-lowest/90 rounded-full px-space-md py-space-xs shadow-sm flex-1 sm:w-72">
            <span className="material-symbols-outlined text-text-secondary text-lg mr-space-xs">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title, author, call no..."
              className="w-full bg-transparent font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-text-secondary hover:text-text-primary"
                aria-label="Clear search"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="h-10 appearance-none bg-surface-container-lowest/90 font-small text-small text-text-primary pl-space-md pr-8 py-space-xs rounded-full shadow-sm cursor-pointer focus:outline-none"
            >
              <option value="recent">Sort: Recently Added</option>
              <option value="availability">Sort: Shelf Availability</option>
              <option value="title">Sort: Title (A-Z)</option>
              <option value="dewey">Sort: Dewey Decimal</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-2.5 text-text-secondary pointer-events-none text-base">
              expand_more
            </span>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-surface-container-lowest/90 p-1 rounded-full shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-primary text-on-primary shadow-xs' : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Grid View"
            >
              <span className="material-symbols-outlined text-lg">grid_view</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-primary text-on-primary shadow-xs' : 'text-text-secondary hover:text-text-primary'
              }`}
              title="List View"
            >
              <span className="material-symbols-outlined text-lg">view_list</span>
            </button>
          </div>
        </div>
      </section>

      {/* Saved Books Grid / List */}
      <section className="w-full py-space-md">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
            <p className="font-body-medium text-body-medium text-text-secondary">Syncing your saved reading lists...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="py-16 px-space-lg rounded-2xl bg-surface-container-lowest/60 border border-outline-variant/15 text-center flex flex-col items-center justify-center gap-space-md">
            <div className="w-16 h-16 rounded-full bg-soft-blue flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">bookmarks</span>
            </div>
            <div className="max-w-md">
              <h3 className="font-headline-3 text-headline-3 text-text-primary font-bold">
                {favorites.length === 0 ? 'Your Academic Wishlist is Empty' : 'No Matching Titles Found'}
              </h3>
              <p className="font-body-medium text-body-medium text-text-secondary mt-1">
                {favorites.length === 0
                  ? 'Explore the campus catalog to save monographs, monitor physical shelf availability, and place rapid counter holds.'
                  : 'Try adjusting your search keywords or switching reading list categories.'}
              </p>
            </div>
            {favorites.length === 0 ? (
              <Link
                to="/customer/catalog"
                className="h-11 px-space-lg rounded-full bg-primary text-on-primary font-small text-small font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-space-xs"
              >
                <span className="material-symbols-outlined text-lg">menu_book</span>
                <span>+ Explore Campus Catalog</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-space-md py-2 rounded-full bg-surface-container hover:bg-surface-variant font-small text-small text-text-primary cursor-pointer"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
            {filteredBooks.map((book) => {
              const isAvailable = (book.availableCopies ?? 0) > 0;
              const isReserving = reservingBookId === book.id;

              return (
                <div
                  key={book.id}
                  className="group relative flex flex-col justify-between rounded-xl bg-surface-container-lowest/80 backdrop-blur-md p-space-md shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="flex gap-space-md">
                    {/* Book Cover */}
                    <div className="w-28 h-40 shrink-0 rounded-lg overflow-hidden relative shadow-md bg-surface-container">
                      <img
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        alt={book.title}
                        src={book.coverImage || DEFAULT_COVER}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = DEFAULT_COVER;
                        }}
                      />
                      {book.deweyCode && (
                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 rounded-full bg-surface-container-lowest/90 font-caption text-caption text-text-primary font-bold shadow-xs">
                            {book.deweyCode}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-space-xs">
                        <span className="px-space-xs py-0.5 rounded font-caption text-caption font-semibold bg-soft-blue text-primary">
                          {book.bayLocation || 'General Stacks'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFavorite(book.id, book.title)}
                          className="text-status-danger hover:scale-110 transition-transform p-1 cursor-pointer"
                          title="Remove from saved books"
                          aria-label={`Remove ${book.title} from favorites`}
                        >
                          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                            favorite
                          </span>
                        </button>
                      </div>

                      <h3 className="font-headline-4 text-headline-4 text-text-primary mt-1 line-clamp-2 group-hover:text-primary transition-colors font-bold">
                        {book.title}
                      </h3>
                      <p className="font-small text-small text-text-secondary truncate mt-0.5">{book.author}</p>

                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="font-caption text-caption text-text-secondary font-mono">
                          ISBN: {book.isbn || 'N/A'}
                        </span>
                      </div>

                      {/* Stock Status Badge */}
                      <div className="mt-auto pt-space-xs">
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-caption text-caption font-semibold bg-status-available/20 text-text-primary">
                            <span className="w-2 h-2 rounded-full bg-status-available"></span>
                            Available ({book.availableCopies} Copies)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-caption text-caption font-semibold bg-status-danger/20 text-text-primary">
                            <span className="w-2 h-2 rounded-full bg-status-danger"></span>
                            Checked Out (0 in Stacks)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-space-md pt-space-md flex items-center justify-between gap-space-xs bg-surface-container-low/40 -mx-space-md -mb-space-md p-space-md rounded-b-xl border-t border-outline-variant/10">
                    <span className="font-caption text-caption text-text-secondary font-medium">
                      Published: {book.publishedYear || 2026}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleReserveBook(book)}
                      disabled={!isAvailable || isReserving}
                      className="h-9 px-space-md rounded-lg bg-action-green hover:bg-action-green-hover disabled:opacity-40 disabled:cursor-not-allowed text-text-primary font-small text-small font-semibold shadow-sm transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">
                        {isReserving ? 'progress_activity' : 'bookmark_add'}
                      </span>
                      <span>{isReserving ? 'Reserving...' : isAvailable ? 'Reserve' : 'Unavailable'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="flex flex-col gap-space-sm bg-surface-container-lowest/80 rounded-2xl p-space-md border border-outline-variant/15 shadow-sm">
            {filteredBooks.map((book) => {
              const isAvailable = (book.availableCopies ?? 0) > 0;
              const isReserving = reservingBookId === book.id;

              return (
                <div
                  key={book.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-space-md rounded-xl hover:bg-surface-container-low/60 transition-colors gap-space-md border-b border-outline-variant/10 last:border-b-0"
                >
                  <div className="flex items-center gap-space-md">
                    <img
                      src={book.coverImage || DEFAULT_COVER}
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded-md shadow-sm shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DEFAULT_COVER;
                      }}
                    />
                    <div>
                      <h4 className="font-headline-4 text-headline-4 text-text-primary font-bold">{book.title}</h4>
                      <p className="font-small text-small text-text-secondary">{book.author}</p>
                      <div className="flex items-center gap-2 mt-1 text-caption text-text-secondary font-mono">
                        <span>{book.bayLocation || 'General Stacks'}</span>
                        <span>•</span>
                        <span>{book.isbn}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-space-md justify-between sm:justify-end">
                    <span
                      className={`px-3 py-1 rounded-full font-caption text-caption font-semibold ${
                        isAvailable
                          ? 'bg-status-available/20 text-secondary'
                          : 'bg-status-danger/20 text-status-danger'
                      }`}
                    >
                      {isAvailable ? `${book.availableCopies} in Stacks` : 'Checked Out'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleReserveBook(book)}
                        disabled={!isAvailable || isReserving}
                        className="h-9 px-4 rounded-lg bg-action-green hover:bg-action-green-hover disabled:opacity-40 disabled:cursor-not-allowed text-text-primary font-small text-small font-semibold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-base">bookmark_add</span>
                        <span>Reserve</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveFavorite(book.id, book.title)}
                        className="p-2 text-status-danger hover:bg-status-danger/10 rounded-lg cursor-pointer transition-colors"
                        title="Remove from Wishlist"
                      >
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                          favorite
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal: Create Reading List */}
      {isCreateListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg max-w-md w-full shadow-2xl border border-outline-variant/20">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">playlist_add</span>
                <h3 className="font-headline-3 text-headline-3 text-text-primary font-bold">
                  New Reading List
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateListOpen(false)}
                className="text-text-secondary hover:text-text-primary p-1 rounded-full"
                aria-label="Close modal"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateList} className="flex flex-col gap-space-md">
              <div>
                <label className="block text-caption font-caption text-text-secondary uppercase mb-1">
                  List Name
                </label>
                <input
                  type="text"
                  required
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="e.g. Thesis Reference, Software Architecture"
                  className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-small font-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/20"
                />
              </div>

              <div className="flex justify-end gap-space-sm pt-space-xs">
                <button
                  type="button"
                  onClick={() => setIsCreateListOpen(false)}
                  className="px-space-md py-2 rounded-full bg-surface-container hover:bg-surface-variant font-small text-small text-text-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newListName.trim()}
                  className="px-space-lg py-2 rounded-full bg-primary text-on-primary hover:bg-primary-hover disabled:opacity-50 font-small text-small font-bold shadow-md cursor-pointer"
                >
                  Create List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
