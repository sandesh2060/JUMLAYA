// ============================================
// Image Helper Utilities
// Path: Frontend/src/utils/imageHelpers.js
// ============================================

/**
 * Get full image URL from backend path
 * Handles relative paths from the backend and converts them to full URLs
 * 
 * @param {string} imagePath - Path from database (e.g., "/uploads/products/image.jpg")
 * @returns {string} - Full URL (e.g., "http://localhost:4001/uploads/products/image.jpg")
 * 
 * @example
 * getImageUrl('/uploads/products/phone.jpg')
 * // Returns: 'http://localhost:4001/uploads/products/phone.jpg'
 * 
 * getImageUrl('https://example.com/image.jpg')
 * // Returns: 'https://example.com/image.jpg' (unchanged)
 * 
 * getImageUrl(null)
 * // Returns: '/placeholder.png'
 */
export const getImageUrl = (imagePath) => {
  // Return placeholder if no image path provided
  if (!imagePath) {
    return '/placeholder.png';
  }

  // If it's already a full URL (external image), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a local placeholder or already contains domain, return as is
  if (imagePath.startsWith('/placeholder') || imagePath.includes('localhost')) {
    return imagePath;
  }

  // Get backend URL and remove /api suffix for static files
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4001/api';
  const backendUrl = apiUrl.replace('/api', '');

  // Ensure imagePath starts with /
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  return `${backendUrl}${normalizedPath}`;
};

/**
 * Get multiple image URLs
 * 
 * @param {string[]} images - Array of image paths
 * @returns {string[]} - Array of full URLs
 * 
 * @example
 * getImageUrls(['/uploads/products/img1.jpg', '/uploads/products/img2.jpg'])
 * // Returns: ['http://localhost:4001/uploads/products/img1.jpg', 'http://localhost:4001/uploads/products/img2.jpg']
 */
export const getImageUrls = (images) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return [];
  }
  return images.map(img => getImageUrl(img));
};

/**
 * Get first image URL from an array or return placeholder
 * Useful for product cards, thumbnails, etc.
 * 
 * @param {string[]} images - Array of image paths
 * @returns {string} - First image URL or placeholder
 * 
 * @example
 * getFirstImage(['/uploads/products/img1.jpg', '/uploads/products/img2.jpg'])
 * // Returns: 'http://localhost:4001/uploads/products/img1.jpg'
 * 
 * getFirstImage([])
 * // Returns: '/placeholder.png'
 */
export const getFirstImage = (images) => {
  if (!images || !Array.isArray(images) || images.length === 0) {
    return '/placeholder.png';
  }
  return getImageUrl(images[0]);
};

/**
 * Get product thumbnail with fallback
 * 
 * @param {Object} product - Product object with images array
 * @returns {string} - Thumbnail URL or placeholder
 * 
 * @example
 * getProductThumbnail({ images: ['/uploads/products/phone.jpg'] })
 * // Returns: 'http://localhost:4001/uploads/products/phone.jpg'
 */
export const getProductThumbnail = (product) => {
  return getFirstImage(product?.images);
};

/**
 * Check if image URL is valid (exists and not placeholder)
 * 
 * @param {string} imageUrl - Image URL to check
 * @returns {boolean} - True if valid image URL
 * 
 * @example
 * isValidImageUrl('http://localhost:4001/uploads/products/phone.jpg')
 * // Returns: true
 * 
 * isValidImageUrl('/placeholder.png')
 * // Returns: false
 */
export const isValidImageUrl = (imageUrl) => {
  if (!imageUrl || imageUrl === '/placeholder.png') {
    return false;
  }
  return imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('/uploads/');
};

/**
 * Get image URL with size optimization query params
 * Useful if you implement image resizing on backend
 * 
 * @param {string} imagePath - Image path
 * @param {Object} options - Size options (width, height, quality)
 * @returns {string} - Image URL with query params
 * 
 * @example
 * getOptimizedImageUrl('/uploads/products/phone.jpg', { width: 300, height: 300 })
 * // Returns: 'http://localhost:4001/uploads/products/phone.jpg?w=300&h=300'
 */
export const getOptimizedImageUrl = (imagePath, options = {}) => {
  const baseUrl = getImageUrl(imagePath);
  
  if (baseUrl === '/placeholder.png') {
    return baseUrl;
  }

  const { width, height, quality } = options;
  const params = new URLSearchParams();

  if (width) params.append('w', width);
  if (height) params.append('h', height);
  if (quality) params.append('q', quality);

  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
};

/**
 * Extract filename from image path
 * 
 * @param {string} imagePath - Full or relative image path
 * @returns {string} - Filename only
 * 
 * @example
 * getImageFilename('/uploads/products/phone-12345.jpg')
 * // Returns: 'phone-12345.jpg'
 */
export const getImageFilename = (imagePath) => {
  if (!imagePath) return '';
  return imagePath.split('/').pop();
};

/**
 * Check if image path is from uploads folder
 * 
 * @param {string} imagePath - Image path to check
 * @returns {boolean} - True if from uploads
 */
export const isUploadedImage = (imagePath) => {
  if (!imagePath) return false;
  return imagePath.includes('/uploads/');
};

// Export all functions as default object as well
export default {
  getImageUrl,
  getImageUrls,
  getFirstImage,
  getProductThumbnail,
  isValidImageUrl,
  getOptimizedImageUrl,
  getImageFilename,
  isUploadedImage
};