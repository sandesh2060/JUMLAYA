// ============================================================================
// FILE: Frontend/src/admin/pages/AdminAds.jsx
// Admin page for managing landing page popup ads
// ============================================================================

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { adsAPI } from '@/api/ads.api';
import { Button } from '@/components/common/Button';
import AdsList from '@/admin/components/ads/AdsList';
import AdsForm from '@/admin/components/ads/AdsForm';
import AdPreview from '@/admin/components/ads/AdPreview';
import toast from 'react-hot-toast';

const AdminAds = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

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
      console.error('Failed to fetch ads:', error);
      toast.error('Failed to load ads');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedAd(null);
    setIsFormOpen(true);
  };

  const handleEdit = (ad) => {
    setSelectedAd(ad);
    setIsFormOpen(true);
    setIsPreviewOpen(false);
  };

  const handleView = (ad) => {
    setSelectedAd(ad);
    setIsPreviewOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ad?')) {
      return;
    }

    try {
      const response = await adsAPI.deleteAd(id);
      if (response.success) {
        toast.success('Ad deleted successfully');
        fetchAds();
      }
    } catch (error) {
      console.error('Failed to delete ad:', error);
      toast.error('Failed to delete ad');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await adsAPI.toggleAdStatus(id);
      if (response.success) {
        toast.success(
          response.data.isActive 
            ? 'Ad activated successfully' 
            : 'Ad deactivated successfully'
        );
        fetchAds();
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedAd(null);
    fetchAds();
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedAd(null);
  };

  const handlePreviewClose = () => {
    setIsPreviewOpen(false);
    setSelectedAd(null);
  };

  // Filter ads
  const filteredAds = ads.filter((ad) => {
    const matchesSearch = ad.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || ad.type === filterType;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && ad.isActive) ||
      (filterStatus === 'inactive' && !ad.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Landing Page Ads
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage popup ads for your landing page
          </p>
        </div>
        <Button 
          onClick={handleCreateNew} 
          className="flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          Create New Ad
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {ads.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Ads
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600">
            {ads.filter((ad) => ad.isActive).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Active Ads
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-blue-600">
            {ads.reduce((sum, ad) => sum + (ad.impressionCount || 0), 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Impressions
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-purple-600">
            {ads.reduce((sum, ad) => sum + (ad.clickCount || 0), 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Clicks
          </div>
        </div>
      </div>

      {/* Ads List */}
      <AdsList
        ads={filteredAds}
        loading={loading}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      {/* Create/Edit Form Modal */}
      {isFormOpen && (
        <AdsForm
          ad={selectedAd}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {/* Preview Modal */}
      {isPreviewOpen && selectedAd && (
        <AdPreview
          ad={selectedAd}
          onClose={handlePreviewClose}
        />
      )}
    </div>
  );
};

export default AdminAds;