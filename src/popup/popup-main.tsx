/**
 * Entry point for the popup React application
 * 
 * Renders the compact popup UI for quick gameplay in the extension popup
 * (400×600px max dimensions)
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Popup } from './popup';
import '../styles/index.css';

/**
 * Apply theme immediately to prevent flash of wrong theme
 */
(() => {
  const applyResolvedTheme = (themeSetting: string | undefined) => {
    const theme = themeSetting || 'system';
    const resolvedTheme = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;

    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-colorblind');
    document.documentElement.classList.add(`theme-${resolvedTheme}`);
  };

  if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
    chrome.storage.sync.get('theme', (result) => {
      applyResolvedTheme(result.theme as string | undefined);
    });
    return;
  }

  const localTheme = localStorage.getItem('sync_theme');
  if (localTheme) {
    try {
      applyResolvedTheme(JSON.parse(localTheme));
      return;
    } catch {
      applyResolvedTheme(undefined);
      return;
    }
  }

  applyResolvedTheme(undefined);
})();

// Mount the React app
const root = document.getElementById('popup-root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>
  );
}
