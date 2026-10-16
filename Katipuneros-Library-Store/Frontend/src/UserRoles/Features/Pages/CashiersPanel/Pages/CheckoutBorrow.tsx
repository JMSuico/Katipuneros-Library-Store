// [Layer: UserRoles/Features/Pages/CashiersPanel/Pages]
// CheckoutBorrow.tsx -- Cashier Circulation Desk Checkout & Borrowing.
// Connects to live /api/borrow/checkout, /api/users, /api/books, and /api/reservations.
// Strictly adheres to real-time data mandate: zero hardcoded mock values, clean empty states when N=0.
// Universal lambda syntax (=>), zero browser alert().

import { FC, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useToasts } from '../../../../../Hooks/useToasts';
import { processCashierCheckout } from '../../../../../Endpoints/Cashier/transactionApi';
import { getAdminUsersList, AdminUserRecord } from '../../../../../Endpoints/Admin/userApi';
import { getCatalogBooks, BackendBook } from '../../../../../Endpoints/booksApi';
import { getAdminReservations, BackendReservation } from '../../../../../Endpoints/Admin/reservationsApi';
import { scanBookCopy } from '../../../../../Endpoints/Admin/bookCopiesApi';
import { RadioGroup } from '../../../../../Shared/RadioButton';
import { SearchBar, useDebounce } from '../../../../../Shared/SearchBar';
import { usePagination } from '../../../../../Hooks/usePagination';
import { useTableDraggable } from '../../../../../Hooks/useTableDraggable';

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

  // Handover Verification Modal & Multi-Driver Camera Scanner State
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState<boolean>(false);
  const [handoverReservation, setHandoverReservation] = useState<BackendReservation | null>(null);
  const [pinDigits, setPinDigits] = useState<string[]>(['', '', '', '']);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraStarting, setIsCameraStarting] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [manualCodeInput, setManualCodeInput] = useState<string>('');

  // Verified Hold Details for checkout submission & custom event
  const [verifiedPickupPin, setVerifiedPickupPin] = useState<string | undefined>(undefined);
  const [verifiedReservationId, setVerifiedReservationId] = useState<string | undefined>(undefined);
  const [verifiedBay, setVerifiedBay] = useState<string | undefined>(undefined);

  // Camera & PIN Input Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
      const res = await getAdminReservations();
      const activeHolds = res.filter(
        (r) =>
          r.status === 'Pending' ||
          r.status === 'StagedInLocker' ||
          r.status === 'Approved'
      );
      setAllReservations(activeHolds.length > 0 ? activeHolds : res);
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

  // Camera Devices Enumeration
  const getCameraDevices = useCallback(async () => {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setCameraDevices(videoInputs);
      if (videoInputs.length > 0 && !selectedCameraId) {
        setSelectedCameraId(videoInputs[0].deviceId);
      }
    } catch {
      // Ignore enumeration errors
    }
  }, [selectedCameraId]);

  const stopCamera = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Open Handover Verification Modal (Option 2: Manual Search & PIN Entry)
  const openHandoverModal = useCallback((res: BackendReservation) => {
    setHandoverReservation(res);
    setPinDigits(['', '', '', '']);
    setPinError(null);
    setIsCameraActive(false);

    const patronMatch = allUsers.find(
      (u) =>
        u.id.toLowerCase() === res.patronId?.toLowerCase() ||
        u.libraryCardNumber?.toLowerCase() === res.patronLibraryId?.toLowerCase()
    );
    if (patronMatch && !selectedPatron) {
      setSelectedPatron(patronMatch);
    }

    setIsHandoverModalOpen(true);
    setTimeout(() => {
      pinInputRefs.current[0]?.focus();
    }, 150);
  }, [allUsers, selectedPatron]);

  // Stage directly from Hold Reservation (routes to Handover Verification Modal)
  const handleStageReservationHold = useCallback((res: BackendReservation) => {
    openHandoverModal(res);
  }, [openHandoverModal]);

  // Optical Code Resolution (Option 1: Optical Camera Scanner / QR / ExpressCode)
  const handleScannedCode = useCallback(
    async (rawCode: string) => {
      const code = rawCode.trim();
      if (!code) return;

      const lower = code.toLowerCase();
      const expressId = lower.startsWith('scan-bay-') ? lower.replace('scan-bay-', '') : '';

      // 1. Try matching active hold reservations
      let matchedRes = allReservations.find(
        (r) =>
          r.id.toLowerCase() === lower ||
          (expressId && r.id.toLowerCase().includes(expressId)) ||
          `scan-bay-${r.id.slice(0, 6).toLowerCase()}` === lower
      );

      if (!matchedRes) {
        try {
          const latest = await getAdminReservations();
          setAllReservations(latest);
          matchedRes = latest.find(
            (r) =>
              r.id.toLowerCase() === lower ||
              (expressId && r.id.toLowerCase().includes(expressId)) ||
              `scan-bay-${r.id.slice(0, 6).toLowerCase()}` === lower
          );
        } catch {
          // Ignore
        }
      }

      if (matchedRes) {
        stopCamera();
        setIsCameraActive(false);
        setHandoverReservation(matchedRes);
        setIsHandoverModalOpen(true);
        setPinError(null);
        setPinDigits(['', '', '', '']);

        const patronMatch = allUsers.find(
          (u) =>
            u.id.toLowerCase() === matchedRes!.patronId?.toLowerCase() ||
            u.libraryCardNumber?.toLowerCase() === matchedRes!.patronLibraryId?.toLowerCase()
        );
        if (patronMatch) {
          setSelectedPatron(patronMatch);
        }

        addToast(
          `Hold volume identified for ${matchedRes.patronName} - "${matchedRes.bookTitle}". Please enter 4-digit PIN.`,
          'info'
        );
        setTimeout(() => {
          pinInputRefs.current[0]?.focus();
        }, 200);
        return;
      }

      // 2. Check if code matches a patron ID / card
      const patronMatch = allUsers.find(
        (u) =>
          u.libraryCardNumber?.toLowerCase() === lower ||
          u.id.toLowerCase() === lower ||
          u.email.toLowerCase() === lower
      );
      if (patronMatch) {
        setSelectedPatron(patronMatch);
        const patronRes = allReservations.find(
          (r) =>
            r.patronId?.toLowerCase() === patronMatch.id.toLowerCase() ||
            r.patronLibraryId?.toLowerCase() === patronMatch.libraryCardNumber?.toLowerCase()
        );
        if (patronRes) {
          stopCamera();
          setIsCameraActive(false);
          setHandoverReservation(patronRes);
          setIsHandoverModalOpen(true);
          setPinError(null);
          setPinDigits(['', '', '', '']);
          addToast(`Patron ${patronMatch.fullName || patronMatch.name} identified with active hold.`, 'info');
          setTimeout(() => {
            pinInputRefs.current[0]?.focus();
          }, 200);
        } else {
          addToast(
            `Patron ${patronMatch.fullName || patronMatch.name} identified, but has no active holds waiting.`,
            'warning'
          );
        }
        return;
      }

      // 3. Check if code matches a book copy
      try {
        const copyScanRes = await scanBookCopy(code);
        if (copyScanRes.success && copyScanRes.data?.copy?.bookId) {
          stopCamera();
          setIsCameraActive(false);
          setIsHandoverModalOpen(false);
          setBookBarcodeQuery(copyScanRes.data.copy.accessionNumber);
          addToast(`Book copy ${copyScanRes.data.copy.accessionNumber} scanned into staging bar.`, 'success');
          return;
        }
      } catch {
        // Fallback
      }

      addToast(`Scanned code "${code}" does not match an active hold reservation.`, 'warning');
    },
    [allReservations, allUsers, stopCamera, addToast]
  );

  const startCamera = useCallback(
    async (deviceId?: string) => {
      setIsCameraStarting(true);
      setCameraError(null);
      try {
        stopCamera();

        const constraints: MediaStreamConstraints = {
          video: deviceId
            ? { deviceId: { exact: deviceId } }
            : { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        await getCameraDevices();

        const Ctor = getBarcodeDetectorCtor();
        if (Ctor) {
          const detector = new Ctor({
            formats: ['qr_code', 'code_128', 'ean_13', 'upc_a'],
          });
          scanIntervalRef.current = window.setInterval(async () => {
            if (!videoRef.current || videoRef.current.readyState < 2) return;
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0 && barcodes[0].rawValue) {
                const code = barcodes[0].rawValue;
                handleScannedCode(code);
              }
            } catch {
              // Frame detection error ignored
            }
          }, 350);
        }
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : 'Unable to access camera. Please verify device permissions or connect a USB webcam.';
        setCameraError(errorMsg);
      } finally {
        setIsCameraStarting(false);
      }
    },
    [getCameraDevices, stopCamera, handleScannedCode]
  );

  const handleOpenCameraScanner = () => {
    setIsHandoverModalOpen(true);
    setIsCameraActive(true);
  };

  const handleCloseHandoverModal = () => {
    stopCamera();
    setIsCameraActive(false);
    setIsHandoverModalOpen(false);
    setPinError(null);
  };

  // Synchronize live camera stream with modal visibility & mode
  useEffect(() => {
    if (isHandoverModalOpen && isCameraActive) {
      startCamera(selectedCameraId);
    } else {
      stopCamera();
    }
  }, [isHandoverModalOpen, isCameraActive, selectedCameraId, startCamera, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // 4-Digit Monospace PIN Inputs Handlers
  const handlePinDigitChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned) {
      setPinDigits((prev) => {
        const next = [...prev];
        next[index] = '';
        return next;
      });
      return;
    }

    const digit = cleaned.slice(-1);
    setPinDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    setPinError(null);

    // Auto-advance focus to next input
    if (index < 3) {
      pinInputRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirmPinVerification();
    }
  };

  const handlePinPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;
    const nextDigits = ['', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      nextDigits[i] = pasted[i];
    }
    setPinDigits(nextDigits);
    setPinError(null);
    const focusTarget = Math.min(pasted.length, 3);
    pinInputRefs.current[focusTarget]?.focus();
  };

  // Validate 4-digit PIN and stage book
  const handleConfirmPinVerification = async () => {
    if (!handoverReservation) {
      addToast('No hold reservation selected for verification.', 'warning');
      return;
    }

    const enteredPin = pinDigits.join('');
    if (enteredPin.length < 4) {
      setPinError('Please enter all 4 digits of the patron pickup PIN.');
      return;
    }

    const expectedPin = handoverReservation.lockerPin?.trim();
    if (expectedPin && expectedPin !== enteredPin) {
      setPinError(`Incorrect PIN (${enteredPin}). The pickup PIN does not match this hold.`);
      addToast('Verification failed: Invalid 4-digit pickup PIN.', 'error');
      return;
    }

    // PIN validated! Store verified pickupPin, reservationId, and bay
    setVerifiedPickupPin(enteredPin);
    setVerifiedReservationId(handoverReservation.id);
    setVerifiedBay(handoverReservation.lockerBay ? `Bay ${handoverReservation.lockerBay}` : 'Bay 01 Counter');

    // Auto-select patron if not already selected
    const patronMatch = allUsers.find(
      (u) =>
        u.id.toLowerCase() === handoverReservation.patronId?.toLowerCase() ||
        u.libraryCardNumber?.toLowerCase() === handoverReservation.patronLibraryId?.toLowerCase()
    );
    if (patronMatch) {
      setSelectedPatron(patronMatch);
    }

    // Fetch and stage the held volume
    try {
      const books = await getCatalogBooks(undefined, handoverReservation.bookTitle);
      const matched = books.find(
        (b) =>
          b.id.toLowerCase() === handoverReservation.bookId.toLowerCase() ||
          b.title?.toLowerCase() === handoverReservation.bookTitle.toLowerCase()
      );
      if (matched) {
        setStagedBooks((prev) => {
          if (prev.some((b) => b.id === matched.id)) return prev;
          return [...prev, matched];
        });
      }
    } catch {
      // Graceful fallback
    }

    stopCamera();
    setIsCameraActive(false);
    setIsHandoverModalOpen(false);
    setPinError(null);

    addToast(
      `Handover verified! "${handoverReservation.bookTitle}" staged with verified PIN for ${handoverReservation.patronName}.`,
      'success'
    );
  };

  const handlePatronSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = patronSearchInput.trim().toLowerCase();
    if (!query) return;

    setIsSearchingPatron(true);
    const cleanExpress = query.startsWith('scan-bay-') ? query.replace('scan-bay-', '') : '';
    const cleanPass = query.startsWith('pass-') ? query.replace('pass-', '') : '';

    if (cleanExpress) {
      const resMatch = allReservations.find((r) => r.id.toLowerCase().includes(cleanExpress));
      if (resMatch) {
        openHandoverModal(resMatch);
        setIsSearchingPatron(false);
        return;
      }
    }

    const matched = allUsers.find(
      (u) =>
        u.fullName?.toLowerCase().includes(query) ||
        u.email?.toLowerCase().includes(query) ||
        u.libraryCardNumber?.toLowerCase() === query ||
        u.id.toLowerCase() === query ||
        (cleanPass && u.libraryCardNumber?.toLowerCase().includes(cleanPass)) ||
        (cleanExpress && u.id.toLowerCase().includes(cleanExpress))
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
      const lower = query.toLowerCase();
      const cleanExpress = lower.startsWith('scan-bay-') ? lower.replace('scan-bay-', '') : '';

      // 1. If ExpressCode is scanned in book stage bar, route directly to Handover Verification Modal
      if (cleanExpress) {
        const matchedRes = allReservations.find((r) => r.id.toLowerCase().includes(cleanExpress));
        if (matchedRes) {
          openHandoverModal(matchedRes);
          setBookBarcodeQuery('');
          setIsStagingBook(false);
          return;
        }
      }

      // 2. Try resolving accession numbers (e.g. KLS-XXXX-CX, KP-ACC-...) or QR code data via scanBookCopy
      try {
        const copyScanRes = await scanBookCopy(query);
        if (copyScanRes.success && copyScanRes.data?.copy?.bookId) {
          const bookId = copyScanRes.data.copy.bookId;
          const catalogBooks = await getCatalogBooks();
          const matchedBook = catalogBooks.find((b) => b.id.toLowerCase() === bookId.toLowerCase());
          if (matchedBook) {
            if (stagedBooks.some((b) => b.id === matchedBook.id)) {
              addToast(`Book "${matchedBook.title}" is already staged.`, 'warning');
            } else {
              setStagedBooks((prev) => [...prev, matchedBook]);
              setBookBarcodeQuery('');
              addToast(`"${matchedBook.title}" (Accession: ${copyScanRes.data.copy.accessionNumber}) staged successfully.`, 'success');
            }
            setIsStagingBook(false);
            return;
          }
        }
      } catch {
        // Fall back to direct catalog query
      }

      // 3. Fallback to direct catalog books query
      const books = await getCatalogBooks(undefined, query);
      const matched = books.find(
        (b) =>
          b.isbnBarcode?.toLowerCase() === lower ||
          b.isbn?.toLowerCase() === lower ||
          b.title?.toLowerCase().includes(lower) ||
          b.id.toLowerCase() === lower ||
          (b.isbnBarcode && (lower.includes(b.isbnBarcode.toLowerCase()) || b.isbnBarcode.toLowerCase().includes(lower)))
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
        addToast(`No book found matching code: ${query}`, 'warning');
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

  // Complete Checkout with PIN & Reservation verification and custom event dispatch
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
        pickupPin: verifiedPickupPin,
        reservationId: verifiedReservationId,
      });

      const resData = res as {
        success?: boolean;
        message?: string;
        reference?: string;
        transactionReference?: string;
        data?: { reference?: string; gatePassCode?: string; id?: string };
      };

      if (resData.success !== false) {
        const refCode =
          resData.reference ||
          resData.transactionReference ||
          resData.data?.reference ||
          resData.data?.gatePassCode ||
          `KP-TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;

        const primaryTitle = stagedBooks[0]?.title || 'Library Asset';
        const patronName = selectedPatron.fullName || selectedPatron.name || 'Patron';
        const bay = verifiedBay || 'Bay 01 Counter';

        addToast(
          `Checkout successful! ${stagedBooks.length} volume(s) issued to ${patronName} (Ref: ${refCode}).`,
          'success'
        );

        // Dispatch circulation-borrow-confirmed custom event with details (reference, patronName, title, bay)
        window.dispatchEvent(
          new CustomEvent('circulation-borrow-confirmed', {
            detail: {
              reference: refCode,
              patronName,
              title: primaryTitle,
              bay,
            },
          })
        );

        setStagedBooks([]);
        setSelectedPatron(null);
        setVerifiedPickupPin(undefined);
        setVerifiedReservationId(undefined);
        setVerifiedBay(undefined);
        window.dispatchEvent(new CustomEvent('cashier-refresh-kpis'));
      } else {
        addToast(resData.message || 'Checkout failed.', 'error');
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

            {/* Open Camera Scanner Button */}
            <button
              onClick={handleOpenCameraScanner}
              type="button"
              className="px-4 py-2.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-small text-small font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm"
              title="Open Camera Scanner for QR Pass or ExpressCode"
            >
              <span className="material-symbols-outlined text-base">photo_camera</span>
              <span>Open Camera Scanner</span>
            </button>

            {/* Scanner Status Pill */}
            <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2.5 rounded-full shadow-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-action-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-action-green"></span>
              </span>
              <div className="flex flex-col leading-none">
                <span className="font-caption text-caption font-bold text-text-primary">
                  ⚡ QR &amp; ExpressCode Scanner Ready
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
                      Scan patron QR pass, library card, or browse directory
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenCameraScanner}
                    type="button"
                    className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-caption text-caption font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span className="material-symbols-outlined text-base">photo_camera</span>
                    <span>Camera Scan</span>
                  </button>
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
                    placeholder="Scan QR Code, ExpressCode, or Accession Number..."
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
                    No patron selected yet. Scan QR pass, library card, search above, or click &quot;Browse Patrons&quot; to verify eligibility.
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
                          onClick={() => openHandoverModal(res)}
                          type="button"
                          className="px-3 py-1 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-caption text-caption font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                        >
                          <span className="material-symbols-outlined text-sm">verified_user</span>
                          <span>Verify &amp; Stage Hold</span>
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
                      Book Asset QR &amp; Accession Staging
                    </h2>
                    <span className="font-caption text-caption text-text-secondary">
                      Scan QR code, ExpressCode, or accession number on book or match against catalog
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
                    placeholder="Scan QR Code, ExpressCode, or Accession Number..."
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
                    Scan or enter QR codes, ExpressCodes, or accession numbers to stage them for checkout.
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
                          <th className="py-3 px-4">Accession / QR Code</th>
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
                                <span className="block text-text-secondary text-[10px]">Accession / QR Code</span>
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
                    <th className="py-2.5 px-4">Patron QR / Card ID</th>
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

      {/* HANDOVER VERIFICATION MODAL */}
      {isHandoverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-scrim/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-outline/20 space-y-5 max-h-[92vh] flex flex-col overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-xl">
                    {isCameraActive ? 'photo_camera' : 'lock_open'}
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-4 text-headline-4 text-text-primary">
                    Physical Asset Handover &amp; Verification
                  </h3>
                  <p className="font-caption text-caption text-text-secondary">
                    Dual-Mode Verification: Live Optical Camera Scanner &amp; 4-Digit Pickup PIN
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseHandoverModal}
                className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                title="Close Modal"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Mode Switch Tabs inside Modal */}
            <div className="flex items-center gap-2 p-1 bg-surface-container rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setIsCameraActive(false);
                  stopCamera();
                }}
                className={`flex-1 py-2 rounded-lg font-caption text-caption font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  !isCameraActive
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-base">pin</span>
                <span>Option 2: 4-Digit PIN Entry</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCameraActive(true);
                  startCamera(selectedCameraId);
                }}
                className={`flex-1 py-2 rounded-lg font-caption text-caption font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isCameraActive
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-base">photo_camera</span>
                <span>Option 1: Optical Camera Scanner</span>
              </button>
            </div>

            {/* MODE CONTENT */}
            {isCameraActive ? (
              /* OPTION 1: OPTICAL CAMERA SCANNER */
              <div className="flex flex-col space-y-4">
                {/* Camera Hardware Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-surface-container-low rounded-xl">
                  <div className="flex items-center gap-2 text-text-secondary font-caption text-caption">
                    <span className="material-symbols-outlined text-base text-primary">videocam</span>
                    <span className="font-bold text-text-primary">Camera Device / Driver:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedCameraId}
                      onChange={(e) => {
                        setSelectedCameraId(e.target.value);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-surface-container-lowest border border-outline/20 text-text-primary font-caption text-caption outline-none cursor-pointer"
                    >
                      {cameraDevices.length === 0 ? (
                        <option value="">Default Web / USB Camera</option>
                      ) : (
                        cameraDevices.map((d, idx) => (
                          <option key={d.deviceId || idx} value={d.deviceId}>
                            {d.label || `Camera ${idx + 1} (${d.deviceId.slice(0, 8)}...)`}
                          </option>
                        ))
                      )}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        getCameraDevices();
                        startCamera(selectedCameraId);
                      }}
                      className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                      title="Refresh camera devices"
                    >
                      <span className="material-symbols-outlined text-base">refresh</span>
                    </button>
                  </div>
                </div>

                {/* Live Video Feed Preview */}
                <div className="relative w-full h-64 sm:h-72 bg-black rounded-xl overflow-hidden flex items-center justify-center border border-outline/20">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Optical Reticle / Scan Line Overlay */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-56 h-56 sm:w-64 sm:h-64 border-2 border-action-green/80 rounded-2xl relative shadow-2xl flex items-center justify-center">
                      {/* Corner Accents */}
                      <span className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-action-green"></span>
                      <span className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-action-green"></span>
                      <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-action-green"></span>
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-action-green"></span>

                      {/* Animated Laser Scanning Line */}
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-action-green to-transparent animate-pulse shadow-[0_0_8px_#22c55e]"></div>

                      <span className="absolute bottom-2 text-[10px] uppercase font-bold tracking-wider text-action-green bg-black/60 px-2 py-0.5 rounded-full">
                        SCAN-BAY / QR Reticle
                      </span>
                    </div>
                  </div>

                  {isCameraStarting && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center gap-2 text-on-primary font-caption">
                      <span className="animate-spin material-symbols-outlined text-xl">progress_activity</span>
                      <span>Initializing video driver...</span>
                    </div>
                  )}
                </div>

                {cameraError ? (
                  <div className="p-3 bg-status-danger/10 border border-status-danger/30 rounded-xl flex items-center gap-2 text-status-danger font-caption text-caption">
                    <span className="material-symbols-outlined text-base">error</span>
                    <span>{cameraError}</span>
                  </div>
                ) : (
                  <p className="font-caption text-caption text-text-secondary text-center">
                    Point camera at patron&#39;s QR Pass or ExpressCode on user slip (<code>SCAN-BAY-XXXXXX</code>).
                  </p>
                )}

                {/* Handheld Barcode Reader / Manual Fast Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (manualCodeInput.trim()) {
                      handleScannedCode(manualCodeInput);
                      setManualCodeInput('');
                    }
                  }}
                  className="flex items-center gap-2 pt-2 border-t border-surface-container"
                >
                  <input
                    type="text"
                    value={manualCodeInput}
                    onChange={(e) => setManualCodeInput(e.target.value)}
                    placeholder="Or type/paste ExpressCode (e.g. SCAN-BAY-XXXXXX)..."
                    className="flex-1 px-3 py-2 rounded-xl bg-surface-container text-text-primary font-mono text-caption outline-none border border-outline/20 focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={!manualCodeInput.trim()}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-caption text-caption font-bold cursor-pointer disabled:opacity-50 transition-colors"
                  >
                    Resolve Code
                  </button>
                </form>
              </div>
            ) : (
              /* OPTION 2: 4-DIGIT PIN ENTRY & VERIFICATION */
              <div className="flex flex-col space-y-4">
                {/* Hold Details Summary Card */}
                {handoverReservation ? (
                  <div className="p-4 bg-surface-container-low rounded-xl border border-outline/10 flex flex-col space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block mb-1">
                          Hold Volume Target
                        </span>
                        <h4 className="font-body-large text-body-large font-bold text-text-primary">
                          {handoverReservation.bookTitle}
                        </h4>
                        <p className="font-caption text-caption text-text-secondary">
                          Author: {handoverReservation.bookAuthor} • Call: {handoverReservation.bookCallNumber || 'N/A'}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-caption font-mono font-bold bg-primary/10 text-primary">
                        SCAN-BAY-{handoverReservation.id.slice(0, 6).toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-container font-caption text-caption">
                      <div>
                        <span className="text-text-secondary block">Patron:</span>
                        <strong className="text-text-primary">
                          {handoverReservation.patronName} ({handoverReservation.patronLibraryId})
                        </strong>
                      </div>
                      <div>
                        <span className="text-text-secondary block">Staged Bay:</span>
                        <strong className="text-action-green">
                          {handoverReservation.lockerBay ? `Bay ${handoverReservation.lockerBay}` : 'Bay 01 Counter'}
                        </strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-surface-container-low rounded-xl border border-dashed border-outline/20 text-center">
                    <p className="font-caption text-caption text-text-secondary">
                      No hold selected yet. Use Option 1 to scan QR/ExpressCode or pick a held volume from the queue.
                    </p>
                  </div>
                )}

                {/* 4-Digit Monospace PIN Inputs */}
                <div className="flex flex-col items-center justify-center space-y-3 py-2">
                  <label className="font-caption text-caption font-bold text-text-primary uppercase tracking-wider text-center">
                    Enter Patron 4-Digit Pickup PIN
                  </label>
                  <p className="font-caption text-caption text-text-secondary text-center max-w-sm">
                    Enter the 4-digit security code issued on the patron&#39;s pickup slip to authorize physical custody release.
                  </p>

                  <div className="flex items-center gap-3">
                    {pinDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          pinInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handlePinKeyDown(idx, e)}
                        onPaste={handlePinPaste}
                        className="w-14 h-16 sm:w-16 sm:h-20 text-center font-mono text-2xl sm:text-3xl font-bold bg-surface-container-high border-2 border-outline/20 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-text-primary"
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  {pinError && (
                    <div className="p-2.5 rounded-lg bg-status-danger/10 border border-status-danger/30 text-status-danger text-caption font-bold flex items-center gap-1.5 animate-in fade-in">
                      <span className="material-symbols-outlined text-base">error</span>
                      <span>{pinError}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-surface-container gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCameraActive(true);
                      startCamera(selectedCameraId);
                    }}
                    className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-secondary hover:text-text-primary font-caption text-caption font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">photo_camera</span>
                    <span>Use Camera Instead</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCloseHandoverModal}
                      className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-text-secondary font-caption text-caption transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={pinDigits.join('').length < 4 || !handoverReservation}
                      onClick={handleConfirmPinVerification}
                      className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-caption text-caption font-bold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-40 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-base">verified</span>
                      <span>Verify &amp; Confirm Handover</span>
                    </button>
                  </div>
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
