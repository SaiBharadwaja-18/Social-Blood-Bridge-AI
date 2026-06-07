import { ChartCard } from '../../components/ui/ChartCard';
import { donors } from '../../data/mockData';
import { bloodGroupColor } from '../../utils/helpers';
import type { Donor } from '../../types';
import { cn } from '../../utils/cn';

interface WorkflowDonor {
  donor: Donor;
  status: string;
  respondedAt: string;
}

export function BackupWorkflowPage() {
  const primaryDonors: WorkflowDonor[] = donors.slice(0, 5).map(d => ({
    donor: d,
    status: 'pending',
    respondedAt: '',
  }));

  const acceptedPrimary: WorkflowDonor[] = donors.slice(0, 2).map(d => ({
    donor: d,
    status: 'accepted',
    respondedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  }));

  const activatedBackups: WorkflowDonor[] = donors.slice(10, 12).map(d => ({
    donor: d,
    status: 'activated',
    respondedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  }));

  const confirmedDonors: WorkflowDonor[] = donors.slice(2, 4).map(d => ({
    donor: d,
    status: 'accepted',
    respondedAt: new Date().toISOString(),
  }));

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      accepted: 'badge-success',
      declined: 'badge-error',
      pending: 'badge-warning',
      activated: 'badge-info',
    };
    return colors[status] || 'badge-info';
  };

  const WorkflowDonorCard = ({ wd }: { wd: WorkflowDonor }) => (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{wd.donor.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{wd.donor.id}</p>
        </div>
        <div className="flex gap-2">
          <span className={cn('badge text-sm', bloodGroupColor(wd.donor.bloodGroup))}>{wd.donor.bloodGroup}</span>
          <span className={cn('badge', getStatusBadge(wd.status))}>{wd.status}</span>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
        <p>Reliability: {wd.donor.reliabilityScore.toFixed(1)}%</p>
        <p>Acceptance: {wd.donor.acceptanceRate.toFixed(1)}%</p>
      </div>
      {wd.respondedAt && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Responded: {new Date(wd.respondedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Backup Workflow</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Track the backup donor activation workflow</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Step 1</p>
          <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Primary Selected</p>
          <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">{primaryDonors.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Step 2</p>
          <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Primary Response</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{acceptedPrimary.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Step 3</p>
          <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Backup Activated</p>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{activatedBackups.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Step 4</p>
          <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Confirmed</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{confirmedDonors.length}</p>
        </div>
      </div>

      <ChartCard title="Step 1: Primary Donors Selected">
        <div className="space-y-3">
          {primaryDonors.map(wd => (
            <WorkflowDonorCard key={wd.donor.id} wd={wd} />
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Step 2: Primary Response">
        <div className="space-y-3">
          {acceptedPrimary.map(wd => (
            <WorkflowDonorCard key={wd.donor.id} wd={wd} />
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Step 3: Backup Donors Activated">
        <div className="space-y-3">
          {activatedBackups.length > 0 ? (
            activatedBackups.map(wd => (
              <WorkflowDonorCard key={wd.donor.id} wd={wd} />
            ))
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-800 dark:bg-gray-800/50">
              <p className="text-sm text-gray-500 dark:text-gray-400">No backups activated yet</p>
            </div>
          )}
        </div>
      </ChartCard>

      <ChartCard title="Step 4: Confirmed Donors">
        <div className="space-y-3">
          {confirmedDonors.map(wd => (
            <WorkflowDonorCard key={wd.donor.id} wd={wd} />
          ))}
        </div>
      </ChartCard>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">Average Response Time</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">42 min</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">Fulfillment Rate</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">85%</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">Backup Activation Rate</p>
          <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">23%</p>
        </div>
      </div>
    </div>
  );
}
