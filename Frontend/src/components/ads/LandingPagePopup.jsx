import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Clock, ArrowRight, Leaf, Sparkles } from 'lucide-react';
import { adsAPI } from '@/api/ads.api';
import { useAuth } from '@/context/AuthContext';

const LandingPagePopup = () => {
  const [ad, setAd] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Only show ad if user is logged in
    if (!user) {
      // Clear the flag when user logs out
      sessionStorage.removeItem('adShownThisSession');
      return;
    }

    // Check if ad was already shown in this login session
    const adShownThisSession = sessionStorage.getItem('adShownThisSession');
    
    if (!adShownThisSession) {
      fetchActiveAd();
      // Mark as shown for this session
      sessionStorage.setItem('adShownThisSession', 'true');
    }
  }, [user]);

  const fetchActiveAd = async () => {
    try {
      // Fetch active ad from API
      const response = await adsAPI.getActiveAd();
      
      if (response.success && response.data.ad) {
        setAd(response.data.ad);
        
        // Show popup after 500ms delay
        setTimeout(() => {
          setIsVisible(true);
          startCountdown(response.data.ad);
        }, 500);
      }
    } catch (error) {
      console.error('Failed to fetch active ad:', error);
    }
  };

  const startCountdown = (adData) => {
    const duration = adData.displayDuration || 5;
    setCountdown(duration);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setAd(null);
    }, 400);
  };

  const handleCTAClick = async () => {
    try {
      // Track click
      if (ad?._id) {
        await adsAPI.trackClick(ad._id);
      }

      // Navigate to link
      if (ad?.buttonLink) {
        if (ad.buttonLink.startsWith('http')) {
          window.open(ad.buttonLink, '_blank');
        } else {
          navigate(ad.buttonLink);
        }
      }

      handleClose();
    } catch (error) {
      console.error('Failed to track click:', error);
      // Still navigate even if tracking fails
      if (ad?.buttonLink) {
        if (ad.buttonLink.startsWith('http')) {
          window.open(ad.buttonLink, '_blank');
        } else {
          navigate(ad.buttonLink);
        }
      }
      handleClose();
    }
  };

  // Don't render if not visible or no ad
  if (!isVisible || !ad) return null;

  const getTypeBadge = (type) => {
    const badges = {
      festival: { emoji: '🌿', label: 'ORGANIC HARVEST', gradient: 'from-green-500 to-emerald-600' },
      discount: { emoji: '🌱', label: 'SPECIAL OFFER', gradient: 'from-green-600 to-teal-600' },
      offer: { emoji: '🍃', label: 'LIMITED OFFER', gradient: 'from-lime-500 to-green-600' },
      promotion: { emoji: '🌾', label: 'FRESH ARRIVAL', gradient: 'from-emerald-500 to-green-700' },
    };
    return badges[type] || badges.promotion;
  };

  const typeBadge = getTypeBadge(ad.type);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${
        isVisible && !isClosing 
          ? 'opacity-100' 
          : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop with blur - organic green tint */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-green-900/80 via-emerald-900/70 to-teal-900/80 backdrop-blur-md transition-all duration-500 ${
          isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
      {/* Full-page popup container */}
      <div 
        className={`relative w-full h-full max-w-7xl max-h-[95vh] m-4 overflow-hidden transition-all duration-700 ease-out ${
          isVisible && !isClosing 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-8'
        }`}
      >
        {/* Main content wrapper */}
        <div className="relative w-full h-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Animated organic gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20 opacity-60" />
          
          {/* Floating organic particles effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full opacity-20 animate-float"
                style={{
                  width: `${8 + Math.random() * 12}px`,
                  height: `${8 + Math.random() * 12}px`,
                  background: `radial-gradient(circle, ${i % 2 === 0 ? '#22c55e' : '#10b981'}, transparent)`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${4 + Math.random() * 6}s`
                }}
              />
            ))}
          </div>

          {/* Close button - organic green theme */}
          <button 
            onClick={handleClose}
            className="absolute top-6 right-6 z-20 w-12 h-12 flex items-center justify-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 hover:rotate-90 transition-all duration-300 group border-2 border-green-200 dark:border-green-700"
            aria-label="Close popup"
          >
            <X className="w-6 h-6 text-green-700 dark:text-green-400 group-hover:text-red-500 transition-colors" />
          </button>

          {/* Countdown timer - green theme */}
          <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-green-50/95 dark:bg-green-900/95 backdrop-blur-sm rounded-full shadow-lg border-2 border-green-200 dark:border-green-700">
            <Clock className="w-4 h-4 text-green-600 dark:text-green-400 animate-pulse" />
            <span className="text-sm font-semibold text-green-800 dark:text-green-300">
              {countdown}s
            </span>
          </div>

          {/* Content grid */}
          <div className="relative h-full grid md:grid-cols-2 gap-0">
            
            {/* Left side - Image with organic overlay */}
            <div className="relative overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
              <div className="absolute inset-0">
                {ad.posterImage && (
                  <img 
                    src={ad.posterImage} 
                    alt={ad.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 via-transparent to-transparent" />
              </div>
              
              {/* Floating badge on image - organic theme */}
              <div className="absolute top-8 left-8">
                <div className={`px-6 py-3 bg-gradient-to-r ${typeBadge.gradient} rounded-full shadow-xl transform hover:scale-105 transition-transform`}>
                  <span className="text-white font-bold text-sm tracking-wider flex items-center gap-2">
                    <span className="text-xl">{typeBadge.emoji}</span>
                    {typeBadge.label}
                  </span>
                </div>
              </div>

              {/* Organic certified badge */}
              <div className="absolute top-8 right-8">
                <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full p-3 shadow-lg border-2 border-green-400">
                  <Leaf className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>

              {/* Discount badge - green theme */}
              {ad.discount > 0 && (
                <div className="absolute bottom-8 left-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-400 rounded-2xl blur-xl opacity-50 animate-pulse" />
                    <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-2xl transform hover:rotate-3 transition-transform border-4 border-white/30">
                      <div className="text-white text-center">
                        <div className="text-5xl font-black leading-none">
                          {ad.discount}%
                        </div>
                        <div className="text-lg font-bold mt-1">OFF</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right side - Content with organic theme */}
            <div className="relative flex flex-col justify-center p-8 md:p-12 lg:p-16 bg-white dark:bg-gray-900">
              
              {/* Leaf decoration */}
              <div className="absolute top-12 right-12 text-green-200 dark:text-green-800 opacity-30 animate-spin-slow">
                <Leaf className="w-20 h-20" />
              </div>

              <div className="relative space-y-6 max-w-xl">
                
                {/* Title with green gradient */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-tight">
                  <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent animate-gradient">
                    {ad.title}
                  </span>
                </h1>

                {/* Description */}
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                  {ad.description}
                </p>

                {/* Organic features badges */}
                <div className="flex flex-wrap gap-3">
                  <div className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-1">
                    <Leaf className="w-4 h-4" />
                    100% Organic
                  </div>
                  <div className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Pesticide Free
                  </div>
                  <div className="px-3 py-1.5 bg-lime-100 dark:bg-lime-900/30 rounded-full text-sm font-semibold text-lime-700 dark:text-lime-300">
                    Farm Fresh
                  </div>
                </div>

                {/* Coupon code - green theme */}
                {ad.couponCode && (
                  <div className="inline-flex flex-col gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-green-600" />
                      Use this code at checkout:
                    </span>
                    <div className="group relative inline-flex items-center">
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                      <div className="relative px-6 py-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-xl border-2 border-dashed border-green-500">
                        <span className="font-mono text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {ad.couponCode}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* CTA Button - organic green */}
                <button 
                  onClick={handleCTAClick}
                  className="group relative inline-flex items-center gap-3 px-8 py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <Leaf className="relative w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span className="relative">{ad.buttonText || 'Shop Now'}</span>
                  <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Trust indicators - green theme */}
                <div className="flex flex-wrap gap-4 pt-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Certified Organic
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Free Delivery
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-lime-500 rounded-full animate-pulse" />
                    Fresh Guarantee
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) rotate(0deg); 
          }
          33% { 
            transform: translateY(-25px) translateX(10px) rotate(120deg); 
          }
          66% { 
            transform: translateY(-15px) translateX(-10px) rotate(240deg); 
          }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-float {
          animation: float linear infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 4s ease infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 25s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPagePopup;