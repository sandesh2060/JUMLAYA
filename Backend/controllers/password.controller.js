// ============================================
// Backend/controllers/password.controller.js
// 🚫 OTP/EMAIL DISABLED TEMPORARILY
// RE-ENABLE: search "RE-ENABLE OTP" comments
// ============================================

const User = require('../models/user.model');
const crypto = require('crypto');
// const sendEmail = require('../utils/sendEmail'); // 🚫 RE-ENABLE OTP: uncomment
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// =====================================================
// @desc    Request Password Reset
// @route   POST /api/password/forgot
// 🚫 OTP DISABLED: just validates email exists, no email sent
// RE-ENABLE OTP: restore sendEmail + OTP generation block
// =====================================================
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new AppError('Please provide an email address', 400));

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return next(new AppError('No user found with this email address', 404));
  if (!user.isActive) return next(new AppError('This account has been deactivated', 403));

  // 🚫 OTP DISABLED - no OTP generated or emailed
  // RE-ENABLE OTP: restore this block ↓
  // const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // user.resetPasswordOTP = crypto.createHash('sha256').update(otp).digest('hex');
  // user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
  // await user.save({ validateBeforeSave: false });
  // await sendEmail({ email: user.email, subject: 'Password Reset OTP', html: `...${otp}...` });

  console.log(`🔑 [OTP DISABLED] Password reset requested for: ${email}`);

  res.status(200).json({
    success: true,
    message: 'Email verified. You can now reset your password.',
    data: { email: user.email }
  });
});

// =====================================================
// @desc    Reset Password
// @route   POST /api/password/reset
// 🚫 OTP DISABLED: resets by email + new password only
// RE-ENABLE OTP: restore otp param + OTP hash lookup
// =====================================================
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email, newPassword } = req.body;
  // const { email, otp, newPassword } = req.body; // 🚫 RE-ENABLE OTP: use this line instead

  // 🚫 OTP DISABLED validation
  if (!email || !newPassword) {
    return next(new AppError('Please provide email and new password', 400));
  }
  // RE-ENABLE OTP: use this validation instead ↓
  // if (!email || !otp || !newPassword) return next(new AppError('Please provide email, OTP, and new password', 400));

  if (newPassword.length < 8) return next(new AppError('Password must be at least 8 characters long', 400));

  // 🚫 OTP DISABLED: find user by email only
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) return next(new AppError('No user found with this email address', 404));

  // RE-ENABLE OTP: replace the findOne above with this ↓
  // const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
  // const user = await User.findOne({
  //   email: email.toLowerCase(),
  //   resetPasswordOTP: hashedOTP,
  //   resetPasswordOTPExpires: { $gt: Date.now() }
  // }).select('+password');
  // if (!user) return next(new AppError('Invalid or expired OTP', 400));

  // Update password
  user.password = newPassword;
  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpires = undefined;
  await user.save();

  // 🚫 Confirmation email disabled
  // RE-ENABLE OTP: uncomment sendEmail call below
  // await sendEmail({ email: user.email, subject: 'Password Reset Successful', html: '...' });
  console.log(`✅ [OTP DISABLED] Password reset for: ${email}`);

  res.status(200).json({
    success: true,
    message: 'Password reset successful. You can now login with your new password.',
  });
});

// =====================================================
// @desc    Resend OTP (kept for future use)
// @route   POST /api/password/resend-otp
// 🚫 OTP DISABLED - returns success but does nothing
// RE-ENABLE OTP: restore full function body
// =====================================================
exports.resendOTP = catchAsync(async (req, res, next) => {
  // 🚫 OTP DISABLED
  // RE-ENABLE OTP: restore full resend logic below ↓
  //
  // const { email } = req.body;
  // if (!email) return next(new AppError('Please provide an email address', 400));
  // const user = await User.findOne({ email: email.toLowerCase() });
  // if (!user) return next(new AppError('No user found with this email address', 404));
  // if (user.resetPasswordOTPExpires && user.resetPasswordOTPExpires > Date.now()) {
  //   const timeLeft = Math.ceil((user.resetPasswordOTPExpires - Date.now()) / 1000 / 60);
  //   return next(new AppError(`Please wait ${timeLeft} minutes before requesting a new OTP.`, 429));
  // }
  // const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // user.resetPasswordOTP = crypto.createHash('sha256').update(otp).digest('hex');
  // user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
  // await user.save({ validateBeforeSave: false });
  // await sendEmail({ email: user.email, subject: 'New OTP', html: `...${otp}...` });

  console.log('📧 [OTP DISABLED] resendOTP called but disabled');
  res.status(200).json({ success: true, message: 'OTP resend is currently disabled' });
});

// =====================================================
// @desc    Verify OTP (kept for future use)
// @route   POST /api/password/verify-otp
// 🚫 OTP DISABLED - always returns success
// RE-ENABLE OTP: restore full verify logic
// =====================================================
exports.verifyOTP = catchAsync(async (req, res, next) => {
  // 🚫 OTP DISABLED
  // RE-ENABLE OTP: restore full verify logic below ↓
  //
  // const { email, otp } = req.body;
  // if (!email || !otp) return next(new AppError('Please provide email and OTP', 400));
  // const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
  // const user = await User.findOne({
  //   email: email.toLowerCase(),
  //   resetPasswordOTP: hashedOTP,
  //   resetPasswordOTPExpires: { $gt: Date.now() }
  // });
  // if (!user) return next(new AppError('Invalid or expired OTP', 400));

  console.log('📧 [OTP DISABLED] verifyOTP called but disabled');
  res.status(200).json({ success: true, message: 'OTP verification is currently disabled' });
});