/**
 * Subjects API Service
 * Handles all subject-related API calls
 */
import apiClient from './client';

/**
 * Get all subjects
 */
/**
 * Get all subjects with pagination and filters
 * @param {Object} params - Query parameters (page, limit, sort, sortOrder, search, status)
 * @returns {Promise} API response with subjects and pagination
 */
export const getSubjects = async (params = {}) => {
  const response = await apiClient.get('/admin/subjects', { params });
  return response.data;
};

/**
 * Get subject by ID
 * @param {string} subjectId - Subject UUID
 * @returns {Promise} API response with subject data
 */
export const getSubjectById = async (subjectId) => {
  const response = await apiClient.get(`/admin/subjects/${subjectId}`);
  return response.data;
};

/**
 * Create a new subject
 * @param {Object} data - Subject data (name, description, status)
 * @returns {Promise} API response with created subject
 */
export const createSubject = async (data) => {
  const response = await apiClient.post('/admin/subjects', data);
  return response.data;
};

/**
 * Update subject
 * @param {string} subjectId - Subject UUID
 * @param {Object} data - Updated subject data
 * @returns {Promise} API response with updated subject
 */
export const updateSubject = async (subjectId, data) => {
  const response = await apiClient.put(`/admin/subjects/${subjectId}`, data);
  return response.data;
};

/**
 * Delete subject
 * @param {string} subjectId - Subject UUID
 * @returns {Promise} API response
 */
export const deleteSubject = async (subjectId) => {
  const response = await apiClient.delete(`/admin/subjects/${subjectId}`);
  return response.data;
};

