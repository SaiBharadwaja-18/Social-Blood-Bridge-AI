import { Bell, CheckCircle2, AlertCircle, Info, Zap } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { Notification } from '../../types';
import { notifStatusColor, formatDate } from '../../utils/helpers';

const iconMap = { blood_request: Bell, reminder: Zap, confirmation: CheckCircle2, backup_activation: AlertCircle, system: Info };

interface NotificationCardProps { notification: Notification; onMarkRead?: (id: string) => void; }
export function NotificationCard({ notification, onMarkRead }: NotificationCardProps) {
  const Icon = iconMap[notification.type];
  return (
    <div className={cn('flex gap-3 rounded-lg border p-4 transition-colors', notification.read ? 'border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900' : 'border-primary-100 bg-primary-50/50 dark:border-primary-900/30 dark:bg-primary-900/10')}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"><Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" /></div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{notification.title}</p>
          <span className={cn('badge shrink-0', notifStatusColor(notification.status))}>{notification.status}</span>
        </div>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{notification.message}</p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(notification.time)}</p>
          {!notification.read && onMarkRead && <button onClick={() => onMarkRead(notification.id)} className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">Mark read</button>}
        </div>
      </div>
    </div>
  );
}
