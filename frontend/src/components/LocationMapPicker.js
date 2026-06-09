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

function LocationMapPicker({ latitud, longitud, onChange, height = 320 }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) {
      return undefined;
    }

    const initialLat = latitud ?? DEFAULT_CENTER[0];
    const initialLng = longitud ?? DEFAULT_CENTER[1];

    const map = L.map(mapRef.current).setView([initialLat, initialLng], DEFAULT_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);

    if (latitud != null && longitud != null) {
      markerRef.current = L.marker([latitud, longitud]).addTo(map);
    }

    map.on('click', (event) => {
      const { lat, lng } = event.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }
      onChange({
        latitud: Number(lat.toFixed(6)),
        longitud: Number(lng.toFixed(6)),
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
    if (!mapInstanceRef.current || latitud == null || longitud == null) {
      return;
    }
    const map = mapInstanceRef.current;
    if (markerRef.current) {
      markerRef.current.setLatLng([latitud, longitud]);
    } else {
      markerRef.current = L.marker([latitud, longitud]).addTo(map);
    }
    map.setView([latitud, longitud], map.getZoom());
  }, [latitud, longitud]);

  return (
    <div className="map-picker">
      <p className="section-note">Haz clic en el mapa para seleccionar la ubicación.</p>
      <div ref={mapRef} style={{ height, borderRadius: 8, border: '1px solid #ddd' }} />
    </div>
  );
}

export default LocationMapPicker;
