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

function DashboardHome({ atractivos, rutas, backendStatus, error, apiBase }) {
  const totalAtractivos = atractivos.length;
  const totalRutas = rutas.length;
  const publicacionesPendientes = Math.max(3, Math.floor(totalAtractivos / 4));
  const emprendimientosActivos = 15;

  const recentActivity = useMemo(() => {
    const items = [];
    if (rutas.length > 0) {
      items.push({
        title: `Nueva ruta '${rutas[0].nombre}'`,
        description: rutas[0].descripcion || 'Descripción disponible en el backend.',
        time: '14:32',
      });
    }
    if (atractivos.length > 0) {
      items.push({
        title: `Atractivo '${atractivos[0].nombre}' agregado`,
        description: atractivos[0].categoria || 'Categoría no definida',
        time: '13:15',
      });
    }
    items.push({ title: 'Usuario nuevo registrado', description: 'Se creó un nuevo usuario en el sistema.', time: '11:40' });
    items.push({ title: 'Publicación pendiente', description: 'Requiere revisión de contenido.', time: '10:10' });
    return items;
  }, [atractivos, rutas]);

  return (
    <>
      <section className="overview-cards">
        <article className="overview-card blue">
          <span className="card-label">Total Atractivos</span>
          <strong>{totalAtractivos}</strong>
        </article>
        <article className="overview-card green">
          <span className="card-label">Rutas Activas</span>
          <strong>{totalRutas}</strong>
        </article>
        <article className="overview-card teal">
          <span className="card-label">Emprendimientos</span>
          <strong>{emprendimientosActivos}</strong>
        </article>
        <article className="overview-card orange">
          <span className="card-label">Publicaciones Pendientes</span>
          <strong>{publicacionesPendientes}</strong>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel-card activity-card">
          <div className="panel-header">
            <h2>Actividad Reciente</h2>
          </div>
          <div className="activity-list">
            {recentActivity.map((item, index) => (
              <div key={index} className="activity-item">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
                <span>{item.time}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card stats-card">
          <div className="panel-header">
            <h2>Tendencias de Visitantes</h2>
          </div>
          <div className="chart-legend">
            <div className="chart-value">150</div>
            <div className="chart-label">Jul 12 - Jul 18</div>
          </div>
          <div className="chart-lines">
            {[150, 180, 210, 250, 310, 350, 290].map((value, index) => (
              <div key={index} className="chart-point" style={{ height: `${value / 2}px` }} />
            ))}
          </div>
          <div className="chart-axis">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </article>

        <article className="panel-card data-card">
          <div className="panel-header">
            <h2>Atractivos</h2>
            <span>{totalAtractivos} items</span>
          </div>
          {atractivos.length === 0 ? (
            <p className="empty-state">No se encontraron atractivos.</p>
          ) : (
            <ul>
              {atractivos.slice(0, 4).map((item) => (
                <li key={item.id}>
                  <strong>{item.nombre}</strong>
                  <p>{item.parroquia || 'Parroquia no disponible'}</p>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="panel-card data-card">
          <div className="panel-header">
            <h2>Rutas</h2>
            <span>{totalRutas} rutas</span>
          </div>
          {rutas.length === 0 ? (
            <p className="empty-state">No se encontraron rutas.</p>
          ) : (
            <ul>
              {rutas.slice(0, 4).map((item) => (
                <li key={item.id}>
                  <strong>{item.nombre}</strong>
                  <p>{item.dificultad || 'Dificultad sin definir'}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
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
        const [apiRes, atractivosRes, rutasRes, emprendimientosRes, usuariosRes, eventosRes, publicacionesRes, reportesRes, auditoriasRes, configuracionRes] = await Promise.all([
          fetch(`${apiBase}/api/`),
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
        return <AtractivosPage atractivos={atractivos} />;
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
        return <DashboardHome atractivos={atractivos} rutas={rutas} backendStatus={backendStatus} error={error} apiBase={apiBase} />;
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
