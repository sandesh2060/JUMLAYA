// ============================================
// admin.product.controller.js - FIXED VERSION
// Path: Backend/controllers/admin/admin.product.controller.js
// ============================================
const fs = require('fs');
const path = require('path');
const Product = require('../../models/product.model');

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

    // Build query
    const query = { isDeleted: { $ne: true } };

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // ✅ FIXED: Stock filters
    // Low stock filter (stock <= 10)
    if (lowStock === 'true') {
      query.stock = { $lte: 10 };
    }
    
    // Max stock filter (stock <= maxStock value)
    if (maxStock) {
      const maxStockValue = parseInt(maxStock);
      if (!isNaN(maxStockValue)) {
        query.stock = { $lte: maxStockValue };
      }
    }
    
    // Min stock filter (stock >= minStock value)
    if (minStock) {
      const minStockValue = parseInt(minStock);
      if (!isNaN(minStockValue)) {
        query.stock = query.stock || {};
        query.stock.$gte = minStockValue;
      }
    }

    console.log('📦 Final query:', JSON.stringify(query, null, 2));

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    // Fetch products
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(query)
    ]);

    console.log('✅ Products fetched:', products.length, 'Total:', total);

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
    console.error('❌ Error fetching products:', error);
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
    console.log('📦 Fetching product:', id);

    const product = await Product.findById(id)
      .populate('category', 'name')
      .lean();

    if (!product || product.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log('✅ Product fetched:', product.name);

    res.json({
      success: true,
      message: 'Product retrieved successfully',
      product
    });

  } catch (error) {
    console.error('❌ Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// ============================================
// CREATE PRODUCT (Admin)
// ============================================
exports.createProduct = async (req, res) => {
  try {
    console.log('📦 Creating product:', req.body.name);

    const product = await Product.create(req.body);

    console.log('✅ Product created:', product._id);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// ============================================
// UPDATE PRODUCT (Admin)
// ============================================
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📦 Updating product:', id);

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!product || product.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log('✅ Product updated:', product.name);

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
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
// DELETE PRODUCT (Admin - Soft Delete)
// ============================================
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📦 Permanently deleting product:', id);

    // ✅ FIX: Use findByIdAndDelete to actually remove from database
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log('✅ Product permanently deleted:', product.name);

    res.json({
      success: true,
      message: 'Product deleted successfully'
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
// PERMANENT DELETE (Optional - for cleanup)
// ============================================
exports.permanentDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📦 Permanently deleting product:', id);

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log('✅ Product permanently deleted:', product.name);

    res.json({
      success: true,
      message: 'Product permanently deleted'
    });

  } catch (error) {
    console.error('❌ Error permanently deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to permanently delete product',
      error: error.message
    });
  }
};
// ============================================
// UPLOAD PRODUCT IMAGES (Admin)
// ============================================
exports.uploadProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📦 Uploading images for product:', id);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    // Get image URLs from uploaded files
    const imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);

    // Update product with new images
    const product = await Product.findByIdAndUpdate(
      id,
      { $push: { images: { $each: imageUrls } } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log('✅ Images uploaded:', imageUrls.length);

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      images: imageUrls,
      product
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
// DELETE PRODUCT IMAGE (Admin)
// ============================================
exports.deleteProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    console.log('📦 Deleting image from product:', id);

    const product = await Product.findByIdAndUpdate(
      id,
      { $pull: { images: imageUrl } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    console.log('✅ Image deleted');

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