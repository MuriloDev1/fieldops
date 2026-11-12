import { useState, useEffect } from 'react';
import { StatCard } from '../shared/components/StatCard';
import { dashboardApi } from '../core/services/api';
import { isDemoSession } from '../core/demo';
import { Activity, Building2, Gauge } from 'lucide-react';

const EMPTY_SUMMARY = {
  totalClients: 0,
  activeSites: 0,
  totalEquipments: 0,
  criticalEquipments: 0,
  scheduledInspections: 0,
  inProgressInspections: 0,
  completedInspections: 0,
  openNonConformities: 0,
  conformanceRate: 0,
};

const DEMO_SUMMARY = {
  totalClients: 3,
  activeSites: 6,
  totalEquipments: 136,
  criticalEquipments: 4,
  scheduledInspections: 48,
  inProgressInspections: 12,
  completedInspections: 128,
  openNonConformities: 9,
  conformanceRate: 92.6,
};

const InfoRow = ({ label, value, color, last }) => (
  <div className={`info-row ${last ? 'last' : ''}`}>
    <span>{label}</span>
    <strong style={color ? { color } : undefined}>{value}</strong>
  </div>
);

const FlowBar = ({ label, value, total, color }) => {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="flow-bar">
      <div className="flow-bar-head">
        <span>{label}</span>
        <strong>
          {value} <small>({percent}%)</small>
        </strong>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%`, background: color }} />
      </div>
    </div>
  );
};

export const AnalyticsPage = () => {
  const [summary, setSummary] = useState(EMPTY_SUMMARY);

  useEffect(() => {
    if (isDemoSession()) {
      setSummary(DEMO_SUMMARY);
      return;
    }
    dashboardApi
      .getSummary()
      .then((data) => {
        if (data) setSummary((prev) => ({ ...prev, ...data }));
      })
      .catch((err) => {
        console.error('Erro ao carregar métricas do banco:', err);
      });
  }, []);

  const totalInspections =
    summary.totalInspections ??
    (summary.scheduledInspections + summary.inProgressInspections + summary.completedInspections);
  const conformance = summary.conformanceRate != null ? Number(summary.conformanceRate) : 0;

  return (
    <>
      <div className="page-title-wrap">
        <h1>Analytics & Indicadores</h1>
        <p>Métricas consolidadas de eficiência e acompanhamento do banco de dados.</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total de Inspeções"
          value={String(totalInspections)}
          footerText={`${summary.scheduledInspections || 0} agendadas`}
          type="positive"
          icon="📋"
        />
        <StatCard
          title="Conformidade Geral"
          value={`${conformance.toFixed(1)}%`}
          footerText="Índice em tempo real"
          type={conformance >= 90 ? 'positive' : 'warning'}
          icon="📈"
        />
        <StatCard
          title="Alertas de Manutenção"
          value={String((summary.openNonConformities || 0) + (summary.criticalEquipments || 0))}
          footerText={`${summary.openNonConformities || 0} não conformidades abertas`}
          type="warning"
          icon="⚠️"
        />
        <StatCard
          title="Inspeções Concluídas"
          value={String(summary.completedInspections || 0)}
          footerText={`${summary.inProgressInspections || 0} em andamento`}
          type="positive"
          icon="✅"
        />
      </div>

      <div className="analytics-grid">
        <section className="panel analytics-card">
          <h3>
            <Building2 size={20} color="#2d7df1" />
            Infraestrutura Operacional
          </h3>
          <InfoRow label="Clientes Atendidos" value={summary.totalClients} />
          <InfoRow label="Plantas & Locais Ativos" value={summary.activeSites} />
          <InfoRow label="Equipamentos Monitorados" value={summary.totalEquipments} last />
        </section>

        <section className="panel analytics-card">
          <h3>
            <Activity size={20} color="#1d9a63" />
            Fluxo de Inspeções
          </h3>
          <FlowBar label="Agendadas / Pendentes" value={summary.scheduledInspections} total={totalInspections} color="#d79b14" />
          <FlowBar label="Em Execução no Campo" value={summary.inProgressInspections} total={totalInspections} color="#2d7df1" />
          <FlowBar label="Finalizadas & Revisadas" value={summary.completedInspections} total={totalInspections} color="#1d9a63" />
        </section>

        <section className="panel analytics-card">
          <h3>
            <Gauge size={20} color="#0d3f85" />
            Conformes × Não conformes
          </h3>
          <div className="split-bar" role="img" aria-label={`${conformance.toFixed(1)}% conformes`}>
            <div className="split-ok" style={{ width: `${Math.min(conformance, 100)}%` }} />
            <div className="split-nok" style={{ width: `${Math.max(100 - conformance, 0)}%` }} />
          </div>
          <div className="split-legend">
            <span><i className="dot ok" /> Conformes {conformance.toFixed(1)}%</span>
            <span><i className="dot nok" /> Não conformes {Math.max(100 - conformance, 0).toFixed(1)}%</span>
          </div>
          <InfoRow label="Não conformidades abertas" value={summary.openNonConformities || 0} color="#d94b4b" />
          <InfoRow label="Equipamentos críticos" value={summary.criticalEquipments || 0} color="#d79b14" last />
        </section>
      </div>
    </>
  );
};

export default AnalyticsPage;
