/**
 * LockedSection Component
 * Wraps a section and shows a lock icon overlay when user doesn't have required permission
 */
import { useAuthStore } from '@/store/authStore';
import lockIcon from '@/images/lock.svg';
import './LockedSection.css';

/**
 * @param {Object} props
 * @param {string} props.permission - Required permission to access this section
 * @param {string[]} props.permissions - Alternative: array of permissions (user needs at least one)
 * @param {boolean} props.requireAll - If permissions array provided, require all permissions (default: false, needs any)
 * @param {React.ReactNode} props.children - Content to wrap
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.lockMessage - Custom message to show when locked (optional)
 */
export const LockedSection = ({
  permission,
  permissions,
  requireAll = false,
  children,
  className = '',
  lockMessage = 'You do not have permission to access this section',
}) => {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const userPermissions = useAuthStore((state) => state.permissions) || [];

  // Check permissions
  let hasAccess = false;
  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && permissions.length > 0) {
    if (requireAll) {
      hasAccess = permissions.every((perm) => hasPermission(perm));
    } else {
      hasAccess = permissions.some((perm) => hasPermission(perm));
    }
  } else {
    // No permission check specified, allow access
    hasAccess = true;
  }

  // If user has access, render children normally
  if (hasAccess) {
    return (
      <div className={`locked-section-wrapper ${className}`} style={{ position: 'relative', width: '100%', height: '100%' }}>
        {children}
      </div>
    );
  }

  // If user doesn't have access, show lock overlay without rendering children (prevents API calls)
  return (
    <div className={`locked-section-wrapper ${className}`} style={{ position: 'relative', width: '100%', height: '100%', minHeight: '200px' }}>
      <div className="locked-section-overlay" style={{ position: 'relative' }}>
        <div className="locked-section-content">
          <img src={lockIcon} alt="Locked" className="locked-section-icon" />
          <p className="locked-section-message">{lockMessage}</p>
        </div>
      </div>
    </div>
  );
};

