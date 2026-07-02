import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/apiClient';
import { ADMIN_PATHS } from '../../routes/adminPaths';
import AdminDetailModal from '../../components/admin/AdminDetailModal';
import DownloadFichaButton from '../../components/admin/DownloadFichaButton';
import { useAdminDetail } from '../../hooks/useAdminDetail';
import { useErrorToast } from '../../hooks/useErrorToast';
import { useListSearch } from '../../hooks/useListSearch';

const ESTADO_COLOR = {
  borrador: 'status-draft',
  publicado: 'status-published',
  inactivo: 'status-inactive',
};

function EmprendimientosAdminPage() {
  const navigate = useNavigate();
  const detail = useAdminDetail();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [estados, setEstados] = useState([]);
  const [search, setSearch] = useListSearch();
  const [parroquiaId, setParroquiaId] = useState('');
  const [estado, setEstado] = useState('todos');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (parroquiaId) params.set('parroquia_id', parroquiaId);
    if (estado) params.set('estado', estado);
    params.set('page', String(page));
    params.set('page_size', '10');

    try {
      const data = await apiRequest(`/api/admin/emprendimientos/?${params.toString()}`);
      setItems(data.results || []);
      setParroquias(data.parroquias || []);
      setEstados(data.estados || []);
      setTotal(data.total ?? 0);
      setTotalPages(data.total_pages ?? 1);
    } catch (err) {
      setError('No se pudieron cargar los emprendimientos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, parroquiaId, estado, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useErrorToast(error, { action: { label: 'Reintentar', onClick: fetchData } });

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este emprendimiento?')) return;
    try {
      await apiRequest(`/api/admin/emprendimientos/${id}/`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      setError('Error al eliminar.');
    }
  };

  const handleToggleEstado = async (item) => {
    const objetivo = item.estado_publicacion_codigo === 'publicado' ? 'inactivo' : 'publicado';
    try {
      await apiRequest(`/api/admin/emprendimientos/${item.id}/cambiar-estado/`, {
        method: 'POST',
        body: JSON.stringify({ estado_codigo: objetivo }),
      });
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <h2>Gestión de emprendimientos</h2>
          <p className="section-description">Administra emprendimientos turísticos y rurales.</p>
        </div>
        <button type="button" className="primary-button" onClick={() => navigate(ADMIN_PATHS.emprendimientosNuevo)}>
          Nuevo emprendimiento
        </button>
      </div>

      <div className="filter-bar">
        <input type="search" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Buscar por nombre" />
        <select value={parroquiaId} onChange={(e) => { setParroquiaId(e.target.value); setPage(1); }}>
          <option value="">Todas las parroquias</option>
          {parroquias.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <select value={estado} onChange={(e) => { setEstado(e.target.value); setPage(1); }}>
          <option value="todos">Todos los estados</option>
          {estados.map((e) => <option key={e.codigo} value={e.codigo}>{e.nombre}</option>)}
        </select>
      </div>

      <div className="table-responsive">
        <table className="entity-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Parroquia</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5"><div className="loader" /> Cargando...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan="5"><p className="empty-state">No hay emprendimientos.</p></td></tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombre}</td>
                  <td>{item.parroquia || '---'}</td>
                  <td>{item.telefono || '---'}</td>
                  <td>
                    <span className={`status-badge ${ESTADO_COLOR[item.estado_publicacion_codigo] || ''}`}>
                      {item.estado_publicacion}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div className="actions-cell-group">
                    <button type="button" className="action-btn action-btn--view" onClick={() => detail.openDetail('emprendimiento', item.id)} title="Ver detalle">Ver</button>
                    <DownloadFichaButton type="emprendimiento" id={item.id} compact />
                    <button type="button" className="action-btn" onClick={() => navigate(ADMIN_PATHS.emprendimientoEditar(item.id))} title="Editar">✏️</button>
                    <button type="button" className="action-btn" onClick={() => handleToggleEstado(item)} title="Cambiar estado">🔁</button>
                    <button type="button" className="action-btn" onClick={() => handleDelete(item.id)} title="Eliminar">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <p className="section-note">Mostrando {items.length} de {total} registros.</p>
        <div className="pagination-controls">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</button>
          <span>Página {page} de {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Siguiente</button>
        </div>
      </div>

      <AdminDetailModal
        isOpen={detail.isOpen}
        type={detail.type}
        id={detail.id}
        data={detail.data}
        images={detail.images}
        loading={detail.loading}
        error={detail.error}
        imageError={detail.imageError}
        onClose={detail.close}
        onEdit={detail.id ? () => {
          detail.close();
          navigate(ADMIN_PATHS.emprendimientoEditar(detail.id));
        } : undefined}
      />
    </section>
  );
}

export default EmprendimientosAdminPage;
