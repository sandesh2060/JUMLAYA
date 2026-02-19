// ============================================
// 📄 Pagination.jsx - FULLY WORKING
// Path: src/components/common/Pagination.jsx
// ============================================
// ✅ cn() from @utils/helpers — simple class join (no clsx/twMerge needed)
// ✅ i18n keys confirmed in translation.json (uses common.previous / common.next)
// ✅ primary-600 = #23804b confirmed in tailwind.config.js
// ✅ Smart page windowing (never shows more than 7 buttons)
// ============================================

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@utils/helpers'

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const { t } = useTranslation()

  // ── Guard: nothing to show ────────────────────────────────────────────────
  if (!totalPages || totalPages <= 1) return null

  // ── Smart page windowing ──────────────────────────────────────────────────
  // Shows: [1] ... [4][5][6] ... [12]  — max 7 slots
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages = []

    // Always show first page
    pages.push(1)

    if (currentPage <= 4) {
      // Near start: 1 2 3 4 5 ... last
      pages.push(2, 3, 4, 5, '...', totalPages)
    } else if (currentPage >= totalPages - 3) {
      // Near end: 1 ... last-4 last-3 last-2 last-1 last
      pages.push(
        '...',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      )
    } else {
      // Middle: 1 ... prev current next ... last
      pages.push(
        '...',
        currentPage - 1,
        currentPage,
        currentPage + 1,
        '...',
        totalPages
      )
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <nav
      role="navigation"
      aria-label={t('pagination.label', { defaultValue: 'Pagination' })}
      className="flex items-center justify-center gap-1.5"
    >
      {/* ── Prev button ── */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label={t('common.previous')}
        title={t('common.previous')}
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-lg border transition-all duration-150',
          currentPage === 1
            ? 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50'
            : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 dark:hover:bg-primary-900/20 dark:hover:border-primary-700 dark:hover:text-primary-400'
        )}
      >
        <ChevronLeft size={16} strokeWidth={2.5} />
      </button>

      {/* ── Page buttons ── */}
      {pageNumbers.map((page, index) => {
        // Ellipsis
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex items-center justify-center w-9 h-9 text-gray-400 dark:text-gray-500 text-sm select-none"
              aria-hidden="true"
            >
              ···
            </span>
          )
        }

        const isActive = page === currentPage

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-label={t('pagination.page', { page, defaultValue: `Page ${page}` })}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-lg border text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-primary-600 text-white border-primary-600 shadow-sm shadow-primary-200 dark:shadow-primary-900/30 scale-105'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 dark:hover:bg-primary-900/20 dark:hover:border-primary-700 dark:hover:text-primary-400'
            )}
          >
            {page}
          </button>
        )
      })}

      {/* ── Next button ── */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label={t('common.next')}
        title={t('common.next')}
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-lg border transition-all duration-150',
          currentPage === totalPages
            ? 'border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50'
            : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 dark:hover:bg-primary-900/20 dark:hover:border-primary-700 dark:hover:text-primary-400'
          )}
      >
        <ChevronRight size={16} strokeWidth={2.5} />
      </button>
    </nav>
  )
}