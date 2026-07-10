import { apiRequest } from './apiClient';

export async function listarResenasAdmin({ entidadTipo, calificacion, q, limite } = {}) {
  const params = new URLSearchParams();
  if (entidadTipo) params.set('entidad_tipo', entidadTipo);
  if (calificacion) params.set('calificacion', String(calificacion));
  if (q) params.set('q', q);
  if (limite) params.set('limite', String(limite));
  const qs = params.toString();
  return apiRequest(`/api/admin/resenas${qs ? `?${qs}` : ''}`);
}

export async function cambiarActivoResena(resenaId, activo) {
  return apiRequest(`/api/admin/resenas/${resenaId}/activo/`, {
    method: 'PATCH',
    body: JSON.stringify({ activo }),
  });
}

export async function resumenResenasAdmin() {
  const data = await listarResenasAdmin({ limite: 1 });
  return data.resumen || {};
}
