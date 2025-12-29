// ============================================
// Frontend/src/components/order/OrderDetails.jsx
// WITH RIDER INFORMATION & LIVE TRACKING
// ============================================
import { useState } from 'react';
import { 
  Package, MapPin, CreditCard, Download, RotateCcw, XCircle, 
  Check, Clock, Truck, Home, Phone, Navigation, Star, Bike, 
  Loader2, User, MessageSquare
} from 'lucide-react';
import { orderAPI } from '@/api/order.api';
import { formatPrice, formatDateTime, getImageUrl } from '@/utils/helpers';
import toast from 'react-hot-toast';

// ============================================
// HELPER: Normalize status
// ============================================
const normalizeStatus = (status) => status?.toLowerCase() || 'pending';

// ============================================
// STATUS CONFIGURATION
// ============================================
const STATUS_VARIANTS = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'primary',
  'out for delivery': 'primary',
  delivered: 'success',
  cancelled: 'danger',
  returned: 'warning',
};

const PAYMENT_STATUS_VARIANTS = {
  pending: 'warning',
  paid: 'success',
  completed: 'success',
  failed: 'danger',
  refunded: 'info',
};

// ============================================
// RIDER INFO CARD COMPONENT
// ============================================
const RiderInfoCard = ({ rider, order }) => {
  if (!rider) return null;

  const handleCallRider = () => {
    const phone = rider.phoneNumber || rider.phone || order.shippingAddress?.phone;
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast.error('Rider phone number not available');
    }
  };

  const handleMessageRider = () => {
    toast.info('Messaging feature coming soon!');
  };

  // Extract rider info with fallbacks
  const riderName = rider.fullName || rider.name || rider.user?.firstname + ' ' + rider.user?.lastname || 'Delivery Rider';
  const riderPhone = rider.phoneNumber || rider.phone || 'N/A';
  const vehicleType = rider.vehicleType || rider.vehicle || 'Bike';
  const vehicleNumber = rider.vehicleNumber || 'N/A';
  const riderRating = rider.rating?.average || rider.rating || 4.5;
  const totalDeliveries = rider.stats?.completedDeliveries || rider.totalDeliveries || 0;
  const riderCode = rider.riderCode || 'N/A';
  const riderStatus = rider.status || 'active';

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Bike className="text-blue-600 dark:text-blue-400" size={24} />
          Your Delivery Rider
        </h3>
        {riderStatus === 'on_delivery' && (
          <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold animate-pulse flex items-center gap-1">
            <Navigation size={12} />
            En Route
          </span>
        )}
      </div>

      <div className="flex items-start gap-4">
        {/* Rider Avatar */}
        <div className="relative flex-shrink-0">
          {rider.profilePhoto || rider.avatar ? (
            <img
              src={getImageUrl(rider.profilePhoto || rider.avatar)}
              alt={riderName}
              className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg border-4 border-white dark:border-gray-800">
              {riderName?.charAt(0) || 'R'}
            </div>
          )}
          {/* Status indicator */}
          <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-3 border-white dark:border-gray-800 ${
            riderStatus === 'on_delivery' ? 'bg-green-500' : 'bg-gray-400'
          }`} />
        </div>

        {/* Rider Details */}
        <div className="flex-1">
          <div className="mb-3">
            <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100">
              {riderName}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Bike size={14} />
              {vehicleType} • {vehicleNumber}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Rider ID: {riderCode}
            </p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-gray-900 dark:text-gray-100">
                {riderRating.toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              ({totalDeliveries}+ deliveries)
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleCallRider}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Phone size={16} />
              Call Rider
            </button>
            <button
              onClick={handleMessageRider}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
              title="Message Rider"
            >
              <MessageSquare size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Additional Rider Info */}
      {(order.riderAssignedAt || order.riderPickedUpAt) && (
        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {order.riderAssignedAt && (
              <div>
                <p className="text-gray-500 dark:text-gray-400">Assigned</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {formatDateTime(order.riderAssignedAt)}
                </p>
              </div>
            )}
            {order.riderPickedUpAt && (
              <div>
                <p className="text-gray-500 dark:text-gray-400">Picked Up</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {formatDateTime(order.riderPickedUpAt)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// LIVE TRACKING MAP COMPONENT
// ============================================
const LiveTrackingMap = ({ order }) => {
  const [eta] = useState('15-20 mins');
  const [distance] = useState('3.2 km');

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg">
      {/* Map Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <h3 className="font-bold flex items-center gap-2 mb-2">
          <MapPin size={20} />
          Live Delivery Tracking
        </h3>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>Distance: {distance}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>ETA: {eta}</span>
          </div>
        </div>
      </div>

      {/* Map Visualization */}
      <div className="relative h-80 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
        {/* Animated Delivery Route */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full max-w-md p-8">
            {/* Store Location */}
            <div className="absolute top-10 left-10 flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-lg z-10">
                <Package size={24} />
              </div>
              <span className="mt-2 text-xs font-medium bg-white dark:bg-gray-800 px-2 py-1 rounded shadow">
                Store
              </span>
            </div>

            {/* Animated Path */}
            <svg className="absolute inset-0 w-full h-full" style={{ transform: 'rotate(10deg)' }}>
              <path
                d="M 80 80 Q 200 120, 280 200"
                stroke="#3b82f6"
                strokeWidth="4"
                fill="none"
                strokeDasharray="8 4"
                className="animate-pulse"
              />
            </svg>

            {/* Rider Location (Animated) */}
            <div className="absolute top-32 left-1/2 transform -translate-x-1/2 animate-bounce">
              <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white dark:border-gray-800 z-10">
                <Bike size={24} />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping" />
            </div>

            {/* Delivery Location */}
            <div className="absolute bottom-10 right-10 flex flex-col items-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg z-10">
                <Home size={24} />
              </div>
              <span className="mt-2 text-xs font-medium bg-white dark:bg-gray-800 px-2 py-1 rounded shadow">
                You
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Details */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pickup Location</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Store Location
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Delivery Address</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {order.shippingAddress?.city || 'Your Location'}
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// BADGE COMPONENT
// ============================================
const Badge = ({ variant, children, className = '' }) => {
  const variants = {
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    primary: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${variants[variant] || variants.info} ${className}`}>
      {children}
    </span>
  );
};

