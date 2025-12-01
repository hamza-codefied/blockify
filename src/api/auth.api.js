/**
 * Auth API Service
 * Handles all authentication-related API calls
 */
import apiClient from './client';

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} API response with user data and tokens
 */
export const login = async (email, password) => {
  const response = await apiClient.post('/auth/login', {
    email,
    password,
  });
  return response.data;
};

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise} API response with new access token
 */
export const refreshToken = async (refreshToken) => {
  const response = await apiClient.post('/auth/refresh', {
    refreshToken,
  });
  return response.data;
};

/**
 * Get current user profile
 * @returns {Promise} API response with user profile and permissions
 */
export const getProfile = async () => {
  const response = await apiClient.get('/auth/profile');
  return response.data;
};

/**
 * Logout user
 * @param {string} refreshToken - Optional refresh token to logout from specific device
 * @returns {Promise} API response
 */
export const logout = async (refreshToken = null) => {
  try {
    // Try to call logout API if we have a token
    // If token is expired, this will fail but that's okay - we'll still clear local state
    const response = await apiClient.post('/auth/logout', {
      ...(refreshToken && { refreshToken }),
    });
    return response.data;
  } catch (error) {
    // If logout API call fails (e.g., token expired), that's okay
    // We'll still clear local state in the hook
    console.warn('Logout API call failed (this is okay if token is expired):', error);
    return Promise.resolve({ success: true, message: 'Logged out locally' });
  }
};

