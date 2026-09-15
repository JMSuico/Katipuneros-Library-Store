// [Layer: UserRoles/Features/Pages/AdminsPanel/Components]
// DataTable.tsx -- Admin sortable and filterable data table component.
// DO NOT put business logic or direct API calls here.
import { ReactNode } from 'react';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  render?: (row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  title?: string;
  countBadge?: string | number;
  actions?: ReactNode;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyField,
  title,
  countBadge,
  actions,
  emptyMessage = 'No records found',
}: DataTableProps<T>) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-high/60 overflow-hidden flex flex-col">
      {(title || actions) && (
        <div className="px-6 py-4 bg-surface-container-low flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-container-high/60">
          <div className="flex items-center gap-2.5">
            {title && (
              <h3 className="font-body-large text-body-large font-bold text-text-primary">
                {title}
              </h3>
            )}
            {countBadge !== undefined && (
              <span className="bg-soft-blue text-primary font-caption text-caption font-bold px-2 py-0.5 rounded-full">
                {countBadge}
              </span>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-small font-small">
          <thead>
            <tr className="bg-surface-container/60 text-text-secondary uppercase text-caption font-caption tracking-wider border-b border-surface-container-high/60">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3.5 px-4 font-semibold ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  } ${col.className || ''}`}
                  scope="col"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-high/40">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-text-secondary"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={String(row[keyField])}
                  className="hover:bg-surface-container-low/60 transition-colors"
                >
                  {columns.map((col, idx) => (
                    <td
                      key={idx}
                      className={`py-3.5 px-4 align-middle ${
                        col.align === 'right'
                          ? 'text-right'
                          : col.align === 'center'
                          ? 'text-center'
                          : 'text-left'
                      } ${col.className || ''}`}
                    >
                      {col.render
                        ? col.render(row)
                        : col.accessor
                        ? String(row[col.accessor] ?? '')
                        : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
