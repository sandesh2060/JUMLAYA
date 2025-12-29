// ============================================
// CartContext.jsx - FIXED
// Path: Frontend/src/context/CartContext.jsx
// ============================================
import { createContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { cartAPI } from '../api/cart.api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    // Skip if admin route
    if (location.pathname.startsWith('/admin')) {
      setItems([]);
      setLoading(false);
      return;
    }

    if (!isAuthenticated) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔄 Fetching cart...');
      const response = await cartAPI.get();
      
      const cartItems = response?.data?.cart?.items || response?.data?.items || [];
      setItems(cartItems);
      setError(null);
      console.log('✅ Cart fetched:', cartItems);
    } catch (err) {
      console.error('❌ Error fetching cart:', err);
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, location.pathname]);

  // Fetch cart on mount and when auth changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add item to cart
  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      console.log('➕ Adding to cart:', { productId, quantity });
      const response = await cartAPI.add(productId, quantity);
      
      // Update local state
      const cartItems = response?.data?.cart?.items || response?.data?.items || [];
      setItems(cartItems);
      
      toast.success('Added to cart!');
      return response;
    } catch (err) {
      console.error('❌ Error adding to cart:', err);
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      throw err;
    }
  };

  // ✅ FIXED: Update cart item quantity
  // Backend expects: { productId, quantity }
  const updateCartItem = async (productId, quantity) => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      return;
    }

    try {
      console.log('🔄 Updating cart item:', { productId, quantity });
      
      // ✅ FIXED: Pass productId (not itemId) to API
      const response = await cartAPI.update(productId, quantity);
      
      // Update local state
      const cartItems = response?.data?.cart?.items || response?.data?.items || [];
      setItems(cartItems);
      
      // Don't show toast for every quantity change (too annoying)
      // toast.success('Cart updated!');
      return response;
    } catch (err) {
      console.error('❌ Error updating cart:', err);
      toast.error(err.response?.data?.message || 'Failed to update cart');
      throw err;
    }
  };

  // ✅ FIXED: Remove item from cart
  // Backend expects productId in URL params
  const removeFromCart = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      return;
    }

    try {
      console.log('🗑️ Removing from cart:', productId);
      
      // ✅ FIXED: Pass productId (not itemId) to API
      const response = await cartAPI.remove(productId);
      
      // Update local state
      const cartItems = response?.data?.cart?.items || response?.data?.items || [];
      setItems(cartItems);
      
      toast.success('Item removed from cart');
      return response;
    } catch (err) {
      console.error('❌ Error removing from cart:', err);
      toast.error(err.response?.data?.message || 'Failed to remove item');
      throw err;
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      return;
    }

    try {
      console.log('🧹 Clearing cart...');
      const response = await cartAPI.clear();
      
      setItems([]);
      toast.success('Cart cleared');
      return response;
    } catch (err) {
      console.error('❌ Error clearing cart:', err);
      toast.error(err.response?.data?.message || 'Failed to clear cart');
      throw err;
    }
  };

  // Calculate cart total
  const getCartTotal = () => {
    return items.reduce((total, item) => {
      const price = item.product?.salePrice || item.product?.price || 0;
      const quantity = item.quantity || 0;
      return total + (price * quantity);
    }, 0);
  };

  // Get cart count
  const getCartCount = () => {
    return items.reduce((count, item) => count + (item.quantity || 0), 0);
  };

  const value = {
    items,
    loading,
    error,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export { CartContext, CartProvider };