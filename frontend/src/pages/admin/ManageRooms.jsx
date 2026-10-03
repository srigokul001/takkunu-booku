import React, { useState, useEffect } from 'react';
import {
  BedDouble,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Building,
  Filter,
  Users,
  Search,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import roomService from '../../services/roomService';
import hotelService from '../../services/hotelService';
import adminService from '../../services/adminService';
import uploadService from '../../services/uploadService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ImageUploader from '../../components/ImageUploader';

const ManageRooms = () => {
  const { showToast } = useToast();

  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHotelFilter, setSelectedHotelFilter] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    hotelId: '',
    roomNumber: '',
    title: '',
    roomType: 'Deluxe',
    bedType: 'King Bed',
    roomSize: '350 sq ft',
    pricePerNight: 250,
    capacity: 2,
    amenities: 'King Bed, Free Wi-Fi, Ocean View, Mini Bar, Balcony',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    availabilityStatus: true,
    status: 'Available',
    description: 'Elegantly furnished luxury room with modern amenities.',
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Photo Upload States
  const [existingImages, setExistingImages] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploadError, setUploadError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [roomsRes, hotelsRes] = await Promise.all([
        roomService.getRooms(),
        hotelService.getHotels(),
      ]);
      if (roomsRes.success && roomsRes.rooms) setRooms(roomsRes.rooms);
      if (hotelsRes.success && hotelsRes.hotels) setHotels(hotelsRes.hotels);
    } catch (err) {
      showToast('Failed to load room inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingRoom(null);
    setExistingImages([]);
    setPendingFiles([]);
    setUploadError('');
    setFormData({
      hotelId: hotels[0]?._id || '',
      roomNumber: '',
      title: '',
      roomType: 'Deluxe',
      bedType: 'King Bed',
      roomSize: '350 sq ft',
      pricePerNight: 250,
      capacity: 2,
      amenities: 'King Bed, Free Wi-Fi, Ocean View, Mini Bar, Balcony',
      image: '',
      availabilityStatus: true,
      status: 'Available',
      description: 'Elegantly furnished luxury room with modern amenities.',
    });
    setModalOpen(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    const photos = Array.isArray(room.images) && room.images.length > 0
      ? room.images
      : room.image
      ? [{ url: room.image, publicId: '', isCover: true }]
      : [];
    setExistingImages(photos);
    setPendingFiles([]);
    setUploadError('');
    setFormData({
      hotelId: typeof room.hotelId === 'object' ? room.hotelId._id : room.hotelId,
      roomNumber: room.roomNumber,
      title: room.title || '',
      roomType: room.roomType,
      bedType: room.bedType || 'King Bed',
      roomSize: room.roomSize || '350 sq ft',
      pricePerNight: room.pricePerNight,
      capacity: room.capacity,
      amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : room.amenities,
      image: room.image || '',
      availabilityStatus: room.availabilityStatus,
      status: room.status || (room.availabilityStatus ? 'Available' : 'Maintenance'),
      description: room.description || '',
    });
    setModalOpen(true);
  };

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      const res = await adminService.setRoomStatus(roomId, newStatus);
      if (res.success) {
        showToast(`Room status updated to ${newStatus}`, 'success');
        setRooms((prev) =>
          prev.map((r) =>
            r._id === roomId
              ? {
                  ...r,
                  status: newStatus,
                  availabilityStatus: newStatus === 'Available',
                }
              : r
          )
        );
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update room status', 'error');
    }
  };

  const handleToggleStatus = async (roomId) => {
    try {
      const res = await adminService.toggleRoomStatus(roomId);
      if (res.success) {
        showToast(res.message, 'success');
        setRooms((prev) =>
          prev.map((r) => (r._id === roomId ? { ...r, availabilityStatus: res.room.availabilityStatus, status: res.room.status || (res.room.availabilityStatus ? 'Available' : 'Maintenance') } : r))
        );
      }
    } catch (err) {
      showToast('Failed to update room availability', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');

    const totalPhotos = existingImages.length + pendingFiles.length;
    if (totalPhotos === 0) {
      setUploadError('Please upload at least one photo for this room.');
      showToast('Please upload at least one photo for this room', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let newlyUploaded = [];

      if (pendingFiles.length > 0) {
        const filesToUpload = pendingFiles.map((p) => p.file);
        const res = await uploadService.uploadMultiple(filesToUpload, 'rooms');
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
        image: coverUrl,
        images: allImages,
      };

      if (editingRoom) {
        await roomService.updateRoom(editingRoom._id, payload);
        showToast('Room updated successfully', 'success');
      } else {
        await roomService.createRoom(payload);
        showToast('New room added to inventory', 'success');
      }

      // Cleanup preview URLs
      pendingFiles.forEach((p) => {
        if (p.preview) URL.revokeObjectURL(p.preview);
      });
      setPendingFiles([]);
      setModalOpen(false);
      fetchData();
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
      await roomService.deleteRoom(id);
      showToast('Room deleted successfully', 'success');
      setDeleteConfirmId(null);
      fetchData();
    } catch (err) {
      showToast('Failed to delete room', 'error');
    }
  };

  const filteredRooms = rooms.filter((r) => {
    if (selectedHotelFilter === 'All') return true;
    const hId = typeof r.hotelId === 'object' ? r.hotelId._id : r.hotelId;
    return hId === selectedHotelFilter;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600">Module 4 — Room Inventory</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage Rooms & Suites</h1>
          <p className="text-xs text-slate-500 mt-1">Configure room numbers, prices, capacities, and availability toggles.</p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Room</span>
        </button>
      </div>

      {/* Hotel Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs w-full sm:w-auto">
          <Filter className="w-4 h-4 text-teal-600" />
          <span className="font-bold text-slate-600">Filter by Hotel:</span>
          <select
            value={selectedHotelFilter}
            onChange={(e) => setSelectedHotelFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-600 bg-slate-50"
          >
            <option value="All">All Hotels ({rooms.length} Rooms)</option>
            {hotels.map((h) => (
              <option key={h._id} value={h._id}>
                {h.hotelName} ({h.location})
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Showing <strong className="text-slate-900">{filteredRooms.length}</strong> rooms
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Loading room inventories..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Room</th>
                  <th className="py-3.5 px-6">Hotel Property</th>
                  <th className="py-3.5 px-6">Type & Capacity</th>
                  <th className="py-3.5 px-6">Nightly Price</th>
                  <th className="py-3.5 px-6">Availability Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRooms.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <img
                          src={r.image}
                          alt={`Room ${r.roomNumber}`}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm">Room #{r.roomNumber}</p>
                          <p className="text-[11px] text-teal-700 font-semibold">{r.title || `${r.roomType} Suite`}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {typeof r.hotelId === 'object' ? r.hotelId?.hotelName : 'Attached Hotel'}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{r.capacity} Guests</p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {r.bedType || 'King Bed'} • {r.roomSize || '350 sq ft'}
                      </p>
                    </td>
                    <td className="py-4 px-6 font-black text-slate-900 text-sm">
                      ${r.pricePerNight} <span className="text-[10px] font-normal text-slate-400">/ night</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col space-y-1">
                        <select
                          value={r.status || (r.availabilityStatus ? 'Available' : 'Maintenance')}
                          onChange={(e) => handleStatusChange(r._id, e.target.value)}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition cursor-pointer focus:outline-none ${
                            (r.status === 'Available' || (!r.status && r.availabilityStatus))
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : r.status === 'Booked'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : r.status === 'Occupied'
                              ? 'bg-purple-50 text-purple-800 border-purple-300'
                              : r.status === 'Cleaning'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                          title="Change operational status"
                        >
                          <option value="Available">🟢 Available</option>
                          <option value="Booked">🔵 Booked</option>
                          <option value="Occupied">🟣 Occupied</option>
                          <option value="Cleaning">🟡 Cleaning</option>
                          <option value="Maintenance">🔴 Maintenance</option>
                        </select>
                        <span className="text-[10px] text-slate-400 pl-1 font-medium">
                          {r.availabilityStatus ? '✓ Open for booking' : '✕ Blocked'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 transition"
                          title="Edit Room"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(r._id)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition"
                          title="Delete Room"
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

      {/* Add / Edit Room Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 border border-slate-200 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">
                {editingRoom ? 'Edit Room Configuration' : 'Add New Room'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Assign to Hotel *
                </label>
                <select
                  required
                  value={formData.hotelId}
                  onChange={(e) => setFormData({ ...formData, hotelId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-600 bg-slate-50"
                >
                  <option value="">Select a hotel...</option>
                  {hotels.map((h) => (
                    <option key={h._id} value={h._id}>
                      {h.hotelName} ({h.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                    placeholder="e.g. 302, Penthouse A"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Room Type *
                  </label>
                  <select
                    value={formData.roomType}
                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-600 bg-slate-50"
                  >
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Twin">Twin</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                    <option value="Family">Family</option>
                    <option value="Family Suite">Family Suite</option>
                    <option value="Executive Suite">Executive Suite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Room Title / Label (Optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Deluxe Ocean View King Room"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Bed Configuration
                  </label>
                  <input
                    type="text"
                    value={formData.bedType}
                    onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}
                    placeholder="e.g. King Bed, Queen Bed, 2 Twin Beds"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Room Size
                  </label>
                  <input
                    type="text"
                    value={formData.roomSize}
                    onChange={(e) => setFormData({ ...formData, roomSize: e.target.value })}
                    placeholder="e.g. 380 sq ft (35 m²)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Price Per Night ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData({ ...formData, pricePerNight: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Max Capacity (Guests) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={10}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              {/* Room Photo Upload Component */}
              <ImageUploader
                label="Room Photos"
                subLabel="Upload photos of bed, bathroom, balcony, TV, wardrobe, AC, desk, and room interior"
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
                  Room Amenities (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  placeholder="King Bed, Balcony, Wi-Fi, Mini Bar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Room Operational Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => {
                    const nextStatus = e.target.value;
                    setFormData({
                      ...formData,
                      status: nextStatus,
                      availabilityStatus: nextStatus === 'Available',
                    });
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-600 bg-slate-50"
                >
                  <option value="Available">Available (Ready for Guests)</option>
                  <option value="Booked">Booked (Reserved)</option>
                  <option value="Occupied">Occupied (Guest in Room)</option>
                  <option value="Cleaning">Cleaning (Housekeeping)</option>
                  <option value="Maintenance">Maintenance (Service / Out of Order)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="availabilityStatus"
                  checked={formData.availabilityStatus}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData({
                      ...formData,
                      availabilityStatus: checked,
                      status: checked ? 'Available' : (formData.status === 'Available' ? 'Maintenance' : formData.status),
                    });
                  }}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="availabilityStatus" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Mark as Available for Booking immediately
                </label>
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
                  {submitting ? 'Saving...' : editingRoom ? 'Update Room' : 'Add Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete this Room?</h3>
            <p className="text-xs text-slate-500">
              This will permanently delete this room from the database.
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

export default ManageRooms;
