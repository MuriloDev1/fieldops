import { useState, useEffect } from 'react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { equipment as mockEquipment } from '../data/mockData';
import { equipmentApi } from '../core/services/api';

export default function EquipmentPage() {
  const [items, setItems] = useState(mockEquipment);

  useEffect(() => {
    equipmentApi.getAll()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Format to equipment card schema
          const mapped = data.map((eq) => ({
            id: eq.qrCode || eq.id,
            name: eq.name,
            type: eq.model || eq.type || 'Equipamento Industrial',
            location: eq.siteName || eq.location || 'Planta Principal',
            status: eq.status === 'ACTIVE' ? 'Operando' : eq.status === 'INACTIVE' ? 'Alerta' : 'Em manutenção',
            lastInspection: 'Recente',
            nextInspection: 'Em 15 dias',
          }));
          setItems(mapped);
        }
      })
      .catch((err) => console.warn('Usando dados de fallback para equipamentos:', err));
  }, []);

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
        {items.map((item) => (
          <article key={item.id} className="equipment-card">
            <div className="equipment-header">
              <div>
                <strong>{item.name}</strong>
                <span>{item.id}</span>
              </div>
              <Badge tone={item.status === 'Operando' ? 'success' : item.status === 'Alerta' ? 'warning' : 'slate'}>
                {item.status}
              </Badge>
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

export { EquipmentPage };
