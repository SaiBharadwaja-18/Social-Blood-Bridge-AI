import { Award } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { ProgressCard } from '../../components/ui/ProgressCard';
import { achievements } from '../../data/mockData';

export function AchievementsPage() {
  const earnedAchievements = achievements.filter(a => a.earnedAt);
  const inProgressAchievements = achievements.filter(a => !a.earnedAt);
  const completionPercent = (earnedAchievements.length / achievements.length) * 100;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Achievements</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Unlock badges and milestones through your donations
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <StatCard
          title="Total Achievements"
          value={achievements.length}
          icon={<Award className="h-6 w-6" />}
        />
        <StatCard
          title="Earned Badges"
          value={earnedAchievements.length}
          icon={<Award className="h-6 w-6" />}
          change={`${earnedAchievements.length} of ${achievements.length}`}
          changeType="neutral"
        />
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completion</p>
          <p className="text-2xl font-bold tracking-tight">{completionPercent.toFixed(0)}%</p>
          <div className="mt-3 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
            <div
              className="h-2 rounded-full bg-primary-600 dark:bg-primary-400"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Next Achievement Highlight */}
      {inProgressAchievements.length > 0 && (
        <div className="rounded-lg border-2 border-primary-200 bg-primary-50 p-6 dark:border-primary-900/30 dark:bg-primary-900/10">
          <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100">
            Next Achievement: {inProgressAchievements[0].title}
          </h3>
          <p className="mt-2 text-sm text-primary-700 dark:text-primary-300">
            {inProgressAchievements[0].description}
          </p>
          <div className="mt-4">
            <ProgressCard
              title="Progress"
              current={inProgressAchievements[0].progress}
              target={inProgressAchievements[0].target}
              color="bg-primary-600 dark:bg-primary-500"
            />
          </div>
        </div>
      )}

      {/* Earned Achievements */}
      {earnedAchievements.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Earned Badges ({earnedAchievements.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {earnedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="rounded-lg border-2 border-success-200 bg-success-50 p-6 text-center dark:border-success-900/30 dark:bg-success-900/10"
              >
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-200 dark:bg-success-900/30">
                    <Award className="h-8 w-8 text-success-600 dark:text-success-400" />
                  </div>
                </div>
                <h4 className="mt-4 font-semibold text-gray-900 dark:text-white">{achievement.title}</h4>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                <p className="mt-2 text-xs font-medium text-success-700 dark:text-success-400">
                  Unlocked on {achievement.earnedAt && new Date(achievement.earnedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In Progress Achievements */}
      {inProgressAchievements.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            In Progress ({inProgressAchievements.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inProgressAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <Award className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <h4 className="mt-4 text-center font-semibold text-gray-900 dark:text-white">
                  {achievement.title}
                </h4>
                <p className="mt-1 text-center text-sm text-gray-600 dark:text-gray-400">
                  {achievement.description}
                </p>
                <div className="mt-4">
                  <ProgressCard
                    title="Progress"
                    current={achievement.progress}
                    target={achievement.target}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
