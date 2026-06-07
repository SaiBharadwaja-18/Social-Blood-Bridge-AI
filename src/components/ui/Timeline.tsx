import { cn } from '../../utils/cn';
import type { TimelineEvent } from '../../types';
import { formatDate } from '../../utils/helpers';
import { CircleDot, Users, PhoneCall, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const iconMap = { created: CircleDot, ranked: Users, contacted: PhoneCall, activated: ArrowUpRight, fulfilled: CheckCircle2 };
const colorMap = { created: 'bg-blue-500', ranked: 'bg-amber-500', contacted: 'bg-cyan-500', activated: 'bg-orange-500', fulfilled: 'bg-green-500' };

interface TimelineProps { events: TimelineEvent[]; className?: string; }
export function Timeline({ events, className }: TimelineProps) {
  return (
    <div className={cn('space-y-0', className)}>
      {events.map((event, i) => {
        const Icon = iconMap[event.type];
        return (
          <div key={event.id} className="relative flex gap-4 pb-6">
            {i < events.length - 1 && <div className="absolute left-[15px] top-8 h-full w-0.5 bg-gray-200 dark:bg-gray-800" />}
            <div className={cn('relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white', colorMap[event.type])}><Icon className="h-4 w-4" /></div>
            <div className="pt-0.5">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{event.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{event.description}</p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{formatDate(event.timestamp)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
