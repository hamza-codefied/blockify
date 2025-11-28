/**
 * Attendance React Query Hooks
 * Custom hooks for attendance operations using React Query
 */
import { useQuery } from '@tanstack/react-query';
import {
  getAttendanceStatistics,
  getAttendanceSessionsList,
} from '@/api/attendance.api';

/**
 * Hook for getting attendance statistics
 */
export const useGetAttendanceStatistics = () => {
  return useQuery({
    queryKey: ['attendance', 'statistics'],
    queryFn: () => getAttendanceStatistics(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
};

/**
 * Hook for getting attendance sessions list
 */
export const useGetAttendanceSessionsList = (params = {}) => {
  return useQuery({
    queryKey: ['attendance', 'sessions', params],
    queryFn: () => getAttendanceSessionsList(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
};

