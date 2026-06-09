import { api } from './api';

// P-02 Catálogo: trae los atractivos publicados.
export async function listarAtractivos() {
  const datos = await api.get('/atractivos/');
  // El backend puede devolver un array directo, o { results: [...] } si usa
  // la paginación de Django REST Framework. Cubrimos ambos casos.
  return Array.isArray(datos) ? datos : (datos?.results ?? []);
}

// P-03 Ficha: trae un atractivo por su slug.
export async function obtenerAtractivoPorSlug(slug) {
  return api.get(`/atractivos/${slug}/`);
}