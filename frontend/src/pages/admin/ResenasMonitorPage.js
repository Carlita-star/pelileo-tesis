import { useEffect, useState } from 'react';
import { cambiarActivoResena, listarResenasAdmin } from '../../services/resenasAdmin.service';
import { ResumenEstrellas } from '../../components/publico/EstrellasCalificacion';
import ApiErrorDisplay from '../../components/ApiErrorDisplay';

const TIPOS = [
  { value: '', label: 'Todos' },
  { value: 'atractivo', label: 'Atractivos' },
  { value: 'ruta', label: 'Rutas' },
  { value: 'emprendimiento', label: 'Emprendimientos' },
  { value: 'evento', label: 'Eventos' },
];

const CALIFICACIONES = [
  { value: '', label: 'Todas las estrellas' },
  { value: '5', label: '5 estrellas' },
  { value: '4', label: '4 estrellas' },
  { value: '3', label: '3 estrellas' },
  { value: '2', label: '2 estrellas' },
  { value: '1', label: '1 estrella' },
];

function fmtFecha(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es-EC');
  } catch {
    return iso;
  }
}

function ResenasMonitorPage() {
  const [filtros, setFiltros] = useState({ entidadTipo: '', calificacion: '', q: '' });
  const [data, setData] = useState({ resumen: {}, results: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listarResenasAdmin({
        entidadTipo: filtros.entidadTipo || undefined,
        calificacion: filtros.calificacion || undefined,
        q: filtros.q || undefined,
      });
      setData(res);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filtros.entidadTipo, filtros.calificacion]);

  const handleOcultar = async (id) => {
    if (!window.confirm('¿Ocultar esta reseña del portal público?')) return;
    try {
      await cambiarActivoResena(id, false);
      load();
    } catch (err) {
      setError(err);
    }
  };

  const { resumen = {}, results = [] } = data;
  const porTipo = resumen.por_tipo || {};

  return (
    <section className="panel-card resenas-monitor">
      <div className="panel-header resenas-panel-header">
        <div className="resenas-panel-intro">
          <h2>Reseñas y calificaciones</h2>
          <p className="section-description">
            Opiniones de visitantes sobre atractivos, rutas, emprendimientos y eventos publicados.
          </p>
        </div>
        <button type="button" className="resenas-refresh-btn" onClick={load}>
          Actualizar
        </button>
      </div>

      <div className="overview-cards resenas-summary">
        <article className="overview-card blue">
          <span className="card-label">Total reseñas</span>
          <strong>{resumen.total ?? 0}</strong>
        </article>
        <article className="overview-card green">
          <span className="card-label">Promedio global</span>
          <strong>{resumen.promedio_global ?? 0}</strong>
        </article>
        <article className="overview-card pink">
          <span className="card-label">Atractivos</span>
          <strong>{porTipo.atractivo ?? 0}</strong>
        </article>
        <article className="overview-card orange">
          <span className="card-label">Rutas</span>
          <strong>{porTipo.ruta ?? 0}</strong>
        </article>
        <article className="overview-card purple">
          <span className="card-label">Emprendimientos</span>
          <strong>{porTipo.emprendimiento ?? 0}</strong>
        </article>
        <article className="overview-card teal">
          <span className="card-label">Eventos</span>
          <strong>{porTipo.evento ?? 0}</strong>
        </article>
      </div>

      <div className="resenas-tabs">
        {TIPOS.filter((t) => t.value !== '').map((tipo) => (
          <button
            key={tipo.value}
            type="button"
            className={`resenas-tab${filtros.entidadTipo === tipo.value ? ' is-active' : ''}`}
            onClick={() => setFiltros((f) => ({
              ...f,
              entidadTipo: f.entidadTipo === tipo.value ? '' : tipo.value,
            }))}
          >
            {tipo.label}
            <span className="resenas-tab-count">{porTipo[tipo.value] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="resenas-filters-panel">
        <div className="resenas-filters-grid">
          <div className="resenas-filter-group">
            <label htmlFor="resenas-tipo">Tipo de contenido</label>
            <select
              id="resenas-tipo"
              value={filtros.entidadTipo}
              onChange={(e) => setFiltros((f) => ({ ...f, entidadTipo: e.target.value }))}
            >
              {TIPOS.map((o) => <option key={o.value || 'all'} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="resenas-filter-group">
            <label htmlFor="resenas-calificacion">Calificación</label>
            <select
              id="resenas-calificacion"
              value={filtros.calificacion}
              onChange={(e) => setFiltros((f) => ({ ...f, calificacion: e.target.value }))}
            >
              {CALIFICACIONES.map((o) => <option key={o.value || 'all'} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="resenas-filter-group resenas-filter-group--search">
            <label htmlFor="resenas-buscar">Buscar</label>
            <div className="resenas-search-wrap">
              <svg className="resenas-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
              </svg>
              <input
                id="resenas-buscar"
                className="resenas-search-input"
                type="search"
                placeholder="Comentario o nombre de usuario..."
                value={filtros.q}
                onChange={(e) => setFiltros((f) => ({ ...f, q: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') load(); }}
              />
            </div>
          </div>
          <div className="resenas-filter-group resenas-filter-group--action">
            <span className="resenas-filter-spacer" aria-hidden="true">&nbsp;</span>
            <button type="button" className="resenas-search-btn" onClick={load}>
              Buscar
            </button>
          </div>
        </div>
      </div>

      {error && <ApiErrorDisplay error={error} title="No se pudieron cargar las reseñas" />}

      {loading ? (
        <p>Cargando reseñas...</p>
      ) : results.length === 0 ? (
        <p className="empty-state">No hay reseñas registradas con estos filtros.</p>
      ) : (
        <div className="table-responsive">
          <table className="entity-table resenas-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Lugar / evento</th>
                <th>Usuario</th>
                <th>Calificación</th>
                <th>Comentario</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item) => (
                <tr key={item.id}>
                  <td>{fmtFecha(item.creado_en)}</td>
                  <td><span className="resena-badge">{item.entidad_tipo_label}</span></td>
                  <td className="resena-entidad-cell">
                    <strong>{item.entidad_nombre}</strong>
                    <small>ID {item.entidad_id}</small>
                  </td>
                  <td>{item.usuario?.nombre || item.usuario?.username}</td>
                  <td>
                    <ResumenEstrellas promedio={item.calificacion} total={0} size="sm" className="[&>span:last-child]:hidden" />
                  </td>
                  <td className="resena-comentario-cell">{item.comentario || '—'}</td>
                  <td className="errores-actions">
                    <button type="button" onClick={() => handleOcultar(item.id)}>Ocultar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default ResenasMonitorPage;
