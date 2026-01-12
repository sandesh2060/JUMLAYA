// ============================================
// Frontend/src/rider/pages/RiderProfile.jsx
// ✅ WITH ENHANCED IMAGE THUMBNAILS
// ============================================
import { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Edit2, Save, X, Camera, Upload, FileText, Trash2, Eye, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import riderAPI from '../../api/rider.api';

const RiderProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const avatarInputRef = useRef(null);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    alternatePhone: '',
    vehicleType: '',
    vehicleNumber: '',
    vehicleBrand: '',
    vehicleModel: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchDocuments();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await riderAPI.getProfile();
      const riderData = response.data;
      setProfile(riderData);
      setFormData({
        phoneNumber: riderData?.phoneNumber || '',
        alternatePhone: riderData?.alternatePhone || '',
        vehicleType: riderData?.vehicleType || 'bike',
        vehicleNumber: riderData?.vehicleNumber || '',
        vehicleBrand: riderData?.vehicleBrand || '',
        vehicleModel: riderData?.vehicleModel || ''
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await riderAPI.getDocuments();
      setDocuments(response.data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    try {
      setUploading(true);
      const response = await riderAPI.uploadAvatar(file);
      toast.success('Avatar uploaded successfully!');
      await fetchProfile();
      await fetchDocuments();
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentUpload = async (e, documentType) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      await riderAPI.uploadDocument(file, documentType);
      toast.success(`${documentType} uploaded successfully!`);
      await fetchDocuments();
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentType) => {
    if (!confirm(`Are you sure you want to delete this ${documentType}?`)) return;

    try {
      await riderAPI.deleteDocument(documentType);
      toast.success('Document deleted successfully');
      await fetchDocuments();
      if (documentType === 'profilePhoto') {
        await fetchProfile();
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await riderAPI.updateProfile(formData);
      toast.success('Profile updated successfully!');
      setEditing(false);
      await fetchProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const avatarUrl = documents?.profilePhoto?.url || user?.avatar;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar with Upload */}
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-green-600 text-3xl font-bold overflow-hidden border-4 border-white/30">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user?.name?.charAt(0) || 'R'
                    )}
                  </div>
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 bg-white text-green-600 p-2 rounded-full shadow-lg hover:bg-green-50 transition disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                <div>
                  <h1 className="text-2xl font-bold">
                    {user?.name || 'Rider'}
                  </h1>
                  <p className="text-green-100">Delivery Rider • {profile?.riderCode}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      profile?.verification?.isVerified 
                        ? 'bg-green-500/20 text-white' 
                        : 'bg-yellow-500/20 text-yellow-100'
                    }`}>
                      {profile?.verification?.isVerified ? '✓ Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>
              </div>

              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-6">
            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Alternate Phone
                    </label>
                    <input
                      type="tel"
                      name="alternatePhone"
                      value={formData.alternatePhone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vehicle Type *
                    </label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="bike">Bike</option>
                      <option value="scooter">Scooter</option>
                      <option value="bicycle">Bicycle</option>
                      <option value="car">Car</option>
                      <option value="van">Van</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vehicle Number
                    </label>
                    <input
                      type="text"
                      name="vehicleNumber"
                      value={formData.vehicleNumber}
                      onChange={handleChange}
                      placeholder="BA-1-PA-1234"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vehicle Brand
                    </label>
                    <input
                      type="text"
                      name="vehicleBrand"
                      value={formData.vehicleBrand}
                      onChange={handleChange}
                      placeholder="Honda, Yamaha, etc."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Vehicle Model
                    </label>
                    <input
                      type="text"
                      name="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={handleChange}
                      placeholder="Splendor, FZ, etc."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      fetchProfile();
                    }}
                    className="flex items-center gap-2 px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                <InfoCard icon={Mail} label="Email" value={user?.email} />
                <InfoCard icon={Phone} label="Phone" value={profile?.phoneNumber || 'Not set'} />
                <InfoCard icon={MapPin} label="Vehicle" value={profile?.vehicleType || 'Not set'} />
              </div>
            )}
          </div>
        </div>

        {/* Documents Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Documents & Verification
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <DocumentUpload
              label="Driving License"
              documentType="license"
              document={documents?.license}
              onUpload={(e) => handleDocumentUpload(e, 'license')}
              onDelete={() => handleDeleteDocument('license')}
              uploading={uploading}
            />
            <DocumentUpload
              label="Vehicle Registration"
              documentType="vehicleRegistration"
              document={documents?.vehicleRegistration}
              onUpload={(e) => handleDocumentUpload(e, 'vehicleRegistration')}
              onDelete={() => handleDeleteDocument('vehicleRegistration')}
              uploading={uploading}
            />
            <DocumentUpload
              label="Insurance"
              documentType="insurance"
              document={documents?.insurance}
              onUpload={(e) => handleDocumentUpload(e, 'insurance')}
              onDelete={() => handleDeleteDocument('insurance')}
              uploading={uploading}
            />
            <DocumentUpload
              label="Identity Proof"
              documentType="identityProof"
              document={documents?.identityProof}
              onUpload={(e) => handleDocumentUpload(e, 'identityProof')}
              onDelete={() => handleDeleteDocument('identityProof')}
              uploading={uploading}
            />
          </div>
        </div>

        {/* Stats Card */}
        {profile?.stats && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Performance Stats
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Completed" value={profile.stats.completedDeliveries || 0} color="green" />
              <StatCard label="Rating" value={(profile.rating?.average || 0).toFixed(1)} color="blue" />
              <StatCard label="Acceptance" value={`${profile.stats.acceptanceRate || 0}%`} color="purple" />
              <StatCard label="On-Time" value={`${profile.stats.onTimeDeliveryRate || 0}%`} color="yellow" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components
const InfoCard = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
    <Icon className="w-5 h-5 text-gray-400" />
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const DocumentUpload = ({ label, documentType, document, onUpload, onDelete, uploading }) => {
  const inputRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);
  const isVerified = document?.verified;
  const hasDocument = document?.url;

  return (
    <>
      <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-green-300 dark:hover:border-green-700 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-400" />
            {label}
          </h3>
          {isVerified && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full font-medium">
              <Check className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        {hasDocument ? (
          <div className="space-y-3">
            {/* 🎨 ENHANCED THUMBNAIL PREVIEW */}
            <div 
              className="relative w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all"
              onClick={() => setShowPreview(true)}
            >
              <img 
                src={document.url} 
                alt={label}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <span className="text-white text-xs font-medium flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Click to view
                  </span>
                  {isVerified && (
                    <span className="text-green-400 text-xs flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
              </div>
              {/* Verified Badge Overlay */}
              {isVerified && (
                <div className="absolute top-2 right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>

            {/* Upload Info */}
            {document.uploadedAt && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Uploaded {new Date(document.uploadedAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                Replace
              </button>
              <button
                onClick={onDelete}
                disabled={uploading}
                className="px-4 py-2.5 text-sm font-medium bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 active:bg-red-200 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          // Empty State
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full flex flex-col items-center justify-center gap-3 px-4 py-10 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-green-500 hover:text-green-600 hover:bg-green-50/50 dark:hover:border-green-500 dark:hover:text-green-400 dark:hover:bg-green-900/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/20 transition-colors">
              <Upload className="w-8 h-8 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">
                Upload {label}
              </p>
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                Click to browse • Max 5MB
              </p>
            </div>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onUpload}
          className="hidden"
        />
      </div>

      {/* 🖼️ FULLSCREEN IMAGE PREVIEW MODAL */}
      {showPreview && hasDocument && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full">
            {/* Close Button */}
            <button
              onClick={() => setShowPreview(false)}
              className="absolute -top-14 right-0 text-white hover:text-gray-300 transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-lg backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Image */}
            <img 
              src={document.url} 
              alt={label}
              className="w-full h-full object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent text-white p-6 rounded-b-xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-xl mb-1">{label}</h3>
                  <p className="text-sm text-gray-300">
                    Uploaded on {new Date(document.uploadedAt).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {isVerified && (
                  <span className="flex items-center gap-2 px-3 py-1.5 bg-green-500/30 backdrop-blur-sm text-green-300 rounded-lg text-sm font-medium border border-green-400/30">
                    <Check className="w-4 h-4" />
                    Verified Document
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const StatCard = ({ label, value, color }) => {
  const colors = {
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  };

  return (
    <div className={`text-center p-4 rounded-lg ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm opacity-75">{label}</p>
    </div>
  );
};

export default RiderProfile;