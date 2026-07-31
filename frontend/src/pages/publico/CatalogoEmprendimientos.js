import { useEffect, useMemo, useState } from 'react';
import { listarEmprendimientos } from '../../services/emprendimientos.service';
import { obtenerCatalogosPublicos } from '../../services/catalogos.service';
import TarjetaEmprendimientoDirectorio from '../../components/publico/TarjetaEmprendimientoDirectorio';
import FiltroCatalogoSidebar from '../../components/publico/FiltroCatalogoSidebar';

// P-06 — Directorio de emprendimientos
// Categoría y parroquia desde tablas de catálogo (mismas del admin).
function CatalogoEmprendimientos() {
  const [items, setItems] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [parroquia, setParroquia] = useState('');
  const [categoria, setCategoria] = useState('');

  useEffect(() => {
    let activo = true;
    Promise.all([listarEmprendimientos(), obtenerCatalogosPublicos({ tipo: 'emprendimiento' })])
      .then(([datos, cats]) => {
        if (!activo) return;
        setItems(datos);
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
    const termino = busqueda.trim().toLowerCase();
    return items.filter((e) => {
      const coincideBusqueda = !termino
        || (e.nombre ?? '').toLowerCase().includes(termino)
        || (e.descripcion ?? '').toLowerCase().includes(termino)
        || (e.categoria ?? '').toLowerCase().includes(termino);
      const coincideParroquia = !parroquia || e.parroquia === parroquia;
      const coincideCategoria = !categoria || e.categoria === categoria;
      return coincideBusqueda && coincideParroquia && coincideCategoria;
    });
  }, [items, busqueda, parroquia, categoria]);

  const hayFiltros = Boolean(busqueda || parroquia || categoria);
  const limpiar = () => { setBusqueda(''); setParroquia(''); setCategoria(''); };
  const toggle = (setter) => (valor) => setter((prev) => (prev === valor ? '' : valor));

  return (
    <div className="min-h-screen bg-[#f7f8f6]">
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Directorio turístico
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-500">
            Hospedaje, alimentación, complejos, artesanías y guianza en Pelileo.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <FiltroCatalogoSidebar
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            placeholderBusqueda="Nombre del emprendimiento..."
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
              {cargando ? 'Cargando...' : `${filtrados.length} resultado(s) encontrado(s)`}
            </p>

            {error && (
              <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
            )}

            {cargando && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-[420px] animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            )}

            {!cargando && !error && filtrados.length === 0 && (
              <div className="rounded-2xl bg-white py-16 text-center ring-1 ring-slate-200">
                <p className="text-lg font-semibold text-slate-700">No hay resultados en este directorio</p>
                <p className="mt-1 text-sm text-slate-500">
                  Prueba otra categoría o limpia los filtros.
                </p>
              </div>
            )}

            {!cargando && !error && filtrados.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtrados.map((e) => (
                  <TarjetaEmprendimientoDirectorio key={e.id} emprendimiento={e} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CatalogoEmprendimientos;
