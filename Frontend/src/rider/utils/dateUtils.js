// ============================================
// Frontend/src/utils/dateUtils.js
// Date formatting and manipulation utilities
// ============================================

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('full', 'date', 'time', 'short')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'full') => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  
  if (isNaN(d.getTime())) return 'Invalid Date';
  
  const options = {
    full: {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    },
    date: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    },
    short: {
      month: 'short',
      day: 'numeric'
    }
  };
  
  return d.toLocaleString('en-US', options[format] || options.full);
};

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return 'N/A';
  
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);
  
  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  if (diffWeek < 4) return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`;
  if (diffMonth < 12) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
  return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
};

/**
 * Get date range for period
 * @param {string} period - Period type ('today', 'week', 'month', 'year')
 * @returns {object} Start and end dates
 */
export const getDateRange = (period) => {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      break;
    default:
      start.setHours(0, 0, 0, 0);
  }
  
  return { start, end: now };
};

/**
 * Format duration in minutes to readable string
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return '0 min';
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
export const isToday = (date) => {
  if (!date) return false;
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
};

/**
 * Check if date is this week
 * @param {Date|string} date - Date to check
 * @returns {boolean}
 */
export const isThisWeek = (date) => {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return d >= weekAgo && d <= now;
};

/**
 * Get period label
 * @param {string} period - Period type
 * @returns {string} Readable period label
 */
export const getPeriodLabel = (period) => {
  const labels = {
    today: 'Today',
    week: 'This Week',
    month: 'This Month',
    year: 'This Year',
    all: 'All Time'
  };
  return labels[period] || 'Custom Period';
};

/**
 * Format time of day (e.g., "Morning", "Afternoon", "Evening")
 * @param {Date|string} date - Date to check
 * @returns {string} Time of day
 */
export const getTimeOfDay = (date) => {
  const d = date ? new Date(date) : new Date();
  const hour = d.getHours();
  
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  if (hour < 21) return 'Evening';
  return 'Night';
};

/**
 * Get ISO date string for API calls
 * @param {Date|string} date - Date to convert
 * @returns {string} ISO date string
 */
export const toISOString = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString();
};

/**
 * Get start of day
 * @param {Date|string} date - Date
 * @returns {Date} Start of day
 */
export const startOfDay = (date) => {
  const d = date ? new Date(date) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day
 * @param {Date|string} date - Date
 * @returns {Date} End of day
 */
export const endOfDay = (date) => {
  const d = date ? new Date(date) : new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

export default {
  formatDate,
  getRelativeTime,
  getDateRange,
  formatDuration,
  isToday,
  isThisWeek,
  getPeriodLabel,
  getTimeOfDay,
  toISOString,
  startOfDay,
  endOfDay
};