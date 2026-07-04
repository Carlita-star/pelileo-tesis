export const CONFIG_DEFAULT = {
  nombreSistema: 'Pelileo',
  eslogan: 'Turismo · GAD Municipal',
  logoUrl: null,
  logoSecundarioUrl: null,
  faviconUrl: null,
  descripcion: 'Promoción turística del cantón San Pedro de Pelileo.',

  colores: {
    primario: '#1D9E75',
    primarioOscuro: '#157A5A',
    secundario: '#F9A825',
    terciario: '#157A5A',
  },

  tipografia: {
    fuentePrincipal: 'Inter, sans-serif',
    fuenteSecundaria: 'Inter, sans-serif',
    tamanoBase: 16,
    bordeRadio: 12,
    modoOscuro: false,
    sombraGlobal: true,
  },

  header: {
    mostrarLogo: true,
    mostrarMenu: true,
    mostrarBuscador: false,
    mostrarRedes: false,
    textoSuperior: '',
    colorFondo: '#ffffff',
    colorTexto: '#1e293b',
    altura: 72,
    sticky: true,
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
    copyright: 'GAD Municipal de Pelileo',
    mostrarRedes: true,
    mostrarContacto: true,
    mostrarMapa: false,
    colorFondo: '#1e293b',
    colorTexto: '#cbd5e1',
    contacto: {
      ciudad: 'Pelileo, Tungurahua',
      web: 'pelileo.gob.ec',
      email: '',
      telefono: '',
      direccion: '',
    },
  },

  redes: [],
};
