// Mini-mapa reutilizable basado en OpenStreetMap (sin librerías extra).
// Lo usamos en la ficha de atractivo (P-03) y en la de emprendimiento (P-07).
// El mapa grande e interactivo con Leaflet será la pantalla P-09.

function MiniMapa({ lat, lng, nombre = 'Ubicación' }) {
  // Si no hay coordenadas, no mostramos nada (la sección se oculta sola).
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return null;
  }

  const latN = Number(lat);
  const lngN = Number(lng);
  if (Number.isNaN(latN) || Number.isNaN(lngN)) return null;

  // Un pequeño recuadro alrededor del punto para centrar el mapa.
  const d = 0.008;
  const bbox = `${lngN - d},${latN - d},${lngN + d},${latN + d}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latN},${lngN}`;
  const googleMaps = `https://www.google.com/maps?q=${latN},${lngN}`;

  return (
    <div>
      <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200">
        <iframe
          title={`Mapa de ${nombre}`}
          src={src}
          className="h-72 w-full border-0"
          loading="lazy"
        />
      </div>
      <a
        href={googleMaps}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white transition hover:bg-primario-oscuro"
      >
        Abrir en Google Maps
      </a>
    </div>
  );
}

export default MiniMapa;