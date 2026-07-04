import { useEffect, useMemo, useState } from 'react';
import { listarRutas } from '../../services/rutas.service';
import TarjetaRuta from '../../components/publico/TarjetaRuta';

// P-04 — Catálogo de rutas (/rutas)
function CatalogoRutas() {
  const [rutas, setRutas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [dificultad, setDificultad] = useState('');

  useEffect(() => {
    let activo = true;
    listarRutas()
      .then((datos) => { if (activo) { setRutas(datos); setCargando(false); } })
      .catch((e) => { if (activo) { setError(e.message); setCargando(false); } });
    return () => { activo = false; };
  }, []);

  // Las opciones del filtro salen de los propios datos.
  const dificultades = useMemo(
    () => [...new Set(rutas.map((r) => r.dificultad).filter(Boolean))],
    [rutas]
  );

  const filtradas = useMemo(
    () => rutas.filter((r) => !dificultad || r.dificultad === dificultad),
    [rutas, dificultad]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800">Rutas turísticas</h1>
        <p className="mt-2 text-slate-500">
          {cargando ? 'Cargando...' : `${filtradas.length} ruta(s) disponible(s)`}
        </p>
      </div>

      {/* Filtro por dificultad */}
      {dificultades.length > 0 && (
        <div className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <div className="min-w-[200px]">
            <label className="mb-1 block text-xs font-semibold text-slate-500">Dificultad</label>
            <select
              value={dificultad}
              onChange={(e) => setDificultad(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primario focus:ring-1 focus:ring-primario"
            >
              <option value="">Todas</option>
              {dificultades.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {dificultad && (
            <button
              onClick={() => setDificultad('')}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Limpiar filtro
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
      )}

      {cargando && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-[28rem] animate-pulse rounded-3xl bg-slate-100" />)}
        </div>
      )}

      {!cargando && !error && filtradas.length === 0 && (
        <div className="rounded-2xl bg-slate-50 py-16 text-center ring-1 ring-slate-200">
          <p className="text-lg font-semibold text-slate-700">No hay rutas para mostrar</p>
          <p className="mt-1 text-sm text-slate-500">Aún no se han publicado rutas o el filtro no coincide.</p>
        </div>
      )}

      {!cargando && !error && filtradas.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtradas.map((r) => <TarjetaRuta key={r.id} ruta={r} />)}
        </div>
      )}
    </div>
  );
}

export default CatalogoRutas;