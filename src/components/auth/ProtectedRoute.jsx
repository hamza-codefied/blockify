/**
 * Protected Route Component
 * Wraps routes that require authentication
 */
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useGetProfile } from '@/hooks/useAuth';

export const ProtectedRoute = () => {
  const { isAuthenticated, token } = useAuthStore();
  const location = useLocation();
  
  // Fetch user profile if token exists
  const { isLoading, isError } = useGetProfile();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00b894] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no token or profile fetch failed, redirect to login
  if (!token || (!isAuthenticated && isError)) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

