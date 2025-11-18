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
 * Logout user (client-side only - token invalidation handled by backend)
 */
export const logout = async () => {
  // Note: Backend doesn't have explicit logout endpoint
  // Token invalidation happens on refresh token rotation
  // This is just for client-side cleanup
  return Promise.resolve();
};

