// Frontend/src/admin/pages/AdminDashboard.jsx - FIXED VERSION
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import adminAPI from '@/admin/utils/adminApi';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  AlertCircle,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder.png';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // Remove /api from VITE_API_URL for static files
    const backendUrl = import.meta.env.VITE_API_URL.replace('/api', '');
    return `${backendUrl}${imagePath}`;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching dashboard data...');

      const [statsRes, ordersRes, productsRes, lowStockRes] = await Promise.all([
        adminAPI.dashboard.getStats(),
        adminAPI.dashboard.getRecentOrders(5),
        adminAPI.dashboard.getTopProducts(5),
        adminAPI.dashboard.getLowStockProducts(10, 5)
      ]);

      console.log('✅ Stats:', statsRes);
      console.log('✅ Orders:', ordersRes);
      console.log('✅ Products:', productsRes);
      console.log('✅ Low Stock:', lowStockRes);

      setStats(statsRes.data?.stats || statsRes.stats || {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0,
        revenueGrowth: 0,
        orderGrowth: 0,
      });

      setRecentOrders(ordersRes.data?.orders || ordersRes.orders || []);
      setTopProducts(productsRes.data?.products || productsRes.products || []);
      setLowStockProducts(lowStockRes.data?.products || lowStockRes.products || []);

      toast.success('Dashboard loaded successfully');

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (orderId) => {
    console.log('👁️ Viewing order:', orderId);
    navigate(`/admin/orders/${orderId}`);
  };

  const handleViewProduct = (productId) => {
    console.log('👁️ Viewing product:', productId);
    navigate(`/admin/products/${productId}`);
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `Rs. ${(stats.totalRevenue || 0).toLocaleString()}`,
      change: stats.revenueGrowth || 0,
      icon: DollarSign,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders || 0,
      change: stats.orderGrowth || 0,
      icon: ShoppingCart,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Total Products',
      value: stats.totalProducts || 0,
      icon: Package,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers || 0,
      icon: Users,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.firstname || 'Admin'}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Here's what's happening with your store today
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  {stat.change !== undefined && (
                    <div className="flex items-center gap-1 mt-2">
                      {stat.change >= 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          stat.change >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {Math.abs(stat.change)}%
                      </span>
                      <span className="text-xs text-gray-500">vs last month</span>
                    </div>
                  )}
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Orders
              </h2>
              <button
                onClick={() => navigate('/admin/orders')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No recent orders</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => handleViewOrder(order._id)}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Order #{order.orderId || order._id?.slice(-6)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {order.user?.firstname && order.user?.lastname 
                          ? `${order.user.firstname} ${order.user.lastname}`
                          : order.user?.email || 'Guest User'}
                      </p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Rs. {(order.totalPrice || 0).toLocaleString()}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                          order.orderStatus === 'Delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.orderStatus === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.orderStatus === 'Cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewOrder(order._id);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Products - FIXED IMAGE RENDERING */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top Selling Products
              </h2>
              <button
                onClick={() => navigate('/admin/products')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            {topProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No products yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={product._id}
                    className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-300">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                    <img
                      src={getImageUrl(product.images?.[0])}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => (e.target.src = '/placeholder.png')}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {product.soldCount || 0} sold
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        Rs. {(product.price || 0).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewProduct(product._id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alert - FIXED IMAGE RENDERING */}
      {lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                Low Stock Alert
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
                {lowStockProducts.length} product(s) are running low on stock
              </p>
              <div className="space-y-2">
                {lowStockProducts.slice(0, 3).map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={getImageUrl(product.images?.[0])}
                        alt={product.name}
                        className="w-10 h-10 rounded object-cover"
                        onError={(e) => (e.target.src = '/placeholder.png')}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400">
                          Only {product.stock} left in stock
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleViewProduct(product._id)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Update
                    </button>
                  </div>
                ))}
              </div>
              {lowStockProducts.length > 3 && (
                <button
                  onClick={() => navigate('/admin/products')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium mt-3"
                >
                  View all {lowStockProducts.length} products
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;