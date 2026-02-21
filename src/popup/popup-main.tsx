/**
 * Entry point for the popup React application
 * 
 * Renders the compact popup UI for quick gameplay in the extension popup
 * (400×600px max dimensions)
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import '../styles/index.css';

// Placeholder component - will be implemented in Phase 2
function PopupApp() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>MindSweeper Popup</h1>
      <p>Popup UI coming in Phase 2</p>
      <button onClick={() => {
        chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
      }}>
        Open Full Page
      </button>
    </div>
  );
}

// Mount the React app
const root = document.getElementById('popup-root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <PopupApp />
    </React.StrictMode>
  );
}
