import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, donorSidebarItems } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';

export default function DonorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar items={donorSidebarItems} title="Blood Bridge AI" subtitle="Donor Portal" open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-[260px]">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
