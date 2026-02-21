// ============================================
// Frontend/src/pages/Register.jsx
// 🚫 OTP FLOW DISABLED TEMPORARILY
// To re-enable: uncomment OTP sections below
// ============================================
import { RegisterForm } from '@components/auth/RegisterForm'
// import { OTPVerification } from '@components/auth/OTPVerification' // 🚫 DISABLED
// import { useState } from 'react' // 🚫 DISABLED (no OTP state needed)

const Register = () => {
  // 🚫 OTP STATE DISABLED
  // const [showOTP, setShowOTP] = useState(false)
  // const [email, setEmail] = useState('')
  // const handleOTPRequired = (userEmail) => {
  //   setEmail(userEmail)
  //   setShowOTP(true)
  // }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 transition-colors">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Create Account
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign up to get started
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 transition-colors">
          {/* 🚫 OTP FLOW DISABLED
          {showOTP ? (
            <OTPVerification email={email} />
          ) : (
            <RegisterForm onOTPRequired={handleOTPRequired} />
          )}
          */}
          <RegisterForm />
        </div>
      </div>
    </div>
  )
}

export default Register