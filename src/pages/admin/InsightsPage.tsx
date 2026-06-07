import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartCard } from '../../components/ui/ChartCard';
import { DonorCard } from '../../components/ui/DonorCard';
import { DataTable } from '../../components/ui/DataTable';
import { insightData } from '../../data/mockData';

export function InsightsPage() {
  const reliabilityDistribution = [
    { range: '90-100%', count: 15 },
    { range: '80-89%', count: 28 },
    { range: '70-79%', count: 32 },
    { range: '60-69%', count: 18 },
    { range: '<60%', count: 7 },
  ];

  const participationDistribution = [
    { donations: '1-5', donors: 12 },
    { donations: '6-10', donors: 18 },
    { donations: '11-15', donors: 22 },
    { donations: '16-20', donors: 14 },
    { donations: '20+', donors: 8 },
  ];

  const demandForecast = [
    { month: 'Jun', forecast: 45 },
    { month: 'Jul', forecast: 52 },
    { month: 'Aug', forecast: 48 },
    { month: 'Sep', forecast: 55 },
    { month: 'Oct', forecast: 60 },
    { month: 'Nov', forecast: 58 },
  ];

  const columns = [
    { key: 'month', header: 'Month' },
    { key: 'units', header: 'Predicted Units' },
    { key: 'bloodGroup', header: 'Blood Group' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Insights</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Deep insights into donor performance and demand patterns</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title={`Most Reliable Donors (${insightData.mostReliableDonors.length})`}>
          <div className="space-y-3">
            {insightData.mostReliableDonors.map(donor => (
              <DonorCard key={donor.id} donor={donor} compact basePath="/admin/donors" />
            ))}
          </div>
        </ChartCard>

        <ChartCard title={`Most Active Donors (${insightData.mostActiveDonors.length})`}>
          <div className="space-y-3">
            {insightData.mostActiveDonors.map(donor => (
              <DonorCard key={donor.id} donor={donor} compact basePath="/admin/donors" />
            ))}
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Shortage Areas">
        <div className="space-y-3">
          {insightData.shortageAreas.map((area, idx) => (
            <div key={idx} className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/10">
              <p className="font-semibold text-red-900 dark:text-red-400">{area}</p>
              <p className="mt-1 text-sm text-red-800 dark:text-red-300">Critical shortage detected. Immediate action needed.</p>
            </div>
          ))}
        </div>
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Reliability Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reliabilityDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="range" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" name="Donors" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Participation Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={participationDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="donations" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Bar dataKey="donors" fill="#8b5cf6" name="Donors" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Demand Forecast">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={demandForecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="forecast" fill="#f59e0b" stroke="#f59e0b" name="Predicted Units" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Upcoming Demand Forecast">
        <DataTable
          columns={columns}
          data={insightData.upcomingDemand}
          pageSize={6}
          searchable={false}
          emptyMessage="No forecast data available"
        />
      </ChartCard>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Donor Reliability</p>
          <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">78.2%</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">↑ 2.1% from last month</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">Fulfillment Rate</p>
          <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">92%</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">↑ 5.3% from last month</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
          <p className="mt-2 text-3xl font-bold text-orange-600 dark:text-orange-400">34 min</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">↓ 8 min from last month</p>
        </div>
      </div>
    </div>
  );
}
