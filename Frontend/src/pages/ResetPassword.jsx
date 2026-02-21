// ============================================
// Frontend/src/pages/ResetPassword.jsx
// 🚫 OTP DISABLED - Direct password reset
// RE-ENABLE OTP: restore otp field + resendOTP logic
// ============================================

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { resetPassword } from '@/api/password.api';
// import { resendOTP } from '@/api/password.api'; // 🚫 RE-ENABLE OTP: uncomment
import { toast } from 'react-hot-toast';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || '';

  const [formData, setFormData] = useState({
    email: emailFromState,
    // otp: '',          // 🚫 RE-ENABLE OTP: uncomment
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  // 🚫 OTP timer disabled
  // const [otpTimer, setOtpTimer] = useState(0);
  // const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!emailFromState) {
      toast.error('Please enter your email first');
      navigate('/forgot-password');
    }
  }, [emailFromState, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // 🚫 OTP DISABLED
  // RE-ENABLE OTP: restore handleResendOTP function here
  // const handleResendOTP = async () => { ... }

  const validateForm = () => {
    if (!formData.email) { setError('Email is required'); return false; }

    // 🚫 OTP check disabled
    // RE-ENABLE OTP: add back: if (!formData.otp || formData.otp.length !== 6) { ... }

    if (!formData.newPassword) { setError('New password is required'); return false; }
    if (formData.newPassword.length < 8) { setError('Password must be at least 8 characters long'); return false; }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      setError('Password must contain uppercase, lowercase, and number');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) { setError('Passwords do not match'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);

    try {
      const response = await resetPassword({
        email: formData.email,
        // otp: formData.otp,   // 🚫 RE-ENABLE OTP: uncomment
        newPassword: formData.newPassword
      });

      toast.success(response.message || 'Password reset successful!', { duration: 4000, icon: '✅' });
      setTimeout(() => navigate('/login', { replace: true }), 2000);

    } catch (err) {
      setError(err.message || 'Failed to reset password');
      toast.error(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    const levels = [
      { strength: 0, label: 'Very Weak', color: 'bg-red-500' },
      { strength: 1, label: 'Weak', color: 'bg-orange-500' },
      { strength: 2, label: 'Fair', color: 'bg-yellow-500' },
      { strength: 3, label: 'Good', color: 'bg-blue-500' },
      { strength: 4, label: 'Strong', color: 'bg-green-500' },
      { strength: 5, label: 'Very Strong', color: 'bg-green-600' },
    ];
    return levels[strength];
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Reset Your Password</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Set a new password for <span className="font-semibold">{formData.email}</span>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* 🚫 OTP INPUT DISABLED */}
            {/* RE-ENABLE OTP: restore this block
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">6-Digit OTP</label>
              <input name="otp" type="text" maxLength="6" value={formData.otp} onChange={handleChange}
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {otpTimer > 0 ? `Resend in ${formatTime(otpTimer)}` : "Didn't receive code?"}
                </span>
                <button type="button" onClick={handleResendOTP} disabled={otpTimer > 0 || resendLoading}
                  className="text-blue-600 dark:text-blue-400 font-medium disabled:opacity-50">
                  Resend OTP
                </button>
              </div>
            </div>
            */}

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input name="newPassword" type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword} onChange={handleChange}
                  placeholder="Enter new password" disabled={loading}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Password Strength:</span>
                    <span className={`text-xs font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>{passwordStrength.label}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }} />
                  </div>
                </div>
              )}

              <div className="mt-3 space-y-1">
                <p className="text-xs text-gray-600 dark:text-gray-400">Password must contain:</p>
                {[
                  [formData.newPassword.length >= 8, 'At least 8 characters'],
                  [/[A-Z]/.test(formData.newPassword), 'One uppercase letter'],
                  [/[a-z]/.test(formData.newPassword), 'One lowercase letter'],
                  [/\d/.test(formData.newPassword), 'One number'],
                ].map(([met, label]) => (
                  <div key={label} className="flex items-center space-x-2 text-xs">
                    <CheckCircle className={`h-3 w-3 ${met ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className={met ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword} onChange={handleChange}
                  placeholder="Confirm new password" disabled={loading}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.confirmPassword && (
                <div className="mt-2 flex items-center space-x-2">
                  {formData.newPassword === formData.confirmPassword ? (
                    <><CheckCircle className="h-4 w-4 text-green-500" /><span className="text-xs text-green-600 dark:text-green-400">Passwords match</span></>
                  ) : (
                    <><AlertCircle className="h-4 w-4 text-red-500" /><span className="text-xs text-red-600 dark:text-red-400">Passwords do not match</span></>
                  )}
                </div>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]">
              {loading ? (
                <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" /><span>Resetting Password...</span></>
              ) : (
                <><CheckCircle className="h-5 w-5" /><span>Reset Password</span></>
              )}
            </button>
          </form>

          <div className="text-center pt-4">
            <Link to="/login" className="inline-flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200">
              <ArrowLeft className="h-4 w-4" /><span>Back to Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;