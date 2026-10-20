import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h1 style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '1rem' }}>404</h1>
      <h2>Página Não Encontrada</h2>
      <p style={{ color: '#94a3b8', margin: '1rem 0 2rem 0' }}>
        A rota solicitada não existe ou você não possui permissão para acessá-la.
      </p>
      <Link to="/dashboard" className="primary-button" style={{ display: 'inline-block', textDecoration: 'none' }}>
        Voltar ao Dashboard
      </Link>
    </div>
  );
};
