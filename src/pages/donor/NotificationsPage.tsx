import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Loader2, RefreshCw } from 'lucide-react';
import { getMyNotifications, markAsRead, markAllRead } from '../../services/notificationService';
import { EmptyState } from '../../components/ui/EmptyState';
import { cn } from '../../utils/cn';

const typeIcon = (type: string) => {
  switch (type) {
    case 'request':  return '🩸';
    case 'reminder': return '⏰';
    case 'system':   return '⚙️';
    default:         return '🔔';
  }
};

const typeColor = (type: string) => {
  switch (type) {
    case 'request':  return { bg: '#fff1f2', border: '#fda4af', badge: 'bg-red-100 text-red-700' };
    case 'reminder': return { bg: '#fefce8', border: '#fde68a', badge: 'bg-yellow-100 text-yellow-700' };
    case 'system':   return { bg: '#eff6ff', border: '#bfdbfe', badge: 'bg-blue-100 text-blue-700' };
    default:         return { bg: '#f0fdf4', border: '#86efac', badge: 'bg-green-100 text-green-700' };
  }
};

const timeAgo = (dateStr: string) => {
  try {
    const diff  = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days  = Math.floor(hours / 24);
    if (days > 0)  return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (mins > 0)  return `${mins}m ago`;
    return 'Just now';
  } catch { return '—'; }
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [success,       setSuccess]       = useState('');
  const [filter,        setFilter]        = useState<'all' | 'unread' | 'request' | 'reminder' | 'system'>('all');

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyNotifications();
      setNotifications(res.notifications || []);
    } catch (err: any) {
      setError('Failed to load: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  // ── Mark one read ───────────────────────────────────────────────────────────
  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    setNotifications(prev =>
      prev.map(n => n.notification_id === id ? { ...n, read: true } : n)
    );
  };

  // ── Mark all read ───────────────────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setSuccess('All marked as read!');
    setTimeout(() => setSuccess(''), 3000);
  };

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = notifications.filter(n => {
    if (filter === 'all')    return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const tabs = [
    { label: 'All',      value: 'all'      as const },
    { label: `Unread (${unreadCount})`, value: 'unread' as const },
    { label: 'Requests', value: 'request'  as const },
    { label: 'Reminders',value: 'reminder' as const },
    { label: 'System',   value: 'system'   as const },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" style={{ color: '#e11d48' }} />
          <p className="text-gray-500">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {unreadCount > 0
              ? <span style={{ color: '#e11d48' }}>{unreadCount} unread messages</span>
              : 'All caught up! ✅'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: '#e11d48' }}>
              <CheckCheck className="h-4 w-4" /> Mark All Read
            </button>
          )}
          <button onClick={fetchNotifications}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Success / Error */}
      {success && (
        <div className="rounded-xl p-3 bg-green-50 border border-green-200">
          <p className="text-sm text-green-700">✅ {success}</p>
        </div>
      )}
      {error && (
        <div className="rounded-xl p-3 bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button key={tab.value} onClick={() => setFilter(tab.value)}
            className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
            style={filter === tab.value
              ? { backgroundColor: '#e11d48', color: '#fff' }
              : { border: '1px solid #e5e7eb', color: '#374151', backgroundColor: '#fff' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification Cards */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-8 w-8 text-gray-400" />}
          title="No notifications"
          description={`No ${filter === 'all' ? 'notifications' : filter} to show right now`}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((n: any) => {
            const colors = typeColor(n.type);
            return (
              <div key={n.notification_id}
                className="rounded-xl border p-4 transition-all"
                style={{
                  backgroundColor: n.read ? '#fafafa' : colors.bg,
                  borderColor:     n.read ? '#e5e7eb' : colors.border,
                }}>
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                    style={{ backgroundColor: n.read ? '#f3f4f6' : colors.bg, border: `1px solid ${colors.border}` }}>
                    {typeIcon(n.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: '#e11d48' }} />
                        )}
                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', colors.badge)}>
                          {n.type}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    {!n.read && (
                      <button onClick={() => handleMarkRead(n.notification_id)}
                        className="mt-2 text-xs font-semibold transition-colors"
                        style={{ color: '#e11d48' }}>
                        Mark as read →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}