// ============================================
// BUTTON COMPONENT
// ============================================
const Button = ({ children, onClick, variant = 'primary', loading = false, disabled = false, className = '' }) => {
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    outline: 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {loading && <Loader2 className="animate-spin" size={18} />}
      {children}
    </button>
  );
};

// ============================================
// MODAL COMPONENT
// ============================================
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
};

// ============================================
// ORDER TIMELINE (Simplified)
// ============================================
const OrderTimeline = ({ order }) => {
  const STATUS_CONFIG = {
    pending: { icon: Clock, label: 'Order Placed', color: 'bg-yellow-500' },
    confirmed: { icon: Check, label: 'Confirmed', color: 'bg-blue-500' },
    processing: { icon: Package, label: 'Processing', color: 'bg-purple-500' },
    shipped: { icon: Truck, label: 'Shipped', color: 'bg-indigo-500' },
    'out for delivery': { icon: Navigation, label: 'Out for Delivery', color: 'bg-cyan-500' },
    delivered: { icon: Home, label: 'Delivered', color: 'bg-green-500' },
    cancelled: { icon: XCircle, label: 'Cancelled', color: 'bg-red-500' },
    returned: { icon: RotateCcw, label: 'Returned', color: 'bg-orange-500' }
  };

  const NORMAL_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'out for delivery', 'delivered'];
  const orderStatus = normalizeStatus(order?.orderStatus);
  const flowStatuses = ['cancelled', 'returned'].includes(orderStatus) 
    ? (order?.statusHistory || []).map(h => normalizeStatus(h.status))
    : NORMAL_FLOW;
  const currentIndex = flowStatuses.indexOf(orderStatus);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Order Timeline</h3>
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
        <div 
          className={`absolute left-6 top-0 w-0.5 transition-all duration-1000 ${STATUS_CONFIG[orderStatus]?.color || 'bg-gray-300'}`} 
          style={{ height: currentIndex >= 0 ? `${(currentIndex / (flowStatuses.length - 1)) * 100}%` : '0%' }} 
        />
        <div className="space-y-8">
          {flowStatuses.map((status, index) => {
            const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
            const Icon = config.icon;
            const isCompleted = index <= currentIndex;
            const isCurrent = status === orderStatus;

            return (
              <div key={`${status}-${index}`} className="relative flex items-start gap-4">
                <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-gray-900 transition-all ${isCompleted ? `${config.color} shadow-lg` : 'bg-gray-200 dark:bg-gray-700'}`}>
                  <Icon size={20} className={isCompleted ? 'text-white' : 'text-gray-400'} />
                  {isCurrent && <span className="absolute inset-0 rounded-full animate-ping opacity-75 bg-current" />}
                </div>
                <div className="flex-1 pb-8">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{config.label}</h4>
                  {isCurrent && <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Current Status</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================
// MAIN ORDER DETAILS COMPONENT
// ============================================
export const OrderDetails = ({ order, onOrderUpdate }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const orderStatus = normalizeStatus(order?.orderStatus);
  const paymentStatus = normalizeStatus(order?.paymentStatus);
  const canCancel = ['pending', 'confirmed'].includes(orderStatus);
  const canReturn = orderStatus === 'delivered' && order?.deliveredAt;
  const showRiderInfo = ['shipped', 'out for delivery'].includes(orderStatus) && order?.rider;

  const handleDownloadInvoice = async () => {
    try {
      setActionLoading(true);
      await orderAPI.downloadInvoice(order._id);
      toast.success('Invoice downloaded!');
    } catch (error) {
      toast.error('Failed to download invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide cancellation reason');
      return;
    }
    try {
      setActionLoading(true);
      await orderAPI.cancelOrder(order._id, cancelReason);
      toast.success('Order cancelled');
      setShowCancelModal(false);
      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestReturn = async () => {
    if (!returnReason.trim()) {
      toast.error('Please provide return reason');
      return;
    }
    try {
      setActionLoading(true);
      await orderAPI.requestReturn(order._id, returnReason);
      toast.success('Return requested');
      setShowReturnModal(false);
      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request return');
    } finally {
      setActionLoading(false);
    }
  };

  if (!order) {
    return <div className="text-center py-8"><p className="text-gray-500">No order data</p></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Order #{order.orderId || order._id}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Placed on {formatDateTime(order.createdAt)}
            </p>
          </div>
          <Badge variant={STATUS_VARIANTS[orderStatus]} className="text-lg px-4 py-2">
            {orderStatus.toUpperCase()}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleDownloadInvoice} variant="outline" loading={actionLoading}>
            <Download size={18} />
            Invoice
          </Button>
          {canCancel && (
            <Button onClick={() => setShowCancelModal(true)} variant="danger">
              <XCircle size={18} />
              Cancel
            </Button>
          )}
          {canReturn && (
            <Button onClick={() => setShowReturnModal(true)} variant="outline">
              <RotateCcw size={18} />
              Return
            </Button>
          )}
        </div>
      </div>

      {/* Rider Info & Tracking - Only show when rider is assigned */}
      {showRiderInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LiveTrackingMap order={order} />
          </div>
          <div>
            <RiderInfoCard rider={order.rider} order={order} />
          </div>
        </div>
      )}

      {/* Timeline */}
      <OrderTimeline order={order} />

      {/* Order Items */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Package size={20} />
          Order Items
        </h2>
        <div className="space-y-4">
          {order.items?.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <img src={getImageUrl(item.image)} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{item.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity} × {formatPrice(item.price)}</p>
              </div>
              <p className="font-bold text-lg text-gray-900 dark:text-gray-100">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-3 max-w-sm ml-auto">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>{formatPrice(order.itemsPrice || 0)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Shipping</span>
              <span>{order.shippingPrice > 0 ? formatPrice(order.shippingPrice) : 'Free'}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-gray-100 pt-3 border-t">
              <span>Total</span>
              <span>{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping & Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <MapPin size={20} />
            Shipping Address
          </h2>
          <div className="space-y-2 text-gray-600 dark:text-gray-400">
            <p className="font-semibold text-gray-900 dark:text-gray-100">{order.shippingAddress?.fullName || 'N/A'}</p>
            <p>{order.shippingAddress?.phone || 'N/A'}</p>
            <p>{order.shippingAddress?.addressLine1 || 'N/A'}</p>
            <p>{order.shippingAddress?.city || 'N/A'}, {order.shippingAddress?.state || 'N/A'}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <CreditCard size={20} />
            Payment Info
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Method</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 uppercase">{order.paymentMethod || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <Badge variant={PAYMENT_STATUS_VARIANTS[paymentStatus]}>{paymentStatus.toUpperCase()}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="font-bold text-xl text-gray-900 dark:text-gray-100">{formatPrice(order.totalPrice)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel Order">
        <div className="space-y-4">
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Reason for cancellation..."
            className="w-full px-4 py-3 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            rows={4}
          />
          <div className="flex gap-3">
            <Button onClick={() => setShowCancelModal(false)} variant="secondary" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleCancelOrder} variant="danger" loading={actionLoading} className="flex-1">
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showReturnModal} onClose={() => setShowReturnModal(false)} title="Request Return">
        <div className="space-y-4">
          <textarea
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            placeholder="Reason for return..."
            className="w-full px-4 py-3 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            rows={4}
          />
          <div className="flex gap-3">
            <Button onClick={() => setShowReturnModal(false)} variant="secondary" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleRequestReturn} variant="danger" loading={actionLoading} className="flex-1">
              Submit Return
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetails;