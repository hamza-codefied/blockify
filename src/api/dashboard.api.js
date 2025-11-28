/**
 * Dashboard API Service
 * Handles all dashboard-related API calls
 */
import apiClient from './client';

/**
 * Get dashboard statistics
 * @returns {Promise} API response with dashboard statistics
 */
export const getDashboardStatistics = async () => {
  const response = await apiClient.get('/admin/dashboard/statistics');
  return response.data;
};

/**
 * Get activities list
 * @param {Object} params - Query parameters (page, limit, activityType, action, userId, startDate, endDate)
 * @returns {Promise} API response with activities and pagination
 */
export const getActivities = async (params = {}) => {
  const response = await apiClient.get('/admin/activities', { params });
  return response.data;
};

