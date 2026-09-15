import { DataTable } from '../shared/components/DataTable';

const columns = [
  { header: 'Nome', key: 'name' },
  { header: 'Especialidade', key: 'role' },
  { header: 'Região', key: 'region' },
  { header: 'Inspeções Realizadas', key: 'completed' },
  { header: 'Status', key: 'status' },
];

const teamData = [
  { id: '1', name: 'Carlos Eduardo', role: 'Técnico Mecânico', region: 'Refinaria Central', completed: 142, status: 'OK' },
  { id: '2', name: 'Ana Paula', role: 'Técnica Eletricista', region: 'Unidade Alpha', completed: 98, status: 'OK' },
  { id: '3', name: 'Roberto Silva', role: 'Inspecção de Segurança', region: 'Terminal Sul', completed: 210, status: 'Atrasado' },
];

export const TeamManagementPage = () => {
  return (
    <>
      <div className="page-title-wrap">
        <h1>Gestão de Equipe</h1>
        <p>Acompanhamento de técnicos de campo e distribuição de trabalho.</p>
      </div>

      <DataTable
        title="Técnicos de Campo"
        columns={columns}
        data={teamData}
        totalCount={3}
        currentPage={1}
        onRowAction={(row) => alert(`Técnico: ${row.name}`)}
        onFilterClick={() => alert('Filtrar equipe')}
      />
    </>
  );
};
