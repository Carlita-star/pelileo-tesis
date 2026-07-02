/**
 * Sistema centralizado de manejo de errores (frontend).
 */

import { getStoredUser } from './authStorage';

const API_BASE = process.env.REACT_APP_API_URL ?? 'http://localhost:8000';
const IS_DEV = process.env.NODE_ENV === 'development';

export const ERROR_TYPES = {
  VALIDACION: 'validacion',
  BASE_DATOS: 'base_datos',
  AUTENTICACION: 'autenticacion',
  PERMISO: 'permiso',
  RED: 'red',
  ARCHIVO: 'archivo',
  SERVIDOR: 'servidor',
  CLIENTE: 'cliente',
  DESCONOCIDO: 'desconocido',
};

const HTTP_MESSAGES = {
  400: 'La solicitud contiene datos incorrectos o incompletos.',
  401: 'Tu sesión expiró o no has iniciado sesión. Vuelve a entrar.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'No se encontró el recurso solicitado. Verifique la URL o reinicie el backend.',
  408: 'La solicitud tardó demasiado (timeout). Intente de nuevo.',
  500: 'Error interno del servidor. El equipo técnico fue notificado.',
  502: 'El servidor no está disponible temporalmente.',
  503: 'Servicio no disponible. La base de datos o el backend pueden estar apagados.',
};

export class AppError extends Error {
  constructor(userMessage, options = {}) {
    super(userMessage);
    this.name = 'AppError';
    this.userMessage = userMessage;
    this.technicalMessage = options.technicalMessage || '';
    this.status = options.status ?? null;
    this.tipo = options.tipo || ERROR_TYPES.DESCONOCIDO;
    this.modulo = options.modulo || 'general';
    this.fieldErrors = options.fieldErrors || null;
    this.stackTrace = options.stackTrace || '';
    this.detalleTecnico = options.detalleTecnico || '';
  }
}

export function isAdminUser() {
  const user = getStoredUser();
  const roles = user?.roles || [];
  return roles.includes('administrador') || roles.includes('gestor_turistico');
}

export function mapHttpStatusToMessage(status, serverMessage) {
  if (serverMessage && serverMessage.length > 3) return serverMessage;
  return HTTP_MESSAGES[status] || `Ocurrió un error inesperado (código ${status}).`;
}

export function mapFetchError(error, context = {}) {
  if (error instanceof AppError) return error;

  const message = error?.message || '';
  if (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('conectar')) {
    return new AppError(
      'No se pudo conectar con el servidor. Verifique que el backend esté en ejecución (python manage.py runserver).',
      {
        tipo: ERROR_TYPES.RED,
        technicalMessage: message,
        modulo: context.modulo,
        status: 0,
      },
    );
  }

  return new AppError(message || 'Ocurrió un error inesperado.', {
    tipo: ERROR_TYPES.CLIENTE,
    technicalMessage: message,
    modulo: context.modulo,
  });
}

export function logErrorToConsole(error, context = {}) {
  if (!IS_DEV) return;
  const appErr = error instanceof AppError ? error : mapFetchError(error, context);
  console.group(`[Pelileo Error] ${appErr.modulo || context.modulo || 'app'}`);
  console.error('Usuario:', appErr.userMessage);
  if (appErr.technicalMessage) console.error('Técnico:', appErr.technicalMessage);
  if (appErr.detalleTecnico) console.error('Detalle API:', appErr.detalleTecnico);
  if (appErr.fieldErrors) console.error('Campos:', appErr.fieldErrors);
  if (appErr.status) console.error('HTTP:', appErr.status);
  if (context.path) console.error('Ruta:', context.path);
  console.groupEnd();
}

let reportQueue = [];
let reporting = false;

export async function reportErrorToBackend(error, context = {}) {
  const appErr = error instanceof AppError ? error : mapFetchError(error, context);
  if (appErr.status === 401 || appErr.tipo === ERROR_TYPES.VALIDACION) return;

  const token = localStorage.getItem('token');
  if (!token) return;

  const payload = {
    mensaje_usuario: appErr.userMessage,
    mensaje_tecnico: appErr.technicalMessage || appErr.detalleTecnico,
    stack_trace: appErr.stackTrace || (appErr.stack || ''),
    tipo: appErr.tipo,
    modulo: appErr.modulo || context.modulo || 'frontend',
    http_status: appErr.status,
    ruta: context.path || window.location.pathname,
    metadata: {
      fieldErrors: appErr.fieldErrors,
      userAgent: navigator.userAgent,
    },
  };

  reportQueue.push(payload);
  if (reporting) return;
  reporting = true;

  try {
    while (reportQueue.length > 0) {
      const item = reportQueue.shift();
      await fetch(`${API_BASE}/api/admin/errores/reportar/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      });
    }
  } catch {
    // Evitar bucle infinito si el reporte falla
  } finally {
    reporting = false;
  }
}

export function handleAppError(error, context = {}) {
  const appErr = error instanceof AppError ? error : mapFetchError(error, context);
  logErrorToConsole(appErr, context);
  reportErrorToBackend(appErr, context);
  return appErr;
}

export function getDisplayError(error, { showTechnical = false } = {}) {
  const appErr = error instanceof AppError ? error : mapFetchError(error);
  if (showTechnical && isAdminUser()) {
    return {
      user: appErr.userMessage,
      technical: appErr.detalleTecnico || appErr.technicalMessage,
      fieldErrors: appErr.fieldErrors,
    };
  }
  return {
    user: appErr.userMessage,
    technical: null,
    fieldErrors: appErr.fieldErrors,
  };
}
