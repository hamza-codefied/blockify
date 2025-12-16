/**
 * LockedSection Component
 * Wraps a section and shows a lock icon overlay when user doesn't have required permission
 * Always renders children structure but overlays lock when permission denied (to show titles)
 */
import { useAuthStore } from '@/store/authStore';
import lockIcon from '@/images/access-rights-lock.png';
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

  // Always render wrapper with children structure, but overlay lock when permission denied
  return (
    <div className={`locked-section-wrapper ${className}`} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Render children but disable interaction when locked */}
      <div style={{ 
        pointerEvents: hasAccess ? 'auto' : 'none',
        opacity: hasAccess ? 1 : 0.5,
        width: '100%',
        height: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {children}
      </div>
      
      {/* Show lock overlay when permission denied */}
      {!hasAccess && (
        <div className="locked-section-overlay">
          <div className="locked-section-content">
            <img src={lockIcon} alt="Locked" className="locked-section-icon" />
            <p className="locked-section-message">{lockMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
};

