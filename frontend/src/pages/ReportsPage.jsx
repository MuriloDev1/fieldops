export const ReportsPage = () => {
  return (
    <>
      <div className="page-title-wrap">
        <h1>Relatórios Operacionais</h1>
        <p>Geração, agendamento e download de relatórios executivos.</p>
      </div>

      <section className="panel" style={{ padding: '1.5rem' }}>
        <h2>Relatórios Disponíveis</h2>
        <ul style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#1e293b', borderRadius: '0.375rem' }}>
            <span>Relatório Mensal de Não Conformidades (PDF)</span>
            <button type="button" className="pill-button" onClick={() => alert('Baixando PDF...')}>Download</button>
          </li>
          <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#1e293b', borderRadius: '0.375rem' }}>
            <span>Histórico Semanal de Inspeções (CSV)</span>
            <button type="button" className="pill-button" onClick={() => alert('Baixando CSV...')}>Download</button>
          </li>
        </ul>
      </section>
    </>
  );
};
