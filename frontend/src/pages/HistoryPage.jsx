import { useMemo, useState } from 'react';
import Badge from '../components/Badge';
import Input from '../components/Input';
import Select from '../components/Select';
import { inspectionHistory } from '../data/mockData';

export default function HistoryPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const filtered = useMemo(() => {
    return inspectionHistory.filter((item) => {
      const matchSearch = `${item.equipment} ${item.technician}`.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !status || item.status === status;
      return matchSearch && matchStatus;
    });
  }, [search, status]);

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Histórico</span>
          <h1>Histórico de inspeções</h1>
        </div>
      </div>

      <div className="toolbar-row">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por equipamento ou técnico" className="search-inline" />
        <Select value={status} onChange={(event) => setStatus(event.target.value)} options={[{ value: '', label: 'Todos os status' }, { value: 'Conforme', label: 'Conforme' }, { value: 'Não conforme', label: 'Não conforme' }, { value: 'Pendente', label: 'Pendente' }, { value: 'Concluído', label: 'Concluído' }]} />
      </div>

      <div className="table-wrapper card-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Equipamento</th>
              <th>Técnico</th>
              <th>Data</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.equipment}</td>
                <td>{item.technician}</td>
                <td>{item.date}</td>
                <td><Badge tone={item.status === 'Não conforme' ? 'danger' : item.status === 'Pendente' ? 'warning' : item.status === 'Concluído' ? 'success' : 'info'}>{item.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
