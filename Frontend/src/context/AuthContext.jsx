// ============================================
// FILE 4: Frontend/src/context/AuthContext.jsx
// ============================================
import { createContext, useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { authAPI } from "@/api/auth.api"
import toast from "react-hot-toast"

export const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const initAuth = async () => {
      console.log('🔍 Initializing auth...')
      
      const token = localStorage.getItem('authToken')
      const savedUser = localStorage.getItem('user')

      if (!token) {
        console.log('ℹ️ No token found')
        setLoading(false)
        return
      }

      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser)
          console.log('✅ Restored user:', parsedUser.email, 'Role:', parsedUser.role)
          
          setUser(parsedUser)
          setIsAuthenticated(true)

          // Verify token
          try {
            const response = await authAPI.getCurrentUser()
            if (response?.success && response?.data) {
              setUser(response.data)
              localStorage.setItem('user', JSON.stringify(response.data))
            }
          } catch (error) {
            console.warn('⚠️ Token verification failed')
            clearAuth()
          }
        } catch (error) {
          console.error('❌ Parse error:', error)
          clearAuth()
        }
      }

      setLoading(false)
    }

    initAuth()
  }, [])

  const clearAuth = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    localStorage.removeItem('refreshToken')
    setUser(null)
    setIsAuthenticated(false)
  }

  const login = async (credentials) => {
    try {
      console.log('🔐 LOGIN:', credentials.email)
      const response = await authAPI.login(credentials)

      if (!response?.success || !response?.data?.user) {
        toast.error(response?.message || "Login failed")
        return { success: false }
      }

      const { user: userData } = response.data
      
      setUser(userData)
      setIsAuthenticated(true)

      console.log('✅ LOGIN SUCCESS:', userData.email, 'Role:', userData.role)
      toast.success("Login successful!")
      
      return { success: true, user: userData }
    } catch (error) {
      console.error('❌ LOGIN ERROR:', error)
      toast.error(error.response?.data?.message || "Login failed")
      return { success: false }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData)
      if (response?.success) {
        toast.success("Registration successful! Please verify OTP.")
        return { success: true }
      }
      toast.error(response?.message || "Registration failed")
      return { success: false }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed")
      return { success: false }
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } finally {
      clearAuth()
      navigate("/login", { replace: true })
      toast.success("Logged out successfully")
    }
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const isAdmin = user?.role === "admin" || user?.isAdmin === true

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    updateUser,
  }

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}