import { useState, useEffect, useMemo } from 'react';
import Badge from '../components/Badge';
import Input from '../components/Input';
import Select from '../components/Select';
import { InspectionTimeline } from '../shared/components/InspectionTimeline';
import { inspectionsApi } from '../core/services/api';
import { History, ShieldCheck, Search } from 'lucide-react';

const fallbackInspections = [
  {
    id: 'INS-8001',
    templateTitle: 'Checklist Preventivo de Bomba Hidráulica',
    clientName: 'Petrobras S.A.',
    siteName: 'Refinaria RPBC',
    equipmentName: 'Bomba Centrífuga KSB 01',
    technicianName: 'Carlos Lima',
    scheduledDate: '2026-10-02',
    priority: 'Alta',
    status: 'IN_PROGRESS',
    statusLabel: 'Em Andamento',
    itemsCount: 10,
    answeredCount: 4,
    nonConformityCount: 0,
    tone: 'info'
  },
  {
    id: 'INS-8002',
    templateTitle: 'Inspeção Elétrica de Subestação',
    clientName: 'Vale S.A.',
    siteName: 'Terminal Portuário de Tubarão',
    equipmentName: 'Painel Elétrico CCM-02',
    technicianName: 'Carlos Lima',
    scheduledDate: '2026-10-05',
    priority: 'Crítica',
    status: 'SCHEDULED',
    statusLabel: 'Agendada',
    itemsCount: 15,
    answeredCount: 0,
    nonConformityCount: 0,
    tone: 'warning'
  },
  {
    id: 'INS-8003',
    templateTitle: 'Checklist de Segurança e Válvulas',
    clientName: 'Klabin',
    siteName: 'Fábrica Monte Alegre',
    equipmentName: 'Caldeira de Alta Pressão 03',
    technicianName: 'Carlos Lima',
    scheduledDate: '2026-09-28',
    priority: 'Alta',
    status: 'SUBMITTED',
    statusLabel: 'Em Revisão',
    itemsCount: 12,
    answeredCount: 12,
    nonConformityCount: 1,
    tone: 'info'
  },
  {
    id: 'INS-8004',
    templateTitle: 'Inspeção de Compressores Industriais',
    clientName: 'Petrobras S.A.',
    siteName: 'Refinaria Central',
    equipmentName: 'Válvula de Pressão B',
    technicianName: 'Carlos Lima',
    scheduledDate: '2026-09-26',
    priority: 'Média',
    status: 'APPROVED',
    statusLabel: 'Aprovada',
    itemsCount: 8,
    answeredCount: 8,
    nonConformityCount: 0,
    tone: 'success'
  },
  {
    id: 'INS-8005',
    templateTitle: 'Inspeção Periódica de Parafuso',
    clientName: 'Vale S.A.',
    siteName: 'Planta de Processamento Carajás',
    equipmentName: 'Compressor Principal',
    technicianName: 'Carlos Lima',
    scheduledDate: '2026-09-24',
    priority: 'Alta',
    status: 'REJECTED',
    statusLabel: 'Reprovada',
    itemsCount: 10,
    answeredCount: 10,
    nonConformityCount: 2,
    tone: 'danger'
  }
];

