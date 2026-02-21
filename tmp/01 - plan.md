# Section 1 Implementation Plan: Core Gameplay

**Project**: MindSweeper Browser Extension  
**Section**: 1 - Core Gameplay (7 issues, 29 story points)  
**Tech Stack**: TypeScript, React, Vitest  
**Date**: February 20, 2026

## Overview

Building the complete Minesweeper game logic and UI for a browser extension. This plan covers grid generation, mine placement, cell interactions (including chording), flood-fill reveal, timer/counter, win/loss detection, and undo/redo. The architecture separates game logic (pure TypeScript classes) from UI (React components), enabling thorough unit testing and clean state management.

## Architecture Decisions

- **TypeScript over JavaScript** for type safety and better tooling
- **React** for component-based UI (richer ecosystem, better structure for complex state)
- **Vitest** for fast, modern testing with excellent TS support (75% coverage goal)
- **Iterative flood-fill with queue** (not recursion) to prevent stack overflow on large boards
- **Command pattern for undo/redo** enabling atomic compound operations and configurable history depth
- **React Context for state management** (sufficient for this scope; no Redux needed)
- **Seeded RNG using simple LCG algorithm** for deterministic testing without external deps
- **Full-page extension view** (not popup) with Manifest v3
- **Vite bundler** with hot reload for development
- **chrome.storage API** for state persistence (scaffolding now, full implementation in Section 2)
- **Timer continues running** during undo/redo and across page close/reopen
- **Incremental implementation**: One issue at a time with testing before moving forward

## Project Structure

```
.
├── manifest.json           # Manifest v3 configuration
├── public/                 # Extension assets
│   └── index.html         # Full-page entry point
├── src/
│   ├── core/              # Pure TypeScript game logic (no React)
│   │   ├── Board.ts       # Board generation, mine placement
│   │   ├── Board.test.ts  # Board unit tests
│   │   ├── GameState.ts   # Game state manager, reveal/flag logic
│   │   ├── GameState.test.ts # GameState unit tests
│   │   ├── presets.ts     # Difficulty presets and validation
│   │   ├── storage.ts     # chrome.storage wrapper (scaffolding)
│   │   └── commands/      # Command pattern for undo/redo
│   │       ├── Command.ts
│   │       ├── RevealCommand.ts
│   │       ├── FlagCommand.ts
│   │       ├── ChordCommand.ts
│   │       └── FloodFillCommand.ts
│   ├── components/        # React UI components
│   │   ├── Game.tsx       # Main game component
│   │   ├── GameSetup.tsx  # Difficulty selector & custom config
│   │   ├── Board.tsx      # Grid container, keyboard nav
│   │   ├── Cell.tsx       # Individual cell with interactions
│   │   ├── StatusBar.tsx  # Timer & mine counter
│   │   ├── Controls.tsx   # Undo/redo buttons
│   │   ├── EndGameModal.tsx # Win/loss modal
│   │   └── Game.test.tsx  # Integration tests
│   ├── contexts/
│   │   └── GameContext.tsx # React context for game state
│   ├── hooks/
│   │   └── useGame.ts     # Custom hook for game actions
│   ├── types/
│   │   └── game.ts        # TypeScript interfaces
│   ├── utils/
│   │   └── random.ts      # Seeded RNG utilities
│   ├── styles/
│   │   └── Board.module.css # Grid styling
│   └── main.tsx           # React entry point
├── dist/                  # Build output (extension ready), `manifest.json`

- Initialize npm project with TypeScript, React, Vitest
- Configure Vite for Chromium Manifest v3 extension with hot reload
- Set up vitest for unit and integration testing (75% coverage goal)
- Create minimal manifest.json with full-page view
- Create directory structure as outlined above
- Configure TypeScript with strict mode
- Add chrome types for storage API

**Commands**:
```bash
npm init -y
npm install react react-dom
npm install -D typescript @types/react @types/react-dom @types/chrome
npm install -D vite @vitejs/plugin-react vite-plugin-web-extension
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D @vitest/coverage-v8
```

**manifest.json** (minimal v3):
```json
{
  "manifest_version": 3,
  "name": "MindSweeper",
  "version": "0.1.0",
  "description": "Minesweeper browser extension",
  "permissions": ["storage"],
  "action": {
    "default_title": "MindSweeper"
  },
  "icons": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  }
}
```

**vite.config.ts** (with extension support and hot reload):
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import webExtension from 'vite-plugin-web-extension';

export default defineConfig({
  plugins: [
    react(),
    webExtension({
      manifest: './manifest.json',
      watchFilePaths: ['src/**/*'],
      additionalInputs: ['src/main.tsx'],
    }),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'public/index.html',
      },
    },
  },
});
- Set up vitest for unit and integration testing
- Create directory structure as outlined above
- Configure TypeScript with strict mode

**Commands**:
```bash
npm init -y
npm install react react-dom
npm install -D typescript @types/react @types/react-dom
npm install -D vite @vitejs/plugin-react
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

---

### Step 2: Core Data Structures (Issue 01-01)
**Dependencies**: None  
**Time estimate**: 2-3 hours  
**Files**: `src/types/game.ts`, `src/core/Board.ts`, `src/utils/random.ts`

#### `src/types/game.ts`
Define TypeScript interfaces:
```typescript
export type CellState = 'hidden' | 'revealed' | 'flagged';
export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

export interface Cell {
  row: number;
  col: number;
  isMine: boolean;
  adjacentMines: number;
  state: CellState;
}

export interface Board {
  rows: number;
  cols: number;
  mines: number;
  cells: Cell[][];
}

export interface GameConfig {
  rows: number;
  cols: number;
  mines: number;
  seed?: number;
}
```

#### `src/core/Board.ts`
Core board logic class:
- Constructor validates config (5-50 dimensions, mines < total cells)
- `initializeCells()`: Create 2D array of cells
- `placeMines(seed?)`: Random/seeded mine placement using Fisher-Yates
- `calculateAdjacentMines()`: Count mines around each cell
- `getCellAt(row, col)`: Safe cell accessor with bounds checking

**Key methods**:
```typescript
class BoardManager {
  constructor(config: GameConfig) {
    this.validateConfig(config);
    this.initializeCells();
    this.placeMines(config.seed);
    this.calculateAdjacentMines();
  }

  private validateConfig(config: GameConfig): void {
    if (config.rows < 5 || config.rows > 50) throw new Error('Invalid rows');
    if (config.cols < 5 || config.cols > 50) throw new Error('Invalid cols');
    if (config.mines >= config.rows * config.cols) throw new Error('Too many mines');
    if (config.mines < 1) throw new Error('At least 1 mine required');
  }

  private placeMines(seed?: number): void {
    // Fisher-Yates shuffle with optional seeded RNG
    // Mark K unique random cells as mines
  }
}
```

#### `src/utils/random.ts`
Seeded random number generator (simple LCG):
```typescript
export class SeededRandom {
  constructor(seed: number);
  next(): number; // Returns 0-1
  nextInt(max: number): number; // Returns 0 to max-1
}
```

---

### Step 3: Mine Placement & Validation Tests (Issue 01-01)
**Dependencies**: Step 2  
**Time estimate**: 1-2 hours  
**Files**: `src/core/Board.test.ts`

Write comprehensive unit tests:
- ✓ Creating 9×9 board produces 81 cells
- ✓ Creating 16×16 board with 40 mines places exactly 40 mines
- ✓ Same seed produces identical mine layouts (test 3 times)
- ✓ Different seeds produce different layouts
- ✓ Validation rejects mines >= cells
- ✓ Validation rejects negative dimensions
- ✓ Validation rejects dimensions > 50
- ✓ Adjacent mine counts are correct for edge/corner/center cells

--startTimestamp: number; // For continuous timer
  moveHistory: Command[];
  historyIndex: number;

  revealCell(row: number, col: number): void;
  toggleFlag(row: number, col: number): void;
  performChord(row: number, col: number): void;
  checkWinCondition(): boolean;
  checkLossCondition(): boolean;
  undo(): void;
  redo(): void;
  
  // Serialization for storage (scaffolding)
  serialize(): SerializedGameState;
  static deserialize(data: SerializedGameState): GameState;
}
```

#### `src/core/storage.ts`
Scaffolding for chrome.storage wrapper (full implementation in Section 2):
```typescript
export async function saveGameState(state: SerializedGameState): Promise<void> {
  // Scaffolding: localStorage for now, chrome.storage.local in Section 2
  localStorage.setItem('gameState', JSON.stringify(state));
}

export async function loadGameState(): Promise<SerializedGameState | null> {
  const data = localStorage.getItem('gameState');
  return data ? JSON.parse(data) : nullIFFICULTY_PRESETS = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 30, cols: 16, mines: 99 },
} as const;

export function validateCustomConfig(
  rows: number,
  cols: number,
  mines: number
): { valid: boolean; error?: string } {
  // Return validation result with error message
}
```

#### `src/components/GameSetup.tsx`
React component with:
- Radio buttons or dropdown for Easy/Medium/Hard
- Custom mode: numeric inputs for rows, cols, mines
- Inline validation messages (red text below inputs)
- "Start Game" button (disabled if validation fails)
- Persist last custom values in localStorage

---

### Step 5: Game State Management
**Dependencies**: Steps 2-4  
**Time estimate**: 3-4 hours  
**Files**: `src/core/GameState.ts`, `src/contexts/GameContext.tsx`, `src/hooks/useGame.ts`

#### `src/core/GameState.ts`
Central game state manager:
```typescript
class GameState {
  board: BoardManager;
  status: GameStatus;
  revealedCount: number;
  flaggedCells: Set<string>; // "row,col" keys
  elapsedTime: number;
  moveHistory: Command[];
  historyIndex: number;

  revealCell(row: number, col: number): void;
  toggleFlag(row: number, col: number): void;
  performChord(row: number, col: number): void;
  checkWinCondition(): boolean;
  checkLossCondition(): boolean;
  undo(): void;
  redo(): void;
}
```

#### `src/contexts/GameContext.tsx`
React context providing game state and actions to all components.

#### `src/hooks/useGame.ts`
Custom hook abstracting game context:
```typescript
export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
```

---

### Step 6: Cell Interaction Handlers (Issue 01-03)
**Dependencies**: Step 5  
**Time estimate**: 3-4 hours  
**Files**: `src/components/Cell.tsx`, `src/components/Board.tsx`

#### `src/components/Cell.tsx`
Individual cell component:
- **onClick**: Call `gameState.revealCell(row, col)`
- **onContextMenu**: Prevent default, call `gameState.toggleFlag(row, col)`
- **onTouchStart/onTouchEnd**: Long-press detection (~500ms) for mobile flagging
- **Visual states**: CSS classes for hidden/revealed/flagged
- **Accessibility**: `aria-label` describing cell state

#### `src/components/Board.tsx`
Grid container:
- Render cells in CSS Grid layout
- **Keyboard navigation**: 
  - Arrow keys move focus between cells
  - Space/Enter on focused cell reveals it
  - 'F' key toggles flag on focused cell
- Track focused cell index in state
- Disable interactions when game status is won/lost

#### Chording Implementation
In `GameState.performChord(row, col)`:
1. Check if cell is revealed and has a number > 0
2. Count adjacent flagged cells
3. If flagged count === cell number, reveal all adjacent unflagged cells
4. Trigger in `Cell.tsx` on middle-click or Ctrl+click

---

### Step 7: Flood-Fill Algorithm (Issue 01-04)
**Dependencies**: Step 6  
**Time estimate**: 2-3 hours  
**Files**: `src/core/GameState.ts` (extend `revealCell`), `src/core/GameState.test.ts`

#### Iterative BFS Flood-Fill
When revealing a zero-cell:
```typescript
private floodFillReveal(startRow: number, startCol: number): Cell[] {
  const revealed: Cell[] = [];
  const queue: [number, number][] = [[startRow, startCol]];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const [row, col] = queue.shift()!;
    const key = `${row},${col}`;
    
    if (visited.has(key)) continue;
    visited.add(key);
    
    const cell = this.board.getCellAt(row, col);
    if (!cell || cell.state !== 'hidden') continue;
    
    // Reveal this cell
    cell.state = 'revealed';
    revealed.push(cell);
    
    // If zero, add neighbors to queue
    if (cell.adjacentMines === 0) {
      for (const neighbor of this.getNeighbors(row, col)) {
        queue.push([neighbor.row, neighbor.col]);
      }
    }
  }
  
  return revealed; // For undo command
