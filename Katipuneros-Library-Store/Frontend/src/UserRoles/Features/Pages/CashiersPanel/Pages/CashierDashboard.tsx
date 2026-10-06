// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// CashierDashboard.tsx -- Cashier Point of Sale & Circulation Dashboard.
// Strictly adheres to real-time data mandate: if database is empty (N=0), renders 0, ₱0.00, or clean empty states.
// Consumes live /api/cashier and /api/reservations endpoints.
// Universal lambda syntax (=>), zero hardcoded mock values, zero alert().

import { FC, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToasts } from '../../../../../Hooks/useToasts';
import { useDebounce } from '../../../../../Hooks/useDebounce';
import { usePagination } from '../../../../../Hooks/usePagination';
import { useTableDraggable } from '../../../../../Hooks/useTableDraggable';
import { DefaultFloatingModalCard } from '../../../../../Shared/DefaultFloatingModalCard';
import { SearchBar } from '../../../../../Shared/SearchBar';
import { RadioGroup } from '../../../../../Shared/RadioButton';
import {
  getCashierDashboardKpis,
  getCashierIntakeQueue,
  getCashierOverdueQueue,
  getCashierShiftStatus,
  CashierDashboardKpis,
  CashierIntakeQueueItem,
  CashierOverdueQueueItem,
  CashierShiftSummary,
} from '../../../../../Endpoints/Cashier/cashierApi';
import { triageReservation } from '../../../../../Endpoints/Admin/reservationsApi';
import { getAdminUsersList, AdminUserRecord } from '../../../../../Endpoints/Admin/userApi';

// Native browser BarcodeDetector (Chromium / Edge / Android). Typed locally, no external dependency.
interface DetectedBarcode {
  rawValue: string;
}
interface BarcodeDetectorLike {
  detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>;
}
type BarcodeDetectorCtor = new (opts?: { formats?: string[] }) => BarcodeDetectorLike;

