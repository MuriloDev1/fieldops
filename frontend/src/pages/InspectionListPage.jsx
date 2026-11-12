import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import EmptyState from '../components/EmptyState';
import { useToast } from '../core/context/ToastContext';
import { inspections } from '../data/mockData';

const statusTone = (status) =>
  status === 'Não conforme' ? 'danger' : status === 'Em andamento' ? 'info' : status === 'Pendente' ? 'warning' : status === 'Cancelado' ? 'slate' : 'success';

const statusFilters = ['Conforme', 'Pendente', 'Em andamento', 'Não conforme', 'Concluído', 'Cancelado'];
const normalize = (text) => String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function InspectionListPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const filtered = inspections.filter((item) => {
    const term = normalize(search);
    const matchesText =
      !term || [item.id, item.name, item.equipment, item.technician].some((value) => normalize(value).includes(term));
    return matchesText && (!status || item.status === status);
  });

  const openFlow = (inspection) => navigate('/inspection-flow', { state: { inspection, from: '/inspections' } });

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Operação</span>
          <h1>Lista de inspeções</h1>
        </div>
        <Button onClick={() => openFlow()}>Executar</Button>
      </div>

      <div className="toolbar-row">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por código, equipamento ou técnico" className="search-inline" />
        <Select value={status} onChange={(event) => setStatus(event.target.value)} options={statusFilters} placeholder="Todos os status" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nenhuma inspeção encontrada" description="Ajuste a busca ou o filtro de status." />
      ) : (
        <div className="table-wrapper card-table panel">
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
              {filtered.map((inspection) => (
                <tr key={inspection.id}>
                  <td>{inspection.id}</td>
                  <td>{inspection.name}</td>
                  <td>{inspection.equipment}</td>
                  <td>{inspection.technician}</td>
                  <td>{inspection.date}</td>
                  <td><Badge tone={statusTone(inspection.status)}>{inspection.status}</Badge></td>
                  <td>{inspection.priority}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" className="link-button" onClick={() => navigate('/history')}>Histórico</button>
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => (inspection.status === 'Cancelado' ? toast.info('Inspeção cancelada não pode ser executada.') : openFlow(inspection))}
                      >
                        Abrir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
