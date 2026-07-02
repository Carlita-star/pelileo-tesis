import { useEffect, useRef } from 'react';
import { FieldError, fieldClass } from './FormFieldError';
import { useToast } from '../context/ToastContext';

export { FieldError, fieldClass };

export const REQUIRED_FIELDS_BANNER = 'Por favor, complete todos los campos obligatorios.';

export default function FormValidationBanner({ message, errors = {}, notify = true }) {
  const toast = useToast();
  const lastKey = useRef('');
  const errorCount = Object.keys(errors).length;

  const multiple = errorCount > 1;
  const firstError = Object.values(errors)[0];
  const displayMessage = multiple
    ? `Revise los campos marcados en rojo. Ejemplo: ${firstError}`
    : (message || firstError);
  const hasContent = Boolean(message || errorCount > 0);

  useEffect(() => {
    if (!notify || !hasContent || !displayMessage) return;
    const key = `${message}|${Object.keys(errors).sort().join(',')}`;
    if (key === lastKey.current) return;
    lastKey.current = key;
    toast.error(displayMessage);
  }, [notify, hasContent, displayMessage, message, errors, toast]);

  useEffect(() => {
    if (!hasContent) {
      lastKey.current = '';
    }
  }, [hasContent]);

  if (!hasContent) return null;

  return (
    <div className="form-validation-banner" role="alert">
      <span className="form-validation-banner-icon" aria-hidden="true">⚠</span>
      <div>
        <strong>{multiple ? REQUIRED_FIELDS_BANNER : 'Revise el formulario'}</strong>
        <p className="form-validation-banner-detail">{displayMessage}</p>
      </div>
    </div>
  );
}
