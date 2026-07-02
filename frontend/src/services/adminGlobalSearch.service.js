import { apiRequest } from './apiClient';
import { isAdministrador } from './authStorage';
import { ADMIN_PATHS } from '../routes/adminPaths';

const MODULES = [
  {
    key: 'atractivos',
    label: 'Atractivos',
    listPath: ADMIN_PATHS.atractivos,
    editPath: ADMIN_PATHS.atractivoEditar,
    endpoint: '/api/admin/atractivos/',
    labelKey: 'nombre',
    subtitleKey: 'estado_publicacion',
  },
  {
    key: 'rutas',
    label: 'Rutas',
    listPath: ADMIN_PATHS.rutas,
    editPath: ADMIN_PATHS.rutaEditar,
    endpoint: '/api/admin/rutas/',
    labelKey: 'nombre',
    subtitleKey: 'estado_publicacion',
  },
  {
    key: 'emprendimientos',
    label: 'Emprendimientos',
    listPath: ADMIN_PATHS.emprendimientos,
    editPath: ADMIN_PATHS.emprendimientoEditar,
    endpoint: '/api/admin/emprendimientos/',
    labelKey: 'nombre',
    subtitleKey: 'estado_publicacion',
  },
  {
    key: 'eventos',
    label: 'Eventos',
    listPath: ADMIN_PATHS.eventos,
    editPath: ADMIN_PATHS.eventoEditar,
    endpoint: '/api/admin/eventos/',
    labelKey: 'nombre',
    subtitleKey: 'estado_publicacion',
  },
  {
    key: 'usuarios',
    label: 'Usuarios',
    listPath: ADMIN_PATHS.usuarios,
    editPath: ADMIN_PATHS.usuarioEditar,
    endpoint: '/api/admin/usuarios/',
    labelKey: 'nombre_completo',
    subtitleKey: 'username',
    adminOnly: true,
  },
];

function mapItem(item, mod) {
  return {
    id: item.id,
    label: item[mod.labelKey] || item.nombre || `#${item.id}`,
    subtitle: item[mod.subtitleKey] || '',
  };
}

export async function searchAllAdminModules(query, { limit = 5 } = {}) {
  const term = query.trim();
  if (term.length < 2) return [];

  const modules = MODULES.filter((mod) => !mod.adminOnly || isAdministrador());

  const responses = await Promise.allSettled(
    modules.map(async (mod) => {
      const params = new URLSearchParams({
        search: term,
        page_size: String(limit),
        page: '1',
      });
      const data = await apiRequest(`${mod.endpoint}?${params.toString()}`);
      const items = (data.results || []).map((item) => mapItem(item, mod));
      return {
        key: mod.key,
        label: mod.label,
        listPath: mod.listPath,
        editPath: mod.editPath,
        items,
        total: data.total ?? items.length,
      };
    }),
  );

  return responses
    .filter((result) => result.status === 'fulfilled' && result.value.items.length > 0)
    .map((result) => result.value);
}

export { MODULES as ADMIN_SEARCH_MODULES };
