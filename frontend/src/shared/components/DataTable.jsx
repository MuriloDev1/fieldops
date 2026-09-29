import { StatusBadge } from './StatusBadge';

export const DataTable = ({
  title,
  columns,
  data = [],
  totalCount = data.length,
  currentPage = 1,
  onPageChange,
  onFilterClick,
  onExportClick,
  onRowAction
}) => {
  return (
    <section className="panel table-panel">
      <div className="panel-header table-header">
        <div>
          <h2>{title}</h2>
        </div>

        <div className="filters">
          {onFilterClick && (
            <button type="button" className="toolbar-button" onClick={onFilterClick}>
              Filtrar
            </button>
          )}
          {onExportClick && (
            <button type="button" className="toolbar-button" onClick={onExportClick}>
              Exportar
            </button>
          )}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key || col.header}>{col.header}</th>
            ))}
            {onRowAction && <th>Ação</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onRowAction ? 1 : 0)} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                Nenhum registro encontrado.
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? (
                      col.render(row[col.key], row)
                    ) : col.key === 'status' ? (
                      <StatusBadge status={row[col.key]} />
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}
                {onRowAction && (
                  <td className="action-cell">
                    <button type="button" onClick={() => onRowAction(row)}>
                      Detalhes
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="table-footer">
        <span>Mostrando 1-{data.length} de {totalCount} registros</span>
        <div className="pagination">
          <button type="button" onClick={() => onPageChange && onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
            ‹
          </button>
          <button type="button" className="active">
            {currentPage}
          </button>
          <button type="button" onClick={() => onPageChange && onPageChange(currentPage + 1)}>
            ›
          </button>
        </div>
      </div>
    </section>
  );
};
