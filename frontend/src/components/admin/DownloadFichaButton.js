import { useState } from 'react';
import { downloadRecordFicha } from '../../services/adminDetail.service';
import { useToast } from '../../context/ToastContext';

function DownloadFichaButton({
  type,
  id,
  formato = 'pdf',
  className = '',
  label,
  compact = false,
  onError,
}) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleClick = async (e) => {
    e?.stopPropagation?.();
    if (!id || loading) return;
    setLoading(true);
    try {
      await downloadRecordFicha(type, id, formato);
    } catch (err) {
      const message = err.userMessage || err.message || 'No se pudo descargar la ficha.';
      if (onError) {
        onError(message);
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const defaultLabel = formato === 'word' ? 'Word' : 'Descargar';
  const displayLabel = loading ? '…' : (label || (compact ? '⬇️' : defaultLabel));

  return (
    <button
      type="button"
      className={className || `action-btn action-btn--download${compact ? ' action-btn--compact' : ''}`}
      onClick={handleClick}
      disabled={loading}
      title={formato === 'word' ? 'Descargar ficha en Word' : 'Descargar ficha en PDF'}
      aria-label={formato === 'word' ? 'Descargar Word' : 'Descargar PDF'}
    >
      {displayLabel}
    </button>
  );
}

export default DownloadFichaButton;
