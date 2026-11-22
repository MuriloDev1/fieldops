/**
 * Mapeamentos centralizados de status, severidades e prioridades do FieldOps Web.
 */

export const PRIORITY_CONFIG = {
  LOW: { label: 'Baixa', color: '#1d9a63', bg: 'rgba(16, 185, 129, 0.15)' },
  MEDIUM: { label: 'Média', color: '#d79b14', bg: 'rgba(245, 158, 11, 0.15)' },
  HIGH: { label: 'Alta', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' },
  CRITICAL: { label: 'Crítica', color: '#d94b4b', bg: 'rgba(239, 68, 68, 0.15)' },
};

export const INSPECTION_STATUS_LABELS = {
  ASSIGNED: 'Atribuída',
  SCHEDULED: 'Agendada',
  IN_PROGRESS: 'Em Andamento',
  SUBMITTED: 'Em Revisão',
  UNDER_REVIEW: 'Em Revisão',
  APPROVED: 'Aprovada',
  REJECTED: 'Reprovada',
  CANCELED: 'Cancelada',
  CANCELLED: 'Cancelada',
};

export const NON_CONFORMITY_SEVERITY = {
  LOW: { label: 'Baixa', color: '#1d9a63', bg: 'rgba(16, 185, 129, 0.15)' },
  MEDIUM: { label: 'Média', color: '#d79b14', bg: 'rgba(245, 158, 11, 0.15)' },
  HIGH: { label: 'Alta', color: '#f97316', bg: 'rgba(249, 115, 22, 0.15)' },
  CRITICAL: { label: 'Crítica', color: '#d94b4b', bg: 'rgba(239, 68, 68, 0.15)' },
};

export const NON_CONFORMITY_STATUS = {
  OPEN: { label: 'Aberta', badge: 'Crítico' },
  IN_PROGRESS: { label: 'Em Análise', badge: 'Atrasado' },
  RESOLVED: { label: 'Resolvida', badge: 'OK' },
  CANCELLED: { label: 'Cancelada', badge: 'Desativado' },
};

export const USER_STATUS_LABELS = {
  ACTIVE: 'OK',
  INACTIVE: 'Desativado',
  BLOCKED: 'Crítico',
};

export function getInspectionStatusLabel(status, scheduledLabel = 'Agendada') {
  if (!status) return 'Pendente';
  if (status === 'ASSIGNED') return scheduledLabel;
  return INSPECTION_STATUS_LABELS[status] || status;
}

export function getInspectionStatusTone(status) {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'danger';
    case 'ASSIGNED':
    case 'SCHEDULED':
      return 'warning';
    case 'IN_PROGRESS':
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
      return 'info';
    default:
      return 'slate';
  }
}

export function getPriorityConfig(priority) {
  return PRIORITY_CONFIG[priority] || { label: priority || 'Média', color: '#627087', bg: 'rgba(148,163,184,0.1)' };
}

const BADGE_CLASS_MAP = {
  crítico: 'danger',
  critico: 'danger',
  critical: 'danger',
  reprovada: 'danger',
  rejected: 'danger',
  danger: 'danger',
  alta: 'warning',
  high: 'warning',
  maintenance: 'warning',
  manutenção: 'warning',
  warning: 'warning',
  atrasado: 'warning',
  'em revisão': 'warning',
  pendente: 'warning',
};

const BADGE_LABEL_MAP = {
  ACTIVE: 'OK',
  OK: 'OK',
  HIGH: 'Alta',
  ALTA: 'Alta',
  CRITICAL: 'Crítico',
  CRITICO: 'Crítico',
  LOW: 'Baixa',
  MAINTENANCE: 'Manutenção',
  INACTIVE: 'Inativo',
  RETIRED: 'Inativo',
};

export function getStatusBadgeMeta(status) {
  const raw = status == null ? '' : String(status);
  return {
    toneClass: BADGE_CLASS_MAP[raw.toLowerCase()] || 'info',
    label: BADGE_LABEL_MAP[raw.toUpperCase()] || status,
  };
}
