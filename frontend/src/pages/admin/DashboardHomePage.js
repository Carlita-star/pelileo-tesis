import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/apiClient';
import { ADMIN_PATHS } from '../../routes/adminPaths';
import { useErrorToast } from '../../hooks/useErrorToast';

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

  const quickActions = [
    { label: 'Nuevo Atractivo', path: ADMIN_PATHS.atractivosNuevo },
    { label: 'Nueva Ruta', path: ADMIN_PATHS.rutasNueva },
    { label: 'Nuevo Emprendimiento', path: ADMIN_PATHS.emprendimientosNuevo },
  ];

  return (
    <>
      <section className="overview-cards">
        <article className="overview-card blue">
          <span className="card-label">Total atractivos</span>
          <strong>{totales.total_atractivos ?? 0}</strong>
        </article>
        <article className="overview-card green">
          <span className="card-label">Total rutas</span>
          <strong>{totales.total_rutas ?? 0}</strong>
        </article>
        <article className="overview-card teal">
          <span className="card-label">Total emprendimientos</span>
          <strong>{totales.total_emprendimientos ?? 0}</strong>
        </article>
        <article className="overview-card orange">
          <span className="card-label">Eventos activos</span>
          <strong>{totales.eventos_activos ?? 0}</strong>
        </article>
      </section>

      <section className="state-cards">
        <article className="overview-card purple">
          <span className="card-label">Publicados</span>
          <strong>{estadoPublicacion.publicados ?? 0}</strong>
        </article>
        <article className="overview-card pink">
          <span className="card-label">En borrador</span>
          <strong>{estadoPublicacion.en_borrador ?? 0}</strong>
        </article>
        <article className="overview-card gray">
          <span className="card-label">Inactivos</span>
          <strong>{estadoPublicacion.inactivos ?? 0}</strong>
        </article>
      </section>

      <div className="dashboard-grid">
        <article className="panel-card activity-card">
          <div className="panel-header">
            <h2>Cambios recientes</h2>
          </div>
          <div className="activity-list">
            {cambiosRecientes.length === 0 ? (
              <p className="empty-state">No hay actividad reciente.</p>
            ) : (
              cambiosRecientes.map((item) => (
                <div key={item.id} className="activity-item">
                  <div>
                    <strong>{item.usuario}</strong>
                    <p>{`${item.accion} en ${item.tabla_afectada}`}</p>
                  </div>
                  <span>{new Date(item.fecha).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="panel-card data-card">
          <div className="panel-header">
            <h2>Atractivos más visitados</h2>
            <span>{atractivosMasVisitados.length} items</span>
          </div>
          {atractivosMasVisitados.length === 0 ? (
            <p className="empty-state">No hay datos de visitas.</p>
          ) : (
            <ul>
              {atractivosMasVisitados.map((item) => (
                <li key={item.id}>
                  <strong>{item.nombre}</strong>
                  <p>{item.visitas.toLocaleString()} visitas</p>
                </li>
              ))}
            </ul>
          )}
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
    </>
  );
}

export default DashboardHomePage;
