import { useState, useEffect } from 'react';
import { User, Phone, MapPin, Heart, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export function PatientProfilePage() {
  const { user }    = useAuth();
  const [profile,   setProfile]   = useState<any>(null);
  const [cycle,     setCycle]     = useState<any>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const profileData = await api.get<any>(`/donors/${user.user_id}`);
      setProfile(profileData.donor || profileData);
      try {
        const cycleData = await api.get<any>(`/requests/cycle/${user.user_id}`);
        setCycle(cycleData);
      } catch { setCycle(null); }
    } catch (err: any) {
      setError('Failed to load profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [user]);

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

  // Use profile data or fall back to auth user
  const data = profile || user;
  const initials = (data?.name || 'P')
    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  const Section = ({ icon: Icon, title, fields }: {
    icon: any; title: string;
    fields: { label: string; value: string | undefined }[];
  }) => (
    <div className="rounded-2xl p-6" style={{ backgroundColor: '#ffffff', border: '1px solid #ffe4e6' }}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4" style={{ color: '#e11d48' }} />
        <h2 className="text-sm font-bold" style={{ color: '#111827' }}>{title}</h2>
      </div>
      <div className="flex flex-col gap-3">
        {fields.map((f, i) => (
          <div key={i} className="flex items-center justify-between py-2"
            style={{ borderBottom: '1px solid #fff1f2' }}>
            <p className="text-xs font-semibold" style={{ color: '#9ca3af' }}>{f.label}</p>
            <p className="text-sm font-medium" style={{ color: f.value ? '#111827' : '#d1d5db' }}>
              {f.value || '—'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6" style={{ backgroundColor: '#fff1f2', minHeight: '100vh' }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>My Profile</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>
            Your patient information and medical details
          </p>
        </div>
        <button onClick={fetchProfile}
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

      {/* Avatar Card */}
      <div className="rounded-2xl p-6 flex items-center gap-5"
        style={{ backgroundColor: '#ffffff', border: '1px solid #ffe4e6' }}>
        <div className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold"
          style={{ backgroundColor: '#ffe4e6', color: '#e11d48' }}>
          {initials}
        </div>
        <div>
          <p className="text-lg font-bold" style={{ color: '#111827' }}>
            {data?.name || 'Patient'}
          </p>
          <p className="text-sm" style={{ color: '#9ca3af' }}>{data?.email || '—'}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: '#fff1f2', color: '#e11d48' }}>
              Patient · {data?.blood_group || '—'}
            </span>
            {data?.condition && (
              <span className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                {data.condition}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* Personal Info */}
        <Section
          icon={User}
          title="Personal Information"
          fields={[
            { label: 'Full Name',   value: data?.name },
            { label: 'Age',         value: data?.age ? `${data.age} years` : undefined },
            { label: 'Gender',      value: data?.gender },
            { label: 'Blood Group', value: data?.blood_group },
            { label: 'Condition',   value: data?.condition },
          ]}
        />

        {/* Contact Info */}
        <Section
          icon={Phone}
          title="Contact Information"
          fields={[
            { label: 'Mobile',            value: data?.mobile },
            { label: 'Emergency Contact', value: data?.emergency_contact_name },
            { label: 'Emergency Number',  value: data?.emergency_contact_number },
          ]}
        />

        {/* Location */}
        <Section
          icon={MapPin}
          title="Location"
          fields={[
            { label: 'City',      value: data?.city },
            { label: 'State',     value: data?.state },
            {
              label: 'Coordinates',
              value: data?.latitude && data?.longitude
                ? `${parseFloat(data.latitude).toFixed(4)}, ${parseFloat(data.longitude).toFixed(4)}`
                : undefined,
            },
          ]}
        />

        {/* Medical Info */}
        <Section
          icon={Heart}
          title="Medical Information"
          fields={[
            { label: 'Hospital',             value: data?.hospital_name },
            { label: 'Hospital Location',    value: data?.hospital_location },
            { label: 'Regular Transfusions', value: data?.regular_transfusions ? 'Yes' : 'No' },
            { label: 'Expected Requirement', value: data?.expected_requirement },
            {
              label: 'Next Transfusion',
              value: cycle?.next_transfusion_date
                ? new Date(cycle.next_transfusion_date).toLocaleDateString('en-IN', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })
                : undefined,
            },
            {
              label: 'Cycle Frequency',
              value: cycle?.frequency_days ? `Every ${cycle.frequency_days} days` : undefined,
            },
          ]}
        />

      </div>

      {/* Registration Info */}
      <div className="rounded-2xl p-4"
        style={{ backgroundColor: '#ffffff', border: '1px solid #ffe4e6' }}>
        <p className="text-xs text-gray-400 text-center">
          Registered on:{' '}
          {data?.registration_date
            ? new Date(data.registration_date).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'long', day: 'numeric'
              })
            : '—'}
          {' '}· Patient ID: {data?.user_id?.slice(0, 8)}...
        </p>
      </div>

    </div>
  );
}