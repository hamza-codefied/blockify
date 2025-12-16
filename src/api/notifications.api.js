/**
 * Notifications API Service
 * Handles all notification-related API calls
 */
import apiClient from './client';

/**
 * Get all notifications with pagination and filters
 * @param {Object} params - Query parameters (page, limit, sort, sortOrder, type, read)
 * @returns {Promise} API response with notifications, pagination, and unreadCount
 */
export const getNotifications = async (params = {}) => {
  const response = await apiClient.get('/admin/notifications', { params });
  return response.data;
};

/**
 * Mark all notifications as read
 * @returns {Promise} API response with updated count
 */
export const markAllNotificationsAsRead = async () => {
  const response = await apiClient.put('/admin/notifications/mark-all-read');
  return response.data;
};

