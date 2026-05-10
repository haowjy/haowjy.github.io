import type { ReactNode } from 'react'

type CellValue = string | number | ReactNode

type DataTableColumn = {
  key: string
  label: string
  align?: 'left' | 'right'
}

type DataTableRow = Record<string, CellValue>

type DataTableProps = {
  columns: DataTableColumn[]
  rows: DataTableRow[]
  caption?: ReactNode
  highlightRow?: number
  highlightCol?: string
}

export function DataTable({
  columns,
  rows,
  caption,
  highlightRow,
  highlightCol,
}: DataTableProps) {
  return (
    <figure className="viz-data-table">
      {caption ? <figcaption>{caption}</figcaption> : null}
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ textAlign: column.align ?? 'left' }}
                scope="col"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex === highlightRow ? 'is-highlighted-row' : ''}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  style={{ textAlign: column.align ?? 'left' }}
                  className={highlightCol === column.key ? 'is-highlighted-col' : ''}
                >
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
