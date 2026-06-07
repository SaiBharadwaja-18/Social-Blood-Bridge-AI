import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface ChartCardProps { title: string; subtitle?: string; children: ReactNode; className?: string; action?: ReactNode; }
export function ChartCard({ title, subtitle, children, className, action }: ChartCardProps) {
  return (
    <div className={cn('card', className)}>
      <div className="mb-4 flex items-center justify-between">
        <div><h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>{subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}</div>
        {action}
      </div>
      {children}
    </div>
  );
}
