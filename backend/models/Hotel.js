const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    hotelName: {
      type: String,
      required: [true, 'Please provide hotel name'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please provide hotel city or location'],
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Please provide complete street address'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide hotel description'],
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
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    amenities: {
      type: [String],
      default: ['Free Wi-Fi', 'Swimming Pool', 'Air Conditioning', 'Free Parking', 'Restaurant'],
    },
    // Map Coordinates for Leaflet / OpenStreetMap (Enhancement #3)
    coordinates: {
      lat: { type: Number, default: 25.7617 },
      lng: { type: Number, default: -80.1918 },
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to ensure primary image and images array are synchronized
hotelSchema.pre('validate', function (next) {
  if (this.images && this.images.length > 0) {
    const cover = this.images.find((img) => img.isCover);
    this.image = cover ? cover.url : this.images[0].url;
  } else if (this.image) {
    this.images = [{ url: this.image, publicId: '', isCover: true }];
  } else {
    this.image = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';
    this.images = [{ url: this.image, publicId: '', isCover: true }];
  }
  next();
});

module.exports = mongoose.model('Hotel', hotelSchema);
