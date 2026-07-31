import { api } from './api';
import { apiRequest, getApiBase, getAuthHeaders } from './apiClient';

/** Lista pública de galería (más recientes primero; cantón + catálogo). */
export async function listarGaleriaPublicaDetalle(opciones = {}) {
  const params = new URLSearchParams();
  if (opciones.limite) params.set('limite', String(opciones.limite));
  const qs = params.toString();
  const datos = await api.get(`/galeria/${qs ? `?${qs}` : ''}`);
  const items = Array.isArray(datos) ? datos : (datos?.results ?? []);
  return items
    .map((item) => ({
      id: item.id,
      url: item.url,
      titulo: item.titulo || '',
      origen: item.origen || item.entidad_tipo || 'catalogo',
      creadoEn: item.creado_en || '',
    }))
    .filter((item) => item.url);
}

/** Solo URLs (inicio: las más recientes). */
export async function listarGaleriaPublica(opciones = {}) {
  const items = await listarGaleriaPublicaDetalle(opciones);
  return items.map((item) => item.url);
}

export async function listarGaleriaAdmin(empresaId) {
  const datos = await apiRequest(`/api/admin/multimedia/?entidad_tipo=galeria&entidad_id=${empresaId}`);
  return Array.isArray(datos) ? datos : (datos?.results ?? []);
}

export async function subirFotoGaleria(empresaId, file) {
  const body = new FormData();
  body.append('entidad_tipo', 'galeria');
  body.append('entidad_id', String(empresaId));
  body.append('archivo', file);
  const response = await fetch(`${getApiBase()}/api/admin/multimedia/upload/`, {
    method: 'POST',
    headers: getAuthHeaders(false),
    body,
  });
  const raw = await response.text();
  let data = {};
  try { data = raw ? JSON.parse(raw) : {}; } catch { /* ignore */ }
  if (!response.ok) throw new Error(data.error || data.detail || `Error ${response.status}`);
  return data;
}

export async function eliminarFotoGaleria(multimediaId) {
  const response = await fetch(`${getApiBase()}/api/admin/multimedia/${multimediaId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(false),
  });
  if (!response.ok) {
    const raw = await response.text();
    let data = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch { /* ignore */ }
    throw new Error(data.error || `Error ${response.status}`);
  }
}
