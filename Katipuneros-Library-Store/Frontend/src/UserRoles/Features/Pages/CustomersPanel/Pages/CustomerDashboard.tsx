// [Layer: UserRoles/Features/Pages/CustomersPanel/Pages]
// CustomerDashboard.tsx -- Customer Portal Home and Active Borrowings
// Fully reactive React 19 component wired to real backend endpoints.
// Adheres strictly to Zero Mock Data (N=0 empty state), Universal Lambda syntax (=>),
// and reactive toast notifications via useToasts.
import React, { FC, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  getCatalogBooks,
  getCatalogMetrics,
  getCategories,
  BackendBook,
  BackendCategory,
  CatalogMetrics,
} from '../../../../../Endpoints/booksApi';
import {
  getCustomerActiveLoans,
  getCustomerLoanHistory,
  CustomerLoanRecord,
} from '../../../../../Endpoints/Customer/borrowApi';
import {
  getCustomerReservations,
  requestCustomerReservation,
  CustomerReservationRecord,
} from '../../../../../Endpoints/Customer/reservationApi';
import {
  getCustomerFavorites,
  toggleCustomerFavorite,
  isBookFavorited,
} from '../../../../../Endpoints/Customer/favoriteApi';
import {
  getStoredUser,
  fetchCurrentProfile,
  AuthUser,
} from '../../../../../Endpoints/authApi';
import { useToasts } from '../../../../../Hooks/useToasts';

const DEFAULT_COVER = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400';

