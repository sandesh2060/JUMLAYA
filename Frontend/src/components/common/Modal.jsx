// Modal.jsx - WITH i18n SUPPORT
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next' // ✅ ADD THIS

export const Modal = ({ isOpen, onClose, title, children }) => {
  const { t } = useTranslation() // ✅ ADD THIS

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
          aria-label={t('modal.closeOverlay')}
        />
        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full p-1"
              aria-label={t('modal.close')}
              title={t('modal.close')}
            >
              <X size={20} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}