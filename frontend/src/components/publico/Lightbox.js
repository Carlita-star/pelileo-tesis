import { useEffect, useRef, useState } from 'react';

function urlDe(item) {
  if (!item) return '';
  if (typeof item === 'string') return item;
  return item.url || item.src || '';
}

function tituloDe(item, indice) {
  if (item && typeof item === 'object' && item.titulo) return item.titulo;
  const url = urlDe(item);
  if (!url) return `Foto ${indice + 1}`;
  try {
    const name = decodeURIComponent(url.split('/').pop().split('?')[0] || '');
    return name.replace(/\.[a-z0-9]+$/i, '') || `Foto ${indice + 1}`;
  } catch {
    return `Foto ${indice + 1}`;
  }
}

/**
 * Lightbox estilo Baños:
 * la imagen se ve completa en su proporción real, centrada,
 * sin ocupar toda la pantalla (márgenes alrededor).
 */
function Lightbox({ imagenes = [], indice, setIndice }) {
  const abierto = indice !== null && indice !== undefined;
  const n = imagenes.length;
  const [zoom, setZoom] = useState(1);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!abierto) return undefined;
    setZoom(1);
    const onKey = (e) => {
      if (e.key === 'Escape') setIndice(null);
      if (n > 1 && e.key === 'ArrowRight') setIndice((indice + 1) % n);
      if (n > 1 && e.key === 'ArrowLeft') setIndice((indice - 1 + n) % n);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [abierto, indice, n, setIndice]);

  if (!abierto || !n) return null;

  const src = urlDe(imagenes[indice]);
  const caption = tituloDe(imagenes[indice], indice);
  const ir = (dir) => {
    setZoom(1);
    setIndice((indice + dir + n) % n);
  };

  const toggleFullscreen = async (e) => {
    e.stopPropagation();
    const el = overlayRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) await el.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      /* ignore */
    }
  };

  const compartir = async (e) => {
    e.stopPropagation();
    try {
      if (navigator.share) await navigator.share({ title: caption, url: src });
      else if (navigator.clipboard) await navigator.clipboard.writeText(src);
    } catch {
      /* ignore */
    }
  };

  const btnIcon = {
    background: 'transparent',
    border: 0,
    color: 'rgba(255,255,255,0.92)',
    cursor: 'pointer',
    padding: 8,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Visor de galería"
      onClick={() => setIndice(null)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3000,
        /* Overlay semitransparente: se ve la grilla detrás, como en Baños */
        background: 'rgba(0, 0, 0, 0.78)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4.5rem 4rem 3.5rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 18,
          left: 22,
          color: 'rgba(255,255,255,0.92)',
          fontSize: 14,
          fontWeight: 500,
          fontVariantNumeric: 'tabular-nums',
          zIndex: 2,
        }}
      >
        {indice + 1} / {n}
      </div>

      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 16,
          display: 'flex',
          gap: 2,
          zIndex: 2,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" aria-label="Pantalla completa" onClick={toggleFullscreen} style={btnIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          aria-label={zoom > 1 ? 'Alejar' : 'Acercar'}
          onClick={() => setZoom((z) => (z > 1 ? 1 : 1.45))}
          style={btnIcon}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3-3M11 8v6M8 11h6" strokeLinecap="round" />
          </svg>
        </button>
        <button type="button" aria-label="Compartir" onClick={compartir} style={btnIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="2.2" fill="currentColor" stroke="none" />
            <circle cx="6" cy="12" r="2.2" fill="currentColor" stroke="none" />
            <circle cx="18" cy="19" r="2.2" fill="currentColor" stroke="none" />
            <path d="M8 12l8-6M8 12l8 6" strokeLinecap="round" />
          </svg>
        </button>
        <button type="button" aria-label="Cerrar" onClick={() => setIndice(null)} style={btnIcon}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {n > 1 && (
        <button
          type="button"
          aria-label="Anterior"
          onClick={(e) => { e.stopPropagation(); ir(-1); }}
          style={{
            position: 'absolute',
            left: 6,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 52,
            lineHeight: 1,
            color: 'rgba(255,255,255,0.88)',
            background: 'transparent',
            border: 0,
            cursor: 'pointer',
            zIndex: 2,
            padding: '0 10px',
          }}
        >
          ‹
        </button>
      )}

      {/* Imagen en proporción original, con margen (no fullscreen) */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: 'min(78vw, 920px)',
          maxHeight: '72vh',
          overflow: zoom > 1 ? 'auto' : 'visible',
        }}
      >
        <img
          src={src}
          alt={caption}
          style={{
            display: 'block',
            width: 'auto',
            height: 'auto',
            maxWidth: '100%',
            maxHeight: '68vh',
            objectFit: 'contain',
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease',
            userSelect: 'none',
            boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
          }}
        />
        <p
          style={{
            margin: '14px 0 0',
            color: 'rgba(255,255,255,0.78)',
            fontSize: 13,
            textAlign: 'center',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {caption}
        </p>
      </div>

      {n > 1 && (
        <button
          type="button"
          aria-label="Siguiente"
          onClick={(e) => { e.stopPropagation(); ir(1); }}
          style={{
            position: 'absolute',
            right: 6,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 52,
            lineHeight: 1,
            color: 'rgba(255,255,255,0.88)',
            background: 'transparent',
            border: 0,
            cursor: 'pointer',
            zIndex: 2,
            padding: '0 10px',
          }}
        >
          ›
        </button>
      )}
    </div>
  );
}

export default Lightbox;
