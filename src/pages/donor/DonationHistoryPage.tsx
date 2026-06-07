import { Heart, Droplet, Users, Award } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { DataTable } from '../../components/ui/DataTable';
import { achievements, donors } from '../../data/mockData';
import type { Column } from '../../components/ui/DataTable';

interface DonationRecord {
  id: string;
  date: string;
  hospital: string;
  bloodGroup: string;
  status: string;
}

export function DonationHistoryPage() {
  const donor = donors[0];

  const donationHistory: DonationRecord[] = [
    { id: '1', date: '2024-05-22', hospital: 'Agha Khan Hospital', bloodGroup: 'A+', status: 'Completed' },
    { id: '2', date: '2024-04-08', hospital: 'Shaukat Khanum Hospital', bloodGroup: 'A+', status: 'Completed' },
    { id: '3', date: '2024-03-15', hospital: 'Jinnah Hospital', bloodGroup: 'A+', status: 'Completed' },
    { id: '4', date: '2024-02-20', hospital: 'Mayo Hospital', bloodGroup: 'A+', status: 'Completed' },
    { id: '5', date: '2024-01-10', hospital: 'Lahore General Hospital', bloodGroup: 'A+', status: 'Completed' },
    { id: '6', date: '2023-12-05', hospital: 'PIMS Hospital', bloodGroup: 'A+', status: 'Completed' },
  ];

  const columns: Column<DonationRecord>[] = [
    { key: 'date', header: 'Date' },
    { key: 'hospital', header: 'Hospital' },
    { key: 'bloodGroup', header: 'Blood Group' },
    { key: 'status', header: 'Status' },
  ];

  const earnedAchievements = achievements.filter(a => a.earnedAt);
  const lockedAchievements = achievements.filter(a => !a.earnedAt);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Donation History</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track your donations and achievements
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Donations"
          value={donor.donations}
          icon={<Heart className="h-6 w-6" />}
        />
        <StatCard
          title="Units Given"
          value={donor.donations}
          icon={<Droplet className="h-6 w-6" />}
        />
        <StatCard
          title="Lives Impacted"
          value={Math.floor(donor.donations * 3)}
          icon={<Users className="h-6 w-6" />}
        />
        <StatCard
          title="Badges"
          value={earnedAchievements.length}
          icon={<Award className="h-6 w-6" />}
        />
      </div>

      {/* Donation Table */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Donation Records</h2>
        <DataTable
          columns={columns}
          data={donationHistory}
          searchable
          searchPlaceholder="Search by hospital or date..."
          emptyMessage="No donations found"
        />
      </div>

      {/* Achievements Section */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Achievements</h2>

        {/* Earned Achievements */}
        {earnedAchievements.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Earned</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {earnedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="rounded-lg border border-success-200 bg-success-50 p-4 dark:border-success-900/30 dark:bg-success-900/10"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{achievement.title}</h4>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                    </div>
                    <span className="rounded-full bg-success-200 px-2.5 py-0.5 text-xs font-semibold text-success-700 dark:bg-success-900/30 dark:text-success-400">
                      Earned
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Earned on {achievement.earnedAt && new Date(achievement.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <div>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">In Progress</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lockedAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white">{achievement.title}</h4>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {achievement.progress}/{achievement.target}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                      <div
                        className="h-2 rounded-full bg-primary-600 dark:bg-primary-400"
                        style={{
                          width: `${Math.min(100, (achievement.progress / achievement.target) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
