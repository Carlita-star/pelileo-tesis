import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Carrusel a pantalla grande para el inicio. Recibe un arreglo de URLs de
// imágenes, el título y el eslogan. Autoavanza cada 5s, con flechas y puntos.
function CarruselInicio({ imagenes = [], titulo, eslogan }) {
  const [i, setI] = useState(0);
  const n = imagenes.length;

  useEffect(() => {
    if (n <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % n), 5000);
    return () => clearInterval(t);
  }, [n]);

  const ir = (idx) => setI(((idx % n) + n) % n);

  return (
    <section className="relative h-[70vh] min-h-[440px] w-full overflow-hidden bg-slate-800">
      {/* Imágenes (fundido entre una y otra) */}
      {n > 0 ? (
        imagenes.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${idx === i ? 'opacity-100' : 'opacity-0'}`}
          />
        ))
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primario to-primario-oscuro" />
      )}

      {/* Capa oscura para que el texto siempre se lea */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/40 to-slate-900/30" />

      {/* Texto y botones */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight drop-shadow-lg sm:text-6xl">{titulo}</h1>
        {eslogan && <p className="mt-4 max-w-2xl text-lg text-white/90 drop-shadow sm:text-xl">{eslogan}</p>}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/atractivos" className="whitespace-nowrap rounded-full bg-primario px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-primario-oscuro">
            Explorar atractivos
          </Link>
          <Link to="/mapa" className="rounded-full border-2 border-white/80 px-7 py-3 font-semibold text-white backdrop-blur-sm transition hover:bg-white/10">
            Ver el mapa
          </Link>
        </div>
      </div>

      {/* Flechas y puntos */}
      {n > 1 && (
        <>
          <button onClick={() => ir(i - 1)} aria-label="Anterior"
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 px-3 py-1 text-2xl leading-none text-white backdrop-blur transition hover:bg-white/40">‹</button>
          <button onClick={() => ir(i + 1)} aria-label="Siguiente"
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 px-3 py-1 text-2xl leading-none text-white backdrop-blur transition hover:bg-white/40">›</button>
          <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {imagenes.map((_, idx) => (
              <button key={idx} onClick={() => ir(idx)} aria-label={`Imagen ${idx + 1}`}
                className={`h-2.5 rounded-full transition-all ${idx === i ? 'w-6 bg-white' : 'w-2.5 bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default CarruselInicio;