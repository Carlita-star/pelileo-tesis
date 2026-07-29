import { useEffect, useState } from 'react';
import ApiErrorDisplay from '../ApiErrorDisplay';
import AtractivoDetailView from './details/AtractivoDetailView';
import RutaDetailView from './details/RutaDetailView';
import EmprendimientoDetailView from './details/EmprendimientoDetailView';
import EventoDetailView from './details/EventoDetailView';
import { ENTITY_LABELS, FICHA_SUPPORTED_TYPES } from '../../services/adminDetail.service';
import DownloadFichaButton from './DownloadFichaButton';
import '../../styles/AdminDetail.css';

const DETAIL_VIEWS = {
  atractivo: AtractivoDetailView,
  ruta: RutaDetailView,
  emprendimiento: EmprendimientoDetailView,
  evento: EventoDetailView,
};

function AdminDetailModal({
  isOpen,
  type,
  id,
  data,
  images,
  loading,
  error,
  imageError,
  onClose,
  onEdit,
}) {
  const [downloadError, setDownloadError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setDownloadError('');
    }
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const DetailView = DETAIL_VIEWS[type];
  const title = data?.general?.nombre || data?.nombre || ENTITY_LABELS[type] || 'Detalle';
  const subtitle = ENTITY_LABELS[type] || '';

  const showContent = !loading && !error && DetailView && data;
  const recordId = data?.id ?? id;
  const canDownload = FICHA_SUPPORTED_TYPES.has(type) && recordId;

  return (
    <div className="admin-detail-overlay" onClick={onClose} role="presentation">
      <div
        className="admin-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="admin-detail-header">
          <div>
            <p className="admin-detail-subtitle">{subtitle}</p>
            <h2 id="admin-detail-title">{loading ? 'Cargando...' : title}</h2>
          </div>
          <div className="admin-detail-header-actions">
            {canDownload && !loading && !error && data && (
              <div className="admin-detail-download-group">
                <DownloadFichaButton
                  type={type}
                  id={recordId}
                  formato="pdf"
                  className="primary-button admin-detail-download-btn"
                  label="Descargar"
                  onError={setDownloadError}
                />
                <DownloadFichaButton
                  type={type}
                  id={recordId}
                  formato="word"
                  className="secondary-button admin-detail-download-format"
                  label="Word"
                  onError={setDownloadError}
                />
              </div>
            )}
            <button type="button" className="admin-detail-close" onClick={onClose} aria-label="Cerrar">
              ✕
            </button>
          </div>
        </header>

        <div className="admin-detail-content">
          {loading && (
            <div className="admin-detail-loading">
              <div className="loader" />
              <p>Cargando información del registro...</p>
            </div>
          )}

          {!loading && error && (
            <ApiErrorDisplay error={error} />
          )}

          {!loading && !error && showContent && (
            <DetailView data={data} images={images} imageError={imageError} />
          )}

          {!loading && !error && !showContent && (
            <p className="admin-detail-empty">No se encontraron datos para mostrar.</p>
          )}
        </div>

        <footer className="admin-detail-footer">
          {downloadError && (
            <p className="admin-detail-download-error">{downloadError}</p>
          )}
          <div className="admin-detail-footer-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cerrar
            </button>
            {canDownload && !loading && !error && data && (
              <div className="admin-detail-download-group">
                <DownloadFichaButton
                  type={type}
                  id={recordId}
                  formato="pdf"
                  className="primary-button admin-detail-download-btn"
                  label="Descargar PDF"
                  onError={setDownloadError}
                />
                <DownloadFichaButton
                  type={type}
                  id={recordId}
                  formato="word"
                  className="secondary-button admin-detail-download-format"
                  label="Word"
                  onError={setDownloadError}
                />
              </div>
            )}
            {onEdit && !loading && !error && data && (
              <button type="button" className="primary-button" onClick={onEdit}>
                Editar registro
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}

export default AdminDetailModal;
