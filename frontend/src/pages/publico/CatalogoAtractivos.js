import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listarAtractivos } from '../../services/atractivos.service';
import { obtenerCatalogosPublicos } from '../../services/catalogos.service';
import TarjetaAtractivo from '../../components/publico/TarjetaAtractivo';
import FiltroCatalogoSidebar from '../../components/publico/FiltroCatalogoSidebar';

const PAGE_SIZE = 9;

// P-02 — Catálogo de atractivos (/atractivos)
// Filtros desde tablas categorias / parroquias (misma fuente que el admin).
function CatalogoAtractivos() {
  const [searchParams] = useSearchParams();
  const [atractivos, setAtractivos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [visibles, setVisibles] = useState(PAGE_SIZE);

  const [busqueda, setBusqueda] = useState(() => searchParams.get('q') || '');
  const [categoria, setCategoria] = useState('');
  const [parroquia, setParroquia] = useState('');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q != null) setBusqueda(q);
  }, [searchParams]);

  useEffect(() => {
    let activo = true;
    Promise.all([listarAtractivos(), obtenerCatalogosPublicos()])
      .then(([datos, cats]) => {
        if (!activo) return;
        setAtractivos(datos);
        setCategorias(cats.categorias);
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

  const filtrados = useMemo(() => {
    return atractivos.filter((a) => {
      const coincideBusqueda = (a.nombre ?? '').toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria = !categoria || a.categoria === categoria;
      const coincideParroquia = !parroquia || a.parroquia === parroquia;
      return coincideBusqueda && coincideCategoria && coincideParroquia;
    });
  }, [atractivos, busqueda, categoria, parroquia]);

  useEffect(() => {
    setVisibles(PAGE_SIZE);
  }, [busqueda, categoria, parroquia]);

  const hayFiltros = Boolean(busqueda || categoria || parroquia);
  const limpiar = () => { setBusqueda(''); setCategoria(''); setParroquia(''); };
  const pagina = filtrados.slice(0, visibles);
  const hayMas = visibles < filtrados.length;
  const toggle = (setter) => (valor) => setter((prev) => (prev === valor ? '' : valor));

  return (
    <div className="min-h-screen bg-[#f7f8f6]">
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <h1 className="font-display text-3xl font-extrabold uppercase tracking-tight text-slate-900 sm:text-4xl">
            Explora Pelileo, Ecuador
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-500">
            Descubre maravillas naturales, cultura y aventura en el cantón San Pedro de Pelileo
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <FiltroCatalogoSidebar
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            placeholderBusqueda="Nombre del atractivo..."
            hayFiltros={hayFiltros}
            onLimpiar={limpiar}
            secciones={[
              {
                id: 'categoria',
                titulo: 'Categoría',
                opciones: categorias.map((c) => ({ valor: c.nombre, etiqueta: c.nombre })),
                valorSeleccionado: categoria,
                onToggle: toggle(setCategoria),
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
              {cargando ? 'Cargando...' : `${filtrados.length} atractivo(s) encontrado(s)`}
            </p>

            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
            )}

            {cargando && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-[26rem] animate-pulse rounded-[1.75rem] bg-slate-100" />
                ))}
              </div>
            )}

            {!cargando && !error && filtrados.length === 0 && (
              <div className="rounded-2xl bg-white py-16 text-center ring-1 ring-slate-200">
                <p className="text-lg font-semibold text-slate-700">No se encontraron atractivos</p>
                <p className="mt-1 text-sm text-slate-500">Prueba quitando algunos filtros.</p>
              </div>
            )}

            {!cargando && !error && filtrados.length > 0 && (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {pagina.map((a) => (
                    <TarjetaAtractivo key={a.id} atractivo={a} />
                  ))}
                </div>
                {hayMas && (
                  <div className="mt-10 text-center">
                    <button
                      type="button"
                      onClick={() => setVisibles((v) => v + PAGE_SIZE)}
                      className="rounded-full bg-primario px-8 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-primario-oscuro"
                    >
                      Cargar más
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CatalogoAtractivos;
