import { API_BASE } from './api';

// Convierte el campo "archivo" de multimedia en una URL que el navegador
// pueda mostrar. Si ya es URL completa, la deja igual; si es ruta relativa,
// la sirve desde el backend (carpeta media de Django).
export function urlImagen(archivo) {
  if (!archivo || typeof archivo !== 'string') return null;
  if (archivo.startsWith('http')) return archivo;
  const base = API_BASE.replace(/\/$/, '');
  const ruta = archivo.startsWith('/') ? archivo : `/media/${archivo}`;
  return `${base}${ruta}`;
}