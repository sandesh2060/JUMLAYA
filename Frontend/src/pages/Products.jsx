import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next' // ✅ ADD THIS
import { ProductGrid } from '@components/product/ProductGrid'
import { ProductFilters } from '@components/product/ProductFilters'
import { Pagination } from '@components/common/Pagination'
import { Breadcrumb } from '@components/layout/Breadcrumb'
import { SORT_OPTIONS } from '@utils/constants'
import { productAPI } from '@api/product.api'

const Products = () => {
  const { t } = useTranslation() // ✅ ADD THIS
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({})
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    fetchProducts()
  }, [searchParams, filters, currentPage])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      // Build query parameters
      const params = {
        page: currentPage,
        search: searchParams.get('search') || '',
        sort: searchParams.get('sort') || 'newest',
      }

      // Add price range filters if they exist
      if (filters.priceRange) {
        if (filters.priceRange.min !== undefined) {
          params.minPrice = filters.priceRange.min
        }
        if (filters.priceRange.max !== undefined) {
          params.maxPrice = filters.priceRange.max
        }
      }

      // Add other filters (category, rating, etc.)
      if (filters.category) params.category = filters.category
      if (filters.rating) params.rating = filters.rating
      if (filters.inStock !== undefined) params.inStock = filters.inStock

      console.log('📤 Fetching products with params:', params) // Debug log

      const data = await productAPI.getAll(params)
      setProducts(data.products || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    console.log('🔄 Filter changed:', newFilters) // Debug log
    setFilters(prev => ({ ...prev, ...newFilters }))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handleClearFilters = () => {
    console.log('🗑️ Clearing all filters') // Debug log
    setFilters({})
    setCurrentPage(1)
  }

  const handleSortChange = (e) => {
    setSearchParams({ ...Object.fromEntries(searchParams), sort: e.target.value })
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ✅ Translated sort options
  const translatedSortOptions = [
    { value: 'newest', label: t('productsPage.sortOptions.newest') },
    { value: 'price-asc', label: t('productsPage.sortOptions.priceAsc') },
    { value: 'price-desc', label: t('productsPage.sortOptions.priceDesc') },
    { value: 'name-asc', label: t('productsPage.sortOptions.nameAsc') },
    { value: 'name-desc', label: t('productsPage.sortOptions.nameDesc') },
    { value: 'popular', label: t('productsPage.sortOptions.popular') },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb items={[{ label: t('nav.products') }]} />

      <div className="flex flex-col lg:flex-row gap-8 mt-6">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <ProductFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClear={handleClearFilters}
          />
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {searchParams.get('search')
                ? t('productsPage.searchResults', { query: searchParams.get('search') })
                : t('productsPage.title')}
            </h1>
            <select
              onChange={handleSortChange}
              value={searchParams.get('sort') || 'newest'}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {translatedSortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Results count */}
          {!loading && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {t('productsPage.showing', { count: products.length })}
            </p>
          )}

          {/* Loading state */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">{t('productsPage.loading')}</p>
            </div>
          )}

          {/* No results */}
          {!loading && products.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('productsPage.noResults')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('productsPage.noResultsMessage')}
              </p>
            </div>
          )}

          {/* Products grid */}
          {!loading && products.length > 0 && (
            <ProductGrid products={products} loading={loading} />
          )}

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Products