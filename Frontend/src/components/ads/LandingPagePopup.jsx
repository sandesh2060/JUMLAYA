// Frontend/src/components/ads/LandingPagePopup.jsx
// ✅ Auto-detects image ratio — portrait/square = side-by-side, landscape = stacked
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Clock, ArrowRight, Leaf, Sparkles } from "lucide-react";
import { adsAPI } from "@/api/ads.api";
import { useAuth } from "@/context/AuthContext";

// ── Reusable content block ────────────────────────────────────────────────────
const ContentBlock = ({ ad, onCTA, compact = false }) => (
  <div className={`space-y-${compact ? "3" : "4"}`}>
    <h2 className={`font-black text-gray-900 dark:text-white leading-tight ${compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"}`}>
      <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
        {ad.title}
      </span>
    </h2>

    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
      {ad.description}
    </p>

    <div className="flex flex-wrap gap-2">
      {["100% Organic", "Pesticide Free", "Farm Fresh"].map((b) => (
        <span key={b} className="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-xs font-semibold text-green-700 dark:text-green-300">
          {b}
        </span>
      ))}
    </div>

    {ad.couponCode && (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-green-600" /> Use code at checkout:
        </span>
        <div className="inline-block px-4 py-2.5 bg-green-50 dark:bg-green-900/30 rounded-xl border-2 border-dashed border-green-400">
          <span className="font-mono text-lg font-black text-green-600 dark:text-green-400 tracking-widest">
            {ad.couponCode}
          </span>
        </div>
      </div>
    )}

    <button
      onClick={onCTA}
      className="group flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
    >
      <Leaf className="w-4 h-4 group-hover:rotate-12 transition-transform" />
      {ad.buttonText || "Shop Now"}
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </button>

    <div className="flex flex-wrap gap-3 text-xs text-gray-400 dark:text-gray-500 pt-1">
      {["Certified Organic", "Free Delivery", "Fresh Guarantee"].map((label) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          {label}
        </div>
      ))}
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const LandingPagePopup = () => {
  const [ad, setAd]             = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState(8);
  const [isClosing, setIsClosing] = useState(false);
  const [imgRatio, setImgRatio]   = useState(null); // "portrait" | "landscape" | "square" | null
  const navigate = useNavigate();
  const { user } = useAuth();

  // Lock body scroll when open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isVisible]);

  useEffect(() => {
    if (!user) { sessionStorage.removeItem("adShownThisSession"); return; }
    const role = user.role?.toLowerCase();
    if (role === "admin" || role === "superadmin" || role === "rider" || user.isAdmin) return;
    if (!sessionStorage.getItem("adShownThisSession")) fetchActiveAd();
  }, [user]);

  const fetchActiveAd = async () => {
    try {
      const res = await adsAPI.getActiveAd();
      if (res.success && res.data.ad) {
        setAd(res.data.ad);
        setTimeout(() => { setIsVisible(true); startCountdown(res.data.ad); }, 500);
        sessionStorage.setItem("adShownThisSession", "true");
      }
    } catch (e) { console.error("❌ Failed to fetch ad:", e); }
  };

  const startCountdown = (adData) => {
    const duration = adData.displayDuration || 8;
    setCountdown(duration);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(interval); handleClose(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => { setIsVisible(false); setAd(null); setIsClosing(false); setImgRatio(null); }, 300);
  };

  const handleCTAClick = async () => {
    try {
      if (ad?._id) await adsAPI.trackClick(ad._id);
      if (ad?.buttonLink) {
        if (ad.buttonLink.startsWith("http")) window.open(ad.buttonLink, "_blank");
        else navigate(ad.buttonLink);
      }
    } catch {}
    handleClose();
  };

  // Detect ratio once image loads
  const handleImageLoad = (e) => {
    const { naturalWidth: w, naturalHeight: h } = e.target;
    const r = w / h;
    if (r > 1.25)      setImgRatio("landscape");
    else if (r < 0.8)  setImgRatio("portrait");
    else               setImgRatio("square");
  };

  if (!isVisible || !ad) return null;

  const getTypeBadge = (type) => {
    const map = {
      festival:  { emoji: "🌿", label: "ORGANIC HARVEST", gradient: "from-green-500 to-emerald-600" },
      discount:  { emoji: "🌱", label: "SPECIAL OFFER",   gradient: "from-green-600 to-teal-600"    },
      offer:     { emoji: "🍃", label: "LIMITED OFFER",   gradient: "from-lime-500 to-green-600"    },
      promotion: { emoji: "🌾", label: "FRESH ARRIVAL",   gradient: "from-emerald-500 to-green-700" },
    };
    return map[type] || map.promotion;
  };

  const badge       = getTypeBadge(ad.type);
  const isLandscape = imgRatio === "landscape";
  const isPortrait  = imgRatio === "portrait";

  // Image overlays (type badge + discount) — reused in both layouts
  const ImageOverlays = () => (
    <>
      <div className="absolute top-12 left-3 z-10">
        <div className={`px-2.5 py-1 bg-gradient-to-r ${badge.gradient} rounded-full shadow`}>
          <span className="text-white font-bold text-[10px] sm:text-xs flex items-center gap-1">
            {badge.emoji} <span className="hidden sm:inline">{badge.label}</span>
          </span>
        </div>
      </div>
      {ad.discount > 0 && (
        <div className="absolute bottom-3 left-3 z-10">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-2.5 sm:p-3 shadow-xl border-2 border-white/30 text-white text-center">
            <div className="text-xl sm:text-2xl font-black leading-none">{ad.discount}%</div>
            <div className="text-[10px] font-bold mt-0.5">OFF</div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${isVisible && !isClosing ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={handleClose} />

      {/* Scroll container */}
      <div className="relative z-10 w-full h-full flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <div
          className={`relative w-full my-auto transition-all duration-500 ${isVisible && !isClosing ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
          style={{ maxWidth: isLandscape ? "640px" : isPortrait ? "820px" : "840px" }}
        >
          {/* Card */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 z-30 w-9 h-9 flex items-center justify-center bg-white/95 dark:bg-gray-800 rounded-full shadow-lg hover:scale-110 hover:rotate-90 transition-all duration-200 border border-gray-200 dark:border-gray-700"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>

            {/* Countdown */}
            <div className="absolute top-3 left-3 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-green-50/95 dark:bg-green-900/90 rounded-full shadow border border-green-200 dark:border-green-700">
              <Clock className="w-3 h-3 text-green-600 dark:text-green-400 animate-pulse" />
              <span className="text-xs font-bold text-green-800 dark:text-green-300">{countdown}s</span>
            </div>

            {/* ══════════════════════════════════════════
                LANDSCAPE → Stacked: image top, content bottom
            ══════════════════════════════════════════ */}
            {isLandscape ? (
              <div className="flex flex-col">
                <div className="relative w-full bg-green-50 dark:bg-green-900/20">
                  <img
                    src={ad.posterImage}
                    alt={ad.title}
                    onLoad={handleImageLoad}
                    onError={(e) => { e.target.style.display = "none"; }}
                    className="w-full block"
                    style={{ maxHeight: "300px", objectFit: "contain", objectPosition: "center" }}
                    loading="eager"
                  />
                  <ImageOverlays />
                </div>
                <div className="p-5 sm:p-6">
                  <ContentBlock ad={ad} onCTA={handleCTAClick} compact />
                </div>
              </div>

            ) : (
            /* ══════════════════════════════════════════
                PORTRAIT / SQUARE / UNKNOWN
                → Side by side on sm+, stacked on mobile
            ══════════════════════════════════════════ */
              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div
                  className="relative flex-shrink-0 bg-green-50 dark:bg-green-900/20 w-full sm:w-auto"
                  style={{ minWidth: 0 }}
                >
                  {ad.posterImage ? (
                    <img
                      src={ad.posterImage}
                      alt={ad.title}
                      onLoad={handleImageLoad}
                      onError={(e) => { e.target.style.display = "none"; }}
                      className="block w-full sm:w-auto sm:h-full"
                      style={{
                        // Mobile: full width natural height (never crops)
                        // Desktop: constrain width so content panel has enough room
                        maxWidth: "100%",
                        maxHeight: isPortrait ? "480px" : "400px",
                        objectFit: "contain",
                        objectPosition: "center",
                        minHeight: "180px",
                      }}
                      loading="eager"
                    />
                  ) : (
                    <div className="w-full h-48 sm:h-full flex items-center justify-center">
                      <Leaf className="w-14 h-14 text-green-400/40" />
                    </div>
                  )}
                  <ImageOverlays />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center p-5 sm:p-7 lg:p-9 min-w-0">
                  <ContentBlock ad={ad} onCTA={handleCTAClick} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPagePopup;