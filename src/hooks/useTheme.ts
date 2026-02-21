/**
 * useTheme hook for managing theme state and preferences
 * 
 * Features:
 * - Detects system color scheme preference
 * - Persists theme selection to chrome.storage.sync
 * - Syncs theme across all extension contexts (popup, options, full-page)
 * - Applies theme by setting data-theme attribute on document root
 * 
 * Supported themes: 'light', 'dark', 'colorblind', 'system'
 */
import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'colorblind';
export type ThemeSetting = Theme | 'system';

interface UseThemeReturn {
  /** Current active theme (resolved from 'system' if needed) */
  theme: Theme;
  /** User's theme setting (may be 'system') */
  themeSetting: ThemeSetting;
  /** System's preferred theme (from prefers-color-scheme) */
  systemTheme: Theme;
  /** Update theme setting and persist to storage */
  setTheme: (newTheme: ThemeSetting) => Promise<void>;
  /** Whether theme is loading from storage */
  isLoading: boolean;
}

/**
 * Get system color scheme preference
 */
function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  
  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  return darkModeQuery.matches ? 'dark' : 'light';
}

/**
 * Apply theme to document root
 */
function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  
  // Set data-theme attribute on root element
  document.documentElement.setAttribute('data-theme', theme);
  
  // Also set as class for compatibility (optional)
  document.documentElement.className = `theme-${theme}`;
}

/**
 * Theme management hook
 */
export function useTheme(): UseThemeReturn {
  const [systemTheme, setSystemTheme] = useState<Theme>(getSystemTheme());
  const [themeSetting, setThemeSetting] = useState<ThemeSetting>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Resolve actual theme from setting (handle 'system' option)
  const theme: Theme = themeSetting === 'system' ? systemTheme : themeSetting;

  // Load theme from storage on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const result = await chrome.storage.sync.get('theme');
        const savedTheme = result.theme as ThemeSetting | undefined;
        
        if (savedTheme && ['light', 'dark', 'colorblind', 'system'].includes(savedTheme)) {
          setThemeSetting(savedTheme);
        } else {
          // Default to system preference if no saved theme
          setThemeSetting('system');
        }
      } catch (error) {
        console.error('Failed to load theme from storage:', error);
        setThemeSetting('system');
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  // Listen for system color scheme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    // Modern browsers use addEventListener
    darkModeQuery.addEventListener('change', handleChange);

    return () => {
      darkModeQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Listen for theme changes from other extension contexts
  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.theme?.newValue) {
        const newTheme = changes.theme.newValue as ThemeSetting;
        if (['light', 'dark', 'colorblind', 'system'].includes(newTheme)) {
          setThemeSetting(newTheme);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Update theme setting and persist to storage
  const setTheme = useCallback(async (newTheme: ThemeSetting) => {
    if (!['light', 'dark', 'colorblind', 'system'].includes(newTheme)) {
      console.error('Invalid theme:', newTheme);
      return;
    }

    try {
      // Update local state immediately for responsive UI
      setThemeSetting(newTheme);

      // Persist to storage (will sync across extension contexts)
      await chrome.storage.sync.set({ theme: newTheme });
    } catch (error) {
      console.error('Failed to save theme to storage:', error);
      // Revert on error
      const result = await chrome.storage.sync.get('theme');
      setThemeSetting((result.theme as ThemeSetting) || 'system');
    }
  }, []);

  return {
    theme,
    themeSetting,
    systemTheme,
    setTheme,
    isLoading,
  };
}
