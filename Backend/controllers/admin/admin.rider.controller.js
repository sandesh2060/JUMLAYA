// ============================================
// Backend/controllers/admin/admin.rider.controller.js
// Admin Rider Management Controller
// ============================================
const User = require("../../models/user.model");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/AppError");
const sendEmail = require("../../utils/sendEmail");

// ============================================
// GET ALL RIDERS (with filters)
// ============================================
exports.getAllRiders = catchAsync(async (req, res, next) => {
  const { status, search, page = 1, limit = 10 } = req.query;

  // Build query
  const query = { role: "rider" };

  // Filter by approval status
  if (status === "pending") {
    query["riderProfile.isApproved"] = false;
  } else if (status === "approved") {
    query["riderProfile.isApproved"] = true;
  }

  // Search by name, email, or rider code
  if (search) {
    query.$or = [
      { firstname: { $regex: search, $options: "i" } },
      { lastname: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { "riderProfile.riderCode": { $regex: search, $options: "i" } },
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;
  const total = await User.countDocuments(query);

  // Fetch riders
  const riders = await User.find(query)
    .select("-password -refreshToken -verificationCode")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: {
      riders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// ============================================
// GET SINGLE RIDER
// ============================================
exports.getRider = catchAsync(async (req, res, next) => {
  const rider = await User.findOne({
    _id: req.params.id,
    role: "rider",
  }).select("-password -refreshToken -verificationCode");

  if (!rider) {
    return next(new AppError("Rider not found", 404));
  }

  res.status(200).json({
    success: true,
    data: { rider },
  });
});

// ============================================
// APPROVE RIDER
// ============================================
exports.approveRider = catchAsync(async (req, res, next) => {
  const rider = await User.findOne({
    _id: req.params.id,
    role: "rider",
  });

  if (!rider) {
    return next(new AppError("Rider not found", 404));
  }

  if (rider.riderProfile.isApproved) {
    return next(new AppError("Rider is already approved", 400));
  }

  // Update approval status
  rider.riderProfile.isApproved = true;
  rider.riderProfile.approvedBy = req.user.id;
  rider.riderProfile.approvedAt = new Date();
  rider.riderProfile.status = "offline"; // Ready to go online
  await rider.save({ validateBeforeSave: false });

  // Send approval email
  try {
    await sendEmail({
      to: rider.email,
      subject: "🎉 Congratulations! Your Rider Account is Approved",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
          <div style="background: white; padding: 30px; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #10b981; margin: 0; font-size: 32px;">🎉 Congratulations!</h1>
            </div>
            
            <div style="margin-bottom: 25px;">
              <p style="font-size: 16px; color: #333; line-height: 1.6;">
                Dear <strong>${rider.firstname} ${rider.lastname}</strong>,
              </p>
              <p style="font-size: 16px; color: #333; line-height: 1.6;">
                Great news! Your rider account has been <strong style="color: #10b981;">approved</strong> and is now active!
              </p>
            </div>

            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h3 style="color: #059669; margin: 0 0 10px 0; font-size: 18px;">Your Rider Details:</h3>
              <p style="margin: 5px 0; color: #065f46;"><strong>Rider Code:</strong> ${rider.riderProfile.riderCode}</p>
              <p style="margin: 5px 0; color: #065f46;"><strong>Vehicle:</strong> ${rider.riderProfile.vehicleType} - ${rider.riderProfile.vehicleNumber}</p>
              <p style="margin: 5px 0; color: #065f46;"><strong>License:</strong> ${rider.riderProfile.licenseNumber}</p>
            </div>

            <div style="margin: 25px 0;">
              <h3 style="color: #333; font-size: 18px; margin-bottom: 15px;">🚀 Next Steps:</h3>
              <ol style="color: #555; line-height: 2; padding-left: 20px;">
                <li>Login to your rider dashboard</li>
                <li>Set your status to "Active" to start receiving orders</li>
                <li>Review delivery guidelines and best practices</li>
                <li>Start earning with deliveries!</li>
              </ol>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/rider/dashboard" 
                 style="display: inline-block; background: #10b981; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Go to Rider Dashboard
              </a>
            </div>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>📝 Important:</strong> Please maintain a professional attitude, ensure timely deliveries, and follow all traffic rules for a safe riding experience.
              </p>
            </div>

            <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                Need help? Contact us at <a href="mailto:support@jumlaya.com" style="color: #667eea;">support@jumlaya.com</a>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0 0;">
                This is an automated message from JUMLAYA Delivery System.
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
Congratulations ${rider.firstname}!

Your rider account has been approved!

Rider Code: ${rider.riderProfile.riderCode}
Vehicle: ${rider.riderProfile.vehicleType} - ${rider.riderProfile.vehicleNumber}
License: ${rider.riderProfile.licenseNumber}

Login to your dashboard and start accepting deliveries!

Best regards,
JUMLAYA Team
      `,
    });

    console.log("✅ Approval email sent to:", rider.email);
  } catch (emailError) {
    console.error("❌ Failed to send approval email:", emailError);
    // Don't fail the request if email fails
  }

  res.status(200).json({
    success: true,
    message: "Rider approved successfully",
    data: { rider },
  });
});

// ============================================
// REJECT RIDER
// ============================================
exports.rejectRider = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  
  const rider = await User.findOne({
    _id: req.params.id,
    role: "rider",
  });

  if (!rider) {
    return next(new AppError("Rider not found", 404));
  }

  if (rider.riderProfile.isApproved) {
    return next(new AppError("Cannot reject an approved rider", 400));
  }

  // Send rejection email
  try {
    await sendEmail({
      to: rider.email,
      subject: "Rider Application Status - Action Required",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: white; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <div style="text-align: center; margin-bottom: 25px;">
              <h1 style="color: #ef4444; margin: 0; font-size: 28px;">Rider Application Update</h1>
            </div>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Dear <strong>${rider.firstname} ${rider.lastname}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Thank you for your interest in becoming a delivery rider with JUMLAYA.
            </p>

            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0; color: #991b1b; font-size: 15px;">
                Unfortunately, we need additional information or corrections before we can approve your application.
              </p>
            </div>

            ${reason ? `
              <div style="background: #f9fafb; padding: 15px; margin: 20px 0; border-radius: 6px;">
                <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 13px; font-weight: 600;">REASON:</p>
                <p style="margin: 0; color: #374151; font-size: 15px;">${reason}</p>
              </div>
            ` : ''}

            <div style="margin: 25px 0;">
              <h3 style="color: #333; font-size: 18px; margin-bottom: 15px;">📋 Next Steps:</h3>
              <ul style="color: #555; line-height: 2; padding-left: 20px;">
                <li>Review the reason provided above</li>
                <li>Update your information or documents</li>
                <li>Resubmit your application</li>
                <li>Contact support if you have questions</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/register?role=rider" 
                 style="display: inline-block; background: #3b82f6; color: white; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Update Application
              </a>
            </div>

            <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
                Questions? Contact us at <a href="mailto:support@jumlaya.com" style="color: #3b82f6;">support@jumlaya.com</a>
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
Dear ${rider.firstname},

Thank you for your interest in becoming a JUMLAYA delivery rider.

We need additional information before approving your application.

${reason ? `Reason: ${reason}` : ''}

Please review and update your application.

Contact us at support@jumlaya.com if you have questions.

Best regards,
JUMLAYA Team
      `,
    });

    console.log("✅ Rejection email sent to:", rider.email);
  } catch (emailError) {
    console.error("❌ Failed to send rejection email:", emailError);
  }

  // Delete rider account (or you can keep it and add a rejection flag)
  await User.findByIdAndDelete(rider._id);

  res.status(200).json({
    success: true,
    message: "Rider application rejected and email sent",
  });
});

// ============================================
// GET RIDER STATS
// ============================================
exports.getRiderStats = catchAsync(async (req, res, next) => {
  const [
    totalRiders,
    pendingRiders,
    approvedRiders,
    activeRiders,
  ] = await Promise.all([
    User.countDocuments({ role: "rider" }),
    User.countDocuments({ role: "rider", "riderProfile.isApproved": false }),
    User.countDocuments({ role: "rider", "riderProfile.isApproved": true }),
    User.countDocuments({ role: "rider", "riderProfile.status": "active" }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalRiders,
      pendingRiders,
      approvedRiders,
      activeRiders,
      offlineRiders: approvedRiders - activeRiders,
    },
  });
});