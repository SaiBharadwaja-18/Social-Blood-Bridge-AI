import { useState } from 'react';
import { RequestCard } from '../../components/ui/RequestCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { bloodRequests } from '../../data/mockData';
import { Inbox } from 'lucide-react';
import type { RequestStatus } from '../../types';

export function MyRequestsPage() {
  const [filter, setFilter] = useState<'all' | RequestStatus>('all');
  const displayRequests = bloodRequests.slice(0, 6);

  const filteredRequests = filter === 'all'
    ? displayRequests
    : displayRequests.filter(r => r.status === filter);

  const tabs: { label: string; value: 'all' | RequestStatus }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Fulfilled', value: 'fulfilled' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blood Requests</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Browse and respond to blood requests matching your profile
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 font-semibold transition-colors ${
              filter === tab.value
                ? 'bg-primary-600 text-white dark:bg-primary-500'
                : 'border border-gray-300 text-gray-700 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Requests Grid */}
      {filteredRequests.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request) => (
            <div key={request.id}>
              <RequestCard request={request} basePath="/donor/requests" />
              <div className="mt-2 flex gap-2">
                <button className="flex-1 rounded-lg bg-success-600 px-3 py-2 text-sm font-semibold text-white hover:bg-success-700 transition-colors dark:bg-success-500 dark:hover:bg-success-600">
                  Accept
                </button>
                <button className="flex-1 rounded-lg bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                  Maybe Later
                </button>
                <button className="flex-1 rounded-lg bg-accent-600 px-3 py-2 text-sm font-semibold text-white hover:bg-accent-700 transition-colors dark:bg-accent-500 dark:hover:bg-accent-600">
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Inbox className="h-8 w-8 text-gray-400" />}
          title="No requests found"
          description={`No ${filter === 'all' ? 'blood' : filter} requests available at the moment. Check back soon!`}
        />
      )}
    </div>
  );
}
