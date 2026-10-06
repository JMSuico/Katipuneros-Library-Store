// [Layer: Hooks]
// useRefreshTelemetry.ts -- Operational feed countdown and telemetry auto-sync hook.
// Manages 5-minute automated sync countdown (e.g. 04:22) and manual refresh triggers.
// DO NOT put UI rendering or feature business logic here.

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseRefreshTelemetryOptions {
  syncIntervalSeconds?: number;
  onRefresh?: () => void | Promise<void>;
  initialEventText?: string;
}

export function useRefreshTelemetry(options: UseRefreshTelemetryOptions = {}) {
  const {
    syncIntervalSeconds = 300,
    onRefresh,
    initialEventText = 'Desk #2 processed Return (ID #LN-8942) 3 mins ago',
  } = options;

  const calculateInitialSeconds = () => {
    const epochSec = Math.floor(Date.now() / 1000);
    const rem = syncIntervalSeconds - (epochSec % syncIntervalSeconds);
    return rem <= 0 ? syncIntervalSeconds : rem;
  };

  const [secondsRemaining, setSecondsRemaining] = useState<number>(calculateInitialSeconds);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [eventText, setEventText] = useState<string>(initialEventText);

  const savedRefresh = useRef(onRefresh);
  useEffect(() => {
    savedRefresh.current = onRefresh;
  }, [onRefresh]);

  const triggerRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      if (savedRefresh.current) {
        await savedRefresh.current();
      }
    } catch (err) {
      console.error('[useRefreshTelemetry] Telemetry sync error:', err);
    } finally {
      setIsRefreshing(false);
      setSecondsRemaining(syncIntervalSeconds);
    }
  }, [syncIntervalSeconds]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          triggerRefresh();
          return syncIntervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [syncIntervalSeconds, triggerRefresh]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const countdownFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    secondsRemaining,
    countdownFormatted,
    isRefreshing,
    eventText,
    setEventText,
    refreshTelemetry: triggerRefresh,
  };
}
