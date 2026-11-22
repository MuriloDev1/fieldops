import { getStatusBadgeMeta } from '../../core/utils/statusMaps';

export const StatusBadge = ({ status }) => {
  const { toneClass, label } = getStatusBadgeMeta(status);

  return (
    <span className={`status-badge ${toneClass}`}>
      {label}
    </span>
  );
};
