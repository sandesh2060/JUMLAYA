import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderAPI } from "../api/order.api";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Clock,
  Edit,
  Save,
  X,
} from "lucide-react";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Edit states
  const [editingStatus, setEditingStatus] = useState(false);
  const [editingPayment, setEditingPayment] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);

  // Form states
  const [statusForm, setStatusForm] = useState({
    status: "",
    comment: "",
    trackingNumber: "",
    carrier: "",
    estimatedDelivery: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    paymentStatus: "",
    transactionId: "",
  });

  const [adminNotes, setAdminNotes] = useState("");

  // Fetch order details
  const fetchOrder = async () => {
    // Validate ID before fetching
    if (!id || id === "undefined") {
      console.error("❌ Invalid order ID:", id);
      toast.error("Invalid order ID");
      navigate("/admin/orders");
      return;
    }

    try {
      setLoading(true);
      console.log("📦 Fetching order with ID:", id);
      const response = await orderAPI.getOrderById(id);
      console.log("✅ Order response:", response);
      setOrder(response.data.order);
      setStatusForm({
        status: response.data.order.orderStatus,
        comment: "",
        trackingNumber: response.data.order.trackingNumber || "",
        carrier: response.data.order.carrier || "",
        estimatedDelivery: response.data.order.estimatedDelivery || "",
      });
      setPaymentForm({
        paymentStatus: response.data.order.paymentStatus,
        transactionId: response.data.order.paymentDetails?.transactionId || "",
      });
      setAdminNotes(response.data.order.adminNotes || "");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch order");
      navigate("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Update order status
  const handleUpdateStatus = async () => {
    try {
      setUpdating(true);
      await orderAPI.updateOrderStatus(id, statusForm);
      toast.success("Order status updated successfully");
      setEditingStatus(false);
      fetchOrder();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  // Update payment status
  const handleUpdatePayment = async () => {
    try {
      setUpdating(true);
      await orderAPI.updatePaymentStatus(id, paymentForm);
      toast.success("Payment status updated successfully");
      setEditingPayment(false);
      fetchOrder();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update payment");
    } finally {
      setUpdating(false);
    }
  };

  // Update admin notes
  const handleUpdateNotes = async () => {
    try {
      setUpdating(true);
      await orderAPI.updateAdminNotes(id, adminNotes);
      toast.success("Notes updated successfully");
      setEditingNotes(false);
      fetchOrder();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update notes");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) return null;

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      Confirmed: "bg-blue-100 text-blue-800 border-blue-300",
      Processing: "bg-purple-100 text-purple-800 border-purple-300",
      Shipped: "bg-indigo-100 text-indigo-800 border-indigo-300",
      Delivered: "bg-green-100 text-green-800 border-green-300",
      Cancelled: "bg-red-100 text-red-800 border-red-300",
      Returned: "bg-gray-100 text-gray-800 border-gray-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/orders")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Order #{order.orderId}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <span
          className={`px-4 py-2 rounded-full font-semibold border ${getStatusColor(
            order.orderStatus
          )}`}
        >
          {order.orderStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-4 pb-4 border-b dark:border-gray-700 last:border-0"
                >
                  <img
                    src={item.image || "/placeholder.jpg"}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Rs. {item.price} each
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-6 pt-6 border-t dark:border-gray-700 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal
                </span>
                <span className="font-medium">
                  Rs. {order.itemsPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Shipping
                </span>
                <span className="font-medium">
                  Rs. {order.shippingPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tax</span>
                <span className="font-medium">
                  Rs. {order.taxPrice.toLocaleString()}
                </span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">
                    - Rs. {order.discountAmount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t dark:border-gray-700">
                <span>Total</span>
                <span>Rs. {order.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Status History
            </h2>
            <div className="space-y-4">
              {order.statusHistory?.map((history, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{history.status}</p>
                        {history.comment && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {history.comment}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          Updated by {history.updatedBy?.name || "System"}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(history.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Customer
            </h2>
            <div className="space-y-2">
              <p className="font-medium">{order.user?.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {order.user?.email}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {order.user?.phone}
              </p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Shipping Address
            </h2>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p className="text-gray-600 dark:text-gray-400">
                {order.shippingAddress.addressLine1}
              </p>
              {order.shippingAddress.addressLine2 && (
                <p className="text-gray-600 dark:text-gray-400">
                  {order.shippingAddress.addressLine2}
                </p>
              )}
              <p className="text-gray-600 dark:text-gray-400">
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {order.shippingAddress.country}
              </p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {order.shippingAddress.phone}
              </p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment
              </h2>
              {!editingPayment && (
                <button
                  onClick={() => setEditingPayment(true)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>

            {editingPayment ? (
              <div className="space-y-3">
                <select
                  value={paymentForm.paymentStatus}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      paymentStatus: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
                <input
                  type="text"
                  placeholder="Transaction ID"
                  value={paymentForm.transactionId}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      transactionId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdatePayment}
                    disabled={updating}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => setEditingPayment(false)}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Method
                  </span>
                  <span className="font-medium">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Status
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      order.paymentStatus === "Paid"
                        ? "bg-green-100 text-green-800"
                        : order.paymentStatus === "Failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
                {order.paymentDetails?.transactionId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Transaction ID
                    </span>
                    <span className="font-mono text-xs">
                      {order.paymentDetails.transactionId}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Update Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Update Status</h2>
              {!editingStatus && (
                <button
                  onClick={() => setEditingStatus(true)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>

            {editingStatus ? (
              <div className="space-y-3">
                <select
                  value={statusForm.status}
                  onChange={(e) =>
                    setStatusForm({ ...statusForm, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Returned">Returned</option>
                </select>

                <textarea
                  placeholder="Add a comment..."
                  value={statusForm.comment}
                  onChange={(e) =>
                    setStatusForm({ ...statusForm, comment: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  rows="3"
                />

                {statusForm.status === "Shipped" && (
                  <>
                    <input
                      type="text"
                      placeholder="Tracking Number"
                      value={statusForm.trackingNumber}
                      onChange={(e) =>
                        setStatusForm({
                          ...statusForm,
                          trackingNumber: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                    <input
                      type="text"
                      placeholder="Carrier"
                      value={statusForm.carrier}
                      onChange={(e) =>
                        setStatusForm({
                          ...statusForm,
                          carrier: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                    />
                  </>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updating}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Update
                  </button>
                  <button
                    onClick={() => setEditingStatus(false)}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click edit to update order status
              </p>
            )}
          </div>

          {/* Admin Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Admin Notes</h2>
              {!editingNotes && (
                <button
                  onClick={() => setEditingNotes(true)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>

            {editingNotes ? (
              <div className="space-y-3">
                <textarea
                  placeholder="Add admin notes..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  rows="4"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdateNotes}
                    disabled={updating}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => setEditingNotes(false)}
                    className="px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {order.adminNotes || "No admin notes"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
