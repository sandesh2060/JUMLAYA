// ============================================
// FILE #13: services/inventory.service.js
// ============================================
const Product = require('../models/product.model');

class InventoryService {
  async updateStock(productId, quantity, operation = 'decrease') {
    const multiplier = operation === 'decrease' ? -1 : 1;
    
    const product = await Product.findByIdAndUpdate(
      productId,
      { $inc: { stock: multiplier * quantity } },
      { new: true }
    );

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  async bulkUpdateStock(items, operation = 'decrease') {
    const updates = items.map(async (item) => {
      return this.updateStock(item.product, item.quantity, operation);
    });

    return await Promise.all(updates);
  }

  async checkStockAvailability(productId, quantity) {
    const product = await Product.findById(productId);
    
    if (!product) {
      return { available: false, reason: 'Product not found' };
    }

    if (!product.isActive) {
      return { available: false, reason: 'Product not available' };
    }

    if (product.stock < quantity) {
      return { 
        available: false, 
        reason: `Only ${product.stock} items available`,
        availableStock: product.stock
      };
    }

    return { available: true };
  }

  async getLowStockProducts(threshold = 10) {
    return await Product.find({
      stock: { $lt: threshold, $gt: 0 },
      isActive: true
    }).select('name stock sku');
  }

  async getOutOfStockProducts() {
    return await Product.find({
      stock: 0,
      isActive: true
    }).select('name sku');
  }
}

module.exports = new InventoryService();