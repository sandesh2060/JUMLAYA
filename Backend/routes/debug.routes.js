// ============================================
// Backend/routes/debug.routes.js
// ✅ DEBUG ONLY - Remove in production
// Check document structure for troubleshooting
// ============================================
const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const { protect } = require('../middlewares/auth.middleware');

// ============================================
// CHECK CURRENT USER'S DOCUMENT STRUCTURE
// ============================================
router.get('/check-my-documents', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('riderProfile');
    
    res.json({
      success: true,
      userId: req.user._id,
      role: req.user.role,
      riderProfile: user.riderProfile,
      documents: user.riderProfile?.documents,
      hasDocuments: !!user.riderProfile?.documents,
      documentKeys: Object.keys(user.riderProfile?.documents || {})
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// CHECK ANY RIDER'S DOCUMENTS (Admin only)
// ============================================
router.get('/check-rider-documents/:riderId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.riderId).select('firstname lastname email role riderProfile');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: `${user.firstname} ${user.lastname}`,
        email: user.email,
        role: user.role
      },
      riderProfile: user.riderProfile,
      documents: user.riderProfile?.documents,
      hasDocuments: !!user.riderProfile?.documents,
      documentKeys: Object.keys(user.riderProfile?.documents || {}),
      documentDetails: user.riderProfile?.documents ? Object.entries(user.riderProfile.documents).map(([key, value]) => ({
        type: key,
        hasUrl: !!value?.url,
        url: value?.url,
        uploadedAt: value?.uploadedAt,
        verified: value?.verified
      })) : []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// LIST ALL RIDERS WITH DOCUMENT STATUS
// ============================================
router.get('/list-all-riders', protect, async (req, res) => {
  try {
    const riders = await User.find({ role: 'rider' })
      .select('firstname lastname email riderProfile.documents riderProfile.riderCode riderProfile.isApproved')
      .limit(50);

    const riderList = riders.map(rider => {
      const docs = rider.riderProfile?.documents || {};
      return {
        id: rider._id,
        name: `${rider.firstname} ${rider.lastname}`,
        email: rider.email,
        riderCode: rider.riderProfile?.riderCode,
        isApproved: rider.riderProfile?.isApproved,
        documents: {
          license: !!docs.license?.url,
          vehicleRegistration: !!docs.vehicleRegistration?.url,
          identityProof: !!docs.identityProof?.url,
          insurance: !!docs.insurance?.url,
          profilePhoto: !!docs.profilePhoto?.url
        },
        totalDocuments: Object.keys(docs).length
      };
    });

    res.json({
      success: true,
      totalRiders: riders.length,
      riders: riderList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

// ============================================
// ADD TO app.js (FOR DEBUGGING ONLY):
// app.use('/api/debug', require('./routes/debug.routes'));
// 
// THEN TEST:
// GET /api/debug/check-my-documents (as logged-in rider)
// GET /api/debug/check-rider-documents/:riderId (as admin)
// GET /api/debug/list-all-riders (as admin)
// ============================================