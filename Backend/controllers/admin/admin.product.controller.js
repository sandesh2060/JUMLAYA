// ============================================
// ADMIN PRODUCT CONTROLLER - WITH CLOUDINARY
// Path: Backend/controllers/admin/admin.product.controller.js
// REPLACE YOUR EXISTING FILE WITH THIS
// ============================================

const Product = require('../../models/product.model');
const {
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
  FOLDERS
} = require('../../config/cloudinary');

// ============================================
// GET ALL PRODUCTS (Admin)
// ============================================
exports.getAllProducts = async (req, res) => {
  try {
    console.log('📦 Admin fetching all products with params:', req.query);

    const {
      page = 1,
      limit = 10,
      search,
      category,
      status,
      sortBy = 'createdAt',
      order = 'desc',
      lowStock,
      maxStock,
      minStock
    } = req.query;

    const query = { isDeleted: { $ne: true } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (lowStock === 'true') {
      query.stock = { $lte: 10 };
    }

    if (maxStock) {
      const maxStockValue = parseInt(maxStock);
      if (!isNaN(maxStockValue)) {
        query.stock = { $lte: maxStockValue };
      }
    }

    if (minStock) {
      const minStockValue = parseInt(minStock);
      if (!isNaN(minStockValue)) {
        query.stock = query.stock || {};
        query.stock.$gte = minStockValue;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      message: 'Products retrieved successfully',
      products,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit)
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// ============================================
// GET SINGLE PRODUCT (Admin)
// ============================================
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('category', 'name')
      .lean();

    if (!product || product.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// ============================================
// CREATE PRODUCT (Admin) - WITH CLOUDINARY
// ============================================
exports.createProduct = async (req, res) => {
  try {
    console.log('📦 Creating product with Cloudinary images');
    
    const productData = req.body;

    // Upload images to Cloudinary if files are provided
    if (req.files && req.files.length > 0) {
      console.log(`📤 Uploading ${req.files.length} images to Cloudinary...`);
      
      const uploadResults = await uploadMultipleImages(
        req.files,
        {
          preset: 'product',
          folder: FOLDERS.PRODUCTS
        }
      );

      productData.images = uploadResults.map(result => result.url);
      productData.imagePublicIds = uploadResults.map(result => result.publicId);
      
      console.log('✅ Images uploaded successfully');
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    console.error('❌ Error creating product:', error);
    
    // Clean up uploaded images if product creation fails
    if (req.body.imagePublicIds && req.body.imagePublicIds.length > 0) {
      await deleteMultipleImages(req.body.imagePublicIds);
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// ============================================
// UPDATE PRODUCT (Admin) - WITH CLOUDINARY
// ============================================
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📦 Updating product:', id);

    const product = await Product.findById(id);
    
    if (!product || product.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updateData = { ...req.body };

    // Handle new images if uploaded
    if (req.files && req.files.length > 0) {
      console.log(`📤 Uploading ${req.files.length} new images to Cloudinary...`);
      
      // Upload new images
      const uploadResults = await uploadMultipleImages(
        req.files,
        {
          preset: 'product',
          folder: FOLDERS.PRODUCTS
        }
      );

      const newImageUrls = uploadResults.map(result => result.url);
      const newImagePublicIds = uploadResults.map(result => result.publicId);

      // Delete old images from Cloudinary
      if (product.imagePublicIds && product.imagePublicIds.length > 0) {
        console.log('🗑️ Deleting old images from Cloudinary...');
        await deleteMultipleImages(product.imagePublicIds);
      }

      // Update with new images
      updateData.images = newImageUrls;
      updateData.imagePublicIds = newImagePublicIds;
      
      console.log('✅ Images updated successfully');
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('category', 'name');

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// ============================================
// DELETE PRODUCT (Admin) - WITH CLOUDINARY CLEANUP
// ============================================
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting product:', id);

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from Cloudinary
    if (product.imagePublicIds && product.imagePublicIds.length > 0) {
      console.log(`🗑️ Deleting ${product.imagePublicIds.length} images from Cloudinary...`);
      await deleteMultipleImages(product.imagePublicIds);
      console.log('✅ Images deleted from Cloudinary');
    }

    // Delete product
    await Product.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Product and images deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

// ============================================
// UPLOAD PRODUCT IMAGES (Before creating product)
// ============================================
exports.uploadProductImages = async (req, res) => {
  try {
    console.log('📤 Uploading product images to Cloudinary');
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    const uploadResults = await uploadMultipleImages(
      req.files,
      {
        preset: 'product',
        folder: FOLDERS.PRODUCTS
      }
    );

    const imageUrls = uploadResults.map(result => result.url);
    const imagePublicIds = uploadResults.map(result => result.publicId);

    res.json({
      success: true,
      message: `${imageUrls.length} images uploaded successfully`,
      images: imageUrls,
      imagePublicIds: imagePublicIds
    });

  } catch (error) {
    console.error('❌ Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
};

// ============================================
// UPLOAD SINGLE IMAGE
// ============================================
exports.uploadImage = async (req, res) => {
  try {
    console.log('📤 Uploading single image to Cloudinary');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const result = await uploadImage(
      req.file.buffer,
      {
        preset: 'product',
        folder: FOLDERS.PRODUCTS
      }
    );

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: result.url,
      imagePublicId: result.publicId
    });

  } catch (error) {
    console.error('❌ Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
};

// ============================================
// DELETE PRODUCT IMAGE (From existing product)
// ============================================
exports.deleteProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find the index of image to delete
    const imageIndex = product.images.indexOf(imageUrl);
    
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found in product'
      });
    }

    // Get public ID and delete from Cloudinary
    const publicId = product.imagePublicIds[imageIndex];
    if (publicId) {
      await deleteImage(publicId);
    }

    // Remove from product
    product.images.splice(imageIndex, 1);
    product.imagePublicIds.splice(imageIndex, 1);
    
    await product.save();

    res.json({
      success: true,
      message: 'Image deleted successfully',
      product
    });

  } catch (error) {
    console.error('❌ Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
};