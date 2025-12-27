// models/category.model.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Category name must be at least 2 characters'],
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    url: {
      type: String
    },
    alt: {
      type: String
    },
    publicId: {
      type: String
    }
  },
  icon: {
    type: String,
    default: '📦'
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0,
    min: 0,
    max: 3
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  productCount: {
    type: Number,
    default: 0
  },
  metaTitle: {
    type: String,
    maxlength: [100, 'Meta title cannot exceed 100 characters']
  },
  metaDescription: {
    type: String,
    maxlength: [200, 'Meta description cannot exceed 200 characters']
  },
  metaKeywords: [{
    type: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ isFeatured: 1 });
categorySchema.index({ order: 1 });
categorySchema.index({ name: 'text', description: 'text' });

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Virtual for products
categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category'
});

// Generate slug before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Update product count after save
categorySchema.post('save', async function(doc) {
  await doc.updateProductCount();
});

// Instance Methods

// Update product count
categorySchema.methods.updateProductCount = async function() {
  const Product = mongoose.model('Product');
  const count = await Product.countDocuments({ 
    category: this._id,
    isActive: true 
  });
  
  if (this.productCount !== count) {
    this.productCount = count;
    await this.save();
  }
  
  return count;
};

// Get full path (for breadcrumbs)
categorySchema.methods.getPath = async function() {
  const path = [this];
  let current = this;

  while (current.parent) {
    current = await this.constructor.findById(current.parent);
    if (current) {
      path.unshift(current);
    } else {
      break;
    }
  }

  return path;
};

// Get all children (recursive)
categorySchema.methods.getAllChildren = async function() {
  const children = await this.constructor.find({ parent: this._id });
  let allChildren = [...children];

  for (const child of children) {
    const grandChildren = await child.getAllChildren();
    allChildren = allChildren.concat(grandChildren);
  }

  return allChildren;
};

// Check if category has children
categorySchema.methods.hasChildren = async function() {
  const count = await this.constructor.countDocuments({ parent: this._id });
  return count > 0;
};

// Check if category can be deleted
categorySchema.methods.canDelete = async function() {
  const hasChildren = await this.hasChildren();
  const hasProducts = this.productCount > 0;
  return !hasChildren && !hasProducts;
};

// Static Methods

// Get root categories
categorySchema.statics.getRootCategories = function() {
  return this.find({ parent: null, isActive: true }).sort({ order: 1 });
};

// Get featured categories
categorySchema.statics.getFeaturedCategories = function(limit = 10) {
  return this.find({ isFeatured: true, isActive: true })
    .sort({ order: 1 })
    .limit(limit);
};

// Get category tree
categorySchema.statics.getCategoryTree = async function() {
  const categories = await this.find({ isActive: true }).sort({ order: 1 });
  
  const buildTree = (parentId = null) => {
    return categories
      .filter(cat => {
        if (parentId === null) return cat.parent === null;
        return cat.parent && cat.parent.toString() === parentId.toString();
      })
      .map(cat => ({
        ...cat.toObject(),
        children: buildTree(cat._id)
      }));
  };

  return buildTree();
};

// Get popular categories (by product count)
categorySchema.statics.getPopularCategories = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ productCount: -1 })
    .limit(limit);
};

// Search categories
categorySchema.statics.searchCategories = function(query) {
  return this.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ],
    isActive: true
  });
};

// Get category by slug
categorySchema.statics.getBySlug = function(slug) {
  return this.findOne({ slug: slug, isActive: true })
    .populate('subcategories');
};

// Bulk update order
categorySchema.statics.updateOrder = async function(orderArray) {
  const bulkOps = orderArray.map((item, index) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { order: index }
    }
  }));
  
  return await this.bulkWrite(bulkOps);
};

// Get category statistics
categorySchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalCategories: { $sum: 1 },
        activeCategories: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        featuredCategories: {
          $sum: { $cond: [{ $eq: ['$isFeatured', true] }, 1, 0] }
        },
        totalProducts: { $sum: '$productCount' },
        averageProductsPerCategory: { $avg: '$productCount' }
      }
    }
  ]);

  return stats[0] || {
    totalCategories: 0,
    activeCategories: 0,
    featuredCategories: 0,
    totalProducts: 0,
    averageProductsPerCategory: 0
  };
};

// Pre-remove middleware
categorySchema.pre('remove', async function(next) {
  // Check if category can be deleted
  const canDelete = await this.canDelete();
  
  if (!canDelete) {
    throw new Error('Cannot delete category with products or subcategories');
  }
  
  next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;