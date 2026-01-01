// Breadcrumb.jsx - FIXED CLICKABLE VERSION
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const Breadcrumb = ({ items = [] }) => {
  const { t } = useTranslation()

  // ✅ Helper function to translate common breadcrumb labels
  const translateLabel = (label) => {
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
    
    return translations[label] || label
  }

  return (
    <nav className="flex items-center flex-wrap gap-2 text-sm" aria-label={t('nav.breadcrumb') || 'Breadcrumb'}>
      {/* Home link - CLEARLY CLICKABLE */}
      <Link
        to="/"
        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 font-medium"
        aria-label={t('nav.home')}
      >
        <Home size={16} strokeWidth={2} />
        <span>{t('nav.home')}</span>
      </Link>

      {/* Breadcrumb items */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        
        return (
          <div key={index} className="flex items-center gap-2">
            {/* Separator */}
            <ChevronRight size={16} className="text-gray-400 dark:text-gray-600" />
            
            {/* Item - FIXED: Show clickable links properly */}
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="px-2 py-1 rounded-md text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 font-medium cursor-pointer"
              >
                {translateLabel(item.label)}
              </Link>
            ) : (
              <span className="px-2 py-1 text-gray-900 dark:text-white font-semibold">
                {translateLabel(item.label)}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
}

