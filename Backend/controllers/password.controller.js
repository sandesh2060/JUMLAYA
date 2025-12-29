// ============================================
// Backend/controllers/password.controller.js
// Forget Password with OTP Controller
// ============================================

const User = require('../models/user.model');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// =====================================================
// @desc    Request Password Reset (Send OTP to Email)
// @route   POST /api/password/forgot
// @access  Public
// =====================================================
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // 1. Validate email
  if (!email) {
    return next(new AppError('Please provide an email address', 400));
  }

  // 2. Find user by email
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return next(new AppError('No user found with this email address', 404));
  }

  // 3. Check if user is active
  if (!user.isActive) {
    return next(new AppError('This account has been deactivated', 403));
  }

  // 4. Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // 5. Hash OTP and save to database
  user.resetPasswordOTP = crypto.createHash('sha256').update(otp).digest('hex');
  user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save({ validateBeforeSave: false });

  // 6. Send OTP via email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset OTP - JUMLAYA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${user.firstname}</strong>,</p>
              <p>We received a request to reset your password. Use the OTP code below to reset your password:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <p style="margin-top: 10px; color: #6b7280;">This OTP is valid for 10 minutes</p>
              </div>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <p style="margin: 5px 0 0 0;">If you didn't request this password reset, please ignore this email or contact support immediately.</p>
              </div>

              <p style="margin-top: 20px;">
                <strong>Best regards,</strong><br>
                JUMLAYA Team
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} JUMLAYA. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Password reset OTP sent to your email',
      data: {
        email: user.email,
        expiresIn: '10 minutes'
      }
    });

  } catch (error) {
    // If email sending fails, remove OTP from database
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.error('Email sending error:', error);
    return next(new AppError('Error sending email. Please try again later.', 500));
  }
});

// =====================================================
// @desc    Reset Password with OTP
// @route   POST /api/password/reset
// @access  Public
// =====================================================
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  // 1. Validate inputs
  if (!email || !otp || !newPassword) {
    return next(new AppError('Please provide email, OTP, and new password', 400));
  }

  // 2. Validate password strength
  if (newPassword.length < 8) {
    return next(new AppError('Password must be at least 8 characters long', 400));
  }

  // 3. Hash the OTP
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

  // 4. Find user with valid OTP
  const user = await User.findOne({
    email: email.toLowerCase(),
    resetPasswordOTP: hashedOTP,
    resetPasswordOTPExpires: { $gt: Date.now() }
  }).select('+password');

  if (!user) {
    return next(new AppError('Invalid or expired OTP', 400));
  }

  // 5. Update password
  user.password = newPassword;
  user.resetPasswordOTP = undefined;
  user.resetPasswordOTPExpires = undefined;
  await user.save();

  // 6. Send confirmation email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Successful - JUMLAYA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Password Reset Successful</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${user.firstname}</strong>,</p>
              
              <div class="success-box">
                <p style="margin: 0;"><strong>✓ Your password has been successfully reset!</strong></p>
              </div>

              <p>You can now log in to your account using your new password.</p>

              <p style="margin-top: 20px;">
                If you did not perform this action, please contact our support team immediately.
              </p>

              <p style="margin-top: 30px;">
                <strong>Best regards,</strong><br>
                JUMLAYA Team
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} JUMLAYA. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
  } catch (error) {
    console.error('Confirmation email error:', error);
    // Don't fail the request if confirmation email fails
  }

  res.status(200).json({
    success: true,
    message: 'Password reset successful. You can now login with your new password.',
  });
});

// =====================================================
// @desc    Resend OTP
// @route   POST /api/password/resend-otp
// @access  Public
// =====================================================
exports.resendOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide an email address', 400));
  }

  // Find user
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return next(new AppError('No user found with this email address', 404));
  }

  // Check if previous OTP is still valid (prevent spam)
  if (user.resetPasswordOTPExpires && user.resetPasswordOTPExpires > Date.now()) {
    const timeLeft = Math.ceil((user.resetPasswordOTPExpires - Date.now()) / 1000 / 60);
    return next(new AppError(`Previous OTP is still valid. Please wait ${timeLeft} minutes before requesting a new one.`, 429));
  }

  // Generate new OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  user.resetPasswordOTP = crypto.createHash('sha256').update(otp).digest('hex');
  user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  // Send OTP via email
  try {
    await sendEmail({
      email: user.email,
      subject: 'New Password Reset OTP - JUMLAYA',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔄 New OTP Code</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${user.firstname}</strong>,</p>
              <p>Here is your new OTP code:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <p style="margin-top: 10px; color: #6b7280;">Valid for 10 minutes</p>
              </div>

              <p style="margin-top: 20px;">
                <strong>Best regards,</strong><br>
                JUMLAYA Team
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email',
      data: {
        email: user.email,
        expiresIn: '10 minutes'
      }
    });

  } catch (error) {
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.error('Email sending error:', error);
    return next(new AppError('Error sending email. Please try again later.', 500));
  }
});

// =====================================================
// @desc    Verify OTP (optional - for UI validation)
// @route   POST /api/password/verify-otp
// @access  Public
// =====================================================
exports.verifyOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new AppError('Please provide email and OTP', 400));
  }

  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

  const user = await User.findOne({
    email: email.toLowerCase(),
    resetPasswordOTP: hashedOTP,
    resetPasswordOTPExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Invalid or expired OTP', 400));
  }

  res.status(200).json({
    success: true,
    message: 'OTP verified successfully',
  });
});