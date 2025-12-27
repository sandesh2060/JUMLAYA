// ============================================
// Frontend/src/rider/pages/RiderOrders.jsx
// ============================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import riderAPI from '../utils/riderApi';
import { Package, MapPin, Clock, Filter } from 'lucide-react';

const RiderOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active'); // active, pending, completed

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let response;
      
      if (filter === 'active') {
        response = await riderAPI.getOrders('accepted,picked_up,on_the_way');
      } else if (filter === 'pending') {
        response = await riderAPI.getOrders('pending');
      } else {
        response = await riderAPI.getOrders('delivered');
      }
      
      if (response.success) {
        setOrders(response.data.orders || response.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-gray-100 text-gray-800',
      'accepted': 'bg-blue-100 text-blue-800',
      'picked_up': 'bg-yellow-100 text-yellow-800',
      'on_the_way': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600 mt-1">Manage your deliveries</p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setFilter('active')}
            className={`flex-1 px-4 py-3 text-sm font-semibold ${
              filter === 'active'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`flex-1 px-4 py-3 text-sm font-semibold ${
              filter === 'pending'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`flex-1 px-4 py-3 text-sm font-semibold ${
              filter === 'completed'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No {filter} orders
          </h3>
          <p className="text-gray-600">
            {filter === 'active' && 'You have no active deliveries'}
            {filter === 'pending' && 'No pending orders available'}
            {filter === 'completed' && 'You haven\'t completed any deliveries yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow hover:shadow-md transition cursor-pointer"
              onClick={() => navigate(`/rider/orders/${order._id}`)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-gray-900">
                        #{order.orderId}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      NPR {order.totalPrice.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Delivery: NPR {order.shippingPrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {order.shippingAddress.fullName}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {order.shippingAddress.addressLine1}
                        {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        📞 {order.shippingAddress.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {order.items && (
                  <div className="border-t mt-4 pt-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Items ({order.items.length})
                    </p>
                    <div className="space-y-1">
                      {order.items.slice(0, 3).map((item, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          {item.quantity}x {item.name}
                        </p>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-gray-500">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiderOrders;