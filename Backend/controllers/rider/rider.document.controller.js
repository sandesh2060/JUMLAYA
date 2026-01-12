// ============================================
// Backend/controllers/rider/rider.document.controller.js
// ✅ COMPLETE DOCUMENT UPLOAD CONTROLLER
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
    transformation: {
      width: 400,
      height: 400,
      crop: 'fill',
      gravity: 'face'
    }
  });

  // Update Rider documents
  if (!rider.documents) rider.documents = {};
  rider.documents.profilePhoto = {
    url: uploadResult.secure_url || uploadResult.url,
    uploadedAt: new Date()
  };

  await rider.save();

  // Update User riderProfile documents (sync both models)
  if (user && user.riderProfile) {
    if (!user.riderProfile.documents) {
      user.riderProfile.documents = {};
    }
    user.riderProfile.documents.profilePhoto = {
      url: uploadResult.secure_url || uploadResult.url,
      uploadedAt: new Date()
    };
    await user.save();
  }

  res.json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: {
      url: uploadResult.secure_url || uploadResult.url,
      publicId: uploadResult.public_id
    }
  });
});

// ============================================
// UPLOAD DOCUMENT (License, Vehicle Reg, etc.)
// ============================================
exports.uploadDocument = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const riderId = req.rider._id;
  const { documentType } = req.body;
  
  if (!req.file) {
    return next(new AppError('Please upload a document', 400));
  }

  const validDocTypes = ['license', 'vehicleRegistration', 'insurance', 'identityProof'];
  if (!validDocTypes.includes(documentType)) {
    return next(new AppError('Invalid document type. Must be: license, vehicleRegistration, insurance, or identityProof', 400));
  }

  // Find both User and Rider documents
  const user = await User.findById(userId);
  const rider = await Rider.findById(riderId);

  if (!rider) {
    return next(new AppError('Rider profile not found', 404));
  }

  // Delete old document from Cloudinary if exists
  if (rider.documents?.[documentType]?.url) {
    const oldPublicId = extractPublicId(rider.documents[documentType].url);
    if (oldPublicId) {
      try {
        await deleteImage(oldPublicId);
        console.log(`✅ Old ${documentType} deleted:`, oldPublicId);
      } catch (error) {
        console.warn(`⚠️ Failed to delete old ${documentType}:`, error.message);
      }
    }
  }

  // Upload new document to Cloudinary
  const uploadResult = await uploadImage(req.file.buffer, {
    folder: FOLDERS.RIDER_DOCUMENTS || 'riders/documents',
    resource_type: 'auto' // Supports images and PDFs
  });

  // Update Rider documents
  if (!rider.documents) rider.documents = {};
  rider.documents[documentType] = {
    url: uploadResult.secure_url || uploadResult.url,
    uploadedAt: new Date(),
    verified: false
  };

  await rider.save();

  // Update User riderProfile documents (sync both models)
  if (user && user.riderProfile) {
    if (!user.riderProfile.documents) {
      user.riderProfile.documents = {};
    }
    user.riderProfile.documents[documentType] = {
      url: uploadResult.secure_url || uploadResult.url,
      uploadedAt: new Date(),
      verified: false
    };
    await user.save();
  }

  // Check if all required documents are uploaded
  const hasLicense = rider.documents.license?.url;
  const hasVehicleReg = rider.documents.vehicleRegistration?.url;
  const hasIdentityProof = rider.documents.identityProof?.url;
  const hasAllRequiredDocs = hasLicense && hasVehicleReg && hasIdentityProof;

  res.json({
    success: true,
    message: `${documentType} uploaded successfully`,
    data: {
      documentType,
      url: uploadResult.secure_url || uploadResult.url,
      publicId: uploadResult.public_id,
      uploadedAt: new Date(),
      verified: false
    },
    allRequiredDocsUploaded: hasAllRequiredDocs
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

  // Ensure documents object exists
  const documents = rider.documents || {
    license: null,
    vehicleRegistration: null,
    insurance: null,
    identityProof: null,
    profilePhoto: null
  };

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
  }

  // Remove from User riderProfile documents (sync both models)
  if (user && user.riderProfile && user.riderProfile.documents) {
    user.riderProfile.documents[documentType] = undefined;
    user.markModified('riderProfile.documents');
    await user.save();
  }

  res.json({
    success: true,
    message: 'Document deleted successfully'
  });
});

module.exports = exports;