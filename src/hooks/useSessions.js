/**
 * Sessions React Query Hooks
 * Custom hooks for session operations using React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  overrideSession,
  cancelSession,
  createUpcomingSessions,
} from '@/api/sessions.api';
import { message } from 'antd';

/**
 * Hook for getting all sessions
 */
export const useGetSessions = (params = {}) => {
  return useQuery({
    queryKey: ['sessions', params],
    queryFn: () => getSessions(params),
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook for getting a single session
 */
export const useGetSession = (sessionId, enabled = true) => {
  return useQuery({
    queryKey: ['sessions', sessionId],
    queryFn: () => getSessionById(sessionId),
    enabled: enabled && !!sessionId,
  });
};

/**
 * Hook for creating a session
 */
export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSession,
    onSuccess: (data) => {
      message.success('Session created successfully');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create session';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for updating a session
 */
export const useUpdateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }) => updateSession(sessionId, data),
    onSuccess: (data, variables) => {
      message.success('Session updated successfully');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.sessionId] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update session';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for deleting a session
 */
export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      message.success('Session deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete session';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for overriding a session (manually ending)
 */
export const useOverrideSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }) => overrideSession(sessionId, data),
    onSuccess: (data, variables) => {
      message.success('Session ended successfully');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.sessionId] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to end session';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for cancelling a session
 */
export const useCancelSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, data }) => cancelSession(sessionId, data),
    onSuccess: (data, variables) => {
      message.success('Session cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.sessionId] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to cancel session';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for creating upcoming sessions (next 30 minutes)
 */
export const useCreateUpcomingSessions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUpcomingSessions,
    onSuccess: (data) => {
      const messageText = data?.data?.message || `Created ${data?.data?.created || 0} upcoming session(s)`;
      message.success(messageText);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create upcoming sessions';
      message.error(errorMessage);
      throw error;
    },
  });
};

