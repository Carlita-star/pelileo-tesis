import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../../services/apiClient';
import { isAdministrador } from '../../services/authStorage';
import { useToast } from '../../context/ToastContext';
import { useErrorToast } from '../../hooks/useErrorToast';
import { useListSearch } from '../../hooks/useListSearch';
import { urlImagen } from '../../services/media';

const TABS = [
  { key: 'atractivos', label: 'Atractivos' },
  { key: 'rutas', label: 'Rutas' },
  { key: 'emprendimientos', label: 'Emprendimientos' },
  { key: 'eventos', label: 'Eventos' },
];

function IconoRestaurar() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </svg>
  );
}

function PapeleraPage() {
  const toast = useToast();
  const esAdmin = isAdministrador();
  const [tabActiva, setTabActiva] = useState('atractivos');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useListSearch();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    params.set('tipo', tabActiva);
    if (search) params.set('search', search);
    params.set('page', String(page));
    params.set('page_size', String(pageSize));

    try {
      const data = await apiRequest(`/api/admin/papelera/?${params.toString()}`);
      setItems(data.results || []);
      setTotal(data.total ?? 0);
      setTotalPages(data.total_pages ?? 1);
    } catch (err) {
      setError(err.message || 'No se pudo cargar la papelera.');
    } finally {
      setLoading(false);
    }
  }, [tabActiva, search, page, pageSize]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    setPage(1);
  }, [search, tabActiva]);

  useErrorToast(error, { action: { label: 'Reintentar', onClick: cargar } });

  const cambiarTab = (key) => {
    setTabActiva(key);
    setSearch('');
    setError('');
  };

  const handleRestaurar = async (item) => {
    if (!window.confirm(`¿Restaurar "${item.nombre}"? Volverá a aparecer en el listado administrativo.`)) {
      return;
    }
    try {
      await apiRequest(`/api/admin/papelera/${tabActiva}/${item.id}/restaurar/`, { method: 'POST' });
      toast.success('Registro restaurado correctamente.');
      cargar();
    } catch (err) {
      toast.error(err.message || 'No se pudo restaurar el registro.');
    }
  };

  const handleEliminarPermanente = async (item) => {
    const aviso = `¿Eliminar permanentemente "${item.nombre}"?\n\nEsta acción NO se puede deshacer. Se borrarán datos, imágenes y reseñas asociadas.`;
    if (!window.confirm(aviso)) return;
    if (!window.confirm('Confirme de nuevo: el registro se borrará de la base de datos para siempre.')) return;

    try {
      await apiRequest(`/api/admin/papelera/${tabActiva}/${item.id}/permanente/`, {
        method: 'DELETE',
        body: JSON.stringify({ confirmacion: 'ELIMINAR PERMANENTEMENTE' }),
      });
      toast.success('Registro eliminado permanentemente.');
      cargar();
    } catch (err) {
      toast.error(err.message || 'No se pudo eliminar el registro.');
    }
  };

  const tabLabel = TABS.find((t) => t.key === tabActiva)?.label || tabActiva;

  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <h2>Papelera</h2>
          <p className="section-description">
            Registros enviados a la papelera desde los módulos administrativos.
            {esAdmin
              ? ' Puede restaurarlos o eliminarlos definitivamente de la base de datos.'
              : ' Puede restaurarlos para que vuelvan al listado administrativo. La eliminación permanente solo la realiza el administrador.'}
          </p>
        </div>
      </div>

      <div className="catalog-tabs">
        <div className="catalog-tabs-header">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`catalog-tab-button ${tabActiva === tab.key ? 'active' : ''}`}
              onClick={() => cambiarTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="catalog-tab-panel">
          <div className="filter-bar">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Buscar en ${tabLabel.toLowerCase()} eliminados`}
            />
          </div>

          <div className="table-responsive">
            <table className="entity-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Nombre</th>
                  <th>Detalle</th>
                  <th>Estado previo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5">
                      <div className="table-spinner">
                        <div className="loader" />
                        Cargando papelera...
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <p className="empty-state">
                        No hay {tabLabel.toLowerCase()} en la papelera.
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {item.imagen ? (
                          <img className="thumbnail" src={urlImagen(item.imagen)} alt={item.nombre} />
                        ) : (
                          <div className="thumbnail placeholder">Sin imagen</div>
                        )}
                      </td>
                      <td>{item.nombre}</td>
                      <td>
                        {[item.categoria, item.parroquia].filter(Boolean).join(' · ') || '—'}
                      </td>
                      <td>
                        <span className="status-badge status-inactive">
                          {item.estado_publicacion || 'Eliminado'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <div className="actions-cell-group">
                          <button
                            type="button"
                            className="action-btn action-btn--restore"
                            onClick={() => handleRestaurar(item)}
                            title="Restaurar registro"
                            aria-label={`Restaurar ${item.nombre}`}
                          >
                            <IconoRestaurar />
                          </button>
                          {esAdmin && (
                            <button
                              type="button"
                              className="action-btn action-btn--danger"
                              onClick={() => handleEliminarPermanente(item)}
                              title="Eliminar permanentemente"
                              aria-label="Eliminar permanentemente"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <p className="section-note">
              Mostrando {items.length} de {total} registros en papelera.
            </p>
            <div className="pagination-controls">
              <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Anterior
              </button>
              <span>
                Página {page} de {totalPages}
              </span>
              <button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Siguiente
              </button>
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                {[10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size} / página
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PapeleraPage;
