import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest, getApiBase } from '../../services/apiClient';
import {
  clearSession,
  getStoredUser,
  getPrimaryRoleLabel,
  isAdministrador,
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

function AdminProfileMenu() {
  const navigate = useNavigate();
  const usuario = getStoredUser();
  const [open, setOpen] = useState(false);
  const [fotoUrl, setFotoUrl] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
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
  }, []);

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

  const handleLogout = () => {
    setOpen(false);
    clearSession();
    navigate(ADMIN_PATHS.login, { replace: true });
  };

  const goPerfil = () => {
    setOpen(false);
    navigate(ADMIN_PATHS.perfil);
  };

  const displayName = getDisplayName(usuario);
  const roleLabel = getPrimaryRoleLabel(usuario);

  return (
    <div className="admin-topbar-actions">
      {isAdministrador() && (
        <button
          type="button"
          className="admin-notifications-btn"
          onClick={() => navigate(ADMIN_PATHS.errores)}
          aria-label="Ver errores del sistema"
          title="Errores del sistema"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2Z"
              fill="currentColor"
            />
          </svg>
        </button>
      )}

      <div className="admin-profile-menu" ref={containerRef}>
        <button
          type="button"
          className={`admin-profile-trigger${open ? ' is-open' : ''}`}
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-haspopup="menu"
        >
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt=""
              className="user-avatar user-avatar-img admin-profile-avatar"
            />
          ) : (
            <span className="user-avatar admin-profile-avatar">{getInitials(usuario)}</span>
          )}
          <span className="admin-profile-name">{displayName}</span>
          <span className="admin-profile-chevron" aria-hidden="true">▾</span>
        </button>

        {open && (
          <div className="admin-profile-dropdown" role="menu">
            <div className="admin-profile-dropdown-header">
              <strong>{displayName}</strong>
              <small>{roleLabel}</small>
            </div>
            <button type="button" className="admin-profile-dropdown-item" role="menuitem" onClick={goPerfil}>
              Ver perfil
            </button>
            <button
              type="button"
              className="admin-profile-dropdown-item admin-profile-dropdown-item--danger"
              role="menuitem"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminProfileMenu;
