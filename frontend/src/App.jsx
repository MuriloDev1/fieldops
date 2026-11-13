import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './core/context/AuthContext';
import { AuthGuard } from './core/guards/AuthGuard';
import { ErrorBoundary } from './core/components/ErrorBoundary';

import { Layout } from './shared/components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientsPage } from './pages/ClientsPage';
import { LocationsPage } from './pages/LocationsPage';
import { EquipmentPage } from './pages/EquipmentPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { OperationsPage } from './pages/OperationsPage';
import { NonConformitiesPage } from './pages/NonConformitiesPage';
import { HistoryPage } from './pages/HistoryPage';
import { TeamManagementPage } from './pages/TeamManagementPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import MyInspectionsPage from './pages/MyInspectionsPage';
import InspectionListPage from './pages/InspectionListPage';
import InspectionWorkflowPage from './pages/InspectionWorkflowPage';
import ServiceOrdersPage from './pages/ServiceOrdersPage';
import ProfilePage from './pages/ProfilePage';
import { ToastProvider } from './core/context/ToastContext';
import { useAuth } from './core/context/AuthContext';
import { getHomePath } from './core/permissions';

// Redireciona a raiz para a página inicial do perfil logado.
function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={getHomePath(user?.role)} replace />;
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <AuthGuard>
                  <Layout />
                </AuthGuard>
              }
            >
              <Route index element={<HomeRedirect />} />
              <Route path="my-inspections" element={<MyInspectionsPage />} />
              <Route path="inspections" element={<InspectionListPage />} />
              <Route path="inspection-flow" element={<InspectionWorkflowPage />} />
              <Route path="service-orders" element={<ServiceOrdersPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="locations" element={<LocationsPage />} />
              <Route path="equipment" element={<EquipmentPage />} />
              <Route path="templates" element={<TemplatesPage />} />
              <Route path="operations" element={<OperationsPage />} />
              <Route path="non-conformities" element={<NonConformitiesPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="team" element={<TeamManagementPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;