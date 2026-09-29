import { StatCard } from '../shared/components/StatCard';

export const AnalyticsPage = () => {
  return (
    <>
      <div className="page-title-wrap">
        <h1>Analytics & Indicadores</h1>
        <p>Métricas consolidadas de eficiência e tempo médio de atendimento.</p>
      </div>

      <div className="stats-grid">
        <StatCard title="Tempo Médio de Inspeção" value="38 min" footerText="-4 min vs média" type="positive" icon="⏱" />
        <StatCard title="Conformidade Geral" value="94.2%" footerText="+1.8% no trimestre" type="positive" icon="📈" />
        <StatCard title="Alertas de Manutenção" value="8" footerText="2 necessitam auditoria" type="warning" icon="⚠️" />
      </div>
    </>
  );
};
