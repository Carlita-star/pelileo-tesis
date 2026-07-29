import { API_BASE } from './api';

// Normaliza rutas relativas, URLs sin esquema (api.dominio.com/media/...)
// y URLs completas para que el navegador pueda cargarlas.
export function normalizeMediaUrl(value) {
  if (!value || typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }

  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/|$)/i.test(trimmed)) {
    return `https://${trimmed.replace(/^\/+/, '')}`;
  }

  const base = API_BASE.replace(/\/$/, '');
  const ruta = trimmed.startsWith('/') ? trimmed : `/media/${trimmed}`;
  return `${base}${ruta}`;
}

export function urlImagen(archivo) {
  return normalizeMediaUrl(archivo);
}
