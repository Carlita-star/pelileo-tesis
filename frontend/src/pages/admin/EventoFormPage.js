import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import LocationMapPicker from '../../components/LocationMapPicker';
import GalleryUploader from '../../components/GalleryUploader';
import { apiRequest } from '../../services/apiClient';
import { ADMIN_PATHS } from '../../routes/adminPaths';
import '../../styles/AtractivoForm.css';

function toDatetimeLocal(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoDatetime(localValue) {
  if (!localValue) return null;
  return localValue.length === 16 ? `${localValue}:00` : localValue;
}

function EventoFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const eventoId = id ? Number(id) : null;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [catalogs, setCatalogs] = useState({ categorias: [], estados: [] });
  const [formData, setFormData] = useState({
    nombre: '',
    categoria_id: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    direccion: '',
    latitud: null,
    longitud: null,
    costo: '',
    organizador: '',
    contacto: '',
    estado_publicacion_codigo: 'borrador',
  });

  useEffect(() => {
    loadData();
  }, [eventoId]);

  useEffect(() => {
    if (location.state?.saved) {
      setSuccess(
        eventoId
          ? `Evento "${location.state.nombre || ''}" guardado. Ya puede subir la imagen.`
          : `Evento "${location.state.nombre || ''}" guardado correctamente.`,
      );
    }
  }, [location.state, eventoId]);

  const loadData = async () => {
    try {
      const catalogData = await apiRequest('/api/admin/eventos/form-data/');
      setCatalogs(catalogData);
      if (!eventoId) {
        setLoading(false);
        return;
      }
      const data = await apiRequest(`/api/admin/eventos/${eventoId}/form-data/`);
      setFormData({
        nombre: data.nombre || '',
        categoria_id: data.categoria_id ? String(data.categoria_id) : '',
        descripcion: data.descripcion || '',
        fecha_inicio: toDatetimeLocal(data.fecha_inicio),
        fecha_fin: toDatetimeLocal(data.fecha_fin),
        direccion: data.direccion || '',
        latitud: data.latitud ?? null,
        longitud: data.longitud ?? null,
        costo: data.costo ?? '',
        organizador: data.organizador || '',
        contacto: data.contacto || '',
        estado_publicacion_codigo: data.estado_publicacion_codigo || 'borrador',
      });
    } catch (err) {
      setError(err.message || 'No se pudo cargar el evento.');
    } finally {
      setLoading(false);
    }
  };

  const validateFechas = () => {
    if (formData.fecha_inicio && formData.fecha_fin) {
      if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
        throw new Error('La fecha fin no puede ser anterior a la fecha inicio.');
      }
    }
  };

  const buildPayload = (publish) => ({
    nombre: formData.nombre.trim(),
    categoria_id: Number(formData.categoria_id),
    descripcion: formData.descripcion,
    fecha_inicio: toIsoDatetime(formData.fecha_inicio),
    fecha_fin: toIsoDatetime(formData.fecha_fin),
    direccion: formData.direccion,
    latitud: formData.latitud,
    longitud: formData.longitud,
    costo: formData.costo === '' || formData.costo == null ? null : Number(formData.costo),
    organizador: formData.organizador,
    contacto: formData.contacto,
    estado_publicacion_codigo: publish ? 'publicado' : formData.estado_publicacion_codigo,
  });

  const handleSave = async (publish = false) => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      if (!formData.nombre.trim()) {
        throw new Error('El nombre del evento es obligatorio.');
      }
      if (!formData.categoria_id) {
        throw new Error('Seleccione una categoría.');
      }
      validateFechas();

      const url = eventoId
        ? `/api/admin/eventos/${eventoId}/edit/`
        : '/api/admin/eventos/new/';
      const result = await apiRequest(url, {
        method: eventoId ? 'PUT' : 'POST',
        body: JSON.stringify(buildPayload(publish)),
      });

      if (!eventoId && result?.id) {
        navigate(ADMIN_PATHS.eventoEditar(result.id), {
          replace: true,
          state: { saved: true, nombre: result.nombre || formData.nombre },
        });
        return;
      }

      navigate(ADMIN_PATHS.eventos, {
        replace: true,
        state: { saved: true, nombre: result.nombre || formData.nombre },
      });
    } catch (err) {
      setError(err.message || 'Error al guardar el evento.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const estados = catalogs.estados.length ? catalogs.estados : [
    { codigo: 'borrador', nombre: 'Borrador' },
    { codigo: 'publicado', nombre: 'Publicado' },
    { codigo: 'inactivo', nombre: 'Inactivo' },
  ];

  if (loading) {
    return (
      <div className="form-container">
        <div className="loader" />
      </div>
    );
  }

  return (
    <div className="atractivo-form-page">
      <div className="form-header">
        <h1>{eventoId ? `Editar: ${formData.nombre}` : 'Nuevo evento'}</h1>
        <select
          value={formData.estado_publicacion_codigo}
          onChange={(e) => setFormData((prev) => ({
            ...prev,
            estado_publicacion_codigo: e.target.value,
          }))}
        >
          {estados.map((est) => (
            <option key={est.codigo} value={est.codigo}>{est.nombre}</option>
          ))}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && (
        <div className="error-message" style={{ background: '#e8f7ee', color: '#1f6b3f', borderColor: '#b8e6c8' }}>
          {success}
        </div>
      )}

      <div className="tabs-content" style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
        <h2>Datos del evento</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Nombre *</label>
            <input
              value={formData.nombre}
              onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Categoría *</label>
            <select
              value={formData.categoria_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, categoria_id: e.target.value }))}
            >
              <option value="">Seleccione una categoría</option>
              {catalogs.categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            {catalogs.categorias.length === 0 && (
              <p className="section-note" style={{ marginTop: 8 }}>
                No hay categorías. Ejecute en el backend: python manage.py setup_dev
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Fecha inicio</label>
            <input
              type="datetime-local"
              value={formData.fecha_inicio}
              onChange={(e) => setFormData((prev) => ({ ...prev, fecha_inicio: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Fecha fin</label>
            <input
              type="datetime-local"
              value={formData.fecha_fin}
              min={formData.fecha_inicio || undefined}
              onChange={(e) => setFormData((prev) => ({ ...prev, fecha_fin: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Costo (USD)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.costo}
              onChange={(e) => setFormData((prev) => ({ ...prev, costo: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Organizador</label>
            <input
              value={formData.organizador}
              onChange={(e) => setFormData((prev) => ({ ...prev, organizador: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label>Contacto</label>
            <input
              value={formData.contacto}
              onChange={(e) => setFormData((prev) => ({ ...prev, contacto: e.target.value }))}
            />
          </div>

          <div className="form-group form-full">
            <label>Descripción</label>
            <textarea
              rows="4"
              value={formData.descripcion}
              onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
            />
          </div>

          <div className="form-group form-full">
            <label>Dirección</label>
            <input
              value={formData.direccion}
              onChange={(e) => setFormData((prev) => ({ ...prev, direccion: e.target.value }))}
            />
          </div>
        </div>

        <h2 style={{ marginTop: 24 }}>Ubicación GPS</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>Latitud</label>
            <input
              type="number"
              step="0.000001"
              value={formData.latitud ?? ''}
              onChange={(e) => setFormData((prev) => ({
                ...prev,
                latitud: e.target.value ? Number(e.target.value) : null,
              }))}
            />
          </div>
          <div className="form-group">
            <label>Longitud</label>
            <input
              type="number"
              step="0.000001"
              value={formData.longitud ?? ''}
              onChange={(e) => setFormData((prev) => ({
                ...prev,
                longitud: e.target.value ? Number(e.target.value) : null,
              }))}
            />
          </div>
        </div>
        <LocationMapPicker
          latitud={formData.latitud}
          longitud={formData.longitud}
          onChange={({ latitud, longitud }) => setFormData((prev) => ({
            ...prev,
            latitud,
            longitud,
          }))}
        />

        <h2 style={{ marginTop: 24 }}>Imagen</h2>
        {!eventoId ? (
          <p className="section-note">Guarde el evento primero para subir la imagen (tabla multimedia).</p>
        ) : (
          <GalleryUploader entidadTipo="evento" entidadId={eventoId} />
        )}
      </div>

      <div className="form-footer">
        <button type="button" className="btn-secondary" onClick={() => navigate(ADMIN_PATHS.eventos)} disabled={saving}>
          Cancelar
        </button>
        <button type="button" className="btn-secondary" onClick={() => handleSave(false)} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
        <button type="button" className="btn-primary" onClick={() => handleSave(true)} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar y publicar'}
        </button>
      </div>
    </div>
  );
}

export default EventoFormPage;
