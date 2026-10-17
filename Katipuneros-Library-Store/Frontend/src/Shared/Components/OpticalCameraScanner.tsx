// [Layer: Shared Components]
// OpticalCameraScanner.tsx -- Universal multi-engine optical barcode & QR camera scanner modal.
// Combines jsQR with Native BarcodeDetector, Web Audio feedback, camera controls, slip upload, and manual monospace fallback.
// Accessible across Customer, Cashier, and Admin interfaces.
// DO NOT hardcode backend queries or role-specific mutations here.

import React, { FC, useState, useEffect, useRef, useCallback, ChangeEvent, FormEvent } from 'react';
import jsQR from 'jsqr';
import { DefaultFloatingModalCard } from '../DefaultFloatingModalCard';

// Native BarcodeDetector API typings (for Chromium, Android, and Edge)
interface DetectedBarcode {
  rawValue: string;
  format?: string;
}

interface BarcodeDetectorLike {
  detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>;
}

type BarcodeDetectorCtor = new (opts?: { formats?: string[] }) => BarcodeDetectorLike;

const getBarcodeDetectorCtor = (): BarcodeDetectorCtor | null => {
  if (typeof window === 'undefined') return null;
  return (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector ?? null;
};

// Clean, pleasant Web Audio API notification beep on scan
const playBeepSound = () => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Two-tone rising chime (A5 880Hz to E6 1318.5Hz)
    const now = ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.1);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 350);
  } catch (err) {
    console.warn('Audio feedback failed or muted by browser policy:', err);
  }
};

export interface OpticalCameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
  title?: string;
  subtitle?: string;
  reticleLabel?: string;
}

