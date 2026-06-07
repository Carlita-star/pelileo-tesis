import { api } from './api';

// P-04 Catálogo de rutas.
export async function listarRutas() {
  const datos = await api.get('/rutas/');
  return Array.isArray(datos) ? datos : (datos?.results ?? []);
}

// P-05 Detalle de ruta (por id; ej: /rutas/3).
export async function obtenerRutaPorId(id) {
  return api.get(`/rutas/${id}/`);
}