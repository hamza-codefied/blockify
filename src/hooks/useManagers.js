/**
 * Managers React Query Hooks
 * Custom hooks for manager operations using React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getManagers,
  getManagerById,
  createManager,
  updateManager,
  deleteManager,
  importManagersCSV,
} from '@/api/managers.api';
import { message } from 'antd';

/**
 * Hook for getting all managers
 */
export const useGetManagers = (params = {}) => {
  return useQuery({
    queryKey: ['managers', params],
    queryFn: () => getManagers(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook for getting a single manager
 */
export const useGetManager = (managerId, enabled = true) => {
  return useQuery({
    queryKey: ['managers', managerId],
    queryFn: () => getManagerById(managerId),
    enabled: enabled && !!managerId,
  });
};

/**
 * Hook for creating a manager
 */
export const useCreateManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createManager,
    onSuccess: (data) => {
      message.success('Manager created successfully');
      queryClient.invalidateQueries({ queryKey: ['managers'] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create manager';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for updating a manager
 */
export const useUpdateManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ managerId, data }) => updateManager(managerId, data),
    onSuccess: (data, variables) => {
      message.success('Manager updated successfully');
      queryClient.invalidateQueries({ queryKey: ['managers'] });
      queryClient.invalidateQueries({ queryKey: ['managers', variables.managerId] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update manager';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for deleting a manager
 */
export const useDeleteManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteManager,
    onSuccess: () => {
      message.success('Manager deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['managers'] });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete manager';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for importing managers from CSV
 */
export const useImportManagersCSV = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importManagersCSV,
    onSuccess: (data) => {
      const { successCount, failureCount } = data.data || {};
      if (failureCount > 0) {
        message.warning(
          `Import completed: ${successCount} succeeded, ${failureCount} failed`
        );
      } else {
        message.success(`Successfully imported ${successCount} managers`);
      }
      queryClient.invalidateQueries({ queryKey: ['managers'] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to import managers';
      message.error(errorMessage);
      throw error;
    },
  });
};

