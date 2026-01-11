// Frontend/src/components/ads/LandingPagePopup.jsx
// ✅ FIXED: Responsive, scrollable, prevents background scroll
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Clock, ArrowRight, Leaf, Sparkles } from "lucide-react";
import { adsAPI } from "@/api/ads.api";
import { useAuth } from "@/context/AuthContext";

const LandingPagePopup = () => {
  const [ad, setAd] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState(8);
  const [isClosing, setIsClosing] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // ✅ FIX: Lock/unlock body scroll when popup opens/closes
  useEffect(() => {
    if (isVisible) {
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isVisible]);

  useEffect(() => {
    if (!user) {
      sessionStorage.removeItem("adShownThisSession");
      return;
    }

    const userRole = user.role?.toLowerCase();
    if (userRole === 'admin' || userRole === 'superadmin' || userRole === 'rider' || user.isAdmin === true) {
      console.log("🚫 Admin/Rider detected - No ads will be shown");
      return;
    }

    const adShownThisSession = sessionStorage.getItem("adShownThisSession");
    if (!adShownThisSession) {
      console.log("🎯 Fetching active ad for customer...");
      fetchActiveAd();
    }
  }, [user]);

  const fetchActiveAd = async () => {
    try {
      const response = await adsAPI.getActiveAd();
      if (response.success && response.data.ad) {
        console.log("✅ Active ad found:", response.data.ad);
        setAd(response.data.ad);

        setTimeout(() => {
          console.log("🎬 Showing popup...");
          setIsVisible(true);
          startCountdown(response.data.ad);
        }, 500);

        sessionStorage.setItem("adShownThisSession", "true");
      }
    } catch (error) {
      console.error("❌ Failed to fetch active ad:", error);
    }
  };

  const startCountdown = (adData) => {
    const duration = adData.displayDuration || 8;
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
      setIsClosing(false);
    }, 300);
  };

  const handleCTAClick = async () => {
    try {
      if (ad?._id) {
        await adsAPI.trackClick(ad._id);
      }
      if (ad?.buttonLink) {
        if (ad.buttonLink.startsWith("http")) {
          window.open(ad.buttonLink, "_blank");
        } else {
          navigate(ad.buttonLink);
        }
      }
      handleClose();
    } catch (error) {
      console.error("❌ Failed to track click:", error);
      handleClose();
    }
  };

  if (!isVisible || !ad) return null;

  const getTypeBadge = (type) => {
    const badges = {
      festival: { emoji: "🌿", label: "ORGANIC HARVEST", gradient: "from-green-500 to-emerald-600" },
      discount: { emoji: "🌱", label: "SPECIAL OFFER", gradient: "from-green-600 to-teal-600" },
      offer: { emoji: "🍃", label: "LIMITED OFFER", gradient: "from-lime-500 to-green-600" },
      promotion: { emoji: "🌾", label: "FRESH ARRIVAL", gradient: "from-emerald-500 to-green-700" },
    };
    return badges[type] || badges.promotion;
  };

  const typeBadge = getTypeBadge(ad.type);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        isVisible && !isClosing ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ isolation: 'isolate' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Scrollable Container */}
      <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div
          className={`relative w-full max-w-6xl my-auto transition-all duration-500 ${
            isVisible && !isClosing
              ? "scale-100 opacity-100"
              : "scale-95 opacity-0"
          }`}
        >
          {/* Main Card */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20 opacity-60" />

            {/* Floating particles - hidden on mobile for performance */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full opacity-20 animate-float"
                  style={{
                    width: `${8 + Math.random() * 12}px`,
                    height: `${8 + Math.random() * 12}px`,
                    background: `radial-gradient(circle, ${i % 2 === 0 ? "#22c55e" : "#10b981"}, transparent)`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 5}s`,
                    animationDuration: `${4 + Math.random() * 6}s`,
                  }}
                />
              ))}
            </div>

            {/* Close button - responsive positioning */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 hover:rotate-90 transition-all duration-300 group border-2 border-green-200 dark:border-green-700"
              aria-label="Close popup"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-green-700 dark:text-green-400 group-hover:text-red-500 transition-colors" />
            </button>

            {/* Countdown timer - responsive */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-50/95 dark:bg-green-900/95 backdrop-blur-sm rounded-full shadow-lg border-2 border-green-200 dark:border-green-700">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 dark:text-green-400 animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-green-800 dark:text-green-300">
                {countdown}s
              </span>
            </div>

            {/* Content - Responsive Grid */}
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Left side - Image */}
              <div className="relative overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 min-h-[250px] sm:min-h-[350px] lg:min-h-[500px]">
                <div className="absolute inset-0">
                  {ad.posterImage && (
                    <img
                      src={ad.posterImage}
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 via-transparent to-transparent" />
                </div>

                {/* Type badge - responsive */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                  <div className={`px-3 py-2 sm:px-6 sm:py-3 bg-gradient-to-r ${typeBadge.gradient} rounded-full shadow-xl`}>
                    <span className="text-white font-bold text-xs sm:text-sm tracking-wider flex items-center gap-1 sm:gap-2">
                      <span className="text-base sm:text-xl">{typeBadge.emoji}</span>
                      <span className="hidden sm:inline">{typeBadge.label}</span>
                    </span>
                  </div>
                </div>

                {/* Organic badge - responsive */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                  <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-lg border-2 border-green-400">
                    <Leaf className="w-5 h-5 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>

                {/* Discount badge - responsive */}
                {ad.discount > 0 && (
                  <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-green-400 rounded-xl sm:rounded-2xl blur-lg sm:blur-xl opacity-50 animate-pulse" />
                      <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-2xl border-2 sm:border-4 border-white/30">
                        <div className="text-white text-center">
                          <div className="text-3xl sm:text-5xl font-black leading-none">
                            {ad.discount}%
                          </div>
                          <div className="text-sm sm:text-lg font-bold mt-0.5 sm:mt-1">OFF</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right side - Content (scrollable on small screens) */}
              <div className="relative flex flex-col justify-center p-6 sm:p-8 lg:p-12 bg-white dark:bg-gray-900 max-h-[50vh] lg:max-h-none overflow-y-auto lg:overflow-visible">
                {/* Leaf decoration - hidden on small screens */}
                <div className="absolute top-8 right-8 text-green-200 dark:text-green-800 opacity-30 animate-spin-slow hidden lg:block">
                  <Leaf className="w-16 h-16 lg:w-20 lg:h-20" />
                </div>

                <div className="relative space-y-4 sm:space-y-6">
                  {/* Title - responsive text */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                    <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      {ad.title}
                    </span>
                  </h1>

                  {/* Description - responsive text */}
                  <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                    {ad.description}
                  </p>

                  {/* Feature badges - responsive */}
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full text-xs sm:text-sm font-semibold text-green-700 dark:text-green-300 flex items-center gap-1">
                      <Leaf className="w-3 h-3 sm:w-4 sm:h-4" />
                      100% Organic
                    </div>
                    <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-xs sm:text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      Pesticide Free
                    </div>
                    <div className="px-2 py-1 sm:px-3 sm:py-1.5 bg-lime-100 dark:bg-lime-900/30 rounded-full text-xs sm:text-sm font-semibold text-lime-700 dark:text-lime-300">
                      Farm Fresh
                    </div>
                  </div>

                  {/* Coupon code - responsive */}
                  {ad.couponCode && (
                    <div className="inline-flex flex-col gap-2">
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                        Use this code at checkout:
                      </span>
                      <div className="group relative inline-flex items-center">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg sm:rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                        <div className="relative px-4 py-2 sm:px-6 sm:py-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-lg sm:rounded-xl border-2 border-dashed border-green-500">
                          <span className="font-mono text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            {ad.couponCode}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CTA Button - responsive */}
                  <button
                    onClick={handleCTAClick}
                    className="group relative inline-flex items-center justify-center gap-2 sm:gap-3 px-6 py-3 sm:px-8 sm:py-5 w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-sm sm:text-base lg:text-lg rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <Leaf className="relative w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
                    <span className="relative">{ad.buttonText || "Shop Now"}</span>
                    <ArrowRight className="relative w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  {/* Trust indicators - responsive */}
                  <div className="flex flex-wrap gap-3 sm:gap-4 pt-2 sm:pt-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
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
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          33% { transform: translateY(-25px) translateX(10px) rotate(120deg); }
          66% { transform: translateY(-15px) translateX(-10px) rotate(240deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float { animation: float linear infinite; }
        .animate-spin-slow { animation: spin-slow 25s linear infinite; }
      `}</style>
    </div>
  );
};

export default LandingPagePopup;