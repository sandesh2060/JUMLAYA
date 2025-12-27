// Rating.jsx
import { Star } from 'lucide-react'
import { cn } from '@utils/helpers'

export const Rating = ({
  value = 0,
  max = 5,
  size = 20,
  showValue = false,
  onChange,
}) => {
  const stars = Array.from({ length: max }, (_, i) => i + 1)

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => {
        const filled = star <= Math.floor(value)
        const partial = star === Math.ceil(value) && value % 1 !== 0

        return (
          <button
            key={star}
            onClick={() => onChange?.(star)}
            disabled={!onChange}
            className={cn(
              'transition-colors',
              onChange && 'hover:text-yellow-400 cursor-pointer',
              !onChange && 'cursor-default'
            )}
          >
            <Star
              size={size}
              className={cn(
                filled && 'fill-yellow-400 text-yellow-400',
                partial && 'fill-yellow-400/50 text-yellow-400',
                !filled && !partial && 'text-gray-300 dark:text-gray-600'
              )}
            />
          </button>
        )
      })}
      {showValue && (
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  )
}
