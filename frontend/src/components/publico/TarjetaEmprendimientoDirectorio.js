import { Link } from 'react-router-dom';
import { urlImagen } from '../../services/media';
import { slugify } from '../../services/slug';
import { ResumenEstrellas } from './EstrellasCalificacion';
import { abrirComoLlegar } from './ComoLlegar';
import { SocialIconLink } from './SocialIconLink';

function IconoServicio() {
  return (
    <svg className="h-4 w-4 shrink-0 text-primario" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function IconoContacto({ tipo, className = 'h-4 w-4' }) {
  const cls = `${className} shrink-0 text-[#2563eb]`;
  if (tipo === 'email') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </svg>
    );
  }
  if (tipo === 'ubicacion') {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  }
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function FilaContacto({ tipo, href, children }) {
  const texto = href ? (
    <a href={href} className="break-words font-medium text-slate-700 transition hover:text-[#2563eb]">
      {children}
    </a>
  ) : (
    <span className="break-words font-medium text-slate-700">{children}</span>
  );

  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563eb]/10 ring-1 ring-[#2563eb]/15">
        <IconoContacto tipo={tipo} />
      </span>
      <div className="min-w-0 pt-1.5 text-sm leading-snug">{texto}</div>
    </div>
  );
}

function BloqueInformacion({ nombre, categoria, servicios, telefono, email, ubicacion, atractivoCercano, redes, promedioCalificacion, totalResenas }) {
  const hayContacto = telefono || email || ubicacion || atractivoCercano;

  return (
    <div className="flex flex-1 flex-col">
      <div className="mt-1">
        <h3 className="text-xl font-extrabold leading-tight tracking-tight text-slate-900">{nombre}</h3>
        {categoria && (
          <span className="mt-2 inline-block rounded-full bg-primario/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primario">
            {categoria}
          </span>
        )}
        <div className="mt-2">
          <ResumenEstrellas promedio={promedioCalificacion} total={totalResenas} />
        </div>
      </div>

      {servicios.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
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
      )}

      {hayContacto && (
        <div className="mt-4 rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-200/70">
          <div className="flex gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              {telefono && (
                <FilaContacto tipo="telefono" href={`tel:${telefono}`}>
                  {telefono}
                </FilaContacto>
              )}
              {email && (
                <FilaContacto tipo="email" href={`mailto:${email}`}>
                  {email}
                </FilaContacto>
              )}
              {ubicacion && (
                <FilaContacto tipo="ubicacion">
                  {ubicacion}
                </FilaContacto>
              )}
              {atractivoCercano && (
                <div className="rounded-xl border border-primario/15 bg-primario/5 px-3 py-2.5 text-sm leading-snug text-slate-600">
                  <span className="font-bold text-primario">Cerca de:</span>{' '}
                  {atractivoCercano}
                </div>
              )}
            </div>

            {redes.length > 0 && (
              <div className="flex shrink-0 flex-col items-center justify-start gap-2 border-l border-slate-200/80 pl-4">
                {redes.slice(0, 3).map((red) => (
                  <SocialIconLink
                    key={`${red.nombre_red}-${red.url}`}
                    nombre={red.nombre_red}
                    url={red.url}
                    size="sm"
                    variant="brand"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {!hayContacto && redes.length > 0 && (
        <div className="mt-4 flex justify-end gap-2">
          {redes.slice(0, 3).map((red) => (
            <SocialIconLink
              key={`${red.nombre_red}-${red.url}`}
              nombre={red.nombre_red}
              url={red.url}
              size="sm"
              variant="brand"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GaleriaMockup({ imagenes, nombre }) {
  if (!imagenes.length) {
    return (
      <div className="emp-dir-galeria relative mb-6 h-44">
        <div className="absolute inset-x-3 bottom-1 top-4 rounded-2xl bg-gradient-to-br from-white to-slate-100 shadow-inner" aria-hidden />
        <div className="absolute left-2 top-2 z-10 flex h-[9.5rem] w-[58%] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-primario/15 via-slate-100 to-slate-200 shadow-lg ring-[3px] ring-white">
          <span className="text-5xl font-black text-primario/40">{nombre?.charAt(0) ?? 'E'}</span>
        </div>
        <div className="absolute right-2 top-7 z-20 flex h-[7.5rem] w-[44%] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 shadow-xl ring-[3px] ring-white">
          <svg className="h-12 w-12 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" stroke="none" />
            <path d="M3 16l5-5 4 4 3-3 6 6" />
          </svg>
        </div>
      </div>
    );
  }

  const principal = imagenes[0];
  const secundaria = imagenes[1] ?? imagenes[0];
  const unaSola = imagenes.length === 1;

  return (
    <div className="emp-dir-galeria relative mb-6 h-44">
      <div className="absolute inset-x-3 bottom-1 top-4 rounded-2xl bg-gradient-to-br from-white/95 to-slate-100/90 shadow-inner" aria-hidden />

      <div className="absolute left-2 top-2 z-10 h-[9.5rem] w-[58%] overflow-hidden rounded-2xl shadow-lg ring-[3px] ring-white transition duration-500 group-hover:scale-[1.02] group-hover:shadow-xl">
        <img
          src={principal}
          alt={nombre}
          className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/25 via-transparent to-transparent" />
      </div>

      <div className="absolute right-2 top-7 z-20 h-[7.5rem] w-[44%] overflow-hidden rounded-2xl shadow-xl ring-[3px] ring-white transition duration-500 group-hover:-translate-y-1 group-hover:shadow-2xl">
        <img
          src={secundaria}
          alt={unaSola ? '' : `${nombre} 2`}
          className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${unaSola ? 'scale-125 object-[70%_center]' : 'object-center'}`}
          loading="lazy"
          aria-hidden={unaSola}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
      </div>
    </div>
  );
}

function TarjetaEmprendimientoDirectorio({ emprendimiento }) {
  const {
    id,
    nombre,
    telefono,
    email,
    direccion,
    parroquia,
    latitud,
    longitud,
    atractivo_cercano,
  } = emprendimiento;

  const imagenes = (emprendimiento.imagenes?.length
    ? emprendimiento.imagenes
    : [emprendimiento.imagen]
  ).map((img) => urlImagen(img)).filter(Boolean);

  const servicios = Array.isArray(emprendimiento.servicios) ? emprendimiento.servicios : [];
  const redes = Array.isArray(emprendimiento.redes_sociales) ? emprendimiento.redes_sociales : [];
  const ubicacion = direccion || parroquia;
  const detalleUrl = `/emprendimientos/${id}-${slugify(nombre)}`;

  const botonDetalle = (
    <Link
      to={detalleUrl}
      className="flex flex-1 items-center justify-center rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#1d4ed8] hover:shadow-lg"
    >
      Ver detalle
    </Link>
  );

  const botonMapa = latitud != null && longitud != null ? (
    <button
      type="button"
      onClick={() => abrirComoLlegar(latitud, longitud)}
      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primario px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-primario-oscuro hover:shadow-lg"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      Ver en Mapa
    </button>
  ) : (
    <Link
      to="/mapa"
      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primario px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-primario-oscuro hover:shadow-lg"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      Ver en Mapa
    </Link>
  );

  return (
    <article className="group flex h-full flex-col rounded-2xl bg-[#f4f7fa] p-5 shadow-md ring-1 ring-slate-200/80 transition hover:-translate-y-1 hover:shadow-xl">
      <GaleriaMockup imagenes={imagenes} nombre={nombre} />

      <BloqueInformacion
        nombre={nombre}
        categoria={emprendimiento.categoria}
        servicios={servicios}
        telefono={telefono}
        email={email}
        ubicacion={ubicacion}
        atractivoCercano={atractivo_cercano}
        redes={redes}
        promedioCalificacion={emprendimiento.promedio_calificacion}
        totalResenas={emprendimiento.total_resenas}
      />

      <div className="mt-5 flex gap-3 pt-1">
        {botonDetalle}
        {botonMapa}
      </div>
    </article>
  );
}

export default TarjetaEmprendimientoDirectorio;
