import { useState, useEffect } from 'react';
import { DataTable } from '../shared/components/DataTable';
import { ModalDrawer } from '../shared/components/ModalDrawer';
import { StatusBadge } from '../shared/components/StatusBadge';
import {
  inspectionsApi,
  clientsApi,
  sitesApi,
  equipmentApi,
  templatesApi,
  usersApi,
  reviewsApi
} from '../core/services/api';
import { Plus, CheckCircle2, XCircle, Play, Eye } from 'lucide-react';

const priorityTones = {
  LOW: { label: 'Baixa', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  MEDIUM: { label: 'Média', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  HIGH: { label: 'Alta', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' },
  CRITICAL: { label: 'Crítica', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
};

const statusLabels = {
  SCHEDULED: 'Agendada',
  IN_PROGRESS: 'Em Andamento',
  SUBMITTED: 'Em Revisão',
  APPROVED: 'Aprovada',
  REJECTED: 'Reprovada',
  CANCELLED: 'Cancelada',
};

const initialFallbackInspections = [
  {
    id: 'INS-8001',
    templateTitle: 'Checklist Preventivo de Bomba Hidráulica',
    clientName: 'Petrobras',
    siteName: 'Refinaria RPBC',
    equipmentName: 'Bomba Centrífuga KSB 01',
    technicianName: 'Carlos Lima',
    scheduledDate: '2026-10-02',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    itemsCount: 10,
    answeredCount: 4,
    nonConformityCount: 0,
    conformanceRate: 100.0,
  },
  {
    id: 'INS-8002',
    templateTitle: 'Inspeção Elétrica de Subestação',
    clientName: 'Vale S.A.',
    siteName: 'Terminal Portuário de Tubarão',
    equipmentName: 'Painel Elétrico CCM-02',
    technicianName: 'Carlos Lima',
    scheduledDate: '2026-10-05',
    priority: 'CRITICAL',
    status: 'SCHEDULED',
    itemsCount: 15,
    answeredCount: 0,
    nonConformityCount: 0,
    conformanceRate: 0,
  },
  {
    id: 'INS-8003',
    templateTitle: 'Checklist de Segurança e Válvulas',
    clientName: 'Klabin',
    siteName: 'Fábrica Monte Alegre',
    equipmentName: 'Caldeira de Alta Pressão 03',
    technicianName: 'Carlos Lima',
    scheduledDate: '2026-09-28',
    priority: 'HIGH',
    status: 'SUBMITTED',
    itemsCount: 12,
    answeredCount: 12,
    nonConformityCount: 1,
    conformanceRate: 91.6,
  }
];

export const OperationsPage = () => {
  const [inspections, setInspections] = useState(initialFallbackInspections);
  const [clients, setClients] = useState([]);
  const [sites, setSites] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);

  // Drawers & Modals
  const [isNewDrawerOpen, setIsNewDrawerOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [reviewReason, setReviewReason] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    clientId: '',
    siteId: '',
    equipmentId: '',
    templateId: '',
    technicianId: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    priority: 'MEDIUM',
    notes: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [inspRes, cliRes, siteRes, eqRes, tmplRes, usrRes] = await Promise.all([
        inspectionsApi.getAll().catch(() => null),
        clientsApi.getAll().catch(() => null),
        sitesApi.getAll().catch(() => null),
        equipmentApi.getAll().catch(() => null),
        templatesApi.getAll().catch(() => null),
        usersApi.getAll().catch(() => null),
      ]);

      if (Array.isArray(inspRes) && inspRes.length > 0) {
        setInspections(inspRes);
      }
      if (Array.isArray(cliRes) && cliRes.length > 0) {
        setClients(cliRes);
        if (!formData.clientId) {
          setFormData((prev) => ({ ...prev, clientId: cliRes[0].id }));
        }
      }
      if (Array.isArray(siteRes)) setSites(siteRes);
      if (Array.isArray(eqRes)) setEquipmentList(eqRes);
      if (Array.isArray(tmplRes)) {
        setTemplates(tmplRes);
        if (!formData.templateId && tmplRes[0]) {
          setFormData((prev) => ({ ...prev, templateId: tmplRes[0].id }));
        }
      }
      if (Array.isArray(usrRes)) {
        const techs = usrRes.filter((u) => u.role === 'TECHNICIAN' || u.role === 'SUPERVISOR');
        setTechnicians(techs.length > 0 ? techs : usrRes);
      }
    } catch (err) {
      console.warn('Erro ao carregar operações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter sites by selected client
  const filteredSites = sites.filter((s) => (s.clientId || s.customerId) === formData.clientId);

  // Filter equipment by selected site
  const filteredEquipment = equipmentList.filter(
    (e) => (e.siteId || e.locationId) === formData.siteId
  );

  const handleCreateInspection = async (e) => {
    e.preventDefault();
    if (!formData.clientId || !formData.siteId) {
      alert('Selecione ao menos o Cliente e o Local.');
      return;
    }

    try {
      const payload = {
        clientId: formData.clientId,
        siteId: formData.siteId,
        equipmentId: formData.equipmentId || null,
        technicianId: formData.technicianId || null,
        scheduledDate: formData.scheduledDate,
        priority: formData.priority,
        notes: formData.notes,
      };

      const created = await inspectionsApi.create(payload);
      setInspections((prev) => [created, ...prev]);
      setIsNewDrawerOpen(false);
      alert('Inspeção agendada com sucesso com checklist vinculado!');
    } catch (err) {
      alert('Erro ao agendar inspeção: ' + (err.message || 'Verifique os dados'));
    }
  };

  const handleStartInspection = async (id) => {
    try {
      const updated = await inspectionsApi.start(id);
      setInspections((prev) => prev.map((item) => (item.id === id ? updated : item)));
      if (selectedInspection?.id === id) setSelectedInspection(updated);
      alert('Inspeção iniciada com sucesso!');
    } catch (err) {
      alert('Erro ao iniciar: ' + err.message);
    }
  };

  const handleApprove = async (id) => {
    try {
      setIsReviewing(true);
      await reviewsApi.approve(id, reviewReason || 'Inspeção conforme, aprovada pelo supervisor.');
      alert('Inspeção APROVADA com sucesso!');
      setSelectedInspection(null);
      loadData();
    } catch (err) {
      alert('Erro ao aprovar: ' + err.message);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleReject = async (id) => {
    if (!reviewReason) {
      alert('O motivo da reprovação é obrigatório segundo a regra de conformidade.');
      return;
    }
    try {
      setIsReviewing(true);
      await reviewsApi.reject(id, reviewReason);
      alert('Inspeção REPROVADA e devolvida para correção.');
      setSelectedInspection(null);
      loadData();
    } catch (err) {
      alert('Erro ao reprovar: ' + err.message);
    } finally {
      setIsReviewing(false);
    }
  };

  const columns = [
    {
      header: 'Código',
      key: 'id',
      render: (val) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#38bdf8' }}>
          {val ? (val.length > 8 ? val.substring(0, 8) + '...' : val) : '-'}
        </span>
      ),
    },
    {
      header: 'Modelo de Checklist',
      key: 'templateTitle',
      render: (val, row) => (
        <div>
          <strong style={{ color: '#f8fafc', display: 'block' }}>{val || row.title || 'Checklist Padrão'}</strong>
          <small style={{ color: '#94a3b8' }}>{row.clientName} • {row.siteName}</small>
        </div>
      ),
    },
    {
      header: 'Equipamento',
      key: 'equipmentName',
      render: (val, row) => (
        <div>
          <span>{val || 'Inspeção de Área'}</span>
          {row.equipmentQrCode && (
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
              QR: {row.equipmentQrCode}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Técnico Responsável',
      key: 'technicianName',
      render: (val) => val || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Não atribuído</span>,
    },
    {
      header: 'Data Prevista',
      key: 'scheduledDate',
    },
    {
      header: 'Prioridade',
      key: 'priority',
      render: (val) => {
        const p = priorityTones[val] || { label: val || 'Média', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
        return (
          <span
            style={{
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: p.color,
              backgroundColor: p.bg,
            }}
          >
            {p.label}
          </span>
        );
      },
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => {
        let badgeStatus = 'Pendente';
        if (val === 'IN_PROGRESS') badgeStatus = 'Atrasado'; // tone warning
        if (val === 'SUBMITTED') badgeStatus = 'Em Revisão';
        if (val === 'APPROVED') badgeStatus = 'OK';
        if (val === 'REJECTED') badgeStatus = 'Crítico';
        if (val === 'CANCELLED') badgeStatus = 'Desativado';
        return <StatusBadge status={badgeStatus} />;
      },
    },
  ];

  return (
    <>
      <div className="page-title-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Operações & Inspeções em Campo</h1>
          <p>Ciclo completo de agendamento, checklists imutáveis e auditoria de campo.</p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewDrawerOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#0284c7',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.625rem 1.25rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Plus size={18} />
          Agendar Inspeção
        </button>
      </div>

      <DataTable
        title="Inspeções Registradas"
        columns={columns}
        data={inspections}
        totalCount={inspections.length}
        currentPage={1}
        onRowAction={(row) => setSelectedInspection(row)}
      />

      {/* Modal Drawer: Agendar Nova Inspeção */}
      <ModalDrawer
        isOpen={isNewDrawerOpen}
        onClose={() => setIsNewDrawerOpen(false)}
        title="Agendar Nova Inspeção"
      >
        <form onSubmit={handleCreateInspection} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Cliente *
            </label>
            <select
              required
              value={formData.clientId}
              onChange={(e) => {
                const cId = e.target.value;
                setFormData((prev) => ({ ...prev, clientId: cId, siteId: '', equipmentId: '' }));
              }}
              style={{
                width: '100%',
                padding: '0.625rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#fff',
              }}
            >
              <option value="">Selecione o cliente...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Local / Planta *
            </label>
            <select
              required
              value={formData.siteId}
              onChange={(e) => {
                const sId = e.target.value;
                setFormData((prev) => ({ ...prev, siteId: sId, equipmentId: '' }));
              }}
              style={{
                width: '100%',
                padding: '0.625rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#fff',
              }}
            >
              <option value="">Selecione a planta...</option>
              {filteredSites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.city || 'Principal'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Equipamento Alvo (Opcional se for inspeção predial)
            </label>
            <select
              value={formData.equipmentId}
              onChange={(e) => setFormData((prev) => ({ ...prev, equipmentId: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.625rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#fff',
              }}
            >
              <option value="">Nenhum (Inspeção geral da planta)</option>
              {filteredEquipment.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name} {eq.qrCode ? `[${eq.qrCode}]` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Modelo de Checklist *
            </label>
            <select
              value={formData.templateId}
              onChange={(e) => setFormData((prev) => ({ ...prev, templateId: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.625rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#fff',
              }}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
              {templates.length === 0 && <option value="">Checklist Padrão da Operação</option>}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Técnico Responsável
            </label>
            <select
              value={formData.technicianId}
              onChange={(e) => setFormData((prev) => ({ ...prev, technicianId: e.target.value }))}
              style={{
                width: '100%',
                padding: '0.625rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#fff',
              }}
            >
              <option value="">Atribuir depois</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.role})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Data Prevista *
              </label>
              <input
                type="date"
                required
                value={formData.scheduledDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, scheduledDate: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#fff',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
                Prioridade
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#fff',
                }}
              >
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
                <option value="CRITICAL">Crítica</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Observações / Instruções para o Técnico
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Ex: Utilizar EPI classe 4 e checar nível de lubrificante..."
              style={{
                width: '100%',
                padding: '0.625rem',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#fff',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsNewDrawerOpen(false)}
              style={{
                flex: 1,
                padding: '0.625rem',
                backgroundColor: '#334155',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '0.625rem',
                backgroundColor: '#0284c7',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Confirmar Agendamento
            </button>
          </div>
        </form>
      </ModalDrawer>

      {/* Modal Drawer: Detalhes e Ciclo de Revisão */}
      <ModalDrawer
        isOpen={!!selectedInspection}
        onClose={() => setSelectedInspection(null)}
        title="Detalhes da Inspeção"
      >
        {selectedInspection && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>ID: {selectedInspection.id}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#38bdf8' }}>
                  {statusLabels[selectedInspection.status] || selectedInspection.status}
                </span>
              </div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1.1rem' }}>
                {selectedInspection.templateTitle || 'Checklist Operacional'}
              </h3>
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.9rem' }}>
                {selectedInspection.clientName} • {selectedInspection.siteName}
              </p>
              {selectedInspection.equipmentName && (
                <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                  Ativo: {selectedInspection.equipmentName}
                </p>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ backgroundColor: '#0f172a', padding: '0.75rem', borderRadius: '6px' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Progresso Itens</span>
                <strong style={{ color: '#fff', fontSize: '1.1rem' }}>
                  {selectedInspection.answeredCount || 0} / {selectedInspection.itemsCount || 0}
                </strong>
              </div>
              <div style={{ backgroundColor: '#0f172a', padding: '0.75rem', borderRadius: '6px' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>Não Conformidades</span>
                <strong style={{ color: selectedInspection.nonConformityCount > 0 ? '#ef4444' : '#10b981', fontSize: '1.1rem' }}>
                  {selectedInspection.nonConformityCount || 0}
                </strong>
              </div>
            </div>

            {selectedInspection.status === 'SCHEDULED' && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid #334155', paddingTop: '1rem' }}>
                <p style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>
                  Esta inspeção está agendada e pronta para início em campo.
                </p>
                <button
                  type="button"
                  onClick={() => handleStartInspection(selectedInspection.id)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  <Play size={18} />
                  Iniciar Execução
                </button>
              </div>
            )}

            {selectedInspection.status === 'SUBMITTED' && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid #334155', paddingTop: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#fbbf24' }}>Revisão de Auditoria (Supervisor)</h4>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                  A inspeção foi finalizada pelo técnico e aguarda parecer formal. Se reprovada, a justificativa é obrigatória.
                </p>

                <textarea
                  rows={3}
                  value={reviewReason}
                  onChange={(e) => setReviewReason(e.target.value)}
                  placeholder="Parecer do supervisor ou motivo de reprovação..."
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#fff',
                    marginBottom: '0.75rem',
                  }}
                />

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    disabled={isReviewing}
                    onClick={() => handleReject(selectedInspection.id)}
                    style={{
                      flex: 1,
                      padding: '0.625rem',
                      backgroundColor: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    <XCircle size={18} />
                    Reprovar
                  </button>
                  <button
                    type="button"
                    disabled={isReviewing}
                    onClick={() => handleApprove(selectedInspection.id)}
                    style={{
                      flex: 1,
                      padding: '0.625rem',
                      backgroundColor: '#10b981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    <CheckCircle2 size={18} />
                    Aprovar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </ModalDrawer>
    </>
  );
};
