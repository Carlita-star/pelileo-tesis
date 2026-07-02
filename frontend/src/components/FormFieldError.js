export function FieldError({ error }) {
  if (!error) return null;
  return <span className="error-text">{error}</span>;
}

export function fieldClass(error) {
  return error ? 'input-error' : '';
}
