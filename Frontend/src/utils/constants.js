export const APP_NAME = import.meta.env.VITE_APP_NAME || 'JUMLAYA'
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
}

export const PAYMENT_METHODS = {
  COD: 'cod',
  ESEWA: 'esewa',
  KHALTI: 'khalti',
}

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
]

export const PER_PAGE_OPTIONS = [12, 24, 36, 48]

export const PRICE_RANGES = [
  { min: 0, max: 500, label: 'Under NPR 500' },
  { min: 500, max: 1000, label: 'NPR 500 - NPR 1000' },
  { min: 1000, max: 2000, label: 'NPR 1000 - NPR 2000' },
  { min: 2000, max: 5000, label: 'NPR 2000 - NPR 5000' },
  { min: 5000, max: null, label: 'Above NPR 5000' },
]