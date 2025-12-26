/**
 * Students API Service
 * Handles all student-related API calls
 */
import apiClient from './client';

/**
 * Get all students with pagination and filters
 * @param {Object} params - Query parameters (page, limit, sort, sortOrder, gradeId, status, search)
 * @returns {Promise} API response with students and pagination
 */
export const getStudents = async (params = {}) => {
  const response = await apiClient.get('/admin/students', { params });
  return response.data;
};

/**
 * Get student by ID
 * @param {string} studentId - Student UUID
 * @returns {Promise} API response with student data
 */
export const getStudentById = async (studentId) => {
  const response = await apiClient.get(`/admin/students/${studentId}`);
  return response.data;
};

/**
 * Create a new student
 * @param {Object} data - Student data (fullName, email, gradeId OR gradeName, password?, phone?, address?, zipcode?, guardian_name?, guardian_phone?, guardian_email?, guardian_address?, guardian_zipcode?, status?, scheduleIds?)
 * @returns {Promise} API response with created student (includes enrolledAt and contact/guardian fields)
 */
export const createStudent = async (data) => {
  const response = await apiClient.post('/admin/students', data);
  return response.data;
};

/**
 * Update student
 * @param {string} studentId - Student UUID
 * @param {Object} data - Updated student data (scheduleIds? - optional array to update student's schedules)
 * @returns {Promise} API response with updated student
 */
export const updateStudent = async (studentId, data) => {
  const response = await apiClient.put(`/admin/students/${studentId}`, data);
  return response.data;
};

/**
 * Delete student
 * @param {string} studentId - Student UUID
 * @returns {Promise} API response
 */
export const deleteStudent = async (studentId) => {
  const response = await apiClient.delete(`/admin/students/${studentId}`);
  return response.data;
};

/**
 * Import students from CSV
 * @param {File} file - CSV file
 * @returns {Promise} API response with import results
 */
export const importStudentsCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post('/admin/students/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

