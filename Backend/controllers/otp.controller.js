// // ============================================
// // Backend/controllers/otp.controller.js (PRODUCTION-READY)
// // ============================================

// const User = require("../models/user.model");
// const sendEmail = require("../utils/sendEmail");
// const crypto = require("crypto");

// const isProduction = process.env.NODE_ENV === "production";

// // =======================
// // SEND OTP
// // =======================
// exports.sendOTP = async (req, res) => {
//   try {
//     const { email } = req.body;

//     // Validation
//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid email format",
//       });
//     }

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "No account found with this email address",
//       });
//     }

//     // Check if user is already verified
//     if (user.isVerified) {
//       return res.status(400).json({
//         success: false,
//         message: "Your account is already verified. Please login.",
//       });
//     }

//     // Rate limiting: Check if OTP was sent recently (prevent spam)
//     if (user.verificationCodeExpires && user.verificationCodeExpires > Date.now()) {
//       const remainingTime = Math.ceil((user.verificationCodeExpires - Date.now()) / 1000 / 60);
      
//       // If less than 9 minutes remaining, don't allow resend (wait at least 1 minute)
//       if (remainingTime > 9) {
//         return res.status(429).json({
//           success: false,
//           message: `Please wait ${remainingTime} minutes before requesting a new OTP`,
//         });
//       }
//     }

//     // Generate plain OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     // Hash OTP before storing (security best practice)
//     const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
//     user.verificationCode = hashedOTP;
//     user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

//     // Save to database
//     await user.save({ validateBeforeSave: false });

//     // Log OTP attempt (don't log OTP itself in production)
//     if (!isProduction) {
//       console.log(`📧 OTP Generated for ${email}: ${otp}`);
//     } else {
//       console.log(`📧 OTP sent to ${email}`);
//     }

//     // Send OTP Email (Professional UI)
//     try {
//       await sendEmail({
//         to: email,
//         subject: "🔐 Your Verification Code - JUMLAYA",
//         html: `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>JUMLAYA - Verification Code</title>
// </head>
// <body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color:#f3f4f6;">
//   <div style="max-width:600px; margin:0 auto; padding:20px;">
//     <div style="background:#ffffff; border-radius:16px; padding:40px; box-shadow:0 10px 25px rgba(0,0,0,0.08);">
//       <!-- Header -->
//       <div style="text-align:center; margin-bottom:30px;">
//         <h1 style="color:#16a34a; margin:0; font-size:32px; font-weight:700;">JUMLAYA</h1>
//         <p style="color:#6b7280; margin:10px 0 0 0; font-size:14px;">Organic Fresh Products</p>
//       </div>
      
//       <!-- Content -->
//       <div style="text-align:center;">
//         <h2 style="color:#1f2937; margin:0 0 20px 0; font-size:24px; font-weight:600;">Email Verification</h2>
//         <p style="color:#4b5563; margin:0 0 30px 0; font-size:16px; line-height:1.6;">
//           Hello ${user.firstname || 'there'},<br>
//           Please use the verification code below to complete your registration:
//         </p>
        
//         <!-- OTP Box -->
//         <div style="background:linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border:2px solid #16a34a; border-radius:12px; padding:30px; margin:0 0 30px 0;">
//           <div style="font-size:48px; font-weight:700; letter-spacing:12px; color:#16a34a; font-family:'Courier New', monospace;">
//             ${otp}
//           </div>
//         </div>
        
//         <!-- Expiry Info -->
//         <div style="background:#fef3c7; border-left:4px solid #f59e0b; border-radius:8px; padding:16px; margin:0 0 30px 0; text-align:left;">
//           <p style="margin:0; color:#92400e; font-size:14px;">
//             <strong>⏰ This code expires in 10 minutes</strong><br>
//             <span style="color:#78350f;">For security reasons, please do not share this code with anyone.</span>
//           </p>
//         </div>
        
//         <!-- Security Notice -->
//         <div style="text-align:left; padding:20px; background:#f9fafb; border-radius:8px;">
//           <p style="margin:0 0 10px 0; color:#374151; font-size:14px; font-weight:600;">
//             🔒 Security Tips:
//           </p>
//           <ul style="margin:0; padding-left:20px; color:#6b7280; font-size:13px; line-height:1.8;">
//             <li>Never share your verification code</li>
//             <li>JUMLAYA staff will never ask for your OTP</li>
//             <li>If you didn't request this code, please ignore this email</li>
//           </ul>
//         </div>
//       </div>
      
//       <!-- Footer -->
//       <div style="margin-top:40px; padding-top:30px; border-top:1px solid #e5e7eb; text-align:center;">
//         <p style="margin:0 0 10px 0; color:#9ca3af; font-size:12px;">
//           Need help? Contact us at <a href="mailto:${process.env.EMAIL_USER}" style="color:#16a34a; text-decoration:none;">support@jumlaya.com</a>
//         </p>
//         <p style="margin:0; color:#d1d5db; font-size:11px;">
//           © ${new Date().getFullYear()} JUMLAYA. All rights reserved.
//         </p>
//       </div>
//     </div>
    
//     <!-- Email Footer -->
//     <div style="text-align:center; margin-top:20px;">
//       <p style="color:#9ca3af; font-size:12px; margin:0;">
//         This is an automated email. Please do not reply to this message.
//       </p>
//     </div>
//   </div>
// </body>
// </html>
//         `,
//       });

//       return res.status(200).json({
//         success: true,
//         message: "Verification code sent to your email successfully",
//         data: {
//           email: email,
//           expiresIn: "10 minutes",
//         },
//       });
      
//     } catch (emailError) {
//       console.error("❌ Email Send Error:", emailError.message);

//       // Clear OTP fields if email fails
//       user.verificationCode = undefined;
//       user.verificationCodeExpires = undefined;
//       await user.save({ validateBeforeSave: false });

//       return res.status(500).json({
//         success: false,
//         message: "Failed to send verification email. Please try again or contact support.",
//         error: isProduction ? undefined : emailError.message,
//       });
//     }
    
//   } catch (error) {
//     console.error("❌ Send OTP Error:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong. Please try again later.",
//       error: isProduction ? undefined : error.message,
//     });
//   }
// };

// // =======================
// // VERIFY OTP
// // =======================
// exports.verifyOTP = async (req, res) => {
//   try {
//     const { email, otp } = req.body;

//     // Validation
//     if (!email || !otp) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and verification code are required",
//       });
//     }

//     // Validate OTP format (6 digits)
//     if (!/^\d{6}$/.test(otp)) {
//       return res.status(400).json({
//         success: false,
//         message: "Verification code must be a 6-digit number",
//       });
//     }

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "No account found with this email address",
//       });
//     }

//     // Check if already verified
//     if (user.isVerified) {
//       return res.status(400).json({
//         success: false,
//         message: "Your account is already verified. Please login to continue.",
//       });
//     }

//     // Check if OTP exists
//     if (!user.verificationCode || !user.verificationCodeExpires) {
//       return res.status(400).json({
//         success: false,
//         message: "No verification code found. Please request a new one.",
//       });
//     }

//     // Check if OTP expired
//     if (user.verificationCodeExpires < Date.now()) {
//       user.verificationCode = undefined;
//       user.verificationCodeExpires = undefined;
//       await user.save({ validateBeforeSave: false });

//       return res.status(400).json({
//         success: false,
//         message: "Verification code has expired. Please request a new one.",
//         expired: true,
//       });
//     }

//     // Hash the provided OTP and compare
//     const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

//     if (user.verificationCode !== hashedOTP) {
//       // Log failed attempts (for security monitoring)
//       if (isProduction) {
//         console.warn(`⚠️  Failed OTP attempt for ${email}`);
//       }
      
