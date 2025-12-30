import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import adminAPI from '@/admin/utils/adminApi'
import { ArrowLeft, Edit, Trash2, Package, DollarSign, TrendingUp, Eye, Star } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminProductDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)

  // ✅ Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder.png'
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }
    // Remove /api from VITE_API_URL for static files
    const backendUrl = import.meta.env.VITE_API_URL.replace('/api', '')
    return `${backendUrl}${imagePath}`
  }

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      console.log('📦 Fetching product details for ID:', id)
      
      const response = await adminAPI.products.getById(id)
      console.log('✅ Product API Response:', response)
      
      // Handle different response structures
      const productData = response.product || response.data || response
      
      console.log('✅ Product data:', productData)
      setProduct(productData)
      
    } catch (error) {
      console.error('❌ Error fetching product:', error)
      console.error('Error details:', error.response?.data)
      toast.error(error.response?.data?.message || 'Failed to load product')
      navigate('/admin/products')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return

    try {
      console.log('🗑️ Deleting product:', id)
      await adminAPI.products.delete(id)
      toast.success('Product deleted successfully')
      navigate('/admin/products')
    } catch (error) {
      console.error('❌ Error deleting product:', error)
      toast.error(error.response?.data?.message || 'Failed to delete product')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading product details...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Product not found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">The product you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/admin/products')}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Back to Products
        </button>
      </div>
    )
  }

  const hasImages = product.images && product.images.length > 0
  const currentImage = hasImages ? getImageUrl(product.images[selectedImage]) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/products')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Product Details
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                View complete product information
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/admin/products/${id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Images and Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Images */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Product Images
            </h2>
            {hasImages ? (
              <div className="space-y-4">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={currentImage}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = '/placeholder.png'
                    }}
                  />
                </div>
                {product.images.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImage === index
                            ? 'border-primary-600'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <img
                          src={getImageUrl(image)}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/placeholder.png'
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square rounded-lg bg-gray-100 dark:bg-gray-700 flex flex-col items-center justify-center">
                <Package className="w-20 h-20 text-gray-400 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No images available</p>
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Product Information
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {product.name}
                </h3>
                {product.brand && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Brand: {product.brand}
                  </p>
                )}
              </div>

              {product.description && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {product.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {product.category?.name || product.category || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Product Type</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white capitalize">
                    {product.productType || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Unit</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {product.unit || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Slug</p>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    {product.slug || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                {product.isOrganic && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    🌱 Organic
                  </span>
                )}
                {product.isSeasonal && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    🍂 Seasonal
                  </span>
                )}
                {product.isFeatured && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                    ⭐ Featured
                  </span>
                )}
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  product.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.isActive ? '✓ Active' : '✕ Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Stats and Pricing */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Pricing
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Price</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  Rs. {(product.price || 0).toLocaleString()}
                </p>
              </div>
              {product.originalPrice > 0 && product.originalPrice !== product.price && (
                <>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Original Price</p>
                    <p className="text-xl text-gray-500 dark:text-gray-400 line-through">
                      Rs. {(product.originalPrice || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Discount</p>
                    <p className="text-xl font-semibold text-green-600">
                      {product.discount || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stock Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Inventory
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Stock Quantity</p>
                <p className={`text-3xl font-bold ${
                  product.stock > 10 ? 'text-green-600' :
                  product.stock > 0 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {product.stock || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {product.stock > 10 ? '✓ In Stock' : 
                   product.stock > 0 ? '⚠ Low Stock' : 
                   '✕ Out of Stock'}
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Statistics
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Views</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {product.views || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Units Sold</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {product.sold || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Rating</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {product.rating?.toFixed(1) || '0.0'} ⭐ ({product.reviewCount || 0})
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Timestamps
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProductDetail