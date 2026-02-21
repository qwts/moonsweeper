/**
 * Entry point for the options page React application
 * 
 * Renders the settings/options page for configuring game preferences
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/index.css';

// Placeholder component - will be implemented in Phase 2
function OptionsApp() {
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>MindSweeper Settings</h1>
      <p>Options page coming in Phase 2</p>
      <h2>Planned Features:</h2>
      <ul>
        <li>Difficulty presets (Easy, Medium, Hard, Custom)</li>
        <li>Theme selection (Light, Dark, Color-blind modes)</li>
        <li>Sound preferences (On/Off/Volume)</li>
        <li>Statistics viewer (games played, win rate, best times)</li>
      </ul>
    </div>
  );
}

// Mount the React app
const root = document.getElementById('options-root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <OptionsApp />
    </React.StrictMode>
  );
}
