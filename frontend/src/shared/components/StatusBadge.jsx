export const StatusBadge = ({ status }) => {
  const getStatusClass = (statusStr) => {
    switch (statusStr?.toLowerCase()) {
      case 'crítico':
      case 'critico':
      case 'danger':
        return 'danger';
      case 'alta':
      case 'warning':
      case 'atrasado':
        return 'warning';
      case 'baixa':
      case 'info':
      case 'concluído':
      case 'concluido':
      case 'ok':
        return 'info';
      default:
        return 'info';
    }
  };

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      {status}
    </span>
  );
};
