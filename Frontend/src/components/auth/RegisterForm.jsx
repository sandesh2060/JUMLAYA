// ============================================
// RegisterForm.jsx - PHONE NUMBER FIX
// Path: Frontend/src/components/auth/RegisterForm.jsx
// ============================================
import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useLanguage } from "@hooks/useLanguage"
import { authAPI } from "@api/auth.api"
import { Button } from "@components/common/Button"
import { User, Mail, Phone, Lock, Eye, EyeOff, Bike, ShoppingBag } from "lucide-react"
import toast from "react-hot-toast"

export const RegisterForm = ({ onOTPRequired }) => {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  
  const roleFromUrl = searchParams.get('role')
  
  const [formData, setFormData] = useState({
    firstname: "", 
    lastname: "", 
    username: "", 
    email: "", 
    phone: "", 
    password: "", 
    confirmPassword: "",
    role: roleFromUrl === 'rider' ? 'rider' : 'customer'
  })
  
  const [riderDetails, setRiderDetails] = useState({
    vehicleType: "bike",
    vehicleNumber: "",
    licenseNumber: ""
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleRiderDetailsChange = (e) => {
    const { name, value } = e.target
    setRiderDetails((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordMismatch') || "Passwords do not match")
      setLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError(t('passwordLength') || "Password must be at least 8 characters")
      setLoading(false)
      return
    }

    if (formData.role === 'rider') {
      if (!riderDetails.vehicleNumber.trim()) {
        setError("Vehicle number is required for riders")
        setLoading(false)
        return
      }
      if (!riderDetails.licenseNumber.trim()) {
        setError("License number is required for riders")
        setLoading(false)
        return
      }
    }

    try {
      // ✅ FIX: Clean phone number (remove all non-digits)
      const cleanedPhone = formData.phone.replace(/\D/g, '')
      
      const registrationData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        username: formData.username,
        email: formData.email,
        phone: cleanedPhone, // ✅ Send digits only
        password: formData.password,
        role: formData.role
      }

      if (formData.role === 'rider') {
        registrationData.riderProfile = {
          vehicleType: riderDetails.vehicleType,
          vehicleNumber: riderDetails.vehicleNumber,
          licenseNumber: riderDetails.licenseNumber,
          isApproved: false
        }
      }

      console.log('📝 Registration data:', registrationData)

      const response = await authAPI.register(registrationData)

      if (response.success) {
        if (formData.role === 'rider') {
          toast.success("Rider registration submitted! Awaiting admin approval.")
        } else {
          toast.success("Registration successful! Please verify your email.")
        }
        onOTPRequired(formData.email)
      } else {
        setError(response.message || "Registration failed")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError(err.response?.data?.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Role Selection */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, role: 'customer' }))}
          className={`p-4 rounded-xl border-2 transition-all ${
            formData.role === 'customer'
              ? 'border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-gray-800'
          }`}
        >
          <ShoppingBag className={`mx-auto mb-2 ${
            formData.role === 'customer' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'
          }`} size={32} />
          <p className={`font-semibold ${
            formData.role === 'customer' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'
          }`}>
            Customer
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Shop products
          </p>
        </button>

        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, role: 'rider' }))}
          className={`p-4 rounded-xl border-2 transition-all ${
            formData.role === 'rider'
              ? 'border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700 bg-white dark:bg-gray-800'
          }`}
        >
          <Bike className={`mx-auto mb-2 ${
            formData.role === 'rider' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
          }`} size={32} />
          <p className={`font-semibold ${
            formData.role === 'rider' ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'
          }`}>
            Delivery Rider
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Earn money
          </p>
        </button>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('firstName') || 'First Name'}
          </label>
          <input
            type="text" 
            name="firstname" 
            value={formData.firstname} 
            onChange={handleChange} 
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="John"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t('lastName') || 'Last Name'}
          </label>
          <input
            type="text" 
            name="lastname" 
            value={formData.lastname} 
            onChange={handleChange} 
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="Doe"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('username') || 'Username'}
        </label>
        <div className="relative">
          <User size={18} className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
          <input
            type="text" 
            name="username" 
            value={formData.username} 
            onChange={handleChange} 
            required
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="johndoe"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('email') || 'Email Address'}
        </label>
        <div className="relative">
          <Mail size={18} className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
          <input
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('phone') || 'Phone Number'}
        </label>
        <div className="relative">
          <Phone size={18} className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
          <input
            type="tel" 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange} 
            required
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="9841234567"
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Enter 10-15 digits (no spaces or symbols)
        </p>
      </div>

      {/* Rider-specific fields */}
      {formData.role === 'rider' && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg space-y-3">
          <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">
            🚴‍♂️ Rider Details
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Vehicle Type
            </label>
            <select
              name="vehicleType"
              value={riderDetails.vehicleType}
              onChange={handleRiderDetailsChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="bike">Bike</option>
              <option value="scooter">Scooter</option>
              <option value="bicycle">Bicycle</option>
              <option value="car">Car</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Vehicle Number *
            </label>
            <input
              type="text"
              name="vehicleNumber"
              value={riderDetails.vehicleNumber}
              onChange={handleRiderDetailsChange}
              required
              placeholder="BA-12-PA-3456"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              License Number *
            </label>
            <input
              type="text"
              name="licenseNumber"
              value={riderDetails.licenseNumber}
              onChange={handleRiderDetailsChange}
              required
              placeholder="DL-123456"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded p-3 text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium mb-1">⚠️ Note:</p>
            <p>Your rider account will need admin approval before you can start accepting deliveries.</p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('password') || 'Password'}
        </label>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
          <input
            type={showPassword ? "text" : "password"} 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            required
            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="••••••••"
          />
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {t('passwordHint') || 'Min 8 characters'}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('confirmPassword') || 'Confirm Password'}
        </label>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
          <input
            type={showConfirmPassword ? "text" : "password"} 
            name="confirmPassword" 
            value={formData.confirmPassword} 
            onChange={handleChange} 
            required
            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="••••••••"
          />
          <button 
            type="button" 
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={loading}
        className={`w-full ${
          formData.role === 'rider'
            ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
            : 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600'
        } text-white py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (t('loading') || "Creating account...") : 
         formData.role === 'rider' ? "Register as Rider 🚴‍♂️" : 
         (t('register') || "Create Account")}
      </Button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        {t('alreadyHaveAccount') || 'Already have an account?'}{" "}
        <a href="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors">
          {t('login') || 'Sign in'}
        </a>
      </p>
    </form>
  )
}