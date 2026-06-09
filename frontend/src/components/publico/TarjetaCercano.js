import { Link } from 'react-router-dom';
import { urlImagen } from '../../services/media';
import { slugify } from '../../services/slug';

// Tarjeta clicable para los "cercanos": IMAGEN ARRIBA, info abajo.
// tipo: 'atractivo' | 'emprendimiento'
// item: { id, nombre, slug?, categoria, descripcion, imagen, distancia_referencial }
function TarjetaCercano({ tipo, item }) {
  if (!item) return null;
  const img = urlImagen(item.imagen);
  const destino =
    tipo === 'atractivo'
      ? `/atractivos/${item.slug ?? item.id}`
      : `/emprendimientos/${item.id}-${slugify(item.nombre)}`;

  return (
    <Link
      to={destino}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg hover:ring-primario"
    >
      {/* Imagen arriba */}
      <div className="h-36 w-full overflow-hidden bg-slate-100">
        {img ? (
          <img src={img} alt={item.nombre} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl font-black text-slate-300">
            {item.nombre?.charAt(0) ?? '?'}
          </div>
        )}
      </div>

      {/* Información abajo */}
      <div className="flex flex-1 flex-col p-4">
        <p className="font-semibold text-slate-800">{item.nombre}</p>
        {item.categoria && <p className="mt-0.5 text-sm font-medium text-primario">{item.categoria}</p>}
        {item.descripcion && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.descripcion}</p>}
        {item.distancia_referencial && (
          <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            a {item.distancia_referencial} km
          </p>
        )}
      </div>
    </Link>
  );
}

export default TarjetaCercano;