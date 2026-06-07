import { useEffect, useMemo, useState } from 'react';
import { listarAtractivos } from '../../services/atractivos.service';
import TarjetaAtractivo from '../../components/publico/TarjetaAtractivo';

// P-02 — Catálogo de atractivos (/atractivos)
function CatalogoAtractivos() {
  const [atractivos, setAtractivos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('');
  const [parroquia, setParroquia] = useState('');

  useEffect(() => {
    let activo = true;
    listarAtractivos()
      .then((datos) => { if (activo) { setAtractivos(datos); setCargando(false); } })
      .catch((e) => { if (activo) { setError(e.message); setCargando(false); } });
    return () => { activo = false; };
  }, []);

  const categorias = useMemo(
    () => [...new Set(atractivos.map((a) => a.categoria).filter(Boolean))].sort(),
    [atractivos]
  );
  const parroquias = useMemo(
    () => [...new Set(atractivos.map((a) => a.parroquia).filter(Boolean))].sort(),
    [atractivos]
  );

  const filtrados = useMemo(() => {
    return atractivos.filter((a) => {
      const coincideBusqueda = (a.nombre ?? '').toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria = !categoria || a.categoria === categoria;
      const coincideParroquia = !parroquia || a.parroquia === parroquia;
      return coincideBusqueda && coincideCategoria && coincideParroquia;
    });
  }, [atractivos, busqueda, categoria, parroquia]);

  const hayFiltros = busqueda || categoria || parroquia;
  const limpiar = () => { setBusqueda(''); setCategoria(''); setParroquia(''); };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800">Atractivos turísticos de Pelileo</h1>
        <p className="mt-2 text-slate-500">
          {cargando ? 'Cargando...' : `${filtrados.length} atractivo(s) encontrado(s)`}
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-semibold text-slate-500">Buscar</label>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Nombre del atractivo..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primario focus:ring-1 focus:ring-primario"
          />
        </div>

        <div className="min-w-[160px]">
          <label className="mb-1 block text-xs font-semibold text-slate-500">Categoría</label>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primario focus:ring-1 focus:ring-primario">
            <option value="">Todas</option>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="min-w-[160px]">
          <label className="mb-1 block text-xs font-semibold text-slate-500">Parroquia</label>
          <select value={parroquia} onChange={(e) => setParroquia(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primario focus:ring-1 focus:ring-primario">
            <option value="">Todas</option>
            {parroquias.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {hayFiltros && (
          <button onClick={limpiar} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">
            Limpiar filtros
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
      )}

      {cargando && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (<div key={i} className="h-72 animate-pulse rounded-2xl bg-slate-100" />))}
        </div>
      )}

      {!cargando && !error && filtrados.length === 0 && (
        <div className="rounded-2xl bg-slate-50 py-16 text-center ring-1 ring-slate-200">
          <p className="text-lg font-semibold text-slate-700">No se encontraron atractivos</p>
          <p className="mt-1 text-sm text-slate-500">Prueba quitando algunos filtros.</p>
        </div>
      )}

      {!cargando && !error && filtrados.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((a) => (<TarjetaAtractivo key={a.id} atractivo={a} />))}
        </div>
      )}
    </div>
  );
}

export default CatalogoAtractivos;