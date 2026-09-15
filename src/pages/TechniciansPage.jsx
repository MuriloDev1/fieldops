import Badge from '../components/Badge';
import Button from '../components/Button';
import { technicians } from '../data/mockData';

export default function TechniciansPage() {
  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Equipe</span>
          <h1>Técnicos</h1>
        </div>
        <Button>Adicionar técnico</Button>
      </div>

      <div className="list-grid technicians-grid">
        {technicians.map((tech) => (
          <article key={tech.id} className="tech-card">
            <div className="tech-avatar">{tech.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
            <div className="tech-content">
              <div className="tech-head">
                <strong>{tech.name}</strong>
                <Badge tone={tech.status === 'Disponível' ? 'success' : 'warning'}>{tech.status}</Badge>
              </div>
              <span>{tech.email}</span>
              <div className="tech-stats">
                <div><label>Inspeções</label><strong>{tech.inspectionsDone}</strong></div>
                <div><label>Pendentes</label><strong>{tech.pending}</strong></div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
