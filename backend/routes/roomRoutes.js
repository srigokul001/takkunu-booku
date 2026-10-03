const express = require('express');
const router = express.Router();
const {
  getRooms,
  getRoomById,
  checkRoomAvailability,
  createRoom,
  updateRoom,
  deleteRoom,
} = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getRooms)
  .post(protect, authorize('Admin'), createRoom);

router.route('/:id')
  .get(getRoomById)
  .put(protect, authorize('Admin'), updateRoom)
  .delete(protect, authorize('Admin'), deleteRoom);

router.get('/:id/availability', checkRoomAvailability);

module.exports = router;
