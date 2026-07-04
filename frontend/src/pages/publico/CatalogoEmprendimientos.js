import { useEffect, useMemo, useState } from 'react';
import { listarEmprendimientos } from '../../services/emprendimientos.service';
import TarjetaEmprendimientoDirectorio from '../../components/publico/TarjetaEmprendimientoDirectorio';

// P-06 — Catálogo de emprendimientos (/emprendimientos)
function CatalogoEmprendimientos() {
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [parroquia, setParroquia] = useState('');

  useEffect(() => {
    let activo = true;
    listarEmprendimientos()
      .then((datos) => { if (activo) { setItems(datos); setCargando(false); } })
      .catch((e) => { if (activo) { setError(e.message); setCargando(false); } });
    return () => { activo = false; };
  }, []);

  const parroquias = useMemo(
    () => [...new Set(items.map((e) => e.parroquia).filter(Boolean))].sort(),
    [items]
  );

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return items.filter((e) => {
      const coincideBusqueda = !termino
        || (e.nombre ?? '').toLowerCase().includes(termino)
        || (e.descripcion ?? '').toLowerCase().includes(termino)
        || (e.categoria ?? '').toLowerCase().includes(termino);
      const coincideParroquia = !parroquia || e.parroquia === parroquia;
      return coincideBusqueda && coincideParroquia;
    });
  }, [items, busqueda, parroquia]);

  const hayFiltros = busqueda || parroquia;
  const limpiar = () => { setBusqueda(''); setParroquia(''); };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800">Emprendimientos de Pelileo</h1>
        <p className="mt-2 text-slate-500">
          {cargando ? 'Cargando...' : `${filtrados.length} emprendimiento(s)`}
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-semibold text-slate-500">Buscar</label>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Nombre del emprendimiento..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primario focus:ring-1 focus:ring-primario"
          />
        </div>

        <div className="min-w-[160px]">
          <label className="mb-1 block text-xs font-semibold text-slate-500">Parroquia</label>
          <select
            value={parroquia}
            onChange={(e) => setParroquia(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primario focus:ring-1 focus:ring-primario"
          >
            <option value="">Todas</option>
            {parroquias.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {hayFiltros && (
          <button
            type="button"
            onClick={limpiar}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
      )}

      {cargando && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[420px] animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      )}

      {!cargando && !error && filtrados.length === 0 && (
        <div className="rounded-2xl bg-slate-50 py-16 text-center ring-1 ring-slate-200">
          <p className="text-lg font-semibold text-slate-700">No hay emprendimientos para mostrar</p>
          <p className="mt-1 text-sm text-slate-500">Prueba quitando algunos filtros.</p>
        </div>
      )}

      {!cargando && !error && filtrados.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((e) => (
            <TarjetaEmprendimientoDirectorio key={e.id} emprendimiento={e} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CatalogoEmprendimientos;
