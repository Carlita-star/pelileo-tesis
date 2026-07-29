import { api } from './api';

/**
 * Catálogos activos desde la BD (mismas tablas que usa el administrador
 * al llenar categoría, parroquia, etc.).
 */
export async function obtenerCatalogosPublicos() {
  try {
    const data = await api.get('/catalogos/publicos/');
    return {
      categorias: data?.categorias || [],
      parroquias: data?.parroquias || [],
      dificultades: data?.dificultades || [
        { valor: 'facil', etiqueta: 'Fácil' },
        { valor: 'moderado', etiqueta: 'Moderado' },
        { valor: 'dificil', etiqueta: 'Difícil' },
      ],
      estadosEvento: data?.estados_evento || [
        { valor: 'Próximo', etiqueta: 'Próximos' },
        { valor: 'En curso', etiqueta: 'En curso' },
        { valor: 'Finalizado', etiqueta: 'Finalizados' },
      ],
    };
  } catch {
    return {
      categorias: [],
      parroquias: [],
      dificultades: [
        { valor: 'facil', etiqueta: 'Fácil' },
        { valor: 'moderado', etiqueta: 'Moderado' },
        { valor: 'dificil', etiqueta: 'Difícil' },
      ],
      estadosEvento: [
        { valor: 'Próximo', etiqueta: 'Próximos' },
        { valor: 'En curso', etiqueta: 'En curso' },
        { valor: 'Finalizado', etiqueta: 'Finalizados' },
      ],
    };
  }
}

/** Normaliza dificultad de ruta (BD puede guardar facil / FACIL / Fácil). */
export function coincideDificultad(valorRuta, valorFiltro) {
  if (!valorFiltro) return true;
  if (!valorRuta) return false;
  const aliases = {
    facil: ['facil', 'fácil', 'facíl'],
    moderado: ['moderado', 'media', 'medio'],
    dificil: ['dificil', 'difícil'],
  };
  const lista = aliases[valorFiltro] || [valorFiltro];
  const actual = String(valorRuta).trim().toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return lista.some((a) => {
    const n = a.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return actual === n;
  });
}
