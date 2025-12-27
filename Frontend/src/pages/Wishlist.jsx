// ============================================
// FIXED: Wishlist.jsx
// Path: Frontend/src/pages/Wishlist.jsx
// ============================================
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

const getImageUrl = (path) => {
  if (!path) return '/placeholder.png';
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4001';
  return `${baseUrl}${path}`;
};

export default function Wishlist() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // ✅ FIXED: Destructure 'items' from useWishlist
  const { 
    items: wishlistItems, 
    loading, 
    removeFromWishlist, 
    clearWishlist 
  } = useWishlist();
  
  const { addToCart } = useCart();
  
  const [processingItems, setProcessingItems] = useState(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view your wishlist');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleRemove = async (productId) => {
    if (processingItems.has(productId)) return;

    try {
      setProcessingItems(prev => new Set(prev).add(productId));
      await removeFromWishlist(productId);
      toast.success('Removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove item');
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleMoveToCart = async (product) => {
    if (processingItems.has(product._id)) return;

    try {
      setProcessingItems(prev => new Set(prev).add(product._id));
      await addToCart(product._id, 1);
      await removeFromWishlist(product._id);
      toast.success('Moved to cart!');
    } catch (error) {
      console.error('Error moving to cart:', error);
      toast.error('Failed to move to cart');
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(product._id);
        return newSet;
      });
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      try {
        await clearWishlist();
        toast.success('Wishlist cleared');
      } catch (error) {
        console.error('Error clearing wishlist:', error);
        toast.error('Failed to clear wishlist');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  // ✅ FIXED: Use wishlistItems instead of undefined 'items'
  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Heart size={48} className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Your Wishlist is Empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Start adding products you love to your wishlist. You can save them for later or share with friends!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <Package size={20} />
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Wishlist
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          
          {wishlistItems.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
              Clear All
            </button>
          )}
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => {
            const product = item.product || item;
            const isProcessing = processingItems.has(product._id);

            return (
              <div
                key={product._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                {/* Product Image */}
                <Link to={`/products/${product.slug || product._id}`} className="block relative">
                  <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                    <img
                      src={getImageUrl(product.images?.[0])}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = '/placeholder.png';
                      }}
                    />
                  </div>

                  {/* Discount Badge */}
                  {product.discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      -{product.discount}%
                    </div>
                  )}

                  {/* Stock Badge */}
                  {product.stock === 0 && (
                    <div className="absolute top-3 right-3 bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Out of Stock
                    </div>
                  )}
                </Link>

                {/* Product Details */}
                <div className="p-4">
                  <Link to={`/products/${product.slug || product._id}`}>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                      ₹{product.salePrice || product.price}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                        ₹{product.price}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMoveToCart(product)}
                      disabled={isProcessing || product.stock === 0}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart size={18} />
                      {isProcessing ? 'Moving...' : 'Add to Cart'}
                    </button>

                    <button
                      onClick={() => handleRemove(product._id)}
                      disabled={isProcessing}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Continue Shopping */}
        <div className="mt-8 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors font-medium"
          >
            <Package size={20} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}