// [Layer: Hooks]
// usePagesGlobalRefresh.ts -- Universal network recovery and tab visibility auto-refresh hook.
// Detects window 'online', confirms /api/health DB connectivity, and syncs active pages upon return.
// DO NOT put UI rendering or feature business logic here.

import { useEffect, useState, useCallback, useRef } from 'react';
import { getApiBaseUrl } from '../Endpoints/apiClient';

export interface UsePagesGlobalRefreshOptions {
  onRefresh?: () => void | Promise<void>;
  checkHealthOnReconnect?: boolean;
  syncOnVisibility?: boolean;
}

export function usePagesGlobalRefresh(
  callbackOrOptions?: (() => void | Promise<void>) | UsePagesGlobalRefreshOptions
) {
  const options: UsePagesGlobalRefreshOptions =
    typeof callbackOrOptions === 'function'
      ? { onRefresh: callbackOrOptions }
      : callbackOrOptions || {};
  const { onRefresh, checkHealthOnReconnect = true, syncOnVisibility = true } = options;
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isHealthy, setIsHealthy] = useState<boolean>(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  const savedCallback = useRef(onRefresh);
  useEffect(() => {
    savedCallback.current = onRefresh;
  }, [onRefresh]);

  const executeRefresh = useCallback(async () => {
    try {
      if (checkHealthOnReconnect) {
        // Must be absolute. The previous relative '/api/health' resolved against the
        // Vite dev origin (5173/5174/5175) instead of the API host, and no dev proxy
        // is configured -- so the check always failed and isHealthy stayed pinned at
        // its initialiser, silently disabling health detection on all 17 consumers.
        const res = await fetch(`${getApiBaseUrl()}/health`).catch(() => null);
        setIsHealthy(Boolean(res && res.ok));
      }
      if (savedCallback.current) {
        await savedCallback.current();
      }
      setLastRefreshedAt(new Date());
    } catch (err) {
      console.error('[usePagesGlobalRefresh] Auto-refresh failed:', err);
    }
  }, [checkHealthOnReconnect]);

  const lastVisibilityRefreshRef = useRef<number>(Date.now());

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      await executeRefresh();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleVisibilityChange = async () => {
      const now = Date.now();
      // Throttle visibility refreshes: require at least 10 seconds between automatic tab-switch syncs
      if (syncOnVisibility && document.visibilityState === 'visible' && (now - lastVisibilityRefreshRef.current > 10000)) {
        lastVisibilityRefreshRef.current = now;
        await executeRefresh();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [executeRefresh, syncOnVisibility]);

  return {
    isOnline,
    isHealthy,
    lastRefreshedAt,
    triggerGlobalRefresh: executeRefresh,
  };
}
