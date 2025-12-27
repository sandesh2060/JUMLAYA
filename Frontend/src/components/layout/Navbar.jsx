import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  Search,
  Bell,
  CheckCircle,
  Package,
  Settings,
  LogOut,
  ChevronRight,
  Globe,
  Moon,
  Sun,
} from "lucide-react";

// Import actual hooks from your context
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useWishlist } from "../../hooks/useWishlist";
import { useTheme } from "../../hooks/useTheme";
import { useLanguage } from "../../hooks/useLanguage";

// Import API
import { productAPI } from "../../api/product.api";

export default function Navbar() {
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

  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const languageMenuRef = useRef(null);
  const prevCartCountRef = useRef(0);

  // Calculate cart and wishlist counts safely
  const cartCount = Array.isArray(cartItems) ? cartItems.length : 0;
  const wishlistCount = Array.isArray(wishlistItems) ? wishlistItems.length : 0;

  // Notifications
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Cart notification effect
  useEffect(() => {
    if (cartCount > prevCartCountRef.current && cartCount > 0) {
      showNotification(
        `Added to Cart • ${cartCount} ${cartCount === 1 ? "item" : "items"}`,
        "success"
      );
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount]);

  const handleLogout = async () => {
    try {
      await logout();
      showNotification("Logged out successfully", "info");
      setIsProfileMenuOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Live Search with Debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

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

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (languageMenuRef.current && !languageMenuRef.current.contains(e.target)) {
        setShowLanguageMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProduct = (slug) => {
    setShowDropdown(false);
    setSearchQuery("");
    navigate(`/products/${slug}`);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setShowDropdown(false);
      setSearchQuery("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const getImageUrl = (path) => {
    if (!path) return "/placeholder.png";
    if (path.startsWith("http")) return path;
    return `${import.meta.env.VITE_API_URL || ""}${path}`;
  };

  const handleNavClick = (path) => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-20 right-4 z-[100] animate-slide-in-right">
          <div
            className={`
              px-6 py-4 rounded-xl shadow-2xl border-l-4 flex items-center gap-3 min-w-[320px] backdrop-blur-sm
              ${
                notification.type === "success"
                  ? "bg-green-50 dark:bg-green-900/30 border-green-500 text-green-800 dark:text-green-200"
                  : ""
              }
              ${
                notification.type === "info"
                  ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-800 dark:text-blue-200"
                  : ""
              }
            `}
          >
            <div className="flex-shrink-0">
              {notification.type === "success" && <CheckCircle className="w-6 h-6" />}
              {notification.type === "info" && <Bell className="w-6 h-6" />}
            </div>
            <p className="font-semibold text-sm">{notification.message}</p>
          </div>
        </div>
      )}

      <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 transition-colors border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          {/* Main Navbar */}
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <span className="text-white font-bold text-xl">J</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                JUMLAYA
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link
                to="/"
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
              >
                Home
              </Link>
              <Link
                to="/products"
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
              >
                Products
              </Link>
              <Link
                to="/about"
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
              >
                Contact
              </Link>
            </div>

            {/* Search Bar */}
            <div
              className="hidden sm:block relative flex-1 max-w-md mx-8"
              ref={dropdownRef}
            >
              <div className="w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                  placeholder="Search products..."
                  className="w-full px-4 py-2 pl-10 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-all border border-transparent focus:border-green-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {/* Search Dropdown */}
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
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            e.target.src = "/placeholder.png";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            ₹{product.price}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                      {isSearching ? "Loading..." : "No results found"}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun size={20} className="text-gray-700 dark:text-gray-300" />
                ) : (
                  <Moon size={20} className="text-gray-700 dark:text-gray-300" />
                )}
              </button>

              {/* Language Toggle */}
              <div className="relative" ref={languageMenuRef}>
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-1"
                  aria-label="Change language"
                >
                  <Globe size={20} className="text-gray-700 dark:text-gray-300" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {currentLanguage?.toUpperCase() || 'EN'}
                  </span>
                </button>

                {/* Language Dropdown */}
                {showLanguageMenu && languages && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden z-50 animate-fade-in">
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
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {lang.name}
                        </span>
                        {currentLanguage === lang.code && (
                          <CheckCircle size={16} className="ml-auto text-green-600 dark:text-green-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <button
                onClick={() => handleNavClick('/wishlist')}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                disabled={wishlistLoading}
              >
                <Heart size={22} className="text-gray-700 dark:text-gray-300" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={() => handleNavClick('/cart')}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                disabled={cartLoading}
              >
                <ShoppingCart size={22} className="text-gray-700 dark:text-gray-300" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <User size={22} className="text-gray-700 dark:text-gray-300" />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                      {/* User Info Header */}
                      <div className="bg-gradient-to-r from-green-600 to-emerald-700 dark:from-green-500 dark:to-emerald-600 p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-lg shadow-lg">
                            {user?.avatar ? (
                              <img
                                src={getImageUrl(user.avatar)}
                                alt={user.fullName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              user?.fullName?.charAt(0).toUpperCase() || "U"
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">
                              {user?.fullName || "User"}
                            </p>
                            <p className="text-xs text-green-100 truncate">
                              {user?.email || ""}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button
                          onClick={() => handleNavClick('/profile')}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <User size={18} className="text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              My Profile
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              View and edit profile
                            </p>
                          </div>
                          <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
                        </button>

                        <button
                          onClick={() => handleNavClick('/orders')}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Package size={18} className="text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              My Orders
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Track and manage orders
                            </p>
                          </div>
                          <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
                        </button>

                        <button
                          onClick={() => handleNavClick('/wishlist')}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Heart size={18} className="text-red-600 dark:text-red-400" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Wishlist
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              View saved items
                            </p>
                          </div>
                          <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
                        </button>

                        <button
                          onClick={() => handleNavClick('/profile/settings')}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors group"
                        >
                          <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Settings size={18} className="text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              Settings
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Account preferences
                            </p>
                          </div>
                          <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
                        </button>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700"></div>

                      <div className="p-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group rounded-lg"
                        >
                          <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <LogOut size={18} className="text-red-600 dark:text-red-400" />
                          </div>
                          <p className="text-sm font-medium text-red-600 dark:text-red-400">
                            Logout
                          </p>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleNavClick('/login')}
                  className="hidden sm:inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Login
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                {isMobileMenuOpen ? (
                  <X size={24} className="text-gray-700 dark:text-gray-300" />
                ) : (
                  <Menu size={24} className="text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-1">
                <button
                  onClick={() => handleNavClick('/')}
                  className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={() => handleNavClick('/products')}
                  className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  Products
                </button>
                <button
                  onClick={() => handleNavClick('/about')}
                  className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  About
                </button>
                <button
                  onClick={() => handleNavClick('/contact')}
                  className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  Contact
                </button>

                {/* Mobile Theme & Language Toggles */}
                <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-700 mt-3">
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun size={18} className="text-gray-700 dark:text-gray-300" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Light</span>
                      </>
                    ) : (
                      <>
                        <Moon size={18} className="text-gray-700 dark:text-gray-300" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Dark</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Globe size={18} className="text-gray-700 dark:text-gray-300" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {languages?.find(l => l.code === currentLanguage)?.name || 'English'}
                    </span>
                  </button>
                </div>

                {!isAuthenticated && (
                  <button
                    onClick={() => handleNavClick('/login')}
                    className="block w-full mt-3 text-center py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <style>{`
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
      `}</style>
    </>
  );
}