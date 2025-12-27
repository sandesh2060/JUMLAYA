// Frontend/src/rider/pages/RiderDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, DollarSign, Clock, CheckCircle, Star, TrendingUp,
  MapPin, Phone, Navigation, AlertCircle, Loader, RefreshCw,
  ChevronRight, User, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import riderAPI from '../utils/riderApi';

const RiderDashboard = () => {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    todayEarnings: 0,
    pendingOrders: 0,
    completedOrders: 0,
    rating: 0,
    totalEarnings: 0,
    weeklyDeliveries: 0
  });
  
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('offline');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [riderInfo, setRiderInfo] = useState(null);
  const [locationTracking, setLocationTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);

  // Fetch dashboard data
const fetchDashboard = useCallback(async (showLoader = true) => {
  if (showLoader) setLoading(true);
  try {
    const response = await riderAPI.getDashboard();
    // Backend returns: { success: true, data: { rider, status, stats, orders } }
    const { data } = response;
    
    setStats(data.stats || stats);
    setOrders(data.orders || []);
    setStatus(data.status || 'offline');
    setRiderInfo(data.rider || null);
      
      if (data.currentLocation) {
        setCurrentPosition(data.currentLocation);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDashboard();
  }, []);

  // Auto-refresh every 30 seconds when online
  useEffect(() => {
    if (status === 'active' || status === 'on_delivery') {
      const interval = setInterval(() => {
        fetchDashboard(false);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [status, fetchDashboard]);

  // Location tracking
  useEffect(() => {
    let watchId;
    
    if (locationTracking && (status === 'active' || status === 'on_delivery')) {
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentPosition({ lat: latitude, lng: longitude });
            
            // Update location on server
            try {
              await riderAPI.updateLocation({ lat: latitude, lng: longitude });
            } catch (error) {
              console.error('Failed to update location:', error);
            }
          },
          (error) => {
            console.error('Location tracking error:', error);
            toast.error('Location tracking failed');
            setLocationTracking(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      }
    }
    
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [locationTracking, status]);

  // Toggle online/offline status
  const toggleStatus = async () => {
    const newStatus = status === 'offline' ? 'active' : 'offline';
    
    try {
      await riderAPI.updateStatus(newStatus);
      setStatus(newStatus);
      
      if (newStatus === 'active') {
        setLocationTracking(true);
        toast.success('You are now online! 🟢');
      } else {
        setLocationTracking(false);
        toast.success('You are now offline');
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error('Failed to update status');
    }
  };

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard(false);
    setRefreshing(false);
    toast.success('Dashboard refreshed!');
  };

  // Accept order
  const handleAcceptOrder = async (orderId) => {
    try {
      await riderAPI.acceptOrder(orderId);
      toast.success('Order accepted!');
      await fetchDashboard(false);
    } catch (error) {
      console.error('Accept order error:', error);
      toast.error(error.response?.data?.message || 'Failed to accept order');
    }
  };

  // Navigate to order details
  const viewOrderDetails = (orderId) => {
    navigate(`/rider/orders/${orderId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-green-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <User className="text-green-600" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {riderInfo?.user?.name || 'Rider Dashboard'}
                </h1>
                <p className="text-green-100 text-sm">
                  {riderInfo?.riderCode || 'Loading...'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <RefreshCw 
                  className={refreshing ? 'animate-spin' : ''} 
                  size={20} 
                />
              </button>
              <button
                onClick={() => navigate('/rider/settings')}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  status === 'active' ? 'bg-green-400 animate-pulse' :
                  status === 'on_delivery' ? 'bg-blue-400 animate-pulse' :
                  'bg-gray-400'
                }`} />
                <div>
                  <p className="font-semibold">Status</p>
                  <p className="text-sm text-green-100">
                    {status === 'active' ? 'Available for Orders' :
                     status === 'on_delivery' ? 'On Delivery' :
                     status === 'inactive' ? 'Busy' :
                     'Offline'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={toggleStatus}
                disabled={status === 'on_delivery'}
                className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                  status === 'active'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-white hover:bg-gray-50 text-green-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {status === 'active' ? 'Go Offline' :
                 status === 'on_delivery' ? 'On Delivery' :
                 'Go Online'}
              </button>
            </div>
            
            {locationTracking && (
              <div className="mt-3 flex items-center gap-2 text-sm text-green-100">
                <Navigation size={14} className="animate-pulse" />
                <span>Location tracking active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Package className="text-blue-600" />}
            label="Today's Deliveries"
            value={stats.todayDeliveries}
            subtitle={`${stats.weeklyDeliveries} this week`}
            color="blue"
            trend="+12%"
          />
          <StatCard
            icon={<DollarSign className="text-green-600" />}
            label="Today's Earnings"
            value={`Rs. ${stats.todayEarnings.toLocaleString()}`}
            subtitle={`Total: Rs. ${stats.totalEarnings.toLocaleString()}`}
            color="green"
            trend="+8%"
          />
          <StatCard
            icon={<Clock className="text-yellow-600" />}
            label="Pending Orders"
            value={stats.pendingOrders}
            subtitle="Awaiting acceptance"
            color="yellow"
          />
          <StatCard
            icon={<Star className="text-purple-600" />}
            label="Rating"
            value={stats.rating.toFixed(1)}
            subtitle={`${stats.completedOrders} completed`}
            color="purple"
            showStar
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickActionButton
              icon={<MapPin />}
              label="Track Location"
              active={locationTracking}
              onClick={() => setLocationTracking(!locationTracking)}
            />
            <QuickActionButton
              icon={<Package />}
              label="My Orders"
              onClick={() => navigate('/rider/orders')}
            />
            <QuickActionButton
              icon={<DollarSign />}
              label="Earnings"
              onClick={() => navigate('/rider/earnings')}
            />
            <QuickActionButton
              icon={<User />}
              label="Profile"
              onClick={() => navigate('/rider/profile')}
            />
          </div>
        </div>

        {/* Pending Orders Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Pending Deliveries
              </h3>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-semibold">
                {orders.length} orders
              </span>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={64} />
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
                  No pending orders
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  {status === 'offline' 
                    ? 'Go online to start receiving orders'
                    : 'New orders will appear here'}
                </p>
              </div>
            ) : (
              orders.map(order => (
                <OrderCard 
                  key={order._id} 
                  order={order}
                  onAccept={handleAcceptOrder}
                  onViewDetails={viewOrderDetails}
                />
              ))
            )}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <TrendingUp className="text-green-600" size={20} />
              Performance
            </h3>
            <div className="space-y-3">
              <PerformanceItem 
                label="Acceptance Rate"
                value="95%"
                progress={95}
                color="green"
              />
              <PerformanceItem 
                label="On-time Delivery"
                value="92%"
                progress={92}
                color="blue"
              />
              <PerformanceItem 
                label="Customer Satisfaction"
                value="4.8/5"
                progress={96}
                color="purple"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
              Recent Activity
            </h3>
            <div className="space-y-3 text-sm">
              <ActivityItem 
                time="10 mins ago"
                text="Completed delivery #ORD-1234"
                icon={<CheckCircle className="text-green-600" size={16} />}
              />
              <ActivityItem 
                time="1 hour ago"
                text="Accepted order #ORD-1233"
                icon={<Package className="text-blue-600" size={16} />}
              />
              <ActivityItem 
                time="2 hours ago"
                text="Went online"
                icon={<Clock className="text-gray-600" size={16} />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, subtitle, color, trend, showStar }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
    <div className={`w-12 h-12 bg-${color}-100 dark:bg-${color}-900/30 rounded-xl flex items-center justify-center mb-3`}>
      {icon}
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
    <div className="flex items-baseline gap-2">
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </p>
      {showStar && <Star className="text-yellow-500 fill-yellow-500" size={16} />}
    </div>
    {subtitle && (
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
    )}
    {trend && (
      <div className="flex items-center gap-1 mt-2">
        <TrendingUp className="text-green-600" size={14} />
        <span className="text-xs text-green-600 font-medium">{trend}</span>
      </div>
    )}
  </div>
);

// Quick Action Button
const QuickActionButton = ({ icon, label, onClick, active = false }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
      active 
        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
    }`}
  >
    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
      active ? 'bg-green-200 dark:bg-green-800' : 'bg-white dark:bg-gray-600'
    }`}>
      {icon}
    </div>
    <span className="text-xs font-medium">{label}</span>
  </button>
);

// Order Card Component
const OrderCard = ({ order, onAccept, onViewDetails }) => {
  const [accepting, setAccepting] = useState(false);

  const handleAccept = async () => {
    setAccepting(true);
    await onAccept(order._id);
    setAccepting(false);
  };

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-green-500 dark:hover:border-green-600 transition-colors bg-gray-50 dark:bg-gray-750">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
              {order.orderId || `#${order._id?.slice(-6)}`}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              order.orderStatus === 'Confirmed' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
              order.orderStatus === 'Shipped' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
              'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}>
              {order.orderStatus?.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            Rs. {order.totalPrice?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Delivery: Rs. {order.shippingPrice || 0}
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2 text-sm">
          <Navigation className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Delivery Address</p>
            <p className="text-gray-600 dark:text-gray-400">
              {order.shippingAddress?.addressLine1}
              {order.shippingAddress?.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <User className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Customer</p>
            <p className="text-gray-600 dark:text-gray-400">
              {order.shippingAddress?.fullName || order.user?.name || 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <Phone className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Contact</p>
            <p className="text-gray-600 dark:text-gray-400">
              {order.shippingAddress?.phone || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {order.orderStatus === 'Confirmed' && !order.rider && (
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors"
          >
            {accepting ? (
              <>
                <Loader className="animate-spin" size={16} />
                <span>Accepting...</span>
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                <span>Accept Order</span>
              </>
            )}
          </button>
        )}
        <button
          onClick={() => onViewDetails(order._id)}
          className="flex-1 py-2.5 border-2 border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 rounded-lg font-semibold hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center justify-center gap-2 transition-colors"
        >
          <span>View Details</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
// Performance Item
const PerformanceItem = ({ label, value, progress, color }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className="font-semibold text-gray-900 dark:text-gray-100">{value}</span>
    </div>
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div 
        className={`bg-${color}-600 h-2 rounded-full transition-all`}
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
);

// Activity Item
const ActivityItem = ({ time, text, icon }) => (
  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
    {icon}
    <div className="flex-1">
      <p className="text-gray-900 dark:text-gray-100">{text}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
    </div>
  </div>
);

export default RiderDashboard;