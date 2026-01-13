// ============================================
// Backend/controllers/admin/admin.rider.controller.js
// ✅ PRODUCTION-READY - Complete Document Verification System
// ============================================
const User = require("../../models/user.model");
const Rider = require("../../models/rider.model");
const catchAsync = require("../../utils/catchAsync");
const AppError = require("../../utils/AppError");
const sendEmail = require("../../utils/sendEmail");

// Document type labels for better UX
const DOCUMENT_LABELS = {
  license: "Driving License",
  vehicleRegistration: "Vehicle Registration",
  insurance: "Insurance Document",
  identityProof: "Identity Proof",
  profilePhoto: "Profile Photo",
};

const VALID_DOCUMENT_TYPES = Object.keys(DOCUMENT_LABELS);

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
// ✅ VERIFY DOCUMENT - PRODUCTION-READY
// ============================================
exports.verifyDocument = catchAsync(async (req, res, next) => {
  const { id: riderId, documentType } = req.params;
  const { verified, rejectionReason, adminNote } = req.body;
  const adminId = req.user.id;
  const adminName = `${req.user.firstname} ${req.user.lastname}`;

  console.log("🔍 Document verification request:", {
    riderId,
    documentType,
    verified,
    hasRejectionReason: !!rejectionReason,
    hasAdminNote: !!adminNote,
    adminId,
  });

  // ✅ Validate document type
  if (!VALID_DOCUMENT_TYPES.includes(documentType)) {
    return next(
      new AppError(
        `Invalid document type. Must be one of: ${VALID_DOCUMENT_TYPES.join(", ")}`,
        400
      )
    );
  }

  // ✅ Validate verified field
  if (typeof verified !== "boolean") {
    return next(
      new AppError("Verified field must be a boolean (true or false)", 400)
    );
  }

  // ✅ Validate rejection reason
  if (verified === false && (!rejectionReason || rejectionReason.trim() === "")) {
    return next(
      new AppError("Rejection reason is required when rejecting a document", 400)
    );
  }

  // ✅ Find rider in User model
  const userRider = await User.findOne({ _id: riderId, role: "rider" });
  if (!userRider) {
    return next(new AppError("Rider not found in User model", 404));
  }

  // ✅ CRITICAL: Also find in Rider model
  const riderModel = await Rider.findOne({ user: riderId });
  if (!riderModel) {
    console.warn("⚠️ Rider not found in Rider model, will only update User model");
  }

  // ✅ Check if document exists
  const currentDoc = userRider.riderProfile?.documents?.[documentType];
  if (!currentDoc?.url) {
    return next(
      new AppError(`${DOCUMENT_LABELS[documentType]} has not been uploaded yet`, 404)
    );
  }

  console.log("📄 Current document status:", {
    hasUrl: !!currentDoc.url,
    currentVerified: currentDoc.verified,
    version: currentDoc.version || 1,
  });

  // ✅ Prepare update path
  const docPath = `riderProfile.documents.${documentType}`;
  const now = new Date();

  const updateFields = {
    [`${docPath}.verified`]: verified,
    [`${docPath}.verifiedAt`]: verified ? now : null,
    [`${docPath}.verifiedBy`]: verified ? adminId : null,
    [`${docPath}.rejectionReason`]: verified ? null : rejectionReason?.trim(),
    [`${docPath}.rejectedAt`]: verified ? null : now,
  };

  // ✅ Build update query
  let updateQuery = { $set: updateFields };

  // ✅ Add admin note if provided
  if (adminNote && adminNote.trim() !== "") {
    updateQuery.$push = {
      [`${docPath}.adminNotes`]: {
        note: adminNote.trim(),
        addedBy: adminId,
        addedAt: now,
      },
    };
  }

  // ✅ UPDATE USER MODEL
  const updatedUser = await User.findOneAndUpdate(
    { _id: riderId, role: "rider" },
    updateQuery,
    { new: true, runValidators: false, select: "riderProfile firstname lastname email" }
  );

  if (!updatedUser) {
    return next(new AppError("Failed to update document in User model", 500));
  }

  console.log("✅ User model updated");

  // ✅ UPDATE RIDER MODEL (if exists)
  if (riderModel) {
    const riderUpdateFields = {
      [`documents.${documentType}.verified`]: verified,
      [`documents.${documentType}.verifiedAt`]: verified ? now : null,
      [`documents.${documentType}.verifiedBy`]: verified ? adminId : null,
      [`documents.${documentType}.rejectionReason`]: verified ? null : rejectionReason?.trim(),
      [`documents.${documentType}.rejectedAt`]: verified ? null : now,
    };

    await Rider.findByIdAndUpdate(
      riderModel._id,
      { $set: riderUpdateFields },
      { new: true, runValidators: false }
    );

    console.log("✅ Rider model updated");
  }

  // ✅ Check if all required documents are verified
  const requiredDocs = ["license", "vehicleRegistration", "identityProof"];
  const docs = updatedUser.riderProfile.documents;
  const allVerified = requiredDocs.every((doc) => docs[doc]?.verified === true);

  // ✅ CRITICAL: Auto-update verification status if all docs verified
  if (allVerified && !updatedUser.riderProfile.isApproved) {
    console.log("🎉 All required documents verified - updating verification status");
    
    await User.findByIdAndUpdate(
      riderId,
      {
        $set: {
          "riderProfile.verification.isVerified": true,
          "riderProfile.verification.verifiedAt": now,
          "riderProfile.verification.verifiedBy": adminId,
        },
      }
    );

    if (riderModel) {
      await Rider.findByIdAndUpdate(
        riderModel._id,
        {
          $set: {
            "verification.isVerified": true,
            "verification.verifiedAt": now,
            "verification.verifiedBy": adminId,
          },
        }
      );
    }

    console.log("✅ Verification status updated to VERIFIED");
  }

  const verificationStatus = {
    total: requiredDocs.length,
    verified: requiredDocs.filter((doc) => docs[doc]?.verified === true).length,
    pending: requiredDocs.filter((doc) => !docs[doc]?.verified).length,
    rejected: requiredDocs.filter((doc) => docs[doc]?.verified === false).length,
  };

  console.log("📊 Overall verification status:", verificationStatus);

  const updatedDocument = updatedUser.riderProfile.documents[documentType];

  // ✅ Send notification email to rider
  let emailSent = false;
  try {
    const emailSubject = verified
      ? `✅ ${DOCUMENT_LABELS[documentType]} Verified`
      : `⚠️ ${DOCUMENT_LABELS[documentType]} Requires Attention`;

    const emailBody = verified
      ? generateVerificationEmail(
          updatedUser,
          documentType,
          adminName,
          adminNote,
          allVerified,
          now
        )
      : generateRejectionEmail(
          updatedUser,
          documentType,
          rejectionReason,
          adminNote,
          now
        );

    await sendEmail({
      to: updatedUser.email,
      subject: emailSubject,
      html: emailBody,
    });

    emailSent = true;
    console.log(`📧 Email sent to ${updatedUser.email}: ${emailSubject}`);
  } catch (emailError) {
    console.error("❌ Failed to send notification email:", {
      error: emailError.message,
      rider: updatedUser.email,
      documentType,
    });
  }

  // ✅ Log the verification action
  console.log(
    `${verified ? "✅ VERIFIED" : "❌ REJECTED"}: ${DOCUMENT_LABELS[documentType]}`,
    {
      rider: `${updatedUser.firstname} ${updatedUser.lastname}`,
      email: updatedUser.email,
      riderId,
      documentType,
      verified,
      rejectionReason: verified ? null : rejectionReason,
      adminNote: adminNote || null,
      admin: adminName,
      adminId,
      allRequiredDocsVerified: allVerified,
      verificationProgress: `${verificationStatus.verified}/${verificationStatus.total}`,
      emailSent,
      timestamp: now.toISOString(),
    }
  );

  // ✅ Return success response
  res.json({
    success: true,
    message: verified
      ? `${DOCUMENT_LABELS[documentType]} verified successfully${
          emailSent ? " - Rider has been notified via email" : ""
        }${allVerified ? " - All documents verified!" : ""}`
      : `${DOCUMENT_LABELS[documentType]} rejected${
          emailSent ? " - Rider has been notified via email" : ""
        }`,
    data: {
      documentType,
      verified,
      verifiedAt: verified ? now : null,
      rejectedAt: verified ? null : now,
      rejectionReason: verified ? null : rejectionReason,
      adminNote: adminNote || null,
      allRequiredDocsVerified: allVerified,
      verificationProgress: verificationStatus,
      updatedDocument,
      emailNotificationSent: emailSent,
    },
  });
});
// ============================================
// ✅ GET DOCUMENT HISTORY
// ============================================
exports.getDocumentHistory = catchAsync(async (req, res, next) => {
  const { id: riderId, documentType } = req.params;

  if (!VALID_DOCUMENT_TYPES.includes(documentType)) {
    return next(
      new AppError(
        `Invalid document type. Must be one of: ${VALID_DOCUMENT_TYPES.join(
          ", "
        )}`,
        400
      )
    );
  }

  const rider = await User.findOne({ _id: riderId, role: "rider" })
    .select(
      "riderProfile.documents firstname lastname email riderProfile.riderCode"
    )
    .populate(
      "riderProfile.documents.adminNotes.addedBy",
      "firstname lastname"
    );

  if (!rider) {
    return next(new AppError("Rider not found", 404));
  }

  const document = rider.riderProfile?.documents?.[documentType];
  if (!document) {
    return next(
      new AppError(`${DOCUMENT_LABELS[documentType]} not found`, 404)
    );
  }

  console.log(
    `📜 Document history requested for ${DOCUMENT_LABELS[documentType]}:`,
    {
      riderId,
      riderName: `${rider.firstname} ${rider.lastname}`,
      currentVersion: document.version || 1,
      previousVersions: document.previousVersions?.length || 0,
      adminNotes: document.adminNotes?.length || 0,
    }
  );

  res.json({
    success: true,
    data: {
      rider: {
        id: rider._id,
        name: `${rider.firstname} ${rider.lastname}`,
        email: rider.email,
        riderCode: rider.riderProfile.riderCode,
      },
      documentType: documentType,
      documentLabel: DOCUMENT_LABELS[documentType],
      current: {
        url: document.url,
        version: document.version || 1,
        uploadedAt: document.uploadedAt,
        verified: document.verified,
        verifiedAt: document.verifiedAt,
        verifiedBy: document.verifiedBy,
        rejectionReason: document.rejectionReason,
        rejectedAt: document.rejectedAt,
      },
      history: document.previousVersions || [],
      adminNotes: (document.adminNotes || []).map((note) => ({
        note: note.note,
        addedBy: note.addedBy,
        addedAt: note.addedAt,
      })),
      statistics: {
        totalVersions: (document.previousVersions?.length || 0) + 1,
        totalNotes: document.adminNotes?.length || 0,
        lastModified:
          document.verifiedAt || document.rejectedAt || document.uploadedAt,
      },
    },
  });
});

