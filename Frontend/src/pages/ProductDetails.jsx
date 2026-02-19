// pages/ProductDetails.jsx — FULLY RESPONSIVE + TRUST BADGES FIXED
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart, Heart, Star, MessageCircle,
  Package, Shield, Truck, RotateCcw,
  Minus, Plus, Check, ArrowLeft,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProductImageGallery } from "@components/product/ProductImageGallery";
import { ReviewForm }           from "@components/product/ReviewForm";
import { ReviewList }           from "@components/product/ReviewList";
import { Rating }               from "@components/common/Rating";
import { Breadcrumb }           from "@components/layout/Breadcrumb";
import { formatPrice }          from "@utils/helpers";
import { useCart }              from "@hooks/useCart";
import { useWishlist }          from "@hooks/useWishlist";
import { useAuth }              from "@hooks/useAuth";
import { productAPI }           from "@api/product.api";
import toast                    from "react-hot-toast";

/* ─────────────────────────────────────────────────────────────────────────
   TRUST BADGES
   - `label`    = hardcoded fallback (always displays correctly)
   - `labelKey` = i18n key (used if translation exists)
   Add these keys to your locale JSON to enable translations:
     "productDetails.trust.freeDelivery": "Free Delivery"
     "productDetails.trust.securePayment": "Secure Payment"
     "productDetails.trust.easyReturns": "Easy Returns"
     "productDetails.trust.qualityPacked": "Quality Packed"
───────────────────────────────────────────────────────────────────────── */
const TRUST_BADGES = [
  { icon: Truck,      label: "Free Delivery",   labelKey: "productDetails.trust.freeDelivery"  },
  { icon: Shield,     label: "Secure Payment",  labelKey: "productDetails.trust.securePayment" },
  { icon: RotateCcw,  label: "Easy Returns",    labelKey: "productDetails.trust.easyReturns"   },
  { icon: Package,    label: "Quality Packed",  labelKey: "productDetails.trust.qualityPacked" },
];

/* ─────────────────────────────────────────────────────────────────────────
   SKELETON LOADER
───────────────────────────────────────────────────────────────────────── */
const Sk = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl ${className}`} />
);

const ProductSkeleton = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      <Sk className="h-4 w-52 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Sk className="aspect-square w-full rounded-2xl" />
        <div className="space-y-4">
          <Sk className="h-4 w-24" />
          <Sk className="h-8 w-3/4" />
          <Sk className="h-4 w-40" />
          <Sk className="h-10 w-32" />
          <Sk className="h-16 w-full" />
          <Sk className="h-12 w-full" />
          <div className="grid grid-cols-2 gap-2 pt-1">
            {[0, 1, 2, 3].map((i) => <Sk key={i} className="h-11 rounded-xl" />)}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────────────────
   STAR BAR (rating distribution row)
───────────────────────────────────────────────────────────────────────── */
const StarBar = ({ stars, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xs text-gray-500 dark:text-gray-400 w-4 text-right shrink-0 tabular-nums">
        {stars}
      </span>
      <Star size={11} className="shrink-0 fill-yellow-400 text-yellow-400" />
      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 dark:text-gray-500 w-7 text-right shrink-0 tabular-nums">
        {count}
      </span>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────
   TAB BUTTON
───────────────────────────────────────────────────────────────────────── */
const TabBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`relative pb-3.5 px-1 text-sm font-semibold transition-colors duration-200 whitespace-nowrap
      ${active
        ? "text-green-600 dark:text-green-400"
        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
      }`}
  >
    {children}
    <span
      className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-green-600 dark:bg-green-400
        transition-transform duration-300 origin-left ${active ? "scale-x-100" : "scale-x-0"}`}
    />
  </button>
);

/* ─────────────────────────────────────────────────────────────────────────
   QUANTITY STEPPER
───────────────────────────────────────────────────────────────────────── */
const QuantityStepper = ({ value, min = 1, max, onChange }) => (
  <div className="inline-flex items-center rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
    <button
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
      className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400
        hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      <Minus size={15} />
    </button>
    <span className="w-12 h-10 flex items-center justify-center text-sm font-bold
      text-gray-900 dark:text-white border-x border-gray-200 dark:border-gray-700 tabular-nums select-none">
      {value}
    </span>
    <button
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
      className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400
        hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      <Plus size={15} />
    </button>
  </div>
);

