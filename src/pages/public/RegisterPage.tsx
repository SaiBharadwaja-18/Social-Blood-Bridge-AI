import { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, MapPin, Loader2, CheckCircle, XCircle, Search } from 'lucide-react';
import type { Role } from '../../types';

// ── Styles ────────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', borderRadius: '10px', border: '1.5px solid #ffe4e6',
  backgroundColor: '#ffffff', padding: '10px 14px', fontSize: '14px',
  color: '#111827', outline: 'none', transition: 'border-color 0.2s',
  fontFamily: 'inherit', marginTop: '6px',
};
const labelStyle: React.CSSProperties = {
  fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em',
  textTransform: 'uppercase' as const, color: '#6b7280',
};

// ── Load Google Maps via plain <script> tag (no deprecated Loader) ────────────
let mapsReady = false;
let mapsCallbacks: (() => void)[] = [];

function loadGoogleMaps(): Promise<void> {
  return new Promise((resolve) => {
    if (mapsReady) { resolve(); return; }
    mapsCallbacks.push(resolve);
    if (mapsCallbacks.length > 1) return; // already loading

    // Check if already loaded externally
    if (window.google?.maps?.places) {
      mapsReady = true;
      mapsCallbacks.forEach(cb => cb());
      mapsCallbacks = [];
      return;
    }

    // Inject script tag
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      mapsReady = true;
      mapsCallbacks.forEach(cb => cb());
      mapsCallbacks = [];
    };
    script.onerror = () => {
      console.error('Google Maps failed to load');
      mapsCallbacks = [];
    };
    document.head.appendChild(script);
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface SelectedLocation {
  display_name: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
}

// ── LocationPicker Component ──────────────────────────────────────────────────
function LocationPicker({ label, placeholder, types, onSelect }: {
  label: string;
  placeholder?: string;
  types?: string[];
  onSelect: (d: SelectedLocation) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const acRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [selected, setSelected] = useState<SelectedLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initialized, setInitialized] = useState(false);

  // Initialize on first focus to avoid loading Maps on page load
  const handleFocus = () => {
    if (initialized) return;
    setInitialized(true);
    loadGoogleMaps()
      .then(() => {
        if (!inputRef.current) return;
        acRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: 'in' },
          fields: ['formatted_address', 'geometry', 'address_components', 'name'],
          types: types || ['geocode', 'establishment'],
        });
        acRef.current.addListener('place_changed', () => {
          const place = acRef.current!.getPlace();
          if (!place.geometry?.location) {
            setError('No location found. Try again.');
            return;
          }
          let city = '', state = '';
          for (const c of place.address_components || []) {
            if (c.types.includes('locality')) city = c.long_name;
            if (c.types.includes('administrative_area_level_1')) state = c.long_name;
            if (!city && c.types.includes('sublocality_level_1')) city = c.long_name;
          }
          const result: SelectedLocation = {
            display_name: place.formatted_address || place.name || '',
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            city,
            state,
          };
          setSelected(result);
          setError('');
          onSelect(result);
        });
        setLoading(false);
      })
      .catch(() => {
        setError('Google Maps failed to load. Check your API key.');
        setLoading(false);
      });
  };

  const handleClear = () => {
    setSelected(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative', marginTop: '6px' }}>
        <Search size={14} style={{
          position: 'absolute', left: '12px', top: '50%',
          transform: 'translateY(-50%)', color: '#fda4af',
          pointerEvents: 'none', zIndex: 1,
        }} />
        {loading && initialized && (
          <Loader2 size={14} style={{
            position: 'absolute', right: '12px', top: '50%',
            transform: 'translateY(-50%)', color: '#fda4af',
          }} />
        )}
        {selected && (
          <button type="button" onClick={handleClear} style={{
            position: 'absolute', right: '10px', top: '50%',
            transform: 'translateY(-50%)', background: 'none',
            border: 'none', cursor: 'pointer', color: '#9ca3af', zIndex: 1,
          }}>
            <XCircle size={14} />
          </button>
        )}
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder || 'Search location...'}
          onFocus={handleFocus}
          style={{
            ...inputStyle, marginTop: 0,
            paddingLeft: '34px',
            paddingRight: selected ? '34px' : '14px',
          }}
          onBlur={e => (e.currentTarget.style.borderColor = selected ? '#86efac' : '#ffe4e6')}
        />
      </div>
      {error && <p style={{ fontSize: '11px', color: '#e11d48', marginTop: '4px' }}>{error}</p>}
      {selected && (
        <div style={{
          marginTop: '6px', padding: '8px 12px', borderRadius: '8px',
          backgroundColor: '#f0fdf4', border: '1px solid #86efac',
          fontSize: '11px', color: '#166534',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <CheckCircle size={11} color="#16a34a" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {selected.display_name}
          </span>
          <span style={{ color: '#9ca3af', whiteSpace: 'nowrap', fontSize: '10px' }}>
            {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
}

// ── RegisterPage ──────────────────────────────────────────────────────────────
export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [role, setRole] = useState<'donor' | 'patient'>('donor');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  // Shared
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [city, setCity] = useState('');
  const [userState, setUserState] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationDisplay, setLocationDisplay] = useState('');

  // Donor
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [donatedBefore, setDonatedBefore] = useState('');
  const [lastDonation, setLastDonation] = useState('');
  const [availableEmergency, setAvailableEmergency] = useState('');
  const [hasHealth, setHasHealth] = useState('');
  const [healthDesc, setHealthDesc] = useState('');
  const [onMeds, setOnMeds] = useState('');
  const [feelHealthy, setFeelHealthy] = useState('');
  const [consentNotif, setConsentNotif] = useState(false);
  const [consentAcc, setConsentAcc] = useState(false);

  // Patient
  const [age, setAge] = useState('');
  const [pGender, setPGender] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [hospLat, setHospLat] = useState<number | null>(null);
  const [hospLng, setHospLng] = useState<number | null>(null);
  const [hospDisplay, setHospDisplay] = useState('');
  const [condition, setCondition] = useState('');
  const [ecName, setEcName] = useState('');
  const [ecNumber, setEcNumber] = useState('');
  const [regularTrans, setRegularTrans] = useState('');
  const [expectedReq, setExpectedReq] = useState('');
  const [pConsentShare, setPConsentShare] = useState(false);
  const [pConsentAcc, setPConsentAcc] = useState(false);

  // ── GPS ───────────────────────────────────────────────────────────────────
  const handleGPS = () => {
    setGpsError('');
    if (!navigator.geolocation) {
      setGpsError('Geolocation not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lt, longitude: ln } = coords;
        setLat(lt);
        setLng(ln);
        try {
          await loadGoogleMaps();
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: { lat: lt, lng: ln } }, (results, status) => {
            if (status === 'OK' && results?.[0]) {
              setLocationDisplay(results[0].formatted_address);
              let c = '', s = '';
              for (const comp of results[0].address_components) {
                if (comp.types.includes('locality')) c = comp.long_name;
                if (comp.types.includes('administrative_area_level_1')) s = comp.long_name;
                if (!c && comp.types.includes('sublocality_level_1')) c = comp.long_name;
              }
              if (c) setCity(c);
              if (s) setUserState(s);
            } else {
              setLocationDisplay(`${lt.toFixed(5)}, ${ln.toFixed(5)}`);
            }
            setGpsLoading(false);
          });
        } catch {
          setLocationDisplay(`${lt.toFixed(5)}, ${ln.toFixed(5)}`);
          setGpsLoading(false);
        }
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(
          err.code === err.PERMISSION_DENIED
            ? 'Location access denied. Please allow permission or search manually.'
            : 'Could not get location. Please search manually below.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleUserLoc = useCallback((d: SelectedLocation) => {
    setLat(d.lat); setLng(d.lng); setLocationDisplay(d.display_name);
    if (d.city) setCity(d.city);
    if (d.state) setUserState(d.state);
  }, []);

  const handleHospLoc = useCallback((d: SelectedLocation) => {
    setHospLat(d.lat); setHospLng(d.lng); setHospDisplay(d.display_name);
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name, email, mobile, password, role,
      blood_group: bloodGroup, city, state: userState,
      latitude: lat, longitude: lng,
      ...(role === 'donor' && {
        dob, gender,
        donated_before: donatedBefore === 'Yes',
        last_donation_date: lastDonation || null,
        available_emergency: availableEmergency === 'Yes',
        has_health_issues: hasHealth === 'Yes',
        health_description: healthDesc || null,
        on_medication: onMeds === 'Yes',
        feeling_healthy: feelHealthy === 'Yes',
        consent_notifications: consentNotif,
        consent_accurate: consentAcc,
      }),
      ...(role === 'patient' && {
        age: parseInt(age), gender: pGender,
        hospital_name: hospitalName,
        hospital_location: hospDisplay,
        hospital_latitude: hospLat,
        hospital_longitude: hospLng,
        condition,
        emergency_contact_name: ecName,
        emergency_contact_number: ecNumber,
        regular_transfusions: regularTrans === 'Yes',
        expected_requirement: expectedReq || null,
        consent_share: pConsentShare,
        consent_accurate: pConsentAcc,
      }),
    };
    console.log('Register payload:', payload);
    // TODO: replace with → await api.post('/auth/register', payload)
    register(name, email, password, role as Role);
    navigate(role === 'patient' ? '/patient' : '/donor');
  };

  // ── UI helpers ────────────────────────────────────────────────────────────
  const section = (title: string) => (
    <div className="flex items-center gap-3 mb-4 mt-2">
      <p className="text-sm font-bold whitespace-nowrap" style={{ color: '#e11d48' }}>{title}</p>
      <div className="flex-1 h-px" style={{ backgroundColor: '#ffe4e6' }} />
    </div>
  );

  const yesNo = (val: string, set: (v: string) => void) => (
    <div className="flex gap-2 mt-2">
      {['Yes', 'No'].map(o => (
        <button key={o} type="button" onClick={() => set(o)}
          className="flex-1 rounded-xl py-2 text-sm font-semibold transition-colors"
          style={val === o
            ? { backgroundColor: '#e11d48', color: '#fff', border: '2px solid #e11d48' }
            : { backgroundColor: '#fff1f2', color: '#be123c', border: '2px solid #ffe4e6' }}>
          {o}
        </button>
      ))}
    </div>
  );

  const fi = (label: string, el: React.ReactNode) => (
    <div><label style={labelStyle}>{label}</label>{el}</div>
  );

  const ti = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} style={{ ...inputStyle, ...(props.style || {}) }}
      onFocus={e => (e.currentTarget.style.borderColor = '#fda4af')}
      onBlur={e => (e.currentTarget.style.borderColor = '#ffe4e6')} />
  );

  const ts = (props: React.SelectHTMLAttributes<HTMLSelectElement>, children: React.ReactNode) => (
    <select {...props} style={{ ...inputStyle, ...(props.style || {}) }}>{children}</select>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen px-4 py-12 sm:px-6 lg:px-8" style={{ backgroundColor: '#fff1f2' }}>
      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-2xl p-8" style={{ backgroundColor: '#ffffff', border: '1px solid #ffe4e6' }}>

          {/* Header */}
          <div className="text-center mb-8">
            <span className="inline-flex rounded-full px-4 py-1.5 text-xs font-semibold mb-4"
              style={{ backgroundColor: '#fff1f2', color: '#be123c' }}>Join Us</span>
            <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Create Account</h1>
            <p className="mt-2 text-sm" style={{ color: '#9ca3af' }}>Join Social Blood Bridge AI community</p>
          </div>

          {/* Role Toggle */}
          <div className="flex gap-3 mb-8">
            {(['donor', 'patient'] as const).map(r => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className="flex-1 rounded-xl py-2.5 text-sm font-bold capitalize transition-colors"
                style={role === r
                  ? { backgroundColor: '#e11d48', color: '#fff', border: '2px solid #e11d48' }
                  : { backgroundColor: '#fff1f2', color: '#be123c', border: '2px solid #ffe4e6' }}>
                {r === 'donor' ? '🩸 Donor' : '🏥 Patient'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* ── ACCOUNT INFO ── */}
            {section('Account Information')}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fi(`${role === 'patient' ? 'Patient Name' : 'Full Name'} *`,
                ti({ type: 'text', required: true, value: name, onChange: e => setName(e.target.value), placeholder: 'Your full name' }))}
              {fi('Email Address *',
                ti({ type: 'email', required: true, value: email, onChange: e => setEmail(e.target.value), placeholder: 'your@email.com' }))}
              {fi('Mobile Number *',
                ti({ type: 'tel', required: true, value: mobile, onChange: e => setMobile(e.target.value), placeholder: '+91 00000 00000' }))}
              {fi('Blood Group *',
                ts({ required: true, value: bloodGroup, onChange: e => setBloodGroup(e.target.value) },
                  <><option value="">Select</option>{['A+','A−','B+','B−','AB+','AB−','O+','O−'].map(b => <option key={b}>{b}</option>)}</>))}
              <div>
                <label style={labelStyle}>Password *</label>
                <div className="relative">
                  {ti({ type: showPwd ? 'text' : 'password', required: true, value: password, onChange: e => setPassword(e.target.value), placeholder: 'Create a strong password', style: { paddingRight: '42px' } })}
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#fda4af', marginTop: '3px' }}>
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Confirm Password *</label>
                <div className="relative">
                  {ti({ type: showConfirm ? 'text' : 'password', required: true, value: confirm, onChange: e => setConfirm(e.target.value), placeholder: 'Repeat your password', style: { paddingRight: '42px' } })}
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#fda4af', marginTop: '3px' }}>
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* ── LOCATION ── */}
            {section('Your Location')}

            {/* GPS Button */}
            <button type="button" onClick={handleGPS} disabled={gpsLoading}
              className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-semibold"
              style={{ backgroundColor: '#fff1f2', color: '#e11d48', border: '1.5px dashed #fda4af', cursor: gpsLoading ? 'not-allowed' : 'pointer', opacity: gpsLoading ? 0.7 : 1 }}>
              {gpsLoading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Detecting location...</>
                : <><MapPin className="h-4 w-4" /> Use Current Location (GPS)</>}
            </button>
            {gpsError && <p style={{ fontSize: '12px', color: '#e11d48', marginTop: '-8px' }}>{gpsError}</p>}
            {locationDisplay && !gpsError && (
              <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', fontSize: '12px', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={13} color="#16a34a" style={{ flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{locationDisplay}</span>
                <span style={{ color: '#9ca3af', whiteSpace: 'nowrap', fontSize: '11px' }}>{lat?.toFixed(4)}, {lng?.toFixed(4)}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ backgroundColor: '#ffe4e6' }} />
              <span className="text-xs font-semibold" style={{ color: '#fda4af' }}>OR SEARCH MANUALLY</span>
              <div className="flex-1 h-px" style={{ backgroundColor: '#ffe4e6' }} />
            </div>

            {/* Google Places — user location */}
            <LocationPicker
              label="Search Your Area / City *"
              placeholder="Type your colony, area, city..."
              types={['geocode']}
              onSelect={handleUserLoc}
            />

            {/* City + State auto-filled */}
            <div className="grid grid-cols-2 gap-4">
              {fi('City *', ti({ type: 'text', required: true, value: city, onChange: e => setCity(e.target.value), placeholder: 'Auto-filled or type', style: { backgroundColor: city ? '#f0fdf4' : '#fff' } }))}
              {fi('State *', ti({ type: 'text', required: true, value: userState, onChange: e => setUserState(e.target.value), placeholder: 'Auto-filled or type', style: { backgroundColor: userState ? '#f0fdf4' : '#fff' } }))}
            </div>

            {/* ══ DONOR FIELDS ══ */}
            {role === 'donor' && <>
              {section('Donor Information')}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {fi('Date of Birth *', ti({ type: 'date', required: true, value: dob, onChange: e => setDob(e.target.value) }))}
                {fi('Gender *', ts({ required: true, value: gender, onChange: e => setGender(e.target.value) },
                  <><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></>))}
              </div>
              <div><label style={labelStyle}>Donated blood before?</label>{yesNo(donatedBefore, setDonatedBefore)}</div>
              {donatedBefore === 'Yes' && fi('Last Donation Date', ti({ type: 'date', value: lastDonation, onChange: e => setLastDonation(e.target.value) }))}
              <div><label style={labelStyle}>Available for emergency requests?</label>{yesNo(availableEmergency, setAvailableEmergency)}</div>

              {section('Health Declaration')}
              <div><label style={labelStyle}>Any current health issues?</label>{yesNo(hasHealth, setHasHealth)}</div>
              {hasHealth === 'Yes' && (
                <div>
                  <label style={labelStyle}>Describe health issue</label>
                  <textarea value={healthDesc} onChange={e => setHealthDesc(e.target.value)}
                    placeholder="Brief description..." rows={3}
                    style={{ ...inputStyle, resize: 'none' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#fda4af')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#ffe4e6')} />
                </div>
              )}
              <div><label style={labelStyle}>Currently on medication?</label>{yesNo(onMeds, setOnMeds)}</div>
              <div><label style={labelStyle}>Feeling healthy and ready to donate?</label>{yesNo(feelHealthy, setFeelHealthy)}</div>

              {section('Consent')}
              <div className="flex flex-col gap-3">
                {[
                  { c: consentNotif, s: setConsentNotif, l: 'I agree to receive blood donation notifications and requests.' },
                  { c: consentAcc, s: setConsentAcc, l: 'I confirm all information provided is accurate and true.' },
                ].map((x, i) => (
                  <label key={i} className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={x.c} onChange={e => x.s(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded" style={{ accentColor: '#e11d48' }} />
                    <span className="text-sm" style={{ color: '#6b7280' }}>{x.l}</span>
                  </label>
                ))}
              </div>
            </>}

            {/* ══ PATIENT FIELDS ══ */}
            {role === 'patient' && <>
              {section('Patient Details')}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {fi('Age *', ti({ type: 'number', required: true, value: age, onChange: e => setAge(e.target.value), placeholder: 'Age' }))}
                {fi('Gender *', ts({ required: true, value: pGender, onChange: e => setPGender(e.target.value) },
                  <><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></>))}
              </div>

              {section('Medical Information')}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {fi('Hospital Name *', ti({ type: 'text', required: true, value: hospitalName, onChange: e => setHospitalName(e.target.value), placeholder: 'Hospital name' }))}
                {fi('Condition', ts({ value: condition, onChange: e => setCondition(e.target.value) },
                  <><option value="">Select</option><option>Thalassemia</option><option>Sickle Cell Anemia</option><option>Other</option></>))}
                {fi('Emergency Contact Name *', ti({ type: 'text', required: true, value: ecName, onChange: e => setEcName(e.target.value), placeholder: 'Contact name' }))}
                {fi('Emergency Contact Number *', ti({ type: 'tel', required: true, value: ecNumber, onChange: e => setEcNumber(e.target.value), placeholder: '+91 00000 00000' }))}
              </div>

              {/* Google Places — hospital */}
              <LocationPicker
                label="Hospital Location *"
                placeholder="Search hospital name, area, city..."
                types={['establishment', 'geocode']}
                onSelect={handleHospLoc}
              />
              {hospLat && (
                <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #86efac', fontSize: '11px', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={11} color="#16a34a" />
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hospDisplay}</span>
                  <span style={{ color: '#9ca3af', fontSize: '10px', whiteSpace: 'nowrap' }}>{hospLat.toFixed(4)}, {hospLng?.toFixed(4)}</span>
                </div>
              )}

              {section('Blood Requirement')}
              <div><label style={labelStyle}>Require regular transfusions?</label>{yesNo(regularTrans, setRegularTrans)}</div>
              {fi('Expected Blood Requirement',
                ti({ type: 'text', value: expectedReq, onChange: e => setExpectedReq(e.target.value), placeholder: 'e.g. 2 units every 21 days' }))}

              {section('Consent')}
              <div className="flex flex-col gap-3">
                {[
                  { c: pConsentShare, s: setPConsentShare, l: 'I agree to share my request details with coordinators and matched donors.' },
                  { c: pConsentAcc, s: setPConsentAcc, l: 'I confirm all information provided is accurate and true.' },
                ].map((x, i) => (
                  <label key={i} className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={x.c} onChange={e => x.s(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded" style={{ accentColor: '#e11d48' }} />
                    <span className="text-sm" style={{ color: '#6b7280' }}>{x.l}</span>
                  </label>
                ))}
              </div>
            </>}

            {/* Submit */}
            <button type="submit"
              className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors mt-2"
              style={{ backgroundColor: '#e11d48' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#be123c')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#e11d48')}>
              Create Account →
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: '#9ca3af' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: '#e11d48' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#be123c')}
              onMouseLeave={e => (e.currentTarget.style.color = '#e11d48')}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}