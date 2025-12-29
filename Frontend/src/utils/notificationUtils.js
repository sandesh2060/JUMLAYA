export const getNotificationIcon = (type) => {
  const icons = {
    order_placed: 'shopping-bag',
    order_confirmed: 'check-circle',
    order_delivered: 'check-circle',
    // ... add all types
  };
  return icons[type] || 'bell';
};

export const getNotificationColor = (type) => {
  const colors = {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6'
  };
  return colors[type] || colors.info;
};

export const formatNotificationTime = (date) => {
  // Format relative time
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
};