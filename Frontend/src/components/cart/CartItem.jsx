import { Trash2, Plus, Minus } from "lucide-react";
import { useState } from "react";
import { getImageUrl } from "@utils/helpers";

export const CartItem = ({ item, onUpdateQuantity, onRemove, isLoading }) => {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity > 0 && newQuantity <= item.product.stock) {
      setQuantity(newQuantity);
      onUpdateQuantity(item._id, newQuantity);
    }
  };

  const product = item.product;

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300">
      {/* Product Image */}
      <div className="flex-shrink-0 w-full sm:w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden group">
        {product.images?.[0] ? (
          <img
            src={getImageUrl(product.images[0])}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              No image
            </span>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
          {product.description?.substring(0, 80)}...
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-green-600 dark:text-green-400">
            NPR {product.price}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                NPR {product.originalPrice}
              </span>
              <span className="text-xs font-semibold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">
                {Math.round(
                  ((product.originalPrice - product.price) /
                    product.originalPrice) *
                    100
                )}
                % OFF
              </span>
            </>
          )}
        </div>
        {product.stock < 10 && product.stock > 0 && (
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
            Only {product.stock} left in stock
          </p>
        )}
      </div>

      {/* Quantity Controls & Actions */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4">
        {/* Quantity Controls */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={isLoading || quantity <= 1}
            className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-900 dark:text-gray-100"
          >
            <Minus size={16} />
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
            disabled={isLoading}
            min="1"
            max={product.stock}
            className="w-12 text-center border-0 bg-transparent font-semibold text-gray-900 dark:text-gray-100 focus:outline-none"
          />
          <button
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={isLoading || quantity >= product.stock}
            className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-900 dark:text-gray-100"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Subtotal */}
        <div className="flex flex-col items-end">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            NPR {(product.price * quantity).toFixed(2)}
          </p>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => onRemove(item._id)}
          disabled={isLoading}
          className="flex items-center justify-center text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg p-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors group"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
