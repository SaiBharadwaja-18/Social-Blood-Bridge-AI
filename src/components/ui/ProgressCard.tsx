import { cn } from '../../utils/cn';

interface ProgressCardProps { title: string; current: number; target: number; unit?: string; className?: string; color?: string; }
export function ProgressCard({ title, current, target, unit = 'units', className, color = 'bg-primary-500' }: ProgressCardProps) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  return (
    <div className={cn('card', className)}>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h4>
        <span className="text-xs text-gray-500 dark:text-gray-400">{current}/{target} {unit}</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
        <div className={cn('h-2.5 rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-right text-xs font-medium text-gray-500 dark:text-gray-400">{pct.toFixed(0)}%</p>
    </div>
  );
}
