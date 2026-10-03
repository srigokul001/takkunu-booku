const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Payment must reference a booking'],
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Payment must reference a user'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount must be positive'],
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['Credit/Debit Card', 'UPI', 'Net Banking', 'Cash at Check-in', 'Demo Card / Instant Pay'],
      default: 'Credit/Debit Card',
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentStatus: {
      type: String,
      enum: ['Completed', 'Pending', 'Failed', 'Refunded'],
      default: 'Completed',
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
