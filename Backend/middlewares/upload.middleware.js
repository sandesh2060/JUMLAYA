// ============================================
// upload.middleware.js - File Upload Handler
// Path: Backend/middlewares/upload.middleware.js
// ============================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================================
// CREATE UPLOAD DIRECTORIES
// ============================================
const createUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/avatars',
    'uploads/products',
    'uploads/logos',
    'uploads/ads' // ✅ NEW: Ads directory
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
};

// Create directories on module load
createUploadDirs();

// ============================================
// STORAGE CONFIGURATION
// ============================================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine destination based on fieldname
    if (file.fieldname === 'avatar') {
      cb(null, 'uploads/avatars/');
    } else if (file.fieldname === 'logo') {
      cb(null, 'uploads/logos/');
    } else if (file.fieldname === 'adImage') { // ✅ NEW: Ad images
      cb(null, 'uploads/ads/');
    } else {
      cb(null, 'uploads/products/');
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    
    if (file.fieldname === 'avatar') {
      cb(null, `avatar-${uniqueSuffix}${ext}`);
    } else if (file.fieldname === 'logo') {
      cb(null, `logo-${uniqueSuffix}${ext}`);
    } else if (file.fieldname === 'adImage') { // ✅ NEW: Ad image filename
      cb(null, `ad-${uniqueSuffix}${ext}`);
    } else {
      cb(null, `product-${uniqueSuffix}${ext}`);
    }
  }
});

// ============================================
// FILE FILTER FOR IMAGES
// ============================================
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'image/svg+xml';

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp, gif, svg) are allowed!'));
  }
};

// ============================================
// MULTER INSTANCE
// ============================================
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFilter,
});

module.exports = upload;