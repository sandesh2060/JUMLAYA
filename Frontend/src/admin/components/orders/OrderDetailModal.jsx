import { useState, useEffect } from 'react'
import adminAPI from '@/admin/utils/adminApi'
import {
  X, Package, User, MapPin, CreditCard, Calendar,
  Truck, CheckCircle, XCircle, Clock, AlertCircle, Loader2,
  Phone, Mail, Edit, Download
} from 'lucide-react'
import toast from 'react-hot-toast'

const OrderDetailModal = ({ isOpen, onClose, orderId }) => {
  const [loading, setLoading] = useState(true)
  const [order, setOrder] = useState(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails()
    }
  }, [isOpen, orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      console.log('📦 Fetching order details for:', orderId)
      
      const response = await adminAPI.orders.getById(orderId)
      
      console.log('✅ Full API Response:', response)
      
      // Handle different response structures
      const orderData = response.order || response.data || response
      
      console.log('✅ Order data extracted:', orderData)
      setOrder(orderData)
      
    } catch (error) {
      console.error('❌ Error fetching order details:', error)
      console.error('❌ Error response:', error.response)
      toast.error(error.response?.data?.message || 'Failed to load order details')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true)
      
      const response = await adminAPI.orders.updateStatus(orderId, newStatus)
      console.log('✅ Status update response:', response)
      
      toast.success('Order status updated successfully')
      fetchOrderDetails()
      
    } catch (error) {
      console.error('❌ Error updating status:', error)
      toast.error(error.response?.data?.message || 'Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      processing: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      returned: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: XCircle,
      returned: AlertCircle,
    }
    const Icon = icons[status] || Clock
    return <Icon className="w-5 h-5" />
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="pointer-events-auto w-screen max-w-4xl transform transition-all duration-300 ease-in-out">
              <div className="flex h-full flex-col bg-white dark:bg-gray-800 shadow-xl">
                
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          {loading ? 'Loading...' : `Order ${order?.orderId || '#' + order?._id?.slice(-8)}`}
                        </h2>
                        {!loading && order && (
                          <p className="text-primary-100 text-sm mt-1">
                            {new Date(order.createdAt).toLocaleString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toast.success('Download feature coming soon!')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">Loading order details...</p>
                      </div>
                    </div>
                  ) : !order ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Order Not Found
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        The order you're looking for doesn't exist or has been deleted.
                      </p>
                      <button
                        onClick={onClose}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                      >
                        Close
                      </button>
                    </div>
                  ) : (
                    <div className="p-6 space-y-6">
                      
                      {/* Status Section */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(order.orderStatus)}
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Current Status</p>
                              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Update Status:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                              <button
                                key={status}
                                onClick={() => handleStatusUpdate(status)}
                                disabled={updating || order.orderStatus === status}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                  order.orderStatus === status
                                    ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                                    : 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-800 hover:scale-105'
                                } disabled:opacity-50`}
                              >
                                {updating ? (
                                  <span className="flex items-center gap-2">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Updating...
                                  </span>
                                ) : (
                                  status.charAt(0).toUpperCase() + status.slice(1)
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Order Items - Takes 2 columns */}
                        <div className="lg:col-span-2 space-y-6">
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                              <Package className="w-5 h-5 text-primary-600" />
                              Order Items ({order.items?.length || 0})
                            </h3>
                            <div className="space-y-4">
                              {order.items?.map((item, index) => (
                                <div key={index} className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                                  <div className="w-20 h-20 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden">
                                    {item.productImage || item.product?.images?.[0] ? (
                                      <img
                                        src={item.productImage || item.product?.images?.[0]}
                                        alt={item.productName || item.product?.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-8 h-8 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                                      {item.productName || item.product?.name || 'Product'}
                                    </h4>
                                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                      <span>Qty: {item.quantity}</span>
                                      <span>•</span>
                                      <span>Rs. {(item.price || 0).toLocaleString()}</span>
                                    </div>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                      Rs. {((item.subtotal || item.price * item.quantity) || 0).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Order Summary */}
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                  <span className="text-gray-900 dark:text-white font-medium">Rs. {(order.subtotal || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">Tax (13%)</span>
                                  <span className="text-gray-900 dark:text-white font-medium">Rs. {(order.tax || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600 dark:text-gray-400">Shipping Fee</span>
                                  <span className="text-gray-900 dark:text-white font-medium">Rs. {(order.shippingFee || 0).toLocaleString()}</span>
                                </div>
                                {order.discount > 0 && (
                                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                    <span>Discount</span>
                                    <span className="font-medium">- Rs. {order.discount.toLocaleString()}</span>
                                  </div>
                                )}
                                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-300 dark:border-gray-600">
                                  <span className="text-gray-900 dark:text-white">Total</span>
                                  <span className="text-primary-600 dark:text-primary-400">Rs. {(order.total || 0).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Status History */}
                          {order.statusHistory && order.statusHistory.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary-600" />
                                Status History
                              </h3>
                              <div className="space-y-4">
                                {order.statusHistory.map((history, index) => {
                                  const HistoryIcon = getStatusIcon(history.status).type
                                  return (
                                    <div key={index} className="flex gap-4 relative">
                                      {index !== order.statusHistory.length - 1 && (
                                        <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                                      )}
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${getStatusColor(history.status)}`}>
                                        <HistoryIcon className="w-5 h-5" />
                                      </div>
                                      <div className="flex-1 pb-4">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                          {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                                        </p>
                                        {history.comment && (
                                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {history.comment}
                                          </p>
                                        )}
                                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                          {new Date(history.updatedAt).toLocaleString()}
                                          {history.updatedBy && ` • ${history.updatedBy.firstname}`}
                                        </p>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-4">
                          {/* Customer Info */}
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                              <User className="w-4 h-4 text-primary-600" />
                              Customer
                            </h3>
                            <div className="space-y-2">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {order.user?.firstname} {order.user?.lastname}
                              </p>
                              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span className="break-all">{order.user?.email}</span>
                              </div>
                              {order.user?.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                  <Phone className="w-4 h-4 flex-shrink-0" />
                                  <span>{order.user.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Shipping Address */}
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary-600" />
                              Shipping Address
                            </h3>
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {order.shippingAddress?.fullName || 'N/A'}
                              </p>
                              <p>{order.shippingAddress?.addressLine1 || 'N/A'}</p>
                              {order.shippingAddress?.addressLine2 && (
                                <p>{order.shippingAddress.addressLine2}</p>
                              )}
                              <p>
                                {order.shippingAddress?.city || 'N/A'}
                                {order.shippingAddress?.state && `, ${order.shippingAddress.state}`}
                              </p>
                              <p>{order.shippingAddress?.country || 'Nepal'}</p>
                              {order.shippingAddress?.postalCode && (
                                <p>Postal Code: {order.shippingAddress.postalCode}</p>
                              )}
                              {order.shippingAddress?.phone && (
                                <div className="flex items-center gap-2 pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                                  <Phone className="w-4 h-4" />
                                  {order.shippingAddress.phone}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Payment Info */}
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-primary-600" />
                              Payment
                            </h3>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Method</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white uppercase">
                                  {order.paymentMethod || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  order.paymentStatus === 'completed'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : order.paymentStatus === 'failed'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                }`}>
                                  {order.paymentStatus || 'pending'}
                                </span>
                              </div>
                              {order.transactionId && (
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                  <p className="text-xs text-gray-500 dark:text-gray-500">
                                    Transaction ID
                                  </p>
                                  <p className="text-sm text-gray-900 dark:text-white font-mono break-all">
                                    {order.transactionId}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {!loading && order && (
                  <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                      >
                        Close
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toast.success('Print feature coming soon!')}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          Print Invoice
                        </button>
                        <button
                          onClick={() => toast.success('Email feature coming soon!')}
                          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Email Customer
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailModal