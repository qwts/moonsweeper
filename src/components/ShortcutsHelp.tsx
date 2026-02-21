import { useEffect, useRef } from 'react';
import styles from '../styles/Game.module.css';

/**
 * Props for ShortcutsHelp component
 */
interface ShortcutsHelpProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
}

/**
 * Keyboard shortcuts reference modal.
 * 
 * Features:
 * - Displays all available keyboard shortcuts
 * - Modal overlay with focus trap
 * - Closes on Escape key or close button
 * - ARIA attributes for screen readers
 * - Restores focus to trigger element on close
 */
export function ShortcutsHelp({ isOpen, onClose }: ShortcutsHelpProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  // Store the trigger element and set initial focus
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element to restore later
      triggerElementRef.current = document.activeElement as HTMLElement;
      
      // Focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0);

      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Restore focus to trigger element
      if (triggerElementRef.current) {
        triggerElementRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap: cycle Tab/Shift+Tab within modal
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: wrap from first to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: wrap from last to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleTabKey);
    return () => window.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className={styles.modalBackdrop}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        className={styles.shortcutsModal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <div className={styles.shortcutsHeader}>
          <h2 id="shortcuts-title" className={styles.modalTitle}>
            Keyboard Shortcuts
          </h2>
          <button
            ref={closeButtonRef}
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close keyboard shortcuts dialog"
          >
            ×
          </button>
        </div>

        <div className={styles.shortcutsContent}>
          <div className={styles.shortcutsSection}>
            <h3>Game Controls</h3>
            <dl className={styles.shortcutsList}>
              <dt>Arrow Keys</dt>
              <dd>Navigate between cells</dd>
              
              <dt>Space / Enter</dt>
              <dd>Reveal selected cell</dd>
              
              <dt>F</dt>
              <dd>Toggle flag on selected cell</dd>
              
              <dt>C</dt>
              <dd>Chord (reveal adjacent cells)</dd>
            </dl>
          </div>

          <div className={styles.shortcutsSection}>
            <h3>History</h3>
            <dl className={styles.shortcutsList}>
              <dt>Ctrl+Z</dt>
              <dd>Undo last move</dd>
              
              <dt>Ctrl+Shift+Z / Ctrl+Y</dt>
              <dd>Redo last undone move</dd>
            </dl>
          </div>

          <div className={styles.shortcutsSection}>
            <h3>Settings</h3>
            <dl className={styles.shortcutsList}>
              <dt>M</dt>
              <dd>Toggle mute/unmute sound</dd>
            </dl>
          </div>

          <div className={styles.shortcutsSection}>
            <h3>Navigation</h3>
            <dl className={styles.shortcutsList}>
              <dt>H / ?</dt>
              <dd>Show this keyboard shortcuts help</dd>
              
              <dt>Escape</dt>
              <dd>Close dialogs and modals</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
