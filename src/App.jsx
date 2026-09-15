import { useMemo, useState } from 'react';
import AppLayout from './layouts/AppLayout';
import SplashPage from './pages/SplashPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InspectionListPage from './pages/InspectionListPage';
import MyInspectionsPage from './pages/MyInspectionsPage';
import EquipmentPage from './pages/EquipmentPage';
import TechniciansPage from './pages/TechniciansPage';
import NonConformitiesPage from './pages/NonConformitiesPage';
import ServiceOrdersPage from './pages/ServiceOrdersPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import InspectionWorkflowPage from './pages/InspectionWorkflowPage';
import SuccessState from './components/SuccessState';

function App() {
  const [view, setView] = useState('splash');
  const [page, setPage] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [isInspectionFinished, setIsInspectionFinished] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const onLogin = () => {
    setView('app');
    setPage('dashboard');
  };

  const openInspectionFlow = (inspection = null) => {
    setSelectedInspection(
      inspection ?? {
        id: 'INS-2048',
        name: 'Inspeção de segurança de bomba',
        equipment: 'Bomba centrífuga 04',
        technician: 'Ana Costa',
        date: '14/09/2026',
      },
    );
    setView('inspection');
    setIsInspectionFinished(false);
  };

  const onCompleteInspection = () => {
    setIsInspectionFinished(true);
  };

  const onNavigate = (nextPage) => {
    setPage(nextPage);
    setView('app');
  };

  const renderPage = useMemo(() => {
    if (page === 'dashboard') {
      return <DashboardPage onNavigate={onNavigate} onOpenInspectionFlow={openInspectionFlow} />;
    }
    if (page === 'inspections') {
      return <InspectionListPage onOpenInspectionFlow={openInspectionFlow} onNavigate={onNavigate} />;
    }
    if (page === 'my-inspections') {
      return <MyInspectionsPage onOpenInspectionFlow={openInspectionFlow} onNavigate={onNavigate} />;
    }
    if (page === 'equipment') return <EquipmentPage />;
    if (page === 'technicians') return <TechniciansPage />;
    if (page === 'nonconformities') return <NonConformitiesPage />;
    if (page === 'orders') return <ServiceOrdersPage />;
    if (page === 'history') return <HistoryPage />;
    if (page === 'profile') return <ProfilePage />;

    return <DashboardPage onNavigate={onNavigate} onOpenInspectionFlow={openInspectionFlow} />;
  }, [page]);

  if (view === 'splash') {
    return <SplashPage onContinue={() => setView('login')} />;
  }

  if (view === 'login') {
    return <LoginPage onLogin={onLogin} />;
  }

  if (view === 'inspection') {
    return (
      <AppLayout
        title="Execução de inspeção"
        activePage={page}
        onNavigate={onNavigate}
        search={search}
        setSearch={setSearch}
        onLogout={() => setView('login')}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      >
        {isInspectionFinished ? (
          <SuccessState
            title="Inspeção concluída com sucesso"
            description="A inspeção foi registrada, com evidências e observações salvas."
            action={
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setView('app');
                  setPage('dashboard');
                }}
              >
                Voltar ao dashboard
              </button>
            }
          />
        ) : (
          <InspectionWorkflowPage
            inspection={selectedInspection}
            onComplete={onCompleteInspection}
            onBack={() => setView('app')}
          />
        )}
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={
        page === 'dashboard'
          ? 'Dashboard'
          : page === 'inspections'
            ? 'Lista de inspeções'
            : page === 'my-inspections'
              ? 'Minhas inspeções'
              : page === 'equipment'
                ? 'Equipamentos'
                : page === 'technicians'
                  ? 'Técnicos'
                  : page === 'nonconformities'
                    ? 'Não conformidades'
                    : page === 'orders'
                      ? 'Ordens de serviço'
                      : page === 'history'
                        ? 'Histórico'
                        : page === 'profile'
                          ? 'Perfil'
                          : 'Dashboard'
      }
      activePage={page}
      onNavigate={onNavigate}
      search={search}
      setSearch={setSearch}
      onLogout={() => setView('login')}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
    >
      {renderPage}
    </AppLayout>
  );
}

export default App;