//       return res.status(400).json({
//         success: false,
//         message: "Invalid verification code. Please check and try again.",
//       });
//     }

//     // ✅ SUCCESS: Verify user - set both flags
//     user.isVerified = true;
//     user.isActive = true;
//     user.verificationCode = undefined;
//     user.verificationCodeExpires = undefined;

//     await user.save({ validateBeforeSave: false });

//     console.log(`✅ User verified successfully: ${email}`);

//     // Send welcome email (optional)
//     try {
//       await sendEmail({
//         to: email,
//         subject: "🎉 Welcome to JUMLAYA!",
//         html: `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Welcome to JUMLAYA</title>
// </head>
// <body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color:#f3f4f6;">
//   <div style="max-width:600px; margin:0 auto; padding:20px;">
//     <div style="background:#ffffff; border-radius:16px; padding:40px; box-shadow:0 10px 25px rgba(0,0,0,0.08);">
//       <div style="text-align:center;">
//         <h1 style="color:#16a34a; margin:0 0 10px 0; font-size:36px;">🎉</h1>
//         <h2 style="color:#1f2937; margin:0 0 20px 0; font-size:28px; font-weight:700;">Welcome to JUMLAYA!</h2>
//         <p style="color:#4b5563; font-size:16px; line-height:1.6; margin:0 0 30px 0;">
//           Hi ${user.firstname},<br><br>
//           Your account has been successfully verified! You're now part of the JUMLAYA family. 🌱
//         </p>
        
//         <div style="background:#ecfdf5; border-radius:12px; padding:30px; margin:0 0 30px 0;">
//           <p style="color:#16a34a; font-size:18px; font-weight:600; margin:0 0 15px 0;">
//             Start shopping for fresh organic products!
//           </p>
//           <a href="${process.env.FRONTEND_URL}/products" style="display:inline-block; background:#16a34a; color:#ffffff; text-decoration:none; padding:14px 32px; border-radius:8px; font-weight:600; font-size:16px;">
//             Browse Products
//           </a>
//         </div>
        
//         <p style="color:#6b7280; font-size:14px; line-height:1.6;">
//           If you have any questions, feel free to reach out to our support team.
//         </p>
//       </div>
      
//       <div style="margin-top:40px; padding-top:30px; border-top:1px solid #e5e7eb; text-align:center;">
//         <p style="margin:0; color:#9ca3af; font-size:12px;">
//           © ${new Date().getFullYear()} JUMLAYA. All rights reserved.
//         </p>
//       </div>
//     </div>
//   </div>
// </body>
// </html>
//         `,
//       });
//     } catch (emailError) {
//       // Don't fail verification if welcome email fails
//       console.error("⚠️  Welcome email failed:", emailError.message);
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Email verified successfully! Your account is now active.",
//       data: {
//         email: user.email,
//         firstname: user.firstname,
//         isVerified: user.isVerified,
//         isActive: user.isActive,
//       },
//     });
    
//   } catch (error) {
//     console.error("❌ Verify OTP Error:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Verification failed. Please try again.",
//       error: isProduction ? undefined : error.message,
//     });
//   }
// };

// // =======================
// // RESEND OTP
// // =======================
// exports.resendOTP = async (req, res) => {
//   try {
//     const { email } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     // Validate email format
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid email format",
//       });
//     }

//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "No account found with this email address",
//       });
//     }

//     if (user.isVerified) {
//       return res.status(400).json({
//         success: false,
//         message: "Your account is already verified. Please login.",
//       });
//     }

//     // Rate limiting: Prevent resend spam (must wait at least 1 minute)
//     if (user.verificationCodeExpires) {
//       const timeSinceLastOTP = 10 * 60 * 1000 - (user.verificationCodeExpires - Date.now());
//       const waitTime = 60 * 1000; // 1 minute
      
