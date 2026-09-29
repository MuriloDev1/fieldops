import { useState, useEffect } from 'react';
import { StatCard } from '../shared/components/StatCard';
import { dashboardApi } from '../core/services/api';
import { Activity, CheckCircle, AlertTriangle, Building2, MapPin, Settings2 } from 'lucide-react';

export const AnalyticsPage = () => {
  const [summary, setSummary] = useState({
    totalClients: 3,
    activeSites: 4,
    totalEquipments: 6,
    criticalEquipments: 1,
    scheduledInspections: 1,
    inProgressInspections: 1,
    completedInspections: 1,
    openNonConformities: 1,
    conformanceRate: 91.6,
  });

  useEffect(() => {
    dashboardApi
      .getSummary()
      .then((data) => {
        if (data) setSummary(data);
      })
      .catch((err) => {
        console.warn('Usando métricas de fallback:', err);
      });
  }, []);

  return (
    <>
      <div className="page-title-wrap">
        <h1>Analytics & Indicadores</h1>
        <p>Métricas consolidadas de conformidade, produtividade de campo e auditorias.</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <StatCard
          title="Taxa de Conformidade Geral"
          value={`${Math.round(summary.conformanceRate || 95)}%`}
          footerText="Meta operacional: > 90%"
          type={summary.conformanceRate >= 90 ? 'positive' : 'warning'}
          icon="📈"
        />
        <StatCard
          title="Não Conformidades em Aberto"
          value={summary.openNonConformities?.toString() || '0'}
          footerText="Apontamentos requerendo ação"
          type={summary.openNonConformities > 0 ? 'warning' : 'positive'}
          icon="⚠️"
        />
        <StatCard
          title="Inspeções Realizadas"
          value={summary.completedInspections?.toString() || '0'}
          footerText={`${summary.inProgressInspections || 0} em andamento`}
          type="positive"
          icon="✅"
        />
        <StatCard
          title="Equipamentos Críticos"
          value={summary.criticalEquipments?.toString() || '0'}
          footerText={`De ${summary.totalEquipments || 0} cadastrados`}
          type={summary.criticalEquipments > 0 ? 'warning' : 'positive'}
          icon="⚙️"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#f8fafc', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={20} color="#38bdf8" />
            Infraestrutura Operacional
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#94a3b8' }}>Clientes Atendidos</span>
              <strong style={{ color: '#fff' }}>{summary.totalClients}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#94a3b8' }}>Plantas & Locais Ativos</span>
              <strong style={{ color: '#fff' }}>{summary.activeSites}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#94a3b8' }}>Equipamentos Monitorados</span>
              <strong style={{ color: '#fff' }}>{summary.totalEquipments}</strong>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#f8fafc', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={20} color="#10b981" />
            Fluxo de Inspeções
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#94a3b8' }}>Agendadas / Pendentes</span>
              <strong style={{ color: '#f59e0b' }}>{summary.scheduledInspections}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#94a3b8' }}>Em Execução no Campo</span>
              <strong style={{ color: '#38bdf8' }}>{summary.inProgressInspections}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
              <span style={{ color: '#94a3b8' }}>Finalizadas & Revisadas</span>
              <strong style={{ color: '#10b981' }}>{summary.completedInspections}</strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
