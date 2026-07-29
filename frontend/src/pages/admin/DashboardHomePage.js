import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/apiClient';
import { ADMIN_PATHS } from '../../routes/adminPaths';
import { useErrorToast } from '../../hooks/useErrorToast';
import DashboardVisitorChart from '../../components/admin/DashboardVisitorChart';

const METRIC_ICONS = {
  atractivos: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M12 3 2 20h20L12 3Zm0 5.5L17.5 18h-11L12 8.5Z" />
    </svg>
  ),
  rutas: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
    </svg>
  ),
  emprendimientos: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M4 10V4h6v2h10v12H4V10Zm2 0h4V6H6v4Zm2 2v2h2v-2H8Zm4 0v2h6v-2h-6Zm-4 4v2h2v-2H8Zm4 0v2h6v-2h-6Z" />
    </svg>
  ),
  pendientes: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M7 2h2v2h6V2h2v2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3V2Zm13 8H4v10h16V10ZM6 12h5v2H6v-2Z" />
    </svg>
  ),
  eventos: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 16H5V10h14v10Zm0-12H5V6h14v2Z" />
    </svg>
  ),
  publicados: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
    </svg>
  ),
  borrador: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
    </svg>
  ),
  inactivos: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31A7.902 7.902 0 0 1 12 20zm6.31-3.1L7.1 5.69A7.902 7.902 0 0 1 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z" />
    </svg>
  ),
  papelera: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  ),
};

const ACTIVITY_ICONS = {
  CREAR: { glyph: '👤', tone: 'teal' },
  EDITAR: { glyph: '✏️', tone: 'green' },
  ELIMINAR: { glyph: '🗑️', tone: 'orange' },
  default: { glyph: '📄', tone: 'blue' },
};

function formatHora(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

function formatActividad(item) {
  const acciones = {
    CREAR: 'creó un registro en',
    EDITAR: 'actualizó un registro en',
    ELIMINAR: 'eliminó un registro en',
  };
  const tabla = item.tabla_afectada || 'el sistema';
  const verbo = acciones[item.accion] || `${item.accion} en`;
  return `${item.usuario} ${verbo} ${tabla}.`;
}

function DashboardHomePage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [backendStatus, setBackendStatus] = useState('Comprobando...');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSummary() {
      try {
        const [apiRoot, dashboard] = await Promise.all([
          apiRequest('/api/'),
          apiRequest('/api/dashboard/'),
        ]);
        setBackendStatus(apiRoot?.message ? 'Conectado' : 'Conectado');
        setSummary(dashboard);
      } catch (err) {
        setError('No se pudo conectar al backend. Comprueba que Django está ejecutándose.');
        setBackendStatus('No disponible');
      }
    }
    loadSummary();
  }, []);

  useErrorToast(error);

  const totales = summary?.totales || {};
  const estadoPublicacion = summary?.estado_publicacion || {};
  const cambiosRecientes = summary?.cambios_recientes || [];
  const atractivosMasVisitados = summary?.atractivos_mas_visitados || [];

  const metricsPrimary = [
    {
      key: 'atractivos',
      label: 'Total atractivos',
      value: totales.total_atractivos ?? 0,
      tone: 'blue',
    },
    {
      key: 'rutas',
      label: 'Total rutas',
      value: totales.total_rutas ?? 0,
      tone: 'green',
    },
    {
      key: 'emprendimientos',
      label: 'Total emprendimientos',
      value: totales.total_emprendimientos ?? 0,
      tone: 'teal',
    },
    {
      key: 'eventos',
      label: 'Eventos activos',
      value: totales.eventos_activos ?? 0,
      tone: 'orange',
    },
  ];

  const metricsState = [
    {
      key: 'publicados',
      label: 'Publicados',
      value: estadoPublicacion.publicados ?? 0,
      tone: 'purple',
    },
    {
      key: 'borrador',
      label: 'En borrador',
      value: estadoPublicacion.en_borrador ?? 0,
      tone: 'pink',
    },
    {
      key: 'inactivos',
      label: 'Inactivos',
      value: estadoPublicacion.inactivos ?? 0,
      tone: 'gray',
    },
    {
      key: 'papelera',
      label: 'Papelera',
      value: estadoPublicacion.papelera ?? 0,
      tone: 'red',
    },
  ];

  const renderMetric = (metric) => (
    <article key={metric.key} className={`dashboard-metric dashboard-metric--${metric.tone}`}>
      <div className={`dashboard-metric-icon dashboard-metric-icon--${metric.tone}`}>
        {METRIC_ICONS[metric.key]}
      </div>
      <div>
        <p className="dashboard-metric-label">{metric.label}</p>
        <strong className="dashboard-metric-value">{metric.value}</strong>
        {metric.hint && <p className="dashboard-metric-hint">{metric.hint}</p>}
      </div>
    </article>
  );

  const quickActions = [
    { label: 'Nuevo Atractivo', path: ADMIN_PATHS.atractivosNuevo },
    { label: 'Nueva Ruta', path: ADMIN_PATHS.rutasNueva },
    { label: 'Nuevo Emprendimiento', path: ADMIN_PATHS.emprendimientosNuevo },
  ];

  return (
    <div className="dashboard-page">
      <section className="dashboard-metrics dashboard-metrics--primary">
        {metricsPrimary.map(renderMetric)}
      </section>

      <section className="dashboard-metrics dashboard-metrics--state">
        {metricsState.map(renderMetric)}
      </section>

      <div className="dashboard-main-grid">
        <article className="dashboard-panel dashboard-activity-panel">
          <h2 className="dashboard-panel-title">Actividad Reciente</h2>
          {cambiosRecientes.length === 0 ? (
            <p className="empty-state">No hay actividad reciente.</p>
          ) : (
            <ul className="dashboard-timeline">
              {cambiosRecientes.map((item) => {
                const meta = ACTIVITY_ICONS[item.accion] || ACTIVITY_ICONS.default;
                return (
                  <li key={item.id} className="dashboard-timeline-item">
                    <span className={`dashboard-timeline-icon dashboard-timeline-icon--${meta.tone}`}>
                      {meta.glyph}
                    </span>
                    <div className="dashboard-timeline-body">
                      <p>{formatActividad(item)}</p>
                      <time dateTime={item.fecha}>{formatHora(item.fecha)}</time>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </article>

        <article className="dashboard-panel dashboard-stats-panel">
          <DashboardVisitorChart atractivos={atractivosMasVisitados} />
        </article>
      </div>

      <section className="quick-actions">
        {quickActions.map((action) => (
          <button
            key={action.label}
            className="quick-action-button"
            type="button"
            onClick={() => navigate(action.path)}
          >
            {action.label}
          </button>
        ))}
      </section>

      <section className="status-panel">
        <div>
          <p className="status-label">Conexión API</p>
          <p className="status-value">{backendStatus}</p>
        </div>
      </section>
    </div>
  );
}

export default DashboardHomePage;
