/**
 * Attendance API Service
 * Handles all attendance-related API calls
 */
import apiClient from './client';

/**
 * Get attendance statistics for current day
 * @returns {Promise} API response with attendance statistics
 */
export const getAttendanceStatistics = async () => {
  const response = await apiClient.get('/admin/attendance/statistics');
  return response.data;
};

/**
 * Get attendance sessions list for current day
 * @param {Object} params - Query parameters (page, limit, sort, sortOrder, gradeId, attendanceStatus, arrivalTime, search)
 * @returns {Promise} API response with sessions list and pagination
 */
export const getAttendanceSessionsList = async (params = {}) => {
  const response = await apiClient.get('/admin/attendance/sessions', { params });
  return response.data;
};

