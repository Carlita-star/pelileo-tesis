import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchAllAdminModules } from '../../services/adminGlobalSearch.service';

function AdminGlobalSearch() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const [inputValue, setInputValue] = useState(urlSearch);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setInputValue(urlSearch);
  }, [urlSearch]);

  const applySearchToUrl = useCallback((value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      const trimmed = value.trim();
      if (trimmed) next.set('search', trimmed);
      else next.delete('search');
      if (next.has('page')) next.set('page', '1');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const runGlobalSearch = useCallback(async (term) => {
    const query = term.trim();
    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const groups = await searchAllAdminModules(query);
      setResults(groups);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputValue(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      applySearchToUrl(value);
      runGlobalSearch(value);
    }, 350);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    applySearchToUrl(inputValue);
    if (inputValue.trim().length >= 2) {
      runGlobalSearch(inputValue);
    } else {
      setOpen(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    applySearchToUrl('');
    setResults([]);
    setOpen(false);
  };

  const goToItem = (group, item) => {
    setOpen(false);
    navigate(group.editPath(item.id));
  };

  const goToModuleList = (group) => {
    setOpen(false);
    const params = inputValue.trim() ? `?search=${encodeURIComponent(inputValue.trim())}` : '';
    navigate(`${group.listPath}${params}`);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const hasQuery = inputValue.trim().length >= 2;
  const showPanel = open && hasQuery;

  return (
    <div className="search-bar admin-global-search" ref={containerRef}>
      <form onSubmit={handleSubmit} role="search">
        <input
          type="search"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (hasQuery && results.length > 0) setOpen(true);
          }}
          placeholder="Buscar en atractivos, rutas, emprendimientos, eventos..."
          aria-label="Buscar en todos los módulos"
          aria-expanded={showPanel}
          aria-controls="admin-global-search-results"
          autoComplete="off"
        />
        {inputValue && (
          <button
            type="button"
            className="admin-global-search-clear"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
          >
            ×
          </button>
        )}
      </form>

      {showPanel && (
        <div className="admin-global-search-panel" id="admin-global-search-results" role="listbox">
          {loading && (
            <p className="admin-global-search-status">Buscando…</p>
          )}
          {!loading && results.length === 0 && (
            <p className="admin-global-search-status">No se encontraron resultados.</p>
          )}
          {!loading && results.map((group) => (
            <div key={group.key} className="admin-global-search-group">
              <div className="admin-global-search-group-header">
                <span>{group.label}</span>
                {group.total > group.items.length && (
                  <button
                    type="button"
                    className="admin-global-search-see-all"
                    onClick={() => goToModuleList(group)}
                  >
                    Ver todos ({group.total})
                  </button>
                )}
              </div>
              <ul className="admin-global-search-list">
                {group.items.map((item) => (
                  <li key={`${group.key}-${item.id}`}>
                    <button
                      type="button"
                      className="admin-global-search-item"
                      onClick={() => goToItem(group, item)}
                    >
                      <strong>{item.label}</strong>
                      {item.subtitle && <small>{item.subtitle}</small>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminGlobalSearch;
