import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/authStorage';
import { ADMIN_PATHS } from '../routes/adminPaths';

function PublicAuthRoute({ children }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return (
      <Navigate
        to={ADMIN_PATHS.login}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}

export default PublicAuthRoute;
