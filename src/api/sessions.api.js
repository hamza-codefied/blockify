/**
 * Sessions API Service
 * Handles all session-related API calls
 */
import apiClient from './client';

/**
 * Get all sessions with pagination and filters
 * @param {Object} params - Query parameters (page, limit, sort, sortOrder, studentId, gradeId, status, startDate, endDate, search)
 * @returns {Promise} API response with sessions and pagination
 */
export const getSessions = async (params = {}) => {
  const response = await apiClient.get('/admin/sessions', { params });
  return response.data;
};

/**
 * Get session by ID
 * @param {string} sessionId - Session UUID
 * @returns {Promise} API response with session data
 */
export const getSessionById = async (sessionId) => {
  const response = await apiClient.get(`/admin/sessions/${sessionId}`);
  return response.data;
};

/**
 * Create a new session
 * @param {Object} data - Session data (studentId, startTimestamp?, endTimestamp?, status?)
 * @returns {Promise} API response with created session
 */
export const createSession = async (data) => {
  const response = await apiClient.post('/admin/sessions', data);
  return response.data;
};

/**
 * Update session
 * @param {string} sessionId - Session UUID
 * @param {Object} data - Updated session data
 * @returns {Promise} API response with updated session
 */
export const updateSession = async (sessionId, data) => {
  const response = await apiClient.put(`/admin/sessions/${sessionId}`, data);
  return response.data;
};

/**
 * Delete session
 * @param {string} sessionId - Session UUID
 * @returns {Promise} API response
 */
export const deleteSession = async (sessionId) => {
  const response = await apiClient.delete(`/admin/sessions/${sessionId}`);
  return response.data;
};

/**
 * Override session (manually end active session)
 * @param {string} sessionId - Session UUID
 * @param {Object} data - Override data (endTimestamp?, reason?)
 * @returns {Promise} API response with updated session
 */
export const overrideSession = async (sessionId, data) => {
  const response = await apiClient.post(`/admin/sessions/${sessionId}/override`, data);
  return response.data;
};

/**
 * Cancel session
 * @param {string} sessionId - Session UUID
 * @param {Object} data - Cancel data (reason?)
 * @returns {Promise} API response with updated session
 */
export const cancelSession = async (sessionId, data) => {
  const response = await apiClient.post(`/admin/sessions/${sessionId}/cancel`, data);
  return response.data;
};

