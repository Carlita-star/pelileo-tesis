import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerRutaPorId } from '../../services/rutas.service';
import { urlImagen } from '../../services/media';
import MapaRuta from '../../components/publico/MapaRuta';
import BotonComoLlegar from '../../components/publico/ComoLlegar';
import TarjetaCercano from '../../components/publico/TarjetaCercano';
import { colorDificultad } from '../../components/publico/TarjetaRuta';

// P-05 — Detalle de ruta (/rutas/:id)  —  ESTE ARCHIVO VA EN: src/pages/publico/
function DetalleRuta() {
  const { id } = useParams();
  const [ruta, setRuta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [imgActiva, setImgActiva] = useState(0);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    obtenerRutaPorId(parseInt(id, 10))
      .then((datos) => { if (activo) { setRuta(datos); setCargando(false); } })
      .catch((e) => { if (activo) { setError(e.message); setCargando(false); } });
    return () => { activo = false; };
  }, [id]);

  if (cargando) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
        <div className="mt-6 h-8 w-1/2 animate-pulse rounded bg-slate-100" />
      </div>
    );
  }

  if (error || !ruta) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-800">No se encontró la ruta</h1>
        <p className="mt-2 text-slate-500">{error || 'Es posible que no exista o no esté publicada.'}</p>
        <Link to="/rutas" className="mt-6 inline-block rounded-lg bg-primario px-5 py-2 font-semibold text-white transition hover:bg-primario-oscuro">
          Volver a rutas
        </Link>
      </div>
    );
  }

  const paradas = Array.isArray(ruta.paradas) ? ruta.paradas : [];
  const cercanos = Array.isArray(ruta.emprendimientos_cercanos) ? ruta.emprendimientos_cercanos : [];

  // Galería de la ruta (tabla multimedia). La principal va primero.
  const multimedia = Array.isArray(ruta.multimedia) ? ruta.multimedia : [];
  const imagenes = [...multimedia]
    .sort((a, b) => (b.principal === true ? 1 : 0) - (a.principal === true ? 1 : 0))
    .map((m) => urlImagen(m.archivo))
    .filter(Boolean);

  const paradasMapa = paradas
    .map((p, i) => ({
      lat: p.atractivo?.latitud,
      lng: p.atractivo?.longitud,
      nombre: p.atractivo?.nombre,
      orden: p.orden ?? i + 1,
    }))
    .filter((x) => x.lat != null && x.lng != null);

  const puntoLlegada = (ruta.lat_inicio != null && ruta.lon_inicio != null)
    ? [ruta.lat_inicio, ruta.lon_inicio]
    : (paradasMapa[0] ? [paradasMapa[0].lat, paradasMapa[0].lng] : null);

  const hayMapa = paradasMapa.length > 0 || ruta.geojson_ruta || puntoLlegada;

  const metricas = [
    { etiqueta: 'Distancia', valor: ruta.distancia_km != null ? `${ruta.distancia_km} km` : null },
    { etiqueta: 'Duración', valor: ruta.duracion_estimada },
    { etiqueta: 'Dificultad', valor: ruta.dificultad },
    { etiqueta: 'Paradas', valor: ruta.num_atractivos != null ? `${ruta.num_atractivos}` : `${paradas.length}` },
  ].filter((m) => m.valor);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <nav className="mb-5 text-sm text-slate-500">
        <Link to="/" className="hover:text-primario">Inicio</Link>
        <span className="mx-2">/</span>
        <Link to="/rutas" className="hover:text-primario">Rutas</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{ruta.nombre}</span>
      </nav>

      {/* GALERÍA DE LA RUTA */}
      {imagenes.length > 0 && (
        <div className="mb-6">
          <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200">
            <img src={imagenes[imgActiva]} alt={ruta.nombre} className="h-80 w-full object-cover" />
          </div>
          {imagenes.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {imagenes.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImgActiva(i)}
                  className={`h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg ring-2 transition ${i === imgActiva ? 'ring-primario' : 'ring-transparent hover:ring-slate-300'}`}
                >
                  <img src={src} alt={`${ruta.nombre} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <h1 className="text-3xl font-extrabold text-slate-800">{ruta.nombre}</h1>
      <div className="mt-3 flex flex-wrap gap-2">
        {ruta.dificultad && (
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${colorDificultad(ruta.dificultad)}`}>{ruta.dificultad}</span>
        )}
        {ruta.parroquia && <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{ruta.parroquia}</span>}
      </div>

      {ruta.descripcion && <p className="mt-5 leading-relaxed text-slate-600">{ruta.descripcion}</p>}

      {metricas.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {metricas.map((m) => (
            <div key={m.etiqueta} className="rounded-xl bg-slate-50 p-4 text-center ring-1 ring-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{m.etiqueta}</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{m.valor}</p>
            </div>
          ))}
        </div>
      )}

      {/* MAPA CON EL TRAZADO DE LA RUTA */}
      {hayMapa && (
        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-800">Recorrido en el mapa</h2>
            {puntoLlegada && (
              <BotonComoLlegar lat={puntoLlegada[0]} lng={puntoLlegada[1]} etiqueta="Cómo llegar al inicio" />
            )}
          </div>
          {ruta.punto_inicio && <p className="mt-1 text-sm text-slate-500">Inicio: {ruta.punto_inicio}</p>}
          <div className="mt-4">
            <MapaRuta paradas={paradasMapa} geojson={ruta.geojson_ruta} centro={puntoLlegada} />
          </div>
        </section>
      )}

      {/* PARADAS EN ORDEN (con foto) */}
      {paradas.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-slate-800">Recorrido</h2>
          <ol className="mt-4 space-y-3">
            {paradas.map((p, i) => {
              const at = p.atractivo || {};
              const foto = urlImagen(at.imagen);
              return (
                <li key={i} className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200 transition hover:shadow-md">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primario text-sm font-bold text-white">
                    {p.orden ?? i + 1}
                  </span>
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {foto ? (
                      <img src={foto} alt={at.nombre} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-black text-slate-300">
                        {at.nombre?.charAt(0) ?? '?'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800">{at.nombre}</p>
                    {at.descripcion && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{at.descripcion}</p>}
                    {at.slug && (
                      <Link to={`/atractivos/${at.slug}`} className="mt-1 inline-block text-sm font-medium text-primario hover:underline">
                        Ver atractivo →
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* EMPRENDIMIENTOS CERCANOS */}
      {cercanos.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-slate-800">Emprendimientos en esta ruta</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cercanos.map((e, i) => <TarjetaCercano key={i} tipo="emprendimiento" item={e} />)}
          </div>
        </section>
      )}

      <div className="mt-12">
        <Link to="/rutas" className="text-sm font-medium text-primario hover:underline">← Volver a rutas</Link>
      </div>
    </div>
  );
}

export default DetalleRuta;