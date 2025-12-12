/**
 * Roles API Service
 * Handles all role and permission-related API calls
 */
import apiClient from './client';

/**
 * Create a new role
 * @param {Object} roleData - Role data (roleName, displayName, description, permissionIds)
 * @returns {Promise} API response with created role and permissions
 */
export const createRole = async (roleData) => {
  const response = await apiClient.post('/admin/roles', roleData);
  return response.data;
};

/**
 * Get all roles
 * @returns {Promise} API response with roles array
 */
export const getRoles = async () => {
  const response = await apiClient.get('/admin/roles');
  return response.data;
};

/**
 * Get permissions for a specific role (with assigned/unassigned status)
 * @param {string} roleId - Role UUID
 * @returns {Promise} API response with role and permissions array
 */
export const getRolePermissions = async (roleId) => {
  const response = await apiClient.get(`/admin/roles/${roleId}/permissions`);
  return response.data;
};

/**
 * Update permissions for a specific role
 * @param {string} roleId - Role UUID
 * @param {Array<string>} permissionIds - Array of permission UUIDs to assign
 * @returns {Promise} API response with updated role and permissions
 */
export const updateRolePermissions = async (roleId, permissionIds) => {
  const response = await apiClient.put(`/admin/roles/${roleId}/permissions`, {
    permissionIds,
  });
  return response.data;
};

/**
 * Delete a role
 * @param {string} roleId - Role UUID
 * @returns {Promise} API response
 */
export const deleteRole = async (roleId) => {
  const response = await apiClient.delete(`/admin/roles/${roleId}`);
  return response.data;
};

