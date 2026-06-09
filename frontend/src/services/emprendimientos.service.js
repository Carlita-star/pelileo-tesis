import { api } from './api';

// P-06 Catálogo de emprendimientos.
export async function listarEmprendimientos() {
  const datos = await api.get('/emprendimientos/');
  return Array.isArray(datos) ? datos : (datos?.results ?? []);
}

// P-07 Detalle de emprendimiento (por id; ej: /emprendimientos/5).
export async function obtenerEmprendimientoPorId(id) {
  return api.get(`/emprendimientos/${id}/`);
}