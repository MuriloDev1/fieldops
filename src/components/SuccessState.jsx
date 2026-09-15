export default function SuccessState({ title = 'Operação concluída com sucesso.', description = 'A ação foi registrada no sistema.', action }) {
  return (
    <div className="success-state">
      <div className="success-icon">✓</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action ? <div className="empty-action">{action}</div> : null}
    </div>
  );
}
