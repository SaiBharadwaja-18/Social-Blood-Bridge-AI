import { useState, useEffect } from 'react';
import { CheckCheck, RefreshCw, Loader2, Send, Bell } from 'lucide-react';
import { getMyNotifications, markAsRead, markAllRead, sendNotification } from '../../services/notificationService';
import { cn } from '../../utils/cn';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const typeColor = (type: string) => {
  switch (type) {
    case 'request':  return 'bg-red-100 text-red-700';
    case 'reminder': return 'bg-yellow-100 text-yellow-700';
    case 'system':   return 'bg-blue-100 text-blue-700';
    default:         return 'bg-gray-100 text-gray-600';
  }
};

const typeIcon = (type: string) => {
  switch (type) {
    case 'request':  return '🩸';
    case 'reminder': return '⏰';
    case 'system':   return '⚙️';
    default:         return '🔔';
  }
};

export function NotificationsPage() {
  const [notifications, setNotifications]   = useState<any[]>([]);
  const [filtered,      setFiltered]        = useState<any[]>([]);
  const [loading,       setLoading]         = useState(true);
  const [sending,       setSending]         = useState(false);
  const [error,         setError]           = useState('');
  const [success,       setSuccess]         = useState('');
  const [activeTab,     setActiveTab]       = useState('all');

  // Broadcast form
  const [bTitle,        setBTitle]          = useState('');
  const [bMessage,      setBMessage]        = useState('');
  const [bBloodGroup,   setBBloodGroup]     = useState('');
  const [showBroadcast, setShowBroadcast]   = useState(false);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyNotifications();
      setNotifications(res.notifications || []);
      setFiltered(res.notifications || []);
    } catch (err: any) {
      setError('Failed to load notifications: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  // ── Filter by tab ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'all') {
      setFiltered(notifications);
    } else {
      setFiltered(notifications.filter(n => n.type === activeTab));
    }
  }, [activeTab, notifications]);

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
    setSuccess('All notifications marked as read');
    setTimeout(() => setSuccess(''), 3000);
  };

  // ── Broadcast notification ──────────────────────────────────────────────────
  const handleBroadcast = async () => {
    if (!bTitle || !bMessage) return;
    setSending(true);
    setError('');
    try {
      const payload: any = {
        title:      bTitle,
        message:    bMessage,
        notif_type: 'system',
      };
      if (bBloodGroup) payload.blood_group = bBloodGroup;

      const res = await sendNotification(payload);
      setSuccess(`Notification sent to ${res.sent_count} donors!`);
      setBTitle('');
      setBMessage('');
      setBBloodGroup('');
      setShowBroadcast(false);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError('Failed to send: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const categories = [
    { value: 'all',      label: `All (${notifications.length})` },
    { value: 'request',  label: `Requests (${notifications.filter(n => n.type === 'request').length})` },
    { value: 'reminder', label: `Reminders (${notifications.filter(n => n.type === 'reminder').length})` },
    { value: 'system',   label: `System (${notifications.filter(n => n.type === 'system').length})` },
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
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {unreadCount > 0
              ? <span style={{ color: '#e11d48' }}>{unreadCount} unread notifications</span>
              : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBroadcast(!showBroadcast)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: '#7c3aed' }}
          >
            <Send className="h-4 w-4" /> Broadcast
          </button>
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900"
          >
            <CheckCheck className="h-4 w-4" /> Mark All Read
          </button>
          <button
            onClick={fetchNotifications}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: '#6b7280' }}
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Success / Error */}
      {success && (
        <div className="rounded-xl p-4 bg-green-50 border border-green-200">
          <p className="text-sm text-green-700">✅ {success}</p>
        </div>
      )}
      {error && (
        <div className="rounded-xl p-4 bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Broadcast Panel */}
      {showBroadcast && (
        <div className="rounded-2xl border border-purple-200 bg-purple-50 dark:bg-purple-900/10 p-6 space-y-4">
          <h2 className="font-bold text-purple-800 dark:text-purple-400 flex items-center gap-2">
            <Send className="h-4 w-4" /> Send Broadcast Notification
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">Title *</label>
              <input
                type="text"
                value={bTitle}
                onChange={e => setBTitle(e.target.value)}
                placeholder="Notification title"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">
                Target Blood Group (optional)
              </label>
              <select
                value={bBloodGroup}
                onChange={e => setBBloodGroup(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
              >
                <option value="">All Donors</option>
                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g} donors only</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">Message *</label>
            <textarea
              value={bMessage}
              onChange={e => setBMessage(e.target.value)}
              placeholder="Notification message..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBroadcast}
              disabled={sending || !bTitle || !bMessage}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white"
              style={{
                backgroundColor: sending ? '#a78bfa' : '#7c3aed',
                cursor: sending ? 'not-allowed' : 'pointer',
              }}
            >
              {sending
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                : <><Send className="h-4 w-4" /> Send Now</>}
            </button>
            <button
              onClick={() => setShowBroadcast(false)}
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 bg-white"
            >
              Cancel
            </button>
            <p className="text-xs text-gray-500">
              {bBloodGroup ? `Will send to all ${bBloodGroup} donors` : 'Will send to ALL donors'}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setActiveTab(cat.value)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={activeTab === cat.value
              ? { backgroundColor: '#e11d48', color: '#fff' }
              : { backgroundColor: '#f3f4f6', color: '#374151' }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Notification Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-12 text-center">
          <Bell className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No notifications found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(notif => (
            <div
              key={notif.notification_id}
              className={cn(
                'rounded-xl border p-4 transition-all',
                notif.read
                  ? 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900'
                  : 'border-rose-200 bg-rose-50 dark:border-rose-900/30 dark:bg-rose-900/10'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  {/* Icon */}
                  <span className="text-xl">{typeIcon(notif.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        {notif.title}
                      </p>
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', typeColor(notif.type))}>
                        {notif.type}
                      </span>
                      {!notif.read && (
                        <span className="rounded-full px-2 py-0.5 text-xs font-semibold bg-rose-100 text-rose-700">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notif.created_at).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                {!notif.read && (
                  <button
                    onClick={() => handleMarkRead(notif.notification_id)}
                    className="text-xs font-semibold px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:text-rose-600 transition-colors whitespace-nowrap"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}