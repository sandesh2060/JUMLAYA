// ============================================
// Frontend/src/routes/RiderRoute.jsx
// Rider Route Protection
// ============================================
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';

const RiderRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  const [hasShownToast, setHasShownToast] = useState(false);

  const isRider = user?.role === 'rider';

  useEffect(() => {
    if (!loading && isAuthenticated && !isRider && !hasShownToast) {
      toast.error('Access denied. Rider privileges required.');
      setHasShownToast(true);
    }
  }, [loading, isAuthenticated, isRider, hasShownToast]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">Verifying rider access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    toast.error('Please login to access rider dashboard');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but not a rider - redirect to home
  if (!isRider) {
    toast.error('Access denied. This area is for riders only.');
    return <Navigate to="/" replace />;
  }

  // Render children (RiderLayout) or Outlet
  return children || <Outlet />;
};

export default RiderRoute;