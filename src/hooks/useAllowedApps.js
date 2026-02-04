/**
 * Allowed Apps React Query Hooks
 * Custom hooks for allowed app operations using React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getAllowedApps,
    createAllowedApp,
    updateAllowedApp,
    deleteAllowedApp,
} from '@/api/allowedApps.api';
import { message } from 'antd';

/**
 * Hook for getting all allowed apps
 * @param {Object} params - Query parameters (page, limit, status, search)
 * @param {boolean} enabled - Whether the query is enabled
 */
export const useGetAllowedApps = (params = {}, enabled = true) => {
    return useQuery({
        queryKey: ['allowedApps', params],
        queryFn: () => getAllowedApps(params),
        enabled,
        staleTime: 30 * 1000, // 30 seconds
    });
};

/**
 * Hook for creating a new allowed app
 */
export const useCreateAllowedApp = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (appData) => createAllowedApp(appData),
        onSuccess: () => {
            message.success('App added successfully');
            queryClient.invalidateQueries({ queryKey: ['allowedApps'] });
        },
        onError: (error) => {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to add app';
            message.error(errorMessage);
            throw error;
        },
    });
};

/**
 * Hook for updating an allowed app
 */
export const useUpdateAllowedApp = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ appId, appData }) => updateAllowedApp(appId, appData),
        onSuccess: () => {
            message.success('App updated successfully');
            queryClient.invalidateQueries({ queryKey: ['allowedApps'] });
        },
        onError: (error) => {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to update app';
            message.error(errorMessage);
            throw error;
        },
    });
};

/**
 * Hook for deleting an allowed app
 */
export const useDeleteAllowedApp = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAllowedApp,
        onSuccess: () => {
            message.success('App removed successfully');
            queryClient.invalidateQueries({ queryKey: ['allowedApps'] });
        },
        onError: (error) => {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to remove app';
            message.error(errorMessage);
            throw error;
        },
    });
};
