/**
 * Requests API Service
 * Handles all request-related API calls
 */
import apiClient from './client';

/**
 * Get all requests with pagination and filters
 * @param {Object} params - Query parameters (requestType, status, gradeId, search, page, limit, sort, sortOrder)
 * @returns {Promise} API response with requests and pagination
 */
export const getRequests = async (params = {}) => {
  const response = await apiClient.get('/admin/requests', { params });
  return response.data;
};

/**
 * Approve a request
 * @param {string} requestId - Request UUID
 * @param {Object} data - Approval data (resolutionNotes?)
 * @returns {Promise} API response with updated request
 */
export const approveRequest = async (requestId, data = {}) => {
  const response = await apiClient.put(`/admin/requests/${requestId}/approve`, data);
  return response.data;
};

/**
 * Deny a request
 * @param {string} requestId - Request UUID
 * @param {Object} data - Denial data (resolutionNotes?)
 * @returns {Promise} API response with updated request
 */
export const denyRequest = async (requestId, data = {}) => {
  const response = await apiClient.put(`/admin/requests/${requestId}/deny`, data);
  return response.data;
};

