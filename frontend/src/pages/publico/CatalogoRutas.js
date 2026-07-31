import { useEffect, useMemo, useState } from 'react';
import { listarRutas } from '../../services/rutas.service';
import {
  coincideDificultad,
  obtenerCatalogosPublicos,
} from '../../services/catalogos.service';
import TarjetaRuta from '../../components/publico/TarjetaRuta';
import FiltroCatalogoSidebar from '../../components/publico/FiltroCatalogoSidebar';

// P-04 — Catálogo de rutas (/rutas)
// Dificultad = valores del formulario admin; parroquia = tabla parroquias.
function CatalogoRutas() {
  const [rutas, setRutas] = useState([]);
  const [dificultades, setDificultades] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [dificultad, setDificultad] = useState('');
  const [parroquia, setParroquia] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    let activo = true;
    Promise.all([listarRutas(), obtenerCatalogosPublicos({ tipo: 'ruta' })])
      .then(([datos, cats]) => {
        if (!activo) return;
        setRutas(datos);
        setDificultades(cats.dificultades);
        setParroquias(cats.parroquias);
        setCargando(false);
      })
      .catch((e) => {
        if (activo) {
          setError(e.message);
          setCargando(false);
        }
      });
    return () => { activo = false; };
  }, []);

  const filtradas = useMemo(
    () => rutas.filter((r) => {
      const coincideBusqueda = (r.nombre ?? '').toLowerCase().includes(busqueda.toLowerCase())
        || (r.descripcion ?? '').toLowerCase().includes(busqueda.toLowerCase());
      const coincideDif = coincideDificultad(r.dificultad, dificultad);
      const coincideParroquia = !parroquia || r.parroquia === parroquia;
      return coincideBusqueda && coincideDif && coincideParroquia;
    }),
    [rutas, busqueda, dificultad, parroquia]
  );

  const hayFiltros = Boolean(busqueda || dificultad || parroquia);
  const limpiar = () => { setBusqueda(''); setDificultad(''); setParroquia(''); };
  const toggle = (setter) => (valor) => setter((prev) => (prev === valor ? '' : valor));

  return (
    <div className="min-h-screen bg-[#f7f8f6]">
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Rutas turísticas
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-500">
            Explora Pelileo y sus alrededores a través de rutas diseñadas para todos los viajeros.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <FiltroCatalogoSidebar
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            placeholderBusqueda="Nombre de la ruta..."
            hayFiltros={hayFiltros}
            onLimpiar={limpiar}
            secciones={[
              {
                id: 'dificultad',
                titulo: 'Dificultad',
                opciones: dificultades,
                valorSeleccionado: dificultad,
                onToggle: toggle(setDificultad),
              },
              {
                id: 'parroquia',
                titulo: 'Parroquia',
                opciones: parroquias.map((p) => ({ valor: p.nombre, etiqueta: p.nombre })),
                valorSeleccionado: parroquia,
                onToggle: toggle(setParroquia),
              },
            ]}
          />

          <div>
            <p className="mb-6 text-sm text-slate-500">
              {cargando ? 'Cargando...' : `${filtradas.length} ruta(s) encontrada(s)`}
            </p>

            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
            )}

            {cargando && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-[28rem] animate-pulse rounded-3xl bg-slate-100" />
                ))}
              </div>
            )}

            {!cargando && !error && filtradas.length === 0 && (
              <div className="rounded-2xl bg-white py-16 text-center ring-1 ring-slate-200">
                <p className="text-lg font-semibold text-slate-700">No hay rutas para mostrar</p>
                <p className="mt-1 text-sm text-slate-500">Prueba quitando algunos filtros.</p>
              </div>
            )}

            {!cargando && !error && filtradas.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtradas.map((r) => <TarjetaRuta key={r.id} ruta={r} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CatalogoRutas;
