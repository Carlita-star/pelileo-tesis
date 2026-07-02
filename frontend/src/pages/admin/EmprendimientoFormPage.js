import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CreatableCombobox from '../../components/CreatableCombobox';
import LocationMapPicker from '../../components/LocationMapPicker';
import GalleryUploader from '../../components/GalleryUploader';
import { apiRequest } from '../../services/apiClient';
import { ADMIN_PATHS } from '../../routes/adminPaths';
import { useToast } from '../../context/ToastContext';
import { validateEmprendimientoForm } from '../../utils/adminFormSchemas';
import FormValidationBanner, { FieldError, fieldClass } from '../../components/FormValidationBanner';
import { filterSignedDecimalInput, filterDigitsOnly } from '../../utils/formValidation';
import '../../styles/AtractivoForm.css';

function EmprendimientoFormPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams();
  const emprendimientoId = id ? Number(id) : null;
  const [entityId, setEntityId] = useState(emprendimientoId);
  const [loading, setLoading] = useState(Boolean(emprendimientoId));
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [galleryCount, setGalleryCount] = useState(0);
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
    setEntityId(emprendimientoId);
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

  const prepareFormData = async () => {
    let general = { ...formData.general };

    if (!general.parroquia_id && general.parroquia_nombre?.trim()) {
      const created = await upsertCatalog('/api/catalogos/parroquias/', general.parroquia_nombre.trim(), 'parroquias');
      general = { ...general, parroquia_id: created.id, parroquia_nombre: created.nombre };
    }

    if (!general.categoria_id && general.categoria_nombre?.trim()) {
      const created = await upsertCatalog('/api/catalogos/categorias/', general.categoria_nombre.trim(), 'categorias');
      general = { ...general, categoria_id: created.id, categoria_nombre: created.nombre };
    }

    return { ...formData, general };
  };

  const saveEmprendimiento = async (preparedData, { publish = false, updateUrl = true } = {}) => {
    const currentId = entityId;
    const payload = {
      ...preparedData,
      estado_publicacion_codigo: publish ? 'publicado' : (preparedData.estado_publicacion_codigo || 'borrador'),
    };

    const url = currentId
      ? `/api/admin/emprendimientos/${currentId}/edit/`
      : '/api/admin/emprendimientos/new/';

    const result = await apiRequest(url, {
      method: currentId ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
    });

    if (result?.id && !currentId && updateUrl) {
      setEntityId(result.id);
      navigate(ADMIN_PATHS.emprendimientoEditar(result.id), { replace: true });
    }

    return result;
  };

  const ensureEntityForGallery = async () => {
    if (entityId) return entityId;

    const prepared = await prepareFormData();
    const validation = validateEmprendimientoForm(prepared, {
      publish: false,
      imageCount: galleryCount,
      entityId: null,
    });

    if (!validation.valid) {
      setFormData(prepared);
      setErrors(validation.errors);
      setError(validation.banner || 'Complete nombre, parroquia y descripción para subir imágenes.');
      throw new Error('validation');
    }

    setErrors({});
    setFormData(prepared);
    const result = await saveEmprendimiento(prepared, { publish: false });
    const newId = result?.id || entityId;
    if (!newId) {
      throw new Error('No se pudo crear el registro para la galería.');
    }
    setEntityId(newId);
    return newId;
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

    let prepared;
    try {
      prepared = await prepareFormData();
    } catch (err) {
      setError(err.message || 'Error al preparar el formulario.');
      return;
    }

    const validation = validateEmprendimientoForm(prepared, {
      publish,
      imageCount: galleryCount,
      entityId,
    });
    if (!validation.valid) {
      setFormData(prepared);
      setErrors(validation.errors);
      setError(validation.banner || validation.message);
      return;
    }
    setErrors({});
    setFormData(prepared);

    try {
      const wasNew = !entityId;
      await saveEmprendimiento(prepared, { publish, updateUrl: wasNew });
      if (publish) {
        toast.success('Emprendimiento publicado correctamente.');
        navigate(ADMIN_PATHS.emprendimientos);
        return;
      }
      if (wasNew) {
        toast.success('Emprendimiento guardado. Ya puede subir imágenes en la galería.');
        return;
      }
      toast.success('Emprendimiento guardado correctamente.');
      navigate(ADMIN_PATHS.emprendimientos);
    } catch (err) {
      if (err.fieldErrors) setErrors(err.fieldErrors);
      setError(err.message || 'Error al guardar el emprendimiento.');
    }
  };

  if (loading) {
    return <div className="form-container"><div className="loader" /></div>;
  }

  return (
    <div className="atractivo-form-page">
      <div className="form-header">
        <h1>{entityId ? `Editar: ${formData.general.nombre}` : 'Nuevo emprendimiento'}</h1>
        <select
          value={formData.estado_publicacion_codigo}
          onChange={(e) => setFormData((prev) => ({ ...prev, estado_publicacion_codigo: e.target.value }))}
        >
          <option value="borrador">Borrador</option>
          <option value="publicado">Publicado</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      {error && <FormValidationBanner message={error} errors={errors} />}

      <div className="tabs-content" style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        <h2>Datos generales</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Nombre *</label>
            <input
              value={formData.general.nombre}
              className={fieldClass(errors['general.nombre'])}
              onChange={(e) => setFormData((prev) => ({
                ...prev,
                general: { ...prev.general, nombre: e.target.value },
              }))}
            />
            <FieldError error={errors['general.nombre']} />
          </div>
          <CreatableCombobox
            label="Parroquia *"
            options={catalogs.parroquias}
            error={errors['general.parroquia_id']}
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
            <input
              value={formData.general.telefono || ''}
              className={fieldClass(errors['general.telefono'])}
              onChange={(e) => setFormData((prev) => ({
              ...prev, general: { ...prev.general, telefono: filterDigitsOnly(e.target.value) },
            }))}
            />
            <FieldError error={errors['general.telefono']} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.general.email || ''}
              className={fieldClass(errors['general.email'])}
              onChange={(e) => setFormData((prev) => ({
              ...prev, general: { ...prev.general, email: e.target.value },
            }))}
            />
            <FieldError error={errors['general.email']} />
          </div>
          <div className="form-group form-full">
            <label>Descripción *</label>
            <textarea
              rows="4"
              value={formData.general.descripcion || ''}
              className={fieldClass(errors['general.descripcion'])}
              onChange={(e) => setFormData((prev) => ({
              ...prev, general: { ...prev.general, descripcion: e.target.value },
            }))}
            />
            <FieldError error={errors['general.descripcion']} />
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
              type="text"
              inputMode="decimal"
              value={formData.ubicacion.latitud ?? ''}
              className={fieldClass(errors['ubicacion.latitud'])}
              onChange={(e) => setFormData((prev) => ({
                ...prev,
                ubicacion: { ...prev.ubicacion, latitud: filterSignedDecimalInput(e.target.value) || null },
              }))}
            />
            <FieldError error={errors['ubicacion.latitud']} />
          </div>
          <div className="form-group">
            <label>Longitud</label>
            <input
              type="text"
              inputMode="decimal"
              value={formData.ubicacion.longitud ?? ''}
              className={fieldClass(errors['ubicacion.longitud'])}
              onChange={(e) => setFormData((prev) => ({
                ...prev,
                ubicacion: { ...prev.ubicacion, longitud: filterSignedDecimalInput(e.target.value) || null },
              }))}
            />
            <FieldError error={errors['ubicacion.longitud']} />
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
        <GalleryUploader
          entidadTipo="emprendimiento"
          entidadId={entityId}
          onEnsureEntity={ensureEntityForGallery}
          onCountChange={setGalleryCount}
          externalError={errors.galeria}
        />
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
