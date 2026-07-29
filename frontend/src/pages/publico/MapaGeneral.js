import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { listarAtractivos } from '../../services/atractivos.service';
import { listarRutas } from '../../services/rutas.service';
import { listarEmprendimientos } from '../../services/emprendimientos.service';
import { listarEventos } from '../../services/eventos.service';
import { slugify } from '../../services/slug';
import { urlImagen } from '../../services/media';
import BotonComoLlegar from '../../components/publico/ComoLlegar';
import { useConfiguracion } from '../../context/ConfiguracionContext';

const CENTRO_PELILEO = [-1.3306, -78.5414];
const ZOOM_INICIAL = 13;

const COLORES = {
  atractivo: '#1D9E75',
  ruta: '#2563eb',
  emprendimiento: '#ea580c',
  evento: '#7c3aed',
};

/** Iconos blancos para marcadores (siluetas nítidas a tamaño pequeño). */
const SVG_BLANCO = {
  atractivo:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="white">'
    + '<path d="M3 19h18L14.2 7.8a2.2 2.2 0 0 0-4.4 0L3 19z"/>'
    + '<path d="M10.5 19l4.2-7.2a1.8 1.8 0 0 1 3.1 0L22 19H10.5z" opacity=".55"/>'
    + '<circle cx="17.2" cy="7.2" r="1.6"/>'
    + '</svg>',
  ruta:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'
    + '<circle cx="6" cy="19" r="2.2" fill="white" stroke="none"/>'
    + '<circle cx="18" cy="5" r="2.2" fill="white" stroke="none"/>'
    + '<path d="M8 17.5c2.2-1.2 3.2-3.2 3.5-5.2.4-2.4 1.6-4.2 4.2-5.6"/>'
    + '<path d="M15.5 5H18v2.5"/>'
    + '</svg>',
  emprendimiento:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    + '<path d="M4 10h16v10H4z" fill="white" fill-opacity=".2"/>'
    + '<path d="M3 10l1.5-5h15L21 10"/>'
    + '<path d="M4 10v10h16V10"/>'
    + '<path d="M9 20v-5h6v5"/>'
    + '<path d="M8 6.5V5a1 1 0 0 1 1-1h.5"/>'
    + '</svg>',
  evento:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
    + '<rect x="3" y="5" width="18" height="16" rx="2.5" fill="white" fill-opacity=".15"/>'
    + '<path d="M3 9.5h18"/>'
    + '<path d="M8 3v4M16 3v4"/>'
    + '<circle cx="8.5" cy="14" r="1.2" fill="white" stroke="none"/>'
    + '<circle cx="12" cy="14" r="1.2" fill="white" stroke="none"/>'
    + '<circle cx="15.5" cy="14" r="1.2" fill="white" stroke="none"/>'
    + '</svg>',
};

