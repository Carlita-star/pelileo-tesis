import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ACCESOS = [
  {
    to: '/atractivos',
    titulo: 'Atractivos',
    subtitulo: 'Cascada, Volcán',
    // Verde pastel (mockup)
    iconoBg: 'bg-emerald-100',
    iconoColor: 'text-emerald-700',
    iconoHover: 'group-hover:bg-emerald-600 group-hover:text-white',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-9 w-9" aria-hidden>
        <path d="M3 19h18L14.5 6.5 11 12l-2.5-3.5L3 19z" strokeLinejoin="round" />
        <path d="M14 8.5c1.2-2.2 3.2-3.5 5.5-3.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/rutas',
    titulo: 'Rutas',
    subtitulo: 'Senderismo, Ciclismo',
    // Azul pastel (mockup)
    iconoBg: 'bg-sky-100',
    iconoColor: 'text-sky-700',
    iconoHover: 'group-hover:bg-sky-600 group-hover:text-white',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-9 w-9" aria-hidden>
        <circle cx="12" cy="5" r="2.25" />
        <path d="M12 7.5v3.5M9.5 22l2.5-8 2.5 8M8 13h8M10 11l-2.5 3M14 11l2.5 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/emprendimientos',
    titulo: 'Emprendimientos',
    subtitulo: 'Artesanías, Café',
    // Naranja / melocotón (mockup)
    iconoBg: 'bg-orange-100',
    iconoColor: 'text-orange-700',
    iconoHover: 'group-hover:bg-orange-500 group-hover:text-white',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-9 w-9" aria-hidden>
        <path d="M8 9h9a1 1 0 011 1v1.5a5.5 5.5 0 01-5.5 5.5H12A5 5 0 017 12V10a1 1 0 011-1z" strokeLinejoin="round" />
        <path d="M9 9V7.5A2.5 2.5 0 0111.5 5" strokeLinecap="round" />
        <path d="M8 19h8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/mapa',
    titulo: 'Mapa',
    subtitulo: 'Guía Interactiva',
    // Turquesa / cian (mockup)
    iconoBg: 'bg-teal-100',
    iconoColor: 'text-teal-700',
    iconoHover: 'group-hover:bg-teal-600 group-hover:text-white',
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-9 w-9" aria-hidden>
        <path d="M9 4.5l-5 2v13l5-2 6 2 5-2v-13l-5 2-6-2z" strokeLinejoin="round" />
        <path d="M9 4.5v13M15 6.5v13" strokeLinecap="round" />
        <circle cx="15" cy="11" r="2.25" />
        <path d="M15 13.25V16" strokeLinecap="round" />
      </svg>
    ),
  },
];

/**
 * Hero de inicio al estilo mockup: foto a pantalla completa, buscador,
 * título centrado y accesos rápidos que se solapan con el contenido.
 */
function HeroInicio({ imagenes = [], titulo, eslogan }) {
  const navigate = useNavigate();
  const [i, setI] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const n = imagenes.length;

  useEffect(() => {
    if (n <= 1) return undefined;
    const t = setInterval(() => setI((p) => (p + 1) % n), 5500);
    return () => clearInterval(t);
  }, [n]);

  const ir = (idx) => setI(((idx % n) + n) % n);

  const buscar = (e) => {
    e.preventDefault();
    const q = busqueda.trim();
    navigate(q ? `/atractivos?q=${encodeURIComponent(q)}` : '/atractivos');
  };

  return (
    <section className="relative">
      <div className="relative h-[78vh] min-h-[480px] w-full overflow-hidden bg-slate-900">
        {n > 0 ? (
          imagenes.map((src, idx) => (
            <img
              key={src}
              src={src}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                idx === i ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-teal-700 to-slate-900" />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-slate-900/35 to-slate-950/80" />

        <div className="relative z-10 h-full px-4 pt-8 sm:pt-12">
          <form
            onSubmit={buscar}
            className="relative z-10 mx-auto flex w-full max-w-xl items-center gap-2 rounded-full bg-white/95 px-4 py-2.5 shadow-xl ring-1 ring-black/5 backdrop-blur"
            role="search"
          >
            <svg className="h-5 w-5 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar aventuras en Pelileo..."
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              aria-label="Buscar atractivos"
            />
            <button
              type="submit"
              className="shrink-0 rounded-full bg-primario px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-primario-oscuro"
            >
              Buscar
            </button>
          </form>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
            <div className="flex flex-col items-center text-center text-white">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/75">
                San Pedro de Pelileo
              </p>
              <h1 className="max-w-4xl text-4xl font-extrabold uppercase leading-tight tracking-tight drop-shadow-lg sm:text-6xl lg:text-7xl">
                {titulo}
              </h1>
              {eslogan && (
                <p className="mt-4 max-w-2xl text-base text-white/90 drop-shadow sm:text-xl">
                  {eslogan}
                </p>
              )}
            </div>
          </div>
        </div>

        {n > 1 && (
          <>
            <button
              type="button"
              onClick={() => ir(i - 1)}
              aria-label="Anterior"
              className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/15 px-3 py-1 text-2xl leading-none text-white backdrop-blur transition hover:bg-white/35 sm:left-5"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => ir(i + 1)}
              aria-label="Siguiente"
              className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/15 px-3 py-1 text-2xl leading-none text-white backdrop-blur transition hover:bg-white/35 sm:right-5"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Mitad sobre la imagen, mitad sobre el fondo blanco (como el mockup) */}
      <div className="relative z-30 mx-auto max-w-6xl -translate-y-1/2 px-4 pb-2">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ACCESOS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex items-center gap-3.5 rounded-2xl bg-white px-4 py-4 shadow-lg ring-1 ring-slate-200/80 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <span
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ring-1 ring-black/5 transition ${item.iconoBg} ${item.iconoColor} ${item.iconoHover}`}
              >
                {item.icono}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-extrabold uppercase tracking-wide text-slate-800">
                  {item.titulo}
                </span>
                <span className="block truncate text-xs text-slate-500">{item.subtitulo}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroInicio;
