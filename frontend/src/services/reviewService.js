import api from './api';

export const reviewService = {
  // Get reviews for a hotel
  getHotelReviews: async (hotelId) => {
    const response = await api.get(`/reviews/hotel/${hotelId}`);
    return response.data;
  },

  // Submit a verified review
  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },
};

export default reviewService;
