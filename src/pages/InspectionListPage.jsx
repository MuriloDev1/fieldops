import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import { inspections } from '../data/mockData';

export default function InspectionListPage({ onOpenInspectionFlow, onNavigate }) {
  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Operação</span>
          <h1>Lista de inspeções</h1>
        </div>
        <Button onClick={() => onOpenInspectionFlow()}>Executar</Button>
      </div>

      <div className="toolbar-row">
        <Input value="" onChange={() => {}} placeholder="Buscar por código, equipamento ou técnico" className="search-inline" />
        <Select value="" onChange={() => {}} options={[{ value: 'all', label: 'Todos os status' }, { value: 'conforme', label: 'Conforme' }, { value: 'pending', label: 'Pendente' }, { value: 'progress', label: 'Em andamento' }, { value: 'nonconform', label: 'Não conforme' }]} />
      </div>

      <div className="table-wrapper card-table">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Equipamento</th>
              <th>Técnico</th>
              <th>Data</th>
              <th>Status</th>
              <th>Prioridade</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {inspections.map((inspection) => (
              <tr key={inspection.id}>
                <td>{inspection.id}</td>
                <td>{inspection.name}</td>
                <td>{inspection.equipment}</td>
                <td>{inspection.technician}</td>
                <td>{inspection.date}</td>
                <td><Badge tone={inspection.status === 'Não conforme' ? 'danger' : inspection.status === 'Em andamento' ? 'info' : inspection.status === 'Pendente' ? 'warning' : inspection.status === 'Cancelado' ? 'slate' : 'success'}>{inspection.status}</Badge></td>
                <td>{inspection.priority}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" className="link-button" onClick={() => onNavigate('dashboard')}>Detalhes</button>
                    <button type="button" className="link-button" onClick={() => onOpenInspectionFlow(inspection)}>Abrir</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
