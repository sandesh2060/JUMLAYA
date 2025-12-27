// CartSummary.jsx
import { Link } from "react-router-dom";
import { Button } from "@components/common/Button";

export const CartSummary = ({ cart, onCheckout, isLoading }) => {
  if (!cart) {
    return null;
  }

  const {
    subtotal = 0,
    tax = 0,
    shippingFee = 0,
    discount = 0,
    total = 0,
  } = cart;

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Order Summary
      </h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 dark:text-gray-300">Subtotal</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            NPR {subtotal.toFixed(2)}
          </span>
        </div>

        {tax > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">Tax (13%)</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {" "}
              NPR {tax.toFixed(2)}
            </span>
          </div>
        )}

        {shippingFee > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">
              Shipping Fee
            </span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              NPR {shippingFee.toFixed(2)}
            </span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between items-center text-green-600 dark:text-green-400">
            <span className="text-gray-700 dark:text-gray-300">Discount</span>
            <span className="font-semibold">-NPR {discount.toFixed(2)}</span>
          </div>
        )}

        {cart.appliedCoupon?.code && (
          <div className="flex justify-between items-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
            <span className="text-sm">Coupon: {cart.appliedCoupon.code}</span>
            <span className="font-semibold">
              -NPR {cart.appliedCoupon.discount?.toFixed(2) || "0.00"}
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
            NPR {total.toFixed(2)}
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
          ✓ Free shipping on orders over NPR 2000
        </p>
      )}
    </div>
  );
};
