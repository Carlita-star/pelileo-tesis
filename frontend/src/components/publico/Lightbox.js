import { useEffect } from 'react';

// Visor de imágenes a pantalla completa, SIEMPRE centrado sobre todo el sitio.
// Uso estilos en línea para el contenedor (position fixed, etc.) para que
// funcione aunque alguna clase de Tailwind no se haya generado todavía.
function Lightbox({ imagenes = [], indice, setIndice }) {
  const abierto = indice !== null && indice !== undefined;
  const n = imagenes.length;

  useEffect(() => {
    if (!abierto) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setIndice(null);
      if (e.key === 'ArrowRight') setIndice((indice + 1) % n);
      if (e.key === 'ArrowLeft') setIndice((indice - 1 + n) % n);
    };
    document.body.style.overflow = 'hidden'; // bloquea el scroll del fondo
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [abierto, indice, n, setIndice]);

  if (!abierto) return null;

  const overlay = {
    position: 'fixed',
    inset: 0,
    zIndex: 3000,
    background: 'rgba(0,0,0,0.92)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
  };

  return (
    <div style={overlay} onClick={() => setIndice(null)}>
      <button
        onClick={() => setIndice(null)}
        aria-label="Cerrar"
        style={{ position: 'absolute', top: 16, right: 20, fontSize: 34, lineHeight: 1, color: 'rgba(255,255,255,.85)', background: 'transparent', border: 0, cursor: 'pointer' }}
      >×</button>

      {n > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIndice((indice - 1 + n) % n); }}
          aria-label="Anterior"
          style={{ position: 'absolute', left: 12, fontSize: 48, lineHeight: 1, color: 'rgba(255,255,255,.7)', background: 'transparent', border: 0, cursor: 'pointer' }}
        >‹</button>
      )}

      <img
        src={imagenes[indice]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '85vh', maxWidth: '90vw', objectFit: 'contain', borderRadius: 12, boxShadow: '0 20px 60px rgba(0,0,0,.5)' }}
      />

      {n > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); setIndice((indice + 1) % n); }}
          aria-label="Siguiente"
          style={{ position: 'absolute', right: 12, fontSize: 48, lineHeight: 1, color: 'rgba(255,255,255,.7)', background: 'transparent', border: 0, cursor: 'pointer' }}
        >›</button>
      )}
    </div>
  );
}

export default Lightbox;