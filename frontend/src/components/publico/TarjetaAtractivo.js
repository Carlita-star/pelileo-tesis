import { Link } from 'react-router-dom';
import { urlImagen } from '../../services/media';
import { slugify } from '../../services/slug';
import { ResumenEstrellas } from './EstrellasCalificacion';

function IconoPin({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}

function IconoHorario() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  );
}

function IconoServicio() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0 text-primario" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function TarjetaAtractivo({ atractivo }) {
  const { nombre, categoria, parroquia, descripcion, slug, id, horario, destacado } = atractivo;
  const imagen = urlImagen(atractivo.imagen_principal || atractivo.imagen || atractivo.foto);
  const destino = slug ? `/atractivos/${slug}` : `/atractivos/${id}-${slugify(nombre)}`;
  const servicios = Array.isArray(atractivo.servicios) ? atractivo.servicios : [];

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12)] ring-1 ring-slate-200/70 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_24px_48px_-12px_rgba(29,158,117,0.25)] hover:ring-primario/40">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primario/10 blur-2xl transition duration-500 group-hover:bg-primario/20" aria-hidden />

      <div className="relative h-[15.5rem] overflow-hidden">
        {imagen ? (
          <img
            src={imagen}
            alt={nombre}
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primario/20 via-emerald-100 to-amber-100">
            <span className="text-6xl font-black text-primario/25">{nombre?.charAt(0) ?? 'A'}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-slate-900/10" />
        <div className="absolute inset-0 bg-gradient-to-br from-primario/30 via-transparent to-secundario/20 mix-blend-soft-light opacity-80" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {categoria && (
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-primario to-emerald-500 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg shadow-primario/40">
              {categoria}
            </span>
          )}
          {destacado && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-amber-400/40">
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Destacado
            </span>
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 px-5 pb-5 pt-12">
          <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-black/70 to-transparent" aria-hidden />
          <div className="relative">
            <h3 className="text-xl font-black leading-tight tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              {nombre}
            </h3>
            {parroquia && (
              <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-md">
                <IconoPin className="h-4 w-4 text-emerald-300" />
                {parroquia}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col gap-4 bg-gradient-to-b from-white via-white to-slate-50/90 px-5 py-5">
        <ResumenEstrellas promedio={atractivo.promedio_calificacion} total={atractivo.total_resenas} />
        {horario && (
          <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 px-3.5 py-3 ring-1 ring-sky-200/80">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-md shadow-sky-200">
              <IconoHorario />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600">Horario</p>
              <p className="text-sm font-bold text-slate-800">{horario}</p>
            </div>
          </div>
        )}

        {servicios.length > 0 && (
          <div>
            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Servicios disponibles
            </p>
            <div className="flex flex-wrap gap-2">
              {servicios.map((s) => (
                <span
                  key={s.nombre}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/80"
                >
                  {s.icono ? (
                    <span className="text-sm leading-none text-primario">{s.icono}</span>
                  ) : (
                    <IconoServicio />
                  )}
                  {s.nombre}
                </span>
              ))}
            </div>
          </div>
        )}

        {descripcion && (
          <div className="relative rounded-2xl border-l-4 border-primario bg-gradient-to-r from-primario/[0.06] to-transparent px-4 py-3.5">
            <span className="absolute -left-0.5 -top-1 text-4xl font-serif leading-none text-primario/20" aria-hidden>&ldquo;</span>
            <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
              {descripcion}
            </p>
          </div>
        )}

        <Link
          to={destino}
          className="group/btn mt-auto inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primario via-emerald-500 to-primario-oscuro px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primario/30 transition-all duration-300 hover:gap-3 hover:shadow-xl hover:shadow-primario/40"
        >
          Ver detalle
          <svg className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </article>
  );
}

export default TarjetaAtractivo;
