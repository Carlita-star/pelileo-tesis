import { urlImagen } from '../../services/media';

// Calcula el estado del evento comparando las fechas con hoy.
export function estadoEvento(inicio, fin) {
  const ahora = new Date();
  const i = inicio ? new Date(inicio) : null;
  const f = fin ? new Date(fin) : null;
  if (i && ahora < i) return 'Próximo';
  if (f && ahora > f) return 'Finalizado';
  if (i && ahora >= i && (!f || ahora <= f)) return 'En curso';
  return null;
}

function colorEstado(estado) {
  if (estado === 'Próximo') return 'bg-amber-100 text-amber-700';
  if (estado === 'En curso') return 'bg-green-100 text-green-700';
  if (estado === 'Finalizado') return 'bg-slate-200 text-slate-500';
  return 'bg-slate-100 text-slate-600';
}

function fmtFecha(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('es-EC', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return iso;
  }
}

function TarjetaEvento({ evento }) {
  const { nombre, categoria, fecha_inicio, fecha_fin, organizador, direccion, costo } = evento;
  const imagen = urlImagen(evento.imagen);
  const estado = estadoEvento(fecha_inicio, fecha_fin);
  const ini = fmtFecha(fecha_inicio);
  const fin = fmtFecha(fecha_fin);
  const precio = costo == null || Number(costo) === 0 ? 'Entrada libre' : `$ ${costo}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="relative h-40 w-full overflow-hidden bg-slate-100">
        {imagen ? (
          <img src={imagen} alt={nombre} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-4xl font-black text-slate-300">
            {nombre?.charAt(0) ?? 'E'}
          </div>
        )}
        {estado && (
          <span className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${colorEstado(estado)}`}>{estado}</span>
        )}
        {categoria && (
          <span className="absolute left-3 top-3 rounded-full bg-primario px-3 py-1 text-xs font-semibold text-white">{categoria}</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-slate-800">{nombre}</h3>

        {ini && (
          <p className="mt-2 text-sm text-slate-600">
            {ini}{fin && fin !== ini ? ` — ${fin}` : ''}
          </p>
        )}
        {direccion && <p className="mt-1 text-sm text-slate-500">{direccion}</p>}
        {organizador && <p className="mt-1 text-xs text-slate-400">Organiza: {organizador}</p>}

        <span className="mt-3 inline-block w-fit rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{precio}</span>
      </div>
    </article>
  );
}

export default TarjetaEvento;