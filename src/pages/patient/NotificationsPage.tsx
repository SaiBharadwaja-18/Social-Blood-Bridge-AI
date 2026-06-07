import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, Info, Loader2, RefreshCw, CheckCheck } from 'lucide-react';
import { getMyNotifications, markAsRead, markAllRead } from '../../services/notificationService';

export function PatientNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [success,       setSuccess]       = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyNotifications();
      setNotifications(res.notifications || []);
    } catch (err: any) {
      setError('Failed to load notifications: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    setNotifications(prev =>
      prev.map(n => n.notification_id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setSuccess('All notifications marked as read');
    setTimeout(() => setSuccess(''), 3000);
  };

  const iconMap = (type: string) => {
    switch (type) {
      case 'request':  return <AlertCircle  className="h-5 w-5" style={{ color: '#e11d48' }} />;
      case 'reminder': return <Bell         className="h-5 w-5" style={{ color: '#ca8a04' }} />;
      case 'system':   return <Info         className="h-5 w-5" style={{ color: '#2563eb' }} />;
      default:         return <CheckCircle2 className="h-5 w-5" style={{ color: '#16a34a' }} />;
    }
  };

  const bgMap = (type: string) => {
    switch (type) {
      case 'request':  return '#fff1f2';
      case 'reminder': return '#fef9c3';
      case 'system':   return '#eff6ff';
      default:         return '#dcfce7';
    }
  };

  const timeAgo = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins  = Math.floor(diff / 60000);
      const hours = Math.floor(mins / 60);
      const days  = Math.floor(hours / 24);
      if (days > 0)  return `${days} day${days > 1 ? 's' : ''} ago`;
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      if (mins > 0)  return `${mins} minute${mins > 1 ? 's' : ''} ago`;
      return 'Just now';
    } catch { return '—'; }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
    <div className="p-6 space-y-6" style={{ backgroundColor: '#fff1f2', minHeight: '100vh' }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Notifications</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>
            {unreadCount > 0
              ? <span style={{ color: '#e11d48' }}>{unreadCount} unread</span>
              : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: '#ffffff', color: '#6b7280', border: '1px solid #e5e7eb' }}>
            <CheckCheck className="h-3 w-3" /> Mark All Read
          </button>
          <button onClick={fetchNotifications}
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: '#ffe4e6' }}>
            <RefreshCw className="h-4 w-4" style={{ color: '#e11d48' }} />
          </button>
        </div>
      </div>

      {/* Success */}
      {success && (
        <div className="rounded-xl p-3 bg-green-50 border border-green-200">
          <p className="text-sm text-green-700">✅ {success}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl p-3 bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Notifications */}
      <div className="rounded-2xl p-6"
        style={{ backgroundColor: '#ffffff', border: '1px solid #ffe4e6' }}>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No notifications yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {notifications.map((n: any) => (
              <div key={n.notification_id}
                className="flex items-start gap-4 rounded-xl p-4 transition-all"
                style={{
                  backgroundColor: n.read ? '#fafafa' : '#fff1f2',
                  border: `1px solid ${n.read ? '#f3f4f6' : '#ffe4e6'}`,
                }}>
                {/* Icon */}
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: bgMap(n.type) }}>
                  {iconMap(n.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                      {n.title}
                      {!n.read && (
                        <span className="ml-2 inline-block h-2 w-2 rounded-full align-middle"
                          style={{ backgroundColor: '#e11d48' }} />
                      )}
                    </p>
                    <span className="text-xs shrink-0" style={{ color: '#fda4af' }}>
                      {timeAgo(n.created_at)}
                    </span>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed" style={{ color: '#6b7280' }}>
                    {n.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: bgMap(n.type), color: '#374151' }}>
                      {n.type}
                    </span>
                    {!n.read && (
                      <button
                        onClick={() => handleMarkRead(n.notification_id)}
                        className="text-xs font-semibold px-2 py-1 rounded-lg transition-colors"
                        style={{ color: '#e11d48' }}>
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}