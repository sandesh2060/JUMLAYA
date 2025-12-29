// Pagination.jsx - WITH i18n SUPPORT
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next' // ✅ ADD THIS
import { cn } from '@utils/helpers'

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const { t } = useTranslation() // ✅ ADD THIS
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        aria-label={t('pagination.previous')}
        title={t('pagination.previous')}
      >
        <ChevronLeft size={20} />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            'px-4 py-2 rounded-lg border transition-colors',
            page === currentPage
              ? 'bg-primary-600 text-white border-primary-600'
              : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
          )}
          aria-label={t('pagination.page', { page })}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        aria-label={t('pagination.next')}
        title={t('pagination.next')}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  )
}