export const StatusBadge = ({ status }) => {
  const getStatusClass = (statusStr) => {
    switch (statusStr?.toLowerCase()) {
      case 'crítico':
      case 'critico':
      case 'critical':
      case 'reprovada':
      case 'rejected':
      case 'danger':
        return 'danger';
      case 'alta':
      case 'high':
      case 'maintenance':
      case 'manutenção':
      case 'warning':
      case 'atrasado':
      case 'em revisão':
      case 'pendente':
        return 'warning';
      case 'baixa':
      case 'low':
      case 'info':
      case 'concluído':
      case 'concluido':
      case 'aprovada':
      case 'approved':
      case 'active':
      case 'ok':
        return 'info';
      default:
        return 'info';
    }
  };

  const getDisplayLabel = (statusStr) => {
    switch (statusStr?.toUpperCase()) {
      case 'ACTIVE':
      case 'OK':
        return 'OK';
      case 'HIGH':
      case 'ALTA':
        return 'Alta';
      case 'CRITICAL':
      case 'CRITICO':
        return 'Crítico';
      case 'LOW':
        return 'Baixa';
      case 'MAINTENANCE':
        return 'Manutenção';
      case 'INACTIVE':
      case 'RETIRED':
        return 'Inativo';
      default:
        return statusStr;
    }
  };

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      {getDisplayLabel(status)}
    </span>
  );
};
