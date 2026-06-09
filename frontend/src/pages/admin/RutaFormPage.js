import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CreatableCombobox from '../../components/CreatableCombobox';
import GalleryUploader from '../../components/GalleryUploader';
import { apiRequest } from '../../services/apiClient';
import { ADMIN_PATHS } from '../../routes/adminPaths';
import '../../styles/AtractivoForm.css';

function RutaFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const rutaId = id ? Number(id) : null;
  const [loading, setLoading] = useState(Boolean(rutaId));
  const [error, setError] = useState('');
  const [catalogs, setCatalogs] = useState({ parroquias: [], estados: [], atractivos: [] });
  const [formData, setFormData] = useState({
    general: {
      nombre: '',
      descripcion: '',
      distancia_km: null,
      duracion_estimada: '',
      dificultad: 'facil',
      punto_inicio: '',
      punto_fin: '',
      parroquia_id: null,
      parroquia_nombre: '',
    },
    atractivos_orden: [],
    estado_publicacion_codigo: 'borrador',
  });

  useEffect(() => {
    loadData();
  }, [rutaId]);

  const loadData = async () => {
    try {
      const catalogData = await apiRequest('/api/admin/rutas/form-data/');
      setCatalogs(catalogData);
      if (!rutaId) return;
      const data = await apiRequest(`/api/admin/rutas/${rutaId}/form-data/`);
      setFormData((prev) => ({ ...prev, ...data, general: { ...prev.general, ...data.general } }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createParroquia = async (nombre) => {
    const created = await apiRequest('/api/catalogos/parroquias/', {
      method: 'POST',
      body: JSON.stringify({ nombre }),
    });
    setCatalogs((prev) => ({
      ...prev,
      parroquias: [...prev.parroquias.filter((p) => p.id !== created.id), created],
    }));
    return created;
  };

  const toggleAtractivo = (atractivoId, checked) => {
    setFormData((prev) => {
      const current = [...prev.atractivos_orden];
      if (checked) {
        return {
          ...prev,
          atractivos_orden: [...current, { atractivo_id: atractivoId, orden: current.length + 1 }],
        };
      }
      return {
        ...prev,
        atractivos_orden: current
          .filter((item) => item.atractivo_id !== atractivoId)
          .map((item, index) => ({ ...item, orden: index + 1 })),
      };
    });
  };

  const handleSave = async (publish) => {
    setError('');
    try {
      const payload = {
        ...formData,
        estado_publicacion_codigo: publish ? 'publicado' : formData.estado_publicacion_codigo,
      };
      const url = rutaId ? `/api/admin/rutas/${rutaId}/edit/` : '/api/admin/rutas/new/';
      const result = await apiRequest(url, {
        method: rutaId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      if (!rutaId && result?.id) {
        navigate(ADMIN_PATHS.rutaEditar(result.id));
        return;
      }
      navigate(ADMIN_PATHS.rutas);
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
        <h1>{rutaId ? `Editar: ${formData.general.nombre}` : 'Nueva ruta'}</h1>
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
        <h2>Datos de la ruta</h2>
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
            onCreateOption={createParroquia}
          />
          <div className="form-group">
            <label>Dificultad</label>
            <select
              value={formData.general.dificultad}
              onChange={(e) => setFormData((prev) => ({
                ...prev,
                general: { ...prev.general, dificultad: e.target.value },
              }))}
            >
              <option value="facil">Fácil</option>
              <option value="moderado">Moderado</option>
              <option value="dificil">Difícil</option>
            </select>
          </div>
          <div className="form-group">
            <label>Distancia (km)</label>
            <input
              type="number"
              value={formData.general.distancia_km ?? ''}
              onChange={(e) => setFormData((prev) => ({
                ...prev,
                general: { ...prev.general, distancia_km: e.target.value ? Number(e.target.value) : null },
              }))}
            />
          </div>
          <div className="form-group form-full">
            <label>Descripción</label>
            <textarea
              rows="4"
              value={formData.general.descripcion || ''}
              onChange={(e) => setFormData((prev) => ({
                ...prev,
                general: { ...prev.general, descripcion: e.target.value },
              }))}
            />
          </div>
        </div>

        <h2 style={{ marginTop: 24 }}>Atractivos de la ruta (mínimo 2 para publicar)</h2>
        <div className="multi-select-grid">
          {catalogs.atractivos.map((atractivo) => (
            <label key={atractivo.id} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.atractivos_orden.some((item) => item.atractivo_id === atractivo.id)}
                onChange={(e) => toggleAtractivo(atractivo.id, e.target.checked)}
              />
              {atractivo.nombre}
            </label>
          ))}
        </div>
        {catalogs.atractivos.length === 0 && (
          <p className="section-note">No hay atractivos publicados para asociar.</p>
        )}

        <h2 style={{ marginTop: 24 }}>Galería</h2>
        <GalleryUploader entidadTipo="ruta" entidadId={rutaId} />
      </div>

      <div className="form-footer">
        <button type="button" className="btn-secondary" onClick={() => navigate(ADMIN_PATHS.rutas)}>Cancelar</button>
        <button type="button" className="btn-secondary" onClick={() => handleSave(false)}>Guardar</button>
        <button type="button" className="btn-primary" onClick={() => handleSave(true)}>Guardar y publicar</button>
      </div>
    </div>
  );
}

export default RutaFormPage;
