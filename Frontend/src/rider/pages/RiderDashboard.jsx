
// ============================================
// Frontend/src/rider/pages/RiderDashboard.jsx
// ✅ PRODUCTION READY - Geolocation Error Handling Fixed
// ============================================
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  Star,
  TrendingUp,
  MapPin,
  Phone,
  Navigation,
  Loader,
  RefreshCw,
  ChevronRight,
  User,
  Settings,
  AlertCircle,
  MapPinOff,
} from "lucide-react";
import toast from "react-hot-toast";
import { riderAPI } from "../../api/rider.api";

const RiderDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState({
    todayDeliveries: 0,
    todayEarnings: 0,
    pendingOrders: 0,
    completedOrders: 0,
    rating: 0,
    totalEarnings: 0,
    weeklyDeliveries: 0,
    weeklyEarnings: 0,
    acceptanceRate: 0,
    onTimeRate: 0,
  });

  const [availableOrders, setAvailableOrders] = useState([]);
  const [currentOrders, setCurrentOrders] = useState([]);
  const [status, setStatus] = useState("offline");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [riderInfo, setRiderInfo] = useState(null);
  const [locationTracking, setLocationTracking] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationPermission, setLocationPermission] = useState("prompt");

  // ✅ Check geolocation permission status
  const checkLocationPermission = useCallback(async () => {
    if (!navigator.permissions) {
      console.warn("⚠️ Permissions API not supported");
      return "prompt";
    }

    try {
      const result = await navigator.permissions.query({ name: "geolocation" });
      setLocationPermission(result.state);
      console.log("📍 Location permission:", result.state);

      // Listen for permission changes
      result.addEventListener("change", () => {
        setLocationPermission(result.state);
        console.log("📍 Permission changed to:", result.state);
      });

      return result.state;
    } catch (error) {
      console.warn("⚠️ Could not query location permission:", error);
      return "prompt";
    }
  }, []);

  // ✅ Request location permission
  const requestLocationPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      const errorMsg = "Geolocation is not supported by your browser";
      setLocationError(errorMsg);
      toast.error(errorMsg);
      return false;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("✅ Location permission granted");
          setLocationError(null);
          setLocationPermission("granted");
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          resolve(true);
        },
        (error) => {
          console.error("❌ Location permission error:", error);
          handleGeolocationError(error);
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  // ✅ Handle geolocation errors with detailed messages
  const handleGeolocationError = useCallback((error) => {
    let errorMessage = "";
    let userFriendlyMessage = "";

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = "Location permission denied by user";
        userFriendlyMessage = "📍 Please enable location access in your browser settings to use tracking features";
        setLocationPermission("denied");
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = "Location information unavailable";
        userFriendlyMessage = "📍 Unable to retrieve your location. Please check your device settings";
        break;
      case error.TIMEOUT:
        errorMessage = "Location request timeout";
        userFriendlyMessage = "📍 Location request timed out. Please try again";
        break;
      default:
        errorMessage = "Unknown geolocation error";
        userFriendlyMessage = "📍 An error occurred while accessing your location";
    }

    console.error(`❌ Geolocation Error [${error.code}]:`, errorMessage);
    setLocationError(userFriendlyMessage);
    setLocationTracking(false);
    
    // Show toast only for critical errors
    if (error.code !== error.TIMEOUT) {
      toast.error(userFriendlyMessage, { duration: 5000 });
    }
  }, []);

  // ✅ Fetch dashboard data
  const fetchDashboard = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await riderAPI.getDashboard();
      console.log("📊 Dashboard API Response:", response);

      const dashboardData = response.data || response;

      setStats({
        todayDeliveries: dashboardData.stats?.todayDeliveries || 0,
        todayEarnings: dashboardData.stats?.todayEarnings || 0,
        pendingOrders: dashboardData.stats?.pendingOrders || 0,
        completedOrders: dashboardData.stats?.completedOrders || 0,
        rating: dashboardData.stats?.rating || 0,
        totalEarnings: dashboardData.stats?.totalEarnings || 0,
        weeklyDeliveries: dashboardData.stats?.weeklyDeliveries || 0,
        weeklyEarnings: dashboardData.stats?.weeklyEarnings || 0,
        acceptanceRate: dashboardData.stats?.acceptanceRate || 0,
        onTimeRate: dashboardData.stats?.onTimeRate || 0,
      });

      setAvailableOrders(dashboardData.orders || []);

      try {
        const activeResponse = await riderAPI.orders.getActive();
        setCurrentOrders(activeResponse.data || []);
      } catch (error) {
        console.warn("No active orders:", error);
        setCurrentOrders([]);
      }

      setStatus(dashboardData.status || "offline");
      setRiderInfo(dashboardData.rider || null);

      if (dashboardData.rider?.currentLocation?.coordinates) {
        const [lng, lat] = dashboardData.rider.currentLocation.coordinates;
        setCurrentPosition({ lat, lng });
      }
    } catch (error) {
      console.error("❌ Dashboard fetch error:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to load dashboard";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Initial load
  useEffect(() => {
    fetchDashboard();
    checkLocationPermission();
  }, [fetchDashboard, checkLocationPermission]);

  // ✅ Refresh dashboard when coming back from order details
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        !document.hidden &&
        (status === "active" || status === "on_delivery")
      ) {
        console.log("📱 Tab became visible - refreshing dashboard");
        fetchDashboard(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [status, fetchDashboard]);

  // ✅ Refresh when navigating back to dashboard
  useEffect(() => {
    console.log("🔄 Dashboard mounted/updated - fetching fresh data");
    fetchDashboard(false);
  }, [location.pathname, fetchDashboard]);

  // ✅ Auto-refresh every 30 seconds when online
  useEffect(() => {
    if (status === "active" || status === "on_delivery") {
      const interval = setInterval(() => {
        fetchDashboard(false);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [status, fetchDashboard]);

  // ✅ Enhanced Location tracking with better error handling
  useEffect(() => {
    let watchId;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const startLocationTracking = () => {
      if (!navigator.geolocation) {
        console.error("❌ Geolocation not supported");
        setLocationError("Geolocation is not supported by your browser");
        setLocationTracking(false);
        return;
      }

      console.log("📍 Starting location tracking...");

      watchId = navigator.geolocation.watchPosition(
        // Success callback
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition({ lat: latitude, lng: longitude });
          setLocationError(null);
          retryCount = 0; // Reset retry count on success

          try {
            await riderAPI.updateLocation(latitude, longitude);
            console.log("📍 Location updated successfully:", {
              lat: latitude.toFixed(6),
              lng: longitude.toFixed(6),
              accuracy: position.coords.accuracy.toFixed(2) + "m",
            });
          } catch (error) {
            console.error("❌ Failed to update location on server:", error);
            // Don't stop tracking if server update fails
          }
        },
        // Error callback
        (error) => {
          console.error("❌ Location watch error:", error);
          handleGeolocationError(error);

          // Retry logic for timeout errors
          if (error.code === error.TIMEOUT && retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`🔄 Retrying location tracking (${retryCount}/${MAX_RETRIES})...`);
            // Don't stop tracking on timeout, let it retry automatically
          } else if (error.code === error.PERMISSION_DENIED) {
            // Stop tracking if permission is denied
            setLocationTracking(false);
          }
        },
        // Options
        {
          enableHighAccuracy: true,
          timeout: 15000, // Increased timeout to 15 seconds
          maximumAge: 5000, // Allow cached position up to 5 seconds old
        }
      );
    };

    if (locationTracking && (status === "active" || status === "on_delivery")) {
      startLocationTracking();
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        console.log("📍 Location tracking stopped");
      }
    };
  }, [locationTracking, status, handleGeolocationError]);

  // ✅ Toggle online/offline status with location check
  const toggleStatus = async () => {
    const newStatus = status === "offline" ? "active" : "offline";

    // Check location permission before going online
    if (newStatus === "active") {
      const permission = await checkLocationPermission();
      
      if (permission === "denied") {
        toast.error(
          "📍 Location access is required to go online. Please enable it in your browser settings.",
          { duration: 6000 }
        );
        return;
      }

      // Request permission if not granted
      if (permission !== "granted") {
        const granted = await requestLocationPermission();
        if (!granted) {
          toast.error("📍 Location access is required to accept orders");
          return;
        }
      }
    }

    try {
      await riderAPI.updateStatus(newStatus);
      setStatus(newStatus);

      if (newStatus === "active") {
        setLocationTracking(true);
        toast.success("✅ You are now online! 🟢");
      } else {
        setLocationTracking(false);
        setLocationError(null);
        toast.success("✅ You are now offline");
      }

      await fetchDashboard(false);
    } catch (error) {
      console.error("❌ Toggle status error:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  // ✅ Manual enable location tracking
  const enableLocationTracking = async () => {
    const granted = await requestLocationPermission();
    if (granted) {
      setLocationTracking(true);
      toast.success("📍 Location tracking enabled");
    }
  };

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard(false);
    setRefreshing(false);
    toast.success("✅ Dashboard refreshed!");
  };

  // Accept order
  const handleAcceptOrder = async (orderId) => {
    try {
      await riderAPI.orders.accept(orderId);
      toast.success("✅ Order accepted successfully!");
      await fetchDashboard(false);
    } catch (error) {
      console.error("❌ Accept order error:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to accept order";
      toast.error(errorMsg);
    }
  };

  // Navigate to order details
  const viewOrderDetails = (orderId) => {
    navigate(`/rider/orders/${orderId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader
            className="animate-spin text-green-600 mx-auto mb-4"
            size={48}
          />
          <p className="text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <User className="text-green-600" size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {riderInfo?.name || "Rider Dashboard"}
                </h1>
                <p className="text-green-100 text-sm">
                  {riderInfo?.riderCode || "Loading..."}
                </p>
                {riderInfo?.phone && (
                  <p className="text-green-100 text-xs">📞 {riderInfo.phone}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Refresh Dashboard"
              >
                <RefreshCw
                  className={refreshing ? "animate-spin" : ""}
                  size={20}
                />
              </button>
              <button
                onClick={() => navigate("/rider/profile")}
                className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    status === "active"
                      ? "bg-green-400 animate-pulse"
                      : status === "on_delivery"
                      ? "bg-blue-400 animate-pulse"
                      : "bg-gray-400"
                  }`}
                />
                <div>
                  <p className="font-semibold">Status</p>
                  <p className="text-sm text-green-100">
                    {status === "active"
                      ? "Available for Orders"
                      : status === "on_delivery"
                      ? "On Delivery"
                      : status === "inactive"
                      ? "Busy"
                      : "Offline"}
                  </p>
                </div>
              </div>

              <button
                onClick={toggleStatus}
                disabled={status === "on_delivery"}
                className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                  status === "active"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-white hover:bg-gray-50 text-green-600"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {status === "active"
                  ? "Go Offline"
                  : status === "on_delivery"
                  ? "On Delivery"
                  : "Go Online"}
              </button>
            </div>

            {/* Location Status */}
            {(status === "active" || status === "on_delivery") && (
              <div className="mt-3">
                {locationTracking && !locationError ? (
                  <div className="flex items-center gap-2 text-sm text-green-100">
                    <Navigation size={14} className="animate-pulse" />
                    <span>Location tracking active</span>
                    {currentPosition && (
                      <span className="text-xs">
                        ({currentPosition.lat.toFixed(4)},{" "}
                        {currentPosition.lng.toFixed(4)})
                      </span>
                    )}
                  </div>
                ) : locationError ? (
                  <div className="flex items-center justify-between gap-2 p-2 bg-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-red-100">
                      <MapPinOff size={14} />
                      <span>{locationError}</span>
                    </div>
                    {locationPermission !== "granted" && (
                      <button
                        onClick={enableLocationTracking}
                        className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-semibold transition-colors"
                      >
                        Enable
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-yellow-100">
                    <AlertCircle size={14} />
                    <span>Location tracking disabled</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Location Permission Warning */}
        {locationPermission === "denied" && (status === "active" || status === "on_delivery") && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <MapPinOff className="text-red-600 dark:text-red-400 mt-0.5" size={20} />
              <div className="flex-1">
                <h4 className="font-bold text-red-900 dark:text-red-100 mb-1">
                  Location Access Required
                </h4>
                <p className="text-sm text-red-800 dark:text-red-200 mb-2">
                  Location tracking is essential for accepting and delivering orders. Please enable location access in your browser settings.
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">
                  <strong>Chrome:</strong> Click the lock icon in the address bar → Site settings → Location → Allow
                  <br />
                  <strong>Firefox:</strong> Click the lock icon → Connection secure → More information → Permissions
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Package className="text-blue-600" />}
            label="Today's Deliveries"
            value={stats.todayDeliveries}
            subtitle={`${stats.weeklyDeliveries} this week`}
          />
          <StatCard
            icon={<DollarSign className="text-green-600" />}
            label="Today's Earnings"
            value={`Rs. ${stats.todayEarnings.toLocaleString()}`}
            subtitle={`Total: Rs. ${stats.totalEarnings.toLocaleString()}`}
          />
          <StatCard
            icon={<Clock className="text-yellow-600" />}
            label="Available Orders"
            value={availableOrders.length}
            subtitle="Ready to accept"
          />
          <StatCard
            icon={<Star className="text-purple-600" />}
            label="Rating"
            value={stats.rating.toFixed(1)}
            subtitle={`${stats.completedOrders} completed`}
            showStar
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickActionButton
              icon={<MapPin />}
              label="Track Location"
              active={locationTracking && !locationError}
              onClick={() => locationTracking ? setLocationTracking(false) : enableLocationTracking()}
              disabled={locationPermission === "denied"}
            />
            <QuickActionButton
              icon={<Package />}
              label="My Orders"
              onClick={() => navigate("/rider/orders")}
            />
            <QuickActionButton
              icon={<DollarSign />}
              label="Earnings"
              onClick={() => navigate("/rider/earnings")}
            />
            <QuickActionButton
              icon={<User />}
              label="Profile"
              onClick={() => navigate("/rider/profile")}
            />
          </div>
        </div>

        {/* Current Active Orders */}
        {currentOrders.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border-2 border-blue-500">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Package className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      My Active Deliveries
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Orders currently assigned to you
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
                  {currentOrders.length} active
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {currentOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onViewDetails={viewOrderDetails}
                  isActive={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Available Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Available Orders
              </h3>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-semibold">
                {availableOrders.length} orders
              </span>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {availableOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package
                  className="mx-auto text-gray-300 dark:text-gray-600 mb-4"
                  size={64}
                />
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
                  No available orders
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  {status === "offline"
                    ? "Go online to start receiving orders"
                    : "New orders will appear here when available"}
                </p>
              </div>
            ) : (
              availableOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onAccept={handleAcceptOrder}
                  onViewDetails={viewOrderDetails}
                  isActive={false}
                />
              ))
            )}
          </div>
        </div>

        {/* Performance Insights */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <TrendingUp className="text-green-600" size={20} />
              Performance
            </h3>
            <div className="space-y-3">
              <PerformanceItem
                label="Acceptance Rate"
                value={`${Math.round(stats.acceptanceRate)}%`}
                progress={stats.acceptanceRate}
                color="green"
              />
              <PerformanceItem
                label="On-time Delivery"
                value={`${Math.round(stats.onTimeRate)}%`}
                progress={stats.onTimeRate}
                color="blue"
              />
              <PerformanceItem
                label="Customer Rating"
                value={`${stats.rating.toFixed(1)}/5.0`}
                progress={(stats.rating / 5) * 100}
                color="purple"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
              Weekly Summary
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="text-blue-600" size={20} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Deliveries
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {stats.weeklyDeliveries}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="text-green-600" size={20} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Earnings
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Rs. {stats.weeklyEarnings?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// SUB-COMPONENTS
// ============================================

const StatCard = ({ icon, label, value, subtitle, showStar }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow">
    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-3">
      {icon}
    </div>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
    <div className="flex items-baseline gap-2">
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </p>
      {showStar && (
        <Star className="text-yellow-500 fill-yellow-500" size={16} />
      )}
    </div>
    {subtitle && (
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {subtitle}
      </p>
    )}
  </div>
);

// Quick Action Button
const QuickActionButton = ({ icon, label, onClick, active = false }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
      active
        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
        : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
    }`}
  >
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center ${
        active ? "bg-green-200 dark:bg-green-800" : "bg-white dark:bg-gray-600"
      }`}
    >
      {icon}
    </div>
    <span className="text-xs font-medium">{label}</span>
  </button>
);

// Order Card Component
const OrderCard = ({ order, onAccept, onViewDetails, isActive = false }) => {
  const [accepting, setAccepting] = useState(false);

  const handleAccept = async () => {
    setAccepting(true);
    await onAccept(order._id);
    setAccepting(false);
  };

  return (
    <div
      className={`border-2 rounded-xl p-4 transition-colors ${
        isActive
          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
          : "border-gray-200 dark:border-gray-700 hover:border-green-500"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
              {order.orderId || `#${order._id?.slice(-6)}`}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                order.orderStatus === "Processing"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                  : order.orderStatus === "Shipped"
                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200"
                  : order.orderStatus === "Out for Delivery"
                  ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
              }`}
            >
              {order.orderStatus?.toUpperCase()}
            </span>
            {isActive && (
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
                ACTIVE
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            Rs. {order.totalPrice?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Earn: Rs. {order.shippingPrice || 0}
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2 text-sm">
          <Navigation
            className="text-green-600 mt-0.5 flex-shrink-0"
            size={16}
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              Delivery Address
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {order.shippingAddress?.addressLine1}
              {order.shippingAddress?.addressLine2 &&
                `, ${order.shippingAddress.addressLine2}`}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {order.shippingAddress?.city}, {order.shippingAddress?.state}
            </p>
          </div>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <Phone className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              Customer
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {order.shippingAddress?.fullName || "N/A"} •{" "}
              {order.shippingAddress?.phone || "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {!isActive && order.orderStatus === "Processing" && !order.rider && (
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors"
          >
            {accepting ? (
              <>
                <Loader className="animate-spin" size={16} />
                <span>Accepting...</span>
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                <span>Accept Order</span>
              </>
            )}
          </button>
        )}
        <button
          onClick={() => onViewDetails(order._id)}
          className={`${
            !isActive && order.orderStatus === "Processing" && !order.rider
              ? "flex-1"
              : "w-full"
          } py-2.5 border-2 ${
            isActive
              ? "border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400"
              : "border-green-600 dark:border-green-500 text-green-600 dark:text-green-400"
          } rounded-lg font-semibold hover:bg-opacity-10 hover:bg-current flex items-center justify-center gap-2 transition-colors`}
        >
          <span>{isActive ? "Continue Delivery" : "View Details"}</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// Performance Item
const PerformanceItem = ({ label, value, progress, color }) => {
  const colorClasses = {
    green: "bg-green-600",
    blue: "bg-blue-600",
    purple: "bg-purple-600",
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-semibold text-gray-900 dark:text-gray-100">
          {value}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${colorClasses[color] || colorClasses.green}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default RiderDashboard;