// ============================================
// Backend/controllers/rider/rider.document.controller.js
// ✅ PRODUCTION-READY FIX - Complete Document Upload
// ============================================

const Rider = require('../../models/rider.model');
const User = require('../../models/user.model');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const { 
  uploadImage, 
  deleteImage, 
  extractPublicId, 
  FOLDERS 
} = require('../../config/cloudinary');

// ============================================
// UPLOAD AVATAR (Profile Photo)
// ============================================
exports.uploadAvatar = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const riderId = req.rider._id;
  
  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

  console.log('📤 Avatar upload:', {
    userId,
    riderId,
    fileName: req.file.originalname,
    fileSize: `${(req.file.size / 1024).toFixed(2)} KB`
  });

  // Find both User and Rider documents
  const user = await User.findById(userId);
  const rider = await Rider.findById(riderId);

  if (!rider) {
    return next(new AppError('Rider profile not found', 404));
  }

  // Delete old avatar from Cloudinary if exists
  if (rider.documents?.profilePhoto?.url) {
    const oldPublicId = extractPublicId(rider.documents.profilePhoto.url);
    if (oldPublicId) {
      try {
        await deleteImage(oldPublicId);
        console.log('✅ Old avatar deleted:', oldPublicId);
      } catch (error) {
        console.warn('⚠️ Failed to delete old avatar:', error.message);
      }
    }
  }

  // Upload new avatar to Cloudinary
  const uploadResult = await uploadImage(req.file.buffer, {
    folder: FOLDERS.RIDER_AVATARS || 'riders/avatars',
    preset: 'riderAvatar'
  });

  // Update Rider documents
  if (!rider.documents) rider.documents = {};
  rider.documents.profilePhoto = {
    url: uploadResult.url,
    uploadedAt: new Date()
  };

  await rider.save();

  // Update User riderProfile documents (sync both models)
  if (user && user.riderProfile) {
    if (!user.riderProfile.documents) {
      user.riderProfile.documents = {};
    }
    user.riderProfile.documents.profilePhoto = {
      url: uploadResult.url,
      uploadedAt: new Date()
    };
    await user.save();
  }

  console.log('✅ Avatar uploaded successfully');

  res.json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: {
      url: uploadResult.url,
      publicId: uploadResult.publicId
    }
  });
});

// ============================================
// ✅ FIXED: UPLOAD DOCUMENT - Get documentType from URL params
// ============================================
exports.uploadDocument = catchAsync(async (req, res, next) => {
  const riderId = req.rider._id;
  const userId = req.user._id;
  
  // ✅ CRITICAL FIX: Get documentType from URL params, not body
  const { documentType } = req.params;

  console.log('📤 Document upload request:', {
    riderId,
    userId,
    documentType,
    hasFile: !!req.file,
    fileName: req.file?.originalname,
    fileSize: req.file ? `${(req.file.size / 1024).toFixed(2)} KB` : 'N/A'
  });

  // Validate document type
  const validDocs = ['license', 'vehicleRegistration', 'insurance', 'identityProof', 'profilePhoto'];
  if (!validDocs.includes(documentType)) {
    console.error('❌ Invalid document type:', documentType);
    return next(new AppError('Invalid document type', 400));
  }

  // ✅ CRITICAL: Check if file was uploaded
  if (!req.file) {
    console.error('❌ No file in request');
    return next(new AppError('Please upload a file', 400));
  }

  // Validate file size (5MB max)
  if (req.file.size > 5 * 1024 * 1024) {
    return next(new AppError('File size must be less than 5MB', 400));
  }

  // Validate file type
  const allowedMimeTypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/webp',
    'application/pdf'
  ];
  
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return next(new AppError('Only JPG, PNG, WEBP, and PDF files are allowed', 400));
  }

  // Find rider
  const rider = await Rider.findById(riderId);
  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  // Check existing document for re-upload tracking
  const existingDoc = rider.documents?.[documentType];
  const isReUpload = !!(existingDoc?.url);
  const previousStatus = existingDoc?.verified;

  console.log('📊 Document status:', {
    isReUpload,
    previousStatus: previousStatus === true ? 'verified' : previousStatus === false ? 'rejected' : 'pending',
    hasExistingUrl: !!existingDoc?.url
  });

  // ✅ Delete old document from Cloudinary if exists
  if (isReUpload && existingDoc.url) {
    const oldPublicId = extractPublicId(existingDoc.url);
    if (oldPublicId) {
      try {
        await deleteImage(oldPublicId);
        console.log('✅ Old document deleted:', oldPublicId);
      } catch (error) {
        console.warn('⚠️ Failed to delete old document:', error.message);
        // Don't fail the request if deletion fails
      }
    }
  }

  // ✅ Upload new document to Cloudinary
  let uploadResult;
  try {
    uploadResult = await uploadImage(req.file.buffer, {
      folder: FOLDERS.RIDER_DOCUMENTS || 'riders/documents',
      preset: 'riderDocument',
      resourceType: req.file.mimetype === 'application/pdf' ? 'raw' : 'image'
    });
    
    console.log('✅ Upload successful:', {
      url: uploadResult.url,
      publicId: uploadResult.publicId
    });
  } catch (uploadError) {
    console.error('❌ Cloudinary upload failed:', uploadError);
    return next(new AppError('Failed to upload document to cloud storage', 500));
  }

  // ✅ Prepare document data with version tracking
  const currentVersion = existingDoc?.version || 0;
  const now = new Date();

  // Initialize documents object if it doesn't exist
  if (!rider.documents) rider.documents = {};

  // ✅ Save previous version to history if re-uploading
  if (isReUpload && existingDoc) {
    if (!rider.documents[documentType].previousVersions) {
      rider.documents[documentType].previousVersions = [];
    }
    
    rider.documents[documentType].previousVersions.push({
      url: existingDoc.url,
      uploadedAt: existingDoc.uploadedAt,
      verified: existingDoc.verified,
      verifiedAt: existingDoc.verifiedAt,
      rejectionReason: existingDoc.rejectionReason,
      rejectedAt: existingDoc.rejectedAt,
      version: currentVersion
    });
  }

  // ✅ Update document with new data
  rider.documents[documentType] = {
    url: uploadResult.url,
    uploadedAt: now,
    verified: null, // ✅ Reset verification status
    verifiedAt: null,
    verifiedBy: null,
    rejectionReason: null,
    rejectedAt: null,
    version: currentVersion + 1,
    previousVersions: rider.documents[documentType]?.previousVersions || []
  };

  // Mark as modified and save
  rider.markModified('documents');
  await rider.save();

  // ✅ Also update User model if it has riderProfile
  try {
    const user = await User.findById(userId);
    if (user && user.riderProfile) {
      if (!user.riderProfile.documents) {
        user.riderProfile.documents = {};
      }
      
      user.riderProfile.documents[documentType] = {
        url: uploadResult.url,
        uploadedAt: now,
        verified: null,
        version: currentVersion + 1
      };
      
      user.markModified('riderProfile.documents');
      await user.save();
      console.log('✅ User model synced');
    }
  } catch (userUpdateError) {
    console.warn('⚠️ Failed to sync User model:', userUpdateError.message);
    // Don't fail the request if user sync fails
  }

  // ✅ Prepare response message based on re-upload status
  let message;
  if (isReUpload) {
    if (previousStatus === true) {
      message = `${documentType} re-uploaded successfully. Previous verification has been cleared. Admin will re-verify your new document.`;
    } else if (previousStatus === false) {
      message = `${documentType} re-uploaded successfully. Your corrected document has been submitted for admin verification.`;
    } else {
      message = `${documentType} updated successfully. Document is pending admin verification.`;
    }
  } else {
    message = `${documentType} uploaded successfully. Pending admin verification.`;
  }

  console.log('✅ Document upload complete:', {
    documentType,
    version: currentVersion + 1,
    isReUpload,
    message
  });

  res.status(200).json({
    success: true,
    message,
    isReUpload,
    previousStatus: previousStatus === true ? 'verified' : previousStatus === false ? 'rejected' : 'pending',
    data: {
      documentType,
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      version: currentVersion + 1,
      uploadedAt: now,
      verified: null
    }
  });
});

