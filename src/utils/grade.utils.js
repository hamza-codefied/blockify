/**
 * Grade utility functions
 */

/**
 * Format grade display name with section
 * @param {Object} grade - Grade object with gradeName and optional section
 * @returns {string} Formatted grade name (e.g., "8 A", "8 B", or just "8")
 */
export const formatGradeDisplayName = (grade) => {
  if (!grade) return '';
  if (grade.section) {
    return `${grade.gradeName} ${grade.section}`;
  }
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

