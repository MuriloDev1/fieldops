import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../core/context/AuthContext';
import { inspections } from '../data/mockData';

const statusTone = (status) =>
  status === 'Não conforme' ? 'danger' : status === 'Em andamento' ? 'info' : status === 'Pendente' ? 'warning' : status === 'Cancelado' ? 'slate' : 'success';

const statusFilters = [
  { value: 'Pendente', label: 'Pendentes' },
  { value: 'Em andamento', label: 'Em andamento' },
  { value: 'Conforme', label: 'Conformes' },
  { value: 'Não conforme', label: 'Não conformes' },
  { value: 'Concluído', label: 'Concluídas' },
];

const normalize = (text) => String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function MyInspectionsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const firstName = (user?.name || '').split(' ')[0];

  // Técnicos veem apenas as próprias inspeções; sem correspondência, exibe a lista completa de demonstração.
  const mine = useMemo(() => {
    const own = inspections.filter((item) => firstName && normalize(item.technician).startsWith(normalize(firstName)));
    return own.length > 0 ? own : inspections;
  }, [firstName]);

  const filtered = mine.filter((item) => {
    const term = normalize(search);
    const matchesText = !term || [item.id, item.name, item.equipment].some((value) => normalize(value).includes(term));
    return matchesText && (!status || item.status === status);
  });

  const openFlow = (inspection) => navigate('/inspection-flow', { state: { inspection, from: '/my-inspections' } });

  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Fluxo técnico</span>
          <h1>Minhas inspeções</h1>
        </div>
        <Button onClick={() => openFlow()}>Nova execução</Button>
      </div>

      <div className="toolbar-row">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar inspeção" className="search-inline" />
        <Select value={status} onChange={(event) => setStatus(event.target.value)} options={statusFilters} placeholder="Todos os status" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Nenhuma inspeção encontrada" description="Ajuste a busca ou o filtro de status para ver outras inspeções." />
      ) : (
        <div className="list-grid">
          {filtered.map((inspection) => (
            <article key={inspection.id} className="inspection-card">
              <div className="inspection-card-header">
                <div>
                  <strong>{inspection.id}</strong>
                  <span>{inspection.name}</span>
                </div>
                <Badge tone={statusTone(inspection.status)}>{inspection.status}</Badge>
              </div>

              <div className="inspection-meta">
                <div><label>Equipamento</label><strong>{inspection.equipment}</strong></div>
                <div><label>Data</label><strong>{inspection.date}</strong></div>
                <div><label>Prioridade</label><strong>{inspection.priority}</strong></div>
              </div>

              <div className="inspection-actions">
                <Button variant="secondary" size="sm" onClick={() => navigate('/equipment')}>Equipamento</Button>
                <Button size="sm" onClick={() => openFlow(inspection)} disabled={inspection.status === 'Cancelado'}>Executar</Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
