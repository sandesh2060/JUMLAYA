// ============================================
// Frontend/src/rider/pages/RiderOrderDetails.jsx
// ============================================
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Phone, Package, Clock, CheckCircle, 
  Navigation, ArrowLeft, AlertCircle, Loader,
  User, Store, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import riderAPI from '../utils/riderApi';

const RiderOrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await riderAPI.getOrderById(orderId);
      setOrder(response.data.order || response.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async () => {
    try {
      setProcessing(true);
      await riderAPI.acceptOrder(orderId);
      toast.success('Order accepted successfully!');
      await fetchOrderDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept order');
    } finally {
      setProcessing(false);
    }
  };

  const handlePickup = async () => {
    try {
      setProcessing(true);
      await riderAPI.pickupOrder(orderId);
      toast.success('Order marked as picked up!');
      await fetchOrderDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeliver = async () => {
    if (!confirm('Confirm that the order has been delivered?')) return;
    
    try {
      setProcessing(true);
      await riderAPI.deliverOrder(orderId);
      toast.success('Order delivered successfully! 🎉');
      navigate('/rider/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to deliver order');
    } finally {
      setProcessing(false);
    }
  };

  const openInMaps = () => {
    if (!order?.location?.coordinates) {
      toast.error('Location not available');
      return;
    }
    
    const [lng, lat] = order.location.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-600 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <button
            onClick={() => navigate('/rider/orders')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'accepted': 'bg-blue-100 text-blue-800',
      'picked_up': 'bg-purple-100 text-purple-800',
      'on_the_way': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.orderId}
              </h1>
              <p className="text-sm text-gray-600">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
              {order.status?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6 space-y-6">
        {/* Customer Information */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <User className="text-green-600" size={20} />
            Customer Details
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Name</span>
              <span className="font-semibold">{order.shippingAddress?.fullName || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Phone</span>
              <a 
                href={`tel:${order.shippingAddress?.phone}`}
                className="font-semibold text-green-600 hover:underline flex items-center gap-1"
              >
                <Phone size={16} />
                {order.shippingAddress?.phone}
              </a>
            </div>
            {order.shippingAddress?.email && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Email</span>
                <span className="font-semibold">{order.shippingAddress.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <MapPin className="text-red-600" size={20} />
            Delivery Address
          </h3>
          <div className="space-y-2 mb-4">
            <p className="text-gray-900">{order.shippingAddress?.addressLine1}</p>
            {order.shippingAddress?.addressLine2 && (
              <p className="text-gray-900">{order.shippingAddress.addressLine2}</p>
            )}
            <p className="text-gray-600">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
            </p>
            {order.location?.instructions && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Delivery Instructions:</strong> {order.location.instructions}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={openInMaps}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Navigation size={20} />
            Open in Maps
          </button>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Package className="text-purple-600" size={20} />
            Order Items ({order.items?.length || 0})
          </h3>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-semibold text-gray-900">
                  Rs. {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <DollarSign className="text-green-600" size={20} />
            Payment Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Items Total</span>
              <span>Rs. {order.itemsPrice?.toLocaleString() || 0}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span className="text-green-600 font-semibold">
                Rs. {order.shippingPrice?.toLocaleString() || 0}
              </span>
            </div>
            {order.taxPrice > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>Rs. {order.taxPrice?.toLocaleString()}</span>
              </div>
            )}
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount</span>
                <span>- Rs. {order.discountAmount?.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t pt-3 flex justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span className="text-green-600">
                Rs. {order.totalPrice?.toLocaleString() || 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment Method</span>
              <span className={`font-semibold ${
                order.paymentMethod === 'COD' ? 'text-orange-600' : 'text-green-600'
              }`}>
                {order.paymentMethod || 'COD'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment Status</span>
              <span className={`font-semibold ${
                order.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {order.paymentStatus || 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="space-y-3">
            {order.status === 'pending' && (
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
            )}

            {order.status === 'accepted' && (
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
            )}

            {(order.status === 'picked_up' || order.status === 'on_the_way') && (
              <button
                onClick={handleDeliver}
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
            )}

            {order.status === 'delivered' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
                <CheckCircle className="mx-auto text-green-600 mb-2" size={32} />
                <p className="text-green-800 font-semibold">Order Delivered Successfully!</p>
                <p className="text-sm text-green-600 mt-1">
                  Delivered on {new Date(order.deliveredAt).toLocaleString()}
                </p>
              </div>
            )}

            <button
              onClick={openInMaps}
              className="w-full py-4 border-2 border-blue-600 text-blue-600 rounded-xl font-bold hover:bg-blue-50 flex items-center justify-center gap-2"
            >
              <Navigation size={20} />
              Navigate to Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderOrderDetails;