/**
 * Managers API Service
 * Handles all manager-related API calls
 */
import apiClient from './client';

/**
 * Get all managers with pagination and filters
 * @param {Object} params - Query parameters (page, limit, sort, sortOrder, roleId, status, search)
 * @returns {Promise} API response with managers and pagination
 */
export const getManagers = async (params = {}) => {
  const response = await apiClient.get('/admin/managers', { params });
  return response.data;
};

/**
 * Get manager by ID
 * @param {string} managerId - Manager UUID
 * @returns {Promise} API response with manager data
 */
export const getManagerById = async (managerId) => {
  const response = await apiClient.get(`/admin/managers/${managerId}`);
  return response.data;
};

/**
 * Create a new manager
 * @param {Object} data - Manager data (fullName, email, password, roleId, phone?, address?, zipcode?, gradeIds OR gradeNames, status?)
 * @returns {Promise} API response with created manager (includes role and grades array)
 */
export const createManager = async (data) => {
  const response = await apiClient.post('/admin/managers', data);
  return response.data;
};

/**
 * Update manager
 * @param {string} managerId - Manager UUID
 * @param {Object} data - Updated manager data
 * @returns {Promise} API response with updated manager
 */
export const updateManager = async (managerId, data) => {
  const response = await apiClient.put(`/admin/managers/${managerId}`, data);
  return response.data;
};

/**
 * Delete manager
 * @param {string} managerId - Manager UUID
 * @returns {Promise} API response
 */
export const deleteManager = async (managerId) => {
  const response = await apiClient.delete(`/admin/managers/${managerId}`);
  return response.data;
};

/**
 * Import managers from CSV
 * @param {File} file - CSV file
 * @returns {Promise} API response with import results
 */
export const importManagersCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post('/admin/managers/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

