import { apiRequest } from './apiClient';

export async function listarErrores({ estado, tipo, modulo, limite } = {}) {
  const params = new URLSearchParams();
  if (estado) params.set('estado', estado);
  if (tipo) params.set('tipo', tipo);
  if (modulo) params.set('modulo', modulo);
  if (limite) params.set('limite', String(limite));
  const qs = params.toString();
  return apiRequest(`/api/admin/errores${qs ? `?${qs}` : ''}`);
}

export async function cambiarEstadoError(errorId, estado) {
  return apiRequest(`/api/admin/errores/${errorId}/estado/`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  });
}
