// ============================================
// Backend/utils/cloudinary.js
// Cloudinary Utility Functions
// ============================================

const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload file buffer to Cloudinary
 * @param {Buffer} fileBuffer - File buffer to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with secure_url, public_id, etc.
 */
const uploadToCloudinary = async (fileBuffer, options = {}) => {
  try {
    const {
      folder = 'jumlaya',
      resource_type = 'auto',
      transformation = null,
      public_id = null
    } = options;

    return new Promise((resolve, reject) => {
      const uploadOptions = {
        folder,
        resource_type,
        ...(transformation && { transformation }),
        ...(public_id && { public_id })
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else {
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
              url: result.url,
              width: result.width,
              height: result.height,
              format: result.format,
              resource_type: result.resource_type,
              bytes: result.bytes
            });
          }
        }
      );

      // Convert buffer to readable stream and pipe to Cloudinary
      const readableStream = Readable.from(fileBuffer);
      readableStream.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Upload to Cloudinary failed:', error);
    throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
  }
};

/**
 * Delete file from Cloudinary
 * @param {String} urlOrPublicId - Cloudinary URL or public_id
 * @param {Object} options - Delete options
 * @returns {Promise<Object>} Deletion result
 */
const deleteFromCloudinary = async (urlOrPublicId, options = {}) => {
  try {
    if (!urlOrPublicId) {
      return { success: true, message: 'No file to delete' };
    }

    // Extract public_id if URL was provided
    let publicId = urlOrPublicId;
    if (urlOrPublicId.includes('cloudinary.com')) {
      publicId = extractPublicIdFromUrl(urlOrPublicId);
    }

    if (!publicId) {
      throw new Error('Invalid public_id or URL');
    }

    const { resource_type = 'image' } = options;

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type
    });

    if (result.result === 'ok' || result.result === 'not found') {
      return { 
        success: true, 
        result: result.result,
        message: result.result === 'ok' ? 'File deleted successfully' : 'File not found'
      };
    } else {
      throw new Error(`Deletion failed with result: ${result.result}`);
    }
  } catch (error) {
    console.error('Delete from Cloudinary failed:', error);
    // Don't throw - return error info instead
    return { 
      success: false, 
      error: error.message,
      message: 'Failed to delete file from Cloudinary'
    };
  }
};

/**
 * Extract public_id from Cloudinary URL
 * @param {String} cloudinaryUrl - Full Cloudinary URL
 * @returns {String|null} Extracted public_id or null
 */
const extractPublicIdFromUrl = (cloudinaryUrl) => {
  try {
    if (!cloudinaryUrl || typeof cloudinaryUrl !== 'string') {
      return null;
    }

    // Example URL: https://res.cloudinary.com/dszy3sf5c/image/upload/v1234567890/jumlaya/riders/documents/file.jpg
    // Should return: jumlaya/riders/documents/file

    const urlParts = cloudinaryUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');

    if (uploadIndex === -1) {
      return null;
    }

    // Get everything after 'upload/v1234567890/'
    const pathAfterUpload = urlParts.slice(uploadIndex + 2);
    
    // Join and remove file extension
    const publicIdWithExt = pathAfterUpload.join('/');
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');

    return publicId;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param {Array<Buffer>} fileBuffers - Array of file buffers
 * @param {Object} options - Upload options
 * @returns {Promise<Array>} Array of upload results
 */
const uploadMultipleToCloudinary = async (fileBuffers, options = {}) => {
  try {
    if (!Array.isArray(fileBuffers) || fileBuffers.length === 0) {
      return [];
    }

    const uploadPromises = fileBuffers.map(buffer => 
      uploadToCloudinary(buffer, options)
    );

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple upload failed:', error);
    throw new Error(`Failed to upload multiple files: ${error.message}`);
  }
};

/**
 * Delete multiple files from Cloudinary
 * @param {Array<String>} urlsOrPublicIds - Array of URLs or public_ids
 * @param {Object} options - Delete options
 * @returns {Promise<Array>} Array of deletion results
 */
const deleteMultipleFromCloudinary = async (urlsOrPublicIds, options = {}) => {
  try {
    if (!Array.isArray(urlsOrPublicIds) || urlsOrPublicIds.length === 0) {
      return [];
    }

    const deletePromises = urlsOrPublicIds.map(urlOrId => 
      deleteFromCloudinary(urlOrId, options)
    );

    return await Promise.all(deletePromises);
  } catch (error) {
    console.error('Multiple delete failed:', error);
    return [];
  }
};

/**
 * Get optimized image URL from Cloudinary
 * @param {String} publicId - Cloudinary public_id
 * @param {Object} transformations - Transformation options
 * @returns {String} Optimized image URL
 */
const getOptimizedUrl = (publicId, transformations = {}) => {
  try {
    const {
      width,
      height,
      crop = 'limit',
      quality = 'auto:good',
      format = 'auto'
    } = transformations;

    return cloudinary.url(publicId, {
      transformation: [
        ...(width || height ? [{ width, height, crop }] : []),
        { quality },
        { fetch_format: format }
      ],
      secure: true
    });
  } catch (error) {
    console.error('Error generating optimized URL:', error);
    return null;
  }
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadMultipleToCloudinary,
  deleteMultipleFromCloudinary,
  extractPublicIdFromUrl,
  getOptimizedUrl
};