import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart } from "lucide-react";
import { Rating } from "@components/common/Rating";
import { formatPrice, getImageUrl } from "@utils/helpers";
import { useCart } from "@hooks/useCart";
import { useWishlist } from "@hooks/useWishlist";
import { useAuth } from "@hooks/useAuth";
import toast from "react-hot-toast";
import { useState } from "react";

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  // Check if product is in wishlist
  const inWishlist = isInWishlist(product._id);

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to manage your wishlist");
      navigate("/login");
      return;
    }

    setWishlistLoading(true);

    try {
      if (inWishlist) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    if (product.stock === 0) {
      toast.error("This product is out of stock");
      return;
    }

    setCartLoading(true);

    try {
      await addToCart(product._id, 1);
      // Successfully added - toast is already shown in CartContext
    } catch (error) {
      console.error("Add to cart error:", error);
      // Error toast is already shown in CartContext
    } finally {
      setCartLoading(false);
    }
  };

  // ✅ FIX: Use slug if available, fallback to _id
  const productLink = product.slug ? `/products/${product.slug}` : `/products/${product._id}`;

  return (
    <Link to={productLink} className="group block">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            src={getImageUrl(product.images?.[0])}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className="absolute top-3 right-3 p-2.5 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed z-10"
            title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            {wishlistLoading ? (
              <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Heart
                size={20}
                className={`transition-colors ${
                  inWishlist
                    ? "fill-red-500 text-red-500"
                    : "text-gray-600 dark:text-gray-400 hover:text-red-500"
                }`}
              />
            )}
          </button>

          {/* Discount Badge */}
          {product.discount > 0 && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-lg">
              {product.discount}% OFF
            </div>
          )}

          {/* Out of Stock Overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
              <span className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg font-semibold text-gray-900 dark:text-white shadow-lg">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors min-h-[3rem]">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <Rating value={product.rating || 0} size={14} />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({product.reviewCount || 0})
            </span>
          </div>

          {/* Price and Cart Button */}
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {formatPrice(product.price)}
              </div>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                    {formatPrice(product.originalPrice)}
                  </div>
                )}
            </div>

            {product.stock > 0 && (
              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all hover:scale-110 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                title="Add to cart"
              >
                {cartLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShoppingCart size={20} />
                )}
              </button>
            )}
          </div>

          {/* Stock Status */}
          {product.stock > 0 && product.stock <= 10 && (
            <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 font-medium">
              Only {product.stock} left in stock!
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};