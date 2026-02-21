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

// Mount the React app
const root = document.getElementById('popup-root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Popup />
    </React.StrictMode>
  );
}
