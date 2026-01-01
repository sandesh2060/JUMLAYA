// ============================================
// FILE: Frontend/src/admin/components/layout/common/AdminLayout.jsx
// PRODUCTION-READY Admin Layout with Landing Page Ads
// ============================================
import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAuditLogger } from "@/hooks/useAuditLogger";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User as UserIcon,
  Bike,
  Megaphone, // ✅ Icon for Landing Page Ads
} from "lucide-react";
import ThemeToggle from "@/components/common/ThemeToggle";
import NotificationPanel from "@/admin/components/common/NotificationPanel";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { logEvent, logLogout } = useAuditLogger();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const baseUrl = apiUrl.replace("/api", "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    return `${baseUrl}${cleanPath}`;
  };

  const getUserInitials = () => {
    if (user?.firstname && user?.lastname) {
      return `${user.firstname.charAt(0)}${user.lastname.charAt(
        0
      )}`.toUpperCase();
    }
    if (user?.fullName) {
      const names = user.fullName.split(" ");
      return names.length > 1
        ? `${names[0].charAt(0)}${names[names.length - 1].charAt(
            0
          )}`.toUpperCase()
        : names[0].charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || "A";
  };

  const getUserDisplayName = () => {
    if (user?.firstname && user?.lastname) {
      return `${user.firstname} ${user.lastname}`;
    }
    if (user?.fullName) {
      return user.fullName;
    }
    return user?.email || "Admin User";
  };

  // ============================================
  // MENU ITEMS (with Landing Page Ads)
  // ============================================
  const menuItems = [
    { 
      path: "/admin/dashboard", 
      icon: LayoutDashboard, 
      label: "Dashboard",
      description: "Overview & Analytics"
    },
    { 
      path: "/admin/products", 
      icon: Package, 
      label: "Products",
      description: "Manage Inventory"
    },
    { 
      path: "/admin/orders", 
      icon: ShoppingCart, 
      label: "Orders",
      description: "Track Orders"
    },
    { 
      path: "/admin/customers", 
      icon: Users, 
      label: "Customers",
      description: "User Management"
    },
    { 
      path: "/admin/riders", 
      icon: Bike, 
      label: "Riders",
      description: "Delivery Staff"
    },
    { 
      path: "/admin/ads", // ✅ NEW: Landing Page Ads
      icon: Megaphone, 
      label: "Landing Page Ads",
      description: "Popup Management",
      badge: "NEW" // Optional: Show "NEW" badge
    },
    { 
      path: "/admin/settings", 
      icon: Settings, 
      label: "Settings",
      description: "Configuration"
    },
    { 
      path: "/admin/audit-logs", 
      icon: Shield, 
      label: "Audit Logs",
      description: "Security & Activity"
    },
  ];

  // ============================================
  // EVENT HANDLERS
  // ============================================

  const handleLogout = () => {
    logLogout();
    logout();
    navigate("/login", { state: { message: "You have been logged out" } });
  };

  const handleNavClick = (path, label) => {
    logEvent("NAVIGATION", "route", { to: path, label });
  };

  // ============================================
  // DESKTOP SIDEBAR
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden lg:block`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            {sidebarOpen ? (
              <div>
                <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  JUMLAYA Admin
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Management Portal
                </p>
              </div>
            ) : (
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                J
              </span>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => handleNavClick(item.path, item.label)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${
                      isActive
                        ? "bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                    }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  
                  {sidebarOpen && (
                    <>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm block truncate">
                          {item.label}
                        </span>
                        {item.description && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">
                            {item.description}
                          </span>
                        )}
                      </div>
                      
                      {/* NEW Badge */}
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full animate-pulse">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}

                  {/* Tooltip for collapsed sidebar */}
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-lg">
                      <div className="font-medium">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-gray-300 mt-0.5">
                          {item.description}
                        </div>
                      )}
                      {/* Tooltip arrow */}
                      <div className="absolute top-1/2 right-full -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                    </div>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                {user?.avatar ? (
                  <img
                    src={getImageUrl(user.avatar)}
                    alt={getUserDisplayName()}
                    className="w-10 h-10 rounded-full object-cover border-2 border-primary-500"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextElementSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold text-sm shadow-md ${
                    user?.avatar ? "hidden" : "flex"
                  }`}
                >
                  {getUserInitials()}
                </div>
                {/* Online indicator */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
              </div>

              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.role || "Admin"}
                  </p>
                </div>
              )}
            </div>
            
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full mt-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ============================================
          MOBILE SIDEBAR
          ============================================ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <aside className="absolute top-0 left-0 w-80 h-full bg-white dark:bg-gray-800 shadow-2xl animate-slide-in">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
                    JUMLAYA Admin
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Management Portal
                  </p>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleNavClick(item.path, item.label);
                      }}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive
                            ? "bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`
                      }
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="font-medium text-sm block">
                          {item.label}
                        </span>
                        {item.description && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {item.description}
                          </span>
                        )}
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              {/* User Profile */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  {user?.avatar ? (
                    <img
                      src={getImageUrl(user.avatar)}
                      alt={getUserDisplayName()}
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary-500"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold ${
                      user?.avatar ? "hidden" : "flex"
                    }`}
                  >
                    {getUserInitials()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ============================================
          MAIN CONTENT AREA
          ============================================ */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Notification Panel */}
              <NotificationPanel />

              {/* Mobile Profile Menu */}
              <div className="relative lg:hidden">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {user?.avatar ? (
                    <img
                      src={getImageUrl(user.avatar)}
                      alt={getUserDisplayName()}
                      className="w-8 h-8 rounded-full object-cover border-2 border-primary-500"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextElementSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-semibold ${
                      user?.avatar ? "hidden" : "flex"
                    }`}
                  >
                    {getUserInitials()}
                  </div>
                </button>

                {/* Mobile Profile Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Role: {user?.role || "Admin"}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>

      {/* Add animation styles */}
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;