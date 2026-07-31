import { useEffect, useState } from 'react';
import GaleriaMasonry from '../../components/publico/GaleriaMasonry';
import { listarGaleriaPublicaDetalle } from '../../services/galeria.service';
import './galeria-page.css';

/**
 * Galería fotográfica completa del cantón + catálogo.
 */
function GaleriaPage() {
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activo = true;
    listarGaleriaPublicaDetalle()
      .then((items) => {
        if (!activo) return;
        setImagenes(items);
      })
      .finally(() => {
        if (activo) setLoading(false);
      });
    return () => { activo = false; };
  }, []);

  const urls = imagenes.map((i) => i.url).filter(Boolean);

  return (
    <div className="galeria-page">
      <header className="galeria-page__hero">
        <div className="galeria-page__hero-inner">
          <p className="galeria-page__eyebrow">Visual</p>
          <h1 className="galeria-page__title">Galería fotográfica</h1>
          <p className="galeria-page__lead">
            Imágenes del cantón San Pedro de Pelileo: paisajes andinos, cultura viva,
            tradición textil, gastronomía y la gente que hace único a este destino.
            Explora atractivos, rutas, emprendimientos y eventos a través de su mirada
            fotográfica. Haz clic en una foto para verla en tamaño completo.
          </p>
        </div>
      </header>

      <section className="galeria-page__body">
        {loading ? (
          <div className="galeria-page__skeleton">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="galeria-page__skel" />
            ))}
          </div>
        ) : urls.length ? (
          <GaleriaMasonry imagenes={urls} modoCompleto />
        ) : (
          <div className="galeria-page__empty">
            <p>Aún no hay fotografías en la galería.</p>
            <p className="galeria-page__empty-hint">
              Sube fotos en Configuración → Galería, o publica atractivos, rutas, emprendimientos y eventos con imágenes.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default GaleriaPage;
