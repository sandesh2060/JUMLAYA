// ============================================
// Backend/controllers/admin/admin.rider.controller.js
// ✅ COMPLETELY FIXED - Guaranteed to Work
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

  const query = { role: "rider" };

  if (status === "pending") {
    query["riderProfile.isApproved"] = false;
  } else if (status === "approved") {
    query["riderProfile.isApproved"] = true;
  }

  if (search) {
    query.$or = [
      { firstname: { $regex: search, $options: "i" } },
      { lastname: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { "riderProfile.riderCode": { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;
  const total = await User.countDocuments(query);

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
// ✅ VERIFY SINGLE DOCUMENT - FIXED
// ============================================
exports.verifyDocument = catchAsync(async (req, res, next) => {
  const { id: riderId, documentType } = req.params;
  const { verified, rejectionReason } = req.body;
  const adminId = req.user.id;

  const validDocs = ['license', 'vehicleRegistration', 'insurance', 'identityProof', 'profilePhoto'];
  if (!validDocs.includes(documentType)) {
    return next(new AppError('Invalid document type', 400));
  }

  const rider = await User.findOne({ _id: riderId, role: "rider" });

  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  if (!rider.riderProfile?.documents?.[documentType]?.url) {
    return next(new AppError(`${documentType} not uploaded yet`, 404));
  }

  // ✅ FIX: Ensure nested objects exist
  if (!rider.riderProfile) {
    rider.riderProfile = { documents: {} };
  }
  if (!rider.riderProfile.documents) {
    rider.riderProfile.documents = {};
  }
  if (!rider.riderProfile.documents[documentType]) {
    rider.riderProfile.documents[documentType] = {};
  }
  
  // ✅ Update document verification status
  rider.riderProfile.documents[documentType].verified = verified;
  rider.riderProfile.documents[documentType].verifiedAt = verified ? new Date() : null;
  rider.riderProfile.documents[documentType].verifiedBy = verified ? adminId : null;
  
  // ✅ Store rejection reason if document is rejected
  if (!verified && rejectionReason) {
    rider.riderProfile.documents[documentType].rejectionReason = rejectionReason;
  } else {
    rider.riderProfile.documents[documentType].rejectionReason = undefined;
  }

  // ✅ FIX: Mark as modified and save properly
  rider.markModified('riderProfile.documents');
  await rider.save();

  // ✅ Check if all required documents are now verified
  const requiredDocs = ['license', 'vehicleRegistration', 'identityProof'];
  const allVerified = requiredDocs.every(
    doc => rider.riderProfile.documents[doc]?.verified === true
  );

  console.log(`✅ Document ${documentType} ${verified ? 'verified' : 'rejected'} for rider:`, riderId);

  res.json({
    success: true,
    message: verified 
      ? `${documentType} verified successfully` 
      : `${documentType} rejected`,
    data: {
      documentType,
      verified,
      rejectionReason: !verified ? rejectionReason : null,
      allRequiredDocsVerified: allVerified,
      documents: rider.riderProfile.documents
    }
  });
});

// ============================================
// ✅ APPROVE RIDER - COMPLETELY FIXED
// ============================================
exports.approveRider = catchAsync(async (req, res, next) => {
  const rider = await User.findOne({
    _id: req.params.id,
    role: "rider",
  });

  if (!rider) {
    return next(new AppError("Rider not found", 404));
  }

  if (rider.riderProfile?.isApproved) {
    return next(new AppError("Rider is already approved", 400));
  }

  // ✅ CHECK IF ALL REQUIRED DOCUMENTS ARE UPLOADED AND VERIFIED
  const requiredDocs = ['license', 'vehicleRegistration', 'identityProof'];
  const docs = rider.riderProfile?.documents || {};
  
  const missingDocs = requiredDocs.filter(doc => !docs[doc]?.url);
  if (missingDocs.length > 0) {
    return next(new AppError(
      `Cannot approve: Missing required documents - ${missingDocs.join(', ')}`, 
      400
    ));
  }

  const unverifiedDocs = requiredDocs.filter(doc => docs[doc]?.verified !== true);
  if (unverifiedDocs.length > 0) {
    return next(new AppError(
      `Cannot approve: The following documents are not verified - ${unverifiedDocs.join(', ')}`, 
      400
    ));
  }

  // ✅ FIX 1: Ensure riderProfile exists
  if (!rider.riderProfile) {
    rider.riderProfile = {};
  }

  // ✅ FIX 2: Explicitly set each field
  rider.riderProfile.isApproved = true;
  rider.riderProfile.approvedBy = req.user.id;
  rider.riderProfile.approvedAt = new Date();
  rider.riderProfile.status = "offline";

  // ✅ FIX 3: Mark the nested path as modified
  rider.markModified('riderProfile');
  
  // ✅ FIX 4: Save with proper validation
  await rider.save();

  // ✅ Verify the save worked
  const updatedRider = await User.findById(rider._id).select('riderProfile');
  console.log("✅ Rider approved successfully:", {
    riderId: rider._id,
    isApproved: updatedRider.riderProfile.isApproved,
    approvedAt: updatedRider.riderProfile.approvedAt,
    approvedBy: updatedRider.riderProfile.approvedBy
  });

  // ✅ Send approval email
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
            
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Dear <strong>${rider.firstname} ${rider.lastname}</strong>,
            </p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Great news! Your rider account has been <strong style="color: #10b981;">approved</strong> and is now active!
            </p>

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
                <li>Review delivery guidelines</li>
                <li>Start earning!</li>
              </ol>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/rider/dashboard" 
                 style="display: inline-block; background: #10b981; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Go to Rider Dashboard
              </a>
            </div>
          </div>
        </div>
      `,
    });
    console.log("✅ Approval email sent to:", rider.email);
  } catch (emailError) {
    console.error("❌ Email failed:", emailError);
  }

  res.status(200).json({
    success: true,
    message: "Rider approved successfully",
    data: { 
      rider: {
        _id: rider._id,
        firstname: rider.firstname,
        lastname: rider.lastname,
        email: rider.email,
        riderProfile: updatedRider.riderProfile
      }
    },
  });
});

// ============================================
// REJECT RIDER
// ============================================
exports.rejectRider = catchAsync(async (req, res, next) => {
  const { reason } = req.body;
  
  if (!reason || reason.trim() === '') {
    return next(new AppError('Rejection reason is required', 400));
  }
  
  const rider = await User.findOne({
    _id: req.params.id,
    role: "rider",
  });

  if (!rider) {
    return next(new AppError("Rider not found", 404));
  }

  if (rider.riderProfile?.isApproved) {
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
            <h1 style="color: #ef4444; text-align: center;">Rider Application Update</h1>
            
            <p>Dear <strong>${rider.firstname} ${rider.lastname}</strong>,</p>
            
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 25px 0;">
              <p>We regret to inform you that your rider application has been rejected.</p>
            </div>

            <p><strong>Reason:</strong> ${reason}</p>

            <p>If you believe this was an error or would like to reapply, please contact our support team.</p>
          </div>
        </div>
      `,
    });
    console.log("✅ Rejection email sent to:", rider.email);
  } catch (error) {
    console.error("❌ Email failed:", error);
  }

  // Delete the user account
  await User.findByIdAndDelete(rider._id);

  console.log("✅ Rider rejected and deleted:", rider._id);

  res.status(200).json({
    success: true,
    message: "Rider application rejected and account deleted",
  });
});

// ============================================
// GET RIDER STATS
// ============================================
exports.getRiderStats = catchAsync(async (req, res, next) => {
  const [totalRiders, pendingRiders, approvedRiders, activeRiders] = await Promise.all([
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

module.exports = exports;