import { Link } from 'react-router-dom';
import { urlImagen } from '../../services/media';
import { slugify } from '../../services/slug';

export function estadoEvento(inicio, fin) {
  const ahora = new Date();
  const i = inicio ? new Date(inicio) : null;
  const f = fin ? new Date(fin) : null;
  if (i && ahora < i) return 'Próximo';
  if (f && ahora > f) return 'Finalizado';
  if (i && ahora >= i && (!f || ahora <= f)) return 'En curso';
  return null;
}

function estiloEstado(estado) {
  if (estado === 'Próximo') {
    return 'border-amber-200/80 bg-amber-50/95 text-amber-800 shadow-amber-200/50';
  }
  if (estado === 'En curso') {
    return 'border-emerald-200/80 bg-emerald-50/95 text-emerald-800 shadow-emerald-200/50';
  }
  if (estado === 'Finalizado') {
    return 'border-slate-200/80 bg-white/90 text-slate-500 shadow-slate-200/40';
  }
  return 'border-slate-200 bg-white/90 text-slate-600';
}

function fmtFecha(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function IconoCalendario({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
    </svg>
  );
}

function IconoUbicacion({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconoOrganizador({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function FilaDetalle({ icono, children }) {
  return (
    <div className="flex items-start gap-2.5 text-sm text-slate-600">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-primario ring-1 ring-slate-200/80">
        {icono}
      </span>
      <span className="min-w-0 pt-1 leading-snug">{children}</span>
    </div>
  );
}

function TarjetaEvento({ evento }) {
  const { id, nombre, categoria, fecha_inicio, fecha_fin, organizador, direccion, costo } = evento;
  const imagen = urlImagen(evento.imagen);
  const estado = estadoEvento(fecha_inicio, fecha_fin);
  const ini = fmtFecha(fecha_inicio);
  const fin = fmtFecha(fecha_fin);
  const esGratis = costo == null || Number(costo) === 0;
  const detalleUrl = `/eventos/${id}-${slugify(nombre)}`;

  const rangoFecha = ini
    ? `${ini}${fin && fin !== ini ? ` — ${fin}` : ''}`
    : null;

  return (
    <Link to={detalleUrl} className="group block h-full transition hover:no-underline">
      <article className="relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12)] ring-1 ring-slate-200/70 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_48px_-12px_rgba(29,158,117,0.22)] hover:ring-primario/35">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-400/10 blur-2xl transition duration-500 group-hover:bg-primario/15" aria-hidden />

        <div className="relative h-44 overflow-hidden sm:h-48">
          {imagen ? (
            <img
              src={imagen}
              alt={nombre}
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-100 via-amber-50 to-emerald-100">
              <span className="text-6xl font-black text-primario/20">{nombre?.charAt(0) ?? 'E'}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/20 to-transparent" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2 sm:left-4 sm:top-4">
            {categoria && (
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-primario to-emerald-500 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wider text-white shadow-lg shadow-primario/30">
                {categoria}
              </span>
            )}
          </div>

          {estado && (
            <span
              className={`absolute right-3 top-3 rounded-full border px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-wide shadow-sm backdrop-blur-sm sm:right-4 sm:top-4 ${estiloEstado(estado)}`}
            >
              {estado}
            </span>
          )}

          <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-10 sm:px-5 sm:pb-5">
            <h3 className="line-clamp-2 text-lg font-black leading-tight tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] sm:text-xl">
              {nombre}
            </h3>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 bg-gradient-to-b from-white to-slate-50/90 px-4 py-4 sm:px-5 sm:py-5">
          {rangoFecha && (
            <FilaDetalle icono={<IconoCalendario />}>{rangoFecha}</FilaDetalle>
          )}
          {direccion && (
            <FilaDetalle icono={<IconoUbicacion />}>{direccion}</FilaDetalle>
          )}
          {organizador && (
            <FilaDetalle icono={<IconoOrganizador />}>
              <span className="text-slate-500">Organiza </span>
              <span className="font-semibold text-slate-700">{organizador}</span>
            </FilaDetalle>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ${
                esGratis
                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                  : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
              }`}
            >
              {esGratis ? 'Entrada libre' : `$ ${costo}`}
            </span>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-primario transition group-hover:gap-2">
              Ver evento
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default TarjetaEvento;
