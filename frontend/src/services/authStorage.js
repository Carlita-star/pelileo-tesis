export function getStoredUser() {
  const raw = localStorage.getItem('usuario');
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return localStorage.getItem('autenticado') === 'true' && Boolean(localStorage.getItem('token'));
}

export function saveSession({ usuario, token }) {
  localStorage.setItem('usuario', JSON.stringify(usuario));
  localStorage.setItem('autenticado', 'true');
  localStorage.setItem('token', token);
}

export function clearSession() {
  localStorage.removeItem('usuario');
  localStorage.removeItem('autenticado');
  localStorage.removeItem('token');
}

const ADMIN_PANEL_ROLES = new Set(['administrador', 'gestor_turistico']);

export function normalizeRole(role) {
  return (role || '').trim().toLowerCase().replace(/\s+/g, '_');
}

export function hasPanelAccess(user = getStoredUser()) {
  const roles = user?.roles || [];
  return roles.some((role) => ADMIN_PANEL_ROLES.has(normalizeRole(role)));
}
