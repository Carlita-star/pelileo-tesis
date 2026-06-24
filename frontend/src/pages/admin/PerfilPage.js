import { useEffect, useRef, useState } from 'react';
import { apiRequest, getApiBase, getAuthHeaders } from '../../services/apiClient';
import { getStoredUser, updateStoredUser } from '../../services/authStorage';

function buildFotoUrl(fotoUrl) {
  if (!fotoUrl) return null;
  if (fotoUrl.startsWith('http')) return fotoUrl;
  return `${getApiBase()}${fotoUrl.startsWith('/') ? fotoUrl : `/${fotoUrl}`}`;
}

function formatFecha(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('es-EC', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

function PerfilPage() {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [savingPerfil, setSavingPerfil] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState('');
  const [perfilSuccess, setPerfilSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [perfil, setPerfil] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [form, setForm] = useState({ nombres: '', apellidos: '', telefono: '' });
  const [passwordForm, setPasswordForm] = useState({
    password_actual: '',
    password_nueva: '',
    password_confirmacion: '',
  });

  const loadPerfil = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest('/api/admin/perfil/');
      setPerfil(data);
      setForm({
        nombres: data.nombres || '',
        apellidos: data.apellidos || '',
        telefono: data.telefono || '',
      });
      setPreviewUrl(buildFotoUrl(data.foto_url));
      setPendingFile(null);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPerfil();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPerfilSuccess('');
  };

  const uploadFoto = async (file) => {
    const body = new FormData();
    body.append('foto', file);
    const response = await fetch(`${getApiBase()}/api/admin/perfil/foto/`, {
      method: 'POST',
      headers: getAuthHeaders(false),
      body,
    });
    const raw = await response.text();
    let data = {};
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      /* ignore */
    }
    if (!response.ok) {
      throw new Error(data.error || `Error ${response.status}`);
    }
    return data;
  };

  const handleSavePerfil = async (e) => {
    e.preventDefault();
    setSavingPerfil(true);
    setError('');
    setPerfilSuccess('');

    try {
      let updated = await apiRequest('/api/admin/perfil/actualizar/', {
        method: 'PUT',
        body: JSON.stringify(form),
      });

      if (pendingFile) {
        const fotoResult = await uploadFoto(pendingFile);
        updated = fotoResult.perfil || updated;
        setPendingFile(null);
      }

      setPerfil(updated);
      setPreviewUrl(buildFotoUrl(updated.foto_url));
      setPerfilSuccess('Datos del perfil actualizados correctamente.');

      const stored = getStoredUser();
      if (stored) {
        updateStoredUser({
          nombres: updated.nombres,
          apellidos: updated.apellidos,
          nombre_completo: updated.nombre_completo,
        });
      }
    } catch (err) {
      setError(err.message || 'No se pudieron guardar los cambios.');
    } finally {
      setSavingPerfil(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setError('');
    setPasswordSuccess('');

    try {
      const result = await apiRequest('/api/admin/perfil/password/', {
        method: 'PUT',
        body: JSON.stringify(passwordForm),
      });
      setPasswordSuccess(result.message || 'Contraseña actualizada correctamente.');
      setPasswordForm({
        password_actual: '',
        password_nueva: '',
        password_confirmacion: '',
      });
    } catch (err) {
      setError(err.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <section className="panel-card">
        <div className="table-spinner">
          <span className="loader" />
          Cargando perfil…
        </div>
      </section>
    );
  }

  if (!perfil) {
    return (
      <section className="panel-card">
        <p className="status-error">{error || 'No se encontró el perfil.'}</p>
      </section>
    );
  }

  const roles = perfil.roles || [];

  return (
    <>
      <section className="panel-card perfil-page">
        <div className="panel-header">
          <div>
            <h2>Mi perfil</h2>
            <p className="section-description">
              Consulte y actualice su información personal. El nombre de usuario, correo y roles
              solo pueden modificarse por un administrador.
            </p>
          </div>
        </div>

        {perfilSuccess && <div className="success-message">{perfilSuccess}</div>}
        {error && <p className="status-error">{error}</p>}

        <div className="perfil-layout">
          <div className="perfil-avatar-block">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Foto de perfil"
                className="user-avatar user-avatar-lg user-avatar-img perfil-avatar-img"
              />
            ) : (
              <span className="user-avatar user-avatar-lg perfil-avatar-iniciales">
                {perfil.iniciales || '?'}
              </span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="perfil-file-input"
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="secondary-button perfil-foto-button"
              onClick={() => fileInputRef.current?.click()}
            >
              Cambiar foto
            </button>
          </div>

          <div className="perfil-readonly">
            <dl className="perfil-datos-lista">
              <div>
                <dt>Nombre completo</dt>
                <dd>{perfil.nombre_completo || '—'}</dd>
              </div>
              <div>
                <dt>Username</dt>
                <dd>{perfil.username}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{perfil.email}</dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd>{perfil.telefono || '—'}</dd>
              </div>
              <div>
                <dt>Roles</dt>
                <dd>
                  <div className="role-badges">
                    {roles.length === 0 && <span>—</span>}
                    {roles.map((rol) => (
                      <span key={rol.nombre} className="role-badge">
                        {rol.label || rol.nombre}
                      </span>
                    ))}
                  </div>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <form className="catalog-form perfil-form" onSubmit={handleSavePerfil}>
          <h3 className="perfil-section-title">Editar datos personales</h3>
          <div className="usuario-form-grid">
            <label>
              Nombres *
              <input
                type="text"
                value={form.nombres}
                onChange={(e) => setForm((f) => ({ ...f, nombres: e.target.value }))}
                required
              />
            </label>
            <label>
              Apellidos *
              <input
                type="text"
                value={form.apellidos}
                onChange={(e) => setForm((f) => ({ ...f, apellidos: e.target.value }))}
                required
              />
            </label>
            <label>
              Teléfono
              <input
                type="tel"
                value={form.telefono}
                onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
              />
            </label>
          </div>
          {pendingFile && (
            <p className="section-note">Hay una nueva foto pendiente de guardar.</p>
          )}
          <button type="submit" className="primary-button" disabled={savingPerfil}>
            {savingPerfil ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>

        <div className="perfil-meta">
          <p>
            <strong>Último acceso:</strong>
            {' '}
            {formatFecha(perfil.ultimo_acceso)}
          </p>
          <p>
            <strong>Cuenta creada:</strong>
            {' '}
            {formatFecha(perfil.creado_en)}
          </p>
        </div>
      </section>

      <section className="panel-card perfil-password-card">
        <h3 className="perfil-section-title">Cambiar contraseña</h3>
        {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}

        <form className="catalog-form perfil-form" onSubmit={handleSavePassword}>
          <div className="usuario-form-grid">
            <label>
              Contraseña actual *
              <input
                type="password"
                value={passwordForm.password_actual}
                onChange={(e) => setPasswordForm((f) => ({ ...f, password_actual: e.target.value }))}
                autoComplete="current-password"
                required
              />
            </label>
            <label>
              Nueva contraseña *
              <input
                type="password"
                value={passwordForm.password_nueva}
                onChange={(e) => setPasswordForm((f) => ({ ...f, password_nueva: e.target.value }))}
                autoComplete="new-password"
                required
              />
            </label>
            <label>
              Confirmar nueva contraseña *
              <input
                type="password"
                value={passwordForm.password_confirmacion}
                onChange={(e) => setPasswordForm((f) => ({ ...f, password_confirmacion: e.target.value }))}
                autoComplete="new-password"
                required
              />
            </label>
          </div>
          <button type="submit" className="primary-button" disabled={savingPassword}>
            {savingPassword ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>
      </section>
    </>
  );
}

export default PerfilPage;
