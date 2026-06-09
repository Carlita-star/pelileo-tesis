// Abre Google Maps con la ruta desde la ubicación actual del usuario hasta el
// destino (lat, lng). Si el navegador no da permiso de ubicación, Google Maps
// igual usa la ubicación del usuario como origen.
export function abrirComoLlegar(lat, lng) {
  const destino = `${lat},${lng}`;
  const base = 'https://www.google.com/maps/dir/?api=1';

  const abrir = (origen) => {
    const url = origen
      ? `${base}&origin=${origen}&destination=${destino}&travelmode=driving`
      : `${base}&destination=${destino}&travelmode=driving`;
    window.open(url, '_blank', 'noopener');
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => abrir(`${pos.coords.latitude},${pos.coords.longitude}`),
      () => abrir(null),
      { timeout: 6000 }
    );
  } else {
    abrir(null);
  }
}

// Botón reutilizable. Se puede usar en cualquier ficha o popup del mapa.
function BotonComoLlegar({ lat, lng, etiqueta = 'Cómo llegar', className }) {
  if (lat == null || lng == null) return null;
  return (
    <button
      type="button"
      onClick={() => abrirComoLlegar(lat, lng)}
      className={className || 'inline-flex items-center gap-2 rounded-lg bg-primario px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primario-oscuro'}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      {etiqueta}
    </button>
  );
}

export default BotonComoLlegar;