import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Droplets, Users, Brain, Shield, Bell, BarChart3, Lightbulb, Settings, LogOut, X, ChevronLeft, Heart, History, Award, User } from 'lucide-react';

interface SidebarProps { items: { path: string; label: string; icon: React.ReactNode }[]; title: string; subtitle?: string; open: boolean; onClose: () => void; }

export function Sidebar({ items, title, subtitle, open, onClose }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={onClose} />}
      <aside className={cn('fixed left-0 top-0 z-40 flex h-full flex-col border-r border-gray-200 bg-white transition-all dark:border-gray-800 dark:bg-gray-950', collapsed ? 'w-[72px]' : 'w-[260px]', open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0')}>
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary-600" />
            {!collapsed && <div><h1 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h1>{subtitle && <p className="text-[10px] text-gray-500 dark:text-gray-400">{subtitle}</p>}</div>}
          </div>
          <button onClick={onClose} className="lg:hidden"><X className="h-5 w-5" /></button>
          <button onClick={() => setCollapsed(!collapsed)} className="hidden lg:block"><ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} /></button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin">
          <ul className="space-y-1">
            {items.map(item => (
              <li key={item.path}>
                <NavLink to={item.path} onClick={onClose} className={({ isActive }) => cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors', isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white')}>
                  {item.icon}{!collapsed && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-gray-200 p-3 dark:border-gray-800">
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white">
            <LogOut className="h-5 w-5" />{!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export const adminSidebarItems = [
  { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { path: '/admin/requests', label: 'Blood Requests', icon: <Droplets className="h-5 w-5" /> },
  { path: '/admin/donors', label: 'Donor Management', icon: <Users className="h-5 w-5" /> },
  { path: '/admin/ai-matching', label: 'AI Matching Engine', icon: <Brain className="h-5 w-5" /> },
  { path: '/admin/backup-workflow', label: 'Backup Workflow', icon: <Shield className="h-5 w-5" /> },
  { path: '/admin/notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" /> },
  { path: '/admin/analytics', label: 'Analytics', icon: <BarChart3 className="h-5 w-5" /> },
  { path: '/admin/insights', label: 'AI Insights', icon: <Lightbulb className="h-5 w-5" /> },
  { path: '/admin/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

export const donorSidebarItems = [
  { path: '/donor', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { path: '/donor/requests', label: 'My Requests', icon: <Droplets className="h-5 w-5" /> },
  { path: '/donor/history', label: 'Donation History', icon: <History className="h-5 w-5" /> },
  { path: '/donor/notifications', label: 'Notifications', icon: <Bell className="h-5 w-5" /> },
  { path: '/donor/achievements', label: 'Achievements', icon: <Award className="h-5 w-5" /> },
  { path: '/donor/profile', label: 'Profile', icon: <User className="h-5 w-5" /> },
];

export const patientSidebarItems = [
  {
    path: '/patient',
    label: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    path: '/patient/requests',
    label: 'Blood Requests',
    icon: <Droplets className="h-5 w-5" />,
  },
  {
    path: '/patient/history',
    label: 'Transfusion History',
    icon: <History className="h-5 w-5" />,
  },
  {
    path: '/patient/notifications',
    label: 'Notifications',
    icon: <Bell className="h-5 w-5" />,
  },
  {
    path: '/patient/profile',
    label: 'Profile',
    icon: <User className="h-5 w-5" />,
  },
];
