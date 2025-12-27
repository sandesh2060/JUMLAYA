// ErrorMessage.jsx
import { AlertCircle, X } from 'lucide-react'

export const ErrorMessage = ({ message, onClose }) => {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
      <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
      <p className="text-sm text-red-800 dark:text-red-300 flex-1">{message}</p>
      {onClose && (
        <button 
          onClick={onClose}
          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 rounded-full p-1 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
