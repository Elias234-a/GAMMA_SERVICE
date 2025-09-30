import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: React.ReactNode;
  onRowClick?: (item: T) => void;
  rowClassName?: string;
}

export function DataTable<T>({ 
  columns, 
  data, 
  emptyMessage = 'No hay datos disponibles',
  onRowClick,
  rowClassName = ''
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10 text-left text-sm text-gray-400">
            {columns.map((column, index) => (
              <th 
                key={index} 
                className={`px-4 py-3 font-medium ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.length > 0 ? (
            data.map((item, rowIndex) => (
              <tr 
                key={rowIndex}
                onClick={() => onRowClick?.(item)}
                className={`hover:bg-white/5 transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${rowClassName}`}
              >
                {columns.map((column, colIndex) => (
                  <td 
                    key={colIndex} 
                    className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap"
                  >
                    {typeof column.accessor === 'function' 
                      ? column.accessor(item) 
                      : (item[column.accessor] as any)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td 
                colSpan={columns.length} 
                className="px-4 py-8 text-center text-sm text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
