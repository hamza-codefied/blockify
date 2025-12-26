/**
 * Students React Query Hooks
 * Custom hooks for student operations using React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  importStudentsCSV,
} from '@/api/students.api';
import { message } from 'antd';
import { showScheduleConflictModal, formatScheduleConflictError } from '@/utils/errorFormatter.jsx';

/**
 * Hook for getting all students
 * @param {Object} params - Query parameters (page, limit, search, gradeId, etc.)
 * @param {Object} options - React Query options (enabled, etc.)
 */
export const useGetStudents = (params = {}, options = {}) => {
  const { enabled = true, ...restOptions } = options;
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => getStudents(params),
    staleTime: 30 * 1000, // 30 seconds
    enabled,
    ...restOptions,
  });
};

/**
 * Hook for getting a single student
 */
export const useGetStudent = (studentId, enabled = true) => {
  return useQuery({
    queryKey: ['students', studentId],
    queryFn: () => getStudentById(studentId),
    enabled: enabled && !!studentId,
  });
};

/**
 * Hook for creating a student
 */
export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStudent,
    onSuccess: (data) => {
      message.success('Student created successfully');
      queryClient.invalidateQueries({ queryKey: ['students'] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create student';
      
      // Show schedule conflicts in a modal for better UX
      if (showScheduleConflictModal(errorMessage)) {
        // Modal was shown, don't show toast
      } else {
        message.error(errorMessage);
      }
      throw error;
    },
  });
};

/**
 * Hook for updating a student
 */
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, data }) => updateStudent(studentId, data),
    onSuccess: (data, variables) => {
      message.success('Student updated successfully');
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['students', variables.studentId] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update student';
      
      // Show schedule conflicts in a modal for better UX
      if (showScheduleConflictModal(errorMessage)) {
        // Modal was shown, don't show toast
      } else {
        message.error(errorMessage);
      }
      throw error;
    },
  });
};

/**
 * Hook for deleting a student
 */
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStudent,
    onSuccess: () => {
      message.success('Student deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete student';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for importing students from CSV
 */
export const useImportStudentsCSV = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importStudentsCSV,
    onSuccess: (data) => {
      const { successful, failed, errorCSV } = data.data || {};
      if (successful === 0 && failed > 0) {
        //>>> All records failed - show concise message and let modal handle error CSV
        message.warning(
          `No students imported. All ${failed} row(s) failed. Download the error CSV file to see details.`,
          5 // Show for 5 seconds
        );
      } else if (failed > 0) {
        message.warning(
          `Import completed: ${successful || 0} succeeded, ${failed || 0} failed`
        );
      } else {
        message.success(`Successfully imported ${successful || 0} ${successful === 1 ? 'student' : 'students'}`);
      }
      queryClient.invalidateQueries({ queryKey: ['students'] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to import students';
      message.error(errorMessage);
      throw error;
    },
  });
};
