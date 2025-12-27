// ============================================
// Frontend/src/components/common/ThemeToggle.jsx (FIXED)
// ============================================
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme' // ✅ FIXED: Import from hooks, not context
import { useState, useRef, useEffect } from 'react'

const ThemeToggle = ({ showLabel = false, variant = 'icon' }) => {
  const { theme, toggleTheme, setLightTheme, setDarkTheme, setSystemTheme } = useTheme()
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

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className="group relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        <div className="relative w-5 h-5">
          <Sun 
            size={20} 
            className={`absolute inset-0 transition-all duration-300 ${
              theme === 'dark' 
                ? 'opacity-0 rotate-90 scale-0' 
                : 'opacity-100 rotate-0 scale-100 text-amber-500'
            }`}
          />
          <Moon 
            size={20} 
            className={`absolute inset-0 transition-all duration-300 ${
              theme === 'dark' 
                ? 'opacity-100 rotate-0 scale-100 text-blue-400' 
                : 'opacity-0 -rotate-90 scale-0'
            }`}
          />
        </div>
        
        {showLabel && (
          <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {theme === 'dark' ? 'Dark' : 'Light'}
          </span>
        )}
      </button>
    )
  }

  if (variant === 'dropdown') {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Theme options"
          aria-expanded={showMenu}
        >
          {theme === 'dark' ? (
            <Moon size={20} className="text-blue-400" />
          ) : (
            <Sun size={20} className="text-amber-500" />
          )}
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
            <button
              onClick={() => {
                setLightTheme()
                setShowMenu(false)
              }}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                theme === 'light'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Sun size={16} />
              <span>Light</span>
              {theme === 'light' && (
                <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
              )}
            </button>

            <button
              onClick={() => {
                setDarkTheme()
                setShowMenu(false)
              }}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Moon size={16} />
              <span>Dark</span>
              {theme === 'dark' && (
                <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
              )}
            </button>

            <button
              onClick={() => {
                setSystemTheme()
                setShowMenu(false)
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Monitor size={16} />
              <span>System</span>
            </button>
          </div>
        )}
      </div>
    )
  }

  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          <>
            <Moon size={18} className="text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Dark Mode
            </span>
          </>
        ) : (
          <>
            <Sun size={18} className="text-amber-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Light Mode
            </span>
          </>
        )}
      </button>
    )
  }

  return null
}

export default ThemeToggle