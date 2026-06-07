import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { currentUser } from '../../data/mockData';
import { cn } from '../../utils/cn';

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'organization' | 'notifications' | 'theme' | 'api'>('profile');

  const [profileForm, setProfileForm] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone,
    avatar: '',
  });

  const [orgForm, setOrgForm] = useState({
    orgName: currentUser.organization || '',
    address: 'Karachi, Pakistan',
  });

  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    sms: true,
    push: false,
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'User' },
    { id: 'organization', label: 'Organization', icon: 'Building' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'theme', label: 'Theme', icon: 'Palette' },
    { id: 'api', label: 'API', icon: 'Code' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Manage your account and system preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="space-y-2 lg:col-span-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'w-full rounded-lg px-4 py-2 text-left font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-primary-600 text-white dark:bg-primary-500'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'profile' && (
            <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update your personal details</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="input-field mt-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="input-field mt-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="input-field mt-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Avatar</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="input-field mt-2"
                  />
                </div>
              </div>

              <div className="flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
                <button className="btn-primary">Save Changes</button>
                <button className="btn-ghost">Cancel</button>
              </div>
            </div>
          )}

          {activeTab === 'organization' && (
            <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Organization Details</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your organization information</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Organization Name</label>
                  <input
                    type="text"
                    value={orgForm.orgName}
                    onChange={e => setOrgForm({ ...orgForm, orgName: e.target.value })}
                    className="input-field mt-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                  <input
                    type="text"
                    value={orgForm.address}
                    onChange={e => setOrgForm({ ...orgForm, address: e.target.value })}
                    className="input-field mt-2"
                  />
                </div>
              </div>

              <div className="flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
                <button className="btn-primary">Save Changes</button>
                <button className="btn-ghost">Cancel</button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Preferences</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose how you want to receive notifications</p>
              </div>

              <div className="space-y-4">
                <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.email}
                    onChange={e => setNotificationPrefs({ ...notificationPrefs, email: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates via email</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.sms}
                    onChange={e => setNotificationPrefs({ ...notificationPrefs, sms: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">SMS Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates via SMS</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <input
                    type="checkbox"
                    checked={notificationPrefs.push}
                    onChange={e => setNotificationPrefs({ ...notificationPrefs, push: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive browser push notifications</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
                <button className="btn-primary">Save Preferences</button>
                <button className="btn-ghost">Cancel</button>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Theme Settings</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Customize your interface appearance</p>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-gray-200 dark:border-gray-800">
                  <div className="p-4">
                    <p className="font-medium text-gray-900 dark:text-white">Color Theme</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose between light and dark mode</p>
                  </div>
                  <div className="border-t border-gray-200 p-4 dark:border-gray-800">
                    <div className="flex gap-4">
                      <button
                        onClick={() => { if (theme === 'dark') toggleTheme(); }}
                        className={cn(
                          'flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors',
                          theme === 'light'
                            ? 'bg-primary-600 text-white dark:bg-primary-500'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                        )}
                      >
                        <Sun className="h-4 w-4" />
                        Light
                      </button>
                      <button
                        onClick={() => { if (theme === 'light') toggleTheme(); }}
                        className={cn(
                          'flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors',
                          theme === 'dark'
                            ? 'bg-primary-600 text-white dark:bg-primary-500'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                        )}
                      >
                        <Moon className="h-4 w-4" />
                        Dark
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">API Settings</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your API configuration</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">API Key</label>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="password"
                      value="••••••••••••••••••••"
                      disabled
                      className="input-field flex-1 bg-gray-100 dark:bg-gray-800"
                    />
                    <button className="btn-secondary">Generate New</button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Base URL</label>
                  <input
                    type="url"
                    placeholder="https://api.bloodbridge.org"
                    className="input-field mt-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">External Services</label>
                  <div className="mt-2 space-y-2">
                    <button className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800">
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">Amazon Web Services</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Connect to AWS for backup and analytics</p>
                      </div>
                      <span className="text-sm font-medium text-primary-600 dark:text-primary-400">Connect</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
                <button className="btn-primary">Save Configuration</button>
                <button className="btn-ghost">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
