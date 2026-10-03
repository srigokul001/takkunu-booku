const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllBookings,
  updateBookingStatus,
  getAllUsers,
  getUserBookingsAdmin,
  toggleRoomStatus,
  setRoomStatus,
  processCheckIn,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes here are restricted to Admin
router.use(protect, authorize('Admin'));

router.get('/dashboard', getDashboardStats);
router.get('/bookings', getAllBookings);
router.put('/bookings/:id/status', updateBookingStatus);
router.get('/users', getAllUsers);
router.get('/users/:id/bookings', getUserBookingsAdmin);
router.patch('/rooms/:id/toggle-status', toggleRoomStatus);
router.patch('/rooms/:id/status', setRoomStatus);
router.post('/check-in/:bookingId', processCheckIn);

module.exports = router;
