import Badge from '../components/Badge';
import { nonConformities } from '../data/mockData';

export default function NonConformitiesPage() {
  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Controle</span>
          <h1>Não conformidades</h1>
        </div>
      </div>

      <div className="table-wrapper card-table">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Descrição</th>
              <th>Equipamento</th>
              <th>Técnico</th>
              <th>Data</th>
              <th>Prioridade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {nonConformities.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.description}</td>
                <td>{item.equipment}</td>
                <td>{item.technician}</td>
                <td>{item.date}</td>
                <td>{item.priority}</td>
                <td><Badge tone={item.status === 'Aberta' ? 'danger' : item.status === 'Em andamento' ? 'info' : item.status === 'Resolvida' ? 'success' : 'slate'}>{item.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
