import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../../services/apiClient';

const TABS = [
  { key: 'categorias', label: 'Categorías', singular: 'categoría', showIcono: false, showDescripcion: true },
  { key: 'parroquias', label: 'Parroquias', singular: 'parroquia', showIcono: false, showDescripcion: false },
  { key: 'servicios', label: 'Servicios', singular: 'servicio', showIcono: true, showDescripcion: true },
  { key: 'actividades', label: 'Actividades', singular: 'actividad', showIcono: true, showDescripcion: true },
];

const EMPTY_FORM = {
  id: null,
  nombre: '',
  descripcion: '',
  icono: '',
  activo: true,
};

function CatalogosPage() {
  const [tabActiva, setTabActiva] = useState('categorias');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  const tabConfig = TABS.find((t) => t.key === tabActiva) || TABS[0];

  const cargar = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (estado) params.set('estado', estado);

    try {
      const data = await apiRequest(`/api/admin/catalogos/${tabActiva}/?${params.toString()}`);
      setItems(data.results || []);
    } catch (err) {
      const msg = err.message || '';
      if (/fetch|network|failed/i.test(msg)) {
        setError('No se pudo conectar con el backend. Verifique que esté corriendo: python manage.py runserver');
      } else if (/sesión|autenticado|permisos/i.test(msg)) {
        setError(`${msg} Cierre sesión e ingrese de nuevo.`);
      } else {
        setError(msg || 'No se pudieron cargar los catálogos.');
      }
    } finally {
      setLoading(false);
    }
  }, [tabActiva, search, estado]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const cambiarTab = (key) => {
    setTabActiva(key);
    setSearch('');
    setEstado('todos');
    setSuccess('');
    setError('');
  };

  const abrirNuevo = () => {
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setModalOpen(true);
  };

  const abrirEditar = (item) => {
    setForm({
      id: item.id,
      nombre: item.nombre || '',
      descripcion: item.descripcion || '',
      icono: item.icono || '',
      activo: item.activo !== false,
    });
    setFormError('');
    setModalOpen(true);
  };

  const cerrarModal = () => {
    if (saving) return;
    setModalOpen(false);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const nombre = form.nombre.trim();
    if (!nombre) {
      setFormError('El nombre es obligatorio.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nombre,
        activo: form.activo,
      };
      if (tabConfig.showDescripcion) {
        payload.descripcion = form.descripcion.trim();
      }
      if (tabConfig.showIcono) {
        payload.icono = form.icono.trim();
      }

      if (form.id) {
        await apiRequest(`/api/admin/catalogos/${tabActiva}/${form.id}/edit/`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setSuccess(`${tabConfig.label.slice(0, -1) || tabConfig.label} actualizado correctamente.`);
      } else {
        await apiRequest(`/api/admin/catalogos/${tabActiva}/new/`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setSuccess(`${tabConfig.label.slice(0, -1) || tabConfig.label} creado correctamente.`);
      }
      setModalOpen(false);
      cargar();
    } catch (err) {
      setFormError(err.message || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActivo = async (item) => {
    const nuevoEstado = !item.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    if (!window.confirm(`¿Desea ${accion} "${item.nombre}"?`)) return;

    try {
      await apiRequest(`/api/admin/catalogos/${tabActiva}/${item.id}/cambiar-estado/`, {
        method: 'POST',
        body: JSON.stringify({ activo: nuevoEstado }),
      });
      setSuccess(`Registro ${nuevoEstado ? 'activado' : 'desactivado'} correctamente.`);
      cargar();
    } catch (err) {
      setError(err.message || 'Error al cambiar el estado.');
    }
  };

  const mensajeVacio = search || estado !== 'todos'
    ? 'No hay registros que coincidan con los filtros.'
    : `No hay ${tabConfig.label.toLowerCase()} registrados.`;

  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <h2>Gestión de catálogos</h2>
          <p className="section-description">
            Mantenga actualizados los catálogos que alimentan formularios y filtros del sistema.
          </p>
        </div>
      </div>

      {success && (
        <div className="success-message">{success}</div>
      )}

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
          <div className="panel-header catalog-tab-toolbar">
            <h3>{tabConfig.label}</h3>
            <button type="button" className="primary-button" onClick={abrirNuevo}>
              {`Nuevo ${tabConfig.singular}`}
            </button>
          </div>

          <div className="filter-bar">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre"
            />
            <select value={estado} onChange={(e) => setEstado(e.target.value)}>
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>

          <div className="table-responsive">
            <table className="entity-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4">
                      <div className="table-spinner">
                        <span className="loader" />
                        Cargando…
                      </div>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan="4">
                      <p className="empty-state">{error ? '—' : mensajeVacio}</p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.nombre}</td>
                      <td>{item.descripcion || '—'}</td>
                      <td>
                        <span className={`status-badge ${item.activo ? 'status-published' : 'status-inactive'}`}>
                          {item.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button type="button" title="Editar" onClick={() => abrirEditar(item)}>✏️</button>
                        <button
                          type="button"
                          title={item.activo ? 'Desactivar' : 'Activar'}
                          onClick={() => handleToggleActivo(item)}
                        >
                          {item.activo ? '🚫' : '✅'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <p className="section-note">Total: {items.length} registros.</p>
        </div>
      </div>

      {error && (
        <p className="status-error">
          {error}
          {' '}
          <button type="button" className="primary-button" style={{ marginLeft: 8, padding: '6px 12px' }} onClick={cargar}>
            Reintentar
          </button>
        </p>
      )}

      {modalOpen && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content catalog-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{form.id ? `Editar ${tabConfig.singular}` : `Nuevo ${tabConfig.singular}`}</h3>

            <form className="catalog-form" onSubmit={handleSubmit}>
              <label>
                Nombre *
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  maxLength={150}
                  required
                />
              </label>

              {tabConfig.showDescripcion && (
                <label>
                  Descripción
                  <textarea
                    value={form.descripcion}
                    onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                    rows={3}
                  />
                </label>
              )}

              {tabConfig.showIcono && (
                <label>
                  Icono
                  <input
                    type="text"
                    value={form.icono}
                    onChange={(e) => setForm((f) => ({ ...f, icono: e.target.value }))}
                    placeholder="Ej: fa-utensils, hiking, wifi"
                    maxLength={100}
                  />
                </label>
              )}

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
                />
                Activo
              </label>

              {formError && <p className="status-error">{formError}</p>}

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={cerrarModal} disabled={saving}>
                  Cancelar
                </button>
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default CatalogosPage;
