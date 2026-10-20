export default function Badge({ children, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'badge badge-neutral',
    success: 'badge badge-success',
    warning: 'badge badge-warning',
    danger: 'badge badge-danger',
    info: 'badge badge-info',
    slate: 'badge badge-slate',
    primary: 'badge badge-primary',
  };

  return <span className={`${tones[tone]} ${className}`.trim()}>{children}</span>;
}
