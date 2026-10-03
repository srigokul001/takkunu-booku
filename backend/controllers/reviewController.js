const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');

// @desc    Get all reviews for a specific hotel
// @route   GET /api/reviews/hotel/:hotelId
// @access  Public
const getHotelReviews = async (req, res, next) => {
  try {
    const { hotelId } = req.params;

    const reviews = await Review.find({ hotelId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    // Calculate rating breakdown
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1))
        : 5.0;

    res.json({
      success: true,
      count: totalReviews,
      averageRating,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a verified review for a hotel
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const { hotelId, bookingId, rating, comment } = req.body;

    if (!hotelId || !bookingId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide hotelId, bookingId, rating (1-5), and comment.',
      });
    }

    if (Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars.',
      });
    }

    // Verify booking belongs to this user and is not cancelled
    const booking = await Booking.findOne({
      _id: bookingId,
      userId: req.user._id,
      hotelId,
      bookingStatus: { $ne: 'Cancelled' },
    });

    if (!booking) {
      return res.status(403).json({
        success: false,
        message: 'Only verified guests who have an active or completed stay can review this property.',
      });
    }

    // Check if already reviewed for this booking
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this reservation.',
      });
    }

    const review = await Review.create({
      hotelId,
      userId: req.user._id,
      bookingId,
      rating: Number(rating),
      comment: comment.trim(),
    });

    // Update hotel average rating and count
    const allReviews = await Review.find({ hotelId });
    const avg = (allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length).toFixed(1);

    await Hotel.findByIdAndUpdate(hotelId, {
      rating: Number(avg),
      totalReviews: allReviews.length,
    });

    const populatedReview = await Review.findById(review._id).populate('userId', 'name');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. Thank you for your feedback!',
      review: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHotelReviews,
  createReview,
};
