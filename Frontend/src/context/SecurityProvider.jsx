// Frontend/src/context/SecurityProvider.jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import SecurityUtils from '@/admin/utils/security.utils'

const SecurityContext = createContext()

export const useSecurityContext = () => {
  const context = useContext(SecurityContext)
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider')
  }
  return context
}

export const SecurityProvider = ({ children }) => {
  const { logout, isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()
  
  const [lastActivity, setLastActivity] = useState(Date.now())
  const [showInactivityWarning, setShowInactivityWarning] = useState(false)
  
  // Session timeout: 30 minutes
  const TIMEOUT_DURATION = 30 * 60 * 1000
  // Warning: 5 minutes before timeout
  const WARNING_DURATION = 5 * 60 * 1000

  // ============================================
  // SESSION TIMEOUT HANDLER
  // ============================================
  const handleSessionTimeout = useCallback(() => {
    console.warn('🔒 Session timeout - Auto logout')
    toast.error('Session expired due to inactivity')
    logout()
    navigate('/login')
  }, [logout, navigate])

  // ============================================
  // UPDATE ACTIVITY
  // ============================================
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now())
    setShowInactivityWarning(false)
  }, [])

  // ============================================
  // TRACK USER ACTIVITY (Only for admin)
  // ============================================
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
    
    const throttledUpdate = (() => {
      let timeout
      return () => {
        if (!timeout) {
          timeout = setTimeout(() => {
            updateActivity()
            timeout = null
          }, 1000) // Throttle to 1 second
        }
      }
    })()

    events.forEach(event => {
      window.addEventListener(event, throttledUpdate, { passive: true })
    })

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, throttledUpdate)
      })
    }
  }, [isAuthenticated, isAdmin, updateActivity])

  // ============================================
  // CHECK INACTIVITY TIMEOUT
  // ============================================
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return

    const interval = setInterval(() => {
      const timeSinceActivity = Date.now() - lastActivity
      
      // Show warning 5 minutes before timeout
      if (timeSinceActivity >= (TIMEOUT_DURATION - WARNING_DURATION) && !showInactivityWarning) {
        setShowInactivityWarning(true)
        toast.warning('Your session will expire in 5 minutes due to inactivity', {
          duration: 5000
        })
      }
      
      // Logout on timeout
      if (timeSinceActivity >= TIMEOUT_DURATION) {
        handleSessionTimeout()
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [isAuthenticated, isAdmin, lastActivity, showInactivityWarning, handleSessionTimeout, TIMEOUT_DURATION, WARNING_DURATION])

  // ============================================
  // CHECK TOKEN EXPIRY
  // ============================================
  useEffect(() => {
    if (!isAuthenticated) return

    const checkTokenExpiry = () => {
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('⚠️ Token missing')
        logout()
        return
      }

      // ✅ FIX: Use SecurityUtils.isTokenExpired instead of just isTokenExpired
      if (SecurityUtils.isTokenExpired(token)) {
        console.warn('🔒 Token expired')
        toast.error('Session expired. Please login again.')
        logout()
        navigate('/login')
      }
    }

    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60000)
    checkTokenExpiry() // Check immediately

    return () => clearInterval(interval)
  }, [isAuthenticated, logout, navigate])

  // ============================================
  // DETECT SUSPICIOUS ACTIVITY
  // ============================================
  useEffect(() => {
    if (!isAdmin) return

    let navigationCount = 0
    const navigationInterval = setInterval(() => {
      navigationCount = 0
    }, 10000) // Reset every 10 seconds

    const navigationHandler = () => {
      navigationCount++
      if (navigationCount > 20) {
        console.warn('🚨 Suspicious activity: Rapid navigation detected')
        toast.error('Suspicious activity detected. Please verify your session.')
      }
    }

    window.addEventListener('popstate', navigationHandler)

    return () => {
      window.removeEventListener('popstate', navigationHandler)
      clearInterval(navigationInterval)
    }
  }, [isAdmin])

  // ============================================
  // AUDIT LOG HELPER
  // ============================================
  const logAdminAction = useCallback((action, details = {}) => {
    if (!isAdmin) return

    const log = {
      timestamp: new Date().toISOString(),
      action,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    console.log('📝 Admin Action Logged:', log)
    
    try {
      const logs = JSON.parse(sessionStorage.getItem('admin_logs') || '[]')
      logs.push(log)
      sessionStorage.setItem('admin_logs', JSON.stringify(logs.slice(-100)))
    } catch (error) {
      console.error('Failed to store audit log:', error)
    }
  }, [isAdmin])

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value = {
    lastActivity,
    showInactivityWarning,
    updateActivity,
    logAdminAction,
    sessionTimeout: TIMEOUT_DURATION
  }

  return (
    <SecurityContext.Provider value={value}>
      {children}
      
      {/* Inactivity Warning Modal */}
      {showInactivityWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              ⚠️ Session Expiring Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your session will expire in 5 minutes due to inactivity. 
              Click below to stay logged in.
            </p>
            <button
              onClick={updateActivity}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Stay Logged In
            </button>
          </div>
        </div>
      )}
    </SecurityContext.Provider>
  )
}

export default SecurityProvider