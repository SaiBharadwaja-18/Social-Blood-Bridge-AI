import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, patientSidebarItems } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';

export default function PatientLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-rose-50">
      <Sidebar
        items={patientSidebarItems}
        title="Blood Bridge AI"
        subtitle="Patient Portal"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-[260px]">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}