import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [-1.3167, -78.6167];
const DEFAULT_ZOOM = 13;

function toCoord(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function LocationMapPicker({ latitud, longitud, onChange, height = 320 }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) {
      return undefined;
    }

    const initialLat = toCoord(latitud) ?? DEFAULT_CENTER[0];
    const initialLng = toCoord(longitud) ?? DEFAULT_CENTER[1];

    const map = L.map(mapRef.current).setView([initialLat, initialLng], DEFAULT_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    const lat = toCoord(latitud);
    const lng = toCoord(longitud);
    if (lat != null && lng != null) {
      markerRef.current = L.marker([lat, lng]).addTo(map);
    }

    map.on('click', (event) => {
      const { lat: clickLat, lng: clickLng } = event.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([clickLat, clickLng]);
      } else {
        markerRef.current = L.marker([clickLat, clickLng]).addTo(map);
      }
      onChange({
        latitud: Number(clickLat.toFixed(6)),
        longitud: Number(clickLng.toFixed(6)),
      });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lat = toCoord(latitud);
    const lng = toCoord(longitud);
    if (!mapInstanceRef.current || lat == null || lng == null) {
      return;
    }
    const map = mapInstanceRef.current;
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng]).addTo(map);
    }
    map.setView([lat, lng], map.getZoom() || DEFAULT_ZOOM);
  }, [latitud, longitud]);

  return (
    <div className="map-picker">
      <p className="section-note">Haz clic en el mapa para seleccionar la ubicación.</p>
      <div ref={mapRef} style={{ height, borderRadius: 8, border: '1px solid #ddd' }} />
    </div>
  );
}

export default LocationMapPicker;
