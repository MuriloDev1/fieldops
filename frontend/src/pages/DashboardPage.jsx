import { useEffect, useRef, useState } from 'react';
import Modal from '../components/Modal';
import { StatCard } from '../shared/components/StatCard';
import { DataTable } from '../shared/components/DataTable';
import { StatusBadge } from '../shared/components/StatusBadge';
import { dashboardApi, nonConformitiesApi, usersApi } from '../core/services/api';

const quickItems = [
  { label: 'Bomba Submersa 04', detail: 'Falha crítica reportada', status: 'danger' },
  { label: 'Válvula de Pressão B', detail: 'Manutenção atrasada há 2 dias', status: 'warning' },
  { label: 'Relatório Diário', detail: 'Pendente aprovação do supervisor', status: 'info' },
];

const quickMenuItems = [
  'Atualizar prioridades',
  'Enviar alerta de campo',
  'Gerar relatório rápido',
];

const defaultTechnicians = [
  'Carlos Lima',
  'Ana Souza',
  'Mateus Silva',
  'Iris Costa',
  'Lucas Pereira',
];

const columns = [
  { header: 'Local', key: 'local' },
  { header: 'Equipamento', key: 'equipment' },
  { header: 'Data da inspeção', key: 'date' },
  { header: 'Status', key: 'status', render: (val) => <StatusBadge status={val} /> },
];

const initialRows = [
  { id: '1', local: 'Unidade de Extração Alpha', equipment: 'Bomba Submersa 04', date: '24 Out 2023, 08:30', status: 'Crítico', description: 'Falha crítica reportada na vedação mecânica' },
  { id: '2', local: 'Refinaria Central', equipment: 'Válvula de Pressão B', date: '23 Out 2023, 14:15', status: 'Alta', description: 'Oscilação de pressão acima do limite nominal' },
  { id: '3', local: 'Terminal Marítimo Sul', equipment: 'Correia Transportadora 2', date: '22 Out 2023, 09:45', status: 'Baixa', description: 'Desgaste superficial na borda lateral' },
  { id: '4', local: 'Planta de Processamento', equipment: 'Compressor Principal', date: '21 Out 2023, 11:20', status: 'Alta', description: 'Temperatura elevada no estágio de compressão' },
  { id: '5', local: 'Unidade de Extração Beta', equipment: 'Painel Elétrico Leste', date: '21 Out 2023, 16:00', status: 'Crítico', description: 'Aquecimento anormal nos barramentos' },
];

