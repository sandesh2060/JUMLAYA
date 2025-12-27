// ============================================
// FILE 2: Frontend/src/routes/AdminRoute.jsx
// REPLACE COMPLETELY
// ============================================
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { useEffect, useState } from 'react'

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth()
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

  if (!isAuthenticated) {
    toast.error('Please login to access admin panel')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  // ✅ Render children (AdminLayout) or Outlet
  return children || <Outlet />
}

export default AdminRoute