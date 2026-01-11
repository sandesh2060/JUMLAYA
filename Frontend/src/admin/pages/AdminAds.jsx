import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  TrendingUp,
  Calendar,
  Image,
  Percent,
  Tag,
  Link,
  Clock,
  BarChart3,
  Search,
  Filter,
  X,
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { adsAPI } from "@/api/ads.api";

const AdminAds = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [notification, setNotification] = useState(null);

const [formData, setFormData] = useState({
  title: "",
  description: "",
  type: "promotion",
  posterImage: "",
  discount: 0,
  couponCode: "",
  buttonText: "Shop Now",
  buttonLink: "/products",
  displayDuration: 5,
  isActive: true,
  validFrom: "", // ✅ ADD
  validUntil: "", // ✅ ADD
});

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await adsAPI.getAllAds();
      if (response.success) {
        setAds(response.data.ads || []);
      }
    } catch (error) {
      console.error("Failed to fetch ads:", error);
      showNotification("Failed to load ads", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.posterImage;

    try {
      setUploadingImage(true);
      const response = await adsAPI.uploadAdImage(imageFile);
      if (response.success) {
        return response.data.url;
      }
      return formData.posterImage;
    } catch (error) {
      console.error("Failed to upload image:", error);
      showNotification("Failed to upload image", "error");
      return formData.posterImage;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        showNotification("Title is required", "error");
        return;
      }
      if (!formData.description.trim()) {
        showNotification("Description is required", "error");
        return;
      }

      // Upload image if new file selected
      let imageUrl = formData.posterImage;
      if (imageFile) {
        imageUrl = await uploadImage();
        if (!imageUrl) {
          showNotification("Image upload failed", "error");
          return;
        }
      }

      if (!imageUrl) {
        showNotification("Poster image is required", "error");
        return;
      }

      // ✅ ADD: Calculate dates (30 days from now by default)
      const now = new Date();
      const validFrom = formData.validFrom || now.toISOString();
      const validUntil =
        formData.validUntil ||
        new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const adData = {
        ...formData,
        posterImage: imageUrl,
        validFrom, // ✅ ADD
        validUntil, // ✅ ADD
      };

      let response;
      if (editingAd) {
        response = await adsAPI.updateAd(editingAd._id, adData);
      } else {
        response = await adsAPI.createAd(adData);
      }

      if (response.success) {
        showNotification(
          `Ad ${editingAd ? "updated" : "created"} successfully!`,
          "success"
        );
        fetchAds();
        closeModal();
      }
    } catch (error) {
      console.error("Failed to save ad:", error);
      showNotification(
        error.response?.data?.message ||
          `Failed to ${editingAd ? "update" : "create"} ad`,
        "error"
      );
    }
  };
 const handleEdit = (ad) => {
  setEditingAd(ad);
  setFormData({
    title: ad.title,
    description: ad.description,
    type: ad.type,
    posterImage: ad.posterImage,
    discount: ad.discount || 0,
    couponCode: ad.couponCode || "",
    buttonText: ad.buttonText || "Shop Now",
    buttonLink: ad.buttonLink || "/products",
    displayDuration: ad.displayDuration || 5,
    isActive: ad.isActive,
    // ✅ ADD: Convert dates to datetime-local format
    validFrom: ad.validFrom ? new Date(ad.validFrom).toISOString().slice(0, 16) : "",
    validUntil: ad.validUntil ? new Date(ad.validUntil).toISOString().slice(0, 16) : "",
  });
  setImagePreview(ad.posterImage);
  setShowModal(true);
};
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ad?")) return;

    try {
      const response = await adsAPI.deleteAd(id);
      if (response.success) {
        showNotification("Ad deleted successfully!", "success");
        fetchAds();
      }
    } catch (error) {
      console.error("Failed to delete ad:", error);
      showNotification("Failed to delete ad", "error");
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await adsAPI.toggleAdStatus(id);
      if (response.success) {
        showNotification("Ad status updated!", "success");
        fetchAds();
      }
    } catch (error) {
      console.error("Failed to toggle status:", error);
      showNotification("Failed to update status", "error");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAd(null);
    setFormData({
      title: "",
      description: "",
      type: "promotion",
      posterImage: "",
      discount: 0,
      couponCode: "",
      buttonText: "Shop Now",
      buttonLink: "/products",
      displayDuration: 5,
      isActive: true,
    });
    setImageFile(null);
    setImagePreview("");
  };

  const filteredAds = ads.filter((ad) => {
    const matchesSearch =
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || ad.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type) => {
    const colors = {
      festival: "bg-purple-100 text-purple-700",
      discount: "bg-red-100 text-red-700",
      offer: "bg-orange-100 text-orange-700",
      promotion: "bg-green-100 text-green-700",
    };
    return colors[type] || colors.promotion;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Landing Page Ads
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage promotional popup ads for your landing page
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Ad
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search ads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === "all"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType("promotion")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === "promotion"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              Promotion
            </button>
            <button
              onClick={() => setFilterType("discount")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === "discount"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              Discount
            </button>
            <button
              onClick={() => setFilterType("offer")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === "offer"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}
            >
              Offer
            </button>
          </div>
        </div>
      </div>

      {/* Ads Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading ads...
          </p>
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No ads found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first ad to get started
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            Create Ad
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAds.map((ad) => (
            <div
              key={ad._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                {ad.posterImage ? (
                  <img
                    src={ad.posterImage}
                    alt={ad.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Image className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                {ad.discount > 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full font-bold">
                    {ad.discount}% OFF
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(
                      ad.type
                    )}`}
                  >
                    {ad.type}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                  {ad.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {ad.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {ad.impressions || 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    {ad.clicks || 0} clicks
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {ad.displayDuration}s
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleToggleStatus(ad._id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      ad.isActive
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {ad.isActive ? (
                      <>
                        <Eye className="w-4 h-4" />
                        Active
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" />
                        Inactive
                      </>
                    )}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(ad)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(ad._id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingAd ? "Edit Ad" : "Create New Ad"}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Summer Sale 2024"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Get amazing discounts on fresh organic products"
                />
              </div>

              {/* Type and Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="promotion">Promotion</option>
                    <option value="discount">Discount</option>
                    <option value="offer">Offer</option>
                    <option value="festival">Festival</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Discount %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Poster Image
                </label>
                <div className="space-y-2">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {/* Coupon Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  value={formData.couponCode}
                  onChange={(e) =>
                    setFormData({ ...formData, couponCode: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  placeholder="SUMMER50"
                />
              </div>

              {/* Button Text and Link */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) =>
                      setFormData({ ...formData, buttonText: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Button Link
                  </label>
                  <input
                    type="text"
                    value={formData.buttonLink}
                    onChange={(e) =>
                      setFormData({ ...formData, buttonLink: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    placeholder="/products or https://..."
                  />
                </div>
              </div>

              {/* Display Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Display Duration (seconds)
                </label>
                <input
                  type="number"
                  min="3"
                  max="30"
                  value={formData.displayDuration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      displayDuration: parseInt(e.target.value) || 5,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              {/* Add this AFTER the Display Duration field and BEFORE the Active Status checkbox */}

              {/* Valid From Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valid From *
                </label>
                <input
                  type="datetime-local"
                  value={formData.validFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, validFrom: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>

              {/* Valid Until Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Valid Until *
                </label>
                <input
                  type="datetime-local"
                  value={formData.validUntil}
                  onChange={(e) =>
                    setFormData({ ...formData, validUntil: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Active (show on landing page)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={uploadingImage}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingImage
                    ? "Uploading..."
                    : editingAd
                    ? "Update Ad"
                    : "Create Ad"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAds;
