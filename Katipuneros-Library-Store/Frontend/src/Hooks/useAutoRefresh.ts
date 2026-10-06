// [Layer: Hooks]
// useAutoRefresh.ts -- Interval timer hook for background sync and auto-refresh.
// DO NOT put UI rendering or API calls here.
import { useEffect, useRef } from 'react';

export function useAutoRefresh(callback: () => void, intervalMs: number, enabled = true) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;

    const id = setInterval(() => {
      savedCallback.current();
    }, intervalMs);

    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
