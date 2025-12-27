import { useState, useEffect } from 'react'
import { Star, Filter } from 'lucide-react'
import { ReviewItem } from './ReviewItem'
import { LoadingSpinner } from '@components/common/LoadingSpinner'
import { reviewAPI } from '@api/review.api'
import toast from 'react-hot-toast'

export const ReviewList = ({ productId, currentUserId, onEditReview }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    if (productId) {
      fetchReviews()
    }
  }, [productId, filter, sortBy])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const params = {
        rating: filter !== 'all' ? filter : undefined,
        sortBy: sortBy === 'recent' ? 'createdAt' : 'helpfulCount',
        order: 'desc'
      }
      console.log('📤 Fetching reviews for product:', productId, 'with params:', params)
      
      const response = await reviewAPI.getByProduct(productId, params)
      
      console.log('📥 Full API Response:', response)
      console.log('📊 response.data:', response.data)
      
      // ✅ FIX: Handle different possible response structures
      let reviewsData = []
      
      if (response.data?.reviews) {
        // Structure: { success: true, data: { reviews: [...] } }
        reviewsData = response.data.reviews
      } else if (response.reviews) {
        // Structure: { success: true, reviews: [...] }
        reviewsData = response.reviews
      } else if (Array.isArray(response.data)) {
        // Structure: { success: true, data: [...] }
        reviewsData = response.data
      } else if (Array.isArray(response)) {
        // Structure: [...]
        reviewsData = response
      }
      
      console.log('📝 Extracted reviews:', reviewsData)
      console.log('🔢 Number of reviews:', reviewsData.length)
      
      // ✅ Sort reviews - pin user's review to top if exists
      if (currentUserId && reviewsData.length > 0) {
        const userReview = reviewsData.find(r => r.user?._id === currentUserId)
        const otherReviews = reviewsData.filter(r => r.user?._id !== currentUserId)
        
        if (userReview) {
          reviewsData = [userReview, ...otherReviews]
          console.log('📌 User review pinned to top')
        }
      }
      
      setReviews(reviewsData)
    } catch (error) {
      console.error('❌ Failed to fetch reviews:', error)
      console.error('❌ Error response:', error.response?.data)
      toast.error('Failed to load reviews')
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      await reviewAPI.delete(reviewId)
      setReviews(reviews.filter(r => r._id !== reviewId))
      toast.success('Review deleted successfully')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete review')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setFilter(rating)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filter === rating
                    ? 'bg-green-600 text-white'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                {rating}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'all' 
              ? 'No reviews yet. Be the first to review!' 
              : `No ${filter}-star reviews yet.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewItem
              key={review._id}
              review={review}
              currentUserId={currentUserId}
              onEdit={onEditReview}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}