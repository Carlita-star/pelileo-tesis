import { useState } from 'react';

function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' o 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_URL ?? 'http://localhost:8000';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email, // El backend espera username, pero lo enviamos como email para flexibilidad
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión.');
        return;
      }

      // Guardar datos del usuario en localStorage
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      localStorage.setItem('autenticado', 'true');

      onLogin(data.usuario);
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

    // Validaciones
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombres,
          apellidos,
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al registrarse.');
        return;
      }

      setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
      setNombres('');
      setApellidos('');
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      // Cambiar a modo login después de un tiempo
      setTimeout(() => {
        setMode('login');
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError('No se pudo conectar al servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-mark">PT</div>
          <div>
            <p className="login-title">Pelileo Turismo</p>
            <p className="login-subtitle">Panel administrativo</p>
          </div>
        </div>

        {/* Tabs de Login / Registro */}
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setMode('login');
              setError('');
              setSuccess('');
            }}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className={`login-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => {
              setMode('register');
              setError('');
              setSuccess('');
            }}
          >
            Registrarse
          </button>
        </div>

        {/* Formulario de Login */}
        {mode === 'login' && (
          <>
            <h1>Iniciar sesión</h1>
            <p className="login-description">Ingresa tus credenciales para acceder al tablero.</p>

            {error && <p className="login-error">{error}</p>}
            {success && <p className="login-success">{success}</p>}

            <form className="login-form" onSubmit={handleLogin}>
              <label>
                Usuario o Correo electrónico
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@correo.com"
                  required
                  disabled={loading}
                />
              </label>

              <label>
                Contraseña
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                  disabled={loading}
                />
              </label>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>
          </>
        )}

        {/* Formulario de Registro */}
        {mode === 'register' && (
          <>
            <h1>Crear cuenta</h1>
            <p className="login-description">Completa el formulario para registrarte en el sistema.</p>

            {error && <p className="login-error">{error}</p>}
            {success && <p className="login-success">{success}</p>}

            <form className="login-form" onSubmit={handleRegister}>
              <label>
                Nombres
                <input
                  type="text"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  placeholder="Juan"
                  required
                  disabled={loading}
                />
              </label>

              <label>
                Apellidos
                <input
                  type="text"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  placeholder="Pérez"
                  required
                  disabled={loading}
                />
              </label>

              <label>
                Usuario
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="juanperez123"
                  required
                  disabled={loading}
                />
              </label>

              <label>
                Correo electrónico
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="juan@correo.com"
                  required
                  disabled={loading}
                />
              </label>

              <label>
                Contraseña
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  disabled={loading}
                />
              </label>

              <label>
                Confirmar contraseña
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  required
                  disabled={loading}
                />
              </label>

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>
          </>
        )}

        <p className="login-note">Este formulario está conectado con seguridad a la base de datos del servidor.</p>
      </div>
    </div>
  );
}

export default LoginPage;
