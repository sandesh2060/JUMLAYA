// pages/ProductDetails.jsx — Clean Customer-Focused Product Page
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  Star,
  MessageCircle,
  Package,
  Shield,
  Truck,
  RotateCcw,
  Minus,
  Plus,
  Check,
  ArrowLeft,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProductImageGallery } from "@components/product/ProductImageGallery";
import { ReviewForm } from "@components/product/ReviewForm";
import { ReviewList } from "@components/product/ReviewList";
import { Rating } from "@components/common/Rating";
import { Breadcrumb } from "@components/layout/Breadcrumb";
import { formatPrice } from "@utils/helpers";
import { useCart } from "@hooks/useCart";
import { useWishlist } from "@hooks/useWishlist";
import { useAuth } from "@hooks/useAuth";
import { productAPI } from "@api/product.api";
import toast from "react-hot-toast";

// ─── Skeleton ────────────────────────────────────────────────────────────────
const Sk = ({ className = "" }) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`}
  />
);

const ProductSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
    <div className="max-w-6xl mx-auto">
      <Sk className="h-4 w-48 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <Sk className="aspect-square w-full rounded-2xl" />
        <div className="space-y-5">
          <Sk className="h-5 w-20" />
          <Sk className="h-9 w-3/4" />
          <Sk className="h-4 w-36" />
          <Sk className="h-11 w-28" />
          <Sk className="h-20 w-full" />
          <Sk className="h-12 w-full" />
        </div>
      </div>
    </div>
  </div>
);

// ─── Quantity Stepper ─────────────────────────────────────────────────────────
const QuantityStepper = ({ value, min = 1, max, onChange }) => (
  <div className="inline-flex items-center rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
    <button
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      <Minus size={15} />
    </button>
    <span className="w-12 h-10 flex items-center justify-center text-sm font-bold text-gray-900 dark:text-white border-x border-gray-200 dark:border-gray-700 select-none tabular-nums">
      {value}
    </span>
    <button
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      <Plus size={15} />
    </button>
  </div>
);

// ─── Tab Button ───────────────────────────────────────────────────────────────
const TabBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`relative pb-3 px-1 text-sm font-semibold transition-colors whitespace-nowrap
      ${
        active
          ? "text-green-600 dark:text-green-400"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      }`}
  >
    {children}
    <span
      className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-green-600 dark:bg-green-400 transition-transform duration-300 origin-left ${active ? "scale-x-100" : "scale-x-0"}`}
    />
  </button>
);

// ─── Star Distribution Bar ────────────────────────────────────────────────────
const StarBar = ({ stars, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 dark:text-gray-400 w-3 text-right tabular-nums">
        {stars}
      </span>
      <Star size={10} className="shrink-0 fill-yellow-400 text-yellow-400" />
      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-6 text-right tabular-nums">
        {count}
      </span>
    </div>
  );
};

