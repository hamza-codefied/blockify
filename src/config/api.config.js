/**
 * API Configuration
 * Centralized configuration for API base URL and other settings
 */

// In production (Netlify), use relative path to go through proxy
// In development, use full URL or localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? '/api/v1' : 'http://localhost:5004/api/v1');

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

export default API_CONFIG;