function iconoTipo(tipo) {
  return L.divIcon({
    className: '',
    html: `<div style="background:${COLORES[tipo]};width:36px;height:36px;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;">${SVG_BLANCO[tipo]}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
    tooltipAnchor: [18, 0],
  });
}

function MiniIcono({ tipo, size = 22 }) {
  const c = COLORES[tipo];
  const base = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    style: { flexShrink: 0 },
  };

  if (tipo === 'atractivo') {
    return (
      <svg {...base}>
        <path fill={c} d="M3 19h18L14.2 7.8a2.2 2.2 0 0 0-4.4 0L3 19z" />
        <path fill={c} fillOpacity="0.45" d="M10.5 19l4.2-7.2a1.8 1.8 0 0 1 3.1 0L22 19H10.5z" />
        <circle fill={c} cx="17.2" cy="7.2" r="1.6" />
      </svg>
    );
  }

  if (tipo === 'ruta') {
    return (
      <svg {...base} fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="19" r="2.2" fill={c} stroke="none" />
        <circle cx="18" cy="5" r="2.2" fill={c} stroke="none" />
        <path d="M8 17.5c2.2-1.2 3.2-3.2 3.5-5.2.4-2.4 1.6-4.2 4.2-5.6" />
        <path d="M15.5 5H18v2.5" />
      </svg>
    );
  }

  if (tipo === 'evento') {
    return (
      <svg {...base} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2.5" fill={c} fillOpacity="0.12" />
        <path d="M3 9.5h18" />
        <path d="M8 3v4M16 3v4" />
        <circle cx="8.5" cy="14" r="1.2" fill={c} stroke="none" />
        <circle cx="12" cy="14" r="1.2" fill={c} stroke="none" />
        <circle cx="15.5" cy="14" r="1.2" fill={c} stroke="none" />
      </svg>
    );
  }

  // emprendimiento — local / tienda
  return (
    <svg {...base} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10h16v10H4z" fill={c} fillOpacity="0.12" />
      <path d="M3 10l1.5-5h15L21 10" />
      <path d="M4 10v10h16V10" />
      <path d="M9 20v-5h6v5" />
      <path d="M8 6.5V5a1 1 0 0 1 1-1h.5" />
    </svg>
  );
}

function ControlesZoom() {
  const map = useMap();
  return (
    <div className="mapa-zoom-btns">
      <button type="button" aria-label="Acercar" onClick={() => map.zoomIn()}>+</button>
      <button type="button" aria-label="Alejar" onClick={() => map.zoomOut()}>−</button>
    </div>
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
  const [capas, setCapas] = useState({
    atractivo: true,
    ruta: true,
    emprendimiento: true,
    evento: true,
  });
  const [filtroAbierto, setFiltroAbierto] = useState(true);

  const CAPAS_MAPA = [
    { tipo: 'atractivo', etiqueta: 'Atractivos' },
    { tipo: 'ruta', etiqueta: 'Rutas' },
    { tipo: 'emprendimiento', etiqueta: 'Emprendimientos' },
    { tipo: 'evento', etiqueta: 'Eventos' },
  ];

  useEffect(() => {
    let activo = true;
    Promise.allSettled([
      listarAtractivos(),
      listarRutas(),
      listarEmprendimientos(),
      listarEventos(),
    ])
      .then(([at, ru, em, ev]) => {
        if (!activo) return;
        const lista = [];

        (at.value ?? []).forEach((a) => {
          if (a.latitud != null && a.longitud != null) {
            lista.push({
              tipo: 'atractivo',
              nombre: a.nombre,
              sub: a.categoria,
              descripcion: a.descripcion,
              imagen: urlImagen(a.imagen),
              lat: a.latitud,
              lng: a.longitud,
              to: `/atractivos/${a.slug ?? a.id}`,
            });
          }
        });
        (ru.value ?? []).forEach((r) => {
          if (r.lat_inicio != null && r.lon_inicio != null) {
            lista.push({
              tipo: 'ruta',
              nombre: r.nombre,
              sub: 'Ruta turística',
              descripcion: r.descripcion,
              imagen: urlImagen(r.imagen),
              lat: r.lat_inicio,
              lng: r.lon_inicio,
              to: `/rutas/${r.id}-${slugify(r.nombre)}`,
            });
          }
        });
        (em.value ?? []).forEach((e) => {
          if (e.latitud != null && e.longitud != null) {
            lista.push({
              tipo: 'emprendimiento',
              nombre: e.nombre,
              sub: e.categoria,
              descripcion: e.descripcion,
              imagen: urlImagen(e.imagen),
              lat: e.latitud,
              lng: e.longitud,
              to: `/emprendimientos/${e.id}-${slugify(e.nombre)}`,
            });
          }
        });
        (ev.value ?? []).forEach((e) => {
          if (e.latitud != null && e.longitud != null) {
            lista.push({
              tipo: 'evento',
              nombre: e.nombre,
              sub: e.categoria || 'Evento',
              descripcion: e.descripcion,
              imagen: urlImagen(e.imagen),
              lat: Number(e.latitud),
              lng: Number(e.longitud),
              to: `/eventos/${e.id}-${slugify(e.nombre)}`,
            });
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
    <div className="mapa-general min-h-screen bg-[#f7f8f6]">
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Mapa turístico de Pelileo
          </h1>
          <p className="mt-2 max-w-2xl text-slate-500">
            Explora atractivos, rutas, emprendimientos y eventos en un solo lugar.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mapa-general__canvas relative z-0">
          <div className="mapa-busqueda mapa-busqueda--overlay">
            <svg className="mapa-busqueda__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar..."
              className="mapa-busqueda__input"
              aria-label="Buscar en el mapa"
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

          <div className="mapa-acciones-derecha">
            <button
              type="button"
              onClick={miUbicacion}
              className="mapa-ubicacion-btn"
              title="Mi ubicación"
              aria-label="Ir a mi ubicación"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <MapContainer
            center={centro}
            zoom={ZOOM_INICIAL}
            ref={mapRef}
            className="mapa-general__map h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; colaboradores de OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ControlesZoom />
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
                  <div className="mapa-popup-card">
                    {m.imagen && (
                      <img src={m.imagen} alt="" className="mapa-popup-card__img" />
                    )}
                    <div className="mapa-popup-card__body">
                      <p className="mapa-popup-card__title">{m.nombre}</p>
                      {m.sub && <p className="mapa-popup-card__sub">{m.sub}</p>}
                      {m.descripcion && (
                        <p className="mapa-popup-card__desc">
                          {m.descripcion.length > 110
                            ? `${m.descripcion.slice(0, 110)}…`
                            : m.descripcion}
                        </p>
                      )}
                      <Link to={m.to} className="mapa-popup-card__link">
                        Ver ficha →
                      </Link>
                      <div className="mt-2">
                        <BotonComoLlegar
                          lat={m.lat}
                          lng={m.lng}
                          etiqueta="Cómo llegar"
                          className="rounded-md bg-primario px-3 py-1 text-xs font-semibold text-white"
                        />
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <p className="mt-3 text-xs text-slate-400">{visibles.length} punto(s) en el mapa</p>
      </div>
    </div>
  );
}

export default MapaGeneral;
