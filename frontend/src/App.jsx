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
import ClientsPage from './pages/ClientsPage';
import TemplatesPage from './pages/TemplatesPage';
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
    if (nextPage === 'inspection-flow') {
      openInspectionFlow();
      return;
    }
    setPage(nextPage);
    setView('app');
  };

  const onLogout = () => {
    localStorage.removeItem('fieldops_token');
    localStorage.removeItem('fieldops_user');
    setView('login');
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
    if (page === 'clients') return <ClientsPage />;
    if (page === 'equipment') return <EquipmentPage />;
    if (page === 'technicians') return <TechniciansPage />;
    if (page === 'nonconformities') return <NonConformitiesPage />;
    if (page === 'templates') return <TemplatesPage />;
    if (page === 'orders') return <ServiceOrdersPage />;
    if (page === 'history') return <HistoryPage />;
    if (page === 'profile') return <ProfilePage />;

    return <DashboardPage onNavigate={onNavigate} onOpenInspectionFlow={openInspectionFlow} />;
  }, [page]);

  const pageTitle = useMemo(() => {
    switch (page) {
      case 'dashboard': return 'Dashboard';
      case 'inspections': return 'Lista de inspeções';
      case 'my-inspections': return 'Minhas inspeções';
      case 'clients': return 'Clientes & Locais';
      case 'equipment': return 'Equipamentos';
      case 'technicians': return 'Técnicos';
      case 'nonconformities': return 'Não conformidades';
      case 'templates': return 'Modelos de Checklist';
      case 'orders': return 'Ordens de serviço';
      case 'history': return 'Histórico';
      case 'profile': return 'Perfil';
      default: return 'Dashboard';
    }
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
        onLogout={onLogout}
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
      title={pageTitle}
      activePage={page}
      onNavigate={onNavigate}
      search={search}
      setSearch={setSearch}
      onLogout={onLogout}
      mobileMenuOpen={mobileMenuOpen}
      setMobileMenuOpen={setMobileMenuOpen}
    >
      {renderPage}
    </AppLayout>
  );
}

export default App;