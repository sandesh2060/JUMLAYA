// ============================================
// 📦 UPDATED ORDERS PAGE WITH DELETE FUNCTIONALITY
// Path: src/pages/Orders.jsx
// ============================================

import { useState, useEffect } from 'react'
import { 
  Package, 
  Search, 
  Filter, 
  ChevronDown,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  RefreshCw
} from 'lucide-react'
import { orderAPI } from '@api/order.api'
import { OrderCard } from '../components/order/OrderCard' // ✅ Import OrderCard
import toast from 'react-hot-toast'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // ============================================
  // FETCH ORDERS
  // ============================================
  useEffect(() => {
    fetchOrders()
    fetchStats()
  }, [selectedStatus])

  const fetchOrders = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true)
      
      const params = selectedStatus !== 'all' ? { status: selectedStatus } : {}
      console.log('📡 Fetching orders with params:', params)
      
      const response = await orderAPI.getMyOrders(params)
      console.log('✅ Orders response:', response)
      
      // Handle different response structures
      const ordersList = response.data?.data?.orders || response.data?.orders || response.orders || []
      console.log('📦 Orders list:', ordersList)
      
      setOrders(ordersList)
    } catch (error) {
      console.error('❌ Failed to fetch orders:', error)
      toast.error('Failed to load orders')
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      console.log('📡 Fetching stats...')
      const response = await orderAPI.getMyOrderStats()
      console.log('✅ Stats response:', response)
      
      setStats(response.data || response)
    } catch (error) {
      console.error('❌ Failed to fetch stats:', error)
    }
  }

  // ============================================
  // HANDLE ORDER DELETION (OPTIMISTIC UPDATE)
  // ============================================
  const handleOrderDelete = (deletedOrderId) => {
    console.log('🗑️ Removing order from list:', deletedOrderId)
    
    // Optimistic update - immediately remove from UI
    setOrders(prevOrders => prevOrders.filter(order => order._id !== deletedOrderId))
    
    // Refresh stats
    fetchStats()
    
    // Optional: Refetch orders after a delay to ensure consistency
    setTimeout(() => {
      fetchOrders(false) // false = don't show loading spinner
    }, 1000)
  }

  // ============================================
  // MANUAL REFRESH
  // ============================================
  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([
      fetchOrders(false),
      fetchStats()
    ])
    setRefreshing(false)
    toast.success('Orders refreshed', { duration: 2000 })
  }

  // ============================================
  // SEARCH & FILTER
  // ============================================
  const filteredOrders = orders.filter(order => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = 
      order.orderId?.toLowerCase().includes(searchLower) ||
      order.items?.some(item => 
        item.productName?.toLowerCase().includes(searchLower)
      )
    
    return matchesSearch
  })

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 transition-colors">
      <div className="container mx-auto max-w-7xl">
        {/* ==================== HEADER ==================== */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Orders</h1>
            <p className="text-gray-600 dark:text-gray-400">Track and manage your orders</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Refresh orders"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* ==================== STATS CARDS ==================== */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Orders */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.totalOrders || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            {/* Total Spent */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    रू {(stats.totalSpent || 0).toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            {/* Delivered */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Delivered</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.byStatus?.find(s => s._id === 'delivered')?.count || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            {/* In Transit */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">In Transit</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.byStatus?.find(s => s._id === 'shipped')?.count || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <Truck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== FILTERS & SEARCH ==================== */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search orders by ID or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors w-full md:w-auto"
              >
                <Filter className="w-5 h-5" />
                <span className="capitalize">{selectedStatus}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showFilters && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowFilters(false)}
                  />
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-20">
                    {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                      <button
                        key={status}
                        onClick={() => {
                          setSelectedStatus(status)
                          setShowFilters(false)
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 capitalize first:rounded-t-lg last:rounded-b-lg ${
                          selectedStatus === status 
                            ? 'text-primary-600 dark:text-primary-400 font-medium bg-primary-50 dark:bg-primary-900/20' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ==================== ORDERS LIST ==================== */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No orders found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery 
                ? 'Try adjusting your search' 
                : selectedStatus !== 'all'
                ? `No ${selectedStatus} orders yet`
                : 'Start shopping to see your orders here'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <OrderCard 
                key={order._id} 
                order={order}
                onDelete={handleOrderDelete} // ✅ Pass delete handler
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders