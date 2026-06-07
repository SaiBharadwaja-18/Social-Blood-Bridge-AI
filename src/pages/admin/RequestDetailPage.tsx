import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { bloodRequests, donors, aiRankings, timelineEvents } from '../../data/mockData';
import { bloodGroupColor, priorityColor, statusColor, formatDate } from '../../utils/helpers';
import { DonorCard } from '../../components/ui/DonorCard';
import { ProgressCard } from '../../components/ui/ProgressCard';
import { Timeline } from '../../components/ui/Timeline';
import { ChartCard } from '../../components/ui/ChartCard';
import { cn } from '../../utils/cn';

export function RequestDetailPage() {
  useParams();
  const request = bloodRequests[0];
  const eligibleDonors = donors.filter(d => d.bloodGroup === request.bloodGroup && d.eligibilityStatus === 'eligible').slice(0, 4);
  const rankedDonors = aiRankings.slice(0, 5);

  return (
    <div className="space-y-6">
      <Link to="/admin/requests" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
        <ArrowLeft className="h-4 w-4" />
        Back to Requests
      </Link>

      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{request.id}</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">{request.hospital}</p>
          </div>
          <div className="flex gap-2">
            <span className={cn('badge', priorityColor(request.priority))}>{request.priority}</span>
            <span className={cn('badge', statusColor(request.status))}>{request.status}</span>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">Blood Group</p>
            <p className={cn('mt-1 inline-block rounded-lg px-2.5 py-0.5 text-sm font-semibold', bloodGroupColor(request.bloodGroup))}>{request.bloodGroup}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{request.location}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">Required Date</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{formatDate(request.requiredDate)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{formatDate(request.createdAt)}</p>
          </div>
        </div>

        {request.notes && (
          <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-400">Notes</p>
            <p className="mt-1 text-sm text-blue-800 dark:text-blue-300">{request.notes}</p>
          </div>
        )}
      </div>

      <ProgressCard
        title="Units Fulfillment"
        current={request.unitsSecured}
        target={request.unitsRequired}
        unit="units"
        color="bg-primary-500"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartCard title="Activity Timeline">
            <Timeline events={timelineEvents} />
          </ChartCard>
        </div>

        <ChartCard title="Fulfillment Stats">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Units Required</span>
              <span className="font-semibold text-gray-900 dark:text-white">{request.unitsRequired}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Units Secured</span>
              <span className="font-semibold text-gray-900 dark:text-white">{request.unitsSecured}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Units Pending</span>
              <span className="font-semibold text-gray-900 dark:text-white">{Math.max(0, request.unitsRequired - request.unitsSecured)}</span>
            </div>
            <div className="border-t border-gray-200 pt-4 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Fulfillment %</span>
                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{request.unitsRequired > 0 ? ((request.unitsSecured / request.unitsRequired) * 100).toFixed(0) : 0}%</span>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title={`Eligible Donors (${eligibleDonors.length})`}>
          <div className="space-y-3">
            {eligibleDonors.map(donor => (
              <DonorCard key={donor.id} donor={donor} compact basePath="/admin/donors" />
            ))}
          </div>
        </ChartCard>

        <ChartCard title={`Top Ranked Donors (${rankedDonors.length})`}>
          <div className="space-y-3">
            {rankedDonors.map(ranking => {
              return (
                <div key={ranking.donorId} className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-800/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">#{ranking.rank} {ranking.donorName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Overall Score: {ranking.overallScore}</p>
                    </div>
                    <span className={cn('badge text-sm', bloodGroupColor(ranking.bloodGroup))}>{ranking.bloodGroup}</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Reliability</span>
                      <span className="font-medium text-gray-900 dark:text-white">{ranking.reliabilityScore.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Acceptance</span>
                      <span className="font-medium text-gray-900 dark:text-white">{ranking.acceptanceProbability.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
