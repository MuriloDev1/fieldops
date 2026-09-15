export default function Table({ columns, rows, emptyMessage = 'Nenhum registro encontrado.' }) {
  if (!rows || rows.length === 0) {
    return <div className="empty-state compact">{emptyMessage}</div>;
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id ?? `${row.name ?? 'row'}-${index}`}>
              {columns.map((column) => (
                <td key={`${row.id ?? index}-${column.key}`}>{column.render ? column.render(row[column.key], row) : row[column.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
