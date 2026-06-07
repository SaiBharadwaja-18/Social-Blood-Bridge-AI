import { useState, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

export interface Column<T> { key: string; header: string; render?: (item: T) => ReactNode; }
interface DataTableProps<T> { columns: Column<T>[]; data: T[]; pageSize?: number; searchable?: boolean; searchPlaceholder?: string; actions?: (item: T) => ReactNode; emptyMessage?: string; }

export function DataTable<T>({ columns, data, pageSize = 10, searchable = true, searchPlaceholder = 'Search...', actions, emptyMessage = 'No data found' }: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const filtered = data.filter(item => Object.values(item as Record<string, unknown>).some(v => String(v).toLowerCase().includes(query.toLowerCase())));
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="space-y-4">
      {searchable && (
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input type="text" value={query} onChange={e => { setQuery(e.target.value); setPage(0); }} placeholder={searchPlaceholder} className="input-field pl-10" />
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900/50">
            <tr>
              {columns.map(col => <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{col.header}</th>)}
              {actions && <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {paged.length === 0 ? (
              <tr><td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</td></tr>
            ) : paged.map((item, i) => (
              <tr key={i} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                {columns.map(col => <td key={col.key} className="whitespace-nowrap px-4 py-3 text-sm">{col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}</td>)}
                {actions && <td className="whitespace-nowrap px-4 py-3 text-right text-sm">{actions(item)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}</p>
          <div className="flex gap-1">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-ghost px-2 py-1 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, j) => { const start = Math.max(0, Math.min(page - 2, totalPages - 5)); const pg = start + j; return <button key={pg} onClick={() => setPage(pg)} className={cn('btn-ghost px-3 py-1 text-sm', page === pg && 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400')}>{pg + 1}</button>; })}
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-ghost px-2 py-1 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
