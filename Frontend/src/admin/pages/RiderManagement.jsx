// ============================================
// Frontend/src/admin/pages/RiderManagement.jsx
// ✅ INDEX 4: PRODUCTION-READY with State Refresh Fix
// ============================================
import { useState, useEffect } from 'react'
import { adminRiderAPI } from '@/api/admin.rider.api'
import { 
  Bike, Search, CheckCircle, XCircle, Clock, TrendingUp,
  Eye, FileText, Download, AlertTriangle, X, Check, Ban
} from 'lucide-react'
import toast from 'react-hot-toast'

const RiderManagement = () => {
  const [riders, setRiders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  
  const [selectedRider, setSelectedRider] = useState(null)
  const [showDocumentModal, setShowDocumentModal] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

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

  const handleViewDocuments = async (rider) => {
    console.log('📋 Opening documents for rider:', rider._id)
    setSelectedRider(rider)
    setShowDocumentModal(true)
  }

  // ✅ ENHANCED: Better state management and error handling
  const handleVerifyDocument = async (riderId, documentType, verified, rejectionReason = null) => {
    console.log('🔄 [UI] Starting document verification:', {
      riderId,
      documentType,
      verified,
      rejectionReason
    })

    try {
      // ✅ Call API
      const response = await adminRiderAPI.verifyDocument(riderId, documentType, verified, rejectionReason)
      
      console.log('✅ [UI] Verification response:', response)
      
      // ✅ Show success message
      toast.success(response.message || `Document ${verified ? 'verified' : 'rejected'} successfully`)
      
      // ✅ CRITICAL: Refresh selected rider's data
      console.log('🔄 [UI] Fetching updated rider details...')
      const updatedRiderResponse = await adminRiderAPI.getRiderDetails(riderId)
      
      if (updatedRiderResponse?.data?.rider) {
        console.log('✅ [UI] Updated rider data received:', {
          riderId: updatedRiderResponse.data.rider._id,
          documents: updatedRiderResponse.data.rider.riderProfile?.documents
        })
        
        // ✅ Update the modal with fresh data
        setSelectedRider(updatedRiderResponse.data.rider)
        
        // ✅ Update the rider in the list
        setRiders(prevRiders => 
          prevRiders.map(r => 
            r._id === riderId ? updatedRiderResponse.data.rider : r
          )
        )
      }
      
      // ✅ Refresh stats
      await fetchStats()
      
      console.log('✅ [UI] State updated successfully')
      
    } catch (error) {
      console.error('❌ [UI] Verification failed:', {
        riderId,
        documentType,
        verified,
        error: error.message,
        response: error.response?.data
      })
      
      toast.error(
        error.response?.data?.message || 
        error.message || 
        'Failed to verify document'
      )
    }
  }

  const handleApprove = async (riderId, riderName) => {
    if (!confirm(`Approve ${riderName}'s rider application?\n\nMake sure ALL required documents are verified.`)) return

    try {
      await adminRiderAPI.approveRider(riderId)
      toast.success(`${riderName} approved successfully!`)
      setShowDocumentModal(false)
      setSelectedRider(null)
      fetchRiders()
      fetchStats()
    } catch (error) {
      console.error('Failed to approve rider:', error)
      toast.error(error.response?.data?.message || 'Failed to approve rider')
    }
  }

  const handleReject = async (riderId, riderName) => {
    const reason = prompt(`Reason for rejecting ${riderName}? (Required)`)
    if (!reason || reason.trim() === '') {
      toast.error('Rejection reason is required')
      return
    }

    try {
      await adminRiderAPI.rejectRider(riderId, reason)
      toast.success(`${riderName}'s application rejected`)
      setShowDocumentModal(false)
      setSelectedRider(null)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Rider Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Verify documents individually and approve delivery riders
          </p>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Total Riders" value={stats.totalRiders} icon={Bike} color="blue" />
          <StatCard label="Pending Approval" value={stats.pendingRiders} icon={Clock} color="yellow" />
          <StatCard label="Approved" value={stats.approvedRiders} icon={CheckCircle} color="green" />
          <StatCard label="Active Now" value={stats.activeRiders} icon={TrendingUp} color="purple" />
          <StatCard label="Offline" value={stats.offlineRiders} icon={XCircle} color="gray" />
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
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
                onViewDocuments={handleViewDocuments}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}

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

      {showDocumentModal && selectedRider && (
        <DocumentViewerModal
          rider={selectedRider}
          onClose={() => {
            setShowDocumentModal(false)
            setSelectedRider(null)
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          onVerifyDocument={handleVerifyDocument}
        />
      )}
    </div>
  )
}

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
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}

const RiderCard = ({ rider, onViewDocuments, onApprove, onReject }) => {
  const isPending = !rider.riderProfile?.isApproved
  const docs = rider.riderProfile?.documents || {}
  
  const hasAllDocs = docs.license?.url && 
                     docs.vehicleRegistration?.url && 
                     docs.identityProof?.url
                     
  const allDocsVerified = docs.license?.verified && 
                          docs.vehicleRegistration?.verified && 
                          docs.identityProof?.verified

  return (
    <div className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {rider.firstname?.[0]}{rider.lastname?.[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
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
                {!hasAllDocs && isPending && (
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full flex items-center gap-1">
                    <AlertTriangle size={12} />
                    Missing Docs
                  </span>
                )}
                {hasAllDocs && !allDocsVerified && isPending && (
                  <span className="px-2 py-1 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full flex items-center gap-1">
                    <Clock size={12} />
                    Pending Verification
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
                    {rider.riderProfile?.riderCode || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Vehicle:</span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white capitalize">
                    {rider.riderProfile?.vehicleType || 'N/A'} {rider.riderProfile?.vehicleNumber && `- ${rider.riderProfile.vehicleNumber}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 lg:flex-col">
          <button
            onClick={() => onViewDocuments(rider)}
            className="flex-1 lg:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Eye size={18} />
            View Documents
          </button>
          
          {isPending && allDocsVerified && (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const DocumentViewerModal = ({ rider, onClose, onApprove, onReject, onVerifyDocument }) => {
  const [verifyingDoc, setVerifyingDoc] = useState(null)

  const documents = [
    { type: 'license', label: 'Driving License', required: true },
    { type: 'vehicleRegistration', label: 'Vehicle Registration', required: true },
    { type: 'identityProof', label: 'Identity Proof', required: true },
    { type: 'insurance', label: 'Insurance', required: false },
    { type: 'profilePhoto', label: 'Profile Photo', required: false }
  ]

  const docs = rider.riderProfile?.documents || {}
  const hasAllRequired = documents
    .filter(doc => doc.required)
    .every(doc => docs[doc.type]?.url)
    
  const allRequiredVerified = documents
    .filter(doc => doc.required)
    .every(doc => docs[doc.type]?.verified === true)

  const isPending = !rider.riderProfile?.isApproved

  // ✅ ENHANCED: Better UX with loading state
  const handleDocumentVerify = async (documentType, verified) => {
    let rejectionReason = null
    
    if (!verified) {
      rejectionReason = prompt('Please provide a reason for rejecting this document:')
      if (!rejectionReason || rejectionReason.trim() === '') {
        toast.error('Rejection reason is required')
        return
      }
    }

    setVerifyingDoc(documentType)
    
    try {
      await onVerifyDocument(rider._id, documentType, verified, rejectionReason)
      // Success toast is handled in parent component
    } catch (error) {
      // Error toast is handled in parent component
      console.error('Document verification error:', error)
    } finally {
      setVerifyingDoc(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {rider.firstname} {rider.lastname}'s Documents
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Rider Code: {rider.riderProfile?.riderCode} • Review and verify each document individually
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {documents.map(({ type, label, required }) => {
              const doc = docs[type]
              const hasDoc = doc?.url
              const isVerified = doc?.verified === true
              const isRejected = doc?.verified === false

              return (
                <div
                  key={type}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    isVerified
                      ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                      : isRejected
                      ? 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                      : hasDoc 
                      ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                      : required
                      ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {label}
                        {required && <span className="text-red-500">*</span>}
                      </h3>
                      {hasDoc && doc.uploadedAt && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {isVerified && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-600 text-white rounded-full flex items-center gap-1">
                        <Check size={12} />
                        Verified
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-600 text-white rounded-full flex items-center gap-1">
                        <Ban size={12} />
                        Rejected
                      </span>
                    )}
                    {!hasDoc && required && (
                      <AlertTriangle className="text-orange-600 dark:text-orange-400" size={20} />
                    )}
                  </div>

                  {hasDoc ? (
                    <div className="space-y-3">
                      <img
                        src={doc.url}
                        alt={label}
                        className="w-full h-56 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                      />
                      
                      {isRejected && doc.rejectionReason && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                          <p className="text-sm font-medium text-red-800 dark:text-red-300">
                            Rejection Reason:
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                            {doc.rejectionReason}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Eye size={16} />
                          View Full
                        </a>
                        <a
                          href={doc.url}
                          download
                          className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                          <Download size={16} />
                        </a>
                      </div>

                      {isPending && hasDoc && (
                        <div className="space-y-2">
                          <div className="flex gap-2 pt-2 border-t border-gray-300 dark:border-gray-600">
                            {!isVerified && (
                              <button
                                onClick={() => handleDocumentVerify(type, true)}
                                disabled={verifyingDoc === type}
                                className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                              >
                                {verifyingDoc === type ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <CheckCircle size={16} />
                                    {isRejected ? 'Re-Verify' : 'Verify'}
                                  </>
                                )}
                              </button>
                            )}
                            {!isRejected && (
                              <button
                                onClick={() => handleDocumentVerify(type, false)}
                                disabled={verifyingDoc === type}
                                className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white text-sm rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                              >
                                {verifyingDoc === type ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <XCircle size={16} />
                                    {isVerified ? 'Revoke & Reject' : 'Reject'}
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-56 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <div className="text-center">
                        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          {required ? 'Required - Not uploaded' : 'Optional - Not uploaded'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {isPending && (
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            {!hasAllRequired ? (
              <div className="flex items-center gap-3 text-orange-600 dark:text-orange-400 mb-4">
                <AlertTriangle size={24} />
                <span className="font-medium">
                  Missing required documents. Rider cannot be approved until all required documents are uploaded.
                </span>
              </div>
            ) : !allRequiredVerified ? (
              <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-4">
                <Clock size={24} />
                <span className="font-medium">
                  All documents uploaded. Please verify each document individually before approving the rider.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-green-600 dark:text-green-400 mb-4">
                <CheckCircle size={24} />
                <span className="font-medium">
                  All required documents are verified! You can now approve this rider.
                </span>
              </div>
            )}
            
            <div className="flex gap-3">
              {allRequiredVerified && (
                <>
                  <button
                    onClick={() => onApprove(rider._id, `${rider.firstname} ${rider.lastname}`)}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} />
                    Approve Rider
                  </button>
                  <button
                    onClick={() => onReject(rider._id, `${rider.firstname} ${rider.lastname}`)}
                    className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle size={20} />
                    Reject Application
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RiderManagement