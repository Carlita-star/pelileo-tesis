import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, GeoJSON, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Marcador circular numerado (parada 1, 2, 3...).
function iconoNumero(n) {
  return L.divIcon({
    className: '',
    html: `<div style="background:#1D9E75;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.4)">${n}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
}

// Ajusta el zoom para que se vea todo el recorrido.
function Ajustar({ puntos }) {
  const map = useMap();
  useEffect(() => {
    if (puntos.length === 1) map.setView(puntos[0], 14);
    else if (puntos.length > 1) map.fitBounds(puntos, { padding: [45, 45] });
  }, [map, puntos]);
  return null;
}

// paradas: [{ lat, lng, nombre, orden }]
// geojson: trazado oficial (opcional). Si no hay, une las paradas con una línea.
function MapaRuta({ paradas = [], geojson, centro }) {
  const conCoords = paradas.filter((p) => p.lat != null && p.lng != null);
  const puntos = conCoords.map((p) => [p.lat, p.lng]);
  const centroInicial = puntos[0] || centro || [-1.3306, -78.5414];

  return (
    <MapContainer center={centroInicial} zoom={14} style={{ height: '22rem', width: '100%' }} className="rounded-2xl ring-1 ring-slate-200">
      <TileLayer attribution="&copy; colaboradores de OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Trazado: el oficial (geojson) o una línea uniendo las paradas */}
      {geojson ? (
        <GeoJSON data={geojson} style={{ color: '#1D9E75', weight: 4 }} />
      ) : (
        puntos.length > 1 && <Polyline positions={puntos} pathOptions={{ color: '#1D9E75', weight: 4, dashArray: '6 8' }} />
      )}

      {/* Paradas numeradas */}
      {conCoords.map((p, i) => (
        <Marker key={i} position={[p.lat, p.lng]} icon={iconoNumero(p.orden ?? i + 1)}>
          {p.nombre && <Popup>{p.nombre}</Popup>}
        </Marker>
      ))}

      <Ajustar puntos={puntos} />
    </MapContainer>
  );
}

export default MapaRuta;