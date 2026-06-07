import { Link } from 'react-router-dom';
import { urlImagen } from '../../services/media';
import { slugify } from '../../services/slug';

// Color del badge según la dificultad (verde/ámbar/rojo).
export function colorDificultad(d) {
  const v = (d || '').toLowerCase();
  if (v.includes('faci') || v.includes('fáci')) return 'bg-green-100 text-green-700';
  if (v.includes('moder')) return 'bg-amber-100 text-amber-700';
  if (v.includes('dif')) return 'bg-red-100 text-red-700';
  return 'bg-slate-100 text-slate-600';
}

function TarjetaRuta({ ruta }) {
  const { id, nombre, descripcion, distancia_km, duracion_estimada, dificultad, num_atractivos } = ruta;
  const imagen = urlImagen(ruta.imagen);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        {imagen ? (
          <img src={imagen} alt={nombre} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-4xl font-black text-slate-300">
            {nombre?.charAt(0) ?? 'R'}
          </div>
        )}
        {dificultad && (
          <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${colorDificultad(dificultad)}`}>
            {dificultad}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-slate-800">{nombre}</h3>
        {descripcion && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{descripcion}</p>}

        <div className="mt-3 flex flex-wrap gap-2">
          {distancia_km != null && (
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{distancia_km} km</span>
          )}
          {duracion_estimada && (
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{duracion_estimada}</span>
          )}
          {num_atractivos != null && (
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{num_atractivos} atractivos</span>
          )}
        </div>

        <Link
          to={`/rutas/${id}-${slugify(nombre)}`}
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white transition hover:bg-primario-oscuro"
        >
          Ver ruta
        </Link>
      </div>
    </article>
  );
}

export default TarjetaRuta;