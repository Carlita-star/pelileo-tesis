import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles/tailwind.output.css'; // Estilos Tailwind (generados por 'npm run css')

import { ConfiguracionProvider } from './context/ConfiguracionContext';
import PublicLayout from './components/publico/layout/PublicLayout';
import CatalogoAtractivos from './pages/publico/CatalogoAtractivos';
import AdminApp from './AdminApp';
import FichaAtractivo from './pages/publico/FichaAtractivo';
import CatalogoRutas from './pages/publico/CatalogoRutas';
import DetalleRuta from './pages/publico/DetalleRuta';
import CatalogoEmprendimientos from './pages/publico/CatalogoEmprendimientos';
import DetalleEmprendimiento from './pages/publico/DetalleEmprendimiento';
import CatalogoEventos from './pages/publico/CatalogoEventos';
import MapaGeneral from './pages/publico/MapaGeneral';
import Home from './pages/publico/Home';

//// Placeholder temporal para las pantallas del portal que aún no construyes.
//function EnConstruccion({ nombre }) {
//  return (
//    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
//      <h1 className="text-2xl font-bold text-slate-800">{nombre}</h1>
//      <p className="mt-2 text-slate-500">Esta pantalla está en construcción.</p>
//    </div>
//  );
//}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ---------- PORTAL PÚBLICO ---------- */}
        {/* El ConfiguracionProvider carga la config de la API y la comparte
            con el Header, el Footer y todas las pantallas públicas. */}
        <Route
          element={
            <ConfiguracionProvider>
              <PublicLayout />
            </ConfiguracionProvider>
          }
        >
          <Route index element={<Home />} />
          <Route path="/atractivos" element={<CatalogoAtractivos />} />
          <Route path="/atractivos/:slug" element={<FichaAtractivo />} />
          <Route path="/rutas" element={<CatalogoRutas />} />
          <Route path="/rutas/:id" element={<DetalleRuta />} />
          <Route path="/emprendimientos" element={<CatalogoEmprendimientos />} />
          <Route path="/emprendimientos/:id" element={<DetalleEmprendimiento />} />
          <Route path="/eventos" element={<CatalogoEventos />} />
          <Route path="/mapa" element={<MapaGeneral />} />
        </Route>

        {/* ---------- PANEL ADMINISTRATIVO ---------- */}
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </BrowserRouter>
  );
}