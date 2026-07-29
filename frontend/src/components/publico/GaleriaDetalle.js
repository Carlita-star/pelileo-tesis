import { useState } from 'react';
import './galeria-detalle.css';

function normalizeItems(imagenes) {
  return imagenes
    .map((item) => {
      if (typeof item === 'string') {
        return { url: item, titulo: null };
      }
      if (item?.url) {
        return { url: item.url, titulo: item.titulo ?? null };
      }
      return null;
    })
    .filter(Boolean);
}

function GaleriaDetalle({ imagenes = [], titulo = 'Imagen', vacio = null }) {
  const [imgActiva, setImgActiva] = useState(0);
  const items = normalizeItems(imagenes);

  if (!items.length) {
    return vacio;
  }

  const activa = items[imgActiva] ?? items[0];
  const altPrincipal = activa.titulo || titulo;

  return (
    <div className="galeria-detalle">
      <div className="galeria-detalle-principal">
        <img
          src={activa.url}
          alt={altPrincipal}
          className="galeria-detalle-principal-img"
        />
      </div>
      {items.length > 1 && (
        <div className="galeria-detalle-thumbs">
          {items.map((item, i) => (
            <button
              key={`${item.url}-${i}`}
              type="button"
              onClick={() => setImgActiva(i)}
              className={`galeria-detalle-thumb${i === imgActiva ? ' galeria-detalle-thumb--active' : ''}`}
              aria-label={`Ver imagen ${i + 1}`}
              aria-current={i === imgActiva ? 'true' : undefined}
            >
              <img src={item.url} alt={item.titulo || `${titulo} ${i + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default GaleriaDetalle;
