import { useState, useEffect } from 'react';
import { Eye, RefreshCw, Loader2, Users, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DataTable } from '../../components/ui/DataTable';
import { bloodGroupColor, eligibilityColor } from '../../utils/helpers';
import { cn } from '../../utils/cn';
import { getAllDonors, getDonorStats } from '../../services/donorService';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function DonorManagementPage() {
  const [donors,           setDonors]           = useState<any[]>([]);
  const [filtered,         setFiltered]         = useState<any[]>([]);
  const [stats,            setStats]            = useState<any>(null);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState('all');
  const [filterStatus,     setFilterStatus]     = useState('all');
  const [filterEligibility,setFilterEligibility]= useState('all');
  const [searchText,       setSearchText]       = useState('');

  // ── Fetch donors ────────────────────────────────────────────────────────────
  const fetchDonors = async () => {
    setLoading(true);
    setError('');
    try {
      const [donorList, donorStats] = await Promise.all([
        getAllDonors(),
        getDonorStats(),
      ]);
      setDonors(donorList);
      setFiltered(donorList);
      setStats(donorStats.stats);
    } catch (err: any) {
      setError('Failed to load donors: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDonors(); }, []);

  // ── Apply filters ───────────────────────────────────────────────────────────
  useEffect(() => {
    let result = [...donors];

    if (filterBloodGroup !== 'all')
      result = result.filter(d => d.blood_group === filterBloodGroup);

    if (filterStatus !== 'all')
      result = result.filter(d =>
        d.user_donation_active_status?.toLowerCase() === filterStatus.toLowerCase()
      );

    if (filterEligibility !== 'all')
      result = result.filter(d => d.eligibility_status === filterEligibility);

    if (searchText.trim())
      result = result.filter(d =>
        d.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        d.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        d.city?.toLowerCase().includes(searchText.toLowerCase())
      );

    setFiltered(result);
  }, [filterBloodGroup, filterStatus, filterEligibility, searchText, donors]);

  // ── Table columns ───────────────────────────────────────────────────────────
  const columns = [
    {
      key: 'name', header: 'Name',
      render: (d: any) => (
        <div>
          <p className="font-semibold text-sm text-gray-900 dark:text-white">
            {d.name || 'Unknown'}
          </p>
          <p className="text-xs text-gray-500">{d.city || '—'}</p>
        </div>
      )
    },
    {
      key: 'blood_group', header: 'Blood Group',
      render: (d: any) => (
        <span className={cn('badge text-sm', bloodGroupColor(d.blood_group))}>
          {d.blood_group || '—'}
        </span>
      )
    },
    {
      key: 'donor_type', header: 'Type',
      render: (d: any) => (
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {d.donor_type || 'One-Time'}
        </span>
      )
    },
    {
      key: 'donations_till_date', header: 'Donations',
      render: (d: any) => (
        <span className="font-semibold text-sm">
          {d.donations_till_date || 0}
        </span>
      )
    },
    {
      key: 'calls_to_donations_ratio', header: 'Response Rate',
      render: (d: any) => {
        const ratio = parseFloat(d.calls_to_donations_ratio) || 0;
        const pct   = ratio > 0 ? Math.min(100, Math.round((1 / ratio) * 100)) : 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1.5 rounded-full bg-gray-200">
              <div
                className="h-1.5 rounded-full"
                style={{
                  width: `${pct}%`,
                  backgroundColor: pct > 60 ? '#10b981' : pct > 30 ? '#f59e0b' : '#ef4444',
                }}
              />
            </div>
            <span className="text-xs text-gray-600">{ratio.toFixed(2)}</span>
          </div>
        );
      }
    },
    {
      key: 'eligibility_status', header: 'Eligibility',
      render: (d: any) => (
        <span className={cn('badge', eligibilityColor(d.eligibility_status))}>
          {d.eligibility_status || 'unknown'}
        </span>
      )
    },
    {
      key: 'user_donation_active_status', header: 'Status',
      render: (d: any) => {
        const active = d.user_donation_active_status?.toLowerCase() === 'active';
        return (
          <span className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
            active
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          )}>
            {active
              ? <CheckCircle className="h-3 w-3" />
              : <XCircle className="h-3 w-3" />}
            {d.user_donation_active_status || 'Unknown'}
          </span>
        );
      }
    },
    {
      key: 'last_donation_date', header: 'Last Donation',
      render: (d: any) => (
        <span className="text-xs text-gray-500">
          {d.last_donation_date
            ? new Date(d.last_donation_date).toLocaleDateString()
            : 'Never'}
        </span>
      )
    },
  ];

  const actions = (donor: any) => (
    <Link
      to={`/admin/donors/${donor.user_id}`}
      className="rounded p-1 text-gray-600 hover:text-rose-600 dark:text-gray-400 transition-colors"
    >
      <Eye className="h-4 w-4" />
    </Link>
  );

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" style={{ color: '#e11d48' }} />
          <p className="text-gray-500">Loading {donors.length || '4,442'} donors from DynamoDB...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={fetchDonors}
            className="px-4 py-2 rounded-lg text-white text-sm font-semibold"
            style={{ backgroundColor: '#e11d48' }}>
            Retry
          </button>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Donor Management</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {donors.length.toLocaleString()} donors loaded from DynamoDB
          </p>
        </div>
        <button
          onClick={fetchDonors}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ backgroundColor: '#e11d48' }}
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Donors',    value: stats.total_donors,    icon: <Users className="h-5 w-5" />,        color: '#e11d48' },
            { label: 'Eligible',        value: stats.eligible_donors, icon: <CheckCircle className="h-5 w-5" />,  color: '#10b981' },
            { label: 'Active',          value: stats.active_donors,   icon: <CheckCircle className="h-5 w-5" />,  color: '#3b82f6' },
            { label: 'Inactive',        value: stats.inactive_donors, icon: <XCircle className="h-5 w-5" />,      color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-4 flex items-center gap-3">
              <div className="rounded-lg p-2" style={{ backgroundColor: s.color + '20', color: s.color }}>
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {s.value?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-4">
        <div className="flex flex-wrap gap-3 items-center">

          {/* Search */}
          <input
            type="text"
            placeholder="Search by name, email, city..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
            style={{ minWidth: '200px' }}
          />

          {/* Blood Group */}
          <select
            value={filterBloodGroup}
            onChange={e => setFilterBloodGroup(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
          >
            <option value="all">All Blood Groups</option>
            {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Eligibility */}
          <select
            value={filterEligibility}
            onChange={e => setFilterEligibility(e.target.value)}
            className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
          >
            <option value="all">All Eligibility</option>
            <option value="eligible">Eligible</option>
            <option value="not eligible">Not Eligible</option>
          </select>

          {/* Result count */}
          <span className="text-sm text-gray-500 ml-auto">
            Showing <strong>{filtered.length.toLocaleString()}</strong> of <strong>{donors.length.toLocaleString()}</strong> donors
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <DataTable
          columns={columns}
          data={filtered}
          pageSize={15}
          actions={actions}
          emptyMessage="No donors match your filters"
        />
      </div>

    </div>
  );
}