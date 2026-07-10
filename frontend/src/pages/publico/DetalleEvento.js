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
    <div className="mx-auto max-w-4xl px-4 py-10">
      {imagenes.length > 0 && (
        <GaleriaDetalle imagenes={imagenes} titulo={evento.nombre} />
      )}

      <header className="mt-8">
        <div className="flex flex-wrap items-center gap-2">
          {evento.categoria && (
            <span className="rounded-full bg-primario/10 px-3 py-1 text-xs font-semibold text-primario">{evento.categoria}</span>
          )}
          {estado && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{estado}</span>
          )}
        </div>
        <h1 className="mt-3 text-3xl font-extrabold text-slate-900">{evento.nombre}</h1>
        {ini && (
          <p className="mt-3 text-slate-600">
            {ini}{fin && fin !== ini ? ` — ${fin}` : ''}
          </p>
        )}
        <p className="mt-2 inline-block rounded-md bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-600">{precio}</p>
      </header>

      {evento.descripcion && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-slate-800">Descripción</h2>
          <p className="mt-3 whitespace-pre-line text-slate-600 leading-relaxed">{evento.descripcion}</p>
        </section>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {evento.organizador && (
          <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="text-xs font-semibold uppercase text-slate-500">Organizador</p>
            <p className="mt-1 font-medium text-slate-800">{evento.organizador}</p>
          </div>
        )}
        {evento.contacto && (
          <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
            <p className="text-xs font-semibold uppercase text-slate-500">Contacto</p>
            <p className="mt-1 font-medium text-slate-800">{evento.contacto}</p>
          </div>
        )}
        {evento.direccion && (
          <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 sm:col-span-2">
            <p className="text-xs font-semibold uppercase text-slate-500">Ubicación</p>
            <p className="mt-1 font-medium text-slate-800">{evento.direccion}</p>
          </div>
        )}
      </section>

      {evento.latitud != null && evento.longitud != null && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-slate-800">Mapa</h2>
          <div className="mt-4">
            <MiniMapa lat={evento.latitud} lng={evento.longitud} nombre={evento.nombre} />
          </div>
          <div className="mt-3">
            <BotonComoLlegar lat={evento.latitud} lng={evento.longitud} />
          </div>
        </section>
      )}

      <SeccionResenas entidadTipo="evento" entidadId={evento.id} />

      <div className="detalle-volver-bar">
        <Link to="/eventos" className="text-sm font-medium text-primario hover:underline">← Volver a eventos</Link>
      </div>
    </div>
  );
}

export default DetalleEvento;
