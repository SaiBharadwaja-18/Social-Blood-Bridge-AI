import { cn } from '../../utils/cn';

interface LoadingSkeletonProps { rows?: number; className?: string; }
export function LoadingSkeleton({ rows = 4, className }: LoadingSkeletonProps) {
  return (<div className={cn('animate-pulse space-y-4', className)}>{Array.from({ length: rows }, (_, i) => (<div key={i} className="flex gap-4"><div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-800" /><div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-800" /><div className="h-4 w-1/5 rounded bg-gray-200 dark:bg-gray-800" /></div>))}</div>);
}
export function CardSkeleton() { return (<div className="card animate-pulse"><div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-800" /><div className="mt-3 h-8 w-16 rounded bg-gray-200 dark:bg-gray-800" /><div className="mt-2 h-3 w-20 rounded bg-gray-200 dark:bg-gray-800" /></div>); }
