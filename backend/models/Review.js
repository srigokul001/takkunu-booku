const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Review must be for a hotel'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Review must reference a verified booking'],
      unique: true, // Only 1 review per completed booking
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a star rating from 1 to 5'],
      min: [1, 'Minimum rating is 1 star'],
      max: [5, 'Maximum rating is 5 stars'],
    },
    comment: {
      type: String,
      required: [true, 'Please share your stay feedback'],
      trim: true,
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Review', reviewSchema);
