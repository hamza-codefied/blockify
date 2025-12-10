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
  // Serialize array params as repeated keys (e.g., gradeIds=id1&gradeIds=id2 instead of gradeIds[]=id1&gradeIds[]=id2)
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value === null || value === undefined) {
        return; // Skip null/undefined values
      }
      if (Array.isArray(value)) {
        // For arrays, add each value as a repeated key
        value.forEach(item => {
          if (item !== null && item !== undefined) {
            searchParams.append(key, item);
          }
        });
      } else {
        searchParams.append(key, value);
      }
    });
    return searchParams.toString();
  },
});

// Token refresh queue to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

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
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

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

            // Process queued requests with new token
            processQueue(null, newToken);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          } else {
            throw new Error('No token received from refresh endpoint');
          }
        } catch (refreshError) {
          // Refresh failed - process queue with error and logout user
          processQueue(refreshError, null);
          logout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // No refresh token - logout
        isRefreshing = false;
        logout();
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default apiClient;

