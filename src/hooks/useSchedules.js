/**
 * Schedules React Query Hooks
 * Custom hooks for schedule operations using React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  createException,
  updateException,
  deleteException,
} from '@/api/schedules.api';
import { message } from 'antd';

/**
 * Hook for getting all schedules
 * @param {Object} params - Query parameters (page, limit, gradeId, etc.)
 * @param {boolean} enabled - Whether to enable the query (default: true)
 */
export const useGetSchedules = (params = {}, enabled = true) => {
  return useQuery({
    queryKey: ['schedules', params],
    queryFn: () => getSchedules(params),
    enabled: enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook for getting a single schedule
 */
export const useGetSchedule = (scheduleId, enabled = true) => {
  return useQuery({
    queryKey: ['schedules', scheduleId],
    queryFn: () => getScheduleById(scheduleId),
    enabled: enabled && !!scheduleId,
  });
};

/**
 * Hook for creating a schedule
 */
export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSchedule,
    onSuccess: (data) => {
      message.success('Schedule created successfully');
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create schedule';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for updating a schedule
 */
export const useUpdateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scheduleId, data }) => updateSchedule(scheduleId, data),
    onSuccess: (data, variables) => {
      message.success('Schedule updated successfully');
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedules', variables.scheduleId] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update schedule';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for deleting a schedule
 */
export const useDeleteSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      message.success('Schedule deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete schedule';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for creating an exception
 */
export const useCreateException = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scheduleId, data }) => createException(scheduleId, data),
    onSuccess: (data, variables) => {
      message.success('Exception added successfully');
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedules', variables.scheduleId] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to add exception';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for updating an exception
 */
export const useUpdateException = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scheduleId, exceptionId, data }) => updateException(scheduleId, exceptionId, data),
    onSuccess: (data, variables) => {
      message.success('Exception updated successfully');
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedules', variables.scheduleId] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update exception';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for deleting an exception
 */
export const useDeleteException = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scheduleId, exceptionId }) => deleteException(scheduleId, exceptionId),
    onSuccess: (data, variables) => {
      message.success('Exception deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      queryClient.invalidateQueries({ queryKey: ['schedules', variables.scheduleId] });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete exception';
      message.error(errorMessage);
      throw error;
    },
  });
};

