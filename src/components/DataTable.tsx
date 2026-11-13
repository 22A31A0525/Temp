import type { ReactNode } from 'react'

export type DataTableColumn<Row> = {
  key: string
  header: ReactNode
  renderCell: (row: Row) => ReactNode
  titleForRow?: (row: Row) => string
  className?: string
  width?: string
  widthClassName?: string
}

type DataTableProps<Row> = {
  ariaLabel: string
  columns: readonly DataTableColumn<Row>[]
  rows: readonly Row[]
  getRowKey: (row: Row) => string
  minWidth?: number
  scrollClassName?: string
}

export function DataTable<Row>({
  ariaLabel,
  columns,
  rows,
  getRowKey,
  minWidth = 760,
  scrollClassName = '',
}: DataTableProps<Row>) {
  return (
    <div
      className={`min-w-0 overflow-x-auto overscroll-x-contain focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 [scrollbar-width:thin]${scrollClassName ? ` ${scrollClassName}` : ''}`}
      role="region"
      aria-label={`${ariaLabel} table`}
      tabIndex={0}
    >
      <table
        className="w-full table-fixed border-collapse text-left"
        style={{ minWidth }}
        aria-label={ariaLabel}
      >
        <colgroup>
          {columns.map((column) => (
            <col
              key={column.key}
              className={column.widthClassName}
              style={column.widthClassName ? undefined : { width: column.width }}
            />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                className={`overflow-hidden text-ellipsis whitespace-nowrap border-b border-slate-100 px-3.5 py-3 text-[13px] font-semibold text-slate-600${column.className ? ` ${column.className}` : ''}`}
                key={column.key}
                scope="col"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)}>
              {columns.map((column) => {
                const content = column.renderCell(row)
                return (
                  <td
                    className={`overflow-hidden text-ellipsis whitespace-nowrap border-b border-slate-100 px-3.5 py-3 text-sm leading-relaxed text-slate-800 transition-colors hover:bg-slate-50${column.className ? ` ${column.className}` : ''}`}
                    key={column.key}
                    title={
                      column.titleForRow?.(row) ??
                      (typeof content === 'string' || typeof content === 'number'
                        ? String(content)
                        : undefined)
                    }
                  >
                    {content}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
