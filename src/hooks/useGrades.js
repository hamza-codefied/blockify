/**
 * Grades React Query Hooks
 * Custom hooks for grade operations using React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
} from '@/api/grades.api';
import { message } from 'antd';

/**
 * Hook for getting all grades
 */
export const useGetGrades = (params = {}) => {
  return useQuery({
    queryKey: ['grades', params],
    queryFn: () => getGrades(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook for getting a single grade
 */
export const useGetGrade = (gradeId, enabled = true) => {
  return useQuery({
    queryKey: ['grades', gradeId],
    queryFn: () => getGradeById(gradeId),
    enabled: enabled && !!gradeId,
  });
};

/**
 * Hook for creating a grade
 */
export const useCreateGrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGrade,
    onSuccess: (data) => {
      message.success('Grade created successfully');
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create grade';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for updating a grade
 */
export const useUpdateGrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gradeId, data }) => updateGrade(gradeId, data),
    onSuccess: (data, variables) => {
      message.success('Grade updated successfully');
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      queryClient.invalidateQueries({ queryKey: ['grades', variables.gradeId] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update grade';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for deleting a grade
 */
export const useDeleteGrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGrade,
    onSuccess: () => {
      message.success('Grade deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['grades'] });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete grade';
      message.error(errorMessage);
      throw error;
    },
  });
};

