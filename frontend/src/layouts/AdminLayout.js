import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AdminGlobalSearch from '../components/admin/AdminGlobalSearch';
import AdminProfileMenu from '../components/admin/AdminProfileMenu';

function AdminLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <header className="topbar">
          <AdminGlobalSearch />
          <AdminProfileMenu />
        </header>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
