/**
 * Schedule Change Requests React Query Hooks
 * Custom hooks for schedule change request operations using React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAvailableAlternatives,
  createScheduleChangeRequest,
  getMyScheduleChangeRequests,
  getAllScheduleChangeRequests,
  approveScheduleChangeRequest,
  denyScheduleChangeRequest,
} from '@/api/schedule-change-requests.api';
import { message } from 'antd';

/**
 * Hook for getting available alternative schedules
 */
export const useGetAvailableAlternatives = (fromScheduleId, enabled = true) => {
  return useQuery({
    queryKey: ['schedule-change-requests', 'alternatives', fromScheduleId],
    queryFn: () => getAvailableAlternatives(fromScheduleId),
    enabled: enabled && !!fromScheduleId,
    staleTime: 0, // Always fetch fresh data
  });
};

/**
 * Hook for creating a schedule change request (student)
 */
export const useCreateScheduleChangeRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createScheduleChangeRequest,
    onSuccess: (data) => {
      message.success('Schedule change request created successfully');
      queryClient.invalidateQueries({ queryKey: ['schedule-change-requests'] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create schedule change request';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for getting student's schedule change requests
 */
export const useGetMyScheduleChangeRequests = (params = {}) => {
  return useQuery({
    queryKey: ['schedule-change-requests', 'my', params],
    queryFn: () => getMyScheduleChangeRequests(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook for getting all schedule change requests (admin)
 */
export const useGetAllScheduleChangeRequests = (params = {}) => {
  return useQuery({
    queryKey: ['schedule-change-requests', 'admin', params],
    queryFn: () => getAllScheduleChangeRequests(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook for approving a schedule change request (admin)
 */
export const useApproveScheduleChangeRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, data }) => approveScheduleChangeRequest(requestId, data),
    onSuccess: (data, variables) => {
      const removedCount = data?.data?.removedConflictingSchedules || 0;
      if (removedCount > 0) {
        message.success(`Schedule change approved. ${removedCount} conflicting schedule(s) were automatically removed.`);
      } else {
        message.success('Schedule change request approved successfully');
      }
      queryClient.invalidateQueries({ queryKey: ['schedule-change-requests'] });
      queryClient.invalidateQueries({ queryKey: ['students'] }); // Invalidate students to refresh schedule data
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to approve schedule change request';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for denying a schedule change request (admin)
 */
export const useDenyScheduleChangeRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, data }) => denyScheduleChangeRequest(requestId, data),
    onSuccess: () => {
      message.success('Schedule change request denied successfully');
      queryClient.invalidateQueries({ queryKey: ['schedule-change-requests'] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to deny schedule change request';
      message.error(errorMessage);
      throw error;
    },
  });
};

