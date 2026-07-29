/**
 * Panel lateral de filtros (mismo estilo que el catálogo de atractivos / mockup GAD).
 * secciones: [{ id, titulo, opciones: [{ valor, etiqueta }], valorSeleccionado, onToggle }]
 */
function FiltroCatalogoSidebar({
  busqueda,
  onBusquedaChange,
  placeholderBusqueda = 'Buscar...',
  secciones = [],
  hayFiltros = false,
  onLimpiar,
}) {
  return (
    <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80 lg:sticky lg:top-24">
      <h2 className="text-sm font-extrabold uppercase tracking-wide text-slate-900">
        Filtrar resultados
      </h2>

      <div className="mt-5">
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
          Buscar
        </label>
        <input
          type="search"
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          placeholder={placeholderBusqueda}
          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primario focus:ring-1 focus:ring-primario"
        />
      </div>

      {secciones.map((sec) => (
        sec.opciones?.length > 0 ? (
          <div key={sec.id} className="mt-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              {sec.titulo}
            </p>
            <ul className="space-y-2">
              {sec.opciones.map((op) => {
                const valor = typeof op === 'string' ? op : op.valor;
                const etiqueta = typeof op === 'string' ? op : op.etiqueta;
                const checked = sec.valorSeleccionado === valor;
                return (
                  <li key={valor}>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => sec.onToggle(valor)}
                        className="h-4 w-4 rounded border-slate-300 text-primario focus:ring-primario"
                      />
                      <span>{etiqueta}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null
      ))}

      <div className="mt-6 rounded-xl bg-primario/5 px-3 py-2.5 text-center text-xs font-semibold text-primario">
        Los filtros se aplican al instante
      </div>
      {hayFiltros && onLimpiar && (
        <button
          type="button"
          onClick={onLimpiar}
          className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Limpiar filtros
        </button>
      )}
    </aside>
  );
}

export default FiltroCatalogoSidebar;
