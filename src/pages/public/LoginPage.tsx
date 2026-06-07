import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // AuthContext handles redirect based on role automatically
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: '10px',
    border: '1.5px solid #ffe4e6',
    backgroundColor: '#ffffff',
    padding: '10px 14px',
    fontSize: '14px',
    color: '#111827',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: '#fff1f2' }}
    >
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl p-8"
          style={{ backgroundColor: '#ffffff', border: '1px solid #ffe4e6' }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <span
              className="inline-flex rounded-full px-4 py-1.5 text-xs font-semibold mb-4"
              style={{ backgroundColor: '#fff1f2', color: '#be123c' }}
            >
              Welcome Back
            </span>
            <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>Sign In</h1>
            <p className="mt-2 text-sm" style={{ color: '#9ca3af' }}>
              Social Blood Bridge AI
            </p>
          </div>

          {/* Coordinator hint */}
          <div style={{
            backgroundColor: '#fff1f2',
            border: '1px solid #ffe4e6',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '20px',
            fontSize: '12px',
            color: '#be123c',
          }}>
            🎯 <strong>Coordinator:</strong> coordinator@bloodwarriors.org / BloodWarriors@2025!
          </div>

          {/* Error */}
          {error && (
            <div style={{
              backgroundColor: '#fff1f2',
              border: '1px solid #fda4af',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#e11d48',
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Email */}
            <div>
              <label className="text-xs font-bold tracking-widest uppercase"
                style={{ color: '#6b7280' }}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                style={{ ...inputStyle, marginTop: '6px' }}
                onFocus={e => (e.currentTarget.style.borderColor = '#fda4af')}
                onBlur={e  => (e.currentTarget.style.borderColor = '#ffe4e6')}
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold tracking-widest uppercase"
                style={{ color: '#6b7280' }}>
                Password
              </label>
              <div className="relative" style={{ marginTop: '6px' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{ ...inputStyle, paddingRight: '42px' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#fda4af')}
                  onBlur={e  => (e.currentTarget.style.borderColor = '#ffe4e6')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#fda4af' }}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold"
                style={{ color: '#e11d48' }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2"
              style={{
                backgroundColor: loading ? '#fda4af' : '#e11d48',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#be123c'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.backgroundColor = '#e11d48'; }}
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
                : 'Sign In →'
              }
            </button>

          </form>

          <p className="mt-6 text-center text-sm" style={{ color: '#9ca3af' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold"
              style={{ color: '#e11d48' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#be123c')}
              onMouseLeave={e => (e.currentTarget.style.color = '#e11d48')}
            >
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}