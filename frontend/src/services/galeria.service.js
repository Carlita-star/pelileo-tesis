import { api } from './api';

/** Imágenes públicas de la galería (tabla multimedia de entidades publicadas). */
export async function listarGaleriaPublica() {
  const datos = await api.get('/galeria/');
  const items = Array.isArray(datos) ? datos : (datos?.results ?? []);
  return items.map((item) => item.url).filter(Boolean);
}
