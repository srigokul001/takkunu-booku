const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const Payment = require('../models/Payment');
const Coupon = require('../models/Coupon');
const { createNotification } = require('../utils/notify');

// Helper to generate a clean, unique Booking ID
const generateBookingId = () => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const timeSuffix = Date.now().toString().slice(-4);
  return `BK-${randomDigits}${timeSuffix}`;
};

// Helper to generate dummy transaction ID
const generateTransactionId = () => {
  return `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// @desc    Create a new booking & process dummy payment
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const {
      hotelId,
      roomId,
      checkIn,
      checkOut,
      numberOfGuests,
      guestDetails,
      paymentMethod = 'Credit/Debit Card',
      couponCode = null,
    } = req.body;

    // Validation
    if (!hotelId || !roomId || !checkIn || !checkOut || !numberOfGuests || !guestDetails) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all booking details (hotel, room, checkIn, checkOut, numberOfGuests, guestDetails)',
      });
    }

    const { guestName, guestEmail, guestPhone } = guestDetails;
    if (!guestName || !guestEmail || !guestPhone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complete guest details (name, email, phone)',
      });
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid check-in or check-out date format',
      });
    }

    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be at least 1 day after check-in date',
      });
    }

    // Calculate nights
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const totalNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (totalNights < 1) {
      return res.status(400).json({
        success: false,
        message: 'Minimum booking duration is 1 night',
      });
    }

    // Verify room exists and is active
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'The selected room does not exist',
      });
    }

    // Better Room Status check (Enhancement #8)
    if (room.status && room.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: `This room is currently ${room.status.toLowerCase()} and cannot be booked right now.`,
      });
    }

    if (!room.availabilityStatus) {
      return res.status(400).json({
        success: false,
        message: 'This room is currently out of service or unavailable',
      });
    }

    // Check capacity
    if (Number(numberOfGuests) > room.capacity) {
      return res.status(400).json({
        success: false,
        message: `This room accommodates a maximum of ${room.capacity} guests`,
      });
    }

    // Check if room is already booked for these dates (prevent double booking)
    const existingConflict = await Booking.findOne({
      roomId: room._id,
      bookingStatus: { $nin: ['Cancelled'] },
      checkIn: { $lt: endDate },
      checkOut: { $gt: startDate },
    });

    if (existingConflict) {
      return res.status(400).json({
        success: false,
        message: 'Sorry, this room is already booked for the selected dates. Please choose another date or room.',
      });
    }

    // Calculate subtotal price: Total Price = Number of Nights × Room Price
    const subtotalAmount = totalNights * room.pricePerNight;
    let discountAmount = 0;
    let validCouponCode = null;

    // Apply Coupon if provided (Enhancement #5)
    if (couponCode && couponCode.trim() !== '') {
      const cleanCoupon = couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: cleanCoupon, isActive: true });
      if (coupon && (!coupon.expiryDate || new Date() <= new Date(coupon.expiryDate))) {
        if (!coupon.minBookingAmount || subtotalAmount >= coupon.minBookingAmount) {
          validCouponCode = coupon.code;
          if (coupon.discountType === 'percentage') {
            discountAmount = Math.round((subtotalAmount * coupon.discountValue) / 100);
          } else {
            discountAmount = Math.min(subtotalAmount, coupon.discountValue);
          }
        }
      }
    }

    const totalAmount = Math.max(0, subtotalAmount - discountAmount);

    // Generate unique booking ID
    const bookingId = generateBookingId();

    // QR Code verification data string (Enhancement #2)
    const qrCodeData = JSON.stringify({
      bookingId,
      hotelId: hotelId.toString(),
      roomId: roomId.toString(),
      roomNumber: room.roomNumber,
      guestName,
      checkIn: startDate.toISOString().split('T')[0],
      checkOut: endDate.toISOString().split('T')[0],
    });

    // Create Booking
    const booking = await Booking.create({
      bookingId,
      userId: req.user._id,
      hotelId,
      roomId,
      checkIn: startDate,
      checkOut: endDate,
      numberOfGuests: Number(numberOfGuests),
      totalNights,
      subtotalAmount,
      discountAmount,
      couponApplied: validCouponCode,
      totalAmount,
      bookingStatus: 'Confirmed',
      paymentStatus: 'Paid',
      qrCodeData,
      guestDetails: {
        guestName,
        guestEmail,
        guestPhone,
        specialRequests: guestDetails.specialRequests || '',
      },
    });

    // Create dummy payment record in Payments collection
    const transactionId = generateTransactionId();
    const payment = await Payment.create({
      bookingId: booking._id,
      userId: req.user._id,
      amount: totalAmount,
      paymentMethod,
      transactionId,
      paymentStatus: 'Completed',
      paidAt: new Date(),
    });

    // Populate for response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('hotelId', 'hotelName location address image rating contactPhone coordinates')
      .populate('roomId', 'roomNumber roomType pricePerNight capacity image amenities status');

    // Trigger In-App Notifications (Enhancement #6)
    await createNotification({
      userId: req.user._id,
      title: 'Booking Confirmed! 🎉',
      message: `Your reservation at ${populatedBooking.hotelId?.hotelName} (${booking.bookingId}) is confirmed for ${totalNights} night(s).`,
      type: 'booking',
      link: `/booking-confirmation/${booking.bookingId}`,
    });

    await createNotification({
      userId: req.user._id,
      title: 'Payment Successful 💳',
      message: `Simulated payment of $${totalAmount} via ${paymentMethod} received successfully (Ref: ${transactionId}).`,
      type: 'payment',
      link: `/booking-confirmation/${booking.bookingId}`,
    });

    res.status(201).json({
      success: true,
      message: 'Booking confirmed and dummy payment completed successfully!',
      booking: populatedBooking,
      payment: {
        transactionId: payment.transactionId,
        paymentMethod: payment.paymentMethod,
        paymentStatus: payment.paymentStatus,
        paidAt: payment.paidAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking details by ID or bookingId
// @route   GET /api/bookings/:id
// @access  Private / Staff
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let query;
    if (id.toUpperCase().startsWith('BK-')) {
      query = { bookingId: id.toUpperCase() };
    } else {
      query = { _id: id };
    }

    const booking = await Booking.findOne(query)
      .populate('hotelId', 'hotelName location address image rating contactPhone coordinates')
      .populate('roomId', 'roomNumber roomType pricePerNight capacity image amenities status')
      .populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Ensure only booking owner or Admin can view
    if (
      req.user.role !== 'Admin' &&
      booking.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking',
      });
    }

    // Fetch payment record
    const payment = await Payment.findOne({ bookingId: booking._id });

    res.json({
      success: true,
      booking,
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('hotelId', 'hotelName');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Ensure only booking owner or Admin can cancel
    if (
      req.user.role !== 'Admin' &&
      booking.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    if (booking.bookingStatus === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled',
      });
    }

    booking.bookingStatus = 'Cancelled';
    booking.paymentStatus = 'Refunded';
    await booking.save();

    // Update payment record to Refunded if exists
    await Payment.findOneAndUpdate(
      { bookingId: booking._id },
      { paymentStatus: 'Refunded' }
    );

    // Notify User (Enhancement #6)
    await createNotification({
      userId: booking.userId,
      title: 'Booking Cancelled ℹ️',
      message: `Reservation ${booking.bookingId} for ${booking.hotelId?.hotelName || 'hotel'} has been cancelled. Simulated refund of $${booking.totalAmount} issued.`,
      type: 'cancellation',
      link: '/my-bookings',
    });

    res.json({
      success: true,
      message: 'Booking has been successfully cancelled and payment refunded.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookingById,
  cancelBooking,
};
