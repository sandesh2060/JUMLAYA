// ============================================
// Frontend/src/rider/pages/RiderOrderDetails.jsx
// ✅ FIXED - Correct API calls
// ============================================
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Phone, Package, Clock, CheckCircle, 
  Navigation, ArrowLeft, AlertCircle, Loader,
  User, DollarSign, ExternalLink, Map, X, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { riderAPI } from '../../api/rider.api'; // ✅ FIXED IMPORT

const RiderOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Delivery completion state
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await riderAPI.orders.getDetails(orderId); // ✅ FIXED
      console.log('📦 Order details:', response);
      
      // Handle different response structures
      const orderData = response.data?.order || response.data || response;
      setOrder(orderData);
    } catch (error) {
      console.error('❌ Failed to fetch order:', error);
      toast.error(error.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ACCEPT ORDER (Processing → Shipped)
  // ============================================
  const handleAcceptOrder = async () => {
    if (!window.confirm('Accept this order for delivery?')) return;
    
    try {
      setProcessing(true);
      await riderAPI.orders.accept(orderId); // ✅ FIXED
      toast.success('✅ Order accepted successfully!');
      await fetchOrderDetails();
    } catch (error) {
      console.error('❌ Accept error:', error);
      toast.error(error.response?.data?.message || 'Failed to accept order');
    } finally {
      setProcessing(false);
    }
  };

  // ============================================
  // PICKUP ORDER (Shipped → Out for Delivery)
  // ============================================
  const handlePickup = async () => {
    if (!window.confirm('Confirm that you have picked up this order from the restaurant/store?')) return;
    
    try {
      setProcessing(true);
      await riderAPI.orders.pickup(orderId); // ✅ FIXED
      toast.success('✅ Order marked as picked up! Now delivering...');
      await fetchOrderDetails();
    } catch (error) {
      console.error('❌ Pickup error:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setProcessing(false);
    }
  };

  // ============================================
  // DELIVER ORDER (Out for Delivery → Delivered)
  // ============================================
  const handleOpenDeliveryModal = () => {
    setShowDeliveryModal(true);
    setDeliveryNotes('');
  };

  const handleCloseDeliveryModal = () => {
    setShowDeliveryModal(false);
    setDeliveryNotes('');
  };

const handleConfirmDelivery = async () => {
  try {
    setProcessing(true);
    
    const deliveryData = {
      note: deliveryNotes.trim() || 'Delivered successfully',
      deliveredAt: new Date().toISOString(),
    };

    console.log('📦 Confirming delivery:', deliveryData);
    
    // Call backend API
    const response = await riderAPI.orders.complete(orderId, deliveryData);
    console.log('✅ Delivery response:', response);
    
    // Close modal
    handleCloseDeliveryModal();
    
    // Show success with rider status update
    if (response.data?.rider) {
      toast.success(
        `🎉 Order delivered! ${response.data.rider.activeOrders === 0 ? 'You\'re now available for new orders.' : `${response.data.rider.activeOrders} order(s) remaining.`}`,
        { duration: 4000 }
      );
    } else {
      toast.success('🎉 Order delivered successfully!', { duration: 3000 });
    }
    
    // Navigate to dashboard to see updated status
    setTimeout(() => {
      navigate('/rider/dashboard', { replace: true });
    }, 1500);
    
  } catch (error) {
    console.error('❌ Delivery error:', error);
    toast.error(error.response?.data?.message || 'Failed to mark as delivered');
  } finally {
    setProcessing(false);
  }
};
  // ============================================
  // MAP NAVIGATION
  // ============================================
  const getCoordinates = () => {
    const coords = 
      order?.location?.coordinates ||
      order?.shippingAddress?.coordinates;
    
    if (!coords) return null;

    if (coords.latitude && coords.longitude) {
      return { lat: coords.latitude, lng: coords.longitude };
    }
    if (Array.isArray(coords) && coords.length === 2) {
      return { lat: coords[1], lng: coords[0] };
    }
    if (coords.lat && coords.lng) {
      return { lat: coords.lat, lng: coords.lng };
    }
    
    return null;
  };

  const openInGoogleMaps = () => {
    const coords = getCoordinates();
    
    if (!coords) {
      const address = order?.shippingAddress;
      if (address) {
        const addressString = `${address.addressLine1}, ${address.city}, ${address.state}, ${address.postalCode}`;
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressString)}`;
        window.open(url, '_blank');
        toast.success('Opening in Google Maps...');
      } else {
        toast.error('Location not available');
      }
      return;
    }
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`;
    window.open(url, '_blank');
    toast.success('Opening navigation...');
  };

  const callCustomer = () => {
    const phone = order?.shippingAddress?.phone;
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast.error('Phone number not available');
    }
  };

  // ============================================
  // STATUS HELPERS
  // ============================================
  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      'Processing': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'Shipped': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      'Out for Delivery': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      'Delivered': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getActionButton = () => {
    const status = order?.orderStatus;

    // Processing → Accept Order → Shipped
    if (status === 'Processing' && !order?.rider) {
      return (
        <button
          onClick={handleAcceptOrder}
          disabled={processing}
          className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2 text-lg"
        >
          {processing ? (
            <>
              <Loader className="animate-spin" size={20} />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              Accept Order
            </>
          )}
        </button>
      );
    }

    // Shipped → Mark as Picked Up → Out for Delivery
    if (status === 'Shipped') {
      return (
        <button
          onClick={handlePickup}
          disabled={processing}
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2 text-lg"
        >
          {processing ? (
            <>
              <Loader className="animate-spin" size={20} />
              Processing...
            </>
          ) : (
            <>
              <Package size={20} />
              Mark as Picked Up
            </>
          )}
        </button>
      );
    }

    // Out for Delivery → Mark as Delivered → Delivered
    if (status === 'Out for Delivery') {
      return (
        <button
          onClick={handleOpenDeliveryModal}
          disabled={processing}
          className="w-full py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2 text-lg"
        >
          {processing ? (
            <>
              <Loader className="animate-spin" size={20} />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle size={20} />
              Mark as Delivered
            </>
          )}
        </button>
      );
    }

    // Delivered - Show success message
    if (status === 'Delivered') {
      return (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl text-center">
          <CheckCircle className="mx-auto text-green-600 dark:text-green-400 mb-2" size={32} />
          <p className="text-green-800 dark:text-green-300 font-semibold">Order Delivered Successfully!</p>
          {order.deliveredAt && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Delivered on {new Date(order.deliveredAt).toLocaleString()}
            </p>
          )}
        </div>
      );
    }

    return null;
  };

  // ============================================
  // LOADING & ERROR STATES
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-green-600 dark:text-green-400 mx-auto mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-600 dark:text-red-400 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Not Found</h2>
          <button
            onClick={() => navigate('/rider/orders')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mt-4"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const coords = getCoordinates();
  const hasMapLocation = !!coords;

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <ArrowLeft size={24} className="dark:text-gray-300" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Order #{order.orderId}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.orderStatus)}`}>
              {order.orderStatus?.toUpperCase().replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {/* Customer Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
            <User className="text-green-600 dark:text-green-400" size={20} />
            Customer Details
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Name</span>
              <span className="font-semibold dark:text-white">{order.shippingAddress?.fullName || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Phone</span>
              <button
                onClick={callCustomer}
                className="font-semibold text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
              >
                <Phone size={16} />
                {order.shippingAddress?.phone || 'N/A'}
              </button>
            </div>
            {order.shippingAddress?.email && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Email</span>
                <span className="font-semibold dark:text-white text-sm">{order.shippingAddress.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Address with Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2 dark:text-white">
              <MapPin className="text-red-600 dark:text-red-400" size={20} />
              Delivery Address
            </h3>
            {hasMapLocation && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded flex items-center gap-1">
                <Map size={12} />
                GPS Available
              </span>
            )}
          </div>
          
          <div className="space-y-2 mb-4">
            <p className="text-gray-900 dark:text-white font-medium">
              {order.shippingAddress?.fullName}
            </p>
            <p className="text-gray-900 dark:text-gray-200">{order.shippingAddress?.addressLine1}</p>
            {order.shippingAddress?.addressLine2 && (
              <p className="text-gray-900 dark:text-gray-200">{order.shippingAddress.addressLine2}</p>
            )}
            {order.location?.landmark && (
              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                🏷️ <span className="font-medium">Landmark:</span> {order.location.landmark}
              </p>
            )}
            <p className="text-gray-600 dark:text-gray-400">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              📞 {order.shippingAddress?.phone}
            </p>

            {hasMapLocation && (
              <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                  📍 GPS Coordinates Available
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Lat: {coords.lat.toFixed(6)}, Lng: {coords.lng.toFixed(6)}
                </p>
              </div>
            )}
            
            {order.location?.instructions && (
              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  <strong>Delivery Instructions:</strong> {order.location.instructions}
                </p>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="space-y-2">
            <button
              onClick={openInGoogleMaps}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Navigation size={20} />
              Navigate in Google Maps
            </button>

            <button
              onClick={callCustomer}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Phone size={20} />
              Call Customer
            </button>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
            <Package className="text-purple-600 dark:text-purple-400" size={20} />
            Order Items ({order.items?.length || 0})
          </h3>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b dark:border-gray-700 last:border-0">
                <div className="flex items-center gap-3">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
            <DollarSign className="text-green-600 dark:text-green-400" size={20} />
            Payment Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>Rs. {order.itemsPrice?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Delivery Fee (Your Earnings)</span>
              <span className="text-green-600 dark:text-green-400 font-semibold">
                Rs. {order.shippingPrice?.toLocaleString() || 0}
              </span>
            </div>
            {order.taxPrice > 0 && (
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax</span>
                <span>Rs. {order.taxPrice?.toLocaleString()}</span>
              </div>
            )}
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-red-600 dark:text-red-400">
                <span>Discount</span>
                <span>- Rs. {order.discountAmount?.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t dark:border-gray-700 pt-3 flex justify-between text-lg font-bold">
              <span className="dark:text-white">Total Amount</span>
              <span className="text-green-600 dark:text-green-400">
                Rs. {order.totalPrice?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
              <span className={`font-semibold ${
                order.paymentMethod === 'COD' ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
              }`}>
                {order.paymentMethod?.toUpperCase() || 'COD'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          {getActionButton()}
        </div>
      </div>

      {/* Delivery Confirmation Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold dark:text-white">Confirm Delivery</h3>
              <button
                onClick={handleCloseDeliveryModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={20} className="dark:text-gray-300" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Delivery Notes (Optional)
                </label>
                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="E.g., Left at door, handed to customer, etc."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  rows={4}
                />
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  ⚠️ Please confirm that you have successfully delivered this order to the customer.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCloseDeliveryModal}
                  className="flex-1 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelivery}
                  disabled={processing}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Confirm Delivery
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiderOrderDetails;