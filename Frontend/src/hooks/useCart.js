// ============================================
// Frontend/src/hooks/useCart.js - FULLY FIXED
// ============================================
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  // 🔍 DEBUG: Log what we're getting from context
  console.log('🛒 useCart - context.items:', context.items);
  console.log('🛒 useCart - items length:', context.items?.length);

  // Calculate totals from cart items
  const calculateTotals = () => {
    const items = context.items || [];
    
    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => {
      const price = item.product?.salePrice || item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);
    
    // Calculate tax (13% VAT)
    const tax = Math.round(subtotal * 0.13);
    
    // Calculate shipping (free for orders >= 2000)
    const shippingFee = subtotal >= 2000 ? 0 : 100;
    
    // Discount (if any)
    const discount = 0;
    
    // Total
    const total = subtotal + tax + shippingFee - discount;
    
    return {
      subtotal,
      tax,
      shippingFee,
      discount,
      total
    };
  };

  const totals = calculateTotals();

  // ✅ CRITICAL FIX: Return items directly, not wrapped in cart object
  // Cart.jsx expects: const { items: cartItems } = useCart()
  return {
    // ✅ Return items directly (not cart.items)
    items: context.items || [],
    
    // Also provide cart object for Checkout.jsx compatibility
    cart: {
      items: context.items || [],
      subtotal: totals.subtotal,
      tax: totals.tax,
      shippingFee: totals.shippingFee,
      discount: totals.discount,
      total: totals.total,
    },
    
    loading: context.loading,
    error: context.error,
    addToCart: context.addToCart,
    updateCartItem: context.updateCartItem,
    removeFromCart: context.removeFromCart,
    clearCart: context.clearCart,
    fetchCart: context.fetchCart,
    getCartTotal: context.getCartTotal,
    getCartCount: context.getCartCount,
  };
};

export default useCart;