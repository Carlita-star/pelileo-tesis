import { useState } from 'react';
import { Link } from 'react-router-dom';
import Lightbox from './Lightbox';
import './galeria-inicio.css';

function urlDe(item) {
  if (!item) return '';
  if (typeof item === 'string') return item;
  return item.url || item.src || '';
}

/**
 * Vista previa en el inicio: las fotos más recientes (máx. 7).
 */
function GaleriaInicio({
  imagenes = [],
}) {
  const [lb, setLb] = useState(null);
  // Quitar duplicados por si la API trae la misma URL
  const vistas = new Set();
  const todas = [];
  for (const item of imagenes) {
    const src = urlDe(item);
    if (!src) continue;
    const clave = src.split('?', 1)[0];
    if (vistas.has(clave)) continue;
    vistas.add(clave);
    todas.push(src);
  }
  if (!todas.length) return null;

  const destacada = todas[0];
  const mosaico = todas.slice(1, 7);
  const abrir = (indiceEnTodas) => setLb(indiceEnTodas);

  return (
    <section className="galeria-inicio" aria-labelledby="galeria-inicio-titulo">
      <div className="galeria-inicio__head">
        <p className="galeria-inicio__eyebrow">Visual</p>
        <h2 id="galeria-inicio-titulo" className="galeria-inicio__titulo">
          Galería fotográfica
        </h2>
        <p className="galeria-inicio__desc">
          Fotografías icónicas del cantón San Pedro de Pelileo: paisajes, cultura y gente.
        </p>
      </div>

      <div className="galeria-inicio__mosaico">
        <button
          type="button"
          className="galeria-inicio__hero"
          onClick={() => abrir(0)}
        >
          <img src={destacada} alt="Fotografía icónica de Pelileo" />
        </button>

        {mosaico.length > 0 ? (
          <div className="galeria-inicio__tiles">
            {mosaico.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                className="galeria-inicio__tile"
                onClick={() => abrir(i + 1)}
              >
                <img src={src} alt={`Galería Pelileo ${i + 2}`} loading="lazy" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="galeria-inicio__footer">
        <Link to="/galeria" className="galeria-inicio__cta">
          Ver galería completa
        </Link>
      </div>

      <Lightbox imagenes={todas} indice={lb} setIndice={setLb} />
    </section>
  );
}

export default GaleriaInicio;
