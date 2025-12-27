import { useState, useEffect } from 'react'
import { Settings, Save, User, Lock, Bell, Store, DollarSign, CreditCard, Share2, FileText, Clock, Search, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import settingsAPI from '@/admin/api/settings.api'

const AdminSettings = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('store')
  
  // Store Info Form
  const [storeForm, setStoreForm] = useState({
    storeName: '',
    storeEmail: '',
    storePhone: '',
    storeAddress: ''
  })

  // Business Settings Form
  const [businessForm, setBusinessForm] = useState({
    currency: '',
    currencyCode: '',
    taxRate: 0,
    shippingFee: 0,
    freeShippingThreshold: 0,
    minOrderAmount: 0,
    maxOrderAmount: 0
  })

  // Payment Methods Form
  const [paymentForm, setPaymentForm] = useState({
    cod: { enabled: false, name: 'Cash on Delivery' },
    esewa: { enabled: false, merchantId: '' },
    khalti: { enabled: false, publicKey: '' },
    bankTransfer: { enabled: false, accountDetails: '' }
  })

  // Social Media Form
  const [socialForm, setSocialForm] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    tiktok: ''
  })

  // Content Pages Form
  const [contentForm, setContentForm] = useState({
    aboutUs: '',
    returnPolicy: '',
    privacyPolicy: '',
    termsAndConditions: '',
    shippingPolicy: ''
  })

  // SEO Form
  const [seoForm, setSeoForm] = useState({
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogImage: ''
  })

  // Notification Settings
  const [notificationForm, setNotificationForm] = useState({
    emailNotifications: false,
    orderNotifications: false,
    lowStockAlerts: false,
    customerMessages: false
  })

  // Maintenance Mode
  const [maintenanceForm, setMaintenanceForm] = useState({
    enabled: false,
    message: ''
  })

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setInitialLoading(true)
      const response = await settingsAPI.getSettings()
      
      if (response.success && response.data?.settings) {
        const s = response.data.settings
        
        setStoreForm({
          storeName: s.storeName || '',
          storeEmail: s.storeEmail || '',
          storePhone: s.storePhone || '',
          storeAddress: s.storeAddress || ''
        })
        
        setBusinessForm({
          currency: s.currency || 'रु',
          currencyCode: s.currencyCode || 'NPR',
          taxRate: s.taxRate || 0,
          shippingFee: s.shippingFee || 0,
          freeShippingThreshold: s.freeShippingThreshold || 0,
          minOrderAmount: s.minOrderAmount || 0,
          maxOrderAmount: s.maxOrderAmount || 0
        })

        setPaymentForm({
          cod: s.paymentMethods?.cod || { enabled: true, name: 'Cash on Delivery' },
          esewa: s.paymentMethods?.esewa || { enabled: false, merchantId: '' },
          khalti: s.paymentMethods?.khalti || { enabled: false, publicKey: '' },
          bankTransfer: s.paymentMethods?.bankTransfer || { enabled: false, accountDetails: '' }
        })

        setSocialForm({
          facebook: s.socialMedia?.facebook || '',
          instagram: s.socialMedia?.instagram || '',
          twitter: s.socialMedia?.twitter || '',
          youtube: s.socialMedia?.youtube || '',
          tiktok: s.socialMedia?.tiktok || ''
        })

        setContentForm({
          aboutUs: s.aboutUs || '',
          returnPolicy: s.returnPolicy || '',
          privacyPolicy: s.privacyPolicy || '',
          termsAndConditions: s.termsAndConditions || '',
          shippingPolicy: s.shippingPolicy || ''
        })

        setSeoForm({
          metaTitle: s.seo?.metaTitle || '',
          metaDescription: s.seo?.metaDescription || '',
          metaKeywords: s.seo?.metaKeywords || '',
          ogImage: s.seo?.ogImage || ''
        })
        
        setNotificationForm({
          emailNotifications: s.notifications?.emailNotifications ?? true,
          orderNotifications: s.notifications?.orderNotifications ?? true,
          lowStockAlerts: s.notifications?.lowStockAlerts ?? true,
          customerMessages: s.notifications?.customerMessages ?? false
        })

        setMaintenanceForm({
          enabled: s.maintenanceMode?.enabled || false,
          message: s.maintenanceMode?.message || ''
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error(error.message || 'Failed to load settings')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleStoreSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await settingsAPI.updateStoreInfo(storeForm)
      if (response.success) {
        toast.success('Store information saved successfully!')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleBusinessSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await settingsAPI.updateBusinessSettings(businessForm)
      if (response.success) {
        toast.success('Business settings saved successfully!')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await settingsAPI.updatePaymentMethods({ paymentMethods: paymentForm })
      if (response.success) {
        toast.success('Payment methods saved successfully!')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await settingsAPI.updateSocialMedia({ socialMedia: socialForm })
      if (response.success) {
        toast.success('Social media links saved successfully!')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleContentSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await settingsAPI.updateContentPages(contentForm)
      if (response.success) {
        toast.success('Content pages saved successfully!')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSeoSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await settingsAPI.updateSEO({ seo: seoForm })
      if (response.success) {
        toast.success('SEO settings saved successfully!')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await settingsAPI.updateNotificationSettings(notificationForm)
      if (response.success) {
        toast.success('Notification preferences saved successfully!')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await settingsAPI.updateMaintenanceMode({ maintenanceMode: maintenanceForm })
      if (response.success) {
        toast.success('Maintenance mode updated successfully!')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'store', label: 'Store Info', icon: Store },
    { id: 'business', label: 'Business', icon: DollarSign },
    { id: 'payment', label: 'Payments', icon: CreditCard },
    { id: 'social', label: 'Social Media', icon: Share2 },
    { id: 'content', label: 'Content Pages', icon: FileText },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'security', label: 'Security', icon: Lock }
  ]

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
            <Settings className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your store settings and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Admin Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Admin Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Name</label>
            <p className="text-base font-medium text-gray-900 dark:text-white">
              {user?.firstname && user?.lastname 
                ? `${user.firstname} ${user.lastname}`
                : user?.fullName || user?.name || 'Admin User'}
            </p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Email</label>
            <p className="text-base font-medium text-gray-900 dark:text-white">
              {user?.email || 'admin@jumlaya.com'}
            </p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Role</label>
            <p className="text-base font-medium text-gray-900 dark:text-white capitalize">
              {user?.role || 'Admin'}
            </p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">Status</label>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tab Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {/* Store Info Tab */}
            {activeTab === 'store' && (
              <form onSubmit={handleStoreSubmit} className="p-6 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Store className="w-6 h-6 text-primary-600" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Store Information</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Basic details about your store</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Store Name *</label>
                    <input
                      type="text"
                      value={storeForm.storeName}
                      onChange={(e) => setStoreForm({ ...storeForm, storeName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Store Email *</label>
                    <input
                      type="email"
                      value={storeForm.storeEmail}
                      onChange={(e) => setStoreForm({ ...storeForm, storeEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Store Phone *</label>
                    <input
                      type="tel"
                      value={storeForm.storePhone}
                      onChange={(e) => setStoreForm({ ...storeForm, storePhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Store Address *</label>
                    <textarea
                      value={storeForm.storeAddress}
                      onChange={(e) => setStoreForm({ ...storeForm, storeAddress: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* Business Settings Tab */}
            {activeTab === 'business' && (
              <form onSubmit={handleBusinessSubmit} className="p-6 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="w-6 h-6 text-primary-600" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Business Settings</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Currency, pricing, and shipping configuration</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency Symbol *</label>
                    <input
                      type="text"
                      value={businessForm.currency}
                      onChange={(e) => setBusinessForm({ ...businessForm, currency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Currency Code *</label>
                    <input
                      type="text"
                      value={businessForm.currencyCode}
                      onChange={(e) => setBusinessForm({ ...businessForm, currencyCode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tax Rate (%) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={businessForm.taxRate}
                      onChange={(e) => setBusinessForm({ ...businessForm, taxRate: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shipping Fee (रु) *</label>
                    <input
                      type="number"
                      value={businessForm.shippingFee}
                      onChange={(e) => setBusinessForm({ ...businessForm, shippingFee: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Free Shipping Threshold (रु) *</label>
                    <input
                      type="number"
                      value={businessForm.freeShippingThreshold}
                      onChange={(e) => setBusinessForm({ ...businessForm, freeShippingThreshold: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Minimum Order Amount (रु) *</label>
                    <input
                      type="number"
                      value={businessForm.minOrderAmount}
                      onChange={(e) => setBusinessForm({ ...businessForm, minOrderAmount: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Maximum Order Amount (रु) *</label>
                    <input
                      type="number"
                      value={businessForm.maxOrderAmount}
                      onChange={(e) => setBusinessForm({ ...businessForm, maxOrderAmount: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment' && (
              <form onSubmit={handlePaymentSubmit} className="p-6 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-6 h-6 text-primary-600" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Methods</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Configure available payment options</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Cash on Delivery */}
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <label className="flex items-center gap-3 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={paymentForm.cod.enabled}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cod: { ...paymentForm.cod, enabled: e.target.checked } })}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">Cash on Delivery (COD)</span>
                    </label>
                    <input
                      type="text"
                      value={paymentForm.cod.name}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cod: { ...paymentForm.cod, name: e.target.value } })}
                      placeholder="Display Name"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  {/* eSewa */}
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <label className="flex items-center gap-3 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={paymentForm.esewa.enabled}
                        onChange={(e) => setPaymentForm({ ...paymentForm, esewa: { ...paymentForm.esewa, enabled: e.target.checked } })}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">eSewa</span>
                    </label>
                    <input
                      type="text"
                      value={paymentForm.esewa.merchantId}
                      onChange={(e) => setPaymentForm({ ...paymentForm, esewa: { ...paymentForm.esewa, merchantId: e.target.value } })}
                      placeholder="Merchant ID"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  {/* Khalti */}
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <label className="flex items-center gap-3 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={paymentForm.khalti.enabled}
                        onChange={(e) => setPaymentForm({ ...paymentForm, khalti: { ...paymentForm.khalti, enabled: e.target.checked } })}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">Khalti</span>
                    </label>
                    <input
                      type="text"
                      value={paymentForm.khalti.publicKey}
                      onChange={(e) => setPaymentForm({ ...paymentForm, khalti: { ...paymentForm.khalti, publicKey: e.target.value } })}
                      placeholder="Public Key"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  {/* Bank Transfer */}
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <label className="flex items-center gap-3 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={paymentForm.bankTransfer.enabled}
                        onChange={(e) => setPaymentForm({ ...paymentForm, bankTransfer: { ...paymentForm.bankTransfer, enabled: e.target.checked } })}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="font-medium text-gray-900 dark:text-white">Bank Transfer</span>
                    </label>
                    <textarea
                      value={paymentForm.bankTransfer.accountDetails}
                      onChange={(e) => setPaymentForm({ ...paymentForm, bankTransfer: { ...paymentForm.bankTransfer, accountDetails: e.target.value } })}
                      placeholder="Bank account details"
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* Social Media Tab */}
            {activeTab === 'social' && (
              <form onSubmit={handleSocialSubmit} className="p-6 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Share2 className="w-6 h-6 text-primary-600" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Social Media Links</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Connect your social media accounts</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Facebook URL</label>
                    <input
                      type="url"
                      value={socialForm.facebook}
                      onChange={(e) => setSocialForm({ ...socialForm, facebook: e.target.value })}
                      placeholder="https://facebook.com/yourpage"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instagram URL</label>
                    <input
                      type="url"
                      value={socialForm.instagram}
                      onChange={(e) => setSocialForm({ ...socialForm, instagram: e.target.value })}
                      placeholder="https://instagram.com/yourpage"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Twitter URL</label>
                    <input
                      type="url"
                      value={socialForm.twitter}
                      onChange={(e) => setSocialForm({ ...socialForm, twitter: e.target.value })}
                      placeholder="https://twitter.com/yourpage"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">YouTube URL</label>
                    <input
                      type="url"
                      value={socialForm.youtube}
                      onChange={(e) => setSocialForm({ ...socialForm, youtube: e.target.value })}
                      placeholder="https://youtube.com/yourchannel"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">TikTok URL</label>
                    <input
                      type="url"
                      value={socialForm.tiktok}
                      onChange={(e) => setSocialForm({ ...socialForm, tiktok: e.target.value })}
                      placeholder="https://tiktok.com/@yourpage"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* Content Pages Tab */}
            {activeTab === 'content' && (
              <form onSubmit={handleContentSubmit} className="p-6 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-6 h-6 text-primary-600" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Content Pages</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your store policies and information</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">About Us</label>
                    <textarea
                      value={contentForm.aboutUs}
                      onChange={(e) => setContentForm({ ...contentForm, aboutUs: e.target.value })}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Return Policy</label>
                    <textarea
                      value={contentForm.returnPolicy}
                      onChange={(e) => setContentForm({ ...contentForm, returnPolicy: e.target.value })}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Privacy Policy</label>
                    <textarea
                      value={contentForm.privacyPolicy}
                      onChange={(e) => setContentForm({ ...contentForm, privacyPolicy: e.target.value })}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Terms and Conditions</label>
                    <textarea
                      value={contentForm.termsAndConditions}
                      onChange={(e) => setContentForm({ ...contentForm, termsAndConditions: e.target.value })}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shipping Policy</label>
                    <textarea
                      value={contentForm.shippingPolicy}
                      onChange={(e) => setContentForm({ ...contentForm, shippingPolicy: e.target.value })}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <form onSubmit={handleSeoSubmit} className="p-6 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Search className="w-6 h-6 text-primary-600" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">SEO Settings</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Optimize your store for search engines</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meta Title</label>
                    <input
                      type="text"
                      value={seoForm.metaTitle}
                      onChange={(e) => setSeoForm({ ...seoForm, metaTitle: e.target.value })}
                      placeholder="JUMLAYA - Online Shopping in Nepal"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meta Description</label>
                    <textarea
                      value={seoForm.metaDescription}
                      onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
                      placeholder="Shop the latest products online in Nepal"
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meta Keywords</label>
                    <input
                      type="text"
                      value={seoForm.metaKeywords}
                      onChange={(e) => setSeoForm({ ...seoForm, metaKeywords: e.target.value })}
                      placeholder="online shopping, nepal, ecommerce"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">OG Image URL</label>
                    <input
                      type="text"
                      value={seoForm.ogImage}
                      onChange={(e) => setSeoForm({ ...seoForm, ogImage: e.target.value })}
                      placeholder="/og-image.jpg"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <form onSubmit={handleNotificationSubmit} className="p-6 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="w-6 h-6 text-primary-600" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notification Preferences</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your notification settings</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <input
                      type="checkbox"
                      checked={notificationForm.emailNotifications}
                      onChange={(e) => setNotificationForm({ ...notificationForm, emailNotifications: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Receive email notifications for important events
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <input
                      type="checkbox"
                      checked={notificationForm.orderNotifications}
                      onChange={(e) => setNotificationForm({ ...notificationForm, orderNotifications: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Order Notifications</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Get notified when new orders are placed
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <input
                      type="checkbox"
                      checked={notificationForm.lowStockAlerts}
                      onChange={(e) => setNotificationForm({ ...notificationForm, lowStockAlerts: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Low Stock Alerts</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Receive alerts when products are running low on stock
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <input
                      type="checkbox"
                      checked={notificationForm.customerMessages}
                      onChange={(e) => setNotificationForm({ ...notificationForm, customerMessages: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Customer Messages</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Get notified of new customer support messages
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </form>
            )}

            {/* Maintenance Mode Tab */}
            {activeTab === 'maintenance' && (
              <form onSubmit={handleMaintenanceSubmit} className="p-6 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Wrench className="w-6 h-6 text-primary-600" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Maintenance Mode</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Temporarily disable your store</p>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-6">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    ⚠️ When enabled, your store will be unavailable to customers. Only admins can access the site.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={maintenanceForm.enabled}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, enabled: e.target.checked })}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable Maintenance Mode
                    </span>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Maintenance Message</label>
                    <textarea
                      value={maintenanceForm.message}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, message: e.target.value })}
                      placeholder="We are currently under maintenance. Please check back soon."
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <Lock className="w-6 h-6 text-primary-600" />
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Security Settings</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account security</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Change Password</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Update your password to keep your account secure
                      </p>
                    </div>
                    <button
                      onClick={() => toast.info('Password change feature coming soon!')}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Change
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <button
                      onClick={() => toast.info('2FA feature coming soon!')}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                      Enable
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Login History</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        View recent login activity on your account
                      </p>
                    </div>
                    <button
                      onClick={() => toast.info('Login history feature coming soon!')}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings