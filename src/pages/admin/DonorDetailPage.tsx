import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { donors, monthlyTrends } from '../../data/mockData';
import { bloodGroupColor, formatDate } from '../../utils/helpers';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DataTable } from '../../components/ui/DataTable';
import { ChartCard } from '../../components/ui/ChartCard';
import { Timeline } from '../../components/ui/Timeline';
import { cn } from '../../utils/cn';
import type { TimelineEvent } from '../../types';

export function DonorDetailPage() {
  useParams();
  const donor = donors[0];

  const donationHistory = [
    { id: 1, date: '2024-05-15', units: 450, hospital: 'Agha Khan Hospital', status: 'completed' },
    { id: 2, date: '2024-04-20', units: 450, hospital: 'Mayo Hospital', status: 'completed' },
    { id: 3, date: '2024-03-10', units: 450, hospital: 'PIMS Hospital', status: 'completed' },
    { id: 4, date: '2024-02-05', units: 450, hospital: 'Jinnah Hospital', status: 'completed' },
    { id: 5, date: '2024-01-15', units: 450, hospital: 'Holy Family Hospital', status: 'completed' },
  ];

  const columns = [
    { key: 'date', header: 'Date', render: (item: typeof donationHistory[0]) => formatDate(item.date) },
    { key: 'units', header: 'Units Donated' },
    { key: 'hospital', header: 'Hospital' },
    { key: 'status', header: 'Status', render: (item: typeof donationHistory[0]) => <span className="badge badge-success capitalize">{item.status}</span> },
  ];

  const timelineEvents: TimelineEvent[] = [
    { id: '1', title: 'Profile Created', description: `${donor.name} joined as a donor`, timestamp: donor.createdAt, type: 'created' },
    { id: '2', title: 'First Donation', description: 'First blood donation completed', timestamp: donor.lastDonationDate, type: 'fulfilled' },
    { id: '3', title: '5 Donations Milestone', description: 'Reached 5 successful donations', timestamp: formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]), type: 'ranked' },
  ];

  const reliabilityTrend = monthlyTrends.map(m => ({ month: m.month, reliability: 75 + Math.random() * 20 }));
  const acceptanceTrend = monthlyTrends.map(m => ({ month: m.month, acceptance: 60 + Math.random() * 35 }));

  return (
    <div className="space-y-6">
      <Link to="/admin/donors" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
        <ArrowLeft className="h-4 w-4" />
        Back to Donors
      </Link>

      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{donor.name}</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">{donor.id}</p>
          </div>
          <span className={cn('badge text-lg', bloodGroupColor(donor.bloodGroup))}>{donor.bloodGroup}</span>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{donor.email}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{donor.phone}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{donor.location}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">Joined</p>
            <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{formatDate(donor.createdAt)}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Donations</p>
            <p className="mt-2 text-3xl font-bold text-primary-600 dark:text-primary-400">{donor.donations}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">Reliability Score</p>
            <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">{donor.reliabilityScore.toFixed(1)}%</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50">
            <p className="text-sm text-gray-500 dark:text-gray-400">Acceptance Rate</p>
            <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">{donor.acceptanceRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Donation History">
          <DataTable
            columns={columns}
            data={donationHistory}
            pageSize={5}
            searchable={false}
            emptyMessage="No donations found"
          />
        </ChartCard>

        <ChartCard title="Activity Timeline">
          <Timeline events={timelineEvents} />
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Reliability Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reliabilityTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="reliability" stroke="#10b981" strokeWidth={2} name="Reliability %" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Acceptance Trend">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={acceptanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="acceptance" fill="#06b6d4" name="Acceptance %" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
