import { useEffect, useState } from 'react';
import { getApiBase, getAuthHeaders } from '../services/apiClient';

function GalleryUploader({ entidadTipo, entidadId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const resolveUrl = (item) => {
    if (item.url?.startsWith('http')) {
      return item.url;
    }
    return `${getApiBase()}${item.url || `/media/${item.archivo}`}`;
  };

  const loadGallery = async () => {
    if (!entidadId) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${getApiBase()}/api/admin/multimedia/?entidad_tipo=${entidadTipo}&entidad_id=${entidadId}`,
        { headers: getAuthHeaders(false) },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo cargar la galería');
      }
      setItems(data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, [entidadTipo, entidadId]);

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length || !entidadId) return;

    setUploading(true);
    setError('');
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('entidad_tipo', entidadTipo);
        formData.append('entidad_id', String(entidadId));
        formData.append('archivo', file);
        formData.append('principal', items.length === 0 ? 'true' : 'false');

        const response = await fetch(`${getApiBase()}/api/admin/multimedia/upload/`, {
          method: 'POST',
          headers: getAuthHeaders(false),
          body: formData,
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Error al subir imagen');
        }
      }
      await loadGallery();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const setPrincipal = async (id) => {
    try {
      const response = await fetch(`${getApiBase()}/api/admin/multimedia/${id}/principal/`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error('No se pudo marcar como principal');
      }
      await loadGallery();
    } catch (err) {
      setError(err.message);
    }
  };

  const removeImage = async (id) => {
    if (!window.confirm('¿Eliminar esta imagen?')) return;
    try {
      const response = await fetch(`${getApiBase()}/api/admin/multimedia/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(false),
      });
      if (!response.ok) {
        throw new Error('No se pudo eliminar la imagen');
      }
      await loadGallery();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!entidadId) {
    return (
      <p className="section-note">
        Guarda el registro como borrador primero para poder subir imágenes a la galería.
      </p>
    );
  }

  return (
    <div className="gallery-uploader">
      <label className="upload-zone">
        <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={uploading} />
        <p>{uploading ? 'Subiendo imágenes...' : 'Arrastra imágenes aquí o haz clic para seleccionar'}</p>
      </label>

      {error && <p className="status-error">{error}</p>}
      {loading ? (
        <p className="section-note">Cargando galería...</p>
      ) : items.length === 0 ? (
        <p className="section-note">No hay imágenes en la galería.</p>
      ) : (
        <div className="gallery-grid">
          {items.map((item) => (
            <article key={item.id} className={`gallery-item ${item.principal ? 'is-primary' : ''}`}>
              <img src={resolveUrl(item)} alt={item.titulo || 'Imagen'} />
              <div className="gallery-actions">
                {item.principal ? (
                  <span className="gallery-badge">Principal</span>
                ) : (
                  <button type="button" onClick={() => setPrincipal(item.id)}>Marcar principal</button>
                )}
                <button type="button" onClick={() => removeImage(item.id)}>Eliminar</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default GalleryUploader;
