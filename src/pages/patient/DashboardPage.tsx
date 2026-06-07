import { useState, useEffect } from 'react';
import { Heart, Droplets, Clock, AlertCircle, Loader2, RefreshCw, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAllRequests } from '../../services/requestService';
import { getMyNotifications, markAsRead } from '../../services/notificationService';
import { api } from '../../services/api';
import { cn } from '../../utils/cn';

export function PatientDashboardPage() {
  const { user }        = useAuth();
  const [requests,      setRequests]      = useState<any[]>([]);
  const [cycle,         setCycle]         = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const [reqData, notifData] = await Promise.all([
        getAllRequests(),
        getMyNotifications(),
      ]);

      setRequests(reqData);
      setNotifications(notifData.notifications?.slice(0, 3) || []);

      // Try to get transfusion cycle
      try {
        const cycleData = await api.get<any>(`/requests/cycle/${user.user_id}`);
        setCycle(cycleData);
      } catch {
        setCycle(null);
      }

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

  // Stats
  const totalRequests     = requests.length;
  const activeRequests    = requests.filter(r => ['pending', 'matching', 'active'].includes(r.status)).length;
  const fulfilledRequests = requests.filter(r => r.status === 'fulfilled').length;
  const unreadCount       = notifications.filter(n => !n.read).length;

  // Days until next transfusion
  const daysUntilNext = cycle?.next_transfusion_date
    ? Math.max(0, Math.ceil((new Date(cycle.next_transfusion_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const statusStyle = (status: string) => {
    switch (status) {
      case 'fulfilled':  return { bg: '#dcfce7', color: '#16a34a' };
      case 'pending':    return { bg: '#fff1f2', color: '#e11d48' };
      case 'matching':   return { bg: '#eff6ff', color: '#2563eb' };
      case 'active':     return { bg: '#fef9c3', color: '#ca8a04' };
      case 'cancelled':  return { bg: '#f3f4f6', color: '#6b7280' };
      default:           return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  return (
    <div className="p-6 space-y-6" style={{ backgroundColor: '#fff1f2', minHeight: '100vh' }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>
            Welcome, {user?.name?.split(' ')[0] || 'Patient'}! 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>
            Your blood support overview — live data
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

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: 'Total Requests',
            value: totalRequests,
            icon: Droplets,
            desc: 'Lifetime requests',
          },
          {
            label: 'Active Requests',
            value: activeRequests,
            icon: AlertCircle,
            desc: 'Pending fulfillment',
          },
          {
            label: 'Fulfilled',
            value: fulfilledRequests,
            icon: Heart,
            desc: 'Completed transfusions',
          },
          {
            label: 'Next Transfusion',
            value: daysUntilNext !== null ? `${daysUntilNext}d` : '—',
            icon: Clock,
            desc: daysUntilNext !== null
              ? daysUntilNext <= 3
                ? '⚠️ Due very soon!'
                : `Due ${cycle?.next_transfusion_date}`
              : 'No cycle set',
          },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-5"
            style={{ backgroundColor: '#ffffff', border: '1px solid #ffe4e6' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold tracking-widest uppercase"
                style={{ color: '#9ca3af' }}>{s.label}</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: '#fff1f2' }}>
                <s.icon className="h-4 w-4" style={{ color: '#e11d48' }} />
              </div>
            </div>
            <p className="text-3xl font-bold" style={{ color: '#e11d48' }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Transfusion Alert */}
      {cycle && daysUntilNext !== null && daysUntilNext <= 7 && (
        <div className="rounded-2xl p-4 flex items-center gap-3"
          style={{
            backgroundColor: daysUntilNext <= 3 ? '#fff1f2' : '#fef9c3',
            border: `1.5px solid ${daysUntilNext <= 3 ? '#fda4af' : '#fde68a'}`,
          }}>
          <Zap className="h-5 w-5" style={{ color: daysUntilNext <= 3 ? '#e11d48' : '#ca8a04' }} />
          <div>
            <p className="font-bold text-sm" style={{ color: daysUntilNext <= 3 ? '#e11d48' : '#ca8a04' }}>
              {daysUntilNext <= 3
                ? `🚨 Transfusion due in ${daysUntilNext} days!`
                : `⏰ Transfusion due in ${daysUntilNext} days`}
            </p>
            <p className="text-xs" style={{ color: '#6b7280' }}>
              {cycle.quantity_required} unit(s) required — {cycle.next_transfusion_date}
              {cycle.auto_request_enabled && ' — Auto-request enabled ✅'}
            </p>
          </div>
        </div>
      )}

      {/* Recent Blood Requests */}
      <div className="rounded-2xl p-6"
        style={{ backgroundColor: '#ffffff', border: '1px solid #ffe4e6' }}>
        <h2 className="text-base font-bold mb-4" style={{ color: '#111827' }}>
          Recent Blood Requests
        </h2>
        {requests.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No blood requests yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {requests.slice(0, 5).map((r: any) => {
              const style = statusStyle(r.status);
              return (
                <div key={r.request_id}
                  className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ backgroundColor: '#fff1f2', border: '1px solid #ffe4e6' }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full font-bold text-sm"
                      style={{ backgroundColor: '#ffe4e6', color: '#e11d48' }}>
                      {r.blood_group}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                        {r.request_id?.slice(0, 8)}...
                      </p>
                      <p className="text-xs" style={{ color: '#9ca3af' }}>
                        {r.units_required} unit(s) · {r.hospital} ·{' '}
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString('en-IN')
                          : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.auto_triggered && (
                      <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700">
                        🤖 Auto
                      </span>
                    )}
                    <span className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ backgroundColor: style.bg, color: style.color }}>
                      {r.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Transfusion Schedule */}
      {cycle && (
        <div className="rounded-2xl p-6"
          style={{ backgroundColor: '#ffffff', border: '1px solid #ffe4e6' }}>
          <h2 className="text-base font-bold mb-4" style={{ color: '#111827' }}>
            Transfusion Schedule
          </h2>
          <div className="flex items-center gap-4 rounded-xl p-4"
            style={{ backgroundColor: '#fff1f2' }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: '#ffe4e6' }}>
              <Heart className="h-6 w-6" style={{ color: '#e11d48' }} />
            </div>
            <div>
              <p className="font-semibold" style={{ color: '#111827' }}>
                Next Scheduled Transfusion
              </p>
              <p className="text-sm" style={{ color: '#9ca3af' }}>
                {cycle.next_transfusion_date
                  ? new Date(cycle.next_transfusion_date).toLocaleDateString('en-IN', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })
                  : '—'}
                {' '}· {user?.hospital_name || 'Hospital TBD'}
              </p>
              <p className="text-sm" style={{ color: '#9ca3af' }}>
                Blood Group: {user?.blood_group} ·{' '}
                {cycle.quantity_required} Unit(s) ·{' '}
                Every {cycle.frequency_days} days
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="rounded-2xl p-6"
          style={{ backgroundColor: '#ffffff', border: '1px solid #ffe4e6' }}>
          <h2 className="text-base font-bold mb-4" style={{ color: '#111827' }}>
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-bold text-white"
                style={{ backgroundColor: '#e11d48' }}>
                {unreadCount}
              </span>
            )}
          </h2>
          <div className="space-y-3">
            {notifications.map((notif: any) => (
              <div key={notif.notification_id}
                className={cn(
                  'rounded-xl border p-3 flex items-start justify-between gap-3',
                  notif.read
                    ? 'border-gray-200 bg-gray-50'
                    : 'border-rose-200 bg-rose-50'
                )}>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#111827' }}>
                    {notif.title}
                    {!notif.read && (
                      <span className="ml-2 inline-flex rounded-full px-2 py-0.5 text-xs font-bold text-white"
                        style={{ backgroundColor: '#e11d48' }}>New</span>
                    )}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{notif.message}</p>
                </div>
                {!notif.read && (
                  <button onClick={() => handleMarkRead(notif.notification_id)}
                    className="text-xs font-semibold px-2 py-1 rounded-lg border border-gray-200 text-gray-600 hover:text-rose-600 whitespace-nowrap">
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}