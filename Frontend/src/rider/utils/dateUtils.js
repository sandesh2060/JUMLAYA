// Frontend/src/rider/utils/dateUtils.js
export const formatDate = (date, format = 'short') => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  if (format === 'full') {
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  if (format === 'time') {
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  
  return d.toLocaleDateString();
};

export const getPeriodLabel = (period) => {
  const labels = {
    today: 'Today',
    week: 'This Week',
    month: 'This Month',
    all: 'All Time'
  };
  return labels[period] || 'All Time';
};

export const getTimeAgo = (date) => {
  if (!date) return '';
  
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [name, value] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / value);
    if (interval >= 1) {
      return `${interval} ${name}${interval > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'Just now';
};