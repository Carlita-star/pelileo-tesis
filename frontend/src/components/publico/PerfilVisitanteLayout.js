import { Link } from 'react-router-dom';

function FieldInput({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:border-primario focus:outline-none focus:ring-2 focus:ring-primario/20';

function InfoItem({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <span aria-hidden="true">{icon}</span>
        {label}
      </p>
      <p className="mt-1 break-all text-sm font-medium text-slate-800">{value || '—'}</p>
    </div>
  );
}

function PerfilVisitanteLayout({
  perfil,
  previewUrl,
  form,
  setForm,
  passwordForm,
  setPasswordForm,
  pendingFile,
  savingPerfil,
  savingPassword,
  fileInputRef,
  onFileChange,
  onSavePerfil,
  onSavePassword,
  formatFecha,
  panelAccess = false,
  adminPath = '/admin',
}) {
  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-slate-50 to-white pb-16">
      {/* Encabezado */}
      <div className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-6">
          <div>
            <Link
              to="/"
              className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-primario hover:underline"
            >
              ← Volver al inicio
            </Link>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Mi cuenta
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Administra tu información personal y la seguridad de tu acceso al portal.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 pt-8">
        {/* Tarjeta identidad */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
          <div className="bg-gradient-to-r from-primario/10 via-primario/5 to-transparent px-6 py-8 sm:px-8">
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
              <div className="relative shrink-0">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt=""
                    className="h-28 w-28 rounded-full object-cover ring-4 ring-white shadow-md"
                  />
                ) : (
                  <span className="flex h-28 w-28 items-center justify-center rounded-full bg-primario text-3xl font-bold text-white ring-4 ring-white shadow-md">
                    {perfil.iniciales || '?'}
                  </span>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onFileChange}
                />
              </div>

              <div className="flex-1 text-center sm:text-left">
                {panelAccess && (
                  <Link
                    to={adminPath}
                    className="inline-block rounded-full border border-primario/30 px-3 py-1 text-xs font-semibold text-primario transition hover:bg-primario/10"
                  >
                    Ir al panel →
                  </Link>
                )}
                <h2 className={`text-xl font-bold text-slate-900 sm:text-2xl${panelAccess ? ' mt-2' : ''}`}>
                  {perfil.nombre_completo || perfil.username}
                </h2>
                <p className="mt-1 text-sm text-slate-500">@{perfil.username}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primario/40 hover:text-primario"
                >
                  Cambiar foto
                </button>
                {pendingFile && (
                  <p className="mt-2 text-xs text-amber-600">
                    Nueva foto pendiente — guarde los cambios abajo.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-3 border-t border-slate-100 p-6 sm:grid-cols-2 sm:p-8">
            <InfoItem label="Nombre completo" value={perfil.nombre_completo} icon="👤" />
            <InfoItem label="Correo electrónico" value={perfil.email} icon="✉️" />
            <InfoItem label="Usuario" value={perfil.username} icon="🔑" />
            <InfoItem label="Teléfono" value={perfil.telefono} icon="📱" />
          </div>

          <div className="flex flex-wrap gap-4 border-t border-slate-100 bg-slate-50/50 px-6 py-4 text-xs text-slate-500 sm:px-8">
            <span>
              <strong className="text-slate-600">Último acceso:</strong>
              {' '}
              {formatFecha(perfil.ultimo_acceso)}
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span>
              <strong className="text-slate-600">Cuenta creada:</strong>
              {' '}
              {formatFecha(perfil.creado_en)}
            </span>
          </div>
        </section>

        {/* Editar datos */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h3 className="text-lg font-bold text-slate-900">Editar datos personales</h3>
          <p className="mt-1 text-sm text-slate-500">
            Puede actualizar su nombre y teléfono. Usuario y correo solo los modifica un administrador.
          </p>

          <form className="mt-6 space-y-5" onSubmit={onSavePerfil}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldInput label="Nombres" required>
                <input
                  type="text"
                  className={inputClass}
                  value={form.nombres}
                  onChange={(e) => setForm((f) => ({ ...f, nombres: e.target.value }))}
                  required
                />
              </FieldInput>
              <FieldInput label="Apellidos" required>
                <input
                  type="text"
                  className={inputClass}
                  value={form.apellidos}
                  onChange={(e) => setForm((f) => ({ ...f, apellidos: e.target.value }))}
                  required
                />
              </FieldInput>
            </div>
            <FieldInput label="Teléfono">
              <input
                type="tel"
                className={inputClass}
                value={form.telefono}
                onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                placeholder="Opcional"
              />
            </FieldInput>
            <button
              type="submit"
              disabled={savingPerfil}
              className="w-full rounded-xl bg-primario px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primario-oscuro disabled:opacity-60 sm:w-auto"
            >
              {savingPerfil ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </form>
        </section>

        {/* Contraseña */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg" aria-hidden="true">
              🔒
            </span>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Cambiar contraseña</h3>
              <p className="mt-1 text-sm text-slate-500">
                Use una contraseña segura que no utilice en otros sitios.
              </p>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={onSavePassword}>
            <FieldInput label="Contraseña actual" required>
              <input
                type="password"
                className={inputClass}
                value={passwordForm.password_actual}
                onChange={(e) => setPasswordForm((f) => ({ ...f, password_actual: e.target.value }))}
                autoComplete="current-password"
                required
              />
            </FieldInput>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldInput label="Nueva contraseña" required>
                <input
                  type="password"
                  className={inputClass}
                  value={passwordForm.password_nueva}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, password_nueva: e.target.value }))}
                  autoComplete="new-password"
                  required
                />
              </FieldInput>
              <FieldInput label="Confirmar nueva contraseña" required>
                <input
                  type="password"
                  className={inputClass}
                  value={passwordForm.password_confirmacion}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, password_confirmacion: e.target.value }))}
                  autoComplete="new-password"
                  required
                />
              </FieldInput>
            </div>
            <button
              type="submit"
              disabled={savingPassword}
              className="mt-2 w-full rounded-xl bg-primario px-6 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-primario-oscuro hover:shadow-lg disabled:opacity-60 sm:w-auto sm:min-w-[220px]"
            >
              {savingPassword ? 'Actualizando…' : 'Actualizar contraseña'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

export default PerfilVisitanteLayout;
