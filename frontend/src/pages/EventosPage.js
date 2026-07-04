import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiRequest } from '../services/apiClient';
import { ADMIN_PATHS } from '../routes/adminPaths';
import { useToast } from '../context/ToastContext';
import { useErrorToast } from '../hooks/useErrorToast';
import { useListSearch } from '../hooks/useListSearch';
import { urlImagen } from '../services/media';

const ESTADO_COLOR = {
  borrador: 'status-draft',
  publicado: 'status-published',
  inactivo: 'status-inactive',
};

function formatFecha(iso) {
  if (!iso) return '---';
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function EventosPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [estados, setEstados] = useState([]);
  const [search, setSearch] = useListSearch();
  const [categoriaId, setCategoriaId] = useState('');
  const [estado, setEstado] = useState('todos');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categoriaId) params.set('categoria_id', categoriaId);
    if (estado) params.set('estado', estado);
    params.set('page', String(page));
    params.set('page_size', '10');

    try {
      const data = await apiRequest(`/api/admin/eventos/?${params.toString()}`);
      setItems(data.results || []);
      setCategorias(data.categorias || []);
      setEstados(data.estados || []);
      setTotal(data.total ?? 0);
      setTotalPages(data.total_pages ?? 1);
    } catch (err) {
      const msg = err.message || '';
      if (/fetch|network|failed/i.test(msg)) {
        setError('No se pudo conectar con el backend. Verifique que esté corriendo: python manage.py runserver');
      } else if (/sesión|autenticado|permisos/i.test(msg)) {
        setError(`${msg} Cierre sesión e ingrese de nuevo.`);
      } else {
        setError(msg || 'No se pudieron cargar los eventos.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, categoriaId, estado, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (location.state?.saved) {
      toast.success(`Evento "${location.state.nombre || ''}" guardado correctamente.`);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate, toast]);

  useErrorToast(error, { action: { label: 'Reintentar', onClick: fetchData } });

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este evento? La acción es lógica.')) return;
    try {
      setLoading(true);
      await apiRequest(`/api/admin/eventos/${id}/`, { method: 'DELETE' });
      await fetchData();
    } catch (err) {
      setError(err.message || 'Error al eliminar el evento.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEstado = async (item) => {
    const objetivo = item.estado_publicacion_codigo === 'publicado' ? 'inactivo' : 'publicado';
    try {
      await apiRequest(`/api/admin/eventos/${item.id}/cambiar-estado/`, {
        method: 'POST',
        body: JSON.stringify({ estado_codigo: objetivo }),
      });
      fetchData();
    } catch (err) {
      setError(err.message || 'Error al cambiar el estado.');
    }
  };

  const hayFiltros = Boolean(search || categoriaId || (estado && estado !== 'todos'));
  const mensajeVacio = hayFiltros
    ? 'No hay eventos que coincidan con los filtros.'
    : 'No hay eventos registrados.';

  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <h2>Gestión de eventos</h2>
          <p className="section-description">
            Listado y administración de eventos culturales y turísticos del cantón.
          </p>
        </div>
        <button type="button" className="primary-button" onClick={() => navigate(ADMIN_PATHS.eventosNuevo)}>
          Nuevo evento
        </button>
      </div>

      <div className="filter-bar">
        <input
          type="search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar por nombre"
        />
        <select value={categoriaId} onChange={(e) => { setCategoriaId(e.target.value); setPage(1); }}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
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
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Fecha inicio</th>
              <th>Fecha fin</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">
                  <div className="table-spinner">
                    <span className="loader" />
                    Cargando eventos…
                  </div>
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <p className="empty-state">{error ? '—' : mensajeVacio}</p>
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.imagen ? (
                      <img className="thumbnail" src={urlImagen(item.imagen)} alt={item.nombre} />
                    ) : (
                      <div className="thumbnail placeholder">No imagen</div>
                    )}
                  </td>
                  <td>{item.nombre}</td>
                  <td>{item.categoria || '---'}</td>
                  <td>{formatFecha(item.fecha_inicio)}</td>
                  <td>{formatFecha(item.fecha_fin)}</td>
                  <td>
                    <span className={`status-badge ${ESTADO_COLOR[item.estado_publicacion_codigo] || 'status-neutral'}`}>
                      {item.estado_publicacion || '---'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div className="actions-cell-group">
                    <button
                      type="button"
                      className="action-btn"
                      onClick={() => navigate(ADMIN_PATHS.eventoEditar(item.id))}
                      title="Editar"
                      aria-label="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      className="action-btn"
                      onClick={() => handleToggleEstado(item)}
                      title="Cambiar estado"
                      aria-label="Cambiar estado"
                    >
                      🔁
                    </button>
                    <button
                      type="button"
                      className="action-btn"
                      onClick={() => handleDelete(item.id)}
                      title="Eliminar"
                      aria-label="Eliminar"
                    >
                      🗑️
                    </button>
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
    </section>
  );
}

export default EventosPage;
