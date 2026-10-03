import api from './api';

export const hotelService = {
  // Get all hotels with optional filters
  getHotels: async (params = {}) => {
    const response = await api.get('/hotels', { params });
    return response.data;
  },

  // Get hotel by ID with its rooms
  getHotelById: async (id) => {
    const response = await api.get(`/hotels/${id}`);
    return response.data;
  },

  // Create new hotel (Admin)
  createHotel: async (hotelData) => {
    const response = await api.post('/hotels', hotelData);
    return response.data;
  },

  // Update hotel (Admin)
  updateHotel: async (id, hotelData) => {
    const response = await api.put(`/hotels/${id}`, hotelData);
    return response.data;
  },

  // Delete hotel (Admin)
  deleteHotel: async (id) => {
    const response = await api.delete(`/hotels/${id}`);
    return response.data;
  },
};

export default hotelService;
