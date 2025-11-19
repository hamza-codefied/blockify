/**
 * Grades API Service
 * Handles all grade-related API calls
 */
import apiClient from './client';

/**
 * Get all grades with pagination and filters
 * @param {Object} params - Query parameters (page, limit, sort, sortOrder, managerId, search)
 * @returns {Promise} API response with grades and pagination
 */
export const getGrades = async (params = {}) => {
  const response = await apiClient.get('/admin/grades', { params });
  return response.data;
};

/**
 * Get grade by ID
 * @param {string} gradeId - Grade UUID
 * @returns {Promise} API response with grade data
 */
export const getGradeById = async (gradeId) => {
  const response = await apiClient.get(`/admin/grades/${gradeId}`);
  return response.data;
};

/**
 * Create a new grade
 * @param {Object} data - Grade data (gradeName, managerId?)
 * @returns {Promise} API response with created grade
 */
export const createGrade = async (data) => {
  const response = await apiClient.post('/admin/grades', data);
  return response.data;
};

/**
 * Update grade
 * @param {string} gradeId - Grade UUID
 * @param {Object} data - Updated grade data
 * @returns {Promise} API response with updated grade
 */
export const updateGrade = async (gradeId, data) => {
  const response = await apiClient.put(`/admin/grades/${gradeId}`, data);
  return response.data;
};

/**
 * Delete grade
 * @param {string} gradeId - Grade UUID
 * @returns {Promise} API response
 */
export const deleteGrade = async (gradeId) => {
  const response = await apiClient.delete(`/admin/grades/${gradeId}`);
  return response.data;
};

