const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');

dotenv.config();

const performSeed = async (wipe = true) => {
  if (wipe) {
    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Hotel.deleteMany();
    await Room.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();
    await Review.deleteMany();
    await Coupon.deleteMany();
    await Notification.deleteMany();
  }

  console.log('Creating default users...');

  // 1. Create Users
  const admin = await User.create({
    name: 'TAKKUNU BOOKU Administrator',
    email: 'admin@hotelbooking.com',
    phone: '+1-800-555-0199',
    password: 'adminpassword123',
    role: 'Admin',
  });

  await User.create({
    name: 'TAKKUNU BOOKU Superadmin',
    email: 'admin@takkunubooku.com',
    phone: '+1-800-555-0100',
    password: 'adminpassword123',
    role: 'Admin',
  });

  const user1 = await User.create({
    name: 'John Anderson',
    email: 'john@example.com',
    phone: '+1-312-555-0144',
    password: 'johnpassword123',
    role: 'User',
  });

  const user2 = await User.create({
    name: 'Sarah Jenkins',
    email: 'sarah@example.com',
    phone: '+1-415-555-0182',
    password: 'sarahpassword123',
    role: 'User',
  });

  console.log(`✓ Default users created (Admin + 2 Sample Users)`);

  // 2. Create Sample Hotels with Coordinates (Enhancement #3)
  const hotel1 = await Hotel.create({
    hotelName: 'The Azure Grand Resort & Spa',
    location: 'Miami, Florida',
    address: '1420 Ocean Drive, South Beach, Miami, FL 33139',
    description: 'An iconic beachfront luxury sanctuary featuring panoramic Atlantic ocean views, 3 infinity pools, a world-class holistic wellness spa, and gourmet fine dining.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', isCover: true, publicId: 'seed_azure_ext' },
      { url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80', isCover: false, publicId: 'seed_azure_lobby' },
      { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80', isCover: false, publicId: 'seed_azure_pool' },
      { url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80', isCover: false, publicId: 'seed_azure_dine' },
      { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', isCover: false, publicId: 'seed_azure_view' },
    ],
    rating: 4.9,
    totalReviews: 2,
    contactPhone: '+1-305-555-0180',
    amenities: ['Oceanfront Pool', 'Full Spa & Wellness', 'Free Ultra-Fast Wi-Fi', 'Valet Parking', '24/7 Room Service', 'Beach Access'],
    coordinates: { lat: 25.7867, lng: -80.1300 }, // South Beach, Miami
  });

  const hotel2 = await Hotel.create({
    hotelName: 'The Manhattan Pinnacle Luxury Hotel',
    location: 'New York, NY',
    address: '768 5th Ave, Central Park South, New York, NY 10019',
    description: 'Perched in the prestigious heart of Manhattan, steps away from Central Park, Broadway theaters, and Fifth Avenue luxury shopping boutiques.',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    rating: 4.8,
    totalReviews: 1,
    contactPhone: '+1-212-555-0195',
    amenities: ['Central Park View', 'Rooftop Lounge & Bar', 'Fitness Center', 'Fine Dining Restaurant', 'Concierge Service'],
    coordinates: { lat: 40.7645, lng: -73.9744 }, // Central Park South
  });

  const hotel3 = await Hotel.create({
    hotelName: 'Alpine Solitude Mountain Chalet',
    location: 'Aspen, Colorado',
    address: '315 East Dean Street, Aspen, CO 81611',
    description: 'A cozy timber luxury lodge offering ski-in/ski-out privileges, stone fireplaces in every suite, outdoor heated mineral whirlpools, and breathtaking Rocky Mountain vistas.',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    rating: 4.7,
    totalReviews: 0,
    contactPhone: '+1-970-555-0142',
    amenities: ['Ski Storage & Valet', 'Fireplace in Rooms', 'Heated Outdoor Pool', 'Mountain Views', 'Craft Cocktail Bar'],
    coordinates: { lat: 39.1866, lng: -106.8188 }, // Aspen
  });

  const hotel4 = await Hotel.create({
    hotelName: 'Sunset Cove Tropical Bay Villas',
    location: 'Honolulu, Hawaii',
    address: '2255 Kalakaua Ave, Waikiki Beach, Honolulu, HI 96815',
    description: 'Embrace Polynesian hospitality amidst lush palm groves, private ocean lagoons, authentic beachfront luaus, and surfing right off your doorstep.',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    rating: 4.9,
    totalReviews: 0,
    contactPhone: '+1-808-555-0112',
    amenities: ['Private Beach Lagoon', 'Surf Lessons', 'Tropical Tiki Bar', 'Complimentary Breakfast', 'Snorkeling Gear'],
    coordinates: { lat: 21.2787, lng: -157.8282 }, // Waikiki Beach
  });

  const hotel5 = await Hotel.create({
    hotelName: 'The Royal Oasis Desert Palace',
    location: 'Scottsdale, Arizona',
    address: '7500 E Doubletree Ranch Rd, Scottsdale, AZ 85258',
    description: 'An oasis in the Sonoran desert combining traditional Southwestern architecture with championship golf courses, cascading fountains, and starlit evening fire pits.',
    image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    rating: 4.6,
    totalReviews: 0,
    contactPhone: '+1-480-555-0167',
    amenities: ['Championship Golf Course', 'Desert Botanical Gardens', 'Tennis Courts', '3 Swimming Pools', 'Spa'],
    coordinates: { lat: 33.5387, lng: -111.9261 }, // Scottsdale
  });

  const hotel6 = await Hotel.create({
    hotelName: 'Serene Pines Lake Tahoe Retreat',
    location: 'Lake Tahoe, California',
    address: '4001 Lake Tahoe Blvd, South Lake Tahoe, CA 96150',
    description: 'Nestled between crystal alpine waters and towering cedar trees, featuring private docks, kayak rentals, lakefront barbecues, and sunset cruises.',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1200&q=80',
    rating: 4.7,
    totalReviews: 0,
    contactPhone: '+1-530-555-0133',
    amenities: ['Private Lake Dock', 'Kayaks & Paddleboards', 'Lakeside Fire Pits', 'Pet Friendly', 'Free Parking'],
    coordinates: { lat: 38.9566, lng: -119.9572 }, // South Lake Tahoe
  });

  // Hotel 7 (Coimbatore - specifically for Tanglish AI query testing!)
  const hotel7 = await Hotel.create({
    hotelName: 'The Heritage Palace Coimbatore',
    location: 'Coimbatore, Tamil Nadu',
    address: '1076 Avinashi Road, Race Course, Coimbatore, TN 641018',
    description: 'A distinguished blend of classic South Indian heritage and contemporary boutique luxury, offering lush garden courtyards, signature Chettinad dining, and serene suites.',
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
    images: [
      { url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80', isCover: true, publicId: 'seed_coimb_ext' },
      { url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80', isCover: false, publicId: 'seed_coimb_lobby' },
      { url: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=1200&q=80', isCover: false, publicId: 'seed_coimb_dine' },
      { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', isCover: false, publicId: 'seed_coimb_room' },
    ],
    rating: 4.8,
    totalReviews: 0,
    contactPhone: '+91-422-555-0188',
    amenities: ['Free High-Speed Wi-Fi', 'Ayurvedic Wellness Spa', 'Pure Veg & Chettinad Dining', 'Valet Parking', 'Airport Shuttle'],
    coordinates: { lat: 11.0168, lng: 76.9558 }, // Coimbatore, Tamil Nadu
  });

  console.log('✓ 7 Hotels created (including Coimbatore for Tanglish AI test).');

  // 3. Create Rooms with 5-State Status (Enhancement #8)
  const roomsData = [
    // Hotel 1 (Azure Miami)
    {
      hotelId: hotel1._id,
      roomNumber: '101',
      roomType: 'Deluxe',
      pricePerNight: 280,
      capacity: 2,
      amenities: ['King Bed', 'Ocean View Balcony', 'High-Speed Wi-Fi', 'Marble Bathroom', 'Mini Bar', 'Smart TV'],
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
      images: [
        { url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80', isCover: true, publicId: 'seed_r101_bed' },
        { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', isCover: false, publicId: 'seed_r101_bath' },
        { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', isCover: false, publicId: 'seed_r101_balc' },
        { url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80', isCover: false, publicId: 'seed_r101_tv' },
      ],
      status: 'Available',
      availabilityStatus: true,
      description: 'Immaculate Deluxe room with uninterrupted turquoise ocean views and a private walk-out balcony.',
    },
    {
      hotelId: hotel1._id,
      roomNumber: '205',
      roomType: 'Suite',
      pricePerNight: 450,
      capacity: 4,
      amenities: ['2 Queen Beds', 'Living Room Area', 'Private Jacuzzi', 'Ocean View', 'Complimentary Champagne'],
      image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
      status: 'Available',
      availabilityStatus: true,
      description: 'Luxury oceanfront suite offering a separate sitting lounge and an open-air whirlpool on the veranda.',
    },
    {
      hotelId: hotel1._id,
      roomNumber: '310',
      roomType: 'Executive Suite',
      pricePerNight: 650,
      capacity: 4,
      amenities: ['Presidential King Bed', 'Wraparound Terrace', 'Personal Butler Service', 'Sub-Zero Bar', 'Espresso Machine'],
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      status: 'Cleaning',
      availabilityStatus: false,
      description: 'Top-tier executive penthouse suite with 180-degree panoramic ocean views and dedicated concierge services.',
    },

    // Hotel 2 (Manhattan Pinnacle)
    {
      hotelId: hotel2._id,
      roomNumber: '1202',
      roomType: 'Single',
      pricePerNight: 220,
      capacity: 1,
      amenities: ['Queen Bed', 'City Skyline View', 'Work Desk', 'Ergonomic Chair', 'Rain Shower'],
      image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
      status: 'Available',
      availabilityStatus: true,
      description: 'Chic modern sanctuary tailored for the discerning solo business or leisure traveler.',
    },
    {
      hotelId: hotel2._id,
      roomNumber: '1504',
      roomType: 'Double',
      pricePerNight: 340,
      capacity: 2,
      amenities: ['2 Double Beds', 'Central Park Peeks', 'Soundproof Windows', 'Nespresso Station', 'Smart Thermostat'],
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      status: 'Available',
      availabilityStatus: true,
      description: 'Contemporary double room in the heart of Manhattan featuring plush beds and peaceful soundproof design.',
    },
    {
      hotelId: hotel2._id,
      roomNumber: '2101',
      roomType: 'Suite',
      pricePerNight: 580,
      capacity: 3,
      amenities: ['King Bed + Sofa Bed', 'Direct Central Park View', 'Soaking Tub', 'Designer Bathrobes', 'Bose Sound System'],
      image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
      status: 'Maintenance',
      availabilityStatus: false,
      description: 'Breathtaking park-facing luxury suite with floor-to-ceiling glass windows and custom Italian furnishings.',
    },

    // Hotel 3 (Alpine Solitude)
    {
      hotelId: hotel3._id,
      roomNumber: '104',
      roomType: 'Deluxe',
      pricePerNight: 310,
      capacity: 2,
      amenities: ['Stone Gas Fireplace', 'King Bed', 'Heated Bathroom Floors', 'Mountain View', 'Wool Blankets'],
      image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
      status: 'Available',
      availabilityStatus: true,
      description: 'Rustic luxury lodge room with natural timber accents, blazing fireplace, and stunning snowcapped mountain views.',
    },

    // Hotel 7 (Coimbatore - Budget Friendly match for ₹2500 / $30-$100)
    {
      hotelId: hotel7._id,
      roomNumber: 'C101',
      roomType: 'Deluxe',
      pricePerNight: 2400, // INR 2400 (under ₹2500 budget!)
      capacity: 2,
      amenities: ['Queen Bed', 'Courtyard View', 'Air Conditioning', 'Free Wi-Fi', 'Complimentary South Indian Breakfast'],
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      status: 'Available',
      availabilityStatus: true,
      description: 'Traditional heritage room in Coimbatore for 2 people with complimentary traditional breakfast.',
    },
    {
      hotelId: hotel7._id,
      roomNumber: 'C102',
      roomType: 'Suite',
      pricePerNight: 3800,
      capacity: 3,
      amenities: ['King Bed', 'Living Area', 'Air Conditioning', 'Free Wi-Fi', 'Tea/Coffee Maker'],
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      status: 'Available',
      availabilityStatus: true,
      description: 'Spacious executive suite in the heart of Coimbatore near Avinashi Road.',
    },
  ];

  const createdRooms = await Room.insertMany(roomsData);
  console.log(`✓ ${createdRooms.length} Rooms created across hotels.`);

  // 4. Create Coupons (Enhancement #5)
  await Coupon.create([
    {
      code: 'WELCOME10',
      description: '10% discount on any luxury stay reservation',
      discountType: 'percentage',
      discountValue: 10,
      minBookingAmount: 100,
      isActive: true,
    },
    {
      code: 'SAVE500',
      description: 'Flat ₹/$500 discount on reservations above 1500',
      discountType: 'fixed',
      discountValue: 500,
      minBookingAmount: 1500,
      isActive: true,
    },
    {
      code: 'STAY20',
      description: '20% special festival discount',
      discountType: 'percentage',
      discountValue: 20,
      minBookingAmount: 300,
      isActive: true,
    },
  ]);
  console.log('✓ 3 Active Coupons created (WELCOME10, SAVE500, STAY20).');

  // 5. Create Initial Bookings & QR Codes (Enhancement #2)
  const checkInDate1 = new Date();
  checkInDate1.setDate(checkInDate1.getDate() + 5);
  const checkOutDate1 = new Date();
  checkOutDate1.setDate(checkOutDate1.getDate() + 8);

  const nights1 = 3;
  const room1 = createdRooms[0];
  const subtotal1 = nights1 * room1.pricePerNight;

  const booking1 = await Booking.create({
    bookingId: 'BK-552198',
    userId: user1._id,
    hotelId: hotel1._id,
    roomId: room1._id,
    checkIn: checkInDate1,
    checkOut: checkOutDate1,
    numberOfGuests: 2,
    totalNights: nights1,
    subtotalAmount: subtotal1,
    discountAmount: 0,
    totalAmount: subtotal1,
    bookingStatus: 'Confirmed',
    paymentStatus: 'Paid',
    qrCodeData: JSON.stringify({
      bookingId: 'BK-552198',
      guestName: user1.name,
      hotel: hotel1.hotelName,
      roomNumber: room1.roomNumber,
      checkIn: checkInDate1.toISOString().split('T')[0],
      checkOut: checkOutDate1.toISOString().split('T')[0],
    }),
    guestDetails: {
      guestName: user1.name,
      guestEmail: user1.email,
      guestPhone: user1.phone,
      specialRequests: 'High floor preferred, arriving late afternoon.',
    },
  });

  await Payment.create({
    bookingId: booking1._id,
    userId: user1._id,
    amount: subtotal1,
    paymentMethod: 'Credit/Debit Card',
    transactionId: 'TXN-9842104-5821',
    paymentStatus: 'Completed',
    paidAt: new Date(),
  });

  // Booking 2 (Sarah - Checked In)
  const checkInDate2 = new Date();
  checkInDate2.setDate(checkInDate2.getDate() - 1); // Yesterday
  const checkOutDate2 = new Date();
  checkOutDate2.setDate(checkOutDate2.getDate() + 2); // 3 nights

  const nights2 = 3;
  const room2 = createdRooms[3];
  const subtotal2 = nights2 * room2.pricePerNight;

  const booking2 = await Booking.create({
    bookingId: 'BK-789012',
    userId: user2._id,
    hotelId: hotel2._id,
    roomId: room2._id,
    checkIn: checkInDate2,
    checkOut: checkOutDate2,
    numberOfGuests: 1,
    totalNights: nights2,
    subtotalAmount: subtotal2,
    discountAmount: 0,
    totalAmount: subtotal2,
    bookingStatus: 'Checked In', // QR check-in demonstrated
    checkedInAt: new Date(),
    paymentStatus: 'Paid',
    qrCodeData: JSON.stringify({
      bookingId: 'BK-789012',
      guestName: user2.name,
      hotel: hotel2.hotelName,
      roomNumber: room2.roomNumber,
      checkIn: checkInDate2.toISOString().split('T')[0],
      checkOut: checkOutDate2.toISOString().split('T')[0],
    }),
    guestDetails: {
      guestName: user2.name,
      guestEmail: user2.email,
      guestPhone: user2.phone,
      specialRequests: 'Quiet room away from elevator please.',
    },
  });

  await Payment.create({
    bookingId: booking2._id,
    userId: user2._id,
    amount: subtotal2,
    paymentMethod: 'UPI',
    transactionId: 'TXN-7612398-3341',
    paymentStatus: 'Completed',
    paidAt: new Date(),
  });

  // Update room2 to Occupied
  await Room.findByIdAndUpdate(room2._id, { status: 'Occupied', availabilityStatus: false });

  // 6. Create Verified Reviews (Enhancement #4)
  await Review.create([
    {
      hotelId: hotel1._id,
      userId: user1._id,
      bookingId: booking1._id,
      rating: 5,
      comment: 'Exceptional hospitality! The ocean view from room 101 was breathtaking and room service was swift.',
    },
    {
      hotelId: hotel2._id,
      userId: user2._id,
      bookingId: booking2._id,
      rating: 5,
      comment: 'Right in the heart of Manhattan. Loved the central park view and quiet soundproofing.',
    },
  ]);
  console.log('✓ Verified Reviews created.');

  // 7. Create In-App Notifications (Enhancement #6)
  await Notification.create([
    {
      userId: user1._id,
      title: 'Booking Confirmed! 🎉',
      message: 'Your stay at The Azure Grand Resort & Spa (BK-552198) is confirmed.',
      type: 'booking',
      link: '/booking-confirmation/BK-552198',
      read: false,
    },
    {
      userId: user1._id,
      title: 'Upcoming Check-in Reminder 🛎️',
      message: 'Your check-in is scheduled in 5 days. Digital QR pass is ready.',
      type: 'reminder',
      link: '/booking-confirmation/BK-552198',
      read: false,
    },
    {
      userId: user2._id,
      title: 'Checked In Successfully 🔑',
      message: 'Welcome to The Manhattan Pinnacle! Checked into Room #1202.',
      type: 'reminder',
      link: '/booking-confirmation/BK-789012',
      read: true,
    },
  ]);
  console.log('✓ Initial In-App Notifications seeded.');
};

// Auto seed helper if database is currently empty
const autoSeedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('➜ Database is empty. Auto-seeding initial data with enhancements...');
      await performSeed(false);
      console.log('✓ Auto-seed completed successfully.');
    }
  } catch (err) {
    console.error('Auto-seed check failed:', err.message);
  }
};

if (require.main === module) {
  const { connectDB } = require('./db');
  (async () => {
    try {
      await connectDB();
      await performSeed(true);
      console.log('\n================ ENHANCED SEED SUMMARY ================');
      console.log('Admin:       admin@hotelbooking.com / adminpassword123');
      console.log('Customer 1:  john@example.com / johnpassword123');
      console.log('Customer 2:  sarah@example.com / sarahpassword123');
      console.log('Coupons:     WELCOME10 (10% off), SAVE500 (500 off), STAY20 (20% off)');
      console.log('Coimbatore:  The Heritage Palace Coimbatore (Rooms under ₹2500)');
      console.log('========================================================\n');
      process.exit(0);
    } catch (err) {
      console.error('Seed Error:', err);
      process.exit(1);
    }
  })();
}

module.exports = { performSeed, autoSeedIfEmpty };
