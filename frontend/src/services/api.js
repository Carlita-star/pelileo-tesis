// Capa base para hablar con la API REST del backend (Django).
// TODA llamada al backend pasa por aquí.

const API_BASE = process.env.REACT_APP_API_URL ?? 'http://localhost:8000';

async function request(path, options = {}) {
  const url = `${API_BASE}/api${path}`;

  let respuesta;
  try {
    respuesta = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
  } catch (e) {
    throw new Error('No se pudo conectar con el servidor. ¿Está corriendo el backend?');
  }

  if (!respuesta.ok) {
    throw new Error(`Error ${respuesta.status} al consultar ${path}`);
  }

  if (respuesta.status === 204) return null;
  return respuesta.json();
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
};

export { API_BASE };