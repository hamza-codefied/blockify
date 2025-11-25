/**
 * School React Query Hooks
 * Custom hooks for school operations using React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSchoolInformation, updateSchoolInformation, getSchoolSettings, updateSchoolSettings } from '@/api/school.api';
import { message } from 'antd';

/**
 * Hook for getting school information
 * @param {string} schoolId - School UUID
 * @param {boolean} enabled - Whether the query should run
 */
export const useGetSchoolInformation = (schoolId, enabled = true) => {
  return useQuery({
    queryKey: ['school', 'information', schoolId],
    queryFn: () => getSchoolInformation(schoolId),
    enabled: enabled && !!schoolId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook for updating school information
 */
export const useUpdateSchoolInformation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ schoolId, data, imageFile }) => 
      updateSchoolInformation(schoolId, data, imageFile),
    onSuccess: (data, variables) => {
      message.success('School information updated successfully');
      // Invalidate and refetch school information
      queryClient.invalidateQueries({ 
        queryKey: ['school', 'information', variables.schoolId] 
      });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update school information';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for getting school settings
 * @param {string} schoolId - School UUID
 * @param {boolean} enabled - Whether the query should run
 */
export const useGetSchoolSettings = (schoolId, enabled = true) => {
  return useQuery({
    queryKey: ['school', 'settings', schoolId],
    queryFn: () => getSchoolSettings(schoolId),
    enabled: enabled && !!schoolId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook for updating school settings
 */
export const useUpdateSchoolSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ schoolId, data }) => 
      updateSchoolSettings(schoolId, data),
    onSuccess: (data, variables) => {
      message.success('School settings updated successfully');
      // Invalidate and refetch school settings
      queryClient.invalidateQueries({ 
        queryKey: ['school', 'settings', variables.schoolId] 
      });
      queryClient.invalidateQueries({ queryKey: ['school', 'information', variables.schoolId] }); // Invalidate info as well for config changes
      // Invalidate schedules queries since changing schedule type deletes all schedules
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update school settings';
      message.error(errorMessage);
      throw error;
    },
  });
};

