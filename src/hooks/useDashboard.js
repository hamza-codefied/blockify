/**
 * Dashboard React Query Hooks
 * Custom hooks for dashboard operations using React Query
 */
import { useQuery } from '@tanstack/react-query';
import {
  getDashboardStatistics,
  getActivities,
} from '@/api/dashboard.api';

/**
 * Hook for getting dashboard statistics
 */
export const useGetDashboardStatistics = () => {
  return useQuery({
    queryKey: ['dashboard', 'statistics'],
    queryFn: () => getDashboardStatistics(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
};

/**
 * Hook for getting activities list
 */
export const useGetActivities = (params = {}) => {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: () => getActivities(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};

