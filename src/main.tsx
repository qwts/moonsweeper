import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Game } from './components/Game';
import './styles/index.css';

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
