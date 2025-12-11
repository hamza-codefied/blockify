/**
 * Subjects React Query Hooks
 * Custom hooks for subject operations using React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from '@/api/subjects.api';
import { message } from 'antd';

/**
 * Hook for getting all subjects
 */
export const useGetSubjects = (params = {}) => {
  return useQuery({
    queryKey: ['subjects', params],
    queryFn: () => getSubjects(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook for getting a single subject
 */
export const useGetSubject = (subjectId, enabled = true) => {
  return useQuery({
    queryKey: ['subjects', subjectId],
    queryFn: () => getSubjectById(subjectId),
    enabled: enabled && !!subjectId,
  });
};

/**
 * Hook for creating a subject
 */
export const useCreateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubject,
    onSuccess: (data) => {
      message.success('Subject created successfully');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create subject';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for updating a subject
 */
export const useUpdateSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ subjectId, data }) => updateSubject(subjectId, data),
    onSuccess: (data, variables) => {
      message.success('Subject updated successfully');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
      queryClient.invalidateQueries({ queryKey: ['subjects', variables.subjectId] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update subject';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for deleting a subject
 */
export const useDeleteSubject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => {
      message.success('Subject deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete subject';
      message.error(errorMessage);
      throw error;
    },
  });
};

