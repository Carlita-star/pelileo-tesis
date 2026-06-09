import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CreatableCombobox from '../../components/CreatableCombobox';
import LocationMapPicker from '../../components/LocationMapPicker';
import GalleryUploader from '../../components/GalleryUploader';
import { apiRequest } from '../../services/apiClient';
import { ADMIN_PATHS } from '../../routes/adminPaths';
import '../../styles/AtractivoForm.css';

function EmprendimientoFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const emprendimientoId = id ? Number(id) : null;
  const [loading, setLoading] = useState(Boolean(emprendimientoId));
  const [error, setError] = useState('');
  const [catalogs, setCatalogs] = useState({ parroquias: [], categorias: [], servicios: [] });
  const [formData, setFormData] = useState({
    general: {
      nombre: '',
      descripcion: '',
      direccion: '',
      telefono: '',
      email: '',
      sitio_web: '',
      horario: '',
      parroquia_id: null,
      parroquia_nombre: '',
      categoria_id: null,
      categoria_nombre: '',
    },
    ubicacion: { latitud: null, longitud: null, altitud: null },
    servicios_ids: [],
    redes_sociales: [],
    relaciones: [],
    estado_publicacion_codigo: 'borrador',
  });

  useEffect(() => {
    loadData();
  }, [emprendimientoId]);

  const loadData = async () => {
    try {
      const catalogData = await apiRequest('/api/admin/emprendimientos/form-data/');
      setCatalogs(catalogData);
      if (!emprendimientoId) return;
      const data = await apiRequest(`/api/admin/emprendimientos/${emprendimientoId}/form-data/`);
      setFormData((prev) => ({ ...prev, ...data, general: { ...prev.general, ...data.general } }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const upsertCatalog = async (endpoint, nombre, key) => {
    const created = await apiRequest(endpoint, { method: 'POST', body: JSON.stringify({ nombre }) });
    setCatalogs((prev) => ({
      ...prev,
      [key]: [...prev[key].filter((item) => item.id !== created.id), created],
    }));
    return created;
  };

  const handleSave = async (publish) => {
    setError('');
    try {
      const payload = {
        ...formData,
        estado_publicacion_codigo: publish ? 'publicado' : formData.estado_publicacion_codigo,
      };
      const url = emprendimientoId
        ? `/api/admin/emprendimientos/${emprendimientoId}/edit/`
        : '/api/admin/emprendimientos/new/';
      const result = await apiRequest(url, {
        method: emprendimientoId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      if (!emprendimientoId && result?.id) {
        navigate(ADMIN_PATHS.emprendimientoEditar(result.id));
        return;
      }
      navigate(ADMIN_PATHS.emprendimientos);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="form-container"><div className="loader" /></div>;
  }

  return (
    <div className="atractivo-form-page">
      <div className="form-header">
        <h1>{emprendimientoId ? `Editar: ${formData.general.nombre}` : 'Nuevo emprendimiento'}</h1>
        <select
          value={formData.estado_publicacion_codigo}
          onChange={(e) => setFormData((prev) => ({ ...prev, estado_publicacion_codigo: e.target.value }))}
        >
          <option value="borrador">Borrador</option>
          <option value="publicado">Publicado</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="tabs-content" style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        <h2>Datos generales</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Nombre *</label>
            <input
              value={formData.general.nombre}
              onChange={(e) => setFormData((prev) => ({
                ...prev,
                general: { ...prev.general, nombre: e.target.value },
              }))}
            />
          </div>
          <CreatableCombobox
            label="Parroquia *"
            options={catalogs.parroquias}
            value={formData.general.parroquia_id ? {
              id: formData.general.parroquia_id,
              nombre: catalogs.parroquias.find((p) => p.id === formData.general.parroquia_id)?.nombre || '',
            } : null}
            onChange={(selection) => setFormData((prev) => ({
              ...prev,
              general: {
                ...prev.general,
                parroquia_id: selection?.id || null,
                parroquia_nombre: selection?.nombre || '',
              },
            }))}
            onCreateOption={(nombre) => upsertCatalog('/api/catalogos/parroquias/', nombre, 'parroquias')}
          />
          <CreatableCombobox
            label="Categoría"
            options={catalogs.categorias}
            value={formData.general.categoria_id ? {
              id: formData.general.categoria_id,
              nombre: catalogs.categorias.find((c) => c.id === formData.general.categoria_id)?.nombre || '',
            } : null}
            onChange={(selection) => setFormData((prev) => ({
              ...prev,
              general: {
                ...prev.general,
                categoria_id: selection?.id || null,
                categoria_nombre: selection?.nombre || '',
              },
            }))}
            onCreateOption={(nombre) => upsertCatalog('/api/catalogos/categorias/', nombre, 'categorias')}
          />
          <div className="form-group">
            <label>Teléfono</label>
            <input value={formData.general.telefono || ''} onChange={(e) => setFormData((prev) => ({
              ...prev, general: { ...prev.general, telefono: e.target.value },
            }))} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={formData.general.email || ''} onChange={(e) => setFormData((prev) => ({
              ...prev, general: { ...prev.general, email: e.target.value },
            }))} />
          </div>
          <div className="form-group form-full">
            <label>Descripción</label>
            <textarea rows="4" value={formData.general.descripcion || ''} onChange={(e) => setFormData((prev) => ({
              ...prev, general: { ...prev.general, descripcion: e.target.value },
            }))} />
          </div>
          <div className="form-group form-full">
            <label>Dirección</label>
            <input value={formData.general.direccion || ''} onChange={(e) => setFormData((prev) => ({
              ...prev, general: { ...prev.general, direccion: e.target.value },
            }))} />
          </div>
        </div>

        <h2 style={{ marginTop: 24 }}>Ubicación GPS</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Latitud</label>
            <input
              type="number"
              step="0.000001"
              value={formData.ubicacion.latitud ?? ''}
              onChange={(e) => setFormData((prev) => ({
                ...prev,
                ubicacion: { ...prev.ubicacion, latitud: e.target.value ? Number(e.target.value) : null },
              }))}
            />
          </div>
          <div className="form-group">
            <label>Longitud</label>
            <input
              type="number"
              step="0.000001"
              value={formData.ubicacion.longitud ?? ''}
              onChange={(e) => setFormData((prev) => ({
                ...prev,
                ubicacion: { ...prev.ubicacion, longitud: e.target.value ? Number(e.target.value) : null },
              }))}
            />
          </div>
        </div>
        <LocationMapPicker
          latitud={formData.ubicacion.latitud}
          longitud={formData.ubicacion.longitud}
          onChange={({ latitud, longitud }) => setFormData((prev) => ({
            ...prev,
            ubicacion: { ...prev.ubicacion, latitud, longitud },
          }))}
        />

        <h2 style={{ marginTop: 24 }}>Servicios</h2>
        <div className="multi-select-grid">
          {catalogs.servicios.map((servicio) => (
            <label key={servicio.id} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.servicios_ids.includes(servicio.id)}
                onChange={(e) => setFormData((prev) => ({
                  ...prev,
                  servicios_ids: e.target.checked
                    ? [...prev.servicios_ids, servicio.id]
                    : prev.servicios_ids.filter((sid) => sid !== servicio.id),
                }))}
              />
              {servicio.nombre}
            </label>
          ))}
        </div>

        <h2 style={{ marginTop: 24 }}>Galería</h2>
        <GalleryUploader entidadTipo="emprendimiento" entidadId={emprendimientoId} />
      </div>

      <div className="form-footer">
        <button type="button" className="btn-secondary" onClick={() => navigate(ADMIN_PATHS.emprendimientos)}>Cancelar</button>
        <button type="button" className="btn-secondary" onClick={() => handleSave(false)}>Guardar</button>
        <button type="button" className="btn-primary" onClick={() => handleSave(true)}>Guardar y publicar</button>
      </div>
    </div>
  );
}

export default EmprendimientoFormPage;
