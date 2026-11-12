import { useState } from 'react';
import Badge from '../components/Badge';
import Input from '../components/Input';
import Select from '../components/Select';
import EmptyState from '../components/EmptyState';
import { serviceOrders } from '../data/mockData';

const statusTone = (status) =>
  status === 'Aberta' ? 'warning' : status === 'Em andamento' ? 'info' : status === 'Concluída' ? 'success' : 'slate';

const normalize = (text) => String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function ServiceOrdersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const filtered = serviceOrders.filter((order) => {
    const term = normalize(search);
    const matchesText =
      !term || [order.id, order.description, order.equipment, order.responsible].some((value) => normalize(value).includes(term));
    return matchesText && (!status || order.status === status);
  });

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Planejamento</span>
          <h1>Ordens de serviço</h1>
        </div>
      </div>

      <div className="toolbar-row">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por número, equipamento ou responsável" className="search-inline" />
        <Select value={status} onChange={(event) => setStatus(event.target.value)} options={['Aberta', 'Em andamento', 'Concluída']} placeholder="Todos os status" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nenhuma ordem de serviço encontrada" description="Ajuste a busca ou o filtro de status." />
      ) : (
        <div className="table-wrapper card-table panel">
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
              {filtered.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.description}</td>
                  <td>{order.equipment}</td>
                  <td>{order.responsible}</td>
                  <td>{order.priority}</td>
                  <td><Badge tone={statusTone(order.status)}>{order.status}</Badge></td>
                  <td>{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
