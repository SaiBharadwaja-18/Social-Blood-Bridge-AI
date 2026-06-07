import { cn } from '../../utils/cn';
import type { BloodRequest } from '../../types';
import { bloodGroupColor, priorityColor, statusColor, formatDate } from '../../utils/helpers';
import { Building2, Calendar, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RequestCardProps { request: BloodRequest; basePath?: string; }
export function RequestCard({ request, basePath = '/admin/requests' }: RequestCardProps) {
  return (
    <Link to={`${basePath}/${request.id}`} className="card block transition-all hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800">
      <div className="flex items-start justify-between">
        <div><p className="text-sm font-semibold text-gray-900 dark:text-white">{request.id}</p><p className="text-xs text-gray-500 dark:text-gray-400">{request.hospital}</p></div>
        <span className={cn('badge text-sm', bloodGroupColor(request.bloodGroup))}>{request.bloodGroup}</span>
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"><Building2 className="h-3.5 w-3.5" /><span>{request.location}</span></div>
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400"><Calendar className="h-3.5 w-3.5" /><span>Required by {formatDate(request.requiredDate)}</span></div>
        {request.priority === 'critical' && <div className="flex items-center gap-2 text-xs text-accent-600 dark:text-accent-400"><AlertTriangle className="h-3.5 w-3.5" /><span className="font-semibold">Critical Priority</span></div>}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
        <div className="flex gap-2"><span className={cn('badge', priorityColor(request.priority))}>{request.priority}</span><span className={cn('badge', statusColor(request.status))}>{request.status}</span></div>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{request.unitsSecured}/{request.unitsRequired} units</p>
      </div>
    </Link>
  );
}
