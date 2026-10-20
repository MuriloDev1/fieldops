import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { inspections } from '../data/mockData';

export default function MyInspectionsPage({ onOpenInspectionFlow, onNavigate }) {
  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Fluxo técnico</span>
          <h1>Minhas inspeções</h1>
        </div>
        <Button onClick={() => onOpenInspectionFlow()}>Nova execução</Button>
      </div>

      <div className="toolbar-row">
        <Input value="" onChange={() => {}} placeholder="Buscar inspeção" className="search-inline" />
        <Select value="" onChange={() => {}} options={[{ value: 'all', label: 'Todos os status' }, { value: 'pending', label: 'Pendentes' }, { value: 'running', label: 'Em andamento' }, { value: 'done', label: 'Concluídas' }]} />
      </div>

      <div className="list-grid">
        {inspections.map((inspection) => (
          <article key={inspection.id} className="inspection-card">
            <div className="inspection-card-header">
              <div>
                <strong>{inspection.id}</strong>
                <span>{inspection.name}</span>
              </div>
              <Badge tone={inspection.status === 'Não conforme' ? 'danger' : inspection.status === 'Em andamento' ? 'info' : inspection.status === 'Pendente' ? 'warning' : 'success'}>{inspection.status}</Badge>
            </div>

            <div className="inspection-meta">
              <div><label>Equipamento</label><strong>{inspection.equipment}</strong></div>
              <div><label>Data</label><strong>{inspection.date}</strong></div>
              <div><label>Prioridade</label><strong>{inspection.priority}</strong></div>
            </div>

            <div className="inspection-actions">
              <Button variant="secondary" size="sm" onClick={() => onNavigate('inspections')}>Detalhes</Button>
              <Button size="sm" onClick={() => onOpenInspectionFlow(inspection)}>Executar</Button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