//       if (timeSinceLastOTP < waitTime) {
//         const remainingSeconds = Math.ceil((waitTime - timeSinceLastOTP) / 1000);
//         return res.status(429).json({
//           success: false,
//           message: `Please wait ${remainingSeconds} seconds before requesting a new code`,
//         });
//       }
//     }

//     // Generate new plain OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();

//     // Hash OTP before storing
//     const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
//     user.verificationCode = hashedOTP;
//     user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

//     await user.save({ validateBeforeSave: false });

//     // Log resend attempt
//     if (!isProduction) {
//       console.log(`🔄 OTP Resent for ${email}: ${otp}`);
//     } else {
//       console.log(`🔄 OTP resent to ${email}`);
//     }

//     // Send OTP Email
//     try {
//       await sendEmail({
//         to: email,
//         subject: "🔐 New Verification Code - JUMLAYA",
//         html: `
// <!DOCTYPE html>
// <html>
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>JUMLAYA - New Verification Code</title>
// </head>
// <body style="margin:0; padding:0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color:#f3f4f6;">
//   <div style="max-width:600px; margin:0 auto; padding:20px;">
//     <div style="background:#ffffff; border-radius:16px; padding:40px; box-shadow:0 10px 25px rgba(0,0,0,0.08);">
//       <div style="text-align:center; margin-bottom:30px;">
//         <h1 style="color:#16a34a; margin:0; font-size:32px; font-weight:700;">JUMLAYA</h1>
//         <p style="color:#6b7280; margin:10px 0 0 0; font-size:14px;">Organic Fresh Products</p>
//       </div>
      
//       <div style="text-align:center;">
//         <h2 style="color:#1f2937; margin:0 0 20px 0; font-size:24px; font-weight:600;">New Verification Code</h2>
//         <p style="color:#4b5563; margin:0 0 30px 0; font-size:16px; line-height:1.6;">
//           Hello ${user.firstname || 'there'},<br>
//           You requested a new verification code. Here it is:
//         </p>
        
//         <div style="background:linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border:2px solid #16a34a; border-radius:12px; padding:30px; margin:0 0 30px 0;">
//           <div style="font-size:48px; font-weight:700; letter-spacing:12px; color:#16a34a; font-family:'Courier New', monospace;">
//             ${otp}
//           </div>
//         </div>
        
//         <div style="background:#fef3c7; border-left:4px solid #f59e0b; border-radius:8px; padding:16px; margin:0 0 20px 0; text-align:left;">
//           <p style="margin:0; color:#92400e; font-size:14px;">
//             <strong>⏰ This code expires in 10 minutes</strong>
//           </p>
//         </div>
        
//         <p style="color:#6b7280; font-size:13px; margin:0;">
//           If you didn't request this code, please ignore this email.
//         </p>
//       </div>
      
//       <div style="margin-top:40px; padding-top:30px; border-top:1px solid #e5e7eb; text-align:center;">
//         <p style="margin:0; color:#d1d5db; font-size:11px;">
//           © ${new Date().getFullYear()} JUMLAYA. All rights reserved.
//         </p>
//       </div>
//     </div>
//   </div>
// </body>
// </html>
//         `,
//       });

//       return res.status(200).json({
//         success: true,
//         message: "New verification code sent to your email successfully",
//         data: {
//           email: email,
//           expiresIn: "10 minutes",
//         },
//       });
      
//     } catch (emailError) {
//       console.error("❌ Email Send Error:", emailError.message);
      
//       return res.status(500).json({
//         success: false,
//         message: "Failed to send verification email. Please try again.",
//         error: isProduction ? undefined : emailError.message,
//       });
//     }
    
//   } catch (error) {
//     console.error("❌ Resend OTP Error:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to resend verification code. Please try again later.",
//       error: isProduction ? undefined : error.message,
//     });
//   }
// };


// ============================================
// Backend/controllers/otp.controller.js
// 🚫 EMAIL DISABLED TEMPORARILY
// OTP is returned in API response for testing
// ============================================

