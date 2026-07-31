import { Link } from 'react-router-dom';
import './seccion-sobre-pelileo.css';

export const SOBRE_PELILEO_INTRO_DEFAULT =
  'En el corazón de Tungurahua, Pelileo te recibe con la fuerza del «Cantón Azul»: '
  + 'jeans, artesanía, paisajes andinos y la viva cultura del pueblo Salasaka. '
  + 'Un destino listo para recorrer, saborear y fotografiar.';

export const SOBRE_PELILEO_DATOS_DEFAULT = [
  {
    etiqueta: 'Cantonización',
    valor: '22 de julio de 1860',
    detalle: 'Fundado en 1570 · reconstruido tras 1949',
  },
  {
    etiqueta: 'Sabores',
    valor: 'Cuy, fritada, hornado y empanadas',
    detalle: 'Tamales, caldo de gallina y chawarmishki',
  },
  {
    etiqueta: 'Vive el cantón',
    valor: 'Textiles, campo y naturaleza',
    detalle: 'Jeans, tejidos, agricultura y geositios UNESCO',
  },
];

/**
 * Sección atractiva para turistas: foto a gran escala + panel de descubrimiento.
 * Textos e imagen editables desde Configuración.
 */
function SeccionSobrePelileo({
  imagen,
  intro,
  datos,
}) {
  const textoIntro = (intro || '').trim() || SOBRE_PELILEO_INTRO_DEFAULT;
  const bloques = Array.isArray(datos) && datos.length
    ? datos
    : SOBRE_PELILEO_DATOS_DEFAULT;

  return (
    <section className="sobre-pelileo" aria-labelledby="sobre-pelileo-titulo">
      <div className="sobre-pelileo__stage">
        <div className="sobre-pelileo__media" aria-hidden={!imagen}>
          {imagen ? (
            <img
              src={imagen}
              alt="Cantón San Pedro de Pelileo"
              className="sobre-pelileo__img"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="sobre-pelileo__placeholder">
              <span>P</span>
              <p>Imagen institucional próximamente</p>
            </div>
          )}
          <div className="sobre-pelileo__shade" />
        </div>

        <div className="sobre-pelileo__panel">
          <p className="sobre-pelileo__eyebrow">Conoce el cantón</p>
          <h2 id="sobre-pelileo-titulo" className="sobre-pelileo__brand">
            PELILEO
          </h2>
          <p className="sobre-pelileo__tag">
            San Pedro de Pelileo · Tungurahua · Ecuador
          </p>
          <div className="sobre-pelileo__rule" aria-hidden />

          <p className="sobre-pelileo__intro">{textoIntro}</p>

          <ul className="sobre-pelileo__datos">
            {bloques.map((d, idx) => (
              <li key={`${d.etiqueta || 'dato'}-${idx}`} className="sobre-pelileo__dato">
                {d.etiqueta ? (
                  <span className="sobre-pelileo__dato-label">{d.etiqueta}</span>
                ) : null}
                {d.valor ? (
                  <span className="sobre-pelileo__dato-valor">{d.valor}</span>
                ) : null}
                {d.detalle ? (
                  <span className="sobre-pelileo__dato-detalle">{d.detalle}</span>
                ) : null}
              </li>
            ))}
          </ul>

          <div className="sobre-pelileo__actions">
            <Link to="/atractivos" className="sobre-pelileo__cta">
              Explorar atractivos
              <span aria-hidden>→</span>
            </Link>
            <Link to="/mapa" className="sobre-pelileo__cta-ghost">
              Ver en el mapa
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SeccionSobrePelileo;
