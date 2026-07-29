import { Link } from 'react-router-dom';
import TarjetaDesarrollador from '../../components/publico/TarjetaDesarrollador';
import {
  CREDITOS_EQUIPO,
  CREDITOS_META,
  CREDITOS_TECNOLOGIAS,
} from '../../data/creditosDesarrolladores';
import '../../components/publico/creditos.css';

function CreditosPage() {
  return (
    <div className="creditos-page">
      <header className="creditos-hero">
        <div className="creditos-hero__bg" aria-hidden>
          <div className="creditos-hero__orb creditos-hero__orb--1" />
          <div className="creditos-hero__orb creditos-hero__orb--2" />
          <div className="creditos-hero__grid" />
        </div>

        <div className="creditos-hero__content">
          <nav className="creditos-hero__crumb">
            <Link to="/">Inicio</Link>
            <span>/</span>
            <span>Equipo de desarrollo</span>
          </nav>

          <span className="creditos-hero__tag">{CREDITOS_META.etiqueta}</span>
          <h1>{CREDITOS_META.titulo}</h1>
          <p className="creditos-hero__lead">{CREDITOS_META.subtitulo}</p>

          <div className="creditos-hero__meta">
            <span>{CREDITOS_META.institucion}</span>
            <span>{CREDITOS_META.periodo}</span>
          </div>
        </div>
      </header>

      <section className="creditos-tech" aria-label="Tecnologías del proyecto">
        <p className="creditos-tech__label">Stack del proyecto</p>
        <ul className="creditos-tech__list">
          {CREDITOS_TECNOLOGIAS.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
      </section>

      <section className="creditos-equipo">
        <div className="creditos-equipo__intro">
          <h2>Conoce al equipo</h2>
          <p>
            Tres perfiles complementarios que llevaron este portal desde la idea hasta producción,
            con código mantenible y experiencia pensada para el visitante.
          </p>
        </div>

        <div className="creditos-grid">
          {CREDITOS_EQUIPO.map((dev, index) => (
            <TarjetaDesarrollador key={dev.id} desarrollador={dev} index={index} />
          ))}
        </div>
      </section>

      <section className="creditos-cta">
        <div className="creditos-cta__inner">
          <h2>¿Buscas un equipo que entregue resultados?</h2>
          <p>
            Desarrollamos sistemas web a medida: portales públicos, paneles administrativos,
            APIs y despliegue en producción. Escríbenos y conversemos sobre tu proyecto.
          </p>
          <div className="creditos-cta__links">
            <a href="mailto:steevenbr17@gmail.com" className="creditos-cta__btn creditos-cta__btn--primary">
              Contactar al equipo
            </a>
            <Link to="/" className="creditos-cta__btn creditos-cta__btn--ghost">
              Volver al portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CreditosPage;
