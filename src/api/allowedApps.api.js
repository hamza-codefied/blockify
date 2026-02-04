/**
 * Allowed Apps API Service
 * Handles all allowed app-related API calls for admin management
 */
import apiClient from './client';

/**
 * Get all allowed apps with pagination and filters
 * @param {Object} params - Query parameters (page, limit, status, search)
 * @returns {Promise} API response with apps array and pagination
 */
export const getAllowedApps = async (params = {}) => {
    const response = await apiClient.get('/admin/allowed-apps', { params });
    return response.data;
};

/**
 * Create a new allowed app
 * @param {Object} appData - App data (androidPackage, iosPackage, displayName, status, category)
 * @returns {Promise} API response with created app
 */
export const createAllowedApp = async (appData) => {
    const response = await apiClient.post('/admin/allowed-apps', appData);
    return response.data;
};

/**
 * Update an allowed app
 * @param {string} appId - App UUID
 * @param {Object} appData - App data to update
 * @returns {Promise} API response with updated app
 */
export const updateAllowedApp = async (appId, appData) => {
    const response = await apiClient.put(`/admin/allowed-apps/${appId}`, appData);
    return response.data;
};

/**
 * Delete an allowed app
 * @param {string} appId - App UUID
 * @returns {Promise} API response
 */
export const deleteAllowedApp = async (appId) => {
    const response = await apiClient.delete(`/admin/allowed-apps/${appId}`);
    return response.data;
};