// ============================================
// GET DOCUMENTS
// ============================================
exports.getDocuments = catchAsync(async (req, res, next) => {
  const riderId = req.rider._id;

  const rider = await Rider.findById(riderId).select('documents');
  
  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  // Ensure documents object exists with all expected fields
  const documents = rider.documents || {};
  
  // Initialize missing document types
  const documentTypes = ['license', 'vehicleRegistration', 'insurance', 'identityProof', 'profilePhoto'];
  documentTypes.forEach(type => {
    if (!documents[type]) {
      documents[type] = null;
    }
  });

  console.log('📋 Documents retrieved:', {
    riderId,
    documentCount: Object.keys(documents).filter(k => documents[k]?.url).length
  });

  res.json({
    success: true,
    data: documents
  });
});

// ============================================
// DELETE DOCUMENT
// ============================================
exports.deleteDocument = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const riderId = req.rider._id;
  const { documentType } = req.params;

  console.log('🗑️ Delete request:', { riderId, documentType });

  const validDocTypes = ['license', 'vehicleRegistration', 'insurance', 'identityProof', 'profilePhoto'];
  if (!validDocTypes.includes(documentType)) {
    return next(new AppError('Invalid document type', 400));
  }

  // Find both User and Rider documents
  const user = await User.findById(userId);
  const rider = await Rider.findById(riderId);

  if (!rider) {
    return next(new AppError('Rider not found', 404));
  }

  // Delete from Cloudinary
  if (rider.documents?.[documentType]?.url) {
    const publicId = extractPublicId(rider.documents[documentType].url);
    if (publicId) {
      try {
        await deleteImage(publicId);
        console.log(`✅ ${documentType} deleted from Cloudinary:`, publicId);
      } catch (error) {
        console.warn(`⚠️ Failed to delete ${documentType} from Cloudinary:`, error.message);
      }
    }
  }

  // Remove from Rider database
  if (rider.documents && rider.documents[documentType]) {
    rider.documents[documentType] = undefined;
    rider.markModified('documents');
    await rider.save();
    console.log(`✅ ${documentType} removed from Rider model`);
  }

  // Remove from User riderProfile documents (sync both models)
  if (user && user.riderProfile && user.riderProfile.documents) {
    user.riderProfile.documents[documentType] = undefined;
    user.markModified('riderProfile.documents');
    await user.save();
    console.log(`✅ ${documentType} removed from User model`);
  }

  res.json({
    success: true,
    message: 'Document deleted successfully'
  });
});

module.exports = exports;