Timer continues running during undo/redo and persists across page reloads:
```typescript
private startTimestamp: number = 0;

startTimer(): void {
  if (this.status !== 'playing' || this.startTimestamp > 0) return;
  this.startTimestamp = Date.now();
}

getElapsedTime(): number {
  if (this.startTimestamp === 0) return 0;
  if (this.status === 'won' || this.status === 'lost') {
    return this.elapsedTime; // Frozen at end
  }
  // Calculate live elapsed time
  return Math.floor((Date.now() - this.startTimestamp) / 1000);
}

stopTimer(): void {
  if (this.startTimestamp > 0) {
    this.elapsedTime = this.getElapsedTime();
    this.startTimestamp = 0; // Mark as stopped
  }
}
```

Start timer on first reveal, stop on win/loss. Timer keeps running even if extension closes/reopens (persisted via startTimestamp)
private timerInterval?: NodeJS.Timeout;

startTimer(): void {
  if (this.status !== 'playing') return;
  this.timerInterval = setInterval(() => {
    this.elapsedTime++;
    this.notifyListeners(); // Trigger React re-render
  }, 1000);
}

stopTimer(): void {
  if (this.timerInterval) {
    clearInterval(this.timerInterval);
    this.timerInterval = undefined;
  }
}
```

Start timer on first reveal, stop on win/loss.

#### `src/components/StatusBar.tsx`
Display:
- **Timer**: Format `elapsedTime` as MM:SS
- **Mine Counter**: `totalMines - flaggedCells.size`
- Both with `aria-live="polite"` for screen reader announcements
- Update immediately on any state change

---

### Step 9: Win/Loss Detection (Issue 01-06)
**Dependencies**: Steps 7-8  
**Time estimate**: 2-3 hours  
**Files**: `src/core/GameState.ts`, `src/components/EndGameModal.tsx`

#### Win/Loss Logic
In `GameState.revealCell()`:
```typescript
revealCell(row: number, col: number): void {
  const cell = this.board.getCellAt(row, col);
  
  if (cell.isMine) {
    this.status = 'lost';
    this.revealAllMines();
    this.stopTimer();
    return;
  }
  
  // Reveal cell (and flood-fill if zero)
  // ...
  
  this.checkWinCondition();
}