const getBarcodeDetectorCtor = (): BarcodeDetectorCtor | null =>
  typeof window !== 'undefined'
    ? (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector ?? null
    : null;

const hasCameraSupport = (): boolean =>
  typeof navigator !== 'undefined' && !!navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function';

type CameraStatus = 'idle' | 'starting' | 'active' | 'denied' | 'unsupported';
type UserSortOrder = 'az' | 'za' | 'newest' | 'oldest';
type UserRoleFilter = 'all' | 'Customer' | 'Cashier' | 'Admin';
type UserStatusFilter = 'all' | 'active' | 'suspended';
type IntakeViewMode = 'table' | 'card';

const INTAKE_VIEW_STORAGE_KEY = 'cashier-intake-view-mode';

const formatPeso = (value: number): string => `₱${value.toFixed(2)}`;

const getUserInitials = (name?: string): string => {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  return parts.length === 0
    ? '?'
    : parts.length === 1
    ? parts[0].slice(0, 2).toUpperCase()
    : `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const CashierDashboard: FC = () => {
  const navigate = useNavigate();
  const { toasts, addToast, removeToast } = useToasts();

  const [kpis, setKpis] = useState<CashierDashboardKpis | null>(null);
  const [intakeQueue, setIntakeQueue] = useState<CashierIntakeQueueItem[]>([]);
  const [overdueQueue, setOverdueQueue] = useState<CashierOverdueQueueItem[]>([]);
  const [shiftStatus, setShiftStatus] = useState<CashierShiftSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterTab, setFilterTab] = useState<'all' | 'today' | 'tomorrow' | 'priority'>('all');
  const [actionProcessingId, setActionProcessingId] = useState<string | null>(null);

  // Live sync telemetry ("Synced Xs ago")
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [nowTick, setNowTick] = useState<number>(() => Date.now());

  // Review / Reject Modal State
  const [reviewModalItem, setReviewModalItem] = useState<CashierIntakeQueueItem | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isSubmittingTriage, setIsSubmittingTriage] = useState<boolean>(false);

  // Intake queue view mode (Table <-> Card), persisted per terminal
  const [intakeViewMode, setIntakeViewMode] = useState<IntakeViewMode>(() =>
    typeof window !== 'undefined' && window.localStorage.getItem(INTAKE_VIEW_STORAGE_KEY) === 'card' ? 'card' : 'table'
  );
  const { containerRef: intakeTableRef, isDragging: isIntakeDragging } = useTableDraggable<HTMLDivElement>();

  // Camera Barcode / QR Scanner modal
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [scannerCode, setScannerCode] = useState<string>('');
  const [isAutoDetected, setIsAutoDetected] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const detectBusyRef = useRef<boolean>(false);
  const isDetectorSupported = useMemo(() => getBarcodeDetectorCtor() !== null, []);
  const isCameraSupported = useMemo(() => hasCameraSupport(), []);

  // Find User modal
  const [isFindUserOpen, setIsFindUserOpen] = useState<boolean>(false);
  const [directoryUsers, setDirectoryUsers] = useState<AdminUserRecord[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState<boolean>(false);
  const [userSearch, setUserSearch] = useState<string>('');
  const [userSort, setUserSort] = useState<UserSortOrder>('az');
  const [userRoleFilter, setUserRoleFilter] = useState<UserRoleFilter>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<UserStatusFilter>('all');
  const debouncedUserSearch = useDebounce(userSearch, 300);

  // Shift reconciliation modal
  const [isReconcileOpen, setIsReconcileOpen] = useState<boolean>(false);
  const [countedCashInput, setCountedCashInput] = useState<string>('');
  const [reconcileNotes, setReconcileNotes] = useState<string>('');
  const [isReconcileSyncing, setIsReconcileSyncing] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const [kpisRes, intakeRes, overdueRes, shiftRes] = await Promise.all([
        getCashierDashboardKpis(),
        getCashierIntakeQueue(),
        getCashierOverdueQueue(),
        getCashierShiftStatus(),
      ]);
      setKpis(kpisRes);
      setIntakeQueue(intakeRes);
      setOverdueQueue(overdueRes);
      setShiftStatus(shiftRes);
      setLastSyncedAt(Date.now());
    } catch {
      addToast('Failed to synchronize live terminal ledger. Please check network.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    const handleRefresh = () => loadData();
    window.addEventListener('cashier-refresh-kpis', handleRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener('cashier-refresh-kpis', handleRefresh);
    };
  }, [loadData]);

  useEffect(() => {
    const ticker = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(ticker);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(INTAKE_VIEW_STORAGE_KEY, intakeViewMode);
  }, [intakeViewMode]);

  const syncedLabel = useMemo(() => {
    if (isLoading && lastSyncedAt === null) return 'Synchronizing...';
    if (lastSyncedAt === null) return 'Not synced';
    const secs = Math.max(0, Math.floor((nowTick - lastSyncedAt) / 1000));
    return secs < 60 ? `Synced ${secs}s ago` : `Synced ${Math.floor(secs / 60)}m ago`;
  }, [isLoading, lastSyncedAt, nowTick]);

  const handleApprove = async (item: CashierIntakeQueueItem) => {
    setActionProcessingId(item.id);
    try {
      const res = await triageReservation(item.id, { approved: true, priority: item.isPriority });
      if (res.success) {
        addToast(`Reservation #${item.referenceCode} approved. Book queued for physical staging.`, 'success');
        window.dispatchEvent(new CustomEvent('cashier-refresh-kpis'));
        await loadData();
      } else {
        addToast(res.message || 'Failed to approve reservation hold.', 'error');
      }
    } catch {
      addToast('Network error during approval processing.', 'error');
    } finally {
      setActionProcessingId(null);
    }
  };

  const handleOpenReviewModal = (item: CashierIntakeQueueItem) => {
    setReviewModalItem(item);
    setRejectReason('');
  };

  const handleCloseReviewModal = () => {
    setReviewModalItem(null);
    setRejectReason('');
  };

  const handleConfirmReject = async () => {
    if (!reviewModalItem) return;
    if (!rejectReason.trim()) {
      addToast('Please provide a valid operational reason for rejecting this hold.', 'error');
      return;
    }
    setIsSubmittingTriage(true);
    try {
      const res = await triageReservation(reviewModalItem.id, { approved: false, reason: rejectReason.trim() });
      if (res.success) {
        addToast(`Reservation #${reviewModalItem.referenceCode} has been rejected. Notification dispatched.`, 'info');
        handleCloseReviewModal();
        window.dispatchEvent(new CustomEvent('cashier-refresh-kpis'));
        await loadData();
      } else {
        addToast(res.message || 'Failed to reject reservation hold.', 'error');
      }
    } catch {
      addToast('Network error during rejection processing.', 'error');
    } finally {
      setIsSubmittingTriage(false);
    }
  };

  // ---------------- Camera Barcode / QR Scanner ----------------
  const stopScanLoop = useCallback(() => {
    if (scanTimerRef.current !== null) {
      window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    detectBusyRef.current = false;
  }, []);

  const stopCamera = useCallback(() => {
    stopScanLoop();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stopScanLoop]);

  const startScanLoop = useCallback(() => {
    const Ctor = getBarcodeDetectorCtor();
    if (!Ctor) return;
    let detector: BarcodeDetectorLike;
    try {
      detector = new Ctor({ formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e'] });
    } catch {
      detector = new Ctor();
    }
    stopScanLoop();
    scanTimerRef.current = window.setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || detectBusyRef.current) return;
      detectBusyRef.current = true;
      detector
        .detect(video)
        .then((codes) => {
          const value = codes.find((c) => c.rawValue?.trim())?.rawValue.trim();
          if (value) {
            setScannerCode(value);
            setIsAutoDetected(true);
            stopScanLoop();
            addToast(`Code captured: ${value}`, 'success');
          }
        })
        .catch(() => undefined)
        .finally(() => {
          detectBusyRef.current = false;
        });
    }, 450);
  }, [addToast, stopScanLoop]);

  const startCamera = useCallback(async () => {
    if (!hasCameraSupport()) {
      setCameraStatus('unsupported');
      return;
    }
    setCameraStatus('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setCameraStatus('active');
      startScanLoop();
    } catch {
      setCameraStatus('denied');
    }
  }, [startScanLoop]);

  // Start the camera once the modal (and its <video>) is mounted; always release tracks on close/unmount.
  useEffect(() => {
    if (!isScannerOpen) return;
    startCamera();
    return () => stopCamera();
  }, [isScannerOpen, startCamera, stopCamera]);

  const openScanner = () => {
    setScannerCode('');
    setIsAutoDetected(false);
    setCameraStatus('idle');
    setIsScannerOpen(true);
  };

  const closeScanner = () => setIsScannerOpen(false);

  const handleRescan = () => {
    setScannerCode('');
    setIsAutoDetected(false);
    if (cameraStatus === 'active') startScanLoop();
  };

  const routeScannedCode = (target: 'checkout' | 'returns') => {
    const code = scannerCode.trim();
    if (!code) {
      addToast('Scan or type a barcode / QR value first.', 'warning');
      return;
    }
    setIsScannerOpen(false);
    navigate(
      target === 'checkout'
        ? `/cashier/checkout?query=${encodeURIComponent(code)}`
        : `/cashier/returns?barcode=${encodeURIComponent(code)}`
    );
  };

  // ---------------- Find User ----------------
  const loadDirectoryUsers = useCallback(async () => {
    setIsUsersLoading(true);
    try {
      setDirectoryUsers(await getAdminUsersList());
    } catch {
      addToast('Failed to load patron directory.', 'error');
    } finally {
      setIsUsersLoading(false);
    }
  }, [addToast]);

  const openFindUser = () => {
    setUserSearch('');
    setIsFindUserOpen(true);
    loadDirectoryUsers();
  };

  const filteredDirectoryUsers = useMemo(() => {
    const q = debouncedUserSearch.trim().toLowerCase();
    const displayName = (u: AdminUserRecord) => (u.fullName || u.name || '').trim();
    const joined = (u: AdminUserRecord) => {
      const t = Date.parse(u.joinedDate);
      return Number.isNaN(t) ? 0 : t;
    };
    return directoryUsers
      .filter((u) => (userRoleFilter === 'all' ? true : u.role === userRoleFilter))
      .filter((u) =>
        userStatusFilter === 'all' ? true : userStatusFilter === 'active' ? u.isActive : !u.isActive
      )
      .filter((u) =>
        !q
          ? true
          : [displayName(u), u.username, u.email, u.libraryCardNumber, u.department]
              .filter(Boolean)
              .some((field) => (field as string).toLowerCase().includes(q))
      )
      .sort((a, b) =>
        userSort === 'az'
          ? displayName(a).localeCompare(displayName(b))
          : userSort === 'za'
          ? displayName(b).localeCompare(displayName(a))
          : userSort === 'newest'
          ? joined(b) - joined(a)
          : joined(a) - joined(b)
      );
  }, [directoryUsers, debouncedUserSearch, userSort, userRoleFilter, userStatusFilter]);

  const userPagination = usePagination(filteredDirectoryUsers, {
    initialPageSize: 10,
    pageSizeOptions: [10, 25, 50, 100],
  });
  const { goToPage: goToUserPage } = userPagination;

  // Reset to page 1 whenever the query / sort / filters change.
  useEffect(() => {
    goToUserPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedUserSearch, userSort, userRoleFilter, userStatusFilter]);

  const handleInitiateCheckout = (user: AdminUserRecord) => {
    if (!user.isActive) {
      addToast(`${user.fullName || user.name} is suspended and cannot borrow.`, 'warning');
      return;
    }
    setIsFindUserOpen(false);
    navigate(`/cashier/checkout?query=${encodeURIComponent(user.id)}`);
  };

  // ---------------- Shift Reconciliation ----------------
  const expectedCash = shiftStatus?.totalRegisterCash ?? 0;
  const countedCash = countedCashInput.trim() === '' ? null : Number(countedCashInput);
  const isCountedValid = countedCash !== null && Number.isFinite(countedCash) && countedCash >= 0;
  // Variance = Counted - Expected (rounded to centavos to avoid floating-point noise)
  const cashVariance = isCountedValid ? Math.round(((countedCash as number) - expectedCash) * 100) / 100 : null;

  const openReconcile = async () => {
    setCountedCashInput('');
    setReconcileNotes('');
    setIsReconcileOpen(true);
    setIsReconcileSyncing(true);
    try {
      setShiftStatus(await getCashierShiftStatus());
      setLastSyncedAt(Date.now());
    } catch {
      addToast('Could not refresh register totals; showing last synced values.', 'warning');
    } finally {
      setIsReconcileSyncing(false);
    }
  };

  const escapeHtml = (value: string): string =>
    value.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch] as string));

  const handlePrintZReading = () => {
    const printWindow = window.open('', '_blank', 'width=420,height=640');
    if (!printWindow) {
      addToast('Pop-up blocked. Allow pop-ups to print the Z-reading slip.', 'warning');
      return;
    }
    const varianceText =
      cashVariance === null ? 'Not counted' : `${cashVariance >= 0 ? '+' : '-'}${formatPeso(Math.abs(cashVariance))}`;
    const rows: [string, string][] = [
      ['Station', shiftStatus?.stationName || 'Front Desk Bay 01'],
      ['Cashier', shiftStatus?.activeCashierName || 'Circulation Desk'],
      ['Shift', shiftStatus?.shiftLabel || '-'],
      ['Opening Float', formatPeso(shiftStatus?.floatBase ?? 0)],
      ['Fines Collected', formatPeso(shiftStatus?.finesCollectedToday ?? 0)],
      ['Receipts Settled', String(kpis?.finesDailyReceiptsCount ?? 0)],
      ['Expected Cash', formatPeso(expectedCash)],
      ['Counted Cash', isCountedValid ? formatPeso(countedCash as number) : 'Not counted'],
      ['Variance', varianceText],
      ['Checkouts Active', String(kpis?.activeLoansCount ?? 0)],
      ['Returns Today', String(kpis?.returnsTodayCount ?? 0)],
    ];
    printWindow.document.write(`<!doctype html><html><head><title>Z-Reading</title>
      <style>body{font-family:monospace;padding:16px;font-size:12px}h2{text-align:center;margin:0 0 4px}
      p{text-align:center;margin:0 0 12px}table{width:100%;border-collapse:collapse}td{padding:3px 0}
      td:last-child{text-align:right}hr{border:0;border-top:1px dashed #000;margin:10px 0}</style></head><body>
      <h2>KATIPUNEROS LIBRARY STORE</h2><p>Shift Z-Reading &bull; ${escapeHtml(new Date().toLocaleString())}</p><hr/>
      <table>${rows.map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`).join('')}</table>
      <hr/><div>Notes: ${escapeHtml(reconcileNotes.trim() || '-')}</div></body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    addToast('Z-reading slip sent to the print dialog.', 'info');
  };

  const handleConfirmReconcile = () => {
    if (!isCountedValid || cashVariance === null) {
      addToast('Enter the physical cash count before confirming the reconciliation.', 'error');
      return;
    }
    if (cashVariance !== 0 && !reconcileNotes.trim()) {
      addToast('A note is required to explain a non-zero drawer variance.', 'warning');
      return;
    }
    const verdict =
      cashVariance === 0
        ? 'Balanced'
        : cashVariance > 0
        ? `Overage +${formatPeso(cashVariance)}`
        : `Shortage -${formatPeso(Math.abs(cashVariance))}`;
    addToast(`Drawer reconciled (${verdict}). Expected ${formatPeso(expectedCash)}, counted ${formatPeso(countedCash as number)}.`, cashVariance === 0 ? 'success' : 'warning');
    setIsReconcileOpen(false);
  };

  const filteredIntakeQueue = useMemo(() => {
    return intakeQueue.filter((item) => {
      if (filterTab === 'priority') return item.isPriority;
      if (filterTab === 'today') {
        const itemDate = item.requestedPickupDate?.toLowerCase() ?? '';
        return itemDate.includes('today') || itemDate.includes(new Date().toISOString().slice(0, 10));
      }
      if (filterTab === 'tomorrow') {
        const itemDate = item.requestedPickupDate?.toLowerCase() ?? '';
        return itemDate.includes('tomorrow');
      }
      return true;
    });
  }, [intakeQueue, filterTab]);

  return (
    <div className="w-full">
      <div className="flex flex-col w-full pb-16 space-y-8">
        {/* Operational Shift Header */}
        <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 pt-4">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-full bg-soft-blue text-primary font-caption text-caption uppercase tracking-wider font-bold">
                Desk Bay 01 Ledger
              </span>
              <div className="flex items-center gap-1.5 text-text-secondary font-caption text-caption">
                <span className="w-2 h-2 rounded-full bg-action-green animate-pulse"></span>
                <span>{syncedLabel}</span>
              </div>
            </div>
            <h1 className="font-headline-2 text-headline-2 text-text-primary tracking-tight">
              Cashier Operations Dashboard
            </h1>
            <p className="font-body text-body text-text-secondary max-w-3xl">
              Real-time terminal ledger for reservation reviews, circulation counter checkouts, and book returns.
            </p>
          </div>

          {/* Persistent Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('/cashier/checkout')}
              className="h-11 px-4 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-body-medium text-body-medium flex items-center gap-2 shadow-sm transition-all transform active:scale-95 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-xl">shopping_cart_checkout</span>
              <span>+ Fast Checkout</span>
            </button>
            <button
              onClick={() => navigate('/cashier/pending-reservations')}
              className="h-11 px-4 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-body-medium text-body-medium flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-xl">pending_actions</span>
              <span>Review Reservations</span>
              {kpis && kpis.pendingHoldsCount > 0 && (
                <span className="bg-soft-blue text-primary text-caption font-bold px-2 py-0.5 rounded-full">
                  {kpis.pendingHoldsCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate('/cashier/returns')}
              className="h-11 px-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-body-medium text-body-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-lg text-primary">keyboard_return</span>
              <span>Process Return</span>
            </button>
            <button
              onClick={openScanner}
              className="h-11 px-3.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-text-primary font-body-medium text-body-medium flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-lg text-primary">qr_code_scanner</span>
              <span>Scan Barcode/QR</span>
            </button>
            <button
              onClick={openFindUser}
              className="h-11 px-3.5 rounded-xl bg-surface-container-lowest hover:bg-surface-container text-text-primary font-body-medium text-body-medium flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-lg text-text-secondary">person_search</span>
              <span>Find User</span>
            </button>
          </div>
        </section>

        {/* 8 Structured KPI Operational Metric Cards Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3.5">
          {/* Card 1: Pending Holds */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption text-text-secondary font-medium">Pending Holds</span>
              <div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">assignment_late</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-headline-3 text-headline-3 text-text-primary leading-none">
                {kpis?.pendingHoldsCount ?? 0}
              </div>
              <p className="font-caption text-caption text-status-pending font-medium mt-1">
                {kpis?.urgentTodayHoldsCount ?? 0} urgent today
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-status-pending opacity-80"></div>
          </div>

          {/* Card 2: Approved Today */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption text-text-secondary font-medium">Approved Today</span>
              <div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">check_circle</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-headline-3 text-headline-3 text-text-primary leading-none">
                {kpis?.approvedTodayCount ?? 0}
              </div>
              <p className="font-caption text-caption text-status-available font-medium mt-1">Cleared for pickup</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-status-available opacity-80"></div>
          </div>

          {/* Card 3: Books to Release */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption text-text-secondary font-medium">To Release</span>
              <div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">local_library</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-headline-3 text-headline-3 text-text-primary leading-none">
                {kpis?.toReleaseCount ?? 0}
              </div>
              <p className="font-caption text-caption text-text-secondary mt-1">Staged in Bay 01</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary opacity-60"></div>
          </div>

          {/* Card 4: Active Borrowings */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption text-text-secondary font-medium">Active Loans</span>
              <div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">auto_stories</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-headline-3 text-headline-3 text-text-primary leading-none">
                {kpis?.activeLoansCount ?? 0}
              </div>
              <p className="font-caption text-caption text-text-secondary mt-1">In user custody</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary opacity-60"></div>
          </div>

          {/* Card 5: Due Today */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption text-text-secondary font-medium">Due Today</span>
              <div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">schedule</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-headline-3 text-headline-3 text-text-primary leading-none">
                {kpis?.dueTodayCount ?? 0}
              </div>
              <p className="font-caption text-caption text-text-secondary mt-1">Target 8:00 PM</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary opacity-60"></div>
          </div>

          {/* Card 6: Overdue Loans */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption text-text-secondary font-medium">Overdue</span>
              <div className="w-8 h-8 rounded-lg bg-error-container flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-lg">error_outline</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-headline-3 text-headline-3 text-error leading-none">
                {kpis?.overdueLoansCount ?? 0}
              </div>
              <p className="font-caption text-caption text-error font-medium mt-1">
                {(kpis?.overdueLoansCount ?? 0) > 0 ? 'Fines calculating' : 'No overdue items'}
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-status-danger opacity-80"></div>
          </div>

          {/* Card 7: Returns Today */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption text-text-secondary font-medium">Returns In</span>
              <div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">fact_check</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-headline-3 text-headline-3 text-text-primary leading-none">
                {kpis?.returnsTodayCount ?? 0}
              </div>
              <p className="font-caption text-caption text-status-available font-medium mt-1">Audit cleared</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-status-available opacity-80"></div>
          </div>

          {/* Card 8: Fines Collected Today */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-caption text-caption text-text-secondary font-medium">Fines Daily</span>
              <div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-lg">payments</span>
              </div>
            </div>
            <div className="mt-3">
              <div className="font-headline-4 text-headline-4 text-text-primary leading-none">
                ₱{(kpis?.finesDailyAmount ?? 0).toFixed(2)}
              </div>
              <p className="font-caption text-caption text-text-secondary mt-1">
                {kpis?.finesDailyReceiptsCount ?? 0} receipts settled
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-action-green opacity-90"></div>
          </div>
        </section>

        {/* Main Content Split Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Pending Reservation Intake Queue (col-span-8) */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col space-y-5">
              {/* Header & Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-soft-blue flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-xl">assignment</span>
                  </div>
                  <div>
                    <h2 className="font-headline-4 text-headline-4 text-text-primary">
                      Pending Reservation Intake Queue
                    </h2>
                    <p className="font-caption text-caption text-text-secondary">
                      Review, stage stacks physically, and approve book pickups
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
                {/* Table <-> Card view switch (shared RadioGroup) */}
                <RadioGroup
                  name="cashier-intake-view-mode"
                  selectedValue={intakeViewMode}
                  onChange={(value) => setIntakeViewMode(value === 'card' ? 'card' : 'table')}
                  options={[
                    { value: 'table', label: 'Table', icon: 'table_rows' },
                    { value: 'card', label: 'Cards', icon: 'grid_view' },
                  ]}
                />

                {/* Tab Chips */}
                <div className="inline-flex p-1 bg-surface-container-high rounded-full self-start sm:self-auto text-caption font-caption">
                  <button
                    onClick={() => setFilterTab('all')}
                    className={`px-3.5 py-1.5 rounded-full font-bold shadow-sm transition-colors cursor-pointer ${
                      filterTab === 'all'
                        ? 'bg-surface-container-lowest text-text-primary'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                    type="button"
                  >
                    All ({intakeQueue.length})
                  </button>
                  <button
                    onClick={() => setFilterTab('today')}
                    className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
                      filterTab === 'today'
                        ? 'bg-surface-container-lowest text-text-primary font-bold'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                    type="button"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => setFilterTab('tomorrow')}
                    className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
                      filterTab === 'tomorrow'
                        ? 'bg-surface-container-lowest text-text-primary font-bold'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                    type="button"
                  >
                    Tomorrow
                  </button>
                  <button
                    onClick={() => setFilterTab('priority')}
                    className={`px-3.5 py-1.5 rounded-full transition-colors cursor-pointer flex items-center gap-1 ${
                      filterTab === 'priority'
                        ? 'bg-surface-container-lowest text-status-danger font-bold'
                        : 'text-status-danger hover:text-text-primary'
                    }`}
                    type="button"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-status-danger"></span>
                    Priority
                  </button>
                </div>
                </div>
              </div>

              {/* Empty State */}
              {filteredIntakeQueue.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-center p-6 bg-surface-container-low/40 rounded-xl">
                  <span className="material-symbols-outlined text-4xl text-text-secondary/60 mb-2">
                    inbox
                  </span>
                  <p className="font-body-medium text-body-medium text-text-primary font-semibold">
                    No pending intake reservations
                  </p>
                  <p className="font-caption text-caption text-text-secondary max-w-sm mt-1">
                    All patron holds have been triaged or cleared for physical staging in Desk Bay 01.
                  </p>
                </div>
              )}

              {/* Table View - container stays mounted so useTableDraggable keeps its drag listeners attached */}
              <div
                ref={intakeTableRef}
                className={`overflow-x-auto ${isIntakeDragging ? 'select-none' : ''} ${
                  filteredIntakeQueue.length > 0 && intakeViewMode === 'table' ? '' : 'hidden'
                }`}
              >
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-surface-container-low text-text-secondary font-caption text-caption uppercase tracking-wider rounded-xl">
                        <th className="py-3 px-4 rounded-l-xl">Reservation &amp; User</th>
                        <th className="py-3 px-4">Book Title &amp; Call No.</th>
                        <th className="py-3 px-4">Physical Stacks</th>
                        <th className="py-3 px-4">Requested Pickup</th>
                        <th className="py-3 px-4 rounded-r-xl text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container-high/40 text-small font-small">
                      {filteredIntakeQueue.map((item) => (
                        <tr key={item.id} className="hover:bg-surface-container-low/60 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex flex-col">
                              <span className="font-caption text-caption text-text-secondary font-bold">
                                #{item.referenceCode}
                              </span>
                              <span className="font-body-medium text-body-medium text-text-primary mt-0.5 font-semibold">
                                {item.patronName}
                              </span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="bg-soft-blue text-primary font-caption text-caption px-2 py-0.5 rounded-md font-bold">
                                  {item.libraryCardNumber || 'KP-CARD'}
                                </span>
                                <span
                                  className={`font-caption text-caption flex items-center gap-0.5 ${
                                    item.patronStanding === 'Good' || item.patronStanding === 'Regular'
                                      ? 'text-status-available'
                                      : 'text-text-secondary'
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-xs">verified</span>
                                  {item.patronStanding || 'Standard'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {item.bookCoverImage ? (
                                <img
                                  className="w-10 h-14 object-cover rounded-lg shadow-sm"
                                  src={item.bookCoverImage}
                                  alt={item.bookTitle}
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-10 h-14 bg-soft-blue rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                                  <span className="material-symbols-outlined text-xl">menu_book</span>
                                </div>
                              )}
                              <div className="flex flex-col max-w-[200px]">
                                <span className="font-body-medium text-body-medium text-text-primary leading-snug line-clamp-2">
                                  {item.bookTitle}
                                </span>
                                <span className="font-caption text-caption text-text-secondary mt-0.5">
                                  Call: {item.callNumber || 'General'}
                                </span>
                                <span className="text-caption font-caption text-text-secondary">
                                  {item.bookAuthor}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col">
                              <span
                                className={`inline-flex items-center gap-1 font-bold text-caption font-caption ${
                                  item.availableCopies > 0 ? 'text-status-available' : 'text-status-danger'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    item.availableCopies > 0 ? 'bg-status-available' : 'bg-status-danger'
                                  }`}
                                ></span>
                                {item.availableCopies > 0 ? 'Available' : 'Reserved in Full'}
                              </span>
                              <span className="font-caption text-caption text-text-secondary mt-0.5">
                                {item.availableCopies} of {item.totalCopies} copies • {item.stacksLocation || 'Bay 01'}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col">
                              <span className="font-body-medium text-body-medium text-text-primary">
                                {item.requestedPickupDate}
                              </span>
                              <span className="font-caption text-caption text-text-secondary mt-0.5">
                                Duration: {item.durationDays} Days
                              </span>
                              {item.isPriority && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-status-pending/20 text-text-primary rounded text-caption font-caption font-bold w-max">
                                  Priority Desk
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleApprove(item)}
                                disabled={actionProcessingId === item.id}
                                className="h-9 px-3 rounded-lg bg-action-green hover:bg-action-green-hover text-text-primary font-caption text-caption font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-base">check</span>
                                <span>{actionProcessingId === item.id ? 'Processing...' : 'Approve'}</span>
                              </button>
                              <button
                                onClick={() => handleOpenReviewModal(item)}
                                className="h-9 px-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-text-primary font-caption text-caption transition-colors cursor-pointer"
                                type="button"
                              >
                                <span>Review / Reject</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
              </div>

              {/* Card View */}
              {filteredIntakeQueue.length > 0 && intakeViewMode === 'card' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredIntakeQueue.map((item) => (
                    <article
                      key={item.id}
                      className="p-4 rounded-2xl bg-surface-container-low/60 hover:bg-surface-container-low border border-outline-variant/15 flex flex-col gap-3 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col min-w-0">
                          <span className="font-caption text-caption text-text-secondary font-bold">#{item.referenceCode}</span>
                          <span className="font-body-medium text-body-medium text-text-primary font-semibold truncate">
                            {item.patronName}
                          </span>
                          <span className="font-caption text-caption text-primary font-bold">
                            {item.libraryCardNumber || 'KP-CARD'} • {item.patronStanding || 'Standard'}
                          </span>
                        </div>
                        {item.isPriority && (
                          <span className="px-2 py-0.5 bg-status-pending/20 text-text-primary rounded text-caption font-caption font-bold whitespace-nowrap">
                            Priority Desk
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        {item.bookCoverImage ? (
                          <img
                            className="w-10 h-14 object-cover rounded-lg shadow-sm flex-shrink-0"
                            src={item.bookCoverImage}
                            alt={item.bookTitle}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-14 bg-soft-blue rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                            <span className="material-symbols-outlined text-xl">menu_book</span>
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="font-body-medium text-body-medium text-text-primary leading-snug line-clamp-2">
                            {item.bookTitle}
                          </span>
                          <span className="font-caption text-caption text-text-secondary">Call: {item.callNumber || 'General'}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 font-caption text-caption">
                        <div className="p-2 rounded-lg bg-surface-container-lowest">
                          <span className="text-text-secondary block">Physical Stacks</span>
                          <span className={`font-bold ${item.availableCopies > 0 ? 'text-status-available' : 'text-status-danger'}`}>
                            {item.availableCopies} of {item.totalCopies} • {item.stacksLocation || 'Bay 01'}
                          </span>
                        </div>
                        <div className="p-2 rounded-lg bg-surface-container-lowest">
                          <span className="text-text-secondary block">Requested Pickup</span>
                          <span className="font-bold text-text-primary">
                            {item.requestedPickupDate} • {item.durationDays}d
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleApprove(item)}
                          disabled={actionProcessingId === item.id}
                          className="h-9 px-3 rounded-lg bg-action-green hover:bg-action-green-hover text-text-primary font-caption text-caption font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm disabled:opacity-50"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-base">check</span>
                          <span>{actionProcessingId === item.id ? 'Processing...' : 'Approve'}</span>
                        </button>
                        <button
                          onClick={() => handleOpenReviewModal(item)}
                          className="h-9 px-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-text-primary font-caption text-caption transition-colors cursor-pointer"
                          type="button"
                        >
                          Review / Reject
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Footer navigation */}
              <div className="flex items-center justify-between pt-2 border-t border-surface-container font-caption text-caption text-text-secondary">
                <span>
                  Showing {filteredIntakeQueue.length} of {intakeQueue.length} pending intake requests
                </span>
                <button
                  onClick={() => navigate('/cashier/pending-reservations')}
                  className="text-primary font-bold hover:underline cursor-pointer flex items-center gap-1"
                  type="button"
                >
                  View All Pending Intake Queue
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Returns & Shift Summary (col-span-4) */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            {/* Card: Today's Scheduled Returns & Overdue Queue */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col space-y-5">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-lg">history_edu</span>
                  </div>
                  <div>
                    <h3 className="font-headline-4 text-headline-4 text-text-primary">Returns &amp; Overdue Queue</h3>
                    <span className="font-caption text-caption text-text-secondary">Expected Today &amp; Delinquent Items</span>
                  </div>
                </div>
                {overdueQueue.length > 0 && (
                  <span className="bg-error-container text-on-error-container text-caption font-bold px-2 py-0.5 rounded-full">
                    {overdueQueue.length} Overdue
                  </span>
                )}
              </div>

              {/* Queue Items List */}
              <div className="flex flex-col space-y-3.5">
                {overdueQueue.length === 0 ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center p-4 bg-surface-container-low/40 rounded-xl">
                    <span className="material-symbols-outlined text-3xl text-status-available mb-1">
                      verified
                    </span>
                    <p className="font-body-medium text-body-medium text-text-primary font-semibold">
                      Queue Cleared
                    </p>
                    <p className="font-caption text-caption text-text-secondary mt-0.5">
                      No overdue loans or delinquent return notices at this desk.
                    </p>
                  </div>
                ) : (
                  overdueQueue.map((item) => (
                    <div key={item.id} className="p-3.5 rounded-xl bg-surface-container-low flex flex-col space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-body-medium text-body-medium text-text-primary font-bold line-clamp-1">
                            {item.bookTitle}
                          </span>
                          <p className="font-caption text-caption text-text-secondary mt-0.5">
                            Borrower: {item.patronName} ({item.libraryCardNumber || 'KP-CARD'})
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-error/10 text-error font-caption text-caption font-bold whitespace-nowrap">
                          {item.daysOverdue > 0 ? `Overdue ${item.daysOverdue} Days` : `Due: ${item.dueDate}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-surface-container">
                        <div className="flex items-center gap-1 font-caption text-caption text-error font-bold">
                          <span className="material-symbols-outlined text-sm">monetization_on</span>
                          <span>Calculated Fine: ₱{item.calculatedFine.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => navigate(`/cashier/returns?barcode=${encodeURIComponent(item.barcode)}`)}
                            className="px-2.5 py-1 rounded bg-primary text-on-primary font-caption text-caption font-bold hover:bg-primary-container transition-colors cursor-pointer"
                            type="button"
                          >
                            Process Return
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Card: Daily Shift Operational Summary & Register Status */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm flex flex-col space-y-5">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-soft-blue flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-lg">point_of_sale</span>
                  </div>
                  <div>
                    <h3 className="font-headline-4 text-headline-4 text-text-primary">Shift &amp; Register Status</h3>
                    <span className="font-caption text-caption text-text-secondary">Front Desk Drawer 01</span>
                  </div>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-action-green animate-pulse"></span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface-container-low rounded-xl flex flex-col">
                  <span className="font-caption text-caption text-text-secondary">Active Cashier</span>
                  <span className="font-body-medium text-body-medium text-text-primary font-bold mt-0.5 truncate">
                    {shiftStatus?.activeCashierName || 'Cashier Desk 01'}
                  </span>
                  <span className="font-caption text-caption text-text-secondary mt-0.5 truncate">
                    {shiftStatus?.shiftLabel || 'Morning Shift'}
                  </span>
                </div>
                <div className="p-3 bg-surface-container-low rounded-xl flex flex-col">
                  <span className="font-caption text-caption text-text-secondary">Total Register Cash</span>
                  <span className="font-body-medium text-body-medium text-text-primary font-bold mt-0.5">
                    ₱{(shiftStatus?.totalRegisterCash ?? 0).toFixed(2)}
                  </span>
                  <span className="font-caption text-caption text-text-secondary mt-0.5">
                    Float: ₱{(shiftStatus?.floatBase ?? 0).toFixed(2)} + Fines: ₱{(shiftStatus?.finesCollectedToday ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* System & Runner Status Checklist */}
              <div className="flex flex-col space-y-2.5 text-small font-small">
                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low/60">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-primary">directions_run</span>
                    <span className="text-text-primary">Stacks Physical Runners</span>
                  </div>
                  <span className="font-caption text-caption text-status-available font-bold bg-status-available/10 px-2 py-0.5 rounded">
                    Active (Desk Bay 01)
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low/60">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-primary">sensors</span>
                    <span className="text-text-primary">Physical Barcode Readers</span>
                  </div>
                  <span className="font-caption text-caption text-status-available font-bold bg-status-available/10 px-2 py-0.5 rounded">
                    Synced &amp; Calibrated
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low/60">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-primary">print</span>
                    <span className="text-text-primary">Receipt Thermal Printer</span>
                  </div>
                  <span className="font-caption text-caption text-text-secondary">Desk Thermal Subsystem (Ready)</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={openReconcile}
                  className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-body-medium text-body-medium font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                  type="button"
                >
                  <span className="material-symbols-outlined text-lg">lock_clock</span>
                  <span>Close Shift / Reconcile Drawer</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Review / Reject Intake Modal */}
      {reviewModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-outline/10 flex flex-col space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl">rule</span>
                </div>
                <div>
                  <h3 className="font-headline-4 text-headline-4 text-text-primary">Review &amp; Reject Hold</h3>
                  <p className="font-caption text-caption text-text-secondary">
                    Reservation #{reviewModalItem.referenceCode}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseReviewModal}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg"
                type="button"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low text-small font-small space-y-1">
              <p>
                <strong className="text-text-primary">Patron:</strong> {reviewModalItem.patronName} (
                {reviewModalItem.libraryCardNumber})
              </p>
              <p>
                <strong className="text-text-primary">Book:</strong> {reviewModalItem.bookTitle}
              </p>
              <p>
                <strong className="text-text-primary">Call No:</strong> {reviewModalItem.callNumber}
              </p>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="font-body-medium text-body-medium font-bold text-text-primary">
                Rejection Reason (Required)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="E.g., Physical copy damaged, patron exceeded borrow limits, or requested archival book requires faculty clearance."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-outline/30 bg-surface-container-low text-text-primary font-body text-body focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={handleCloseReviewModal}
                disabled={isSubmittingTriage}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-caption text-caption font-bold cursor-pointer"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isSubmittingTriage}
                className="px-4 py-2 rounded-xl bg-error text-on-error font-caption text-caption font-bold hover:bg-error/90 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                type="button"
              >
                {isSubmittingTriage ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared Floating Modal 1: Camera Barcode / QR Scanner */}
      <DefaultFloatingModalCard
        isOpen={isScannerOpen}
        onClose={closeScanner}
        title="Scan Barcode / QR Code"
        subtitle="Optical camera scanner with live auto-detection & manual fallback"
        size="lg"
        footer={
          <div className="flex flex-wrap items-center justify-between w-full gap-2">
            <span className="font-caption text-caption text-text-secondary">
              {scannerCode.trim() ? (
                <span className="text-action-green font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  Code Ready: {scannerCode}
                </span>
              ) : (
                'Position barcode or QR code inside the viewfinder'
              )}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeScanner}
                className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-caption text-caption font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => routeScannedCode('returns')}
                disabled={!scannerCode.trim()}
                className="px-3.5 py-2 rounded-xl bg-primary text-on-primary font-caption text-caption font-bold hover:bg-primary-container transition-colors shadow-sm cursor-pointer disabled:opacity-40"
              >
                Process Return
              </button>
              <button
                type="button"
                onClick={() => routeScannedCode('checkout')}
                disabled={!scannerCode.trim()}
                className="px-4 py-2 rounded-xl bg-action-green text-text-primary font-caption text-caption font-bold hover:bg-action-green-hover transition-colors shadow-sm cursor-pointer disabled:opacity-40"
              >
                + Fast Checkout
              </button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col space-y-4">
          {/* Camera Viewfinder */}
          <div className="relative w-full aspect-video sm:h-72 bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-outline-variant/30">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${cameraStatus === 'active' ? 'block' : 'hidden'}`}
            />

            {/* Viewfinder Reticle & Laser */}
            {cameraStatus === 'active' && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="relative w-56 h-36 sm:w-72 sm:h-44 border-2 border-action-green/80 rounded-2xl shadow-[0_0_20px_rgba(155,229,100,0.3)] flex items-center justify-center">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-action-green -mt-1 -ml-1 rounded-tl"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-action-green -mt-1 -mr-1 rounded-tr"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-action-green -mb-1 -ml-1 rounded-bl"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-action-green -mb-1 -mr-1 rounded-br"></div>
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-action-green to-transparent animate-pulse shadow-[0_0_8px_#9BE564]"></div>
                </div>
              </div>
            )}

            {/* Camera Status Fallback / States */}
            {cameraStatus !== 'active' && (
              <div className="p-6 text-center flex flex-col items-center justify-center text-white/80 max-w-sm">
                <span className="material-symbols-outlined text-4xl mb-2 text-action-green">
                  {cameraStatus === 'starting'
                    ? 'hourglass_empty'
                    : cameraStatus === 'denied'
                    ? 'videocam_off'
                    : 'no_photography'}
                </span>
                <p className="font-body-medium text-body-medium text-white font-semibold">
                  {cameraStatus === 'starting'
                    ? 'Initializing optical camera feed...'
                    : cameraStatus === 'denied'
                    ? 'Camera access denied by browser'
                    : 'Optical camera device not available'}
                </p>
                <p className="font-caption text-caption text-white/60 mt-1">
                  {cameraStatus === 'denied'
                    ? 'Allow camera permissions in browser settings or use manual input below.'
                    : 'Enter the barcode or QR code manually using the terminal key input below.'}
                </p>
                {cameraStatus === 'denied' && (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="mt-3 px-3.5 py-1.5 rounded-lg bg-action-green text-text-primary font-caption text-caption font-bold hover:bg-action-green-hover transition-colors"
                  >
                    Retry Permission
                  </button>
                )}
              </div>
            )}

            {/* Auto-detection badge */}
            {isAutoDetected && (
              <div className="absolute top-3 left-3 bg-action-green text-text-primary px-2.5 py-1 rounded-full font-caption text-caption font-bold shadow-md flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">auto_awesome</span>
                Auto-Decoded
              </div>
            )}

            {cameraStatus === 'active' && (
              <button
                type="button"
                onClick={handleRescan}
                title="Restart Optical Scan"
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
              </button>
            )}
          </div>

          {/* Manual Input / Handheld Barcode Input Key */}
          <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-body-medium text-body-medium font-bold text-text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-primary">keyboard</span>
                Scan / Manual Code Entry
              </label>
              <span className="font-caption text-[11px] text-text-secondary">
                {isDetectorSupported ? 'Native BarcodeDetector Active' : 'Manual Entry & Handheld Ready'}
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                value={scannerCode}
                onChange={(e) => {
                  setScannerCode(e.target.value);
                  setIsAutoDetected(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (scannerCode.trim()) routeScannedCode('checkout');
                  }
                }}
                placeholder="E.g., 978-0132350884, KP-88192, or RES-9021"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-outline/30 bg-surface-container-lowest text-text-primary font-body text-body focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {scannerCode && (
                <button
                  type="button"
                  onClick={() => setScannerCode('')}
                  className="px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-secondary text-caption font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </DefaultFloatingModalCard>

      {/* Shared Floating Modal 2: Find User Directory */}
      <DefaultFloatingModalCard
        isOpen={isFindUserOpen}
        onClose={() => setIsFindUserOpen(false)}
        title="Find Patron Directory"
        subtitle="Search library patrons, inspect standing, and initiate circulation checkout"
        size="xl"
        footer={
          <div className="flex flex-wrap items-center justify-between w-full gap-2">
            <div className="flex items-center gap-3 text-caption font-caption text-text-secondary">
              <span>
                Showing {userPagination.startIndex + 1}–{userPagination.endIndex} of {userPagination.totalItems} patrons
              </span>
              <div className="flex items-center gap-1.5">
                <span>Page Size:</span>
                <select
                  value={userPagination.pageSize}
                  onChange={(e) => userPagination.setPageSize(Number(e.target.value))}
                  className="px-2 py-1 rounded-lg bg-surface-container border border-outline-variant/30 text-text-primary font-caption text-caption cursor-pointer"
                >
                  {userPagination.pageSizeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={userPagination.prevPage}
                disabled={!userPagination.canPrevPage}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-primary text-caption font-bold disabled:opacity-40 transition-colors cursor-pointer"
              >
                Previous
              </button>
              <span className="font-caption text-caption text-text-primary px-2 font-bold">
                {userPagination.currentPage} / {userPagination.totalPages}
              </span>
              <button
                type="button"
                onClick={userPagination.nextPage}
                disabled={!userPagination.canNextPage}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-primary text-caption font-bold disabled:opacity-40 transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col space-y-4">
          {/* Controls: Shared SearchBar + Sorter + Role + Status filters */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="flex-1">
              <SearchBar
                value={userSearch}
                onChange={setUserSearch}
                onClear={() => setUserSearch('')}
                placeholder="Search by name, card number, email, username..."
                autoFocus
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Sort Order Selector */}
              <div className="flex items-center gap-1 bg-surface-container-low px-2.5 py-1.5 rounded-xl border border-outline-variant/20">
                <span className="material-symbols-outlined text-sm text-text-secondary">sort</span>
                <select
                  value={userSort}
                  onChange={(e) => setUserSort(e.target.value as UserSortOrder)}
                  className="bg-transparent text-caption font-caption text-text-primary font-bold focus:outline-none cursor-pointer"
                >
                  <option value="az">Name (A–Z)</option>
                  <option value="za">Name (Z–A)</option>
                  <option value="newest">Newest Joined</option>
                  <option value="oldest">Oldest Joined</option>
                </select>
              </div>

              {/* Role Filter */}
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value as UserRoleFilter)}
                className="px-2.5 py-2 rounded-xl bg-surface-container-low border border-outline-variant/20 text-caption font-caption text-text-primary font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="Customer">Customers</option>
                <option value="Cashier">Cashiers</option>
                <option value="Admin">Admins</option>
              </select>

              {/* Status Filter */}
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value as UserStatusFilter)}
                className="px-2.5 py-2 rounded-xl bg-surface-container-low border border-outline-variant/20 text-caption font-caption text-text-primary font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>
            </div>
          </div>

          {/* Patron Directory List */}
          {isUsersLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center p-6 bg-surface-container-low/40 rounded-xl">
              <span className="material-symbols-outlined text-3xl text-primary animate-spin mb-2">
                sync
              </span>
              <p className="font-body-medium text-body-medium text-text-primary font-semibold">
                Loading patron directory...
              </p>
            </div>
          ) : userPagination.paginatedItems.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center p-6 bg-surface-container-low/40 rounded-xl">
              <span className="material-symbols-outlined text-4xl text-text-secondary/60 mb-2">
                person_search
              </span>
              <p className="font-body-medium text-body-medium text-text-primary font-semibold">
                No matching patrons found
              </p>
              <p className="font-caption text-caption text-text-secondary max-w-sm mt-1">
                Try searching with a different name, library card number, or clear your role/status filters.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-surface-container-high/40 max-h-[50vh] overflow-y-auto pr-1">
              {userPagination.paginatedItems.map((user) => {
                const displayName = user.fullName || user.name || 'Patron';
                const initials = getUserInitials(displayName);
                return (
                  <div
                    key={user.id}
                    className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container-low/60 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent text-on-primary font-bold flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                        {initials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-body-medium text-body-medium text-text-primary font-bold truncate">
                            {displayName}
                          </span>
                          <span
                            className={`font-caption text-[10px] px-2 py-0.2 rounded-full font-bold uppercase ${
                              user.role === 'Admin'
                                ? 'bg-primary/10 text-primary'
                                : user.role === 'Cashier'
                                ? 'bg-action-green/20 text-[#18323D]'
                                : 'bg-surface-container text-text-secondary'
                            }`}
                          >
                            {user.role}
                          </span>
                          <span
                            className={`font-caption text-[10px] px-1.5 py-0.2 rounded font-bold ${
                              user.isActive
                                ? 'bg-status-available/10 text-status-available'
                                : 'bg-status-danger/10 text-status-danger'
                            }`}
                          >
                            {user.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-caption font-caption text-text-secondary mt-0.5">
                          <span className="font-bold text-primary">
                            Card: {user.libraryCardNumber || 'KP-UNASSIGNED'}
                          </span>
                          <span>{user.email}</span>
                          {user.department && <span>Dept: {user.department}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleInitiateCheckout(user)}
                        disabled={!user.isActive}
                        className="h-9 px-3.5 rounded-xl bg-action-green hover:bg-action-green-hover text-text-primary font-caption text-caption font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined text-base">shopping_cart_checkout</span>
                        <span>Initiate Checkout</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DefaultFloatingModalCard>

      {/* Shared Floating Modal 3: Shift Drawer Reconciliation & Register Audit */}
      <DefaultFloatingModalCard
        isOpen={isReconcileOpen}
        onClose={() => setIsReconcileOpen(false)}
        title="Shift Reconciliation & Drawer Audit"
        subtitle="Verify physical front desk drawer cash balance against real-time digital transaction ledger"
        size="lg"
        footer={
          <div className="flex flex-wrap items-center justify-between w-full gap-2">
            <button
              type="button"
              onClick={handlePrintZReading}
              className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-caption text-caption font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">print</span>
              <span>Print Shift Z-Reading Slip</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsReconcileOpen(false)}
                className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-primary font-caption text-caption font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReconcile}
                disabled={!isCountedValid}
                className="px-4 py-2 rounded-xl bg-action-green text-text-primary font-caption text-caption font-bold hover:bg-action-green-hover transition-colors shadow-sm cursor-pointer disabled:opacity-40 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>Confirm Shift Reconciliation</span>
              </button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col space-y-4">
          {/* Station & Active Cashier Banner */}
          <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-soft-blue flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-xl">point_of_sale</span>
              </div>
              <div>
                <span className="font-body-medium text-body-medium text-text-primary font-bold block">
                  {shiftStatus?.stationName || 'Front Desk Bay 01'}
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  Active Cashier: {shiftStatus?.activeCashierName || 'Circulation Desk'} • {shiftStatus?.shiftLabel || 'Shift #01'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 font-caption text-caption text-action-green font-bold bg-action-green/10 px-2.5 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-action-green animate-pulse"></span>
              <span>{isReconcileSyncing ? 'Refreshing Ledger...' : 'Ledger Connected'}</span>
            </div>
          </div>

          {/* Three Ledger Formula Cards: Float + Fines = Expected */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
              <span className="font-caption text-caption text-text-secondary block">Opening Float Base</span>
              <span className="font-headline-4 text-headline-4 text-text-primary font-bold mt-1 block">
                {formatPeso(shiftStatus?.floatBase ?? 0)}
              </span>
              <span className="font-caption text-[11px] text-text-secondary mt-0.5 block">Drawer Float Ceiling</span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
              <span className="font-caption text-caption text-text-secondary block">Fines Collected Today</span>
              <span className="font-headline-4 text-headline-4 text-action-green font-bold mt-1 block">
                +{formatPeso(shiftStatus?.finesCollectedToday ?? 0)}
              </span>
              <span className="font-caption text-[11px] text-text-secondary mt-0.5 block">
                {kpis?.finesDailyReceiptsCount ?? 0} receipts settled
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-surface-container-lowest border-2 border-primary/40">
              <span className="font-caption text-caption text-primary font-bold block">Expected Total Register Cash</span>
              <span className="font-headline-4 text-headline-4 text-primary font-bold mt-1 block">
                {formatPeso(expectedCash)}
              </span>
              <span className="font-caption text-[11px] text-text-secondary mt-0.5 block">Float + Today&apos;s Fines</span>
            </div>
          </div>

          {/* Counted Cash Input & Live Variance Calculation */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="font-body-medium text-body-medium font-bold text-text-primary">
                Physical Cash Count (₱)
              </label>
              {cashVariance !== null && (
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-caption text-caption font-bold shadow-xs ${
                    cashVariance === 0
                      ? 'bg-status-available text-on-primary'
                      : cashVariance > 0
                      ? 'bg-soft-blue text-primary'
                      : 'bg-status-danger text-on-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {cashVariance === 0 ? 'verified' : cashVariance > 0 ? 'trending_up' : 'trending_down'}
                  </span>
                  <span>
                    {cashVariance === 0
                      ? 'Balanced (Zero Discrepancy)'
                      : cashVariance > 0
                      ? `Drawer Overage: +${formatPeso(cashVariance)}`
                      : `Drawer Shortage: -${formatPeso(Math.abs(cashVariance))}`}
                  </span>
                </div>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-text-secondary text-lg">₱</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={countedCashInput}
                onChange={(e) => setCountedCashInput(e.target.value)}
                placeholder="Enter counted physical currency in front desk drawer..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-outline/30 bg-surface-container-lowest text-text-primary font-headline-4 text-headline-4 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Reconciliation Audit Notes */}
            <div className="space-y-1 pt-1">
              <label className="font-caption text-caption text-text-secondary block">
                Reconciliation Notes {cashVariance !== 0 && cashVariance !== null && <span className="text-status-danger font-bold">(Required for non-zero variance)</span>}
              </label>
              <textarea
                rows={2}
                value={reconcileNotes}
                onChange={(e) => setReconcileNotes(e.target.value)}
                placeholder="E.g., All drawer bills counted, coin float verified, or note on discrepancy..."
                className="w-full px-3 py-2 rounded-xl border border-outline/30 bg-surface-container-lowest text-text-primary font-body text-body focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </DefaultFloatingModalCard>

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

export default CashierDashboard;
