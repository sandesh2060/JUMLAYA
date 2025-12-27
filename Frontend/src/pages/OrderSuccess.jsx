// ============================================
// 3. Frontend/src/pages/OrderSuccess.jsx
// ============================================
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Check,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Download,
  ArrowLeft,
} from "lucide-react";
import { orderAPI } from "../api/order.api";
import toast from "react-hot-toast";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await orderAPI.getOrder(orderId);
      setOrder(response.data?.order || response.order);
    } catch (error) {
      console.error("Failed to fetch order:", error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => `Rs. ${price?.toLocaleString() || 0}`;

  const getPaymentMethodLabel = (method) => {
    const methods = {
      COD: "Cash on Delivery",
      ESEWA: "eSewa",
      KHALTI: "Khalti",
      CARD: "Card Payment",
    };
    return methods[method?.toUpperCase()] || method;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Check className="text-green-600" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Order Placed Successfully!
            </h1>
            <p className="text-green-100">Thank you for your purchase</p>
          </div>

          {/* Order Details */}
          <div className="p-8">
            {order && (
              <>
                {/* Order ID & Status */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Order ID
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {order.orderId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Status
                      </p>
                      <span className="inline-block px-4 py-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full font-semibold">
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-gray-600">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Order Date
                      </p>
                      <p className="font-semibold dark:text-white">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Total Amount
                      </p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatPrice(order.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Timeline */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 dark:text-white">
                    Order Timeline
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <Check
                          className="text-green-600 dark:text-green-400"
                          size={20}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold dark:text-white">
                          Order Placed
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Your order has been received
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 opacity-50">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <Package
                          className="text-gray-600 dark:text-gray-400"
                          size={20}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold dark:text-white">
                          Processing
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          We're preparing your order
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 opacity-50">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <Truck
                          className="text-gray-600 dark:text-gray-400"
                          size={20}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold dark:text-white">Shipped</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Your order is on the way
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 dark:text-white">
                    Order Items
                  </h3>
                  <div className="space-y-3">
                    {order.items?.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <img
                          src={item.image || "https://via.placeholder.com/80"}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-semibold dark:text-white">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <p className="font-bold dark:text-white">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                {order.shippingAddress && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
                      <MapPin
                        className="text-green-600 dark:text-green-400"
                        size={20}
                      />
                      Delivery Address
                    </h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <p className="font-semibold dark:text-white">
                        {order.shippingAddress.fullName}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {order.shippingAddress.addressLine1}
                      </p>
                      {order.shippingAddress.addressLine2 && (
                        <p className="text-gray-600 dark:text-gray-400">
                          {order.shippingAddress.addressLine2}
                        </p>
                      )}
                      <p className="text-gray-600 dark:text-gray-400">
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state}{" "}
                        {order.shippingAddress.postalCode}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {order.shippingAddress.phone}
                      </p>
                    </div>
                  </div>
                )}

                {/* Payment Info */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 dark:text-white">
                    <CreditCard
                      className="text-green-600 dark:text-green-400"
                      size={20}
                    />
                    Payment Information
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Payment Method
                      </span>
                      <span className="font-semibold dark:text-white">
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Payment Status
                      </span>
                      <span
                        className={`font-semibold ${
                          order.paymentStatus === "Paid"
                            ? "text-green-600 dark:text-green-400"
                            : "text-yellow-600 dark:text-yellow-400"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 dark:text-white">
                    Order Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Subtotal
                      </span>
                      <span className="dark:text-white">
                        {formatPrice(order.itemsPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Shipping
                      </span>
                      <span className="dark:text-white">
                        {formatPrice(order.shippingPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Tax (13%)
                      </span>
                      <span className="dark:text-white">
                        {formatPrice(order.taxPrice)}
                      </span>
                    </div>
                    {order.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Discount</span>
                        <span>-{formatPrice(order.discountAmount)}</span>
                      </div>
                    )}
                    <div className="border-t dark:border-gray-600 pt-2 flex justify-between text-lg font-bold">
                      <span className="dark:text-white">Total</span>
                      <span className="text-green-600 dark:text-green-400">
                        {formatPrice(order.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate("/orders")}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2"
                  >
                    <Package size={20} />
                    View All Orders
                  </button>
                  <button
                    onClick={() => navigate("/")}
                    className="w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={20} />
                    Continue Shopping
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
            Need Help?
          </h3>
          <p className="text-blue-700 dark:text-blue-400 mb-4">
            Contact our customer support for any questions about your order
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
