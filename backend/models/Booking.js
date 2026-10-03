const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a user'],
      index: true,
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Booking must reference a hotel'],
      index: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Booking must reference a room'],
      index: true,
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOut: {
      type: Date,
      required: [true, 'Check-out date is required'],
    },
    numberOfGuests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'At least 1 guest required'],
    },
    totalNights: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotalAmount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    couponApplied: {
      type: String,
      default: null,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Amount must be positive'],
    },
    bookingStatus: {
      type: String,
      enum: ['Confirmed', 'Checked In', 'Pending', 'Cancelled', 'Completed'],
      default: 'Confirmed',
    },
    checkedInAt: {
      type: Date,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Refunded', 'Failed'],
      default: 'Paid',
    },
    qrCodeData: {
      type: String,
      default: null,
    },
    guestDetails: {
      guestName: { type: String, required: true },
      guestEmail: { type: String, required: true },
      guestPhone: { type: String, required: true },
      specialRequests: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
