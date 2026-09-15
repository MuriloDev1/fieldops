export const StatCard = ({ title, value, footerText, type = 'default', icon }) => {
  const getFootClass = () => {
    if (type === 'danger') return 'stat-foot red';
    if (type === 'warning') return 'stat-foot warning';
    if (type === 'positive') return 'stat-foot positive';
    return 'stat-foot';
  };

  const getIconClass = () => {
    if (type === 'danger') return 'stat-icon red';
    if (type === 'warning') return 'stat-icon yellow';
    if (type === 'positive') return 'stat-icon blue';
    return 'stat-icon silver';
  };

  return (
    <article className={`stat-card ${type === 'danger' ? 'danger' : ''}`}>
      <div className="stat-head">
        <span>{title}</span>
        <span className={getIconClass()}>{icon || '◌'}</span>
      </div>
      <div className={`stat-value ${type === 'danger' ? 'red' : ''}`}>{value}</div>
      <div className={getFootClass()}>{footerText}</div>
    </article>
  );
};
