// ============================================
// Frontend/src/rider/components/DocumentUpload.jsx
// ✅ FIXED - Proper File Upload Handling
// ============================================
import { useState, useEffect, useRef } from 'react'
import { 
  Upload, CheckCircle, XCircle, FileText, Trash2, Eye, 
  AlertTriangle, Clock, Info, X, RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '@/api/axios.config'

const DocumentUpload = () => {
  const [documents, setDocuments] = useState({})
  const [uploading, setUploading] = useState({})
  const [loading, setLoading] = useState(true)
  const [previewImage, setPreviewImage] = useState(null)
  const [expandedDoc, setExpandedDoc] = useState(null)

  const documentTypes = [
    { 
      key: 'license', 
      label: 'Driving License', 
      required: true,
      description: 'Upload a clear photo of your valid driving license',
      tips: 'Ensure all text is readable and photo is well-lit'
    },
    { 
      key: 'vehicleRegistration', 
      label: 'Vehicle Registration', 
      required: true,
      description: 'Upload your vehicle registration certificate',
      tips: 'Make sure the registration is current and valid'
    },
    { 
      key: 'identityProof', 
      label: 'Identity Proof', 
      required: true,
      description: 'Upload citizenship card or passport',
      tips: 'Photo must be clear and all details visible'
    },
    { 
      key: 'insurance', 
      label: 'Vehicle Insurance', 
      required: false,
      description: 'Upload vehicle insurance document',
      tips: 'Optional but recommended'
    },
    { 
      key: 'profilePhoto', 
      label: 'Profile Photo', 
      required: false,
      description: 'Upload a professional photo',
      tips: 'Use a recent photo with good lighting'
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

  // ✅ FIXED: Proper file upload with validation
const handleFileUpload = async (documentType, event) => {
  // Get file from event
  const file = event.target.files?.[0]
  
  console.log('🔍 DEBUG - Event Analysis:', {
    hasEvent: !!event,
    eventType: event?.type,
    hasTarget: !!event?.target,
    targetType: event?.target?.type,
    hasFiles: !!event?.target?.files,
    filesLength: event?.target?.files?.length,
    filesArray: Array.from(event?.target?.files || []),
  })
  
  console.log('🔍 DEBUG - File Analysis:', {
    hasFile: !!file,
    fileName: file?.name,
    fileSize: file?.size,
    fileType: file?.type,
    fileLastModified: file?.lastModified,
    isFile: file instanceof File,
    isBlob: file instanceof Blob,
    fileConstructor: file?.constructor?.name,
  })

  if (!file) {
    console.error('❌ No file selected')
    toast.error('Please select a file')
    return
  }

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

  const currentDoc = documents[documentType]
  const isReUpload = !!currentDoc?.url
  const wasVerified = currentDoc?.verified === true
  const wasRejected = currentDoc?.verified === false

  setUploading(prev => ({ ...prev, [documentType]: true }))

  try {
    // ✅ Create FormData
    const formData = new FormData()
    formData.append('document', file)

    // ✅ CRITICAL DEBUG: Verify FormData contents
    console.log('🔍 DEBUG - FormData Analysis:', {
      hasDocument: formData.has('document'),
      getDocument: formData.get('document'),
      getDocumentName: formData.get('document')?.name,
      getDocumentSize: formData.get('document')?.size,
      getDocumentType: formData.get('document')?.type,
    })

    // ✅ Log all FormData entries
    console.log('🔍 DEBUG - FormData Entries:')
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size}b, ${value.type})` : value)
    }

    const endpoint = `/riders/documents/${documentType}/upload`
    console.log('📤 Uploading to:', endpoint)

    // ✅ Make request WITHOUT headers option
    console.log('🚀 Making API call...')
    const response = await api.post(endpoint, formData)

    console.log('✅ Upload successful:', response.data)

    const docLabel = documentTypes.find(d => d.key === documentType)?.label

    if (isReUpload) {
      if (wasVerified) {
        toast.success(
          `${docLabel} re-uploaded!\n\n⚠️ Your previous verification has been cleared. Admin will re-verify.`,
          { duration: 6000, icon: '🔄' }
        )
      } else if (wasRejected) {
        toast.success(
          `✅ Corrected ${docLabel} uploaded!\n\nSubmitted for admin verification.`,
          { duration: 5000, icon: '✅' }
        )
      } else {
        toast.success(`${docLabel} updated! Pending verification.`, { duration: 4000 })
      }
    } else {
      toast.success(
        `${docLabel} uploaded!\n\nPending admin verification.`,
        { duration: 5000 }
      )
    }
    
    await fetchDocuments()
    
    // ✅ Clear the file input
    event.target.value = ''
    
  } catch (error) {
    console.error('❌ Upload error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        headers: error.config?.headers,
      }
    })
    
    const errorMsg = error.response?.data?.message || 'Failed to upload document'
    toast.error(errorMsg)
  } finally {
    setUploading(prev => ({ ...prev, [documentType]: false }))
  }
}

  const handleDelete = async (documentType) => {
    const doc = documents[documentType]
    const docLabel = documentTypes.find(d => d.key === documentType)?.label

    if (!confirm(`⚠️ Delete ${docLabel}?\n\nThis cannot be undone.${doc?.verified ? '\n\nNote: This document is verified.' : ''}`)) {
      return
    }

    try {
      await api.delete(`/riders/documents/${documentType}`)
      toast.success(`${docLabel} deleted`)
      await fetchDocuments()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete document')
    }
  }

  const getDocumentStatus = (doc) => {
    if (!doc?.url) {
      return {
        status: 'not_uploaded',
        color: 'gray',
        icon: AlertTriangle,
        text: 'Not Uploaded',
        bgColor: 'bg-gray-100 dark:bg-gray-700',
        borderColor: 'border-gray-300 dark:border-gray-600',
        textColor: 'text-gray-600 dark:text-gray-400'
      }
    }

    if (doc.verified === true) {
      return {
        status: 'verified',
        color: 'green',
        icon: CheckCircle,
        text: 'Verified',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-400 dark:border-green-600',
        textColor: 'text-green-700 dark:text-green-400'
      }
    }

    if (doc.verified === false) {
      return {
        status: 'rejected',
        color: 'red',
        icon: XCircle,
        text: 'Rejected - Action Required',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-400 dark:border-red-600',
        textColor: 'text-red-700 dark:text-red-400'
      }
    }

    return {
      status: 'pending',
      color: 'yellow',
      icon: Clock,
      text: 'Pending Review',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-400 dark:border-yellow-600',
      textColor: 'text-yellow-700 dark:text-yellow-400'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Instructions Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-lg mb-2">
              📋 Document Verification Required
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
              Upload all required documents marked with <span className="text-red-500 font-semibold">*</span> to get approved.
              Ensure documents are clear, readable, and up-to-date.
            </p>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {documentTypes.map(({ key, label, required, description, tips }) => {
          const doc = documents[key]
          const status = getDocumentStatus(doc)
          const isUploading = uploading[key]
          const StatusIcon = status.icon
          const isExpanded = expandedDoc === key

          return (
            <div
              key={key}
              className={`border-2 ${status.borderColor} ${status.bgColor} rounded-xl overflow-hidden transition-all hover:shadow-lg`}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gray-400" />
                      {label}
                      {required && <span className="text-red-500 text-sm">*</span>}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {description}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${status.bgColor} ${status.textColor} border ${status.borderColor}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {status.text}
                    </span>
                    
                    {doc?.version > 1 && (
                      <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        v{doc.version}
                      </span>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Tip:</strong> {tips}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-4">
                {doc?.url ? (
                  <div className="space-y-3">
                    {/* Image Preview */}
                    <div 
                      className="relative group cursor-pointer rounded-lg overflow-hidden"
                      onClick={() => setPreviewImage(doc.url)}
                    >
                      {doc.url.endsWith('.pdf') ? (
                        <div className="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-700">
                          <div className="text-center">
                            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">PDF Document</span>
                            <a 
                              href={doc.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="block mt-2 text-blue-600 hover:underline text-sm"
                            >
                              Open PDF
                            </a>
                          </div>
                        </div>
                      ) : (
                        <>
                          <img
                            src={doc.url}
                            alt={label}
                            className="w-full h-48 object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                            <Eye className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {status.status === 'verified' && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                              <CheckCircle className="w-4 h-4" />
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Rejection Reason */}
                    {status.status === 'rejected' && doc.rejectionReason && (
                      <div className="p-4 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 rounded-r space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
                              Document Rejected - Action Required
                            </p>
                            <div className="p-3 bg-white dark:bg-red-900/40 rounded text-sm text-red-700 dark:text-red-400">
                              <strong>Reason:</strong> {doc.rejectionReason}
                            </div>
                            {doc.rejectedAt && (
                              <p className="text-xs text-red-600 dark:text-red-500 mt-2">
                                Rejected {new Date(doc.rejectedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Document Info */}
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                      <span className="flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                      {doc.verifiedAt && (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          Verified {new Date(doc.verifiedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <label className="flex-1">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload(key, e)}
                          className="hidden"
                          disabled={isUploading}
                        />
                        <div className={`px-4 py-2.5 rounded-lg font-medium text-center cursor-pointer transition-all flex items-center justify-center gap-2 ${
                          status.status === 'rejected'
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          {isUploading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              {status.status === 'rejected' ? 'Upload Corrected' : 'Replace Document'}
                            </>
                          )}
                        </div>
                      </label>

                      <button
                        onClick={() => handleDelete(key)}
                        disabled={isUploading}
                        className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg font-medium transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setExpandedDoc(isExpanded ? null : key)}
                        className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-all"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  // ✅ FIXED: Upload area with proper event handling
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(key, e)}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <div className={`
                      border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                      transition-all hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20
                      ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                      ${required ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'}
                    `}>
                      {isUploading ? (
                        <div className="space-y-4">
                          <div className="w-16 h-16 mx-auto border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Uploading...
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Please wait
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                            <Upload className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                              Click to upload {label}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              PNG, JPG, WEBP or PDF
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              Max 5MB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          <img 
            src={previewImage} 
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

export default DocumentUpload