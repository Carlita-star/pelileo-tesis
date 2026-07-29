import { useState } from 'react';

function estrellaPath() {
  return 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';
}

function tamanoClase(size) {
  if (size === 'sm') return 'h-3.5 w-3.5';
  if (size === 'md') return 'h-5 w-5';
  if (size === 'lg') return 'h-6 w-6';
  return 'h-4 w-4';
}

export function ResumenEstrellas({ promedio = 0, total = 0, size = 'sm', className = '' }) {
  const valor = Number(promedio) || 0;
  const cantidad = Number(total) || 0;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`} aria-label={`Calificación ${valor} de 5, ${cantidad} reseñas`}>
      <span className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const llena = valor >= n;
          const media = !llena && valor >= n - 0.5;
          return (
            <svg
              key={n}
              className={`${tamanoClase(size)} ${llena || media ? 'text-amber-400' : 'text-slate-300'}`}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d={estrellaPath()} opacity={media ? 0.45 : 1} />
            </svg>
          );
        })}
      </span>
      {cantidad > 0 ? (
        <span className="text-xs font-medium text-slate-500">
          {valor.toFixed(1)} ({cantidad})
        </span>
      ) : (
        <span className="text-xs text-slate-400">Sin reseñas</span>
      )}
    </div>
  );
}

export function SelectorEstrellas({ valor, onChange, size = 'lg', disabled = false }) {
  const [hover, setHover] = useState(null);
  const mostrar = hover ?? valor;
  const sinSeleccion = !valor || valor < 1;

  const etiqueta = sinSeleccion
    ? 'Toca una estrella para calificar'
    : `${valor} de 5 estrella${valor === 1 ? '' : 's'}`;

  return (
    <div className="selector-estrellas">
      <p className={`selector-estrellas__hint${sinSeleccion ? ' selector-estrellas__hint--pendiente' : ''}`}>
        {etiqueta}
      </p>
      <div
        className="selector-estrellas__grupo"
        role="group"
        aria-label="Selecciona tu calificación de 1 a 5 estrellas"
        onMouseLeave={() => setHover(null)}
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const activa = n <= mostrar;
          return (
            <button
              key={n}
              type="button"
              disabled={disabled}
              onClick={() => onChange(n)}
              onMouseEnter={() => !disabled && setHover(n)}
              className={`selector-estrellas__btn${activa ? ' is-active' : ''}${disabled ? ' is-disabled' : ''}`}
              aria-label={`${n} estrella${n > 1 ? 's' : ''}`}
              aria-pressed={n <= valor}
            >
              <svg className={tamanoClase(size)} viewBox="0 0 24 24" aria-hidden>
                <path
                  d={estrellaPath()}
                  fill={activa ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth={activa ? 0 : 1.75}
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ResumenEstrellas;
