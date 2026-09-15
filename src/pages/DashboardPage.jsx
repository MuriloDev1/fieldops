import { StatCard } from '../shared/components/StatCard';
import { DataTable } from '../shared/components/DataTable';

const quickItems = [
  { label: 'Bomba Submersa 04', detail: 'Falha crítica reportada', status: 'danger' },
  { label: 'Válvula de Pressão B', detail: 'Manutenção atrasada há 2 dias', status: 'warning' },
  { label: 'Relatório Diário', detail: 'Pendente aprovação do supervisor', status: 'info' },
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
            <button type="button" className="menu-button">⋮</button>
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

                <button type="button" className="link-button">Ver</button>
              </div>
            ))}
          </div>

          <button type="button" className="primary-button">Atribuir Tarefas</button>
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
    </>
  );
};
