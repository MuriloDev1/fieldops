import { useState, useEffect } from 'react';
import { DataTable } from '../shared/components/DataTable';
import { ModalDrawer } from '../shared/components/ModalDrawer';
import { StatusBadge } from '../shared/components/StatusBadge';
import { nonConformitiesApi } from '../core/services/api';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const fallbackNCs = [
  {
    id: 'NC-5001',
    description: 'Vazamento de óleo lubrificante detectado no selo mecânico da bomba',
    equipment: 'Bomba Centrífuga KSB 01',
    technician: 'Carlos Lima',
    date: '28/09/2026',
    severity: 'HIGH',
    status: 'OPEN',
  },
  {
    id: 'NC-5002',
    description: 'Temperatura excessiva no enrolamento do motor elétrico trifásico (88°C)',
    equipment: 'Compressor de Ar Schulz 02',
    technician: 'Carlos Lima',
    date: '25/09/2026',
    severity: 'CRITICAL',
    status: 'IN_PROGRESS',
  },
  {
    id: 'NC-5003',
    description: 'Lacre de segurança violado e ausência de etiqueta de calibração',
    equipment: 'Extintor CO2 10kg',
    technician: 'Carlos Lima',
    date: '20/09/2026',
    severity: 'MEDIUM',
    status: 'RESOLVED',
  }
];

const severityConfig = {
  LOW: { label: 'Baixa', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  MEDIUM: { label: 'Média', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  HIGH: { label: 'Alta', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' },
  CRITICAL: { label: 'Crítica', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
};

const statusConfig = {
  OPEN: { label: 'Aberta', badge: 'Crítico' },
  IN_PROGRESS: { label: 'Em Análise', badge: 'Atrasado' },
  RESOLVED: { label: 'Resolvida', badge: 'OK' },
  CANCELLED: { label: 'Cancelada', badge: 'Desativado' },
};

export const NonConformitiesPage = () => {
  const [items, setItems] = useState(fallbackNCs);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await nonConformitiesApi.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setItems(data);
      }
    } catch (err) {
      console.warn('Usando dados de fallback para não conformidades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const updated = await nonConformitiesApi.updateStatus(id, newStatus);
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)));
      if (selectedItem?.id === id) {
        setSelectedItem((prev) => ({ ...prev, status: newStatus }));
      }
      alert(`Status atualizado para: ${statusConfig[newStatus]?.label || newStatus}`);
    } catch (err) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  const columns = [
    {
      header: 'Código',
      key: 'id',
      render: (val) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#f87171' }}>
          {val ? (val.length > 8 ? val.substring(0, 8) + '...' : val) : '-'}
        </span>
      ),
    },
    {
      header: 'Descrição do Problema',
      key: 'description',
      render: (val) => (
        <div style={{ maxWidth: '380px', color: '#f8fafc', fontWeight: 500 }}>
          {val}
        </div>
      ),
    },
    {
      header: 'Severidade',
      key: 'severity',
      render: (val) => {
        const s = severityConfig[val] || { label: val || 'Média', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
        return (
          <span
            style={{
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: s.color,
              backgroundColor: s.bg,
            }}
          >
            {s.label}
          </span>
        );
      },
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => {
        const conf = statusConfig[val] || { label: val, badge: 'Pendente' };
        return <StatusBadge status={conf.badge} />;
      },
    },
    {
      header: 'Data de Registro',
      key: 'createdAt',
      render: (val, row) => (val ? new Date(val).toLocaleDateString('pt-BR') : row.date || '-'),
    },
  ];

  return (
    <>
      <div className="page-title-wrap">
        <h1>Não Conformidades & Apontamentos</h1>
        <p>Acompanhamento de desvios operacionais detectados durante inspeções em campo.</p>
      </div>

      <DataTable
        title="Ocorrências Registradas"
        columns={columns}
        data={items}
        totalCount={items.length}
        currentPage={1}
        onRowAction={(row) => setSelectedItem(row)}
      />

      {/* Drawer: Detalhes e Tratamento da Não Conformidade */}
      <ModalDrawer
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Tratamento da Não Conformidade"
      >
        {selectedItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>ID: {selectedItem.id}</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: severityConfig[selectedItem.severity]?.bg || 'rgba(239, 68, 68, 0.2)',
                    color: severityConfig[selectedItem.severity]?.color || '#ef4444',
                  }}
                >
                  Severidade: {severityConfig[selectedItem.severity]?.label || selectedItem.severity}
                </span>
              </div>
              <p style={{ margin: '0.5rem 0', color: '#fff', fontSize: '0.95rem', lineHeight: 1.5 }}>
                {selectedItem.description}
              </p>
              {selectedItem.equipment && (
                <p style={{ margin: '0.5rem 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                  Ativo Afetado: <strong style={{ color: '#cbd5e1' }}>{selectedItem.equipment}</strong>
                </p>
              )}
            </div>

            <div style={{ borderTop: '1px solid #334155', paddingTop: '1rem' }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#cbd5e1', fontSize: '0.9rem' }}>
                Alterar Status do Apontamento
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedItem.id, 'IN_PROGRESS')}
                  style={{
                    padding: '0.625rem',
                    backgroundColor: '#0284c7',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Em Tratamento
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(selectedItem.id, 'RESOLVED')}
                  style={{
                    padding: '0.625rem',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Concluir / Resolver
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalDrawer>
    </>
  );
};

export default NonConformitiesPage;
