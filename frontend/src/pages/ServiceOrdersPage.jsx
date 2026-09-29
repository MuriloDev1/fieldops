import Badge from '../components/Badge';
import { serviceOrders } from '../data/mockData';

export default function ServiceOrdersPage() {
  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Planejamento</span>
          <h1>Ordens de serviço</h1>
        </div>
      </div>

      <div className="table-wrapper card-table">
        <table>
          <thead>
            <tr>
              <th>Número</th>
              <th>Descrição</th>
              <th>Equipamento</th>
              <th>Responsável</th>
              <th>Prioridade</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {serviceOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.description}</td>
                <td>{order.equipment}</td>
                <td>{order.responsible}</td>
                <td>{order.priority}</td>
                <td><Badge tone={order.status === 'Aberta' ? 'warning' : order.status === 'Em andamento' ? 'info' : order.status === 'Concluída' ? 'success' : 'slate'}>{order.status}</Badge></td>
                <td>{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
