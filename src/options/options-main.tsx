/**
 * Entry point for the options page React application
 * 
 * Renders the settings/options page for configuring game preferences
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Options } from './options';
import '../styles/index.css';

// Mount the React app
const root = document.getElementById('options-root');
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <Options />
    </React.StrictMode>
  );
}
