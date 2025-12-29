// ============================================
// Cart.jsx - WITH i18n TRANSLATION SUPPORT
// Path: Frontend/src/pages/Cart.jsx
// ============================================
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next'; // ✅ ADD THIS
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Package,
  ArrowLeft,
} from "lucide-react";
import { useCart } from "../hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/context/StoreContext";
import toast from "react-hot-toast";

const getImageUrl = (path) => {
  if (!path) return "/placeholder.png";
  if (path.startsWith("http")) return path;
  const baseUrl =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:4001";
  return `${baseUrl}${path}`;
};

export default function Cart() {
  const { t } = useTranslation(); // ✅ ADD THIS
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // ✅ Get cart data from backend (includes pre-calculated totals)
  const {
    items: cartItems,
    cart: cartData, // ✅ NEW: Get full cart object from backend
    loading,
    updateCartItem,
    removeFromCart,
    clearCart,
  } = useCart();

  // ✅ Get settings for display only (currency, taxRate label, etc.)
  const { settings: storeSettings, loading: settingsLoading } = useStore();

  const [processingItems, setProcessingItems] = useState(new Set());

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    if (processingItems.has(productId)) return;

    try {
      setProcessingItems((prev) => new Set(prev).add(productId));
      await updateCartItem(productId, newQuantity);
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error(t('cart.errors.updateQuantity'));
    } finally {
      setProcessingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleRemove = async (productId) => {
    if (processingItems.has(productId)) return;

    try {
      setProcessingItems((prev) => new Set(prev).add(productId));
      await removeFromCart(productId);
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error(t('cart.errors.removeItem'));
    } finally {
      setProcessingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    if (window.confirm(t('cart.confirmClear'))) {
      try {
        await clearCart();
        toast.success(t('cart.success.cleared'));
      } catch (error) {
        console.error("Error clearing cart:", error);
        toast.error(t('cart.errors.clearCart'));
      }
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error(t('cart.errors.loginRequired'));
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  // ✅ USE BACKEND PRE-CALCULATED VALUES
  // Backend cart.model.js already calculated these in pre-save hook
  const subtotal = cartData?.subtotal || 0;
  const tax = cartData?.tax || 0;
  const shippingFee = cartData?.shippingFee || 0;
  const discount = cartData?.discount || 0;
  const total = cartData?.total || 0;

  // ✅ Get display info from settings (for labels and messages)
  const currency = t('currency') || storeSettings?.currency || "रु";
  const taxRate = storeSettings?.taxRate || 13;
  const freeShippingThreshold = storeSettings?.freeShippingThreshold || 2000;

  console.log('🔍 Backend Cart Data:', {
    subtotal,
    tax,
    shippingFee,
    total,
    taxRate: `${taxRate}%`
  });

  // Loading state
  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t('cart.loading')}
          </p>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <ShoppingCart
                size={48}
                className="text-green-600 dark:text-green-400"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('cart.empty.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {t('cart.empty.description')}
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Package size={20} />
              {t('cart.empty.button')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('cart.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {cartItems.length} {cartItems.length === 1 ? t('cart.itemSingular') : t('cart.itemPlural')}
            </p>
          </div>

          <button
            onClick={handleClearCart}
            className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
            {t('cart.clearCart')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const product = item.product || item;
              const productId = product._id || product.id;
              const isProcessing = processingItems.has(productId);
              const itemTotal =
                (product.salePrice || product.price) * item.quantity;

              return (
                <div
                  key={productId}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link
                      to={`/products/${product.slug || productId}`}
                      className="flex-shrink-0"
                    >
                      <img
                        src={getImageUrl(product.images?.[0])}
                        alt={product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = "/placeholder.png";
                        }}
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${product.slug || productId}`}
                        className="font-semibold text-gray-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors line-clamp-2"
                      >
                        {product.name}
                      </Link>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xl font-bold text-green-600 dark:text-green-400">
                          {currency} {product.salePrice || product.price}
                        </span>
                        {product.discount > 0 && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                            {currency} {product.price}
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(productId, item.quantity - 1)
                            }
                            disabled={isProcessing || item.quantity <= 1}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 py-2 font-medium text-gray-900 dark:text-white min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(productId, item.quantity + 1)
                            }
                            disabled={
                              isProcessing || item.quantity >= product.stock
                            }
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(productId)}
                          disabled={isProcessing}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={t('cart.removeItem')}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      {/* Stock Warning */}
                      {product.stock < 5 && product.stock > 0 && (
                        <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                          {t('cart.stockWarning', { stock: product.stock })}
                        </p>
                      )}
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {currency} {itemTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ✅ FIXED: Order Summary - Uses Backend Values */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {t('cart.orderSummary.title')}
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('cart.orderSummary.subtotal')}</span>
                  <span>{currency} {subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('cart.orderSummary.tax', { rate: taxRate })}</span>
                  <span>{currency} {tax.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>{t('cart.orderSummary.shipping')}</span>
                  <span>
                    {shippingFee === 0
                      ? t('cart.orderSummary.free')
                      : `${currency} ${shippingFee.toFixed(2)}`}
                  </span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>{t('cart.orderSummary.discount')}</span>
                    <span>-{currency} {discount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                    <span>{t('cart.orderSummary.total')}</span>
                    <span>{currency} {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Free Shipping Progress */}
              {shippingFee > 0 && subtotal < freeShippingThreshold && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {t('cart.freeShipping.progress', { 
                      amount: `${currency} ${(freeShippingThreshold - subtotal).toFixed(2)}` 
                    })}
                  </p>
                </div>
              )}

              {shippingFee === 0 && subtotal > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    {t('cart.freeShipping.qualified')}
                  </p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold mb-3"
              >
                {t('cart.checkout')}
              </button>

              <Link
                to="/products"
                className="flex items-center justify-center gap-2 w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft size={18} />
                {t('cart.continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}