/**
 * Notifications React Query Hooks
 * Custom hooks for notification operations using React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  markAllNotificationsAsRead,
} from '@/api/notifications.api';
import { message } from 'antd';

/**
 * Hook for getting all notifications with infinite scroll support
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options (enabled, etc.)
 */
export const useGetNotifications = (params = {}, options = {}) => {
  // Remove _refresh from params before sending to API (it's only for cache busting)
  const { _refresh, ...apiParams } = params;
  
  return useQuery({
    queryKey: ['notifications', params], // Include _refresh in key for cache busting
    queryFn: () => getNotifications(apiParams), // Don't send _refresh to API
    staleTime: 0, // Always consider data stale to allow refetching
    cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    ...options
  });
};

/**
 * Hook for marking all notifications as read
 */
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: (data) => {
      // Invalidate notifications query to refresh the list and unread count
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to mark notifications as read';
      message.error(errorMessage);
      throw error;
    },
  });
};

