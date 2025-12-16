/**
 * Permission Hook
 * Simple hook for checking user permissions
 */
import { useAuthStore } from '@/store/authStore';

/**
 * Hook to check if user has a specific permission
 * @param {string} permission - Permission string (e.g., 'students.create')
 * @returns {boolean} True if user has the permission
 */
export const usePermission = (permission) => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  if (!permission) return true; // No permission required
  return hasPermission(permission);
};

/**
 * Hook to check if user has any of the provided permissions
 * @param {string[]} permissions - Array of permission strings
 * @returns {boolean} True if user has at least one permission
 */
export const useHasAnyPermission = (permissions = []) => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  if (!permissions || permissions.length === 0) return true;
  return permissions.some((permission) => hasPermission(permission));
};

/**
 * Hook to check if user has all of the provided permissions
 * @param {string[]} permissions - Array of permission strings
 * @returns {boolean} True if user has all permissions
 */
export const useHasAllPermissions = (permissions = []) => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  if (!permissions || permissions.length === 0) return true;
  return permissions.every((permission) => hasPermission(permission));
};

/**
 * Hook to get all user permissions
 * @returns {string[]} Array of permission strings
 */
export const usePermissions = () => {
  const permissions = useAuthStore((state) => state.permissions);
  return permissions || [];
};

