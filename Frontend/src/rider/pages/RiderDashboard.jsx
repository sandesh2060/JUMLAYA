import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  Bell,
  Award,
  Target,
  Activity,
  Zap,
  MapPinOff,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { riderAPI } from "../../api/rider.api";

const RiderDashboard = () => {
  const navigate = useNavigate();

  // State Management
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

  // ============================================
  // LOCATION PERMISSIONS
  // ============================================
  const checkLocationPermission = useCallback(async () => {
    if (!navigator.permissions) {
      console.warn("⚠️ Permissions API not supported");
      return "prompt";
    }

    try {
      const result = await navigator.permissions.query({ name: "geolocation" });
      setLocationPermission(result.state);

      result.addEventListener("change", () => {
        setLocationPermission(result.state);
      });

      return result.state;
    } catch (error) {
      console.warn("⚠️ Could not query location permission:", error);
      return "prompt";
    }
  }, []);

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
          setLocationError(null);
          setLocationPermission("granted");
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          resolve(true);
        },
        (error) => {
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

  const handleGeolocationError = useCallback((error) => {
    let userFriendlyMessage = "";

    switch (error.code) {
      case error.PERMISSION_DENIED:
        userFriendlyMessage = "📍 Please enable location access in your browser settings";
        setLocationPermission("denied");
        break;
      case error.POSITION_UNAVAILABLE:
        userFriendlyMessage = "📍 Unable to retrieve your location";
        break;
      case error.TIMEOUT:
        userFriendlyMessage = "📍 Location request timed out";
        break;
      default:
        userFriendlyMessage = "📍 An error occurred while accessing your location";
    }

    setLocationError(userFriendlyMessage);
    setLocationTracking(false);

    if (error.code !== error.TIMEOUT) {
      toast.error(userFriendlyMessage);
    }
  }, []);

  const enableLocationTracking = async () => {
    const granted = await requestLocationPermission();
    if (granted) {
      setLocationTracking(true);
      toast.success("📍 Location tracking enabled");
    }
  };

  // ============================================
  // FETCH DASHBOARD DATA
  // ============================================
  const fetchDashboard = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await riderAPI.getDashboard();
      const dashboardData = response.data || response;

      // Update Stats
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

      // Available Orders (unassigned)
      setAvailableOrders(dashboardData.orders || []);

      // Current Orders (assigned to this rider)
      setCurrentOrders(dashboardData.currentOrders || []);

      // Rider Status
      setStatus(dashboardData.status || "offline");
      setRiderInfo(dashboardData.rider || null);

      // Set current location if available
      if (dashboardData.rider?.currentLocation?.coordinates) {
        const [lng, lat] = dashboardData.rider.currentLocation.coordinates;
        setCurrentPosition({ lat, lng });
      }
    } catch (error) {
      console.error("❌ Dashboard error:", error);
      toast.error(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================
  // LOCATION TRACKING
  // ============================================
  useEffect(() => {
    let watchId;

    if (locationTracking && (status === "active" || status === "on_delivery")) {
      if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported");
        setLocationTracking(false);
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition({ lat: latitude, lng: longitude });
          setLocationError(null);

          try {
            await riderAPI.updateLocation(latitude, longitude);
          } catch (error) {
            console.error("Location update failed:", error);
          }
        },
        (error) => {
          handleGeolocationError(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000,
        }
      );
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [locationTracking, status, handleGeolocationError]);

  // ============================================
  // STATUS TOGGLE
  // ============================================
  const toggleStatus = async () => {
    const newStatus = status === "offline" ? "active" : "offline";

    if (newStatus === "active") {
      const permission = await checkLocationPermission();

      if (permission === "denied") {
        toast.error("📍 Location access is required to go online");
        return;
      }

      if (permission !== "granted") {
        const granted = await requestLocationPermission();
        if (!granted) {
          toast.error("📍 Location access is required");
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
      console.error("Status update error:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  // ============================================
  // REFRESH DASHBOARD
  // ============================================
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard(false);
    setRefreshing(false);
    toast.success("✅ Dashboard refreshed!");
  };

  // ============================================
  // ACCEPT ORDER
  // ============================================
  const handleAcceptOrder = async (orderId) => {
    try {
      await riderAPI.orders.accept(orderId);
      toast.success("✅ Order accepted successfully!");
      await fetchDashboard(false);
    } catch (error) {
      console.error("Accept order error:", error);
      toast.error(error.response?.data?.message || "Failed to accept order");
    }
  };

  // ============================================
  // INITIAL LOAD
  // ============================================
  useEffect(() => {
    fetchDashboard();
    checkLocationPermission();
  }, [fetchDashboard, checkLocationPermission]);

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader className="animate-spin text-green-600 dark:text-green-400 mx-auto mb-4" size={64} />
            <div className="absolute inset-0 bg-green-400 dark:bg-green-600 opacity-20 blur-xl rounded-full animate-pulse" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50 dark:from-gray-900 dark:via-green-900/10 dark:to-gray-900 pb-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {/* Top Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                  <User className="text-green-600" size={32} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-400 rounded-full border-4 border-white flex items-center justify-center">
                  <Award size={10} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold mb-1">
                  {riderInfo?.name || "Rider Dashboard"}
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="px-2 sm:px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-semibold">
                    {riderInfo?.riderCode || "Loading..."}
                  </span>
                  {riderInfo?.phone && (
                    <span className="text-green-100 text-xs sm:text-sm flex items-center gap-1">
                      <Phone size={12} />
                      {riderInfo.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button className="relative p-2 sm:p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all transform hover:scale-105 flex-1 sm:flex-none">
                <Bell size={18} className="mx-auto sm:mx-0" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all transform hover:scale-105 flex-1 sm:flex-none"
              >
                <RefreshCw className={refreshing ? "animate-spin" : ""} size={18} />
              </button>
              <button
                onClick={() => navigate("/rider/profile")}
                className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all transform hover:scale-105 flex-1 sm:flex-none"
              >
                <User size={18} />
              </button>
            </div>
          </div>

          {/* Status Control */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative">
                  <div
                    className={`w-4 h-4 rounded-full ${
                      status === "active"
                        ? "bg-green-400 animate-pulse"
                        : status === "on_delivery"
                        ? "bg-blue-400 animate-pulse"
                        : "bg-gray-400"
                    }`}
                  />
                  <div
                    className={`absolute inset-0 rounded-full ${
                      status === "active"
                        ? "bg-green-400"
                        : status === "on_delivery"
                        ? "bg-blue-400"
                        : "bg-gray-400"
                    } opacity-50 blur-md`}
                  />
                </div>
                <div>
                  <p className="font-bold text-base sm:text-lg">Status</p>
                  <p className="text-xs sm:text-sm text-green-100">
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
                className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl font-bold text-base sm:text-lg transition-all transform hover:scale-105 shadow-lg ${
                  status === "active"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-white hover:bg-gray-50 text-green-600"
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
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
              <div className="pt-3 border-t border-white/20">
                {locationTracking && !locationError ? (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Navigation size={16} className="animate-pulse" />
                    <span className="font-medium">Location tracking active</span>
                    {currentPosition && (
                      <span className="text-xs opacity-75 hidden sm:inline">
                        ({currentPosition.lat.toFixed(4)}, {currentPosition.lng.toFixed(4)})
                      </span>
                    )}
                  </div>
                ) : locationError ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-red-500/20 backdrop-blur-sm rounded-xl">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <MapPinOff size={16} />
                      <span>{locationError}</span>
                    </div>
                    {locationPermission !== "granted" && (
                      <button
                        onClick={enableLocationTracking}
                        className="w-full sm:w-auto px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition-colors"
                      >
                        Enable
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 space-y-4 sm:space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            icon={<Package className="text-blue-600" />}
            label="Today's Deliveries"
            value={stats.todayDeliveries}
            subtitle={`${stats.weeklyDeliveries} this week`}
            color="blue"
            trend="+12%"
          />
          <StatCard
            icon={<DollarSign className="text-green-600" />}
            label="Today's Earnings"
            value={`Rs. ${stats.todayEarnings.toLocaleString()}`}
            subtitle={`Total: Rs. ${stats.totalEarnings.toLocaleString()}`}
            color="green"
            trend="+8%"
          />
          <StatCard
            icon={<Clock className="text-yellow-600" />}
            label="Available Orders"
            value={availableOrders.length}
            subtitle="Ready to accept"
            color="yellow"
          />
          <StatCard
            icon={<Star className="text-purple-600" />}
            label="Rating"
            value={stats.rating.toFixed(1)}
            subtitle={`${stats.completedOrders} completed`}
            color="purple"
            showStar
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <Zap className="text-yellow-500" size={20} />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <QuickActionButton
              icon={<MapPin />}
              label="Track Location"
              active={locationTracking && !locationError}
              color="green"
              onClick={() =>
                locationTracking ? setLocationTracking(false) : enableLocationTracking()
              }
              disabled={locationPermission === "denied"}
            />
            <QuickActionButton
              icon={<Package />}
              label="My Orders"
              color="blue"
              onClick={() => navigate("/rider/orders")}
            />
            <QuickActionButton
              icon={<DollarSign />}
              label="Earnings"
              color="purple"
              onClick={() => navigate("/rider/earnings")}
            />
            <QuickActionButton
              icon={<User />}
              label="Profile"
              color="orange"
              onClick={() => navigate("/rider/profile")}
            />
          </div>
        </div>

        {/* Current Active Orders */}
        {currentOrders.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-xl border-2 border-blue-200 dark:border-blue-700 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-blue-200 dark:border-blue-700 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Package className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white">My Active Deliveries</h3>
                    <p className="text-xs sm:text-sm text-blue-100">Orders currently assigned to you</p>
                  </div>
                </div>
                <span className="px-3 sm:px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-bold">
                  {currentOrders.length} active
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {currentOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onViewDetails={(id) => navigate(`/rider/orders/${id}`)}
                  isActive={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Available Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="text-green-600" size={20} />
                Available Orders
              </h3>
              <span className="px-3 sm:px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-bold">
                {availableOrders.length} orders
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {availableOrders.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <Package className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={64} />
                <p className="text-gray-500 dark:text-gray-400 text-lg sm:text-xl font-semibold mb-2">
                  No available orders
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm sm:text-base">
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
                  onViewDetails={(id) => navigate(`/rider/orders/${id}`)}
                  isActive={false}
                />
              ))
            )}
          </div>
        </div>

        {/* Performance Dashboard */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
              <TrendingUp className="text-green-600" size={20} />
              Performance Metrics
            </h3>
            <div className="space-y-4">
              <PerformanceItem
                label="Acceptance Rate"
                value={`${Math.round(stats.acceptanceRate)}%`}
                progress={stats.acceptanceRate}
                color="green"
                icon={<CheckCircle size={16} />}
              />
              <PerformanceItem
                label="On-time Delivery"
                value={`${Math.round(stats.onTimeRate)}%`}
                progress={stats.onTimeRate}
                color="blue"
                icon={<Clock size={16} />}
              />
              <PerformanceItem
                label="Customer Rating"
                value={`${stats.rating.toFixed(1)}/5.0`}
                progress={(stats.rating / 5) * 100}
                color="purple"
                icon={<Star size={16} />}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
              <Activity className="text-blue-600" size={20} />
              Weekly Summary
            </h3>
            <div className="space-y-4">
              <SummaryCard
                icon={<Package className="text-blue-600" size={20} />}
                label="Deliveries"
                value={stats.weeklyDeliveries}
                color="blue"
              />
              <SummaryCard
                icon={<DollarSign className="text-green-600" size={20} />}
                label="Earnings"
                value={`Rs. ${stats.weeklyEarnings?.toLocaleString() || 0}`}
                color="green"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// HELPER COMPONENTS
// ============================================

const StatCard = ({ icon, label, value, subtitle, color, trend, showStar }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-500 to-yellow-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all transform hover:-translate-y-1">
      <div
        className={`w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br ${colorClasses[color]} rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg`}
      >
        <div className="text-white">{icon}</div>
      </div>
      <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
        {label}
      </p>
      <div className="flex items-baseline gap-2 mb-2">
        <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        {showStar && <Star className="text-yellow-500 fill-yellow-500" size={16} />}
        {trend && (
          <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full hidden sm:inline-block">
            {trend}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      )}
    </div>
  );
};

const QuickActionButton = ({ icon, label, active = false, color = "green", onClick, disabled }) => {
  const colorClasses = {
    green: "from-green-500 to-green-600",
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
        active
          ? "bg-gradient-to-br " + colorClasses[color] + " text-white shadow-lg"
          : "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
      }`}
    >
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${
          active ? "bg-white/20" : "bg-white dark:bg-gray-800"
        }`}
      >
        {icon}
      </div>
      <span className="text-xs sm:text-sm font-medium text-center">{label}</span>
    </button>
  );
};

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
      <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-3">
        <div className="flex-1 w-full">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100">
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
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="text-right w-full sm:w-auto">
          <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
            Rs. {order.totalPrice?.toLocaleString() || 0}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Earn: Rs. {order.shippingPrice || 0}
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2 text-xs sm:text-sm">
          <Navigation className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Delivery Address</p>
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
        <div className="flex items-start gap-2 text-xs sm:text-sm">
          <Phone className="text-blue-600 mt-0.5 flex-shrink-0" size={16} />
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Customer</p>
            <p className="text-gray-600 dark:text-gray-400">
              {order.shippingAddress?.fullName || "N/A"} •{" "}
              {order.shippingAddress?.phone || "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {!isActive &&
          order.orderStatus === "Processing" &&
          !order.rider &&
          onAccept && (
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
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(order._id)}
            className={`${
              !isActive &&
              order.orderStatus === "Processing" &&
              !order.rider &&
              onAccept
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
        )}
      </div>
    </div>
  );
};

const PerformanceItem = ({ label, value, progress, color, icon }) => {
  const colorClasses = {
    green: "bg-green-600",
    blue: "bg-blue-600",
    purple: "bg-purple-600",
  };

  return (
    <div>
      <div className="flex justify-between items-center text-xs sm:text-sm mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-gray-500">{icon}</span>}
          <span className="text-gray-600 dark:text-gray-400">{label}</span>
        </div>
        <span className="font-semibold text-gray-900 dark:text-gray-100">{value}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            colorClasses[color] || colorClasses.green
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
};

const SummaryCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20",
    green: "bg-green-50 dark:bg-green-900/20",
  };

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl ${
        colorClasses[color] || colorClasses.blue
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
      </div>
      <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </span>
    </div>
  );
};

export default RiderDashboard;