// ============================================
// ✅ EMAIL TEMPLATE: Verification Success
// ============================================
function generateVerificationEmail(
  rider,
  documentType,
  adminName,
  adminNote,
  allVerified,
  verifiedAt
) {
  const docLabel = DOCUMENT_LABELS[documentType];
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document Verified</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; line-height: 80px; font-size: 48px;">✅</div>
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Document Verified!</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Great news about your ${docLabel}</p>
        </div>
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 20px 0;">Dear <strong>${
            rider.firstname
          } ${rider.lastname}</strong>,</p>
          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 25px 0;">Excellent news! Your <strong style="color: #10b981;">${docLabel}</strong> has been reviewed and verified by our admin team.</p>
          <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <p style="margin: 0 0 10px 0; color: #065f46; font-weight: 600; font-size: 16px;">✓ Document Status: Verified</p>
            <p style="margin: 5px 0; color: #059669; font-size: 14px;"><strong>Verified by:</strong> ${adminName}</p>
            <p style="margin: 5px 0; color: #059669; font-size: 14px;"><strong>Verified on:</strong> ${verifiedAt.toLocaleString(
              "en-US",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            )}</p>
          </div>
          ${
            allVerified
              ? `
            <div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: 600; font-size: 16px;">🎉 All Required Documents Verified!</p>
              <p style="margin: 0; color: #2563eb; font-size: 14px; line-height: 1.5;">Congratulations! All your required documents have been successfully verified. Your application is now ready for final approval. We'll notify you as soon as your rider account is approved!</p>
            </div>
          `
              : `
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px 0; color: #92400e; font-weight: 600; font-size: 14px;">📋 Next Steps:</p>
              <p style="margin: 0; color: #b45309; font-size: 14px; line-height: 1.5;">Please ensure all other required documents (Driving License, Vehicle Registration, Identity Proof) are uploaded for verification.</p>
            </div>
          `
          }
          ${
            adminNote
              ? `
            <div style="background: #f3f4f6; padding: 20px; margin: 25px 0; border-radius: 4px; border-left: 4px solid #6b7280;">
              <p style="margin: 0 0 10px 0; font-weight: 600; color: #374151; font-size: 14px;">💬 Admin Note:</p>
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">${adminNote}</p>
            </div>
          `
              : ""
          }
          <div style="text-align: center; margin-top: 30px;">
            <a href="${frontendUrl}/rider/profile" style="display: inline-block; background: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Your Profile</a>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">Need help? Contact our support team at <a href="mailto:support@jumlaya.com" style="color: #10b981; text-decoration: none;">support@jumlaya.com</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============================================
