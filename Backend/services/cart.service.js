// ============================================
// FILE #10: services/cart.service.js
// ============================================
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

class CartService {
  async getOrCreateCart(userId) {
    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: userId });
    }
    return cart;
  }

  async addToCart(userId, productId, quantity) {
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');
    if (!product.isActive) throw new Error('Product is not available');
    if (product.stock < quantity) throw new Error(`Only ${product.stock} items available`);

    const cart = await this.getOrCreateCart(userId);
    await cart.addItem(productId, quantity, product.price, {
      name: product.name,
      image: product.images[0]?.url,
      sku: product.sku
    });
    
    return cart;
  }

  async updateQuantity(userId, productId, quantity) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error('Cart not found');

    const product = await Product.findById(productId);
    if (product.stock < quantity) {
      throw new Error(`Only ${product.stock} items available`);
    }

    await cart.updateItemQuantity(productId, quantity);
    return cart;
  }

  async removeItem(userId, productId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new Error('Cart not found');
    await cart.removeItem(productId);
    return cart;
  }

  async clearCart(userId) {
    const cart = await Cart.findOne({ user: userId });
    if (cart) await cart.clearCart();
    return cart;
  }

  async validateCart(userId) {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const errors = [];
    for (const item of cart.items) {
      if (!item.product) {
        errors.push(`Product no longer available`);
        continue;
      }
      if (!item.product.isActive) {
        errors.push(`${item.product.name} is not available`);
      }
      if (item.product.stock < item.quantity) {
        errors.push(`${item.product.name}: Only ${item.product.stock} available`);
      }
      if (item.product.price !== item.price) {
        errors.push(`${item.product.name}: Price has changed`);
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}

module.exports = new CartService();
