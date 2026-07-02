import { useState } from 'react';
import { getApiBase } from '../../services/apiClient';
import { NA } from '../../utils/detailFormatters';

function resolveImageUrl(item) {
  if (item.url?.startsWith('http')) return item.url;
  return `${getApiBase()}${item.url || `/media/${item.archivo}`}`;
}

function DetailImageGallery({ images = [], error = null }) {
  const [lightbox, setLightbox] = useState(null);
  const [brokenIds, setBrokenIds] = useState(new Set());

  if (error) {
    return <p className="admin-detail-image-error" role="alert">{error}</p>;
  }

  if (!images.length) {
    return <p className="admin-detail-empty">{NA}</p>;
  }

  const visible = images.filter((img) => !brokenIds.has(img.id));

  return (
    <>
      <div className="admin-detail-gallery">
        {images.map((img) => (
          <button
            key={img.id}
            type="button"
            className="admin-detail-gallery-item"
            onClick={() => !brokenIds.has(img.id) && setLightbox(img)}
            aria-label={img.titulo || 'Ampliar imagen'}
          >
            {brokenIds.has(img.id) ? (
              <span className="admin-detail-gallery-broken">Error al cargar</span>
            ) : (
              <img
                src={resolveImageUrl(img)}
                alt={img.titulo || 'Imagen del registro'}
                loading="lazy"
                onError={() => setBrokenIds((prev) => new Set(prev).add(img.id))}
              />
            )}
            {img.principal && <span className="admin-detail-gallery-badge">Principal</span>}
          </button>
        ))}
      </div>
      {visible.length === 0 && images.length > 0 && (
        <p className="admin-detail-image-error">No se pudieron cargar las imágenes del registro.</p>
      )}

      {lightbox && (
        <div
          className="admin-detail-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Vista ampliada"
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => e.key === 'Escape' && setLightbox(null)}
        >
          <button type="button" className="admin-detail-lightbox-close" onClick={() => setLightbox(null)}>
            ✕
          </button>
          <img src={resolveImageUrl(lightbox)} alt={lightbox.titulo || 'Imagen ampliada'} />
        </div>
      )}
    </>
  );
}

export default DetailImageGallery;
