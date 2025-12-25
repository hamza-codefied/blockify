/**
 * Schedule Change Requests API Service
 * Handles all schedule change request-related API calls
 */
import apiClient from './client';

/**
 * Get available alternative schedules for a schedule change request
 * @param {string} fromScheduleId - UUID of the schedule to change from
 * @returns {Promise} API response with available alternatives
 */
export const getAvailableAlternatives = async (fromScheduleId) => {
  const response = await apiClient.get('/student/schedule-change-request/alternatives', {
    params: { fromScheduleId }
  });
  return response.data;
};

/**
 * Create a schedule change request
 * @param {Object} data - Request data (fromScheduleId, toScheduleId, reasonText)
 * @returns {Promise} API response with created request
 */
export const createScheduleChangeRequest = async (data) => {
  const response = await apiClient.post('/student/schedule-change-request', data);
  return response.data;
};

/**
 * Get student's schedule change requests
 * @param {Object} params - Query parameters (page, limit, status)
 * @returns {Promise} API response with requests and pagination
 */
export const getMyScheduleChangeRequests = async (params = {}) => {
  const response = await apiClient.get('/student/schedule-change-request', { params });
  return response.data;
};

/**
 * Get all schedule change requests (admin)
 * @param {Object} params - Query parameters (page, limit, status, gradeId, search, sort, sortOrder)
 * @returns {Promise} API response with requests and pagination
 */
export const getAllScheduleChangeRequests = async (params = {}) => {
  const response = await apiClient.get('/admin/schedule-change-requests', { params });
  return response.data;
};

/**
 * Approve a schedule change request (admin)
 * @param {string} requestId - Request UUID
 * @param {Object} data - Resolution data (resolutionNotes?)
 * @returns {Promise} API response
 */
export const approveScheduleChangeRequest = async (requestId, data = {}) => {
  const response = await apiClient.put(`/admin/schedule-change-requests/${requestId}/approve`, data);
  return response.data;
};

/**
 * Deny a schedule change request (admin)
 * @param {string} requestId - Request UUID
 * @param {Object} data - Resolution data (resolutionNotes?)
 * @returns {Promise} API response
 */
export const denyScheduleChangeRequest = async (requestId, data = {}) => {
  const response = await apiClient.put(`/admin/schedule-change-requests/${requestId}/deny`, data);
  return response.data;
};

