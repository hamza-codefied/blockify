/**
 * School API Service
 * Handles all school-related API calls
 */
import apiClient from './client';

/**
 * Get school information (name, phone, email, image)
 * @param {string} schoolId - School UUID
 * @returns {Promise} API response with school information
 */
export const getSchoolInformation = async (schoolId) => {
  const response = await apiClient.get(`/schools/${schoolId}/information`);
  return response.data;
};

/**
 * Update school information (name, phone, email, image)
 * @param {string} schoolId - School UUID
 * @param {Object} data - School information data (name?, phone?, email?, image?)
 * @param {File} imageFile - Optional image file for upload
 * @returns {Promise} API response with updated school information
 */
export const updateSchoolInformation = async (schoolId, data, imageFile = null) => {
  // If imageFile is provided, use FormData for multipart/form-data
  if (imageFile) {
    const formData = new FormData();
    
    // Add image file
    formData.append('image', imageFile);
    
    // Add other fields if provided
    if (data.name !== undefined) formData.append('name', data.name);
    if (data.phone !== undefined) formData.append('phone', data.phone || '');
    if (data.email !== undefined) formData.append('email', data.email);
    // If image is explicitly set to null/empty, send it as empty string
    if (data.image === null || data.image === '') {
      formData.append('image', '');
    }
    
    const response = await apiClient.put(`/schools/${schoolId}/information`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } else {
    // Regular JSON request
    const response = await apiClient.put(`/schools/${schoolId}/information`, data);
    return response.data;
  }
};

/**
 * Get school settings
 * @param {string} schoolId - School UUID
 * @returns {Promise} API response with school settings
 */
export const getSchoolSettings = async (schoolId) => {
  const response = await apiClient.get(`/schools/${schoolId}/settings`);
  return response.data;
};

/**
 * Update school settings
 * @param {string} schoolId - School UUID
 * @param {Object} data - School settings data
 * @returns {Promise} API response with updated school settings
 */
export const updateSchoolSettings = async (schoolId, data) => {
  const response = await apiClient.put(`/schools/${schoolId}/settings`, data);
  return response.data;
};

