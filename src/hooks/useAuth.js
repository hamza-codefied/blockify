/**
 * Auth React Query Hooks
 * Custom hooks for authentication operations using React Query
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { login, refreshToken, getProfile, logout } from '@/api/auth.api';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

/**
 * Hook for user login
 */
export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: ({ email, password }) => login(email, password),
    onSuccess: (data) => {
      // Extract response data - backend returns { user, token, refreshToken, ... }
      const responseData = data.data || data;
      const { user, token, refreshToken: refresh, permissions } = responseData;
      
      // Debug logging
      console.log('Login success - storing auth:', { 
        hasUser: !!user, 
        hasToken: !!token, 
        hasRefreshToken: !!refresh 
      });
      
      // Update auth store
      setAuth(user, token, refresh, permissions || []);
      
      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      
      // Navigate to dashboard
      navigate('/dashboard');
      
      return data;
    },
    onError: (error) => {
      console.error('Login error:', error);
      throw error;
    },
  });
};

/**
 * Hook for refreshing token
 */
export const useRefreshToken = () => {
  const { refreshToken: storedRefreshToken, setToken, setRefreshToken } = useAuthStore();

  return useMutation({
    mutationFn: (refreshToken) => refreshToken(refreshToken || storedRefreshToken),
    onSuccess: (data) => {
      const { token, refreshToken: newRefreshToken } = data.data;
      
      // Update tokens in store
      setToken(token);
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }
      
      return data;
    },
    onError: (error) => {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      useAuthStore.getState().logout();
      throw error;
    },
  });
};

/**
 * Hook for getting user profile
 */
export const useGetProfile = () => {
  const { token } = useAuthStore();

  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const data = await getProfile();
      const { user, permissions } = data.data;
      
      // Update auth store with latest user data
      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setPermissions(permissions || []);
      
      return data;
    },
    enabled: !!token, // Enable if token exists (even if isAuthenticated is false initially)
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

/**
 * Hook for logout
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout: logoutStore, refreshToken } = useAuthStore();

  return useMutation({
    mutationFn: () => logout(refreshToken), // Pass refresh token to logout API
    onSuccess: () => {
      // Clear auth store (this also clears localStorage)
      logoutStore();
      
      // Clear all React Query cache
      queryClient.clear();
      
      // Remove all query data
      queryClient.removeQueries();
      
      // Navigate to login
      navigate('/', { replace: true });
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      logoutStore();
      queryClient.clear();
      queryClient.removeQueries();
      navigate('/', { replace: true });
    },
  });
};

