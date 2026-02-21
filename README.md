# Moonsweeper

Moonsweeper is a modern Minesweeper game built as a Chrome extension with React, TypeScript, and Vite.

## Features

- Classic Minesweeper gameplay with multiple difficulty presets
- Undo/redo support and persistent game state
- Timer and mine counter
- Popup play experience with an options page
- Keyboard and accessibility-focused UI improvements

## Tech Stack

- React 19
- TypeScript
- Vite
- Manifest V3 (Chrome Extension)
- Vitest + Testing Library

## Development

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Run in development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Test

```bash
npm test
npm run test:coverage
```

## Loading the extension in Chrome

1. Build the project with `npm run build`.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the generated build output folder.

## Project Structure

- `src/popup/` — popup UI entry and styles
- `src/options/` — options page entry and styles
- `src/background/` — service worker and background managers
- `src/core/` — game logic and tests
- `src/components/` — React UI components

## License

ISC
