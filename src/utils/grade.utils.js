/**
 * Grade utility functions
 */

/**
 * Format grade display name (section field is ignored)
 * @param {Object} grade - Grade object with gradeName
 * @returns {string} Grade name (e.g., "8", "Grade 9")
 */
export const formatGradeDisplayName = (grade) => {
  if (!grade) return '';
  return grade.gradeName || '';
};

/**
 * Get default grade query params for consistent sorting
 * @returns {Object} Default query params
 */
export const getDefaultGradeQueryParams = () => ({
  sort: 'grade_name',
  sortOrder: 'ASC',
});

