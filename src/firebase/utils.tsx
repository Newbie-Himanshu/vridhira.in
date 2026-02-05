'use client';
import { useMemo } from 'react';

/**
 * Custom hook to memoize Firebase references and queries.
 * This is essential for preventing infinite render loops when using 
 * Firestore hooks like useCollection or useDoc.
 */
export function useMemoFirebase<T>(factory: () => T, deps: any[]): T {
  const memoized = useMemo(factory, deps);
  
  if (memoized && typeof memoized === 'object') {
    // Add a flag so Firestore hooks can verify proper memoization
    (memoized as any).__memo = true;
  }
  
  return memoized;
}
