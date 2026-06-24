const API_BASE = process.env.REACT_APP_API_URL ?? 'http://localhost:8000';

export function getApiBase() {
  return API_BASE;
}

export function getAuthHeaders(includeJson = true) {
  const headers = {};
  if (includeJson) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('token');
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function parseAuthError(status, message) {
  if (status === 403 && /administrador|permiso/i.test(message)) {
    return 'No tienes permiso para esta sección. Contacta al administrador.';
  }
  if (status === 403 && /autenticado/i.test(message)) {
    return 'Tu sesión expiró o no es válida. Cierra sesión e ingresa de nuevo en /admin/login.';
  }
  if (status === 403 && /permisos/i.test(message)) {
    return 'Tu cuenta no tiene permisos de panel. Usa un usuario administrador o gestor turístico.';
  }
  return message;
}

export async function apiRequest(path, options = {}) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(!isFormData && options.body !== undefined),
      ...(options.headers || {}),
    },
  });

  const raw = await response.text();
  let data = {};
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      const isHtml = /<!DOCTYPE|<html/i.test(raw);
      if (isHtml && response.status === 404) {
        data = { error: 'Ruta no encontrada en el backend. Reinicie el servidor: python manage.py runserver' };
      } else if (isHtml) {
        data = { error: `Error ${response.status} del servidor.` };
      } else {
        data = { error: raw.slice(0, 200) };
      }
    }
  }

  if (!response.ok) {
    const message = parseAuthError(response.status, data.error || data.detail || `Error ${response.status}`);
    throw new Error(message);
  }
  return data;
}

export default apiRequest;
