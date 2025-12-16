/**
 * Permission Constants and Utilities
 * Matches backend permission structure (resource.action format)
 */

// Resources (matches backend RESOURCES)
export const RESOURCES = {
  SCHOOLS: 'schools',
  USERS: 'users',
  STUDENTS: 'students',
  MANAGERS: 'managers',
  GRADES: 'grades',
  SUBJECTS: 'subjects',
  SCHEDULES: 'schedules',
  SESSIONS: 'sessions',
  REQUESTS: 'requests',
  NFC_BLOCKS: 'nfc-blocks',
  ATTENDANCE: 'attendance',
  FEATURES: 'features',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  REPORTS: 'reports',
  AUDIT_LOGS: 'audit-logs',
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
  SUBSCRIPTIONS: 'subscriptions',
  PAYMENTS: 'payments',
  SERVERS: 'servers',
  ACTIVITIES: 'activities',
  DASHBOARD: 'dashboard',
  CUSTOM_GROUPS: 'custom-groups',
};

// Actions (matches backend ACTIONS)
export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  DENY: 'deny',
  OVERRIDE: 'override',
  MANAGE: 'manage',
  VIEW_OWN: 'view-own',
  UPDATE_OWN: 'update-own',
  VIEW_ENROLLED: 'view-enrolled',
  VIEW_CLASS: 'view-class',
};

/**
 * Format permission name (resource.action)
 * @param {string} resource - Resource name
 * @param {string} action - Action name
 * @returns {string} Formatted permission name
 */
export const formatPermission = (resource, action) => {
  return `${resource}.${action}`;
};

/**
 * Common permission strings for easy reference
 */
export const PERMISSIONS = {
  // Students
  STUDENTS_CREATE: formatPermission(RESOURCES.STUDENTS, ACTIONS.CREATE),
  STUDENTS_READ: formatPermission(RESOURCES.STUDENTS, ACTIONS.READ),
  STUDENTS_UPDATE: formatPermission(RESOURCES.STUDENTS, ACTIONS.UPDATE),
  STUDENTS_DELETE: formatPermission(RESOURCES.STUDENTS, ACTIONS.DELETE),

  // Managers
  MANAGERS_CREATE: formatPermission(RESOURCES.MANAGERS, ACTIONS.CREATE),
  MANAGERS_READ: formatPermission(RESOURCES.MANAGERS, ACTIONS.READ),
  MANAGERS_UPDATE: formatPermission(RESOURCES.MANAGERS, ACTIONS.UPDATE),
  MANAGERS_DELETE: formatPermission(RESOURCES.MANAGERS, ACTIONS.DELETE),

  // Grades
  GRADES_CREATE: formatPermission(RESOURCES.GRADES, ACTIONS.CREATE),
  GRADES_READ: formatPermission(RESOURCES.GRADES, ACTIONS.READ),
  GRADES_UPDATE: formatPermission(RESOURCES.GRADES, ACTIONS.UPDATE),
  GRADES_DELETE: formatPermission(RESOURCES.GRADES, ACTIONS.DELETE),

  // Subjects
  SUBJECTS_CREATE: formatPermission(RESOURCES.SUBJECTS, ACTIONS.CREATE),
  SUBJECTS_READ: formatPermission(RESOURCES.SUBJECTS, ACTIONS.READ),
  SUBJECTS_UPDATE: formatPermission(RESOURCES.SUBJECTS, ACTIONS.UPDATE),
  SUBJECTS_DELETE: formatPermission(RESOURCES.SUBJECTS, ACTIONS.DELETE),

  // Schedules
  SCHEDULES_CREATE: formatPermission(RESOURCES.SCHEDULES, ACTIONS.CREATE),
  SCHEDULES_READ: formatPermission(RESOURCES.SCHEDULES, ACTIONS.READ),
  SCHEDULES_UPDATE: formatPermission(RESOURCES.SCHEDULES, ACTIONS.UPDATE),
  SCHEDULES_DELETE: formatPermission(RESOURCES.SCHEDULES, ACTIONS.DELETE),

  // Sessions
  SESSIONS_CREATE: formatPermission(RESOURCES.SESSIONS, ACTIONS.CREATE),
  SESSIONS_READ: formatPermission(RESOURCES.SESSIONS, ACTIONS.READ),
  SESSIONS_UPDATE: formatPermission(RESOURCES.SESSIONS, ACTIONS.UPDATE),
  SESSIONS_DELETE: formatPermission(RESOURCES.SESSIONS, ACTIONS.DELETE),
  SESSIONS_OVERRIDE: formatPermission(RESOURCES.SESSIONS, ACTIONS.OVERRIDE),

  // Custom Groups
  CUSTOM_GROUPS_CREATE: formatPermission(RESOURCES.CUSTOM_GROUPS, ACTIONS.CREATE),
  CUSTOM_GROUPS_READ: formatPermission(RESOURCES.CUSTOM_GROUPS, ACTIONS.READ),
  CUSTOM_GROUPS_UPDATE: formatPermission(RESOURCES.CUSTOM_GROUPS, ACTIONS.UPDATE),
  CUSTOM_GROUPS_DELETE: formatPermission(RESOURCES.CUSTOM_GROUPS, ACTIONS.DELETE),

  // Roles
  ROLES_CREATE: formatPermission(RESOURCES.ROLES, ACTIONS.CREATE),
  ROLES_READ: formatPermission(RESOURCES.ROLES, ACTIONS.READ),
  ROLES_UPDATE: formatPermission(RESOURCES.ROLES, ACTIONS.UPDATE),
  ROLES_DELETE: formatPermission(RESOURCES.ROLES, ACTIONS.DELETE),

  // Permissions
  PERMISSIONS_READ: formatPermission(RESOURCES.PERMISSIONS, ACTIONS.READ),
  PERMISSIONS_UPDATE: formatPermission(RESOURCES.PERMISSIONS, ACTIONS.UPDATE),

  // Activities
  ACTIVITIES_READ: formatPermission(RESOURCES.ACTIVITIES, ACTIONS.READ),

  // Dashboard
  DASHBOARD_READ: formatPermission(RESOURCES.DASHBOARD, ACTIONS.READ),

  // Schools
  SCHOOLS_READ: formatPermission(RESOURCES.SCHOOLS, ACTIONS.READ),
  SCHOOLS_UPDATE: formatPermission(RESOURCES.SCHOOLS, ACTIONS.UPDATE),

  // Attendance
  ATTENDANCE_READ: formatPermission(RESOURCES.ATTENDANCE, ACTIONS.READ),
  ATTENDANCE_UPDATE: formatPermission(RESOURCES.ATTENDANCE, ACTIONS.UPDATE),

  // Requests
  REQUESTS_READ: formatPermission(RESOURCES.REQUESTS, ACTIONS.READ),
  REQUESTS_APPROVE: formatPermission(RESOURCES.REQUESTS, ACTIONS.APPROVE),
  REQUESTS_DENY: formatPermission(RESOURCES.REQUESTS, ACTIONS.DENY),
};

