/**
 * Grupos del directorio turístico pedidos por el GAD
 * (hospedaje, alimentación, recreación/balnearios, artesanías, guianza).
 * Se emparejan por palabras clave contra el nombre de categoría del API.
 */
export const DIRECTORIO_GRUPOS = [
  {
    id: 'todos',
    etiqueta: 'Todos',
    keywords: [],
  },
  {
    id: 'hospedaje',
    etiqueta: 'Hospedaje',
    keywords: ['hospedaje', 'hotel', 'hostal', 'posada', 'alojamiento', 'hostería', 'hosteria'],
  },
  {
    id: 'alimentacion',
    etiqueta: 'Alimentación',
    keywords: [
      'aliment', 'restaurante', 'comida', 'gastronom', 'paradero', 'café', 'cafe',
      'hornado', 'ceviche', 'buffet', 'pollo',
    ],
  },
  {
    id: 'recreacion',
    etiqueta: 'Complejos y balnearios',
    keywords: [
      'complejo', 'balneario', 'piscina', 'recreacion', 'recreación', 'termales',
      'piscícola', 'piscicola', 'granja',
    ],
  },
  {
    id: 'artesania',
    etiqueta: 'Artesanías',
    keywords: ['artesanía', 'artesania', 'artesanal', 'mueble', 'tejido', 'taller', 'moda'],
  },
  {
    id: 'guia',
    etiqueta: 'Guianza',
    keywords: ['guía', 'guia', 'guianza', 'tour', 'guía de turismo', 'guia de turismo'],
  },
];

export function coincideGrupoDirectorio(emprendimiento, grupoId) {
  if (!grupoId || grupoId === 'todos') return true;
  const grupo = DIRECTORIO_GRUPOS.find((g) => g.id === grupoId);
  if (!grupo || !grupo.keywords.length) return true;

  const texto = [
    emprendimiento.categoria,
    emprendimiento.nombre,
    emprendimiento.descripcion,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return grupo.keywords.some((kw) => texto.includes(kw.toLowerCase()));
}
