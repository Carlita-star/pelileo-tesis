import { api } from './api';
import { CONFIG_DEFAULT } from '../config/configuracionDefault';

// Trae la configuración del portal desde el backend.
// Si la API aún no tiene datos (o falla), devuelve los valores por defecto,
// para que el portal NUNCA quede sin estilos ni se rompa.
export async function obtenerConfiguracion() {
  try {
    const data = await api.get('/configuracion/');

    // Si el backend responde con un error lógico (sin config), usamos defaults.
    if (!data || data.error) return CONFIG_DEFAULT;

    // ---------------------------------------------------------------------
    //  AJUSTA AQUÍ los nombres de los campos según lo que devuelva TU API.
    //  A la izquierda va lo que usa el portal; a la derecha (data.xxx) lo que
    //  manda el backend. Hoy la config está vacía, así que no sabemos los
    //  nombres reales todavía: por eso cada campo cae a su valor por defecto.
    //  Cuando tengas datos reales, solo cambias los 'data.xxx' de esta función.
    // ---------------------------------------------------------------------
    return {
      nombreSistema: data.nombre_sistema ?? CONFIG_DEFAULT.nombreSistema,
      eslogan: data.eslogan ?? CONFIG_DEFAULT.eslogan,
      logoUrl: data.logo_url ?? CONFIG_DEFAULT.logoUrl,
      colores: {
        primario: data.color_primario ?? CONFIG_DEFAULT.colores.primario,
        primarioOscuro: data.color_primario_oscuro ?? CONFIG_DEFAULT.colores.primarioOscuro,
        secundario: data.color_secundario ?? CONFIG_DEFAULT.colores.secundario,
      },
      menu: data.menu ?? CONFIG_DEFAULT.menu,
      footer: data.footer ?? CONFIG_DEFAULT.footer,
      redes: data.redes ?? CONFIG_DEFAULT.redes,
    };
  } catch (e) {
    // Sin conexión o cualquier error: no rompemos el portal, usamos defaults.
    return CONFIG_DEFAULT;
  }
}