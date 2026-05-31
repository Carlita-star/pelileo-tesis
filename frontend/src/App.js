import { useState, useEffect } from 'react';
import './App.css';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

const API_BASE = process.env.REACT_APP_API_URL ?? 'http://localhost:8000';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [usuario, setUsuario] = useState(null);

  // Recuperar estado de autenticación y usuario del localStorage al cargar
  useEffect(() => {
    const autenticado = localStorage.getItem('autenticado') === 'true';
    const usuarioGuardado = localStorage.getItem('usuario');
    setIsAuthenticated(autenticado);
    setUsuario(usuarioGuardado ? JSON.parse(usuarioGuardado) : null);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('autenticado');
    setIsAuthenticated(false);
    setUsuario(null);
  };

  return (
    <div className="app-root">
      {isAuthenticated ? (
        <DashboardPage apiBase={API_BASE} usuario={usuario} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={(usuario) => {
          setIsAuthenticated(true);
          setUsuario(usuario);
        }} />
      )}
    </div>
  );
}

export default App;
