// Frontend/src/context/WishlistContext.jsx
import { createContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom'; // ✅ ADD THIS
import { wishlistAPI } from '../api/wishlist.api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation(); // ✅ ADD THIS
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch wishlist from backend
  const fetchWishlist = useCallback(async () => {
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
      console.log('🔄 Fetching wishlist...');
      const response = await wishlistAPI.get();
      
      const wishlistItems = response?.data?.wishlist?.items || response?.data?.items || [];
      setItems(wishlistItems);
      setError(null);
      console.log('✅ Wishlist fetched:', wishlistItems);
    } catch (err) {
      console.error('❌ Error fetching wishlist:', err);
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, location.pathname]); // ✅ ADD location.pathname to dependencies

  // Fetch wishlist on mount and when auth changes
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);


  // Add item to wishlist
  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      console.log('➕ Adding to wishlist:', productId);
      const response = await wishlistAPI.add(productId);
      
      // Update local state
      const wishlistItems = response?.data?.wishlist?.items || response?.data?.items || [];
      setItems(wishlistItems);
      
      toast.success('Added to wishlist!');
      return response;
    } catch (err) {
      console.error('❌ Error adding to wishlist:', err);
      toast.error(err.response?.data?.message || 'Failed to add to wishlist');
      throw err;
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      return;
    }

    try {
      console.log('🗑️ Removing from wishlist:', productId);
      const response = await wishlistAPI.remove(productId);
      
      // Update local state
      const wishlistItems = response?.data?.wishlist?.items || response?.data?.items || [];
      setItems(wishlistItems);
      
      toast.success('Removed from wishlist');
      return response;
    } catch (err) {
      console.error('❌ Error removing from wishlist:', err);
      toast.error(err.response?.data?.message || 'Failed to remove item');
      throw err;
    }
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      return;
    }

    try {
      console.log('🧹 Clearing wishlist...');
      const response = await wishlistAPI.clear();
      
      setItems([]);
      toast.success('Wishlist cleared');
      return response;
    } catch (err) {
      console.error('❌ Error clearing wishlist:', err);
      toast.error(err.response?.data?.message || 'Failed to clear wishlist');
      throw err;
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return items.some(item => 
      item.product?._id === productId || 
      item.productId === productId ||
      item._id === productId
    );
  };

  // Move item from wishlist to cart
  const moveToCart = async (productId) => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      return;
    }

    try {
      console.log('🛒 Moving to cart:', productId);
      const response = await wishlistAPI.moveToCart(productId);
      
      // Update local state
      const wishlistItems = response?.data?.wishlist?.items || response?.data?.items || [];
      setItems(wishlistItems);
      
      toast.success('Moved to cart!');
      return response;
    } catch (err) {
      console.error('❌ Error moving to cart:', err);
      toast.error(err.response?.data?.message || 'Failed to move to cart');
      throw err;
    }
  };

  // Get wishlist count
  const getWishlistCount = () => {
    return items.length;
  };

// At the end of WishlistContext.jsx, add:
const value = {
  items,
  wishlist: items, // ✅ Add this alias for backward compatibility
  loading,
  error,
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  isInWishlist,
  moveToCart,
  getWishlistCount,
};
  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export { WishlistContext, WishlistProvider };