import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.json';

/**
 * Vite configuration for Chrome Extension
 * 
 * Uses @crxjs/vite-plugin to automatically handle:
 * - Multiple entry points (popup, options, background, index)
 * - Service worker bundling with proper module support
 * - Icon and asset copying
 * - Hot module reload for development
 * - Manifest v3 compliance
 */
export default defineConfig({
  plugins: [
    react(),
    crx({ manifest: manifest as any }),
  ],
  build: {
    outDir: 'dist',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**'],
    },
  },
});
