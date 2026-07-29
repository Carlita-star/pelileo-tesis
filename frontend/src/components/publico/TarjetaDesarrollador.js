import { useState } from 'react';

function iniciales(nombre) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

function IconoTelefono() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function IconoCorreo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  );
}

function TarjetaDesarrollador({ desarrollador, index }) {
  const [fotoOk, setFotoOk] = useState(Boolean(desarrollador.foto));
  const mostrarFoto = desarrollador.foto && fotoOk;
  const accent = desarrollador.accent || '#1d9e75';

  return (
    <article
      className="creditos-card"
      style={{ '--card-accent': accent, '--card-delay': `${index * 0.1}s` }}
    >
      <div className="creditos-card__glow" aria-hidden />
      <div className="creditos-card__header">
        <div className="creditos-card__foto-ring">
          {mostrarFoto ? (
            <img
              src={desarrollador.foto}
              alt={desarrollador.nombre}
              className="creditos-card__foto"
              onError={() => setFotoOk(false)}
            />
          ) : (
            <div className="creditos-card__avatar" aria-hidden>
              {iniciales(desarrollador.nombre)}
            </div>
          )}
        </div>
        <span className="creditos-card__badge">{desarrollador.rol}</span>
      </div>

      <div className="creditos-card__body">
        <h2 className="creditos-card__nombre">{desarrollador.nombre}</h2>
        <p className="creditos-card__rol-detalle">{desarrollador.rolDetalle}</p>

        {desarrollador.habilidades?.length > 0 && (
          <ul className="creditos-card__skills">
            {desarrollador.habilidades.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
          </ul>
        )}

        <div className="creditos-card__actions">
          {desarrollador.telefono && (
            <a href={`tel:${desarrollador.telefono}`} className="creditos-card__btn">
              <IconoTelefono />
              <span>{desarrollador.telefono}</span>
            </a>
          )}
          {desarrollador.email && (
            <a href={`mailto:${desarrollador.email}`} className="creditos-card__btn creditos-card__btn--outline">
              <IconoCorreo />
              <span>{desarrollador.email}</span>
            </a>
          )}
        </div>

        {(desarrollador.linkedin || desarrollador.github) && (
          <div className="creditos-card__redes">
            {desarrollador.linkedin && (
              <a href={desarrollador.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            )}
            {desarrollador.github && (
              <a href={desarrollador.github} target="_blank" rel="noreferrer">GitHub</a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default TarjetaDesarrollador;
