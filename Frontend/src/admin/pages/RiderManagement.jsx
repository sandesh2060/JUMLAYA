// ============================================
// Frontend/src/admin/pages/RiderManagement.jsx
// Admin Rider Approval & Management Page
// ============================================
import { useState, useEffect } from 'react'
import { adminRiderAPI } from '@/api/admin.rider.api'
import { Bike, Search, Filter, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

const RiderManagement = () => {
  const [riders, setRiders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending') // 'all', 'pending', 'approved'
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  // Fetch rider stats
  useEffect(() => {
    fetchStats()
  }, [])

  // Fetch riders when filter or page changes
  useEffect(() => {
    fetchRiders()
  }, [filter, page, search])

  const fetchStats = async () => {
    try {
      const response = await adminRiderAPI.getRiderStats()
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchRiders = async () => {
    setLoading(true)
    try {
      const params = {
        status: filter === 'all' ? undefined : filter,
        search: search || undefined,
        page,
        limit: 10
      }
      const response = await adminRiderAPI.getAllRiders(params)
      setRiders(response.data.riders)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Failed to fetch riders:', error)
      toast.error('Failed to load riders')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (riderId, riderName) => {
    if (!confirm(`Approve ${riderName}'s rider application?`)) return

    try {
      await adminRiderAPI.approveRider(riderId)
      toast.success(`${riderName} approved successfully!`)
      fetchRiders()
      fetchStats()
    } catch (error) {
      console.error('Failed to approve rider:', error)
      toast.error(error.response?.data?.message || 'Failed to approve rider')
    }
  }

  const handleReject = async (riderId, riderName) => {
    const reason = prompt(`Reason for rejecting ${riderName}? (Optional)`)
    if (reason === null) return // User cancelled

    try {
      await adminRiderAPI.rejectRider(riderId, reason)
      toast.success(`${riderName}'s application rejected`)
      fetchRiders()
      fetchStats()
    } catch (error) {
      console.error('Failed to reject rider:', error)
      toast.error(error.response?.data?.message || 'Failed to reject rider')
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchRiders()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Rider Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Approve and manage delivery riders
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total Riders"
            value={stats.totalRiders}
            icon={Bike}
            color="blue"
          />
          <StatCard
            label="Pending Approval"
            value={stats.pendingRiders}
            icon={Clock}
            color="yellow"
          />
          <StatCard
            label="Approved"
            value={stats.approvedRiders}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            label="Active Now"
            value={stats.activeRiders}
            icon={TrendingUp}
            color="purple"
          />
          <StatCard
            label="Offline"
            value={stats.offlineRiders}
            icon={XCircle}
            color="gray"
          />
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or rider code..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </form>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {['pending', 'approved', 'all'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => {
                  setFilter(filterOption)
                  setPage(1)
                }}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                  filter === filterOption
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filterOption}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Riders List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading riders...</p>
          </div>
        ) : riders.length === 0 ? (
          <div className="p-8 text-center">
            <Bike className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No riders found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {riders.map((rider) => (
              <RiderCard
                key={rider._id}
                rider={rider}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {riders.length} of {pagination.total} riders
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.pages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Stat Card Component
const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}

// Rider Card Component
const RiderCard = ({ rider, onApprove, onReject }) => {
  const isPending = !rider.riderProfile.isApproved

  return (
    <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Rider Info */}
        <div className="flex-1">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {rider.firstname[0]}{rider.lastname[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {rider.firstname} {rider.lastname}
                </h3>
                {isPending ? (
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full">
                    Pending
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                    Approved
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {rider.email} • {rider.phone}
              </p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Rider Code:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {rider.riderProfile.riderCode}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Vehicle:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white capitalize">
                    {rider.riderProfile.vehicleType} - {rider.riderProfile.vehicleNumber}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">License:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    {rider.riderProfile.licenseNumber}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Registered: {new Date(rider.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isPending && (
          <div className="flex gap-2 lg:flex-col">
            <button
              onClick={() => onApprove(rider._id, `${rider.firstname} ${rider.lastname}`)}
              className="flex-1 lg:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Approve
            </button>
            <button
              onClick={() => onReject(rider._id, `${rider.firstname} ${rider.lastname}`)}
              className="flex-1 lg:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <XCircle size={18} />
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default RiderManagement