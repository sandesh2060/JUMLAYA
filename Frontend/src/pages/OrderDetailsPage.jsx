// ============================================
// Frontend/src/pages/OrderDetailsPage.jsx
// FIXED VERSION - COMPLETE WITH DEBUGGING
// ============================================
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { OrderDetails } from '@/components/order/OrderDetails';
import { orderAPI } from '@/api/order.api';
import toast from 'react-hot-toast';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching order with ID:', id);
      
      // ✅ FIXED: Call API and handle response properly
      const response = await orderAPI.getOrder(id);
      
      console.log('📦 Full API Response:', response);
      console.log('📦 Response data:', response.data);
      
      // ✅ FIXED: Handle different response structures
      let orderData = null;
      
      // Try different response structures
      if (response.data?.order) {
        orderData = response.data.order;
        console.log('✅ Order found in response.data.order');
      } else if (response.data?.data?.order) {
        orderData = response.data.data.order;
        console.log('✅ Order found in response.data.data.order');
      } else if (response.order) {
        orderData = response.order;
        console.log('✅ Order found in response.order');
      } else if (response.data && typeof response.data === 'object' && response.data._id) {
        // The order might be directly in response.data
        orderData = response.data;
        console.log('✅ Order found directly in response.data');
      }
      
      if (!orderData) {
        console.error('❌ Could not find order in response structure');
        console.log('Response keys:', Object.keys(response));
        if (response.data) {
          console.log('Response.data keys:', Object.keys(response.data));
        }
        throw new Error('Invalid response structure');
      }
      
      console.log('✅ Final order data:', orderData);
      console.log('Order ID:', orderData.orderId || orderData._id);
      console.log('Order Status:', orderData.orderStatus);
      console.log('Items count:', orderData.items?.length);
      console.log('Total Price:', orderData.totalPrice);
      
      setOrder(orderData);
    } catch (err) {
      console.error('❌ Error fetching order:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load order details';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      console.log('🚀 OrderDetailsPage mounted with ID:', id);
      fetchOrder();
    } else {
      console.error('❌ No order ID provided');
      setError('No order ID provided');
      setLoading(false);
    }
  }, [id]);

  const handleOrderUpdate = () => {
    console.log('🔄 Refreshing order data');
    fetchOrder();
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading order details...</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Order ID: {id}</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Order Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {error || 'The order you are looking for does not exist or has been removed.'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Order ID: {id}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/orders')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft size={20} />
              Back to Orders
            </button>
            <button
              onClick={fetchOrder}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <Loader2 size={20} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success State - Show Order Details
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/orders')}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Orders
        </button>

        {/* Debug Info (Remove in production) */}
        {import.meta.env.DEV && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-800 dark:text-blue-300 font-mono">
              🔍 Debug: Order ID: {order._id} | Status: {order.orderStatus} | Items: {order.items?.length}
            </p>
          </div>
        )}

        {/* Order Details Component */}
        <OrderDetails order={order} onOrderUpdate={handleOrderUpdate} />
      </div>
    </div>
  );
};

export default OrderDetailsPage;