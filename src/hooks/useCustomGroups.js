/**
 * Custom Groups React Query Hooks
 * Custom hooks for custom group operations using React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCustomGroups,
  getCustomGroupById,
  createCustomGroup,
  updateCustomGroup,
  deleteCustomGroup,
  getCustomGroupSessions,
  createCustomGroupSession,
  getCustomGroupSessionById,
} from '@/api/customgroups.api';
import { message } from 'antd';

// ==================== Custom Groups CRUD Hooks (Admin) ====================

/**
 * Hook for getting all custom groups (Admin) with pagination
 * @param {Object} params - Query parameters (page, limit, sort, sortOrder, status, search)
 */
export const useGetCustomGroups = (params = {}) => {
  return useQuery({
    queryKey: ['customGroups', params],
    queryFn: () => getCustomGroups(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook for getting a single custom group
 */
export const useGetCustomGroup = (customGroupId, enabled = true) => {
  return useQuery({
    queryKey: ['customGroups', customGroupId],
    queryFn: () => getCustomGroupById(customGroupId),
    enabled: enabled && !!customGroupId,
  });
};

/**
 * Hook for creating a custom group (Admin)
 */
export const useCreateCustomGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomGroup,
    onSuccess: () => {
      message.success('Custom group created successfully');
      queryClient.invalidateQueries({ queryKey: ['customGroups'] });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create custom group';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for updating a custom group (Admin)
 */
export const useUpdateCustomGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customGroupId, data }) => updateCustomGroup(customGroupId, data),
    onSuccess: (data, variables) => {
      message.success('Custom group updated successfully');
      queryClient.invalidateQueries({ queryKey: ['customGroups'] });
      queryClient.invalidateQueries({ queryKey: ['customGroups', variables.customGroupId] });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update custom group';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for deleting a custom group
 */
export const useDeleteCustomGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomGroup,
    onSuccess: () => {
      message.success('Custom group deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['customGroups'] });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete custom group';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for getting all custom group sessions (Admin)
 * @param {string} customGroupId - Custom Group UUID
 * @param {Object} queryParams - Query parameters
 * @param {boolean} enabled - Whether the query is enabled
 */
export const useGetCustomGroupSessions = (customGroupId, queryParams = {}, enabled = true) => {
  return useQuery({
    queryKey: ['customGroupSessions', customGroupId, queryParams],
    queryFn: () => getCustomGroupSessions(customGroupId, queryParams),
    enabled: enabled && !!customGroupId,
    staleTime: 10 * 1000, // 10 seconds (sessions change frequently)
  });
};

// ==================== Custom Group Sessions Hooks (Admin) ====================

/**
 * Hook for creating a custom group session (Admin)
 */
export const useCreateCustomGroupSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ customGroupId, data }) => createCustomGroupSession(customGroupId, data),
    onSuccess: (data, variables) => {
      message.success('Custom group session created successfully');
      queryClient.invalidateQueries({ queryKey: ['customGroupSessionStats', variables.customGroupId] });
      queryClient.invalidateQueries({ queryKey: ['customGroups', variables.customGroupId] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create custom group session';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for getting a custom group session by ID (Admin)
 */
export const useGetCustomGroupSession = (customGroupId, sessionId, enabled = true) => {
  return useQuery({
    queryKey: ['customGroupSessions', customGroupId, sessionId],
    queryFn: () => getCustomGroupSessionById(customGroupId, sessionId),
    enabled: enabled && !!customGroupId && !!sessionId,
  });
};
