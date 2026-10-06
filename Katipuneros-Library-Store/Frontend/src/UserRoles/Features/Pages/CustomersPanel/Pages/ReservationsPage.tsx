// [Layer: UserRoles/Features/Pages/CustomersPanel/Pages]
// ReservationsPage.tsx -- Customer Active Holds, Pickups, and Reservation Ledger
// Connects to Endpoints/Customer/reservationApi.ts for hold ledger and cancellation.
// Expresses all sync and async routines via clean lambda expressions.
import { FC, useState, useEffect, useMemo, useCallback } from 'react';
import {
  getCustomerReservations,
  cancelCustomerReservation,
  CustomerReservationRecord,
} from '../../../../../Endpoints/Customer/reservationApi';
import { useToasts } from '../../../../../Hooks/useToasts';
import { usePagesGlobalRefresh } from '../../../../../Hooks/usePagesGlobalRefresh';

type TabType = 'all' | 'pending' | 'ready' | 'completed' | 'cancelled';

const isPending = (status: number | string) =>
  status === 1 || String(status).toLowerCase() === 'pending';

const isReady = (status: number | string) =>
  status === 2 ||
  String(status).toLowerCase() === 'stagedinlocker' ||
  String(status).toLowerCase() === 'ready_for_pickup' ||
  String(status).toLowerCase() === 'ready';

const isFulfilled = (status: number | string) =>
  status === 3 ||
  String(status).toLowerCase() === 'fulfilled' ||
  String(status).toLowerCase() === 'completed';

const isCancelledOrExpired = (status: number | string) =>
  status === 4 ||
  status === 5 ||
  String(status).toLowerCase() === 'cancelled' ||
  String(status).toLowerCase() === 'expired';

