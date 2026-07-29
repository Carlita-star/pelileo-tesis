import { useEffect, useMemo, useState } from 'react';
import { listarEventos } from '../../services/eventos.service';
import { obtenerCatalogosPublicos } from '../../services/catalogos.service';
import TarjetaEvento, { estadoEvento } from '../../components/publico/TarjetaEvento';
import FiltroCatalogoSidebar from '../../components/publico/FiltroCatalogoSidebar';

// P-08 — Eventos turísticos
// Categoría desde tabla categorias; estado = temporal según fechas del evento.
function CatalogoEventos() {
  const [eventos, setEventos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [estados, setEstados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [categoria, setCategoria] = useState('');
  const [estado, setEstado] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    let activo = true;
    Promise.all([listarEventos(), obtenerCatalogosPublicos()])
      .then(([datos, cats]) => {
        if (!activo) return;
        setEventos(datos);
        setCategorias(cats.categorias);
        setEstados(cats.estadosEvento);
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
    return eventos.filter((e) => {
      const coincideBusqueda = (e.nombre ?? '').toLowerCase().includes(busqueda.toLowerCase())
        || (e.descripcion ?? '').toLowerCase().includes(busqueda.toLowerCase())
        || (e.direccion ?? '').toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria = !categoria || e.categoria === categoria;
      const coincideEstado = !estado || estadoEvento(e.fecha_inicio, e.fecha_fin) === estado;
      return coincideBusqueda && coincideCategoria && coincideEstado;
    });
  }, [eventos, busqueda, categoria, estado]);

  const hayFiltros = Boolean(busqueda || categoria || estado);
  const limpiar = () => { setBusqueda(''); setCategoria(''); setEstado(''); };
  const toggle = (setter) => (valor) => setter((prev) => (prev === valor ? '' : valor));

  return (
    <div className="min-h-screen bg-[#f7f8f6]">
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 text-center">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Eventos y fiestas
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-500">
            Celebraciones, ferias y manifestaciones culturales del cantón San Pedro de Pelileo.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <FiltroCatalogoSidebar
            busqueda={busqueda}
            onBusquedaChange={setBusqueda}
            placeholderBusqueda="Nombre del evento..."
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
                id: 'estado',
                titulo: 'Estado',
                opciones: estados,
                valorSeleccionado: estado,
                onToggle: toggle(setEstado),
              },
            ]}
          />

          <div>
            <p className="mb-6 text-sm text-slate-500">
              {cargando ? 'Cargando...' : `${filtrados.length} evento(s) encontrado(s)`}
            </p>

            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
            )}

            {cargando && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            )}

            {!cargando && !error && filtrados.length === 0 && (
              <div className="rounded-2xl bg-white py-16 text-center ring-1 ring-slate-200">
                <p className="text-lg font-semibold text-slate-700">No hay eventos para mostrar</p>
                <p className="mt-1 text-sm text-slate-500">Prueba quitando algunos filtros.</p>
              </div>
            )}

            {!cargando && !error && filtrados.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filtrados.map((e) => <TarjetaEvento key={e.id} evento={e} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CatalogoEventos;
