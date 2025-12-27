import { Check, Package, Truck, Home, XCircle, RotateCcw, Clock } from 'lucide-react';
import { formatDateTime } from '@utils/helpers';

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    label: 'Order Placed',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200'
  },
  confirmed: {
    icon: Check,
    label: 'Order Confirmed',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  processing: {
    icon: Package,
    label: 'Processing',
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  shipped: {
    icon: Truck,
    label: 'Shipped',
    color: 'bg-indigo-500',
    textColor: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200'
  },
  delivered: {
    icon: Home,
    label: 'Delivered',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  cancelled: {
    icon: XCircle,
    label: 'Cancelled',
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  returned: {
    icon: RotateCcw,
    label: 'Returned',
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  }
};

const NORMAL_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export const OrderTimeline = ({ order }) => {
  const { orderStatus, statusHistory = [] } = order;

  // Check if order is in normal flow or terminated
  const isTerminated = ['cancelled', 'returned'].includes(orderStatus);
  const flowStatuses = isTerminated ? 
    statusHistory.map(h => h.status) : 
    NORMAL_FLOW;

  const getCurrentIndex = () => {
    return flowStatuses.indexOf(orderStatus);
  };

  const isStatusCompleted = (status) => {
    const currentIndex = getCurrentIndex();
    const statusIndex = flowStatuses.indexOf(status);
    return statusIndex <= currentIndex;
  };

  const getStatusInfo = (status) => {
    const historyItem = statusHistory.find(h => h.status === status);
    return historyItem;
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Order Tracking
      </h3>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
        
        {/* Progress Line */}
        <div 
          className={`absolute left-6 top-0 w-0.5 transition-all duration-1000 ${STATUS_CONFIG[orderStatus]?.color || 'bg-gray-300'}`}
          style={{ 
            height: `${(getCurrentIndex() / (flowStatuses.length - 1)) * 100}%` 
          }}
        />

        {/* Timeline Items */}
        <div className="space-y-8">
          {flowStatuses.map((status, index) => {
            const config = STATUS_CONFIG[status];
            const Icon = config.icon;
            const isCompleted = isStatusCompleted(status);
            const isCurrent = status === orderStatus;
            const statusInfo = getStatusInfo(status);

            return (
              <div key={status} className="relative flex items-start gap-4">
                {/* Icon */}
                <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 border-white dark:border-gray-900 transition-all duration-500 ${
                  isCompleted 
                    ? `${config.color} shadow-lg scale-110` 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  <Icon 
                    size={20} 
                    className={isCompleted ? 'text-white' : 'text-gray-400'}
                  />
                  
                  {/* Pulse animation for current status */}
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full animate-ping opacity-75" style={{ backgroundColor: config.color.replace('bg-', '') }} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className={`rounded-lg border p-4 transition-all duration-300 ${
                    isCurrent 
                      ? `${config.borderColor} ${config.bgColor} shadow-md` 
                      : isCompleted 
                      ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800' 
                      : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className={`font-semibold ${
                          isCurrent ? config.textColor : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {config.label}
                        </h4>
                        {statusInfo?.comment && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {statusInfo.comment}
                          </p>
                        )}
                      </div>
                      {isCurrent && (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor}`}>
                          Current
                        </span>
                      )}
                    </div>
                    
                    {statusInfo && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock size={12} />
                        <span>{formatDateTime(statusInfo.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Estimated Delivery for active orders */}
      {!isTerminated && orderStatus !== 'delivered' && (
        <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
          <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
            📦 Estimated delivery: 3-5 business days
          </p>
        </div>
      )}
    </div>
  );
};