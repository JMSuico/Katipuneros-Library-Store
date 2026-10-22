// [Layer: Hooks]
// useInactivityLogoff.ts -- Tracks user interaction events and executes callback upon inactivity timeout.
// Tracks mousemove, keydown, touchstart, click, and scroll events.
// DO NOT put UI rendering or direct API calls here.

import { useEffect, useRef, useCallback } from 'react';

export function useInactivityLogoff(
  timeoutMinutes: number,
  onTimeout: () => void,
  enabled: boolean = true
): void {
  const savedOnTimeout = useRef(onTimeout);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    savedOnTimeout.current = onTimeout;
  }, [onTimeout]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!enabled || timeoutMinutes <= 0) return;

    const timeoutMs = timeoutMinutes * 60 * 1000;
    timerRef.current = setTimeout(() => {
      savedOnTimeout.current();
    }, timeoutMs);
  }, [timeoutMinutes, enabled]);

  useEffect(() => {
    if (!enabled || timeoutMinutes <= 0) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const events = ['mousemove', 'keydown', 'touchstart', 'click', 'scroll'];
    let lastActivityTime = 0;

    const handleActivity = () => {
      const now = Date.now();
      // Throttle resetting the timer to once per second to avoid churn on rapid mouse movement
      if (now - lastActivityTime > 1000) {
        lastActivityTime = now;
        resetTimer();
      }
    };

    // Initial countdown start
    resetTimer();

    events.forEach((evt) => {
      window.addEventListener(evt, handleActivity, { passive: true });
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      events.forEach((evt) => {
        window.removeEventListener(evt, handleActivity);
      });
    };
  }, [timeoutMinutes, enabled, resetTimer]);
}

export default useInactivityLogoff;
