const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: [true, 'Room must belong to a hotel'],
      index: true,
    },
    roomNumber: {
      type: String,
      required: [true, 'Please provide room number'],
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    roomType: {
      type: String,
      required: [true, 'Please provide room type'],
      enum: ['Single', 'Double', 'Twin', 'Deluxe', 'Suite', 'Family', 'Family Suite', 'Executive Suite'],
      default: 'Deluxe',
    },
    bedType: {
      type: String,
      trim: true,
      default: 'King Bed',
    },
    roomSize: {
      type: String,
      trim: true,
      default: '350 sq ft',
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Please provide price per night'],
      min: [0, 'Price must be positive'],
    },
    capacity: {
      type: Number,
      required: [true, 'Please provide maximum guest capacity'],
      min: [1, 'Capacity must be at least 1 guest'],
      default: 2,
    },
    amenities: {
      type: [String],
      default: ['Free Wi-Fi', 'Air Conditioning', 'Flat-screen TV', 'Ensuite Bathroom', 'Room Service'],
    },
    image: {
      type: String,
      default: '',
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
        isCover: { type: Boolean, default: false },
      },
    ],
    // Enhanced 5-state room status as requested in Enhancement #8
    status: {
      type: String,
      enum: ['Available', 'Booked', 'Occupied', 'Cleaning', 'Maintenance'],
      default: 'Available',
    },
    // Kept for backward compatibility
    availabilityStatus: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      default: 'Spacious and elegantly decorated room equipped with modern amenities for a comfortable stay.',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to ensure primary image and images array are synchronized
roomSchema.pre('validate', function (next) {
  if (this.images && this.images.length > 0) {
    const cover = this.images.find((img) => img.isCover);
    this.image = cover ? cover.url : this.images[0].url;
  } else if (this.image) {
    this.images = [{ url: this.image, publicId: '', isCover: true }];
  } else {
    this.image = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80';
    this.images = [{ url: this.image, publicId: '', isCover: true }];
  }
  next();
});

// Pre-save hook to keep availabilityStatus synced with status
roomSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.availabilityStatus = this.status === 'Available';
  } else if (this.isModified('availabilityStatus')) {
    this.status = this.availabilityStatus ? 'Available' : 'Maintenance';
  }
  next();
});

module.exports = mongoose.model('Room', roomSchema);