const ReservationsPage: FC = () => {
  const { toasts, addToast, removeToast } = useToasts();
  const [reservations, setReservations] = useState<CustomerReservationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [targetReservation, setTargetReservation] = useState<CustomerReservationRecord | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('mind');
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const [pickupModalOpen, setPickupModalOpen] = useState<boolean>(false);
  const [selectedPickup, setSelectedPickup] = useState<CustomerReservationRecord | null>(null);

  const fetchReservations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCustomerReservations();
      setReservations(data);
    } catch (err) {
      console.error('Failed to load reservations:', err);
      addToast('Unable to synchronize reservation ledger.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  usePagesGlobalRefresh(fetchReservations);

  // Metrics computation ($N=0$ safe)
  const metrics = useMemo(() => {
    const active = reservations.filter((r) => isPending(r.status) || isReady(r.status)).length;
    const ready = reservations.filter((r) => isReady(r.status)).length;
    const completed = reservations.filter((r) => isFulfilled(r.status)).length;
    const cancelled = reservations.filter((r) => isCancelledOrExpired(r.status)).length;
    return { active, ready, completed, cancelled };
  }, [reservations]);

  // Primary Spotlight Ready Card
  const topReadyReservation = useMemo(() => {
    return reservations.find((r) => isReady(r.status)) || null;
  }, [reservations]);

  // Primary Spotlight Pending Card
  const topPendingReservation = useMemo(() => {
    return reservations.find((r) => isPending(r.status)) || null;
  }, [reservations]);

  // Filtered Reservations for display
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      // Tab matching
      let tabMatch = true;
      if (activeTab === 'pending') tabMatch = isPending(r.status);
      else if (activeTab === 'ready') tabMatch = isReady(r.status);
      else if (activeTab === 'completed') tabMatch = isFulfilled(r.status);
      else if (activeTab === 'cancelled') tabMatch = isCancelledOrExpired(r.status);

      if (!tabMatch) return false;

      // Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = r.book?.title?.toLowerCase().includes(q) || false;
        const authorMatch = r.book?.author?.toLowerCase().includes(q) || false;
        const idMatch = r.id.toLowerCase().includes(q);
        return titleMatch || authorMatch || idMatch;
      }

      return true;
    });
  }, [reservations, activeTab, searchQuery]);

  // Historical table items (Fulfilled or Cancelled or when specific tabs chosen)
  const historyReservations = useMemo(() => {
    return reservations.filter((r) => isFulfilled(r.status) || isCancelledOrExpired(r.status));
  }, [reservations]);

  // Cancellation handler
  const handleOpenCancelModal = (res: CustomerReservationRecord) => {
    setTargetReservation(res);
    setCancelReason('mind');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!targetReservation) return;
    setIsCancelling(true);
    try {
      const res = await cancelCustomerReservation(targetReservation.id);
      if (res.success) {
        addToast(res.message || `Hold #${targetReservation.id.slice(0, 8)} successfully cancelled.`, 'success');
        setCancelModalOpen(false);
        setTargetReservation(null);
        await fetchReservations();
      } else {
        addToast(res.message || 'Unable to cancel this reservation hold.', 'error');
      }
    } catch (err) {
      console.error('Cancellation error:', err);
      addToast('Could not process cancellation request.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  // CSV Export for historical records
  const handleExportCsv = () => {
    if (historyReservations.length === 0) {
      addToast('No completed reservation records to export.', 'info');
      return;
    }

    const headers = ['Hold Reference', 'Book Title', 'Author', 'Reserved Date', 'Fulfilled Date', 'Status', 'Locker Bay'];
    const rows = historyReservations.map((r) => [
      `"${r.id}"`,
      `"${r.book?.title || 'Unknown Title'}"`,
      `"${r.book?.author || 'Unknown Author'}"`,
      `"${new Date(r.reservationDate).toLocaleDateString()}"`,
      `"${r.fulfilledDate ? new Date(r.fulfilledDate).toLocaleDateString() : 'N/A'}"`,
      `"${isFulfilled(r.status) ? 'Fulfilled' : 'Cancelled/Expired'}"`,
      `"${r.lockerBay || 'N/A'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reservations_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(`Exported ${historyReservations.length} reservation records.`, 'success');
  };

  return (
    <div className="w-full">
      <div className="flex flex-col w-full">
        {/* Subtle Ambient Glow Orbs */}
        <div className="relative w-full overflow-hidden pb-space-3xl">
          <div className="absolute -top-24 right-1/4 w-96 h-96 rounded-full bg-secondary-container/40 blur-3xl pointer-events-none -z-10"></div>
          <div className="absolute top-72 -left-20 w-80 h-80 rounded-full bg-soft-blue/50 blur-3xl pointer-events-none -z-10"></div>

          {/* Section: Header & Stat Strip */}
          <div className="flex flex-col gap-space-lg pt-space-lg">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
              <div className="flex flex-col gap-space-xs max-w-3xl">
                <div className="flex items-center gap-space-xs">
                  <span className="font-caption text-caption uppercase tracking-wider text-tertiary bg-white/70 px-space-sm py-0.5 rounded-full shadow-sm">
                    Academic User Ledger
                  </span>
                  <span className="text-outline-variant">•</span>
                  <span className="font-caption text-caption text-text-secondary">
                    AY 2026-2027 Circulation
                  </span>
                </div>
                <h1 className="font-headline-1 text-headline-1 text-text-primary tracking-tight">
                  My Book Reservations
                </h1>
                <p className="font-body-medium text-body-medium text-text-secondary">
                  Track your pending requests, approved holds ready for front-desk pickup, and active reservation ledger.
                </p>
              </div>
              <div className="flex items-center gap-space-sm shrink-0">
                <button
                  className="flex items-center gap-space-xs px-space-md py-space-sm bg-surface-container-lowest text-text-primary hover:bg-surface-container rounded-full shadow-sm transition-all font-small text-small cursor-pointer"
                  onClick={fetchReservations}
                  type="button"
                >
                  <span className={`material-symbols-outlined text-lg text-primary ${loading ? 'animate-spin' : ''}`}>
                    sync
                  </span>
                  <span>Refresh Ledger</span>
                </button>
                <a
                  className="flex items-center gap-space-xs px-space-lg py-space-sm bg-action-green text-text-primary hover:bg-action-green-hover rounded-full shadow-sm transition-transform active:scale-95 font-body-medium text-body-medium"
                  href="/customer/catalog"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  <span>Reserve New Title</span>
                </a>
              </div>
            </div>

            {/* Quick Metrics Ribbon ($N=0$ Safe) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-md">
              <div className="bg-surface-container-lowest/80 backdrop-blur-md p-space-md rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-secondary uppercase">Active Holds</span>
                  <span className="font-headline-2 text-headline-2 text-text-primary">
                    {metrics.active < 10 ? `0${metrics.active}` : metrics.active}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full bg-soft-blue/70 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">menu_book</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest/80 backdrop-blur-md p-space-md rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-secondary uppercase">Ready for Pickup</span>
                  <div className="flex items-center gap-space-xs">
                    <span className="font-headline-2 text-headline-2 text-text-primary">
                      {metrics.ready < 10 ? `0${metrics.ready}` : metrics.ready}
                    </span>
                    {metrics.ready > 0 && (
                      <span className="w-2.5 h-2.5 rounded-full bg-action-green animate-ping"></span>
                    )}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-action-green/20 flex items-center justify-center text-text-primary">
                  <span className="material-symbols-outlined text-2xl">counter_1</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest/80 backdrop-blur-md p-space-md rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-secondary uppercase">Completed History</span>
                  <span className="font-headline-2 text-headline-2 text-text-primary">
                    {metrics.completed < 10 ? `0${metrics.completed}` : metrics.completed}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-text-secondary">
                  <span className="material-symbols-outlined text-2xl">verified</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest/80 backdrop-blur-md p-space-md rounded-xl shadow-sm flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-caption text-caption text-text-secondary uppercase">Cancelled / Expired</span>
                  <span className="font-headline-2 text-headline-2 text-text-secondary">
                    {metrics.cancelled < 10 ? `0${metrics.cancelled}` : metrics.cancelled}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-full bg-error-container/40 flex items-center justify-center text-status-danger">
                  <span className="material-symbols-outlined text-2xl">cancel</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Filter Chips & Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md mt-space-xl">
            {/* Status Tabs */}
            <div className="flex items-center gap-space-xs overflow-x-auto pb-space-xs md:pb-0 scrollbar-none">
              <button
                className={`px-space-md py-space-xs rounded-full font-small text-small shadow-sm shrink-0 transition-colors cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'bg-chip-unselected-bg text-on-surface-variant hover:bg-surface-container-highest'
                }`}
                onClick={() => setActiveTab('all')}
                type="button"
              >
                All Reservations ({reservations.length})
              </button>
              <button
                className={`px-space-md py-space-xs rounded-full font-small text-small shadow-sm shrink-0 transition-colors cursor-pointer ${
                  activeTab === 'pending'
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'bg-chip-unselected-bg text-on-surface-variant hover:bg-surface-container-highest'
                }`}
                onClick={() => setActiveTab('pending')}
                type="button"
              >
                Pending Approval{' '}
                <span className="ml-1 font-caption bg-status-pending/20 text-text-primary px-1.5 py-0.2 rounded-full">
                  {reservations.filter((r) => isPending(r.status)).length}
                </span>
              </button>
              <button
                className={`px-space-md py-space-xs rounded-full font-small text-small shadow-sm shrink-0 transition-colors cursor-pointer ${
                  activeTab === 'ready'
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'bg-chip-unselected-bg text-on-surface-variant hover:bg-surface-container-highest'
                }`}
                onClick={() => setActiveTab('ready')}
                type="button"
              >
                Ready for Pickup{' '}
                <span className="ml-1 font-caption bg-action-green/30 text-text-primary px-1.5 py-0.2 rounded-full">
                  {metrics.ready}
                </span>
              </button>
              <button
                className={`px-space-md py-space-xs rounded-full font-small text-small shadow-sm shrink-0 transition-colors cursor-pointer ${
                  activeTab === 'completed'
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'bg-chip-unselected-bg text-on-surface-variant hover:bg-surface-container-highest'
                }`}
                onClick={() => setActiveTab('completed')}
                type="button"
              >
                Completed History ({metrics.completed})
              </button>
              <button
                className={`px-space-md py-space-xs rounded-full font-small text-small shadow-sm shrink-0 transition-colors cursor-pointer ${
                  activeTab === 'cancelled'
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'bg-chip-unselected-bg text-on-surface-variant hover:bg-surface-container-highest'
                }`}
                onClick={() => setActiveTab('cancelled')}
                type="button"
              >
                Cancelled ({metrics.cancelled})
              </button>
            </div>

            {/* Quick Filter Search */}
            <div className="flex items-center bg-surface-container-lowest/90 px-space-md py-space-xs rounded-full shadow-sm max-w-sm w-full">
              <span className="material-symbols-outlined text-text-secondary text-lg mr-space-xs">filter_list</span>
              <input
                className="w-full bg-transparent font-small text-small text-text-primary placeholder:text-text-secondary focus:outline-none"
                placeholder="Filter by Title or Hold ID..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="text-text-secondary hover:text-text-primary ml-1"
                  onClick={() => setSearchQuery('')}
                  type="button"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Section: Active Queue Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg mt-space-lg">
            {/* Card 1: Ready for Pickup (Green Attention) */}
            <div className="lg:col-span-7 bg-surface-container-lowest/90 backdrop-blur-xl rounded-xl p-space-lg shadow-md hover:shadow-lg transition-all flex flex-col justify-between relative overflow-hidden">
              {topReadyReservation ? (
                <>
                  <div className="flex items-start justify-between gap-space-md pb-space-md">
                    <div className="flex items-center gap-space-sm">
                      <span className="flex items-center gap-1.5 px-space-md py-1 rounded-full bg-action-green text-text-primary font-caption text-caption shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-text-primary"></span>
                        Ready for Pickup
                      </span>
                      <span className="font-caption text-caption text-text-secondary tracking-mono">
                        #{topReadyReservation.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-caption text-caption bg-secondary-container/50 text-on-secondary-container px-space-sm py-1 rounded-full">
                      {topReadyReservation.lockerBay ? `Bay ${topReadyReservation.lockerBay}` : 'Circulation Desk'}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-space-lg my-space-sm">
                    {/* Book Cover */}
                    <div className="relative w-full sm:w-36 h-52 shrink-0 rounded-lg overflow-hidden shadow-md bg-surface-variant flex items-center justify-center">
                      {topReadyReservation.book?.coverImage ? (
                        <img
                          className="w-full h-full object-cover"
                          src={topReadyReservation.book.coverImage}
                          alt={topReadyReservation.book.title}
                        />
                      ) : (
                        <span className="material-symbols-outlined text-4xl text-outline-variant">book</span>
                      )}
                      <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-text-primary/90 to-transparent">
                        <span className="font-caption text-caption text-surface-container-lowest block truncate">
                          {topReadyReservation.book?.deweyCode ? `Call: ${topReadyReservation.book.deweyCode}` : 'Front Desk Bay'}
                        </span>
                      </div>
                    </div>

                    {/* Reservation Details Content */}
                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <div className="flex items-center gap-space-xs text-primary font-small text-small mb-1">
                          <span className="material-symbols-outlined text-base">local_library</span>
                          <span>{topReadyReservation.pickupBranch || 'Katipuneros Central Stacks'}</span>
                        </div>
                        <h2 className="font-headline-3 text-headline-3 text-text-primary truncate">
                          {topReadyReservation.book?.title || 'Academic Reserved Volume'}
                        </h2>
                        <p className="font-small text-small text-text-secondary">
                          by {topReadyReservation.book?.author || 'Catalog Contributor'} • ISBN {topReadyReservation.book?.isbn || 'N/A'}
                        </p>

                        {/* Expiration Countdown Bar */}
                        <div className="mt-space-md p-space-sm rounded-lg bg-secondary-fixed/50 flex flex-col gap-1">
                          <div className="flex items-center justify-between text-on-secondary-fixed font-caption text-caption">
                            <span className="flex items-center gap-1 font-medium">
                              <span className="material-symbols-outlined text-base">alarm</span>
                              Pickup Deadline
                            </span>
                            <span className="font-medium text-text-primary">
                              {topReadyReservation.expiryDate
                                ? new Date(topReadyReservation.expiryDate).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : 'Within 48 Hours'}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-action-green rounded-full w-4/5"></div>
                          </div>
                          <span className="font-caption text-caption text-text-secondary text-right">
                            Held at staging counter ready for handover
                          </span>
                        </div>
                      </div>

                      {/* Loan Metadata Badges */}
                      <div className="grid grid-cols-2 gap-space-xs mt-space-md pt-space-xs">
                        <div className="bg-surface-container-low p-space-xs rounded-lg">
                          <span className="font-caption text-caption text-text-secondary block">Checkout Loan</span>
                          <span className="font-small text-small text-text-primary font-medium">14 Days Window</span>
                        </div>
                        <div className="bg-surface-container-low p-space-xs rounded-lg">
                          <span className="font-caption text-caption text-text-secondary block">Assigned Bay</span>
                          <span className="font-small text-small text-text-primary font-medium">
                            {topReadyReservation.lockerBay ? `Counter Bay ${topReadyReservation.lockerBay}` : 'Bay A-01'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rapid Front Desk Scanner Strip & Actions */}
                  <div className="mt-space-md pt-space-md flex flex-col md:flex-row items-center justify-between gap-space-md bg-surface-container-low/60 -mx-space-lg -mb-space-lg p-space-lg rounded-b-xl">
                    <div className="flex items-center gap-space-md w-full md:w-auto">
                      <div className="p-2 bg-surface-container-lowest rounded-lg shadow-sm flex items-center justify-center shrink-0">
                        <svg className="w-32 h-10 text-text-primary" fill="currentColor" viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
                          <rect height="40" width="3" x="0" y="0"></rect>
                          <rect height="40" width="2" x="5" y="0"></rect>
                          <rect height="40" width="5" x="9" y="0"></rect>
                          <rect height="40" width="2" x="16" y="0"></rect>
                          <rect height="40" width="4" x="20" y="0"></rect>
                          <rect height="40" width="2" x="26" y="0"></rect>
                          <rect height="40" width="6" x="30" y="0"></rect>
                          <rect height="40" width="2" x="38" y="0"></rect>
                          <rect height="40" width="3" x="42" y="0"></rect>
                          <rect height="40" width="5" x="47" y="0"></rect>
                          <rect height="40" width="2" x="54" y="0"></rect>
                          <rect height="40" width="4" x="58" y="0"></rect>
                          <rect height="40" width="3" x="64" y="0"></rect>
                          <rect height="40" width="6" x="69" y="0"></rect>
                          <rect height="40" width="2" x="77" y="0"></rect>
                          <rect height="40" width="4" x="81" y="0"></rect>
                          <rect height="40" width="2" x="87" y="0"></rect>
                          <rect height="40" width="5" x="91" y="0"></rect>
                          <rect height="40" width="3" x="98" y="0"></rect>
                          <rect height="40" width="4" x="103" y="0"></rect>
                          <rect height="40" width="2" x="109" y="0"></rect>
                          <rect height="40" width="4" x="113" y="0"></rect>
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-caption text-caption text-text-secondary">Express Verification Code</span>
                        <span className="font-small text-small text-text-primary font-medium tracking-mono">
                          SCAN-BAY-{topReadyReservation.id.slice(0, 6).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-space-xs w-full md:w-auto justify-end">
                      <button
                        className="px-space-md py-space-xs bg-surface-container-lowest text-text-primary hover:bg-surface-container rounded-full shadow-sm font-small text-small transition-colors flex items-center gap-1 cursor-pointer"
                        onClick={() =>
                          addToast(`Pickup slip #${topReadyReservation.id.slice(0, 8)} ready at circulation bay.`, 'info')
                        }
                        type="button"
                      >
                        <span className="material-symbols-outlined text-base">download</span>
                        <span>User Slip</span>
                      </button>
                      <button
                        className="px-space-lg py-space-xs bg-action-green text-text-primary hover:bg-action-green-hover rounded-full shadow-sm font-small text-small font-medium transition-transform active:scale-95 flex items-center gap-1 cursor-pointer"
                        onClick={() => {
                          setSelectedPickup(topReadyReservation);
                          setPickupModalOpen(true);
                        }}
                        type="button"
                      >
                        <span className="material-symbols-outlined text-base">directions_walk</span>
                        <span>Pickup Guide</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-16 px-space-lg text-center flex flex-col items-center justify-center gap-space-sm h-full">
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline-variant">
                    <span className="material-symbols-outlined text-3xl">counter_0</span>
                  </div>
                  <h3 className="font-headline-3 text-headline-3 text-text-primary">No Holds Ready for Pickup</h3>
                  <p className="font-body-medium text-body-medium text-text-secondary max-w-md">
                    When your requested books are verified and staged at the circulation bay, your express barcode and pickup directions will appear here.
                  </p>
                </div>
              )}
            </div>

            {/* Card 2: Pending Approval (Amber Attention) */}
            <div className="lg:col-span-5 bg-surface-container-lowest/90 backdrop-blur-xl rounded-xl p-space-lg shadow-md hover:shadow-lg transition-all flex flex-col justify-between">
              {topPendingReservation ? (
                <>
                  <div>
                    {/* Header Tag */}
                    <div className="flex items-start justify-between gap-space-sm pb-space-md">
                      <span className="flex items-center gap-1.5 px-space-md py-1 rounded-full bg-status-pending/20 text-text-primary font-caption text-caption">
                        <span className="material-symbols-outlined text-sm text-status-pending">hourglass_top</span>
                        Pending Staff Verification
                      </span>
                      <span className="font-caption text-caption text-text-secondary tracking-mono">
                        #{topPendingReservation.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>

                    {/* Book Synopsis Mini Card */}
                    <div className="flex gap-space-md mt-space-xs">
                      <div className="w-24 h-32 shrink-0 rounded-lg overflow-hidden shadow-sm bg-surface-variant flex items-center justify-center">
                        {topPendingReservation.book?.coverImage ? (
                          <img
                            className="w-full h-full object-cover"
                            src={topPendingReservation.book.coverImage}
                            alt={topPendingReservation.book.title}
                          />
                        ) : (
                          <span className="material-symbols-outlined text-3xl text-outline-variant">menu_book</span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-caption text-caption text-tertiary">
                          {topPendingReservation.pickupBranch || 'Katipuneros Main Stacks'}
                        </span>
                        <h3 className="font-headline-4 text-headline-4 text-text-primary truncate">
                          {topPendingReservation.book?.title || 'Academic Title'}
                        </h3>
                        <p className="font-small text-small text-text-secondary line-clamp-1">
                          {topPendingReservation.book?.author || 'Author'}
                        </p>
                        <div className="mt-space-sm flex flex-wrap gap-space-xs">
                          <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-surface-container text-text-secondary">
                            Queue Position: #{topPendingReservation.queuePosition || 1}
                          </span>
                          <span className="font-caption text-caption px-2 py-0.5 rounded-full bg-secondary-fixed/40 text-on-secondary-fixed">
                            Priority Hold
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Request Details */}
                    <div className="mt-space-lg bg-surface-container-low p-space-md rounded-xl flex flex-col gap-space-sm">
                      <div className="flex justify-between items-center text-small font-small">
                        <span className="text-text-secondary">Requested Date</span>
                        <span className="text-text-primary font-medium">
                          {new Date(topPendingReservation.reservationDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-small font-small">
                        <span className="text-text-secondary">Requested Duration</span>
                        <span className="text-text-primary font-medium">14 Days Loan</span>
                      </div>
                      <div className="flex justify-between items-center text-small font-small">
                        <span className="text-text-secondary">Estimated Pick-up Availability</span>
                        <span className="text-text-primary font-medium">
                          {topPendingReservation.expiryDate
                            ? new Date(topPendingReservation.expiryDate).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Within 24 Hours'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-small font-small">
                        <span className="text-text-secondary">Circulation Stacks</span>
                        <span className="text-text-primary font-medium">Central Reserve</span>
                      </div>
                    </div>
                  </div>

                  {/* Pending Actions */}
                  <div className="mt-space-lg pt-space-md flex items-center justify-between gap-space-sm">
                    <button
                      className="px-space-md py-space-xs text-status-danger hover:bg-error-container/40 rounded-full font-small text-small transition-colors flex items-center gap-1 cursor-pointer"
                      onClick={() => handleOpenCancelModal(topPendingReservation)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                      <span>Cancel Reservation</span>
                    </button>
                    <button
                      className="px-space-md py-space-xs bg-surface-container text-text-primary hover:bg-surface-container-high rounded-full font-small text-small transition-colors flex items-center gap-1 cursor-pointer"
                      onClick={() =>
                        addToast(`Request #${topPendingReservation.id.slice(0, 8)} is awaiting cashier desk sign-off.`, 'info')
                      }
                      type="button"
                    >
                      <span className="material-symbols-outlined text-base">info</span>
                      <span>Inspect Request</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-16 px-space-lg text-center flex flex-col items-center justify-center gap-space-sm h-full">
                  <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center text-outline-variant">
                    <span className="material-symbols-outlined text-3xl">hourglass_empty</span>
                  </div>
                  <h3 className="font-headline-3 text-headline-3 text-text-primary">No Pending Holds</h3>
                  <p className="font-body-medium text-body-medium text-text-secondary max-w-sm">
                    You have no hold requests currently awaiting staff approval. Browse the catalog to place new holds.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section: Reservation History & Past Logs */}
          <div className="mt-space-2xl flex flex-col gap-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs">
              <div>
                <h2 className="font-headline-3 text-headline-3 text-text-primary">
                  Completed &amp; Historical Reservations
                </h2>
                <p className="font-small text-small text-text-secondary">
                  Verified record of all fulfilled circulation checkouts and released holds.
                </p>
              </div>
              {/* Table quick stats & CSV Export */}
              <div className="flex items-center gap-space-xs text-caption font-caption text-text-secondary bg-white/60 px-space-md py-1 rounded-full shadow-sm">
                <span>
                  Showing {filteredReservations.length} of {reservations.length} records
                </span>
                <span>•</span>
                <button
                  className="text-primary hover:underline font-medium cursor-pointer"
                  onClick={handleExportCsv}
                  type="button"
                >
                  Download CSV
                </button>
              </div>
            </div>

            {/* High-Density Academic Table */}
            <div className="w-full bg-surface-container-lowest/90 backdrop-blur-xl rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low text-text-secondary font-caption text-caption uppercase tracking-wider">
                      <th className="py-space-md px-space-lg">Hold Reference</th>
                      <th className="py-space-md px-space-md">Book / Catalog Title</th>
                      <th className="py-space-md px-space-md">Reserved / Fulfilled</th>
                      <th className="py-space-md px-space-md">Fulfillment Desk</th>
                      <th className="py-space-md px-space-md">Status</th>
                      <th className="py-space-md px-space-lg text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-0 text-small font-small">
                    {filteredReservations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-text-secondary">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-3xl text-outline-variant">inbox</span>
                            <span className="font-body-medium text-body-medium">
                              No reservation records found in this view.
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredReservations.map((item) => {
                        const isItemFulfilled = isFulfilled(item.status);
                        const isItemReady = isReady(item.status);
                        const isItemPending = isPending(item.status);
                        const isItemCancelled = isCancelledOrExpired(item.status);

                        return (
                          <tr key={item.id} className="hover:bg-surface-container-low/40 transition-colors">
                            <td className="py-space-md px-space-lg font-medium text-text-primary">
                              #{item.id.slice(0, 8).toUpperCase()}
                              <span className="block font-caption text-caption text-text-secondary">
                                {isItemReady
                                  ? 'Ready at Bay'
                                  : isItemPending
                                  ? `Queue #${item.queuePosition || 1}`
                                  : 'Standard 14D'}
                              </span>
                            </td>
                            <td className="py-space-md px-space-md">
                              <div className="flex items-center gap-space-sm">
                                <div className="w-8 h-10 rounded bg-surface-container overflow-hidden shrink-0 flex items-center justify-center">
                                  {item.book?.coverImage ? (
                                    <img
                                      className="w-full h-full object-cover"
                                      src={item.book.coverImage}
                                      alt={item.book.title}
                                    />
                                  ) : (
                                    <span className="material-symbols-outlined text-xs text-text-secondary">
                                      book
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-text-primary font-medium truncate max-w-xs">
                                    {item.book?.title || 'Academic Title'}
                                  </span>
                                  <span className="font-caption text-caption text-text-secondary truncate max-w-xs">
                                    {item.book?.author || 'Author Unknown'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-space-md px-space-md text-text-secondary">
                              <span>
                                {new Date(item.reservationDate).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                              {item.fulfilledDate ? (
                                <span className="block font-caption text-caption text-status-available">
                                  Fulfilled {new Date(item.fulfilledDate).toLocaleDateString()}
                                </span>
                              ) : isItemReady ? (
                                <span className="block font-caption text-caption text-action-green">
                                  Expires {new Date(item.expiryDate).toLocaleDateString()}
                                </span>
                              ) : isItemPending ? (
                                <span className="block font-caption text-caption text-status-pending">
                                  Awaiting checkout
                                </span>
                              ) : (
                                <span className="block font-caption text-caption text-status-danger">
                                  Released from holds
                                </span>
                              )}
                            </td>
                            <td className="py-space-md px-space-md text-text-primary">
                              <span>
                                {item.lockerBay ? `Bay ${item.lockerBay}` : item.pickupBranch || 'Main Circulation Desk'}
                              </span>
                            </td>
                            <td className="py-space-md px-space-md">
                              {isItemReady && (
                                <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-action-green/30 text-text-primary font-caption text-caption">
                                  <span className="material-symbols-outlined text-xs text-action-green">check_circle</span>
                                  Ready
                                </span>
                              )}
                              {isItemPending && (
                                <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-status-pending/20 text-text-primary font-caption text-caption">
                                  <span className="material-symbols-outlined text-xs text-status-pending">hourglass_top</span>
                                  Pending
                                </span>
                              )}
                              {isItemFulfilled && (
                                <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-status-available/20 text-text-primary font-caption text-caption">
                                  <span className="material-symbols-outlined text-xs text-status-available">verified</span>
                                  Fulfilled
                                </span>
                              )}
                              {isItemCancelled && (
                                <span className="inline-flex items-center gap-1 px-space-sm py-0.5 rounded-full bg-error-container/40 text-status-danger font-caption text-caption">
                                  <span className="material-symbols-outlined text-xs text-status-danger">cancel</span>
                                  Cancelled
                                </span>
                              )}
                            </td>
                            <td className="py-space-md px-space-lg text-right">
                              {isItemPending ? (
                                <button
                                  className="text-status-danger hover:underline transition-colors font-caption text-caption cursor-pointer"
                                  onClick={() => handleOpenCancelModal(item)}
                                  type="button"
                                >
                                  Cancel Hold
                                </button>
                              ) : isItemReady ? (
                                <button
                                  className="text-primary hover:underline transition-colors font-caption text-caption cursor-pointer"
                                  onClick={() => {
                                    setSelectedPickup(item);
                                    setPickupModalOpen(true);
                                  }}
                                  type="button"
                                >
                                  Pickup Info
                                </button>
                              ) : (
                                <button
                                  className="text-text-secondary hover:text-text-primary transition-colors font-caption text-caption underline cursor-pointer"
                                  onClick={() =>
                                    addToast(`Hold reference #${item.id.slice(0, 8)} archived in circulation system.`, 'info')
                                  }
                                  type="button"
                                >
                                  Receipt
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL: Cancel Reservation Confirmation */}
        {cancelModalOpen && targetReservation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-text-primary/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-xl shadow-2xl flex flex-col gap-space-md relative">
              <button
                className="absolute top-space-md right-space-md p-space-xs rounded-full hover:bg-surface-container text-text-secondary transition-colors cursor-pointer"
                onClick={() => setCancelModalOpen(false)}
                type="button"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>

              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-full bg-error-container/50 flex items-center justify-center text-status-danger shrink-0">
                  <span className="material-symbols-outlined text-2xl">event_busy</span>
                </div>
                <div>
                  <h3 className="font-headline-3 text-headline-3 text-text-primary">Cancel Reservation?</h3>
                  <span className="font-caption text-caption text-status-danger uppercase font-semibold">
                    Irreversible Action
                  </span>
                </div>
              </div>

              <p className="font-body-medium text-body-medium text-text-secondary">
                Are you sure you want to release your hold for{' '}
                <strong className="text-text-primary">
                  {targetReservation.book?.title || 'this selected title'}
                </strong>
                ? Your spot in the waitlist will be forfeited and assigned to the next borrower.
              </p>

              {/* Reason Selector */}
              <div className="flex flex-col gap-space-xs">
                <label className="font-small text-small text-text-primary font-medium">
                  Please select a reason for release:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  <label className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
                    <input
                      checked={cancelReason === 'mind'}
                      onChange={() => setCancelReason('mind')}
                      className="text-primary focus:ring-0"
                      name="cancelReason"
                      type="radio"
                      value="mind"
                    />
                    <span className="font-small text-small text-text-primary">
                      Changed my mind / No longer required
                    </span>
                  </label>
                  <label className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
                    <input
                      checked={cancelReason === 'visit'}
                      onChange={() => setCancelReason('visit')}
                      className="text-primary focus:ring-0"
                      name="cancelReason"
                      type="radio"
                      value="visit"
                    />
                    <span className="font-small text-small text-text-primary">
                      Cannot visit the library circulation desk
                    </span>
                  </label>
                  <label className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
                    <input
                      checked={cancelReason === 'edition'}
                      onChange={() => setCancelReason('edition')}
                      className="text-primary focus:ring-0"
                      name="cancelReason"
                      type="radio"
                      value="edition"
                    />
                    <span className="font-small text-small text-text-primary">
                      Found another physical edition or digital copy
                    </span>
                  </label>
                  <label className="flex items-center gap-space-sm p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container cursor-pointer transition-colors">
                    <input
                      checked={cancelReason === 'conflict'}
                      onChange={() => setCancelReason('conflict')}
                      className="text-primary focus:ring-0"
                      name="cancelReason"
                      type="radio"
                      value="conflict"
                    />
                    <span className="font-small text-small text-text-primary">
                      Academic schedule or examination conflict
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-space-sm pt-space-sm mt-space-xs">
                <button
                  className="px-space-lg py-space-sm rounded-full bg-surface-container text-text-primary hover:bg-surface-container-high transition-colors font-body-medium text-body-medium cursor-pointer"
                  onClick={() => setCancelModalOpen(false)}
                  disabled={isCancelling}
                  type="button"
                >
                  Keep Hold
                </button>
                <button
                  className="px-space-lg py-space-sm rounded-full bg-status-danger text-on-primary hover:opacity-90 transition-all font-body-medium text-body-medium shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">
                    {isCancelling ? 'hourglass_top' : 'delete_forever'}
                  </span>
                  <span>{isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Pickup Instructions & Desk Directions */}
        {pickupModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-text-primary/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-space-xl shadow-2xl flex flex-col gap-space-md relative">
              <button
                className="absolute top-space-md right-space-md p-space-xs rounded-full hover:bg-surface-container text-text-secondary transition-colors cursor-pointer"
                onClick={() => setPickupModalOpen(false)}
                type="button"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>

              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-full bg-action-green/30 flex items-center justify-center text-text-primary shrink-0">
                  <span className="material-symbols-outlined text-2xl">store</span>
                </div>
                <div>
                  <h3 className="font-headline-3 text-headline-3 text-text-primary">Pickup Directions</h3>
                  <span className="font-caption text-caption text-primary uppercase font-semibold">
                    Katipuneros Central Stacks
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-space-sm font-small text-small text-text-secondary">
                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1">
                  <span className="font-medium text-text-primary">1. Proceed to Circulation Bay 01</span>
                  <span>
                    Located immediately to the left of the main rotunda entrance. Present your Patron ID or scan your app barcode.
                  </span>
                </div>
                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1">
                  <span className="font-medium text-text-primary">
                    2. Staged at {selectedPickup?.lockerBay ? `Counter Bay ${selectedPickup.lockerBay}` : 'Bay A-04'}
                  </span>
                  <span>
                    The circulation desk officer will verify your account and release the physical volume. Please inspect condition before departing.
                  </span>
                </div>
                <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-1">
                  <span className="font-medium text-text-primary">3. Return Window: 14 Days</span>
                  <span>
                    Your loan period commences once handover is registered. You can renew items online via your Borrowings ledger.
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-space-xs">
                <button
                  className="px-space-xl py-space-sm rounded-full bg-primary-container text-on-primary-container hover:opacity-90 font-small text-small font-medium shadow-sm transition-colors cursor-pointer"
                  onClick={() => setPickupModalOpen(false)}
                  type="button"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        )}

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

export default ReservationsPage;
