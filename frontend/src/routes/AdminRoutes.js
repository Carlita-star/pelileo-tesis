import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import DashboardHomePage from '../pages/admin/DashboardHomePage';
import AtractivosPage from '../pages/AtractivosPage';
import AtractivoFormPage from '../pages/AtractivoFormPage';
import RutasAdminPage from '../pages/admin/RutasAdminPage';
import RutaFormPage from '../pages/admin/RutaFormPage';
import EmprendimientosAdminPage from '../pages/admin/EmprendimientosAdminPage';
import EmprendimientoFormPage from '../pages/admin/EmprendimientoFormPage';
import EventosPage from '../pages/EventosPage';
import EventoFormPage from '../pages/admin/EventoFormPage';
import CatalogosPage from '../pages/admin/CatalogosPage';
import UsuarioFormPage from '../pages/admin/UsuarioFormPage';
import UsuariosPage from '../pages/UsuariosPage';
import ReportesPage from '../pages/ReportesPage';
import AuditoriasPage from '../pages/AuditoriasPage';
import ConfiguracionPage from '../pages/ConfiguracionPage';
import SinPermisoPage from '../pages/admin/SinPermisoPage';
import PerfilPage from '../pages/admin/PerfilPage';
import AdminOnlyRoute from './AdminOnlyRoute';
import ErroresMonitorPage from '../pages/admin/ErroresMonitorPage';

function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="login" replace />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="recuperar" element={<LoginPage initialView="recover" />} />

      <Route
        element={(
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        )}
      >
        <Route path="dashboard" element={<DashboardHomePage />} />
        <Route path="atractivos" element={<AtractivosPage />} />
        <Route path="atractivos/nuevo" element={<AtractivoFormPage />} />
        <Route path="atractivos/:id/editar" element={<AtractivoFormPage />} />
        <Route path="rutas" element={<RutasAdminPage />} />
        <Route path="rutas/nueva" element={<RutaFormPage />} />
        <Route path="rutas/:id/editar" element={<RutaFormPage />} />
        <Route path="emprendimientos" element={<EmprendimientosAdminPage />} />
        <Route path="emprendimientos/nuevo" element={<EmprendimientoFormPage />} />
        <Route path="emprendimientos/:id/editar" element={<EmprendimientoFormPage />} />
        <Route path="eventos" element={<EventosPage />} />
        <Route path="eventos/nuevo" element={<EventoFormPage />} />
        <Route path="eventos/:id/editar" element={<EventoFormPage />} />
        <Route path="catalogos" element={<CatalogosPage />} />
        <Route path="configuracion" element={<ConfiguracionPage />} />
        <Route path="perfil" element={<PerfilPage />} />
        <Route path="sin-permiso" element={<SinPermisoPage />} />

        <Route element={<AdminOnlyRoute />}>
          <Route path="usuarios" element={<UsuariosPage />} />
          <Route path="usuarios/nuevo" element={<UsuarioFormPage />} />
          <Route path="usuarios/:id/editar" element={<UsuarioFormPage />} />
          <Route path="reportes" element={<ReportesPage />} />
          <Route path="auditoria" element={<AuditoriasPage />} />
          <Route path="errores" element={<ErroresMonitorPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default AdminRoutes;
