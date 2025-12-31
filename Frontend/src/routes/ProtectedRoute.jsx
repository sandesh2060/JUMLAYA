// ============================================
// FILE: ProtectedRoute.jsx - SECURED VERSION
// Path: Frontend/src/routes/ProtectedRoute.jsx
// Prevents URL manipulation attacks
// ============================================
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

const ProtectedRoute = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();
  const [hasShownToast, setHasShownToast] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated && !hasShownToast) {
      toast.error('Please login to access this page');
      setHasShownToast(true);
    }
  }, [loading, isAuthenticated, hasShownToast]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ CRITICAL SECURITY: Role-based access control
  const userRole = user.role?.toLowerCase();
  const currentPath = location.pathname;

  // 🚫 ADMINS must stay in /admin routes
  if (userRole === "admin" || userRole === "superadmin" || user.isAdmin === true) {
    // If admin tries to access non-admin routes, redirect them back
    if (!currentPath.startsWith("/admin")) {
      console.warn("⚠️ SECURITY: Admin blocked from accessing:", currentPath);
      toast.error("Admins must use admin dashboard");
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  // 🚫 RIDERS must stay in /rider routes
  if (userRole === "rider") {
    // If rider tries to access non-rider routes, redirect them back
    if (!currentPath.startsWith("/rider")) {
      console.warn("⚠️ SECURITY: Rider blocked from accessing:", currentPath);
      toast.error("Riders must use rider dashboard");
      return <Navigate to="/rider/dashboard" replace />;
    }

    // Extra check: Ensure rider is approved
    if (user.riderProfile?.isApproved === false) {
      toast.error("Your rider account is pending approval");
      return <Navigate to="/" replace />;
    }
  }

  // 🚫 CUSTOMERS cannot access admin or rider routes
  if (userRole === "customer" || userRole === "user" || !userRole) {
    if (currentPath.startsWith("/admin")) {
      console.error("🚨 SECURITY BREACH: Customer tried to access admin:", user.email);
      toast.error("Access Denied: Admin privileges required");
      return <Navigate to="/" replace />;
    }
    if (currentPath.startsWith("/rider")) {
      console.error("🚨 SECURITY BREACH: Customer tried to access rider:", user.email);
      toast.error("Access Denied: Rider privileges required");
      return <Navigate to="/" replace />;
    }
  }

  // ✅ All security checks passed - render protected content
  return <Outlet />;
};

export default ProtectedRoute;