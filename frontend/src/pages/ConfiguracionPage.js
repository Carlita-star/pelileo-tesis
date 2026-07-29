import { useCallback, useEffect, useState } from 'react';
import { apiRequest, getApiBase, getAuthHeaders } from '../services/apiClient';
import { applySiteFavicon } from '../services/configuracion.service';
import { useRefetchConfiguracion } from '../context/ConfiguracionContext';
import MenuNavegacionTab from '../components/configuracion/MenuNavegacionTab';
import LocationMapPicker from '../components/LocationMapPicker';
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

const COLORES_APARIENCIA_DEFAULT = {
  color_primario: '#1D9E75',
  color_secundario: '#F9A825',
  color_terciario: '#2563EB',
};

function colorApariencia(apariencia, key) {
  return apariencia[key] || COLORES_APARIENCIA_DEFAULT[key];
}

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
  const refetchConfiguracion = useRefetchConfiguracion();
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
      imagen_seccion_inicio_url: emp.imagen_seccion_inicio_url,
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
      await refetchConfiguracion();
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
      await refetchConfiguracion();
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
                ['imagen_seccion_inicio', 'Imagen sección «Sobre Pelileo» (inicio)', identidad.imagen_seccion_inicio_url],
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
            <form
              className="catalog-form config-form apariencia-config-form"
              onSubmit={(e) => {
                e.preventDefault();
                guardar('apariencia', {
                  ...apariencia,
                  modo_oscuro: false,
                  header: {
                    color_fondo: header.color_fondo || '#0f172a',
                    color_texto: header.color_texto || '#ffffff',
                  },
                  footer: {
                    color_fondo: footer.color_fondo || '#0f172a',
                    color_texto: footer.color_texto || '#e2e8f0',
                  },
                }, 'Apariencia guardada.');
              }}
            >
              <div className="apariencia-config">
                <div className="apariencia-config__preview-col">
                  <p className="apariencia-config__eyebrow">Vista previa</p>
                  <div
                    className="apariencia-preview"
                    style={{
                      fontFamily: apariencia.fuente_principal || FUENTES[0],
                      fontSize: `${apariencia.tamano_fuente_base ?? 16}px`,
                      borderRadius: `${apariencia.borde_radio ?? 10}px`,
                    }}
                  >
                    <div
                      className="apariencia-preview__bar"
                      style={{
                        background: header.color_fondo || '#0f172a',
                        color: header.color_texto || '#ffffff',
                      }}
                    >
                      <span className="apariencia-preview__brand">Turismo Pelileo</span>
                      <span className="apariencia-preview__nav-dot" />
                      <span className="apariencia-preview__nav-dot" />
                    </div>
                    <div className="apariencia-preview__body">
                      <h3 style={{ color: colorApariencia(apariencia, 'color_primario') }}>
                        Título del portal
                      </h3>
                      <p style={{ color: colorApariencia(apariencia, 'color_terciario') }}>
                        Los colores, fuente y bordes se actualizan al instante, sin guardar.
                      </p>
                      <div className="apariencia-preview__actions">
                        <button
                          type="button"
                          className="apariencia-preview__btn-primary"
                          style={{
                            background: colorApariencia(apariencia, 'color_primario'),
                            borderRadius: `${apariencia.borde_radio ?? 10}px`,
                          }}
                        >
                          Botón principal
                        </button>
                        <button
                          type="button"
                          className="apariencia-preview__btn-secondary"
                          style={{
                            color: colorApariencia(apariencia, 'color_secundario'),
                            borderColor: colorApariencia(apariencia, 'color_secundario'),
                            borderRadius: `${apariencia.borde_radio ?? 10}px`,
                          }}
                        >
                          Secundario
                        </button>
                      </div>
                      <div
                        className="apariencia-preview__card"
                        style={{
                          borderRadius: `${apariencia.borde_radio ?? 10}px`,
                          borderColor: `${colorApariencia(apariencia, 'color_secundario')}33`,
                        }}
                      >
                        <span style={{ color: colorApariencia(apariencia, 'color_secundario') }}>
                          Tarjeta de contenido
                        </span>
                      </div>
                      <div
                        className="apariencia-preview__footer-bar"
                        style={{
                          background: footer.color_fondo || '#0f172a',
                          color: footer.color_texto || '#e2e8f0',
                        }}
                      >
                        Pie de página
                      </div>
                    </div>
                  </div>
                </div>

                <div className="apariencia-config__controls">
                  <p className="apariencia-config__eyebrow">Personalización</p>
                  <div className="apariencia-colores">
                    {[
                      ['color_primario', 'Color primario', 'Botones principales, enlaces activos e iconos del portal'],
                      ['color_secundario', 'Color secundario', 'Acentos (enlaces del footer, detalles y bordes suaves)'],
                      ['color_terciario', 'Color terciario', 'Etiquetas de sección y textos destacados'],
                    ].map(([key, label, hint]) => {
                      const valor = colorApariencia(apariencia, key);
                      return (
                        <label key={key} className="apariencia-color-field">
                          <span className="apariencia-color-field__label">{label}</span>
                          <span className="apariencia-color-field__hint">{hint}</span>
                          <div className="apariencia-color-field__row">
                            <input
                              type="color"
                              value={valor}
                              onChange={(e) => setApariencia((a) => ({ ...a, [key]: e.target.value }))}
                              aria-label={label}
                            />
                            <code className="apariencia-color-hex">{valor.toUpperCase()}</code>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  <p className="apariencia-config__eyebrow apariencia-config__eyebrow--spaced">Header y footer</p>
                  <div className="apariencia-colores">
                    {[
                      {
                        key: 'header_fondo',
                        label: 'Fondo del header',
                        hint: 'Barra superior de navegación (logo, menú y botón Mapa)',
                        valor: header.color_fondo || '#0f172a',
                        onChange: (v) => setHeader((h) => ({ ...h, color_fondo: v })),
                      },
                      {
                        key: 'header_texto',
                        label: 'Texto del header',
                        hint: 'Color del nombre, eslogan y enlaces del menú superior',
                        valor: header.color_texto || '#ffffff',
                        onChange: (v) => setHeader((h) => ({ ...h, color_texto: v })),
                      },
                      {
                        key: 'footer_fondo',
                        label: 'Fondo del footer',
                        hint: 'Pie de página completo (contacto, redes y copyright)',
                        valor: footer.color_fondo || '#0f172a',
                        onChange: (v) => setFooter((f) => ({ ...f, color_fondo: v })),
                      },
                      {
                        key: 'footer_texto',
                        label: 'Texto del footer',
                        hint: 'Títulos, enlaces y textos del pie de página',
                        valor: footer.color_texto || '#e2e8f0',
                        onChange: (v) => setFooter((f) => ({ ...f, color_texto: v })),
                      },
                    ].map((campo) => (
                      <label key={campo.key} className="apariencia-color-field">
                        <span className="apariencia-color-field__label">{campo.label}</span>
                        <span className="apariencia-color-field__hint">{campo.hint}</span>
                        <div className="apariencia-color-field__row">
                          <input
                            type="color"
                            value={campo.valor}
                            onChange={(e) => campo.onChange(e.target.value)}
                            aria-label={campo.label}
                          />
                          <code className="apariencia-color-hex">{campo.valor.toUpperCase()}</code>
                        </div>
                      </label>
                    ))}
                  </div>

                  <label className="apariencia-control">
                    <span className="apariencia-control__label">Fuente principal</span>
                    <select
                      value={apariencia.fuente_principal || FUENTES[0]}
                      onChange={(e) => setApariencia((a) => ({ ...a, fuente_principal: e.target.value }))}
                    >
                      {FUENTES.map((f) => <option key={f} value={f}>{f.split(',')[0]}</option>)}
                    </select>
                  </label>

                  <label className="apariencia-control">
                    <span className="apariencia-control__label">
                      Tamaño fuente base
                      <strong>{apariencia.tamano_fuente_base ?? 16}px</strong>
                    </span>
                    <input
                      type="range"
                      min="12"
                      max="30"
                      value={apariencia.tamano_fuente_base ?? 16}
                      onChange={(e) => setApariencia((a) => ({ ...a, tamano_fuente_base: Number(e.target.value) }))}
                      className="apariencia-range"
                    />
                  </label>

                  <label className="apariencia-control">
                    <span className="apariencia-control__label">
                      Radio de bordes
                      <strong>{apariencia.borde_radio ?? 10}px</strong>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={apariencia.borde_radio ?? 10}
                      onChange={(e) => setApariencia((a) => ({ ...a, borde_radio: Number(e.target.value) }))}
                      className="apariencia-range"
                    />
                  </label>
                </div>
              </div>

              <div className="config-form__footer">
                <button type="submit" className="primary-button" disabled={saving}>Guardar cambios</button>
              </div>
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
                <input
                  value={header.texto_superior || ''}
                  placeholder="Turismo · GAD Municipal"
                  onChange={(e) => setHeader((h) => ({ ...h, texto_superior: e.target.value }))}
                />
              </label>
              <p className="section-note">
                Los colores del header y del footer se configuran en la pestaña <strong>Apariencia</strong>.
              </p>

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
                <input
                  value={footer.copyright_texto || ''}
                  placeholder={`© ${new Date().getFullYear()} GAD Municipal de Pelileo. Todos los derechos reservados.`}
                  onChange={(e) => setFooter((f) => ({ ...f, copyright_texto: e.target.value }))}
                />
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
            <form
              className="catalog-form config-form config-mapa-form"
              onSubmit={(e) => {
                e.preventDefault();
                guardar('mapa', {
                  latitud: mapa.latitud === '' ? null : Number(mapa.latitud),
                  longitud: mapa.longitud === '' ? null : Number(mapa.longitud),
                }, 'Coordenadas del mapa guardadas.');
              }}
            >
              <p className="config-mapa-form__intro">
                Defina el centro del mapa turístico del portal. Use la vista previa para verificar la ubicación
                o haga clic en el mapa para ajustar las coordenadas.
              </p>

              <div className="config-mapa-layout">
                <div className="config-mapa-layout__fields">
                  <label>
                    Latitud base
                    <input
                      type="number"
                      step="any"
                      value={mapa.latitud}
                      onChange={(e) => setMapa((m) => ({ ...m, latitud: e.target.value }))}
                      placeholder="-1.3306"
                    />
                  </label>
                  <label>
                    Longitud base
                    <input
                      type="number"
                      step="any"
                      value={mapa.longitud}
                      onChange={(e) => setMapa((m) => ({ ...m, longitud: e.target.value }))}
                      placeholder="-78.5414"
                    />
                  </label>
                  <p className="section-note">
                    Estas coordenadas centran el mapa en <strong>/mapa</strong> y otras vistas del portal público.
                  </p>
                </div>

                <div className="config-mapa-layout__map">
                  <p className="apariencia-config__eyebrow">Vista previa del centro</p>
                  <LocationMapPicker
                    latitud={mapa.latitud}
                    longitud={mapa.longitud}
                    height={360}
                    onChange={({ latitud, longitud }) => setMapa({ latitud, longitud })}
                  />
                </div>
              </div>

              <div className="config-form__footer">
                <button type="submit" className="primary-button" disabled={saving}>Guardar cambios</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default ConfiguracionPage;
