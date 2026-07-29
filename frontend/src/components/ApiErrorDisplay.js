import { getDisplayError, isAdminUser } from '../services/errorService';

export default function ApiErrorDisplay({ error, title }) {
  if (!error) return null;
  const { user, technical, fieldErrors } = getDisplayError(error, {
    showTechnical: isAdminUser(),
  });

  return (
    <div className="api-error-display" role="alert">
      {title && <strong>{title}</strong>}
      <p>{user}</p>
      {fieldErrors && Object.keys(fieldErrors).length > 0 && (
        <ul className="api-error-field-list">
          {Object.entries(fieldErrors).map(([field, msg]) => (
            <li key={field}><code>{field}</code>: {msg}</li>
          ))}
        </ul>
      )}
      {technical && (
        <details className="api-error-technical">
          <summary>Detalle técnico (administrador)</summary>
          <pre>{technical}</pre>
        </details>
      )}
    </div>
  );
}
