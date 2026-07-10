import { useEffect, useState } from 'react';
import Lightbox from './Lightbox';

const INTERVALO_MS = 5000;

// Galería estilo "coverflow": la imagen del centro se ve grande y clara, y las
// de los lados aparecen más pequeñas y un poco opacas. Autoavanza cada 5s,
// flechas y puntos para navegar; al hacer clic en la del centro se abre el lightbox.
function GaleriaCarrusel({ imagenes = [] }) {
  const [activo, setActivo] = useState(0);
  const [lb, setLb] = useState(null);
  const [pausado, setPausado] = useState(false);
  const n = imagenes.length;

  useEffect(() => {
    if (n <= 1 || lb != null || pausado) return;
    const t = setInterval(() => setActivo((p) => (p + 1) % n), INTERVALO_MS);
    return () => clearInterval(t);
  }, [n, lb, pausado]);

  if (n === 0) return null;

  const ir = (idx) => setActivo(((idx % n) + n) % n);

  return (
    <div>
      <div
        className="relative mx-auto flex h-72 max-w-4xl items-center justify-center overflow-hidden sm:h-96"
        onMouseEnter={() => setPausado(true)}
        onMouseLeave={() => setPausado(false)}
      >
        {imagenes.map((src, i) => {
          // Distancia (con envoltura) de esta imagen respecto a la del centro.
          let offset = i - activo;
          if (offset > n / 2) offset -= n;
          if (offset < -n / 2) offset += n;
          const dist = Math.abs(offset);
          const visible = dist <= 2;
          const esCentro = offset === 0;

          const estilo = {
            transform: `translateX(${offset * 52}%) scale(${1 - dist * 0.16})`,
            opacity: visible ? 1 - dist * 0.4 : 0,
            zIndex: 10 - dist,
            pointerEvents: esCentro ? 'auto' : 'none',
            transition: 'transform .5s ease, opacity .5s ease',
          };

          return (
            <div
              key={src}
              style={estilo}
              onClick={() => esCentro && setLb(i)}
              className="absolute h-60 w-[78%] overflow-hidden rounded-2xl shadow-xl ring-1 ring-slate-200 sm:h-80 sm:w-[56%]"
            >
              <img
                src={src}
                alt={`Pelileo ${i + 1}`}
                className={`h-full w-full object-cover ${esCentro ? 'cursor-zoom-in' : ''}`}
              />
            </div>
          );
        })}

        {n > 1 && (
          <>
            <button onClick={() => ir(activo - 1)} aria-label="Anterior"
              className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 px-3 py-1 text-2xl leading-none text-slate-700 shadow-lg transition hover:bg-white">‹</button>
            <button onClick={() => ir(activo + 1)} aria-label="Siguiente"
              className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/90 px-3 py-1 text-2xl leading-none text-slate-700 shadow-lg transition hover:bg-white">›</button>
          </>
        )}
      </div>

      {n > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {imagenes.map((_, i) => (
            <button key={i} onClick={() => ir(i)} aria-label={`Foto ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${i === activo ? 'w-6 bg-primario' : 'w-2.5 bg-slate-300'}`} />
          ))}
        </div>
      )}

      <Lightbox imagenes={imagenes} indice={lb} setIndice={setLb} />
    </div>
  );
}

export default GaleriaCarrusel;