// ✅ EMAIL TEMPLATE: Document Rejection
// ============================================
function generateRejectionEmail(
  rider,
  documentType,
  rejectionReason,
  adminNote,
  rejectedAt
) {
  const docLabel = DOCUMENT_LABELS[documentType];
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document Review Required</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; line-height: 80px; font-size: 48px;">⚠️</div>
          <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">Document Review Required</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Action needed for your ${docLabel}</p>
        </div>
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 20px 0;">Dear <strong>${
            rider.firstname
          } ${rider.lastname}</strong>,</p>
          <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 25px 0;">We've reviewed your <strong style="color: #ef4444;">${docLabel}</strong> and found some issues that need to be addressed before we can proceed with verification.</p>
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <p style="margin: 0 0 15px 0; color: #991b1b; font-weight: 600; font-size: 16px;">❌ Document Status: Rejected</p>
            <p style="margin: 0 0 10px 0; color: #b91c1c; font-size: 14px; font-weight: 600;">Reason for Rejection:</p>
            <div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #fecaca;">
              <p style="margin: 0; color: #dc2626; font-size: 14px; line-height: 1.5;">${rejectionReason}</p>
            </div>
            <p style="margin: 15px 0 0 0; color: #b91c1c; font-size: 12px;"><strong>Rejected on:</strong> ${rejectedAt.toLocaleString(
              "en-US",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            )}</p>
          </div>
          <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <p style="margin: 0 0 15px 0; color: #1e40af; font-weight: 600; font-size: 16px;">📋 What to do next:</p>
            <ol style="margin: 0; padding-left: 20px; color: #2563eb; font-size: 14px; line-height: 1.8;">
              <li style="margin-bottom: 8px;">Review the rejection reason carefully</li>
              <li style="margin-bottom: 8px;">Prepare a corrected version of your ${docLabel}</li>
              <li style="margin-bottom: 8px;">Make sure the document is clear, readable, and meets all requirements</li>
              <li style="margin-bottom: 8px;">Upload the new document through your rider profile</li>
              <li>Our team will re-verify your updated document</li>
            </ol>
          </div>
          ${
            adminNote
              ? `
            <div style="background: #f3f4f6; padding: 20px; margin: 25px 0; border-radius: 4px; border-left: 4px solid #6b7280;">
              <p style="margin: 0 0 10px 0; font-weight: 600; color: #374151; font-size: 14px;">💬 Additional Note from Admin:</p>
              <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">${adminNote}</p>
            </div>
          `
              : ""
          }
          <div style="background: #fef3c7; padding: 20px; margin: 25px 0; border-radius: 4px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0 0 10px 0; color: #92400e; font-weight: 600; font-size: 14px;">💡 Document Tips:</p>
            <ul style="margin: 0; padding-left: 20px; color: #b45309; font-size: 13px; line-height: 1.6;">
              <li style="margin-bottom: 5px;">Ensure the document is clear and all text is readable</li>
              <li style="margin-bottom: 5px;">Upload in good lighting without shadows or glare</li>
              <li style="margin-bottom: 5px;">Make sure the document is not expired</li>
              <li style="margin-bottom: 5px;">Verify that all required information is visible</li>
              <li>Use JPG, JPEG, or PNG format (max 5MB)</li>
            </ul>
          </div>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${frontendUrl}/rider/profile" style="display: inline-block; background: #ef4444; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Upload Corrected Document</a>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">Need help? Contact our support team at <a href="mailto:support@jumlaya.com" style="color: #ef4444; text-decoration: none;">support@jumlaya.com</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============================================
