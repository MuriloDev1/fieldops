export default function ProgressBar({ value, label, color = 'primary' }) {
  return (
    <div className="progress-block">
      {label ? <div className="progress-meta"><span>{label}</span><strong>{value}%</strong></div> : null}
      <div className="progress-track">
        <div className={`progress-fill ${color}`} style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
      </div>
    </div>
  );
}
