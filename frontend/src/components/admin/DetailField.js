import { displayValue } from '../../utils/detailFormatters';

export function DetailSection({ title, children }) {
  return (
    <section className="admin-detail-section">
      <h3 className="admin-detail-section-title">{title}</h3>
      <div className="admin-detail-grid">{children}</div>
    </section>
  );
}

export function DetailField({ label, value, full = false }) {
  return (
    <div className={`admin-detail-field${full ? ' admin-detail-field--full' : ''}`}>
      <span className="admin-detail-label">{label}</span>
      <span className="admin-detail-value">{displayValue(value)}</span>
    </div>
  );
}

export function DetailTextBlock({ label, value }) {
  return (
    <div className="admin-detail-field admin-detail-field--full">
      <span className="admin-detail-label">{label}</span>
      <p className="admin-detail-text">{displayValue(value)}</p>
    </div>
  );
}
