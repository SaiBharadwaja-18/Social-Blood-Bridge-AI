import { useState, useEffect } from 'react';
import { Heart, CheckCircle2, Award, TrendingUp, Zap, Bell, Loader2, RefreshCw } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { useAuth } from '../../context/AuthContext';
import { getDonorById, getDonorHistory } from '../../services/donorService';
import { getMyNotifications, markAsRead } from '../../services/notificationService';
import { getAllRequests } from '../../services/requestService';
import { cn } from '../../utils/cn';

export function DonorDashboardPage() {
  const { user }        = useAuth();
  const [donor,         setDonor]         = useState<any>(null);
  const [history,       setHistory]       = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [requests,      setRequests]      = useState<any[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const [donorData, historyData, notifData, reqData] = await Promise.all([
        getDonorById(user.user_id),
        getDonorHistory(user.user_id),
        getMyNotifications(),
        getAllRequests(),
      ]);
      setDonor(donorData);
      setHistory(historyData.slice(0, 3));
      setNotifications(notifData.notifications?.slice(0, 3) || []);
      const compatible = reqData.filter((r: any) =>
        r.blood_group === donorData?.blood_group &&
        ['pending', 'matching', 'active'].includes(r.status)
      ).slice(0, 3);
      setRequests(compatible);
    } catch (err: any) {
      setError('Failed to load dashboard: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    setNotifications(prev => prev.map(n =>
      n.notification_id === id ? { ...n, read: true } : n
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" style={{ color: '#e11d48' }} />
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const totalDonations    = donor?.donations_till_date || 0;
  const eligibilityStatus = donor?.eligibility_status || 'unknown';
  const isEligible        = eligibilityStatus === 'eligible';
  const unreadCount       = notifications.filter(n => !n.read).length;

  const badges = [];
  if (totalDonations >= 1)        badges.push('First Donation 🩸');
  if (totalDonations >= 5)        badges.push('Regular Donor ⭐');
  if (totalDonations >= 10)       badges.push('Champion Donor 🏆');
  if (donor?.available_emergency) badges.push('Emergency Ready ⚡');

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome, {user?.name?.split(' ')[0] || 'Donor'}! 👋
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Here's your donation dashboard and recent activity
          </p>
        </div>
        <button onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: '#e11d48' }}>
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl p-4 bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Eligibility Banner */}
      <div className={cn(
        'rounded-xl p-4 flex items-center gap-3',
        isEligible ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
      )}>
        {isEligible
          ? <CheckCircle2 className="h-5 w-5 text-green-600" />
          : <Bell className="h-5 w-5 text-yellow-600" />}
        <div>
          <p className={cn('font-semibold text-sm', isEligible ? 'text-green-700' : 'text-yellow-700')}>
            {isEligible ? '✅ You are eligible to donate!' : '⏳ You are currently not eligible to donate'}
          </p>
          <p className={cn('text-xs', isEligible ? 'text-green-600' : 'text-yellow-600')}>
            Blood Group: <strong>{donor?.blood_group || user?.blood_group}</strong>
            {donor?.next_eligible_date && !isEligible &&
              ` — Eligible from: ${new Date(donor.next_eligible_date).toLocaleDateString()}`}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Pending Requests"
          value={requests.length}
          icon={<Bell className="h-6 w-6" />}
          change={`${requests.length} matching your blood group`}
          changeType="positive"
        />
        <StatCard
          title="Completed Donations"
          value={totalDonations}
          icon={<Heart className="h-6 w-6" />}
          change={donor?.last_donation_date
            ? `Last: ${new Date(donor.last_donation_date).toLocaleDateString()}`
            : 'No donations yet'}
          changeType="neutral"
        />
        <StatCard
          title="Eligibility Status"
          value={isEligible ? 'Eligible' : 'Not Eligible'}
          icon={<CheckCircle2 className="h-6 w-6" />}
          change={isEligible ? 'Ready to donate' : 'Check back later'}
          changeType={isEligible ? 'positive' : 'negative'}
        />
        <StatCard
          title="Response Rate"
          value={donor?.calls_to_donations_ratio
            ? `${Math.min(100, Math.round((1 / parseFloat(donor.calls_to_donations_ratio)) * 100))}%`
            : 'N/A'}
          icon={<TrendingUp className="h-6 w-6" />}
          change="Based on call history"
          changeType="positive"
        />
        <StatCard
          title="Donor Type"
          value={donor?.donor_type || 'One-Time'}
          icon={<Zap className="h-6 w-6" />}
          change={`Active: ${donor?.user_donation_active_status || 'Unknown'}`}
          changeType="neutral"
        />
        <StatCard
          title="Badges Earned"
          value={badges.length}
          icon={<Award className="h-6 w-6" />}
          change={badges.slice(0, 2).join(', ') || 'Start donating!'}
          changeType="positive"
        />
      </div>

      {/* Blood Requests */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          🩸 Blood Requests Matching Your Group ({donor?.blood_group || user?.blood_group})
        </h2>
        {requests.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-8 text-center">
            <p className="text-gray-500">No active requests for your blood group right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {requests.map((req: any) => (
              <div key={req.request_id}
                className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-bold"
                      style={{ backgroundColor: '#fff1f2', color: '#e11d48' }}>
                      {req.blood_group}
                    </span>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white mt-1">{req.hospital}</p>
                    <p className="text-xs text-gray-500">{req.hospital_location || '—'}</p>
                  </div>
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-semibold',
                    req.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                    req.urgency === 'high'     ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  )}>
                    {req.urgency}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  {req.units_required} unit(s) needed
                  {req.required_date && ` by ${new Date(req.required_date).toLocaleDateString()}`}
                </p>
                <div className="flex gap-2">
                  <button className="flex-1 rounded-lg py-2 text-xs font-semibold text-white"
                    style={{ backgroundColor: '#10b981' }}>✅ Accept</button>
                  <button className="flex-1 rounded-lg py-2 text-xs font-semibold"
                    style={{ backgroundColor: '#f3f4f6', color: '#374151' }}>Later</button>
                  <button className="flex-1 rounded-lg py-2 text-xs font-semibold text-white"
                    style={{ backgroundColor: '#ef4444' }}>❌ Decline</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Donation History */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Recent Donations</h2>
        {history.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No donation history yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((donation: any) => (
              <div key={donation.donation_id}
                className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 dark:border-gray-800">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{donation.hospital}</p>
                  <p className="text-sm text-gray-500">{new Date(donation.date).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">{donation.units} unit(s)</p>
                  <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700">
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Recent Notifications
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-bold text-white"
              style={{ backgroundColor: '#e11d48' }}>
              {unreadCount} new
            </span>
          )}
        </h2>
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-sm">No notifications yet.</p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif: any) => (
              <div key={notif.notification_id}
                className={cn(
                  'rounded-xl border p-4',
                  notif.read
                    ? 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
                    : 'border-rose-200 bg-rose-50 dark:border-rose-900/30'
                )}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">
                      {notif.title}
                      {!notif.read && (
                        <span className="ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-bold text-white"
                          style={{ backgroundColor: '#e11d48' }}>New</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.created_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                  {!notif.read && (
                    <button onClick={() => handleMarkRead(notif.notification_id)}
                      className="text-xs font-semibold px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:text-rose-600">
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">🏅 Your Badges</h2>
          <div className="flex flex-wrap gap-3">
            {badges.map((badge, i) => (
              <span key={i} className="rounded-full px-4 py-2 text-sm font-semibold"
                style={{ backgroundColor: '#fff1f2', color: '#e11d48', border: '1px solid #fda4af' }}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}