import Badge from '../components/Badge';
import Card from '../components/Card';
import Button from '../components/Button';
import { dashboardMetrics, inspections } from '../data/mockData';

export default function DashboardPage({ onNavigate, onOpenInspectionFlow }) {
  const metricCards = dashboardMetrics;
  const itemList = inspections.slice(0, 4);

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Visão geral</span>
          <h1>Dashboard</h1>
        </div>
        <Button onClick={() => onNavigate('inspections')}>Ver inspeções</Button>
      </div>

      <div className="stats-grid">
        {metricCards.map((metric) => (
          <Card key={metric.label} className={`metric-card ${metric.tone}`}>
            <div className="metric-top">
              <span>{metric.label}</span>
              <span className="metric-bullet" />
            </div>
            <strong>{metric.value}</strong>
            <small>{metric.delta}</small>
          </Card>
        ))}
      </div>

      <div className="two-column">
        <Card title="Andamento semanal" className="chart-panel">
          <div className="chart-wrap">
            <div className="chart-bars">
              {[42, 58, 78, 48, 90, 74, 100].map((height, idx) => (
                <div className="bar-block" key={idx}>
                  <div className="bar" style={{ height: `${height}%` }} />
                  <span>{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][idx]}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card title="Ações rápidas" className="quick-panel">
          <div className="quick-actions">
            <button type="button" onClick={() => onNavigate('equipment')}>Equipamentos</button>
            <button type="button" onClick={() => onNavigate('orders')}>Ordens</button>
            <button type="button" onClick={() => onOpenInspectionFlow()}>Executar inspeção</button>
          </div>
        </Card>
      </div>

      <Card title="Inspeções recentes" actions={<Button variant="ghost" size="sm" onClick={() => onNavigate('inspections')}>Abrir lista</Button>}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Equipamento</th>
                <th>Técnico</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {itemList.map((inspection) => (
                <tr key={inspection.id}>
                  <td>{inspection.id}</td>
                  <td>{inspection.equipment}</td>
                  <td>{inspection.technician}</td>
                  <td><Badge tone={inspection.status === 'Não conforme' ? 'danger' : inspection.status === 'Em andamento' ? 'info' : inspection.status === 'Pendente' ? 'warning' : 'success'}>{inspection.status}</Badge></td>
                  <td><button type="button" className="link-button" onClick={() => onOpenInspectionFlow(inspection)}>Detalhes</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
