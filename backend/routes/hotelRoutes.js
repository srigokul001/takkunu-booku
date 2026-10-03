const express = require('express');
const router = express.Router();
const {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} = require('../controllers/hotelController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getHotels)
  .post(protect, authorize('Admin'), createHotel);

router.route('/:id')
  .get(getHotelById)
  .put(protect, authorize('Admin'), updateHotel)
  .delete(protect, authorize('Admin'), deleteHotel);

module.exports = router;
