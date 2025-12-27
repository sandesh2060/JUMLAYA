// ============================================
// OTPVerification.jsx - COMPLETE
// ============================================
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@hooks/useLanguage"
import { authAPI } from "@api/auth.api"
import { Button } from "@components/common/Button"
import { Lock } from "lucide-react"

export const OTPVerification = ({ email, onSuccess }) => {
  const { t } = useLanguage()
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [resendCountdown, setResendCountdown] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setOtp(value)
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (otp.length !== 6) {
      setError(t('otpLength') || "Please enter a 6-digit code")
      setLoading(false)
      return
    }

    try {
      const response = await authAPI.verifyOTP(email, otp)
      if (response.success) {
        if (onSuccess) onSuccess()
        else navigate("/login", { state: { message: "Email verified! Please login." } })
      } else {
        setError(response.message || "Invalid OTP")
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await authAPI.resendOTP(email)
      if (response.success) {
        setResendCountdown(60)
        setOtp("")
      } else {
        setError(response.message || "Failed to resend OTP")
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="text-center mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          {t('otpSent') || "We've sent a verification code to"} <br />
          <span className="font-semibold text-gray-900 dark:text-gray-100">{email}</span>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('verificationCode') || 'Verification Code'}
        </label>
        <div className="relative">
          <Lock size={18} className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
          <input
            type="text" value={otp} onChange={handleChange} inputMode="numeric" maxLength="6" required
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-center text-2xl tracking-widest"
            placeholder="000000"
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {t('otpLength') || 'Enter the 6-digit code'}
        </p>
      </div>

      <Button type="submit" disabled={loading || otp.length !== 6}
        className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 text-white py-2 rounded-lg font-semibold">
        {loading ? (t('loading') || "Verifying...") : (t('verify') || "Verify Code")}
      </Button>

      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('didntReceiveCode') || "Didn't receive the code?"}{" "}
          <button type="button" onClick={handleResendOTP} disabled={resendCountdown > 0 || loading}
            className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed">
            {resendCountdown > 0 ? `${t('resendIn') || 'Resend in'} ${resendCountdown}s` : (t('resendCode') || 'Resend Code')}
          </button>
        </p>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        {t('codeExpires') || 'Code expires in 10 minutes'}
      </p>
    </form>
  )
}