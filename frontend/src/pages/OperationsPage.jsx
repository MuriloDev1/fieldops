import { DataTable } from '../shared/components/DataTable';

const columns = [
  { header: 'ID Operação', key: 'id' },
  { header: 'Título', key: 'title' },
  { header: 'Técnico Responsável', key: 'technician' },
  { header: 'Data Prevista', key: 'dueDate' },
  { header: 'Status', key: 'status' },
];

const operationsData = [
  { id: 'OP-101', title: 'Inspeção Preventiva Bomba 04', technician: 'Carlos Eduardo', dueDate: '25 Out 2023', status: 'Concluído' },
  { id: 'OP-102', title: 'Manutenção Válvula de Pressão', technician: 'Ana Paula', dueDate: '26 Out 2023', status: 'Atrasado' },
  { id: 'OP-103', title: 'Checagem de Painel Elétrico Leste', technician: 'Roberto Silva', dueDate: '27 Out 2023', status: 'Crítico' },
  { id: 'OP-104', title: 'Troca de Filtro Compressor', technician: 'Fernanda Lima', dueDate: '28 Out 2023', status: 'OK' },
];

export const OperationsPage = () => {
  return (
    <>
      <div className="page-title-wrap">
        <h1>Operações & Inspeções</h1>
        <p>Gerenciamento e histórico de operações agendadas no campo.</p>
      </div>

      <DataTable
        title="Operações Ativas"
        columns={columns}
        data={operationsData}
        totalCount={4}
        currentPage={1}
        onRowAction={(row) => alert(`Operação: ${row.id} - ${row.title}`)}
        onFilterClick={() => alert('Filtro de operações')}
        onExportClick={() => alert('Exportar operações')}
      />
    </>
  );
};
