export const SettingsPage = () => {
  return (
    <>
      <div className="page-title-wrap">
        <h1>Configurações do Sistema</h1>
        <p>Preferências da organização, parâmetros globais e regras de notificação.</p>
      </div>

      <section className="panel" style={{ padding: '1.5rem' }}>
        <h2>Geral</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>
          Parâmetros de sincronização, limites de alertas e definições globais do FieldOps.
        </p>
      </section>
    </>
  );
};
