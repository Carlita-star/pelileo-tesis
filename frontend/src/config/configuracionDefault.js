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
    { etiqueta: 'Galería', ruta: '/galeria' },
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

  sobrePelileoIntro: '',
  sobrePelileoDatos: [
    {
      etiqueta: 'Cantonización',
      valor: '22 de julio de 1860',
      detalle: 'Fundado en 1570 · reconstruido tras 1949',
    },
    {
      etiqueta: 'Sabores',
      valor: 'Cuy, fritada, hornado y empanadas',
      detalle: 'Tamales, caldo de gallina y chawarmishki',
    },
    {
      etiqueta: 'Vive el cantón',
      valor: 'Textiles, campo y naturaleza',
      detalle: 'Jeans, tejidos, agricultura y geositios UNESCO',
    },
  ],
  autoridades: [],
  autoridadesIntro:
    'Conoce a las autoridades del GAD Municipal de Pelileo que impulsan el desarrollo y el turismo del cantón.',
  guias: [],
  guiasIntro:
    'Guías de turismo locales listos para acompañarte en recorridos culturales, de naturaleza y de aventura por el cantón San Pedro de Pelileo.',
};
