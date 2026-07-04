import { Navigate, useLocation } from 'react-router-dom';
import { clearSession, hasPanelAccess, isAuthenticated } from '../services/authStorage';
import { ADMIN_PATHS } from './adminPaths';

function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to={ADMIN_PATHS.login} replace state={{ from: location.pathname }} />;
  }

  if (!hasPanelAccess()) {
    clearSession();
    return <Navigate to="/" replace state={{ reason: 'no-panel-access' }} />;
  }

  return children;
}

export default ProtectedRoute;
