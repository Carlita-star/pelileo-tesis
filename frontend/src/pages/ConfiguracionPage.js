import { useCallback, useEffect, useState } from 'react';
import { apiRequest, getApiBase, getAuthHeaders } from '../services/apiClient';
import { applySiteFavicon } from '../services/configuracion.service';
import MenuNavegacionTab from '../components/configuracion/MenuNavegacionTab';
import { useToast } from '../context/ToastContext';
import { useErrorToast } from '../hooks/useErrorToast';

const TABS = [
  { key: 'gad', label: 'Datos del GAD' },
  { key: 'identidad', label: 'Identidad visual' },
  { key: 'apariencia', label: 'Apariencia' },
  { key: 'redes', label: 'Redes sociales' },
  { key: 'header-footer', label: 'Header y footer' },
  { key: 'menu', label: 'Menú' },
  { key: 'mapa', label: 'Mapa' },
];

const REDES_OPCIONES = ['Facebook', 'Instagram', 'X (Twitter)', 'YouTube', 'TikTok', 'WhatsApp'];
const FUENTES = [
  'Inter, sans-serif',
  'Roboto, sans-serif',
  'Open Sans, sans-serif',
  'Lato, sans-serif',
  'Montserrat, sans-serif',
];

function mediaUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`;
}

function emptyRed() {
  return { id: null, nombre: 'Facebook', url: '', activo: true };
}

function ConfiguracionPage() {
  const toast = useToast();
  const [tabActiva, setTabActiva] = useState('gad');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [gad, setGad] = useState({});
  const [identidad, setIdentidad] = useState({});
  const [apariencia, setApariencia] = useState({});
  const [redes, setRedes] = useState([]);
  const [header, setHeader] = useState({});
  const [footer, setFooter] = useState({});
  const [menus, setMenus] = useState([]);
  const [mapa, setMapa] = useState({ latitud: '', longitud: '' });

  const aplicarDatos = useCallback((data) => {
    const emp = data.empresa || {};
    setGad({
      nombre: emp.nombre || '',
      nombre_comercial: emp.nombre_comercial || '',
      ruc: emp.ruc || '',
      telefono: emp.telefono || '',
      celular: emp.celular || '',
      email: emp.email || '',
      sitio_web: emp.sitio_web || '',
      direccion: emp.direccion || '',
      provincia: emp.provincia || '',
      canton: emp.canton || '',
      parroquia: emp.parroquia || '',
      descripcion: emp.descripcion || '',
      historia: emp.historia || '',
      mision: emp.mision || '',
      vision: emp.vision || '',
      eslogan: emp.eslogan || '',
    });
    setIdentidad({
      logo_principal_url: emp.logo_principal_url,
      logo_secundario_url: emp.logo_secundario_url,
      favicon_url: emp.favicon_url,
    });
    setApariencia(data.apariencia || {});
    setRedes(data.redes?.length ? data.redes : []);
    setHeader(data.header || {});
    setFooter(data.footer || {});
    setMenus(data.menus?.length ? data.menus : []);
    setMapa({
      latitud: emp.latitud ?? '',
      longitud: emp.longitud ?? '',
    });
  }, []);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/api/admin/configuracion/');
      aplicarDatos(data);
    } catch (err) {
      setError(err.message || 'No se pudo cargar la configuración.');
    } finally {
      setLoading(false);
    }
  }, [aplicarDatos]);

  useEffect(() => { cargar(); }, [cargar]);

  useErrorToast(error, { action: { label: 'Reintentar', onClick: cargar } });

  const guardar = async (endpoint, payload, mensaje) => {
    setSaving(true);
    setError('');
    try {
      const data = await apiRequest(`/api/admin/configuracion/${endpoint}/`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      aplicarDatos(data);
      toast.success(mensaje);
    } catch (err) {
      toast.error(err.message || 'Error al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const subirImagen = async (tipo, file) => {
    const body = new FormData();
    body.append('tipo', tipo);
    body.append('archivo', file);
    const response = await fetch(`${getApiBase()}/api/admin/configuracion/imagen/`, {
      method: 'POST',
      headers: getAuthHeaders(false),
      body,
    });
    const raw = await response.text();
    let data = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch { /* ignore */ }
    if (!response.ok) throw new Error(data.error || `Error ${response.status}`);
    return data;
  };

  const handleImagen = async (tipo, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    setError('');
    try {
      const result = await subirImagen(tipo, file);
      const imageUrl = mediaUrl(result.url);
      setIdentidad((prev) => ({
        ...prev,
        [`${tipo}_url`]: result.url,
      }));
      if (tipo === 'favicon' && imageUrl) {
        applySiteFavicon(imageUrl, { cacheBust: true });
      }
      toast.success('Imagen cargada correctamente.');
    } catch (err) {
      toast.error(err.message || 'Error al subir la imagen.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="panel-card">
        <div className="table-spinner"><span className="loader" />Cargando configuración…</div>
      </section>
    );
  }

  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <h2>Configuración institucional</h2>
          <p className="section-description">
            Personalice la identidad visual y los datos del GAD para el portal público.
          </p>
        </div>
      </div>

      <div className="catalog-tabs">
        <div className="catalog-tabs-header">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`catalog-tab-button ${tabActiva === tab.key ? 'active' : ''}`}
              onClick={() => setTabActiva(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="catalog-tab-panel">
          {tabActiva === 'gad' && (
            <form className="catalog-form config-form" onSubmit={(e) => { e.preventDefault(); guardar('gad', gad, 'Datos del GAD guardados.'); }}>
              <div className="usuario-form-grid">
                {[
                  ['nombre', 'Nombre institucional *'],
                  ['nombre_comercial', 'Nombre comercial'],
                  ['ruc', 'RUC *'],
                  ['telefono', 'Teléfono'],
                  ['celular', 'Celular'],
                  ['email', 'Email'],
                  ['sitio_web', 'Sitio web'],
                  ['provincia', 'Provincia'],
                  ['canton', 'Cantón'],
                  ['parroquia', 'Parroquia'],
                  ['eslogan', 'Eslogan del portal'],
                ].map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <input value={gad[key] || ''} onChange={(e) => setGad((f) => ({ ...f, [key]: e.target.value }))} />
                  </label>
                ))}
              </div>
              <label>
                Dirección
                <input value={gad.direccion || ''} onChange={(e) => setGad((f) => ({ ...f, direccion: e.target.value }))} />
              </label>
              {['descripcion', 'historia', 'mision', 'vision'].map((key) => (
                <label key={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  <textarea rows={3} value={gad[key] || ''} onChange={(e) => setGad((f) => ({ ...f, [key]: e.target.value }))} />
                </label>
              ))}
              <button type="submit" className="primary-button" disabled={saving}>Guardar cambios</button>
            </form>
          )}

          {tabActiva === 'identidad' && (
            <div className="config-form">
              {[
                ['logo_principal', 'Logo principal', identidad.logo_principal_url],
                ['logo_secundario', 'Logo secundario', identidad.logo_secundario_url],
                ['favicon', 'Favicon', identidad.favicon_url],
              ].map(([tipo, label, url]) => (
                <div key={tipo} className="config-imagen-item">
                  <h4>{label}</h4>
                  <div className="config-imagen-preview">
                    {url ? <img src={mediaUrl(url)} alt={label} /> : <span className="empty-state">Sin imagen</span>}
                  </div>
                  <input type="file" accept="image/*" onChange={(e) => handleImagen(tipo, e)} disabled={saving} />
                </div>
              ))}
            </div>
          )}

          {tabActiva === 'apariencia' && (
            <form className="catalog-form config-form" onSubmit={(e) => {
              e.preventDefault();
              guardar('apariencia', apariencia, 'Apariencia guardada.');
            }}
            >
              <div className="config-preview-live" style={{
                background: apariencia.modo_oscuro ? '#1a1a2e' : '#ffffff',
                color: apariencia.modo_oscuro ? '#f0f0f0' : apariencia.color_primario || '#1D9E75',
                borderRadius: `${apariencia.borde_radio ?? 10}px`,
                fontFamily: apariencia.fuente_principal || 'Inter, sans-serif',
                fontSize: `${apariencia.tamano_fuente_base ?? 16}px`,
                border: `3px solid ${apariencia.color_secundario || '#F9A825'}`,
              }}
              >
                <strong style={{ color: apariencia.color_primario }}>Vista previa en tiempo real</strong>
                <p style={{ color: apariencia.color_terciario || '#1D74F2' }}>
                  Los colores se actualizan al instante, sin guardar.
                </p>
                <button type="button" style={{
                  background: apariencia.color_primario || '#1D9E75',
                  color: '#fff',
                  border: 'none',
                  borderRadius: `${apariencia.borde_radio ?? 10}px`,
                  padding: '8px 16px',
                }}
                >
                  Botón de ejemplo
                </button>
              </div>

              <div className="usuario-form-grid">
                {[
                  ['color_primario', 'Color primario'],
                  ['color_secundario', 'Color secundario'],
                  ['color_terciario', 'Color terciario'],
                ].map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <input type="color" value={apariencia[key] || '#000000'} onChange={(e) => setApariencia((a) => ({ ...a, [key]: e.target.value }))} />
                  </label>
                ))}
                <label>
                  Fuente principal
                  <select value={apariencia.fuente_principal || FUENTES[0]} onChange={(e) => setApariencia((a) => ({ ...a, fuente_principal: e.target.value }))}>
                    {FUENTES.map((f) => <option key={f} value={f}>{f.split(',')[0]}</option>)}
                  </select>
                </label>
                <label>
                  Tamaño fuente base: {apariencia.tamano_fuente_base ?? 16}px
                  <input type="range" min="12" max="30" value={apariencia.tamano_fuente_base ?? 16} onChange={(e) => setApariencia((a) => ({ ...a, tamano_fuente_base: Number(e.target.value) }))} />
                </label>
                <label>
                  Radio de bordes: {apariencia.borde_radio ?? 10}px
                  <input type="range" min="0" max="50" value={apariencia.borde_radio ?? 10} onChange={(e) => setApariencia((a) => ({ ...a, borde_radio: Number(e.target.value) }))} />
                </label>
              </div>
              <label className="checkbox-label">
                <input type="checkbox" checked={Boolean(apariencia.modo_oscuro)} onChange={(e) => setApariencia((a) => ({ ...a, modo_oscuro: e.target.checked }))} />
                Modo oscuro
              </label>
              <button type="submit" className="primary-button" disabled={saving}>Guardar cambios</button>
            </form>
          )}

          {tabActiva === 'redes' && (
            <form className="catalog-form config-form" onSubmit={(e) => {
              e.preventDefault();
              guardar('redes', { redes }, 'Redes sociales guardadas.');
            }}
            >
              {redes.map((red, idx) => (
                <div key={red.id || `new-${idx}`} className="config-list-item">
                  <select value={red.nombre || ''} onChange={(e) => setRedes((r) => r.map((x, i) => (i === idx ? { ...x, nombre: e.target.value } : x)))}>
                    {REDES_OPCIONES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <input placeholder="URL" value={red.url || ''} onChange={(e) => setRedes((r) => r.map((x, i) => (i === idx ? { ...x, url: e.target.value } : x)))} />
                  <label className="checkbox-label">
                    <input type="checkbox" checked={red.activo !== false} onChange={(e) => setRedes((r) => r.map((x, i) => (i === idx ? { ...x, activo: e.target.checked } : x)))} />
                    Activo
                  </label>
                  <button type="button" onClick={() => setRedes((r) => r.filter((_, i) => i !== idx))}>🗑️</button>
                </div>
              ))}
              <button type="button" className="secondary-button" onClick={() => setRedes((r) => [...r, emptyRed()])}>+ Agregar red</button>
              <button type="submit" className="primary-button" disabled={saving}>Guardar cambios</button>
            </form>
          )}

          {tabActiva === 'header-footer' && (
            <form className="catalog-form config-form" onSubmit={(e) => {
              e.preventDefault();
              guardar('header-footer', { header, footer }, 'Header y footer guardados.');
            }}
            >
              <h4>Header</h4>
              {[
                ['mostrar_logo', 'Mostrar logo'],
                ['mostrar_menu', 'Mostrar menú'],
                ['mostrar_buscador', 'Mostrar buscador'],
                ['mostrar_redes', 'Mostrar redes'],
                ['sticky', 'Header fijo (sticky)'],
              ].map(([key, label]) => (
                <label key={key} className="checkbox-label">
                  <input type="checkbox" checked={header[key] !== false} onChange={(e) => setHeader((h) => ({ ...h, [key]: e.target.checked }))} />
                  {label}
                </label>
              ))}
              <label>
                Texto superior
                <input value={header.texto_superior || ''} onChange={(e) => setHeader((h) => ({ ...h, texto_superior: e.target.value }))} />
              </label>

              <h4>Footer</h4>
              <label>
                Descripción
                <textarea rows={3} value={footer.descripcion || ''} onChange={(e) => setFooter((f) => ({ ...f, descripcion: e.target.value }))} />
              </label>
              {[
                ['mostrar_redes', 'Mostrar redes'],
                ['mostrar_contacto', 'Mostrar contacto'],
                ['mostrar_mapa', 'Mostrar mapa'],
              ].map(([key, label]) => (
                <label key={key} className="checkbox-label">
                  <input type="checkbox" checked={footer[key] !== false} onChange={(e) => setFooter((f) => ({ ...f, [key]: e.target.checked }))} />
                  {label}
                </label>
              ))}
              <label>
                Copyright
                <input value={footer.copyright_texto || ''} onChange={(e) => setFooter((f) => ({ ...f, copyright_texto: e.target.value }))} />
              </label>
              <button type="submit" className="primary-button" disabled={saving}>Guardar cambios</button>
            </form>
          )}

          {tabActiva === 'menu' && (
            <MenuNavegacionTab
              menus={menus}
              setMenus={setMenus}
              saving={saving}
              onSubmit={() => guardar('menu', { items: menus }, 'Menú guardado.')}
            />
          )}

          {tabActiva === 'mapa' && (
            <form className="catalog-form config-form" onSubmit={(e) => {
              e.preventDefault();
              guardar('mapa', {
                latitud: mapa.latitud === '' ? null : Number(mapa.latitud),
                longitud: mapa.longitud === '' ? null : Number(mapa.longitud),
              }, 'Coordenadas del mapa guardadas.');
            }}
            >
              <div className="usuario-form-grid">
                <label>
                  Latitud base
                  <input type="number" step="any" value={mapa.latitud} onChange={(e) => setMapa((m) => ({ ...m, latitud: e.target.value }))} />
                </label>
                <label>
                  Longitud base
                  <input type="number" step="any" value={mapa.longitud} onChange={(e) => setMapa((m) => ({ ...m, longitud: e.target.value }))} />
                </label>
              </div>
              <p className="section-note">Estas coordenadas centran el mapa del portal público.</p>
              <button type="submit" className="primary-button" disabled={saving}>Guardar cambios</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default ConfiguracionPage;
