import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SEOProvider } from '@contexts/SEOContext';
import { Layout } from '@layouts/Layout';
import { PWAInstallPrompt } from '@components/pwa/PWAInstallPrompt';
import { PWAUpdatePrompt } from '@components/pwa/PWAUpdatePrompt';
import { PerformanceMonitor } from '@components/performance/PerformanceMonitor';
import { preloadCriticalResources } from '@utils/performance';

// Pages
import { Dashboard } from '@pages/Dashboard';
import { Attendance } from '@pages/Attendance';
import { Session } from '@pages/Session';
import { UserManagement } from '@pages/UserManagement';
import { Profile } from '@pages/Profile';
import NotFound from '@pages/NotFound';
import Login from '@pages/Login';
import SignUp from '@/pages/SignUp';
import ForgotPassword from '@pages/ForgotPassword';

function App() {
  useEffect(() => {
    preloadCriticalResources();
  }, []);

  return (
    <SEOProvider>
      <Router>
        <Routes>
          {/* Login page as default */}
          <Route path='/' element={<Login />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />

          {/* Protected routes under layout */}
          <Route element={<Layout />}>
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/attendance' element={<Attendance />} />
            <Route path='/session' element={<Session />} />
            <Route path='/users' element={<UserManagement />} />
            <Route path='/profile' element={<Profile />} />
          </Route>

          <Route path='*' element={<NotFound />} />
        </Routes>

        <PWAInstallPrompt />
        <PWAUpdatePrompt />
        <PerformanceMonitor enabled={process.env.NODE_ENV === 'development'} />
      </Router>
    </SEOProvider>
  );
}

export default App;
