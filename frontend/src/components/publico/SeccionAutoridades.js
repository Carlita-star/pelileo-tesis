import './seccion-autoridades.css';

/**
 * Autoridades del cantón — fotos, nombres, cargos y bios editables desde Configuración.
 * Estilo pensado para superar la referencia tipo Sigchos: tipografía clara, texto ancho y tarjetas centradas.
 */
function SeccionAutoridades({
  autoridades = [],
  intro = '',
  fondoUrl = null,
}) {
  const lista = (autoridades || []).filter((a) => a?.nombre);
  if (!lista.length) return null;

  const columnas = Math.min(lista.length, 3);

  return (
    <section className="autoridades" aria-labelledby="autoridades-titulo">
      {fondoUrl ? (
        <div
          className="autoridades__bg"
          style={{ backgroundImage: `url(${fondoUrl})` }}
          aria-hidden
        />
      ) : null}
      <div className="autoridades__veil" aria-hidden />

      <div className="autoridades__inner">
        <div className="autoridades__head">
          <p className="autoridades__eyebrow">GAD Municipal</p>
          <h2 id="autoridades-titulo" className="autoridades__title">
            Autoridades
          </h2>
          <div className="autoridades__rule" aria-hidden />
          {intro ? (
            <p className="autoridades__intro">{intro}</p>
          ) : (
            <p className="autoridades__intro">
              Conoce a las autoridades del GAD Municipal de Pelileo que impulsan el desarrollo,
              la gestión local y el turismo del cantón San Pedro de Pelileo.
            </p>
          )}
        </div>

        <div className={`autoridades__grid autoridades__grid--${columnas}`}>
          {lista.map((a) => (
            <article key={a.id || a.nombre} className="autoridades__card">
              <div className="autoridades__foto-wrap">
                {a.fotoUrl ? (
                  <img
                    src={a.fotoUrl}
                    alt={a.nombre}
                    className="autoridades__foto"
                    loading="lazy"
                  />
                ) : (
                  <div className="autoridades__foto autoridades__foto--empty" aria-hidden>
                    {(a.nombre || '?').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <h3 className="autoridades__nombre">{a.nombre}</h3>
              {a.cargo ? <p className="autoridades__cargo">{a.cargo}</p> : null}
              {a.bio ? <p className="autoridades__bio">{a.bio}</p> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SeccionAutoridades;
