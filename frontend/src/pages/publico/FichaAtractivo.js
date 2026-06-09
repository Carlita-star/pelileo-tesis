import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerAtractivoPorSlug } from '../../services/atractivos.service';
import { API_BASE } from '../../services/api';
import MiniMapa from '../../components/publico/MiniMapa';
import BotonComoLlegar from '../../components/publico/ComoLlegar';
import TarjetaCercano from '../../components/publico/TarjetaCercano';

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

// Convierte la "archivo" de multimedia en una URL que el navegador pueda mostrar.
// Si ya es una URL completa, la usa tal cual; si es ruta relativa, la sirve
// desde el backend (carpeta media de Django).
function urlImagen(archivo) {
  if (!archivo) return null;
  if (typeof archivo !== 'string') return null;
  if (archivo.startsWith('http')) return archivo;
  const base = API_BASE.replace(/\/$/, '');
  const ruta = archivo.startsWith('/') ? archivo : `/media/${archivo}`;
  return `${base}${ruta}`;
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
  const [imgActiva, setImgActiva] = useState(0);

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
  const cercanos = lista(atractivo, 'emprendimientos_cercanos', 'emprendimientos', 'relaciones');

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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Migaja de pan */}
      <nav className="mb-5 text-sm text-slate-500">
        <Link to="/" className="hover:text-primario">Inicio</Link>
        <span className="mx-2">/</span>
        <Link to="/atractivos" className="hover:text-primario">Atractivos</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{nombre}</span>
      </nav>

      {/* Galería */}
      {imagenes.length > 0 ? (
        <div>
          <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200">
            <img src={imagenes[imgActiva]?.url} alt={nombre} className="h-[420px] w-full object-cover" />
          </div>
          {imagenes.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {imagenes.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgActiva(i)}
                  className={`h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg ring-2 transition ${i === imgActiva ? 'ring-primario' : 'ring-transparent hover:ring-slate-300'}`}
                >
                  <img src={img.url} alt={img.titulo || `${nombre} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          Sin imágenes disponibles
        </div>
      )}

      {/* Título y badges */}
      <div className="mt-6">
        <h1 className="text-3xl font-extrabold text-slate-800">{nombre}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          {categoria && <span className="rounded-full bg-primario/10 px-3 py-1 text-sm font-medium text-primario">{categoria}</span>}
          {parroquia && <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">{parroquia}</span>}
        </div>
      </div>

      {/* Descripción */}
      {descripcion && (
        <p className="mt-5 leading-relaxed text-slate-600">{descripcion}</p>
      )}

      {/* Información rápida */}
      {infoRapida.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {infoRapida.map((item) => (
            <div key={item.etiqueta} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.etiqueta}</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{item.valor}</p>
            </div>
          ))}
        </div>
      )}

      {/* Cómo llegar */}
      {comoLlegar.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-slate-800">Cómo llegar</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {comoLlegar.map((item) => (
              <div key={item.etiqueta} className="flex justify-between rounded-xl bg-white p-4 ring-1 ring-slate-200">
                <span className="text-sm text-slate-500">{item.etiqueta}</span>
                <span className="text-sm font-medium text-slate-700">{item.valor}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Servicios */}
      {servicios.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-slate-800">Servicios disponibles</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {servicios.map((s, i) => (
              <span key={i} className="rounded-full bg-slate-100 px-4 py-1.5 text-sm text-slate-700">{s}</span>
            ))}
          </div>
        </section>
      )}

      {/* Actividades */}
      {actividades.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-slate-800">Actividades</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {actividades.map((a, i) => (
              <span key={i} className="rounded-full bg-secundario/15 px-4 py-1.5 text-sm font-medium text-slate-700">{a}</span>
            ))}
          </div>
        </section>
      )}

      {/* Ubicación */}
      {(atractivo.latitud != null && atractivo.longitud != null) && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-slate-800">Ubicación</h2>
          {atractivo.direccion && <p className="mt-1 text-sm text-slate-500">{atractivo.direccion}</p>}
          <div className="mt-4">
            <MiniMapa lat={atractivo.latitud} lng={atractivo.longitud} nombre={nombre} />
            <div className="mt-3">
              <BotonComoLlegar lat={atractivo.latitud} lng={atractivo.longitud} />
            </div>
          </div>
        </section>
      )}

      {/* Emprendimientos cercanos (clicables, con imagen arriba) */}
      {cercanos.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-slate-800">Emprendimientos cercanos</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cercanos.map((e, i) => <TarjetaCercano key={i} tipo="emprendimiento" item={e} />)}
          </div>
        </section>
      )}

      <div className="mt-12">
        <Link to="/atractivos" className="text-sm font-medium text-primario hover:underline">
          ← Volver al catálogo de atractivos
        </Link>
      </div>
    </div>
  );
}

export default FichaAtractivo;