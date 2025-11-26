/**
 * Requests React Query Hooks
 * Custom hooks for request operations using React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRequests,
  approveRequest,
  denyRequest,
} from '@/api/requests.api';
import { message } from 'antd';

/**
 * Hook for getting all requests
 */
export const useGetRequests = (params = {}) => {
  return useQuery({
    queryKey: ['requests', params],
    queryFn: () => getRequests(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook for approving a request
 */
export const useApproveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, data }) => approveRequest(requestId, data),
    onSuccess: (data, variables) => {
      message.success('Request approved successfully');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to approve request';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for denying a request
 */
export const useDenyRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, data }) => denyRequest(requestId, data),
    onSuccess: (data, variables) => {
      message.success('Request denied successfully');
      queryClient.invalidateQueries({ queryKey: ['requests'] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to deny request';
      message.error(errorMessage);
      throw error;
    },
  });
};

