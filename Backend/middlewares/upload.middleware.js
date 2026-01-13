// ============================================
// Backend/middlewares/upload.middleware.js
// ✅ PRODUCTION FIX - Proper File Handling with PDF Support
// ============================================

const multer = require('multer');
const path = require('path');

// Memory storage - files stored as Buffer, sent directly to Cloudinary
const storage = multer.memoryStorage();

// ✅ FIXED: File filter with PDF support and proper error handling
const documentFilter = (req, file, cb) => {
  console.log('📄 Multer file filter:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  // ✅ Allow images AND PDFs
  const allowedTypes = /jpeg|jpg|png|webp|gif|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  // ✅ Include PDF mimetype
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf'
  ];
  const mimetypeValid = allowedMimeTypes.includes(file.mimetype);

  if (mimetypeValid && extname) {
    console.log('✅ File accepted by multer');
    cb(null, true);
  } else {
    console.error('❌ File rejected by multer:', {
      mimetype: file.mimetype,
      extension: path.extname(file.originalname)
    });
    // ✅ Reject with error that will be caught by handleUploadError
    cb(new Error(`Invalid file type. Only JPG, PNG, WEBP, GIF, and PDF files are allowed. Got: ${file.mimetype}`), false);
  }
};

// ✅ Multer configuration with detailed logging
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1 // Only allow 1 file at a time
  },
  fileFilter: documentFilter
});

// ✅ Single file upload with error logging
const uploadSingle = (fieldName) => {
  console.log(`📤 Setting up multer for field: "${fieldName}"`);
  return (req, res, next) => {
    console.log('📥 Multer middleware triggered:', {
      method: req.method,
      url: req.url,
      contentType: req.headers['content-type'],
      hasBody: !!req.body,
      bodyKeys: Object.keys(req.body || {}),
      fieldName: fieldName
    });

    const middleware = upload.single(fieldName);
    
    middleware(req, res, (err) => {
      if (err) {
        console.error('❌ Multer error:', {
          message: err.message,
          code: err.code,
          field: err.field,
          storageErrors: err.storageErrors
        });
        return next(err);
      }
      
      console.log('✅ Multer processed:', {
        hasFile: !!req.file,
        file: req.file ? {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          bufferSize: req.file.buffer?.length
        } : 'NO FILE'
      });
      
      next();
    });
  };
};

// Multiple files upload
const uploadMultiple = (fieldName, maxCount = 10) => {
  return upload.array(fieldName, maxCount);
};

// ✅ Enhanced error handler middleware
const handleUploadError = (err, req, res, next) => {
  console.error('🚨 Upload error handler triggered:', {
    hasError: !!err,
    errorType: err?.constructor?.name,
    message: err?.message,
    code: err?.code
  });

  if (err instanceof multer.MulterError) {
    console.error('❌ Multer Error:', err.code);
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: `Unexpected field in form data. Expected field: "${err.field}"`
      });
    }
    
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }
  
  if (err) {
    console.error('❌ General upload error:', err.message);
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  console.log('✅ No upload errors, continuing...');
  next();
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  handleUploadError
};