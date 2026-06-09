import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { clearSession, getStoredUser } from '../services/authStorage';
import { ADMIN_PATHS } from '../routes/adminPaths';

function AdminLayout() {
  const navigate = useNavigate();
  const usuario = getStoredUser();

  const handleLogout = () => {
    clearSession();
    navigate(ADMIN_PATHS.login, { replace: true });
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <header className="topbar">
          <div className="search-bar">
            <input type="search" placeholder="Buscar..." />
          </div>
          <div className="profile-chip">
            <span>
              {usuario?.nombre_completo
                || `${usuario?.nombres || ''} ${usuario?.apellidos || ''}`.trim()
                || usuario?.username
                || 'Usuario'}
            </span>
            <button type="button" className="logout-button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
