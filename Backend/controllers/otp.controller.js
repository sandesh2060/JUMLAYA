const User = require("../models/user.model");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

// =======================
// SEND OTP
// =======================
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified. Please login.",
      });
    }

    // Generate plain OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before storing
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
    user.verificationCode = hashedOTP;
    user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save to database
    await user.save({ validateBeforeSave: false });

    // Send OTP Email (Professional UI)
    try {
      await sendEmail({
        to: email,
        subject: "Your OTP Code - Jumlaya",
        html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color:#f3f4f6;">
      <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; padding:30px; box-shadow:0 10px 25px rgba(0,0,0,0.1);">
        <h1 style="color:#16a34a;">JUMLAYA</h1>
        <p>Hello ${user.firstname},</p>
        <p>Your verification code is:</p>
        <div style="text-align:center; font-size:36px; font-weight:bold; letter-spacing:8px; color:#16a34a; background:#ecfdf5; padding:18px; border-radius:10px;">
          ${otp}
        </div>
        <p>This OTP will expire in <strong>10 minutes</strong>.</p>
        <p style="color:#6b7280; font-size:14px;">If you did not request this code, please ignore this email.</p>
        <hr />
        <p style="color:#9ca3af; font-size:12px;">© ${new Date().getFullYear()} Jumlaya. All rights reserved.</p>
      </div>
    </div>
  `,
      });

      return res.status(200).json({
        success: true,
        message: "OTP sent to your email successfully",
      });
    } catch (emailError) {
      console.error("Email Send Error:", emailError);

      // Clear OTP fields if email fails
      user.verificationCode = undefined;
      user.verificationCodeExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again.",
      });
    }
  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP. Please try again later.",
    });
  }
};

// =======================
// VERIFY OTP
// =======================
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be a 6-digit number",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified. Please login.",
      });
    }

    // Check if OTP exists
    if (!user.verificationCode || !user.verificationCodeExpires) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new one.",
      });
    }

    // Check if OTP expired
    if (user.verificationCodeExpires < Date.now()) {
      user.verificationCode = undefined;
      user.verificationCodeExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Hash the provided OTP and compare
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    if (user.verificationCode !== hashedOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    // ✅ Verify user - set both flags
    user.isVerified = true;
    user.isActive = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message:
        "OTP verified successfully! Your account is now active and verified.",
      data: {
        email: user.email,
        isVerified: user.isVerified,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "OTP verification failed. Please try again.",
    });
  }
};

// =======================
// RESEND OTP (Optional - if you need this endpoint)
// =======================
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified. Please login.",
      });
    }

    // Generate new plain OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP before storing
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
    user.verificationCode = hashedOTP;
    user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Send OTP Email
    try {
      await sendEmail({
        to: email,
        subject: "Resend OTP Code - Jumlaya",
        html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color:#f3f4f6;">
      <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; padding:30px; box-shadow:0 10px 25px rgba(0,0,0,0.1);">
        <h1 style="color:#16a34a;">JUMLAYA</h1>
        <p>Hello ${user.firstname},</p>
        <p>You requested a new verification code:</p>
        <div style="text-align:center; font-size:36px; font-weight:bold; letter-spacing:8px; color:#16a34a; background:#ecfdf5; padding:18px; border-radius:10px;">
          ${otp}
        </div>
        <p>This OTP will expire in <strong>10 minutes</strong>.</p>
        <p style="color:#6b7280; font-size:14px;">If you did not request this code, please ignore this email.</p>
        <hr />
        <p style="color:#9ca3af; font-size:12px;">© ${new Date().getFullYear()} Jumlaya. All rights reserved.</p>
      </div>
    </div>
  `,
      });

      return res.status(200).json({
        success: true,
        message: "New OTP sent to your email successfully",
      });
    } catch (emailError) {
      console.error("Email Send Error:", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again.",
      });
    }
  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP. Please try again later.",
    });
  }
};
