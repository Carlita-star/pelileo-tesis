import './seccion-guias.css';

/**
 * Guías turísticos — mismo formato visual que Autoridades.
 * Datos editables desde Configuración (inventario oficial del PDF).
 */
function SeccionGuiasTuristicos({
  guias = [],
  intro = '',
  fondoUrl = null,
}) {
  const lista = (guias || []).filter((g) => g?.nombre);
  if (!lista.length) return null;

  const columnas = Math.min(lista.length, 4);

  return (
    <section className="guias" aria-labelledby="guias-titulo">
      {fondoUrl ? (
        <div
          className="guias__bg"
          style={{ backgroundImage: `url(${fondoUrl})` }}
          aria-hidden
        />
      ) : null}
      <div className="guias__veil" aria-hidden />

      <div className="guias__inner">
        <div className="guias__head">
          <p className="guias__eyebrow">Directorio turístico</p>
          <h2 id="guias-titulo" className="guias__title">
            Guías turísticos
          </h2>
          <div className="guias__rule" aria-hidden />
          {intro ? (
            <p className="guias__intro">{intro}</p>
          ) : (
            <p className="guias__intro">
              Guías de turismo locales listos para acompañarte en recorridos culturales,
              de naturaleza y de aventura por el cantón San Pedro de Pelileo.
            </p>
          )}
        </div>

        <div className={`guias__grid guias__grid--${columnas}`}>
          {lista.map((g) => (
            <article key={g.id || g.nombre} className="guias__card">
              <div className="guias__foto-wrap">
                {g.fotoUrl ? (
                  <img
                    src={g.fotoUrl}
                    alt={g.nombre}
                    className="guias__foto"
                    loading="lazy"
                  />
                ) : (
                  <div className="guias__foto guias__foto--empty" aria-hidden>
                    {(g.nombre || '?').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h3 className="guias__nombre">{g.nombre}</h3>
              {g.especialidad ? (
                <p className="guias__cargo">{g.especialidad}</p>
              ) : null}
              {g.bio ? <p className="guias__bio">{g.bio}</p> : null}
              {(g.telefono || g.email) ? (
                <div className="guias__contacto">
                  {g.telefono ? (
                    <a href={`tel:${String(g.telefono).replace(/\s+/g, '')}`} className="guias__link">
                      Cel: {g.telefono}
                    </a>
                  ) : null}
                  {g.email ? (
                    <a href={`mailto:${g.email}`} className="guias__link">
                      {g.email}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SeccionGuiasTuristicos;
