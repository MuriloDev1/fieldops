export default function LoadingState({ label = 'Carregando dados...' }) {
  return (
    <div className="loading-state">
      <div className="spinner" aria-label="Carregando" />
      <span>{label}</span>
    </div>
  );
}
