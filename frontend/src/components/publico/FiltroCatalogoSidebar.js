/**
 * Panel lateral de filtros (mismo estilo que el catálogo de atractivos / mockup GAD).
 * En escritorio queda fijo al hacer scroll y las listas largas se desplazan dentro del panel.
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
    <aside className="flex h-fit flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-hidden">
      <div className="shrink-0">
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
      </div>

      <div className="mt-4 min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain pr-1">
        {secciones.map((sec) =>
          sec.opciones?.length > 0 ? (
            <div key={sec.id}>
              <p className="mb-2 sticky top-0 z-[1] bg-white py-1 text-xs font-bold uppercase tracking-wide text-slate-500">
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
        )}
      </div>

      <div className="mt-4 shrink-0 border-t border-slate-100 pt-4">
        <div className="rounded-xl bg-primario/5 px-3 py-2.5 text-center text-xs font-semibold text-primario">
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
      </div>
    </aside>
  );
}

export default FiltroCatalogoSidebar;
