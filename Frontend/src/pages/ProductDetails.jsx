// pages/ProductDetails.jsx - FIXED to handle both slug and ID
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, Star, MessageCircle } from "lucide-react";
import { ProductImageGallery } from "@components/product/ProductImageGallery";
import { ReviewForm } from "@components/product/ReviewForm";
import { ReviewList } from "@components/product/ReviewList";
import { Rating } from "@components/common/Rating";
import { Button } from "@components/common/Button";
import { Badge } from "@components/common/Badge";
import { Breadcrumb } from "@components/layout/Breadcrumb";
import { LoadingSpinner } from "@components/common/LoadingSpinner";
import { formatPrice } from "@utils/helpers";
import { useCart } from "@hooks/useCart";
import { useWishlist } from "@hooks/useWishlist";
import { useAuth } from "@hooks/useAuth";
import { productAPI } from "@api/product.api";
import toast from "react-hot-toast";

const ProductDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // ✅ FIX: Get either slug or id from params
  const identifier = params.slug || params.id || params['*'];

  useEffect(() => {
    if (identifier) {
      fetchProduct();
    }
  }, [identifier]);

  const fetchProduct = async () => {
    try {
      let data;
      // ✅ FIX: Try to fetch by slug first, if it fails try by ID
      try {
        data = await productAPI.getBySlug(identifier);
      } catch (error) {
        // If slug fails, try fetching by ID
        if (error.response?.status === 404) {
          data = await productAPI.getById(identifier);
        } else {
          throw error;
        }
      }
      setProduct(data.product);
    } catch (error) {
      console.error("Failed to fetch product:", error);
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    setAddingToCart(true);
    try {
      await addToCart(product._id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (error) {
      console.error("Add to cart error:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to manage your wishlist");
      navigate("/login");
      return;
    }

    setTogglingWishlist(true);
    try {
      const inWishlist = isInWishlist(product._id);
      if (inWishlist) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setTogglingWishlist(false);
    }
  };

  const handleReviewSubmitSuccess = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    fetchProduct();
    toast.success("Review submitted successfully!");
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
    setActiveTab("reviews");
    setTimeout(() => {
      document
        .getElementById("review-form")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900">
        <p className="text-center text-gray-500 dark:text-gray-400">
          Product not found
        </p>
      </div>
    );
  }

  const inWishlist = isInWishlist(product._id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: "Products", link: "/products" },
            { label: product.name },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-8">
          {/* Images */}
          <div>
            <ProductImageGallery images={product.images} />
          </div>

          {/* Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {product.name}
            </h1>

            {/* Rating Summary */}
            <div className="flex items-center gap-4 mb-4">
              <Rating value={product.rating || 0} showValue />
              <span className="text-gray-500 dark:text-gray-400">
                ({product.reviewCount || 0} reviews)
              </span>
              {product.stock > 0 ? (
                <Badge variant="success">In Stock</Badge>
              ) : (
                <Badge variant="danger">Out of Stock</Badge>
              )}
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatPrice(product.price)}
              </div>

              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                    <Badge variant="danger">
                      {Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100
                      )}
                      % OFF
                    </Badge>
                  </div>
                )}
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {product.description}
            </p>

            {/* Quantity & Actions */}
            {product.stock > 0 && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                    {product.stock} available
                  </span>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {addingToCart ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Adding...
                      </>
                    ) : addedToCart ? (
                      <>
                        <ShoppingCart size={20} />
                        Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        Add to Cart
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleWishlist}
                    disabled={togglingWishlist}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                      inWishlist
                        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {togglingWishlist ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Heart
                        size={20}
                        className={inWishlist ? "fill-current" : ""}
                      />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-600 dark:text-gray-400">Category</dt>
                  <dd className="font-medium text-gray-900 dark:text-white">
                    {product.category?.name}
                  </dd>
                </div>
               
              </dl>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab("description")}
                className={`pb-4 px-2 font-medium transition-colors relative ${
                  activeTab === "description"
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                Description
                {activeTab === "description" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 dark:bg-green-400"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`pb-4 px-2 font-medium transition-colors relative flex items-center gap-2 ${
                  activeTab === "reviews"
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <MessageCircle size={20} />
                Reviews ({product.reviewCount || 0})
                {activeTab === "reviews" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600 dark:bg-green-400"></div>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "description" && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Product Description
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-8">
              {/* Rating Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                      {product.rating?.toFixed(1) || "0.0"}
                    </div>
                    <Rating value={product.rating || 0} size={24} />
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      Based on {product.reviewCount || 0} reviews
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((stars) => (
                        <div key={stars} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                            {stars}{" "}
                            <Star
                              size={14}
                              className="inline fill-yellow-400 text-yellow-400"
                            />
                          </span>
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400"
                              style={{ width: "0%" }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                            0
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Write Review Button */}
              {isAuthenticated && (
                <div className="flex justify-center">
                  <Button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    variant={showReviewForm ? "outline" : "primary"}
                  >
                    {showReviewForm ? "Cancel" : "Write a Review"}
                  </Button>
                </div>
              )}

              {/* Review Form */}
              {showReviewForm && isAuthenticated && (
                <div id="review-form">
                  <ReviewForm
                    productId={product._id}
                    existingReview={editingReview}
                    onSubmitSuccess={handleReviewSubmitSuccess}
                  />
                </div>
              )}

              {/* Review List */}
              <ReviewList
                productId={product._id}
                currentUserId={user?._id}
                onEditReview={handleEditReview}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;