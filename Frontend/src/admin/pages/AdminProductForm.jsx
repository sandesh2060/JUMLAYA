import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import adminAPI from '@/admin/utils/adminApi'
import { ArrowLeft, Upload, X, Save, Loader, ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminProductForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    originalPrice: '',
    stock: '',
    productType: 'fruit',
    unit: 'kg',
    brand: '',
    isOrganic: false,
    isSeasonal: false,
    isFeatured: false,
    isActive: true,
    images: []
  })

  useEffect(() => {
    fetchCategories()
    if (isEditMode) {
      fetchProduct()
    }
  }, [id])

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const response = await adminAPI.categories.getAll()
      const categoriesData = response.categories || response.data || response
      
      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData)
      } else {
        toast.error('Invalid categories data format')
        setCategories([])
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error)
      toast.error('Failed to load categories')
      setCategories([])
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await adminAPI.products.getById(id)
      const product = response.product || response.data || response

      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category?._id || product.category || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        stock: product.stock || '',
        productType: product.productType || 'fruit',
        unit: product.unit || 'kg',
        brand: product.brand || '',
        isOrganic: product.isOrganic || false,
        isSeasonal: product.isSeasonal || false,
        isFeatured: product.isFeatured || false,
        isActive: product.isActive !== undefined ? product.isActive : true,
        images: product.images || []
      })
    } catch (error) {
      console.error('❌ Error fetching product:', error)
      toast.error('Failed to load product')
      navigate('/admin/products')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // ✅ NEW: Handle file selection and upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    
    if (files.length === 0) return

    // Check total images limit
    if (formData.images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }

    try {
      setUploading(true)
      
      // Upload images one by one
      const uploadPromises = files.map(file => adminAPI.products.uploadImage(file))
      const responses = await Promise.all(uploadPromises)
      
      // Extract image URLs
      const newImageUrls = responses.map(res => res.imageUrl)
      
      // Add to form data
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImageUrls]
      }))
      
      toast.success(`${files.length} image(s) uploaded successfully!`)
    } catch (error) {
      console.error('❌ Error uploading images:', error)
      toast.error('Failed to upload images')
    } finally {
      setUploading(false)
      // Reset file input
      e.target.value = ''
    }
  }

  // ✅ NEW: Remove image and delete from server
  const handleRemoveImage = async (imageUrl, index) => {
    try {
      // Extract filename from URL
      const filename = imageUrl.split('/').pop()
      
      // Delete from server
      await adminAPI.products.deleteImageFile(filename)
      
      // Remove from form data
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }))
      
      toast.success('Image removed')
    } catch (error) {
      console.error('❌ Error removing image:', error)
      toast.error('Failed to remove image')
    }
  }

  // Keep the URL method as backup
  const handleAddImageUrl = () => {
    const imageUrl = prompt('Enter image URL:')
    if (imageUrl && imageUrl.trim()) {
      if (formData.images.length >= 5) {
        toast.error('Maximum 5 images allowed')
        return
      }
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()]
      }))
      toast.success('Image added')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      toast.error('Product name is required')
      return
    }
    if (!formData.category) {
      toast.error('Category is required')
      return
    }
    if (!formData.price || formData.price <= 0) {
      toast.error('Valid price is required')
      return
    }
    if (formData.stock === '' || formData.stock < 0) {
      toast.error('Valid stock quantity is required')
      return
    }

    try {
      setLoading(true)

      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : 0,
        stock: parseInt(formData.stock)
      }

      let response
      if (isEditMode) {
        response = await adminAPI.products.update(id, submitData)
        toast.success('Product updated successfully! 🎉')
      } else {
        response = await adminAPI.products.create(submitData)
        toast.success('Product created successfully! 🎉')
      }

      navigate('/admin/products')
    } catch (error) {
      console.error('❌ Error saving product:', error)
      toast.error(error.response?.data?.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEditMode) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/products')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? 'Edit Product' : 'Create New Product'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {isEditMode ? 'Update product information' : 'Add a new product to your inventory'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter product name"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter product description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category * 
                {loadingCategories && <span className="text-blue-500 ml-2">(Loading...)</span>}
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                disabled={loadingCategories || categories.length === 0}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
              >
                <option value="">
                  {loadingCategories ? 'Loading categories...' : 
                   categories.length === 0 ? 'No categories available' : 
                   'Select Category'}
                </option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Type *
              </label>
              <select
                name="productType"
                value={formData.productType}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="fruit">Fruit</option>
                <option value="herb">Herb</option>
                <option value="honey">Honey</option>
                <option value="grain">Grain</option>
                <option value="vegetable">Vegetable</option>
                <option value="dairy">Dairy</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brand
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter brand name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unit
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., kg, liter, piece"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pricing & Stock
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price (Rs.) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Original Price (Rs.)
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Product Images - UPDATED */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Product Images
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.startsWith('http') ? image : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4001'}${image}`}
                  alt={`Product ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x300?text=Image+Error'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(image, index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* File Upload Button */}
            {formData.images.length < 5 && (
              <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary-500 transition-colors bg-gray-50 dark:bg-gray-700/50">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading ? (
                  <>
                    <Loader className="w-8 h-8 text-gray-400 mb-2 animate-spin" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Uploading...
                    </span>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Upload Images
                    </span>
                  </>
                )}
              </label>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Upload up to 5 images (JPEG, PNG, WebP, GIF)
            </p>
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Or add image URL
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Product Options
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isOrganic"
                checked={formData.isOrganic}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Organic Product</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isSeasonal"
                checked={formData.isSeasonal}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Seasonal Product</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Featured Product</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Active (Visible to customers)</span>
            </label>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploading || loadingCategories || categories.length === 0}
            className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isEditMode ? 'Update Product' : 'Create Product'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AdminProductForm