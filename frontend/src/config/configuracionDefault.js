export const CONFIG_DEFAULT = {
  nombreSistema: 'Pelileo',
  eslogan: 'Tradición, cultura, aventura y naturaleza',
  logoUrl: null,
  logoSecundarioUrl: null,
  faviconUrl: null,
  descripcion: 'Promoción turística del cantón San Pedro de Pelileo.',

  colores: {
    primario: '#1D9E75',
    primarioOscuro: '#157A5A',
    secundario: '#F9A825',
    terciario: '#2563EB',
  },

  tipografia: {
    fuentePrincipal: 'Manrope, sans-serif',
    fuenteSecundaria: 'Outfit, sans-serif',
    tamanoBase: 16,
    bordeRadio: 12,
    sombraGlobal: true,
  },

  header: {
    mostrarLogo: true,
    mostrarMenu: true,
    mostrarBuscador: false,
    mostrarRedes: false,
    textoSuperior: '',
    colorFondo: '#0f172a',
    colorTexto: '#ffffff',
    altura: 72,
    sticky: true,
  },

  menu: [
    { etiqueta: 'Inicio', ruta: '/' },
    { etiqueta: 'Atractivos', ruta: '/atractivos' },
    { etiqueta: 'Rutas', ruta: '/rutas' },
    { etiqueta: 'Emprendimientos', ruta: '/emprendimientos' },
    { etiqueta: 'Eventos', ruta: '/eventos' },
  ],

  footer: {
    titulo: 'GAD Municipal de Pelileo',
    descripcion: 'Promoción turística del cantón San Pedro de Pelileo, Tungurahua – Ecuador.',
    copyright: 'GAD Municipal de Pelileo',
    mostrarRedes: true,
    mostrarContacto: true,
    mostrarMapa: true,
    colorFondo: '#0f172a',
    colorTexto: '#e2e8f0',
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
