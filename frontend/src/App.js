import { useEffect, useState } from 'react';
import './App.css';

const API_BASE = process.env.REACT_APP_API_URL ?? 'http://localhost:8000';

function App() {
  const [backendStatus, setBackendStatus] = useState('Comprobando...');
  const [atractivos, setAtractivos] = useState([]);
  const [rutas, setRutas] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [apiRes, atractivosRes, rutasRes] = await Promise.all([
          fetch(`${API_BASE}/api/`),
          fetch(`${API_BASE}/api/atractivos/`),
          fetch(`${API_BASE}/api/rutas/`),
        ]);

        setBackendStatus(apiRes.ok ? 'Conectado' : `Error ${apiRes.status}`);

        if (atractivosRes.ok) {
          const atractivosJson = await atractivosRes.json();
          setAtractivos(atractivosJson.results || []);
        }

        if (rutasRes.ok) {
          const rutasJson = await rutasRes.json();
          setRutas(rutasJson.results || []);
        }
      } catch (error) {
        setBackendStatus('No disponible');
      }
    }

    loadData();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Sistema Turismo Pelileo</h1>
        <p>Conectado al backend y listo para mostrar datos reales.</p>

        <div className="status-card">
          <p>
            <strong>Estado del backend:</strong> {backendStatus}
          </p>
          <p>
            <strong>API base:</strong> {API_BASE}
          </p>
          <p>
            <strong>Atractivos cargados:</strong> {atractivos.length}
          </p>
          <p>
            <strong>Rutas cargadas:</strong> {rutas.length}
          </p>
        </div>

        <div className="buttons">
          <a className="App-link" href={`${API_BASE}/api/`} target="_blank" rel="noreferrer">
            Ver API raíz
          </a>
          <a className="App-link" href={`${API_BASE}/admin/`} target="_blank" rel="noreferrer">
            Abrir admin Django
          </a>
        </div>

        <section className="data-grid">
          <div className="data-card">
            <h2>Atractivos</h2>
            {atractivos.length === 0 ? (
              <p>No se encontraron atractivos.</p>
            ) : (
              <ul>
                {atractivos.map((item) => (
                  <li key={item.id}>
                    <strong>{item.nombre}</strong>
                    <div>{item.categoria || 'Sin categoría'} - {item.parroquia || 'Sin parroquia'}</div>
                    <div>{item.descripcion || 'Sin descripción'}</div>
                    <div>Visitas: {item.visitas} · Destacado: {item.destacado ? 'Sí' : 'No'}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="data-card">
            <h2>Rutas</h2>
            {rutas.length === 0 ? (
              <p>No se encontraron rutas.</p>
            ) : (
              <ul>
                {rutas.map((item) => (
                  <li key={item.id}>
                    <strong>{item.nombre}</strong>
                    <div>{item.descripcion || 'Sin descripción'}</div>
                    <div>{item.dificultad || 'Dificultad no definida'} · {item.distancia_km ?? '-'} km</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </header>
    </div>
  );
}

export default App;
