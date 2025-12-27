// ============================================
// FILE 4: LanguageToggle.jsx
// Path: Frontend/src/components/common/LanguageToggle.jsx
// ============================================
import { Languages, Globe, Check } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useState, useRef, useEffect } from 'react'

const LanguageToggle = ({ variant = 'button', showIcon = true }) => {
  const { 
    language, 
    toggleLanguage, 
    availableLanguages, 
    changeLanguage,
    isChanging 
  } = useLanguage()
  
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  if (variant === 'button') {
    return (
      <button
        onClick={toggleLanguage}
        disabled={isChanging}
        className="relative flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Toggle language"
        title="Toggle language"
      >
        {showIcon && (
          <Languages size={18} className="text-gray-700 dark:text-gray-300" />
        )}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[60px] text-left">
          {language === 'en' ? 'नेपाली' : 'English'}
        </span>
        
        {isChanging && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </button>
    )
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={isChanging}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Language options"
          aria-expanded={showMenu}
        >
          <Globe size={18} className="text-gray-700 dark:text-gray-300" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {language.toUpperCase()}
          </span>
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
            {availableLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code)
                  setShowMenu(false)
                }}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                  lang.isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span>{lang.name}</span>
                {lang.isActive && (
                  <Check size={16} className="text-blue-600 dark:text-blue-400" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={toggleLanguage}
        disabled={isChanging}
        className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Toggle language"
      >
        {language === 'en' ? 'NE' : 'EN'}
      </button>
    )
  }

  return null
}

export default LanguageToggle