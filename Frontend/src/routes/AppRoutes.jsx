// ============================================
// Frontend/src/routes/AppRoutes.jsx
// Complete Application Routes
// ============================================
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// ============ LAYOUTS ============
import AdminLayout from '@/admin/components/layout/common/AdminLayout';
import RiderLayout from '@/rider/components/RiderLayout';

// ============ ROUTE GUARDS ============
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import AdminRoute from './AdminRoute';
import RiderRoute from './RiderRoute';

// ============ LOADING COMPONENT ============
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

// ============ PUBLIC PAGES ============
const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Products = lazy(() => import('@/pages/Products'));
const ProductDetails = lazy(() => import('@/pages/ProductDetails'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// ============ PROTECTED USER PAGES ============
const Cart = lazy(() => import('@/pages/Cart'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const Orders = lazy(() => import('@/pages/Orders'));
const OrderDetails = lazy(() => import('@/pages/OrderDetails'));
const OrderSuccess = lazy(() => import('@/pages/OrderSuccess'));
const Profile = lazy(() => import('@/pages/Profile'));
const ProfileSettings = lazy(() => import('@/pages/ProfileSettings'));
const Wishlist = lazy(() => import('@/pages/Wishlist'));

// ============ ADMIN PAGES ============
const AdminDashboard = lazy(() => import('@/admin/pages/AdminDashboard'));
const AdminProducts = lazy(() => import('@/admin/pages/products/AdminProducts'));
const AdminOrders = lazy(() => import('@/admin/pages/orders/AdminOrders'));
const AdminCustomers = lazy(() => import('@/admin/pages/customers/AdminCustomers'));
const AdminSettings = lazy(() => import('@/admin/pages/settings/AdminSettings'));
const AdminAuditLogs = lazy(() => import('@/admin/pages/audit/AdminAuditLogs'));
const AdminRiders = lazy(() => import('@/admin/pages/riders/AdminRiders'));

// ============ RIDER PAGES ============
const RiderDashboard = lazy(() => import('@/rider/pages/RiderDashboard'));
const RiderOrders = lazy(() => import('@/rider/pages/RiderOrders'));
const RiderOrderDetails = lazy(() => import('@/rider/pages/RiderOrderDetails'));
const RiderEarnings = lazy(() => import('@/rider/pages/RiderEarnings'));
const RiderProfile = lazy(() => import('@/rider/pages/RiderProfile'));
const RiderNavigation = lazy(() => import('@/rider/pages/RiderNavigation'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* ============ PUBLIC ROUTES ============ */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Auth Routes - Only accessible when NOT logged in */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* ============ PROTECTED USER ROUTES ============ */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/settings" element={<ProfileSettings />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Route>

        {/* ============ ADMIN ROUTES ============ */}
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
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="riders" element={<AdminRiders />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
        </Route>

        {/* ============ RIDER ROUTES ============ */}
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

        {/* ============ 404 NOT FOUND ============ */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;