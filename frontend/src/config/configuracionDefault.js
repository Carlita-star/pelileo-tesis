// Valores POR DEFECTO del portal. Se usan SOLO cuando la API de configuración
// aún no tiene datos (como ahora, que /api/configuracion/ está vacía).
// Cuando el administrador define la configuración en el panel, esos valores
// reemplazan a estos automáticamente, sin tocar el código.

export const CONFIG_DEFAULT = {
  nombreSistema: 'Pelileo',
  eslogan: 'Turismo · GAD Municipal',
  logoUrl: null, // si es null, se muestra la inicial del nombre
  logoSecundarioUrl: null,
  faviconUrl: null,

  colores: {
    primario: '#1D9E75',
    primarioOscuro: '#157A5A',
    secundario: '#F9A825',
  },

  menu: [
    { etiqueta: 'Inicio', ruta: '/' },
    { etiqueta: 'Atractivos', ruta: '/atractivos' },
    { etiqueta: 'Rutas', ruta: '/rutas' },
    { etiqueta: 'Emprendimientos', ruta: '/emprendimientos' },
    { etiqueta: 'Eventos', ruta: '/eventos' },
    { etiqueta: 'Mapa', ruta: '/mapa' },
  ],

  footer: {
    titulo: 'GAD Municipal de Pelileo',
    descripcion: 'Promoción turística del cantón San Pedro de Pelileo, Tungurahua – Ecuador.',
    contacto: { ciudad: 'Pelileo, Tungurahua', web: 'pelileo.gob.ec' },
  },

  redes: [], // ej: [{ nombre: 'Facebook', url: 'https://...' }]
};