/* ═════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═════════════════════════════════════════════════════════════════════════ */
const ProductDetails = () => {
  const { t } = useTranslation();
  const params   = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [product,          setProduct]          = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [quantity,         setQuantity]         = useState(1);
  const [activeTab,        setActiveTab]        = useState("description");
  const [showReviewForm,   setShowReviewForm]   = useState(false);
  const [editingReview,    setEditingReview]    = useState(null);
  const [addingToCart,     setAddingToCart]     = useState(false);
  const [addedToCart,      setAddedToCart]      = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  const { addToCart }                                       = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const identifier = params.slug || params.id || params["*"];

  useEffect(() => { if (identifier) fetchProduct(); }, [identifier]);

  const fetchProduct = async () => {
    try {
      let data;
      try   { data = await productAPI.getBySlug(identifier); }
      catch (err) {
        if (err.response?.status === 404) data = await productAPI.getById(identifier);
        else throw err;
      }
      setProduct(data.product);
    } catch {
      toast.error(t("productDetails.errors.loadFailed") || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error(t("productCard.errors.loginCart") || "Please login first");
      navigate("/login");
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product._id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    } catch {}
    finally { setAddingToCart(false); }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error(t("productCard.errors.loginWishlist") || "Please login first");
      navigate("/login");
      return;
    }
    setTogglingWishlist(true);
    try {
      isInWishlist(product._id)
        ? await removeFromWishlist(product._id)
        : await addToWishlist(product._id);
    } catch {}
    finally { setTogglingWishlist(false); }
  };

  const handleReviewSubmitSuccess = () => {
    setShowReviewForm(false);
    setEditingReview(null);
    fetchProduct();
    toast.success(t("productDetails.reviews.submitSuccess") || "Review submitted!");
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
    setActiveTab("reviews");
    setTimeout(() =>
      document.getElementById("review-form")?.scrollIntoView({ behavior: "smooth" }), 100
    );
  };

  /* ── Guards ── */
  if (loading) return <ProductSkeleton />;

  if (!product) return (
    <div className="flex flex-col items-center justify-center min-h-screen
      bg-gray-50 dark:bg-gray-900 gap-4 px-4 text-center">
      <Package size={60} className="text-gray-300 dark:text-gray-600" />
      <p className="text-xl font-semibold text-gray-500 dark:text-gray-400">
        {t("productDetails.notFound") || "Product not found"}
      </p>
      <button
        onClick={() => navigate("/products")}
        className="flex items-center gap-2 text-green-600 dark:text-green-400
          font-semibold hover:underline text-sm"
      >
        <ArrowLeft size={16} />
        {t("nav.products") || "Back to Products"}
      </button>
    </div>
  );

  /* ── Derived values ── */
  const inWishlist   = isInWishlist(product._id);
  const isOutOfStock = product.stock <= 0;
  const discount     = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const ratingDist   = product.ratingDistribution || {};

  /* ── Helper: resolve trust badge label safely ── */
  const resolveTrustLabel = (labelKey, fallback) => {
    const translated = t(labelKey);
    // i18next returns the key itself when translation is missing
    return translated === labelKey ? fallback : translated;
  };

  /* ──────────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8">

        {/* ── Breadcrumb ─────────────────────────────────────────── */}
        <div className="mb-5 sm:mb-8">
          <Breadcrumb
            items={[
              { label: t("nav.products") || "Products", link: "/products" },
              { label: product.name },
            ]}
          />
        </div>

        {/* ══════════════════════════════════════════════════════════
            HERO GRID
            xs/sm : single column stacked
            md    : two equal columns side by side
            lg+   : 55 / 45 split, image sticky
        ══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.15fr_1fr]
          gap-6 md:gap-8 xl:gap-14 items-start">

          {/* ── Image gallery ─────────────────────────────────── */}
          <div className="relative md:sticky md:top-6 self-start">
            {discount > 0 && (
              <div className="absolute top-3 left-3 z-10 bg-red-500 text-white
                text-xs font-extrabold px-2.5 py-1 rounded-full shadow-lg
                tracking-wide pointer-events-none select-none">
                -{discount}%
              </div>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 z-10 rounded-2xl bg-black/40
                backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                  font-bold text-base sm:text-lg px-6 py-2 rounded-full shadow-xl">
                  {t("outOfStock") || "Out of Stock"}
                </span>
              </div>
            )}
            <div className="rounded-2xl overflow-hidden ring-1 ring-gray-200
              dark:ring-gray-700 shadow-md">
              <ProductImageGallery images={product.images} />
            </div>
          </div>

          {/* ── Product info panel ────────────────────────────── */}
          <div className="flex flex-col gap-4 sm:gap-5">

            {/* Category chip */}
            {product.category?.name && (
              <span className="text-[11px] font-extrabold uppercase tracking-widest
                text-green-600 dark:text-green-400">
                {product.category.name}
              </span>
            )}

            {/* Product name */}
            <h1 className="text-2xl sm:text-3xl xl:text-[2.1rem] font-extrabold
              text-gray-900 dark:text-white leading-tight tracking-tight -mt-1">
              {product.name}
            </h1>

            {/* Rating + stock status */}
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 -mt-1">
              <Rating value={product.rating || 0} showValue />
              <span className="text-sm text-gray-400 dark:text-gray-500">
                ({product.reviewCount || 0}{" "}
                {t("productDetails.reviewsCount") || "reviews"})
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
              {isOutOfStock ? (
                <span className="text-xs font-bold text-red-500 bg-red-50
                  dark:bg-red-900/25 px-2.5 py-1 rounded-full">
                  {t("outOfStock") || "Out of Stock"}
                </span>
              ) : (
                <span className="text-xs font-bold text-green-600 bg-green-50
                  dark:bg-green-900/25 px-2.5 py-1 rounded-full">
                  {t("inStock") || "In Stock"}
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex flex-wrap items-end gap-2.5 sm:gap-3">
              <span className="text-3xl sm:text-4xl font-black text-green-600
                dark:text-green-400 leading-none">
                {formatPrice(product.price)}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-lg sm:text-xl text-gray-400 dark:text-gray-500
                    line-through leading-none">
                    {formatPrice(product.originalPrice)}
                  </span>
                  <span className="text-xs font-extrabold text-red-500 bg-red-50
                    dark:bg-red-900/25 px-2.5 py-1 rounded-full self-end mb-0.5">
                    {discount}% {t("productCard.off") || "OFF"}
                  </span>
                </>
              )}
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Short description */}
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-4">
              {product.description}
            </p>

            {/* Quantity + CTA */}
            {!isOutOfStock && (
              <div className="flex flex-col gap-3.5">
                {/* Qty row */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest
                      text-gray-400 dark:text-gray-500 mb-1.5">
                      {t("quantity") || "Quantity"}
                    </p>
                    <QuantityStepper
                      value={quantity}
                      min={1}
                      max={product.stock}
                      onChange={setQuantity}
                    />
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 self-end pb-1">
                    <span className="font-semibold text-gray-600 dark:text-gray-300">
                      {product.stock}
                    </span>{" "}
                    {t("productDetails.available") || "available"}
                  </p>
                </div>

                {/* CTA row — full width on mobile, natural on desktop */}
                <div className="flex gap-3">
                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className={`flex-1 flex items-center justify-center gap-2.5
                      h-12 px-5 rounded-xl font-bold text-sm text-white
                      transition-all duration-200 active:scale-[0.97]
                      disabled:opacity-60 disabled:cursor-not-allowed
                      shadow-lg shadow-green-500/25
                      ${addedToCart
                        ? "bg-green-700"
                        : "bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                      }`}
                  >
                    {addingToCart ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white
                          border-t-transparent rounded-full animate-spin shrink-0" />
                        <span className="hidden sm:inline">
                          {t("productDetails.adding") || "Adding…"}
                        </span>
                      </>
                    ) : addedToCart ? (
                      <>
                        <Check size={18} className="shrink-0" />
                        {t("productDetails.addedToCart") || "Added!"}
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={18} className="shrink-0" />
                        {t("addToCart") || "Add to Cart"}
                      </>
                    )}
                  </button>

                  {/* Wishlist toggle */}
                  <button
                    onClick={handleWishlist}
                    disabled={togglingWishlist}
                    aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                    className={`w-12 h-12 flex items-center justify-center shrink-0
                      rounded-xl border-2 transition-all duration-200
                      active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
                      ${inWishlist
                        ? "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-500"
                        : `border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
                           text-gray-400 dark:text-gray-500
                           hover:border-red-300 dark:hover:border-red-600
                           hover:text-red-400 dark:hover:text-red-400`
                      }`}
                  >
                    {togglingWishlist ? (
                      <span className="w-4 h-4 border-2 border-current
                        border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Heart size={19} className={inWishlist ? "fill-current" : ""} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Trust Badges — always visible, text guaranteed */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {TRUST_BADGES.map(({ icon: Icon, label, labelKey }) => (
                <div
                  key={labelKey}
                  className="flex items-center gap-2.5 bg-white dark:bg-gray-800
                    border border-gray-100 dark:border-gray-700 rounded-xl
                    px-3 py-2.5 shadow-sm"
                >
                  <div className="w-7 h-7 flex items-center justify-center rounded-lg
                    bg-green-50 dark:bg-green-900/20 shrink-0">
                    <Icon size={14} className="text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-tight">
                    {resolveTrustLabel(labelKey, label)}
                  </span>
                </div>
              ))}
            </div>

            {/* Meta table */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-700
              overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {product.category?.name && (
                    <tr>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400
                        font-medium w-2/5 align-middle">
                        {t("productDetails.category") || "Category"}
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white font-semibold align-middle">
                        {product.category.name}
                      </td>
                    </tr>
                  )}
                  {product.sku && (
                    <tr>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-medium align-middle">
                        SKU
                      </td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white font-mono text-xs align-middle">
                        {product.sku}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-medium align-middle">
                      {t("productDetails.available") || "Available"}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-semibold align-middle">
                      {product.stock}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
          {/* end info panel */}
        </div>
        {/* end hero grid */}

        {/* ══════════════════════════════════════════════════════════
            TABS SECTION
        ══════════════════════════════════════════════════════════ */}
        <div className="mt-12 sm:mt-16">

          {/* Tab bar — scrollable on very small screens */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6 sm:mb-8 -mx-1 px-1 overflow-x-auto scrollbar-none">
            <div className="flex gap-6 sm:gap-8 min-w-max">
              <TabBtn
                active={activeTab === "description"}
                onClick={() => setActiveTab("description")}
              >
                {t("description") || "Description"}
              </TabBtn>

              <TabBtn
                active={activeTab === "reviews"}
                onClick={() => setActiveTab("reviews")}
              >
                <span className="flex items-center gap-2">
                  <MessageCircle size={15} />
                  {t("reviews") || "Reviews"}
                  {product.reviewCount > 0 && (
                    <span className="bg-green-100 dark:bg-green-900/40
                      text-green-700 dark:text-green-300
                      text-[10px] font-extrabold px-1.5 py-0.5 rounded-full leading-none">
                      {product.reviewCount}
                    </span>
                  )}
                </span>
              </TabBtn>
            </div>
          </div>

          {/* ── Description tab ──────────────────────────────── */}
          {activeTab === "description" && (
            <div className="max-w-3xl">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-8
                shadow-sm border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900
                  dark:text-white mb-4">
                  {t("productDetails.productDescription") || "Product Description"}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed
                  whitespace-pre-wrap text-[15px]">
                  {product.description}
                </p>
              </div>
            </div>
          )}

          {/* ── Reviews tab ──────────────────────────────────── */}
          {activeTab === "reviews" && (
            <div className="space-y-5 sm:space-y-8 max-w-4xl">

              {/* Rating overview card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-7
                shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr]
                  gap-5 sm:gap-8 items-center">

                  {/* Big score */}
                  <div className="flex flex-col items-center text-center">
                    <p className="text-6xl sm:text-7xl font-black text-gray-900
                      dark:text-white leading-none">
                      {product.rating?.toFixed(1) ?? "0.0"}
                    </p>
                    <Rating value={product.rating || 0} size={18} className="mt-2 mb-1" />
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {t("productDetails.reviews.basedOn", { count: product.reviewCount || 0 })
                        || `Based on ${product.reviewCount || 0} reviews`}
                    </p>
                  </div>

                  {/* Bar chart */}
                  <div className="space-y-2.5">
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
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl
                    font-semibold text-sm transition-all duration-200 border-2
                    ${showReviewForm
                      ? `border-gray-300 dark:border-gray-600
                         text-gray-700 dark:text-gray-300
                         bg-white dark:bg-gray-800
                         hover:bg-gray-50 dark:hover:bg-gray-700`
                      : `border-green-600 bg-green-600 text-white
                         hover:bg-green-700 hover:border-green-700
                         shadow-md shadow-green-500/20`
                    }`}
                >
                  {showReviewForm ? (
                    t("cancel") || "Cancel"
                  ) : (
                    <>
                      <Star size={15} />
                      {t("productDetails.reviews.writeReview") || "Write a Review"}
                    </>
                  )}
                </button>
              )}

              {/* Review form */}
              {showReviewForm && isAuthenticated && (
                <div
                  id="review-form"
                  className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-7
                    border border-gray-100 dark:border-gray-700 shadow-sm"
                >
                  <ReviewForm
                    productId={product._id}
                    existingReview={editingReview}
                    onSubmitSuccess={handleReviewSubmitSuccess}
                  />
                </div>
              )}

              {/* Review list */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-7
                border border-gray-100 dark:border-gray-700 shadow-sm">
                <ReviewList
                  productId={product._id}
                  currentUserId={user?._id}
                  onEditReview={handleEditReview}
                />
              </div>

            </div>
          )}
        </div>
        {/* end tabs */}

      </div>
    </div>
  );
};

export default ProductDetails;