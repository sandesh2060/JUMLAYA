// ============================================
// CLOUDINARY CONFIGURATION - ENHANCED
// Path: Backend/config/cloudinary.js
// REPLACE YOUR EXISTING FILE WITH THIS
// ============================================

const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

// ============================================
// CONFIGURE CLOUDINARY
// ============================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ============================================
// FOLDER STRUCTURE ON CLOUDINARY
// ============================================
const FOLDERS = {
  PRODUCTS: "jumlaya/products",
  CATEGORIES: "jumlaya/categories",
  LOGOS: "jumlaya/logos",
  AVATARS: "jumlaya/avatars",
  ADS: "jumlaya/ads",
  BANNERS: "jumlaya/banners",
  BRANDS: "jumlaya/brands",
  RIDER_AVATARS: "jumlaya/riders/avatars",
  RIDER_DOCUMENTS: "jumlaya/riders/documents",
};

// ============================================
// IMAGE UPLOAD CONFIGURATIONS
// ============================================
const UPLOAD_PRESETS = {
  // Product images - optimized for e-commerce
  product: {
    transformation: [
      { width: 1200, height: 1200, crop: "limit" },
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
    folder: FOLDERS.PRODUCTS,
  },

  // Product thumbnails
  productThumb: {
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "auto" },
      { quality: "auto:eco" },
      { fetch_format: "auto" },
    ],
    folder: FOLDERS.PRODUCTS,
  },

  // Category images
  category: {
    transformation: [
      { width: 800, height: 600, crop: "fill" },
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
    folder: FOLDERS.CATEGORIES,
  },

  // Logo images (transparent background support)
  logo: {
    transformation: [
      { width: 500, height: 500, crop: "limit" },
      { quality: "auto:best" },
      { fetch_format: "auto" },
    ],
    folder: FOLDERS.LOGOS,
  },

  // User avatars
  avatar: {
    transformation: [
      { width: 300, height: 300, crop: "fill", gravity: "face" },
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
    folder: FOLDERS.AVATARS,
  },

  // Banner/Ads images
  banner: {
    transformation: [
      { width: 1920, height: 600, crop: "fill" },
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
    folder: FOLDERS.BANNERS,
  },

  // Brand logos
  brand: {
    transformation: [
      { width: 400, height: 400, crop: "limit" },
      { quality: "auto:best" },
      { fetch_format: "auto" },
    ],
    folder: FOLDERS.BRANDS,
  },
  riderAvatar: {
    transformation: [
      { width: 400, height: 400, crop: "fill", gravity: "face" },
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
    folder: FOLDERS.RIDER_AVATARS,
  },

  riderDocument: {
    transformation: [
      { width: 1200, height: 1600, crop: "limit" },
      { quality: "auto:best" },
      { fetch_format: "auto" },
    ],
    folder: FOLDERS.RIDER_DOCUMENTS,
  },
};

// ============================================
// UPLOAD SINGLE IMAGE
// ============================================
const uploadImage = async (fileBuffer, options = {}) => {
  try {
    const {
      folder = FOLDERS.PRODUCTS,
      preset = "product",
      publicId = null,
      resourceType = "image",
    } = options;

    // Get preset configuration
    const presetConfig = UPLOAD_PRESETS[preset] || UPLOAD_PRESETS.product;

    // Upload options
    const uploadOptions = {
      folder: folder,
      resource_type: resourceType,
      transformation: presetConfig.transformation,
      ...(publicId && { public_id: publicId }),
    };

    // Convert buffer to stream and upload
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height,
              format: result.format,
              size: result.bytes,
            });
          }
        }
      );

      // Create readable stream from buffer
      const bufferStream = Readable.from(fileBuffer);
      bufferStream.pipe(uploadStream);
    });
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

// ============================================
// UPLOAD MULTIPLE IMAGES
// ============================================
const uploadMultipleImages = async (files, options = {}) => {
  try {
    if (!files || files.length === 0) {
      return [];
    }

    const uploadPromises = files.map((file) =>
      uploadImage(file.buffer, options)
    );

    return await Promise.all(uploadPromises);
  } catch (error) {
    throw new Error(`Multiple image upload failed: ${error.message}`);
  }
};

// ============================================
// DELETE IMAGE
// ============================================
const deleteImage = async (publicId) => {
  try {
    if (!publicId) {
      return { result: "ok", message: "No image to delete" };
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok" || result.result === "not found") {
      return { success: true, result: result.result };
    } else {
      throw new Error("Deletion failed");
    }
  } catch (error) {
    console.error(`Image deletion failed for ${publicId}:`, error.message);
    // Don't throw error - just log it
    return { success: false, error: error.message };
  }
};

// ============================================
// DELETE MULTIPLE IMAGES
// ============================================
const deleteMultipleImages = async (publicIds) => {
  try {
    if (!publicIds || publicIds.length === 0) {
      return [];
    }

    const deletePromises = publicIds.map((id) => deleteImage(id));
    return await Promise.all(deletePromises);
  } catch (error) {
    console.error("Multiple image deletion failed:", error.message);
    return [];
  }
};

// ============================================
// UPDATE IMAGE (Delete old, upload new)
// ============================================
const updateImage = async (oldPublicId, newFileBuffer, options = {}) => {
  try {
    // Upload new image first
    const uploadResult = await uploadImage(newFileBuffer, options);

    // Delete old image if exists
    if (oldPublicId) {
      await deleteImage(oldPublicId);
    }

    return uploadResult;
  } catch (error) {
    throw new Error(`Image update failed: ${error.message}`);
  }
};

// ============================================
// GET OPTIMIZED URL
// ============================================
const getOptimizedUrl = (publicId, options = {}) => {
  const {
    width = 800,
    height = 800,
    crop = "limit",
    quality = "auto:good",
    format = "auto",
  } = options;

  return cloudinary.url(publicId, {
    transformation: [
      { width, height, crop },
      { quality },
      { fetch_format: format },
    ],
    secure: true,
  });
};

// ============================================
// EXTRACT PUBLIC ID FROM URL
// ============================================
const extractPublicId = (cloudinaryUrl) => {
  try {
    if (!cloudinaryUrl) return null;

    // Extract public_id from Cloudinary URL
    // Example: https://res.cloudinary.com/jumlaya/image/upload/v123456/jumlaya/products/image.jpg
    // Returns: jumlaya/products/image

    const urlParts = cloudinaryUrl.split("/");
    const uploadIndex = urlParts.indexOf("upload");

    if (uploadIndex === -1) return null;

    // Get everything after 'upload/v123456/'
    const publicIdParts = urlParts.slice(uploadIndex + 2);
    const publicId = publicIdParts.join("/").split(".")[0];

    return publicId;
  } catch (error) {
    console.error("Error extracting public ID:", error.message);
    return null;
  }
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  cloudinary,
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  updateImage,
  getOptimizedUrl,
  extractPublicId,
  FOLDERS,
  UPLOAD_PRESETS,
};
