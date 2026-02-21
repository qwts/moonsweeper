import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Game } from './components/Game';
import './styles/index.css';

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

/**
 * Main entry point for the MindSweeper application.
 * 
 * Renders the Game component into the #root element with React 18 StrictMode.
 * StrictMode helps identify potential problems in the application during development.
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find root element');
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <Game />
  </StrictMode>
);
