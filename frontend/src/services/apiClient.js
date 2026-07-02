import { clearSession } from './authStorage';
import { AppError, ERROR_TYPES, handleAppError, mapHttpStatusToMessage } from './errorService';

const API_BASE = process.env.REACT_APP_API_URL ?? 'http://localhost:8000';
const DEFAULT_TIMEOUT_MS = 30000;

export function getApiBase() {
  return API_BASE;
}

export function buildAuthHeaders(includeJson = false) {
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

export function getAuthHeaders(includeJson = true) {
  return buildAuthHeaders(includeJson);
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

function moduloFromPath(path) {
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'api' && parts[1] === 'admin' && parts[2]) return parts[2];
  if (parts[0] === 'api' && parts[1]) return parts[1];
  return 'general';
}

function buildAppErrorFromResponse(data, status, path) {
  const rawMessage = data.error || data.detail || `Error ${status}`;
  const userMessage = parseAuthError(status, mapHttpStatusToMessage(status, rawMessage));
  let tipo = data.tipo || ERROR_TYPES.DESCONOCIDO;
  if (status === 401) tipo = ERROR_TYPES.AUTENTICACION;
  if (status === 403) tipo = ERROR_TYPES.PERMISO;
  if (status === 400 && data.errors) tipo = ERROR_TYPES.VALIDACION;
  if (status >= 500) tipo = ERROR_TYPES.SERVIDOR;

  return new AppError(userMessage, {
    status,
    tipo,
    modulo: data.modulo || moduloFromPath(path),
    fieldErrors: data.errors || null,
    technicalMessage: data.detalle_tecnico || '',
    detalleTecnico: data.detalle_tecnico || data.stack_trace || '',
  });
}

function handleAuthFailure(status, path) {
  if (path.includes('/auth/login')) return;
  clearSession();
  const params = new URLSearchParams({
    sesion: status === 403 ? 'sin-permisos' : 'expirada',
  });
  window.location.assign(`/admin/login?${params.toString()}`);
}

export async function apiRequest(path, options = {}) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const includeJson = !isFormData && options.body !== undefined;
  const modulo = options.modulo || moduloFromPath(path);
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        ...buildAuthHeaders(includeJson),
        ...(options.headers || {}),
      },
    });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const timeoutError = new AppError(
        'La solicitud tardó demasiado en responder (timeout). Verifique su conexión o el servidor.',
        { status: 408, tipo: ERROR_TYPES.RED, modulo },
      );
      throw handleAppError(timeoutError, { path, modulo });
    }
    const networkError = new AppError(
      'No se pudo conectar con el servidor. Verifique que el backend esté en ejecución.',
      { status: 0, tipo: ERROR_TYPES.RED, technicalMessage: err.message, modulo },
    );
    throw handleAppError(networkError, { path, modulo });
  }
  clearTimeout(timeoutId);

  const rawBody = await response.text();
  let data = {};
  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      const isHtml = /<!DOCTYPE|<html/i.test(rawBody);
      if (isHtml && response.status === 404) {
        data = { error: 'Ruta no encontrada en el backend. Reinicie el servidor: python manage.py runserver' };
      } else if (isHtml) {
        data = { error: `Error ${response.status} del servidor.` };
      } else {
        data = { error: rawBody.slice(0, 200) };
      }
    }
  }

  if (response.status === 401 || response.status === 403) {
    if (!options.skipAuthRedirect) {
      handleAuthFailure(response.status, path);
    }
    const authError = buildAppErrorFromResponse(data, response.status, path);
    throw handleAppError(authError, { path, modulo });
  }

  if (!response.ok) {
    const apiError = buildAppErrorFromResponse(data, response.status, path);
    throw handleAppError(apiError, { path, modulo });
  }

  return data;
}

export { AppError };
export default apiRequest;
