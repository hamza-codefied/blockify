/**
 * Time utility functions
 */

/**
 * Format time from HH:mm to hh:mm am/pm
 * @param {string} timeStr - Time string in HH:mm format (e.g., "14:30")
 * @returns {string} Formatted time string (e.g., "2:30 pm") or empty string if invalid
 */
export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'pm' : 'am';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

