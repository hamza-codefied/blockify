/**
 * Roles React Query Hooks
 * Custom hooks for role and permission operations using React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createRole,
  getRoles,
  getRolePermissions,
  updateRolePermissions,
  deleteRole,
} from '@/api/roles.api';
import { message } from 'antd';

/**
 * Hook for creating a new role
 */
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleData) => createRole(roleData),
    onSuccess: () => {
      message.success('Role created successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create role';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for getting all roles
 */
export const useGetRoles = (enabled = true) => {
  return useQuery({
    queryKey: ['roles'],
    queryFn: () => getRoles(),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook for getting role permissions
 */
export const useGetRolePermissions = (roleId, enabled = true) => {
  return useQuery({
    queryKey: ['roles', roleId, 'permissions'],
    queryFn: () => getRolePermissions(roleId),
    enabled: enabled && !!roleId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Hook for updating role permissions
 */
export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionIds }) =>
      updateRolePermissions(roleId, permissionIds),
    onSuccess: (data, variables) => {
      message.success('Role permissions updated successfully');
      queryClient.invalidateQueries({ queryKey: ['roles', variables.roleId, 'permissions'] });
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      return data;
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update role permissions';
      message.error(errorMessage);
      throw error;
    },
  });
};

/**
 * Hook for deleting a role
 */
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      message.success('Role deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete role';
      message.error(errorMessage);
      throw error;
    },
  });
};

