// ============================================================================
// FILE: Frontend/src/admin/components/ads/AdPreview.jsx
// Preview component to see how ad will look on landing page
// ============================================================================

import { X, Eye, Calendar, TrendingUp, MousePointer } from 'lucide-react';

const AdPreview = ({ ad, onClose }) => {
  if (!ad) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDaysRemaining = () => {
    const now = new Date();
    const endDate = new Date(ad.validUntil);
    const diffTime = endDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const calculateCTR = () => {
    if (!ad.impressionCount || ad.impressionCount === 0) return 0;
    return ((ad.clickCount / ad.impressionCount) * 100).toFixed(2);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">Ad Preview</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Ad Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                <div className={`w-3 h-3 rounded-full ${
                  ad.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`} />
              </div>
              <p className={`text-lg font-bold ${
                ad.isActive ? 'text-green-600' : 'text-gray-600'
              }`}>
                {ad.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>

            {/* Impressions */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Impressions</span>
              </div>
              <p className="text-lg font-bold text-blue-600">
                {ad.impressionCount || 0}
              </p>
            </div>

            {/* Clicks */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MousePointer className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Clicks</span>
              </div>
              <p className="text-lg font-bold text-purple-600">
                {ad.clickCount || 0}
              </p>
            </div>

            {/* CTR */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">CTR</span>
              </div>
              <p className="text-lg font-bold text-green-600">
                {calculateCTR()}%
              </p>
            </div>
          </div>

          {/* Ad Details */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Ad Type
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {ad.type}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Priority
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {ad.priority || 'N/A'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Valid From
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatDate(ad.validFrom)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Valid Until
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatDate(ad.validUntil)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Days Remaining
                </label>
                <p className="text-lg font-semibold text-orange-600">
                  {calculateDaysRemaining()} days
                </p>
              </div>

              {ad.discount > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Discount
                  </label>
                  <p className="text-lg font-semibold text-green-600">
                    {ad.discount}% OFF
                  </p>
                </div>
              )}

              {ad.couponCode && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Coupon Code
                  </label>
                  <p className="text-lg font-mono font-semibold text-purple-600">
                    {ad.couponCode}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Live Preview - How it appears on landing page */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Landing Page Preview
            </h3>
            
            {/* Simulated Popup */}
            <div className="relative bg-gray-100 dark:bg-gray-900 rounded-xl p-8 border-4 border-dashed border-gray-300 dark:border-gray-600">
              {/* Background overlay simulation */}
              <div className="absolute inset-0 bg-black/20 rounded-xl pointer-events-none" />
              
              {/* Actual popup preview */}
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl mx-auto overflow-hidden">
                {/* Poster Image */}
                {ad.posterImage && (
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={ad.posterImage}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                    {ad.discount > 0 && (
                      <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-bold text-xl shadow-lg animate-pulse">
                        {ad.discount}% OFF
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-8 text-center">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {ad.title}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                    {ad.description}
                  </p>

                  {ad.couponCode && (
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-4 mb-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Use Coupon Code
                      </p>
                      <p className="text-2xl font-mono font-bold text-purple-600 dark:text-purple-400">
                        {ad.couponCode}
                      </p>
                    </div>
                  )}

                  {/* CTA Button */}
                  <button
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                  >
                    {ad.buttonText || 'Shop Now'}
                  </button>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                    Offer valid until {new Date(ad.validUntil).toLocaleDateString()}
                  </p>
                </div>

                {/* Close button simulation */}
                <button className="absolute top-4 right-4 w-10 h-10 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdPreview;