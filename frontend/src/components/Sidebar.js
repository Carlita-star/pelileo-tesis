import { NavLink } from 'react-router-dom';
import { ADMIN_PATHS } from '../routes/adminPaths';

const menuItems = [
  { path: ADMIN_PATHS.dashboard, label: 'Dashboard' },
  { path: ADMIN_PATHS.atractivos, label: 'Atractivos' },
  { path: ADMIN_PATHS.rutas, label: 'Rutas' },
  { path: ADMIN_PATHS.emprendimientos, label: 'Emprendimientos' },
  { path: ADMIN_PATHS.eventos, label: 'Eventos' },
  { path: ADMIN_PATHS.catalogos, label: 'Catálogos' },
  { path: ADMIN_PATHS.usuarios, label: 'Usuarios' },
  { path: ADMIN_PATHS.configuracion, label: 'Configuración' },
  { path: ADMIN_PATHS.auditoria, label: 'Auditoría' },
  { path: ADMIN_PATHS.reportes, label: 'Reportes' },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">GAD</div>
        <div>
          <div className="brand-name">Pelileo</div>
          <div className="brand-subtitle">Panel Administrativo</div>
        </div>
      </div>

      <nav className="menu">
        {menuItems.map((item) => (
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
