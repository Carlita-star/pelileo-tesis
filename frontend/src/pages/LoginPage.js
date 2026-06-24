import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveSession, isAuthenticated, clearSession, hasPanelAccess } from '../services/authStorage';
import { ADMIN_PATHS } from '../routes/adminPaths';
import { useConfiguracion } from '../context/ConfiguracionContext';
import InstitutionalLogoMark from '../components/InstitutionalLogoMark';

function LoginPage({ initialView = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const config = useConfiguracion();
  const token = useMemo(() => new URLSearchParams(window.location.search).get('token'), []);
  const [view, setView] = useState(() => {
    if (token) return 'reset';
    if (initialView === 'recover') return 'recover';
    return 'login';
  });

  useEffect(() => {
    if (isAuthenticated() && hasPanelAccess()) {
      navigate(ADMIN_PATHS.dashboard, { replace: true });
    }
  }, [navigate]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.reason === 'no-role') {
      clearSession();
      setError('Tu cuenta no tiene permisos para el panel. Inicia sesión de nuevo.');
    }
  }, [location.state]);

  const API_BASE = process.env.REACT_APP_API_URL ?? 'http://localhost:8000';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(
          data.error
          || (response.status === 403
            ? 'Tu cuenta no tiene permisos para acceder al panel administrativo.'
            : 'Usuario o contraseña incorrectos.'),
        );
        return;
      }

      saveSession({ usuario: data.usuario, token: data.token });
      navigate(ADMIN_PATHS.dashboard, { replace: true });
    } catch (err) {
      setError('No se pudo conectar al servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/password-reset/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'No se pudo enviar el enlace.');
        return;
      }

      setSuccess(data.message || 'Enlace enviado. Revisa tu correo electrónico.');
    } catch (err) {
      setError('No se pudo conectar al servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (registerPassword !== registerConfirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          username: registerUsername.trim(),
          email: registerEmail.trim(),
          password: registerPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'No se pudo crear la cuenta.');
        return;
      }

      setSuccess(data.message || 'Registro exitoso. Ya puedes iniciar sesión.');
      setView('login');
      setNombres('');
      setApellidos('');
      setRegisterUsername('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
    } catch (err) {
      setError('No se pudo conectar al servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!token) {
      setError('Token de recuperación ausente.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/password-reset/confirm/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: resetPassword,
          confirm_password: resetConfirmPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'No se pudo restablecer la contraseña.');
        return;
      }

      setSuccess(data.message || 'Contraseña restablecida. Ahora puedes iniciar sesión.');
      setView('login');
      window.history.replaceState({}, '', window.location.pathname);
    } catch (err) {
      setError('No se pudo conectar al servidor.');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    setError('');
    setSuccess('');
    setView('login');
    navigate(ADMIN_PATHS.login, { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-top">
          <InstitutionalLogoMark
            imgClassName="login-logo login-logo-img"
            fallbackClassName="login-logo"
            fallbackText="GAD"
          />
          <div className="login-branding">
            <p className="login-brand-name">{config.nombreSistema || 'Pelileo'}</p>
            <p className="login-brand-subtitle">{config.eslogan || 'Panel administrativo turístico'}</p>
          </div>
        </div>

        {view === 'login' && (
          <>
            <h1>Iniciar sesión</h1>
            <p className="login-description">Ingresa tus credenciales para acceder al panel administrativo.</p>

            {error && <p className="login-error">{error}</p>}
            {success && <p className="login-success">{success}</p>}

            <form className="login-form" onSubmit={handleLogin}>
              <label className="login-field">
                <span className="login-field-label">Nombre de usuario</span>
                <div className="login-input-group">
                  <span className="login-field-icon">👤</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nombre de usuario"
                    required
                    disabled={loading}
                  />
                </div>
              </label>

              <label className="login-field">
                <span className="login-field-label">Contraseña</span>
                <div className="login-input-group">
                  <span className="login-field-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    required
                    disabled={loading}
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword((prev) => !prev)}>
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </label>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Ingresando...' : 'INGRESAR'}
              </button>
            </form>

            <div className="login-help">
              <button type="button" className="login-link" onClick={() => navigate(ADMIN_PATHS.recuperar)}>
                olvidé mi contraseña
              </button>
              <button type="button" className="login-link" onClick={() => setView('register')}>
                crear una cuenta
              </button>
            </div>
          </>
        )}

        {view === 'register' && (
          <>
            <h1>Crear cuenta</h1>
            <p className="login-description">Regístrate para acceder al panel administrativo.</p>

            {error && <p className="login-error">{error}</p>}
            {success && <p className="login-success">{success}</p>}

            <form className="login-form" onSubmit={handleRegister}>
              <label className="login-field">
                <span className="login-field-label">Nombres</span>
                <div className="login-input-group">
                  <span className="login-field-icon">👤</span>
                  <input
                    type="text"
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    placeholder="Nombres"
                    required
                    disabled={loading}
                  />
                </div>
              </label>
              <label className="login-field">
                <span className="login-field-label">Apellidos</span>
                <div className="login-input-group">
                  <span className="login-field-icon">👤</span>
                  <input
                    type="text"
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    placeholder="Apellidos"
                    required
                    disabled={loading}
                  />
                </div>
              </label>
              <label className="login-field">
                <span className="login-field-label">Nombre de usuario</span>
                <div className="login-input-group">
                  <span className="login-field-icon">👤</span>
                  <input
                    type="text"
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    placeholder="Nombre de usuario"
                    required
                    disabled={loading}
                  />
                </div>
              </label>
              <label className="login-field">
                <span className="login-field-label">Correo electrónico</span>
                <div className="login-input-group">
                  <span className="login-field-icon">✉️</span>
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="Correo electrónico"
                    required
                    disabled={loading}
                  />
                </div>
              </label>
              <label className="login-field">
                <span className="login-field-label">Contraseña</span>
                <div className="login-input-group">
                  <span className="login-field-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Contraseña"
                    required
                    disabled={loading}
                  />
                </div>
              </label>
              <label className="login-field">
                <span className="login-field-label">Confirmar contraseña</span>
                <div className="login-input-group">
                  <span className="login-field-icon">🔒</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerConfirmPassword}
                    onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                    placeholder="Confirmar contraseña"
                    required
                    disabled={loading}
                  />
                </div>
              </label>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Registrando...' : 'REGISTRARME'}
              </button>
            </form>

            <div className="login-help">
              <button type="button" className="login-link" onClick={goToLogin}>
                Ya tengo cuenta
              </button>
            </div>
          </>
        )}

        {view === 'recover' && (
          <>
            <h1>Recuperar contraseña</h1>
            <p className="login-description">Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>

            {error && <p className="login-error">{error}</p>}
            {success && <p className="login-success">{success}</p>}

            <form className="login-form" onSubmit={handleRequestReset}>
              <label className="login-field">
                <span className="login-field-label">Correo electrónico</span>
                <div className="login-input-group">
                  <span className="login-field-icon">✉️</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Correo electrónico"
                    required
                    disabled={loading}
                  />
                </div>
              </label>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Enviando enlace...' : 'Enviar enlace'}
              </button>
            </form>

            <div className="login-help">
              <button type="button" className="login-link" onClick={goToLogin}>
                Volver al login
              </button>
            </div>
          </>
        )}

        {view === 'reset' && (
          <>
            <h1>Nueva contraseña</h1>
            <p className="login-description">Ingresa y confirma tu nueva contraseña.</p>

            {error && <p className="login-error">{error}</p>}
            {success && <p className="login-success">{success}</p>}

            <form className="login-form" onSubmit={handleResetPassword}>
              <label className="login-field">
                <span className="login-field-label">Nueva contraseña</span>
                <div className="login-input-group">
                  <span className="login-field-icon">🔒</span>
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    placeholder="Nueva contraseña"
                    required
                    disabled={loading}
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowResetPassword((prev) => !prev)}>
                    {showResetPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
              </label>

              <label className="login-field">
                <span className="login-field-label">Confirmar contraseña</span>
                <div className="login-input-group">
                  <span className="login-field-icon">🔒</span>
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    placeholder="Confirmar contraseña"
                    required
                    disabled={loading}
                  />
                </div>
              </label>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
              </button>
            </form>

            <div className="login-help">
              <button type="button" className="login-link" onClick={goToLogin}>
                Volver al login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
