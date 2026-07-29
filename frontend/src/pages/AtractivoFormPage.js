import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CreatableCombobox from '../components/CreatableCombobox';
import LocationMapPicker from '../components/LocationMapPicker';
import GalleryUploader from '../components/GalleryUploader';
import { apiRequest } from '../services/apiClient';
import { ADMIN_PATHS } from '../routes/adminPaths';
import { validateAtractivoForm, getAtractivoErrorTab } from '../utils/adminFormSchemas';
import FormValidationBanner, { FieldError, fieldClass } from '../components/FormValidationBanner';
import { parseCoordinate } from '../utils/formValidation';
import { useToast } from '../context/ToastContext';
import { useSubmitLock } from '../hooks/useSubmitLock';
import '../styles/AtractivoForm.css';

const AtractivoFormPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { id } = useParams();
  const atractivo_id = id ? Number(id) : null;
  const [entityId, setEntityId] = useState(atractivo_id);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(atractivo_id ? true : false);
  const [error, setError] = useState(null);
  const { isSubmitting, withLock } = useSubmitLock();
  
  // Catálogos
  const [catalogs, setCatalogs] = useState({
    categorias: [],
    parroquias: [],
    estados: [],
    servicios: [],
    actividades: [],
  });

  // Formulario
  const [formData, setFormData] = useState({
    general: {
      nombre: '',
      slug: '',
      categoria_id: null,
      categoria_nombre: '',
      parroquia_id: null,
      parroquia_nombre: '',
      descripcion: '',
      direccion: '',
      horario: '',
      precio_referencial: null,
      destacado: false,
    },
    ubicacion: {
      latitud: null,
      longitud: null,
      altitud: null,
    },
    detalle: {
      clima: '',
      temperatura: null,
      precipitacion: null,
      linea_producto: '',
      escenario: '',
      tipo_ingreso: '',
      costo: null,
      formas_pago: '',
      meses_recomendados: '',
      observaciones: '',
    },
    accesibilidad: {
      tipo_via: '',
      estado_via: '',
      tipo_transporte: '',
      tiempo_desplazamiento: '',
      distancia_referencial_km: null,
      posee_senalizacion: false,
      acceso_discapacidad: false,
      observaciones: '',
    },
    conservacion: {
      estado_conservacion: '',
      nivel_seguridad: '',
      posee_senal_internet: false,
      cobertura_operadora: '',
      centro_salud_cercano: '',
      distancia_centro_salud_km: null,
      observaciones: '',
    },
    administracion: {
      tipo_administrador: '',
      institucion_responsable: '',
      nombre_administrador: '',
      cargo: '',
      telefono: '',
      correo: '',
    },
    servicios_ids: [],
    actividades_ids: [],
    estado_publicacion_codigo: 'borrador',
  });

  const [errors, setErrors] = useState({});
  const [galleryCount, setGalleryCount] = useState(0);

  useEffect(() => {
    setEntityId(atractivo_id);
  }, [atractivo_id]);

  useEffect(() => {
    fetchInitialData();
  }, [atractivo_id]);

  const fetchInitialData = async () => {
    try {
      const catalogData = await apiRequest('/api/admin/atractivos/form-data/');
      setCatalogs({
        categorias: catalogData.categorias || [],
        parroquias: catalogData.parroquias || [],
        estados: catalogData.estados || [],
        servicios: catalogData.servicios || [],
        actividades: catalogData.actividades || [],
      });

      if (!atractivo_id) {
        return;
      }

      const data = await apiRequest(`/api/admin/atractivos/${atractivo_id}/form-data/`);
      setFormData((prev) => ({
        ...prev,
        ...data,
        general: {
          ...prev.general,
          ...data.general,
        },
      }));
    } catch (err) {
      setError(`Error al cargar datos: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const upsertCatalogOption = async (endpoint, nombre) => {
    return apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({ nombre }),
    });
  };

  const createCategoria = async (nombre) => {
    const created = await upsertCatalogOption('/api/catalogos/categorias/', nombre);
    setCatalogs((prev) => ({
      ...prev,
      categorias: [...prev.categorias.filter((item) => item.id !== created.id), created],
    }));
    return created;
  };

  const createParroquia = async (nombre) => {
    const created = await upsertCatalogOption('/api/catalogos/parroquias/', nombre);
    setCatalogs((prev) => ({
      ...prev,
      parroquias: [...prev.parroquias.filter((item) => item.id !== created.id), created],
    }));
    return created;
  };

  const handleCategoriaChange = (selection) => {
    setFormData((prev) => ({
      ...prev,
      general: {
        ...prev.general,
        categoria_id: selection?.id || null,
        categoria_nombre: selection?.nombre || '',
      },
    }));

    if (errors['general.categoria_id']) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next['general.categoria_id'];
        return next;
      });
    }
  };

  const handleParroquiaChange = (selection) => {
    setFormData((prev) => ({
      ...prev,
      general: {
        ...prev.general,
        parroquia_id: selection?.id || null,
        parroquia_nombre: selection?.nombre || '',
      },
    }));

    if (errors['general.parroquia_id']) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next['general.parroquia_id'];
        return next;
      });
    }
  };

  const handleInputChange = (tab, field, value) => {
    setFormData(prev => ({
      ...prev,
      [tab]: {
        ...prev[tab],
        [field]: value,
      },
    }));
    
    // Limpiar error del campo
    if (errors[`${tab}.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${tab}.${field}`];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (tab, field, value) => {
    handleInputChange(tab, field, value);
  };

  const handleMultiSelectChange = (field, id, isChecked) => {
    setFormData(prev => ({
      ...prev,
      [field]: isChecked
        ? [...prev[field], id]
        : prev[field].filter(item => item !== id),
    }));
  };

  const handleGenerateSlug = () => {
    const nombre = formData.general.nombre.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/-+/g, '-');
    
    handleInputChange('general', 'slug', nombre);
  };

  const prepareFormData = async () => {
    let general = { ...formData.general };

    if (!general.categoria_id && general.categoria_nombre?.trim()) {
      const created = await createCategoria(general.categoria_nombre.trim());
      general = { ...general, categoria_id: created.id, categoria_nombre: created.nombre };
    }

    if (!general.parroquia_id && general.parroquia_nombre?.trim()) {
      const created = await createParroquia(general.parroquia_nombre.trim());
      general = { ...general, parroquia_id: created.id, parroquia_nombre: created.nombre };
    }

    return { ...formData, general };
  };

  const saveAtractivo = async (preparedFormData, action, { updateUrl = true } = {}) => {
    const currentId = entityId;
    const finalData = {
      ...preparedFormData,
      estado_publicacion_codigo: action === 'publish' ? 'publicado' : 'borrador',
    };

    const url = currentId
      ? `/api/admin/atractivos/${currentId}/edit/`
      : '/api/admin/atractivos/new/';

    const result = await apiRequest(url, {
      method: currentId ? 'PUT' : 'POST',
      body: JSON.stringify(finalData),
    });

    if (result?.id && !currentId && updateUrl) {
      setEntityId(result.id);
      navigate(ADMIN_PATHS.atractivoEditar(result.id), { replace: true });
    }

    return result;
  };

  const ensureEntityForGallery = async () => {
    if (entityId) return entityId;

    let preparedFormData;
    try {
      preparedFormData = await prepareFormData();
    } catch (err) {
      setError(err.message);
      throw err;
    }

    const validation = validateAtractivoForm(preparedFormData, {
      publish: false,
      imageCount: galleryCount,
      entityId: null,
    });

    if (!validation.valid) {
      setFormData(preparedFormData);
      setErrors(validation.errors);
      setError(validation.banner || 'Complete nombre, categoría, parroquia y descripción para subir imágenes.');
      setActiveTab(getAtractivoErrorTab(validation.errors));
      throw new Error('validation');
    }

    setErrors({});
    setFormData(preparedFormData);
    const result = await saveAtractivo(preparedFormData, 'draft');
    const newId = result?.id || entityId;
    if (!newId) {
      throw new Error('No se pudo crear el registro para la galería.');
    }
    setEntityId(newId);
    return newId;
  };

  const handleSubmit = async (action) => {
    await withLock(async () => {
      setError(null);

      let preparedFormData;
      try {
        preparedFormData = await prepareFormData();
      } catch (err) {
        setError(err.message);
        return;
      }

      const isPublish = action === 'publish';

      const validation = validateAtractivoForm(preparedFormData, {
        publish: isPublish,
        imageCount: galleryCount,
        entityId: entityId,
      });

      if (!validation.valid) {
        setFormData(preparedFormData);
        setErrors(validation.errors);
        setError(validation.banner || validation.message);
        setActiveTab(getAtractivoErrorTab(validation.errors));
        return;
      }

      setErrors({});

      try {
        const wasNew = !entityId;
        setFormData(preparedFormData);
        await saveAtractivo(preparedFormData, action, { updateUrl: wasNew });

        toast.success(`Atractivo ${action === 'publish' ? 'publicado' : 'guardado'} exitosamente`);
        if (wasNew) return;
        navigate(ADMIN_PATHS.atractivos);
      } catch (err) {
        if (err.fieldErrors) setErrors(err.fieldErrors);
        setError(`Error: ${err.message}`);
      }
    });
  };

  if (loading) {
    return <div className="form-container"><div className="loader"></div></div>;
  }

  return (
    <div className="atractivo-form-page">
      <div className="form-header">
        <h1>{entityId ? `Editar: ${formData.general.nombre}` : 'Nuevo Atractivo'}</h1>
        <select 
          value={formData.estado_publicacion_codigo}
          onChange={(e) => handleInputChange('', 'estado_publicacion_codigo', e.target.value)}
          className="state-dropdown"
        >
          <option value="borrador">Borrador</option>
          <option value="publicado">Publicado</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      {error && <FormValidationBanner message={error} errors={errors} />}

      <div className="tabs-container">
        <div className="tabs-header">
          {['Datos Generales', 'Ubicación', 'Características', 'Accesibilidad', 
            'Conservación', 'Administración', 'Servicios', 'Galería'].map((tab, idx) => {
            const tabPrefixes = { 0: 'general.', 1: 'ubicacion.', 5: 'administracion.', 7: 'galeria' };
            const prefix = tabPrefixes[idx];
            const hasTabError = prefix
              ? Object.keys(errors).some((k) => k === 'galeria' ? prefix === 'galeria' : k.startsWith(prefix))
              : false;
            return (
            <button
              key={idx}
              type="button"
              className={`tab-button ${activeTab === idx ? 'active' : ''} ${hasTabError ? 'tab-has-error' : ''}`}
              onClick={() => setActiveTab(idx)}
            >
              {tab}
              {hasTabError && <span className="tab-error-dot">!</span>}
            </button>
          );})}
        </div>

        <div className="tabs-content">
          {/* Tab 0: Datos Generales */}
          {activeTab === 0 && (
            <div className="tab-pane">
              <h2>Datos Generales</h2>
              <form className="form-grid">
                <div className="form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={formData.general.nombre}
                    onChange={(e) => handleInputChange('general', 'nombre', e.target.value)}
                    onBlur={handleGenerateSlug}
                    className={errors['general.nombre'] ? 'input-error' : ''}
                  />
                  {errors['general.nombre'] && <span className="error-text">{errors['general.nombre']}</span>}
                </div>

                <div className="form-group">
                  <label>Slug *</label>
                  <input
                    type="text"
                    value={formData.general.slug}
                    onChange={(e) => handleInputChange('general', 'slug', e.target.value)}
                    className={errors['general.slug'] ? 'input-error' : ''}
                  />
                  {errors['general.slug'] && <span className="error-text">{errors['general.slug']}</span>}
                </div>

                <CreatableCombobox
                  label="Categoría *"
                  options={catalogs.categorias}
                  value={
                    formData.general.categoria_id
                      ? {
                          id: formData.general.categoria_id,
                          nombre:
                            formData.general.categoria_nombre ||
                            catalogs.categorias.find((item) => item.id === formData.general.categoria_id)?.nombre ||
                            '',
                        }
                      : formData.general.categoria_nombre
                        ? { nombre: formData.general.categoria_nombre }
                        : null
                  }
                  onChange={handleCategoriaChange}
                  onCreateOption={createCategoria}
                  error={errors['general.categoria_id']}
                  placeholder="Escribe o selecciona una categoría"
                />

                <CreatableCombobox
                  label="Parroquia *"
                  options={catalogs.parroquias}
                  value={
                    formData.general.parroquia_id
                      ? {
                          id: formData.general.parroquia_id,
                          nombre:
                            formData.general.parroquia_nombre ||
                            catalogs.parroquias.find((item) => item.id === formData.general.parroquia_id)?.nombre ||
                            '',
                        }
                      : formData.general.parroquia_nombre
                        ? { nombre: formData.general.parroquia_nombre }
                        : null
                  }
                  onChange={handleParroquiaChange}
                  onCreateOption={createParroquia}
                  error={errors['general.parroquia_id']}
                  placeholder="Escribe o selecciona una parroquia"
                />

                <div className="form-group form-full">
                  <label>Descripción *</label>
                  <textarea
                    value={formData.general.descripcion}
                    onChange={(e) => handleInputChange('general', 'descripcion', e.target.value)}
                    rows="4"
                    className={errors['general.descripcion'] ? 'input-error' : ''}
                  ></textarea>
                  {errors['general.descripcion'] && <span className="error-text">{errors['general.descripcion']}</span>}
                </div>

                <div className="form-group form-full">
                  <label>Dirección</label>
                  <input
                    type="text"
                    value={formData.general.direccion}
                    onChange={(e) => handleInputChange('general', 'direccion', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Horario</label>
                  <input
                    type="text"
                    placeholder="Ej: Lunes a Domingo 8:00-18:00"
                    value={formData.general.horario}
                    onChange={(e) => handleInputChange('general', 'horario', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Precio Referencial</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.general.precio_referencial || ''}
                    onChange={(e) => handleInputChange('general', 'precio_referencial', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>

                <div className="form-group form-full">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.general.destacado)}
                      onChange={(e) => handleCheckboxChange('general', 'destacado', e.target.checked)}
                    />
                    Mostrar como destacado en el inicio
                  </label>
                  <p className="section-note" style={{ marginTop: 6 }}>
                    Si está activo, este atractivo puede aparecer en la sección “Destinos destacados” del portal.
                  </p>
                </div>
              </form>
            </div>
          )}

          {/* Tab 1: Ubicación */}
          {activeTab === 1 && (
            <div className="tab-pane">
              <h2>Ubicación GPS</h2>
              <form className="form-grid">
                <div className="form-group">
                  <label>Latitud {formData.estado_publicacion_codigo === 'publicado' && '*'}</label>
                  <input
                    type="number"
                    step="0.000001"
                    className={fieldClass(errors['ubicacion.latitud'])}
                    value={formData.ubicacion.latitud || ''}
                    onChange={(e) => handleInputChange('ubicacion', 'latitud', parseCoordinate(e.target.value))}
                  />
                  <FieldError error={errors['ubicacion.latitud']} />
                </div>

                <div className="form-group">
                  <label>Longitud {formData.estado_publicacion_codigo === 'publicado' && '*'}</label>
                  <input
                    type="number"
                    step="0.000001"
                    className={fieldClass(errors['ubicacion.longitud'])}
                    value={formData.ubicacion.longitud || ''}
                    onChange={(e) => handleInputChange('ubicacion', 'longitud', parseCoordinate(e.target.value))}
                  />
                  <FieldError error={errors['ubicacion.longitud']} />
                </div>

                <div className="form-group">
                  <label>Altitud (metros)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.ubicacion.altitud || ''}
                    onChange={(e) => handleInputChange('ubicacion', 'altitud', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>
              </form>
              <LocationMapPicker
                latitud={formData.ubicacion.latitud}
                longitud={formData.ubicacion.longitud}
                onChange={({ latitud, longitud }) => {
                  handleInputChange('ubicacion', 'latitud', latitud);
                  handleInputChange('ubicacion', 'longitud', longitud);
                }}
              />
            </div>
          )}

          {/* Tab 2: Características */}
          {activeTab === 2 && (
            <div className="tab-pane">
              <h2>Características</h2>
              <form className="form-grid">
                <div className="form-group">
                  <label>Clima</label>
                  <input
                    type="text"
                    value={formData.detalle.clima}
                    onChange={(e) => handleInputChange('detalle', 'clima', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Temperatura (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.detalle.temperatura || ''}
                    onChange={(e) => handleInputChange('detalle', 'temperatura', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>

                <div className="form-group">
                  <label>Precipitación (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.detalle.precipitacion || ''}
                    onChange={(e) => handleInputChange('detalle', 'precipitacion', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>

                <div className="form-group">
                  <label>Línea de Producto</label>
                  <input
                    type="text"
                    value={formData.detalle.linea_producto}
                    onChange={(e) => handleInputChange('detalle', 'linea_producto', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Escenario</label>
                  <input
                    type="text"
                    value={formData.detalle.escenario}
                    onChange={(e) => handleInputChange('detalle', 'escenario', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Ingreso</label>
                  <select
                    value={formData.detalle.tipo_ingreso}
                    onChange={(e) => handleInputChange('detalle', 'tipo_ingreso', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="pagado">Pagado</option>
                    <option value="gratuito">Gratuito</option>
                    <option value="donativo">Donativo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Costo</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.detalle.costo || ''}
                    onChange={(e) => handleInputChange('detalle', 'costo', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>

                <div className="form-group">
                  <label>Formas de Pago</label>
                  <input
                    type="text"
                    placeholder="Ej: Efectivo, Tarjeta, QR"
                    value={formData.detalle.formas_pago}
                    onChange={(e) => handleInputChange('detalle', 'formas_pago', e.target.value)}
                  />
                </div>

                <div className="form-group form-full">
                  <label>Meses Recomendados</label>
                  <input
                    type="text"
                    placeholder="Ej: Enero, Febrero, Marzo"
                    value={formData.detalle.meses_recomendados}
                    onChange={(e) => handleInputChange('detalle', 'meses_recomendados', e.target.value)}
                  />
                </div>

                <div className="form-group form-full">
                  <label>Observaciones</label>
                  <textarea
                    value={formData.detalle.observaciones}
                    onChange={(e) => handleInputChange('detalle', 'observaciones', e.target.value)}
                    rows="3"
                  ></textarea>
                </div>
              </form>
            </div>
          )}

          {/* Tab 3: Accesibilidad */}
          {activeTab === 3 && (
            <div className="tab-pane">
              <h2>Accesibilidad</h2>
              <form className="form-grid">
                <div className="form-group">
                  <label>Tipo de Vía</label>
                  <input
                    type="text"
                    value={formData.accesibilidad.tipo_via}
                    onChange={(e) => handleInputChange('accesibilidad', 'tipo_via', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Estado de la Vía</label>
                  <select
                    value={formData.accesibilidad.estado_via}
                    onChange={(e) => handleInputChange('accesibilidad', 'estado_via', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="excelente">Excelente</option>
                    <option value="bueno">Bueno</option>
                    <option value="regular">Regular</option>
                    <option value="malo">Malo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Tipo de Transporte</label>
                  <input
                    type="text"
                    placeholder="Ej: Carro, Moto, A pie"
                    value={formData.accesibilidad.tipo_transporte}
                    onChange={(e) => handleInputChange('accesibilidad', 'tipo_transporte', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Tiempo de Desplazamiento</label>
                  <input
                    type="text"
                    placeholder="Ej: 30 minutos"
                    value={formData.accesibilidad.tiempo_desplazamiento}
                    onChange={(e) => handleInputChange('accesibilidad', 'tiempo_desplazamiento', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Distancia Referencial (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.accesibilidad.distancia_referencial_km || ''}
                    onChange={(e) => handleInputChange('accesibilidad', 'distancia_referencial_km', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.accesibilidad.posee_senalizacion}
                      onChange={(e) => handleCheckboxChange('accesibilidad', 'posee_senalizacion', e.target.checked)}
                    />
                    Posee Señalización
                  </label>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.accesibilidad.acceso_discapacidad}
                      onChange={(e) => handleCheckboxChange('accesibilidad', 'acceso_discapacidad', e.target.checked)}
                    />
                    Acceso para Discapacitados
                  </label>
                </div>

                <div className="form-group form-full">
                  <label>Observaciones</label>
                  <textarea
                    value={formData.accesibilidad.observaciones}
                    onChange={(e) => handleInputChange('accesibilidad', 'observaciones', e.target.value)}
                    rows="3"
                  ></textarea>
                </div>
              </form>
            </div>
          )}

          {/* Tab 4: Conservación */}
          {activeTab === 4 && (
            <div className="tab-pane">
              <h2>Conservación y Seguridad</h2>
              <form className="form-grid">
                <div className="form-group">
                  <label>Estado de Conservación</label>
                  <select
                    value={formData.conservacion.estado_conservacion}
                    onChange={(e) => handleInputChange('conservacion', 'estado_conservacion', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="excelente">Excelente</option>
                    <option value="bueno">Bueno</option>
                    <option value="regular">Regular</option>
                    <option value="malo">Malo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Nivel de Seguridad</label>
                  <select
                    value={formData.conservacion.nivel_seguridad}
                    onChange={(e) => handleInputChange('conservacion', 'nivel_seguridad', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="alto">Alto</option>
                    <option value="medio">Medio</option>
                    <option value="bajo">Bajo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.conservacion.posee_senal_internet}
                      onChange={(e) => handleCheckboxChange('conservacion', 'posee_senal_internet', e.target.checked)}
                    />
                    Posee Señal de Internet
                  </label>
                </div>

                <div className="form-group">
                  <label>Cobertura Operadora</label>
                  <input
                    type="text"
                    placeholder="Ej: Claro, Movistar, CNT"
                    value={formData.conservacion.cobertura_operadora}
                    onChange={(e) => handleInputChange('conservacion', 'cobertura_operadora', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Centro de Salud Cercano</label>
                  <input
                    type="text"
                    value={formData.conservacion.centro_salud_cercano}
                    onChange={(e) => handleInputChange('conservacion', 'centro_salud_cercano', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Distancia Centro de Salud (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.conservacion.distancia_centro_salud_km || ''}
                    onChange={(e) => handleInputChange('conservacion', 'distancia_centro_salud_km', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </div>

                <div className="form-group form-full">
                  <label>Observaciones</label>
                  <textarea
                    value={formData.conservacion.observaciones}
                    onChange={(e) => handleInputChange('conservacion', 'observaciones', e.target.value)}
                    rows="3"
                  ></textarea>
                </div>
              </form>
            </div>
          )}

          {/* Tab 5: Administración */}
          {activeTab === 5 && (
            <div className="tab-pane">
              <h2>Administración</h2>
              <form className="form-grid">
                <div className="form-group">
                  <label>Tipo de Administrador</label>
                  <select
                    value={formData.administracion.tipo_administrador}
                    onChange={(e) => handleInputChange('administracion', 'tipo_administrador', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="publico">Público</option>
                    <option value="privado">Privado</option>
                    <option value="comunitario">Comunitario</option>
                  </select>
                </div>

                <div className="form-group form-full">
                  <label>Institución Responsable</label>
                  <input
                    type="text"
                    value={formData.administracion.institucion_responsable}
                    onChange={(e) => handleInputChange('administracion', 'institucion_responsable', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Nombre del Administrador</label>
                  <input
                    type="text"
                    value={formData.administracion.nombre_administrador}
                    onChange={(e) => handleInputChange('administracion', 'nombre_administrador', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Cargo</label>
                  <input
                    type="text"
                    value={formData.administracion.cargo}
                    onChange={(e) => handleInputChange('administracion', 'cargo', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={formData.administracion.telefono}
                    onChange={(e) => handleInputChange('administracion', 'telefono', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Correo</label>
                  <input
                    type="email"
                    value={formData.administracion.correo}
                    onChange={(e) => handleInputChange('administracion', 'correo', e.target.value)}
                  />
                </div>
              </form>
            </div>
          )}

          {/* Tab 6: Servicios y Actividades */}
          {activeTab === 6 && (
            <div className="tab-pane">
              <h2>Servicios y Actividades</h2>
              <div className="form-section">
                <h3>Servicios Disponibles</h3>
                <div className="multi-select-grid">
                  {catalogs.servicios.map(servicio => (
                    <label key={servicio.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.servicios_ids.includes(servicio.id)}
                        onChange={(e) => handleMultiSelectChange('servicios_ids', servicio.id, e.target.checked)}
                      />
                      {servicio.nombre}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <h3>Actividades Disponibles</h3>
                <div className="multi-select-grid">
                  {catalogs.actividades.map(actividad => (
                    <label key={actividad.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.actividades_ids.includes(actividad.id)}
                        onChange={(e) => handleMultiSelectChange('actividades_ids', actividad.id, e.target.checked)}
                      />
                      {actividad.nombre}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 7: Galería */}
          {activeTab === 7 && (
            <div className="tab-pane">
              <h2>Galería de Imágenes</h2>
              <GalleryUploader
                entidadTipo="atractivo"
                entidadId={entityId}
                onEnsureEntity={ensureEntityForGallery}
                onCountChange={setGalleryCount}
                externalError={errors.galeria}
              />
            </div>
          )}
        </div>
      </div>

      <div className="form-footer">
        <button 
          onClick={() => navigate(ADMIN_PATHS.atractivos)}
          className="btn-secondary"
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button 
          onClick={() => handleSubmit('draft')}
          className="btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Borrador'}
        </button>
        <button 
          onClick={() => handleSubmit('publish')}
          className="btn-success"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Publicando...' : 'Guardar y Publicar'}
        </button>
      </div>
    </div>
  );
};

export default AtractivoFormPage;
