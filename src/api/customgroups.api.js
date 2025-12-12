/**
 * Custom Groups API Service
 * Handles all custom group-related API calls
 */
import apiClient from './client';

// ==================== Custom Groups CRUD (Admin) ====================

/**
 * Get all custom groups (Admin) with pagination and filters
 * @param {Object} params - Query parameters (page, limit, sort, sortOrder, status, search)
 * @returns {Promise} API response with custom groups and pagination
 */
export const getCustomGroups = async (params = {}) => {
  const response = await apiClient.get('/admin/custom-groups', { params });
  return response.data;
};

/**
 * Get custom group by ID (Admin)
 * @param {string} customGroupId - Custom Group UUID
 * @returns {Promise} API response with custom group data
 */
export const getCustomGroupById = async (customGroupId) => {
  const response = await apiClient.get(`/admin/custom-groups/${customGroupId}`);
  return response.data;
};

/**
 * Create a new custom group (Admin)
 * @param {Object} data - Custom group data (name, description?, gradeIds?, studentIds?, addEntireGrade?, schedules?)
 * @returns {Promise} API response with created custom group
 */
export const createCustomGroup = async (data) => {
  const response = await apiClient.post('/admin/custom-groups', data);
  return response.data;
};

/**
 * Update custom group (Admin)
 * @param {string} customGroupId - Custom Group UUID
 * @param {Object} data - Updated custom group data
 * @returns {Promise} API response with updated custom group
 */
export const updateCustomGroup = async (customGroupId, data) => {
  const response = await apiClient.put(`/admin/custom-groups/${customGroupId}`, data);
  return response.data;
};

/**
 * Delete custom group (Admin)
 * @param {string} customGroupId - Custom Group UUID
 * @returns {Promise} API response
 */
export const deleteCustomGroup = async (customGroupId) => {
  const response = await apiClient.delete(`/admin/custom-groups/${customGroupId}`);
  return response.data;
};

/**
 * Get all custom group sessions (Admin)
 * @param {string} customGroupId - Custom Group UUID
 * @param {Object} queryParams - Query parameters (page, limit, startDate, endDate, status, etc.)
 * @returns {Promise} API response with sessions
 */
export const getCustomGroupSessions = async (customGroupId, queryParams = {}) => {
  const response = await apiClient.get(`/admin/custom-groups/${customGroupId}/sessions`, { params: queryParams });
  return response.data;
};

// ==================== Custom Group Sessions (Admin) ====================

/**
 * Create a custom group session (Admin)
 * @param {string} customGroupId - Custom Group UUID
 * @param {Object} data - Session data (studentId, scheduleId, sessionDate, startTimestamp?, endTimestamp?, status?)
 * @returns {Promise} API response with created session
 */
export const createCustomGroupSession = async (customGroupId, data) => {
  const response = await apiClient.post(`/admin/custom-groups/${customGroupId}/sessions`, data);
  return response.data;
};

/**
 * Get custom group session by ID (Admin)
 * @param {string} customGroupId - Custom Group UUID
 * @param {string} sessionId - Session UUID
 * @returns {Promise} API response with session data
 */
export const getCustomGroupSessionById = async (customGroupId, sessionId) => {
  const response = await apiClient.get(`/admin/custom-groups/${customGroupId}/sessions/${sessionId}`);
  return response.data;
};

