import { NavLink } from 'react-router-dom';
import { ADMIN_PATHS } from '../routes/adminPaths';
import { isAdministrador } from '../services/authStorage';
import { useConfiguracion } from '../context/ConfiguracionContext';
import InstitutionalLogoMark from './InstitutionalLogoMark';

const menuItems = [
  { path: ADMIN_PATHS.dashboard, label: 'Dashboard' },
  { path: ADMIN_PATHS.atractivos, label: 'Atractivos' },
  { path: ADMIN_PATHS.rutas, label: 'Rutas' },
  { path: ADMIN_PATHS.emprendimientos, label: 'Emprendimientos' },
  { path: ADMIN_PATHS.eventos, label: 'Eventos' },
  { path: ADMIN_PATHS.catalogos, label: 'Catálogos' },
  { path: ADMIN_PATHS.usuarios, label: 'Usuarios', adminOnly: true },
  { path: ADMIN_PATHS.configuracion, label: 'Configuración' },
  { path: ADMIN_PATHS.auditoria, label: 'Auditoría', adminOnly: true },
  { path: ADMIN_PATHS.errores, label: 'Errores', adminOnly: true },
  { path: ADMIN_PATHS.reportes, label: 'Reportes', adminOnly: true },
];

function Sidebar() {
  const esAdmin = isAdministrador();
  const config = useConfiguracion();
  const itemsVisibles = menuItems.filter((item) => !item.adminOnly || esAdmin);

  return (
    <aside className="sidebar">
      <div className="brand">
        <InstitutionalLogoMark
          imgClassName="brand-mark brand-mark-img"
          fallbackClassName="brand-mark"
          fallbackText="GAD"
        />
        <div>
          <div className="brand-name">{config.nombreSistema || 'Pelileo'}</div>
          <div className="brand-subtitle">Panel Administrativo</div>
        </div>
      </div>

      <nav className="menu">
        {itemsVisibles.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
