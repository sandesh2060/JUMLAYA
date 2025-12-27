// Frontend/src/pages/Checkout.jsx - COMPLETE WORKING VERSION
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
} from "lucide-react";
import { useCart } from "@hooks/useCart";
import { addressAPI } from "@api/address.api";
import { orderAPI } from "@api/order.api";
import toast from "react-hot-toast";

const formatPrice = (price) => `Rs. ${price?.toLocaleString() || 0}`;
const getImageUrl = (url) => url || "https://via.placeholder.com/100";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, loading: cartLoading, clearCart } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [errors, setErrors] = useState({});
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  const [newAddress, setNewAddress] = useState({
    label: "home",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (!cartLoading && (!cart || !cart.items || cart.items.length === 0)) {
      // Don't redirect if order was just placed
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

  const handleAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateAddress = () => {
    const newErrors = {};
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
        toast.success("Address updated successfully");
      } else {
        const response = await addressAPI.create(newAddress);
        const createdAddress = response.data || response.address;
        if (createdAddress) {
          setSelectedAddress(createdAddress._id);
          toast.success("Address added successfully");
        }
      }
      await fetchAddresses();
      setShowAddressForm(false);
      setEditingAddress(null);
      setNewAddress({
        label: "home",
        phone: "",
        addressLine1: "",
        city: "",
        state: "",
        postalCode: "",
      });
      setErrors({});
    } catch (error) {
      console.error("❌ Add/Update address error:", error);
      toast.error(error.response?.data?.message || "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (addr) => {
    setEditingAddress(addr);
    setNewAddress({
      label: addr.label || "home",
      phone: addr.phone || "",
      addressLine1: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.zip || "",
    });
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    setLoading(true);
    try {
      await addressAPI.delete(addressId);
      setAddresses(addresses.filter((a) => a._id !== addressId));
      if (selectedAddress === addressId) {
        setSelectedAddress(null);
      }
      toast.success("Address deleted successfully");
    } catch (error) {
      console.error("❌ Delete address error:", error);
      toast.error("Failed to delete address");
    } finally {
      setLoading(false);
    }
  };

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
        
        toast.success("Order placed successfully!");
        
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

  // Loading state
  if (cartLoading && !orderPlaced) {
    return (
      <div className="min-h-screen dark:bg-gray-900 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="dark:text-gray-400 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Order success state - SHOWS FOR 3 SECONDS
  if (orderPlaced && placedOrder) {
    return (
      <div className="min-h-screen dark:bg-gray-900 bg-gray-50 flex items-center justify-center p-4">
        <div className="dark:bg-gray-800 bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center animate-fadeIn">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
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
              <span className="dark:text-gray-400 text-gray-600">Order Total</span>
              <span className="font-bold text-lg dark:text-gray-100 text-gray-900">
                {formatPrice(placedOrder.total)}
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
              onClick={() => navigate("/orders")}
              className="w-full px-6 py-3.5 rounded-xl font-semibold bg-green-600 hover:bg-green-700 text-white shadow-lg transition-colors"
            >
              View Order Now
            </button>
            <button
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
          <p className="dark:text-gray-400 text-gray-600">Complete your purchase</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address Section */}
            <div className="dark:bg-gray-800 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <MapPin className="text-green-600 dark:text-green-400" size={24} />
                  <h2 className="text-xl font-bold dark:text-gray-100 text-gray-900">
                    Shipping Address
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setEditingAddress(null);
                    setNewAddress({
                      label: "home",
                      phone: "",
                      addressLine1: "",
                      city: "",
                      state: "",
                      postalCode: "",
                    });
                    setShowAddressForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 font-semibold"
                >
                  <Plus size={20} />
                  Add New
                </button>
              </div>

              {addresses.length === 0 && !showAddressForm ? (
                <div className="text-center py-8">
                  <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="dark:text-gray-400 text-gray-600 mb-4">No addresses saved</p>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add Address
                  </button>
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
                        <div className="flex-1" onClick={() => setSelectedAddress(addr._id)}>
                          <p className="font-semibold dark:text-gray-100 text-gray-900">
                            {addr.label?.toUpperCase() || "ADDRESS"}
                          </p>
                          <p className="dark:text-gray-400 text-gray-600">{addr.street}</p>
                          <p className="dark:text-gray-400 text-gray-600">
                            {addr.city}, {addr.state} {addr.zip}
                          </p>
                          <p className="dark:text-gray-400 text-gray-600">{addr.phone}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedAddress === addr._id && (
                            <Check className="text-green-600 dark:text-green-400" size={24} />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(addr);
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <Edit className="text-blue-600 dark:text-blue-400" size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(addr._id);
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <Trash2 className="text-red-600 dark:text-red-400" size={18} />
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
                      <option value="office">Office</option>
                      <option value="other">Other</option>
                    </select>

                    <input
                      type="text"
                      name="phone"
                      placeholder="Phone Number"
                      value={newAddress.phone}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    {errors.phone && <p className="text-red-600 dark:text-red-400 text-sm">{errors.phone}</p>}

                    <input
                      type="text"
                      name="addressLine1"
                      placeholder="Street Address"
                      value={newAddress.addressLine1}
                      onChange={handleAddressChange}
                      className="w-full px-4 py-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    {errors.addressLine1 && <p className="text-red-600 dark:text-red-400 text-sm">{errors.addressLine1}</p>}

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
                        {errors.city && <p className="text-red-600 dark:text-red-400 text-sm">{errors.city}</p>}
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
                    {errors.postalCode && <p className="text-red-600 dark:text-red-400 text-sm">{errors.postalCode}</p>}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400"
                    >
                      {loading ? "Saving..." : editingAddress ? "Update Address" : "Add Address"}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="dark:bg-gray-800 bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="text-green-600 dark:text-green-400" size={24} />
                <h2 className="text-xl font-bold dark:text-gray-100 text-gray-900">Payment Method</h2>
              </div>

              <div className="space-y-3">
                {[
                  { value: "cod", icon: Truck, label: "Cash on Delivery", desc: "Pay when you receive" },
                  { value: "esewa", icon: Wallet, label: "eSewa", desc: "Digital payment" },
                  { value: "khalti", icon: CreditCard, label: "Khalti", desc: "Digital wallet" }
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
                        <Icon className="dark:text-gray-400 text-gray-600" size={24} />
                        <div>
                          <p className="font-semibold dark:text-gray-100 text-gray-900">{label}</p>
                          <p className="text-sm dark:text-gray-400 text-gray-600">{desc}</p>
                        </div>
                      </div>
                      {paymentMethod === value && (
                        <Check className="text-green-600 dark:text-green-400" size={24} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="dark:bg-gray-800 bg-white rounded-xl shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4 dark:text-gray-100 text-gray-900">Order Summary</h2>

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
                      <p className="text-sm dark:text-gray-400 text-gray-600">Qty: {item.quantity}</p>
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
                <div className="flex justify-between dark:text-gray-400 text-gray-600">
                  <span>Tax (13%)</span>
                  <span>{formatPrice(cart?.tax)}</span>
                </div>
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