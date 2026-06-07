import { PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StatCard } from '../../components/ui/StatCard';
import { ChartCard } from '../../components/ui/ChartCard';
import { analyticsData, monthlyTrends, bloodGroupDistribution, donationParticipation, geographicDistribution, fulfillmentPerformance } from '../../data/mockData';
import { TrendingUp, Users, Clock, CheckCircle, Award, Droplet } from 'lucide-react';

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

export function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Comprehensive system analytics and performance metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Requests"
          value={analyticsData.totalRequests}
          icon={<Users className="h-6 w-6" />}
          change="+15.3%"
          changeType="positive"
        />
        <StatCard
          title="Completed Requests"
          value={analyticsData.completedRequests}
          icon={<CheckCircle className="h-6 w-6" />}
          change="+8.5%"
          changeType="positive"
        />
        <StatCard
          title="Avg Fulfillment Time"
          value={`${analyticsData.averageFulfillmentTime.toFixed(1)}h`}
          icon={<Clock className="h-6 w-6" />}
          change="-2.4%"
          changeType="positive"
        />
        <StatCard
          title="Acceptance Rate"
          value={`${analyticsData.acceptanceRate.toFixed(1)}%`}
          icon={<TrendingUp className="h-6 w-6" />}
          change="+3.2%"
          changeType="positive"
        />
        <StatCard
          title="Reliability Average"
          value={`${analyticsData.reliabilityAverage.toFixed(1)}%`}
          icon={<Award className="h-6 w-6" />}
          change="+1.8%"
          changeType="positive"
        />
        <StatCard
          title="Units Collected"
          value={analyticsData.unitsCollected}
          icon={<Droplet className="h-6 w-6" />}
          change="+12.7%"
          changeType="positive"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Monthly Trends" subtitle="Requests and donations by month">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="donations" fill="#8b5cf6" stroke="#8b5cf6" name="Donations" />
              <Area type="monotone" dataKey="requests" fill="#06b6d4" stroke="#06b6d4" name="Requests" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Blood Group Distribution" subtitle="Units by blood type">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bloodGroupDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }: { name?: string; value?: number }) => `${name ?? ''}: ${value ?? 0}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                nameKey="group"
              >
                {bloodGroupDistribution.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Donation Participation" subtitle="Monthly participation trends">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={donationParticipation}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="participated" fill="#10b981" name="Participated" />
              <Bar dataKey="declined" fill="#ef4444" name="Declined" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Geographic Distribution" subtitle="Donors and requests by location">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={geographicDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="location" stroke="#6b7280" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Bar dataKey="donors" fill="#8b5cf6" name="Donors" />
              <Bar dataKey="requests" fill="#f59e0b" name="Requests" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fulfillment Performance" subtitle="Monthly fulfillment rate and avg time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fulfillmentPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} name="Fulfillment %" />
              <Line type="monotone" dataKey="avgTime" stroke="#06b6d4" strokeWidth={2} name="Avg Time (h)" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900/30 dark:bg-blue-900/10">
        <h3 className="font-semibold text-blue-900 dark:text-blue-400">Key Insights</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium">Highest Demand</p>
            <p className="mt-1">O+ blood group shows 45% higher demand than supply</p>
          </div>
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium">Response Rate</p>
            <p className="mt-1">Karachi and Lahore have 78% faster response times</p>
          </div>
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium">Peak Hours</p>
            <p className="mt-1">Most requests created between 9 AM - 2 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
}
