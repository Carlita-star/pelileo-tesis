import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest, getApiBase } from '../../services/apiClient';
import {
  clearSession,
  getStoredUser,
  hasPanelAccess,
  isAuthenticated,
} from '../../services/authStorage';
import { ADMIN_PATHS } from '../../routes/adminPaths';

function getDisplayName(usuario) {
  return usuario?.nombre_completo
    || `${usuario?.nombres || ''} ${usuario?.apellidos || ''}`.trim()
    || usuario?.username
    || 'Usuario';
}

function getInitials(usuario) {
  const name = getDisplayName(usuario);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return (parts[0]?.[0] || '?').toUpperCase();
}

function buildFotoUrl(fotoUrl) {
  if (!fotoUrl) return null;
  if (fotoUrl.startsWith('http')) return fotoUrl;
  return `${getApiBase()}${fotoUrl.startsWith('/') ? fotoUrl : `/${fotoUrl}`}`;
}

function PublicProfileMenu() {
  const navigate = useNavigate();
  const [, setAuthTick] = useState(0);
  const [open, setOpen] = useState(false);
  const [fotoUrl, setFotoUrl] = useState(null);
  const containerRef = useRef(null);
  const usuario = getStoredUser();
  const autenticado = isAuthenticated();

  useEffect(() => {
    const refresh = () => setAuthTick((n) => n + 1);
    window.addEventListener('auth-changed', refresh);
    return () => window.removeEventListener('auth-changed', refresh);
  }, []);

  useEffect(() => {
    if (!autenticado) {
      setFotoUrl(null);
      return undefined;
    }
    let cancelled = false;
    apiRequest('/api/admin/perfil/')
      .then((data) => {
        if (!cancelled && data?.foto_url) {
          setFotoUrl(buildFotoUrl(data.foto_url));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [autenticado, usuario?.id]);

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

  if (!autenticado || !usuario) {
    return (
      <Link
        to={ADMIN_PATHS.login}
        className="ml-2 rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white transition hover:bg-primario-oscuro"
      >
        Iniciar sesión
      </Link>
    );
  }

  const displayName = getDisplayName(usuario);
  const panelAccess = hasPanelAccess(usuario);

  const handleLogout = () => {
    setOpen(false);
    clearSession();
    navigate('/', { replace: true });
  };

  return (
    <div className="relative ml-2" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 shadow-sm transition hover:border-slate-300"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {fotoUrl ? (
          <img src={fotoUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primario text-sm font-bold text-white">
            {getInitials(usuario)}
          </span>
        )}
        <span className="max-w-[120px] truncate text-sm font-semibold text-slate-800">{displayName}</span>
        <span className="text-xs text-slate-400" aria-hidden="true">▾</span>
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-2 min-w-[200px] overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
          role="menu"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-slate-800">{displayName}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => {
              setOpen(false);
              navigate('/mi-cuenta');
            }}
          >
            Ver perfil
          </button>
          {panelAccess && (
            <button
              type="button"
              role="menuitem"
              className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
              onClick={() => {
                setOpen(false);
                navigate(ADMIN_PATHS.dashboard);
              }}
            >
              Entrar a administrar
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            className="block w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}

export default PublicProfileMenu;
