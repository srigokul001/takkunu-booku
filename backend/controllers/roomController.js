const Room = require('../models/Room');
const Booking = require('../models/Booking');

// @desc    Get all rooms (supports filter by hotelId, roomType, minPrice, maxPrice, capacity, checkIn, checkOut, status)
// @route   GET /api/rooms
// @access  Public
const getRooms = async (req, res, next) => {
  try {
    const { hotelId, roomType, minPrice, maxPrice, capacity, checkIn, checkOut, status } = req.query;
    let query = {};

    if (hotelId) {
      query.hotelId = hotelId;
    }

    if (roomType && roomType !== 'All') {
      query.roomType = roomType;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = Number(minPrice);
      if (maxPrice) query.pricePerNight.$lte = Number(maxPrice);
    }

    if (capacity) {
      query.capacity = { $gte: Number(capacity) };
    }

    let rooms = await Room.find(query).populate('hotelId', 'hotelName location address image rating coordinates');

    // If dates are provided, filter out booked rooms and evaluate availability
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);

      // Find all overlapping bookings that are not cancelled
      const overlappingBookings = await Booking.find({
        bookingStatus: { $nin: ['Cancelled'] },
        checkIn: { $lt: end },
        checkOut: { $gt: start },
      }).select('roomId');

      const bookedRoomIds = new Set(overlappingBookings.map((b) => b.roomId.toString()));

      // Annotate each room with isAvailableForDates
      rooms = rooms.map((room) => {
        const isBooked = bookedRoomIds.has(room._id.toString());
        const isStatusAvailable = room.status === 'Available';
        const isAvailable = isStatusAvailable && !isBooked;
        const roomObj = room.toObject();
        roomObj.isAvailableForDates = isAvailable;
        return roomObj;
      });
    }

    // Ensure images array is always populated
    rooms = rooms.map((room) => {
      const roomObj = typeof room.toObject === 'function' ? room.toObject() : { ...room };
      if (!roomObj.images || roomObj.images.length === 0) {
        roomObj.images = [{ url: roomObj.image, publicId: '', isCover: true }];
      }
      return roomObj;
    });

    res.json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single room by ID
// @route   GET /api/rooms/:id
// @access  Public
const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('hotelId', 'hotelName location address image rating contactPhone coordinates');

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    const roomObj = room.toObject();
    if (!roomObj.images || roomObj.images.length === 0) {
      roomObj.images = [{ url: roomObj.image, publicId: '', isCover: true }];
    }

    res.json({
      success: true,
      room: roomObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check single room availability for specified dates
// @route   GET /api/rooms/:id/availability
// @access  Public
const checkRoomAvailability = async (req, res, next) => {
  try {
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both checkIn and checkOut dates',
      });
    }

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date',
      });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Better room status check
    if (room.status && room.status !== 'Available') {
      return res.json({
        success: true,
        available: false,
        message: `Room is currently marked as ${room.status.toLowerCase()}.`,
      });
    }

    if (!room.availabilityStatus) {
      return res.json({
        success: true,
        available: false,
        message: 'Room is currently marked as unavailable.',
      });
    }

    // Check for conflicting active bookings
    const conflictingBooking = await Booking.findOne({
      roomId: room._id,
      bookingStatus: { $nin: ['Cancelled'] },
      checkIn: { $lt: end },
      checkOut: { $gt: start },
    });

    const isAvailable = !conflictingBooking;

    res.json({
      success: true,
      available: isAvailable,
      message: isAvailable
        ? 'Room is available for the selected dates'
        : 'Room is already booked for these dates. Please choose different dates or rooms.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create room (Admin)
// @route   POST /api/rooms
// @access  Private/Admin
const createRoom = async (req, res, next) => {
  try {
    const {
      hotelId,
      roomNumber,
      roomType,
      title,
      bedType,
      roomSize,
      pricePerNight,
      capacity,
      amenities,
      image,
      images,
      status = 'Available',
      availabilityStatus,
      description,
    } = req.body;

    const coverUrl = Array.isArray(images) && images.length > 0 
      ? (images.find((img) => img.isCover)?.url || images[0]?.url) 
      : null;
    const finalImage = image || coverUrl;

    if (!hotelId || !roomNumber || !roomType || !pricePerNight || !capacity || !finalImage) {
      return res.status(400).json({
        success: false,
        message: 'Please provide hotelId, roomNumber, roomType, pricePerNight, capacity, and at least one room photo',
      });
    }

    const room = await Room.create({
      hotelId,
      roomNumber,
      roomType,
      title: title || `${roomType} Room #${roomNumber}`,
      bedType: bedType || 'King Bed',
      roomSize: roomSize || '350 sq ft',
      pricePerNight: Number(pricePerNight),
      capacity: Number(capacity),
      amenities: Array.isArray(amenities) ? amenities : (amenities ? amenities.split(',').map((s) => s.trim()) : undefined),
      image: finalImage,
      images: Array.isArray(images) && images.length > 0 
        ? images 
        : [{ url: finalImage, publicId: '', isCover: true }],
      status: status || (availabilityStatus === false ? 'Maintenance' : 'Available'),
      availabilityStatus: status === 'Available',
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update room (Admin)
// @route   PUT /api/rooms/:id
// @access  Private/Admin
const updateRoom = async (req, res, next) => {
  try {
    let room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    if (req.body.amenities && typeof req.body.amenities === 'string') {
      req.body.amenities = req.body.amenities.split(',').map((s) => s.trim());
    }

    if (req.body.status) {
      req.body.availabilityStatus = req.body.status === 'Available';
    }

    if (Array.isArray(req.body.images) && req.body.images.length > 0) {
      const cover = req.body.images.find((img) => img.isCover);
      req.body.image = cover ? cover.url : req.body.images[0].url;
    }

    room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Room updated successfully',
      room,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete room (Admin)
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    await room.deleteOne();

    res.json({
      success: true,
      message: 'Room deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRooms,
  getRoomById,
  checkRoomAvailability,
  createRoom,
  updateRoom,
  deleteRoom,
};
