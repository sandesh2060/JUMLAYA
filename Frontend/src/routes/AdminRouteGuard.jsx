// ============================================
// NEW FILE: src/routes/AdminRouteGuard.jsx
// Admin-specific route protection with enhanced security
// ============================================
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const AdminRouteGuard = ({ children }) => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth()
  const location = useLocation()
  const [isVerifying, setIsVerifying] = useState(true)

  useEffect(() => {
    const verifyAdminAccess = () => {
      console.log('🔐 AdminRouteGuard Check:', {
        isAuthenticated,
        isAdmin,
        userRole: user?.role,
        path: location.pathname
      })

      if (!loading) {
        setIsVerifying(false)
      }
    }

    verifyAdminAccess()
  }, [loading, isAuthenticated, isAdmin, user, location])

  // Show loading while verifying
  if (loading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
            Verifying admin access...
          </p>
        </div>
      </div>
    )
  }

  // Not authenticated at all
  if (!isAuthenticated) {
    console.warn('❌ AdminRouteGuard: Not authenticated')
    toast.error('Please login to access admin panel')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Authenticated but not admin
  if (!isAdmin) {
    console.warn('🚫 AdminRouteGuard: Access denied - Not an admin')
    console.warn('User details:', { email: user?.email, role: user?.role, isAdmin: user?.isAdmin })
    toast.error('Access denied. Admin privileges required.')
    return <Navigate to="/" replace />
  }

  // Token expiry check
  const token = localStorage.getItem('token')
  if (!token) {
    console.warn('⚠️ AdminRouteGuard: Token missing')
    toast.error('Session expired. Please login again.')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  console.log('✅ AdminRouteGuard: Access granted')
  return children
}

export default AdminRouteGuard