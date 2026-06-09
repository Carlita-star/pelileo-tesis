import { useEffect, useState } from 'react';
import { apiRequest } from '../services/apiClient';

export function usePublicList(endpoint) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await apiRequest(endpoint);
        setItems(data.results || data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [endpoint]);

  return { items, loading, error };
}
