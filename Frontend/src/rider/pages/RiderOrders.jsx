// ============================================
// Frontend/src/rider/pages/RiderOrders.jsx
// ✅ FIXED - Uses existing backend routes
// ============================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { riderAPI } from '../../api/rider.api';
import { Package, MapPin, Clock, Loader, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const RiderOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('available');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let response;
      
      if (filter === 'available') {
        // ✅ Get available orders from dashboard
        response = await riderAPI.getDashboard();
        setOrders(response.data?.orders || []);
      } else if (filter === 'myorders') {
        // ✅ Get active orders (orders assigned to this rider)
        response = await riderAPI.orders.getActive();
        setOrders(response.data || []);
      } else if (filter === 'completed') {
        // ✅ FIXED: Use getAll with status filter instead of getHistory
        response = await riderAPI.orders.getAll({ status: 'Delivered' });
        setOrders(response.data?.orders || response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error(error.response?.data?.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
    toast.success('Orders refreshed!');
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await riderAPI.orders.accept(orderId);
      toast.success('✅ Order accepted successfully!');
      await fetchOrders();
    } catch (error) {
      console.error('Accept order error:', error);
      const errorMsg = error.response?.data?.message || 'Failed to accept order';
      toast.error(errorMsg);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      'Confirmed': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
      'Processing': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
      'Shipped': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
      'Out for Delivery': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200',
      'Delivered': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader className="animate-spin text-green-600 dark:text-green-400 mx-auto mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filter === 'available' && 'Available orders to accept'}
            {filter === 'myorders' && 'Your active deliveries'}
            {filter === 'completed' && 'Your completed deliveries'}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md transition-colors"
        >
          <RefreshCw 
            className={`text-gray-600 dark:text-gray-300 ${refreshing ? 'animate-spin' : ''}`} 
            size={20} 
          />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="flex border-b dark:border-gray-700">
          <button
            onClick={() => setFilter('available')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
              filter === 'available'
                ? 'border-b-2 border-green-600 text-green-600 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Available Orders
          </button>
          <button
            onClick={() => setFilter('myorders')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
              filter === 'myorders'
                ? 'border-b-2 border-green-600 text-green-600 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            My Orders
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
              filter === 'completed'
                ? 'border-b-2 border-green-600 text-green-600 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No {filter === 'available' ? 'available' : filter === 'myorders' ? 'active' : 'completed'} orders
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'available' && 'No new orders are currently available'}
            {filter === 'myorders' && 'You have no active deliveries'}
            {filter === 'completed' && "You haven't completed any deliveries yet"}
          </p>
          {filter === 'available' && (
            <button
              onClick={handleRefresh}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            >
              Refresh Orders
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-gray-900 dark:text-white">
                        #{order.orderId}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus?.toUpperCase().replace('_', ' ')}
                      </span>
                      {order.rider && filter === 'myorders' && (
                        <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full">
                          ASSIGNED TO YOU
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      Rs. {order.totalPrice?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                      Earn: Rs. {order.shippingPrice?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>

                <div className="border-t dark:border-gray-700 pt-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {order.shippingAddress?.fullName || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {order.shippingAddress?.addressLine1}
                        {order.shippingAddress?.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                      </p>
                      {order.location?.landmark && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          🏷️ {order.location.landmark}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        📞 {order.shippingAddress?.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {order.items && (
                  <div className="border-t dark:border-gray-700 mt-4 pt-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Items ({order.items.length})
                    </p>
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map((item, index) => (
                        <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          {item.quantity}x {item.name}
                        </p>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  {filter === 'available' && !order.rider && order.orderStatus === 'Processing' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcceptOrder(order._id);
                      }}
                      className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                    >
                      Accept Order
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/rider/orders/${order._id}`)}
                    className={`${filter === 'available' ? 'flex-1' : 'w-full'} py-2.5 border-2 border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 rounded-lg font-semibold hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors`}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiderOrders;