import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiRequest, getApiBase, getAuthHeaders } from '../../services/apiClient';
import { ADMIN_PATHS } from '../../routes/adminPaths';
import '../../styles/AtractivoForm.css';
import { useErrorToast } from '../../hooks/useErrorToast';

const ROL_LABELS = {
  administrador: 'Administrador',
  gestor_turistico: 'Gestor turístico',
  visitante: 'Visitante',
};

const ROLES_PANEL = ['administrador', 'gestor_turistico'];

function formatRol(nombre) {
  return ROL_LABELS[nombre] || nombre;
}

function buildFotoUrl(fotoUrl) {
  if (!fotoUrl) return null;
  if (fotoUrl.startsWith('http')) return fotoUrl;
  return `${getApiBase()}${fotoUrl}`;
}

function UsuarioFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const usuarioId = id ? Number(id) : null;
  const isEdit = Boolean(usuarioId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [roles, setRoles] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    username: '',
    email: '',
    telefono: '',
    password: '',
    passwordConfirm: '',
    rol_ids: [],
    activo: true,
  });

  useEffect(() => {
    loadData();
  }, [usuarioId]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const catalog = await apiRequest('/api/admin/usuarios/form-data/');
      setRoles(catalog.roles || []);

      if (!usuarioId) {
        setLoading(false);
        return;
      }

      const data = await apiRequest(`/api/admin/usuarios/${usuarioId}/form-data/`);
      setForm({
        nombres: data.nombres || '',
        apellidos: data.apellidos || '',
        username: data.username || '',
        email: data.email || '',
        telefono: data.telefono || '',
        password: '',
        passwordConfirm: '',
        rol_ids: data.rol_ids || [],
        activo: data.activo !== false,
      });
      setPreviewUrl(buildFotoUrl(data.foto_url));
    } catch (err) {
      setError(err.message || 'No se pudo cargar el formulario.');
    } finally {
      setLoading(false);
    }
  };

  useErrorToast(error, { action: { label: 'Reintentar', onClick: loadData } });

  const toggleRol = (rolId) => {
    setForm((prev) => {
      const ids = prev.rol_ids.includes(rolId)
        ? prev.rol_ids.filter((r) => r !== rolId)
        : [...prev.rol_ids, rolId];
      return { ...prev, rol_ids: ids };
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const uploadFoto = async (targetId, file) => {
    const body = new FormData();
    body.append('foto', file);
    const response = await fetch(`${getApiBase()}/api/admin/usuarios/${targetId}/foto/`, {
      method: 'POST',
      headers: getAuthHeaders(false),
      body,
    });
    const raw = await response.text();
    let data = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch { /* ignore */ }
    if (!response.ok) {
      throw new Error(data.error || `Error ${response.status}`);
    }
    return data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.nombres.trim() || !form.apellidos.trim() || !form.username.trim() || !form.email.trim()) {
      setError('Complete los campos obligatorios.');
      return;
    }
    if (!isEdit) {
      if (!form.password) {
        setError('La contraseña es obligatoria al crear un usuario.');
        return;
      }
      if (form.password !== form.passwordConfirm) {
        setError('Las contraseñas no coinciden.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim(),
        rol_ids: form.rol_ids,
        activo: form.activo,
      };
      if (!isEdit) {
        payload.password = form.password;
      }

      const result = isEdit
        ? await apiRequest(`/api/admin/usuarios/${usuarioId}/edit/`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        : await apiRequest('/api/admin/usuarios/new/', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

      const savedId = result.id || usuarioId;
      if (pendingFile && savedId) {
        setUploading(true);
        await uploadFoto(savedId, pendingFile);
      }

      navigate(ADMIN_PATHS.usuarios, {
        state: { saved: true, nombre: result.nombre_completo || form.nombres },
      });
    } catch (err) {
      setError(err.message || 'Error al guardar el usuario.');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <section className="panel-card">
        <div className="table-spinner">
          <span className="loader" />
          Cargando formulario…
        </div>
      </section>
    );
  }

  return (
    <section className="panel-card">
      <div className="panel-header">
        <div>
          <h2>{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</h2>
          <p className="section-description">
            {isEdit
              ? 'Actualice los datos del usuario. Para cambiar la contraseña use el flujo de recuperación.'
              : 'Registre un usuario del portal. Se asignará automáticamente el rol visitante.'}
          </p>
        </div>
        <button type="button" className="secondary-button" onClick={() => navigate(ADMIN_PATHS.usuarios)}>
          Volver al listado
        </button>
      </div>

      <form className="catalog-form usuario-form" onSubmit={handleSubmit}>
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
            Username *
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              required
            />
          </label>
          <label>
            Email *
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
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
          <label>
            Foto de perfil
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>
        </div>

        {previewUrl && (
          <div className="usuario-foto-preview">
            <img src={previewUrl} alt="Vista previa" className="user-avatar user-avatar-lg" />
          </div>
        )}

        {!isEdit && (
          <div className="usuario-form-grid">
            <label>
              Contraseña *
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                autoComplete="new-password"
              />
            </label>
            <label>
              Confirmar contraseña *
              <input
                type="password"
                value={form.passwordConfirm}
                onChange={(e) => setForm((f) => ({ ...f, passwordConfirm: e.target.value }))}
                autoComplete="new-password"
              />
            </label>
          </div>
        )}

        {isEdit && (
          <p className="section-note">
            La contraseña solo se establece al crear. Para cambiarla, el usuario debe usar
            {' '}
            <strong>Recuperar contraseña</strong>
            {' '}
            en la pantalla de login.
          </p>
        )}

        <fieldset className="roles-fieldset">
          <legend>Roles asignados</legend>
          <p className="section-note">
            Todos los usuarios tienen el rol <strong>Visitante</strong> del portal turístico.
            Marque roles adicionales solo si debe acceder al panel administrativo.
          </p>
          <div className="roles-checkboxes">
            <label className="checkbox-label">
              <input type="checkbox" checked disabled readOnly />
              {formatRol('visitante')}
              <span className="section-note"> (automático)</span>
            </label>
            {roles
              .filter((rol) => ROLES_PANEL.includes(rol.nombre))
              .map((rol) => (
                <label key={rol.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={form.rol_ids.includes(rol.id)}
                    onChange={() => toggleRol(rol.id)}
                  />
                  {formatRol(rol.nombre)}
                </label>
              ))}
          </div>
        </fieldset>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={form.activo}
            onChange={(e) => setForm((f) => ({ ...f, activo: e.target.checked }))}
          />
          Usuario activo
        </label>

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={() => navigate(ADMIN_PATHS.usuarios)}>
            Cancelar
          </button>
          <button type="submit" className="primary-button" disabled={saving || uploading}>
            {saving || uploading ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default UsuarioFormPage;
