// ============================================
// Frontend/src/rider/components/DocumentUpload.jsx
// ✅ Rider Document Upload Component
// ============================================
import { useState, useEffect } from 'react'
import { Upload, CheckCircle, XCircle, FileText, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/api/axios.config'

const DocumentUpload = () => {
  const [documents, setDocuments] = useState({})
  const [uploading, setUploading] = useState({})
  const [loading, setLoading] = useState(true)

  const documentTypes = [
    { 
      key: 'license', 
      label: 'Driving License', 
      required: true,
      description: 'Upload clear photo of your valid driving license'
    },
    { 
      key: 'vehicleRegistration', 
      label: 'Vehicle Registration', 
      required: true,
      description: 'Upload vehicle registration certificate'
    },
    { 
      key: 'identityProof', 
      label: 'Identity Proof (Citizenship/Passport)', 
      required: true,
      description: 'Upload citizenship card or passport'
    },
    { 
      key: 'insurance', 
      label: 'Vehicle Insurance', 
      required: false,
      description: 'Upload vehicle insurance document (optional)'
    },
    { 
      key: 'profilePhoto', 
      label: 'Profile Photo', 
      required: false,
      description: 'Upload a clear photo of yourself'
    }
  ]

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/riders/documents')
      setDocuments(response.data.data || {})
    } catch (error) {
      console.error('Failed to fetch documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (documentType, file) => {
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload an image (JPG, PNG, WEBP) or PDF')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    setUploading(prev => ({ ...prev, [documentType]: true }))

    try {
      const formData = new FormData()
      
      // ✅ CRITICAL: Use correct field names
      if (documentType === 'profilePhoto') {
        formData.append('avatar', file)
      } else {
        formData.append('document', file)
        formData.append('documentType', documentType)
      }

      const endpoint = documentType === 'profilePhoto' 
        ? '/riders/documents/avatar'
        : '/riders/documents/upload'

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success(`${documentTypes.find(d => d.key === documentType)?.label} uploaded successfully!`)
      
      // Refresh documents
      await fetchDocuments()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.response?.data?.message || 'Failed to upload document')
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }))
    }
  }

  const handleDelete = async (documentType) => {
    if (!confirm(`Are you sure you want to delete this document?`)) return

    try {
      await api.delete(`/riders/documents/${documentType}`)
      toast.success('Document deleted')
      await fetchDocuments()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete document')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          📋 Please upload all required documents to get your account approved. 
          Documents marked with <span className="text-red-500">*</span> are mandatory.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documentTypes.map(({ key, label, required, description }) => {
          const doc = documents[key]
          const hasDoc = doc?.url
          const isUploading = uploading[key]
          const isVerified = doc?.verified

          return (
            <div
              key={key}
              className={`border-2 rounded-lg p-6 transition-all ${
                hasDoc
                  ? isVerified
                    ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                    : 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20'
                  : required
                  ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {description}
                  </p>
                </div>
                {hasDoc && (
                  <div className="flex items-center gap-2">
                    {isVerified ? (
                      <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <CheckCircle size={20} />
                        <span className="text-xs font-medium">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                        <FileText size={20} />
                        <span className="text-xs font-medium">Pending</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Document Display */}
              {hasDoc ? (
                <div className="space-y-3">
                  {/* Image Preview */}
                  <div className="relative group">
                    <img
                      src={doc.url}
                      alt={label}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <Eye size={20} className="text-gray-800" />
                      </a>
                      <button
                        onClick={() => handleDelete(key)}
                        className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={20} className="text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Upload Date */}
                  {doc.uploadedAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  )}

                  {/* Reupload Button */}
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(key, e.target.files[0])}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <div className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium text-center cursor-pointer transition-colors">
                      {isUploading ? 'Uploading...' : 'Replace Document'}
                    </div>
                  </label>
                </div>
              ) : (
                <label className="block">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(key, e.target.files[0])}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <div className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                    transition-all hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20
                    ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}>
                    {isUploading ? (
                      <div className="space-y-3">
                        <div className="w-12 h-12 mx-auto border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-12 h-12 mx-auto text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Click to upload
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            PNG, JPG, WEBP or PDF (max 5MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </label>
              )}
            </div>
          )
        })}
      </div>

      {/* Status Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Document Status
        </h3>
        <div className="space-y-2">
          {documentTypes.filter(d => d.required).map(({ key, label }) => {
            const doc = documents[key]
            return (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                {doc?.url ? (
                  doc.verified ? (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                      <CheckCircle size={16} />
                      Verified
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 text-sm">
                      <FileText size={16} />
                      Awaiting Verification
                    </span>
                  )
                ) : (
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm">
                    <XCircle size={16} />
                    Not Uploaded
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default DocumentUpload