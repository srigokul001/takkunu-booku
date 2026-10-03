const Hotel = require('../models/Hotel');
const Room = require('../models/Room');

// @desc    Get all hotels (with optional search by location/keyword)
// @route   GET /api/hotels
// @access  Public
const getHotels = async (req, res, next) => {
  try {
    const { search, location } = req.query;
    let query = {};

    if (location && location.trim() !== '') {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    if (search && search.trim() !== '') {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { hotelName: searchRegex },
        { location: searchRegex },
        { address: searchRegex },
        { description: searchRegex },
      ];
    }

    const rawHotels = await Hotel.find(query).sort({ createdAt: -1 });
    const hotels = rawHotels.map((h) => {
      const obj = h.toObject();
      if (!obj.images || obj.images.length === 0) {
        obj.images = [{ url: obj.image, publicId: '', isCover: true }];
      }
      return obj;
    });

    res.json({
      success: true,
      count: hotels.length,
      hotels,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single hotel by ID
// @route   GET /api/hotels/:id
// @access  Public
const getHotelById = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }

    const hotelObj = hotel.toObject();
    if (!hotelObj.images || hotelObj.images.length === 0) {
      hotelObj.images = [{ url: hotelObj.image, publicId: '', isCover: true }];
    }

    // Also fetch rooms belonging to this hotel
    const rawRooms = await Room.find({ hotelId: hotel._id });
    const rooms = rawRooms.map((r) => {
      const rObj = r.toObject();
      if (!rObj.images || rObj.images.length === 0) {
        rObj.images = [{ url: rObj.image, publicId: '', isCover: true }];
      }
      return rObj;
    });

    res.json({
      success: true,
      hotel: hotelObj,
      rooms,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new hotel
// @route   POST /api/hotels
// @access  Private/Admin
const createHotel = async (req, res, next) => {
  try {
    const { hotelName, location, address, description, image, images, rating, contactPhone, amenities } = req.body;

    const coverUrl = Array.isArray(images) && images.length > 0 
      ? (images.find((img) => img.isCover)?.url || images[0]?.url) 
      : null;
    const finalImage = image || coverUrl;

    if (!hotelName || !location || !address || !description || !finalImage) {
      return res.status(400).json({
        success: false,
        message: 'Please provide hotelName, location, address, description, and at least one hotel photo',
      });
    }

    const hotel = await Hotel.create({
      hotelName,
      location,
      address,
      description,
      image: finalImage,
      images: Array.isArray(images) && images.length > 0 
        ? images 
        : [{ url: finalImage, publicId: '', isCover: true }],
      rating: rating ? Number(rating) : 4.5,
      contactPhone,
      amenities: Array.isArray(amenities) ? amenities : (amenities ? amenities.split(',').map((s) => s.trim()) : undefined),
    });

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      hotel,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private/Admin
const updateHotel = async (req, res, next) => {
  try {
    let hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }

    if (req.body.amenities && typeof req.body.amenities === 'string') {
      req.body.amenities = req.body.amenities.split(',').map((s) => s.trim());
    }

    if (Array.isArray(req.body.images) && req.body.images.length > 0) {
      const cover = req.body.images.find((img) => img.isCover);
      req.body.image = cover ? cover.url : req.body.images[0].url;
    }

    hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: 'Hotel updated successfully',
      hotel,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private/Admin
const deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found',
      });
    }

    // Delete all associated rooms
    await Room.deleteMany({ hotelId: hotel._id });
    await hotel.deleteOne();

    res.json({
      success: true,
      message: 'Hotel and associated rooms removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
};
