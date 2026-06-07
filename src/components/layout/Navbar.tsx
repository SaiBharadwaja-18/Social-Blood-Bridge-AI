import { useState } from 'react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { notifications } from '../../data/mockData';
import { Menu, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps { onMenuClick: () => void; }

const portalLabel: Record<string, string> = {
  donor: 'Donor Portal',
  patient: 'Patient Portal',
  admin: 'Coordinator Portal',
};

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const unread = notifications.filter(n => !n.read).length;
  const handleLogout = () => { logout(); navigate('/'); };

  const notifRoute =
    user?.role === 'donor'
      ? '/donor/notifications'
      : user?.role === 'patient'
      ? '/patient/notifications'
      : '/admin/notifications';

  const profileRoute =
    user?.role === 'donor'
      ? '/donor/profile'
      : user?.role === 'patient'
      ? '/patient/profile'
      : '/admin/settings';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden">
          <Menu className="h-5 w-5 text-gray-600" />
        </button>
        {user?.role && (
          <span className="hidden text-sm font-semibold text-rose-600 lg:block">
            {portalLabel[user.role] ?? 'Dashboard'}
          </span>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-xl">
              <div className="border-b border-gray-100 px-4 py-3">
                <h3 className="text-sm font-semibold">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto scrollbar-thin">
                {notifications.slice(0, 5).map(n => (
                  <div
                    key={n.id}
                    className={cn(
                      'border-b border-gray-50 px-4 py-3',
                      !n.read && 'bg-rose-50/40'
                    )}
                  >
                    <p className="text-xs font-semibold text-gray-900">{n.title}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{n.message}</p>
                  </div>
                ))}
              </div>
              <Link
                to={notifRoute}
                onClick={() => setNotifOpen(false)}
                className="block border-t border-gray-100 px-4 py-2.5 text-center text-xs font-semibold text-rose-600 hover:bg-gray-50"
              >
                View All Notifications
              </Link>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-700">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-xl">
              <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                {user?.role && (
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-rose-600">
                    {user.role}
                  </p>
                )}
              </div>
              <div className="p-2">
                <Link
                  to={profileRoute}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User className="h-4 w-4" /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}