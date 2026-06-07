import { cn } from '../../utils/cn';
import type { Donor } from '../../types';
import { bloodGroupColor, eligibilityColor, donorStatusColor } from '../../utils/helpers';
import { MapPin, Award, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DonorCardProps { donor: Donor; compact?: boolean; basePath?: string; }
export function DonorCard({ donor, compact, basePath = '/admin/donors' }: DonorCardProps) {
  return (
    <Link to={`${basePath}/${donor.id}`} className="card block transition-all hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">{donor.name.split(' ').map(n => n[0]).join('')}</div>
          <div><p className="text-sm font-semibold text-gray-900 dark:text-white">{donor.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{donor.id}</p></div>
        </div>
        <span className={cn('badge', bloodGroupColor(donor.bloodGroup))}>{donor.bloodGroup}</span>
      </div>
      {!compact && (
        <div className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
          <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-gray-400" /><span className="text-xs text-gray-600 dark:text-gray-400">{donor.location}</span></div>
          <div className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-gray-400" /><span className="text-xs text-gray-600 dark:text-gray-400">{donor.reliabilityScore}%</span></div>
          <div className="flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-gray-400" /><span className="text-xs text-gray-600 dark:text-gray-400">{donor.donations} donations</span></div>
        </div>
      )}
      <div className="mt-3 flex gap-2">
        <span className={cn('badge', eligibilityColor(donor.eligibilityStatus))}>{donor.eligibilityStatus.replace('_', ' ')}</span>
        <span className={cn('badge', donorStatusColor(donor.status))}>{donor.status}</span>
      </div>
    </Link>
  );
}
