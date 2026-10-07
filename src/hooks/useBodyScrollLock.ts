import { useEffect } from 'react';

let lockCount = 0;
let previousBodyOverflow = '';
let previousHtmlOverflow = '';

/**
 * Hook to lock background scrolling when any modal, popup, or card dialog is open.
 * Supports multiple nested modals cleanly using reference counting.
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked || typeof document === 'undefined') return;

    if (lockCount === 0) {
      previousBodyOverflow = document.body.style.overflow;
      previousHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.classList.add('overflow-hidden');
    }
    lockCount++;

    return () => {
      lockCount--;
      if (lockCount <= 0) {
        lockCount = 0;
        document.body.style.overflow = previousBodyOverflow;
        document.documentElement.style.overflow = previousHtmlOverflow;
        document.body.classList.remove('overflow-hidden');
      }
    };
  }, [isLocked]);
}
