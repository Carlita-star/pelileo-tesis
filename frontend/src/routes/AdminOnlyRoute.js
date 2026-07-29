import { Navigate, Outlet } from 'react-router-dom';
import { isAdministrador } from '../services/authStorage';
import { ADMIN_PATHS } from './adminPaths';

function AdminOnlyRoute() {
  if (!isAdministrador()) {
    return <Navigate to={ADMIN_PATHS.sinPermiso} replace />;
  }
  return <Outlet />;
}

export default AdminOnlyRoute;
