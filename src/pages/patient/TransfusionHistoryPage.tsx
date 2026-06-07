import { useState, useEffect } from 'react';
import { Heart, Calendar, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export function PatientTransfusionHistoryPage() {
  const { user }    = useAuth();
  const [history,   setHistory]   = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  const fetchHistory = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get<any>(`/donors/${user.user_id}/history`);
      setHistory(res.history || []);
    } catch (err: any) {
      setError('Failed to load history: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" style={{ color: '#e11d48' }} />
          <p className="text-gray-500">Loading transfusion history...</p>
        </div>
      </div>
    );
  }

  // Summary stats
  const totalTransfusions  = history.length;
  const totalUnits         = history.reduce((sum: number, h: any) => sum + (parseInt(h.units) || 0), 0);
  const lastTransfusion    = history.length > 0
    ? new Date(history[0].date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    : '—';

  return (
    <div className="p-6 space-y-6" style={{ backgroundColor: '#fff1f2', minHeight: '100vh' }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Transfusion History</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>
            Complete record of your past transfusions
          </p>
        </div>
        <button onClick={fetchHistory}
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: '#ffe4e6' }}>
          <RefreshCw className="h-4 w-4" style={{ color: '#e11d48' }} />
        </button>
      </div>

      {error && (
        <div className="rounded-xl p-3 bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Transfusions',  value: totalTransfusions },
          { label: 'Total Units Received', value: totalUnits        },
          { label: 'Last Transfusion',    value: lastTransfusion   },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl p-5 text-center"
            style={{ backgroundColor: '#ffffff', border: '1px solid #ffe4e6' }}>
            <p className="text-3xl font-bold" style={{ color: '#e11d48' }}>{s.value}</p>
            <p className="text-xs mt-1 font-medium" style={{ color: '#9ca3af' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* History List */}
      <div className="rounded-2xl p-6"
        style={{ backgroundColor: '#ffffff', border: '1px solid #ffe4e6' }}>
        <h2 className="text-base font-bold mb-4" style={{ color: '#111827' }}>
          All Transfusions
        </h2>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No transfusion history yet.</p>
            <p className="text-gray-400 text-xs mt-1">
              Your transfusion records will appear here after donations are fulfilled.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((h: any) => (
              <div key={h.donation_id}
                className="flex items-center justify-between rounded-xl px-4 py-4"
                style={{ backgroundColor: '#fff1f2', border: '1px solid #ffe4e6' }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: '#ffe4e6' }}>
                    <Heart className="h-4 w-4" style={{ color: '#e11d48' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                      {user?.blood_group} · {h.units} unit(s)
                    </p>
                    <p className="text-xs" style={{ color: '#9ca3af' }}>
                      {h.hospital || h.hospital_location || 'Hospital'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end mb-1">
                    <Calendar className="h-3 w-3" style={{ color: '#fda4af' }} />
                    <p className="text-xs" style={{ color: '#9ca3af' }}>
                      {h.date
                        ? new Date(h.date).toLocaleDateString('en-IN', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })
                        : '—'}
                    </p>
                  </div>
                  <span className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}