// Navbar.jsx - FULLY RESPONSIVE FOR ALL DEVICES
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Search,
  CheckCircle,
  Package,
  Settings,
  LogOut,
  ChevronRight,
  Globe,
  Bell,
  Moon,
  Sun,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { useTheme } from "../../hooks/useTheme";
import { useLanguage } from "../../hooks/useLanguage";
import NotificationBell from "../notifications/NotificationBell";
import { productAPI } from "../../api/product.api";

export default function Navbar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { items: cartItems, loading: cartLoading } = useCart();
  const { items: wishlistItems, loading: wishlistLoading } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const { currentLanguage, changeLanguage, languages } = useLanguage();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const languageMenuRef = useRef(null);
  const profileMenuRef = useRef(null);
  const prevCartCountRef = useRef(0);

  const cartCount = Array.isArray(cartItems) ? cartItems.length : 0;
  const wishlistCount = Array.isArray(wishlistItems) ? wishlistItems.length : 0;

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    if (cartCount > prevCartCountRef.current && cartCount > 0) {
      showNotification(
        t("navbar.addedToCart", {
          count: cartCount,
          items: cartCount === 1 ? t("navbar.item") : t("navbar.items"),
        }),
        "success"
      );
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount, t]);

  const handleLogout = async () => {
    try {
      // ✅ CLEAR AD SESSION FLAG
      sessionStorage.removeItem("adShownThisSession");
      await logout();
      showNotification(t("loggedOut"), "info");
      setIsProfileMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await productAPI.search(searchQuery.trim());
        setSearchResults(data.products || []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
      if (
        languageMenuRef.current &&
        !languageMenuRef.current.contains(e.target)
      )
        setShowLanguageMenu(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target))
        setIsProfileMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProduct = (slug) => {
    setShowDropdown(false);
    setSearchQuery("");
    setShowMobileSearch(false);
    navigate(`/products/${slug}`);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setShowDropdown(false);
      setSearchQuery("");
      setShowMobileSearch(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearchSubmit();
  };

  const getImageUrl = (path) => {
    if (!path) return "/placeholder.png";
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4001/api";
    const baseUrl = apiUrl.replace(/\/api$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  };

  const handleNavClick = (path) => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    setShowMobileSearch(false);
    navigate(path);
  };

  return (
    <>
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-[100] animate-slide-in-right max-w-[calc(100vw-2rem)]">
          <div
            className={`px-4 py-3 sm:px-6 sm:py-4 rounded-xl shadow-2xl border-l-4 flex items-center gap-2 sm:gap-3 min-w-[280px] backdrop-blur-sm ${
              notification.type === "success"
                ? "bg-green-50 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200"
                : "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-800 dark:text-blue-200"
            }`}
          >
            <div className="flex-shrink-0">
              {notification.type === "success" ? (
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </div>
            <p className="font-semibold text-xs sm:text-sm">
              {notification.message}
            </p>
          </div>
        </div>
      )}

      <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 group flex-shrink-0"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <img
                  src="images/logo.png"
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent hidden xs:inline">
                {t("navbar.brandName")}
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link
                to="/"
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
              >
                {t("nav.home")}
              </Link>
              <Link
                to="/products"
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
              >
                {t("nav.products")}
              </Link>
              <Link
                to="/about"
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
              >
                {t("nav.about")}
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
              >
                {t("nav.contact")}
              </Link>
            </div>

            {/* Desktop Search */}
            <div
              className="hidden md:block relative flex-1 max-w-md mx-4 lg:mx-8"
              ref={dropdownRef}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                onFocus={() =>
                  searchResults.length > 0 && setShowDropdown(true)
                }
                placeholder={t("search")}
                className="w-full px-4 py-2 pl-10 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 border border-transparent focus:border-green-500 text-sm"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {showDropdown && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((product) => (
                      <button
                        key={product._id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectProduct(product.slug);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 flex items-center gap-3"
                      >
                        <img
                          src={getImageUrl(product.images?.[0])}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded flex-shrink-0"
                          onError={(e) => {
                            e.target.src = "/placeholder.png";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
                            {product.name}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {t("currency")} {product.price}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                      {isSearching ? t("loading") : t("navbar.noResults")}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
              {/* Mobile Search Toggle */}
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Search"
              >
                <Search
                  size={20}
                  className="text-gray-700 dark:text-gray-300"
                />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="hidden sm:block p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label={t("navbar.toggleTheme")}
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <NotificationBell />

              {/* Language Selector */}
              <div className="hidden sm:block relative" ref={languageMenuRef}>
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Globe
                    size={20}
                    className="text-gray-700 dark:text-gray-300"
                  />
                  <span className="text-xs font-medium hidden lg:inline">
                    {currentLanguage?.toUpperCase() || "EN"}
                  </span>
                </button>
                {showLanguageMenu && languages && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 animate-fade-in">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          changeLanguage(lang.code);
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors ${
                          currentLanguage === lang.code
                            ? "bg-green-50 dark:bg-gray-700"
                            : ""
                        }`}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="text-sm font-medium">{lang.name}</span>
                        {currentLanguage === lang.code && (
                          <CheckCircle
                            size={16}
                            className="ml-auto text-green-600"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <button
                onClick={() => handleNavClick("/wishlist")}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                disabled={wishlistLoading}
              >
                <Heart size={20} className="text-gray-700 dark:text-gray-300" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={() => handleNavClick("/cart")}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                disabled={cartLoading}
              >
                <ShoppingCart
                  size={20}
                  className="text-gray-700 dark:text-gray-300"
                />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              {/* User Profile / Login */}
              {isAuthenticated ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      {user?.avatar ? (
                        <img
                          src={getImageUrl(user.avatar)}
                          alt={user.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-sm sm:text-base">
                          {user?.fullName?.charAt(0).toUpperCase() || "U"}
                        </span>
                      )}
                    </div>
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                      {/* Profile Header */}
                      <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-white shadow-lg">
                            {user?.avatar ? (
                              <img
                                src={getImageUrl(user.avatar)}
                                alt={user.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="flex items-center justify-center w-full h-full text-green-600 font-bold text-xl">
                                {user?.fullName?.charAt(0).toUpperCase() || "U"}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold truncate">
                              {user?.fullName || t("navbar.user")}
                            </p>
                            <p className="text-green-100 text-xs truncate">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        {[
                          {
                            path: "/profile",
                            icon: User,
                            color: "blue",
                            label: t("myProfile"),
                            desc: t("navbar.viewProfile"),
                          },
                          {
                            path: "/orders",
                            icon: Package,
                            color: "purple",
                            label: t("myOrders"),
                            desc: t("navbar.trackOrders"),
                          },
                          {
                            path: "/wishlist",
                            icon: Heart,
                            color: "red",
                            label: t("nav.wishlist"),
                            desc: t("navbar.wishlistPreferences"),
                          },
                          {
                            path: "/profile/settings",
                            icon: Settings,
                            color: "green",
                            label: t("nav.settings"),
                            desc: t("navbar.accountPreferences"),
                          },
                        ].map((item) => (
                          <button
                            key={item.path}
                            onClick={() => handleNavClick(item.path)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors group"
                          >
                            <div
                              className={`w-9 h-9 rounded-lg bg-${item.color}-100 dark:bg-${item.color}-900/30 flex items-center justify-center group-hover:scale-110 transition-transform`}
                            >
                              <item.icon
                                size={18}
                                className={`text-${item.color}-600 dark:text-${item.color}-400`}
                              />
                            </div>
                            <div className="flex-1 text-left">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {item.label}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.desc}
                              </p>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                          </button>
                        ))}
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <LogOut
                              size={18}
                              className="text-red-600 dark:text-red-400"
                            />
                          </div>
                          <p className="text-sm font-medium text-red-600 dark:text-red-400">
                            {t("nav.logout")}
                          </p>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleNavClick("/login")}
                  className="hidden sm:block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  {t("login")}
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {showMobileSearch && (
            <div
              className="md:hidden px-3 pb-3 pt-2 border-t border-gray-200 dark:border-gray-700"
              ref={dropdownRef}
            >
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={t("search")}
                  className="w-full px-4 py-2.5 pl-10 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  autoFocus
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              {showDropdown && searchResults.length > 0 && (
                <div className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {searchResults.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => handleSelectProduct(product.slug)}
                      className="w-full text-left px-3 py-3 hover:bg-green-50 dark:hover:bg-gray-700 flex items-center gap-3 border-b last:border-b-0"
                    >
                      <img
                        src={getImageUrl(product.images?.[0])}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                        onError={(e) => (e.target.src = "/placeholder.png")}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-green-600">
                          {t("currency")} {product.price}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-3">
                {["/", "/products", "/about", "/contact"].map((path) => (
                  <button
                    key={path}
                    onClick={() => handleNavClick(path)}
                    className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 font-medium"
                  >
                    {path === "/"
                      ? t("nav.home")
                      : path === "/products"
                      ? t("nav.products")
                      : path === "/about"
                      ? t("nav.about")
                      : t("nav.contact")}
                  </button>
                ))}

                <div className="flex flex-col gap-3 px-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                  {/* <button onClick={toggleTheme} className="flex items-center gap-3 py-2">
                    {theme === 'dark' ? <><Sun size={20} /><span className="text-sm">{t('navbar.light')}</span></> : <><Moon size={20} /><span className="text-sm">{t('navbar.dark')}</span></>}
                  </button> */}
                  {/* <button onClick={() => setShowLanguageMenu(!showLanguageMenu)} className="flex items-center gap-3 py-2">
                    <Globe size={20} />
                    <span className="text-sm">{languages?.find(l => l.code === currentLanguage)?.name || 'English'}</span>
                  </button> */}
                </div>

                {!isAuthenticated && (
                  <button
                    onClick={() => handleNavClick("/login")}
                    className="mx-4 mt-3 block w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                  >
                    {t("login")}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        @media (min-width: 375px) {
          .xs\\:inline {
            display: inline;
          }
        }
      `}</style>
    </>
  );
}
