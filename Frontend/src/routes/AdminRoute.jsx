// ============================================
// FILE 2: Frontend/src/routes/AdminRoute.jsx
// SECURED VERSION - Enhanced Admin Protection
// ============================================
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth()
  const location = useLocation()
  const [hasShownToast, setHasShownToast] = useState(false)

  useEffect(() => {
    if (!loading && isAuthenticated && !isAdmin && !hasShownToast) {
      toast.error('Access denied. Admin privileges required.')
      setHasShownToast(true)
    }
  }, [loading, isAuthenticated, isAdmin, hasShownToast])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // ❌ Not authenticated at all
  if (!isAuthenticated || !user) {
    toast.error('Please login to access admin panel')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // ✅ ENHANCED: Double-check admin role explicitly
  const userRole = user.role?.toLowerCase()
  const isActuallyAdmin = 
    userRole === "admin" || 
    userRole === "superadmin" || 
    user.isAdmin === true

  // 🚫 SECURITY: Not an admin - log and redirect
  if (!isAdmin || !isActuallyAdmin) {
    // Log security breach attempt
    console.error('🚨 UNAUTHORIZED ADMIN ACCESS ATTEMPT:', {
      userId: user._id,
      email: user.email,
      role: userRole,
      attemptedPath: location.pathname,
      timestamp: new Date().toISOString(),
      ipAddress: 'client-side' // You can add real IP from backend
    })

    toast.error('Access Denied: You do not have admin privileges')

    // Redirect based on their actual role
    if (userRole === 'rider') {
      return <Navigate to="/rider/dashboard" replace />
    } else {
      return <Navigate to="/" replace />
    }
  }

  // ✅ SECURITY CHECK: Verify user is actually accessing admin routes
  if (!location.pathname.startsWith('/admin')) {
    console.warn('⚠️ Admin accessing non-admin route, redirecting...')
    return <Navigate to="/admin/dashboard" replace />
  }

  // ✅ All checks passed - render admin content
  return children || <Outlet />
}

export default AdminRoute