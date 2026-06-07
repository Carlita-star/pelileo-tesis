import { api } from './api';

// P-08 Eventos turísticos.
export async function listarEventos() {
  const datos = await api.get('/eventos/');
  return Array.isArray(datos) ? datos : (datos?.results ?? []);
}