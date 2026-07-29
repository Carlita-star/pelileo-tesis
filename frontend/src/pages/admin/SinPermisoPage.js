import { Link } from 'react-router-dom';
import { ADMIN_PATHS } from '../../routes/adminPaths';

function SinPermisoPage() {
  return (
    <section className="panel-card sin-permiso-page">
      <div className="sin-permiso-content">
        <div className="sin-permiso-icono" aria-hidden="true">
          🔒
        </div>
        <h2>No tienes permiso para acceder a esta sección.</h2>
        <p className="section-description">
          Contacta al administrador si crees que deberías tener acceso.
        </p>
        <Link to={ADMIN_PATHS.dashboard} className="primary-button sin-permiso-button">
          Volver al dashboard
        </Link>
      </div>
    </section>
  );
}

export default SinPermisoPage;
