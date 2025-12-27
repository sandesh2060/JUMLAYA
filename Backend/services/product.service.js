// Backend/services/product.service.js
const Product = require("../models/product.model");
const Category = require("../models/category.model");
const Review = require("../models/review.model");
const AppError = require("../utils/AppError");

class ProductService {
  // ==================== GET ALL PRODUCTS ====================
  async getAllProducts(queryParams) {
    const {
      page = 1,
      limit = 20,
      sort = "-createdAt",
      category,
      productType,
      search,
      minPrice,
      maxPrice,
      isOrganic,
      isFeatured,
      isActive,
      inStock,
    } = queryParams;

    // Build filter
    const filter = {};

    if (category) filter.category = category;
    if (productType) filter.productType = productType;
    if (isOrganic !== undefined) filter.isOrganic = isOrganic === "true";
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === "true";
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (inStock === "true") filter.stock = { $gt: 0 };

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Execute query
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(filter),
    ]);

    return {
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      limit: Number(limit),
    };
  }

  // ==================== GET PRODUCT BY ID ====================
  async getProductById(id) {
    const product = await Product.findById(id)
      .populate("category", "name slug")
      .populate({
        path: "reviews",
        match: { status: "approved" },
        populate: { path: "user", select: "firstname lastname avatar" },
      })
      .lean();

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return product;
  }

  // ==================== GET PRODUCT BY SLUG ====================
  async getProductBySlug(slug) {
    const product = await Product.findOne({ slug })
      .populate("category", "name slug")
      .populate({
        path: "reviews",
        match: { status: "approved" },
        populate: { path: "user", select: "firstname lastname avatar" },
      })
      .lean();

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Increment view count
    await Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } });

    return product;
  }

  // ==================== CREATE PRODUCT ====================
  async createProduct(productData) {
    // Validate category exists
    if (productData.category) {
      const categoryExists = await Category.findById(productData.category);
      if (!categoryExists) {
        throw new AppError("Category not found", 404);
      }
    }

    // Calculate original price if not provided
    if (!productData.originalPrice && productData.discount) {
      productData.originalPrice =
        productData.price / (1 - productData.discount / 100);
    }

    const product = await Product.create(productData);

    return product;
  }

  // ==================== UPDATE PRODUCT ====================
  async updateProduct(id, updateData) {
    // Validate category if being updated
    if (updateData.category) {
      const categoryExists = await Category.findById(updateData.category);
      if (!categoryExists) {
        throw new AppError("Category not found", 404);
      }
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("category", "name slug");

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return product;
  }

  // ==================== DELETE PRODUCT ====================
  async deleteProduct(id) {
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Delete associated reviews
    await Review.deleteMany({ product: id });

    return product;
  }

  // ==================== UPDATE STOCK ====================
  async updateStock(id, quantity) {
    const product = await Product.findByIdAndUpdate(
      id,
      { stock: quantity },
      { new: true, runValidators: true }
    );

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return product;
  }

  // ==================== DECREASE STOCK (for orders) ====================
  async decreaseStock(productId, quantity) {
    const product = await Product.findById(productId);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (product.stock < quantity) {
      throw new AppError(`Insufficient stock for ${product.name}`, 400);
    }

    product.stock -= quantity;
    product.sold = (product.sold || 0) + quantity;
    await product.save();

    return product;
  }

  // ==================== INCREASE STOCK (for cancellations) ====================
  async increaseStock(productId, quantity) {
    const product = await Product.findByIdAndUpdate(
      productId,
      {
        $inc: { stock: quantity, sold: -quantity },
      },
      { new: true }
    );

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return product;
  }

  // ==================== BULK CREATE ====================
  async bulkCreateProducts(productsData) {
    const products = await Product.insertMany(productsData, {
      ordered: false,
    });
    return products;
  }

  // ==================== BULK UPDATE ====================
  async bulkUpdateProducts(updates) {
    const updatePromises = updates.map((update) =>
      Product.findByIdAndUpdate(update.id, update.data, { new: true })
    );

    const products = await Promise.all(updatePromises);
    return products.filter((p) => p !== null);
  }

  // ==================== BULK DELETE ====================
  async bulkDeleteProducts(productIds) {
    const result = await Product.deleteMany({ _id: { $in: productIds } });
    await Review.deleteMany({ product: { $in: productIds } });
    return result;
  }

  // ==================== GET FEATURED PRODUCTS ====================
  async getFeaturedProducts(limit = 10) {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate("category", "name slug")
      .sort("-createdAt")
      .limit(limit)
      .lean();

    return products;
  }

  // ==================== GET TOP SELLING ====================
  async getTopSellingProducts(limit = 10) {
    const products = await Product.find({ isActive: true })
      .populate("category", "name slug")
      .sort("-sold")
      .limit(limit)
      .lean();

    return products;
  }

  // ==================== GET RELATED PRODUCTS ====================
  async getRelatedProducts(productId, limit = 6) {
    const product = await Product.findById(productId);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const relatedProducts = await Product.find({
      _id: { $ne: productId },
      $or: [
        { category: product.category },
        { productType: product.productType },
      ],
      isActive: true,
    })
      .populate("category", "name slug")
      .limit(limit)
      .lean();

    return relatedProducts;
  }

  // ==================== UPDATE RATING ====================
  async updateProductRating(productId) {
    const reviews = await Review.find({
      product: productId,
      status: "approved",
    });

    const avgRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length || 0;

    await Product.findByIdAndUpdate(productId, {
      rating: avgRating.toFixed(1),
      reviewCount: reviews.length,
    });
  }

  // ==================== GET LOW STOCK PRODUCTS ====================
  async getLowStockProducts(threshold = 10) {
    const products = await Product.find({
      stock: { $lte: threshold, $gt: 0 },
      isActive: true,
    })
      .populate("category", "name slug")
      .sort("stock")
      .lean();

    return products;
  }

  // ==================== GET OUT OF STOCK PRODUCTS ====================
  async getOutOfStockProducts() {
    const products = await Product.find({ stock: 0 })
      .populate("category", "name slug")
      .lean();

    return products;
  }
}

module.exports = new ProductService();