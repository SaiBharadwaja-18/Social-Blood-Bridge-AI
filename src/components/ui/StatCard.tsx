import type { ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface StatCardProps { title: string; value: string | number; icon: ReactNode; change?: string; changeType?: 'positive' | 'negative' | 'neutral'; className?: string; }

export function StatCard({ title, value, icon, change, changeType = 'neutral', className }: StatCardProps) {
  return (
    <div className={cn('card flex items-start justify-between', className)}>
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {change && <p className={cn('text-xs font-medium', { 'text-success-600 dark:text-success-400': changeType === 'positive', 'text-accent-600 dark:text-accent-400': changeType === 'negative', 'text-gray-500 dark:text-gray-400': changeType === 'neutral' })}>{change}</p>}
      </div>
      <div className="rounded-lg bg-primary-50 p-3 dark:bg-primary-900/20">
        <div className="text-primary-600 dark:text-primary-400">{icon}</div>
      </div>
    </div>
  );
}
