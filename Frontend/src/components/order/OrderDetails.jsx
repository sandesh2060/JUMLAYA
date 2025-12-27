import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, MapPin, CreditCard, Download, RotateCcw, 
  XCircle, Printer, Share2, ShoppingCart 
} from 'lucide-react';
import { Badge } from '@components/common/Badge';
import { Button } from '@components/common/Button';
import { Modal } from '@components/common/Modal';
import { OrderTimeline } from './OrderTimeline';
import { formatPrice, formatDateTime, getImageUrl } from '@utils/helpers';
import { orderAPI } from '@api/order.api';
import toast from 'react-hot-toast';

const STATUS_VARIANTS = {
  pending: 'warning',
  confirmed: 'info',
  processing: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'danger',
  returned: 'warning',
};

export const OrderDetails = ({ order, onOrderUpdate }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const canCancel = ['pending', 'confirmed'].includes(order.orderStatus);
  const canReturn = order.orderStatus === 'delivered' && order.deliveredAt;

  const handleDownloadInvoice = async () => {
    try {
      setLoading(true);
      await orderAPI.downloadInvoice(order._id);
      toast.success('Invoice downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      setLoading(true);
      await orderAPI.cancelOrder(order._id, cancelReason);
      toast.success('Order cancelled successfully');
      setShowCancelModal(false);
      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReturn = async () => {
    if (!returnReason.trim()) {
      toast.error('Please provide a reason for return');
      return;
    }

    try {
      setLoading(true);
      await orderAPI.requestReturn(order._id, returnReason);
      toast.success('Return request submitted successfully');
      setShowReturnModal(false);
      if (onOrderUpdate) onOrderUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request return');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async () => {
    try {
      setLoading(true);
      await orderAPI.reorder(order._id);
      toast.success('Items added to cart!');
      navigate('/cart');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reorder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Order {order.orderId}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Placed on {formatDateTime(order.createdAt)}
            </p>
          </div>
          <Badge variant={STATUS_VARIANTS[order.orderStatus]} className="text-lg px-4 py-2">
            {order.orderStatus.toUpperCase()}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleDownloadInvoice}
            variant="outline"
            loading={loading}
          >
            <Download size={18} className="mr-2" />
            Download Invoice
          </Button>

          {order.orderStatus === 'delivered' && (
            <Button onClick={handleReorder} variant="outline">
              <RotateCcw size={18} className="mr-2" />
              Reorder
            </Button>
          )}

          {canCancel && (
            <Button
              onClick={() => setShowCancelModal(true)}
              variant="danger"
            >
              <XCircle size={18} className="mr-2" />
              Cancel Order
            </Button>
          )}

          {canReturn && (
            <Button onClick={() => setShowReturnModal(true)} variant="outline">
              <RotateCcw size={18} className="mr-2" />
              Request Return
            </Button>
          )}
        </div>
      </div>

      {/* Timeline */}
      <OrderTimeline order={order} />

      {/* Order Items */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Package size={20} />
          Order Items
        </h2>
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <img
                src={getImageUrl(item.productImage)}
                alt={item.productName}
                className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {item.productName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Quantity: {item.quantity}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Price: {formatPrice(item.price)} each
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-gray-900 dark:text-gray-100">
                  {formatPrice(item.subtotal)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="space-y-3 max-w-sm ml-auto">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Discount</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            {order.couponDiscount > 0 && (
              <div className="flex justify-between text-green-600 dark:text-green-400">
                <span>Coupon Discount</span>
                <span>-{formatPrice(order.couponDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Shipping Fee</span>
              <span>{order.shippingFee > 0 ? formatPrice(order.shippingFee) : 'Free'}</span>
            </div>
            {order.tax > 0 && (
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
            )}
            <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-gray-100 pt-3 border-t border-gray-200 dark:border-gray-700">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shipping & Payment Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <MapPin size={20} />
            Shipping Address
          </h2>
          <div className="space-y-2 text-gray-600 dark:text-gray-400">
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {order.shippingAddress.fullName}
            </p>
            <p>{order.shippingAddress.phone}</p>
            <p>{order.shippingAddress.addressLine1}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <CreditCard size={20} />
            Payment Information
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100 uppercase">
                {order.paymentMethod}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Payment Status</p>
              <Badge variant={STATUS_VARIANTS[order.paymentStatus] || 'info'}>
                {order.paymentStatus.toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Paid</p>
              <p className="font-bold text-xl text-gray-900 dark:text-gray-100">
                {formatPrice(order.total)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Order"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to cancel this order? This action cannot be undone.
          </p>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Please provide a reason for cancellation..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-100"
            rows={4}
          />
          <div className="flex gap-3">
            <Button
              onClick={() => setShowCancelModal(false)}
              variant="secondary"
              className="flex-1"
            >
              Keep Order
            </Button>
            <Button
              onClick={handleCancelOrder}
              variant="danger"
              loading={loading}
              className="flex-1"
            >
              Cancel Order
            </Button>
          </div>
        </div>
      </Modal>

      {/* Return Modal */}
      <Modal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        title="Request Return"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Please provide a reason for returning this order.
          </p>
          <textarea
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            placeholder="Reason for return..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-100"
            rows={4}
          />
          <div className="flex gap-3">
                       <Button
              onClick={handleRequestReturn}
              variant="danger"
              loading={loading}
              className="flex-1"
            >
              Submit Return
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
