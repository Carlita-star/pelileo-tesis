import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section className="not-found-page">
      <div className="not-found-illustration" aria-hidden="true">
        <span className="not-found-digit">4</span>
        <span className="not-found-circle">0</span>
        <span className="not-found-digit">4</span>
      </div>

      <h1>Página no encontrada</h1>
      <p className="not-found-description">
        La página que buscas no existe o fue removida.
      </p>
      <Link to="/" className="not-found-button">
        Volver al inicio
      </Link>
    </section>
  );
}

export default NotFoundPage;
