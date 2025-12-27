import { ShoppingCart, Package, Leaf, Sparkles, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

export const EmptyCart = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [floatingItems, setFloatingItems] = useState([]);

  useEffect(() => {
    setIsVisible(true);
    
    // Generate random floating items
    const items = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
      size: 20 + Math.random() * 20
    }));
    setFloatingItems(items);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[400px] py-12 overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes floatUp {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }

        @keyframes cartBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }

        @keyframes slideInUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }

        .cart-bounce {
          animation: cartBounce 2s ease-in-out infinite;
        }

        .float-animation {
          animation: float 3s ease-in-out infinite;
        }

        .slide-in {
          animation: slideInUp 0.6s ease-out forwards;
        }

        .shimmer-bg {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }

        .wiggle {
          animation: wiggle 1s ease-in-out infinite;
        }

        .floating-item {
          animation: floatUp linear infinite;
        }
      `}</style>

      {/* Floating Background Items */}
      {floatingItems.map((item) => (
        <div
          key={item.id}
          className="floating-item absolute pointer-events-none"
          style={{
            left: `${item.left}%`,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
            fontSize: `${item.size}px`,
            opacity: 0.15
          }}
        >
          {item.id % 3 === 0 ? '🥬' : item.id % 3 === 1 ? '🥕' : '🍎'}
        </div>
      ))}

      <div className={`text-center relative z-10 ${isVisible ? 'slide-in' : 'opacity-0'}`}>
        {/* Animated Cart Icon with Sparkles */}
        <div className="relative inline-block mb-6">
          <div className="absolute -top-2 -right-2 text-yellow-400 wiggle">
            <Sparkles size={24} fill="currentColor" />
          </div>
          <div className="absolute -bottom-2 -left-2 text-green-400 wiggle" style={{ animationDelay: '0.5s' }}>
            <Leaf size={20} fill="currentColor" />
          </div>
          
          <div className="relative bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-8 rounded-full cart-bounce">
            <ShoppingCart 
              size={64} 
              className="text-green-600 dark:text-green-400"
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Title with gradient */}
        <h2 
          className="text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 via-green-800 to-gray-900 dark:from-gray-100 dark:via-green-300 dark:to-gray-100 bg-clip-text text-transparent"
          style={{ animationDelay: '0.2s' }}
        >
          Your cart is empty
        </h2>

        {/* Subtitle */}
        <p 
          className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg"
          style={{ animationDelay: '0.3s' }}
        >
          Start adding some fresh organic products to your cart and enjoy the
          best quality items delivered to your door.
        </p>

        {/* Feature Pills */}
        <div 
          className="flex flex-wrap gap-3 justify-center mb-8 px-4"
          style={{ animationDelay: '0.4s' }}
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full text-sm text-green-700 dark:text-green-300 float-animation">
            <Leaf size={16} />
            <span>100% Organic</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full text-sm text-blue-700 dark:text-blue-300 float-animation" style={{ animationDelay: '0.5s' }}>
            <Package size={16} />
            <span>Fast Delivery</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-full text-sm text-yellow-700 dark:text-yellow-300 float-animation" style={{ animationDelay: '1s' }}>
            <Sparkles size={16} />
            <span>Fresh Daily</span>
          </div>
        </div>

        {/* CTA Button with shimmer effect */}
        <div style={{ animationDelay: '0.5s' }}>
          <a
            href="/products"
            className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 dark:from-green-500 dark:to-emerald-500 dark:hover:from-green-600 dark:hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl overflow-hidden"
          >
            <span className="absolute inset-0 shimmer-bg"></span>
            <span className="relative">Start Shopping</span>
            <ArrowRight 
              size={20} 
              className="relative group-hover:translate-x-1 transition-transform" 
            />
          </a>
        </div>

        {/* Popular categories suggestion */}
        <div 
          className="mt-8 text-sm text-gray-500 dark:text-gray-400"
          style={{ animationDelay: '0.6s' }}
        >
          <p className="mb-3">Popular categories:</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {['🥬 Vegetables', '🍎 Fruits', '🥛 Dairy', '🌾 Grains'].map((cat, i) => (
              <a
                key={i}
                href="/products"
                className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {cat}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};