// ============================================
// Backend/routes/rider.document.routes.js
// ✅ Rider Document Upload Routes
// ============================================
const express = require('express');
const router = express.Router();

const {
  uploadAvatar,
  uploadDocument,
  getDocuments,
  deleteDocument
} = require('../controllers/rider/rider.document.controller');

const {
  uploadSingle,
  handleUploadError
} = require('../middlewares/upload.middleware');

const { protect, restrictTo } = require('../middlewares/auth.middleware');

// ============================================
// ALL ROUTES REQUIRE AUTHENTICATION
// ============================================
router.use(protect);
router.use(restrictTo('rider'));

// ============================================
// DOCUMENT ROUTES
// ============================================

// Upload profile photo
router.post(
  '/avatar',
  uploadSingle('avatar'),
  handleUploadError,
  uploadAvatar
);

// Upload document (license, vehicle registration, etc.)
router.post(
  '/upload',
  uploadSingle('document'),
  handleUploadError,
  uploadDocument
);

// Get all documents
router.get('/', getDocuments);

// Delete document
router.delete('/:documentType', deleteDocument);

module.exports = router;