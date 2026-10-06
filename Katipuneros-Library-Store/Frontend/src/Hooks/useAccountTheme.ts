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

export function useAccountTheme() {
  const currentUser = getStoredUser();
  const accountKey = currentUser?.userId ? `katipuneros_theme_${currentUser.userId}` : 'katipuneros_theme_guest';

  const [preferences, setPreferences] = useState<UserThemePreferences>(() => {
    try {
      const stored = localStorage.getItem(accountKey) || localStorage.getItem(GLOBAL_THEME_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PREFERENCES;
  });

  // Re-load if user account changes (login/logout)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(accountKey) || localStorage.getItem(GLOBAL_THEME_KEY);
      if (stored) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(stored) });
      }
    } catch {
      // Ignore
    }
  }, [accountKey]);

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
        root.style.colorScheme = 'light';
      }
    } else {
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

  const updatePreferences = useCallback((newPrefs: Partial<UserThemePreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...newPrefs };
      try {
        localStorage.setItem(accountKey, JSON.stringify(updated));
        localStorage.setItem(GLOBAL_THEME_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('[useAccountTheme] LocalStorage write failed:', err);
      }
      return updated;
    });
  }, [accountKey]);

  const setThemeMode = useCallback((themeMode: ThemeMode) => updatePreferences({ themeMode }), [updatePreferences]);
  const setAccentColor = useCallback((accentColor: string) => updatePreferences({ accentColor }), [updatePreferences]);
  const setDisplayDensity = useCallback((displayDensity: DisplayDensity) => updatePreferences({ displayDensity }), [updatePreferences]);
  const setFontSizeMultiplier = useCallback((fontSizeMultiplier: FontSizeMultiplier) => updatePreferences({ fontSizeMultiplier }), [updatePreferences]);

  const resetTheme = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    try {
      localStorage.setItem(accountKey, JSON.stringify(DEFAULT_PREFERENCES));
      localStorage.setItem(GLOBAL_THEME_KEY, JSON.stringify(DEFAULT_PREFERENCES));
    } catch {
      // Ignore
    }
  }, [accountKey]);

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
