import { useState } from 'react';
import { normalizeMediaUrl } from '../../services/media';
import { NA } from '../../utils/detailFormatters';

function resolveImageUrl(item) {
  return normalizeMediaUrl(item.url || item.archivo);
}

function DetailImageGallery({ images = [], error = null }) {
  const [imgActiva, setImgActiva] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const [brokenIds, setBrokenIds] = useState(new Set());

  if (error) {
    return <p className="admin-detail-image-error" role="alert">{error}</p>;
  }

  if (!images.length) {
    return <p className="admin-detail-empty">{NA}</p>;
  }

  const visible = images.filter((img) => !brokenIds.has(img.id));
  const activa = visible[imgActiva] ?? visible[0];

  return (
    <>
      <div className="admin-detail-gallery-featured">
        {activa ? (
          <button
            type="button"
            className="admin-detail-gallery-hero"
            onClick={() => setLightbox(activa)}
            aria-label="Ampliar imagen principal"
          >
            {brokenIds.has(activa.id) ? (
              <span className="admin-detail-gallery-broken">Error al cargar</span>
            ) : (
              <img
                src={resolveImageUrl(activa)}
                alt={activa.titulo || 'Imagen del registro'}
                onError={() => setBrokenIds((prev) => new Set(prev).add(activa.id))}
              />
            )}
            {activa.principal && <span className="admin-detail-gallery-badge">Principal</span>}
          </button>
        ) : (
          <p className="admin-detail-image-error">No se pudieron cargar las imágenes del registro.</p>
        )}

        {visible.length > 1 && (
          <div className="admin-detail-gallery-thumbs">
            {visible.map((img, i) => (
              <button
                key={img.id}
                type="button"
                className={`admin-detail-gallery-thumb${i === imgActiva ? ' is-active' : ''}`}
                onClick={() => setImgActiva(i)}
                aria-label={img.titulo || `Ver imagen ${i + 1}`}
              >
                <img
                  src={resolveImageUrl(img)}
                  alt={img.titulo || 'Miniatura'}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

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
