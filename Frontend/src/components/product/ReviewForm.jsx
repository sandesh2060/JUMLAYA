// ============================================
// Frontend: components/product/ReviewForm.jsx - FIXED
// ============================================
import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@components/common/Button";
import { reviewAPI } from "@api/review.api";
import toast from "react-hot-toast";

export const ReviewForm = ({
  productId,
  onSubmitSuccess,
  existingReview = null,
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (comment.length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ FIXED: Don't send 'product' in the body - backend gets it from URL params
      const reviewData = { rating, title, comment };

      if (existingReview) {
        await reviewAPI.update(existingReview._id, reviewData);
        toast.success("Review updated successfully!");
      } else {
        await reviewAPI.create(productId, reviewData);
        toast.success("Review submitted successfully!");
      }

      onSubmitSuccess?.();

      // Reset form if new review
      if (!existingReview) {
        setRating(0);
        setTitle("");
        setComment("");
      }
    } catch (error) {
      console.error("Review submission error:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md"
    >
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        {existingReview ? "Edit Your Review" : "Write a Review"}
      </h3>

      {/* Star Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Rating *
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={32}
                className={`${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                } transition-colors`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400 self-center">
              {rating} out of 5
            </span>
          )}
        </div>
      </div>

      {/* Review Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Review Title (Optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          placeholder="Sum up your experience"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Review Comment */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Review *
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          minLength={10}
          maxLength={1000}
          rows={5}
          placeholder="Share your thoughts about this product (minimum 10 characters)"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {comment.length}/1000 characters
        </p>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || rating === 0 || comment.length < 10}
        className="w-full"
      >
        {isSubmitting
          ? "Submitting..."
          : existingReview
          ? "Update Review"
          : "Submit Review"}
      </Button>
    </form>
  );
};