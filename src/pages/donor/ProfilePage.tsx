import { useState, useEffect } from 'react';
import { Mail, Phone, Heart, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDonorById, updateDonor } from '../../services/donorService';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function ProfilePage() {
  const { user }      = useAuth();
  const [donor,       setDonor]       = useState<any>(null);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [error,       setError]       = useState('');

  // Form fields
  const [name,        setName]        = useState('');
  const [mobile,      setMobile]      = useState('');
  const [bloodGroup,  setBloodGroup]  = useState('');
  const [city,        setCity]        = useState('');
  const [userState,   setUserState]   = useState('');
  const [available,   setAvailable]   = useState(true);
  const [notifEmail,  setNotifEmail]  = useState(true);
  const [notifSms,    setNotifSms]    = useState(true);

  // ── Fetch donor profile ───────────────────────────────────────────────────
  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const data = await getDonorById(user.user_id);
      setDonor(data);
      // Populate form
      setName(data?.name || user.name || '');
      setMobile(data?.mobile || '');
      setBloodGroup(data?.blood_group || user.blood_group || '');
      setCity(data?.city || '');
      setUserState(data?.state || '');
      setAvailable(data?.available_emergency ?? true);
      setNotifEmail(data?.consent_notifications ?? true);
    } catch (err: any) {
      setError('Failed to load profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [user]);

  // ── Save profile ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setError('');
    try {
      await updateDonor(user.user_id, {
        name,
        mobile,
        blood_group:        bloodGroup,
        city,
        state:              userState,
        available_emergency: available,
        consent_notifications: notifEmail,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      fetchProfile();
    } catch (err: any) {
      setError('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" style={{ color: '#e11d48' }} />
          <p className="text-gray-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const initials = (name || user?.name || 'D')
    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const reliabilityScore = donor?.calls_to_donations_ratio
    ? Math.min(100, Math.round((1 / parseFloat(donor.calls_to_donations_ratio)) * 100))
    : 0;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account information and preferences
          </p>
        </div>
        <button onClick={fetchProfile}
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        {/* Main Form */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">

            {/* Avatar */}
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold"
                style={{ backgroundColor: '#ffe4e6', color: '#e11d48' }}>
                {initials}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{ backgroundColor: '#fff1f2', color: '#e11d48' }}>
                    {bloodGroup} · Donor
                  </span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                    donor?.eligibility_status === 'eligible'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {donor?.eligibility_status || 'unknown'}
                  </span>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-5">

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white">Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none"
                  onFocus={e => (e.currentTarget.style.borderColor = '#fda4af')}
                  onBlur={e => (e.currentTarget.style.borderColor = '')} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white">Email</label>
                <input type="email" value={user?.email || ''} disabled
                  className="mt-2 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-500 dark:border-gray-700 dark:bg-gray-800 cursor-not-allowed" />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white">Mobile</label>
                <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none"
                  onFocus={e => (e.currentTarget.style.borderColor = '#fda4af')}
                  onBlur={e => (e.currentTarget.style.borderColor = '')} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white">Blood Group</label>
                <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none">
                  {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">City</label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none"
                    onFocus={e => (e.currentTarget.style.borderColor = '#fda4af')}
                    onBlur={e => (e.currentTarget.style.borderColor = '')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">State</label>
                  <input type="text" value={userState} onChange={e => setUserState(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white outline-none"
                    onFocus={e => (e.currentTarget.style.borderColor = '#fda4af')}
                    onBlur={e => (e.currentTarget.style.borderColor = '')} />
                </div>
              </div>

              {/* Availability */}
              <div className="border-t border-gray-200 pt-5 dark:border-gray-800">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={available} onChange={e => setAvailable(e.target.checked)}
                    className="h-4 w-4 rounded" style={{ accentColor: '#e11d48' }} />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Available for donations
                    </span>
                    <p className="text-xs text-gray-500">
                      When enabled, you'll receive blood donation requests
                    </p>
                  </div>
                </label>
              </div>

              {/* Notification Preferences */}
              <div className="border-t border-gray-200 pt-5 dark:border-gray-800">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  Notification Preferences
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'email', label: 'Email Notifications',  icon: Mail,  state: notifEmail, set: setNotifEmail },
                    { key: 'sms',   label: 'SMS Notifications',    icon: Phone, state: notifSms,   set: setNotifSms   },
                    { key: 'push',  label: 'Emergency Requests',   icon: Heart, state: available,  set: setAvailable  },
                  ].map(pref => (
                    <label key={pref.key} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={pref.state} onChange={e => pref.set(e.target.checked)}
                        className="h-4 w-4 rounded" style={{ accentColor: '#e11d48' }} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{pref.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="border-t border-gray-200 pt-5 dark:border-gray-800">
                {saved ? (
                  <button disabled
                    className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-semibold text-white"
                    style={{ backgroundColor: '#10b981' }}>
                    <CheckCircle2 className="h-5 w-5" /> Changes Saved!
                  </button>
                ) : (
                  <button onClick={handleSave} disabled={saving}
                    className="w-full rounded-lg px-4 py-2.5 font-semibold text-white transition-colors flex items-center justify-center gap-2"
                    style={{ backgroundColor: saving ? '#fda4af' : '#e11d48', cursor: saving ? 'not-allowed' : 'pointer' }}
                    onMouseEnter={e => { if (!saving) e.currentTarget.style.backgroundColor = '#be123c'; }}
                    onMouseLeave={e => { if (!saving) e.currentTarget.style.backgroundColor = '#e11d48'; }}>
                    {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save Changes'}
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Account Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>
            <div className="space-y-3">
              {[
                { label: 'Donor ID',      value: donor?.user_id?.slice(0, 12) + '...' },
                { label: 'Donor Type',    value: donor?.donor_type || 'One-Time' },
                { label: 'Member Since',  value: donor?.registration_date
                    ? new Date(donor.registration_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })
                    : '—' },
                { label: 'Last Donation', value: donor?.last_donation_date
                    ? new Date(donor.last_donation_date).toLocaleDateString('en-IN')
                    : 'Never' },
                { label: 'Next Eligible', value: donor?.next_eligible_date
                    ? new Date(donor.next_eligible_date).toLocaleDateString('en-IN')
                    : '—' },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                  <p className="mt-0.5 font-medium text-sm text-gray-900 dark:text-white">
                    {item.value || '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Donation Stats */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Donation Stats</h3>
            <div className="space-y-3">
              {[
                { label: 'Total Donations',      value: donor?.donations_till_date || 0 },
                { label: 'Total Calls Received', value: donor?.total_calls || 0 },
                { label: 'Response Ratio',       value: parseFloat(donor?.calls_to_donations_ratio || 0).toFixed(2) },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-3 dark:border-gray-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Reliability Score
                  </span>
                  <span className="font-semibold" style={{ color: '#e11d48' }}>
                    {reliabilityScore}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div className="h-2 rounded-full transition-all"
                    style={{
                      width: `${reliabilityScore}%`,
                      backgroundColor: reliabilityScore > 60 ? '#10b981' : reliabilityScore > 30 ? '#f59e0b' : '#ef4444',
                    }} />
                </div>
              </div>
            </div>
          </div>

          {/* Active Status */}
          <div className="rounded-xl border p-4"
            style={{
              borderColor: donor?.user_donation_active_status?.toLowerCase() === 'active' ? '#86efac' : '#fda4af',
              backgroundColor: donor?.user_donation_active_status?.toLowerCase() === 'active' ? '#f0fdf4' : '#fff1f2',
            }}>
            <p className="text-xs font-bold uppercase tracking-wider"
              style={{ color: donor?.user_donation_active_status?.toLowerCase() === 'active' ? '#166534' : '#9f1239' }}>
              Account Status
            </p>
            <p className="font-bold text-lg mt-1"
              style={{ color: donor?.user_donation_active_status?.toLowerCase() === 'active' ? '#16a34a' : '#e11d48' }}>
              {donor?.user_donation_active_status || 'Unknown'}
            </p>
            {donor?.inactive_trigger_comment && (
              <p className="text-xs mt-1 text-gray-500">{donor.inactive_trigger_comment}</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}