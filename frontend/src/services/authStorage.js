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
  window.dispatchEvent(new Event('auth-changed'));
}

export function updateStoredUser(partial) {
  const current = getStoredUser();
  if (!current) return;
  localStorage.setItem('usuario', JSON.stringify({ ...current, ...partial }));
  window.dispatchEvent(new Event('auth-changed'));
}

export function clearSession() {
  localStorage.removeItem('usuario');
  localStorage.removeItem('autenticado');
  localStorage.removeItem('token');
  window.dispatchEvent(new Event('auth-changed'));
}

const ADMIN_PANEL_ROLES = new Set(['administrador', 'gestor_turistico']);

export function normalizeRole(role) {
  return (role || '').trim().toLowerCase().replace(/\s+/g, '_');
}

export function hasPanelAccess(user = getStoredUser()) {
  const roles = user?.roles || [];
  return roles.some((role) => ADMIN_PANEL_ROLES.has(normalizeRole(role)));
}

export function isAdministrador(user = getStoredUser()) {
  const roles = user?.roles || [];
  return roles.some((role) => normalizeRole(role) === 'administrador');
}

const ROLE_LABELS = {
  administrador: 'Administrador',
  gestor_turistico: 'Gestor turístico',
  visitante: 'Visitante',
};

export function getPrimaryRoleLabel(user = getStoredUser()) {
  const roles = (user?.roles || []).map(normalizeRole);
  if (roles.includes('administrador')) return ROLE_LABELS.administrador;
  if (roles.includes('gestor_turistico')) return ROLE_LABELS.gestor_turistico;
  if (roles.includes('visitante')) return ROLE_LABELS.visitante;
  return 'Sin rol de panel';
}

export function canEditConfiguration(user = getStoredUser()) {
  return hasPanelAccess(user);
}
