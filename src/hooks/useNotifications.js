/**
 * Notifications React Query Hooks
 * Custom hooks for notification operations using React Query
 */
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  markAllNotificationsAsRead,
} from '@/api/notifications.api';
import { message } from 'antd';
import { useNotificationStore } from '@/store/notificationStore';

/**
 * Hook for initial notification fetch (called once on app load)
 * Populates the Zustand store with notifications
 */
export const useInitialNotificationFetch = () => {
  const { initialized, setInitialNotifications, setLoading } = useNotificationStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications-initial'],
    queryFn: () => getNotifications({ page: 1, limit: 20, sort: 'created_at', sortOrder: 'DESC' }),
    enabled: !initialized, // Only fetch if not already initialized
    staleTime: Infinity, // Never refetch automatically
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (data?.data && !initialized) {
      const { notifications, pagination, unreadCount } = data.data;
      setInitialNotifications(notifications || [], unreadCount || 0, pagination);
      console.log('[Notifications] Initial fetch complete:', {
        count: notifications?.length,
        unreadCount
      });
    }
  }, [data, initialized, setInitialNotifications]);

  useEffect(() => {
    if (error) {
      console.error('[Notifications] Initial fetch failed:', error);
    }
  }, [error]);

  return { isLoading, error };
};

/**
 * Hook for getting notifications with pagination (for infinite scroll in popover)
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
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: (data) => {
      // Update Zustand store
      markAllAsRead();
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
