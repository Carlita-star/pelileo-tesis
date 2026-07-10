import apiRequest from './apiClient';

export async function listarResenas(entidadTipo, entidadId) {
  const params = new URLSearchParams({
    entidad_tipo: entidadTipo,
    entidad_id: String(entidadId),
  });
  return apiRequest(`/api/resenas/?${params.toString()}`, { skipAuthRedirect: true });
}

export async function crearResena(payload) {
  return apiRequest('/api/resenas/crear/', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuthRedirect: true,
  });
}

export async function actualizarResena(resenaId, payload) {
  return apiRequest(`/api/resenas/${resenaId}/`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    skipAuthRedirect: true,
  });
}
