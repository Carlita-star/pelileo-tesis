import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
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
function MiniIcono({ tipo, size = 14 }) {
  const c = COLORES[tipo];
  const base = { width: size, height: size, viewBox: '0 0 24 24', style: { flexShrink: 0 } };
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

function AjustarVista({ puntos, centro }) {
  const map = useMap();

  useEffect(() => {
    if (!puntos.length) {
      map.setView(centro, ZOOM_INICIAL);
      return;
    }
    if (puntos.length === 1) {
      map.setView([puntos[0].lat, puntos[0].lng], 14);
      return;
    }
    const bounds = L.latLngBounds(puntos.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { paddingTopLeft: [240, 72], paddingBottomRight: [280, 90], maxZoom: 14 });
  }, [puntos, map, centro]);

  return null;
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
  const [filtroAbierto, setFiltroAbierto] = useState(true);

  const CAPAS_MAPA = [
    { tipo: 'atractivo', etiqueta: 'Atractivos' },
    { tipo: 'ruta', etiqueta: 'Rutas' },
    { tipo: 'emprendimiento', etiqueta: 'Emprendimientos' },
  ];

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
    <div className="mapa-general mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-extrabold text-slate-800">Mapa turístico de Pelileo</h1>
      <p className="mt-2 text-slate-500">Explora atractivos, rutas y emprendimientos en un solo lugar.</p>

      <div className="mapa-general__canvas relative z-0 mt-6">
        <div className="mapa-busqueda mapa-busqueda--overlay">
          <svg className="mapa-busqueda__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3-3" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre..."
            className="mapa-busqueda__input"
          />
        </div>

        <div className="mapa-filtro-panel mapa-filtro-panel--overlay">
          <div className="mapa-filtro-panel__header">
            <span>Filtros</span>
            <button
              type="button"
              className="mapa-filtro-panel__toggle"
              onClick={() => setFiltroAbierto((v) => !v)}
              aria-expanded={filtroAbierto}
              aria-label={filtroAbierto ? 'Contraer filtros' : 'Expandir filtros'}
            >
              {filtroAbierto ? '−' : '+'}
            </button>
          </div>
          {filtroAbierto && (
            <div className="mapa-filtro-panel__body">
              {CAPAS_MAPA.map((c) => (
                <label key={c.tipo} className="mapa-filtro-panel__item">
                  <input
                    type="checkbox"
                    className="mapa-filtro-panel__checkbox"
                    checked={capas[c.tipo]}
                    onChange={() => toggle(c.tipo)}
                  />
                  <span className="mapa-filtro-panel__icon" style={{ color: COLORES[c.tipo] }}>
                    <MiniIcono tipo={c.tipo} size={22} />
                  </span>
                  <span className="mapa-filtro-panel__label">{c.etiqueta}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={miUbicacion}
          className="mapa-ubicacion-btn absolute bottom-5 right-4 z-[1000] rounded-xl bg-primario px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-primario-oscuro"
        >
          Mi ubicación
        </button>

        <MapContainer center={centro} zoom={ZOOM_INICIAL} ref={mapRef} className="mapa-general__map h-full w-full">
          <TileLayer
            attribution='&copy; colaboradores de OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <AjustarVista puntos={visibles} centro={centro} />
          {visibles.map((m, i) => (
            <Marker key={`${m.tipo}-${m.to}-${i}`} position={[m.lat, m.lng]} icon={iconoTipo(m.tipo)}>
              <Tooltip permanent direction="top" offset={[0, -18]} className="mapa-tooltip-nombre">
                <span className="mapa-tooltip-nombre__inner">
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