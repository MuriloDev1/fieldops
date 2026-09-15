export default function Card({ children, className = '', title, actions, headerClassName = '' }) {
  return (
    <div className={`card ${className}`.trim()}>
      {title || actions ? (
        <div className={`card-header ${headerClassName}`.trim()}>
          {title ? <h3>{title}</h3> : null}
          {actions ? <div className="card-actions">{actions}</div> : null}
        </div>
      ) : null}
      <div className="card-body">{children}</div>
    </div>
  );
}
