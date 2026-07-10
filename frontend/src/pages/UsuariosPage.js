import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiRequest, getApiBase } from '../services/apiClient';
import { ADMIN_PATHS } from '../routes/adminPaths';
import { useToast } from '../context/ToastContext';
import { useErrorToast } from '../hooks/useErrorToast';
import { useListSearch } from '../hooks/useListSearch';

const ROL_LABELS = {
  administrador: 'Administrador',
  gestor_turistico: 'Gestor turístico',
  visitante: 'Visitante',
};

function formatRol(nombre) {
  return ROL_LABELS[nombre] || nombre;
}

function formatUltimoAcceso(iso) {
  if (!iso) return 'Nunca';
  return new Date(iso).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function fotoUrl(item) {
  if (!item.foto_url) return null;
  if (item.foto_url.startsWith('http')) return item.foto_url;
  return `${getApiBase()}${item.foto_url}`;
}

function Avatar({ item }) {
  const url = fotoUrl(item);
  if (url) {
    return <img src={url} alt={item.nombre_completo} className="user-avatar user-avatar-img" />;
  }
  return <span className="user-avatar">{item.iniciales || '?'}</span>;
}

function UsuariosPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [items, setItems] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useListSearch();
  const [rolId, setRolId] = useState('');
  const [estado, setEstado] = useState('todos');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (rolId) params.set('rol_id', rolId);
    if (estado) params.set('estado', estado);
    params.set('page', String(page));
    params.set('page_size', String(pageSize));

    try {
      const data = await apiRequest(`/api/admin/usuarios/?${params.toString()}`);
      setItems(data.results || []);
      setRoles(data.roles || []);
      setTotal(data.total ?? 0);
      setTotalPages(data.total_pages ?? 1);
    } catch (err) {
      const msg = err.message || '';
      if (/fetch|network|failed/i.test(msg)) {
        setError('No se pudo conectar con el backend. Verifique que esté corriendo: python manage.py runserver');
      } else if (/sesión|autenticado|permisos/i.test(msg)) {
        setError(`${msg} Cierre sesión e ingrese de nuevo.`);
      } else {
        setError(msg || 'No se pudieron cargar los usuarios.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, rolId, estado, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (location.state?.saved) {
      toast.success(`Usuario "${location.state.nombre || ''}" guardado correctamente.`);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate, toast]);

  useErrorToast(error, { action: { label: 'Reintentar', onClick: fetchData } });

  const handleDelete = async (item) => {
    if (!window.confirm(`¿Eliminar al usuario "${item.nombre_completo}"? Esta acción no se puede deshacer.`)) return;
    try {
      await apiRequest(`/api/admin/usuarios/${item.id}/`, { method: 'DELETE' });
      toast.success('Usuario eliminado correctamente.');
      fetchData();
    } catch (err) {
      setError(err.message || 'Error al eliminar el usuario.');
    }
  };

  const handleToggleActivo = async (item) => {
    const nuevoEstado = !item.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    if (!window.confirm(`¿Desea ${accion} a "${item.nombre_completo}"?`)) return;
    try {
      await apiRequest(`/api/admin/usuarios/${item.id}/cambiar-estado/`, {
        method: 'POST',
        body: JSON.stringify({ activo: nuevoEstado }),
      });
      fetchData();
    } catch (err) {
      setError(err.message || 'Error al cambiar el estado.');
    }
  };

  const hayFiltros = Boolean(search || rolId || (estado && estado !== 'todos'));
  const mensajeVacio = hayFiltros
    ? 'No hay usuarios que coincidan con los filtros.'
    : 'No hay usuarios registrados.';

  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <h2>Gestión de usuarios</h2>
          <p className="section-description">
            Control de acceso al panel administrativo y asignación de roles.
          </p>
        </div>
        <button type="button" className="primary-button" onClick={() => navigate(ADMIN_PATHS.usuariosNuevo)}>
          Nuevo usuario
        </button>
      </div>

      <div className="filter-bar">
        <input
          type="search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar por nombre, username o email"
        />
        <select value={rolId} onChange={(e) => { setRolId(e.target.value); setPage(1); }}>
          <option value="">Todos los roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>{formatRol(r.nombre)}</option>
          ))}
        </select>
        <select value={estado} onChange={(e) => { setEstado(e.target.value); setPage(1); }}>
          <option value="todos">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      <div className="table-responsive">
        <table className="entity-table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nombre completo</th>
              <th>Username</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Último acceso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">
                  <div className="table-spinner">
                    <span className="loader" />
                    Cargando usuarios…
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
                  <td><Avatar item={item} /></td>
                  <td>
                    {item.nombre_completo}
                    {!item.activo && (
                      <span className="status-badge status-inactive" style={{ marginLeft: 8 }}>Inactivo</span>
                    )}
                  </td>
                  <td>{item.username}</td>
                  <td>{item.email}</td>
                  <td>
                    <div className="role-badges">
                      {(item.roles || []).map((rol) => (
                        <span key={rol.id} className="role-badge">{formatRol(rol.nombre)}</span>
                      ))}
                    </div>
                  </td>
                  <td>{formatUltimoAcceso(item.ultimo_acceso)}</td>
                  <td className="actions-cell">
                    <button type="button" title="Editar" onClick={() => navigate(ADMIN_PATHS.usuarioEditar(item.id))}>✏️</button>
                    <button
                      type="button"
                      title={item.activo ? 'Desactivar' : 'Activar'}
                      onClick={() => handleToggleActivo(item)}
                    >
                      {item.activo ? '🚫' : '✅'}
                    </button>
                    <button type="button" title="Eliminar" onClick={() => handleDelete(item)}>🗑️</button>
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
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} / página
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}

export default UsuariosPage;
