import { useState } from 'react';
import Lightbox from './Lightbox';

const INICIAL = 8;
const PASO = 8;
const MAX_EN_INICIO = 24;

function urlDe(item) {
  if (!item) return '';
  if (typeof item === 'string') return item;
  return item.url || item.src || '';
}

/**
 * Galería estilo Baños:
 * - Miniaturas cuadradas (recorte solo para la grilla), sin espacio entre ellas.
 * - Al clic: lightbox con la imagen completa en su proporción original.
 */
function GaleriaMasonry({ imagenes = [] }) {
  const [visibles, setVisibles] = useState(INICIAL);
  const [lb, setLb] = useState(null);

  if (!imagenes.length) return null;

  const tope = Math.min(imagenes.length, MAX_EN_INICIO);
  const lista = imagenes.slice(0, visibles).map(urlDe).filter(Boolean);
  const hayMas = visibles < tope;
  const hayOcultasEnBD = imagenes.length > MAX_EN_INICIO;

  return (
    <div>
      {/* Cuadrícula 1:1 con separación fina entre fotos (estilo Baños) */}
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-1.5 lg:grid-cols-4">
        {lista.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            onClick={() => setLb(i)}
            className="group relative aspect-square block w-full overflow-hidden bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
          >
            <img
              src={src}
              alt={`Galería Pelileo ${i + 1}`}
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
              loading="lazy"
            />
            <span className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
          </button>
        ))}
      </div>

      {(hayMas || hayOcultasEnBD) && (
        <div className="mt-10 text-center">
          {hayMas ? (
            <button
              type="button"
              onClick={() => setVisibles((n) => Math.min(n + PASO, tope))}
              className="rounded-full bg-primario px-8 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:bg-primario-oscuro"
            >
              Cargar más fotos
            </button>
          ) : (
            <p className="text-sm text-slate-500">
              Mostrando {tope} de {imagenes.length} fotos en el inicio.
            </p>
          )}
        </div>
      )}

      <Lightbox imagenes={lista} indice={lb} setIndice={setLb} />
    </div>
  );
}

export default GaleriaMasonry;
