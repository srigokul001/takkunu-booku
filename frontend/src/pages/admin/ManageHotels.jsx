import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Star,
  Phone,
  Search,
  X,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import hotelService from '../../services/hotelService';
import uploadService from '../../services/uploadService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ImageUploader from '../../components/ImageUploader';

const ManageHotels = () => {
  const { showToast } = useToast();

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [formData, setFormData] = useState({
    hotelName: '',
    location: '',
    city: '',
    state: '',
    country: 'United States',
    address: '',
    description: '',
    image: '',
    rating: 4.8,
    contactPhone: '',
    contactEmail: '',
    lat: 25.7617,
    lng: -80.1918,
    amenities: 'Free Wi-Fi, Swimming Pool, Ocean View, Restaurant, Spa',
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Photo Upload States
  const [existingImages, setExistingImages] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploadError, setUploadError] = useState('');

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await hotelService.getHotels();
      if (res.success && res.hotels) {
        setHotels(res.hotels);
      }
    } catch (err) {
      showToast('Failed to load hotels', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const openAddModal = () => {
    setEditingHotel(null);
    setExistingImages([]);
    setPendingFiles([]);
    setUploadError('');
    setFormData({
      hotelName: '',
      location: '',
      city: '',
      state: '',
      country: 'United States',
      address: '',
      description: '',
      image: '',
      rating: 4.8,
      contactPhone: '+1 (800) 555-0199',
      contactEmail: 'concierge@hotel.com',
      lat: 25.7617,
      lng: -80.1918,
      amenities: 'Free Wi-Fi, Swimming Pool, Ocean View, Restaurant, Spa',
    });
    setModalOpen(true);
  };

  const openEditModal = (hotel) => {
    setEditingHotel(hotel);
    const photos = Array.isArray(hotel.images) && hotel.images.length > 0
      ? hotel.images
      : hotel.image
      ? [{ url: hotel.image, publicId: '', isCover: true }]
      : [];
    setExistingImages(photos);
    setPendingFiles([]);
    setUploadError('');
    setFormData({
      hotelName: hotel.hotelName,
      location: hotel.location || '',
      city: hotel.city || (hotel.location ? hotel.location.split(',')[0].trim() : ''),
      state: hotel.state || '',
      country: hotel.country || 'United States',
      address: hotel.address,
      description: hotel.description,
      image: hotel.image || '',
      rating: hotel.rating,
      contactPhone: hotel.contactPhone || '',
      contactEmail: hotel.contactEmail || '',
      lat: hotel.coordinates?.lat || 25.7617,
      lng: hotel.coordinates?.lng || -80.1918,
      amenities: Array.isArray(hotel.amenities) ? hotel.amenities.join(', ') : hotel.amenities,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');

    const totalPhotos = existingImages.length + pendingFiles.length;
    if (totalPhotos === 0) {
      setUploadError('Please upload at least one photo for this hotel property.');
      showToast('Please upload at least one photo for this hotel', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let newlyUploaded = [];

      if (pendingFiles.length > 0) {
        const filesToUpload = pendingFiles.map((p) => p.file);
        const res = await uploadService.uploadMultiple(filesToUpload, 'hotels');
        if (res.success && res.images) {
          newlyUploaded = res.images.map((img, idx) => ({
            url: img.url,
            publicId: img.publicId,
            isCover: !!pendingFiles[idx]?.isCover,
          }));
        }
      }

      let allImages = [...existingImages, ...newlyUploaded];

      // Ensure at least one image is marked as cover
      const hasCover = allImages.some((img) => img.isCover);
      if (!hasCover && allImages.length > 0) {
        allImages[0].isCover = true;
      }

      const coverUrl = allImages.find((img) => img.isCover)?.url || allImages[0]?.url;

      const payload = {
        ...formData,
        location: formData.location || formData.city || 'Miami, FL',
        city: formData.city || (formData.location ? formData.location.split(',')[0].trim() : ''),
        coordinates: {
          lat: Number(formData.lat) || 25.7617,
          lng: Number(formData.lng) || -80.1918,
        },
        image: coverUrl,
        images: allImages,
      };

      if (editingHotel) {
        await hotelService.updateHotel(editingHotel._id, payload);
        showToast('Hotel property updated successfully', 'success');
      } else {
        await hotelService.createHotel(payload);
        showToast('New hotel added to system', 'success');
      }

      // Cleanup preview URLs
      pendingFiles.forEach((p) => {
        if (p.preview) URL.revokeObjectURL(p.preview);
      });
      setPendingFiles([]);
      setModalOpen(false);
      fetchHotels();
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed';
      setUploadError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await hotelService.deleteHotel(id);
      showToast('Hotel deleted successfully', 'success');
      setDeleteConfirmId(null);
      fetchHotels();
    } catch (err) {
      showToast('Failed to delete hotel', 'error');
    }
  };

  const filteredHotels = hotels.filter((h) =>
    h.hotelName.toLowerCase().includes(search.toLowerCase()) ||
    h.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600">Module 4 — Hotel Management</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Hotel Properties</h1>
          <p className="text-xs text-slate-500 mt-1">Add, update, or remove hotel destinations and property listings.</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Hotel</span>
        </button>
      </div>

      {/* Search and Stats */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hotel name or location..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-600"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500 self-end sm:self-auto">
          Total Hotels: <strong className="text-slate-900">{hotels.length}</strong>
        </span>
      </div>

      {/* Hotels Table */}
      {loading ? (
        <LoadingSpinner text="Fetching hotel catalogue..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Hotel Property</th>
                  <th className="py-3.5 px-6">Location & Address</th>
                  <th className="py-3.5 px-6">Rooms & Amenities</th>
                  <th className="py-3.5 px-6">Rating</th>
                  <th className="py-3.5 px-6">Contact</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredHotels.map((h) => (
                  <tr key={h._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <img
                          src={h.image}
                          alt={h.hotelName}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm">{h.hotelName}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{h.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{h.city ? `${h.city}, ${h.state || h.country}` : h.location}</p>
                      <p className="text-[11px] text-slate-400">{h.address}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          {h.roomCount !== undefined ? `${h.roomCount} Rooms` : 'Rooms active'}
                        </span>
                        <p className="text-[10px] text-slate-400 line-clamp-1">
                          {Array.isArray(h.amenities) ? h.amenities.slice(0, 3).join(', ') : (h.amenities || '')}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-slate-800">{h.rating ? h.rating.toFixed(1) : '4.5'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-slate-700 font-mono text-[11px]">{h.contactPhone || 'N/A'}</p>
                      {h.contactEmail && (
                        <p className="text-[10px] text-slate-400 line-clamp-1">{h.contactEmail}</p>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(h)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 transition"
                          title="Edit Hotel"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(h._id)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition"
                          title="Delete Hotel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Hotel Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 border border-slate-200 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {editingHotel ? 'Edit Hotel Details' : 'Add New Hotel'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Hotel Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.hotelName}
                  onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                  placeholder="e.g. The Grand Azure Palace"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value, location: e.target.value })}
                    placeholder="e.g. Miami"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    State / Province
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Florida"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g. United States"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Full Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 1420 Ocean Drive, South Beach, Miami, FL 33139"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+1 (800) 555-0199"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="concierge@hotel.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Latitude (OpenStreetMap)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    placeholder="25.7617"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Longitude (OpenStreetMap)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    placeholder="-80.1918"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Image Upload Component */}
              <ImageUploader
                label="Hotel Photos"
                subLabel="Upload multiple photos: exterior, reception, lobby, swimming pool, restaurant, parking, and amenities"
                existingImages={existingImages}
                onExistingImagesChange={setExistingImages}
                pendingFiles={pendingFiles}
                onPendingFilesChange={setPendingFiles}
                isUploading={submitting}
                error={uploadError}
                setError={setUploadError}
              />

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Captivating description of the hotel ambiance, luxury offerings..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="Free Wi-Fi, Pool, Spa, Parking, Restaurant"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingHotel ? 'Update Hotel' : 'Create Hotel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete this Hotel?</h3>
            <p className="text-xs text-slate-500">
              This will permanently delete the hotel and all its associated rooms. This action cannot be undone.
            </p>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageHotels;
