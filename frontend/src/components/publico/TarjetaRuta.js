import { Link } from 'react-router-dom';
import { urlImagen } from '../../services/media';
import { slugify } from '../../services/slug';
import MiniMapaRutaTarjeta from './MiniMapaRutaTarjeta';

export function colorDificultad(d) {
  const v = (d || '').toLowerCase();
  if (v.includes('faci') || v.includes('fáci')) return 'bg-green-100 text-green-700';
  if (v.includes('moder')) return 'bg-amber-100 text-amber-700';
  if (v.includes('dif')) return 'bg-red-100 text-red-700';
  return 'bg-slate-100 text-slate-600';
}

function abreviar(texto, max = 18) {
  if (!texto) return '';
  if (texto.length <= max) return texto;
  return `${texto.slice(0, max - 1).trim()}…`;
}

function IconoParada({ indice }) {
  const verde = indice % 2 === 0;
  if (verde) {
    return (
      <svg className="h-4 w-4 shrink-0 text-primario" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M12 22V12" />
        <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
        <path d="M8 12V7a4 4 0 0 1 8 0v5" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4 shrink-0 text-[#2563eb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function TarjetaRuta({ ruta }) {
  const {
    id,
    nombre,
    duracion_estimada,
    dificultad,
    distancia_km,
  } = ruta;

  const paradas = Array.isArray(ruta.paradas) ? ruta.paradas : [];
  const imagenes = (ruta.imagenes?.length
    ? ruta.imagenes
    : [ruta.imagen]
  ).map((img) => urlImagen(img)).filter(Boolean);

  const imagenPrincipal = imagenes[0];
  const miniaturas = imagenes.slice(0, 3);

  const metaPartes = [];
  if (duracion_estimada) metaPartes.push(`Tiempo: ${duracion_estimada}`);
  if (dificultad) metaPartes.push(`Dificultad: ${dificultad}`);
  if (!duracion_estimada && distancia_km != null) metaPartes.push(`${distancia_km} km`);

  const detalleUrl = `/rutas/${id}-${slugify(nombre)}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-slate-200/80 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="p-3 pb-0">
        <div className="relative h-44 overflow-hidden rounded-2xl bg-slate-100 shadow-inner ring-1 ring-slate-200/60">
          {imagenPrincipal ? (
            <img
              src={imagenPrincipal}
              alt={nombre}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primario/15 to-slate-200 text-5xl font-black text-primario/30">
              {nombre?.charAt(0) ?? 'R'}
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent" />
          {dificultad && (
            <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${colorDificultad(dificultad)}`}>
              {dificultad}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <h3 className="text-lg font-extrabold leading-tight text-slate-900">{nombre}</h3>

        {metaPartes.length > 0 && (
          <p className="mt-1.5 text-sm font-medium text-slate-600">
            {metaPartes.join(' | ')}
          </p>
        )}

        <MiniMapaRutaTarjeta
          paradas={paradas}
          geojson={ruta.geojson_ruta}
          latInicio={ruta.lat_inicio}
          lonInicio={ruta.lon_inicio}
        />

        {paradas.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5">
            {paradas.slice(0, 4).map((p, i) => (
              <div key={`${p.orden}-${p.nombre}`} className="flex min-w-0 items-center gap-2">
                <IconoParada indice={i} />
                <span className="truncate text-xs font-semibold text-slate-700" title={p.nombre}>
                  {abreviar(p.nombre)}
                </span>
              </div>
            ))}
          </div>
        )}

        {miniaturas.length > 0 && (
          <div className="mt-4 flex gap-2">
            {miniaturas.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="h-16 flex-1 overflow-hidden rounded-xl ring-1 ring-slate-200/80"
              >
                <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" aria-hidden={i > 0} />
              </div>
            ))}
          </div>
        )}

        <Link
          to={detalleUrl}
          className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-primario px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-primario-oscuro hover:shadow-lg"
        >
          Ver Ruta
        </Link>
      </div>
    </article>
  );
}

export default TarjetaRuta;
