// [Layer: Hooks]
// useAccountTheme.ts -- Universal account-bound theme, color scheme, density, and font scaling hook.
// Automatically persists appearance preferences per user account to localStorage and syncs with backend.
// DO NOT put UI presentation or direct DOM styling logic outside the theme applicator.

import { useState, useEffect, useCallback } from 'react';
import { getStoredUser } from '../Endpoints/authApi';

export type ThemeMode = 'light' | 'oled' | 'dark' | 'system';
export type DisplayDensity = 'compact' | 'comfortable' | 'relaxed';
export type FontSizeMultiplier = '90%' | '100%' | '110%' | '125%';

export interface AccentColorOption {
  id: string;
  name: string;
  hex: string;
  isDarkTheme?: boolean;
}

export const ACCENT_COLOR_OPTIONS: AccentColorOption[] = [
  { id: 'academic-blue', name: 'Academic Blue', hex: '#287EA7' },
  { id: 'action-lime', name: 'Action Lime', hex: '#9BE564' },
  { id: 'deep-navy', name: 'Deep Navy', hex: '#164E63' },
  { id: 'emerald-glow', name: 'Emerald Glow (Dark)', hex: '#0D9488', isDarkTheme: true },
  { id: 'indigo-cyber', name: 'Royal Indigo (Dark)', hex: '#6366F1', isDarkTheme: true },
];

export interface UserThemePreferences {
  themeMode: ThemeMode;
  accentColor: string;
  displayDensity: DisplayDensity;
  fontSizeMultiplier: FontSizeMultiplier;
}

const DEFAULT_PREFERENCES: UserThemePreferences = {
  themeMode: 'light',
  accentColor: '#287EA7',
  displayDensity: 'comfortable',
  fontSizeMultiplier: '100%',
};

const GLOBAL_THEME_KEY = 'katipuneros_global_theme_preferences';
const THEME_BROADCAST_CHANNEL = 'katipuneros_theme_sync';

function loadPreferencesForAccount(key: string): UserThemePreferences {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
    const globalStored = localStorage.getItem(GLOBAL_THEME_KEY);
    if (globalStored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(globalStored) };
    }
  } catch (err) {
    console.warn('[useAccountTheme] Error reading preferences from localStorage:', err);
  }
  return DEFAULT_PREFERENCES;
}

