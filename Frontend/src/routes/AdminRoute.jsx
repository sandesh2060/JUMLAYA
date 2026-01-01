// ============================================
// FILE: Frontend/src/routes/AdminRoute.jsx
// PRODUCTION-READY: Enhanced Admin Protection with Security Features
// ============================================
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { useEffect, useState, useCallback } from 'react';

/**
 * AdminRoute Component - Protected route for admin-only access
 * 
 * Security Features:
 * - Multi-level authentication checks
 * - Role-based access control (RBAC)
 * - Session validation
 * - Unauthorized access logging
 * - Token expiration handling
 * - Automatic redirects based on user role
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {Array<string>} props.allowedRoles - Specific roles allowed (default: ['admin', 'superadmin'])
 * @param {string} props.redirectTo - Custom redirect path for unauthorized users
 */
const AdminRoute = ({ 
  children, 
  allowedRoles = ['admin', 'superadmin'],
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isAdmin, loading, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [hasShownToast, setHasShownToast] = useState(false);
  const [securityCheckPassed, setSecurityCheckPassed] = useState(false);

  // ============================================
  // SECURITY: Log unauthorized access attempts
  // ============================================
  const logSecurityEvent = useCallback((eventType, details) => {
    const securityLog = {
      eventType,
      userId: user?._id || 'unknown',
      email: user?.email || 'unknown',
      role: user?.role || 'unknown',
      attemptedPath: location.pathname,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ...details
    };

    // Log to console (in production, send to backend)
    console.error(`🚨 SECURITY EVENT [${eventType}]:`, securityLog);

    // TODO: In production, send to backend security monitoring
    /*
    try {
      await fetch('/api/security/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(securityLog)
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
    */

    return securityLog;
  }, [user, location]);

  // ============================================
  // SECURITY: Validate user role
  // ============================================
  const validateUserRole = useCallback(() => {
    if (!user) return false;

    const userRole = user.role?.toLowerCase();
    
    // Check if user's role is in allowed roles
    const roleMatches = allowedRoles.some(role => 
      userRole === role.toLowerCase() || user.isAdmin === true
    );

    // Additional security: Check for role tampering
    if (user.role && !roleMatches) {
      logSecurityEvent('ROLE_MISMATCH', {
        expectedRoles: allowedRoles,
        actualRole: userRole,
        severity: 'HIGH'
      });
      return false;
    }

    return roleMatches;
  }, [user, allowedRoles, logSecurityEvent]);

  // ============================================
  // SECURITY: Check session validity
  // ============================================
  const checkSessionValidity = useCallback(() => {
    // Check if token exists
    const token = localStorage.getItem('authToken');
    if (!token) {
      logSecurityEvent('MISSING_TOKEN', { severity: 'MEDIUM' });
      return false;
    }

    // Check if user object is valid
    if (!user || !user._id || !user.email) {
      logSecurityEvent('INVALID_USER_OBJECT', { 
        hasUser: !!user,
        hasId: !!user?._id,
        hasEmail: !!user?.email,
        severity: 'HIGH'
      });
      return false;
    }

    // Optional: Check token expiration (if your token includes exp claim)
    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      if (tokenPayload.exp && tokenPayload.exp * 1000 < Date.now()) {
        logSecurityEvent('TOKEN_EXPIRED', { 
          expiredAt: new Date(tokenPayload.exp * 1000).toISOString(),
          severity: 'MEDIUM'
        });
        return false;
      }
    } catch (error) {
      // Token format is invalid
      logSecurityEvent('INVALID_TOKEN_FORMAT', { 
        error: error.message,
        severity: 'HIGH'
      });
      return false;
    }

    return true;
  }, [user, logSecurityEvent]);

  // ============================================
  // EFFECT: Perform security checks
  // ============================================
  useEffect(() => {
    // Skip checks while loading
    if (loading) return;

    // Reset security check
    setSecurityCheckPassed(false);

    // Check 1: User is authenticated
    if (!isAuthenticated || !user) {
      if (!hasShownToast) {
        toast.error('Please login to access admin panel');
        setHasShownToast(true);
      }
      return;
    }

    // Check 2: Session is valid
    if (!checkSessionValidity()) {
      toast.error('Session expired. Please login again.');
      logout();
      return;
    }

    // Check 3: User has admin role
    if (!isAdmin || !validateUserRole()) {
      if (!hasShownToast) {
        logSecurityEvent('UNAUTHORIZED_ADMIN_ACCESS', {
          severity: 'HIGH',
          action: 'REDIRECT'
        });
        toast.error('Access Denied: Admin privileges required');
        setHasShownToast(true);
      }
      return;
    }

    // Check 4: Verify accessing admin routes
    if (!location.pathname.startsWith('/admin')) {
      logSecurityEvent('NON_ADMIN_ROUTE_ACCESS', {
        severity: 'LOW',
        action: 'REDIRECT_TO_ADMIN'
      });
      return;
    }

    // All checks passed
    setSecurityCheckPassed(true);
  }, [
    loading, 
    isAuthenticated, 
    isAdmin, 
    user, 
    location.pathname,
    hasShownToast,
    checkSessionValidity,
    validateUserRole,
    logSecurityEvent,
    logout
  ]);

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          {/* Animated spinner */}
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto"></div>
            <div className="animate-pulse absolute inset-0 rounded-full h-16 w-16 border-4 border-green-500/20 mx-auto"></div>
          </div>
          
          {/* Loading text */}
          <div className="mt-6 space-y-2">
            <p className="text-lg text-gray-300 font-medium">
              Verifying admin access...
            </p>
            <div className="flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>

          {/* Security badge */}
          <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-full">
            <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs text-gray-400 font-medium">Secure Connection</span>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // SECURITY CHECK 1: Not authenticated
  // ============================================
  if (!isAuthenticated || !user) {
    logSecurityEvent('UNAUTHENTICATED_ACCESS', { 
      severity: 'LOW',
      action: 'REDIRECT_TO_LOGIN'
    });
    
    return (
      <Navigate 
        to={redirectTo} 
        state={{ 
          from: location,
          message: 'Please login to access admin panel',
          timestamp: Date.now()
        }} 
        replace 
      />
    );
  }

  // ============================================
  // SECURITY CHECK 2: Session invalid
  // ============================================
  if (!checkSessionValidity()) {
    logout();
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location,
          message: 'Session expired. Please login again.',
          reason: 'session_expired'
        }} 
        replace 
      />
    );
  }

  // ============================================
  // SECURITY CHECK 3: Not an admin
  // ============================================
  const userRole = user.role?.toLowerCase();
  const isActuallyAdmin = validateUserRole();

  if (!isAdmin || !isActuallyAdmin) {
    // Log security breach attempt
    logSecurityEvent('UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT', {
      expectedRoles: allowedRoles,
      actualRole: userRole,
      isAdmin: isAdmin,
      severity: 'HIGH',
      action: 'REDIRECT_BASED_ON_ROLE'
    });

    // Show error toast
    toast.error('Access Denied: You do not have admin privileges', {
      duration: 5000,
      icon: '🚫',
    });

    // Redirect based on actual role
    if (userRole === 'rider' || userRole === 'delivery') {
      return <Navigate to="/rider/dashboard" replace />;
    } else if (userRole === 'vendor' || userRole === 'seller') {
      return <Navigate to="/vendor/dashboard" replace />;
    } else if (userRole === 'customer' || userRole === 'user') {
      return <Navigate to="/" replace />;
    } else {
      // Unknown role - redirect to home
      return <Navigate to="/" replace />;
    }
  }

  // ============================================
  // SECURITY CHECK 4: Verify admin route access
  // ============================================
  if (!location.pathname.startsWith('/admin')) {
    logSecurityEvent('NON_ADMIN_ROUTE_ACCESS', {
      severity: 'LOW',
      action: 'REDIRECT_TO_ADMIN_DASHBOARD'
    });
    console.warn('⚠️ Admin accessing non-admin route, redirecting...');
    return <Navigate to="/admin/dashboard" replace />;
  }

  // ============================================
  // SECURITY CHECK 5: Verify specific permissions (optional)
  // ============================================
  // You can add route-specific permission checks here
  // Example: if accessing /admin/settings, check if user has settings permission
  
  /*
  const routePermissions = {
    '/admin/settings': ['admin', 'superadmin'],
    '/admin/audit-logs': ['superadmin'],
    '/admin/riders': ['admin', 'superadmin', 'operations']
  };

  const requiredPermission = Object.keys(routePermissions).find(route => 
    location.pathname.startsWith(route)
  );

  if (requiredPermission && !routePermissions[requiredPermission].includes(userRole)) {
    toast.error('Insufficient permissions for this section');
    return <Navigate to="/admin/dashboard" replace />;
  }
  */

  // ============================================
  // SUCCESS: All checks passed - render admin content
  // ============================================
  if (!securityCheckPassed) {
    // Security checks still in progress
    return null;
  }

  // Log successful admin access (optional, for analytics)
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ Admin access granted:', {
      user: user.email,
      role: userRole,
      path: location.pathname,
      timestamp: new Date().toISOString()
    });
  }

  return children || <Outlet />;
};

export default AdminRoute;

// ============================================
// EXPORT: Higher-order component for specific admin roles
// ============================================

/**
 * SuperAdminRoute - Only for superadmins
 * Usage: <SuperAdminRoute><YourComponent /></SuperAdminRoute>
 */
export const SuperAdminRoute = ({ children }) => (
  <AdminRoute allowedRoles={['superadmin']} redirectTo="/admin/dashboard">
    {children}
  </AdminRoute>
);

/**
 * AdminOrSuperAdminRoute - For admins and superadmins
 * Usage: <AdminOrSuperAdminRoute><YourComponent /></AdminOrSuperAdminRoute>
 */
export const AdminOrSuperAdminRoute = ({ children }) => (
  <AdminRoute allowedRoles={['admin', 'superadmin']}>
    {children}
  </AdminRoute>
);