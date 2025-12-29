// ============================================
// ProductFilters.jsx - WITH i18n SUPPORT (UPDATED)
// ============================================
import { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PRICE_RANGES } from '@utils/constants';

export const ProductFilters = ({ filters, onFilterChange, onClear }) => {
  const { t } = useTranslation();
  const [priceRange, setPriceRange] = useState(filters.priceRange || {});

  const handlePriceChange = (range) => {
    setPriceRange(range);
    onFilterChange({ priceRange: range });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
          {t('productsPage.filters.title')}
        </h3>
        <button
          onClick={onClear}
          className="text-primary-600 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400 text-sm"
        >
          {t('productsPage.filters.clear')}
        </button>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="font-medium mb-3 text-gray-800 dark:text-gray-200">
          {t('productsPage.filters.priceRange')}
        </h4>
        <div className="space-y-2">
          {PRICE_RANGES.map((range, index) => (
            <label key={index} className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
              <input
                type="radio"
                name="priceRange"
                checked={
                  priceRange.min === range.min && priceRange.max === range.max
                }
                onChange={() => handlePriceChange(range)}
                className="text-primary-600 dark:text-primary-500"
              />
              <span className="text-sm">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Active Filters */}
      {Object.keys(filters).length > 0 && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium mb-3 text-gray-800 dark:text-gray-200">
            {t('productFilters.activeFilters')}
          </h4>
          <div className="flex flex-wrap gap-2">
            {filters.priceRange && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-700 text-primary-800 dark:text-primary-100 rounded-full text-sm">
                {filters.priceRange.label}
                <button
                  onClick={() => onFilterChange({ priceRange: null })}
                  className="hover:text-primary-900 dark:hover:text-primary-200"
                >
                  <X size={14} />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};