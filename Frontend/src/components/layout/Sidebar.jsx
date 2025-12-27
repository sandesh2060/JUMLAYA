import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  Home, 
  ShoppingBag, 
  Heart, 
  ShoppingCart, 
  User, 
  Package,
  ChevronDown,
  ChevronRight,
  X,
  Filter,
  DollarSign,
  Star,
  TrendingUp,
  Tag
} from 'lucide-react'
import { useLanguage } from '@context/LanguageContext'
import { useAuth } from '@hooks/useAuth'

export const Sidebar = ({ isOpen, onClose, categories = [] }) => {
  const { t } = useLanguage()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [expandedCategories, setExpandedCategories] = useState([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 })
  const [sortBy, setSortBy] = useState('newest')

  const isActive = (path) => location.pathname === path

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleCategoryClick = (categorySlug) => {
    navigate(`/products?category=${categorySlug}`)
    if (onClose) onClose()
  }

  const handlePriceFilter = () => {
    navigate(`/products?minPrice=${priceRange.min}&maxPrice=${priceRange.max}`)
    if (onClose) onClose()
  }

  const handleSort = (sortOption) => {
    setSortBy(sortOption)
    navigate(`/products?sort=${sortOption}`)
    if (onClose) onClose()
  }

  const navItems = [
    { path: '/', icon: Home, label: t('home') || 'Home' },
    { path: '/products', icon: ShoppingBag, label: t('products') || 'Products' },
    { path: '/wishlist', icon: Heart, label: t('wishlist') || 'Wishlist', auth: true },
    { path: '/cart', icon: ShoppingCart, label: t('cart') || 'Cart' },
    { path: '/orders', icon: Package, label: t('orders') || 'My Orders', auth: true },
    { path: '/profile', icon: User, label: t('profile') || 'Profile', auth: true },
  ]

  const sortOptions = [
    { value: 'newest', label: t('newest') || 'Newest First', icon: TrendingUp },
    { value: 'price-asc', label: t('priceLowHigh') || 'Price: Low to High', icon: DollarSign },
    { value: 'price-desc', label: t('priceHighLow') || 'Price: High to Low', icon: DollarSign },
    { value: 'rating', label: t('topRated') || 'Top Rated', icon: Star },
    { value: 'popular', label: t('popular') || 'Most Popular', icon: TrendingUp },
  ]

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen lg:h-auto
          w-80 bg-white dark:bg-gray-900 
          border-r border-gray-200 dark:border-gray-800
          overflow-y-auto z-50 transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            {t('filterAndSort') || 'Filter & Sort'}
          </h2>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Navigation Links */}
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              {t('navigation') || 'Navigation'}
            </h3>
            {navItems.map((item) => {
              if (item.auth && !isAuthenticated) return null
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive(item.path)
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Categories */}
          {categories && categories.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {t('categories') || 'Categories'}
              </h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <div key={category._id}>
                    <button
                      onClick={() => {
                        if (category.subcategories?.length > 0) {
                          toggleCategory(category._id)
                        } else {
                          handleCategoryClick(category.slug)
                        }
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      {category.subcategories?.length > 0 && (
                        expandedCategories.includes(category._id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )
                      )}
                    </button>
                    
                    {/* Subcategories */}
                    {category.subcategories?.length > 0 && expandedCategories.includes(category._id) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {category.subcategories.map((sub) => (
                          <button
                            key={sub._id}
                            onClick={() => handleCategoryClick(sub.slug)}
                            className="w-full text-left px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sort By */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              {t('sortBy') || 'Sort By'}
            </h3>
            <div className="space-y-1">
              {sortOptions.map((option) => {
                const Icon = option.icon
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSort(option.value)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all
                      ${sortBy === option.value
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {t('priceRange') || 'Price Range'}
            </h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                    {t('min') || 'Min'}
                  </label>
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
                    placeholder="0"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                    {t('max') || 'Max'}
                  </label>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 10000 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:outline-none text-sm"
                    placeholder="10000"
                  />
                </div>
              </div>
              <button
                onClick={handlePriceFilter}
                className="w-full px-4 py-2 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors text-sm font-medium"
              >
                {t('apply') || 'Apply Filter'}
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              {t('quickFilters') || 'Quick Filters'}
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/products?featured=true')}
                className="px-3 py-1.5 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/30 transition-colors"
              >
                ⭐ {t('featured') || 'Featured'}
              </button>
              <button
                onClick={() => navigate('/products?onSale=true')}
                className="px-3 py-1.5 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-full text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors"
              >
                🔥 {t('onSale') || 'On Sale'}
              </button>
              <button
                onClick={() => navigate('/products?new=true')}
                className="px-3 py-1.5 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-full text-xs font-medium hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors"
              >
                🆕 {t('new') || 'New'}
              </button>
              <button
                onClick={() => navigate('/products?topRated=true')}
                className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
              >
                ⚡ {t('topRated') || 'Top Rated'}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}