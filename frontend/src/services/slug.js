// Convierte "Ruta de las Cascadas y Cultura" -> "ruta-de-las-cascadas-y-cultura"
export function slugify(texto) {
  return (texto || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}