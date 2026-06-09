import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ADMIN_PATHS } from './routes/adminPaths';
import './styles/tailwind.output.css';
import './App.css';

import { ConfiguracionProvider } from './context/ConfiguracionContext';
import PublicLayout from './components/publico/layout/PublicLayout';
import Home from './pages/publico/Home';
import CatalogoAtractivos from './pages/publico/CatalogoAtractivos';
import FichaAtractivo from './pages/publico/FichaAtractivo';
import CatalogoRutas from './pages/publico/CatalogoRutas';
import DetalleRuta from './pages/publico/DetalleRuta';
import CatalogoEmprendimientos from './pages/publico/CatalogoEmprendimientos';
import DetalleEmprendimiento from './pages/publico/DetalleEmprendimiento';
import CatalogoEventos from './pages/publico/CatalogoEventos';
import MapaGeneral from './pages/publico/MapaGeneral';
import AdminRoutes from './routes/AdminRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={(
            <ConfiguracionProvider>
              <PublicLayout />
            </ConfiguracionProvider>
          )}
        >
          <Route index element={<Home />} />
          <Route path="atractivos" element={<CatalogoAtractivos />} />
          <Route path="atractivos/:slug" element={<FichaAtractivo />} />
          <Route path="rutas" element={<CatalogoRutas />} />
          <Route path="rutas/:id" element={<DetalleRuta />} />
          <Route path="emprendimientos" element={<CatalogoEmprendimientos />} />
          <Route path="emprendimientos/:id" element={<DetalleEmprendimiento />} />
          <Route path="eventos" element={<CatalogoEventos />} />
          <Route path="mapa" element={<MapaGeneral />} />
        </Route>

        <Route path="/admin" element={<Navigate to={ADMIN_PATHS.login} replace />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}
