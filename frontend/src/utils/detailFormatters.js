export const NA = 'Información no disponible';

export function displayValue(value) {
  if (value === null || value === undefined || value === '') return NA;
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  return String(value);
}

export function formatDateTime(iso) {
  if (!iso) return NA;
  try {
    return new Date(iso).toLocaleString('es-EC', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return NA;
  }
}

export function formatCoordinates(lat, lng) {
  if (lat == null || lng == null || lat === '' || lng === '') return NA;
  return `${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;
}

export function formatList(items, key = 'nombre') {
  if (!items || items.length === 0) return NA;
  return items.map((item) => (typeof item === 'string' ? item : item[key])).filter(Boolean).join(', ');
}
