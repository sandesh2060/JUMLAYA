// Frontend/src/context/CartContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom'; // ✅ ADD THIS
import { cartAPI } from '../api/cart.api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation(); // ✅ ADD THIS
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    // ✅ ADD THIS CHECK - Skip if admin route
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
  }, [isAuthenticated, location.pathname]); // ✅ ADD location.pathname to dependencies

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

  // Update cart item quantity
  const updateCartItem = async (itemId, quantity) => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      return;
    }

    try {
      console.log('🔄 Updating cart item:', { itemId, quantity });
      const response = await cartAPI.update(itemId, quantity);
      
      // Update local state
      const cartItems = response?.data?.cart?.items || response?.data?.items || [];
      setItems(cartItems);
      
      toast.success('Cart updated!');
      return response;
    } catch (err) {
      console.error('❌ Error updating cart:', err);
      toast.error(err.response?.data?.message || 'Failed to update cart');
      throw err;
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      return;
    }

    try {
      console.log('🗑️ Removing from cart:', itemId);
      const response = await cartAPI.remove(itemId);
      
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

// Export Context and Provider separately at the end
export { CartContext, CartProvider };