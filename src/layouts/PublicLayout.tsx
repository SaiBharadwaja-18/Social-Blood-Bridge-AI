import { Link, Outlet, useLocation } from 'react-router-dom';
import { Heart, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils/cn';

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* HEADER */}
      <header
        className="sticky top-0 z-30 backdrop-blur-md"
        style={{ backgroundColor: 'rgba(255,255,255,0.92)', borderBottom: '1px solid #ffe4e6' }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6" style={{ color: '#e11d48' }} />
            <span className="text-lg font-bold" style={{ color: '#111827' }}>Social Blood Bridge AI</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                style={
                  location.pathname === link.path
                    ? { backgroundColor: '#fff1f2', color: '#be123c' }
                    : { color: '#6b7280' }
                }
                onMouseEnter={e => {
                  if (location.pathname !== link.path) {
                    e.currentTarget.style.backgroundColor = '#fff1f2';
                    e.currentTarget.style.color = '#be123c';
                  }
                }}
                onMouseLeave={e => {
                  if (location.pathname !== link.path) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#6b7280';
                  }
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden md:inline-flex items-center rounded-xl px-5 py-2 text-sm font-semibold transition-colors"
              style={{ color: '#e11d48', border: '1.5px solid #fda4af', backgroundColor: '#ffffff' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fff1f2')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="hidden md:inline-flex items-center rounded-xl px-5 py-2 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: '#e11d48' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#be123c')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#e11d48')}
            >
              Register
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden rounded-lg p-1.5 transition-colors"
              style={{ color: '#e11d48' }}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ borderTop: '1px solid #ffe4e6', backgroundColor: '#ffffff' }} className="px-4 py-3 md:hidden">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                style={{ color: '#6b7280' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fff1f2'; e.currentTarget.style.color = '#be123c'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6b7280'; }}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2 pt-3" style={{ borderTop: '1px solid #ffe4e6' }}>
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                style={{ color: '#e11d48', border: '1.5px solid #fda4af', backgroundColor: '#ffffff' }}
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: '#e11d48' }}
              >
                Register
              </Link>
            </div>
          </div>
        )}
      </header>

      <Outlet />

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid #ffe4e6', backgroundColor: '#fff1f2' }}>
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5" style={{ color: '#e11d48' }} />
              <span className="text-sm font-semibold" style={{ color: '#111827' }}>Social Blood Bridge AI</span>
            </div>
            <p className="text-xs" style={{ color: '#9ca3af' }}>
              Autonomous AI-Powered Blood Coordination Platform for Blood Warriors
            </p>
            <p className="text-xs" style={{ color: '#d1d5db' }}>
              &copy; 2026 Social Blood Bridge AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}