import { CONFIG_DEFAULT } from '../config/configuracionDefault';
import { getApiBase } from './apiClient';
import { api } from './api';

function mediaUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`;
}

const FAVICON_LINK_ID = 'site-favicon';

function faviconMimeType(url) {
  const ext = (url.split('?')[0].split('.').pop() || '').toLowerCase();
  if (ext === 'png') return 'image/png';
  if (ext === 'svg') return 'image/svg+xml';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  return 'image/x-icon';
}

/** Actualiza el icono de la pestaña del navegador con el favicon institucional. */
export function applySiteFavicon(url, { cacheBust = false } = {}) {
  if (!url) return;

  let link = document.getElementById(FAVICON_LINK_ID);
  if (!link) {
    link = document.querySelector('link[rel="icon"]') || document.createElement('link');
    link.id = FAVICON_LINK_ID;
    link.rel = 'icon';
    if (!link.parentNode) {
      document.head.appendChild(link);
    }
  }

  const href = cacheBust
    ? `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`
    : url;

  link.href = href;
  link.type = faviconMimeType(url);
}

// Mapea la respuesta anidada del backend al formato que usa el portal público.
export function mapConfiguracionApi(data) {
  if (!data || data.error) return CONFIG_DEFAULT;

  const empresa = data.empresa || {};
  const apariencia = data.apariencia || {};
  const footerCfg = data.footer || {};

  const primario = apariencia.color_primario || data.color_primario || CONFIG_DEFAULT.colores.primario;
  const secundario = apariencia.color_secundario || data.color_secundario || CONFIG_DEFAULT.colores.secundario;

  return {
    nombreSistema: data.nombreSistema || empresa.nombre_comercial || empresa.nombre || CONFIG_DEFAULT.nombreSistema,
    nombre: empresa.nombre || CONFIG_DEFAULT.nombreSistema,
    eslogan: data.eslogan || empresa.eslogan || CONFIG_DEFAULT.eslogan,
    descripcion: empresa.descripcion || CONFIG_DEFAULT.footer?.descripcion,
    logoUrl: mediaUrl(data.logoUrl || empresa.logo_principal_url) || CONFIG_DEFAULT.logoUrl,
    logoSecundarioUrl: mediaUrl(data.logoSecundarioUrl || empresa.logo_secundario_url),
    faviconUrl: mediaUrl(data.faviconUrl || empresa.favicon_url),
    colores: {
      primario,
      primarioOscuro: secundario || CONFIG_DEFAULT.colores.primarioOscuro,
      secundario: apariencia.color_terciario || data.color_terciario || CONFIG_DEFAULT.colores.secundario,
      terciario: apariencia.color_terciario || data.color_terciario,
    },
    fuente: apariencia.fuente_principal || data.fuente_principal,
    tamanoFuente: apariencia.tamano_fuente_base || data.tamano_fuente_base || 16,
    modoOscuro: apariencia.modo_oscuro ?? data.modo_oscuro ?? false,
    bordeRadio: apariencia.borde_radio ?? data.borde_radio ?? 10,
    menu: data.menu?.length ? data.menu : CONFIG_DEFAULT.menu,
    footer: {
      titulo: empresa.nombre || CONFIG_DEFAULT.footer.titulo,
      descripcion: footerCfg.descripcion || empresa.descripcion || CONFIG_DEFAULT.footer.descripcion,
      contacto: {
        ciudad: `${empresa.canton || 'Pelileo'}, ${empresa.provincia || 'Tungurahua'}`,
        web: empresa.sitio_web || CONFIG_DEFAULT.footer.contacto.web,
        email: empresa.email,
        telefono: empresa.telefono,
      },
      copyright: footerCfg.copyright_texto,
      mostrarRedes: footerCfg.mostrar_redes !== false,
      mostrarContacto: footerCfg.mostrar_contacto !== false,
      mostrarMapa: footerCfg.mostrar_mapa !== false,
    },
    header: data.header || {},
    redes: data.redes?.length ? data.redes : CONFIG_DEFAULT.redes,
    latitud: empresa.latitud ?? data.latitud,
    longitud: empresa.longitud ?? data.longitud,
    empresa,
    apariencia,
  };
}

export async function obtenerConfiguracion() {
  try {
    const data = await api.get('/configuracion/');
    return mapConfiguracionApi(data);
  } catch {
    return CONFIG_DEFAULT;
  }
}
