import { useMemo } from 'react';

const RUTAS_COMUNES = ['/', '/atractivos', '/rutas', '/emprendimientos', '/eventos', '/mapa'];

function emptyMenuItem(orden = 0) {
  return {
    id: null,
    nombre: '',
    ruta: '/',
    icono: '',
    orden,
    visible: true,
    menu_padre_id: null,
    abierto_nueva_pestana: false,
  };
}

function buildPreviewTree(menus) {
  const visibles = menus.filter((m) => m.visible !== false && m.nombre?.trim());
  const roots = visibles
    .filter((m) => !m.menu_padre_id)
    .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

  return roots.map((root) => ({
    ...root,
    children: visibles
      .filter((m) => m.menu_padre_id === root.id)
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)),
  }));
}

function MenuNavegacionTab({ menus, setMenus, saving, onSubmit }) {
  const padresOpciones = useMemo(
    () => menus.filter((m) => m.id && !m.menu_padre_id),
    [menus],
  );

  const previewTree = useMemo(() => buildPreviewTree(menus), [menus]);

  const updateItem = (idx, patch) => {
    setMenus((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  };

  const moverMenu = (index, dir) => {
    setMenus((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((m, i) => ({ ...m, orden: i }));
    });
  };

  const eliminarItem = (idx) => {
    const item = menus[idx];
    if (!window.confirm(`¿Eliminar "${item.nombre || 'este ítem'}" del menú?`)) return;
    setMenus((prev) => {
      const removedId = item.id;
      return prev
        .filter((_, i) => i !== idx)
        .map((m) => (removedId && m.menu_padre_id === removedId ? { ...m, menu_padre_id: null } : m))
        .map((m, i) => ({ ...m, orden: i }));
    });
  };

  const agregarItem = () => {
    setMenus((prev) => [...prev, emptyMenuItem(prev.length)]);
  };

  return (
    <form
      className="catalog-form config-form menu-config"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <p className="menu-config__intro">
        Configure los enlaces del portal público. Use la columna <strong>Submenú de</strong> para
        agrupar opciones bajo un ítem principal. Guarde al finalizar.
      </p>

      <section className="menu-config__panel">
        <div className="menu-config__toolbar">
          <h3 className="menu-config__panel-title">Ítems del menú</h3>
          <button type="button" className="secondary-button" onClick={agregarItem}>
            + Agregar ítem
          </button>
        </div>

        {menus.length === 0 ? (
          <p className="menu-config__empty">No hay ítems en el menú. Agregue el primero con el botón de arriba.</p>
        ) : (
          <div className="menu-config__table-wrap">
            <table className="menu-config__table">
              <colgroup>
                <col className="menu-config__col-order" />
                <col className="menu-config__col-name" />
                <col className="menu-config__col-route" />
                <col className="menu-config__col-parent" />
                <col className="menu-config__col-visible" />
                <col className="menu-config__col-actions" />
              </colgroup>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Ruta</th>
                  <th>Submenú de</th>
                  <th>Visible</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {menus.map((item, idx) => {
                  const esSubmenu = Boolean(item.menu_padre_id);
                  return (
                    <tr
                      key={item.id || `menu-${idx}`}
                      className={esSubmenu ? 'menu-config__row--child' : ''}
                    >
                      <td className="menu-config__col-order">
                        <span className="menu-config__order-badge">{idx + 1}</span>
                      </td>
                      <td>
                        <input
                          type="text"
                          className="menu-config__input"
                          placeholder="Ej. Atractivos"
                          aria-label={`Nombre del ítem ${idx + 1}`}
                          value={item.nombre || ''}
                          onChange={(e) => updateItem(idx, { nombre: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="menu-config__input"
                          list="menu-rutas-sugeridas"
                          placeholder="/atractivos"
                          aria-label={`Ruta del ítem ${idx + 1}`}
                          value={item.ruta || ''}
                          onChange={(e) => updateItem(idx, { ruta: e.target.value })}
                        />
                      </td>
                      <td>
                        <select
                          className="menu-config__input"
                          aria-label={`Menú padre del ítem ${idx + 1}`}
                          value={item.menu_padre_id || ''}
                          onChange={(e) => updateItem(idx, {
                            menu_padre_id: e.target.value ? Number(e.target.value) : null,
                          })}
                        >
                          <option value="">Nivel principal</option>
                          {padresOpciones
                            .filter((p) => p.id !== item.id)
                            .map((p) => (
                              <option key={p.id} value={p.id}>{p.nombre || `Ítem ${p.id}`}</option>
                            ))}
                        </select>
                      </td>
                      <td className="menu-config__col-visible">
                        <input
                          type="checkbox"
                          className="menu-config__checkbox"
                          aria-label={`Visible en portal, ítem ${idx + 1}`}
                          checked={item.visible !== false}
                          onChange={(e) => updateItem(idx, { visible: e.target.checked })}
                        />
                      </td>
                      <td className="menu-config__col-actions">
                        <div className="menu-config__actions">
                          <button
                            type="button"
                            className="menu-config__action-btn"
                            title="Subir"
                            disabled={idx === 0}
                            onClick={() => moverMenu(idx, -1)}
                            aria-label="Subir"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className="menu-config__action-btn"
                            title="Bajar"
                            disabled={idx === menus.length - 1}
                            onClick={() => moverMenu(idx, 1)}
                            aria-label="Bajar"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            className="menu-config__action-btn menu-config__action-btn--danger"
                            title="Eliminar"
                            onClick={() => eliminarItem(idx)}
                            aria-label="Eliminar"
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <datalist id="menu-rutas-sugeridas">
          {RUTAS_COMUNES.map((ruta) => (
            <option key={ruta} value={ruta} />
          ))}
        </datalist>
      </section>

      <section className="menu-config__preview" aria-label="Vista previa del menú">
        <div className="menu-config__preview-head">
          <h4>Vista previa</h4>
          <p>Solo ítems visibles con nombre</p>
        </div>
        {previewTree.length === 0 ? (
          <p className="menu-config__preview-empty">Agregue ítems para ver la estructura del menú.</p>
        ) : (
          <div className="menu-config__preview-grid">
            {previewTree.map((root) => (
              <div key={root.id || root.nombre} className="menu-config__preview-card">
                <span className="menu-config__preview-name">{root.nombre}</span>
                <span className="menu-config__preview-route">{root.ruta}</span>
                {root.children?.length > 0 && (
                  <ul className="menu-config__preview-children">
                    {root.children.map((child) => (
                      <li key={child.id || child.nombre}>
                        <span className="menu-config__preview-name">{child.nombre}</span>
                        <span className="menu-config__preview-route">{child.ruta}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="menu-config__footer">
        <p className="section-note">
          Guarde primero los ítems principales para usarlos como padre de submenús nuevos.
        </p>
        <button type="submit" className="primary-button" disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar menú'}
        </button>
      </div>
    </form>
  );
}

export default MenuNavegacionTab;
