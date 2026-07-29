import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useListSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';

  const setSearch = useCallback((value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const trimmed = typeof value === 'string' ? value.trim() : '';
      if (trimmed) next.set('search', trimmed);
      else next.delete('search');
      next.set('page', '1');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  return [search, setSearch];
}
