import { useCallback, useRef, useState } from 'react';

/**
 * Evita envíos duplicados por doble clic: el ref bloquea de inmediato
 * mientras el state deshabilita los botones en el siguiente render.
 */
export function useSubmitLock() {
  const lockRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const withLock = useCallback(async (fn) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setIsSubmitting(true);
    try {
      return await fn();
    } finally {
      lockRef.current = false;
      setIsSubmitting(false);
    }
  }, []);

  const isLocked = useCallback(() => lockRef.current, []);

  return { isSubmitting, withLock, isLocked };
}
