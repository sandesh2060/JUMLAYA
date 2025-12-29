// Frontend/src/pages/ProfileSettings.jsx - MODERN UI WITH ANIMATIONS
import { useState, useEffect } from "react";
import {
  User,
  Lock,
  MapPin,
  Camera,
  Save,
  Trash2,
  Plus,
  Edit2,
  CheckCircle,
  Settings,
  Globe,
  Moon,
  Sun,
  Mail,
  Phone,
  X,
} from "lucide-react";
import { useAuth } from "@hooks/useAuth";
import { useLanguage } from "@hooks/useLanguage";
import { useTheme } from "@hooks/useTheme";
import { userAPI } from "@api/user.api";
import { addressAPI } from "@api/address.api";
import toast from "react-hot-toast";

const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4001/api";
  const baseUrl = apiUrl.replace("/api", "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${cleanPath}`;
};

export default function ProfileSettings() {
  const { user: authUser, updateUser } = useAuth();
const { currentLanguage, changeLanguage, t, languages } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  

  const [profileForm, setProfileForm] = useState({
    firstname: "",
    lastname: "",
    phone: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [addresses, setAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: "home",
    fullName:
      authUser?.firstname && authUser?.lastname
        ? `${authUser.firstname} ${authUser.lastname}`
        : "",
    addressLine1: "",
    city: "",
    state: "",
    zip: "",
    country: "Nepal",
    phone: authUser?.phone || "",
    isDefault: false,
  });
  const [confirmBox, setConfirmBox] = useState({
    open: false,
    message: "",
    onConfirm: null,
  });
  const openConfirmBox = (message, onConfirm) => {
    setConfirmBox({
      open: true,
      message,
      onConfirm,
    });
  };

  useEffect(() => {
    fetchProfile();
  }, []);
  const fetchProfile = async () => {
    try {
      setLoading(true);

      console.log("📡 Fetching user profile...");

      const data = await userAPI.getProfile();
      const userData = data.data || data;

      console.log("✅ Profile data:", userData);

      setProfileForm({
        firstname: userData.firstname || "",
        lastname: userData.lastname || "",
        phone: userData.phone || "",
      });

      const avatarUrl = getImageUrl(userData.avatar);
      setAvatarPreview(avatarUrl);

      // Filter out inactive addresses on the frontend as a safety measure
      const activeAddresses = (userData.addresses || []).filter(
        (addr) => addr.isActive !== false
      );

      console.log("📍 Active addresses:", activeAddresses.length);
      setAddresses(activeAddresses);
    } catch (error) {
      console.error("❌ Failed to fetch profile:", error);
      toast.error(error.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setUpdating(true);

      const formData = new FormData();
      formData.append("firstname", profileForm.firstname);
      formData.append("lastname", profileForm.lastname);
      formData.append("phone", profileForm.phone);

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const data = await userAPI.updateProfile(formData);
      const userData = data.data || data;

      if (userData.avatar) {
        userData.avatar = getImageUrl(userData.avatar);
      }

      updateUser(userData);
      setAvatarPreview(userData.avatar || null);

      toast.success(t("Update Success") || "Profile updated successfully!");
      setAvatarFile(null);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t("Password Mismatch") || "Passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error(
        t("Password Length") || "Password must be at least 8 characters"
      );
      return;
    }

    openConfirmBox(
      t("Password Confirm") || "Are you sure you want to change your password?",
      async () => {
        try {
          setUpdating(true);

          await userAPI.changePassword({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword,
          });

          toast.success(
            t("Password Success") || "Password changed successfully!"
          );
          setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        } catch (error) {
          console.error("Failed to change password:", error);
          toast.error(
            error.response?.data?.message || "Failed to change password"
          );
        } finally {
          setUpdating(false);
        }
      }
    );
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      label: "home",
      fullName:
        authUser?.firstname && authUser?.lastname
          ? `${authUser.firstname} ${authUser.lastname}`
          : "",
      addressLine1: "",
      city: "",
      state: "",
      zip: "",
      country: "Nepal",
      phone: authUser?.phone || "",
      isDefault: false,
    });
    setShowAddressModal(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressForm({
      label: address.label || "home",
      fullName: address.fullName || "",
      addressLine1: address.addressLine1 || "",
      city: address.city || "",
      state: address.state || "",
      zip: address.zip || "",
      country: address.country || "Nepal",
      phone: address.phone || "",
      isDefault: address.isDefault || false,
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async () => {
    try {
      setUpdating(true);

      if (editingAddress) {
        await addressAPI.update(editingAddress._id, addressForm);
        toast.success(t("Address Updated") || "Address updated!");
      } else {
        await addressAPI.create(addressForm);
        toast.success(t("Address Added") || "Address added!");
      }

      await fetchProfile();
      setShowAddressModal(false);
    } catch (error) {
      console.error("Failed to save address:", error);
      toast.error(error.response?.data?.message || "Failed to save address");
    } finally {
      setUpdating(false);
    }
  };

  // ==========================================
  // COMPLETE FIX: Replace these functions in ProfileSettings.jsx
  // ==========================================

  // ✅ Enhanced handleDeleteAddress with optimistic UI update
  const handleDeleteAddress = (id) => {
    openConfirmBox(
      t("profile.deleteConfirm") ||
        "Are you sure you want to delete this address?",
      async () => {
        // Store original addresses for potential rollback
        const originalAddresses = [...addresses];

        try {
          console.log("🗑️ Attempting to delete address:", id);

          // ✅ OPTIMISTIC UPDATE: Remove from UI immediately for better UX
          setAddresses((prevAddresses) =>
            prevAddresses.filter((addr) => addr._id !== id)
          );

          // Show loading toast
          const loadingToast = toast.loading("Deleting address...");

          // Attempt deletion
          const response = await addressAPI.delete(id);

          console.log("✅ Delete response:", response);

          // Dismiss loading toast
          toast.dismiss(loadingToast);

          // Show success message
          toast.success(
            t("profile.addressDeleted") || "Address deleted successfully!"
          );

          // Refresh profile in background to sync with server
          fetchProfile();
        } catch (error) {
          console.error("❌ Failed to delete address:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          });

          // Check if it's a "not found" error (already deleted)
          if (error.response?.status === 404) {
            // Address already deleted - treat as success
            console.log("✅ Address already deleted on server");
            toast.success(
              t("profile.addressDeleted") || "Address removed successfully!"
            );
            fetchProfile();
          } else {
            // Real error - rollback the optimistic update
            console.log("❌ Real error occurred, rolling back UI");
            setAddresses(originalAddresses);

            const errorMessage =
              error.response?.data?.message ||
              error.message ||
              "Failed to delete address";

            toast.error(errorMessage);
          }
        }
      }
    );
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await addressAPI.update(id, { isDefault: true });
      toast.success(t("profile.defaultUpdated") || "Default address updated!");
      await fetchProfile();
    } catch (error) {
      console.error("Failed to set default:", error);
      toast.error("Failed to set default address");
    }
  };

  const handleLanguageChange = (lang) => {
    openConfirmBox(
      t("profile.confirmChange") || "Are you sure you want to change language?",
      () => {
        changeLanguage(lang);
        toast.success(
          t("profile.languageChanged") || "Language changed successfully!"
        );
      }
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-green-200 dark:border-green-900 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-green-600 dark:border-green-400 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">
            {t("loading", "Loading profile...")}
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: "profile",
      label: t("My Profile") || "Profile",
      icon: User,
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "password",
      label: t("Profile Security") || "Security",
      icon: Lock,
      color: "from-purple-500 to-purple-600",
    },
    {
      id: "addresses",
      label: t("Profile Addresses") || "Addresses",
      icon: MapPin,
      color: "from-green-500 to-green-600",
    },
    {
      id: "settings",
      label: t("Profile Settings") || "Settings",
      icon: Settings,
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
      {/* Language Toggle */}
      <div className="flex justify-end mb-4">
        <select
       value={currentLanguage}
          onChange={(e) => changeLanguage(e.target.value)}
          className="border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:text-white"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header with gradient */}
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
          <div className="relative flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
              <User className="text-white" size={40} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                {t("My Profile") || "My Profile"}
              </h1>
              <p className="text-green-100 text-lg">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Modern Tabs */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-2 backdrop-blur-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <div className="flex items-center justify-center gap-3">
                  <tab.icon
                    size={20}
                    className={activeTab === tab.id ? "animate-pulse" : ""}
                  />
                  <span className="hidden md:inline">{tab.label}</span>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="max-w-3xl mx-auto animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden transform hover:shadow-3xl transition-shadow duration-300">
              {/* Avatar Section with Gradient */}
              <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 p-8">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full bg-white p-2 shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                      <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size={48} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    <label className="absolute bottom-2 right-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-3 rounded-full cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 group">
                      <Camera size={18} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-3xl font-bold text-white mb-2">
                      {authUser?.firstname} {authUser?.lastname}
                    </h3>
                    <div className="flex items-center gap-2 text-green-100 text-lg">
                      <Mail size={18} />
                      <p>{authUser?.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {t("profile.firstName") || "First Name"}
                    </label>
                    <input
                      type="text"
                      value={profileForm.firstname}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          firstname: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-green-200 dark:focus:ring-green-900 focus:border-green-500 dark:focus:border-green-400 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {t("profile.lastName") || "Last Name"}
                    </label>
                    <input
                      type="text"
                      value={profileForm.lastname}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          lastname: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-green-200 dark:focus:ring-green-900 focus:border-green-500 dark:focus:border-green-400 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors flex items-center gap-2">
                    <Phone size={16} />
                    {t("profile.phone") || "Phone"}
                  </label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, phone: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-green-200 dark:focus:ring-green-900 focus:border-green-500 dark:focus:border-green-400 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Mail size={16} />
                    {t("profile.email") || "Email"}{" "}
                    <span className="text-xs text-gray-500">
                      ({t("profile.readOnly") || "Read-only"})
                    </span>
                  </label>
                  <input
                    type="email"
                    value={authUser?.email}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-600 cursor-not-allowed text-gray-600 dark:text-gray-400"
                  />
                </div>

                <button
                  onClick={handleProfileUpdate}
                  disabled={updating}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 transform hover:scale-[1.02] transition-all duration-300 disabled:transform-none"
                >
                  <Save size={20} />
                  {updating ? (
                    <>
                      <span className="animate-pulse">
                        {t("common.saving") || "Saving..."}
                      </span>
                    </>
                  ) : (
                    t("Update") || "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="max-w-2xl mx-auto animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 transform hover:shadow-3xl transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Lock className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Security Settings
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Keep your account secure
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {["currentPassword", "newPassword", "confirmPassword"].map(
                  (field, idx) => (
                    <div
                      key={field}
                      className="group"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {field === "currentPassword"
                          ? t("currentPassword") || "Current Password"
                          : field === "newPassword"
                          ? t("newPassword") || "New Password"
                          : t("confirmPassword") || "Confirm New Password"}
                      </label>
                      <input
                        type="password"
                        value={passwordForm[field]}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            [field]: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-purple-200 dark:focus:ring-purple-900 focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      {field === "newPassword" && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          {t("profile.passwordHint") ||
                            "Must be at least 8 characters"}
                        </p>
                      )}
                    </div>
                  )
                )}

                <button
                  onClick={handlePasswordChange}
                  disabled={updating}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 transform hover:scale-[1.02] transition-all duration-300"
                >
                  <Lock size={20} />
                  {updating
                    ? t("common.loading") || "Changing..."
                    : t("profile.changePassword") || "Change Password"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Addresses Tab */}
        {activeTab === "addresses" && (
          <div className="animate-fadeIn space-y-6">
            <button
              onClick={handleAddAddress}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl flex items-center gap-3 transform hover:scale-105 transition-all duration-300"
            >
              <Plus size={20} />
              {t("Add Address") || "Add New Address"}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {addresses.map((address, idx) => (
                <div
                  key={address._id}
                  style={{ animationDelay: `${idx * 100}ms` }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl p-6 relative transform hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-green-500 dark:hover:border-green-400 animate-slideUp"
                >
                  {address.isDefault && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-4 py-2 rounded-full flex items-center gap-2 shadow-lg animate-bounce">
                      <CheckCircle size={14} />
                      {t("profile.default") || "Default"}
                    </div>
                  )}

                  <div className="mb-6">
                    <span className="inline-block bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-sm font-semibold capitalize mb-3 shadow-sm">
                      <MapPin size={14} className="inline mr-1" />
                      {address.label}
                    </span>
                    <p className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                      {address.street}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {address.city}, {address.state} {address.zip}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {address.country}
                    </p>
                    {address.phone && (
                      <div className="mt-3 flex items-center gap-2 text-green-600 dark:text-green-400">
                        <Phone size={16} />
                        <p className="font-medium">{address.phone}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleEditAddress(address)}
                      className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 flex items-center justify-center gap-2 text-gray-900 dark:text-white font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      <Edit2 size={16} />
                      {t("common.edit") || "Edit"}
                    </button>

                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefaultAddress(address._id)}
                        className="flex-1 px-4 py-2.5 border-2 border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300 transform hover:scale-105"
                      >
                        <CheckCircle size={16} />
                        {t("profile.setDefault") || "Set Default"}
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteAddress(address._id)}
                      className="px-4 py-2.5 border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-600 transition-all duration-300 transform hover:scale-105"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {addresses.length === 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-16 text-center animate-fadeIn">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 rounded-full flex items-center justify-center animate-pulse">
                  <MapPin
                    size={48}
                    className="text-green-600 dark:text-green-400"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {t("profile.noAddresses") || "No addresses saved yet."}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t("profile.addFirstAddress") ||
                    "Add your first address to get started!"}
                </p>
                <button
                  onClick={handleAddAddress}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Plus size={20} /> <Plus size={20} />
                  {t("profile.addFirstAddress") || "Add Address"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
            {/* Language Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe
                  className="text-green-600 dark:text-green-400"
                  size={24}
                />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t("profile.languageSettings") || "Language Settings"}
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  { code: "en", label: "English", flag: "🇬🇧" },
                  { code: "ne", label: "नेपाली", flag: "🇳🇵" },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                      currentLanguage === lang.code
                        ? "border-green-600 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{lang.flag}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {lang.label}
                      </span>
                    </div>
                    {currentLanguage === lang.code && (
                      <CheckCircle className="text-green-600 dark:text-green-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                {theme === "dark" ? (
                  <Moon
                    className="text-green-600 dark:text-green-400"
                    size={24}
                  />
                ) : (
                  <Sun
                    className="text-green-600 dark:text-green-400"
                    size={24}
                  />
                )}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t("profile.themeSettings") || "Theme Settings"}
                </h3>
              </div>

              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-600 transition-all"
              >
                <span className="font-semibold text-gray-900 dark:text-white">
                  {theme === "dark"
                    ? t("profile.darkMode") || "Dark Mode"
                    : t("profile.lightMode") || "Light Mode"}
                </span>
                <span className="bg-green-600 text-white px-4 py-2 rounded-lg">
                  {t("profile.toggle") || "Toggle"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Address Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingAddress
                    ? t("Edit Address") || "Edit Address"
                    : t("Add NewAddress") || "Add Address"}
                </h3>
                <button onClick={() => setShowAddressModal(false)}>
                  <X />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  placeholder="FULL NAME"
                  value={addressForm.fullName}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, fullName: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                />
                <input
                  placeholder="ADDRESS LINE 1"
                  value={addressForm.addressLine1}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      addressLine1: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                />
                <input
                  placeholder="CITY"
                  value={addressForm.city}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, city: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                />
                <input
                  placeholder="STATE"
                  value={addressForm.state}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, state: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                />
                <input
                  placeholder="ZIP"
                  value={addressForm.zip}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, zip: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                />
                <input
                  placeholder="COUNTRY"
                  value={addressForm.country}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, country: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                />
                <input
                  placeholder="PHONE"
                  value={addressForm.phone}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700"
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={addressForm.isDefault}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        isDefault: e.target.checked,
                      })
                    }
                  />
                  {t("Set As Default") || "Set as default"}
                </label>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddressModal(false)}
                    className="flex-1 border rounded-lg py-2"
                  >
                    {t("Cancel") || "Cancel"}
                  </button>
                  <button
                    onClick={handleSaveAddress}
                    disabled={updating}
                    className="flex-1 bg-green-600 text-white rounded-lg py-2"
                  >
                    {updating ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* ================= CONFIRMATION MODAL ================= */}
      {confirmBox.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-sm p-6 shadow-xl animate-scaleIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Confirm Action
              </h3>
              <button
                onClick={() => setConfirmBox({ open: false })}
                className="text-zinc-400 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-300 mb-6">
              {confirmBox.message}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmBox({ open: false })}
                className="px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {t("cancel", "Cancel")}
              </button>

              <button
                onClick={() => {
                  confirmBox.onConfirm?.();
                  setConfirmBox({ open: false });
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700"
              >
                {t("confirm", "Yes, Continue")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
