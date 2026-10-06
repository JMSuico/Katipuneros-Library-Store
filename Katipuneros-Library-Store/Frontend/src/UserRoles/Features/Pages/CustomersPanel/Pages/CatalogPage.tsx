// [Layer: UserRoles/Features/Pages/CustomersPanel/Pages]
// CatalogPage.tsx -- Customer Book Catalog and OPAC Search
// Fully dynamic React 19 component wired to real backend endpoints.
// Adheres strictly to Zero Mock Data (N=0 empty state), Universal Lambda syntax (=>),
// and reactive toast notifications via useToasts.
import React, { FC, useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getCatalogBooks,
  getCatalogMetrics,
  getCategories,
  BackendBook,
  BackendCategory,
  CatalogMetrics,
} from '../../../../../Endpoints/booksApi';
import {
  getCustomerReservations,
  requestCustomerReservation,
  CustomerReservationRecord,
} from '../../../../../Endpoints/Customer/reservationApi';
import {
  getCustomerFavorites,
  toggleCustomerFavorite,
} from '../../../../../Endpoints/Customer/favoriteApi';
import { useToasts } from '../../../../../Hooks/useToasts';
import { usePagination } from '../../../../../Hooks/usePagination';
import { useTableDraggable } from '../../../../../Hooks/useTableDraggable';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400';
const MAX_RESERVE_QUOTA = 5;

