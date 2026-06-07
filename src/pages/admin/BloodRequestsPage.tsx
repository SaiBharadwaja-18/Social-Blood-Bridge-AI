import { useState, useEffect } from 'react';
import { Plus, Eye, RefreshCw, Loader2, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DataTable } from '../../components/ui/DataTable';
import { bloodGroupColor, priorityColor, statusColor } from '../../utils/helpers';
import { cn } from '../../utils/cn';
import { getAllRequests, updateRequestStatus, autoTriggerCycles } from '../../services/requestService';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const PRIORITIES   = ['critical', 'high', 'medium', 'low'];
const STATUSES     = ['pending', 'matching', 'active', 'fulfilled', 'cancelled'];

export function BloodRequestsPage() {
  const [requests,         setRequests]         = useState<any[]>([]);
  const [filtered,         setFiltered]         = useState<any[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState('');
  const [triggerLoading,   setTriggerLoading]   = useState(false);
  const [triggerResult,    setTriggerResult]    = useState<any>(null);
  const [filterBloodGroup, setFilterBloodGroup] = useState('all');
  const [filterPriority,   setFilterPriority]   = useState('all');
  const [filterStatus,     setFilterStatus]     = useState('all');
  const [searchText,       setSearchText]       = useState('');

  // ── Fetch requests ──────────────────────────────────────────────────────────
  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllRequests();
      setRequests(data);
      setFiltered(data);
    } catch (err: any) {
      setError('Failed to load requests: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  // ── Apply filters ───────────────────────────────────────────────────────────
  useEffect(() => {
    let result = [...requests];
    if (filterBloodGroup !== 'all')
      result = result.filter(r => r.blood_group === filterBloodGroup);
    if (filterPriority !== 'all')
      result = result.filter(r => r.urgency === filterPriority);
    if (filterStatus !== 'all')
      result = result.filter(r => r.status === filterStatus);
    if (searchText.trim())
      result = result.filter(r =>
        r.hospital?.toLowerCase().includes(searchText.toLowerCase()) ||
        r.blood_group?.toLowerCase().includes(searchText.toLowerCase()) ||
        r.patient_name?.toLowerCase().includes(searchText.toLowerCase())
      );
    setFiltered(result);
  }, [filterBloodGroup, filterPriority, filterStatus, searchText, requests]);

  // ── Auto trigger cycles ─────────────────────────────────────────────────────
  const handleAutoTrigger = async () => {
    setTriggerLoading(true);
    setTriggerResult(null);
    try {
      const result = await autoTriggerCycles();
      setTriggerResult(result);
      fetchRequests(); // Refresh list
    } catch (err: any) {
      setError('Auto-trigger failed: ' + err.message);
    } finally {
      setTriggerLoading(false);
    }
  };

  // ── Summary counts ──────────────────────────────────────────────────────────
  const summary = {
    total:     requests.length,
    pending:   requests.filter(r => r.status === 'pending').length,
    active:    requests.filter(r => r.status === 'active').length,
    fulfilled: requests.filter(r => r.status === 'fulfilled').length,
    critical:  requests.filter(r => r.urgency === 'critical').length,
  };

  // ── Columns ─────────────────────────────────────────────────────────────────
  const columns = [
    {
      key: 'request_id', header: 'Request ID',
      render: (r: any) => (
        <span className="font-mono text-xs text-gray-500">
          {r.request_id?.slice(0, 8)}...
        </span>
      )
    },
    {
      key: 'blood_group', header: 'Blood Group',
      render: (r: any) => (
        <span className={cn('badge text-sm', bloodGroupColor(r.blood_group))}>
          {r.blood_group}
        </span>
      )
    },
    {
      key: 'units_required', header: 'Units',
      render: (r: any) => (
        <span className="font-semibold">{r.units_required}</span>
      )
    },
    {
      key: 'hospital', header: 'Hospital',
      render: (r: any) => (
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{r.hospital}</p>
          <p className="text-xs text-gray-500">{r.hospital_location || '—'}</p>
        </div>
      )
    },
    {
      key: 'patient_name', header: 'Patient',
      render: (r: any) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {r.patient_name || 'Unknown'}
        </span>
      )
    },
    {
      key: 'required_date', header: 'Required By',
      render: (r: any) => (
        <span className="text-xs text-gray-500">
          {r.required_date
            ? new Date(r.required_date).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'short', day: 'numeric'
              })
            : '—'}
        </span>
      )
    },
    {
      key: 'urgency', header: 'Priority',
      render: (r: any) => (
        <span className={cn('badge', priorityColor(r.urgency))}>
          {r.urgency}
        </span>
      )
    },
    {
      key: 'status', header: 'Status',
      render: (r: any) => (
        <span className={cn('badge', statusColor(r.status))}>
          {r.status}
        </span>
      )
    },
    {
      key: 'auto_triggered', header: 'Source',
      render: (r: any) => (
        <span className={cn(
          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
          r.auto_triggered
            ? 'bg-purple-100 text-purple-700'
            : 'bg-gray-100 text-gray-600'
        )}>
          {r.auto_triggered ? '🤖 Auto' : '👤 Manual'}
        </span>
      )
    },
  ];

  const actions = (r: any) => (
    <div className="flex items-center gap-2">
      <Link
        to={`/admin/requests/${r.request_id}`}
        className="rounded p-1 text-gray-600 hover:text-rose-600 dark:text-gray-400 transition-colors"
      >
        <Eye className="h-4 w-4" />
      </Link>
    </div>
  );

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" style={{ color: '#e11d48' }} />
          <p className="text-gray-500">Loading blood requests from DynamoDB...</p>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Blood Requests</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {requests.length} total requests — live from DynamoDB
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Auto-trigger button */}
          <button
            onClick={handleAutoTrigger}
            disabled={triggerLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ backgroundColor: '#7c3aed', cursor: triggerLoading ? 'not-allowed' : 'pointer' }}
          >
            {triggerLoading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Triggering...</>
              : <><Zap className="h-4 w-4" /> Auto-Trigger Cycles</>}
          </button>
          <button
            onClick={fetchRequests}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: '#6b7280' }}
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
          <Link
            to="/admin/requests/create"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: '#e11d48' }}
          >
            <Plus className="h-4 w-4" /> Create Request
          </Link>
        </div>
      </div>

      {/* Auto-trigger result */}
      {triggerResult && (
        <div className="rounded-xl p-4" style={{
          backgroundColor: '#f5f3ff',
          border: '1.5px solid #a78bfa',
        }}>
          <p className="text-sm font-semibold text-purple-700">
            ⚡ Auto-trigger complete: {triggerResult.triggered_count} requests created
          </p>
          {triggerResult.triggered?.map((t: any) => (
            <p key={t.request_id} className="text-xs text-purple-600 mt-1">
              → {t.patient_name} ({t.blood_group}) — due {t.due_date}
            </p>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl p-4 bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total',     value: summary.total,     color: '#6b7280' },
          { label: 'Pending',   value: summary.pending,   color: '#f59e0b' },
          { label: 'Active',    value: summary.active,    color: '#3b82f6' },
          { label: 'Fulfilled', value: summary.fulfilled, color: '#10b981' },
          { label: 'Critical',  value: summary.critical,  color: '#e11d48' },
        ].map(s => (
          <div key={s.label}
            className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-4 text-center">
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search hospital, patient, blood group..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
            style={{ minWidth: '220px' }}
          />
          <select value={filterBloodGroup} onChange={e => setFilterBloodGroup(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none">
            <option value="all">All Blood Groups</option>
            {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none">
            <option value="all">All Priorities</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none">
            <option value="all">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <span className="text-sm text-gray-500 ml-auto">
            Showing <strong>{filtered.length}</strong> of <strong>{requests.length}</strong>
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <DataTable
          columns={columns}
          data={filtered}
          pageSize={10}
          actions={actions}
          emptyMessage="No blood requests found"
        />
      </div>

    </div>
  );
}