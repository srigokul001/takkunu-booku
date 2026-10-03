import api from './api';

export const roomService = {
  // Get rooms (filtered by hotelId, roomType, price, capacity, checkIn, checkOut)
  getRooms: async (params = {}) => {
    const response = await api.get('/rooms', { params });
    return response.data;
  },

  // Get room by ID
  getRoomById: async (id) => {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  // Check room availability for dates
  checkAvailability: async (id, checkIn, checkOut) => {
    const response = await api.get(`/rooms/${id}/availability`, {
      params: { checkIn, checkOut },
    });
    return response.data;
  },

  // Create room (Admin)
  createRoom: async (roomData) => {
    const response = await api.post('/rooms', roomData);
    return response.data;
  },

  // Update room (Admin)
  updateRoom: async (id, roomData) => {
    const response = await api.put(`/rooms/${id}`, roomData);
    return response.data;
  },

  // Delete room (Admin)
  deleteRoom: async (id) => {
    const response = await api.delete(`/rooms/${id}`);
    return response.data;
  },
};

export default roomService;
