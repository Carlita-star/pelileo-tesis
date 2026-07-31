import { useCallback, useEffect, useState } from 'react';
import { apiRequest, getApiBase, getAuthHeaders } from '../services/apiClient';
import { applySiteFavicon } from '../services/configuracion.service';
import { useRefetchConfiguracion } from '../context/ConfiguracionContext';
import MenuNavegacionTab from '../components/configuracion/MenuNavegacionTab';
import LocationMapPicker from '../components/LocationMapPicker';
import { useToast } from '../context/ToastContext';
import { useErrorToast } from '../hooks/useErrorToast';
import {
  eliminarFotoGaleria,
  listarGaleriaAdmin,
  subirFotoGaleria,
} from '../services/galeria.service';

const TABS = [
  { key: 'gad', label: 'Datos del GAD' },
  { key: 'identidad', label: 'Identidad visual' },
  { key: 'sobre-pelileo', label: 'Sobre Pelileo' },
  { key: 'autoridades', label: 'Autoridades' },
  { key: 'guias', label: 'Guías turísticos' },
  { key: 'galeria', label: 'Galería' },
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

const SOBRE_DATOS_DEFAULT = [
  { etiqueta: 'Cantonización', valor: '22 de julio de 1860', detalle: 'Fundado en 1570 · reconstruido tras 1949' },
  { etiqueta: 'Sabores', valor: 'Cuy, fritada, hornado y empanadas', detalle: 'Tamales, caldo de gallina y chawarmishki' },
  { etiqueta: 'Vive el cantón', valor: 'Textiles, campo y naturaleza', detalle: 'Jeans, tejidos, agricultura y geositios UNESCO' },
];

const SOBRE_INTRO_DEFAULT =
  'En el corazón de Tungurahua, Pelileo te recibe con la fuerza del «Cantón Azul»: '
  + 'jeans, artesanía, paisajes andinos y la viva cultura del pueblo Salasaka. '
  + 'Un destino listo para recorrer, saborear y fotografiar.';

const AUTORIDADES_INTRO_DEFAULT =
  'Conoce a las autoridades del GAD Municipal de Pelileo que impulsan el desarrollo y el turismo del cantón.';

const GUIAS_INTRO_DEFAULT =
  'Guías de turismo locales listos para acompañarte en recorridos culturales, de naturaleza y de aventura por el cantón San Pedro de Pelileo.';

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

function emptyAutoridad() {
  return {
    id: null,
    nombre: '',
    cargo: '',
    bio: '',
    foto: null,
    foto_url: null,
    orden: 0,
    activo: true,
  };
}

function emptyGuia() {
  return {
    id: null,
    nombre: '',
    especialidad: '',
    telefono: '',
    email: '',
    bio: '',
    foto: null,
    foto_url: null,
    orden: 0,
    activo: true,
  };
}

function emptySobreDato() {
  return { etiqueta: '', valor: '', detalle: '' };
}

function ConfiguracionPage() {
  const toast = useToast();
  const refetchConfiguracion = useRefetchConfiguracion();
  const [tabActiva, setTabActiva] = useState('gad');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [gad, setGad] = useState({});
  const [empresaId, setEmpresaId] = useState(null);
  const [identidad, setIdentidad] = useState({});
  const [fotosGaleria, setFotosGaleria] = useState([]);
  const [galeriaLoading, setGaleriaLoading] = useState(false);
  const [apariencia, setApariencia] = useState({});
  const [redes, setRedes] = useState([]);
  const [autoridades, setAutoridades] = useState([]);
  const [autoridadesIntro, setAutoridadesIntro] = useState(AUTORIDADES_INTRO_DEFAULT);
  const [guias, setGuias] = useState([]);
  const [guiasIntro, setGuiasIntro] = useState(GUIAS_INTRO_DEFAULT);
  const [sobreIntro, setSobreIntro] = useState(SOBRE_INTRO_DEFAULT);
  const [sobreDatos, setSobreDatos] = useState(SOBRE_DATOS_DEFAULT);
  const [header, setHeader] = useState({});
  const [footer, setFooter] = useState({});
  const [menus, setMenus] = useState([]);
  const [mapa, setMapa] = useState({ latitud: '', longitud: '' });

  const aplicarDatos = useCallback((data) => {
    const emp = data.empresa || {};
    setEmpresaId(emp.id || null);
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
    setSobreIntro(emp.sobre_pelileo_intro || SOBRE_INTRO_DEFAULT);
    setSobreDatos(
      Array.isArray(emp.sobre_pelileo_datos) && emp.sobre_pelileo_datos.length
        ? emp.sobre_pelileo_datos
        : SOBRE_DATOS_DEFAULT
    );
    setAutoridades(
      (data.autoridades || []).map((a) => ({
        id: a.id,
        nombre: a.nombre || '',
        cargo: a.cargo || '',
        bio: a.bio || '',
        foto: a.foto || null,
        foto_url: a.foto_url || null,
        orden: a.orden ?? 0,
        activo: a.activo !== false,
      }))
    );
    setAutoridadesIntro(emp.autoridades_intro || AUTORIDADES_INTRO_DEFAULT);
    setGuias(
      (data.guias || []).map((g) => ({
        id: g.id,
        nombre: g.nombre || '',
        especialidad: g.especialidad || '',
        telefono: g.telefono || '',
        email: g.email || '',
        bio: g.bio || '',
        foto: g.foto || null,
        foto_url: g.foto_url || null,
        orden: g.orden ?? 0,
        activo: g.activo !== false,
      }))
    );
    setGuiasIntro(emp.guias_intro || GUIAS_INTRO_DEFAULT);
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

  useEffect(() => {
    if (tabActiva !== 'galeria' || !empresaId) return undefined;
    let activo = true;
    setGaleriaLoading(true);
    listarGaleriaAdmin(empresaId)
      .then((items) => {
        if (activo) setFotosGaleria(items);
      })
      .catch((err) => {
        if (activo) toast.error(err.message || 'No se pudo cargar la galería.');
      })
      .finally(() => {
        if (activo) setGaleriaLoading(false);
      });
    return () => { activo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabActiva, empresaId]);

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

  const subirImagen = async (tipo, file, extra = {}) => {
    const body = new FormData();
    body.append('tipo', tipo);
    body.append('archivo', file);
    if (extra.autoridad_id) {
      body.append('autoridad_id', String(extra.autoridad_id));
    }
    if (extra.guia_id) {
      body.append('guia_id', String(extra.guia_id));
    }
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
      e.target.value = '';
    }
  };

  const handleFotoAutoridad = async (idx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    setError('');
    try {
      const actual = autoridades[idx];
      const result = await subirImagen('autoridad_foto', file, {
        autoridad_id: actual?.id || undefined,
      });
      setAutoridades((list) => list.map((a, i) => (
        i === idx
          ? { ...a, foto: result.path, foto_url: result.url }
          : a
      )));
      toast.success('Foto de autoridad cargada. Recuerde guardar los cambios.');
    } catch (err) {
      toast.error(err.message || 'Error al subir la foto.');
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const handleFotoGuia = async (idx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    setError('');
    try {
      const actual = guias[idx];
      const result = await subirImagen('guia_foto', file, {
        guia_id: actual?.id || undefined,
      });
      setGuias((list) => list.map((g, i) => (
        i === idx
          ? { ...g, foto: result.path, foto_url: result.url }
          : g
      )));
      toast.success('Foto del guía cargada. Recuerde guardar los cambios.');
    } catch (err) {
      toast.error(err.message || 'Error al subir la foto.');
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const handleSubirGaleria = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !empresaId) return;
    setSaving(true);
    try {
      for (const file of files) {
        const item = await subirFotoGaleria(empresaId, file);
        setFotosGaleria((prev) => [...prev, item]);
      }
      await refetchConfiguracion();
      toast.success(files.length > 1 ? 'Fotografías cargadas.' : 'Fotografía cargada.');
    } catch (err) {
      toast.error(err.message || 'Error al subir la fotografía.');
    } finally {
      setSaving(false);
      e.target.value = '';
    }
  };

  const handleEliminarGaleria = async (id) => {
    if (!id) return;
    if (!window.confirm('¿Eliminar esta fotografía de la galería?')) return;
    setSaving(true);
    try {
      await eliminarFotoGaleria(id);
      setFotosGaleria((prev) => prev.filter((f) => f.id !== id));
      await refetchConfiguracion();
      toast.success('Fotografía eliminada.');
    } catch (err) {
      toast.error(err.message || 'No se pudo eliminar.');
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

          {tabActiva === 'sobre-pelileo' && (
            <form
              className="catalog-form config-form"
              onSubmit={(e) => {
                e.preventDefault();
                guardar(
                  'sobre-pelileo',
                  { intro: sobreIntro, datos: sobreDatos },
                  'Sección Sobre Pelileo guardada.'
                );
              }}
            >
              <p className="section-note">
                Estos textos se muestran en el inicio (bloque «Conoce el cantón»).
                La imagen se cambia en la pestaña <strong>Identidad visual</strong>.
              </p>
              <label>
                Texto introductorio
                <textarea
                  rows={4}
                  value={sobreIntro}
                  onChange={(e) => setSobreIntro(e.target.value)}
                />
              </label>
              <h4>Bloques informativos</h4>
              {sobreDatos.map((dato, idx) => (
                <div key={`sobre-${idx}`} className="config-list-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
                  <label>
                    Etiqueta
                    <input
                      value={dato.etiqueta || ''}
                      placeholder="Ej. Cantonización"
                      onChange={(e) => setSobreDatos((list) => list.map((d, i) => (i === idx ? { ...d, etiqueta: e.target.value } : d)))}
                    />
                  </label>
                  <label>
                    Valor
                    <input
                      value={dato.valor || ''}
                      placeholder="Ej. 22 de julio de 1860"
                      onChange={(e) => setSobreDatos((list) => list.map((d, i) => (i === idx ? { ...d, valor: e.target.value } : d)))}
                    />
                  </label>
                  <label>
                    Detalle
                    <input
                      value={dato.detalle || ''}
                      placeholder="Texto secundario"
                      onChange={(e) => setSobreDatos((list) => list.map((d, i) => (i === idx ? { ...d, detalle: e.target.value } : d)))}
                    />
                  </label>
                  <button type="button" onClick={() => setSobreDatos((list) => list.filter((_, i) => i !== idx))}>
                    Eliminar bloque
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="secondary-button"
                onClick={() => setSobreDatos((list) => [...list, emptySobreDato()])}
              >
                + Agregar bloque
              </button>
              <button type="submit" className="primary-button" disabled={saving}>Guardar cambios</button>
            </form>
          )}

          {tabActiva === 'autoridades' && (
            <form
              className="catalog-form config-form"
              onSubmit={(e) => {
                e.preventDefault();
                guardar(
                  'autoridades',
                  {
                    intro: autoridadesIntro,
                    autoridades: autoridades.map((a, idx) => ({
                      id: a.id,
                      nombre: a.nombre,
                      cargo: a.cargo,
                      bio: a.bio,
                      foto: a.foto,
                      orden: idx,
                      activo: a.activo !== false,
                    })),
                  },
                  'Autoridades guardadas.'
                );
              }}
            >
              <p className="section-note">
                Se muestran en el inicio en lugar de Historia / Misión / Visión.
                Suba la foto de cada autoridad y luego pulse <strong>Guardar cambios</strong>.
              </p>
              <label>
                Texto introductorio
                <textarea
                  rows={3}
                  value={autoridadesIntro}
                  onChange={(e) => setAutoridadesIntro(e.target.value)}
                />
              </label>

              {autoridades.map((aut, idx) => (
                <div
                  key={aut.id || `aut-new-${idx}`}
                  className="config-list-item"
                  style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.65rem' }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="config-imagen-preview" style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden' }}>
                      {aut.foto_url || aut.foto ? (
                        <img
                          src={mediaUrl(aut.foto_url || aut.foto)}
                          alt={aut.nombre || 'Autoridad'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span className="empty-state">Sin foto</span>
                      )}
                    </div>
                    <label style={{ flex: 1 }}>
                      Foto
                      <input
                        type="file"
                        accept="image/*"
                        disabled={saving}
                        onChange={(e) => handleFotoAutoridad(idx, e)}
                      />
                    </label>
                  </div>
                  <label>
                    Nombre *
                    <input
                      value={aut.nombre || ''}
                      onChange={(e) => setAutoridades((list) => list.map((a, i) => (i === idx ? { ...a, nombre: e.target.value } : a)))}
                    />
                  </label>
                  <label>
                    Cargo
                    <input
                      value={aut.cargo || ''}
                      placeholder="Alcalde, Concejal…"
                      onChange={(e) => setAutoridades((list) => list.map((a, i) => (i === idx ? { ...a, cargo: e.target.value } : a)))}
                    />
                  </label>
                  <label>
                    Biografía / descripción
                    <textarea
                      rows={3}
                      value={aut.bio || ''}
                      onChange={(e) => setAutoridades((list) => list.map((a, i) => (i === idx ? { ...a, bio: e.target.value } : a)))}
                    />
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={aut.activo !== false}
                      onChange={(e) => setAutoridades((list) => list.map((a, i) => (i === idx ? { ...a, activo: e.target.checked } : a)))}
                    />
                    Visible en el portal
                  </label>
                  <button type="button" onClick={() => setAutoridades((list) => list.filter((_, i) => i !== idx))}>
                    Eliminar autoridad
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="secondary-button"
                onClick={() => setAutoridades((list) => [...list, emptyAutoridad()])}
              >
                + Agregar autoridad
              </button>
              <button type="submit" className="primary-button" disabled={saving}>Guardar cambios</button>
            </form>
          )}

          {tabActiva === 'guias' && (
            <form
              className="catalog-form config-form"
              onSubmit={(e) => {
                e.preventDefault();
                guardar(
                  'guias',
                  {
                    intro: guiasIntro,
                    guias: guias.map((g, idx) => ({
                      id: g.id,
                      nombre: g.nombre,
                      especialidad: g.especialidad,
                      telefono: g.telefono,
                      email: g.email,
                      bio: g.bio,
                      foto: g.foto,
                      orden: idx,
                      activo: g.activo !== false,
                    })),
                  },
                  'Guías turísticos guardados.'
                );
              }}
            >
              <p className="section-note">
                Se muestran en el inicio, justo encima de la galería fotográfica (según el inventario oficial).
                Suba la foto de cada guía y luego pulse <strong>Guardar cambios</strong>.
              </p>
              <label>
                Texto introductorio
                <textarea
                  rows={3}
                  value={guiasIntro}
                  onChange={(e) => setGuiasIntro(e.target.value)}
                />
              </label>

              {guias.map((guia, idx) => (
                <div
                  key={guia.id || `guia-new-${idx}`}
                  className="config-list-item"
                  style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.65rem' }}
                >
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div className="config-imagen-preview" style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden' }}>
                      {guia.foto_url || guia.foto ? (
                        <img
                          src={mediaUrl(guia.foto_url || guia.foto)}
                          alt={guia.nombre || 'Guía'}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span className="empty-state">Sin foto</span>
                      )}
                    </div>
                    <label style={{ flex: 1 }}>
                      Foto
                      <input
                        type="file"
                        accept="image/*"
                        disabled={saving}
                        onChange={(e) => handleFotoGuia(idx, e)}
                      />
                    </label>
                  </div>
                  <label>
                    Nombre *
                    <input
                      value={guia.nombre || ''}
                      onChange={(e) => setGuias((list) => list.map((g, i) => (i === idx ? { ...g, nombre: e.target.value } : g)))}
                    />
                  </label>
                  <label>
                    Especialidad
                    <input
                      value={guia.especialidad || ''}
                      placeholder="Guía Nacional de Turismo…"
                      onChange={(e) => setGuias((list) => list.map((g, i) => (i === idx ? { ...g, especialidad: e.target.value } : g)))}
                    />
                  </label>
                  <label>
                    Celular
                    <input
                      value={guia.telefono || ''}
                      placeholder="099..."
                      onChange={(e) => setGuias((list) => list.map((g, i) => (i === idx ? { ...g, telefono: e.target.value } : g)))}
                    />
                  </label>
                  <label>
                    Correo
                    <input
                      type="email"
                      value={guia.email || ''}
                      placeholder="correo@ejemplo.com"
                      onChange={(e) => setGuias((list) => list.map((g, i) => (i === idx ? { ...g, email: e.target.value } : g)))}
                    />
                  </label>
                  <label>
                    Biografía / descripción (opcional)
                    <textarea
                      rows={2}
                      value={guia.bio || ''}
                      onChange={(e) => setGuias((list) => list.map((g, i) => (i === idx ? { ...g, bio: e.target.value } : g)))}
                    />
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={guia.activo !== false}
                      onChange={(e) => setGuias((list) => list.map((g, i) => (i === idx ? { ...g, activo: e.target.checked } : g)))}
                    />
                    Visible en el portal
                  </label>
                  <button type="button" onClick={() => setGuias((list) => list.filter((_, i) => i !== idx))}>
                    Eliminar guía
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="secondary-button"
                onClick={() => setGuias((list) => [...list, emptyGuia()])}
              >
                + Agregar guía
              </button>
              <button type="submit" className="primary-button" disabled={saving}>Guardar cambios</button>
            </form>
          )}

          {tabActiva === 'galeria' && (
            <div className="config-form">
              <p className="section-note">
                Cargue aquí las fotografías oficiales del cantón (por ejemplo las de la carpeta institucional).
                Estas se muestran primero en <strong>/galeria</strong> y en el inicio; las fotos de atractivos
                y emprendimientos publicados se agregan después.
              </p>
              <label className="primary-button" style={{ display: 'inline-flex', cursor: saving ? 'wait' : 'pointer' }}>
                {saving ? 'Subiendo…' : '+ Cargar fotografías'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={saving || !empresaId}
                  onChange={handleSubirGaleria}
                  style={{ display: 'none' }}
                />
              </label>
              {!empresaId ? (
                <p className="section-note">Guarde primero los datos del GAD para habilitar la galería.</p>
              ) : null}

              {galeriaLoading ? (
                <div className="table-spinner" style={{ marginTop: '1rem' }}>
                  <span className="loader" />
                  Cargando galería…
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '0.75rem',
                    marginTop: '1.25rem',
                  }}
                >
                  {fotosGaleria.map((foto) => (
                    <div
                      key={foto.id}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.75rem',
                        overflow: 'hidden',
                        background: '#fff',
                      }}
                    >
                      <div style={{ aspectRatio: '1', background: '#f1f5f9' }}>
                        {foto.url ? (
                          <img
                            src={mediaUrl(foto.url)}
                            alt={foto.titulo || 'Galería'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="secondary-button"
                        style={{ width: '100%', borderRadius: 0, border: 0, borderTop: '1px solid #e2e8f0' }}
                        disabled={saving}
                        onClick={() => handleEliminarGaleria(foto.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!galeriaLoading && fotosGaleria.length === 0 ? (
                <p className="section-note" style={{ marginTop: '1rem' }}>
                  Todavía no hay fotos del cantón. Suba JPG, PNG o WEBP.
                </p>
              ) : null}
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
