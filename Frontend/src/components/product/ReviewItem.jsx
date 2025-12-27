import { useState } from 'react'
import { Star, ThumbsUp, ThumbsDown, Edit, Trash2, CheckCircle } from 'lucide-react'
import { reviewAPI } from '@api/review.api'
import toast from 'react-hot-toast'

export const ReviewItem = ({ review, currentUserId, onEdit, onDelete }) => {
  const [helpful, setHelpful] = useState(review.helpfulCount || 0)
  const [notHelpful, setNotHelpful] = useState(review.notHelpfulCount || 0)
  const [userVote, setUserVote] = useState(null)

  const isOwner = currentUserId === review.user?._id

  // Get user's full name from different possible field combinations
  const getUserFullName = () => {
    if (!review.user) return 'Anonymous'
    
    // Check for fullName field (transformed by backend)
    if (review.user.fullName) return review.user.fullName
    
    // Check for firstname/lastname
    if (review.user.firstname || review.user.lastname) {
      return `${review.user.firstname || ''} ${review.user.lastname || ''}`.trim()
    }
    
    // Check for username
    if (review.user.username) return review.user.username
    
    // Check for email
    if (review.user.email) return review.user.email.split('@')[0]
    
    return 'Anonymous'
  }

  // Get user's initial for avatar
  const getUserInitial = () => {
    const fullName = getUserFullName()
    return fullName.charAt(0).toUpperCase()
  }

  const handleHelpful = async (voteType) => {
    try {
      await reviewAPI.markHelpful(review._id, voteType)
      
      if (userVote === voteType) {
        if (voteType === 'helpful') setHelpful(prev => prev - 1)
        else setNotHelpful(prev => prev - 1)
        setUserVote(null)
      } else {
        if (userVote === 'helpful') setHelpful(prev => prev - 1)
        if (userVote === 'not-helpful') setNotHelpful(prev => prev - 1)
        
        if (voteType === 'helpful') setHelpful(prev => prev + 1)
        else setNotHelpful(prev => prev + 1)
        
        setUserVote(voteType)
      }
    } catch (error) {
      toast.error('Failed to vote')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          {/* User Avatar */}
          {review.user?.avatar ? (
            <img
              src={review.user.avatar}
              alt={getUserFullName()}
              className="w-12 h-12 rounded-full object-cover shadow-lg"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {getUserInitial()}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                {getUserFullName()}
              </p>
              {review.isVerifiedPurchase && (
                <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full text-xs">
                  <CheckCircle size={12} />
                  <span>Verified Purchase</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={`${
                      star <= review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(review.createdAt)}
              </span>
              {review.isEdited && (
                <span className="text-xs text-gray-500 dark:text-gray-400">(Edited)</span>
              )}
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(review)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Edit review"
            >
              <Edit size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => onDelete(review._id)}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete review"
            >
              <Trash2 size={18} className="text-red-600 dark:text-red-400" />
            </button>
          </div>
        )}
      </div>

      {review.title && (
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          {review.title}
        </h4>
      )}

      <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap">
        {review.comment}
      </p>

      <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <span className="text-sm text-gray-600 dark:text-gray-400">Was this helpful?</span>
        <button
          onClick={() => handleHelpful('helpful')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
            userVote === 'helpful'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
        >
          <ThumbsUp size={16} />
          <span className="text-sm">{helpful}</span>
        </button>
        <button
          onClick={() => handleHelpful('not-helpful')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
            userVote === 'not-helpful'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
        >
          <ThumbsDown size={16} />
          <span className="text-sm">{notHelpful}</span>
        </button>
      </div>
    </div>
  )
}