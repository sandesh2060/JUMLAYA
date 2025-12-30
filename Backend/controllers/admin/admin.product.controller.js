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
// CREATE PRODUCT (Admin)
// ============================================
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });

  } catch (error) {
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

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// ============================================
// DELETE PRODUCT (Admin)
// ============================================
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
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

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    const imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);

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

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      images: imageUrls,
      product
    });

  } catch (error) {
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

    res.json({
      success: true,
      message: 'Image deleted successfully',
      product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
};

// ============================================
// UPLOAD SINGLE IMAGE (Before creating product)
// ============================================
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const imageUrl = `/uploads/products/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl,
      filename: req.file.filename
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
};

// ============================================
// UPLOAD MULTIPLE IMAGES (Before creating product)
// ============================================
exports.uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    const imageUrls = req.files.map(file => `/uploads/products/${file.filename}`);

    res.json({
      success: true,
      message: `${imageUrls.length} images uploaded successfully`,
      imageUrls,
      filenames: req.files.map(f => f.filename)
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
};

// ============================================
// DELETE IMAGE FROM SERVER (By filename)
// ============================================
exports.deleteImageFile = async (req, res) => {
  try {
    const { filename } = req.params;

    const filePath = path.join(__dirname, '../../uploads/products', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Image file not found'
      });
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
};
