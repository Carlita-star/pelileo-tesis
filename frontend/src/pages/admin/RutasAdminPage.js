import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/apiClient';
import { ADMIN_PATHS } from '../../routes/adminPaths';

const ESTADO_COLOR = {
  borrador: 'status-draft',
  publicado: 'status-published',
  inactivo: 'status-inactive',
};

function RutasAdminPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rutas, setRutas] = useState([]);
  const [estados, setEstados] = useState([]);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('todos');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRutas = async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (estado) params.set('estado', estado);
    params.set('page', String(page));
    params.set('page_size', String(pageSize));

    try {
      const data = await apiRequest(`/api/admin/rutas/?${params.toString()}`);
      setRutas(data.results || []);
      setEstados(data.estados || []);
      setTotal(data.total ?? 0);
      setTotalPages(data.total_pages ?? 1);
    } catch (err) {
      setError('No se pudieron cargar las rutas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRutas();
  }, [search, estado, page, pageSize]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta ruta?')) return;
    try {
      await apiRequest(`/api/admin/rutas/${id}/`, { method: 'DELETE' });
      fetchRutas();
    } catch (err) {
      setError('Error al eliminar la ruta.');
    }
  };

  const handleToggleEstado = async (item) => {
    const objetivo = item.estado_publicacion_codigo === 'publicado' ? 'inactivo' : 'publicado';
    try {
      await apiRequest(`/api/admin/rutas/${item.id}/cambiar-estado/`, {
        method: 'POST',
        body: JSON.stringify({ estado_codigo: objetivo }),
      });
      fetchRutas();
    } catch (err) {
      setError(err.message || 'Error al cambiar el estado.');
    }
  };

  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <h2>Gestión de rutas</h2>
          <p className="section-description">Administra las rutas turísticas del cantón.</p>
        </div>
        <button type="button" className="primary-button" onClick={() => navigate(ADMIN_PATHS.rutasNueva)}>
          Nueva ruta
        </button>
      </div>

      <div className="filter-bar">
        <input
          type="search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar por nombre"
        />
        <select value={estado} onChange={(e) => { setEstado(e.target.value); setPage(1); }}>
          <option value="todos">Todos los estados</option>
          {estados.map((item) => (
            <option key={item.codigo} value={item.codigo}>{item.nombre}</option>
          ))}
        </select>
      </div>

      <div className="table-responsive">
        <table className="entity-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Atractivos</th>
              <th>Distancia</th>
              <th>Dificultad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6"><div className="table-spinner"><div className="loader" />Cargando...</div></td></tr>
            ) : rutas.length === 0 ? (
              <tr><td colSpan="6"><p className="empty-state">No hay rutas registradas.</p></td></tr>
            ) : (
              rutas.map((item) => (
                <tr key={item.id}>
                  <td>{item.nombre}</td>
                  <td>{item.total_atractivos ?? 0}</td>
                  <td>{item.distancia_km ?? '---'} km</td>
                  <td>{item.dificultad || '---'}</td>
                  <td>
                    <span className={`status-badge ${ESTADO_COLOR[item.estado_publicacion_codigo] || ''}`}>
                      {item.estado_publicacion || 'Sin estado'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button type="button" onClick={() => navigate(ADMIN_PATHS.rutaEditar(item.id))}>✏️</button>
                    <button type="button" onClick={() => handleToggleEstado(item)}>👁️</button>
                    <button type="button" onClick={() => handleDelete(item.id)}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <p className="section-note">Mostrando {rutas.length} de {total} registros.</p>
        <div className="pagination-controls">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)}>Anterior</button>
          <span>Página {page} de {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Siguiente</button>
        </div>
      </div>
      {error && <p className="status-error">{error}</p>}
    </section>
  );
}

export default RutasAdminPage;
