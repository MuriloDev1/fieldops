import { useEffect, useRef, useState } from 'react';
import Modal from '../components/Modal';
import { StatCard } from '../shared/components/StatCard';
import { DataTable } from '../shared/components/DataTable';

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

const technicians = [
  'Ana Souza',
  'Mateus Silva',
  'Iris Costa',
  'Lucas Pereira',
];

const columns = [
  { header: 'Local', key: 'local' },
  { header: 'Equipamento', key: 'equipment' },
  { header: 'Data da inspeção', key: 'date' },
  { header: 'Status', key: 'status' },
];

const rows = [
  { id: '1', local: 'Unidade de Extração Alpha', equipment: 'Bomba Submersa 04', date: '24 Out 2023, 08:30', status: 'Crítico' },
  { id: '2', local: 'Refinaria Central', equipment: 'Válvula de Pressão B', date: '23 Out 2023, 14:15', status: 'Alta' },
  { id: '3', local: 'Terminal Marítimo Sul', equipment: 'Correia Transportadora 2', date: '22 Out 2023, 09:45', status: 'Baixa' },
  { id: '4', local: 'Planta de Processamento', equipment: 'Compressor Principal', date: '21 Out 2023, 11:20', status: 'Alta' },
  { id: '5', local: 'Unidade de Extração Beta', equipment: 'Painel Elétrico Leste', date: '21 Out 2023, 16:00', status: 'Crítico' },
];

export const DashboardPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignedMessage, setAssignedMessage] = useState('');
  const menuRef = useRef(null);

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

  return (
    <>
      <div className="page-title-wrap">
        <h1>Dashboard</h1>
        <p>Visão geral operacional e acompanhamento de campo.</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Inspeções Concluídas"
          value="1,284"
          footerText="+5.2% vs mês anterior"
          type="positive"
          icon="✓"
        />
        <StatCard
          title="Taxa de Não Conformidade"
          value="12.5%"
          footerText="Atenção requerida"
          type="warning"
          icon="!"
        />
        <StatCard
          title="Técnicos em Campo"
          value="42"
          footerText="● Status ativo"
          type="positive"
          icon="◌"
        />
        <StatCard
          title="Inspeções Atrasadas"
          value="15"
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
                {[65, 95, 72, 125, 105, 155, 142].map((value, index) => (
                  <div key={index} className="bar-column">
                    <div className="bar" style={{ height: `${(value / 200) * 100}%` }} />
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
        title="Acompanhamento de Não Conformidades"
        columns={columns}
        data={rows}
        totalCount={24}
        currentPage={1}
        onRowAction={(row) => alert(`Detalhes de: ${row.equipment}`)}
        onFilterClick={() => alert('Filtro acionado')}
        onExportClick={() => alert('Exportação iniciada')}
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
