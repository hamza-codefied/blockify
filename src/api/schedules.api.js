/**
 * Schedules API Service
 * Handles all schedule-related API calls
 */
import apiClient from './client';

/**
 * Get all schedules with pagination and filters
 * @param {Object} params - Query parameters (page, limit, sort, sortOrder, gradeId, managerId, dayOfWeek, search)
 * @returns {Promise} API response with schedules and pagination
 */
export const getSchedules = async (params = {}) => {
  const response = await apiClient.get('/admin/schedules', { params });
  return response.data;
};

/**
 * Get schedule by ID
 * @param {string} scheduleId - Schedule UUID
 * @returns {Promise} API response with schedule data
 */
export const getScheduleById = async (scheduleId) => {
  const response = await apiClient.get(`/admin/schedules/${scheduleId}`);
  return response.data;
};

/**
 * Create a new schedule
 * @param {Object} data - Schedule data (gradeId, managerId, subjectId, name?, dayOfWeek, startTime, endTime, exceptions?)
 * @returns {Promise} API response with created schedule
 */
export const createSchedule = async (data) => {
  const response = await apiClient.post('/admin/schedules', data);
  return response.data;
};

/**
 * Update schedule
 * @param {string} scheduleId - Schedule UUID
 * @param {Object} data - Updated schedule data
 * @returns {Promise} API response with updated schedule
 */
export const updateSchedule = async (scheduleId, data) => {
  const response = await apiClient.put(`/admin/schedules/${scheduleId}`, data);
  return response.data;
};

/**
 * Delete schedule
 * @param {string} scheduleId - Schedule UUID
 * @returns {Promise} API response
 */
export const deleteSchedule = async (scheduleId) => {
  const response = await apiClient.delete(`/admin/schedules/${scheduleId}`);
  return response.data;
};

/**
 * Create exception for a schedule
 * @param {string} scheduleId - Schedule UUID
 * @param {Object} data - Exception data (exceptionDate, reason?)
 * @returns {Promise} API response with created exception
 */
export const createException = async (scheduleId, data) => {
  const response = await apiClient.post(`/admin/schedules/${scheduleId}/exceptions`, data);
  return response.data;
};

/**
 * Update exception
 * @param {string} scheduleId - Schedule UUID
 * @param {string} exceptionId - Exception UUID
 * @param {Object} data - Updated exception data
 * @returns {Promise} API response with updated exception
 */
export const updateException = async (scheduleId, exceptionId, data) => {
  const response = await apiClient.put(`/admin/schedules/${scheduleId}/exceptions/${exceptionId}`, data);
  return response.data;
};

/**
 * Delete exception
 * @param {string} scheduleId - Schedule UUID
 * @param {string} exceptionId - Exception UUID
 * @returns {Promise} API response
 */
export const deleteException = async (scheduleId, exceptionId) => {
  const response = await apiClient.delete(`/admin/schedules/${scheduleId}/exceptions/${exceptionId}`);
  return response.data;
};

