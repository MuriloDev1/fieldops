import Badge from '../components/Badge';
import Button from '../components/Button';
import { equipment } from '../data/mockData';

export default function EquipmentPage() {
  return (
    <>
      <div className="page-header">
        <div>
          <span className="eyebrow">Ativos</span>
          <h1>Equipamentos</h1>
        </div>
        <Button>Adicionar equipamento</Button>
      </div>

      <div className="list-grid equipment-grid">
        {equipment.map((item) => (
          <article key={item.id} className="equipment-card">
            <div className="equipment-header">
              <div>
                <strong>{item.name}</strong>
                <span>{item.id}</span>
              </div>
              <Badge tone={item.status === 'Operando' ? 'success' : item.status === 'Alerta' ? 'warning' : 'slate'}>{item.status}</Badge>
            </div>
            <div className="equipment-meta">
              <div><label>Tipo</label><strong>{item.type}</strong></div>
              <div><label>Localização</label><strong>{item.location}</strong></div>
              <div><label>Última inspeção</label><strong>{item.lastInspection}</strong></div>
              <div><label>Próxima inspeção</label><strong>{item.nextInspection}</strong></div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
