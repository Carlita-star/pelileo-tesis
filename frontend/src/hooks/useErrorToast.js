import { useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';

export function useErrorToast(error, options = {}) {
  const toast = useToast();
  const lastMessage = useRef('');
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (!error || error === lastMessage.current) return;
    lastMessage.current = error;
    const action = optionsRef.current.action;
    toast.error(error, action ? { action } : undefined);
  }, [error, toast]);

  useEffect(() => {
    if (!error) {
      lastMessage.current = '';
    }
  }, [error]);
}
