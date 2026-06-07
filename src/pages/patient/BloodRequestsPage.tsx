import { useState, useEffect } from 'react';
import { Plus, Droplets, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAllRequests, createBloodRequest } from '../../services/requestService';
import { cn } from '../../utils/cn';

const inputStyle: React.CSSProperties = {
  width: '100%', borderRadius: '10px', border: '1.5px solid #ffe4e6',
  backgroundColor: '#ffffff', padding: '10px 14px', fontSize: '14px',
  color: '#111827', outline: 'none', fontFamily: 'inherit', marginTop: '6px',
};

export function PatientBloodRequestsPage() {
  const { user }      = useAuth();
  const [requests,    setRequests]    = useState<any[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [submitting,  setSubmitting]  = useState(false);
  const [showForm,    setShowForm]    = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');

  // Form fields
  const [urgency,     setUrgency]     = useState('medium');
  const [units,       setUnits]       = useState('');
  const [hospital,    setHospital]    = useState(user?.hospital_name || '');
  const [notes,       setNotes]       = useState('');
  const [requiredDate,setRequiredDate]= useState('');

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllRequests();
      setRequests(data);
    } catch (err: any) {
      setError('Failed to load requests: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  // ── Submit new request ──────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!units || !hospital) {
      setError('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await createBloodRequest({
        blood_group:    user?.blood_group || '',
        units_required: parseInt(units),
        hospital:       hospital,
        urgency:        urgency,
        required_date:  requiredDate || undefined,
        notes:          notes || '',
        auto_triggered: false,
      });
      setSuccess('Blood request created successfully!');
      setShowForm(false);
      setUnits('');
      setNotes('');
      setRequiredDate('');
      setTimeout(() => setSuccess(''), 4000);
      fetchRequests();
    } catch (err: any) {
      setError('Failed to create request: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
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

  const urgencyStyle = (urgency: string) => {
    switch (urgency) {
      case 'critical': return { bg: '#fee2e2', color: '#dc2626' };
      case 'high':     return { bg: '#fee2e2', color: '#dc2626' };
      case 'medium':   return { bg: '#fef9c3', color: '#ca8a04' };
      default:         return { bg: '#f0fdf4', color: '#16a34a' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" style={{ color: '#e11d48' }} />
          <p className="text-gray-500">Loading your requests...</p>
        </div>
      </div>
    );
  }

  // Summary
  const pending   = requests.filter(r => r.status === 'pending').length;
  const active    = requests.filter(r => r.status === 'active' || r.status === 'matching').length;
  const fulfilled = requests.filter(r => r.status === 'fulfilled').length;

  return (
    <div className="p-6 space-y-6" style={{ backgroundColor: '#fff1f2', minHeight: '100vh' }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Blood Requests</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>
            {requests.length} total requests — Blood Group: {user?.blood_group}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchRequests}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ backgroundColor: '#fff1f2', color: '#e11d48', border: '1.5px solid #fda4af' }}>
            <RefreshCw className="h-4 w-4" />
          </button>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: '#e11d48' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#be123c')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#e11d48')}>
            <Plus className="h-4 w-4" /> New Request
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

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending',   value: pending,   color: '#e11d48' },
          { label: 'Active',    value: active,    color: '#2563eb' },
          { label: 'Fulfilled', value: fulfilled, color: '#16a34a' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 text-center"
            style={{ backgroundColor: '#ffffff', border: '1px solid #ffe4e6' }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* New Request Form */}
      {showForm && (
        <div className="rounded-2xl p-6"
          style={{ backgroundColor: '#ffffff', border: '1px solid #ffe4e6' }}>
          <h2 className="text-base font-bold mb-5" style={{ color: '#111827' }}>
            New Blood Request
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: '#6b7280' }}>Blood Group</label>
                <input type="text" value={user?.blood_group || ''} disabled
                  style={{ ...inputStyle, backgroundColor: '#f9fafb', color: '#9ca3af' }} />
              </div>
              <div>
                <label className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: '#6b7280' }}>Units Required *</label>
                <input type="number" value={units} onChange={e => setUnits(e.target.value)}
                  placeholder="e.g. 2" min="1" max="10" required style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = '#fda4af')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#ffe4e6')} />
              </div>
              <div>
                <label className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: '#6b7280' }}>Urgency *</label>
                <select value={urgency} onChange={e => setUrgency(e.target.value)}
                  style={inputStyle}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: '#6b7280' }}>Required By Date</label>
                <input type="date" value={requiredDate}
                  onChange={e => setRequiredDate(e.target.value)}
                  style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = '#fda4af')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#ffe4e6')} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: '#6b7280' }}>Hospital *</label>
                <input type="text" value={hospital}
                  onChange={e => setHospital(e.target.value)}
                  placeholder="Hospital name" required style={inputStyle}
                  onFocus={e => (e.currentTarget.style.borderColor = '#fda4af')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#ffe4e6')} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: '#6b7280' }}>Additional Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Any additional information..." rows={3}
                  style={{ ...inputStyle, resize: 'none' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#fda4af')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#ffe4e6')} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button type="submit" disabled={submitting}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: submitting ? '#fda4af' : '#e11d48', cursor: submitting ? 'not-allowed' : 'pointer' }}
                onMouseEnter={e => { if (!submitting) e.currentTarget.style.backgroundColor = '#be123c'; }}
                onMouseLeave={e => { if (!submitting) e.currentTarget.style.backgroundColor = '#e11d48'; }}>
                {submitting
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                  : 'Submit Request'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold"
                style={{ backgroundColor: '#fff1f2', color: '#e11d48', border: '1.5px solid #ffe4e6' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requests List */}
      <div className="rounded-2xl p-6"
        style={{ backgroundColor: '#ffffff', border: '1px solid #ffe4e6' }}>
        <h2 className="text-base font-bold mb-4" style={{ color: '#111827' }}>
          All Requests
        </h2>
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <Droplets className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No blood requests yet.</p>
            <button onClick={() => setShowForm(true)}
              className="mt-3 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: '#e11d48' }}>
              Create First Request
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {requests.map((r: any) => {
              const ss = statusStyle(r.status);
              const us = urgencyStyle(r.urgency);
              return (
                <div key={r.request_id}
                  className="flex items-center justify-between rounded-xl px-4 py-3"
                  style={{ backgroundColor: '#fff1f2', border: '1px solid #ffe4e6' }}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full font-bold text-sm"
                      style={{ backgroundColor: '#ffe4e6', color: '#e11d48' }}>
                      <Droplets className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                        {r.blood_group} · {r.units_required} unit(s)
                        {r.auto_triggered && (
                          <span className="ml-2 text-xs text-purple-600">🤖 Auto</span>
                        )}
                      </p>
                      <p className="text-xs" style={{ color: '#9ca3af' }}>
                        {r.hospital} ·{' '}
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString('en-IN')
                          : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: us.bg, color: us.color }}>
                      {r.urgency}
                    </span>
                    <span className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ backgroundColor: ss.bg, color: ss.color }}>
                      {r.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}