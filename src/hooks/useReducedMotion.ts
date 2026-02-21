/**
 * useReducedMotion hook for detecting and respecting motion preferences
 * 
 * Features:
 * - Detects prefers-reduced-motion media query
 * - Listens for preference changes in real-time
 * - Can be overridden by user preference
 * - Applies .no-animations class to document root when active
 * 
 * Usage:
 *   const prefersReducedMotion = useReducedMotion();
 */
import { useState, useEffect } from 'react';

/**
 * Check if user prefers reduced motion via media query
 */
function getReducedMotionPreference(): boolean {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
}

/**
 * Hook to detect and respond to reduced motion preferences
 * 
 * @param userOverride - Optional user preference override (from settings)
 * @returns boolean indicating if animations should be disabled
 */
export function useReducedMotion(userOverride?: boolean): boolean {
  const [systemPrefersReduced, setSystemPrefersReduced] = useState<boolean>(
    getReducedMotionPreference()
  );

  // Listen for changes to prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemPrefersReduced(event.matches);
    };

    // Modern browsers use addEventListener
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  // Determine final reduced motion state
  // If userOverride is explicitly set, use that; otherwise use system preference
  const reducedMotion = userOverride !== undefined ? !userOverride : systemPrefersReduced;

  // Apply/remove .no-animations class to document root
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (reducedMotion) {
      document.documentElement.classList.add('no-animations');
    } else {
      document.documentElement.classList.remove('no-animations');
    }

    return () => {
      document.documentElement.classList.remove('no-animations');
    };
  }, [reducedMotion]);

  return reducedMotion;
}
