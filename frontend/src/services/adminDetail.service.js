import { apiRequest, getApiBase, getAuthHeaders } from './apiClient';
import { AppError } from './errorService';

const DETAIL_ENDPOINTS = {
  atractivo: (id) => `/api/admin/atractivos/${id}/form-data/`,
  ruta: (id) => `/api/admin/rutas/${id}/form-data/`,
  emprendimiento: (id) => `/api/admin/emprendimientos/${id}/form-data/`,
  evento: (id) => `/api/admin/eventos/${id}/detalle/`,
};

const MEDIA_ENTITY_TYPES = {
  atractivo: 'atractivo',
  ruta: 'ruta',
  emprendimiento: 'emprendimiento',
  evento: 'evento',
};

const FICHA_ENDPOINTS = {
  atractivo: (id, formato = 'pdf') => `/api/admin/atractivos/${id}/ficha/descargar/?formato=${formato}`,
  ruta: (id, formato = 'pdf') => `/api/admin/rutas/${id}/ficha/descargar/?formato=${formato}`,
  emprendimiento: (id, formato = 'pdf') => `/api/admin/emprendimientos/${id}/ficha/descargar/?formato=${formato}`,
};

export const FICHA_SUPPORTED_TYPES = new Set(['atractivo', 'ruta', 'emprendimiento']);

export const ENTITY_LABELS = {
  atractivo: 'Atractivo turístico',
  ruta: 'Ruta turística',
  emprendimiento: 'Emprendimiento',
  evento: 'Evento',
};

export async function downloadRecordFicha(type, id, formato = 'pdf') {
  if (!FICHA_SUPPORTED_TYPES.has(type)) {
    throw new AppError('Este tipo de registro no admite descarga de ficha.');
  }
  const path = FICHA_ENDPOINTS[type](id, formato);
  const response = await fetch(`${getApiBase()}${path}`, {
    headers: getAuthHeaders(false),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new AppError(data.error || `No se pudo generar la ficha (${response.status}).`);
  }
  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^";]+)"?/i);
  const filename = match ? match[1] : `Ficha_${type}_${id}.${formato === 'word' ? 'docx' : 'pdf'}`;
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function fetchAdminRecordDetail(type, id) {
  const builder = DETAIL_ENDPOINTS[type];
  if (!builder) {
    throw new AppError('Tipo de registro no soportado para vista detallada.');
  }
  return apiRequest(builder(id));
}

export async function fetchRecordImages(type, id) {
  const entidadTipo = MEDIA_ENTITY_TYPES[type];
  if (!entidadTipo) return [];
  const data = await apiRequest(
    `/api/admin/multimedia/?entidad_tipo=${entidadTipo}&entidad_id=${id}`,
  );
  return data.results || [];
}
