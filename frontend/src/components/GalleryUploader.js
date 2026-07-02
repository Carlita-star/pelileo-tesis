import { useEffect, useState } from 'react';
import { getApiBase, getAuthHeaders } from '../services/apiClient';
import { useErrorToast } from '../hooks/useErrorToast';

function GalleryUploader({
  entidadTipo,
  entidadId,
  onEnsureEntity,
  onCountChange,
  externalError,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [activeEntityId, setActiveEntityId] = useState(entidadId ?? null);

  useEffect(() => {
    if (entidadId) {
      setActiveEntityId(entidadId);
    }
  }, [entidadId]);

  const effectiveEntityId = entidadId || activeEntityId;

  const resolveUrl = (item) => {
    if (item.url?.startsWith('http')) {
      return item.url;
    }
    return `${getApiBase()}${item.url || `/media/${item.archivo}`}`;
  };

  const loadGallery = async (targetId = effectiveEntityId) => {
    if (!targetId) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${getApiBase()}/api/admin/multimedia/?entidad_tipo=${entidadTipo}&entidad_id=${targetId}`,
        { headers: getAuthHeaders(false) },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudo cargar la galería');
      }
      const results = data.results || [];
      setItems(results);
      onCountChange?.(results.length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!effectiveEntityId) {
      setItems([]);
      onCountChange?.(0);
      return;
    }
    loadGallery(effectiveEntityId);
  }, [entidadTipo, effectiveEntityId]);

  const resolveEntityId = async () => {
    if (effectiveEntityId) return effectiveEntityId;
    if (!onEnsureEntity) return null;
    setPreparing(true);
    setError('');
    try {
      const id = await onEnsureEntity();
      if (id) setActiveEntityId(id);
      return id || null;
    } catch (err) {
      if (err.message !== 'validation') {
        setError(err.userMessage || err.message || 'No se pudo preparar el registro para subir imágenes.');
      }
      return null;
    } finally {
      setPreparing(false);
    }
  };

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError('');
    try {
      const targetId = await resolveEntityId();
      if (!targetId) return;

      let currentCount = items.length;
      if (!effectiveEntityId) {
        const response = await fetch(
          `${getApiBase()}/api/admin/multimedia/?entidad_tipo=${entidadTipo}&entidad_id=${targetId}`,
          { headers: getAuthHeaders(false) },
        );
        const data = await response.json();
        currentCount = (data.results || []).length;
      }

      for (const file of files) {
        const formData = new FormData();
        formData.append('entidad_tipo', entidadTipo);
        formData.append('entidad_id', String(targetId));
        formData.append('archivo', file);
        formData.append('principal', currentCount === 0 ? 'true' : 'false');

        const response = await fetch(`${getApiBase()}/api/admin/multimedia/upload/`, {
          method: 'POST',
          headers: getAuthHeaders(false),
          body: formData,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          const msg = data.error || (
            response.status === 413
              ? 'El archivo excede el tamaño máximo permitido.'
              : response.status === 400
                ? 'Formato de imagen no válido. Use JPG, PNG o WEBP.'
                : `No se pudo subir la imagen (${response.status}).`
          );
          throw new Error(msg);
        }
        currentCount += 1;
      }

      await loadGallery(targetId);
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

  const busy = uploading || preparing;

  useErrorToast(error);

  return (
    <div className={`gallery-uploader ${externalError ? 'gallery-uploader-error' : ''}`}>
      {!effectiveEntityId && onEnsureEntity && (
        <p className="section-note gallery-uploader-hint">
          Puede subir imágenes directamente. Al cargar la primera foto, el registro se guardará
          automáticamente como borrador (requiere nombre, parroquia y descripción).
        </p>
      )}

      <label className={`upload-zone ${externalError ? 'input-error' : ''}`}>
        <input type="file" accept="image/*" multiple onChange={handleUpload} disabled={busy} />
        <p>
          {preparing
            ? 'Preparando registro...'
            : uploading
              ? 'Subiendo imágenes...'
              : 'Arrastra imágenes aquí o haz clic para seleccionar'}
        </p>
      </label>

      {externalError && <p className="error-text">{externalError}</p>}
      {loading ? (
        <p className="section-note">Cargando galería...</p>
      ) : effectiveEntityId && items.length === 0 ? (
        <p className="section-note">No hay imágenes en la galería.</p>
      ) : items.length > 0 ? (
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
      ) : null}
    </div>
  );
}

export default GalleryUploader;
