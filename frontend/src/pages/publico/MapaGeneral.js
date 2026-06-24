import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { listarAtractivos } from '../../services/atractivos.service';
import { listarRutas } from '../../services/rutas.service';
import { listarEmprendimientos } from '../../services/emprendimientos.service';
import { slugify } from '../../services/slug';
import BotonComoLlegar from '../../components/publico/ComoLlegar';
import { useConfiguracion } from '../../context/ConfiguracionContext';

const CENTRO_PELILEO = [-1.3306, -78.5414];
const ZOOM_INICIAL = 13;

const COLORES = {
  atractivo: '#1D9E75',      // verde
  ruta: '#2563eb',           // azul
  emprendimiento: '#ea580c', // naranja
};

// Ícono (en SVG) que representa cada tipo. Blanco para ir dentro del círculo.
const SVG_BLANCO = {
  atractivo: '<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M4 18l5-8 3.5 5L15 12l5 6z"/></svg>',
  ruta: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 16.5C11 14 10 9.5 16 8"/></svg>',
  emprendimiento: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linejoin="round"><path d="M6 8h12l-1 12H7z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
};

// Marcador: círculo del color del tipo, con su ícono dentro.
function iconoTipo(tipo) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${COLORES[tipo]};width:34px;height:34px;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;">${SVG_BLANCO[tipo]}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -16],
    tooltipAnchor: [16, 0],
  });
}

// Mini ícono coloreado para la etiqueta (al lado del nombre).
function MiniIcono({ tipo }) {
  const c = COLORES[tipo];
  const base = { width: 14, height: 14, viewBox: '0 0 24 24', style: { flexShrink: 0 } };
  if (tipo === 'atractivo') return (<svg {...base} fill={c}><path d="M4 18l5-8 3.5 5L15 12l5 6z" /></svg>);
  if (tipo === 'ruta') return (
    <svg {...base} fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round">
      <circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 16.5C11 14 10 9.5 16 8" />
    </svg>
  );
  return (
    <svg {...base} fill="none" stroke={c} strokeWidth="2.5" strokeLinejoin="round">
      <path d="M6 8h12l-1 12H7z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function MapaGeneral() {
  const config = useConfiguracion();
  const mapRef = useRef(null);
  const centro = useMemo(() => {
    if (config.latitud != null && config.longitud != null) {
      return [Number(config.latitud), Number(config.longitud)];
    }
    return CENTRO_PELILEO;
  }, [config.latitud, config.longitud]);
  const [marcadores, setMarcadores] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [capas, setCapas] = useState({ atractivo: true, ruta: true, emprendimiento: true });

  useEffect(() => {
    let activo = true;
    Promise.allSettled([listarAtractivos(), listarRutas(), listarEmprendimientos()])
      .then(([at, ru, em]) => {
        if (!activo) return;
        const lista = [];

        (at.value ?? []).forEach((a) => {
          if (a.latitud != null && a.longitud != null) {
            lista.push({ tipo: 'atractivo', nombre: a.nombre, sub: a.categoria, lat: a.latitud, lng: a.longitud, to: `/atractivos/${a.slug ?? a.id}` });
          }
        });
        (ru.value ?? []).forEach((r) => {
          if (r.lat_inicio != null && r.lon_inicio != null) {
            lista.push({ tipo: 'ruta', nombre: r.nombre, sub: 'Ruta turística', lat: r.lat_inicio, lng: r.lon_inicio, to: `/rutas/${r.id}-${slugify(r.nombre)}` });
          }
        });
        (em.value ?? []).forEach((e) => {
          if (e.latitud != null && e.longitud != null) {
            lista.push({ tipo: 'emprendimiento', nombre: e.nombre, sub: e.categoria, lat: e.latitud, lng: e.longitud, to: `/emprendimientos/${e.id}-${slugify(e.nombre)}` });
          }
        });

        setMarcadores(lista);
      });
    return () => { activo = false; };
  }, []);

  const visibles = useMemo(
    () => marcadores.filter((m) =>
      capas[m.tipo] && (m.nombre ?? '').toLowerCase().includes(busqueda.toLowerCase())
    ),
    [marcadores, capas, busqueda]
  );

  const miUbicacion = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => mapRef.current.setView([pos.coords.latitude, pos.coords.longitude], 15),
      () => {}
    );
  };

  const toggle = (tipo) => setCapas((c) => ({ ...c, [tipo]: !c[tipo] }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-3xl font-extrabold text-slate-800">Mapa turístico de Pelileo</h1>
      <p className="mt-2 text-slate-500">Explora atractivos, rutas y emprendimientos en un solo lugar.</p>

      {/* z-0 mantiene todo el mapa por debajo del menú al hacer scroll */}
      <div className="relative z-0 mt-6 h-[70vh] overflow-hidden rounded-2xl ring-1 ring-slate-200">
        {/* Buscador */}
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre..."
          className="absolute left-3 top-3 z-[1000] w-56 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow outline-none focus:border-primario"
        />

        {/* Panel de capas */}
        <div className="absolute right-3 top-3 z-[1000] rounded-lg bg-white p-3 text-sm shadow ring-1 ring-slate-200">
          {[
            { tipo: 'atractivo', etiqueta: 'Atractivos' },
            { tipo: 'ruta', etiqueta: 'Rutas' },
            { tipo: 'emprendimiento', etiqueta: 'Emprendimientos' },
          ].map((c) => (
            <label key={c.tipo} className="flex cursor-pointer items-center gap-2 py-0.5">
              <input type="checkbox" checked={capas[c.tipo]} onChange={() => toggle(c.tipo)} />
              <span className="inline-block h-3 w-3 rounded-full" style={{ background: COLORES[c.tipo] }} />
              {c.etiqueta}
            </label>
          ))}
        </div>

        {/* Botón de mi ubicación */}
        <button
          onClick={miUbicacion}
          className="absolute bottom-4 right-3 z-[1000] rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-primario-oscuro"
        >
          Mi ubicación
        </button>

        <MapContainer center={centro} zoom={ZOOM_INICIAL} ref={mapRef} className="h-full w-full">
          <TileLayer
            attribution='&copy; colaboradores de OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {visibles.map((m, i) => (
            <Marker key={i} position={[m.lat, m.lng]} icon={iconoTipo(m.tipo)}>
              {/* Etiqueta permanente con ícono + nombre */}
              <Tooltip permanent direction="right" offset={[14, 0]}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
                  <MiniIcono tipo={m.tipo} />
                  {m.nombre}
                </span>
              </Tooltip>

              <Popup>
                <div className="min-w-[140px]">
                  <p className="font-semibold text-slate-800">{m.nombre}</p>
                  {m.sub && <p className="text-xs text-slate-500">{m.sub}</p>}
                  <Link to={m.to} className="mt-1 inline-block text-sm font-medium text-primario hover:underline">
                    Ver ficha →
                  </Link>
                  <div className="mt-2">
                    <BotonComoLlegar lat={m.lat} lng={m.lng} etiqueta="Cómo llegar"
                      className="rounded-md bg-primario px-3 py-1 text-xs font-semibold text-white" />
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <p className="mt-3 text-xs text-slate-400">{visibles.length} punto(s) en el mapa</p>
    </div>
  );
}

export default MapaGeneral;