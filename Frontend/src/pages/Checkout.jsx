// Frontend/src/pages/Checkout.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Wallet,
  Truck,
  MapPin,
  Plus,
  Check,
  AlertCircle,
  X,
  Edit,
  Trash2,
  Map,
  Navigation,
  Search,
} from "lucide-react";
import { useCart } from "@hooks/useCart";
import { addressAPI } from "@api/address.api";
import publicSettingsAPI from '@/api/publicSettings.api'
import { orderAPI } from "@api/order.api";
import toast from "react-hot-toast";
import MapPicker from "../components/map/MapPicker";

const formatPrice = (price) => `Rs. ${price?.toLocaleString() || 0}`;
// Replace this line in your Checkout.jsx:
// const getImageUrl = (url) => url || "https://via.placeholder.com/100";

// With this:
const getImageUrl = (path) => {
  if (!path) return "/placeholder.png";
  
  // If it's already a full URL, return as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  
  // Get base URL without /api suffix
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4001/api";
  const baseUrl = apiUrl.replace(/\/api$/, '');
  
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${cleanPath}`;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, loading: cartLoading, clearCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [errors, setErrors] = useState({});
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // ✅ Tax settings state (ADD THIS HERE)
  const [taxSettings, setTaxSettings] = useState({
    enabled: true,
    rate: 13,
    includeInPrice: false
  });

  // Map states
  const [mapPosition, setMapPosition] = useState([27.7172, 85.324]);
  const [mapAddress, setMapAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [newAddress, setNewAddress] = useState({
    label: "home",
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "Bagmati",
    postalCode: "",
    country: "Nepal",
    landmark: "",
    deliveryInstructions: "",
    coordinates: { latitude: null, longitude: null },
  });

  // ✅ Fetch addresses on mount
  useEffect(() => {
    fetchAddresses();
  }, []);
  useEffect(() => {
  const fetchTaxSettings = async () => {
    try {
      const response = await publicSettingsAPI.getTaxSettings();
      if (response.success) {
        setTaxSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching tax settings:', error);
    }
  };
  
  fetchTaxSettings();
}, []);
useEffect(() => {
  if (!cartLoading && (!cart || !cart.items || cart.items.length === 0)) {
    if (!orderPlaced) {
      toast.error("Your cart is empty");
      navigate("/cart");
    }
  }
}, [cart, cartLoading, navigate, orderPlaced]);

  useEffect(() => {
    if (!cartLoading && (!cart || !cart.items || cart.items.length === 0)) {
      if (!orderPlaced) {
        toast.error("Your cart is empty");
        navigate("/cart");
      }
    }
  }, [cart, cartLoading, navigate, orderPlaced]);

 const fetchAddresses = async () => {
  try {
    const response = await addressAPI.getAll();
    const addressList = response.data?.addresses || [];
    setAddresses(addressList);
    const defaultAddr = addressList.find((a) => a.isDefault);
    if (defaultAddr) {
      setSelectedAddress(defaultAddr._id);
    }
  } catch (error) {
    console.error("❌ Failed to load addresses:", error);
    toast.error("Failed to load addresses");
  }
};



  // ============================================
  // MAP FUNCTIONS
  // ============================================

  const fetchAddress = async (lat, lng) => {
    try {
      setIsLoadingLocation(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      if (data?.display_name) {
        setMapAddress(data.display_name);

        // Auto-fill address fields
        const address = data.address || {};
        const street =
          address.road || address.neighbourhood || address.suburb || "";
        const city =
          address.city || address.town || address.village || "Kathmandu";
        const state = address.state || "Bagmati";
        const postalCode = address.postcode || "";

        setNewAddress((prev) => ({
          ...prev,
          addressLine1: street || prev.addressLine1,
          city: city,
          state: state,
          postalCode: postalCode || prev.postalCode,
        }));
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setMapAddress("Address not found");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapPosition([latitude, longitude]);
          fetchAddress(latitude, longitude);
          toast.success("📍 Location detected!");
        },
        () => {
          toast.error("Could not get your location");
          setIsLoadingLocation(false);
        }
      );
    } else {
      toast.error("Geolocation not supported");
    }
  };

  const searchLocation = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query + " Nepal"
        )}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    }
  };

  const handleSearchSelect = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setMapPosition([lat, lng]);
    setMapAddress(result.display_name);
    setSearchQuery(result.display_name);
    setSearchResults([]);
    fetchAddress(lat, lng);
  };

  let searchTimeout;
  const handleSearchInput = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchLocation(query);
    }, 500);
  };

  const handleConfirmMapLocation = () => {
    if (!mapPosition || !mapPosition[0] || !mapPosition[1]) {
      toast.error("Please select a location");
      return;
    }

    setNewAddress((prev) => ({
      ...prev,
      landmark: landmark,
      deliveryInstructions: deliveryInstructions,
      coordinates: {
        latitude: mapPosition[0],
        longitude: mapPosition[1],
      },
    }));

    setShowMapModal(false);
    setShowAddressForm(true);
    toast.success("📍 Location selected!");
  };

  // ============================================
  // ADDRESS FUNCTIONS
  // ============================================

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress({ ...newAddress, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validateAddress = () => {
    const newErrors = {};
    if (!newAddress.fullName?.trim()) newErrors.fullName = "Full name required";
    if (!newAddress.phone || newAddress.phone.length < 10) {
      newErrors.phone = "Valid phone number required";
    }
    if (!newAddress.addressLine1?.trim()) {
      newErrors.addressLine1 = "Street address is required";
    }
    if (!newAddress.city?.trim()) {
      newErrors.city = "City is required";
    }
    if (!newAddress.postalCode) {
      newErrors.postalCode = "Postal code required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!validateAddress()) return;

    setLoading(true);
    try {
      if (editingAddress) {
        await addressAPI.update(editingAddress._id, newAddress);
        toast.success("✓ Address updated!");
      } else {
        const response = await addressAPI.create(newAddress);
        const createdAddress = response.data || response.address;
        if (createdAddress) {
          setSelectedAddress(createdAddress._id);
          toast.success("✓ Address added with map location!");
        }
      }

      await fetchAddresses();
      setShowAddressForm(false);
      setEditingAddress(null);

      // Reset
      setNewAddress({
        label: "home",
        fullName: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "Bagmati",
        postalCode: "",
        country: "Nepal",
        landmark: "",
        deliveryInstructions: "",
        coordinates: { latitude: null, longitude: null },
      });
      setMapAddress("");
      setLandmark("");
      setDeliveryInstructions("");
      setErrors({});
    } catch (error) {
      console.error("❌ Save error:", error);
      toast.error(error.response?.data?.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (addr) => {
    setEditingAddress(addr);
    setNewAddress({
      label: addr.label || "home",
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      addressLine1: addr.addressLine1 || addr.street || "",
      addressLine2: addr.addressLine2 || "",
      city: addr.city || "",
      state: addr.state || "Bagmati",
      postalCode: addr.postalCode || addr.zip || "",
      country: addr.country || "Nepal",
      landmark: addr.landmark || "",
      deliveryInstructions: addr.deliveryInstructions || "",
      coordinates: addr.coordinates || { latitude: null, longitude: null },
    });

    if (addr.coordinates?.latitude && addr.coordinates?.longitude) {
      setMapPosition([addr.coordinates.latitude, addr.coordinates.longitude]);
      setLandmark(addr.landmark || "");
      setDeliveryInstructions(addr.deliveryInstructions || "");
    }

    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Delete this address?")) return;

    setLoading(true);
    try {
      await addressAPI.delete(addressId);
      setAddresses(addresses.filter((a) => a._id !== addressId));
      if (selectedAddress === addressId) {
        setSelectedAddress(null);
      }
      toast.success("✓ Address deleted");
    } catch (error) {
      console.error("❌ Delete address error:", error);
      toast.error("Failed to delete address");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ORDER FUNCTION
  // ============================================

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    if (!cart?.items || cart.items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        shippingAddressId: selectedAddress,
        paymentMethod,
        items: cart.items.map((item) => ({
          product: item.product?._id || item.product,
          quantity: item.quantity,
        })),
      };

      console.log("📦 Placing order with data:", orderData);

      const response = await orderAPI.createOrder(orderData);
      console.log("✅ Full response:", response);

      const orderResult = response.data || response;
      console.log("📦 Order result:", orderResult);

      if (paymentMethod === "esewa" && orderResult.paymentUrl) {
        toast.success("Redirecting to eSewa...");
        window.location.href = orderResult.paymentUrl;
      } else {
        // Extract the order from the response
        const order = orderResult.order || orderResult;
        console.log("🎉 Extracted order:", order);

        // Clear cart first
        await clearCart();

        // Then set order and show success screen
        setPlacedOrder(order);
        setOrderPlaced(true);

        console.log("✅ Success screen should show now");

        toast.success("✓ Order placed successfully!");

        // Wait 3 seconds, then redirect to orders page
        setTimeout(() => {
          console.log("🔄 Redirecting to orders page...");
          navigate("/orders");
        }, 3000);
      }
    } catch (error) {
      console.error("❌ Place order error:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDER
  // ======================================================

  // Loading state
  if (cartLoading && !orderPlaced) {
    return (
      <div className="min-h-screen dark:bg-gray-900 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="dark:text-gray-400 text-gray-600">
            Loading checkout...
          </p>
        </div>
      </div>
    );
  }

  // Order success state
  if (orderPlaced && placedOrder) {
    return (
      <div className="min-h-screen dark:bg-gray-900 bg-gray-50 flex items-center justify-center p-4">
        <div className="dark:bg-gray-800 bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="text-green-600 dark:text-green-400" size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-3 dark:text-gray-100 text-gray-900">
            Order Placed!
          </h1>
          <p className="dark:text-gray-400 text-gray-600 mb-2">
            Your order has been confirmed
          </p>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400 mb-6">
            {placedOrder.orderId || "Order ID"}
          </p>

          <div className="dark:bg-gray-700/50 bg-gray-50 rounded-xl p-5 mb-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="dark:text-gray-400 text-gray-600">
                Order Total
              </span>
              <span className="font-bold text-lg dark:text-gray-100 text-gray-900">
                {formatPrice(placedOrder.totalPrice || placedOrder.total)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t dark:border-gray-600 border-gray-200">
              <span className="dark:text-gray-400 text-gray-600">Payment</span>
              <span className="font-medium dark:text-gray-100 text-gray-900">
                {placedOrder.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : placedOrder.paymentMethod === "esewa"
                  ? "eSewa"
                  : "Khalti"}
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Redirecting to orders page in 3 seconds...
          </div>

        <div className="space-y-3">
  <button
    key="view-order"
    onClick={() => navigate("/orders")}
    className="w-full px-6 py-3.5 rounded-xl font-semibold bg-green-600 hover:bg-green-700 text-white shadow-lg transition-colors"
  >
    View Order Now
  </button>
  <button
    key="continue-shopping"
    onClick={() => navigate("/")}
    className="w-full px-6 py-3.5 rounded-xl font-semibold border-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 border-gray-300 text-gray-900 hover:bg-gray-100 transition-colors"
  >
    Continue Shopping
  </button>
</div>
        </div>
      </div>
    );
  }

  // Main checkout page
  return (
    <div className="min-h-screen dark:bg-gray-900 bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 dark:text-gray-100 text-gray-900">
            Checkout
          </h1>
          <p className="dark:text-gray-400 text-gray-600">
            Complete your purchase
          </p>
        </div>

        {/* Map Modal */}
        {showMapModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold dark:text-gray-100">
                    Choose Delivery Location
                  </h2>
                  <p className="text-sm dark:text-gray-400">
                    Click map, drag marker, or search to select location
                  </p>
                </div>
                <button
                  onClick={() => setShowMapModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="dark:text-gray-400" size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search location (e.g. Thamel, Kathmandu)"
                    value={searchQuery}
                    onChange={handleSearchInput}
                    className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                  />
                  {searchResults.length > 0 && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {searchResults.map((result) => (
                        <div
                          key={result.place_id || result.osm_id}
                          onClick={() => handleSearchSelect(result)}
                          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-600 last:border-0"
                        >
                          <p className="text-sm dark:text-gray-100">
                            {result.display_name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleGetCurrentLocation}
                  disabled={isLoadingLocation}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2 disabled:bg-blue-400"
                >
                  {isLoadingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>{" "}
                      Getting...
                    </>
                  ) : (
                    <>
                      <Navigation size={20} /> Use My Current Location
                    </>
                  )}
                </button>

                {/* Real Interactive Map */}
                <MapPicker
                  position={mapPosition}
                  setPosition={setMapPosition}
                  onLocationChange={(lat, lng) => {
                    fetchAddress(lat, lng);
                  }}
                />

                {mapAddress && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-start gap-2">
                      <MapPin
                        className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1"
                        size={20}
                      />
                      <div>
                        <p className="text-sm font-medium dark:text-gray-100 mb-1">
                          Selected Location
                        </p>
                        <p className="text-xs dark:text-gray-400">
                          {mapAddress}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Landmark (e.g., Near City Hall)"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg"
                />

                <textarea
                  placeholder="Delivery instructions (e.g., Ring doorbell twice)"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg resize-none"
                />
              </div>

              <div className="p-6 border-t dark:border-gray-700">
                <button
                  onClick={handleConfirmMapLocation}
                  disabled={
                    !mapPosition || !mapPosition[0] || isLoadingLocation
                  }
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400 flex items-center justify-center gap-2"
                >
                  <Check size={20} /> Confirm & Continue
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address Section */}
            <div className="dark:bg-gray-800 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <MapPin
                    className="text-green-600 dark:text-green-400"
                    size={24}
                  />
                  <h2 className="text-xl font-bold dark:text-gray-100 text-gray-900">
                    Shipping Address
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowMapModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm"
                  >
                    <Map size={18} />
                    <span className="hidden sm:inline">Choose on Map</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingAddress(null);
                      setNewAddress({
                        label: "home",
                        fullName: "",
                        phone: "",
                        addressLine1: "",
                        addressLine2: "",
                        city: "",
                        state: "Bagmati",
                        postalCode: "",
                        country: "Nepal",
                        landmark: "",
                        deliveryInstructions: "",
                        coordinates: { latitude: null, longitude: null },
                      });
                      setShowAddressForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 font-semibold text-sm"
                  >
                    <Plus size={18} />
                    <span className="hidden sm:inline">Add New</span>
                  </button>
                </div>
              </div>

              {addresses.length === 0 && !showAddressForm ? (
                <div className="text-center py-8">
                  <AlertCircle
                    className="mx-auto text-gray-400 mb-3"
                    size={48}
                  />
                  <p className="dark:text-gray-400 text-gray-600 mb-4">
                    No addresses saved
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setShowMapModal(true)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Choose on Map
                    </button>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Add Manually
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                        selectedAddress === addr._id
                          ? "border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-900/20"
                          : "dark:border-gray-700 border-gray-200 hover:border-green-300 dark:hover:border-green-700"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className="flex-1"
                          onClick={() => setSelectedAddress(addr._id)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold dark:text-gray-100 text-gray-900">
                              {addr.label?.toUpperCase() || "ADDRESS"}
                            </p>
                            {addr.coordinates?.latitude && (
                              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                                📍 Map Location
                              </span>
                            )}
                          </div>
                          <p className="dark:text-gray-300 text-gray-800 font-medium">
                            {addr.fullName}
                          </p>
                          <p className="dark:text-gray-400 text-gray-600 text-sm">
                            {addr.addressLine1}
                          </p>
                          {addr.addressLine2 && (
                            <p className="dark:text-gray-400 text-gray-600 text-sm">
                              {addr.addressLine2}
                            </p>
                          )}
                          {addr.landmark && (
                            <p className="dark:text-gray-400 text-gray-600 text-sm">
                              🏷️ {addr.landmark}
                            </p>
                          )}
                          <p className="dark:text-gray-400 text-gray-600 text-sm">
                            {addr.city}, {addr.state} {addr.postalCode}
                          </p>
                          <p className="dark:text-gray-400 text-gray-600 text-sm">
                            📞 {addr.phone}
                          </p>
                          {addr.deliveryInstructions && (
                            <p className="dark:text-gray-400 text-gray-600 text-sm mt-1">
                              📝 {addr.deliveryInstructions}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedAddress === addr._id && (
                            <Check
                              className="text-green-600 dark:text-green-400"
                              size={24}
                            />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(addr);
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <Edit
                              className="text-blue-600 dark:text-blue-400"
                              size={18}
                            />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(addr._id);
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <Trash2
                              className="text-red-600 dark:text-red-400"
                              size={18}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showAddressForm && (
                <div className="mt-4 p-4 border-2 border-green-600 dark:border-green-500 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold dark:text-gray-100 text-gray-900">
                      {editingAddress ? "Edit Address" : "New Address"}
                    </h3>
                    <button
                      onClick={() => {
                        setShowAddressForm(false);
                        setEditingAddress(null);
                        setErrors({});
                      }}
                    >
                      <X className="dark:text-gray-400 text-gray-600 hover:text-gray-900 dark:hover:text-gray-100" />
                    </button>
                  </div>
                  <form onSubmit={handleAddAddress} className="space-y-3">
                    <select
                      name="label"
                      value={newAddress.label}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>

                    <input
                      type="text"
                      name="fullName"
                      placeholder="Full Name"
                      value={newAddress.fullName}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    {errors.fullName && (
                      <p className="text-red-600 dark:text-red-400 text-sm">
                        {errors.fullName}
                      </p>
                    )}

                    <input
                      type="text"
                      name="phone"
                      placeholder="Phone Number"
                      value={newAddress.phone}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    {errors.phone && (
                      <p className="text-red-600 dark:text-red-400 text-sm">
                        {errors.phone}
                      </p>
                    )}

                    <input
                      type="text"
                      name="addressLine1"
                      placeholder="Street Address"
                      value={newAddress.addressLine1}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    {errors.addressLine1 && (
                      <p className="text-red-600 dark:text-red-400 text-sm">
                        {errors.addressLine1}
                      </p>
                    )}

                    <input
                      type="text"
                      name="addressLine2"
                      placeholder="Apartment, suite, etc. (optional)"
                      value={newAddress.addressLine2}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          name="city"
                          placeholder="City"
                          value={newAddress.city}
                          onChange={handleAddressChange}
                          className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                        {errors.city && (
                          <p className="text-red-600 dark:text-red-400 text-sm">
                            {errors.city}
                          </p>
                        )}
                      </div>
                      <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={newAddress.state}
                        onChange={handleAddressChange}
                        className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <input
                      type="text"
                      name="postalCode"
                      placeholder="Postal Code"
                      value={newAddress.postalCode}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    {errors.postalCode && (
                      <p className="text-red-600 dark:text-red-400 text-sm">
                        {errors.postalCode}
                      </p>
                    )}

                    <input
                      type="text"
                      name="landmark"
                      placeholder="Landmark (optional)"
                      value={newAddress.landmark}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500"
                    />

                    <textarea
                      name="deliveryInstructions"
                      placeholder="Delivery instructions (optional)"
                      value={newAddress.deliveryInstructions}
                      onChange={handleAddressChange}
                      rows={2}
                      className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                    />

                    {newAddress.coordinates?.latitude && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                        <p className="text-sm font-medium dark:text-gray-100 flex items-center gap-2">
                          <MapPin
                            size={16}
                            className="text-blue-600 dark:text-blue-400"
                          />
                          Map coordinates saved
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowMapModal(true)}
                        className="flex-1 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold flex items-center justify-center gap-2"
                      >
                        <Map size={18} />
                        {newAddress.coordinates?.latitude
                          ? "Update"
                          : "Add"}{" "}
                        Location
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400"
                      >
                        {loading
                          ? "Saving..."
                          : editingAddress
                          ? "Update Address"
                          : "Add Address"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="dark:bg-gray-800 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard
                  className="text-green-600 dark:text-green-400"
                  size={24}
                />
                <h2 className="text-xl font-bold dark:text-gray-100 text-gray-900">
                  Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                {[
                  {
                    value: "cod",
                    icon: Truck,
                    label: "Cash on Delivery",
                    desc: "Pay when you receive",
                  },
                  {
                    value: "esewa",
                    icon: Wallet,
                    label: "eSewa",
                    desc: "Digital payment",
                  },
                  {
                    value: "khalti",
                    icon: CreditCard,
                    label: "Khalti",
                    desc: "Digital wallet",
                  },
                ].map(({ value, icon: Icon, label, desc }) => (
                  <div
                    key={value}
                    onClick={() => setPaymentMethod(value)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === value
                        ? "border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "dark:border-gray-700 border-gray-200 hover:border-green-300 dark:hover:border-green-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon
                          className="dark:text-gray-400 text-gray-600"
                          size={24}
                        />
                        <div>
                          <p className="font-semibold dark:text-gray-100 text-gray-900">
                            {label}
                          </p>
                          <p className="text-sm dark:text-gray-400 text-gray-600">
                            {desc}
                          </p>
                        </div>
                      </div>
                      {paymentMethod === value && (
                        <Check
                          className="text-green-600 dark:text-green-400"
                          size={24}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          {/* Order Summary */}
    <div className="lg:col-span-1">
      <div className="dark:bg-gray-800 bg-white rounded-xl shadow-md p-6 sticky top-8">
        <h2 className="text-xl font-bold mb-4 dark:text-gray-100 text-gray-900">
          Order Summary
        </h2>

        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {cart?.items?.map((item) => (
            <div key={item._id} className="flex gap-3">
              <img
                src={getImageUrl(item.product?.images?.[0])}
                alt={item.product?.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="font-semibold text-sm dark:text-gray-100 text-gray-900">
                  {item.product?.name}
                </p>
                <p className="text-sm dark:text-gray-400 text-gray-600">
                  Qty: {item.quantity}
                </p>
                <p className="text-sm font-semibold dark:text-gray-100 text-gray-900">
                  {formatPrice(item.priceSnapshot || item.product?.price)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t dark:border-gray-700 pt-4 space-y-2">
          <div className="flex justify-between dark:text-gray-400 text-gray-600">
            <span>Subtotal</span>
            <span>{formatPrice(cart?.subtotal)}</span>
          </div>
          
          {/* Dynamic Tax Rate from Backend */}
          {taxSettings.enabled && (
            <div className="flex justify-between dark:text-gray-400 text-gray-600">
              <span>Tax ({taxSettings.rate}%)</span>
              <span>{formatPrice(cart?.tax)}</span>
            </div>
          )}
          
          <div className="flex justify-between dark:text-gray-400 text-gray-600">
            <span>Shipping</span>
            <span>{formatPrice(cart?.shippingFee)}</span>
          </div>
          {cart?.discount > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>Discount</span>
              <span>-{formatPrice(cart?.discount)}</span>
            </div>
          )}
          <div className="border-t dark:border-gray-700 pt-2 flex justify-between font-bold text-lg dark:text-gray-100 text-gray-900">
            <span>Total</span>
            <span>{formatPrice(cart?.total)}</span>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading || !selectedAddress}
          className="w-full mt-6 py-3.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-lg"
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>

        {!selectedAddress && (
          <p className="text-red-600 dark:text-red-400 text-sm text-center mt-2">
            Please select a shipping address
          </p>
        )}
      </div>
    </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
