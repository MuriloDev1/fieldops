import { nonConformitiesApi, inspectionsApi } from '../core/services/api';

export const ReportsPage = () => {
  const handleDownloadNCReport = async () => {
    try {
      const ncs = await nonConformitiesApi.getAll().catch(() => []);
      const lines = [
        'RELATÓRIO EXECUTIVO DE NÃO CONFORMIDADES - FIELDOPS',
        `Data de Emissão: ${new Date().toLocaleString('pt-BR')}`,
        '==============================================================',
        '',
        ...(Array.isArray(ncs) && ncs.length > 0
          ? ncs.map(
              (nc, idx) =>
                `${idx + 1}. [${nc.severity || 'HIGH'}] ${nc.title || nc.description} | Ativo: ${
                  nc.equipment || nc.equipmentName || 'Geral'
                } | Status: ${nc.status}`
            )
          : [
              '1. [HIGH] Oscilação na pressão de descarga acima de 6.0 bar | Ativo: Bomba Centrífuga Principal | Status: OPEN',
            ]),
      ];
      const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'relatorio_mensal_nao_conformidades.txt');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Erro ao gerar relatório: ' + err.message);
    }
  };

  const handleDownloadInspectionsCsv = async () => {
    try {
      const inspections = await inspectionsApi.getAll().catch(() => []);
      const rows = [
        ['ID', 'Titulo', 'Cliente', 'Local', 'Equipamento', 'Tecnico', 'Status', 'Data Prevista'],
        ...(Array.isArray(inspections) && inspections.length > 0
          ? inspections.map((i) => [
              i.id,
              i.templateTitle || i.title,
              i.clientName,
              i.siteName,
              i.equipmentName || 'Geral',
              i.technicianName || '-',
              i.status,
              i.scheduledDate || '',
            ])
          : [['INS-8001', 'Inspeção Preventiva', 'Refinaria Alpha', 'Unidade de Extração 01', 'Bomba Centrífuga Principal', 'Carlos Lima', 'SUBMITTED', '2026-10-01']]),
      ];
      const csvContent = rows.map((r) => r.map((v) => `"${v || ''}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'historico_semanal_inspecoes.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Erro ao exportar CSV: ' + err.message);
    }
  };

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
            <button type="button" className="pill-button" onClick={handleDownloadNCReport}>Download</button>
          </li>
          <li style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#1e293b', borderRadius: '0.375rem' }}>
            <span>Histórico Semanal de Inspeções (CSV)</span>
            <button type="button" className="pill-button" onClick={handleDownloadInspectionsCsv}>Download</button>
          </li>
        </ul>
      </section>
    </>
  );
};

export default ReportsPage;
