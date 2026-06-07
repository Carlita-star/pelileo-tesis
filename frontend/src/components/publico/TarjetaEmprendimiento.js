import { Link } from 'react-router-dom';
import { urlImagen } from '../../services/media';
import { slugify } from '../../services/slug';

function TarjetaEmprendimiento({ emprendimiento }) {
  const { id, nombre, categoria, parroquia, telefono } = emprendimiento;
  const imagen = urlImagen(emprendimiento.imagen);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        {imagen ? (
          <img src={imagen} alt={nombre} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-4xl font-black text-slate-300">
            {nombre?.charAt(0) ?? 'E'}
          </div>
        )}
        {categoria && (
          <span className="absolute left-3 top-3 rounded-full bg-primario px-3 py-1 text-xs font-semibold text-white shadow">
            {categoria}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold text-slate-800">{nombre}</h3>

        {parroquia && (
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
            <svg className="h-4 w-4 text-primario" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {parroquia}
          </p>
        )}

        {telefono && <p className="mt-1 text-sm text-slate-500">Tel: {telefono}</p>}

        <Link
          to={`/emprendimientos/${id}-${slugify(nombre)}`}
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white transition hover:bg-primario-oscuro"
        >
          Ver detalle
        </Link>
      </div>
    </article>
  );
}

export default TarjetaEmprendimiento;