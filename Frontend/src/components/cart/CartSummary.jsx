// ============================================
// CartSummary.jsx - FIXED FOR FLAT SCHEMA
// Path: Frontend/src/components/cart/CartSummary.jsx
// ============================================
import { Link } from "react-router-dom";
import { Button } from "@components/common/Button";
import { useStore } from "@/context/StoreContext";

export const CartSummary = ({ cart, onCheckout, isLoading }) => {
  const { settings: storeSettings, loading: settingsLoading } = useStore();

  if (!cart) {
    return null;
  }

  if (settingsLoading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const {
    subtotal = 0,
    tax = 0,
    shippingFee = 0,
    discount = 0,
    total = 0,
  } = cart;

  // ✅ FIXED: Use flat structure (matches your database schema)
  const currency = storeSettings?.currency || "NPR";
  const taxRate = storeSettings?.taxRate || 13;
  const freeShippingThreshold = storeSettings?.freeShippingThreshold || 100;

  console.log('🔍 CartSummary Tax Rate:', taxRate); // Debug line

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Order Summary
      </h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 dark:text-gray-300">Subtotal</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {currency} {subtotal.toFixed(2)}
          </span>
        </div>

        {tax > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">
              Tax ({taxRate}%)
            </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {currency} {tax.toFixed(2)}
            </span>
          </div>
        )}

        {shippingFee > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">
              Shipping Fee
            </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {currency} {shippingFee.toFixed(2)}
            </span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between items-center text-green-600 dark:text-green-400">
            <span className="text-gray-700 dark:text-gray-300">Discount</span>
            <span className="font-semibold">
              -{currency} {discount.toFixed(2)}
            </span>
          </div>
        )}

        {cart.appliedCoupon?.code && (
          <div className="flex justify-between items-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
            <span className="text-sm">Coupon: {cart.appliedCoupon.code}</span>
            <span className="font-semibold">
              -{currency} {cart.appliedCoupon.discount?.toFixed(2) || "0.00"}
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Total
          </span>
          <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {currency} {total.toFixed(2)}
          </span>
        </div>
      </div>

      <Button
        onClick={onCheckout}
        disabled={isLoading}
        className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white py-3 rounded-lg font-semibold"
      >
        {isLoading ? "Processing..." : "Proceed to Checkout"}
      </Button>

      <Link to="/products">
        <button className="w-full mt-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          Continue Shopping
        </button>
      </Link>

      {shippingFee === 0 && subtotal > 0 && (
        <p className="text-xs text-green-600 dark:text-green-400 mt-3 text-center">
          ✓ Free shipping on orders over {currency} {freeShippingThreshold}
        </p>
      )}
    </div>
  );
};