export function HistoryPage() {
  const [inspectionsList, setInspectionsList] = useState(fallbackInspections);
  const [selectedInspection, setSelectedInspection] = useState(fallbackInspections[0]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadInspections() {
      try {
        setLoading(true);
        const data = await inspectionsApi.getAll();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item) => ({
            id: item.id,
            templateTitle: item.templateTitle || item.templateVersionTitle || item.title || 'Inspeção de Campo',
            clientName: item.clientName || 'Cliente Industrial',
            siteName: item.siteName || 'Planta Operacional',
            equipmentName: item.equipmentName || 'Equipamento',
            technicianName: item.technicianName || 'Carlos Lima',
            scheduledDate: item.scheduledDate || (item.scheduledFor ? item.scheduledFor.substring(0, 10) : '2026-10-01'),
            priority: item.priority || 'Média',
            status: item.status,
            statusLabel: mapStatusLabel(item.status),
            itemsCount: item.itemsCount ?? item.items?.length ?? 10,
            answeredCount: item.answeredCount ?? 0,
            nonConformityCount: item.nonConformityCount ?? item.nonConformitiesCount ?? 0,
            tone: mapStatusTone(item.status)
          }));
          setInspectionsList(mapped);
          setSelectedInspection(mapped[0]);
        }
      } catch (err) {
        console.warn('[HistoryPage] Usando lista padrão de demonstração:', err);
      } finally {
        setLoading(false);
      }
    }

    loadInspections();
  }, []);

  function mapStatusLabel(status) {
    switch (status) {
      case 'ASSIGNED':
      case 'SCHEDULED': return 'Agendada';
      case 'IN_PROGRESS': return 'Em Andamento';
      case 'SUBMITTED':
      case 'UNDER_REVIEW': return 'Em Revisão';
      case 'APPROVED': return 'Aprovada';
      case 'REJECTED': return 'Reprovada';
      case 'CANCELED':
      case 'CANCELLED': return 'Cancelada';
      default: return status || 'Pendente';
    }
  }

  function mapStatusTone(status) {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'danger';
      case 'ASSIGNED':
      case 'SCHEDULED': return 'warning';
      case 'IN_PROGRESS':
      case 'SUBMITTED':
      case 'UNDER_REVIEW': return 'info';
      default: return 'slate';
    }
  }

  const filtered = useMemo(() => {
    return inspectionsList.filter((item) => {
      const q = search.toLowerCase();
      const matchSearch =
        String(item.id).toLowerCase().includes(q) ||
        (item.equipmentName || '').toLowerCase().includes(q) ||
        (item.technicianName || '').toLowerCase().includes(q) ||
        (item.clientName || '').toLowerCase().includes(q) ||
        (item.templateTitle || '').toLowerCase().includes(q);

      const matchStatus = !statusFilter || item.status === statusFilter || (statusFilter === 'SCHEDULED' && item.status === 'ASSIGNED');
      return matchSearch && matchStatus;
    });
  }, [inspectionsList, search, statusFilter]);

  return (
    <div className="history-page" style={{ padding: '0 0 2rem 0' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <span className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={14} color="#38bdf8" /> Rastreabilidade & Governança (RN-086)
          </span>
          <h1 style={{ margin: '0.25rem 0 0.5rem 0' }}>Histórico do Ciclo de Vida das Inspeções</h1>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
            Consulte a linha do tempo completa de mudanças de estado com auditoria de quem, quando e ações executadas (Task #51).
          </p>
        </div>
      </div>

      <div className="toolbar-row" style={{ marginBottom: '1.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por código, equipamento, cliente ou técnico..."
          className="search-inline"
        />
        <Select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          options={[
            { value: '', label: 'Todos os status' },
            { value: 'SCHEDULED', label: 'Agendada' },
            { value: 'IN_PROGRESS', label: 'Em Andamento' },
            { value: 'SUBMITTED', label: 'Em Revisão' },
            { value: 'APPROVED', label: 'Aprovada' },
            { value: 'REJECTED', label: 'Reprovada' },
            { value: 'CANCELED', label: 'Cancelada' }
          ]}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(320px, 1fr) minmax(380px, 1.2fr)',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        {/* Painel Esquerdo: Listagem de Inspeções */}
        <div style={{
          backgroundColor: '#0f172a',
          borderRadius: '12px',
          border: '1px solid #334155',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#1e293b'
          }}>
            <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>
              Inspeções Registradas ({filtered.length})
            </strong>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Selecione para ver a auditoria
            </span>
          </div>

          <div style={{ maxHeight: '650px', overflowY: 'auto' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                <Search size={28} style={{ margin: '0 auto 0.5rem auto', color: '#64748b' }} />
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Nenhuma inspeção encontrada com os filtros aplicados.</p>
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected = selectedInspection?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedInspection(item)}
                    style={{
                      padding: '1rem 1.25rem',
                      borderBottom: '1px solid #1e293b',
                      backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                      borderLeft: isSelected ? '4px solid #38bdf8' : '4px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8' }}>
                        {item.id}
                      </span>
                      <Badge tone={item.tone}>{item.statusLabel}</Badge>
                    </div>

                    <h4 style={{ margin: '0 0 0.35rem 0', color: '#f8fafc', fontSize: '0.95rem' }}>
                      {item.templateTitle}
                    </h4>

                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
                      <div><strong>Ativo:</strong> {item.equipmentName}</div>
                      <div><strong>Cliente:</strong> {item.clientName} ({item.siteName})</div>
                      <div><strong>Técnico:</strong> {item.technicianName} • {item.scheduledDate}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Painel Direito: Linha do Tempo / Trilha de Auditoria */}
        <div style={{
          backgroundColor: '#0f172a',
          borderRadius: '12px',
          border: '1px solid #334155',
          padding: '1.25rem',
          position: 'sticky',
          top: '1rem'
        }}>
          {selectedInspection ? (
            <div>
              {/* Header da Inspeção Selecionada */}
              <div style={{
                backgroundColor: '#1e293b',
                padding: '1rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid #334155',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>ID: {selectedInspection.id}</span>
                  <Badge tone={selectedInspection.tone}>{selectedInspection.statusLabel}</Badge>
                </div>
                <h3 style={{ margin: '0 0 0.4rem 0', color: '#fff', fontSize: '1.1rem' }}>
                  {selectedInspection.templateTitle}
                </h3>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span><strong>Equipamento:</strong> {selectedInspection.equipmentName}</span>
                  <span><strong>Cliente:</strong> {selectedInspection.clientName}</span>
                </div>
              </div>

              {/* Componente de Linha do Tempo com dados reais/auditados */}
              <InspectionTimeline
                key={selectedInspection.id}
                inspectionId={selectedInspection.id}
                inspectionData={selectedInspection}
              />
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <History size={36} style={{ margin: '0 auto 0.75rem auto', color: '#64748b' }} />
              <h4 style={{ color: '#cbd5e1', margin: '0 0 0.5rem 0' }}>Selecione uma inspeção</h4>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                Clique em qualquer item da lista à esquerda para carregar sua linha do tempo completa e os eventos de auditoria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;
