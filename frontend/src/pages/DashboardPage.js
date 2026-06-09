import { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import AtractivosPage from './AtractivosPage';
import RutasPage from './RutasPage';
import EmprendimientosPage from './EmprendimientosPage';
import PublicacionesPage from './PublicacionesPage';
import UsuariosPage from './UsuariosPage';
import ReportesPage from './ReportesPage';
import ConfiguracionPage from './ConfiguracionPage';
import EventosPage from './EventosPage';
import AuditoriasPage from './AuditoriasPage';

function DashboardHome({ summary, backendStatus, error, apiBase, onNavigate }) {
  const {
    totales = {
      total_atractivos: 0,
      total_rutas: 0,
      total_emprendimientos: 0,
      eventos_activos: 0,
    },
    estado_publicacion = {
      publicados: 0,
      en_borrador: 0,
      inactivos: 0,
    },
    cambios_recientes = [],
    atractivos_mas_visitados = [],
  } = summary || {};

  const quickActions = [
    { label: 'Nuevo Atractivo', page: 'atractivos' },
    { label: 'Nueva Ruta', page: 'rutas' },
    { label: 'Nuevo Emprendimiento', page: 'emprendimientos' },
  ];

  return (
    <>
      <section className="overview-cards">
        <article className="overview-card blue">
          <span className="card-label">Total atractivos</span>
          <strong>{totales.total_atractivos}</strong>
        </article>
        <article className="overview-card green">
          <span className="card-label">Total rutas</span>
          <strong>{totales.total_rutas}</strong>
        </article>
        <article className="overview-card teal">
          <span className="card-label">Total emprendimientos</span>
          <strong>{totales.total_emprendimientos}</strong>
        </article>
        <article className="overview-card orange">
          <span className="card-label">Eventos activos</span>
          <strong>{totales.eventos_activos}</strong>
        </article>
      </section>

      <section className="state-cards">
        <article className="overview-card purple">
          <span className="card-label">Publicados</span>
          <strong>{estado_publicacion.publicados}</strong>
        </article>
        <article className="overview-card pink">
          <span className="card-label">En borrador</span>
          <strong>{estado_publicacion.en_borrador}</strong>
        </article>
        <article className="overview-card gray">
          <span className="card-label">Inactivos</span>
          <strong>{estado_publicacion.inactivos}</strong>
        </article>
      </section>

      <div className="dashboard-grid">
        <article className="panel-card activity-card">
          <div className="panel-header">
            <h2>Cambios recientes</h2>
          </div>
          <div className="activity-list">
            {cambios_recientes.length === 0 ? (
              <p className="empty-state">No hay actividad reciente.</p>
            ) : (
              cambios_recientes.map((item) => (
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
            <span>{atractivos_mas_visitados.length} items</span>
          </div>
          {atractivos_mas_visitados.length === 0 ? (
            <p className="empty-state">No hay datos de visitas.</p>
          ) : (
            <ul>
              {atractivos_mas_visitados.map((item) => (
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
            onClick={() => onNavigate(action.page)}
          >
            {action.label}
          </button>
        ))}
      </section>

      <section className="status-panel">
        <div>
          <p className="status-label">Conexión API</p>
          <p className="status-value">{backendStatus}</p>
          {error && <p className="status-error">{error}</p>}
        </div>
        <div className="status-actions">
          <a href={`${apiBase}/api/`} target="_blank" rel="noreferrer">
            API root
          </a>
          <a href={`${apiBase}/admin/`} target="_blank" rel="noreferrer">
            Admin Django
          </a>
        </div>
      </section>
    </>
  );
}

function DashboardPage({ apiBase, usuario, onLogout }) {
  const [backendStatus, setBackendStatus] = useState('Comprobando...');
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [atractivos, setAtractivos] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [emprendimientos, setEmprendimientos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [auditorias, setAuditorias] = useState([]);
  const [configuracion, setConfiguracion] = useState(null);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    async function loadData() {
      try {
        const [apiRes, summaryRes, atractivosRes, rutasRes, emprendimientosRes, usuariosRes, eventosRes, publicacionesRes, reportesRes, auditoriasRes, configuracionRes] = await Promise.all([
          fetch(`${apiBase}/api/`),
          fetch(`${apiBase}/api/dashboard/`),
          fetch(`${apiBase}/api/atractivos/`),
          fetch(`${apiBase}/api/rutas/`),
          fetch(`${apiBase}/api/emprendimientos/`),
          fetch(`${apiBase}/api/usuarios/`),
          fetch(`${apiBase}/api/eventos/`),
          fetch(`${apiBase}/api/publicaciones/`),
          fetch(`${apiBase}/api/reportes/`),
          fetch(`${apiBase}/api/auditorias/`),
          fetch(`${apiBase}/api/configuracion/`),
        ]);

        setBackendStatus(apiRes.ok ? 'Conectado' : `Error ${apiRes.status}`);

        if (atractivosRes.ok) {
          const atractivosJson = await atractivosRes.json();
          setAtractivos(atractivosJson.results || atractivosJson || []);
        }

        if (rutasRes.ok) {
          const rutasJson = await rutasRes.json();
          setRutas(rutasJson.results || rutasJson || []);
        }

        if (emprendimientosRes.ok) {
          const emprendimientosJson = await emprendimientosRes.json();
          setEmprendimientos(emprendimientosJson.results || emprendimientosJson || []);
        }

        if (usuariosRes.ok) {
          const usuariosJson = await usuariosRes.json();
          setUsuarios(usuariosJson.results || usuariosJson || []);
        }

        if (eventosRes.ok) {
          const eventosJson = await eventosRes.json();
          setEventos(eventosJson.results || eventosJson || []);
        }

        if (publicacionesRes.ok) {
          const publicacionesJson = await publicacionesRes.json();
          setPublicaciones(publicacionesJson.results || publicacionesJson || []);
        }

        if (reportesRes.ok) {
          const reportesJson = await reportesRes.json();
          setReportes(reportesJson.results || reportesJson || []);
        }

        if (summaryRes.ok) {
          const summaryJson = await summaryRes.json();
          setDashboardSummary(summaryJson);
        }

        if (auditoriasRes.ok) {
          const auditoriasJson = await auditoriasRes.json();
          setAuditorias(auditoriasJson.results || auditoriasJson || []);
        }

        if (configuracionRes.ok) {
          const configuracionJson = await configuracionRes.json();
          setConfiguracion(configuracionJson);
        }
      } catch (err) {
        setError('No se pudo conectar al backend. Comprueba que Django está ejecutándose.');
        setBackendStatus('No disponible');
      }
    }

    loadData();
  }, [apiBase]);

  const pageContent = useMemo(() => {
    switch (currentPage) {
      case 'atractivos':
        return <AtractivosPage apiBase={apiBase} />;
      case 'rutas':
        return <RutasPage rutas={rutas} />;
      case 'emprendimientos':
        return <EmprendimientosPage emprendimientos={emprendimientos} />;
      case 'publicaciones':
        return <PublicacionesPage publicaciones={publicaciones} />;
      case 'usuarios':
        return <UsuariosPage usuarios={usuarios} />;
      case 'reportes':
        return <ReportesPage reportes={reportes} />;
      case 'eventos':
        return <EventosPage eventos={eventos} />;
      case 'auditorias':
        return <AuditoriasPage auditorias={auditorias} />;
      case 'configuracion':
        return <ConfiguracionPage configuracion={configuracion} />;
      case 'dashboard':
      default:
        return (
          <DashboardHome
            summary={dashboardSummary}
            backendStatus={backendStatus}
            error={error}
            apiBase={apiBase}
            onNavigate={setCurrentPage}
          />
        );
    }
  }, [currentPage, atractivos, rutas, emprendimientos, usuarios, eventos, publicaciones, reportes, auditorias, configuracion, backendStatus, error, apiBase]);

  return (
    <div className="app-shell">
      <Sidebar activePage={currentPage} onSelectPage={setCurrentPage} />

      <main className="main-content">
        <header className="topbar">
          <div className="search-bar">
            <input type="search" placeholder="Buscar..." />
          </div>
          <div className="profile-chip">
            <span>{usuario?.nombre_completo || `${usuario?.nombres || ''} ${usuario?.apellidos || ''}`.trim() || usuario?.username || 'Usuario'}</span>
            <button className="logout-button" onClick={onLogout}>
              Cerrar sesión
            </button>
          </div>
        </header>

        {pageContent}
      </main>
    </div>
  );
}

export default DashboardPage;