const CatalogPage: FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toasts, addToast, removeToast } = useToasts();
  const { containerRef: categoryChipsRef } = useTableDraggable<HTMLDivElement>();

  // Primary Data State
  const [books, setBooks] = useState<BackendBook[]>([]);
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [metrics, setMetrics] = useState<CatalogMetrics | null>(null);
  const [reservations, setReservations] = useState<CustomerReservationRecord[]>([]);
  const [favoriteBookIds, setFavoriteBookIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [eraFilter, setEraFilter] = useState<string>('any');
  const [sortSequence, setSortSequence] = useState<string>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Interactive Book Detail Modal State
  const [selectedBook, setSelectedBook] = useState<BackendBook | null>(null);
  const [reservingBookId, setReservingBookId] = useState<string | null>(null);

  // Load Catalog Data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [fetchedBooks, fetchedCategories, fetchedMetrics, fetchedReservations, fetchedFavorites] =
        await Promise.all([
          getCatalogBooks(),
          getCategories(),
          getCatalogMetrics(),
          getCustomerReservations(),
          getCustomerFavorites(),
        ]);

      setBooks(fetchedBooks);
      setCategories(fetchedCategories);
      setMetrics(fetchedMetrics);
      setReservations(fetchedReservations);
      setFavoriteBookIds(new Set(fetchedFavorites.map((b) => b.id)));
    } catch (err: unknown) {
      console.error('Failed to load catalog data:', err);
      addToast('Error syncing catalog collection from server.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync Search URL params
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q);
    }
    const cat = searchParams.get('category');
    if (cat !== null && cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
  }, [searchParams]);

  // Derived Active Holds and Reserve Quota
  const activeHoldsCount = useMemo(() =>
    reservations.filter((r) => r.status === 0 || r.status === 1).length,
    [reservations]
  );

  const quotaPercent = useMemo(() =>
    Math.min(100, Math.round((activeHoldsCount / MAX_RESERVE_QUOTA) * 100)),
    [activeHoldsCount]
  );

  // Calculated Active Circulation Rate
  const circulationRate = useMemo(() => {
    if (!books.length) return '0.0%';
    const totalCopies = books.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
    if (totalCopies === 0) return '0.0%';
    const borrowedCopies = books.reduce(
      (acc, b) => acc + Math.max(0, (b.totalCopies || 0) - (b.availableCopies || 0)),
      0
    );
    const rate = (borrowedCopies / totalCopies) * 100;
    return `${rate.toFixed(1)}%`;
  }, [books]);

  // Total Catalog Volumes
  const totalCatalogVolumes = useMemo(() => {
    if (metrics?.totalTitles !== undefined) return metrics.totalTitles;
    return books.length;
  }, [metrics, books]);

  // Filter and Sort Books Pipeline
  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      // Query search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = book.title.toLowerCase().includes(q);
        const authorMatch = book.author.toLowerCase().includes(q);
        const isbnMatch = book.isbn.toLowerCase().includes(q);
        const deweyMatch = (book.deweyCode || '').toLowerCase().includes(q);
        const bayMatch = (book.bayLocation || '').toLowerCase().includes(q);
        if (!titleMatch && !authorMatch && !isbnMatch && !deweyMatch && !bayMatch) return false;
      }

      // Category filter
      if (selectedCategory !== 'all') {
        if (book.categoryId !== selectedCategory && book.category?.name !== selectedCategory) {
          return false;
        }
      }

      // Availability filter
      if (availabilityFilter === 'available') {
        if (book.availableCopies <= 0) return false;
      } else if (availabilityFilter === 'limited') {
        if (book.availableCopies <= 0 || book.availableCopies > 2) return false;
      } else if (availabilityFilter === 'waitlist') {
        if (book.availableCopies > 0) return false;
      }

      // Era filter
      if (eraFilter === '2020') {
        if (!book.publishedYear || book.publishedYear < 2020) return false;
      } else if (eraFilter === '2000') {
        if (!book.publishedYear || book.publishedYear < 2000 || book.publishedYear >= 2020) return false;
      } else if (eraFilter === 'classic') {
        if (!book.publishedYear || book.publishedYear >= 2000) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortSequence === 'az') {
        return a.title.localeCompare(b.title);
      } else if (sortSequence === 'newest') {
        const da = new Date(a.createdAt || 0).getTime();
        const db = new Date(b.createdAt || 0).getTime();
        return db - da;
      } else if (sortSequence === 'available') {
        return (b.availableCopies || 0) - (a.availableCopies || 0);
      }
      // 'popular' default: sorts by borrowed count / copies
      const aBorrowed = (a.totalCopies || 0) - (a.availableCopies || 0);
      const bBorrowed = (b.totalCopies || 0) - (b.availableCopies || 0);
      return bBorrowed - aBorrowed;
    });
  }, [books, searchQuery, selectedCategory, availabilityFilter, eraFilter, sortSequence]);

  // Pagination hook
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedBooks,
    goToPage,
    nextPage,
    prevPage,
    canNextPage,
    canPrevPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination(filteredBooks, { initialPageSize: 8 });

  // Reserve Handler
  const handleReserve = async (book: BackendBook) => {
    if (activeHoldsCount >= MAX_RESERVE_QUOTA) {
      addToast(`Hold limit reached (${MAX_RESERVE_QUOTA} max concurrent holds).`, 'warning');
      return;
    }

    setReservingBookId(book.id);
    try {
      const res = await requestCustomerReservation({ bookId: book.id });
      if (res.success) {
        addToast(
          book.availableCopies > 0
            ? `Hold confirmed for "${book.title}". Available at Circulation Desk for 48 hours.`
            : `Waitlist confirmed for "${book.title}". You will be notified upon return.`,
          'success'
        );
        const refreshed = await getCustomerReservations();
        setReservations(refreshed);
        if (selectedBook?.id === book.id) {
          setSelectedBook(null);
        }
      } else {
        addToast(res.message || 'Unable to place hold.', 'error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error processing reservation.';
      addToast(msg, 'error');
    } finally {
      setReservingBookId(null);
    }
  };

  // Favorite Toggle Handler
  const handleToggleFavorite = async (bookId: string, bookTitle: string) => {
    try {
      const { isFavorited } = await toggleCustomerFavorite(bookId);
      setFavoriteBookIds((prev) => {
        const next = new Set(prev);
        if (isFavorited) {
          next.add(bookId);
          addToast(`Added "${bookTitle}" to saved stacks.`, 'success');
        } else {
          next.delete(bookId);
          addToast(`Removed "${bookTitle}" from saved stacks.`, 'info');
        }
        return next;
      });
    } catch {
      addToast('Failed to update favorites.', 'error');
    }
  };

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setAvailabilityFilter('all');
    setEraFilter('any');
    setSortSequence('popular');
    setSearchParams({});
  };

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
        {/* Catalog Atmosphere Background Accents */}
        <div className="relative w-full overflow-hidden pb-space-3xl">
          <div className="absolute -top-12 left-1/4 w-96 h-96 bg-primary-fixed-dim/20 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-48 right-10 w-80 h-80 bg-action-green/15 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Section 1: Catalog Header & Dynamic Query Bar */}
          <div className="w-full flex flex-col gap-space-lg pt-space-md">
            {/* Title & Real Metrics Row */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
              <div className="flex flex-col gap-space-xs max-w-2xl">
                <div className="flex items-center gap-space-xs">
                  <span className="px-space-sm py-0.5 rounded-full bg-soft-blue text-primary font-caption text-caption uppercase tracking-wider font-semibold">
                    Scholastic Registry 2026
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-action-green" />
                  <span className="font-caption text-caption text-text-secondary">Direct Access Stacks</span>
                </div>
                <h1 className="font-headline-1 text-headline-1 text-text-primary tracking-tight">
                  Explore Scholastic Catalog
                </h1>
                <p className="font-body-large text-body-large text-text-secondary leading-relaxed">
                  Discover books, folios, and academic monographs curated across university categories from the Katipuneros archival repository.
                </p>
              </div>

              {/* Dynamic Metric Pill Summary */}
              <div className="flex items-center gap-space-sm bg-glass-surface backdrop-blur-xl p-space-sm rounded-2xl shadow-sm self-start lg:self-auto">
                <div className="px-space-md py-space-xs rounded-xl bg-surface-container-lowest/80 text-left">
                  <div className="font-caption text-caption text-text-secondary">Catalog Volumes</div>
                  <div className="font-headline-4 text-headline-4 text-primary">{totalCatalogVolumes.toLocaleString()}</div>
                </div>
                <div className="px-space-md py-space-xs rounded-xl bg-surface-container-lowest/80 text-left">
                  <div className="font-caption text-caption text-text-secondary">Active Circulation</div>
                  <div className="font-headline-4 text-headline-4 text-text-primary">{circulationRate}</div>
                </div>
              </div>
            </div>

            {/* Main Unified Control Deck */}
            <div className="w-full bg-glass-surface backdrop-blur-2xl rounded-2xl p-space-md shadow-[0_8px_30px_rgba(0,101,138,0.06)] flex flex-col gap-space-md">
              {/* Main Search Bar */}
              <div className="flex flex-col md:flex-row items-center gap-space-sm w-full">
                <div className="relative flex-1 w-full">
                  <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-primary text-xl pointer-events-none">
                    search
                  </span>
                  <input
                    className="w-full pl-12 pr-space-xl py-3.5 bg-surface-container-lowest/90 rounded-xl font-body text-body text-text-primary placeholder:text-text-secondary focus:outline-none focus:bg-surface-container-lowest transition-all shadow-sm"
                    id="catalog-search"
                    placeholder="Search by keyword, author, full title, or Dewey/ISBN code..."
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-space-sm top-1/2 -translate-y-1/2 px-space-sm py-1 rounded-lg bg-surface-container-high text-text-secondary font-caption text-caption hover:text-text-primary cursor-pointer"
                      type="button"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* View Modes & Action Buttons */}
                <div className="flex items-center gap-space-sm w-full md:w-auto shrink-0 justify-between md:justify-end">
                  <div className="flex items-center p-1 bg-surface-container-lowest/90 rounded-xl shadow-sm">
                    <button
                      aria-label="Grid View"
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                        viewMode === 'grid'
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-lg">grid_view</span>
                    </button>
                    <button
                      aria-label="List View"
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                        viewMode === 'list'
                          ? 'bg-primary text-on-primary shadow-sm'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-lg">view_list</span>
                    </button>
                  </div>

                  {/* Reset Filters Shortcut */}
                  {(searchQuery || selectedCategory !== 'all' || availabilityFilter !== 'all' || eraFilter !== 'any') && (
                    <button
                      onClick={handleResetFilters}
                      className="flex items-center gap-1 px-space-md py-3 rounded-xl bg-surface-container-high text-text-primary font-small text-small hover:bg-surface-variant transition-all cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-sm">restart_alt</span>
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Controls Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-space-sm pt-space-xs">
                {/* Availability Filter */}
                <div className="flex flex-col gap-1">
                  <label className="font-caption text-caption text-text-secondary px-1">Availability</label>
                  <div className="relative">
                    <select
                      value={availabilityFilter}
                      onChange={(e) => setAvailabilityFilter(e.target.value)}
                      className="w-full appearance-none bg-surface-container-lowest/80 text-text-primary font-small text-small px-space-md py-2.5 rounded-xl shadow-sm focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Copies ({books.length})</option>
                      <option value="available">Available Now</option>
                      <option value="limited">Limited Copies (&le; 2)</option>
                      <option value="waitlist">Checked Out / Waitlist</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-lg">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Publication Era Filter */}
                <div className="flex flex-col gap-1">
                  <label className="font-caption text-caption text-text-secondary px-1">Publication Era</label>
                  <div className="relative">
                    <select
                      value={eraFilter}
                      onChange={(e) => setEraFilter(e.target.value)}
                      className="w-full appearance-none bg-surface-container-lowest/80 text-text-primary font-small text-small px-space-md py-2.5 rounded-xl shadow-sm focus:outline-none cursor-pointer"
                    >
                      <option value="any">Any Era</option>
                      <option value="2020">Contemporary (2020–2026)</option>
                      <option value="2000">Modern Digital (2000–2019)</option>
                      <option value="classic">Classical Folios (&lt; 2000)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-lg">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="flex flex-col gap-1">
                  <label className="font-caption text-caption text-text-secondary px-1">Faculty Category</label>
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full appearance-none bg-surface-container-lowest/80 text-text-primary font-small text-small px-space-md py-2.5 rounded-xl shadow-sm focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-lg">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Sort Sequence */}
                <div className="flex flex-col gap-1">
                  <label className="font-caption text-caption text-text-secondary px-1">Sort Registry</label>
                  <div className="relative">
                    <select
                      value={sortSequence}
                      onChange={(e) => setSortSequence(e.target.value)}
                      className="w-full appearance-none bg-surface-container-lowest/80 text-text-primary font-small text-small px-space-md py-2.5 rounded-xl shadow-sm focus:outline-none cursor-pointer"
                    >
                      <option value="popular">Most Popular (Circulation)</option>
                      <option value="newest">Newest Additions</option>
                      <option value="az">Title: A to Z</option>
                      <option value="available">Highest Availability</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none text-lg">
                      swap_vert
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Horizontal Category Scroll Chips */}
            <div
              ref={categoryChipsRef}
              className="flex items-center gap-space-xs overflow-x-auto pb-space-xs pt-1 no-scrollbar cursor-grab active:cursor-grabbing select-none"
            >
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-space-md py-2 rounded-full font-body-medium text-body-medium font-semibold shadow-sm shrink-0 flex items-center gap-1.5 transition-transform cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-action-green text-text-primary hover:scale-105'
                    : 'bg-chip-unselected-bg text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest'
                }`}
                type="button"
              >
                <span>All Categories</span>
                <span className="text-caption font-mono bg-text-primary/10 px-1.5 py-0.5 rounded-full">
                  {books.length}
                </span>
              </button>
              {categories.map((cat) => {
                const count = books.filter((b) => b.categoryId === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-space-md py-2 rounded-full font-small text-small shrink-0 transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-on-primary font-semibold shadow-sm'
                        : 'bg-chip-unselected-bg text-text-secondary hover:text-text-primary hover:bg-surface-container-lowest'
                    }`}
                    type="button"
                  >
                    <span>{cat.name}</span>
                    {count > 0 && (
                      <span className="ml-1.5 text-caption font-mono opacity-80">({count})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Body: Multi-column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mt-space-lg items-start">
            {/* Sidebar: Quota & Physical Navigator (lg:col-span-3) */}
            <aside className="hidden lg:flex flex-col gap-space-md lg:col-span-3 sticky top-24">
              {/* User Reserve Quota Box */}
              <div className="bg-soft-blue/70 rounded-2xl p-space-md shadow-sm flex flex-col gap-space-xs relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="font-caption text-caption uppercase text-primary font-bold tracking-wider">
                    User Reserve Quota
                  </span>
                  <span className="font-caption text-caption text-text-primary font-semibold">
                    {activeHoldsCount} of {MAX_RESERVE_QUOTA} Used
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-surface-container-lowest/70 h-2.5 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-action-green h-full rounded-full transition-all duration-500"
                    style={{ width: `${quotaPercent}%` }}
                  />
                </div>
                <p className="font-caption text-caption text-text-secondary pt-1">
                  You can hold {Math.max(0, MAX_RESERVE_QUOTA - activeHoldsCount)} additional volume{Math.max(0, MAX_RESERVE_QUOTA - activeHoldsCount) === 1 ? '' : 's'} concurrently under Scholar privileges.
                </p>
              </div>

              {/* Physical Stacks Navigator Box */}
              <div className="bg-glass-surface backdrop-blur-xl rounded-2xl p-space-md shadow-sm flex flex-col gap-space-sm">
                <div className="flex items-center justify-between pb-space-xs">
                  <span className="font-headline-4 text-headline-4 text-text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary">shelves</span>
                    Stacks Overview
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-caption text-caption font-semibold">
                    Live
                  </span>
                </div>
                <p className="font-small text-small text-text-secondary">
                  Accession zones for physical retrieval in the library facility.
                </p>
                <div className="flex flex-col gap-2 pt-space-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-lowest/80 text-text-primary font-small text-small">
                    <span>Main Academic Stacks</span>
                    <span className="font-caption text-caption text-text-secondary">Floor 2</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-lowest/80 text-text-primary font-small text-small">
                    <span>Periodicals &amp; Serials</span>
                    <span className="font-caption text-caption text-text-secondary">Floor 1</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-lowest/80 text-text-primary font-small text-small">
                    <span>Circulation Desk Bays</span>
                    <span className="font-caption text-caption text-text-secondary">Ground Bay A-D</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Books Grid / List Section (lg:col-span-9) */}
            <section className="lg:col-span-9 flex flex-col gap-space-lg">
              {/* Results Count Bar */}
              <div className="flex items-center justify-between px-space-xs">
                <div className="flex items-center gap-space-xs">
                  <span className="font-body-medium text-body-medium font-semibold text-text-primary">
                    Showing {totalItems > 0 ? `${startIndex}–${endIndex}` : '0'} of {totalItems} Titles
                  </span>
                  <span className="font-caption text-caption text-text-secondary">• Real-time stacks sync</span>
                </div>
                {searchQuery && (
                  <span className="text-caption font-caption bg-surface-container-highest px-2.5 py-1 rounded-full text-text-primary">
                    Query: "{searchQuery}"
                  </span>
                )}
              </div>

              {/* Books Content */}
              {isLoading ? (
                <div className="p-space-3xl rounded-2xl bg-surface-container-lowest text-center flex flex-col items-center justify-center gap-space-md min-h-[360px]">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="font-body-medium text-body-medium text-text-secondary">
                    Loading scholastic collection...
                  </span>
                </div>
              ) : paginatedBooks.length > 0 ? (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md'
                      : 'grid grid-cols-1 gap-space-md'
                  }
                  id="book-catalog-container"
                >
                  {paginatedBooks.map((book) => {
                    const isFav = favoriteBookIds.has(book.id);
                    const isAvailable = book.availableCopies > 0;
                    const isReserving = reservingBookId === book.id;

                    if (viewMode === 'list') {
                      return (
                        <article
                          key={book.id}
                          className="bg-surface-container-lowest/90 rounded-2xl p-space-md shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md group"
                        >
                          <div className="flex items-center gap-space-md flex-1 min-w-0">
                            <div className="w-16 h-24 rounded-lg overflow-hidden bg-surface-container shrink-0 shadow-sm">
                              <img
                                className="w-full h-full object-cover"
                                alt={book.title}
                                src={book.coverImage || DEFAULT_COVER}
                              />
                            </div>
                            <div className="flex flex-col gap-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-caption text-caption uppercase text-primary font-semibold">
                                  {book.category?.name || 'General'}
                                </span>
                                <span className="text-text-secondary text-caption font-mono">
                                  {book.bayLocation ? `Bay ${book.bayLocation}` : 'Bay 01'}
                                </span>
                              </div>
                              <h3 className="font-headline-4 text-headline-4 text-text-primary group-hover:text-primary transition-colors font-semibold truncate">
                                {book.title}
                              </h3>
                              <p className="font-small text-small text-text-secondary truncate">
                                {book.author} • ISBN: {book.isbn}
                              </p>
                              <div className="flex items-center gap-2 pt-1">
                                <span
                                  className={`px-2 py-0.5 rounded-full font-caption text-caption font-semibold ${
                                    isAvailable
                                      ? 'bg-status-available text-surface-container-lowest'
                                      : 'bg-status-danger text-surface-container-lowest'
                                  }`}
                                >
                                  {isAvailable ? `${book.availableCopies} Copies Available` : '0 Available (Waitlist)'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                            <button
                              onClick={() => handleToggleFavorite(book.id, book.title)}
                              className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                                isFav
                                  ? 'bg-status-danger text-surface-container-lowest'
                                  : 'bg-surface-container text-text-secondary hover:text-status-danger'
                              }`}
                              title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                              type="button"
                            >
                              <span
                                className="material-symbols-outlined text-lg"
                                style={isFav ? { fontVariationSettings: "'FILL' 1" } : undefined}
                              >
                                favorite
                              </span>
                            </button>
                            <button
                              onClick={() => setSelectedBook(book)}
                              className="px-space-md py-2.5 rounded-xl bg-soft-blue text-primary font-small text-small font-medium hover:bg-soft-blue/80 transition-colors cursor-pointer"
                              type="button"
                            >
                              Inspect Stacks
                            </button>
                            <button
                              onClick={() => handleReserve(book)}
                              disabled={isReserving}
                              className="px-space-lg py-2.5 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                              type="button"
                            >
                              {isReserving ? 'Reserving...' : isAvailable ? 'Reserve' : 'Join Waitlist'}
                            </button>
                          </div>
                        </article>
                      );
                    }

                    // Default Grid View
                    return (
                      <article
                        key={book.id}
                        className="group bg-surface-container-lowest/90 rounded-2xl p-space-md shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
                      >
                        {/* Bookmark Button */}
                        <button
                          aria-label="Bookmark title"
                          onClick={() => handleToggleFavorite(book.id, book.title)}
                          className={`absolute top-space-md right-space-md z-10 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-colors shadow-sm cursor-pointer ${
                            isFav
                              ? 'bg-status-danger text-surface-container-lowest'
                              : 'bg-glass-surface text-text-secondary hover:text-status-danger'
                          }`}
                          type="button"
                        >
                          <span
                            className="material-symbols-outlined text-lg"
                            style={isFav ? { fontVariationSettings: "'FILL' 1" } : undefined}
                          >
                            favorite
                          </span>
                        </button>

                        {/* Book Cover Showcase */}
                        <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-surface-container shadow-inner mb-space-sm group-hover:scale-[1.02] transition-transform duration-300">
                          <img
                            className="w-full h-full object-cover"
                            alt={book.title}
                            src={book.coverImage || DEFAULT_COVER}
                          />
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-surface-container-lowest/95 backdrop-blur-sm font-caption text-caption text-primary font-mono font-semibold shadow-xs">
                            {book.deweyCode ? `Dewey: ${book.deweyCode}` : `ISBN: ${book.isbn.slice(-4)}`}
                          </span>
                        </div>

                        {/* Content & Metadata */}
                        <div className="flex flex-col gap-1 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-caption text-caption uppercase text-primary font-semibold tracking-wider truncate">
                              {book.category?.name || 'General'}
                            </span>
                            <div className="flex items-center gap-0.5 text-text-primary font-caption text-caption shrink-0">
                              <span
                                className="material-symbols-outlined text-action-green text-sm"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                star
                              </span>
                              <span className="font-semibold">4.8</span>
                            </div>
                          </div>
                          <h3 className="font-headline-4 text-headline-4 text-text-primary group-hover:text-primary transition-colors line-clamp-1 text-base font-semibold">
                            {book.title}
                          </h3>
                          <p className="font-small text-small text-text-secondary line-clamp-1">{book.author}</p>

                          {/* Stock Pill */}
                          <div className="pt-2 flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isAvailable ? 'bg-action-green' : 'bg-status-danger'
                              }`}
                            />
                            <span
                              className={`font-caption text-caption font-semibold ${
                                isAvailable ? 'text-status-available' : 'text-status-danger'
                              }`}
                            >
                              {isAvailable
                                ? `${book.availableCopies} Available in ${book.bayLocation || 'Bay A-01'}`
                                : '0 Available · Join Waitlist'}
                            </span>
                          </div>
                        </div>

                        {/* Action Footer */}
                        <div className="pt-space-md flex flex-col gap-space-xs mt-auto">
                          <button
                            onClick={() => handleReserve(book)}
                            disabled={isReserving}
                            className="w-full py-2.5 rounded-xl bg-action-green text-text-primary font-body-medium text-body-medium font-semibold hover:bg-action-green-hover transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-base">bookmark_add</span>
                            <span>{isReserving ? 'Reserving...' : isAvailable ? 'Reserve Book' : 'Join Waitlist'}</span>
                          </button>
                          <button
                            onClick={() => setSelectedBook(book)}
                            className="w-full py-2 rounded-xl bg-soft-blue/60 text-primary font-small text-small hover:bg-soft-blue transition-colors text-center font-medium cursor-pointer"
                            type="button"
                          >
                            View Details &amp; Stacks
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="p-space-3xl rounded-2xl bg-surface-container-lowest border border-border-card text-center flex flex-col items-center gap-space-md">
                  <span className="material-symbols-outlined text-5xl text-text-secondary">menu_book</span>
                  <div className="flex flex-col gap-1 max-w-md">
                    <p className="font-headline-3 text-headline-3 text-text-primary font-semibold">
                      No Catalog Volumes Found
                    </p>
                    <p className="font-body text-body text-text-secondary">
                      No books matched your active filter or search criteria. Try modifying your search keywords or resetting filters.
                    </p>
                  </div>
                  <button
                    onClick={handleResetFilters}
                    className="mt-space-xs px-space-lg py-2.5 rounded-full bg-primary text-on-primary font-body-medium text-body-medium font-semibold hover:bg-primary/90 transition-all cursor-pointer"
                    type="button"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}

              {/* Dynamic Pagination Controls */}
              {totalPages > 1 && (
                <div className="w-full bg-glass-surface backdrop-blur-xl rounded-2xl p-space-md shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md mt-space-md">
                  <div className="font-small text-small text-text-secondary flex items-center gap-1">
                    <span>Showing records</span>
                    <span className="font-semibold text-text-primary font-mono">
                      {startIndex} – {endIndex}
                    </span>
                    <span>of</span>
                    <span className="font-semibold text-text-primary font-mono">{totalItems}</span>
                    <span>volumes cataloged</span>
                  </div>

                  <nav aria-label="Pagination" className="flex items-center gap-1.5">
                    <button
                      aria-label="Previous Page"
                      onClick={prevPage}
                      disabled={!canPrevPage}
                      className="w-9 h-9 rounded-xl bg-surface-container-lowest/80 text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-base">chevron_left</span>
                    </button>

                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      const isActive = pageNum === currentPage;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`w-9 h-9 rounded-xl font-body-medium text-body-medium font-bold transition-all cursor-pointer flex items-center justify-center ${
                            isActive
                              ? 'bg-primary text-on-primary shadow-sm'
                              : 'bg-surface-container-lowest/80 text-text-primary hover:bg-surface-container-lowest'
                          }`}
                          type="button"
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      aria-label="Next Page"
                      onClick={nextPage}
                      disabled={!canNextPage}
                      className="w-9 h-9 rounded-xl bg-surface-container-lowest/80 text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-base">chevron_right</span>
                    </button>
                  </nav>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Book Details & Stacks Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-3xl max-w-2xl w-full p-space-xl shadow-2xl flex flex-col gap-space-lg relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-space-md right-space-md w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-variant flex items-center justify-center text-text-secondary transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="flex flex-col sm:flex-row gap-space-lg items-start">
              <div className="w-36 h-52 rounded-xl overflow-hidden bg-surface-container shrink-0 shadow-md">
                <img
                  className="w-full h-full object-cover"
                  alt={selectedBook.title}
                  src={selectedBook.coverImage || DEFAULT_COVER}
                />
              </div>

              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-caption text-caption font-semibold">
                    {selectedBook.category?.name || 'General'}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-caption text-caption font-semibold ${
                      selectedBook.availableCopies > 0
                        ? 'bg-status-available text-surface-container-lowest'
                        : 'bg-status-danger text-surface-container-lowest'
                    }`}
                  >
                    {selectedBook.availableCopies > 0
                      ? `${selectedBook.availableCopies} Available on Shelf`
                      : 'Checked Out (Waitlist Available)'}
                  </span>
                </div>

                <h3 className="font-headline-2 text-headline-2 text-text-primary font-bold">
                  {selectedBook.title}
                </h3>
                <p className="font-body text-body text-text-secondary">
                  by {selectedBook.author} {selectedBook.publishedYear ? `(${selectedBook.publishedYear})` : ''}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border-card text-small font-small">
                  <div>
                    <span className="text-text-secondary block font-caption text-caption">ISBN</span>
                    <span className="font-mono font-semibold text-text-primary">{selectedBook.isbn}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block font-caption text-caption">Accession Stacks Bay</span>
                    <span className="font-semibold text-text-primary">{selectedBook.bayLocation || 'Main Stacks Bay 01'}</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block font-caption text-caption">Total Physical Copies</span>
                    <span className="font-semibold text-text-primary">{selectedBook.totalCopies} copies</span>
                  </div>
                  <div>
                    <span className="text-text-secondary block font-caption text-caption">Dewey Classification</span>
                    <span className="font-mono font-semibold text-text-primary">{selectedBook.deweyCode || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {selectedBook.description && (
              <div className="flex flex-col gap-1 bg-surface-container/50 p-space-md rounded-2xl">
                <span className="font-caption text-caption uppercase text-text-secondary font-semibold">
                  Catalog Synopsis &amp; Abstract
                </span>
                <p className="font-body text-body text-text-secondary leading-relaxed">
                  {selectedBook.description}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-space-sm pt-space-xs border-t border-border-card">
              <button
                onClick={() => handleToggleFavorite(selectedBook.id, selectedBook.title)}
                className={`px-space-md py-2.5 rounded-xl font-body-medium text-body-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                  favoriteBookIds.has(selectedBook.id)
                    ? 'bg-status-danger text-surface-container-lowest'
                    : 'bg-surface-container text-text-secondary hover:text-status-danger'
                }`}
                type="button"
              >
                <span
                  className="material-symbols-outlined text-lg"
                  style={favoriteBookIds.has(selectedBook.id) ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  favorite
                </span>
                <span>{favoriteBookIds.has(selectedBook.id) ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
              </button>
              <button
                onClick={() => handleReserve(selectedBook)}
                disabled={reservingBookId === selectedBook.id}
                className="px-space-xl py-2.5 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-bold shadow-md transition-colors cursor-pointer disabled:opacity-50"
                type="button"
              >
                {reservingBookId === selectedBook.id
                  ? 'Reserving...'
                  : selectedBook.availableCopies > 0
                  ? 'Reserve Book Now'
                  : 'Join Waitlist'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Portal */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md pointer-events-none">
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

export default CatalogPage;
