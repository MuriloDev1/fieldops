import { useEffect, useRef, useState } from 'react';
import Modal from '../components/Modal';
import { StatCard } from '../shared/components/StatCard';
import { DataTable } from '../shared/components/DataTable';
import { StatusBadge } from '../shared/components/StatusBadge';
import { useToast } from '../core/context/ToastContext';
import { isDemoSession } from '../core/demo';
import { nonConformities as mockNcs, technicians as mockTechs, inspections as mockInspections, equipment as mockEquipment } from '../data/mockData';
import { dashboardApi, nonConformitiesApi, usersApi, equipmentApi, inspectionsApi } from '../core/services/api';

const quickMenuItems = [
  'Atualizar prioridades',
  'Enviar alerta de campo',
  'Gerar relatório rápido',
];

const columns = [
  { header: 'Local', key: 'local' },
  { header: 'Equipamento', key: 'equipment' },
  { header: 'Data da inspeção', key: 'date' },
  { header: 'Status', key: 'status', render: (val) => <StatusBadge status={val} /> },
];

const DEMO_SUMMARY = {
  completedInspections: '128',
  nonConformityRate: '7.4%',
  activeTechnicians: '12',
  overdueInspections: '3',
  weeklyProgress: [12, 18, 15, 22, 19, 8, 5],
};

const toSeverity = (priority) => (priority === 'Alta' ? 'Crítico' : priority === 'Média' ? 'Alta' : 'Baixa');

export const DashboardPage = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignedMessage, setAssignedMessage] = useState('');
  const [rows, setRows] = useState([]);
  const [quickItems, setQuickItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [summary, setSummary] = useState({
    completedInspections: '0',
    nonConformityRate: '0%',
    activeTechnicians: '0',
    overdueInspections: '0',
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
  });
  const menuRef = useRef(null);

  useEffect(() => {
    const loadDashboard = async () => {
      if (isDemoSession()) {
        setSummary(DEMO_SUMMARY);
        setRows(
          mockNcs.map((nc) => ({
            id: nc.id,
            local: nc.equipment,
            equipment: nc.equipment,
            date: nc.date,
            status: toSeverity(nc.priority),
            description: nc.description,
          }))
        );
        setQuickItems([
          ...mockEquipment
            .filter((e) => e.status === 'Alerta' || e.status === 'Em manutenção')
            .slice(0, 2)
            .map((e) => ({
              label: e.name,
              detail: `${e.status} (${e.location})`,
              status: e.status === 'Alerta' ? 'danger' : 'warning',
            })),
          ...mockInspections
            .filter((i) => i.status === 'Em andamento')
            .slice(0, 1)
            .map((i) => ({ label: i.name, detail: 'Pendente aprovação do supervisor', status: 'info' })),
        ]);
        setTechnicians(mockTechs.map((t) => t.name));
        setLoading(false);
        return;
      }

      try {
        const [summaryData, ncData, usersData, eqData, inspData] = await Promise.all([
          dashboardApi.getSummary(),
          nonConformitiesApi.getAll(),
          usersApi.getAll(),
          equipmentApi.getAll(),
          inspectionsApi.getAll(),
        ]);

        if (summaryData) {
          const ncRate =
            summaryData.nonConformityRate ?? summaryData.nonConformanceRate ?? 0;

          const parsedWeekly = Array.isArray(summaryData.weeklyProgress)
            ? summaryData.weeklyProgress.map((item) =>
                typeof item === 'number' ? item : Number(item?.total ?? item?.completed ?? 0)
              )
            : [0, 0, 0, 0, 0, 0, 0];

          setSummary({
            completedInspections: String(summaryData.completedInspections ?? 0),
            nonConformityRate: `${ncRate}%`,
            activeTechnicians: String(summaryData.activeTechnicians ?? 0),
            overdueInspections: String(summaryData.overdueInspections ?? 0),
            weeklyProgress: parsedWeekly.length === 7 ? parsedWeekly : [0, 0, 0, 0, 0, 0, 0],
          });
        }

        if (Array.isArray(ncData)) {
          const mappedRows = ncData.map((nc) => ({
            id: nc.id,
            local: nc.local || nc.siteName || '-',
            equipment: nc.equipment || nc.equipmentName || '-',
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
          setRows(mappedRows);
        }

        const dynamicQuick = [];
        if (Array.isArray(eqData)) {
          eqData
            .filter((e) => e.status === 'CRITICAL' || e.status === 'HIGH' || e.status === 'MAINTENANCE')
            .slice(0, 2)
            .forEach((e) => {
              dynamicQuick.push({
                label: e.name,
                detail:
                  e.status === 'CRITICAL'
                    ? `Status crítico (${e.siteName || e.locationName || 'Campo'})`
                    : `Atenção operacional (${e.siteName || e.locationName || 'Campo'})`,
                status: e.status === 'CRITICAL' ? 'danger' : 'warning',
              });
            });
        }
        if (Array.isArray(inspData)) {
          const pendingReview = inspData.find(
            (i) => i.status === 'SUBMITTED' || i.status === 'UNDER_REVIEW'
          );
          if (pendingReview) {
            dynamicQuick.push({
              label: pendingReview.title || pendingReview.templateTitle || 'Revisão de Inspeção',
              detail: 'Pendente aprovação do supervisor',
              status: 'info',
            });
          }
        }
        setQuickItems(dynamicQuick);

        if (Array.isArray(usersData)) {
          const techNames = usersData
            .filter((u) => u.role === 'TECHNICIAN' || u.role === 'SUPERVISOR')
            .map((u) => u.name);
          setTechnicians(techNames);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do banco no Dashboard:', err);
        toast.error('Não foi possível carregar os dados do dashboard.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    toast.success(`Tarefa atribuída a ${technician}.`);
    setAssignOpen(false);
    setMenuOpen(false);
  };

  const handleQuickMenuAction = (action) => {
    setMenuOpen(false);
    setAssignedMessage('');
    toast.success(`${action} foi acionado com sucesso.`);
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
    toast.success('Exportação concluída.');
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

      <div className={`stats-grid ${loading ? 'is-loading' : ''}`} aria-busy={loading}>
        <StatCard
          title="Inspeções Concluídas"
          value={summary.completedInspections}
          footerText="Total no período"
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
            {(() => {
              const maxVal = Math.max(...summary.weeklyProgress, 5);
              return (
                <>
                  <div className="y-axis">
                    <span>{maxVal}</span>
                    <span>{Math.round(maxVal * 0.75)}</span>
                    <span>{Math.round(maxVal * 0.5)}</span>
                    <span>{Math.round(maxVal * 0.25)}</span>
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
                          <div
                            className="bar"
                            style={{ height: `${Math.min((value / maxVal) * 100, 100)}%` }}
                            title={`${value} inspeções`}
                          >
                            <span className="bar-value">{value}</span>
                          </div>
                          <span>{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][index]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
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