const User = require("../models/user.model");
// const sendEmail = require("../utils/sendEmail"); // 🚫 DISABLED
const crypto = require("crypto");

const isProduction = process.env.NODE_ENV === "production";

// =======================
// SEND OTP
// =======================
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email address" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Your account is already verified. Please login." });
    }

    // Rate limiting
    if (user.verificationCodeExpires && user.verificationCodeExpires > Date.now()) {
      const remainingTime = Math.ceil((user.verificationCodeExpires - Date.now()) / 1000 / 60);
      if (remainingTime > 9) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingTime} minutes before requesting a new OTP`,
        });
      }
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
    user.verificationCode = hashedOTP;
    user.verificationCodeExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    // 🚫 EMAIL DISABLED - log OTP to console instead
    console.log(`📧 [EMAIL DISABLED] OTP for ${email}: ${otp}`);

    // 🚧 Return OTP in response so you can test without email
    return res.status(200).json({
      success: true,
      message: "Verification code generated (email disabled - see dev_otp field)",
      data: {
        email: email,
        expiresIn: "10 minutes",
        dev_otp: otp, // ⚠️ REMOVE THIS IN PRODUCTION
      },
    });

  } catch (error) {
    console.error("❌ Send OTP Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
      error: isProduction ? undefined : error.message,
    });
  }
};

// =======================
// VERIFY OTP
// =======================
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and verification code are required" });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ success: false, message: "Verification code must be a 6-digit number" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email address" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Your account is already verified. Please login." });
    }

    if (!user.verificationCode || !user.verificationCodeExpires) {
      return res.status(400).json({ success: false, message: "No verification code found. Please request a new one." });
    }

    if (user.verificationCodeExpires < Date.now()) {
      user.verificationCode = undefined;
      user.verificationCodeExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ success: false, message: "Verification code has expired. Please request a new one.", expired: true });
    }

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
    if (user.verificationCode !== hashedOTP) {
      return res.status(400).json({ success: false, message: "Invalid verification code. Please check and try again." });
    }

    // ✅ Verify user
    user.isVerified = true;
    user.isActive = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });

    console.log(`✅ User verified: ${email}`);

    // 🚫 Welcome email DISABLED
    console.log(`📧 [EMAIL DISABLED] Would send welcome email to ${email}`);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully! Your account is now active.",
      data: {
        email: user.email,
        firstname: user.firstname,
        isVerified: user.isVerified,
        isActive: user.isActive,
      },
    });

  } catch (error) {
    console.error("❌ Verify OTP Error:", error.message);
    res.status(500).json({ success: false, message: "Verification failed. Please try again.", error: isProduction ? undefined : error.message });
  }
};

// =======================
// RESEND OTP
// =======================
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "No account found with this email address" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Your account is already verified. Please login." });
    }

    // Rate limiting
    if (user.verificationCodeExpires) {
      const timeSinceLastOTP = 10 * 60 * 1000 - (user.verificationCodeExpires - Date.now());
      const waitTime = 60 * 1000;
      if (timeSinceLastOTP < waitTime) {
        const remainingSeconds = Math.ceil((waitTime - timeSinceLastOTP) / 1000);
        return res.status(429).json({ success: false, message: `Please wait ${remainingSeconds} seconds before requesting a new code` });
      }
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
    user.verificationCode = hashedOTP;
    user.verificationCodeExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    // 🚫 EMAIL DISABLED
    console.log(`📧 [EMAIL DISABLED] Resend OTP for ${email}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: "New verification code generated (email disabled - see dev_otp field)",
      data: {
        email: email,
        expiresIn: "10 minutes",
        dev_otp: otp, // ⚠️ REMOVE THIS IN PRODUCTION
      },
    });

  } catch (error) {
    console.error("❌ Resend OTP Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to resend verification code.", error: isProduction ? undefined : error.message });
  }
};