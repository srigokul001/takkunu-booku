const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookingById,
  cancelBooking,
} = require('../controllers/bookingController');
const { getUserBookings } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getUserBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
