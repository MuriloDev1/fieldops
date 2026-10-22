import { useState, useEffect } from 'react';
import {
  Calendar,
  UserCheck,
  Play,
  Send,
  Search,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  Clock,
  Shield,
  Smartphone,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { inspectionsApi } from '../../core/services/api';

const EVENT_CONFIG = {
  INSPECTION_CREATED: {
    label: 'Inspeção Criada',
    defaultDesc: 'Agendamento registrado e snapshot imutável de itens gerado.',
    icon: Calendar,
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.15)',
    border: 'rgba(56, 189, 248, 0.4)'
  },
  INSPECTION_ASSIGNED: {
    label: 'Técnico Atribuído',
    defaultDesc: 'Ordem de serviço atribuída para execução em campo.',
    icon: UserCheck,
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.15)',
    border: 'rgba(168, 85, 247, 0.4)'
  },
  INSPECTION_STARTED: {
    label: 'Execução Iniciada em Campo',
    defaultDesc: 'Técnico realizou validação via QR Code e iniciou o checklist.',
    icon: Play,
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.4)'
  },
  INSPECTION_SUBMITTED: {
    label: 'Respostas Enviadas para Auditoria',
    defaultDesc: 'Checklist concluído e sincronizado com a central para homologação.',
    icon: Send,
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.15)',
    border: 'rgba(6, 182, 212, 0.4)'
  },
  REVIEW_STARTED: {
    label: 'Revisão Iniciada pelo Supervisor',
    defaultDesc: 'Supervisor operacional assumiu o processo de revisão técnica.',
    icon: Search,
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.15)',
    border: 'rgba(99, 102, 241, 0.4)'
  },
  INSPECTION_APPROVED: {
    label: 'Inspeção Aprovada',
    defaultDesc: 'Conformidade validada sem ressalvas impeditivas.',
    icon: CheckCircle2,
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.4)'
  },
  INSPECTION_REJECTED: {
    label: 'Inspeção Reprovada com Justificativa',
    defaultDesc: 'Apontamento de não conformidade ou necessidade de retificação.',
    icon: XCircle,
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.4)'
  },
  INSPECTION_CANCELED: {
    label: 'Inspeção Cancelada',
    defaultDesc: 'Cancelamento formal registrado no painel administrativo.',
    icon: AlertOctagon,
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.15)',
    border: 'rgba(148, 163, 184, 0.4)'
  }
};

function formatDate(isoString) {
  if (!isoString) return 'Data não registrada';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}

