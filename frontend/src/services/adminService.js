import api from './api';

export const adminService = {
  // Get dashboard statistics (with occupancy and monthly charts)
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Get all bookings
  getAllBookings: async (params = {}) => {
    const response = await api.get('/admin/bookings', { params });
    return response.data;
  },

  // Update booking status
  updateBookingStatus: async (id, statusData) => {
    const response = await api.put(`/admin/bookings/${id}/status`, statusData);
    return response.data;
  },

  // Get all users
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  // Get user booking history
  getUserBookingsAdmin: async (userId) => {
    const response = await api.get(`/admin/users/${userId}/bookings`);
    return response.data;
  },

  // Toggle room availability (backward compatibility)
  toggleRoomStatus: async (roomId) => {
    const response = await api.patch(`/admin/rooms/${roomId}/toggle-status`);
    return response.data;
  },

  // Update 5-state Room Status (Available, Booked, Occupied, Cleaning, Maintenance)
  setRoomStatus: async (roomId, status) => {
    const response = await api.patch(`/admin/rooms/${roomId}/status`, { status });
    return response.data;
  },

  // Process QR Digital Check-in
  processCheckIn: async (bookingId) => {
    const response = await api.post(`/admin/check-in/${bookingId}`);
    return response.data;
  },
};

export default adminService;
