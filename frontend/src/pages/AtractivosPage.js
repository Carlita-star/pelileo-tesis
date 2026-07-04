import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/apiClient';
import { ADMIN_PATHS } from '../routes/adminPaths';
import AdminDetailModal from '../components/admin/AdminDetailModal';
import DownloadFichaButton from '../components/admin/DownloadFichaButton';
import { useAdminDetail } from '../hooks/useAdminDetail';
import { useErrorToast } from '../hooks/useErrorToast';
import { useListSearch } from '../hooks/useListSearch';
import { urlImagen } from '../services/media';

const ESTADO_COLOR = {
  borrador: 'status-draft',
  publicado: 'status-published',
  inactivo: 'status-inactive',
};

function AtractivosPage() {
  const navigate = useNavigate();
  const detail = useAdminDetail();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [atractivos, setAtractivos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [parroquias, setParroquias] = useState([]);
  const [estados, setEstados] = useState([]);
  const [search, setSearch] = useListSearch();
  const [categoriaId, setCategoriaId] = useState('');
  const [parroquiaId, setParroquiaId] = useState('');
  const [estado, setEstado] = useState('todos');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const fetchAtractivos = async () => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categoriaId) params.set('categoria_id', categoriaId);
    if (parroquiaId) params.set('parroquia_id', parroquiaId);
    if (estado) params.set('estado', estado);
    params.set('page', String(page));
    params.set('page_size', String(pageSize));

    try {
      const data = await apiRequest(`/api/admin/atractivos/?${params.toString()}`);
      setAtractivos(data.results || []);
      setCategorias(data.categorias || []);
      setParroquias(data.parroquias || []);
      setEstados(data.estados || []);
      setTotal(data.total ?? 0);
      setTotalPages(data.total_pages ?? 1);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los atractivos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAtractivos();
  }, [search, categoriaId, parroquiaId, estado, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useErrorToast(error, { action: { label: 'Reintentar', onClick: fetchAtractivos } });

  const visibleRows = useMemo(() => atractivos, [atractivos]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm('¿Seguro que deseas eliminar este atractivo? La acción es lógica.');
    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      await apiRequest(`/api/admin/atractivos/${id}/`, { method: 'DELETE' });
      await fetchAtractivos();
    } catch (err) {
      setError('Error al eliminar el atractivo.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEstado = async (item) => {
    const objetivo = item.estado_publicacion_codigo === 'publicado' ? 'inactivo' : 'publicado';
    try {
      setLoading(true);
      await apiRequest(`/api/admin/atractivos/${item.id}/cambiar-estado/`, {
        method: 'POST',
        body: JSON.stringify({ estado_codigo: objetivo }),
      });
      await fetchAtractivos();
    } catch (err) {
      setError('Error al cambiar el estado del atractivo.');
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoAtractivo = () => {
    navigate(ADMIN_PATHS.atractivosNuevo);
  };

  const handleEditar = (id) => {
    navigate(ADMIN_PATHS.atractivoEditar(id));
  };

  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <h2>Gestión de atractivos</h2>
          <p className="section-description">
            Tabla administrativa con todos los atractivos, filtros y acciones rápidas.
          </p>
        </div>
        <button className="primary-button" type="button" onClick={handleNuevoAtractivo}>
          Nuevo atractivo
        </button>
      </div>

      <div className="filter-bar">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar por nombre"
        />
        <select
          value={categoriaId}
          onChange={(e) => {
            setCategoriaId(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nombre}
            </option>
          ))}
        </select>
        <select
          value={parroquiaId}
          onChange={(e) => {
            setParroquiaId(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Todas las parroquias</option>
          {parroquias.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nombre}
            </option>
          ))}
        </select>
        <select
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value);
            setPage(1);
          }}
        >
          <option value="todos">Todos los estados</option>
          {estados.map((item) => (
            <option key={item.codigo} value={item.codigo}>
              {item.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="table-responsive">
        <table className="entity-table attractive-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Parroquia</th>
              <th>Estado</th>
              <th>Visitas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">
                  <div className="table-spinner">
                    <div className="loader" />
                    Cargando atractivos...
                  </div>
                </td>
              </tr>
            ) : visibleRows.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <p className="empty-state">No hay atractivos que coincidan con el filtro.</p>
                </td>
              </tr>
            ) : (
              visibleRows.map((item) => (
                <tr key={item.id}>
                  <td>
                    {item.imagen ? (
                      <img className="thumbnail" src={urlImagen(item.imagen)} alt={item.nombre} />
                    ) : (
                      <div className="thumbnail placeholder">No imagen</div>
                    )}
                  </td>
                  <td>{item.nombre}</td>
                  <td>{item.categoria || 'Sin categoría'}</td>
                  <td>{item.parroquia || 'Sin parroquia'}</td>
                  <td>
                    <span className={`status-badge ${ESTADO_COLOR[item.estado_publicacion_codigo] || 'status-neutral'}`}>
                      {item.estado_publicacion || 'Sin estado'}
                    </span>
                  </td>
                  <td>{item.visitas ?? 0}</td>
                  <td className="actions-cell">
                    <div className="actions-cell-group">
                    <button
                      type="button"
                      className="action-btn action-btn--view"
                      onClick={() => detail.openDetail('atractivo', item.id)}
                      title="Ver detalle"
                    >
                      Ver
                    </button>
                    <DownloadFichaButton type="atractivo" id={item.id} compact />
                    <button type="button" className="action-btn" onClick={() => handleEditar(item.id)} title="Editar" aria-label="Editar">
                      ✏️
                    </button>
                    <button type="button" className="action-btn" onClick={() => handleToggleEstado(item)} title="Cambiar estado" aria-label="Cambiar estado">
                      🔁
                    </button>
                    <button type="button" className="action-btn" onClick={() => handleDelete(item.id)} title="Eliminar" aria-label="Eliminar">
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
        <div>
          <p className="section-note">
            Mostrando {visibleRows.length} de {total} registros.
          </p>
        </div>
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
          navigate(ADMIN_PATHS.atractivoEditar(detail.id));
        } : undefined}
      />
    </section>
  );
}

export default AtractivosPage;