private checkWinCondition(): void {
  const totalCells = this.board.rows * this.board.cols;
  const safeCells = totalCells - this.board.mines;
  
  if (this.revealedCount === safeCells) {
    this.status = 'won';
    this.stopTimer();
  }
}
```

#### `src/components/EndGameModal.tsx`
Modal overlay showing:
- Result: "You Win! 🎉" or "Game Over 💣"
- Elapsed time
- "Play Again" button (resets game)
- Disable background cell interactions (pointer-events: none)

---

### Step 10: Undo/Redo System (Issue 01-07)
**Dependencies**: Steps 6-9  
**Time estimate**: 4-5 hours  
**Files**: `src/core/commands/*.ts`, `src/components/Controls.tsx`

#### Command Pattern
`src/core/commands/Command.ts`:
```typescript
export interface Command {
  execute(): void;
  undo(): void;
}
```

Concrete commands store cell snapshots:
- **RevealCommand**: Stores pre-reveal cell state, undo hides cell
- **FlagCommand**: Stores flagged/unflagged state, undo toggles back
- **FloodFillCommand**: Stores array of revealed cells, undo hides all
- **ChordCommand**: Stores all reveals from chord, undo hides all

#### History Management in GameState
```typescript
private history: Command[] = [];
private historyIndex: number = -1;
private readonly MAX_HISTORY = 10; // Configurable

executeCommand(command: Command): void {
  // Clear redo stack
  this.history = this.history.slice(0, this.historyIndex + 1);
  
  command.execute();
  this.history.push(command);
  
  if (this.history.length > this.MAX_HISTORY) {
    this.history.shift();
  } else {
    this.historyIndex++;
  }
}

undo(): void {
  if (this.historyIndex < 0) return;
  
  const command = this.history[this.historyIndex];
  command.undo();
  this.historyIndex--;
  
  // If undoing a loss, return to 'playing'
  if (this.status === 'lost' || this.status === 'won') {
    this.status = 'playing';
  }
}

redo(): void {
  if (this.historyIndex >= this.history.length - 1) return;
  
  this.historyIndex++;
  const command = this.history[this.historyIndex];
  command.execute();
}
```

#### `src/components/Controls.tsx`
- Undo button (disabled if historyIndex < 0)
- Redo button (disabled if at end of history)
- Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Shift+Z or Ctrl+Y (redo)
- Clear history on new game

#### Edge Cases to Test
- ✓ Undoing a losing move restores 'playing' status and hides revealed mines
- ✓ Undoing a winning move restores 'playing' status
- ✓ Undo/redo updates timer correctly (timer pauses during undo?)
- ✓ History limited to 10 moves (oldest discarded)
- ✓ Starting new game clears history

---

### Step 11: UI Components Assembly
**Dependencies**: Steps 1-10  
**Time estimate**: 2-3 hours  
**Files**: `src/components/Game.tsx`, `src/styles/Board.module.css`

#### `src/components/Game.tsx`
Main component orchestration:
```tsx
export function Game() {
  return (
    <GameProvider>
      <div className="game-container">
        <GameSetup />
        <StatusBar />
        <Board />
        <Controls />
        <EndGameModal />
      </div>
    </GameProvider>
  );
}
```

#### `src/styles/Board.module.css`
Responsive grid:
- CSS Grid with `grid-template-columns: repeat(auto-fit, minmax(24px, 1fr))`
- Touch targets ≥ 44×44px for mobile
- Breakpoints for popup sizes (320px, 768px, 1024px)
- Hover effects on desktop, active states on mobile

---

### Step 12: Integration Testing
**Dependencies**: Step 11  
**Time estimate**: 3-4 hours  
**Files**: `src/components/Game.test.tsx`

Comprehensive integration tests using `@testing-library/react`:

1. **Game initialization**
   - ✓ Start with Easy preset, board renders 9×9 grid
   - ✓ Start with custom config (12×12, 15 mines)

2. **Cell interactions**
   - ✓ Click cell reveals it
   - ✓ Right-click toggles flag, updates mine counter
   - ✓ Keyboard: arrow keys move focus, Space reveals, F flags

3. **Chording**
   - ✓ Reveal numbered cell, flag correct neighbors, middle-click reveals remaining

4. **Flood-fill**
   - ✓Overall coverage: ≥75% (goal for Section 1)
- [ ] Board.test.ts: High coverage on Board class (hot path)
- [ ] GameState.test.ts: ≥75% coverage including edge cases
- [ ] Command tests: All command undo/redo cycles work
- [ ] Run `npm run test:coverage` to verify
   - ✓ Reveal all safe cells, win modal appears, timer stops

6. **Loss scenario**
   - ✓ Reveal mine, loss modal appears, all mines shown, timer stops

7. **Undo/redo**
   - ✓ Reveal cell, undo, cell is hidden again
   - ✓ Flag cell, undo, flag removed
   - ✓ Trigger flood-fill, undo, all revealed cells hidden (atomic)
   - ✓ Lose game, undo, game continues
   - ✓ Redo after undo re-applies action

8. **Edge cases**
   - ✓ Cannot interact with cells after game ends
   - ✓ Timer doesn't start until first reveal
   - ✓ History cleared on new game

---

## Verification Checklist

### Unit Tests
- [ ] `npm test` passes all tests
- [ ] Board.test.ts: 100% coverage on Board class
- [ ] GameState.test.ts: ≥90% coverage including edge cases
- [ ] Command tests: All command undo/redo cycles work

### Manual Testing
- [ ] Play Easy game start to finish (win)
- [ ] Play Medium game, intentionally lose
- [ ] Custom config with invalid values shows validation errors
- [ ] Flag 10 cells, counter shows correct remaining mines
- [ ] Click zero-cell, flood-fill reveals large region instantly
- [ ] Middle-click numbered cell with correct flags, chording works
- [ ] Use arrow keys + Space/F for full keyboard-only gameplay
- [ ] Undo/redo sequence across multiple actions
- [ ] Undo losing move, continue playing
- [ ] Timer accurate (compare with stopwatch over 60 seconds)

### Accessibility
- [ ] Screen reader announces timer and mine counter changes
- [ ] All interactive elements keyboard-accessible
- [ ] Focus indicators visible
- [ ] ARIA labels on cells describe state

### Performance
- [ ] Flood-fill on 30×16 board completes in < 100ms
- [ ] No lag when revealing cells rapidly
- [ ] Undo/redo instant (< 50ms)

### Responsive Design
- [ ] Game playable at 320px width (iPhone SE)
- [ ] Touch targets ≥ 44×44px on mobile
- [ ] No horizontal scroll in popup
- [ ] Grid scales appropriately on large screens

---

## Issue Coverage

| Issue | File(s) | Completion Criteria |
|-------|---------|---------------------|
| 01-01: Resizable grid & random mine placement | `Board.ts`, `Board.test.ts` | ✓ N×M grid, K mines, seeded RNG, validation |
| 01-02: Difficulty presets & custom game | `presets.ts`, `GameSetup.tsx` | ✓ Easy/Med/Hard presets, custom validation, UI |
| 01-03: Cell interactions & chording | `Cell.tsx`, `Board.tsx`, `GameState.ts` | ✓ Click/flag/keyboard, chording on numbered cells |
| 01-04: Recursive reveal (flood-fill) | `GameState.ts` | ✓ Iterative BFS, handles large boards, atomic undo |
| 01-05: Timer & mine counter | `GameState.ts`, `StatusBar.tsx` | ✓ Start on first reveal, stop on end, aria-live |
| 01-06: Win/Loss detection & end-game flow | `GameState.ts`, `EndGameModal.tsx` | ✓ Detect win/loss, show modal, disable interaction |
| 01-07: Undo/Redo move history | `commands/*.ts`, `Controls.tsx` | ✓ Command pattern, 10-deep history, undo win/loss |

**Total Story Points**: 29  
**Estimated Development Time**: 25-35 hours

---

## Dependencies for Future Sections

Section 1 provides foundation for:
- **Section 2 (Extension)*Scaffolding uses localStorage; Section 2 will migrate to chrome.storage.local for proper extension persistence.

2. **Extension Structure**: Full-page view (not popup) with Manifest v3. Vite configured for hot reload development.

3. **Timer Implementation**: Timestamp-based (not setInterval) so timer continues running across page close/reopen and during undo/redo.

4. **Incremental Development**: Implement one issue at a time, pause for review before continuing. Unit test frequently (75% coverage goal).

5. **Accessibility Depth**: Basic a11y included (ARIA labels, keyboard nav). Section 3 will enhance with full screen reader testing.

6. **Styling**: Minimal styling in Section 1 (functional CSS). Section 3 will add themes and animations.

7. **Performance Monitoring**: Add performance.now() measurements in critical paths (flood-fill, undo) to validate < 100ms requirement.

8. **Mobile Long-Press**: 500ms threshold may need tuning based on user feedback.

9. **Seeded RNG**: Simple LCG sufficient for game purposes. Not cryptographically secure (not required).

10. **Development Workflow**: 
    - `npm run dev` → Hot reload development with extension loading
    - `npm test` → Run unit tests
    - `npm run test:coverage` → Coverage report
    - `npm run build` → Production build to dist/
4. **Styling**: Minimal styling in Section 1 (functional CSS). Section 3 will add themes and animations.

5. **Timer Pause**: Currently timer runs continuously. Future: consider pause feature or pause on undo?

6. **Performance Monitoring**: Add performance.now() measurements in critical paths (flood-fill, undo) to validate < 100ms requirement.

7. **Mobile Long-Press**: 500ms threshold may need tuning based on user feedback.

8. **Seeded RNG**: Simple LCG sufficient for game purposes. Not cryptographically secure (not required).

---

**END OF PLAN**
