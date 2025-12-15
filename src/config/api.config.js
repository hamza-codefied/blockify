/**
 * API Configuration
 * Centralized configuration for API base URL and other settings
 */

// In production (Netlify), use relative path to go through proxy
// In development, use full URL or localhost
// Check if we're on Netlify (production) - use relative path for proxy
const isProduction =
  import.meta.env.MODE === 'production' ||
  import.meta.env.PROD ||
  (typeof window !== 'undefined' &&
    window.location.hostname.includes('netlify.app'));

// Get base URL from env or use defaults
let envBaseUrl = import.meta.env.VITE_API_BASE_URL;

// If env var is set but doesn't end with /api/v1, ensure it does
// If it's a full HTTP URL in production, force relative path for proxy
if (envBaseUrl) {
  // If it's a full URL (starts with http), and we're in production, use relative path instead
  if (
    isProduction &&
    (envBaseUrl.startsWith('http://') || envBaseUrl.startsWith('https://'))
  ) {
    console.warn(
      'VITE_API_BASE_URL is set to a full URL in production. Using relative path /api/v1 for Netlify proxy.'
    );
    envBaseUrl = '/api/v1';
  } else if (!envBaseUrl.endsWith('/api/v1')) {
    // Ensure it ends with /api/v1
    envBaseUrl = envBaseUrl.replace(/\/+$/, '') + '/api/v1';
  }
}

const API_BASE_URL =
  envBaseUrl ||
  // (isProduction ? '/api/v1' : 'http://localhost:5004/api/v1');

  (isProduction
    ? '/api/v1'
    : 'http://development.test-school.148.230.94.171.sslip.io/api/v1');

// Debug logging (remove in production if needed)
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  console.log('API Config:', {
    MODE: import.meta.env.MODE,
    PROD: import.meta.env.PROD,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    isProduction,
    API_BASE_URL,
    hostname: window.location.hostname,
  });
}

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

export default API_CONFIG;
