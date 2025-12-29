import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Trash2, 
  AlertCircle, 
  Loader2,
  ImageOff
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================
// MOCK API (Replace with real import)
// ============================================
const orderAPI = {
  cancelOrder: async (id, reason) => {
    const response = await fetch(`http://localhost:4001/api/orders/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({ reason })
    });
    if (!response.ok) throw new Error('Failed to cancel order');
    return response.json();
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================
const formatPrice = (price) => {
  if (!price) return 'रू 0';
  return `रू ${Number(price).toLocaleString('en-IN')}`;
};

const formatDateTime = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getImageUrl = (imageUrl) => {
  if (!imageUrl) return 'https://via.placeholder.com/400x400?text=No+Image';
  if (imageUrl.startsWith('http')) return imageUrl;
  const baseUrl = 'http://localhost:4001';
  const cleanPath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
  return `${baseUrl}/${cleanPath}`;
};

// ============================================
// STATUS CONFIGURATION (CASE-INSENSITIVE)
// ============================================
const normalizeStatus = (status) => {
  return status?.toLowerCase() || 'pending';
};

const STATUS_CONFIG = {
  pending: { variant: 'warning', color: 'bg-yellow-500 text-white' },
  confirmed: { variant: 'info', color: 'bg-blue-500 text-white' },
  processing: { variant: 'info', color: 'bg-purple-500 text-white' },
  shipped: { variant: 'primary', color: 'bg-indigo-500 text-white' },
  'out for delivery': { variant: 'primary', color: 'bg-cyan-500 text-white' },
  delivered: { variant: 'success', color: 'bg-green-500 text-white' },
  cancelled: { variant: 'danger', color: 'bg-red-500 text-white' },
  returned: { variant: 'warning', color: 'bg-orange-500 text-white' }
};

const getStatusConfig = (status) => {
  const normalized = normalizeStatus(status);
  return STATUS_CONFIG[normalized] || STATUS_CONFIG.pending;
};

// ============================================
// DELETE CONFIRMATION MODAL
// ============================================
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, orderNumber, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full flex-shrink-0">
            <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Delete Order?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete order{' '}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                #{orderNumber}
              </span>
              ? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800 dark:text-red-300">
            <strong>Warning:</strong> Deleting this order will permanently remove it from your order history.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={18} />
                Delete Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// PRODUCT IMAGE COMPONENT
// ============================================
const ProductImage = ({ src, alt, className }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError) {
    return (
      <div className={`${className} bg-gray-100 dark:bg-gray-800 flex items-center justify-center`}>
        <ImageOff className="text-gray-400" size={32} />
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`${className} bg-gray-200 dark:bg-gray-700 animate-pulse`} />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0 absolute' : 'opacity-100'}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        loading="lazy"
      />
    </div>
  );
};

// ============================================
// BADGE COMPONENT
// ============================================
const Badge = ({ children, className }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${className}`}>
    {children}
  </span>
);

// ============================================
// MAIN ORDER CARD COMPONENT
// ============================================
export const OrderCard = ({ order, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Safe data extraction with normalization
  const firstItem = order?.items?.[0] || {};
  const remainingItems = (order?.items?.length || 1) - 1;
  const orderId = order?.orderId || order?._id || 'N/A';
  
  // ✅ FIXED: Normalize status to lowercase
  const orderStatus = normalizeStatus(order?.orderStatus);
  const paymentStatus = normalizeStatus(order?.paymentStatus);
  
  const statusConfig = getStatusConfig(orderStatus);

  // ============================================
  // DELETE HANDLER
  // ============================================
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      await orderAPI.cancelOrder(order._id, 'Deleted by user');

      toast.success('Order deleted successfully', {
        icon: '✅',
        duration: 3000,
      });

      setShowDeleteModal(false);

      if (onDelete) {
        onDelete(order._id);
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Failed to delete order';
      
      toast.error(errorMessage, {
        icon: '❌',
        duration: 4000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Can only delete pending/confirmed orders
  const canDelete = ['pending', 'confirmed'].includes(orderStatus);

  return (
    <>
      <div className="group bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex-shrink-0">
                <Package className="text-primary-600 dark:text-primary-400" size={24} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 dark:text-gray-100 text-lg truncate">
                  {orderId}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                  <Clock size={14} />
                  {formatDateTime(order?.createdAt)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className={statusConfig.color}>
                {orderStatus.toUpperCase()}
              </Badge>
              
              {canDelete && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDeleteModal(true);
                  }}
                  className="ml-2 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Delete Order"
                  aria-label="Delete Order"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Body - Clickable Link */}
        <Link to={`/orders/${order?._id}`} className="block">
          <div className="p-6">
            {/* Products Preview */}
            <div className="flex items-center gap-4 mb-4">
              <ProductImage
                src={getImageUrl(firstItem?.image)}
                alt={firstItem?.name || 'Product'}
                className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {firstItem?.name || 'Product'}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Qty: {firstItem?.quantity || 1} × {formatPrice(firstItem?.price)}
                </p>
                {remainingItems > 0 && (
                  <p className="text-sm text-primary-600 dark:text-primary-400 mt-1">
                    +{remainingItems} more {remainingItems === 1 ? 'item' : 'items'}
                  </p>
                )}
              </div>
            </div>

            {/* Order Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Amount</p>
                <p className="font-bold text-lg text-gray-900 dark:text-gray-100">
                  {formatPrice(order?.totalPrice || order?.total)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment Method</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100 uppercase">
                  {order?.paymentMethod || 'N/A'}
                </p>
              </div>
            </div>

            {/* Shipping Address */}
            {order?.shippingAddress && (
              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {order.shippingAddress.fullName || 'N/A'}
                  </p>
                  <p className="truncate">{order.shippingAddress.addressLine1}</p>
                  <p className="truncate">
                    {order.shippingAddress.city}, {order.shippingAddress.state}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {order?.items?.length || 0} {(order?.items?.length || 0) === 1 ? 'item' : 'items'} • {formatPrice(order?.totalPrice || order?.total)}
              </span>
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium group-hover:translate-x-1 transition-transform">
                View Details
                <ChevronRight size={18} />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        orderNumber={orderId}
        isDeleting={isDeleting}
      />
    </>
  );
};