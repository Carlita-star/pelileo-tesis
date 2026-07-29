import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, GeoJSON, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CENTRO_PELILEO = [-1.3306, -78.5414];

function iconoParada(numero) {
  return L.divIcon({
    className: '',
    html: `<div style="background:#2563eb;color:#fff;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)">${numero}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    tooltipAnchor: [0, -12],
  });
}

function AjustarVista({ puntos }) {
  const map = useMap();

  useEffect(() => {
    if (puntos.length === 1) {
      map.setView(puntos[0], 14);
    } else if (puntos.length > 1) {
      map.fitBounds(puntos, { padding: [24, 24], maxZoom: 14 });
    }
  }, [map, puntos]);

  return null;
}

function MiniMapaRutaTarjeta({ paradas = [], geojson, latInicio, lonInicio }) {
  const paradasMapa = useMemo(
    () => paradas
      .filter((p) => p.lat != null && p.lng != null)
      .map((p, i) => ({
        lat: p.lat,
        lng: p.lng,
        nombre: p.nombre,
        orden: p.orden ?? i + 1,
      })),
    [paradas],
  );

  const puntos = useMemo(
    () => paradasMapa.map((p) => [p.lat, p.lng]),
    [paradasMapa],
  );

  const tieneInicio = latInicio != null && lonInicio != null;
  const puntosVista = puntos.length
    ? puntos
    : tieneInicio
      ? [[latInicio, lonInicio]]
      : [];

  const centro = puntosVista[0] || CENTRO_PELILEO;

  if (!puntosVista.length) {
    return (
      <div className="mt-4 overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200">
        <div className="flex h-[8.5rem] items-center justify-center px-4 text-center text-xs font-medium text-slate-500">
          {paradas.length > 0
            ? 'Las paradas de esta ruta no tienen ubicación en el mapa'
            : 'Agregue paradas con coordenadas para ver el recorrido'}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-primario/25 shadow-sm">
      <MapContainer
        center={centro}
        zoom={13}
        style={{ height: '8.5rem', width: '100%' }}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {geojson ? (
          <GeoJSON data={geojson} style={{ color: '#1D9E75', weight: 4, opacity: 0.9 }} />
        ) : (
          puntos.length > 1 && (
            <Polyline
              positions={puntos}
              pathOptions={{ color: '#1D9E75', weight: 4, opacity: 0.9 }}
            />
          )
        )}

        {paradasMapa.map((p) => (
          <Marker
            key={`${p.orden}-${p.nombre}`}
            position={[p.lat, p.lng]}
            icon={iconoParada(p.orden)}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
              {p.nombre}
            </Tooltip>
          </Marker>
        ))}

        <AjustarVista puntos={puntosVista} />
      </MapContainer>
    </div>
  );
}

export default MiniMapaRutaTarjeta;
