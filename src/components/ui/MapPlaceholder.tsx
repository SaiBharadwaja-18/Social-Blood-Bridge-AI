import { MapPin } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MapPoint { latitude: number; longitude: number; label: string; type: 'donor' | 'hospital' | 'request'; }
interface MapPlaceholderProps { points: MapPoint[]; className?: string; }

const typeColors = { donor: 'bg-green-500', hospital: 'bg-blue-500', request: 'bg-red-500' };

export function MapPlaceholder({ points, className }: MapPlaceholderProps) {
  const latMin = Math.min(...points.map(p => p.latitude)); const latMax = Math.max(...points.map(p => p.latitude));
  const lngMin = Math.min(...points.map(p => p.longitude)); const lngMax = Math.max(...points.map(p => p.longitude));
  const latRange = latMax - latMin || 1; const lngRange = lngMax - lngMin || 1;
  return (
    <div className={cn('card relative overflow-hidden', className)}>
      <div className="relative h-64 w-full rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        {points.map((point, i) => {
          const x = ((point.longitude - lngMin) / lngRange) * 80 + 10; const y = (1 - (point.latitude - latMin) / latRange) * 80 + 10;
          return (
            <div key={i} className="group absolute" style={{ left: `${x}%`, top: `${y}%` }}>
              <div className={cn('flex h-6 w-6 items-center justify-center rounded-full text-white shadow-md transition-transform hover:scale-125', typeColors[point.type])}><MapPin className="h-3 w-3" /></div>
              <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">{point.label}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-center gap-6">
        {(['donor', 'hospital', 'request'] as const).map(type => (<div key={type} className="flex items-center gap-2"><div className={cn('h-3 w-3 rounded-full', typeColors[type])} /><span className="text-xs capitalize text-gray-600 dark:text-gray-400">{type}</span></div>))}
      </div>
    </div>
  );
}