export const OpticalCameraScanner: FC<OpticalCameraScannerProps> = ({
  isOpen,
  onClose,
  onScan,
  title = 'Optical Camera & QR Scanner',
  subtitle = 'Align barcode or QR code within the viewfinder, upload a slip image, or enter manually.',
  reticleLabel = 'Align QR Code or Barcode within frame',
}) => {
  // Video and stream references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const manualInputRef = useRef<HTMLInputElement | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef<number | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);
  const isCoolingDownRef = useRef<boolean>(false);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const barcodeDetectorRef = useRef<BarcodeDetectorLike | null>(null);

  // Component states
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isCameraStarting, setIsCameraStarting] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isTorchSupported, setIsTorchSupported] = useState<boolean>(false);
  const [isTorchOn, setIsTorchOn] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState<string>('');
  const [isDecodingImage, setIsDecodingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Initialize BarcodeDetector if available in browser
  useEffect(() => {
    const Ctor = getBarcodeDetectorCtor();
    if (Ctor) {
      try {
        barcodeDetectorRef.current = new Ctor({
          formats: ['qr_code', 'code_128', 'ean_13', 'upc_a', 'code_39', 'data_matrix', 'codabar', 'itf'],
        });
      } catch {
        try {
          barcodeDetectorRef.current = new Ctor();
        } catch {
          barcodeDetectorRef.current = null;
        }
      }
    }
  }, []);

  // Safe camera track and animation teardown
  const stopStream = useCallback(() => {
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // Ignore track stop exceptions
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    isProcessingRef.current = false;
    setIsTorchOn(false);
    setIsTorchSupported(false);
  }, []);

  // Handle successful code detection (from camera, image, or manual submit)
  const handleCodeDetected = useCallback(
    (rawCode: string) => {
      const code = rawCode.trim();
      if (!code || isCoolingDownRef.current) return;

      isCoolingDownRef.current = true;
      setLastScannedCode(code);
      setIsSuccess(true);
      playBeepSound();

      // Notify caller
      onScan(code);

      // Reset cooldown and visual pulse after 1.6s
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
      successTimeoutRef.current = setTimeout(() => {
        setIsSuccess(false);
        isCoolingDownRef.current = false;
      }, 1600);
    },
    [onScan]
  );

  // Throttled frame scanning loop (~30fps / every 33ms)
  const scanFrame = useCallback(() => {
    if (!isOpen) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (
      video &&
      canvas &&
      video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
      video.videoWidth > 0 &&
      video.videoHeight > 0
    ) {
      const now = performance.now();
      if (now - lastScanTimeRef.current >= 33 && !isProcessingRef.current && !isCoolingDownRef.current) {
        lastScanTimeRef.current = now;
        isProcessingRef.current = true;

        const width = video.videoWidth;
        const height = video.videoHeight;

        if (canvas.width !== width) canvas.width = width;
        if (canvas.height !== height) canvas.height = height;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);

          let detectedValue: string | null = null;

          // Engine 1: jsQR frame extraction
          try {
            const imageData = ctx.getImageData(0, 0, width, height);
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'attemptBoth',
            });
            if (qrCode && qrCode.data) {
              detectedValue = qrCode.data;
            }
          } catch {
            // Ignore frame decode exceptions
          }

          // Engine 2: BarcodeDetector API for standard 1D barcodes and QR fallback
          if (!detectedValue && barcodeDetectorRef.current) {
            try {
              barcodeDetectorRef.current
                .detect(canvas)
                .then((barcodes) => {
                  if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                    handleCodeDetected(barcodes[0].rawValue);
                  }
                  isProcessingRef.current = false;
                })
                .catch(() => {
                  isProcessingRef.current = false;
                });

              requestRef.current = requestAnimationFrame(scanFrame);
              return;
            } catch {
              isProcessingRef.current = false;
            }
          } else {
            isProcessingRef.current = false;
          }

          if (detectedValue) {
            handleCodeDetected(detectedValue);
          }
        } else {
          isProcessingRef.current = false;
        }
      }
    }

    requestRef.current = requestAnimationFrame(scanFrame);
  }, [isOpen, handleCodeDetected]);

  // Enumerate video input devices
  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setVideoDevices(videoInputs);
    } catch (e) {
      console.warn('Could not enumerate video devices:', e);
    }
  }, []);

  // Request camera stream and bind to video element
  const startStream = useCallback(
    async (deviceId?: string) => {
      stopStream();
      setIsCameraStarting(true);
      setCameraError(null);

      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera access is not supported by your browser or environment.');
        }

        const constraints: MediaStreamConstraints = {
          video: deviceId
            ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
            : { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        await refreshDevices();

        // Check torch capability
        const track = stream.getVideoTracks()[0];
        if (track && typeof track.getCapabilities === 'function') {
          const caps = (track.getCapabilities() as unknown as { torch?: boolean }) ?? {};
          setIsTorchSupported(Boolean(caps.torch));
        } else {
          setIsTorchSupported(false);
        }

        isProcessingRef.current = false;
        requestRef.current = requestAnimationFrame(scanFrame);
      } catch (err: unknown) {
        let message = 'Unable to access camera.';
        if (err instanceof DOMException) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            message =
              'Camera permission was denied. Please allow camera permissions in your browser or switch to image upload / manual entry below.';
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            message =
              'No camera device was detected. You can upload an image slip or enter the code manually below.';
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            message =
              'Camera is already in use by another application. Please close other video software and try again.';
          } else {
            message = err.message || message;
          }
        } else if (err instanceof Error) {
          message = err.message;
        }
        setCameraError(message);
      } finally {
        setIsCameraStarting(false);
      }
    },
    [refreshDevices, scanFrame, stopStream]
  );

  // Torch / Flashlight toggle
  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      const nextTorch = !isTorchOn;
      await (
        track as MediaStreamTrack & {
          applyConstraints: (c: { advanced: Array<{ torch?: boolean }> }) => Promise<void>;
        }
      ).applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setIsTorchOn(nextTorch);
    } catch (err) {
      console.warn('Could not toggle torch:', err);
    }
  };

  // Switch between cameras (cycles through available devices)
  const handleSwitchCamera = () => {
    if (videoDevices.length < 2) return;
    const currentIndex = videoDevices.findIndex((d) => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % videoDevices.length;
    const nextDevice = videoDevices[nextIndex];
    setSelectedDeviceId(nextDevice.deviceId);
  };

  // Sync stream with modal lifecycle
  useEffect(() => {
    if (isOpen) {
      startStream(selectedDeviceId);
    } else {
      stopStream();
      setManualCode('');
      setImageError(null);
      setCameraError(null);
      setIsSuccess(false);
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    }
    return () => {
      stopStream();
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, [isOpen, selectedDeviceId, startStream, stopStream]);

  // Image file upload decoder
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDecodingImage(true);
    setImageError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const offscreenCanvas = document.createElement('canvas');
          offscreenCanvas.width = img.naturalWidth;
          offscreenCanvas.height = img.naturalHeight;

          const ctx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) {
            throw new Error('Canvas context could not be created.');
          }

          ctx.drawImage(img, 0, 0);

          let detected: string | null = null;

          // Attempt 1: jsQR
          try {
            const imgData = ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
            const qr = jsQR(imgData.data, imgData.width, imgData.height, {
              inversionAttempts: 'attemptBoth',
            });
            if (qr && qr.data) {
              detected = qr.data;
            }
          } catch {
            // Proceed to BarcodeDetector
          }

          // Attempt 2: BarcodeDetector
          if (!detected && barcodeDetectorRef.current) {
            try {
              const barcodes = await barcodeDetectorRef.current.detect(offscreenCanvas);
              if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                detected = barcodes[0].rawValue;
              }
            } catch {
              // Failed detection
            }
          }

          if (detected) {
            handleCodeDetected(detected);
          } else {
            setImageError(
              'No barcode or QR code could be detected in this image. Please ensure the code is clear and well-lit, or enter the code manually.'
            );
          }
        } catch {
          setImageError('Unable to process image. Please try another file or enter the code manually.');
        } finally {
          setIsDecodingImage(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };

      img.onerror = () => {
        setImageError('Failed to load image file. Please provide a valid PNG, JPG, or WebP image.');
        setIsDecodingImage(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      setImageError('Failed to read selected image.');
      setIsDecodingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.readAsDataURL(file);
  };

  // Manual Monospace Code Input Submission
  const handleManualSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = manualCode.trim();
    if (!trimmed) return;
    handleCodeDetected(trimmed);
  };

  const handleManualClear = () => {
    setManualCode('');
    manualInputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <DefaultFloatingModalCard
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size="lg"
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col gap-4">
        {/* Style tag for HUD scanning animation */}
        <style>{`
          @keyframes opticalScannerLaser {
            0% { top: 12%; opacity: 0.85; }
            50% { top: 88%; opacity: 1; }
            100% { top: 12%; opacity: 0.85; }
          }
          .animate-scanner-laser {
            animation: opticalScannerLaser 2.2s ease-in-out infinite;
          }
        `}</style>

        {/* Viewfinder Section */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border border-outline-variant/30">
          {/* Offscreen frame canvas */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Live Video Viewport */}
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              cameraError ? 'opacity-10' : 'opacity-100'
            }`}
          />

          {/* Camera Starting / Loading Spinner */}
          {isCameraStarting && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/70 backdrop-blur-xs text-white z-10">
              <span className="material-symbols-outlined text-4xl animate-spin text-primary-fixed-dim">
                progress_activity
              </span>
              <p className="text-xs font-medium tracking-wide">Initializing optical camera...</p>
            </div>
          )}

          {/* Camera Error / Permission Blocked Overlay */}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/90 backdrop-blur-sm z-20">
              <div className="w-14 h-14 rounded-2xl bg-error-container/20 border border-error/30 flex items-center justify-center mb-3 text-status-danger">
                <span className="material-symbols-outlined text-3xl">videocam_off</span>
              </div>
              <h4 className="text-base font-bold text-white mb-1">Camera Feed Unavailable</h4>
              <p className="text-xs text-slate-300 max-w-sm mb-4 leading-relaxed">{cameraError}</p>
              <button
                type="button"
                onClick={() => startStream(selectedDeviceId)}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Retry Camera
              </button>
            </div>
          )}

          {/* Optical Viewfinder Reticle & HUD */}
          {!cameraError && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
              {/* Outer darkened vignette */}
              <div className="absolute inset-0 bg-radial from-transparent via-black/25 to-black/60 pointer-events-none" />

              {/* Central Target Box */}
              <div
                className={`relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl transition-all duration-300 flex items-center justify-center ${
                  isSuccess
                    ? 'border-2 border-action-green bg-action-green/15 shadow-[0_0_35px_rgba(155,229,100,0.65)]'
                    : 'border border-cyan-400/40 bg-black/10'
                }`}
              >
                {/* 4 Corner HUD Reticles */}
                <span
                  className={`absolute -top-1 -left-1 w-6 h-6 border-t-3 border-l-3 rounded-tl-lg transition-colors duration-200 ${
                    isSuccess ? 'border-action-green' : 'border-cyan-400'
                  }`}
                />
                <span
                  className={`absolute -top-1 -right-1 w-6 h-6 border-t-3 border-r-3 rounded-tr-lg transition-colors duration-200 ${
                    isSuccess ? 'border-action-green' : 'border-cyan-400'
                  }`}
                />
                <span
                  className={`absolute -bottom-1 -left-1 w-6 h-6 border-b-3 border-l-3 rounded-bl-lg transition-colors duration-200 ${
                    isSuccess ? 'border-action-green' : 'border-cyan-400'
                  }`}
                />
                <span
                  className={`absolute -bottom-1 -right-1 w-6 h-6 border-b-3 border-r-3 rounded-br-lg transition-colors duration-200 ${
                    isSuccess ? 'border-action-green' : 'border-cyan-400'
                  }`}
                />

                {/* Laser Sweep Line */}
                {!isSuccess && (
                  <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#38bdf8] animate-scanner-laser pointer-events-none" />
                )}

                {/* Success Feedback Notification inside Viewfinder */}
                {isSuccess && (
                  <div className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-950/85 backdrop-blur-md border border-action-green text-action-green shadow-xl animate-scaleIn pointer-events-none">
                    <span className="material-symbols-outlined text-4xl text-action-green animate-bounce">
                      check_circle
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                      Code Detected
                    </span>
                    <span className="font-mono text-xs font-semibold text-action-green bg-action-green/10 px-2 py-0.5 rounded border border-action-green/30 max-w-[200px] truncate">
                      {lastScannedCode}
                    </span>
                  </div>
                )}
              </div>

              {/* Viewfinder Label Pill */}
              <div className="mt-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-sm border border-white/10 text-white/90 text-xs font-medium flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-action-green animate-pulse" />
                <span>{reticleLabel}</span>
              </div>
            </div>
          )}

          {/* Top-Right Quick Viewport Controls (Torch & Camera Switch) */}
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            {/* Torch toggle button */}
            {isTorchSupported && (
              <button
                type="button"
                onClick={toggleTorch}
                title={isTorchOn ? 'Turn Flashlight Off' : 'Turn Flashlight On'}
                className={`p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer flex items-center justify-center ${
                  isTorchOn
                    ? 'bg-action-green text-slate-950 shadow-md font-bold'
                    : 'bg-black/60 text-white hover:bg-black/80 border border-white/15'
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {isTorchOn ? 'flashlight_on' : 'flashlight_off'}
                </span>
              </button>
            )}

            {/* Quick camera switch button */}
            {videoDevices.length > 1 && (
              <button
                type="button"
                onClick={handleSwitchCamera}
                title="Switch Camera Device"
                className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/15 transition-all cursor-pointer flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-lg">cameraswitch</span>
              </button>
            )}
          </div>
        </div>

        {/* Mid-Row Controls Bar: Device Picker & Image Upload Option */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          {/* Camera Device Selector Dropdown */}
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <span className="material-symbols-outlined text-text-secondary text-lg">videocam</span>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              disabled={videoDevices.length <= 1}
              className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-low text-text-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 cursor-pointer"
            >
              {videoDevices.length === 0 && <option value="">Default System Camera</option>}
              {videoDevices.map((device, index) => (
                <option key={device.deviceId || index} value={device.deviceId}>
                  {device.label || `Camera ${index + 1}`}
                </option>
              ))}
            </select>
          </div>

          {/* Slip / Image File Upload Action */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              disabled={isDecodingImage}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container-low hover:bg-surface-container text-text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base text-primary">
                {isDecodingImage ? 'hourglass_top' : 'upload_file'}
              </span>
              <span>{isDecodingImage ? 'Decoding...' : 'Upload Slip / QR Image'}</span>
            </button>
          </div>
        </div>

        {/* Image File Error Banner */}
        {imageError && (
          <div className="p-2.5 rounded-xl bg-error-container/30 border border-error/30 text-text-primary text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-status-danger text-base">info</span>
              <span>{imageError}</span>
            </div>
            <button
              type="button"
              onClick={() => setImageError(null)}
              className="text-text-secondary hover:text-text-primary cursor-pointer p-0.5"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}

        {/* Manual Monospace Code Fallback Form */}
        <div className="pt-2 border-t border-outline-variant/20">
          <label className="block text-xs font-bold text-text-primary mb-1.5">
            Or Enter Code Manually:
          </label>
          <form onSubmit={handleManualSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={manualInputRef}
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. BK-01928-02, USR-2026-991, or RES-4821"
                className="w-full pl-3 pr-8 py-2 font-mono text-xs uppercase tracking-wider rounded-xl border border-outline-variant/40 bg-surface-container-low text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              />
              {manualCode && (
                <button
                  type="button"
                  onClick={handleManualClear}
                  title="Clear Input"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary cursor-pointer p-0.5"
                >
                  <span className="material-symbols-outlined text-sm">cancel</span>
                </button>
              )}
            </div>

            {/* Clear Button */}
            {manualCode && (
              <button
                type="button"
                onClick={handleManualClear}
                className="px-3 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-low hover:bg-surface-container text-text-secondary text-xs font-semibold transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}

            {/* Submit Code Button */}
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">check</span>
              Submit Code
            </button>
          </form>
          <p className="text-[11px] text-text-secondary mt-1">
            Supports Physical Book Copy Barcodes, Patron Slip QR codes, and Reservation Codes.
          </p>
        </div>
      </div>
    </DefaultFloatingModalCard>
  );
};

export default OpticalCameraScanner;
