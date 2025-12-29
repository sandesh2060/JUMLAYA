// ============================================
// Frontend/src/App.jsx - WITH NOTIFICATIONS
// Complete Application with Proper Route Separation
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
import Products from "@/pages/Products";
import ProductDetails from "@/pages/ProductDetails";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Orders from "@/pages/Orders";
import OrderDetailsPage from "@/pages/OrderDetailsPage";
import Profile from "@/pages/Profile";
import ProfileSettings from "@/pages/ProfileSettings";
import Wishlist from "@/pages/Wishlist";
import Notifications from "@/pages/Notifications"; // ✅ ADD THIS
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

// ============ RIDER PAGES ============
import RiderDashboard from "@/rider/pages/RiderDashboard";
import RiderOrders from "@/rider/pages/RiderOrders";
import RiderOrderDetails from "@/rider/pages/RiderOrderDetails";
import RiderEarnings from "@/rider/pages/RiderEarnings";
import RiderProfile from "@/rider/pages/RiderProfile";
import RiderNavigation from "@/rider/pages/RiderNavigation";

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
// MAIN APP COMPONENT
// ============================================
function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* ============================================ */}
      {/* ADMIN ROUTES - Separate Layout (No Navbar/Footer) */}
      {/* ============================================ */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />

        {/* Product Routes */}
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/create" element={<AdminProductForm />} />
        <Route path="products/:id" element={<AdminProductDetail />} />
        <Route path="products/:id/edit" element={<AdminProductForm />} />

        {/* Order Routes */}
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<OrderDetail />} />

        {/* Customer Routes */}
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="customers/:id" element={<CustomerDetail />} />

        {/* Rider Management */}
        <Route path="riders" element={<RiderManagement />} />

        {/* Settings */}
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* ============================================ */}
      {/* RIDER ROUTES - Separate Layout (No Navbar/Footer) */}
      {/* ============================================ */}
      <Route
        path="/rider"
        element={
          <RiderRoute>
            <RiderLayout />
          </RiderRoute>
        }
      >
        <Route index element={<Navigate to="/rider/dashboard" replace />} />
        <Route path="dashboard" element={<RiderDashboard />} />
        <Route path="orders" element={<RiderOrders />} />
        <Route path="orders/:orderId" element={<RiderOrderDetails />} />
        <Route path="earnings" element={<RiderEarnings />} />
        <Route path="profile" element={<RiderProfile />} />
        <Route path="navigation" element={<RiderNavigation />} />
      </Route>

      {/* ============================================ */}
      {/* CUSTOMER ROUTES - WITH Navbar/Footer */}
      {/* ============================================ */}
      <Route element={<CustomerLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/register"
          element={
            !user ? (
              <Register />
            ) : (
              <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    You are already logged in
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Please log out before creating a new account.
                  </p>
                  <a
                    href="/"
                    className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold shadow hover:bg-primary-700 transition"
                  >
                    Go to Home
                  </a>
                </div>
              </div>
            )
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Customer Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetailsPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/settings" element={<ProfileSettings />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/notifications" element={<Notifications />} />{" "}
          {/* ✅ ADD THIS */}
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
