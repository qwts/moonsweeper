/**
 * Entry point for the options page React application
 * 
 * Renders the settings/options page for configuring game preferences
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Options } from './options';
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
const root = document.getElementById('options-root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Options />
    </React.StrictMode>
  );
}
