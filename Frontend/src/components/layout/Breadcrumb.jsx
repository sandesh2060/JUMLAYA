// Breadcrumb.jsx
import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { useLanguage } from '../../hooks/useLanguage'

export const Breadcrumb = ({ items }) => {
  const { t } = useLanguage()
  
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <Link 
        to="/" 
        className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1"
      >
        <Home size={16} />
        {t('home')}
      </Link>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight size={16} className="text-gray-400 dark:text-gray-600" />
          {item.link ? (
            <Link 
              to={item.link} 
              className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-gray-100 font-medium">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}