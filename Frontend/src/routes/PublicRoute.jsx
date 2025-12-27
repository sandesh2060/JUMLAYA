// ============================================
// FIXED: PublicRoute.jsx
// Path: src/routes/PublicRoute.jsx
// ============================================
import { Navigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'

const PublicRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth()

  console.log('🌐 PublicRoute Check:', {
    isAuthenticated,
    isAdmin,
    loading,
    userRole: user?.role
  })

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // If authenticated, redirect based on role
  if (isAuthenticated) {
    console.log('✅ PublicRoute: User already authenticated')
    
    // Redirect admin to admin dashboard
    if (isAdmin) {
      console.log('   → Redirecting admin to /admin/dashboard')
      return <Navigate to="/admin/dashboard" replace />
    }
    
    // Redirect regular user to home
    console.log('   → Redirecting user to /')
    return <Navigate to="/" replace />
  }

  // If not authenticated, show the public page (login/register)
  return children
}

export default PublicRoute