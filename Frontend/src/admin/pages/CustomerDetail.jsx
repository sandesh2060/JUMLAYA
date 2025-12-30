// ============================================
// CustomerDetail.jsx - WITH AVATAR IMAGE
// Path: Frontend/src/admin/pages/CustomerDetail.jsx
// ============================================
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminAPI from '@/admin/utils/adminApi';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingCart,
  DollarSign,
  Package,
  UserCheck,
  UserX,
  Loader2,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
  });

  // ✅ Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const backendUrl = import.meta.env.VITE_API_URL.replace('/api', '');
    return `${backendUrl}${imagePath}`;
  };

  // ✅ Helper function to get initials
  const getInitials = (customer) => {
    if (!customer) return 'U';
    const first = customer.firstname || '';
    const last = customer.lastname || '';
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || 'U';
  };

  // Fetch customer details
  useEffect(() => {
    fetchCustomerDetails();
  }, [id]);

  const fetchCustomerDetails = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.users.getById(id);
      
      setCustomer(response.user);
      setOrders(response.user.recentOrders || []);
      setStats({
        totalOrders: response.user.totalOrders || 0,
        totalSpent: response.user.totalSpent || 0,
      });
    } catch (error) {
      console.error('Error fetching customer:', error);
      toast.error('Failed to load customer details');
      navigate('/admin/customers');
    } finally {
      setLoading(false);
    }
  };

  // Toggle block status
  const handleToggleBlock = async () => {
    try {
      await adminAPI.users.toggleBlock(id);
      toast.success(`Customer ${customer.isBlocked ? 'unblocked' : 'blocked'} successfully`);
      fetchCustomerDetails();
    } catch (error) {
      console.error('Error toggling block status:', error);
      toast.error('Failed to update customer status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-gray-600 dark:text-gray-400">Customer not found</p>
        <button
          onClick={() => navigate('/admin/customers')}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/customers')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Customers
        </button>

        <button
          onClick={handleToggleBlock}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            customer.isBlocked
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {customer.isBlocked ? (
            <>
              <UserCheck className="w-4 h-4" />
              Unblock Customer
            </>
          ) : (
            <>
              <UserX className="w-4 h-4" />
              Block Customer
            </>
          )}
        </button>
      </div>

      {/* Customer Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-start gap-6">
          {/* Avatar - WITH IMAGE SUPPORT */}
          <div className="relative flex-shrink-0">
            {customer.avatar && getImageUrl(customer.avatar) ? (
              <img
                src={getImageUrl(customer.avatar)}
                alt={`${customer.firstname} ${customer.lastname}`}
                className="w-24 h-24 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center text-white text-3xl font-bold"
              style={{ display: customer.avatar ? 'none' : 'flex' }}
            >
              {getInitials(customer)}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {customer.firstname} {customer.lastname}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  @{customer.username || 'N/A'}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                customer.isBlocked
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : customer.isVerified
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {customer.isBlocked ? 'Blocked' : customer.isVerified ? 'Active' : 'Pending'}
              </span>
            </div>

            {/* Contact Info */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Mail className="w-5 h-5" />
                <span>{customer.email}</span>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Phone className="w-5 h-5" />
                  <span>{customer.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar className="w-5 h-5" />
                <span>
                  Joined {new Date(customer.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalOrders}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                Rs. {stats.totalSpent.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Recent Orders
          </h2>
        </div>
        <div className="p-6">
          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Order #{order.orderId || order._id?.slice(-6)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right mr-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      Rs. {(order.total || 0).toLocaleString()}
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                      order.orderStatus === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : order.orderStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
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
  );
};

export default CustomerDetail;