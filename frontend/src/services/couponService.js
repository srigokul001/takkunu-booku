import api from './api';

export const couponService = {
  // Apply coupon code against subtotal
  applyCoupon: async (code, subtotal) => {
    const response = await api.post('/coupons/apply', { code, subtotal });
    return response.data;
  },

  // Get active coupons
  getAvailableCoupons: async () => {
    const response = await api.get('/coupons');
    return response.data;
  },
};

export default couponService;
