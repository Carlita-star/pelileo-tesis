import { formatCoordinates, NA } from '../../utils/detailFormatters';

function DetailMapEmbed({ lat, lng, nombre = 'Ubicación' }) {
  if (lat == null || lng == null) {
    return <p className="admin-detail-empty">{NA}</p>;
  }

  const latN = Number(lat);
  const lngN = Number(lng);
  if (Number.isNaN(latN) || Number.isNaN(lngN)) {
    return <p className="admin-detail-empty">{NA}</p>;
  }

  const d = 0.012;
  const bbox = `${lngN - d},${latN - d},${lngN + d},${latN + d}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${latN},${lngN}`;

  return (
    <div className="admin-detail-map">
      <p className="admin-detail-coords">{formatCoordinates(latN, lngN)}</p>
      <iframe
        title={`Mapa de ${nombre}`}
        src={src}
        loading="lazy"
        className="admin-detail-map-frame"
      />
    </div>
  );
}

export default DetailMapEmbed;