// ─── Trust Badge ──────────────────────────────────────────────────────────────
const TRUST_BADGES = [
  { icon: Truck, label: "Free Delivery" },
  { icon: Shield, label: "Secure Payment" },
  { icon: RotateCcw, label: "Easy Returns" },
  { icon: Package, label: "Quality Packed" },
];

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════
const ProductDetails = () => {
  const { t } = useTranslation();
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

  const identifier = params.slug || params.id || params["*"];

  useEffect(() => {
    if (identifier) fetchProduct();
  }, [identifier]);

  const fetchProduct = async () => {
    try {
      let data;
      try {
        data = await productAPI.getBySlug(identifier);
      } catch (err) {
        if (err.response?.status === 404)
          data = await productAPI.getById(identifier);
        else throw err;
      }
      setProduct(data.product);
    } catch {
      toast.error("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product._id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    } catch {
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }
    setTogglingWishlist(true);
    try {
      isInWishlist(product._id)
        ? await removeFromWishlist(product._id)
        : await addToWishlist(product._id);
    } catch {
    } finally {
      setTogglingWishlist(false);
    }
  };

  const handleReviewSubmitSuccess = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    fetchProduct();
    toast.success("Review submitted!");
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
    setActiveTab("reviews");
    setTimeout(
      () =>
        document
          .getElementById("review-form")
          ?.scrollIntoView({ behavior: "smooth" }),
      100,
    );
  };

  if (loading) return <ProductSkeleton />;

  if (!product)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 gap-4 px-4 text-center">
        <Package size={56} className="text-gray-300 dark:text-gray-600" />
        <p className="text-lg font-semibold text-gray-500 dark:text-gray-400">
          Product not found
        </p>
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold hover:underline text-sm"
        >
          <ArrowLeft size={16} /> Back to Products
        </button>
      </div>
    );

  const inWishlist = isInWishlist(product._id);
  const isOutOfStock = product.stock <= 0;
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;
  const ratingDist = product.ratingDistribution || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: t("nav.products") || "Products", link: "/products" },
              { label: product.name },
            ]}
          />
        </div>

        {/* ── Hero Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-start">
          {/* Image */}
          <div className="relative md:sticky md:top-6 self-start">
            {discount > 0 && (
              <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md pointer-events-none">
                -{discount}%
              </div>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 z-10 rounded-2xl bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-bold px-6 py-2 rounded-full shadow-xl">
                  Out of Stock
                </span>
              </div>
            )}
            <div className="rounded-2xl overflow-hidden ring-1 ring-gray-200 dark:ring-gray-700 shadow-sm">
              <ProductImageGallery images={product.images} />
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            {/* Category */}
            {product.category?.name && (
              <span className="text-xs font-bold uppercase tracking-widest text-green-600 dark:text-green-400">
                {product.category.name}
              </span>
            )}

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight -mt-1">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex flex-wrap items-center gap-2">
              <Rating value={product.rating || 0} showValue />
              <span className="text-sm text-gray-400">
                ({product.reviewCount || 0} reviews)
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              {isOutOfStock ? (
                <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-full">
                  Out of Stock
                </span>
              ) : (
                <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full">
                  In Stock
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex flex-wrap items-end gap-3">
              <span className="text-3xl sm:text-4xl font-black text-green-600 dark:text-green-400 leading-none">
                {formatPrice(product.price)}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-xl text-gray-400 line-through leading-none">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-full self-end mb-0.5">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Short description */}
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-4">
              {product.description}
            </p>

            {/* Qty + CTA */}
            {!isOutOfStock && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                      Quantity
                    </p>
                    <QuantityStepper
                      value={quantity}
                      min={1}
                      max={product.stock}
                      onChange={setQuantity}
                    />
                  </div>
                  <p className="text-xs text-gray-400 self-end pb-1">
                    <span className="font-semibold text-gray-600 dark:text-gray-300">
                      {product.stock}
                    </span>{" "}
                    available
                  </p>
                </div>

                <div className="flex gap-3">
                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className={`flex-1 flex items-center justify-center gap-2 h-12 px-5 rounded-xl font-bold text-sm text-white transition-all duration-200 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-green-500/20
                      ${addedToCart ? "bg-green-700" : "bg-green-600 hover:bg-green-700"}`}
                  >
                    {addingToCart ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                        Adding…
                      </>
                    ) : addedToCart ? (
                      <>
                        <Check size={17} /> Added!
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={17} /> Add to Cart
                      </>
                    )}
                  </button>

                  {/* Wishlist */}
                  <button
                    onClick={handleWishlist}
                    disabled={togglingWishlist}
                    aria-label={
                      inWishlist ? "Remove from wishlist" : "Add to wishlist"
                    }
                    className={`w-12 h-12 flex items-center justify-center shrink-0 rounded-xl border-2 transition-all duration-200 active:scale-95 disabled:opacity-60
                      ${
                        inWishlist
                          ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-500"
                          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 hover:border-red-300 hover:text-red-400"
                      }`}
                  >
                    {togglingWishlist ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Heart
                        size={18}
                        className={inWishlist ? "fill-current" : ""}
                      />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2.5"
                >
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/20 shrink-0">
                    <Icon
                      size={14}
                      className="text-green-600 dark:text-green-400"
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Meta */}
            {(product.category?.name || product.sku) && (
              <div className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {product.category?.name && (
                      <tr>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-medium w-2/5">
                          Category
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white font-semibold">
                          {product.category.name}
                        </td>
                      </tr>
                    )}
                    {product.sku && (
                      <tr>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">
                          SKU
                        </td>
                        <td className="px-4 py-3 text-gray-900 dark:text-white font-mono text-xs">
                          {product.sku}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-medium">
                        Available
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white font-semibold">
                        {product.stock} units
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-12 sm:mt-16">
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto scrollbar-none">
            <div className="flex gap-7 min-w-max">
              <TabBtn
                active={activeTab === "description"}
                onClick={() => setActiveTab("description")}
              >
                Description
              </TabBtn>
              <TabBtn
                active={activeTab === "reviews"}
                onClick={() => setActiveTab("reviews")}
              >
                <span className="flex items-center gap-2">
                  <MessageCircle size={14} />
                  Reviews
                  {product.reviewCount > 0 && (
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                      {product.reviewCount}
                    </span>
                  )}
                </span>
              </TabBtn>
            </div>
          </div>

          {/* Description Tab */}
          {activeTab === "description" && (
            <div className="max-w-3xl">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Product Description
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-[15px]">
                  {product.description}
                </p>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="space-y-5 max-w-3xl">
              {/* Rating overview */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-7 border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-6 items-center">
                  <div className="flex flex-col items-center text-center">
                    <p className="text-6xl font-black text-gray-900 dark:text-white leading-none">
                      {product.rating?.toFixed(1) ?? "0.0"}
                    </p>
                    <Rating
                      value={product.rating || 0}
                      size={16}
                      className="mt-2 mb-1"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {product.reviewCount || 0} reviews
                    </p>
                  </div>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((s) => (
                      <StarBar
                        key={s}
                        stars={s}
                        count={ratingDist[s] || 0}
                        total={product.reviewCount || 0}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Write review button */}
              {isAuthenticated && (
                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all border-2
                    ${
                      showReviewForm
                        ? "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800"
                        : "border-green-600 bg-green-600 text-white hover:bg-green-700 hover:border-green-700 shadow-md shadow-green-500/20"
                    }`}
                >
                  {showReviewForm ? (
                    "Cancel"
                  ) : (
                    <>
                      <Star size={14} /> Write a Review
                    </>
                  )}
                </button>
              )}

              {/* Review form */}
              {showReviewForm && isAuthenticated && (
                <div
                  id="review-form"
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-7 border border-gray-100 dark:border-gray-700"
                >
                  <ReviewForm
                    productId={product._id}
                    existingReview={editingReview}
                    onSubmitSuccess={handleReviewSubmitSuccess}
                  />
                </div>
              )}

              {/* Review list */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-7 border border-gray-100 dark:border-gray-700">
                <ReviewList
                  productId={product._id}
                  currentUserId={user?._id}
                  onEditReview={handleEditReview}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