export const DashboardPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignedMessage, setAssignedMessage] = useState('');
  const [rows, setRows] = useState(initialRows);
  const [statusFilter, setStatusFilter] = useState('');
  const [technicians, setTechnicians] = useState(defaultTechnicians);
  const [summary, setSummary] = useState({
    completedInspections: '1,284',
    nonConformityRate: '12.5%',
    activeTechnicians: '42',
    overdueInspections: '15',
    weeklyProgress: [65, 95, 72, 125, 105, 155, 142],
  });
  const menuRef = useRef(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [summaryData, ncData, usersData] = await Promise.all([
          dashboardApi.getSummary().catch(() => null),
          nonConformitiesApi.getAll().catch(() => null),
          usersApi.getAll().catch(() => null),
        ]);

        if (summaryData) {
          setSummary((prev) => ({
            ...prev,
            completedInspections:
              summaryData.completedInspections != null
                ? String(summaryData.completedInspections)
                : prev.completedInspections,
            nonConformityRate:
              summaryData.nonConformityRate != null
                ? `${summaryData.nonConformityRate}%`
                : prev.nonConformityRate,
            activeTechnicians:
              summaryData.activeTechnicians != null
                ? String(summaryData.activeTechnicians)
                : prev.activeTechnicians,
            overdueInspections:
              summaryData.overdueInspections != null
                ? String(summaryData.overdueInspections)
                : prev.overdueInspections,
            weeklyProgress:
              Array.isArray(summaryData.weeklyProgress) && summaryData.weeklyProgress.length === 7
                ? summaryData.weeklyProgress
                : prev.weeklyProgress,
          }));
        }

        if (Array.isArray(ncData) && ncData.length > 0) {
          const mappedRows = ncData.map((nc) => ({
            id: nc.id,
            local: nc.local || nc.siteName || 'Planta Principal',
            equipment: nc.equipment || nc.equipmentName || 'Inspeção Geral',
            date: nc.date || (nc.createdAt ? new Date(nc.createdAt).toLocaleDateString('pt-BR') : '-'),
            status:
              nc.severity === 'CRITICAL'
                ? 'Crítico'
                : nc.severity === 'HIGH'
                ? 'Alta'
                : nc.severity === 'LOW'
                ? 'Baixa'
                : 'Alta',
            description: nc.description || nc.title,
          }));
          setRows([...mappedRows, ...initialRows]);
        }

        if (Array.isArray(usersData) && usersData.length > 0) {
          const techNames = usersData
            .filter((u) => u.role === 'TECHNICIAN' || u.role === 'SUPERVISOR')
            .map((u) => u.name);
          if (techNames.length > 0) {
            setTechnicians(techNames);
          }
        }
      } catch (err) {
        console.warn('Usando dados de fallback no Dashboard:', err);
      }
    };

    loadDashboard();
  }, []);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [menuOpen]);

  const handleOpenItem = (item) => {
    setSelectedItem(item);
    setMenuOpen(false);
  };

  const handleAssignTask = (technician) => {
    setAssignedMessage(`Tarefa atribuída a ${technician} com sucesso.`);
    setAssignOpen(false);
    setMenuOpen(false);
  };

  const handleQuickMenuAction = (action) => {
    setMenuOpen(false);
    setAssignedMessage(`${action} foi acionado com sucesso.`);
    setAssignOpen(false);
  };

  const handleCycleFilter = () => {
    const cycle = ['', 'Crítico', 'Alta', 'Baixa'];
    const nextIdx = (cycle.indexOf(statusFilter) + 1) % cycle.length;
    setStatusFilter(cycle[nextIdx]);
  };

  const handleExportCsv = () => {
    const csvRows = [
      ['Local', 'Equipamento', 'Data da Inspecao', 'Status'],
      ...filteredRows.map((r) => [r.local, r.equipment, r.date, r.status]),
    ];
    const csvContent = csvRows.map((e) => e.map((v) => `"${v || ''}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'nao_conformidades_fieldops.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRows = statusFilter
    ? rows.filter((r) => r.status.toLowerCase() === statusFilter.toLowerCase())
    : rows;

  return (
    <>
      <div className="page-title-wrap">
        <h1>Dashboard</h1>
        <p>Visão geral operacional e acompanhamento de campo.</p>
      </div>

      {assignedMessage && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            borderRadius: '0.5rem',
            color: '#34d399',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{assignedMessage}</span>
          <button
            type="button"
            onClick={() => setAssignedMessage('')}
            style={{ background: 'transparent', border: 'none', color: '#34d399', cursor: 'pointer', fontWeight: 700 }}
          >
            ✕
          </button>
        </div>
      )}

      <div className="stats-grid">
        <StatCard
          title="Inspeções Concluídas"
          value={summary.completedInspections}
          footerText="+5.2% vs mês anterior"
          type="positive"
          icon="✓"
        />
        <StatCard
          title="Taxa de Não Conformidade"
          value={summary.nonConformityRate}
          footerText="Atenção requerida"
          type="warning"
          icon="!"
        />
        <StatCard
          title="Técnicos em Campo"
          value={summary.activeTechnicians}
          footerText="● Status ativo"
          type="positive"
          icon="◌"
        />
        <StatCard
          title="Inspeções Atrasadas"
          value={summary.overdueInspections}
          footerText="Ação imediata necessária"
          type="danger"
          icon="!"
        />
      </div>

      <div className="two-column">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Andamento Semanal</h2>
            </div>
            <button type="button" className="pill-button">7 dias ▾</button>
          </div>

          <div className="chart" aria-label="Gráfico semanal">
            <div className="y-axis">
              <span>200</span>
              <span>150</span>
              <span>100</span>
              <span>50</span>
              <span>0</span>
            </div>

            <div className="chart-area">
              <div className="grid-line" />
              <div className="grid-line" />
              <div className="grid-line" />
              <div className="grid-line" />

              <div className="bars">
                {summary.weeklyProgress.map((value, index) => (
                  <div key={index} className="bar-column">
                    <div className="bar" style={{ height: `${Math.min((value / 200) * 100, 100)}%` }} />
                    <span>{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][index]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="panel actions-panel">
          <div className="panel-header small-header">
            <div>
              <h2>Ação Rápida</h2>
            </div>

            <div className="menu-wrap" ref={menuRef}>
              <button
                type="button"
                className="menu-button"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-expanded={menuOpen}
                aria-label="Abrir ações rápidas"
              >
                ⋮
              </button>

              {menuOpen && (
                <div className="menu-dropdown" role="menu">
                  {quickMenuItems.map((item) => (
                    <button key={item} type="button" className="menu-item" onClick={() => handleQuickMenuAction(item)}>
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="quick-list">
            {quickItems.map((item) => (
              <div key={item.label} className="quick-item">
                <div className={`quick-icon ${item.status}`} aria-hidden="true">
                  {item.status === 'danger' && '!'}
                  {item.status === 'warning' && '◔'}
                  {item.status === 'info' && '▣'}
                </div>

                <div className="quick-copy">
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                </div>

                <button type="button" className="link-button" onClick={() => handleOpenItem(item)}>
                  Ver
                </button>
              </div>
            ))}
          </div>

          <button type="button" className="primary-button" onClick={() => setAssignOpen(true)}>
            Atribuir Tarefas
          </button>
        </section>
      </div>

      <DataTable
        title={
          statusFilter
            ? `Acompanhamento de Não Conformidades (Filtro: ${statusFilter})`
            : 'Acompanhamento de Não Conformidades'
        }
        columns={columns}
        data={filteredRows}
        totalCount={filteredRows.length}
        currentPage={1}
        onRowAction={(row) => setSelectedRow(row)}
        onFilterClick={handleCycleFilter}
        onExportClick={handleExportCsv}
      />

      <Modal
        open={Boolean(selectedItem)}
        title="Detalhes da ação"
        onClose={() => setSelectedItem(null)}
        footer={
          <>
            <button type="button" className="button button-secondary" onClick={() => setSelectedItem(null)}>
              Fechar
            </button>
            <button type="button" className="button button-primary" onClick={() => setAssignOpen(true)}>
              Atribuir
            </button>
          </>
        }
      >
        {selectedItem ? (
          <div className="detail-card">
            <div className={`quick-icon ${selectedItem.status}`} aria-hidden="true">
              {selectedItem.status === 'danger' && '!'}
              {selectedItem.status === 'warning' && '◔'}
              {selectedItem.status === 'info' && '▣'}
            </div>
            <h4>{selectedItem.label}</h4>
            <p>{selectedItem.detail}</p>
            <div className="detail-meta">
              <span>Prioridade: {selectedItem.status === 'danger' ? 'Alta' : selectedItem.status === 'warning' ? 'Média' : 'Normal'}</span>
              <span>Responsável: Supervisão operacional</span>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(selectedRow)}
        title="Detalhes da Não Conformidade"
        onClose={() => setSelectedRow(null)}
        footer={
          <button type="button" className="button button-primary" onClick={() => setSelectedRow(null)}>
            Fechar
          </button>
        }
      >
        {selectedRow ? (
          <div className="detail-card">
            <h4>{selectedRow.equipment}</h4>
            <p>{selectedRow.description || 'Apontamento registrado durante inspeção técnica em campo.'}</p>
            <div className="detail-meta">
              <span>Local: {selectedRow.local}</span>
              <span>Data: {selectedRow.date}</span>
              <span>Severidade: {selectedRow.status}</span>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={assignOpen}
        title="Atribuir tarefa"
        onClose={() => setAssignOpen(false)}
        footer={
          <button type="button" className="button button-primary" onClick={() => setAssignOpen(false)}>
            Concluir
          </button>
        }
      >
        <div className="assign-list">
          {technicians.map((technician) => (
            <button
              key={technician}
              type="button"
              className="assign-item"
              onClick={() => handleAssignTask(technician)}
            >
              <span>{technician}</span>
              <small>Disponível para deslocamento</small>
            </button>
          ))}
        </div>
        {assignedMessage ? <p className="assign-success">{assignedMessage}</p> : null}
      </Modal>
    </>
  );
};

export default DashboardPage;
