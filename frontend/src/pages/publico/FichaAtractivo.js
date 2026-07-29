import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerAtractivoPorSlug } from '../../services/atractivos.service';
import { urlImagen } from '../../services/media';
import GaleriaDetalle from '../../components/publico/GaleriaDetalle';
import MiniMapa from '../../components/publico/MiniMapa';
import BotonComoLlegar from '../../components/publico/ComoLlegar';
import TarjetaCercano from '../../components/publico/TarjetaCercano';
import SeccionResenas from '../../components/publico/SeccionResenas';
import '../../components/publico/resenas-publico.css';

// ---------------------------------------------------------------------------
// Pequeñas ayudas para leer la respuesta de la API sin que un campo faltante
// rompa la pantalla. TODO viene de la API; aquí solo lo interpretamos.
// ---------------------------------------------------------------------------

// Un campo como "categoria" puede llegar como texto ("Cascada") o como objeto
// ({ nombre: "Cascada" }). Esta función devuelve siempre el texto.
function texto(valor) {
  if (valor === null || valor === undefined) return null;
  if (typeof valor === 'object') {
    return valor.nombre ?? valor.servicio?.nombre ?? valor.actividad?.nombre ?? null;
  }
  return valor;
}

// Busca un array dentro del atractivo probando varios nombres posibles de campo.
function lista(obj, ...nombresPosibles) {
  for (const n of nombresPosibles) {
    if (Array.isArray(obj?.[n])) return obj[n];
  }
  return [];
}

