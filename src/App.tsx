import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import DonorLayout from './layouts/DonorLayout';
import PatientLayout from './layouts/PatientLayout';

import { LandingPage } from './pages/public/LandingPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';

import { DashboardPage as AdminDashboard } from './pages/admin/DashboardPage';
import { BloodRequestsPage } from './pages/admin/BloodRequestsPage';
import { CreateRequestPage } from './pages/admin/CreateRequestPage';
import { RequestDetailPage } from './pages/admin/RequestDetailPage';
import { DonorManagementPage } from './pages/admin/DonorManagementPage';
import { DonorDetailPage } from './pages/admin/DonorDetailPage';
import { AIMatchingPage } from './pages/admin/AIMatchingPage';
import { BackupWorkflowPage } from './pages/admin/BackupWorkflowPage';
import { NotificationsPage as AdminNotifications } from './pages/admin/NotificationsPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { InsightsPage } from './pages/admin/InsightsPage';
import { SettingsPage } from './pages/admin/SettingsPage';

import { DonorDashboardPage } from './pages/donor/DashboardPage';
import { MyRequestsPage } from './pages/donor/MyRequestsPage';
import { DonationHistoryPage } from './pages/donor/DonationHistoryPage';
import { NotificationsPage as DonorNotifications } from './pages/donor/NotificationsPage';
import { AchievementsPage } from './pages/donor/AchievementsPage';
import { ProfilePage } from './pages/donor/ProfilePage';

import { PatientBloodRequestsPage } from './pages/patient/BloodRequestsPage';
import { PatientDashboardPage } from './pages/patient/DashboardPage';
import { PatientTransfusionHistoryPage } from './pages/patient/TransfusionHistoryPage';
import { PatientNotificationsPage } from './pages/patient/NotificationsPage';
import { PatientProfilePage } from './pages/patient/ProfilePage';

function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode;
  role: 'coordinator' | 'donor' | 'patient';
}) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  const postLoginRedirect =
    user?.role === 'coordinator'
      ? '/admin'
      : user?.role === 'patient'
      ? '/patient'
      : '/donor';

  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={postLoginRedirect} replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={postLoginRedirect} replace /> : <RegisterPage />}
      />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="coordinator">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="requests" element={<BloodRequestsPage />} />
        <Route path="requests/create" element={<CreateRequestPage />} />
        <Route path="requests/:id" element={<RequestDetailPage />} />
        <Route path="donors" element={<DonorManagementPage />} />
        <Route path="donors/:id" element={<DonorDetailPage />} />
        <Route path="ai-matching" element={<AIMatchingPage />} />
        <Route path="backup-workflow" element={<BackupWorkflowPage />} />
        <Route path="notifications" element={<AdminNotifications />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="insights" element={<InsightsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Donor */}
      <Route
        path="/donor"
        element={
          <ProtectedRoute role="donor">
            <DonorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DonorDashboardPage />} />
        <Route path="requests" element={<MyRequestsPage />} />
        <Route path="history" element={<DonationHistoryPage />} />
        <Route path="notifications" element={<DonorNotifications />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Patient */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute role="patient">
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PatientDashboardPage />} />
        <Route path="requests" element={<PatientBloodRequestsPage />} />
        <Route path="history" element={<PatientTransfusionHistoryPage />} />
        <Route path="notifications" element={<PatientNotificationsPage />} />
        <Route path="profile" element={<PatientProfilePage />} />
      </Route>

      {/* Fallback — must be last */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}