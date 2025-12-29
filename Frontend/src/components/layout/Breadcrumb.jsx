// Breadcrumb.jsx - WITH FULL i18n SUPPORT (FIXED)
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const Breadcrumb = ({ items = [] }) => {
  const { t } = useTranslation()

  // ✅ Helper function to translate common breadcrumb labels
  const translateLabel = (label) => {
    // Common navigation items - UPDATED to use nav namespace
    const translations = {
      'Products': t('nav.products'),
      'About': t('nav.about'),
      'Contact': t('nav.contact'),
      'Cart': t('nav.cart'),
      'Wishlist': t('nav.wishlist'),
      'Profile': t('nav.profile'),
      'Orders': t('nav.orders'),
      'Settings': t('nav.settings'),
    }
    
    // Return translation if exists, otherwise return original label
    return translations[label] || label
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
      {/* Home link - FIXED to use nav.home */}
      <Link
        to="/"
        className="flex items-center gap-1 hover:text-green-600 dark:hover:text-green-400 transition-colors"
        aria-label={t('nav.home')}
      >
        <Home size={16} />
        <span>{t('nav.home')}</span>
      </Link>

      {/* Breadcrumb items */}
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight size={16} className="text-gray-400" />
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              {translateLabel(item.label)}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">
              {translateLabel(item.label)}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}