export function useAccountTheme() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const accountKey = currentUser?.userId ? `katipuneros_theme_${currentUser.userId}` : 'katipuneros_theme_guest';

  const [preferences, setPreferences] = useState<UserThemePreferences>(() =>
    loadPreferencesForAccount(accountKey)
  );

  // Listen to katipuneros-auth-changed window event to re-evaluate the user account key
  useEffect(() => {
    const handleAuthChange = () => {
      const user = getStoredUser();
      setCurrentUser(user);
    };

    window.addEventListener('katipuneros-auth-changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('katipuneros-auth-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Re-load specific saved preferences when accountKey changes (login/logout)
  useEffect(() => {
    const loaded = loadPreferencesForAccount(accountKey);
    setPreferences(loaded);
  }, [accountKey]);

  // Synchronize theme changes across ports (5173, 5174, 5175) and browser tabs via BroadcastChannel
  useEffect(() => {
    const handleIncomingTheme = (data: { accountKey?: string; userId?: string | number | null; preferences?: UserThemePreferences }) => {
      if (!data || !data.preferences) return;

      const isSameUser = Boolean(
        data.userId &&
        currentUser?.userId &&
        String(data.userId) === String(currentUser.userId)
      );
      const isBothGuest = !data.userId && !currentUser?.userId;
      const isSameKey = Boolean(data.accountKey && data.accountKey === accountKey);

      if (isSameUser || isBothGuest || isSameKey) {
        setPreferences(data.preferences);
      }
    };

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        channel = new BroadcastChannel(THEME_BROADCAST_CHANNEL);
        channel.onmessage = (event: MessageEvent) => {
          if (event.data?.type === 'THEME_SYNC' && event.data?.preferences) {
            handleIncomingTheme(event.data);
          }
        };
      } catch (err) {
        console.warn('[useAccountTheme] BroadcastChannel setup failed:', err);
      }
    }

    const handleLocalSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        handleIncomingTheme(customEvent.detail);
      }
    };
    window.addEventListener('katipuneros-theme-sync', handleLocalSync);

    return () => {
      if (channel) {
        channel.close();
      }
      window.removeEventListener('katipuneros-theme-sync', handleLocalSync);
    };
  }, [accountKey, currentUser?.userId]);

  // Apply theme to document element
  useEffect(() => {
    const root = document.documentElement;
    const { themeMode, accentColor, displayDensity, fontSizeMultiplier } = preferences;

    // Theme Mode
    root.classList.remove('dark', 'oled');
    if (themeMode === 'oled') {
      root.classList.add('dark', 'oled');
      root.style.colorScheme = 'dark';
    } else if (themeMode === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else if (themeMode === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark', 'oled');
        root.style.colorScheme = 'light';
      }
    } else {
      root.classList.remove('dark', 'oled');
      root.style.colorScheme = 'light';
    }

    // Accent Color custom properties
    root.style.setProperty('--color-primary', accentColor);
    root.style.setProperty('--color-primary-container', accentColor);

    // Font size multiplier
    const fontMultiplierValue = {
      '90%': '0.9',
      '100%': '1.0',
      '110%': '1.1',
      '125%': '1.25',
    }[fontSizeMultiplier] || '1.0';
    root.style.setProperty('--font-size-multiplier', fontMultiplierValue);

    // Display density root tokens
    const densityPadding = {
      compact: '0.75rem',
      comfortable: '1rem',
      relaxed: '1.25rem',
    }[displayDensity];
    root.style.setProperty('--density-padding', densityPadding);

  }, [preferences]);

  // Dynamic matchMedia listener when theme is set to 'system'
  useEffect(() => {
    if (preferences.themeMode !== 'system' || typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const root = document.documentElement;
      root.classList.remove('oled');
      if (e.matches) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    handleSystemThemeChange(mediaQuery);

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };
    } else if ('addListener' in mediaQuery) {
      (mediaQuery as any).addListener(handleSystemThemeChange);
      return () => {
        (mediaQuery as any).removeListener(handleSystemThemeChange);
      };
    }
  }, [preferences.themeMode]);

  const emitBroadcast = useCallback((updated: UserThemePreferences) => {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel(THEME_BROADCAST_CHANNEL);
        channel.postMessage({
          type: 'THEME_SYNC',
          accountKey,
          userId: currentUser?.userId ?? null,
          preferences: updated,
        });
        channel.close();
      } catch (err) {
        console.warn('[useAccountTheme] BroadcastChannel postMessage failed:', err);
      }
    }
    try {
      window.dispatchEvent(
        new CustomEvent('katipuneros-theme-sync', {
          detail: {
            accountKey,
            userId: currentUser?.userId ?? null,
            preferences: updated,
          },
        })
      );
    } catch {
      // Ignore
    }
  }, [accountKey, currentUser?.userId]);

  const updatePreferences = useCallback((newPrefs: Partial<UserThemePreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...newPrefs };
      try {
        localStorage.setItem(accountKey, JSON.stringify(updated));
        // Remove global preference bleed: do not overwrite GLOBAL_THEME_KEY when a specific user updates preferences
        if (!currentUser?.userId) {
          localStorage.setItem(GLOBAL_THEME_KEY, JSON.stringify(updated));
        }
      } catch (err) {
        console.warn('[useAccountTheme] LocalStorage write failed:', err);
      }
      emitBroadcast(updated);
      return updated;
    });
  }, [accountKey, currentUser?.userId, emitBroadcast]);

  const setThemeMode = useCallback((themeMode: ThemeMode) => updatePreferences({ themeMode }), [updatePreferences]);
  const setAccentColor = useCallback((accentColor: string) => updatePreferences({ accentColor }), [updatePreferences]);
  const setDisplayDensity = useCallback((displayDensity: DisplayDensity) => updatePreferences({ displayDensity }), [updatePreferences]);
  const setFontSizeMultiplier = useCallback((fontSizeMultiplier: FontSizeMultiplier) => updatePreferences({ fontSizeMultiplier }), [updatePreferences]);

  const resetTheme = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    try {
      localStorage.setItem(accountKey, JSON.stringify(DEFAULT_PREFERENCES));
      // Remove global preference bleed: do not overwrite GLOBAL_THEME_KEY when a specific user resets preferences
      if (!currentUser?.userId) {
        localStorage.setItem(GLOBAL_THEME_KEY, JSON.stringify(DEFAULT_PREFERENCES));
      }
    } catch {
      // Ignore
    }
    emitBroadcast(DEFAULT_PREFERENCES);
  }, [accountKey, currentUser?.userId, emitBroadcast]);

  return {
    preferences,
    themeMode: preferences.themeMode,
    accentColor: preferences.accentColor,
    displayDensity: preferences.displayDensity,
    fontSizeMultiplier: preferences.fontSizeMultiplier,
    setThemeMode,
    setAccentColor,
    setDisplayDensity,
    setFontSizeMultiplier,
    resetTheme,
    accentColorOptions: ACCENT_COLOR_OPTIONS,
  };
}

export default useAccountTheme;
