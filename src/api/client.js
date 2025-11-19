/**
 * Axios API Client
 * Configured with interceptors for authentication and error handling
 */
import axios from 'axios';
import { API_CONFIG } from '@/config/api.config';
import { useAuthStore } from '@/store/authStore';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('API request made without token:', config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken, logout } = useAuthStore.getState();

      // Try to refresh token
      if (refreshToken) {
        try {
          // Use a separate axios instance to avoid infinite loop
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}/auth/refresh`,
            { refreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          const { token: newToken, refreshToken: newRefreshToken } = response.data.data || {};
          
          if (newToken) {
            useAuthStore.getState().setToken(newToken);
            if (newRefreshToken) {
              useAuthStore.getState().setRefreshToken(newRefreshToken);
            }

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed - logout user
          logout();
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token - logout
        logout();
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default apiClient;

