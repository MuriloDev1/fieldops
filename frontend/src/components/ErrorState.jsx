export default function ErrorState({ onRetry, message = 'Não foi possível carregar os dados.' }) {
  return (
    <div className="error-state">
      <div className="error-icon">!</div>
      <h3>{message}</h3>
      <Button variant="primary" onClick={onRetry}>Tentar novamente</Button>
    </div>
  );
}
