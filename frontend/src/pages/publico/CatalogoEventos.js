import { useEffect, useMemo, useState } from 'react';
import { listarEventos } from '../../services/eventos.service';
import TarjetaEvento, { estadoEvento } from '../../components/publico/TarjetaEvento';

// P-08 — Eventos turísticos (/eventos)
function CatalogoEventos() {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [categoria, setCategoria] = useState('');
  const [estado, setEstado] = useState('');

  useEffect(() => {
    let activo = true;
    listarEventos()
      .then((datos) => { if (activo) { setEventos(datos); setCargando(false); } })
      .catch((e) => { if (activo) { setError(e.message); setCargando(false); } });
    return () => { activo = false; };
  }, []);

  const categorias = useMemo(
    () => [...new Set(eventos.map((e) => e.categoria).filter(Boolean))].sort(),
    [eventos]
  );

  const filtrados = useMemo(() => {
    return eventos.filter((e) => {
      const coincideCategoria = !categoria || e.categoria === categoria;
      const coincideEstado = !estado || estadoEvento(e.fecha_inicio, e.fecha_fin) === estado;
      return coincideCategoria && coincideEstado;
    });
  }, [eventos, categoria, estado]);

  const hayFiltros = categoria || estado;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800">Eventos en Pelileo</h1>
        <p className="mt-2 text-slate-500">
          {cargando ? 'Cargando...' : `${filtrados.length} evento(s)`}
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <div className="min-w-[160px]">
          <label className="mb-1 block text-xs font-semibold text-slate-500">Categoría</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primario focus:ring-1 focus:ring-primario"
          >
            <option value="">Todas</option>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="min-w-[160px]">
          <label className="mb-1 block text-xs font-semibold text-slate-500">Estado</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primario focus:ring-1 focus:ring-primario"
          >
            <option value="">Todos</option>
            <option value="Próximo">Próximos</option>
            <option value="En curso">En curso</option>
            <option value="Finalizado">Finalizados</option>
          </select>
        </div>
        {hayFiltros && (
          <button
            onClick={() => { setCategoria(''); setEstado(''); }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">{error}</div>}

      {cargando && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100" />)}
        </div>
      )}

      {!cargando && !error && filtrados.length === 0 && (
        <div className="rounded-2xl bg-slate-50 py-16 text-center ring-1 ring-slate-200">
          <p className="text-lg font-semibold text-slate-700">No hay eventos para mostrar</p>
          <p className="mt-1 text-sm text-slate-500">Aún no se han publicado eventos o el filtro no coincide.</p>
        </div>
      )}

      {!cargando && !error && filtrados.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((e) => <TarjetaEvento key={e.id} evento={e} />)}
        </div>
      )}
    </div>
  );
}

export default CatalogoEventos;