function FichaAtractivo() {
  const { slug } = useParams();
  const [atractivo, setAtractivo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    obtenerAtractivoPorSlug(slug)
      .then((datos) => { if (activo) { setAtractivo(datos); setCargando(false); } })
      .catch((e) => { if (activo) { setError(e.message); setCargando(false); } });
    return () => { activo = false; };
  }, [slug]);

  // ----- Estados de carga / error -----
  if (cargando) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
        <div className="mt-6 h-8 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="mt-3 h-24 animate-pulse rounded bg-slate-100" />
      </div>
    );
  }

  if (error || !atractivo) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-800">No se encontró el atractivo</h1>
        <p className="mt-2 text-slate-500">{error || 'Es posible que no exista o no esté publicado.'}</p>
        <Link to="/atractivos" className="mt-6 inline-block rounded-lg bg-primario px-5 py-2 font-semibold text-white transition hover:bg-primario-oscuro">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  // ----- Datos (todos leídos del objeto que vino de la API) -----
  const nombre = atractivo.nombre;
  const categoria = texto(atractivo.categoria);
  const parroquia = texto(atractivo.parroquia);
  const descripcion = atractivo.descripcion;

  const detalles = atractivo.detalles ?? atractivo.atractivo_detalles ?? {};
  const acceso = atractivo.accesibilidad ?? atractivo.atractivo_accesibilidad ?? {};

  // Galería: del array de multimedia. Ponemos la principal primero.
  const multimedia = lista(atractivo, 'multimedia', 'imagenes', 'galeria', 'fotos');
  const imagenes = [...multimedia]
    .sort((a, b) => (b.principal === true ? 1 : 0) - (a.principal === true ? 1 : 0))
    .map((m) => ({ url: urlImagen(m.archivo ?? m.url ?? m.imagen), titulo: m.titulo }))
    .filter((m) => m.url);

  const servicios = lista(atractivo, 'servicios', 'atractivo_servicios').map(texto).filter(Boolean);
  const actividades = lista(atractivo, 'actividades', 'atractivo_actividades').map(texto).filter(Boolean);
  const recomendados = lista(atractivo, 'atractivos_recomendados', 'recomendaciones');

  const infoRapida = [
    { etiqueta: 'Horario', valor: atractivo.horario ?? detalles.horario },
    { etiqueta: 'Tipo de ingreso', valor: detalles.tipo_ingreso },
    {
      etiqueta: 'Precio',
      valor:
        atractivo.precio_referencial ?? detalles.costo
          ? `$ ${atractivo.precio_referencial ?? detalles.costo}`
          : null,
    },
    { etiqueta: 'Clima', valor: detalles.clima },
    { etiqueta: 'Meses recomendados', valor: detalles.meses_recomendados },
  ].filter((x) => x.valor);

  const comoLlegar = [
    { etiqueta: 'Tipo de vía', valor: acceso.tipo_via },
    { etiqueta: 'Transporte', valor: acceso.tipo_transporte },
    { etiqueta: 'Tiempo estimado', valor: acceso.tiempo_desplazamiento },
    { etiqueta: 'Distancia', valor: acceso.distancia_referencial_km ? `${acceso.distancia_referencial_km} km` : null },
    { etiqueta: 'Señalización', valor: acceso.posee_senalizacion === true ? 'Sí' : acceso.posee_senalizacion === false ? 'No' : null },
  ].filter((x) => x.valor);

  const climaValor = detalles.clima;
  const mesesValor = detalles.meses_recomendados;
  const horarioValor = atractivo.horario ?? detalles.horario;

  return (
    <div className="min-h-screen bg-[#f7f8f6]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <nav className="mb-5 text-sm text-slate-500">
          <Link to="/" className="hover:text-primario">Inicio</Link>
          <span className="mx-2">/</span>
          <Link to="/atractivos" className="hover:text-primario">Atractivos</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">{nombre}</span>
        </nav>

        <GaleriaDetalle
          imagenes={imagenes}
          titulo={nombre}
          vacio={(
            <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-slate-100 text-slate-400">
              <span className="text-4xl font-black text-primario/20">{nombre?.charAt(0) ?? 'A'}</span>
              <span className="mt-2 text-sm">Fotos próximamente</span>
            </div>
          )}
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 sm:p-8">
            <div className="flex flex-wrap gap-2">
              {categoria && (
                <span className="rounded-full bg-primario/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primario">
                  {categoria}
                </span>
              )}
              {parroquia && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {parroquia}
                </span>
              )}
            </div>

            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {nombre}
            </h1>

            {atractivo.promedio_calificacion != null && (
              <p className="mt-2 text-sm text-slate-500">
                ★ {Number(atractivo.promedio_calificacion).toFixed(1)}
                {atractivo.total_resenas != null && (
                  <span> · {atractivo.total_resenas} reseña(s)</span>
                )}
              </p>
            )}

            {descripcion && (
              <p className="mt-5 whitespace-pre-line leading-relaxed text-slate-600">{descripcion}</p>
            )}

            {(climaValor || mesesValor) && (
              <section className="mt-8 rounded-2xl bg-sky-50/80 p-5 ring-1 ring-sky-100">
                <h2 className="text-sm font-bold uppercase tracking-wide text-sky-800">Clima e info</h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {climaValor && (
                    <div>
                      <p className="text-xs font-semibold text-sky-600">Clima</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-800">{climaValor}</p>
                    </div>
                  )}
                  {mesesValor && (
                    <div>
                      <p className="text-xs font-semibold text-sky-600">Meses recomendados</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-800">{mesesValor}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {comoLlegar.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-xl font-bold text-slate-900">Accesibilidad</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {comoLlegar.map((item) => (
                    <div
                      key={item.etiqueta}
                      className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200/80"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primario/10 text-primario">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                          <path d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" strokeLinejoin="round" />
                          <circle cx="12" cy="10" r="2" />
                        </svg>
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.etiqueta}</p>
                        <p className="text-sm font-medium text-slate-800">{item.valor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {servicios.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-xl font-bold text-slate-900">Servicios</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {servicios.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 rounded-full bg-primario/10 px-4 py-2 text-sm font-semibold text-primario"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {s}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {actividades.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-xl font-bold text-slate-900">Actividades</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {actividades.map((a, i) => (
                    <span key={i} className="rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 ring-1 ring-amber-100">
                      {a}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {infoRapida.length > 0 && (
              <section className="mt-8">
                <h2 className="font-display text-xl font-bold text-slate-900">Información práctica</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {infoRapida.map((item) => (
                    <div key={item.etiqueta} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200/80">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.etiqueta}</p>
                      <p className="mt-1 text-sm font-medium text-slate-700">{item.valor}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
              {horarioValor && (
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Horario</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{horarioValor}</p>
                </div>
              )}
              {atractivo.direccion && (
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Dirección</p>
                  <p className="mt-1 text-sm text-slate-700">{atractivo.direccion}</p>
                </div>
              )}
              {(atractivo.latitud != null && atractivo.longitud != null) && (
                <>
                  <MiniMapa lat={atractivo.latitud} lng={atractivo.longitud} nombre={nombre} />
                  <div className="mt-3">
                    <BotonComoLlegar lat={atractivo.latitud} lng={atractivo.longitud} />
                  </div>
                </>
              )}
            </div>

            {mesesValor && (
              <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Recomendaciones</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{mesesValor}</p>
              </div>
            )}
          </aside>
        </div>

        {recomendados.length > 0 && (
          <section className="mt-12 rounded-3xl bg-primario/5 px-4 py-10 sm:px-8">
            <h2 className="font-display text-2xl font-extrabold text-slate-900">Cercanos y recomendados</h2>
            <p className="mt-1 text-sm text-slate-500">Otros lugares que podrían interesarte.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recomendados.map((item) => (
                <TarjetaCercano key={item.id ?? item.slug ?? item.nombre} tipo="atractivo" item={item} />
              ))}
            </div>
          </section>
        )}

        {atractivo.id && (
          <SeccionResenas entidadTipo="atractivo" entidadId={atractivo.id} />
        )}

        <div className="detalle-volver-bar mt-8">
          <Link to="/atractivos" className="text-sm font-medium text-primario hover:underline">
            ← Volver al catálogo de atractivos
          </Link>
        </div>
      </div>
    </div>
  );
}

export default FichaAtractivo;