import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider } from 'antd';
import { SEOProvider } from '@contexts/SEOContext';
import { DarkModeProvider, useDarkMode } from '@contexts/DarkModeContext';
import { SocketProvider } from '@contexts/SocketContext';
import { getAntdTheme } from '@config/antdTheme';
import { Layout } from '@layouts/Layout';
import { ProtectedRoute } from '@components/auth/ProtectedRoute';
import { PWAInstallPrompt } from '@components/pwa/PWAInstallPrompt';
import { PWAUpdatePrompt } from '@components/pwa/PWAUpdatePrompt';
import { PerformanceMonitor } from '@components/performance/PerformanceMonitor';
import { preloadCriticalResources } from '@utils/performance';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Pages
import { Dashboard } from '@pages/Dashboard';
import { Attendance } from '@pages/Attendance';
import { Session } from '@pages/Session';
import { UserManagement } from '@pages/UserManagement';
import { Profile } from '@pages/Profile';
import NotFound from '@pages/NotFound';
import Login from '@pages/Login';
import ForgotPassword from '@pages/ForgotPassword';

function AppContent() {
  const { darkMode } = useDarkMode();

  useEffect(() => {
    preloadCriticalResources();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={getAntdTheme(darkMode)}>
        <SEOProvider>
          <SocketProvider>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route path='/' element={<Login />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />

                {/* Protected routes under layout */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<Layout />}>
                    <Route path='/dashboard' element={<Dashboard />} />
                    <Route path='/attendance' element={<Attendance />} />
                    <Route path='/session' element={<Session />} />
                    <Route path='/users' element={<UserManagement />} />
                    <Route path='/profile' element={<Profile />} />
                  </Route>
                </Route>

                <Route path='*' element={<NotFound />} />
              </Routes>

              <PWAInstallPrompt />
              <PWAUpdatePrompt />
              <PerformanceMonitor enabled={process.env.NODE_ENV === 'development'} />
            </Router>
          </SocketProvider>
        </SEOProvider>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <DarkModeProvider>
      <AppContent />
    </DarkModeProvider>
  );
}

export default App;
