// ============================================
// Frontend/src/App.jsx
// SECURED VERSION - Auto Role-Based Redirect
// ============================================
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// ============ LAYOUTS ============
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AdminLayout from "@/admin/components/layout/AdminLayout";
import RiderLayout from "@/rider/components/RiderLayout";

// ============ ROUTE GUARDS ============
import ProtectedRoute from "@/routes/ProtectedRoute";
import AdminRoute from "@/routes/AdminRoute";
import RiderRoute from "@/routes/RiderRoute";

// ============ CUSTOMER PAGES ============
import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Products from "@/pages/Products";
import ProductDetails from "@/pages/ProductDetails";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Orders from "@/pages/Orders";
import OrderDetailsPage from "@/pages/OrderDetailsPage";
import Profile from "@/pages/Profile";
import ProfileSettings from "@/pages/ProfileSettings";
import Wishlist from "@/pages/Wishlist";
import Notifications from "@/pages/Notifications";
import NotFound from "@/pages/NotFound";

// ============ ADMIN PAGES ============
import AdminDashboard from "@/admin/pages/AdminDashboard";
import AdminProducts from "@/admin/pages/AdminProducts";
import AdminProductForm from "@/admin/pages/AdminProductForm";
import AdminProductDetail from "@/admin/pages/AdminProductDetail";
import AdminOrders from "@/admin/pages/AdminOrders";
import AdminCustomers from "@/admin/pages/AdminCustomers";
import AdminSettings from "@/admin/pages/AdminSettings";
import CustomerDetail from "@/admin/pages/CustomerDetail";
import OrderDetail from "@/admin/pages/OrderDetail";
import RiderManagement from "@/admin/pages/RiderManagement";
import AuditLogViewer from "@/admin/pages/AuditLogViewer";
import AdminAds from "@/admin/pages/AdminAds";

// ============ RIDER PAGES ============
import RiderDashboard from "@/rider/pages/RiderDashboard";
import RiderOrders from "@/rider/pages/RiderOrders";
import RiderOrderDetails from "@/rider/pages/RiderOrderDetails";
import RiderEarnings from "@/rider/pages/RiderEarnings";
import RiderProfile from "@/rider/pages/RiderProfile";
import RiderNavigation from "@/rider/pages/RiderNavigation";
import RiderNotifications from "@/rider/pages/RiderNotifications";

// ============================================
// 🔒 HOME PAGE SECURITY - Auto Role Redirect
// ============================================
const SecureHome = () => {
  const { user } = useAuth();

  if (user) {
    const userRole = user.role?.toLowerCase();
    if (userRole === "admin" || userRole === "superadmin" || user.isAdmin === true) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (userRole === "rider") {
      return <Navigate to="/rider/dashboard" replace />;
    }
  }

  // ✅ Customer or guest — Home already contains LandingPagePopup
  return <Home />;
};

// ============================================
// CUSTOMER LAYOUT (Navbar + Content + Footer)
// ============================================
const CustomerLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// ============================================
// ALREADY LOGGED IN PAGE
// ============================================
const AlreadyLoggedIn = () => {
  const { user } = useAuth();

  if (user) {
    const userRole = user.role?.toLowerCase();
    if (userRole === "admin" || userRole === "superadmin" || user.isAdmin === true) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (userRole === "rider") {
      return <Navigate to="/rider/dashboard" replace />;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="text-center max-w-md px-4">
        <div className="mb-6">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          You're Already Logged In
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Please log out before creating a new account or accessing the login page.
        </p>
        <div className="space-y-3">
          <a href="/" className="block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105">
            Go to Home
          </a>
          <a href="/profile" className="block w-full px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-600 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
            View Profile
          </a>
        </div>
      </div>
    </div>
  );
};

// ============================================
// LOADING COMPONENT
// ============================================
const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="text-center">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-500"></div>
        </div>
        <p className="mt-6 text-lg font-medium text-gray-600 dark:text-gray-400">
          Loading JUMLAYA...
        </p>
      </div>
    </div>
  );
};

// ============================================
// MAIN APP COMPONENT
// ============================================
function App() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      {/* ============================================ */}
      {/* ADMIN ROUTES */}
      {/* ============================================ */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/create" element={<AdminProductForm />} />
        <Route path="products/:id" element={<AdminProductDetail />} />
        <Route path="products/:id/edit" element={<AdminProductForm />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="riders" element={<RiderManagement />} />
        <Route path="ads" element={<AdminAds />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="audit-logs" element={<AuditLogViewer />} />
      </Route>

      {/* ============================================ */}
      {/* RIDER ROUTES */}
      {/* ============================================ */}
      <Route path="/rider" element={<RiderRoute><RiderLayout /></RiderRoute>}>
        <Route index element={<Navigate to="/rider/dashboard" replace />} />
        <Route path="dashboard" element={<RiderDashboard />} />
        <Route path="orders" element={<RiderOrders />} />
        <Route path="orders/:orderId" element={<RiderOrderDetails />} />
        <Route path="earnings" element={<RiderEarnings />} />
        <Route path="profile" element={<RiderProfile />} />
        <Route path="navigation" element={<RiderNavigation />} />
        <Route path="notifications" element={<RiderNotifications />} />
      </Route>

      {/* ============================================ */}
      {/* CUSTOMER ROUTES */}
      {/* ============================================ */}
      <Route element={<CustomerLayout />}>
        {/* Public */}
        <Route path="/" element={<SecureHome />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />

        {/* Auth */}
        <Route path="/login"    element={!user ? <Login />    : <AlreadyLoggedIn />} />
        <Route path="/register" element={!user ? <Register /> : <AlreadyLoggedIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart"      element={<Cart />} />
          <Route path="/checkout"  element={<Checkout />} />
          <Route path="/wishlist"  element={<Wishlist />} />
          <Route path="/orders"    element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetailsPage />} />
          <Route path="/profile"   element={<Profile />} />
          <Route path="/profile/settings" element={<ProfileSettings />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;