// ✅ APPROVE RIDER - COMPLETE WITH EMAIL
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

  const requiredDocs = ["license", "vehicleRegistration", "identityProof"];
  const docs = rider.riderProfile?.documents || {};

  const missingDocs = requiredDocs.filter((doc) => !docs[doc]?.url);
  if (missingDocs.length > 0) {
    return next(
      new AppError(
        `Cannot approve: Missing required documents - ${missingDocs
          .map((d) => DOCUMENT_LABELS[d])
          .join(", ")}`,
        400
      )
    );
  }

  const unverifiedDocs = requiredDocs.filter(
    (doc) => docs[doc]?.verified !== true
  );
  if (unverifiedDocs.length > 0) {
    return next(
      new AppError(
        `Cannot approve: The following documents are not verified - ${unverifiedDocs
          .map((d) => DOCUMENT_LABELS[d])
          .join(", ")}`,
        400
      )
    );
  }

  const updatedRider = await User.findOneAndUpdate(
    { _id: req.params.id, role: "rider" },
    {
      $set: {
        "riderProfile.isApproved": true,
        "riderProfile.approvedBy": req.user.id,
        "riderProfile.approvedAt": new Date(),
        "riderProfile.status": "offline",
      },
    },
    { new: true, runValidators: false }
  );

  console.log("✅ Rider approved:", {
    riderId: updatedRider._id,
    riderName: `${updatedRider.firstname} ${updatedRider.lastname}`,
    email: updatedRider.email,
    riderCode: updatedRider.riderProfile.riderCode,
    isApproved: updatedRider.riderProfile.isApproved,
    approvedBy: req.user.id,
    approvedAt: updatedRider.riderProfile.approvedAt,
  });

  try {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    await sendEmail({
      to: updatedRider.email,
      subject: "🎉 Your Rider Account is Approved!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Account Approved</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 20px; border-radius: 10px 10px 0 0; text-align: center;">
              <div style="width: 100px; height: 100px; background: rgba(255,255,255,0.2); border-radius: 50%; margin: 0 auto 20px; line-height: 100px; font-size: 60px;">🎉</div>
              <h1 style="color: white; margin: 0; font-size: 36px; font-weight: bold;">Congratulations!</h1>
              <p style="color: rgba(255,255,255,0.95); margin: 15px 0 0 0; font-size: 18px;">Your Rider Account is Approved</p>
            </div>
            <div style="background: white; padding: 40px 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0 0 30px 0;">We are thrilled to inform you that your rider application has been approved! You can now start accepting delivery requests and earning with Jumlaya.</p>
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #10b981; padding: 25px; margin: 30px 0; border-radius: 8px;">
                <p style="margin: 0 0 15px 0; color: #065f46; font-weight: 600; font-size: 18px;">✅ Account Details</p>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600;">Rider Code:</td>
                    <td style="padding: 8px 0; color: #065f46; font-size: 16px; font-weight: bold; text-align: right;">${updatedRider.riderProfile.riderCode}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600;">Status:</td>
                    <td style="padding: 8px 0; color: #065f46; font-size: 14px; text-align: right;">Approved & Active</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600;">Account Type:</td>
                    <td style="padding: 8px 0; color: #065f46; font-size: 14px; text-align: right;">Delivery Rider</td>
                  </tr>
                </table>
              </div>
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 25px; margin: 30px 0; border-radius: 8px;">
                <p style="margin: 0 0 15px 0; color: #1e40af; font-weight: 600; font-size: 16px;">🚀 Getting Started</p>
                <ol style="margin: 0; padding-left: 20px; color: #2563eb; font-size: 14px; line-height: 2;">
                  <li style="margin-bottom: 10px;">Log in to your rider dashboard</li>
                  <li style="margin-bottom: 10px;">Complete your profile and preferences</li>
                  <li style="margin-bottom: 10px;">Set your status to "Active" to start receiving orders</li>
                  <li style="margin-bottom: 10px;">Review delivery guidelines and best practices</li>
                  <li>Start earning by completing deliveries!</li>
                </ol>
              </div>
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <p style="margin: 0 0 10px 0; color: #92400e; font-weight: 600; font-size: 14px;">📌 Important Reminders:</p>
                <ul style="margin: 0; padding-left: 20px; color: #b45309; font-size: 13px; line-height: 1.8;">
                  <li style="margin-bottom: 5px;">Always carry your verified documents during deliveries</li>
                  <li style="margin-bottom: 5px;">Maintain professional conduct with customers</li>
                  <li style="margin-bottom: 5px;">Keep your vehicle in good condition</li>
                  <li style="margin-bottom: 5px;">Update your availability status regularly</li>
                  <li>Contact support for any assistance needed</li>
                </ul>
              </div>
              <div style="text-align: center; margin-top: 40px;">
                <a href="${frontendUrl}/rider/dashboard" style="display: inline-block; background: #8b5cf6; color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);">Go to Rider Dashboard</a>
              </div>
              <div style="margin-top: 40px; padding-top: 25px; border-top: 2px solid #e5e7eb; text-align: center;">
                <p style="font-size: 14px; color: #6b7280; margin: 0 0 10px 0;">Welcome to the Jumlaya Rider family! 🎊</p>
                <p style="font-size: 12px; color: #9ca3af; margin: 0;">Questions? Email us at <a href="mailto:support@jumlaya.com" style="color: #8b5cf6; text-decoration: none; font-weight: 600;">support@jumlaya.com</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log("📧 Approval email sent successfully");
  } catch (emailError) {
    console.error("❌ Email failed:", emailError);
  }

  res.status(200).json({
    success: true,
    message: "Rider approved successfully",
    data: { rider: updatedRider },
  });
});

// ============================================
// ✅ REJECT RIDER
// ============================================
exports.rejectRider = catchAsync(async (req, res, next) => {
  const { reason } = req.body;

  if (!reason || reason.trim() === "") {
    return next(new AppError("Rejection reason is required", 400));
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

  await User.findByIdAndDelete(rider._id);
  console.log("✅ Rider rejected and deleted:", {
    riderId: rider._id,
    email: rider.email,
    reason: reason.trim(),
  });

  res.status(200).json({
    success: true,
    message: "Rider application rejected",
  });
});

// ============================================
// ✅ GET RIDER STATS
// ============================================
exports.getRiderStats = catchAsync(async (req, res, next) => {
  const [totalRiders, pendingRiders, approvedRiders, activeRiders] =
    await Promise.all([
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
