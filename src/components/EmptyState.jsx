export default function EmptyState({ title = 'Nenhuma informação encontrada.', description = 'Tente ajustar os filtros ou retornar mais tarde.', action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">○</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action ? <div className="empty-action">{action}</div> : null}
    </div>
  );
}