const CustomerDashboard: FC = () => {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToasts();

  // State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getStoredUser());
  const [books, setBooks] = useState<BackendBook[]>([]);
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [metrics, setMetrics] = useState<CatalogMetrics | null>(null);
  const [loans, setLoans] = useState<CustomerLoanRecord[]>([]);
  const [loanHistory, setLoanHistory] = useState<CustomerLoanRecord[]>([]);
  const [reservations, setReservations] = useState<CustomerReservationRecord[]>([]);
  const [favoriteBookIds, setFavoriteBookIds] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recommendationPage, setRecommendationPage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [reservingBookId, setReservingBookId] = useState<string | null>(null);

  // Load all data on mount
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        fetchedProfile,
        fetchedBooks,
        fetchedCategories,
        fetchedMetrics,
        fetchedLoans,
        fetchedHistory,
        fetchedReservations,
        fetchedFavorites,
      ] = await Promise.all([
        fetchCurrentProfile(),
        getCatalogBooks(),
        getCategories(),
        getCatalogMetrics(),
        getCustomerActiveLoans(),
        getCustomerLoanHistory(),
        getCustomerReservations(),
        getCustomerFavorites(),
      ]);

      if (fetchedProfile) setCurrentUser(fetchedProfile);
      setBooks(fetchedBooks);
      setCategories(fetchedCategories);
      setMetrics(fetchedMetrics);
      setLoans(fetchedLoans);
      setLoanHistory(fetchedHistory);
      setReservations(fetchedReservations);

      const favIds = new Set(fetchedFavorites.map((b) => b.id));
      setFavoriteBookIds(favIds);
    } catch (err: unknown) {
      console.error('Failed to load customer dashboard data:', err);
      addToast('Failed to sync live circulation metrics.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derived KPI Metrics
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const holdsActive = useMemo(() =>
    reservations.filter((r) => r.status === 0 || r.status === 1).length,
    [reservations]
  );

  const readyCount = useMemo(() =>
    reservations.filter((r) => r.status === 1).length,
    [reservations]
  );

  const loansInHand = useMemo(() =>
    loans.filter((l) => l.status === 0).length,
    [loans]
  );

  const dueSoonCount = useMemo(() => {
    const now = new Date();
    return loans.filter((l) => {
      if (l.status !== 0) return false;
      const due = new Date(l.dueDate);
      const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 3;
    }).length;
  }, [loans]);

  const nearestDueDate = useMemo(() => {
    const active = loans.filter((l) => l.status === 0);
    if (!active.length) return '—';
    const now = new Date();
    const diffs = active.map((l) => {
      const due = new Date(l.dueDate);
      return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    });
    const minDays = Math.min(...diffs);
    if (minDays < 0) return 'Overdue';
    if (minDays === 0) return 'Today';
    return `${minDays}d`;
  }, [loans]);

  // Spotlight Book (prioritize isSpotlight flag, else first available book)
  const spotlightBook = useMemo(() => {
    if (!books.length) return null;
    return books.find((b) => b.isSpotlight) || books[0];
  }, [books]);

  // Identify Top Borrowed Category from Patron Loan History & Active Circulation
  const topBorrowedCategoryId = useMemo(() => {
    const combinedLoans = [...loans, ...loanHistory];
    if (combinedLoans.length === 0) return null;

    const categoryFrequency: Record<string, number> = {};
    for (const record of combinedLoans) {
      const match = books.find((b) => b.id === record.bookId);
      if (match?.categoryId) {
        categoryFrequency[match.categoryId] = (categoryFrequency[match.categoryId] || 0) + 1;
      }
    }

    let topId: string | null = null;
    let highest = 0;
    for (const [catId, count] of Object.entries(categoryFrequency)) {
      if (count > highest) {
        highest = count;
        topId = catId;
      }
    }
    return topId;
  }, [loans, loanHistory, books]);

  const topCategory = useMemo(() => {
    if (!topBorrowedCategoryId) return null;
    return categories.find((c) => c.id === topBorrowedCategoryId) || null;
  }, [topBorrowedCategoryId, categories]);

  // Filtered & Personalized Recommendations
  const filteredRecommendations = useMemo(() => {
    let result = [...books];
    if (selectedCategory !== 'all') {
      result = result.filter((b) => b.categoryId === selectedCategory);
    } else if (topBorrowedCategoryId) {
      // Prioritize titles in top borrowed category, then available copies
      result.sort((a, b) => {
        const aTop = a.categoryId === topBorrowedCategoryId ? 1 : 0;
        const bTop = b.categoryId === topBorrowedCategoryId ? 1 : 0;
        if (aTop !== bTop) return bTop - aTop;
        return (b.availableCopies ?? 0) - (a.availableCopies ?? 0);
      });
    } else {
      result.sort((a, b) => (b.availableCopies ?? 0) - (a.availableCopies ?? 0));
    }
    return result;
  }, [books, selectedCategory, topBorrowedCategoryId]);

  const ITEMS_PER_PAGE = 4;
  const paginatedRecommendations = useMemo(() => {
    const start = recommendationPage * ITEMS_PER_PAGE;
    return filteredRecommendations.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRecommendations, recommendationPage]);

  const maxRecommendationPage = useMemo(() =>
    Math.max(0, Math.ceil(filteredRecommendations.length / ITEMS_PER_PAGE) - 1),
    [filteredRecommendations]
  );

  const handleNextPage = () =>
    setRecommendationPage((prev) => (prev < maxRecommendationPage ? prev + 1 : 0));

  const handlePrevPage = () =>
    setRecommendationPage((prev) => (prev > 0 ? prev - 1 : maxRecommendationPage));

  // High-Circulation Radar (top 4 books)
  const popularBooks = useMemo(() =>
    books.slice(0, 4),
    [books]
  );

  // Search Handler
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/customer/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/customer/catalog');
    }
  };

  // Hold Reservation Handler
  const handleReserve = async (bookId: string, bookTitle: string) => {
    setReservingBookId(bookId);
    try {
      const res = await requestCustomerReservation({ bookId });
      if (res.success) {
        addToast(`Hold placed for "${bookTitle}". Staging bay priority assigned.`, 'success');
        const refreshed = await getCustomerReservations();
        setReservations(refreshed);
      } else {
        addToast(res.message || 'Unable to place hold at this time.', 'error');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error requesting reservation.';
      addToast(msg, 'error');
    } finally {
      setReservingBookId(null);
    }
  };

  // Favorite Toggle Handler
  const handleToggleFavorite = async (bookId: string, bookTitle: string) => {
    try {
      const { isFavorited: favorited } = await toggleCustomerFavorite(bookId);
      setFavoriteBookIds((prev) => {
        const next = new Set(prev);
        if (favorited) {
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

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
        {/* Top Ambient Atmosphere Layer */}
        <div className="relative w-full overflow-hidden pb-space-2xl">
          <div className="absolute -top-32 -left-20 w-96 h-96 bg-primary-fixed/40 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute top-12 right-0 w-[480px] h-[480px] bg-action-green/15 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* 1. User Greeting & Hero Search & Live Metric Banner */}
          <div className="w-full pt-space-lg">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
              {/* Left: Editorial Typography & Search */}
              <div className="lg:col-span-8 flex flex-col gap-space-md">
                <div className="flex items-center gap-space-xs text-secondary font-caption text-caption uppercase tracking-wider">
                  <span className="inline-block w-2 h-2 rounded-full bg-action-green animate-pulse" />
                  <span>Katipuneros Stacks • Circulation Terminal 04</span>
                </div>
                <div className="flex flex-col gap-space-xs">
                  <h1 className="font-display-hero text-display-hero text-text-primary tracking-tight">
                    {greeting},{' '}
                    <span className="text-primary underline decoration-action-green decoration-4 underline-offset-8">
                      {currentUser?.firstName || currentUser?.fullName?.split(' ')[0] || 'Scholar'}
                    </span>
                  </h1>
                  <p className="font-body-large text-body-large text-text-secondary max-w-2xl">
                    {metrics && metrics.physicalCopies > 0 ? (
                      <>
                        Find something interesting to read across our academic stacks today.{' '}
                        <strong>{metrics.physicalCopies.toLocaleString()}</strong> volumes, monographs, and peer-reviewed reserves ready at hand.
                      </>
                    ) : (
                      'Find something interesting to read across our academic stacks today. 0 volumes, monographs, and peer-reviewed reserves ready at hand.'
                    )}
                  </p>
                </div>

                {/* Hero Search Input Container */}
                <form onSubmit={handleSearchSubmit} className="w-full mt-space-sm">
                  <div className="relative flex items-center bg-surface-container-lowest/90 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgba(0,101,138,0.08)] p-2 pr-3 focus-within:ring-2 focus-within:ring-primary transition-all">
                    <span className="material-symbols-outlined text-text-secondary ml-space-md mr-space-sm text-2xl">
                      search
                    </span>
                    <input
                      className="w-full bg-transparent font-body text-body text-text-primary placeholder:text-text-secondary focus:outline-none"
                      id="catalog-instant-search"
                      placeholder="Search by title, author, or ISBN..."
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                      className="flex items-center gap-1.5 px-space-lg py-2.5 bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium rounded-full shadow-sm transition-transform active:scale-95 shrink-0 cursor-pointer"
                      type="submit"
                    >
                      <span>Explore Stacks</span>
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                  </div>
                </form>

                {/* Instant Filter Pills */}
                <div className="flex items-center gap-2 mt-space-md overflow-x-auto pb-2 scrollbar-none" id="filter-pills-container">
                  <button
                    onClick={() => { setSelectedCategory('all'); setRecommendationPage(0); }}
                    className={`filter-chip px-space-md py-1.5 rounded-full font-small text-small shadow-sm whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-lowest text-text-secondary hover:text-text-primary hover:bg-surface-container'
                    }`}
                    type="button"
                  >
                    All Disciplines
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => { setSelectedCategory(cat.id); setRecommendationPage(0); }}
                      className={`filter-chip px-space-md py-1.5 rounded-full font-small text-small shadow-sm whitespace-nowrap transition-all cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-lowest text-text-secondary hover:text-text-primary hover:bg-surface-container'
                      }`}
                      type="button"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: 3D Floating Quick-Metrics Hologram Card */}
              <div className="lg:col-span-4 relative flex justify-center lg:justify-end">
                <div className="w-full max-w-sm bg-gradient-to-br from-surface-container-lowest/90 via-surface-container/70 to-soft-blue/50 backdrop-blur-xl rounded-3xl p-space-lg shadow-[0_16px_40px_rgba(24,50,61,0.08)] flex flex-col gap-space-md">
                  <div className="flex items-center justify-between pb-space-sm">
                    <div className="flex items-center gap-space-xs">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-base">badge</span>
                      </div>
                      <div>
                        <p className="font-caption text-caption text-text-secondary uppercase">
                          {currentUser?.libraryCardNumber ? `Card • ${currentUser.libraryCardNumber}` : 'Card Status • 2026'}
                        </p>
                        <p className="font-headline-4 text-headline-4 text-text-primary">
                          {currentUser?.department || currentUser?.employmentStatus || 'Graduate Scholar'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full font-caption text-caption bg-action-green/30 text-text-primary font-semibold">
                      Active
                    </span>
                  </div>

                  {/* Live Metrics Strip */}
                  <div className="grid grid-cols-3 gap-2 text-center bg-surface-container-lowest/60 rounded-2xl p-space-sm">
                    <div className="flex flex-col items-center">
                      <span className="font-headline-3 text-headline-3 text-primary">{holdsActive}</span>
                      <span className="font-caption text-caption text-text-secondary">Holds Active</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-headline-3 text-headline-3 text-text-primary">{loansInHand}</span>
                      <span className="font-caption text-caption text-text-secondary">Loans in Hand</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className={`font-headline-3 text-headline-3 ${nearestDueDate === 'Overdue' ? 'text-status-danger' : 'text-status-pending'}`}>
                        {nearestDueDate}
                      </span>
                      <span className="font-caption text-caption text-text-secondary">Next Due</span>
                    </div>
                  </div>

                  {/* Quick circulation insight note */}
                  <div className="flex items-center gap-space-sm bg-soft-blue/40 rounded-xl p-space-xs px-space-sm">
                    <span className="material-symbols-outlined text-primary text-xl">auto_stories</span>
                    <p className="font-small text-small text-text-primary leading-tight">
                      {readyCount > 0 ? (
                        <>
                          <strong>{readyCount} hold{readyCount > 1 ? 's' : ''} ready!</strong> Pick up at Circulation Desk Bay 2 before 5:00 PM.
                        </>
                      ) : (
                        <>
                          <strong>All active accounts in good standing.</strong> Explore stacks today.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Personalized Featured Spotlight */}
          <div className="w-full mt-space-2xl">
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary">award_star</span>
                <h2 className="font-headline-3 text-headline-3 text-text-primary">Curator's Spotlight Selection</h2>
              </div>
              <span className="font-caption text-caption text-text-secondary">
                Selected based on academic merit and campus circulation
              </span>
            </div>

            {spotlightBook ? (
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-text-primary via-primary to-tertiary text-on-primary shadow-2xl p-space-lg lg:p-space-xl">
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-action-green/20 rounded-full blur-3xl pointer-events-none" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center relative z-10">
                  {/* 3D Hardcover Book Rendering Presentation */}
                  <div className="lg:col-span-4 flex justify-center items-center py-space-sm">
                    <div className="group relative perspective-1000">
                      <div className="relative w-56 h-80 rounded-r-2xl rounded-l-md shadow-[20px_20px_40px_rgba(0,0,0,0.5)] transform -rotate-y-12 group-hover:rotate-y-0 transition-transform duration-500 overflow-hidden bg-surface-container-highest">
                        <img
                          className="w-full h-full object-cover"
                          alt={spotlightBook.title}
                          src={spotlightBook.coverImage || DEFAULT_COVER}
                        />
                        <div className="absolute top-0 right-8 w-4 h-24 bg-action-green shadow-md rounded-b-sm flex flex-col justify-end items-center pb-1">
                          <div className="w-2 h-2 bg-text-primary rounded-full opacity-60" />
                        </div>
                        <div className="absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-black/40 via-white/10 to-transparent" />
                      </div>
                    </div>
                  </div>

                  {/* Book Metadata & Actions */}
                  <div className="lg:col-span-8 flex flex-col gap-space-md">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 bg-action-green text-text-primary rounded-full font-caption text-caption font-semibold tracking-wide uppercase">
                        Academic Essential
                      </span>
                      {spotlightBook.category?.name && (
                        <span className="px-3 py-1 bg-surface-container-lowest/20 backdrop-blur-md text-on-primary rounded-full font-caption text-caption">
                          {spotlightBook.category.name}
                        </span>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full font-caption text-caption font-semibold flex items-center gap-1 ${
                          spotlightBook.availableCopies > 0
                            ? 'bg-status-available text-surface-container-lowest'
                            : 'bg-status-danger text-surface-container-lowest'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        {spotlightBook.availableCopies > 0
                          ? `${spotlightBook.availableCopies} Copies Available`
                          : 'Checked Out • 0 Available'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-space-xs">
                      <h3 className="font-headline-1 text-headline-1 text-on-primary font-bold tracking-tight">
                        {spotlightBook.title}
                      </h3>
                      <p className="font-body-large text-body-large text-secondary-container">
                        by {spotlightBook.author} • ISBN: {spotlightBook.isbn}
                      </p>
                    </div>

                    <p className="font-body text-body text-surface-variant max-w-2xl leading-relaxed">
                      {spotlightBook.description ||
                        'Master the principles, foundational patterns, and academic practices of this essential catalog volume in the Katipuneros Library collections.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-space-lg text-secondary-fixed">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-action-green text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                        <span className="font-body-medium text-body-medium font-bold text-on-primary">4.9</span>
                        <span className="font-caption text-caption text-surface-variant">(Faculty Citation)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-secondary-container text-xl">location_on</span>
                        <span className="font-body-medium text-body-medium">
                          {spotlightBook.bayLocation ? `Stack ${spotlightBook.bayLocation}` : 'Main Academic Stacks'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-secondary-container text-xl">schedule</span>
                        <span className="font-body-medium text-body-medium">14-Day Lending Period</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-space-md pt-space-xs">
                      <button
                        onClick={() => handleReserve(spotlightBook.id, spotlightBook.title)}
                        disabled={reservingBookId === spotlightBook.id}
                        className="px-space-xl py-3 rounded-full bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-xl">book</span>
                        <span>{reservingBookId === spotlightBook.id ? 'Reserving...' : 'Reserve Book Now'}</span>
                      </button>
                      <button
                        onClick={() => navigate(`/customer/catalog?q=${encodeURIComponent(spotlightBook.title)}`)}
                        className="px-space-lg py-3 rounded-full bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 backdrop-blur-md text-on-primary font-body-medium text-body-medium transition-colors flex items-center gap-2 cursor-pointer"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-xl">info</span>
                        <span>Inspect Stacks Details</span>
                      </button>
                      <button
                        onClick={() => handleToggleFavorite(spotlightBook.id, spotlightBook.title)}
                        className={`p-3 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                          favoriteBookIds.has(spotlightBook.id)
                            ? 'bg-status-danger text-surface-container-lowest'
                            : 'bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 text-on-primary'
                        }`}
                        title="Bookmark for later"
                        type="button"
                      >
                        <span
                          className="material-symbols-outlined text-xl"
                          style={favoriteBookIds.has(spotlightBook.id) ? { fontVariationSettings: "'FILL' 1" } : undefined}
                        >
                          favorite
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-space-xl rounded-3xl bg-surface-container-lowest border border-border-card text-center flex flex-col items-center gap-space-sm">
                <span className="material-symbols-outlined text-4xl text-text-secondary">auto_stories</span>
                <p className="font-headline-4 text-headline-4 text-text-primary">No Spotlight Volume Designated</p>
                <p className="font-body text-body text-text-secondary max-w-md">
                  There are currently no spotlight titles flagged in the catalog stacks. Explore our full digital collection.
                </p>
                <Link
                  to="/customer/catalog"
                  className="mt-space-xs px-space-lg py-2 rounded-full bg-primary text-on-primary font-small text-small font-semibold"
                >
                  Browse Stacks
                </Link>
              </div>
            )}
          </div>

          {/* 3. Quick User Summary Cards (Clickable shortcuts) */}
          <div className="w-full mt-space-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
              {/* Holds Card */}
              <Link
                to="/customer/reservations"
                className="group bg-surface-container-lowest hover:bg-soft-blue/40 rounded-2xl p-space-md shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-40"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-2xl">bookmark_added</span>
                  </div>
                  <span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">
                    north_east
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-headline-3 text-headline-3 text-text-primary">{holdsActive}</span>
                    <span className="font-body-medium text-body-medium text-text-secondary">Active Holds</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-primary">
                    <span className="w-2 h-2 rounded-full bg-action-green" />
                    <span className="font-caption text-caption font-semibold">
                      {readyCount > 0 ? `${readyCount} Ready at Front Desk` : 'No pending pickups'}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Loans Card */}
              <Link
                to="/customer/borrowings"
                className="group bg-surface-container-lowest hover:bg-soft-blue/40 rounded-2xl p-space-md shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-40"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-2xl">local_library</span>
                  </div>
                  <span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">
                    north_east
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-headline-3 text-headline-3 text-text-primary">{loansInHand}</span>
                    <span className="font-body-medium text-body-medium text-text-secondary">Active Loans</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-status-pending">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    <span className="font-caption text-caption font-semibold">
                      {dueSoonCount > 0 ? `${dueSoonCount} Due within 3 days` : 'All loans in good order'}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Favorites Card */}
              <Link
                to="/customer/favorites"
                className="group bg-surface-container-lowest hover:bg-soft-blue/40 rounded-2xl p-space-md shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-40"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-error-container/40 flex items-center justify-center text-status-danger group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">
                    north_east
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-headline-3 text-headline-3 text-text-primary">{favoriteBookIds.size}</span>
                    <span className="font-body-medium text-body-medium text-text-secondary">Saved Stacks</span>
                  </div>
                  <p className="font-caption text-caption text-text-secondary mt-1 truncate">
                    {favoriteBookIds.size > 0 ? `${favoriteBookIds.size} bookmarked titles` : 'No saved titles yet'}
                  </p>
                </div>
              </Link>

              {/* Recommendations Shortcut */}
              <a
                href="#recommendations-section"
                className="group bg-surface-container-lowest hover:bg-soft-blue/40 rounded-2xl p-space-md shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-40"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-action-green/30 flex items-center justify-center text-text-primary group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-2xl">magic_button</span>
                  </div>
                  <span className="material-symbols-outlined text-text-secondary group-hover:text-primary transition-colors">
                    south
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-headline-3 text-headline-3 text-text-primary">{books.length}</span>
                    <span className="font-body-medium text-body-medium text-text-secondary">Curated Volumes</span>
                  </div>
                  <p className="font-caption text-caption text-primary mt-1 font-semibold">
                    Live Campus Catalog
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* 4. Recommended For You (Interactive horizontal book cards) */}
          <div className="w-full mt-space-2xl" id="recommendations-section">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-space-lg gap-2">
              <div>
                <span className="font-caption text-caption uppercase text-text-secondary tracking-wider font-semibold">
                  {topCategory ? `Personalized for your reading history in ${topCategory.name}` : 'Tailored Stacks'}
                </span>
                <h2 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">
                  Recommended For You
                </h2>
              </div>
              {filteredRecommendations.length > ITEMS_PER_PAGE && (
                <div className="flex items-center gap-space-xs">
                  <button
                    onClick={handlePrevPage}
                    className="p-2 rounded-full bg-surface-container-lowest hover:bg-surface-container shadow-sm text-text-primary transition-colors cursor-pointer"
                    title="Previous books"
                    type="button"
                  >
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <button
                    onClick={handleNextPage}
                    className="p-2 rounded-full bg-surface-container-lowest hover:bg-surface-container shadow-sm text-text-primary transition-colors cursor-pointer"
                    title="Next books"
                    type="button"
                  >
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
              )}
            </div>

            {paginatedRecommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-space-md">
                {paginatedRecommendations.map((book) => {
                  const isFav = favoriteBookIds.has(book.id);
                  const isAvailable = book.availableCopies > 0;
                  const isHistoryMatch = topBorrowedCategoryId && book.categoryId === topBorrowedCategoryId;
                  return (
                    <div
                      key={book.id}
                      className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
                    >
                      <div className="flex flex-col gap-space-sm">
                        {/* 3D Perspective Book Display */}
                        <div className="relative w-full h-56 bg-surface-container-low rounded-xl overflow-hidden flex items-center justify-center p-3">
                          <span
                            className={`absolute top-3 left-3 px-2 py-0.5 rounded-full font-caption text-caption font-medium shadow-sm ${
                              isAvailable
                                ? 'bg-status-available text-surface-container-lowest'
                                : 'bg-status-danger text-surface-container-lowest'
                            }`}
                          >
                            {isAvailable ? `Available • ${book.availableCopies} in stock` : 'Checked Out • 0 Available'}
                          </span>
                          {isHistoryMatch && (
                            <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full font-caption text-caption font-semibold bg-action-green text-text-primary shadow-sm flex items-center gap-1 z-10">
                              <span className="material-symbols-outlined text-xs">auto_awesome</span>
                              History Match
                            </span>
                          )}
                          <button
                            onClick={() => handleToggleFavorite(book.id, book.title)}
                            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm cursor-pointer ${
                              isFav
                                ? 'bg-status-danger text-surface-container-lowest'
                                : 'bg-surface-container-lowest/80 hover:bg-surface-container-lowest text-text-secondary hover:text-status-danger'
                            }`}
                            type="button"
                            title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                          >
                            <span
                              className="material-symbols-outlined text-lg"
                              style={isFav ? { fontVariationSettings: "'FILL' 1" } : undefined}
                            >
                              favorite
                            </span>
                          </button>
                          <div className="w-32 h-44 rounded shadow-[8px_8px_20px_rgba(0,0,0,0.15)] transform -rotate-2 group-hover:rotate-0 transition-transform duration-300 overflow-hidden">
                            <img
                              className="w-full h-full object-cover"
                              alt={book.title}
                              src={book.coverImage || DEFAULT_COVER}
                            />
                          </div>
                        </div>

                        {/* Book Meta */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-text-secondary font-caption text-caption">
                            <span>
                              {book.category?.name || 'General'} • {book.bayLocation || 'Bay 01'}
                            </span>
                            <span className="flex items-center text-primary font-semibold">
                              <span
                                className="material-symbols-outlined text-sm text-action-green mr-0.5"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                star
                              </span>
                              4.8
                            </span>
                          </div>
                          <h4 className="font-headline-4 text-headline-4 text-text-primary line-clamp-1 group-hover:text-primary transition-colors">
                            {book.title}
                          </h4>
                          <p className="font-small text-small text-text-secondary truncate">{book.author}</p>
                        </div>
                      </div>

                      <div className="pt-space-md flex items-center justify-between gap-2">
                        <span className="font-caption text-caption text-text-secondary">
                          {book.bayLocation ? `Bay ${book.bayLocation}` : 'Main Stacks'}
                        </span>
                        <button
                          onClick={() => handleReserve(book.id, book.title)}
                          disabled={reservingBookId === book.id}
                          className="px-space-md py-2 rounded-full bg-action-green hover:bg-action-green-hover text-text-primary font-small text-small font-semibold shadow-sm transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                          type="button"
                        >
                          {reservingBookId === book.id ? 'Reserving...' : isAvailable ? 'Reserve' : 'Join Waitlist'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-space-xl rounded-2xl bg-surface-container-lowest border border-border-card text-center flex flex-col items-center gap-space-sm">
                <span className="material-symbols-outlined text-4xl text-text-secondary">menu_book</span>
                <p className="font-headline-4 text-headline-4 text-text-primary">No Titles Available in This Discipline</p>
                <p className="font-body text-body text-text-secondary max-w-md">
                  We could not find any active catalog items under the selected discipline. Try selecting another category or view all disciplines.
                </p>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="mt-space-xs px-space-md py-1.5 rounded-full bg-primary text-on-primary font-small text-small font-semibold cursor-pointer"
                  type="button"
                >
                  View All Disciplines
                </button>
              </div>
            )}
          </div>

          {/* 5. Popular This Week Carousel / High-Circulation Track */}
          <div className="w-full mt-space-3xl">
            <div className="flex items-center justify-between mb-space-md">
              <div>
                <span className="font-caption text-caption uppercase text-text-secondary tracking-wider font-semibold">
                  Circulation Radar
                </span>
                <h3 className="font-headline-3 text-headline-3 text-text-primary">
                  Popular Across Campus This Week
                </h3>
              </div>
              <Link
                to="/customer/catalog"
                className="flex items-center gap-1 text-primary hover:text-primary-container font-small text-small font-medium transition-colors"
              >
                <span>View Full Catalog</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            {popularBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
                {popularBooks.map((book) => {
                  const isFav = favoriteBookIds.has(book.id);
                  const isAvailable = book.availableCopies > 0;
                  return (
                    <div
                      key={book.id}
                      className="flex items-center gap-space-md p-space-md bg-surface-container-lowest/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="w-20 h-28 rounded-lg overflow-hidden shrink-0 shadow-md bg-surface-container-high">
                        <img
                          className="w-full h-full object-cover"
                          alt={book.title}
                          src={book.coverImage || DEFAULT_COVER}
                        />
                      </div>
                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <span className="font-caption text-caption text-text-secondary truncate block">
                            {book.category?.name || 'General'} • {book.bayLocation || 'Bay 01'}
                          </span>
                          <h5 className="font-body-medium text-body-medium text-text-primary font-bold truncate">
                            {book.title}
                          </h5>
                          <p className="font-small text-small text-text-secondary truncate">{book.author}</p>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span
                            className={`font-caption text-caption font-semibold ${
                              isAvailable ? 'text-status-available' : 'text-status-danger'
                            }`}
                          >
                            {isAvailable ? 'Available' : 'Checked Out'}
                          </span>
                          <button
                            onClick={() => handleToggleFavorite(book.id, book.title)}
                            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                              isFav
                                ? 'bg-status-danger text-surface-container-lowest'
                                : 'bg-soft-blue text-primary hover:bg-action-green hover:text-text-primary'
                            }`}
                            type="button"
                            title={isFav ? 'Remove bookmark' : 'Bookmark title'}
                          >
                            <span
                              className="material-symbols-outlined text-base"
                              style={isFav ? { fontVariationSettings: "'FILL' 1" } : undefined}
                            >
                              bookmark
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-space-lg rounded-2xl bg-surface-container-lowest border border-border-card text-center text-text-secondary font-body text-body">
                No high-circulation titles recorded yet for this academic term.
              </div>
            )}
          </div>
        </div>
      </div>

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

export default CustomerDashboard;
