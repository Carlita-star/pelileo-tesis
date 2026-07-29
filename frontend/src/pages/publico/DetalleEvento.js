import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerEventoPorId } from '../../services/eventos.service';
import GaleriaDetalle from '../../components/publico/GaleriaDetalle';
import { urlImagen } from '../../services/media';
import MiniMapa from '../../components/publico/MiniMapa';
import BotonComoLlegar from '../../components/publico/ComoLlegar';
import SeccionResenas from '../../components/publico/SeccionResenas';
import '../../components/publico/resenas-publico.css';
import { estadoEvento } from '../../components/publico/TarjetaEvento';

function fmtFecha(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

function DetalleEvento() {
  const { id } = useParams();
  const eventoId = parseInt(String(id).split('-')[0], 10);
  const [evento, setEvento] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    obtenerEventoPorId(eventoId)
      .then((datos) => { if (activo) { setEvento(datos); setCargando(false); } })
      .catch((e) => { if (activo) { setError(e.message); setCargando(false); } });
    return () => { activo = false; };
  }, [eventoId]);

  if (cargando) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
        <div className="mt-6 h-8 w-1/2 animate-pulse rounded bg-slate-100" />
      </div>
    );
  }

  if (error || !evento) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-800">No se encontró el evento</h1>
        <p className="mt-2 text-slate-500">{error || 'Es posible que no exista o no esté publicado.'}</p>
        <Link to="/eventos" className="mt-6 inline-block rounded-lg bg-primario px-5 py-2 font-semibold text-white transition hover:bg-primario-oscuro">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const imagenes = (evento.multimedia?.length
    ? evento.multimedia.map((m) => urlImagen(m.archivo || m.url)).filter(Boolean)
    : [urlImagen(evento.imagen)].filter(Boolean));
  const estado = estadoEvento(evento.fecha_inicio, evento.fecha_fin);
  const ini = fmtFecha(evento.fecha_inicio);
  const fin = fmtFecha(evento.fecha_fin);
  const precio = evento.costo == null || Number(evento.costo) === 0 ? 'Entrada libre' : `$ ${evento.costo}`;

  return (
    <div className="min-h-screen bg-[#f7f8f6]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <nav className="mb-5 text-sm text-slate-500">
          <Link to="/" className="hover:text-primario">Inicio</Link>
          <span className="mx-2">/</span>
          <Link to="/eventos" className="hover:text-primario">Eventos</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-700">{evento.nombre}</span>
        </nav>

        {imagenes.length > 0 ? (
          <GaleriaDetalle imagenes={imagenes} titulo={evento.nombre} />
        ) : (
          <div className="flex h-56 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-amber-50 to-slate-100 text-slate-400">
            <span className="text-4xl font-black text-primario/20">{evento.nombre?.charAt(0) ?? 'E'}</span>
            <span className="mt-2 text-sm">Fotos próximamente</span>
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 sm:p-8">
            <div className="flex flex-wrap gap-2">
              {evento.categoria && (
                <span className="rounded-full bg-primario/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-primario">
                  {evento.categoria}
                </span>
              )}
              {estado && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {estado}
                </span>
              )}
            </div>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {evento.nombre}
            </h1>
            {ini && (
              <p className="mt-3 text-slate-600">
                {ini}{fin && fin !== ini ? ` — ${fin}` : ''}
              </p>
            )}
            {evento.descripcion && (
              <p className="mt-5 whitespace-pre-line leading-relaxed text-slate-600">{evento.descripcion}</p>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Información</p>
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase text-slate-400">Entrada</p>
                  <p className="text-sm font-semibold text-slate-800">{precio}</p>
                </div>
                {evento.organizador && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase text-slate-400">Organizador</p>
                    <p className="text-sm font-medium text-slate-800">{evento.organizador}</p>
                  </div>
                )}
                {evento.contacto && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase text-slate-400">Contacto</p>
                    <p className="text-sm font-medium text-slate-800">{evento.contacto}</p>
                  </div>
                )}
                {evento.direccion && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase text-slate-400">Lugar</p>
                    <p className="text-sm text-slate-700">{evento.direccion}</p>
                  </div>
                )}
              </div>
              {evento.latitud != null && evento.longitud != null && (
                <div className="mt-4">
                  <MiniMapa lat={evento.latitud} lng={evento.longitud} nombre={evento.nombre} />
                  <div className="mt-3">
                    <BotonComoLlegar lat={evento.latitud} lng={evento.longitud} />
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        <SeccionResenas entidadTipo="evento" entidadId={evento.id} />

        <div className="detalle-volver-bar mt-8">
          <Link to="/eventos" className="text-sm font-medium text-primario hover:underline">
            ← Volver a eventos
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DetalleEvento;