export function InspectionTimeline({ inspectionId, initialEvents = [], inspectionData = null }) {
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(!initialEvents || initialEvents.length === 0);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      if (!inspectionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await inspectionsApi.getHistory(inspectionId);
        if (isMounted) {
          setEvents(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('[InspectionTimeline] Erro ao carregar histórico do banco:', err);
        if (isMounted) {
          setEvents([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [inspectionId]);

  if (loading) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>
        <Clock className="animate-spin" size={24} style={{ margin: '0 auto 0.5rem auto' }} />
        <p style={{ margin: 0, fontSize: '0.875rem' }}>Carregando trilha de auditoria...</p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div style={{
        padding: '1.5rem',
        textAlign: 'center',
        backgroundColor: '#0f172a',
        borderRadius: '8px',
        border: '1px dashed #334155',
        color: '#94a3b8'
      }}>
        <Clock size={28} style={{ margin: '0 auto 0.5rem auto', color: '#64748b' }} />
        <h4 style={{ margin: '0 0 0.25rem 0', color: '#cbd5e1' }}>Nenhum evento registrado</h4>
        <p style={{ margin: 0, fontSize: '0.85rem' }}>
          Os eventos da linha do tempo são gravados automaticamente conforme o ciclo operacional evolui (RN-086).
        </p>
      </div>
    );
  }

  return (
    <div className="inspection-timeline-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem',
        borderBottom: '1px solid #334155',
        paddingBottom: '0.5rem'
      }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Linha do Tempo de Mudanças de Estado
        </span>
        <span style={{
          fontSize: '0.75rem',
          padding: '0.15rem 0.5rem',
          borderRadius: '999px',
          backgroundColor: '#1e293b',
          color: '#38bdf8',
          border: '1px solid #334155'
        }}>
          {events.length} {events.length === 1 ? 'evento' : 'eventos'} (RN-086)
        </span>
      </div>

      <div style={{ position: 'relative', paddingLeft: '1.25rem' }}>
        {/* Linha vertical contínua conectando os eventos */}
        <div style={{
          position: 'absolute',
          left: '1.75rem',
          top: '1rem',
          bottom: '1rem',
          width: '2px',
          backgroundColor: '#334155',
          zIndex: 0
        }} />

        {events.map((event, idx) => {
          const actionKey = (event.action || '').toUpperCase();
          const config = EVENT_CONFIG[actionKey] || {
            label: event.actionLabel || event.action || 'Transição de Estado',
            defaultDesc: event.description || 'Evento registrado na auditoria.',
            icon: Clock,
            color: '#94a3b8',
            bg: 'rgba(148, 163, 184, 0.15)',
            border: 'rgba(148, 163, 184, 0.4)'
          };

          const IconComponent = config.icon;
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={event.id || idx}
              style={{
                position: 'relative',
                display: 'flex',
                gap: '1rem',
                marginBottom: idx === events.length - 1 ? 0 : '1.25rem',
                zIndex: 1
              }}
            >
              {/* Ícone no nó da linha do tempo */}
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '50%',
                  backgroundColor: '#0f172a',
                  border: `2px solid ${config.color}`,
                  boxShadow: `0 0 12px ${config.bg}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <IconComponent size={16} color={config.color} strokeWidth={2.2} />
              </div>

              {/* Card do evento */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  border: `1px solid ${config.border}`,
                  padding: '0.85rem 1rem',
                  transition: 'all 0.2s ease',
                  cursor: event.metadataJson ? 'pointer' : 'default'
                }}
                onClick={() => event.metadataJson && setExpandedIndex(isExpanded ? null : idx)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
                      {event.actionLabel || config.label}
                    </span>
                    {idx === events.length - 1 && (
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: config.bg,
                        color: config.color,
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        border: `1px solid ${config.border}`
                      }}>
                        ATUAL
                      </span>
                    )}
                  </div>

                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Clock size={12} />
                    {formatDate(event.occurredAt)}
                  </span>
                </div>

                {/* Linha de "Quem" (Ator responsável) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '0.4rem',
                  fontSize: '0.8rem',
                  color: '#cbd5e1'
                }}>
                  <Shield size={13} style={{ color: '#38bdf8' }} />
                  <span>
                    <strong>{event.actorName || 'Sistema'}</strong>
                  </span>
                  {event.actorRole && (
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '0.05rem 0.35rem',
                      borderRadius: '4px',
                      backgroundColor: '#0f172a',
                      color: '#94a3b8',
                      border: '1px solid #334155'
                    }}>
                      {event.actorRole}
                    </span>
                  )}
                  {event.deviceId && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#64748b', fontSize: '0.75rem', marginLeft: 'auto' }}>
                      <Smartphone size={12} />
                      {event.deviceId}
                    </span>
                  )}
                </div>

                {/* Descrição / Detalhe da Ação */}
                <p style={{
                  margin: '0.5rem 0 0 0',
                  fontSize: '0.85rem',
                  color: '#94a3b8',
                  lineHeight: 1.4
                }}>
                  {event.description || config.defaultDesc}
                </p>

                {/* Seção expansível para metadados ou justificativas */}
                {event.metadataJson && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#38bdf8',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        padding: 0
                      }}
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {isExpanded ? 'Ocultar detalhes técnicos' : 'Ver detalhes da transição'}
                    </button>

                    {isExpanded && (
                      <pre style={{
                        marginTop: '0.4rem',
                        padding: '0.5rem',
                        backgroundColor: '#0f172a',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        color: '#a5f3fc',
                        overflowX: 'auto',
                        whiteSpace: 'pre-wrap',
                        border: '1px solid #334155'
                      }}>
                        {typeof event.metadataJson === 'string'
                          ? event.metadataJson
                          : JSON.stringify(event.metadataJson, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
